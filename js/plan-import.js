(() => {
  'use strict';

  // ATMS PRO DAY-002 FLEX 10.08.2026 16:50 Uhr (Europe/Berlin): Folgetag-Block + flexible/optionale Spaltenerkennung.
  // PRICE-001 10.08.2026 23:18 Uhr: Fehlender/unsicherer OCR-Preis darf nicht mehr still als 0,00 € durchlaufen; manuelle Bestätigung erforderlich.
  // CORE-001A 11.08.2026 14:41 Uhr: Neue Planlisten übernehmen keine alten Flugprüfungen mehr aus localStorage; Ergebnisse werden direkt auf die aktuell analysierte Liste angewendet.

  const PROFILE_KEY = 'atms_import_profile_v1';
  const state = { file: null, matrix: [], rides: [], issues: [], meta: {}, mapping: null, planDate: '', priceDecisions: {}, dateBoundaryDecision: '', dateInfo: {} };
  const $ = id => document.getElementById(id);
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const cleanKey = value => String(value || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '');
  const cellText = value => value === null || value === undefined ? '' : String(value).trim();

  function berlinToday() {
    try {
      return new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Europe/Berlin',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date());
    } catch (_) {
      const d = new Date(), p = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    }
  }

  function formatPlanDate(value) {
    const m = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? `${m[3]}.${m[2]}.${m[1]}` : String(value || '');
  }


  function addDaysIso(value, days = 1) {
    const m = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return value;
    const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
    d.setUTCDate(d.getUTCDate() + Number(days || 0));
    return d.toISOString().slice(0, 10);
  }

  function timeToMinutes(value) {
    const normalized = normalizeTime(value);
    const m = String(normalized || '').match(/^(\d{2}):(\d{2})$/);
    if (!m) return null;
    const h = Number(m[1]), min = Number(m[2]);
    if (h < 0 || h > 23 || min < 0 || min > 59) return null;
    return h * 60 + min;
  }

  // DAY-002 – Plantag und tatsächliches Fahrtdatum
  // --------------------------------------------------
  // Die normale/geplante Fahrtzeit wird dynamisch anhand der Kopfzeile und Nachbarspalten erkannt.
  // Eine zweite Wiederholung derselben Fahrtzeit ist OPTIONAL und darf vollständig fehlen.
  // Die aktuelle/prognostizierte Flugzeit (Verspätung/früher) wird separat erkannt und
  // darf das geplante Fahrtdatum NICHT verändern.
  //
  // Die Reihenfolge der Planlistenzeilen ist ausdrücklich NICHT chronologisch
  // und wird deshalb niemals für einen Datumswechsel ausgewertet.
  // Fahrten von 00:00 bis 05:59 werden als gemeinsamer Folgetag-Kandidat
  // erkannt und müssen einmal für die ganze Liste bestätigt werden.
  const NEXT_DAY_CUTOFF_MINUTES = 6 * 60;

  function assignRideDates(rides, options = {}) {
    const baseDate = currentPlanDate();
    const nextDate = addDaysIso(baseDate, 1);
    const preserveExplicit = Boolean(options.preserveExplicit);
    const candidateIndexes = [];

    const out = (Array.isArray(rides) ? rides : []).map((ride, index) => {
      const explicitDate = cellText(ride?.date);
      if (preserveExplicit && /^\d{4}-\d{2}-\d{2}$/.test(explicitDate)) {
        return {
          ...ride,
          planDate: cellText(ride?.planDate) || baseDate,
          date: explicitDate,
          dateNeedsManualCheck: false,
          dateCandidateNextDay: false,
          dateSource: cellText(ride?.dateSource) || 'explicit'
        };
      }

      const mins = timeToMinutes(ride?.time || ride?.planTime);
      const isNextDayCandidate = mins !== null && mins < NEXT_DAY_CUTOFF_MINUTES;
      if (isNextDayCandidate) candidateIndexes.push(index);

      return {
        ...ride,
        planDate: baseDate,
        date: baseDate,
        dateNeedsManualCheck: false,
        dateCandidateNextDay: isNextDayCandidate,
        dateSource: isNextDayCandidate ? 'next_day_candidate' : 'plan_date'
      };
    });

    const decision = state.dateBoundaryDecision || '';
    if (candidateIndexes.length && decision === 'next_day') {
      candidateIndexes.forEach(index => {
        out[index] = {
          ...out[index],
          date: nextDate,
          dateNeedsManualCheck: false,
          dateSource: 'next_day_confirmed'
        };
      });
    } else if (candidateIndexes.length && decision === 'same_day') {
      candidateIndexes.forEach(index => {
        out[index] = {
          ...out[index],
          date: baseDate,
          dateNeedsManualCheck: false,
          dateSource: 'same_day_confirmed'
        };
      });
    } else if (candidateIndexes.length) {
      candidateIndexes.forEach(index => {
        out[index] = {
          ...out[index],
          date: baseDate,
          dateNeedsManualCheck: true,
          dateSource: 'next_day_candidate'
        };
      });
    }

    const counts = {};
    out.forEach(ride => {
      const date = cellText(ride?.date);
      if (date) counts[date] = (counts[date] || 0) + 1;
    });

    state.dateInfo = {
      baseDate,
      nextDate,
      counts,
      candidateCount: candidateIndexes.length,
      decision,
      requiresConfirmation: Boolean(candidateIndexes.length && !decision),
      cutoff: '06:00'
    };
    return out;
  }

  function resolveDateBoundary(action) {
    if (action !== 'next_day' && action !== 'same_day') return;
    state.dateBoundaryDecision = action;
    state.rides = assignRideDates(state.rides);
    state.issues = validate(state.rides);
    render();
    if (typeof window.showToast === 'function') {
      const count = state.dateInfo?.candidateCount || 0;
      const date = action === 'next_day' ? state.dateInfo?.nextDate : state.dateInfo?.baseDate;
      window.showToast(`${count} Fahrt(en) auf ${formatPlanDate(date)} bestätigt`, 'ok');
    }
  }

  function updatePlanDateSummary() {
    const control = $('planDateControl');
    if (!control) return;
    let summary = $('planDateSummary');
    if (!summary) {
      summary = document.createElement('div');
      summary.id = 'planDateSummary';
      summary.style.cssText = 'font-size:12px;margin-top:8px;line-height:1.45;font-weight:700';
      control.appendChild(summary);
    }

    if (!state.rides.length) {
      summary.textContent = 'Plantag = erster Kalendertag der Liste. Fahrten 00:00–05:59 werden als möglicher Folgetag gemeinsam geprüft.';
      return;
    }

    const counts = {};
    state.rides.forEach(ride => {
      const date = cellText(ride?.date);
      if (date) counts[date] = (counts[date] || 0) + 1;
    });
    const parts = Object.entries(counts).map(([date, count]) => `${formatPlanDate(date)}: ${count}`);
    const candidateCount = state.dateInfo?.candidateCount || 0;
    let suffix = '';
    if (candidateCount && !state.dateBoundaryDecision) {
      suffix = ` · ⚠ ${candidateCount} Fahrt(en) 00:00–05:59: Folgetag einmal bestätigen`;
    } else if (candidateCount && state.dateBoundaryDecision === 'next_day') {
      suffix = ` · ✓ ${candidateCount} Fahrt(en) dem ${formatPlanDate(state.dateInfo?.nextDate)} zugeordnet`;
    } else if (candidateCount && state.dateBoundaryDecision === 'same_day') {
      suffix = ` · ✓ ${candidateCount} Fahrt(en) bewusst beim ${formatPlanDate(state.dateInfo?.baseDate)} belassen`;
    }
    summary.textContent = `Fahrtdaten: ${parts.join(' · ')}${suffix}`;
  }

  function currentPlanDate() {
    const input = $('planDateInput');
    const value = cellText(input?.value || state.planDate || berlinToday());
    state.planDate = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : berlinToday();
    if (input && input.value !== state.planDate) input.value = state.planDate;
    return state.planDate;
  }

  function ensurePlanDateControl() {
    if ($('planDateControl')) return;
    const drop = $('planImportDrop');
    const analyzeBtn = $('analyzePlanBtn');
    const anchorEl = drop || analyzeBtn;
    if (!anchorEl) return;

    state.planDate = state.planDate || berlinToday();

    const wrap = document.createElement('div');
    wrap.id = 'planDateControl';
    wrap.style.cssText = 'margin:14px 0;padding:14px 16px;border:1px solid rgba(72,156,255,.35);border-radius:14px;background:rgba(7,33,63,.55)';
    wrap.innerHTML = `
      <label for="planDateInput" style="display:block;font-weight:800;margin-bottom:6px">📅 Plantag</label>
      <div style="font-size:12px;opacity:.75;margin-bottom:10px">Plantag = erster Kalendertag der Liste. Fahrten zwischen 00:00 und 05:59 werden als möglicher Folgetag gemeinsam erkannt und einmal bestätigt.</div>
      <input id="planDateInput" type="date" value="${state.planDate}" style="width:100%;box-sizing:border-box;padding:12px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.18);background:#071a2b;color:#fff;font-size:16px">
      <div id="planDateStatus" style="font-size:12px;opacity:.8;margin-top:8px">Aktiver Plantag: ${formatPlanDate(state.planDate)}</div>
    `;

    if (drop) drop.insertAdjacentElement('afterend', wrap);
    else analyzeBtn.parentElement?.insertBefore(wrap, analyzeBtn);

    $('planDateInput')?.addEventListener('change', event => {
      state.planDate = event.target.value || berlinToday();
      event.target.value = state.planDate;
      const status = $('planDateStatus');
      if (status) status.textContent = `Aktiver Plantag: ${formatPlanDate(state.planDate)}`;
      if (state.rides.length) {
        state.dateBoundaryDecision = '';
        state.rides = assignRideDates(state.rides);
        state.issues = validate(state.rides);
        render();
      }
    });
  }

  function normalizeTime(value) {
    if (value === null || value === undefined || value === '') return '';
    if (typeof value === 'number') {
      if (value >= 0 && value < 1) {
        const minutes = Math.round(value * 1440) % 1440;
        return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
      }
      if (window.XLSX) {
        try {
          const parsed = XLSX.SSF.parse_date_code(value);
          if (parsed) return `${String(parsed.H).padStart(2, '0')}:${String(parsed.M).padStart(2, '0')}`;
        } catch (_) {}
      }
    }
    const text = cellText(value);
    const match = text.match(/(?:^|\s)(\d{1,2})[:.](\d{2})(?!\d)/);
    if (match) return `${match[1].padStart(2, '0')}:${match[2]}`;
    const compact = text.match(/^\d{3,4}$/);
    if (compact) {
      const padded = text.padStart(4, '0');
      return `${padded.slice(0, 2)}:${padded.slice(2)}`;
    }
    return text;
  }

  function parseNumber(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const normalized = cellText(value).replace(/[^0-9,.-]/g, '').replace(/\.(?=\d{3}(?:\D|$))/g, '').replace(',', '.');
    const number = Number(normalized);
    return Number.isFinite(number) ? number : 0;
  }

  function pricePlausibility(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return { suspicious: true, missing: true, suggestion: null };
    }
    const price = numeric;
    if (price >= 1000) {
      const decimalSuggestion = price / 100;
      const suggestion = decimalSuggestion >= 10 && decimalSuggestion < 1000 ? decimalSuggestion : null;
      return { suspicious: true, missing: false, suggestion };
    }
    return { suspicious: false, missing: false, suggestion: null };
  }

  function normalizeFlightLocation(value) {
    const text = cellText(value).trim();
    if (!text) return '';
    if (/^zirich$/i.test(text) || /^zurich$/i.test(text)) return 'Zürich';
    if (/^milan$/i.test(text)) return 'Mailand';
    return text;
  }

  function normalizeFlightNumber(value) {
    const raw = cellText(value).trim();
    if (!raw || /^[-–—]+$/.test(raw)) return '';
    let normalized = raw.toUpperCase().replace(/\s+/g, '');
    // Häufiger OCR-Fehler bei Austrian Airlines: 0S162 -> OS162
    if (/^0S\d{1,4}[A-Z]?$/.test(normalized)) normalized = 'OS' + normalized.slice(2);
    // Fahrzeug-/Wagenwerte dürfen niemals als Flugnummer übernommen werden
    if (/^(VAN|PKW|BUS|SPRINTER|TAXI|WG)$/.test(normalized)) return '';
    return normalized;
  }

  function looksLikeFlight(value) {
    return /^[A-Z0-9]{2,4}\s?\d{1,4}[A-Z]?$/.test(normalizeFlightNumber(value));
  }

  function looksLikeTime(value) {
    return /^\d{1,2}[:.]\d{2}$/.test(cellText(value)) || (typeof value === 'number' && value >= 0 && value < 1);
  }

  function classifyRide(pickup, destination, arrivalFlight, departureFlight) {
    const p = cleanKey(pickup), d = cleanKey(destination);
    const airport = value => /airport|flughafen|vorfeld|terminal|dus|cgn/.test(value);
    if (arrivalFlight || (airport(p) && !airport(d))) return 'arrival';
    if (departureFlight || (!airport(p) && airport(d))) return 'departure';
    if (/hotel|marriott|holidayinn|nhnord|adagio|plaza|asahi/.test(p + d)) return 'hotel';
    return 'transfer';
  }

  const aliases = {
    price: ['preis', 'price', 'betrag', 'kosten', 'eur'],
    time: ['uhrzeit', 'zeit', 'abholzeit', 'pickupzeit', 'pickuptime', 'planzeit', 'startzeit'],
    pickup: ['von', 'from', 'abholort', 'abholung', 'pickup', 'start'],
    destination: ['nach', 'to', 'ziel', 'zielort', 'destination', 'dropoff'],
    customer: ['name', 'kunde', 'customer', 'auftraggeber'],
    company: ['firma', 'company', 'partner'],
    arrivalFlight: ['flugang', 'flugankunft', 'ankunftsflug', 'arrivalflight'],
    departureFlight: ['flugausg', 'flugabflug', 'abflugsflug', 'departureflight'],
    vehicle: ['wg', 'wagen', 'fahrzeug', 'vehicle', 'klasse'],
    persons: ['pers', 'personen', 'pax', 'gaeste', 'gaste'],
    flightTime: ['fluguhrzeit', 'flugzeit', 'scheduledflighttime'],
    flightLocation: ['ort', 'flugort', 'flugstadt', 'flightlocation', 'herkunft'],
    driver: ['fahrer', 'driver', 'chauffeur'],
    notes: ['hinweis', 'hinweise', 'bemerkung', 'notiz', 'notes', 'info']
  };

  function uniqueHeaders(row) {
    const counts = new Map();
    return row.map((value, index) => {
      let label = cellText(value) || `Spalte ${index + 1}`;
      const key = cleanKey(label) || `spalte${index + 1}`;
      const count = (counts.get(key) || 0) + 1;
      counts.set(key, count);
      return { label, key, occurrence: count, index };
    });
  }

  function scoreHeaderRow(row) {
    const keys = row.map(cleanKey).filter(Boolean);
    const expected = ['preis','uhrzeit','von','nach','name','firma','flugang','flugausg','pers','ort','fahrer','wg'];
    return expected.reduce((score, item) => score + (keys.includes(item) ? 1 : 0), 0);
  }

  function detectHeader(matrix) {
    let best = { index: 0, score: -1 };
    matrix.slice(0, 20).forEach((row, index) => {
      const score = scoreHeaderRow(row);
      if (score > best.score) best = { index, score };
    });
    return best;
  }

  function canonicalHeaderField(header) {
    const key = header.key;
    if (key === 'wg') return '';
    if (key === 'uhrzeit' || key === 'zeit') return '';
    for (const [field, list] of Object.entries(aliases)) {
      if (field === 'time' || field === 'flightTime' || field === 'driver') continue;
      if (list.includes(key)) return field;
    }
    return '';
  }

  function nearestHeaderDistance(headers, header, keys) {
    const wanted = new Set(keys);
    let best = Infinity;
    headers.forEach(other => {
      if (other.index === header.index) return;
      if (wanted.has(other.key)) best = Math.min(best, Math.abs(other.index - header.index));
    });
    return best;
  }

  function nextRecognizedHeader(headers, header) {
    return headers
      .filter(other => other.index > header.index)
      .sort((a,b) => a.index - b.index)
      .find(other => other.key && !/^spalte\d+$/.test(other.key)) || null;
  }

  function previousRecognizedHeader(headers, header) {
    return headers
      .filter(other => other.index < header.index)
      .sort((a,b) => b.index - a.index)
      .find(other => other.key && !/^spalte\d+$/.test(other.key)) || null;
  }

  function detectTimeColumns(headers, mapping, ambiguities) {
    const timeHeaders = headers.filter(h => h.key === 'uhrzeit' || h.key === 'zeit' || aliases.time.includes(h.key));
    if (!timeHeaders.length) {
      ambiguities.push('Keine normale Fahrtzeit-Spalte erkannt');
      return;
    }

    // Aktuelle/prognostizierte Flugzeit: Uhrzeit direkt/nahe bei "Ort".
    let flightTimeHeader = null;
    const locationHeaders = headers.filter(h => aliases.flightLocation.includes(h.key));
    if (locationHeaders.length) {
      const candidates = timeHeaders
        .map(h => ({ h, d: nearestHeaderDistance(headers, h, locationHeaders.map(x => x.key)) }))
        .filter(x => x.d <= 2)
        .sort((a,b) => a.d - b.d || b.h.index - a.h.index);
      if (candidates.length) flightTimeHeader = candidates[0].h;
    }

    // Wiederholung der Fahrtzeit: Uhrzeit nahe bei Flug ang./Flug ausg.
    let mirrorHeader = null;
    const flightHeaderKeys = [
      ...aliases.arrivalFlight,
      ...aliases.departureFlight
    ];
    const mirrorCandidates = timeHeaders
      .filter(h => !flightTimeHeader || h.index !== flightTimeHeader.index)
      .map(h => ({ h, d: nearestHeaderDistance(headers, h, flightHeaderKeys) }))
      .filter(x => x.d <= 2)
      .sort((a,b) => a.d - b.d || a.h.index - b.h.index);
    if (mirrorCandidates.length) mirrorHeader = mirrorCandidates[0].h;

    // Normale Fahrtzeit: Uhrzeit nahe bei Von/Nach/Preis, aber nicht Flugzeit.
    const rideContextKeys = [
      ...aliases.price,
      ...aliases.pickup,
      ...aliases.destination
    ];
    const rideCandidates = timeHeaders
      .filter(h => (!flightTimeHeader || h.index !== flightTimeHeader.index) && (!mirrorHeader || h.index !== mirrorHeader.index))
      .map(h => ({ h, d: nearestHeaderDistance(headers, h, rideContextKeys) }))
      .sort((a,b) => a.d - b.d || a.h.index - b.h.index);

    let rideTimeHeader = rideCandidates[0]?.h || null;

    // Falls die Wiederholung die einzige Nicht-Flugzeit neben einer primären Uhrzeit ist,
    // muss die primäre Uhrzeit trotzdem erhalten bleiben. Die erste Uhrzeit in der Nähe
    // von Von/Nach/Preis gewinnt.
    if (!rideTimeHeader) {
      const remaining = timeHeaders.filter(h => !flightTimeHeader || h.index !== flightTimeHeader.index);
      if (remaining.length) {
        rideTimeHeader = remaining
          .map(h => ({ h, d: nearestHeaderDistance(headers, h, rideContextKeys) }))
          .sort((a,b) => a.d - b.d || a.h.index - b.h.index)[0].h;
        if (mirrorHeader && rideTimeHeader.index === mirrorHeader.index) mirrorHeader = null;
      }
    }

    if (rideTimeHeader) mapping.time = rideTimeHeader.index;
    else ambiguities.push('Normale Fahrtzeit konnte nicht sicher zugeordnet werden');

    if (flightTimeHeader && (!rideTimeHeader || flightTimeHeader.index !== rideTimeHeader.index)) {
      mapping.flightTime = flightTimeHeader.index;
    }

    if (mirrorHeader &&
        (!rideTimeHeader || mirrorHeader.index !== rideTimeHeader.index) &&
        (!flightTimeHeader || mirrorHeader.index !== flightTimeHeader.index)) {
      mapping.timeMirror = mirrorHeader.index;
    }

    // Zusätzliche Uhrzeit-Spalten, die nicht semantisch zugeordnet werden können, sind unsicher.
    const assigned = new Set([mapping.time, mapping.timeMirror, mapping.flightTime].filter(v => v !== undefined));
    const unassigned = timeHeaders.filter(h => !assigned.has(h.index));
    if (unassigned.length) {
      ambiguities.push(`Zusätzliche Uhrzeit-Spalte(n) nicht eindeutig: ${unassigned.map(h => h.label).join(', ')}`);
    }
  }

  function detectAtmsMapping(headers) {
    const mapping = {};
    const ambiguities = [];

    // Eindeutige Spalten zuerst dynamisch anhand ihrer Überschrift erkennen.
    headers.forEach(header => {
      const field = canonicalHeaderField(header);
      if (field && mapping[field] === undefined) mapping[field] = header.index;
    });

    // "Wg" kann mehrfach vorkommen. Erstes Wg = Fahrzeug, späteres Wg/letzte Textspalte
    // kann je nach Planlayout Fahrer sein. Eine explizite Fahrer-Überschrift hat Vorrang.
    const driverHeader = headers.find(h => aliases.driver.includes(h.key));
    if (driverHeader) mapping.driver = driverHeader.index;

    const wgHeaders = headers.filter(h => h.key === 'wg' || aliases.vehicle.includes(h.key));
    if (mapping.vehicle === undefined && wgHeaders.length) mapping.vehicle = wgHeaders[0].index;
    if (mapping.driver === undefined && wgHeaders.length >= 2) mapping.driver = wgHeaders[wgHeaders.length - 1].index;

    detectTimeColumns(headers, mapping, ambiguities);

    const confidenceFields = ['time','pickup','destination'];
    const core = confidenceFields.filter(field => mapping[field] !== undefined).length / confidenceFields.length;
    const confidence = Math.max(0, core - (ambiguities.length ? 0.15 : 0));

    return {
      mapping,
      confidence,
      ambiguities,
      profile: confidence >= 0.85 ? 'ATMS Flexible Planliste' : 'Automatische Spaltenerkennung'
    };
  }

  function genericMapping(headers) {
    const mapping = {};
    const ambiguities = [];

    headers.forEach(header => {
      const field = canonicalHeaderField(header);
      if (field && mapping[field] === undefined) mapping[field] = header.index;
    });
    detectTimeColumns(headers, mapping, ambiguities);

    const driverHeader = headers.find(h => aliases.driver.includes(h.key));
    if (driverHeader) mapping.driver = driverHeader.index;

    return {
      mapping,
      confidence: ['time','pickup','destination'].filter(field => mapping[field] !== undefined).length / 3 - (ambiguities.length ? 0.15 : 0),
      ambiguities,
      profile: 'Allgemeiner flexibler Tabellenimport'
    };
  }

  function valueAt(row, mapping, field) {
    const index = mapping[field];
    return index === undefined ? '' : row[index];
  }

  function looksLikeDriverName(value) {
    const text = cellText(value);
    if (!text) return false;
    if (/^(van|pkw|bus|sprinter|taxi)$/i.test(text)) return false;
    return /^[A-Za-zÄÖÜäöüß\- ]{2,}$/.test(text);
  }

  function getDriverValue(row, mapping) {
    const mapped = cellText(valueAt(row, mapping, 'driver'));
    if (mapped) return mapped;

    const last = row[row.length - 1];
    if (looksLikeDriverName(last)) return cellText(last);

    return '';
  }



  function findPriceValue(row, mapping) {
    const mapped = parseNumber(valueAt(row, mapping, 'price'));
    if (mapped > 0) return mapped;

    const first = parseNumber(row[0]);
    if (first > 0) return first;

    for (const cell of row) {
      const text = cellText(cell);
      if (/[0-9]+[,.][0-9]{2}/.test(text)) {
        const value = parseNumber(text);
        if (value > 0 && value < 1000) return value;
      }
    }

    return 0;
  }


  function getVehicleValue(row, mapping) {
    const mapped = cellText(valueAt(row, mapping, 'vehicle'));
    if (mapped && !/^\d+(?:[.,]\d+)?$/.test(mapped)) return mapped;

    // ATMS Standard Planliste: erste Wg-Spalte = Spalte 9 (Index 8)
    const fixedVehicle = cellText(row[8]);
    if (fixedVehicle && !/^\d+(?:[.,]\d+)?$/.test(fixedVehicle)) return fixedVehicle;
    return mapped || 'Pkw';
  }

  function getPersonsValue(row, mapping) {
    const mapped = parseNumber(valueAt(row, mapping, 'persons'));
    if (mapped > 0) return mapped;
    // ATMS Standard Planliste: Pers = Spalte 10 (Index 9)
    const fixedPersons = parseNumber(row[9]);
    return fixedPersons > 0 ? fixedPersons : 0;
  }

  function makeRide(row, rowNumber, mapping, fileName) {
    const arrivalFlight = normalizeFlightNumber(valueAt(row, mapping, 'arrivalFlight'));
    const departureFlight = normalizeFlightNumber(valueAt(row, mapping, 'departureFlight'));
    const flightNumber = arrivalFlight || departureFlight;
    const pickup = cellText(valueAt(row, mapping, 'pickup'));
    const destination = cellText(valueAt(row, mapping, 'destination'));
    const customer = cellText(valueAt(row, mapping, 'customer'));
    const company = cellText(valueAt(row, mapping, 'company')) || customer || 'WT';
    const rideType = classifyRide(pickup, destination, arrivalFlight, departureFlight);
    return {
      id: `import-${Date.now()}-${rowNumber}`,
      sourceRow: rowNumber,
      sourceFile: fileName,
      planDate: currentPlanDate(),
      date: currentPlanDate(),
      time: normalizeTime(valueAt(row, mapping, 'time')),
      planTime: normalizeTime(valueAt(row, mapping, 'time')),
      timeMirror: normalizeTime(valueAt(row, mapping, 'timeMirror')),
      flightTime: normalizeTime(valueAt(row, mapping, 'flightTime')),
      pickup,
      destination,
      customer,
      company,
      partner: customer || company,
      arrivalFlight,
      departureFlight,
      flightNumber,
      flightDirection: arrivalFlight ? 'arrival' : departureFlight ? 'departure' : '',
      flightLocation: normalizeFlightLocation(valueAt(row, mapping, 'flightLocation')),
      vehicle: getVehicleValue(row, mapping),
      persons: getPersonsValue(row, mapping),
      price: findPriceValue(row, mapping),
      currency: 'EUR',
      driver: getDriverValue(row, mapping),
      notes: cellText(valueAt(row, mapping, 'notes')),
      rideType,
      importStatus: 'recognized'
    };
  }

  function isDataRow(row, mapping) {
    const important = ['time','pickup','destination','driver','arrivalFlight','departureFlight'];
    const values = important.map(field => cellText(valueAt(row, mapping, field)));
    if (!values.some(Boolean)) return false;
    if (values.map(cleanKey).some(value => ['uhrzeit','von','nach','fahrer','flugang','flugausg'].includes(value))) return false;
    return Boolean(values[0] || (values[1] && values[2]));
  }

  function validate(rides) {
    const issues = [];
    const fingerprints = new Set();
    const missingFlightLocations = new Map();
    const manualFlightChecks = new Map();

    rides.forEach(ride => {
      const row = ride.sourceRow;
      if (!ride.time) issues.push({ level: 'error', row, text: 'Abholzeit fehlt' });
      if (!ride.pickup) issues.push({ level: 'error', row, text: 'Abholort fehlt' });
      if (!ride.destination) issues.push({ level: 'error', row, text: 'Ziel fehlt' });
      if (!ride.driver) issues.push({ level: 'warning', row, text: 'Fahrer fehlt – Fahrt bleibt offen' });
      if (ride.flightNumber && !looksLikeFlight(ride.flightNumber)) issues.push({ level: 'warning', row, text: `Flugnummer „${ride.flightNumber}“ bitte prüfen` });

      if (ride.flightNumber && !ride.flightLocation) {
        const flightNumber = normalizeFlightNumber(ride.flightNumber);
        const key = [
          flightNumber,
          cellText(ride.date),
          cellText(ride.flightDirection),
          normalizeTime(ride.flightTime)
        ].join('|');
        if (!missingFlightLocations.has(key)) {
          missingFlightLocations.set(key, { flightNumber, rows: [] });
        }
        missingFlightLocations.get(key).rows.push(row);
      }

      if (ride.flightNumber && ride.flightLocation && (ride.flightNeedsManualCheck || ride.flightCheckConfidence === 'uncertain')) {
        const flightNumber = normalizeFlightNumber(ride.flightNumber);
        const key = [
          flightNumber,
          cellText(ride.date),
          cellText(ride.flightDirection),
          normalizeTime(ride.flightTime)
        ].join('|');
        if (!manualFlightChecks.has(key)) {
          manualFlightChecks.set(key, {
            flightNumber,
            location: normalizeFlightLocation(ride.flightLocation),
            rows: []
          });
        }
        manualFlightChecks.get(key).rows.push(row);
      }

      if (ride.persons < 0) issues.push({ level: 'warning', row, text: 'Personenzahl ist ungültig' });

      const priceCheck = pricePlausibility(ride.price);
      const priceDecision = state.priceDecisions[String(ride.id || row)] || '';
      if (priceCheck.suspicious && !priceDecision) {
        if (priceCheck.missing) {
          issues.push({
            level: 'warning',
            kind: 'price_missing',
            row,
            rideId: String(ride.id || row),
            originalPrice: Number(ride.price) || 0,
            suggestedPrice: null,
            text: 'Preis fehlt oder wurde beim OCR nicht sicher erkannt – bitte mit der Original-Planliste prüfen. Keine automatische Preiskorrektur.'
          });
        } else {
          const shownPrice = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(ride.price);
          const suggestionText = priceCheck.suggestion !== null
            ? ` Möglicher OCR-/Dezimalfehler: eventuell ${new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(priceCheck.suggestion)}.`
            : '';
          issues.push({
            level: 'warning',
            kind: 'price',
            row,
            rideId: String(ride.id || row),
            originalPrice: Number(ride.price) || 0,
            suggestedPrice: priceCheck.suggestion,
            text: `Preis ${shownPrice} ist auffällig – bitte mit der Original-Planliste prüfen.${suggestionText} Keine automatische Preiskorrektur.`
          });
        }
      }

      const fingerprint = [ride.time, cleanKey(ride.pickup), cleanKey(ride.destination), cleanKey(ride.driver), ride.flightNumber].join('|');
      if (fingerprints.has(fingerprint)) issues.push({ level: 'warning', row, text: 'Mögliche doppelte Fahrt erkannt' });
      fingerprints.add(fingerprint);
    });

    const nextDayCandidates = rides.filter(ride => ride.dateNeedsManualCheck && ride.dateCandidateNextDay);
    if (nextDayCandidates.length) {
      const times = nextDayCandidates.map(ride => cellText(ride.time)).filter(Boolean).sort();
      const firstTime = times[0] || '00:00';
      const lastTime = times[times.length - 1] || '05:59';
      issues.push({
        level: 'error',
        kind: 'date_batch',
        row: 0,
        count: nextDayCandidates.length,
        firstTime,
        lastTime,
        baseDate: currentPlanDate(),
        nextDate: addDaysIso(currentPlanDate(), 1),
        text: `${nextDayCandidates.length} Fahrt(en) liegen zwischen ${firstTime} und ${lastTime}. Gehören diese Fahrten zum Folgetag ${formatPlanDate(addDaysIso(currentPlanDate(), 1))}?`
      });
    }

    manualFlightChecks.forEach(group => {
      const rows = [...new Set(group.rows)].sort((a, b) => Number(a) - Number(b));
      issues.push({
        level: 'warning',
        row: rows[0],
        rows,
        text: `Flugort für ${group.flightNumber} bleibt ${group.location || 'vorhanden'} – Gemini-Prüfung unsicher, manuell prüfen`
      });
    });

    missingFlightLocations.forEach(group => {
      const rows = [...new Set(group.rows)].sort((a, b) => Number(a) - Number(b));
      issues.push({
        level: 'warning',
        row: rows[0],
        rows,
        text: `Flugort für ${group.flightNumber} fehlt – aktuelle Gemini-Prüfung empfohlen`
      });
    });

    issues.sort((a, b) => Number(a.row || 0) - Number(b.row || 0));
    return issues;
  }

  function parseDelimited(text, delimiter) {
    const matrix = [];
    let row = [], cell = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i], next = text[i + 1];
      if (char === '"') {
        if (quoted && next === '"') { cell += '"'; i++; } else quoted = !quoted;
      } else if (char === delimiter && !quoted) {
        row.push(cell); cell = '';
      } else if ((char === '\n' || char === '\r') && !quoted) {
        if (char === '\r' && next === '\n') i++;
        row.push(cell);
        if (row.some(value => cellText(value))) matrix.push(row);
        row = []; cell = '';
      } else cell += char;
    }
    row.push(cell);
    if (row.some(value => cellText(value))) matrix.push(row);
    return matrix;
  }



  function isImageFile(file) {
    return /^image\//i.test(file.type || '') || /\.(jpe?g|png|webp)$/i.test(file.name || '');
  }

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Bild konnte nicht geöffnet werden.')); };
      img.src = url;
    });
  }

  async function preprocessImage(file) {
    const img = await loadImage(file);
    const maxWidth = 3200;
    const scale = Math.min(3, Math.max(1.6, maxWidth / img.naturalWidth));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = image.data;
    for (let i = 0; i < d.length; i += 4) {
      const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      const contrast = Math.max(0, Math.min(255, (gray - 128) * 1.65 + 128));
      const value = contrast > 205 ? 255 : contrast < 75 ? 0 : contrast;
      d[i] = d[i + 1] = d[i + 2] = value;
    }
    ctx.putImageData(image, 0, 0);
    return canvas;
  }

  // ATMS Bildimport – Spalten werden aus der sichtbaren Kopfzeile erkannt.
  // Es gibt KEINE feste flexible Spalten-Annahme mehr.
  // Die wiederholte Uhrzeit-Spalte ist optional; Spalten dürfen verschoben werden.

  function groupOcrLines(words) {
    const usable = (words || []).filter(w => {
      const value = cellText(w.text);
      const conf = Number(w.confidence ?? w.conf ?? 0);
      return value && conf >= 28 && w.bbox;
    }).map(w => ({
      text: cellText(w.text),
      key: cleanKey(w.text),
      x0: Number(w.bbox.x0 || 0),
      x1: Number(w.bbox.x1 || 0),
      y0: Number(w.bbox.y0 || 0),
      y1: Number(w.bbox.y1 || 0),
      cy: (Number(w.bbox.y0 || 0) + Number(w.bbox.y1 || 0)) / 2
    })).sort((a,b) => a.cy - b.cy || a.x0 - b.x0);

    const heights = usable.map(w => Math.max(1, w.y1 - w.y0)).sort((a,b)=>a-b);
    const medianH = heights.length ? heights[Math.floor(heights.length / 2)] : 20;
    const tolerance = Math.max(10, medianH * 0.72);
    const lines = [];

    usable.forEach(word => {
      let line = lines.find(item => Math.abs(item.cy - word.cy) <= tolerance);
      if (!line) {
        line = { cy: word.cy, words: [] };
        lines.push(line);
      }
      line.words.push(word);
      line.cy = line.words.reduce((sum,w)=>sum+w.cy,0) / line.words.length;
    });

    lines.forEach(line => line.words.sort((a,b)=>a.x0-b.x0));
    return lines.sort((a,b)=>a.cy-b.cy);
  }

  function canonicalImageHeaderLabel(key) {
    if (key === 'preis' || key === 'price') return 'Preis';
    if (key === 'uhrzeit' || key === 'zeit') return 'Uhrzeit';
    if (key === 'von' || key === 'from') return 'Von';
    if (key === 'nach' || key === 'to') return 'Nach';
    if (key === 'name' || key === 'kunde') return 'Name';
    if (key === 'firma' || key === 'company') return 'Firma';
    if (key === 'wg' || key === 'wagen') return 'Wg';
    if (key === 'pers' || key === 'personen' || key === 'pax') return 'Pers';
    if (key === 'ort' || key === 'flugort') return 'Ort';
    if (key === 'fahrer' || key === 'driver') return 'Fahrer';
    return '';
  }

  function headerAnchorsFromLine(line) {
    const anchors = [];
    const words = line.words || [];

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const key = cleanKey(word.text);

      if (key === 'flug' && words[i + 1]) {
        const nextKey = cleanKey(words[i + 1].text);
        if (/^(ang|ank|ankunft)$/.test(nextKey)) {
          anchors.push({
            label: 'Flug ang.',
            key: 'flugang',
            x: (word.x0 + words[i + 1].x1) / 2
          });
          i++;
          continue;
        }
        if (/^(ausg|aus|abg|abflug)$/.test(nextKey)) {
          anchors.push({
            label: 'Flug ausg.',
            key: 'flugausg',
            x: (word.x0 + words[i + 1].x1) / 2
          });
          i++;
          continue;
        }
      }

      // OCR schreibt gelegentlich "Flugang." / "Flugausg." in ein Wort.
      if (/^flug(ang|ank|ankunft)$/.test(key)) {
        anchors.push({ label: 'Flug ang.', key: 'flugang', x: (word.x0 + word.x1) / 2 });
        continue;
      }
      if (/^flug(ausg|aus|abg|abflug)$/.test(key)) {
        anchors.push({ label: 'Flug ausg.', key: 'flugausg', x: (word.x0 + word.x1) / 2 });
        continue;
      }

      const label = canonicalImageHeaderLabel(key);
      if (label) anchors.push({ label, key: cleanKey(label), x: (word.x0 + word.x1) / 2 });
    }

    return anchors.sort((a,b)=>a.x-b.x);
  }

  function scoreImageHeaderAnchors(anchors) {
    const keys = anchors.map(a => a.key);
    let score = 0;
    ['preis','uhrzeit','von','nach','name','firma','flugang','flugausg','pers','ort','fahrer','wg']
      .forEach(key => { if (keys.includes(key)) score++; });
    if (keys.includes('von') && keys.includes('nach')) score += 2;
    if (keys.includes('uhrzeit')) score += 1;
    return score;
  }

  function detectImageHeaderLine(lines) {
    let best = null;
    lines.slice(0, Math.min(lines.length, 35)).forEach((line, index) => {
      const anchors = headerAnchorsFromLine(line);
      const score = scoreImageHeaderAnchors(anchors);
      if (!best || score > best.score) best = { line, index, anchors, score };
    });
    return best;
  }

  function anchorsToBoundaries(anchors, width) {
    const sorted = anchors.slice().sort((a,b)=>a.x-b.x);
    const boundaries = [0];
    for (let i = 0; i < sorted.length - 1; i++) {
      boundaries.push((sorted[i].x + sorted[i + 1].x) / 2);
    }
    boundaries.push(width);
    return { sorted, boundaries };
  }

  function imageWordsToMatrix(words, width) {
    const lines = groupOcrLines(words);
    const header = detectImageHeaderLine(lines);

    if (!header || header.score < 6 || header.anchors.length < 6) {
      throw new Error('Die Spaltenüberschriften im Bild konnten nicht sicher erkannt werden. Bitte vollständige Kopfzeile mit hochladen.');
    }

    const { sorted: anchors, boundaries } = anchorsToBoundaries(header.anchors, width);
    const headerRow = anchors.map(anchor => anchor.label);
    const rows = [headerRow];

    lines.slice(header.index + 1).forEach(line => {
      const cells = Array(anchors.length).fill('').map(()=>[]);
      (line.words || []).forEach(word => {
        const cx = (word.x0 + word.x1) / 2;
        let col = boundaries.findIndex((right, i) => i > 0 && cx < right) - 1;
        if (col < 0) col = 0;
        if (col >= cells.length) col = cells.length - 1;
        cells[col].push(word.text);
      });

      const row = cells.map(parts => parts.join(' ').replace(/\s+/g,' ').trim());
      const nonEmpty = row.filter(Boolean).length;
      const hasTime = row.some(value => looksLikeTime(value) || /^\d{3,4}$/.test(cellText(value).replace(/\D/g,'')));
      const hasFlight = row.some(value => looksLikeFlight(value));
      if (nonEmpty >= 3 && (hasTime || hasFlight)) rows.push(row);
    });

    return rows;
  }

  async function readImagePlan(file) {
    if (!window.Tesseract) throw new Error('Bildanalyse-Modul konnte nicht geladen werden. Bitte die App einmal mit Internet öffnen.');
    const canvas = await preprocessImage(file);
    const status = $('importStatus');
    const result = await Tesseract.recognize(canvas, 'eng', {
      logger: message => {
        if (!status) return;
        if (message.status === 'recognizing text') {
          status.textContent = `Bild wird gelesen … ${Math.round((message.progress || 0) * 100)} %`;
        } else if (message.status) {
          status.textContent = `Bildanalyse: ${message.status}`;
        }
      }
    });
    const words = result?.data?.words || [];
    const matrix = imageWordsToMatrix(words, canvas.width);
    if (matrix.length <= 1) throw new Error('Im Bild wurden keine sicheren Fahrten erkannt. Bitte ein scharfes, vollständiges Querformat-Bild verwenden.');
    return { kind: 'matrix', matrix, sheetName: 'Bild / WhatsApp', imageOcr: true };
  }

  async function readFile(file) {
    if (isImageFile(file)) return readImagePlan(file);
    const extension = file.name.toLowerCase().split('.').pop();
    if (extension === 'json') {
      const object = JSON.parse(await file.text());
      return { kind: 'json', rows: Array.isArray(object) ? object : (object.rides || []) };
    }
    if (extension === 'csv' || extension === 'tsv') {
      const text = await file.text();
      const firstLine = text.split(/\r?\n/, 1)[0] || '';
      const delimiter = extension === 'tsv' ? '\t' : ((firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ';' : ',');
      return { kind: 'matrix', matrix: parseDelimited(text, delimiter), sheetName: 'CSV' };
    }
    if (extension === 'xlsx' || extension === 'xls') {
      if (!window.XLSX) throw new Error('Excel-Modul konnte nicht geladen werden. Bitte App einmal mit Internet öffnen und danach erneut versuchen.');
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: false, raw: true });
      const sheetName = workbook.SheetNames.find(name => {
        const matrix = XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1, defval: '', raw: true });
        return detectHeader(matrix).score >= 3;
      }) || workbook.SheetNames[0];
      if (!sheetName) throw new Error('Keine Tabelle in der Excel-Datei gefunden.');
      const matrix = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: '', raw: true, blankrows: false });
      return { kind: 'matrix', matrix, sheetName };
    }
    throw new Error('Dateiformat nicht unterstützt. Bitte Bild, Excel, CSV, TSV oder JSON verwenden.');
  }

  function renderMapping(headers, mappingInfo) {
    const labels = Object.entries(mappingInfo.mapping).map(([field, index]) => `${field}: ${headers[index]?.label || `Spalte ${index + 1}`}`);
    const el = $('planProfileInfo');
    if (el) el.innerHTML = `<b>${escapeHtml(mappingInfo.profile)}</b><span>${Math.round(mappingInfo.confidence * 100)} % Erkennung</span><small>${escapeHtml(labels.join(' · '))}</small>`;
  }

  function syncFlightLocationsFromSavedRides() {
    if (!state.rides.length) return 0;
    let saved = [];
    try {
      const parsed = JSON.parse(localStorage.getItem('atms_beta_14_3_1_rides') || '[]');
      if (Array.isArray(parsed)) saved = parsed;
    } catch (_) {}
    if (!saved.length) return 0;

    const normalizeFlight = value => {
      let v = String(value || '').trim().toUpperCase().replace(/\s+/g, '');
      if (/^0S\d{1,4}[A-Z]?$/.test(v)) v = 'OS' + v.slice(2);
      return v;
    };
    const keyText = value => String(value || '').trim().toLowerCase();

    let changed = 0;
    state.rides = state.rides.map(ride => {
      const flight = normalizeFlight(ride.flightNumber);
      if (!flight) return ride;

      const rideDate = cellText(ride.date);
      const candidates = saved.filter(item => {
        if (normalizeFlight(item.flightNumber) !== flight) return false;
        if (!item.flightLocation || item.flightLocation === 'Flugort prüfen') return false;
        const savedDate = cellText(item.date);
        if (rideDate) return savedDate === rideDate;
        return !savedDate;
      });
      if (!candidates.length) return ride;

      let hit = candidates.find(item =>
        ride.sourceRow && item.sourceRow && Number(item.sourceRow) === Number(ride.sourceRow)
      );
      if (!hit) hit = candidates.find(item =>
        keyText(item.time || item.planTime) === keyText(ride.time || ride.planTime) &&
        keyText(item.pickup) === keyText(ride.pickup) &&
        keyText(item.destination) === keyText(ride.destination)
      );
      if (!hit) hit = candidates[0];

      if (!ride.flightLocation || ride.flightLocation === 'Flugort prüfen' || ride.flightLocation !== hit.flightLocation) changed++;
      return {
        ...ride,
        flightLocation: normalizeFlightLocation(hit.flightLocation),
        iata: hit.iata || ride.iata || '',
        flightCheckConfidence: hit.flightCheckConfidence || 'verified',
        flightNeedsManualCheck: Boolean(hit.flightNeedsManualCheck || hit.flightCheckConfidence === 'uncertain'),
        flightCheckSourceNote: hit.flightCheckSourceNote || ride.flightCheckSourceNote || '',
        flightCheckedAt: hit.flightCheckedAt || ride.flightCheckedAt || ''
      };
    });
    return changed;
  }

  function refreshIssuesAfterFlightSync() {
    // CORE-001A: Kein Rückweg über bereits gespeicherte Fahrten/localStorage.
    // Nur der aktuelle staged Plan wird neu validiert.
    state.issues = validate(state.rides);
  }

  function normalizeFlightForCurrentCheck(value) {
    let v = String(value || '').trim().toUpperCase().replace(/\s+/g, '');
    if (/^0S\d{1,4}[A-Z]?$/.test(v)) v = 'OS' + v.slice(2);
    return v;
  }

  function stagedPlanIsActive() {
    return Boolean(state.rides.length && !$('planAnalysis')?.classList.contains('hidden'));
  }

  // CORE-001B 11.08.2026 19:10 Uhr: Übernahme-Zähler trennt jetzt sauber
  // zwischen geprüften Fahrten, wirklich übernommenen Flugorten und manuellen Fällen.
  // Dadurch kann die UI nicht mehr "0 übernommen" melden, obwohl ein Flugort gesetzt wurde.
  function applyGeminiResultsToStagedPlan(checked, appliedAt) {
    if (!stagedPlanIsActive() || !Array.isArray(checked)) {
      return {
        handled: false,
        matchedRides: 0,
        appliedRides: 0,
        manualRides: 0,
        matchedFlights: 0,
        appliedFlights: 0,
        manualFlights: 0,
        downgraded: 0
      };
    }

    let matchedRides = 0, appliedRides = 0, manualRides = 0, downgraded = 0;
    const matchedFlightKeys = new Set();
    const appliedFlightKeys = new Set();
    const manualFlightKeys = new Set();
    const checkTime = cellText(appliedAt) || new Date().toISOString();

    state.rides = state.rides.map(ride => {
      const flight = normalizeFlightForCurrentCheck(ride?.flightNumber || ride?.arrivalFlight || ride?.departureFlight);
      if (!flight) return ride;

      const date = cellText(ride?.date);
      const direction = cellText(ride?.flightDirection || (ride?.arrivalFlight ? 'arrival' : ride?.departureFlight ? 'departure' : '')).toLowerCase() || 'unknown';
      const flightTime = cellText(ride?.flightTime);
      const flightKey = `${flight}|${date}|${direction}|${flightTime}`;

      const candidates = checked.filter(item => {
        if (normalizeFlightForCurrentCheck(item?.flightNumber) !== flight) return false;
        if (cellText(item?.date) !== date) return false;
        const itemDirection = cellText(item?.direction).toLowerCase() || 'unknown';
        if (itemDirection !== direction) return false;
        return true;
      });

      let hit = null;
      if (flightTime) {
        const exact = candidates.filter(item => cellText(item?.flightTime) === flightTime);
        if (exact.length === 1) hit = exact[0];
        else if (!exact.length && candidates.length === 1 && !cellText(candidates[0]?.flightTime)) hit = candidates[0];
      } else if (candidates.length === 1) {
        hit = candidates[0];
      }
      if (!hit) return ride;

      matchedRides++;
      matchedFlightKeys.add(flightKey);

      const location = cellText(hit?.flightLocation || hit?.relevantLocation);
      const verified = hit?.status === 'verified' && hit?.confidence === 'verified' && !Boolean(hit?.conflict) && Boolean(location && location !== 'Flugort prüfen');
      if (hit?.verificationDowngraded) downgraded++;

      if (!verified) {
        manualRides++;
        manualFlightKeys.add(flightKey);
        return {
          ...ride,
          flightCheckConfidence: 'uncertain',
          flightNeedsManualCheck: true,
          flightCheckSourceNote: cellText(hit?.sourceNote) || ride?.flightCheckSourceNote || '',
          flightCheckedAt: checkTime
        };
      }

      appliedRides++;
      appliedFlightKeys.add(flightKey);
      return {
        ...ride,
        flightLocation: normalizeFlightLocation(location),
        iata: cellText(hit?.iata).toUpperCase() || ride?.iata || '',
        flightCheckConfidence: 'verified',
        flightNeedsManualCheck: false,
        flightCheckSourceNote: cellText(hit?.sourceNote),
        flightCheckedAt: checkTime
      };
    });

    state.issues = validate(state.rides);
    render();
    return {
      handled: true,
      matchedRides,
      appliedRides,
      manualRides,
      matchedFlights: matchedFlightKeys.size,
      appliedFlights: appliedFlightKeys.size,
      manualFlights: manualFlightKeys.size,
      downgraded
    };
  }

  window.ATMSPlanImportHasStagedRides = stagedPlanIsActive;
  window.ATMSPlanImportApplyGeminiFlightResults = applyGeminiResultsToStagedPlan;


  function resolvePriceIssue(rideId, action, suggestedPrice) {
    const ride = state.rides.find(item => String(item.id) === String(rideId));
    if (!ride) return;

    if (action === 'suggestion' || action === 'manual') {
      const value = Number(String(suggestedPrice ?? '').replace(',', '.'));
      if (!Number.isFinite(value) || value <= 0) {
        if (typeof window.showToast === 'function') window.showToast('Bitte einen gültigen Preis größer 0 eingeben', 'warn');
        return;
      }
      ride.price = value;
      state.priceDecisions[String(rideId)] = action;
      if (typeof window.ATMSPersistPriceOverride === 'function') {
        window.ATMSPersistPriceOverride(ride, value);
      }
      if (typeof window.showToast === 'function') {
        window.showToast(`${new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value)} übernommen`, 'ok');
      }
    } else if (action === 'original') {
      state.priceDecisions[String(rideId)] = 'original';
      if (typeof window.showToast === 'function') window.showToast('Originalpreis bestätigt', 'ok');
    } else if (action === 'zero') {
      ride.price = 0;
      state.priceDecisions[String(rideId)] = 'zero_confirmed';
      if (typeof window.showToast === 'function') window.showToast('0,00 € ausdrücklich bestätigt', 'ok');
    }

    state.issues = validate(state.rides);
    render();
  }

  function render() {
    refreshIssuesAfterFlightSync();
    const rides = state.rides, issues = state.issues;
    const errors = issues.filter(issue => issue.level === 'error').length;
    const warnings = issues.filter(issue => issue.level === 'warning').length;
    $('planAnalysis').classList.remove('hidden');
    updatePlanDateSummary();
    $('planRideCount').textContent = rides.length;
    $('planDriverCount').textContent = new Set(rides.map(ride => ride.driver).filter(Boolean)).size;
    $('planWarningCount').textContent = warnings;
    $('planErrorCount').textContent = errors;
    if ($('planFlightCount')) $('planFlightCount').textContent = new Set(rides.map(ride => ride.flightNumber).filter(Boolean)).size;
    if ($('planSheetName')) $('planSheetName').textContent = state.meta.sheetName || '–';
    if ($('flightCheckStatus')) {
      const fs = window.ATMSFlight ? window.ATMSFlight.summary(rides) : { total: 0, withLocation: 0, needsCheck: 0 };
      $('flightCheckStatus').textContent = fs.total ? `${fs.total} Flüge · ${fs.withLocation} Ort aus Liste · ${fs.needsCheck} aktuell zu prüfen` : 'Keine Flugnummern erkannt.';
    }
    if ($('copyFlightCheckBtn')) $('copyFlightCheckBtn').disabled = !rides.some(ride => ride.flightNumber);

    $('planIssues').innerHTML = issues.length
      ? issues.slice(0, 20).map(issue => {
          const rows = Array.isArray(issue.rows) && issue.rows.length ? issue.rows : [issue.row];
          const rowLabel = rows.length === 1
            ? `Zeile ${rows[0]}`
            : `Zeilen ${rows.slice(0, -1).join(', ')} und ${rows[rows.length - 1]}`;

          if (issue.kind === 'date_batch') {
            return `<div class="plan-issue error" style="padding-bottom:12px">
              <div><b>Datumsprüfung</b> · ${escapeHtml(issue.text)}</div>
              <div style="font-size:12px;opacity:.82;margin-top:7px">Maßgeblich ist die normale Fahrtzeit aus Spalte 2/7. Die aktuelle Flugzeit aus Spalte 12 verändert das geplante Fahrtdatum nicht.</div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
                <button type="button" class="date-boundary-btn" data-date-action="next_day" style="flex:1;min-width:170px;padding:10px;border-radius:10px;font-weight:800">✓ ${escapeHtml(String(issue.count))} Fahrt(en) → ${escapeHtml(formatPlanDate(issue.nextDate))}</button>
                <button type="button" class="date-boundary-btn" data-date-action="same_day" style="flex:1;min-width:170px;padding:10px;border-radius:10px;font-weight:800">Alle bleiben ${escapeHtml(formatPlanDate(issue.baseDate))}</button>
              </div>
            </div>`;
          }

          if (issue.kind === 'price_missing') {
            return `<div class="plan-issue warning" style="padding-bottom:12px">
              <div><b>${rowLabel}</b> · ${escapeHtml(issue.text)}</div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
                <input type="text" inputmode="decimal" class="price-manual-input" data-ride-id="${escapeHtml(issue.rideId)}" placeholder="Preis z. B. 47,60" style="flex:1;min-width:145px;padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:#071a2b;color:#fff">
                <button type="button" class="price-review-btn" data-price-action="manual" data-ride-id="${escapeHtml(issue.rideId)}" style="flex:1;min-width:145px;padding:10px;border-radius:10px;font-weight:800">Preis übernehmen</button>
                <button type="button" class="price-review-btn" data-price-action="zero" data-ride-id="${escapeHtml(issue.rideId)}" style="flex:1;min-width:145px;padding:10px;border-radius:10px;font-weight:800">0,00 € ist korrekt</button>
              </div>
            </div>`;
          }

          if (issue.kind === 'price') {
            const suggestion = Number(issue.suggestedPrice);
            const suggestionLabel = Number.isFinite(suggestion) && suggestion > 0
              ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(suggestion)
              : '';
            const originalLabel = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(issue.originalPrice) || 0);
            return `<div class="plan-issue ${issue.level}" style="padding-bottom:12px">
              <div><b>${rowLabel}</b> · ${escapeHtml(issue.text)}</div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
                ${suggestionLabel ? `<button type="button" class="price-review-btn" data-price-action="suggestion" data-ride-id="${escapeHtml(issue.rideId)}" data-suggested-price="${suggestion}" style="flex:1;min-width:145px;padding:10px;border-radius:10px;font-weight:800">✓ ${escapeHtml(suggestionLabel)} übernehmen</button>` : ''}
                <button type="button" class="price-review-btn" data-price-action="original" data-ride-id="${escapeHtml(issue.rideId)}" style="flex:1;min-width:145px;padding:10px;border-radius:10px;font-weight:800">Original ${escapeHtml(originalLabel)} ist korrekt</button>
              </div>
            </div>`;
          }

          return `<div class="plan-issue ${issue.level}"><b>${rowLabel}</b> · ${escapeHtml(issue.text)}</div>`;
        }).join('')
      : '<div class="plan-issue ok">✓ Keine kritischen Probleme erkannt.</div>';

    $('planIssues').querySelectorAll('.date-boundary-btn').forEach(button => {
      button.addEventListener('click', () => {
        resolveDateBoundary(button.dataset.dateAction);
      });
    });

    $('planIssues').querySelectorAll('.price-review-btn').forEach(button => {
      button.addEventListener('click', () => {
        const action = button.dataset.priceAction;
        let value = button.dataset.suggestedPrice;
        if (action === 'manual') {
          const input = [...$('planIssues').querySelectorAll('.price-manual-input')]
            .find(el => String(el.dataset.rideId) === String(button.dataset.rideId));
          value = input?.value || '';
        }
        resolvePriceIssue(
          button.dataset.rideId,
          action,
          value
        );
      });
    });

    $('planPreviewBody').innerHTML = rides.slice(0, 80).map(ride => {
      const rowIssues = issues.filter(issue => Array.isArray(issue.rows) ? issue.rows.includes(ride.sourceRow) : issue.row === ride.sourceRow);
      const status = rowIssues.some(issue => issue.level === 'error') ? 'Fehler' : rowIssues.length ? 'Prüfen' : 'OK';
      const typeLabels = { arrival: 'Ankunft', departure: 'Abflug', hotel: 'Hotel', transfer: 'Transfer' };
      return `<tr>
        <td>${escapeHtml(ride.time || '–')}<div style="font-size:11px;opacity:.72;margin-top:3px">${escapeHtml(formatPlanDate(ride.date))}</div></td>
        <td>${escapeHtml(ride.driver || 'Offen')}</td>
        <td>${escapeHtml(ride.pickup || '–')}</td>
        <td>${escapeHtml(ride.destination || '–')}</td>
        <td>${escapeHtml(ride.flightNumber || '–')}</td>
        <td>${escapeHtml(ride.flightLocation || '–')}</td>
        <td>${escapeHtml(typeLabels[ride.rideType] || ride.rideType)}</td>
        <td>${ride.price ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(ride.price) : '–'}</td>
        <td><span class="plan-status ${status === 'OK' ? 'ok' : status === 'Fehler' ? 'error' : 'warning'}">${status}</span></td>
      </tr>`;
    }).join('');

    $('importPlanBtn').disabled = rides.length === 0 || errors > 0 || issues.some(issue => issue.kind === 'price' || issue.kind === 'price_missing');
    const unresolvedPriceIssues = issues.filter(issue => issue.kind === 'price' || issue.kind === 'price_missing').length;
    $('importStatus').textContent = errors
      ? `${rides.length} Fahrten erkannt. ${errors} Fehler müssen vor dem Import behoben werden.`
      : unresolvedPriceIssues
        ? `${rides.length} Fahrten erkannt. ${unresolvedPriceIssues} auffälliger Preis muss vor der Übernahme bestätigt werden.`
        : `${rides.length} Fahrten erkannt und geprüft. Bereit zur Übernahme.`;
  }

  async function analyze() {
    if (!state.file) return;
    try {
      currentPlanDate();
      $('importStatus').textContent = isImageFile(state.file) ? 'Bildanalyse wird vorbereitet …' : 'Planliste wird analysiert …';
      const result = await readFile(state.file);
      if (result.kind === 'json') {
        const planDate = currentPlanDate();
        state.rides = result.rows.map((ride, index) => {
          const withDate = { ...ride, planDate: cellText(ride?.planDate) || planDate, date: cellText(ride?.date) || planDate };
          return window.norm ? window.norm(withDate, index) : withDate;
        });
        state.rides = assignRideDates(state.rides, { preserveExplicit: true });
        if (window.ATMSFlight) state.rides = window.ATMSFlight.prepareRides(state.rides);
        state.meta = { sheetName: 'JSON', profile: 'ATMS JSON' };
        state.issues = validate(state.rides.map((ride, index) => ({ ...ride, sourceRow: index + 1 })));
        if ($('planProfileInfo')) $('planProfileInfo').innerHTML = '<b>ATMS JSON</b><span>100 % Erkennung</span><small>Bestehende ATMS-Datenstruktur erkannt.</small>';
        render();
        return;
      }

      const matrix = result.matrix || [];
      if (!matrix.length) throw new Error('Keine Datenzeilen gefunden.');
      const headerDetection = detectHeader(matrix);
      if (headerDetection.score < 3) throw new Error('Die Überschriften der Planliste wurden nicht eindeutig erkannt. Erwartet werden unter anderem Uhrzeit, Von und Nach.');
      const headers = uniqueHeaders(matrix[headerDetection.index]);
      let mappingInfo = detectAtmsMapping(headers);
      if (mappingInfo.confidence < 0.75) mappingInfo = genericMapping(headers);
      if (result.imageOcr) {
        mappingInfo = {
          ...mappingInfo,
          profile: mappingInfo.confidence >= 0.85 ? 'ATMS Bildimport Flex' : 'ATMS Bildimport – Prüfung nötig'
        };
      }
      const missing = ['time','pickup','destination'].filter(field => mappingInfo.mapping[field] === undefined);
      if (missing.length) throw new Error(`Pflichtspalten nicht erkannt: ${missing.join(', ')}.`);
      if (Array.isArray(mappingInfo.ambiguities) && mappingInfo.ambiguities.length) {
        throw new Error(`Spaltenzuordnung nicht eindeutig: ${mappingInfo.ambiguities.join(' · ')}. Bitte Planliste prüfen; ATMS rät nicht.`);
      }

      const dataRows = matrix.slice(headerDetection.index + 1);
      const rides = [];
      dataRows.forEach((row, offset) => {
        const sourceRow = headerDetection.index + offset + 2;
        if (!isDataRow(row, mappingInfo.mapping)) return;
        rides.push(makeRide(row, sourceRow, mappingInfo.mapping, state.file.name));
      });
      if (!rides.length) throw new Error('Unterhalb der Überschriften wurden keine Fahrten erkannt.');

      state.matrix = matrix;
      state.rides = assignRideDates(rides);
      state.rides = window.ATMSFlight ? window.ATMSFlight.prepareRides(state.rides) : state.rides;
      state.mapping = mappingInfo.mapping;
      state.meta = { sheetName: result.sheetName, headerRow: headerDetection.index + 1, profile: mappingInfo.profile };
      state.issues = validate(state.rides);
      localStorage.setItem(PROFILE_KEY, JSON.stringify({ profile: mappingInfo.profile, mapping: mappingInfo.mapping, headers: headers.map(header => header.label), savedAt: new Date().toISOString() }));
      renderMapping(headers, mappingInfo);
      render();
    } catch (error) {
      $('importStatus').textContent = `Fehler: ${error.message}`;
      $('planAnalysis').classList.add('hidden');
      $('importPlanBtn').disabled = true;
    }
  }

  function selectFile(file) {
    state.file = file;
    state.matrix = [];
    state.rides = [];
    state.issues = [];
    state.meta = {};
    state.priceDecisions = {};
    state.dateBoundaryDecision = '';
    state.dateInfo = {};
    $('analyzePlanBtn').disabled = !file;
    $('importPlanBtn').disabled = true;
    $('planAnalysis').classList.add('hidden');
    const planDate = currentPlanDate();
    $('importStatus').textContent = file ? `Ausgewählt: ${file.name} · Plantag ${formatPlanDate(planDate)}. Jetzt „Planliste analysieren“ tippen.` : 'Noch keine Planliste ausgewählt.';
  }

  window.addEventListener('atms:gemini-flight-result', event => {
    if (!state.rides.length) return;
    // Bei scope=staged-plan wurde das Ergebnis bereits direkt auf state.rides angewendet.
    if (event?.detail?.scope === 'staged-plan') return;
    try {
      refreshIssuesAfterFlightSync();
      render();
    } catch (_) {}
  });

  function importRides() {
    if (!state.rides.length) return;
    try {
      const normalized = state.rides.map((ride, index) => window.norm ? window.norm(ride, index) : ride);
      if (typeof window.applyImportedRides !== 'function') throw new Error('ATMS-Importfunktion ist nicht verfügbar.');
      // CORE-003A: bestehende Plantage nicht vorab aus localStorage löschen.
      // applyImportedRides ersetzt nur den neu importierten Plantag und bewahrt andere Tage.
      const result = window.applyImportedRides(normalized);
      if (result.cancelled) { $('importStatus').textContent = 'Import abgebrochen.'; return; }
      $('jsonInput').value = JSON.stringify({ rides: normalized }, null, 2);
      $('importStatus').textContent = result.mode === 'replace-days'
        ? `${result.count} Fahrten übernommen · ${result.total} Fahrten aus mehreren Plantagen gespeichert.`
        : `${result.count} Fahrten übernommen.`;
      if (typeof window.showToast === 'function') window.showToast(
        result.mode === 'replace-days' ? `${result.count} Fahrten übernommen · ${result.total} insgesamt` : `${result.count} Fahrten importiert`,
        'ok'
      );
      if (typeof window.render === 'function') window.render();
    } catch (error) {
      $('importStatus').textContent = `Importfehler: ${error.message}`;
    }
  }

  async function copyFlightCheckPrompt() {
    if (!state.rides.length || !window.ATMSFlight) return;
    const prompt = window.ATMSFlight.buildGeminiPrompt(state.rides);
    try {
      await navigator.clipboard.writeText(prompt);
      $('importStatus').textContent = 'Gemini-Flugprüfauftrag wurde kopiert. In Gemini einfügen und die Flüge für den aktuellen Tag prüfen lassen.';
      if (typeof window.showToast === 'function') window.showToast('Gemini-Flugprüfung kopiert', 'ok');
    } catch (_) {
      const ta = document.createElement('textarea');
      ta.value = prompt;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      $('importStatus').textContent = 'Gemini-Flugprüfauftrag wurde kopiert.';
    }
  }

  function init() {
    const input = $('fileInput'), drop = $('planImportDrop');
    if (!input) return;
    ensurePlanDateControl();
    currentPlanDate();
    input.addEventListener('change', event => selectFile(event.target.files && event.target.files[0]));
    $('analyzePlanBtn')?.addEventListener('click', analyze);
    $('importPlanBtn')?.addEventListener('click', importRides);
    $('copyFlightCheckBtn')?.addEventListener('click', copyFlightCheckPrompt);
    if (drop) {
      ['dragenter','dragover'].forEach(name => drop.addEventListener(name, event => { event.preventDefault(); drop.classList.add('over'); }));
      ['dragleave','drop'].forEach(name => drop.addEventListener(name, event => { event.preventDefault(); drop.classList.remove('over'); }));
      drop.addEventListener('drop', event => {
        const file = event.dataTransfer.files && event.dataTransfer.files[0];
        if (file) selectFile(file);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
