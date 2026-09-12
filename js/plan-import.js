(() => {
  'use strict';

  // CORE-007D4 · 12.09.2026: HEADERLESS PRICE ANCHOR RECOVERY. Wenn ein kopfzeilenloser Ausschnitt mehrere sichere Zeitanker, aber zu wenige Preisanker liefert, wird ausschließlich der aus der bekannten 13-Spalten-Geometrie abgeleitete linke Preis-Korridor der betroffenen Zeilen lokal erneut OCR-gelesen. Ein Preisanker wird nur nach eindeutigem Mehrfach-Konsens derselben Dezimalzahl als synthetischer OCR-Anker ergänzt; mindestens zwei Preisanker bleiben fuer die Freigabe Pflicht. Keine Preiswerte oder zeilenspezifischen Daten werden hart codiert.

  // CORE-007D6 · 12.09.2026: REPEATED TEXT CONSISTENCY. Beim Bildimport werden ausschließlich wiederkehrende Werte in den Spalten Name/Firma konservativ vereinheitlicht, wenn mehrere Zeilen exakt dieselbe Buchstaben-/Ziffernfolge besitzen und sich die Varianten nur durch Leerzeichen/Trennzeichen oder Groß-/Kleinschreibung unterscheiden. Eine eindeutige Mehrheits-Schreibweise muss mindestens zweimal vorkommen; Buchstaben, Umlaute und Inhalte werden niemals ergänzt oder geraten. Struktur-, Flug-, PLAN-/DISPO-/LIVE- und Persistenzlogik bleiben unverändert.
  // CORE-007D2 · 12.09.2026: Kopfzeilenlose Plan-Ausschnitte koennen ihre Spaltenstruktur jetzt zusaetzlich aus wiederkehrenden X-Positionen mehrerer Datenzeilen bestaetigen. Preis- und Zeitanker duerfen auf unterschiedlichen Zeilen liegen; die 13 Spalten werden erst nach wiederholter Positions-Evidenz freigegeben. Keine Werte-/Namen-/Flugnummern-Hardcodes.

  // CORE-007D1 · 12.09.2026: Kopfzeilenlose ATMS-Ausschnitte behalten den strengen Geometrie-Guard, koennen aber bei wenigen schwachen Kernzellen eine gezielte Zell-Zweit-OCR ausfuehren. Nur eindeutiger Mehrfach-Konsens wird uebernommen; bei zu vielen/weiterhin unklaren Zellen bleibt der sichere Abbruch bestehen. Keine Werte-Hardcodes.
  // CORE-007D · 12.09.2026: HEADERLESS PLAN SAFE OCR. Bildausschnitte ohne sichtbare Kopfzeile dürfen ausschließlich dann als bekanntes 13-Spalten-ATMS-Preislayout rekonstruiert werden, wenn mehrere Datenzeilen gemeinsam Preis-, DISPO-Zeit-, Routen-, Fahrzeug-/Personen-, Flug- und Fahrer-Geometrie plausibel bestätigen. Die Spaltengrenzen werden aus einer normierten ATMS-Layoutvorlage anhand der im Bild tatsächlich erkannten Preis-/Zeitanker skaliert und anschließend erneut gegen die Datenzeilen validiert. Bei unklarer Struktur bleibt der bisherige sichere Abbruch bestehen. Keine Namen, Flugnummern, Orte oder Zeiten werden hart codiert.
  // CORE-007B · 12.09.2026: OCR CONFIDENCE DISPLAY. Die interne technische Struktur-Konfidenz bleibt unverändert als Sicherheitswert erhalten, wird bei Bildimport aber nicht mehr missverständlich als allgemeine '% Erkennung' ausgegeben. Sichtbar sind stattdessen der reale OCR-Analysezustand, Anzahl OCR-geprüfter Fahrten sowie offene Hinweise/Fehler. Keine künstliche 100-%-Anzeige.
  // CORE-007A · 12.09.2026: OCR CLEAN ANALYSIS. Sicher per Mehrfach-Konsens aufgeloeste Zeit-/Fahrer-OCR-Korrekturen bleiben als interne Diagnose-Metadaten erhalten, erscheinen aber nicht mehr als offene Hinweise. Fehlende/noch zu verifizierende Flugorte werden als eigener Bereich 'Flugprüfung offen' geführt und nicht als OCR-Hinweis gezählt. Nur ungelöste OCR-/Datenprobleme bleiben als Hinweis oder Fehler sichtbar. Keine Werte werden geraten oder hart codiert.
  // CORE-006Z · 12.09.2026: OCR TIME & DRIVER REFERENCE GUARD. Verdächtige 00:00–05:59-DISPO-Zeiten werden vor der Folgetag-Entscheidung ausschließlich in ihrer eigenen Uhrzeitzelle lokal nachgelesen und nur bei eindeutigem Mehrfach-Konsens korrigiert. Die rechte Fahrer-Spalte erhält zusätzlich eine spaltenweite deutsche Zweit-OCR mit konservativer Konsens-/Kompatibilitätsprüfung für Diakritik und optionale einbuchstabige Namenszusätze. 'Taxi' ist in der Fahrerposition ein zulässiger operativer Eintrag. Keine Namen, Zeiten oder Flugnummern werden hart codiert.
  // CORE-006N · 10.09.2026: Fahrer-Spaltenlogik an reale ATMS-Planlisten gehaertet. Erste Wg-Spalte = Fahrzeug. Fahrer = explizite Fahrer-Spalte, rechte zweite Name-Spalte ODER – bei aktuellen Listen wie 09.09.2026 – die rechte zweite Wg-Spalte nach Ort. Die sichtbare Kopfzeile bleibt geometrisch erhalten; keine Fahrtzeilen gehen durch Umbenennen der letzten Spalte verloren.
  // CORE-006M · 10.09.2026: Zwischenstand; reine Umbenennung der letzten Wg-Spalte in Name erwies sich bei realen Planlisten mit sichtbarer rechter Wg-Kopfzeile als zu streng und wurde durch CORE-006N ersetzt.
  // CORE-006L · 10.09.2026: Von-/Nach-Ortszellen erhalten eine rein lokale deutsche Zweit-OCR in wenigen Spalten-Durchläufen. Eine abweichende Schreibweise wird nur bei wiederholtem exaktem Konsens und ausschließlich bei einer kleinen, diakritikbezogenen OCR-Abweichung übernommen; keine Ortsnamen-Hardcodes.
  // CORE-006J · 09.09.2026: Zeitsemantik Bild-Planliste: erste Uhrzeit neben Preis = DISPO-Zeit; mittlere Uhrzeit vor Flug ang. = gespiegelte DISPO-Zeit; letzte Uhrzeit vor Ort = Flugzeit aus Liste. Alle drei Werte bleiben getrennt gespeichert.
  // CORE-006H · 09.09.2026: Reine Rand-Satzzeichen an Fahrerwerten werden generisch entfernt, wenn danach ein vollständig gültiger Fahrername übrig bleibt. Kein Namens-Hardcode; unklare/innere OCR-Artefakte bleiben weiterhin in der gezielten Zweit-OCR bzw. manuellen Prüfung.
  // CORE-006G · 09.09.2026: OCR-auffällige Fahrerwerte (z. B. führende/abschließende Satzzeichen oder andere Nicht-Namenszeichen) werden wie fehlende Fahrer gezielt nur in der konkreten rechten Fahrerzelle erneut gelesen. Automatische Übernahme weiterhin nur bei eindeutigem Mehrfach-Konsens; keine Fahrer-Hardcodes.
  // CORE-006F · 09.09.2026: Fehlende Fahrerzellen werden bei Bildimport gezielt nur in der konkreten rechten Fahrerzelle lokal nachgelesen. Automatische Übernahme nur bei eindeutigem Mehrfach-Konsens; keine Fahrer-Hardcodes.
  // CORE-006D · 09.09.2026: No-Price-Mirror-Fallback nutzt Datenzeilen-Geometrie, wenn die mittlere Uhrzeit in der Kopfzeile vom OCR fehlt; gezielte Flug-OCR entfernt Minutenreste nur bei exakter Übereinstimmung mit der Planzeit. Keine Flugnummern-Hardcodes.
  // CORE-006C · 09.09.2026: 13-Spalten-Bildschema OHNE Preis mit zusätzlicher gespiegelter Uhrzeit nach Firma; verhindert, dass Minutenreste der Planzeit vor Flugnummern geraten. Bestehende 12-/13-Preis-/14-Preis-Schemata bleiben erhalten.
  // CORE-006B · 09.09.2026: 14-Spalten-Bildschema mit zusätzlicher mittlerer Uhrzeit zwischen Firma und Flug ang./ausg.; geometrische Zeilenprüfung auf dynamische Spaltenindizes umgestellt. Bestehende 12-/13-Spalten-Layouts bleiben erhalten.

  // CORE-005W1 · 09.09.2026: Mehrdeutige Flugzellen werden zusätzlich mit Single-Line/Single-Word OCR-Modi nachgelesen; weiterhin nur eindeutiger Mehrfach-Konsens.
  // CORE-005W · 09.09.2026: OCR-mehrdeutige Flugpräfixe (z. B. I/1/L oder O/0) werden bei Bildimport gezielt nur in der konkreten Flugzelle erneut gelesen. Automatische Korrektur nur bei eindeutigem Mehrfach-Konsens; sonst Warnung statt Raten.
  // CORE-005R · 08.09.2026: Verdächtige/fehlende Preiszellen im Bild-/WhatsApp-Import werden gezielt lokal erneut OCR-gelesen. Nur eindeutiger plausibler Mehrfach-Konsens wird automatisch übernommen; sonst bleibt die bestehende manuelle Preis-Sicherheitsabfrage erhalten. Keine feste Sonderregel für 47,60 €.
  // CORE-005O · 08.09.2026: Sichere OCR-Ortsnormalisierung: Miinchen/Mienchen/Munchen/Muenchen → München; Rohwert bleibt in sourceFlightLocationRaw erhalten.
  // CORE-005L · 08.09.2026: Bildimport mit Preis-Spalte auf 13-Spalten-ATMS-Schema gehärtet; fehlend gelesene 'Flug ausg.'-Überschrift wird geometrisch rekonstruiert.
  // CORE-005J · 07.09.2026: CORE-005I + nachträgliche UI-Korrektur entfernt; app.js/pwa.js rendern Preis und PLAN/DISPO/LIVE direkt an der Quelle.
  // CORE-005C · 07.09.2026: CORE-005B + physisch fehlende OCR-Zeilen per Zeilenabstand erkennen und gezielt lokal nachlesen.
  // CORE-004Q · 06.09.2026: Plantag wird sicher aus Dateiname/Listeninhalt erkannt, bevor Flugprüfungen starten.
  // Bei Gemini/Firebase-429 wird kein weiterer Quota-Aufruf in derselben Sitzung versucht; der sichere manuelle Fallback bleibt aktiv.
  // CORE-004P · 06.09.2026: Der sichtbare Button „Flugorte automatisch prüfen“ startet jetzt wirklich
  // window.ATMSAutoFlight (Firebase AI Logic). Der manuelle Gemini-Kopierweg bleibt nur als Fallback.
  // Frische Prüfergebnisse werden direkt auf die aktuell analysierte Planliste angewendet; unsichere
  // Ergebnisse überschreiben vorhandene Flugorte niemals.
  // CORE-004K · 06.09.2026: Null-/fehlende Preise dürfen den Import nicht mehr still als 0,00 € passieren.
  // Solche Preise müssen vor der Übernahme manuell bestätigt/eingegeben werden. Keine automatische Preiskorrektur.
  // CORE-004J · 05.09.2026: lokale Flugzellen-Zweit-OCR mit Konsens statt Set-Blockade.
  // Mehrere lokale Leseversuche stimmen ab; nur eindeutiger Konsens wird übernommen. Flug-/Layout-/Zeitlogik bleibt unverändert.
  // CORE-004H begrenzte den Flugzellen-Crop korrekt, vergrößerte ihn aber bis 5x ohne Glättung.
  // Dadurch konnten Ziffern (z. B. 7) als Schrägstrich gelesen werden. Jetzt 1x/2x mit sauberer Glättung.

  // ATMS PRO DAY-002 FLEX 10.08.2026 16:50 Uhr (Europe/Berlin): Folgetag-Block + flexible/optionale Spaltenerkennung.

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

  function validIsoPlanDate(year, month, day) {
    const y = Number(year), m = Number(month), d = Number(day);
    if (y < 2020 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return '';
    const probe = new Date(Date.UTC(y, m - 1, d));
    if (probe.getUTCFullYear() !== y || probe.getUTCMonth() !== m - 1 || probe.getUTCDate() !== d) return '';
    return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  function extractPlanDateCandidates(value) {
    const text = String(value || '');
    const out = [];
    const add = iso => { if (iso && !out.includes(iso)) out.push(iso); };
    let match;
    const ymd = /(?:^|\D)(20\d{2})[.\-_/ ](0?[1-9]|1[0-2])[.\-_/ ](0?[1-9]|[12]\d|3[01])(?:\D|$)/g;
    while ((match = ymd.exec(text))) add(validIsoPlanDate(match[1], match[2], match[3]));
    const dmy = /(?:^|\D)(0?[1-9]|[12]\d|3[01])[.\-_/ ](0?[1-9]|1[0-2])[.\-_/ ](20\d{2})(?:\D|$)/g;
    while ((match = dmy.exec(text))) add(validIsoPlanDate(match[3], match[2], match[1]));
    const compactYmd = /(?:^|\D)(20\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])(?:\D|$)/g;
    while ((match = compactYmd.exec(text))) add(validIsoPlanDate(match[1], match[2], match[3]));
    const compactDmy = /(?:^|\D)(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])(20\d{2})(?:\D|$)/g;
    while ((match = compactDmy.exec(text))) add(validIsoPlanDate(match[3], match[2], match[1]));
    return out;
  }

  function setDetectedPlanDate(date, source = '') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) return false;
    state.planDate = date;
    const input = $('planDateInput');
    if (input) input.value = date;
    const status = $('planDateStatus');
    if (status) status.textContent = `Aktiver Plantag: ${formatPlanDate(date)}${source ? ` · automatisch aus ${source}` : ''}`;
    return true;
  }

  function detectPlanDateFromFile(file) {
    const candidates = extractPlanDateCandidates(file?.name || '');
    return candidates.length === 1 ? candidates[0] : '';
  }

  function detectPlanDateFromMatrix(matrix) {
    const counts = new Map();
    (Array.isArray(matrix) ? matrix.slice(0, 40) : []).forEach(row => {
      (Array.isArray(row) ? row : [row]).forEach(cell => {
        extractPlanDateCandidates(cell).forEach(date => counts.set(date, (counts.get(date) || 0) + 1));
      });
    });
    if (!counts.size) return '';
    const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    if (ranked.length === 1 || ranked[0][1] > ranked[1][1]) return ranked[0][0];
    return '';
  }

  function detectPlanDateFromJsonRows(rows) {
    const counts = new Map();
    (Array.isArray(rows) ? rows : []).forEach(ride => {
      const direct = cellText(ride?.planDate || ride?.date);
      const dates = /^\d{4}-\d{2}-\d{2}$/.test(direct) ? [direct] : extractPlanDateCandidates(direct);
      dates.forEach(date => counts.set(date, (counts.get(date) || 0) + 1));
    });
    if (!counts.size) return '';
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
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
    const price = Number(value) || 0;
    // CORE-004K: 0/leer ist NICHT automatisch plausibel. Ein fehlender OCR-Preis
    // muss vor dem Import ausdrücklich eingegeben oder als 0,00 € bestätigt werden.
    if (price <= 0) return { suspicious: true, suggestion: null, missing: true };
    if (price >= 1000) {
      const decimalSuggestion = price / 100;
      const suggestion = decimalSuggestion >= 10 && decimalSuggestion < 1000 ? decimalSuggestion : null;
      return { suspicious: true, suggestion, missing: false };
    }
    return { suspicious: false, suggestion: null, missing: false };
  }

  function normalizeFlightLocation(value) {
    const text = cellText(value).trim();
    if (!text || /^[-–—~_.\s]+$/.test(text)) return '';
    if (/^(miinchen|mienchen|munchen|muenchen)$/i.test(text)) return 'München';
    if (/^zirich$/i.test(text) || /^zurich$/i.test(text)) return 'Zürich';
    if (/^milan$/i.test(text)) return 'Mailand';
    return text;
  }

  function normalizeFlightNumber(value) {
    const raw = cellText(value).trim();
    if (!raw || /^[-–—~_.\s]+$/.test(raw)) return '';
    let normalized = raw.toUpperCase().replace(/\s+/g, '');
    // Häufiger OCR-Fehler bei Austrian Airlines: 0S162 -> OS162
    if (/^0S\d{1,4}[A-Z]?$/.test(normalized)) normalized = 'OS' + normalized.slice(2);
    // Fahrzeug-/Wagenwerte dürfen niemals als Flugnummer übernommen werden.
    if (/^(VAN|PKW|BUS|SPRINTER|TAXI|WG)\d*$/.test(normalized)) return '';
    // CORE-005B: OCR-Reste wie "~~-" oder reine Satzzeichen sind KEINE Flugnummer.
    // Nur formal plausible Flugnummern mit mindestens einem Buchstaben und einer Ziffer
    // bleiben erhalten. Dadurch kann die gezielte Flugzellen-Zweit-OCR danach greifen.
    if (!/[A-Z]/.test(normalized) || !/\d/.test(normalized)) return '';
    if (!/^[A-Z0-9]{2,4}\d{1,4}[A-Z]?$/.test(normalized)) return '';
    return normalized;
  }

  function looksLikeFlight(value) {
    return /^[A-Z0-9]{2,4}\s?\d{1,4}[A-Z]?$/.test(normalizeFlightNumber(value));
  }

  // CORE-004F · 05.09.2026: Sicherheitsnetz fuer Flugnummern, die OCR zwar
  // innerhalb derselben Tabellenzeile liest, aber nicht sauber in "Flug ang./ausg."
  // einsortiert. Es wird nur ein EINDEUTIGER Kandidat mit mindestens einem
  // Buchstaben akzeptiert; bei 0 oder mehreren Kandidaten wird nichts geraten.
  function flightCandidatesFromRow(row) {
    const found = new Set();
    (Array.isArray(row) ? row : []).forEach(cell => {
      const raw = cellText(cell).toUpperCase().replace(/\s+/g, '');
      if (!raw) return;
      const tokens = raw.match(/[A-Z0-9]{2,4}\d{1,4}[A-Z]?/g) || [];
      tokens.forEach(token => {
        const normalized = normalizeFlightNumber(token);
        if (!normalized || !/[A-Z]/.test(normalized) || !looksLikeFlight(normalized)) return;
        found.add(normalized);
      });
    });
    return [...found];
  }

  function looksLikeTime(value) {
    return /^\d{1,2}[:.]\d{2}$/.test(cellText(value)) || (typeof value === 'number' && value >= 0 && value < 1);
  }

  function classifyRide(pickup, destination, arrivalFlight, departureFlight) {
    const p = cleanKey(pickup), d = cleanKey(destination);
    const airport = value => /airport|flughafen|vorfeld|terminal/.test(value);
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

    // CORE-006N: Reale ATMS-Planlisten besitzen je nach Quelle rechts entweder
    // "Name", "Fahrer" ODER erneut "Wg", obwohl die Zellen dort Fahrernamen enthalten.
    // Deshalb semantisch unterscheiden statt die sichtbare Kopfzeile umzubenennen:
    // - erste Name-Spalte = Auftrag/Kunde
    // - erste Wg-Spalte = Fahrzeug
    // - Fahrer = explizite Fahrer-Spalte, zweite/rechte Name-Spalte oder zweite/rechte
    //   Wg-Spalte, sofern sie rechts von "Ort" liegt.
    const nameHeaders = headers.filter(h => h.key === 'name');
    if (nameHeaders.length) mapping.customer = nameHeaders[0].index;

    const driverHeader = headers.find(h => aliases.driver.includes(h.key));
    if (driverHeader) mapping.driver = driverHeader.index;
    else if (nameHeaders.length >= 2) mapping.driver = nameHeaders[nameHeaders.length - 1].index;

    const wgHeaders = headers.filter(h => h.key === 'wg' || aliases.vehicle.includes(h.key));
    if (mapping.vehicle === undefined && wgHeaders.length) mapping.vehicle = wgHeaders[0].index;
    if (mapping.driver === undefined && wgHeaders.length >= 2) {
      const locationHeader = headers.find(h => aliases.flightLocation.includes(h.key));
      const rightWg = wgHeaders[wgHeaders.length - 1];
      if (!locationHeader || rightWg.index > locationHeader.index) mapping.driver = rightWg.index;
    }

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

    const nameHeaders = headers.filter(h => h.key === 'name');
    if (nameHeaders.length) mapping.customer = nameHeaders[0].index;

    const driverHeader = headers.find(h => aliases.driver.includes(h.key));
    if (driverHeader) mapping.driver = driverHeader.index;
    else if (nameHeaders.length >= 2) mapping.driver = nameHeaders[nameHeaders.length - 1].index;

    const wgHeaders = headers.filter(h => h.key === 'wg' || aliases.vehicle.includes(h.key));
    if (mapping.vehicle === undefined && wgHeaders.length) mapping.vehicle = wgHeaders[0].index;
    if (mapping.driver === undefined && wgHeaders.length >= 2) {
      const locationHeader = headers.find(h => aliases.flightLocation.includes(h.key));
      const rightWg = wgHeaders[wgHeaders.length - 1];
      if (!locationHeader || rightWg.index > locationHeader.index) mapping.driver = rightWg.index;
    }

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
    // CORE-006Z: In der rechten Fahrer-/Wg-Spalte ist "Taxi" ein zulässiger
    // operativer Dispo-Eintrag. Fahrzeugbegriffe bleiben ansonsten ausgeschlossen.
    if (/^(van|pkw|bus|sprinter)$/i.test(text)) return false;
    return /^[A-Za-zÄÖÜäöüßÀ-ÿ\- ]{2,}$/.test(text);
  }

  function getDriverValue(row, mapping) {
    const mapped = cellText(valueAt(row, mapping, 'driver'));
    if (mapped) return mapped;

    const last = row[row.length - 1];
    if (looksLikeDriverName(last)) return cellText(last);

    return '';
  }



  function findPriceValue(row, mapping, options = {}) {
    const mapped = parseNumber(valueAt(row, mapping, 'price'));
    if (mapped > 0) return mapped;

    // CORE-005A: Bei Bild-/WhatsApp-Planlisten ohne erkannte Preis-Spalte
    // darf niemals eine Uhrzeit oder irgendeine andere Zelle als Preis dienen.
    if (options.imageOcr) return 0;

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


  function getVehicleValue(row, mapping, options = {}) {
    const mapped = cellText(valueAt(row, mapping, 'vehicle'));
    if (mapped && !/^\d+(?:[.,]\d+)?$/.test(mapped)) return mapped;

    // CORE-005A: Beim Bildimport keine festen Nachbarspalten als Fallback.
    // Die sichtbare erste Wg-Spalte ist die einzige Fahrzeugquelle.
    if (options.imageOcr) return '';

    // Legacy-Fallback nur fuer bereits strukturierte Altimporte.
    const fixedVehicle = cellText(row[8]);
    if (fixedVehicle && !/^\d+(?:[.,]\d+)?$/.test(fixedVehicle)) return fixedVehicle;
    return mapped || 'Pkw';
  }

  function getPersonsValue(row, mapping, options = {}) {
    const mapped = parseNumber(valueAt(row, mapping, 'persons'));
    if (mapped > 0) return mapped;

    // CORE-005A: Beim Bildimport Pers niemals aus einer Nachbarspalte ableiten.
    if (options.imageOcr) return 0;

    // Legacy-Fallback nur fuer bereits strukturierte Altimporte.
    const fixedPersons = parseNumber(row[9]);
    return fixedPersons > 0 ? fixedPersons : 0;
  }

  function makeRide(row, rowNumber, mapping, fileName, options = {}) {
    let arrivalFlight = normalizeFlightNumber(valueAt(row, mapping, 'arrivalFlight'));
    let departureFlight = normalizeFlightNumber(valueAt(row, mapping, 'departureFlight'));
    const pickup = cellText(valueAt(row, mapping, 'pickup'));
    const destination = cellText(valueAt(row, mapping, 'destination'));
    const customer = cellText(valueAt(row, mapping, 'customer'));
    const company = cellText(valueAt(row, mapping, 'company')) || customer || 'WT';

    let recoveredFlight = '';
    let flightRecoveryAmbiguous = false;
    if (!arrivalFlight && !departureFlight && !options.imageOcr) {
      const candidates = flightCandidatesFromRow(row);
      if (candidates.length === 1) {
        recoveredFlight = candidates[0];
        const routeType = classifyRide(pickup, destination, '', '');
        if (routeType === 'arrival') arrivalFlight = recoveredFlight;
        else if (routeType === 'departure') departureFlight = recoveredFlight;
      } else if (candidates.length > 1) {
        flightRecoveryAmbiguous = true;
      }
    }

    const flightNumber = arrivalFlight || departureFlight || recoveredFlight;
    const rideType = classifyRide(pickup, destination, arrivalFlight, departureFlight);

    // CORE-005D: Disponenten tragen mangels Bemerkungsspalte vereinzelt eine
    // Abholzeit in die Ort-Spalte ein. Eine eindeutige Uhrzeit ist kein Flugort.
    // Planzeit, Disponentenzeit und spaetere Live-Zeit bleiben getrennte Werte.
    const sourceFlightLocationRaw = cellText(valueAt(row, mapping, 'flightLocation'));
    const dispatcherTime = looksLikeTime(sourceFlightLocationRaw)
      ? normalizeTime(sourceFlightLocationRaw)
      : '';
    const flightLocation = dispatcherTime
      ? ''
      : normalizeFlightLocation(sourceFlightLocationRaw);

    // CORE-006J: Verbindliche Zeitsemantik der aktuellen ATMS-Bildlisten.
    const primaryDispoTime = normalizeTime(valueAt(row, mapping, 'time'));
    const mirroredDispoTime = normalizeTime(valueAt(row, mapping, 'timeMirror'));
    const dispoTime = primaryDispoTime || mirroredDispoTime;
    const listedFlightTime = normalizeTime(valueAt(row, mapping, 'flightTime'));

    return {
      id: `import-${Date.now()}-${rowNumber}`,
      sourceRow: rowNumber,
      sourceFile: fileName,
      planDate: currentPlanDate(),
      date: currentPlanDate(),
      // `planTime` bleibt nur als Legacy-Kompatibilitätswert erhalten.
      // Semantisch ist diese erste Zeit in den aktuellen Bildlisten die DISPO-Zeit.
      time: dispoTime,
      planTime: dispoTime,
      dispoTime,
      dispo_time: dispoTime,
      timeMirror: mirroredDispoTime,
      flightTime: listedFlightTime,
      timeSemanticSource: 'dispo+mirror+listed-flight-time',
      pickup,
      destination,
      customer,
      company,
      partner: customer || company,
      arrivalFlight,
      departureFlight,
      flightNumber,
      flightDirection: arrivalFlight ? 'arrival' : departureFlight ? 'departure' : '',
      flightLocation,
      dispatcherTime,
      dispo_abholzeit: dispatcherTime,
      dispoAbholzeit: dispatcherTime,
      dispatcherNote: dispatcherTime ? `Disponentenzeit aus Ort-Spalte: ${sourceFlightLocationRaw}` : '',
      sourceFlightLocationRaw,
      flightRecoveredFromRow: Boolean(recoveredFlight),
      flightRecoveryAmbiguous,
      flightNeedsManualCheck: Boolean(recoveredFlight || flightRecoveryAmbiguous),
      vehicle: getVehicleValue(row, mapping, options),
      persons: getPersonsValue(row, mapping, options),
      price: findPriceValue(row, mapping, options),
      priceRequired: !(options.imageOcr && mapping.price === undefined),
      priceMissingFromSource: Boolean(options.imageOcr && mapping.price === undefined),
      sourceImageOcr: Boolean(options.imageOcr),
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
      // CORE-007A: Eine per eindeutigem Mehrfach-Konsens korrigierte Zeit ist bereits
      // gelöst. timeOcrInitial/timeRecoveredFromTargetedOcr bleiben als interne Diagnose
      // am Ride erhalten, werden aber nicht mehr als offener OCR-Hinweis ausgegeben.
      if (ride.dispoTime && ride.timeMirror && normalizeTime(ride.dispoTime) !== normalizeTime(ride.timeMirror)) {
        issues.push({ level: 'warning', row, text: `DISPO-Zeit ${ride.dispoTime} und gespiegelte DISPO-Zeit ${ride.timeMirror} weichen ab – Original-Planliste prüfen` });
      }
      if (!ride.pickup) issues.push({ level: 'error', row, text: 'Abholort fehlt' });
      if (!ride.destination) issues.push({ level: 'error', row, text: 'Ziel fehlt' });
      if (!ride.driver) {
        issues.push({ level: 'warning', row, text: 'Fahrer fehlt – Fahrt bleibt offen' });
      } else if (ride.driverNeedsManualCheck) {
        // CORE-007A: Nur wirklich ungelöste Fahrer-OCR bleibt sichtbar.
        // Erfolgreiche Boundary-/Targeted-OCR-Korrekturen sind bereits verifiziert
        // und bleiben ausschließlich als Diagnose-Metadaten am Ride erhalten.
        issues.push({ level: 'warning', row, text: `Fahrer „${ride.driver}“ OCR-auffällig – Original-Planliste prüfen` });
      }
      if (ride.flightNumber && !looksLikeFlight(ride.flightNumber)) issues.push({ level: 'warning', row, text: `Flugnummer „${ride.flightNumber}“ bitte prüfen` });
      if (ride.flightOcrAmbiguityNeedsReview && ride.flightNumber) {
        issues.push({ level: 'warning', row, text: `Flugnummer ${ride.flightNumber} enthält ein OCR-mehrdeutiges Zeichen (I/1/L oder O/0) – Original bitte prüfen` });
      }

      // Ort darf nie stillschweigend ohne zugehoerige Flugnummer bestehen bleiben.
      // Das verhindert genau den heute beobachteten Fall "Palma vorhanden, EW9577 weg".
      if (!ride.flightNumber && ride.flightLocation) {
        issues.push({
          level: 'warning',
          row,
          text: `Flugort „${normalizeFlightLocation(ride.flightLocation)}“ vorhanden, aber Flugnummer fehlt – Original-Planliste prüfen; Ort bleibt erhalten`
        });
      }
      // CORE-007A: Erfolgreich per lokalem Mehrfach-Konsens wiederhergestellte
      // Flugnummern werden nicht mehr als OCR-Problem gezählt. Falls der Flugort noch
      // fehlt/unsicher ist, erscheint das weiter unten separat als 'Flugprüfung offen'.
      if (ride.flightRecoveredFromRow && ride.flightNumber) {
        issues.push({
          level: 'warning',
          row,
          text: `Flugnummer ${ride.flightNumber} außerhalb der erwarteten Flugspalte erkannt und gesichert – bitte einmal prüfen`
        });
      } else if (ride.flightRecoveryAmbiguous) {
        issues.push({
          level: 'warning',
          row,
          text: 'Mehrere mögliche Flugnummern in derselben Zeile erkannt – nicht automatisch zugeordnet'
        });
      }

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
      if (ride.priceRequired !== false && priceCheck.suspicious && !priceDecision) {
        const shownPrice = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(ride.price);
        const suggestionText = priceCheck.suggestion !== null
          ? ` Möglicher OCR-/Dezimalfehler: eventuell ${new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(priceCheck.suggestion)}.`
          : '';
        issues.push({
          level: 'warning',
          kind: 'price',
          missingPrice: Boolean(priceCheck.missing),
          row,
          rideId: String(ride.id || row),
          originalPrice: Number(ride.price) || 0,
          suggestedPrice: priceCheck.suggestion,
          text: priceCheck.missing
            ? 'Preis fehlt oder wurde beim OCR nicht sicher erkannt – bitte mit der Original-Planliste prüfen. Keine automatische Preiskorrektur.'
            : `Preis ${shownPrice} ist auffällig – bitte mit der Original-Planliste prüfen.${suggestionText} Keine automatische Preiskorrektur.`
        });
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
        level: 'info',
        kind: 'flight_check',
        row: rows[0],
        rows,
        flightNumber: group.flightNumber,
        text: `Flugort für ${group.flightNumber} bleibt ${group.location || 'vorhanden'} – Flugprüfung noch offen`
      });
    });

    missingFlightLocations.forEach(group => {
      const rows = [...new Set(group.rows)].sort((a, b) => Number(a) - Number(b));
      issues.push({
        level: 'info',
        kind: 'flight_check',
        row: rows[0],
        rows,
        flightNumber: group.flightNumber,
        text: `Flugort für ${group.flightNumber} fehlt – aktuelle Flugprüfung offen`
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

  function groupOcrLines(words, minConfidence = 18) {
    const usable = (words || []).filter(w => {
      const value = cellText(w.text);
      const conf = Number(w.confidence ?? w.conf ?? 0);
      const normalized = value.replace(/[Oo]/g, '0').replace(/[Il]/g, '1');
      const plausibleTime = /^\d{1,2}[:.]\d{2}$/.test(normalized) || /^\d{3,4}$/.test(normalized.replace(/\D/g, ''));
      // CORE-005A: Farbige Planzeilen koennen einzelne schwach erkannte Woerter liefern.
      // Mit fester Tabellenstruktur ist 18 als Grundschwelle sicherer; Zeitanker duerfen
      // noch etwas schwaecher sein, damit keine komplette Fahrtzeile verschwindet.
      // CORE-007D darf NUR fuer den bereits geometrisch streng validierten
      // kopfzeilenlosen Fallback zusaetzlich einen losen Durchlauf mit minConfidence=0
      // verwenden. Der normale Kopfzeilenpfad bleibt unveraendert streng.
      const floor = Number.isFinite(Number(minConfidence)) ? Number(minConfidence) : 18;
      return value && w.bbox && (conf >= floor || (plausibleTime && conf >= Math.min(10, floor)));
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

  // CORE-005A/005L: Bekannte ATMS-Bildformate besitzen 12 Spalten ohne Preis
  // bzw. 13 Spalten mit Preis. Eine schlecht gelesene Ueberschrift darf nicht mehr
  // dazu fuehren, dass z. B. 'Flug ausg.' verschwindet und alle folgenden Zellen
  // in die falsche Spalte rutschen.
  const ATMS_IMAGE_SCHEMA_12 = [
    { label: 'Uhrzeit', key: 'uhrzeit' },
    { label: 'Von', key: 'von' },
    { label: 'Nach', key: 'nach' },
    { label: 'Name', key: 'name' },
    { label: 'Firma', key: 'firma' },
    { label: 'Flug ang.', key: 'flugang' },
    { label: 'Flug ausg.', key: 'flugausg' },
    { label: 'Wg', key: 'wg' },
    { label: 'Pers', key: 'pers' },
    { label: 'Uhrzeit', key: 'uhrzeit' },
    { label: 'Ort', key: 'ort' },
    { label: 'Wg', key: 'wg' }
  ];

  const ATMS_IMAGE_SCHEMA_13_MIRROR = [
    { label: 'Uhrzeit', key: 'uhrzeit' },
    { label: 'Von', key: 'von' },
    { label: 'Nach', key: 'nach' },
    { label: 'Name', key: 'name' },
    { label: 'Firma', key: 'firma' },
    { label: 'Uhrzeit', key: 'uhrzeit' },
    { label: 'Flug ang.', key: 'flugang' },
    { label: 'Flug ausg.', key: 'flugausg' },
    { label: 'Wg', key: 'wg' },
    { label: 'Pers', key: 'pers' },
    { label: 'Uhrzeit', key: 'uhrzeit' },
    { label: 'Ort', key: 'ort' },
    { label: 'Wg', key: 'wg' }
  ];

  const ATMS_IMAGE_SCHEMA_13_PRICE = [
    { label: 'Preis', key: 'preis' },
    { label: 'Uhrzeit', key: 'uhrzeit' },
    { label: 'Von', key: 'von' },
    { label: 'Nach', key: 'nach' },
    { label: 'Name', key: 'name' },
    { label: 'Firma', key: 'firma' },
    { label: 'Flug ang.', key: 'flugang' },
    { label: 'Flug ausg.', key: 'flugausg' },
    { label: 'Wg', key: 'wg' },
    { label: 'Pers', key: 'pers' },
    { label: 'Uhrzeit', key: 'uhrzeit' },
    { label: 'Ort', key: 'ort' },
    { label: 'Wg', key: 'wg' }
  ];

  const ATMS_IMAGE_SCHEMA_14_PRICE = [
    { label: 'Preis', key: 'preis' },
    { label: 'Uhrzeit', key: 'uhrzeit' },
    { label: 'Von', key: 'von' },
    { label: 'Nach', key: 'nach' },
    { label: 'Name', key: 'name' },
    { label: 'Firma', key: 'firma' },
    { label: 'Uhrzeit', key: 'uhrzeit' },
    { label: 'Flug ang.', key: 'flugang' },
    { label: 'Flug ausg.', key: 'flugausg' },
    { label: 'Wg', key: 'wg' },
    { label: 'Pers', key: 'pers' },
    { label: 'Uhrzeit', key: 'uhrzeit' },
    { label: 'Ort', key: 'ort' },
    { label: 'Wg', key: 'wg' }
  ];

  function chooseAtmsImageSchema(observed) {
    const input = (observed || []).slice().sort((a,b)=>a.x-b.x);
    const hasPrice = input.some(anchor => anchor.key === 'preis' || anchor.key === 'price');
    const timeAnchors = input.filter(anchor => anchor.key === 'uhrzeit' || anchor.key === 'zeit');

    // CORE-006C: Auch Listen OHNE Preis können eine zusätzliche gespiegelte
    // Planzeit direkt nach "Firma" besitzen. Drei erkannte Uhrzeit-Header sind
    // dafür ein starkes, layoutunabhängiges Signal.
    if (!hasPrice && timeAnchors.length >= 3) return ATMS_IMAGE_SCHEMA_13_MIRROR;
    if (hasPrice && timeAnchors.length >= 3) return ATMS_IMAGE_SCHEMA_14_PRICE;

    // Falls genau die mittlere "Uhrzeit" vom OCR fehlt, wird nur bei klarer
    // Kopfzeilen-Geometrie ein Mirror-Schema rekonstruiert.
    const firma = input.find(anchor => anchor.key === 'firma');
    const firstFlight = input.find(anchor => anchor.key === 'flugang' || anchor.key === 'flugausg');
    let mirrorGap = false;
    if (firma && firstFlight && firstFlight.x > firma.x) {
      const gaps = [];
      for (let i = 1; i < input.length; i++) {
        const gap = Number(input[i].x) - Number(input[i - 1].x);
        if (Number.isFinite(gap) && gap > 3) gaps.push(gap);
      }
      const sorted = gaps.slice().sort((a,b)=>a-b);
      const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;
      // Ohne Preis etwas konservativer, damit echte 12-Spalten-Listen nicht
      // wegen einer breiten Firma-Spalte fälschlich erweitert werden.
      const factor = hasPrice ? 1.55 : 1.80;
      mirrorGap = median > 0 && (firstFlight.x - firma.x) >= median * factor;
    }

    if (!hasPrice) return mirrorGap ? ATMS_IMAGE_SCHEMA_13_MIRROR : ATMS_IMAGE_SCHEMA_12;
    return mirrorGap ? ATMS_IMAGE_SCHEMA_14_PRICE : ATMS_IMAGE_SCHEMA_13_PRICE;
  }

  function hasNoPriceMirrorDataEvidence(lines, header) {
    const anchors = (header?.anchors || []).slice().sort((a,b)=>a.x-b.x);
    if (!anchors.length) return false;
    if (anchors.some(anchor => anchor.key === 'preis' || anchor.key === 'price')) return false;

    const firma = anchors.find(anchor => anchor.key === 'firma');
    const firstFlight = anchors.find(anchor => anchor.key === 'flugang' || anchor.key === 'flugausg');
    if (!firma || !firstFlight || !(firstFlight.x > firma.x)) return false;

    const left = Number(firma.x);
    const right = Number(firstFlight.x);
    if (!Number.isFinite(left) || !Number.isFinite(right) || right - left < 8) return false;

    let evidenceRows = 0;
    for (const line of (lines || []).slice((header.index || 0) + 1)) {
      const regionWords = (line.words || []).filter(word => {
        const cx = (Number(word.x0 || 0) + Number(word.x1 || 0)) / 2;
        return cx > left && cx < right;
      });
      if (!regionWords.length) continue;

      const joined = regionWords
        .map(word => cellText(word.text))
        .join('')
        .replace(/[Oo]/g, '0')
        .replace(/[Il]/g, '1');

      const matches = joined.match(/(?:^|\D)([0-2]?\d[:.]?[0-5]\d)(?!\d)/g) || [];
      const plausible = matches.some(token => {
        const digits = token.replace(/\D/g, '');
        if (digits.length < 3 || digits.length > 4) return false;
        const padded = digits.padStart(4, '0');
        const hh = Number(padded.slice(0, 2));
        const mm = Number(padded.slice(2));
        return hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59;
      });

      if (plausible) evidenceRows++;
      if (evidenceRows >= 2) return true;
    }
    return false;
  }

  function completeAtmsImageAnchors(observed, width, forcedSchema = null) {
    const input = (observed || []).slice().sort((a,b)=>a.x-b.x);
    const hasPrice = input.some(anchor => anchor.key === 'preis' || anchor.key === 'price');
    const schema = forcedSchema || chooseAtmsImageSchema(input);
    const slots = Array(schema.length).fill(null);
    let cursor = 0;
    let matched = 0;

    const compatible = (schemaIndex, anchor) => {
      const expected = schema[schemaIndex].key;
      const actual = anchor.key;
      if (expected === actual) return true;
      // Die rechte Fahrer-Spalte ist je nach Planquelle als Wg, Name oder Fahrer
      // beschriftet. Alle drei Varianten sind nur im LETZTEN Schema-Slot kompatibel.
      if (schemaIndex === schema.length - 1 && (actual === 'fahrer' || actual === 'name')) return true;
      return false;
    };

    for (const anchor of input) {
      let hit = -1;
      for (let i = cursor; i < schema.length; i++) {
        if (compatible(i, anchor)) {
          hit = i;
          break;
        }
      }
      if (hit < 0) continue;

      const isDriverSlot = hit === schema.length - 1;
      const preserveDriverHeader = isDriverSlot && (anchor.key === 'name' || anchor.key === 'fahrer');
      slots[hit] = {
        ...anchor,
        label: preserveDriverHeader ? anchor.label : schema[hit].label,
        key: preserveDriverHeader ? anchor.key : schema[hit].key,
        synthetic: false
      };
      cursor = hit + 1;
      matched++;
    }

    // Nur anwenden, wenn die Grundstruktur wirklich erkannt wurde.
    // Bei Preis-Layout muessen Preis/Von/Nach vorhanden sein; ohne Preis Von/Nach.
    const pickupIndex = hasPrice ? 2 : 1;
    const destinationIndex = hasPrice ? 3 : 2;
    const priceOk = !hasPrice || Boolean(slots[0]);
    if (matched < 7 || !slots[pickupIndex] || !slots[destinationIndex] || !priceOk) {
      return { anchors: input, standard: false, syntheticCount: 0 };
    }

    for (let i = 0; i < slots.length; i++) {
      if (slots[i]) continue;

      let left = i - 1;
      while (left >= 0 && !slots[left]) left--;
      let right = i + 1;
      while (right < slots.length && !slots[right]) right++;

      let x;
      if (left >= 0 && right < slots.length) {
        const ratio = (i - left) / (right - left);
        x = slots[left].x + (slots[right].x - slots[left].x) * ratio;
      } else if (right < slots.length) {
        x = slots[right].x * ((i + 1) / (right + 1));
      } else if (left >= 0) {
        x = slots[left].x + (width - slots[left].x) * ((i - left) / (slots.length - left));
      } else {
        x = width * ((i + 0.5) / slots.length);
      }

      slots[i] = {
        label: schema[i].label,
        key: schema[i].key,
        x,
        synthetic: true
      };
    }

    // Monotone X-Positionen erzwingen; niemals Spalten kreuzen.
    for (let i = 1; i < slots.length; i++) {
      if (slots[i].x <= slots[i - 1].x + 2) slots[i].x = slots[i - 1].x + 3;
    }

    return {
      anchors: slots,
      standard: true,
      syntheticCount: slots.filter(anchor => anchor.synthetic).length
    };
  }

  function imageSemanticColumns(anchors) {
    const list = Array.isArray(anchors) ? anchors : [];
    const indexesOf = key => list.map((anchor,index)=>anchor?.key===key?index:-1).filter(index=>index>=0);
    const firstOf = key => {
      const index = list.findIndex(anchor => anchor?.key === key);
      return index >= 0 ? index : undefined;
    };
    const times = indexesOf('uhrzeit');
    const wg = indexesOf('wg');
    const names = indexesOf('name');
    const explicitDriver = firstOf('fahrer');
    const locationIndex = firstOf('ort');
    const rightWgDriver = wg.length >= 2
      ? wg.slice().reverse().find(index => locationIndex === undefined || index > locationIndex)
      : undefined;
    return {
      price: firstOf('preis'),
      rideTime: times.length ? times[0] : undefined,
      timeMirror: times.length >= 3 ? times[1] : undefined,
      flightTime: times.length >= 2 ? times[times.length - 1] : undefined,
      pickup: firstOf('von'),
      destination: firstOf('nach'),
      customer: names.length ? names[0] : undefined,
      company: firstOf('firma'),
      arrivalFlight: firstOf('flugang'),
      departureFlight: firstOf('flugausg'),
      vehicle: wg.length ? wg[0] : undefined,
      persons: firstOf('pers'),
      location: firstOf('ort'),
      driver: explicitDriver !== undefined
        ? explicitDriver
        : (names.length >= 2 ? names[names.length - 1] : rightWgDriver)
    };
  }


  // CORE-007D: Sicherer Fallback fuer Bildausschnitte ohne Kopfzeile.
  // Die normierten Grenzen beschreiben ausschließlich das bereits bekannte
  // 13-Spalten-ATMS-Preislayout. Sie werden NICHT blind verwendet: Zuerst werden
  // mehrere echte Preis-/Zeitanker aus den OCR-Daten bestimmt, die Vorlage daran
  // skaliert und anschließend jede erkannte Datenzeile semantisch gegengeprueft.
  // Bei fehlender/mehrdeutiger Evidenz wird weiterhin abgebrochen.
  const ATMS_HEADERLESS_13_PRICE_BOUNDARY_RATIOS = [
    0.0052083333, 0.06640625, 0.1106770833, 0.263671875,
    0.3984375, 0.48828125, 0.5475260417, 0.611328125,
    0.671875, 0.7180989583, 0.7584635417, 0.822265625,
    0.9296875, 0.9954427083
  ];

  function medianNumber(values) {
    const list = (values || []).map(Number).filter(Number.isFinite).sort((a,b)=>a-b);
    if (!list.length) return null;
    const mid = Math.floor(list.length / 2);
    return list.length % 2 ? list[mid] : (list[mid - 1] + list[mid]) / 2;
  }

  function headerlessPriceLike(value) {
    const text = cellText(value)
      .replace(/[Oo]/g, '0')
      .replace(/\s+/g, '')
      .replace(/€/g, '');
    return /(?:^|\D)\d{1,4}(?:[.,]\d{3})*[.,]\d{2}(?:\D|$)/.test(text);
  }

  function headerlessTimeLike(value) {
    const text = cellText(value).replace(/[Oo]/g, '0').replace(/[Il]/g, '1').trim();
    // Dezimalpreise wie 65,45 duerfen niemals als 06:54/65:45-Zeitanker dienen.
    // Kompaktzeit ist nur zulaessig, wenn der komplette OCR-Token wirklich nur
    // aus 3-4 Ziffern besteht.
    return looksLikeTime(text) || /^\d{3,4}$/.test(text);
  }

  function headerlessLineAnchor(line, predicate, minX = -Infinity, maxX = Infinity) {
    const hits = (line?.words || []).filter(word => {
      const cx = (Number(word.x0 || 0) + Number(word.x1 || 0)) / 2;
      return cx >= minX && cx <= maxX && predicate(word.text);
    });
    if (!hits.length) return null;
    const first = hits[0];
    return (Number(first.x0 || 0) + Number(first.x1 || 0)) / 2;
  }

  function headerlessCellsFromLine(line, boundaries, columnCount) {
    const cells = Array(columnCount).fill('').map(()=>[]);
    (line?.words || []).forEach(word => {
      const cx = (Number(word.x0 || 0) + Number(word.x1 || 0)) / 2;
      let col = boundaries.findIndex((right, i) => i > 0 && cx < right) - 1;
      if (col < 0) col = 0;
      if (col >= cells.length) col = cells.length - 1;
      cells[col].push({ text: cellText(word.text), x0: Number(word.x0 || 0) });
    });
    return cells.map(parts => parts.sort((a,b)=>a.x0-b.x0).map(item=>item.text).join(' ').replace(/\s+/g,' ').trim());
  }

  function headerlessDriverLike(value) {
    const text = cellText(value)
      .replace(/^[^A-Za-zÄÖÜäöüßÀ-ÿ]+|[^A-Za-zÄÖÜäöüßÀ-ÿ]+$/g, '')
      .trim();
    if (!text) return false;
    // In der echten Fahrer-Spalte ist auch der operative Wert "Taxi" erlaubt.
    if (/^taxi$/i.test(text)) return true;
    return /^[A-Za-zÄÖÜäöüßÀ-ÿ][A-Za-zÄÖÜäöüßÀ-ÿ\- ]{1,39}$/.test(text);
  }

  function headerlessTextLike(value, minLetters = 2) {
    const text = cellText(value).replace(/\s+/g, ' ').trim();
    if (!text) return false;
    const letters = (text.match(/[A-Za-zÄÖÜäöüßÀ-ÿ]/g) || []).length;
    return letters >= minLetters;
  }

  function headerlessCoreRowCheck(row) {
    if (!Array.isArray(row) || row.length < ATMS_IMAGE_SCHEMA_13_PRICE.length) {
      return { ok: false, flight: false, fields: {} };
    }

    const priceRaw = cellText(row[0]);
    const timeRaw = cellText(row[1]).replace(/[Oo]/g, '0').replace(/[Il]/g, '1');
    const pickup = cellText(row[2]);
    const destination = cellText(row[3]);
    const customer = cellText(row[4]);
    const company = cellText(row[5]);
    const arrival = normalizeFlightNumber(row[6]);
    const departure = normalizeFlightNumber(row[7]);
    const vehicle = cellText(row[8]);
    const persons = parseNumber(row[9]);
    const driver = cellText(row[12]);

    const fields = {
      price: headerlessPriceLike(priceRaw) && parseNumber(priceRaw) > 0,
      time: headerlessTimeLike(timeRaw) && Boolean(normalizeTime(timeRaw)),
      pickup: headerlessTextLike(pickup),
      destination: headerlessTextLike(destination),
      customer: headerlessTextLike(customer),
      company: headerlessTextLike(company),
      vehicle: Boolean(vehicle && !/^\d+(?:[.,]\d+)?$/.test(vehicle) && headerlessTextLike(vehicle, 2)),
      persons: Number.isFinite(persons) && persons >= 1 && persons <= 99,
      driver: headerlessDriverLike(driver)
    };
    const flight = Boolean(arrival || departure);

    // Falls eine Flugnummer erkannt wurde, darf sie nur in genau einer der beiden
    // benachbarten Flugspalten stehen. Richtung/Flughafen wird spaeter weiterhin
    // aus den echten Routendaten bestimmt; hier wird nichts geraten.
    const flightColumnsOk = !(arrival && departure);
    const coreOk = Object.values(fields).every(Boolean);

    return {
      ok: coreOk && flightColumnsOk,
      flight,
      flightColumnsOk,
      fields
    };
  }

  function headerlessRecurringColumnEvidence(lines, boundaries) {
    const columnCount = Math.max(0, (boundaries || []).length - 1);
    if (!Array.isArray(lines) || lines.length < 2 || columnCount !== ATMS_IMAGE_SCHEMA_13_PRICE.length) {
      return { safe: false, rowCount: 0, counts: [], stableColumns: 0 };
    }

    const counts = Array(columnCount).fill(0);
    let usableRows = 0;
    let leftAnchoredRows = 0;
    let routeRows = 0;
    let rightRows = 0;
    let flightRows = 0;

    lines.forEach(line => {
      const words = Array.isArray(line?.words) ? line.words : [];
      if (words.length < 4) return;
      const occupied = Array(columnCount).fill(false);
      words.forEach(word => {
        const cx = (Number(word.x0 || 0) + Number(word.x1 || 0)) / 2;
        if (!Number.isFinite(cx)) return;
        let col = boundaries.findIndex((right, index) => index > 0 && cx < right) - 1;
        if (col < 0) col = 0;
        if (col >= columnCount) col = columnCount - 1;
        occupied[col] = true;
      });

      const occupiedCount = occupied.filter(Boolean).length;
      if (occupiedCount < 4) return;
      usableRows++;
      occupied.forEach((value, index) => { if (value) counts[index]++; });

      if (occupied[0] && occupied[1]) leftAnchoredRows++;
      if (occupied[2] && occupied[3]) routeRows++;
      if (occupied[12]) rightRows++;
      if (occupied[6] || occupied[7]) flightRows++;
    });

    if (usableRows < 2) return { safe: false, rowCount: usableRows, counts, stableColumns: 0 };

    const majority = Math.max(2, Math.ceil(usableRows * 0.60));
    const half = Math.max(2, Math.ceil(usableRows * 0.50));
    const stableColumns = counts.filter(count => count >= half).length;

    // Sicherheitsprinzip: Nicht ein einzelner Wert beweist das Layout, sondern
    // mehrere Zeilen muessen dieselben X-Korridore wiederholen. Preis+Zeit links,
    // Von+Nach in der Mitte sowie Fahrer rechts sind dabei Pflicht. Flugspalten
    // muessen bei mindestens zwei Zeilen belegt sein. Leere Ort-/Spiegelzeit-Zellen
    // sind ausdruecklich erlaubt und zaehlen nicht gegen das Layout.
    const safe =
      leftAnchoredRows >= majority &&
      routeRows >= majority &&
      rightRows >= half &&
      flightRows >= Math.min(2, usableRows) &&
      counts[4] >= half &&
      counts[5] >= half &&
      counts[8] >= half &&
      stableColumns >= 8;

    return {
      safe,
      rowCount: usableRows,
      counts,
      stableColumns,
      majority,
      leftAnchoredRows,
      routeRows,
      rightRows,
      flightRows
    };
  }

  function inferHeaderlessAtmsPriceLayout(lines, width, diagnostics = null) {
    // CORE-007D3: Reine Diagnoseinstrumentierung. Jede bisherige Ja/Nein-
    // Entscheidung bleibt unverändert; bei einem Abbruch wird nur dokumentiert,
    // welche Sicherheitsstufe abgelehnt hat.
    const diag = diagnostics && typeof diagnostics === 'object' ? diagnostics : {};
    const reject = (reason, extra = {}) => {
      Object.assign(diag, extra, { accepted: false, rejectReason: reason });
      return null;
    };

    const usableLines = (lines || []).filter(line => (line?.words || []).length >= 4);
    Object.assign(diag, {
      inputLines: Array.isArray(lines) ? lines.length : 0,
      usableLines: usableLines.length,
      width: Number(width) || 0
    });
    if (usableLines.length < 2 || !Number.isFinite(Number(width)) || Number(width) < 500) {
      return reject('insufficient_usable_lines_or_width');
    }

    const priceCenters = [];
    const timeCenters = [];
    const priceLines = new Set();
    const timeLines = new Set();

    usableLines.forEach((line, index) => {
      const priceX = headerlessLineAnchor(line, headerlessPriceLike, 0, width * 0.16);
      const timeX = headerlessLineAnchor(line, headerlessTimeLike, 0, width * 0.24);
      if (Number.isFinite(priceX)) {
        priceCenters.push(priceX);
        priceLines.add(index);
      }
      if (Number.isFinite(timeX)) {
        timeCenters.push(timeX);
        timeLines.add(index);
      }
    });

    Object.assign(diag, {
      priceAnchors: priceCenters.length,
      timeAnchors: timeCenters.length
    });

    // CORE-007D2-Entscheidung bleibt unveraendert.
    if (priceCenters.length < 2 || timeCenters.length < 2) {
      return reject('insufficient_price_or_time_anchors');
    }

    const observedPrice = medianNumber(priceCenters);
    const observedTime = medianNumber(timeCenters);
    Object.assign(diag, { observedPrice, observedTime });
    if (!Number.isFinite(observedPrice) || !Number.isFinite(observedTime) || observedTime <= observedPrice) {
      return reject('invalid_anchor_medians');
    }

    const templatePriceCenter = (ATMS_HEADERLESS_13_PRICE_BOUNDARY_RATIOS[0] + ATMS_HEADERLESS_13_PRICE_BOUNDARY_RATIOS[1]) / 2;
    const templateTimeCenter = (ATMS_HEADERLESS_13_PRICE_BOUNDARY_RATIOS[1] + ATMS_HEADERLESS_13_PRICE_BOUNDARY_RATIOS[2]) / 2;

    const scalePx = width;
    const offsetPx = observedTime - scalePx * templateTimeCenter;
    const expectedPrice = offsetPx + scalePx * templatePriceCenter;
    Object.assign(diag, { offsetPx, expectedPrice, priceDeviationPx: Math.abs(observedPrice - expectedPrice) });
    if (!Number.isFinite(offsetPx) || Math.abs(offsetPx) > width * 0.05) {
      return reject('template_offset_out_of_range');
    }
    if (Math.abs(observedPrice - expectedPrice) > width * 0.04) {
      return reject('price_anchor_not_matching_template');
    }

    const boundaries = ATMS_HEADERLESS_13_PRICE_BOUNDARY_RATIOS.map(ratio => offsetPx + scalePx * ratio);
    if (boundaries.some((value,index) => !Number.isFinite(value) || (index && value <= boundaries[index - 1]))) {
      return reject('invalid_column_boundaries');
    }
    if (boundaries[0] < -width * 0.04 || boundaries[0] > width * 0.07) {
      return reject('left_boundary_out_of_range', { firstBoundary: boundaries[0] });
    }
    if (boundaries[boundaries.length - 1] < width * 0.91 || boundaries[boundaries.length - 1] > width * 1.05) {
      return reject('right_boundary_out_of_range', { lastBoundary: boundaries[boundaries.length - 1] });
    }

    // CORE-007D2-Entscheidung bleibt unveraendert.
    const candidateLines = usableLines.filter((line, index) => {
      if (!priceLines.has(index) && !timeLines.has(index)) return false;
      const words = line?.words || [];
      if (!words.length) return false;
      const xs0 = words.map(word => Number(word.x0 || 0)).filter(Number.isFinite);
      const xs1 = words.map(word => Number(word.x1 || 0)).filter(Number.isFinite);
      if (!xs0.length || !xs1.length) return false;
      const minX = Math.min(...xs0);
      const maxX = Math.max(...xs1);
      return minX <= width * 0.20 && maxX >= width * 0.45;
    });
    diag.candidateLines = candidateLines.length;
    if (candidateLines.length < 2) return reject('insufficient_candidate_lines');

    const semanticRows = [];
    candidateLines.forEach(line => {
      const row = headerlessCellsFromLine(line, boundaries, ATMS_IMAGE_SCHEMA_13_PRICE.length);
      const check = headerlessCoreRowCheck(row);
      semanticRows.push({ line, row, check });
    });

    const required = Math.max(2, Math.ceil(candidateLines.length * 0.75));
    const verifiedRows = semanticRows.filter(item => item.check.ok);
    const semanticValidated = verifiedRows.length >= required && verifiedRows.some(item => item.check.flight);

    const recurring = headerlessRecurringColumnEvidence(candidateLines, boundaries);
    Object.assign(diag, {
      verifiedRows: verifiedRows.length,
      requiredRows: required,
      semanticValidated,
      recurringSafe: Boolean(recurring.safe),
      recurringRowCount: Number(recurring.rowCount || 0),
      stableColumns: Number(recurring.stableColumns || 0),
      leftAnchoredRows: Number(recurring.leftAnchoredRows || 0),
      routeRows: Number(recurring.routeRows || 0),
      rightRows: Number(recurring.rightRows || 0),
      flightRows: Number(recurring.flightRows || 0)
    });
    if (!semanticValidated && !recurring.safe) {
      return reject('semantic_and_recurring_validation_failed');
    }

    const anchors = ATMS_IMAGE_SCHEMA_13_PRICE.map((slot,index) => ({
      label: slot.label,
      key: slot.key,
      x: (boundaries[index] + boundaries[index + 1]) / 2,
      synthetic: true,
      headerless: true
    }));

    Object.assign(diag, { accepted: true, rejectReason: '' });
    return {
      anchors,
      boundaries,
      semantic: imageSemanticColumns(anchors),
      lines: candidateLines,
      standard: true,
      syntheticCount: anchors.length,
      headerlessAtms: true,
      needsCellRecovery: !semanticValidated,
      diagnostics: diag,
      validation: {
        anchoredRows: candidateLines.length,
        verifiedRows: verifiedRows.length,
        requiredRows: required,
        semanticValidated,
        recurring
      }
    };
  }

  function formatHeaderlessOcrDiagnostic(diag) {
    if (!diag || typeof diag !== 'object') return 'CORE-007D5 Diagnose: Grund=unknown';
    const num = value => Number.isFinite(Number(value)) ? Math.round(Number(value) * 10) / 10 : 0;
    const parts = [
      `Grund=${cellText(diag.rejectReason) || 'unknown'}`,
      `OCR-Zeilen=${num(diag.usableLines)}/${num(diag.inputLines)}`,
      `Preisanker=${num(diag.priceAnchors)}`,
      `Zeitanker=${num(diag.timeAnchors)}`
    ];
    if (diag.candidateLines !== undefined) parts.push(`Kandidaten=${num(diag.candidateLines)}`);
    if (diag.verifiedRows !== undefined) parts.push(`Verifiziert=${num(diag.verifiedRows)}/${num(diag.requiredRows)}`);
    if (diag.stableColumns !== undefined) parts.push(`StabileSpalten=${num(diag.stableColumns)}`);
    if (diag.recurringRowCount !== undefined) {
      parts.push(`X=${num(diag.leftAnchoredRows)}/${num(diag.routeRows)}/${num(diag.rightRows)}/${num(diag.flightRows)}`);
    }
    if (diag.priceAnchorRecovery) {
      const rec = diag.priceAnchorRecovery;
      parts.push(`PreisNachlese=${num(rec.recoveredRows)}/${num(rec.attemptedRows)}`);
    }
    return `CORE-007D5 Diagnose: ${parts.join(' · ')}`;
  }

  let headerlessPriceAnchorRecoveryDiagnostic = null;

  function prepareHeaderlessPriceCrop(sourceCanvas, threshold = null, contrast = 1.0) {
    if (!sourceCanvas || threshold === null || threshold === undefined || !Number.isFinite(Number(threshold))) return sourceCanvas;
    const out = document.createElement('canvas');
    out.width = sourceCanvas.width;
    out.height = sourceCanvas.height;
    const ctx = out.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(sourceCanvas, 0, 0);
    const image = ctx.getImageData(0, 0, out.width, out.height);
    const data = image.data;
    const t = Math.max(80, Math.min(235, Number(threshold)));
    const c = Math.max(0.7, Math.min(1.8, Number(contrast) || 1));
    for (let i = 0; i < data.length; i += 4) {
      let gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      gray = 128 + (gray - 128) * c;
      const value = gray < t ? 0 : 255;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
    return out;
  }

  async function recoverHeaderlessPriceAnchorsTargeted(words, imageCanvas, width) {
    headerlessPriceAnchorRecoveryDiagnostic = {
      attemptedRows: 0,
      recoveredRows: 0,
      skipped: '',
      recovered: [],
      strategy: 'price_cell_consensus_v2'
    };

    if (!Array.isArray(words) || !imageCanvas || !window.Tesseract || !Number.isFinite(Number(width)) || Number(width) < 500) {
      headerlessPriceAnchorRecoveryDiagnostic.skipped = 'missing_words_canvas_or_width';
      return words;
    }

    const strictLines = groupOcrLines(words);
    const header = detectImageHeaderLine(strictLines);
    const hasSafeHeader = Boolean(header && header.score >= 6 && header.anchors.length >= 6);
    if (hasSafeHeader) {
      headerlessPriceAnchorRecoveryDiagnostic.skipped = 'safe_header_present';
      return words;
    }

    const lines = groupOcrLines(words, 0).filter(line => (line?.words || []).length >= 4);
    if (lines.length < 2) {
      headerlessPriceAnchorRecoveryDiagnostic.skipped = 'insufficient_lines';
      return words;
    }

    const existingPriceAnchors = lines.filter(line =>
      Number.isFinite(headerlessLineAnchor(line, headerlessPriceLike, 0, width * 0.16))
    ).length;
    const timeAnchoredLines = lines.map((line, index) => ({
      line,
      index,
      timeX: headerlessLineAnchor(line, headerlessTimeLike, 0, width * 0.24),
      hasPrice: Number.isFinite(headerlessLineAnchor(line, headerlessPriceLike, 0, width * 0.16))
    })).filter(item => Number.isFinite(item.timeX));

    headerlessPriceAnchorRecoveryDiagnostic.existingPriceAnchors = existingPriceAnchors;
    headerlessPriceAnchorRecoveryDiagnostic.timeAnchors = timeAnchoredLines.length;

    if (existingPriceAnchors >= 2) {
      headerlessPriceAnchorRecoveryDiagnostic.skipped = 'enough_existing_price_anchors';
      return words;
    }
    if (timeAnchoredLines.length < 2) {
      headerlessPriceAnchorRecoveryDiagnostic.skipped = 'insufficient_time_anchors';
      return words;
    }

    const templatePriceCenter = (ATMS_HEADERLESS_13_PRICE_BOUNDARY_RATIOS[0] + ATMS_HEADERLESS_13_PRICE_BOUNDARY_RATIOS[1]) / 2;
    const templateTimeCenter = (ATMS_HEADERLESS_13_PRICE_BOUNDARY_RATIOS[1] + ATMS_HEADERLESS_13_PRICE_BOUNDARY_RATIOS[2]) / 2;
    const augmented = words.slice();

    for (const item of timeAnchoredLines) {
      if (item.hasPrice) continue;

      const offsetPx = item.timeX - width * templateTimeCenter;
      if (!Number.isFinite(offsetPx) || Math.abs(offsetPx) > width * 0.05) continue;

      const left = offsetPx + width * ATMS_HEADERLESS_13_PRICE_BOUNDARY_RATIOS[0];
      const right = offsetPx + width * ATMS_HEADERLESS_13_PRICE_BOUNDARY_RATIOS[1];
      if (!Number.isFinite(left) || !Number.isFinite(right) || right <= left) continue;
      if (left < -width * 0.04 || right > width * 0.18) continue;

      const lineWords = item.line?.words || [];
      const y0s = lineWords.map(word => Number(word.y0)).filter(Number.isFinite);
      const y1s = lineWords.map(word => Number(word.y1)).filter(Number.isFinite);
      if (!y0s.length || !y1s.length) continue;
      const rowY0 = Math.min(...y0s);
      const rowY1 = Math.max(...y1s);
      const rowHeight = Math.max(12, rowY1 - rowY0);
      const cellWidth = Math.max(20, right - left);

      // CORE-007D5: mehrere bewusst unterschiedliche Innenausschnitte der
      // Preiszelle. Zellrahmen/Eurozeichen werden teilweise abgeschnitten und
      // farbige Schrift wird in mehreren Schwellenvarianten kontrastiert.
      // Es wird weiterhin NUR ein explizit dezimal erkanntes Ergebnis akzeptiert.
      const attemptsSpec = [
        { id: 'raw-wide',     insetL: 0.02, insetR: 0.04, padY: 0.18, scale: 3, mode: '7', threshold: null, contrast: 1.0 },
        { id: 'raw-inner',    insetL: 0.04, insetR: 0.14, padY: 0.12, scale: 4, mode: '7', threshold: null, contrast: 1.0 },
        { id: 'bw165-inner',  insetL: 0.04, insetR: 0.14, padY: 0.12, scale: 4, mode: '7', threshold: 165, contrast: 1.15 },
        { id: 'bw185-inner',  insetL: 0.03, insetR: 0.12, padY: 0.15, scale: 4, mode: '7', threshold: 185, contrast: 1.10 },
        { id: 'bw205-tight',  insetL: 0.06, insetR: 0.16, padY: 0.08, scale: 5, mode: '7', threshold: 205, contrast: 1.05 },
        { id: 'bw185-single', insetL: 0.03, insetR: 0.12, padY: 0.12, scale: 4, mode: '13', threshold: 185, contrast: 1.10 }
      ];
      const votes = new Map();
      const attempts = [];

      headerlessPriceAnchorRecoveryDiagnostic.attemptedRows++;

      for (const spec of attemptsSpec) {
        const x0 = left + cellWidth * spec.insetL;
        const x1 = right - cellWidth * spec.insetR;
        const py = rowHeight * spec.padY;
        if (!(x1 > x0 + 8)) {
          attempts.push({ id: spec.id, candidate: null, skipped: 'crop_too_narrow' });
          continue;
        }
        const rawCrop = cropCanvasRegion(
          imageCanvas,
          Math.max(0, x0),
          Math.max(0, rowY0 - py),
          Math.min(imageCanvas.width, x1),
          Math.min(imageCanvas.height, rowY1 + py),
          spec.scale
        );
        const crop = spec.threshold !== null && spec.threshold !== undefined && Number.isFinite(Number(spec.threshold))
          ? prepareHeaderlessPriceCrop(rawCrop, spec.threshold, spec.contrast)
          : rawCrop;
        try {
          const result = await Tesseract.recognize(crop, 'eng', {
            tessedit_pageseg_mode: spec.mode,
            tessedit_char_whitelist: '0123456789,.'
          });
          const candidates = priceCandidatesFromOcrResult(result);
          const candidate = candidates.length === 1 ? candidates[0] : null;
          attempts.push({ id: spec.id, candidate });
          if (!Number.isFinite(candidate)) continue;
          const key = (Math.round(candidate * 100) / 100).toFixed(2);
          votes.set(key, (votes.get(key) || 0) + 1);
        } catch (_) {
          attempts.push({ id: spec.id, candidate: null, error: true });
        }
      }

      const ranked = [...votes.entries()].sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0]));
      const winner = ranked[0] || null;
      const runner = ranked[1] || null;
      if (!winner || winner[1] < 2 || (runner && runner[1] === winner[1])) {
        headerlessPriceAnchorRecoveryDiagnostic.recovered.push({ row: item.index, accepted: false, attempts });
        continue;
      }

      const value = Number(winner[0]);
      if (!Number.isFinite(value) || value <= 0 || pricePlausibility(value).suspicious) {
        headerlessPriceAnchorRecoveryDiagnostic.recovered.push({ row: item.index, accepted: false, attempts });
        continue;
      }

      const priceCenter = offsetPx + width * templatePriceCenter;
      const syntheticWidth = Math.max(20, (right - left) * 0.55);
      augmented.push({
        text: `${value.toFixed(2).replace('.', ',')} €`,
        confidence: 99,
        bbox: {
          x0: Math.max(0, priceCenter - syntheticWidth / 2),
          x1: Math.min(width, priceCenter + syntheticWidth / 2),
          y0: rowY0,
          y1: rowY1
        },
        _atmsHeaderlessRecoveredPriceAnchor: true,
        _atmsHeaderlessPriceConsensusVersion: 'CORE-007D5'
      });
      headerlessPriceAnchorRecoveryDiagnostic.recoveredRows++;
      headerlessPriceAnchorRecoveryDiagnostic.recovered.push({
        row: item.index,
        accepted: true,
        value,
        votes: winner[1],
        attempts
      });
    }

    return augmented;
  }

  function imageWordsToMatrix(words, width) {
    const lines = groupOcrLines(words);
    const header = detectImageHeaderLine(lines);
    const hasSafeHeader = Boolean(header && header.score >= 6 && header.anchors.length >= 6);
    // Nur wenn die normale sichere Kopfzeilenerkennung scheitert, wird ein zweiter
    // OCR-Zeilensatz mit niedrigerer Wort-Konfidenz fuer die Headerless-Geometrie
    // aufgebaut. Akzeptiert wird er erst nach der strengen Mehrzeilenvalidierung.
    const headerlessLines = hasSafeHeader ? null : groupOcrLines(words, 0);
    const headerlessDiagnostic = hasSafeHeader ? null : {
      version: 'CORE-007D5',
      headerScore: Number(header?.score || 0),
      headerAnchors: Number(header?.anchors?.length || 0),
      wordCount: Array.isArray(words) ? words.length : 0,
      priceAnchorRecovery: headerlessPriceAnchorRecoveryDiagnostic ? { ...headerlessPriceAnchorRecoveryDiagnostic } : null
    };
    const headerlessLayout = hasSafeHeader ? null : inferHeaderlessAtmsPriceLayout(headerlessLines, width, headerlessDiagnostic);

    if (!hasSafeHeader && !headerlessLayout) {
      throw new Error(`Die Spaltenüberschriften im Bild konnten nicht sicher erkannt werden und der Ausschnitt ohne Kopfzeile war geometrisch nicht eindeutig genug. ${formatHeaderlessOcrDiagnostic(headerlessDiagnostic)} Bitte vollständige Kopfzeile mit hochladen.`);
    }

    const forceNoPriceMirror = hasSafeHeader ? hasNoPriceMirrorDataEvidence(lines, header) : false;
    const completed = hasSafeHeader
      ? completeAtmsImageAnchors(
          header.anchors,
          width,
          forceNoPriceMirror ? ATMS_IMAGE_SCHEMA_13_MIRROR : null
        )
      : {
          anchors: headerlessLayout.anchors,
          standard: true,
          syntheticCount: headerlessLayout.syntheticCount
        };
    const layout = hasSafeHeader
      ? anchorsToBoundaries(completed.anchors, width)
      : { sorted: headerlessLayout.anchors, boundaries: headerlessLayout.boundaries };
    const anchors = layout.sorted;
    const boundaries = layout.boundaries;
    const semantic = imageSemanticColumns(anchors);
    const headerRow = anchors.map(anchor => anchor.label);
    const rows = [headerRow];
    const rowMetaByMatrixIndex = {};
    const dataLines = hasSafeHeader ? lines.slice(header.index + 1) : headerlessLayout.lines;

    dataLines.forEach(line => {
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

      const rideTimeIndex = semantic.rideTime;
      const rideTimeRaw = rideTimeIndex === undefined ? '' : cellText(row[rideTimeIndex]);
      const rideTimeNormalized = rideTimeRaw.replace(/[Oo]/g, '0').replace(/[Il]/g, '1');
      const rideTimeValid = looksLikeTime(rideTimeNormalized) || /^\d{3,4}$/.test(rideTimeNormalized.replace(/\D/g,''));

      const secondaryTimes = [semantic.timeMirror, semantic.flightTime]
        .filter(index => index !== undefined && index !== rideTimeIndex);
      const secondaryTimeValid = secondaryTimes.some(index => {
        const raw = cellText(row[index]);
        const normalized = raw.replace(/[Oo]/g, '0').replace(/[Il]/g, '1');
        return looksLikeTime(normalized) || /^\d{3,4}$/.test(normalized.replace(/\D/g,''));
      });

      const hasTime = row.some(value => looksLikeTime(value) || /^\d{3,4}$/.test(cellText(value).replace(/\D/g,'')));
      const hasFlight = [semantic.arrivalFlight, semantic.departureFlight]
        .filter(index => index !== undefined)
        .some(index => looksLikeFlight(row[index]));
      const hasRoute = Boolean(
        semantic.pickup !== undefined &&
        semantic.destination !== undefined &&
        cellText(row[semantic.pickup]) &&
        cellText(row[semantic.destination])
      );
      const hasIdentity = [semantic.customer, semantic.company, semantic.driver]
        .filter(index => index !== undefined)
        .some(index => Boolean(cellText(row[index])));
      const hasFlightCells = [semantic.arrivalFlight, semantic.departureFlight]
        .filter(index => index !== undefined)
        .some(index => Boolean(cellText(row[index])));
      const strongOrphanRow = hasRoute && hasIdentity && nonEmpty >= 5 &&
        (secondaryTimeValid || hasFlight || hasFlightCells);

      // CORE-005B/006B: Planzeit dynamisch aus der Kopfzeile bestimmen.
      // Eine Preis-Spalte vor der Planzeit verändert den Zeilenanker nicht.
      const keep = completed.standard
        ? ((rideTimeValid && nonEmpty >= 2) || strongOrphanRow)
        : (nonEmpty >= 3 && (hasTime || hasFlight));

      if (!keep) return;

      if (completed.standard && rideTimeValid && rideTimeIndex !== undefined &&
          rideTimeNormalized !== rideTimeRaw) {
        row[rideTimeIndex] = rideTimeNormalized;
      }

      rows.push(row);
      const ys0 = (line.words || []).map(word => Number(word.y0 || 0)).filter(Number.isFinite);
      const ys1 = (line.words || []).map(word => Number(word.y1 || 0)).filter(Number.isFinite);
      rowMetaByMatrixIndex[rows.length - 1] = {
        y0: ys0.length ? Math.min(...ys0) : Math.max(0, Number(line.cy || 0) - 16),
        y1: ys1.length ? Math.max(...ys1) : Number(line.cy || 0) + 16,
        cy: Number(line.cy || 0)
      };
    });

    // CORE-005C: Wenn Tesseract eine komplette physische Tabellenzeile gar nicht
    // als brauchbare OCR-Zeile liefert, kann CORE-005B sie nicht als "orphan row"
    // retten. Deshalb pruefen wir die vertikalen Abstaende der bereits erkannten
    // Tabellenzeilen. Ein annähernd doppelter Abstand bedeutet sehr wahrscheinlich,
    // dass dazwischen genau eine physische Zeile fehlt. Diese wird als leere
    // synthetische Tabellenzeile eingefuegt und anschliessend NUR in diesem schmalen
    // Bereich lokal erneut OCR-gelesen. Keine feste Fahrtenanzahl und keine
    // Sonderregel fuer 05:05/EW9782/FreeNow.
    if (completed.standard && rows.length >= 5) {
      const records = [];
      for (let matrixIndex = 1; matrixIndex < rows.length; matrixIndex++) {
        const meta = rowMetaByMatrixIndex[matrixIndex];
        if (!meta) continue;
        records.push({ row: rows[matrixIndex], meta: { ...meta } });
      }

      const positiveGaps = [];
      for (let i = 1; i < records.length; i++) {
        const gap = Number(records[i].meta.cy) - Number(records[i - 1].meta.cy);
        if (Number.isFinite(gap) && gap > 4) positiveGaps.push(gap);
      }

      if (positiveGaps.length >= 3) {
        const sortedGaps = positiveGaps.slice().sort((a, b) => a - b);
        // Oberes Viertel bewusst ausblenden, damit bereits vorhandene grosse Luecken
        // die normale Zeilenhoehe nicht nach oben ziehen.
        const basePool = sortedGaps.slice(0, Math.max(3, Math.ceil(sortedGaps.length * 0.75)));
        const medianGap = basePool[Math.floor(basePool.length / 2)];

        if (Number.isFinite(medianGap) && medianGap > 6) {
          const expanded = [];
          for (let i = 0; i < records.length; i++) {
            const current = records[i];
            expanded.push(current);
            if (i >= records.length - 1) continue;

            const next = records[i + 1];
            const gap = Number(next.meta.cy) - Number(current.meta.cy);
            const estimatedMissing = Math.round(gap / medianGap) - 1;

            // Nur klar erkennbare 1-2 fehlende physische Zeilen einsetzen.
            // So reagieren wir nicht auf kleine OCR-Schwankungen.
            if (estimatedMissing < 1 || estimatedMissing > 2) continue;
            const ratio = gap / medianGap;
            if (ratio < 1.55 || ratio > 3.35) continue;

            for (let missing = 1; missing <= estimatedMissing; missing++) {
              const cy = Number(current.meta.cy) + (gap * missing) / (estimatedMissing + 1);
              const halfBand = Math.max(8, medianGap * 0.38);
              expanded.push({
                row: Array(anchors.length).fill(''),
                meta: {
                  y0: cy - halfBand,
                  y1: cy + halfBand,
                  cy,
                  syntheticGap: true
                }
              });
            }
          }

          if (expanded.length > records.length) {
            rows.length = 1;
            Object.keys(rowMetaByMatrixIndex).forEach(key => delete rowMetaByMatrixIndex[key]);
            expanded.forEach(record => {
              rows.push(record.row);
              rowMetaByMatrixIndex[rows.length - 1] = record.meta;
            });
          }
        }
      }
    }

    rows._atmsImageMeta = {
      anchors,
      boundaries,
      semantic,
      rowMetaByMatrixIndex,
      width,
      standardAtms: completed.standard,
      schemaColumns: anchors.length,
      forcedNoPriceMirror: Boolean(forceNoPriceMirror),
      syntheticAnchorCount: completed.syntheticCount,
      headerlessAtms: Boolean(headerlessLayout?.headerlessAtms),
      headerlessNeedsCellRecovery: Boolean(headerlessLayout?.needsCellRecovery),
      headerlessValidation: headerlessLayout?.validation || null,
      headerlessDiagnostic: headerlessLayout?.diagnostics || headerlessDiagnostic || null
    };
    return rows;
  }

  // CORE-004G · 05.09.2026: zweite, rein lokale OCR nur für die konkrete
  // Flugzelle, wenn Ort vorhanden ist, aber die erste OCR keine Flugnummer geliefert hat.
  // Es wird niemals geraten: nur genau EIN formal plausibler Kandidat wird übernommen
  // und anschließend als manuell/aktuell zu prüfen markiert.
  function cropCanvasRegion(source, x0, y0, x1, y1, scale = 3) {
    const sx = Math.max(0, Math.floor(x0));
    const sy = Math.max(0, Math.floor(y0));
    const sw = Math.max(1, Math.min(source.width - sx, Math.ceil(x1 - x0)));
    const sh = Math.max(1, Math.min(source.height - sy, Math.ceil(y1 - y0)));
    const out = document.createElement('canvas');
    out.width = Math.max(1, Math.round(sw * scale));
    out.height = Math.max(1, Math.round(sh * scale));
    const ctx = out.getContext('2d', { willReadFrequently: true });
    ctx.imageSmoothingEnabled = scale > 1;
    if (scale > 1 && 'imageSmoothingQuality' in ctx) ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, sx, sy, sw, sh, 0, 0, out.width, out.height);
    return out;
  }


  function headerlessCellFieldForColumn(column) {
    const map = {
      0: 'price', 1: 'time', 2: 'pickup', 3: 'destination',
      4: 'customer', 5: 'company', 6: 'arrivalFlight', 7: 'departureFlight',
      8: 'vehicle', 9: 'persons', 12: 'driver'
    };
    return map[column] || '';
  }

  function headerlessCellCandidateFromResult(result, field) {
    const rawText = cellText(result?.data?.text).replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();

    if (field === 'price') {
      const candidates = priceCandidatesFromOcrResult(result);
      if (candidates.length !== 1) return '';
      return `${Number(candidates[0]).toFixed(2).replace('.', ',')} €`;
    }

    if (field === 'time') {
      const candidates = rideTimeCandidatesFromOcrResult(result);
      return candidates.length === 1 ? candidates[0] : '';
    }

    if (field === 'persons') {
      const tokens = rawText.replace(/[Oo]/g, '0').match(/\d{1,2}/g) || [];
      const values = [...new Set(tokens.map(Number).filter(value => Number.isInteger(value) && value >= 1 && value <= 99))];
      return values.length === 1 ? String(values[0]) : '';
    }

    if (field === 'arrivalFlight' || field === 'departureFlight') {
      const candidates = [...new Set(flightCandidatesFromOcrResult(result).map(normalizeFlightNumber).filter(Boolean))];
      return candidates.length === 1 ? candidates[0] : '';
    }

    const text = rawText
      .replace(/^[|:;,.]+/, '')
      .replace(/[|:;,.]+$/, '')
      .trim();
    if (!text) return '';

    if (field === 'driver') return headerlessDriverLike(text) ? text : '';
    if (field === 'vehicle') {
      return headerlessTextLike(text, 2) && !/^\d+(?:[.,]\d+)?$/.test(text) ? text : '';
    }
    if (['pickup','destination','customer','company'].includes(field)) {
      return headerlessTextLike(text, 2) ? text : '';
    }
    return '';
  }

  function headerlessCellCandidateKey(value, field) {
    if (!value) return '';
    if (field === 'price') return Number(parseNumber(value)).toFixed(2);
    if (field === 'time') return normalizeTime(value);
    if (field === 'persons') return String(Math.round(parseNumber(value)));
    if (field === 'arrivalFlight' || field === 'departureFlight') return normalizeFlightNumber(value);
    return cleanKey(value);
  }

  function headerlessOcrOptions(field, mode) {
    const options = { tessedit_pageseg_mode: mode };
    if (field === 'time') options.tessedit_char_whitelist = '0123456789:.';
    if (field === 'persons') options.tessedit_char_whitelist = '0123456789';
    if (field === 'arrivalFlight' || field === 'departureFlight') options.tessedit_char_whitelist = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return options;
  }

  async function recoverHeaderlessCellConsensus(imageCanvas, imageMeta, rowMeta, column, field) {
    const boundaries = imageMeta?.boundaries || [];
    const left = Number(boundaries[column]);
    const right = Number(boundaries[column + 1]);
    const y0 = Number(rowMeta?.y0);
    const y1 = Number(rowMeta?.y1);
    if (![left, right, y0, y1].every(Number.isFinite) || right <= left || y1 <= y0) {
      return { value: '', attempts: [] };
    }

    const rowHeight = Math.max(12, y1 - y0);
    const cellWidth = Math.max(8, right - left);
    const padX = Math.max(1, cellWidth * 0.035);
    const padY = Math.max(1, rowHeight * 0.15);
    const attemptsSpec = [
      { scale: 2, mode: '7', inset: 1 },
      { scale: 3, mode: '7', inset: 0 },
      { scale: 2, mode: '6', inset: 0 }
    ];
    const votes = new Map();
    const displayByKey = new Map();
    const attempts = [];

    for (const spec of attemptsSpec) {
      const extra = spec.inset ? padX : 0;
      const crop = cropCanvasRegion(
        imageCanvas,
        left + padX + extra,
        y0 - padY,
        right - padX - extra,
        y1 + padY,
        spec.scale
      );
      try {
        const result = await Tesseract.recognize(crop, 'eng', headerlessOcrOptions(field, spec.mode));
        const candidate = headerlessCellCandidateFromResult(result, field);
        const key = headerlessCellCandidateKey(candidate, field);
        attempts.push({ scale: spec.scale, mode: spec.mode, candidate });
        if (!key) continue;
        votes.set(key, (votes.get(key) || 0) + 1);
        if (!displayByKey.has(key)) displayByKey.set(key, candidate);
      } catch (_) {
        attempts.push({ scale: spec.scale, mode: spec.mode, candidate: '' });
      }
    }

    const ranked = [...votes.entries()].sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const winner = ranked[0] || null;
    const runner = ranked[1] || null;
    if (!winner || winner[1] < 2) return { value: '', attempts };
    if (runner && winner[1] === runner[1]) return { value: '', attempts };
    return { value: displayByKey.get(winner[0]) || '', attempts };
  }

  function headerlessInvalidCoreColumns(row) {
    const check = headerlessCoreRowCheck(row);
    const fieldToColumn = {
      price: 0, time: 1, pickup: 2, destination: 3,
      customer: 4, company: 5, vehicle: 8, persons: 9, driver: 12
    };
    return Object.entries(check.fields || {})
      .filter(([, ok]) => !ok)
      .map(([field]) => ({ field, column: fieldToColumn[field] }))
      .filter(item => item.column !== undefined);
  }

  async function recoverHeaderlessCellsTargeted(matrix, imageCanvas, imageMeta) {
    if (!Array.isArray(matrix) || !imageCanvas || !imageMeta?.headerlessAtms || !window.Tesseract) return matrix;
    const out = matrix.map(row => Array.isArray(row) ? row.slice() : row);
    const metaByIndex = imageMeta.rowMetaByMatrixIndex || {};
    const status = $('importStatus');
    const recoveryLog = [];

    // Sicherheitsbremse: Headerless-Zweit-OCR soll nur wenige schwache Zellen
    // retten. Sind zu viele Kernzellen unklar, bleibt die Liste abgelehnt statt
    // einen ganzen Tabelleninhalt aus Einzel-Crops zusammenzuraten.
    let totalInvalid = 0;
    for (let matrixIndex = 1; matrixIndex < out.length; matrixIndex++) {
      const invalid = headerlessInvalidCoreColumns(out[matrixIndex]);
      if (invalid.length > 4) {
        imageMeta.headerlessCellRecovery = { accepted: false, reason: 'too_many_invalid_cells_in_row', totalInvalid };
        return out;
      }
      totalInvalid += invalid.length;
    }
    if (totalInvalid > 12) {
      imageMeta.headerlessCellRecovery = { accepted: false, reason: 'too_many_invalid_cells', totalInvalid };
      return out;
    }

    for (let matrixIndex = 1; matrixIndex < out.length; matrixIndex++) {
      const row = out[matrixIndex];
      const rowMeta = metaByIndex[matrixIndex];
      if (!rowMeta) continue;

      const invalid = headerlessInvalidCoreColumns(row);
      for (const item of invalid) {
        if (status) status.textContent = `Kopfzeilenloser Ausschnitt: ${item.field}-Zelle in Zeile ${matrixIndex + 1} wird sicher nachgelesen …`;
        const recovered = await recoverHeaderlessCellConsensus(imageCanvas, imageMeta, rowMeta, item.column, item.field);
        recoveryLog.push({ matrixIndex, field: item.field, column: item.column, attempts: recovered.attempts, recovered: recovered.value });
        if (recovered.value) row[item.column] = recovered.value;
      }

    }

    // Flugnummern sind fuer einzelne Fahrten optional. Nur wenn im gesamten
    // kopfzeilenlosen Ausschnitt noch KEIN Flug erkannt wurde, werden die beiden
    // Flugspalten eng nachgelesen. So bleibt der Fallback schnell und rät keine
    // Flugnummern in legitime Leerzellen hinein.
    let hasAnyFlightBeforeRecovery = out.slice(1).some(row =>
      Boolean(normalizeFlightNumber(row?.[6]) || normalizeFlightNumber(row?.[7]))
    );
    if (!hasAnyFlightBeforeRecovery) {
      for (let matrixIndex = 1; matrixIndex < out.length; matrixIndex++) {
        const rowMeta = metaByIndex[matrixIndex];
        if (!rowMeta) continue;
        for (const [column, field] of [[6, 'arrivalFlight'], [7, 'departureFlight']]) {
          const recovered = await recoverHeaderlessCellConsensus(imageCanvas, imageMeta, rowMeta, column, field);
          recoveryLog.push({ matrixIndex, field, column, attempts: recovered.attempts, recovered: recovered.value });
          if (recovered.value) out[matrixIndex][column] = recovered.value;
        }
      }
    }

    const rowChecks = [];
    let hasFlight = false;
    let accepted = out.length > 1;
    for (let matrixIndex = 1; matrixIndex < out.length; matrixIndex++) {
      const check = headerlessCoreRowCheck(out[matrixIndex]);
      rowChecks.push({ matrixIndex, ok: check.ok, flight: check.flight, fields: check.fields });
      if (!check.ok) accepted = false;
      if (check.flight) hasFlight = true;
    }
    if (!hasFlight) accepted = false;

    imageMeta.headerlessCellRecovery = {
      accepted,
      totalInvalid,
      recoveredCells: recoveryLog.filter(item => Boolean(item.recovered)).length,
      rowChecks,
      recoveryLog
    };
    imageMeta.headerlessNeedsCellRecovery = !accepted;
    out._atmsImageMeta = imageMeta;
    return out;
  }

  async function recoverSyntheticImageRowsTargeted(matrix, imageCanvas, imageMeta) {
    if (!Array.isArray(matrix) || !imageCanvas || !imageMeta || !window.Tesseract) return matrix;
    const boundaries = imageMeta.boundaries || [];
    const metaByIndex = imageMeta.rowMetaByMatrixIndex || {};
    if (boundaries.length < 2) return matrix;

    const out = matrix.map(row => Array.isArray(row) ? row.slice() : row);
    const status = $('importStatus');

    for (let matrixIndex = 1; matrixIndex < out.length; matrixIndex++) {
      const meta = metaByIndex[matrixIndex];
      if (!meta?.syntheticGap) continue;

      const x0 = Number(boundaries[0]);
      const x1 = Number(boundaries[boundaries.length - 1]);
      const y0 = Number(meta.y0);
      const y1 = Number(meta.y1);
      if (![x0, x1, y0, y1].every(Number.isFinite) || x1 <= x0 || y1 <= y0) continue;

      if (status) status.textContent = `Fehlende Tabellenzeile ${matrixIndex + 1} wird lokal nachgelesen …`;

      let bestRow = null;
      let bestScore = -1;

      for (const scale of [1, 2]) {
        try {
          const sx = Math.max(0, Math.floor(x0));
          const crop = cropCanvasRegion(imageCanvas, x0, y0, x1, y1, scale);
          const second = await Tesseract.recognize(crop, 'eng');
          const cells = Array(boundaries.length - 1).fill('').map(() => []);

          (second?.data?.words || []).forEach(word => {
            const value = cellText(word?.text);
            const conf = Number(word?.confidence ?? word?.conf ?? 0);
            if (!value || !word?.bbox || conf < 5) return;
            const localCx = (Number(word.bbox.x0 || 0) + Number(word.bbox.x1 || 0)) / 2;
            const sourceCx = sx + localCx / scale;
            let col = boundaries.findIndex((right, i) => i > 0 && sourceCx < right) - 1;
            if (col < 0) col = 0;
            if (col >= cells.length) col = cells.length - 1;
            cells[col].push(value);
          });

          const candidate = cells.map(parts => parts.join(' ').replace(/\s+/g, ' ').trim());
          const semantic = imageMeta.semantic || imageSemanticColumns(imageMeta.anchors || []);
          const rideTimeIndex = semantic.rideTime;
          const rideTimeRaw = rideTimeIndex === undefined ? '' : cellText(candidate[rideTimeIndex]);
          const rideTimeNormalized = rideTimeRaw.replace(/[Oo]/g, '0').replace(/[Il]/g, '1');
          const rideTimeValid = looksLikeTime(rideTimeNormalized) || /^\d{3,4}$/.test(rideTimeNormalized.replace(/\D/g, ''));
          if (rideTimeValid && rideTimeIndex !== undefined && rideTimeNormalized !== rideTimeRaw) {
            candidate[rideTimeIndex] = rideTimeNormalized;
          }

          const nonEmpty = candidate.filter(Boolean).length;
          const routeScore = [semantic.pickup, semantic.destination]
            .filter(index => index !== undefined)
            .reduce((sum,index)=>sum+(cellText(candidate[index])?1:0),0);
          const identityScore = [semantic.customer, semantic.company, semantic.driver]
            .filter(index => index !== undefined)
            .reduce((sum,index)=>sum+(cellText(candidate[index])?1:0),0);
          const score = nonEmpty + (rideTimeValid ? 8 : 0) + routeScore * 2 + identityScore;

          if (score > bestScore) {
            bestScore = score;
            bestRow = candidate;
          }

          if (rideTimeValid && nonEmpty >= 5 && routeScore >= 1) break;
        } catch (_) {
          // Nur Sicherheitsnetz; der naechste Versuch darf weiterlaufen.
        }
      }

      if (!bestRow) continue;
      const semantic = imageMeta.semantic || imageSemanticColumns(imageMeta.anchors || []);
      const rideTimeIndex = semantic.rideTime;
      const rideTime = rideTimeIndex === undefined ? '' : cellText(bestRow[rideTimeIndex]).replace(/[Oo]/g, '0').replace(/[Il]/g, '1');
      const rideTimeValid = looksLikeTime(rideTime) || /^\d{3,4}$/.test(rideTime.replace(/\D/g, ''));
      const nonEmpty = bestRow.filter(Boolean).length;

      // Nur eine wirklich plausibel erneut gelesene Fahrtzeile aktivieren.
      if (rideTimeValid && nonEmpty >= 4) {
        bestRow[rideTimeIndex] = rideTime;
        out[matrixIndex] = bestRow;
        meta.syntheticGapRecovered = true;
      }
    }

    out._atmsImageMeta = imageMeta;
    return out;
  }

  function flightCandidatesFromOcrResult(result) {
    const parts = [];
    if (result?.data?.text) parts.push(result.data.text);
    (result?.data?.words || []).forEach(word => { if (word?.text) parts.push(word.text); });
    const joined = parts.join(' ');
    return flightCandidatesFromRow([joined]);
  }

  function rideTimeCandidatesFromOcrResult(result) {
    const parts = [];
    if (result?.data?.text) parts.push(result.data.text);
    (result?.data?.words || []).forEach(word => { if (word?.text) parts.push(word.text); });
    const joined = parts.join(' ').replace(/[Oo]/g, '0').replace(/[Il]/g, '1');
    const found = new Set();
    const colonMatches = joined.match(/(?:^|\D)([0-2]?\d[:.]?[0-5]\d)(?!\d)/g) || [];
    colonMatches.forEach(token => {
      const digits = token.replace(/\D/g, '');
      if (digits.length < 3 || digits.length > 4) return;
      const padded = digits.padStart(4, '0');
      const hh = Number(padded.slice(0, 2));
      const mm = Number(padded.slice(2));
      if (hh <= 23 && mm <= 59) found.add(`${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`);
    });
    return [...found];
  }

  function normalizeDriverCandidate(value) {
    const text = cellText(value)
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^[^A-Za-zÄÖÜäöüßÀ-ÿ\- ]+|[^A-Za-zÄÖÜäöüßÀ-ÿ\- ]+$/g, '')
      .trim();
    if (!text || text.length < 2 || text.length > 40) return '';
    if (!looksLikeDriverName(text)) return '';
    if (/^(wg|fahrer|driver|chauffeur|van|pkw|bus|sprinter)$/i.test(text)) return '';

    // CORE-006Z: Ein einzelner letzter Großbuchstabe ist als echter Namenszusatz
    // zulässig (z. B. Initiale/Kürzel). Einzelbuchstaben an anderer Stelle bleiben
    // weiterhin gesperrt, damit OCR-Fragmente nicht als Fahrername durchrutschen.
    const tokens = text.split(/[\s-]+/).filter(Boolean);
    if (tokens.length > 1) {
      const badSingle = tokens.some((token, index) => {
        if (token.length !== 1) return false;
        return !(index === tokens.length - 1 && /^[A-ZÄÖÜ]$/.test(token));
      });
      if (badSingle) return '';
    }

    return text;
  }

  function driverCandidatesFromOcrResult(result) {
    const raw = [];
    if (result?.data?.text) raw.push(result.data.text);
    (result?.data?.words || []).forEach(word => {
      if (word?.text) raw.push(word.text);
    });

    const found = new Map();
    raw.forEach(value => {
      const candidate = normalizeDriverCandidate(value);
      if (!candidate) return;
      const key = cleanKey(candidate);
      if (!key) return;
      if (!found.has(key)) found.set(key, candidate);
    });
    return [...found.values()];
  }

  function normalizeDriverBoundaryNoise(value) {
    const raw = cellText(value);
    if (!raw) return '';

    // Nur Randzeichen entfernen. Buchstaben/Ziffern innerhalb des eigentlichen
    // OCR-Textes werden niemals verändert oder ergänzt.
    const trimmed = raw
      .replace(/^[^A-Za-zÄÖÜäöüßÀ-ÿ-]+/, '')
      .replace(/[^A-Za-zÄÖÜäöüßÀ-ÿ-]+$/, '')
      .trim();

    if (!trimmed || trimmed === raw) return '';
    const normalized = normalizeDriverCandidate(trimmed);
    if (!normalized || normalized !== trimmed) return '';
    return normalized;
  }

  function driverNeedsTargetedRecovery(value) {
    const raw = cellText(value);
    if (!raw) return true;

    // Saubere Namen wie "Rida", "Lana", "Sabrina" bleiben unangetastet.
    // Führende/abschließende Satzzeichen, OCR-Balken, Ziffern oder sonstige
    // Nicht-Namenszeichen machen den Primärwert dagegen verdächtig.
    if (!looksLikeDriverName(raw)) return true;

    const normalized = normalizeDriverCandidate(raw);
    if (!normalized) return true;

    return normalized !== raw;
  }

  async function recoverMissingDriversTargeted(rides, imageCanvas, imageMeta, mapping) {
    if (!imageCanvas || !imageMeta || !window.Tesseract) return rides;
    const driverCol = mapping?.driver;
    if (driverCol === undefined) return rides;

    const boundaries = imageMeta.boundaries || [];
    const left = Number(boundaries[driverCol]);
    const right = Number(boundaries[driverCol + 1]);
    if (!Number.isFinite(left) || !Number.isFinite(right) || right <= left) return rides;

    const status = $('importStatus');
    const out = (Array.isArray(rides) ? rides : []).map(ride => ({ ...ride }));

    for (let i = 0; i < out.length; i++) {
      const ride = out[i];
      const originalDriver = cellText(ride.driver);
      if (!driverNeedsTargetedRecovery(originalDriver)) continue;

      ride.driverRawOcr = originalDriver;

      // CORE-006H: Wenn ausschließlich offensichtliche Randzeichen den ansonsten
      // vollständig gültigen Namen verunreinigen, ist keine semantische Korrektur
      // nötig. Beispielklasse: "‘Name", ": Name |", "Name |".
      const boundaryNormalized = normalizeDriverBoundaryNoise(originalDriver);
      if (boundaryNormalized) {
        ride.driver = boundaryNormalized;
        ride.driverRecoveredFromBoundaryNormalization = true;
        ride.driverNeedsManualCheck = false;
        ride.driverRecoverySource = 'driver_boundary_noise_normalization';
        continue;
      }

      const matrixIndex = Number(ride.sourceRow || 0) - 1;
      const rowMeta = imageMeta.rowMetaByMatrixIndex?.[matrixIndex];
      if (!rowMeta) continue;

      const y0 = Number(rowMeta.y0 || 0);
      const y1 = Number(rowMeta.y1 || 0);
      const rowHeight = Math.max(18, y1 - y0);
      const cellWidth = Math.max(8, right - left);
      const padY = Math.max(2, rowHeight * 0.18);
      const padX = Math.max(1, cellWidth * 0.04);

      const regions = [
        [left + padX, y0 - padY, right - padX, y1 + padY, 1],
        [left + padX, y0 - padY, right - padX, y1 + padY, 2],
        [left, y0 - Math.max(2, rowHeight * 0.12), right, y1 + Math.max(2, rowHeight * 0.12), 3]
      ];
      const ocrModes = [
        { name: 'default', options: {} },
        { name: 'single-line', options: { tessedit_pageseg_mode: '7' } },
        { name: 'single-word', options: { tessedit_pageseg_mode: '8' } }
      ];

      if (status) status.textContent = `Fahrerzelle Zeile ${ride.sourceRow} wird lokal nachgelesen …`;

      const votes = new Map();
      const displayByKey = new Map();
      const attempts = [];

      try {
        for (const [x0, cy0, x1, cy1, scale] of regions) {
          const crop = cropCanvasRegion(imageCanvas, x0, cy0, x1, cy1, scale);
          for (const mode of ocrModes) {
            const second = await Tesseract.recognize(crop, 'eng', mode.options);
            const candidates = driverCandidatesFromOcrResult(second);
            attempts.push({ mode: mode.name, scale, candidates: candidates.slice() });
            if (candidates.length !== 1) continue;

            const candidate = candidates[0];
            const key = cleanKey(candidate);
            if (!key) continue;
            displayByKey.set(key, displayByKey.get(key) || candidate);
            votes.set(key, (votes.get(key) || 0) + 1);
          }
        }
      } catch (_) {
        ride.driverTargetedOcrAttempts = attempts;
        continue;
      }

      ride.driverTargetedOcrAttempts = attempts;
      const ranked = [...votes.entries()].sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0]));
      const winner = ranked[0] || null;
      const runner = ranked[1] || null;

      // Sicherheitsregel: kein Einzel-Treffer. Mindestens zwei getrennte enge
      // OCR-Versuche müssen denselben Namen lesen, und der Kandidat muss eindeutig gewinnen.
      if (!winner || winner[1] < 2) {
        if (originalDriver) ride.driverNeedsManualCheck = true;
        continue;
      }
      if (runner && winner[1] === runner[1]) {
        if (originalDriver) ride.driverNeedsManualCheck = true;
        continue;
      }

      const recovered = normalizeDriverCandidate(displayByKey.get(winner[0]) || '');
      if (!recovered) {
        if (originalDriver) ride.driverNeedsManualCheck = true;
        continue;
      }

      ride.driver = recovered;
      ride.driverRecoveredFromTargetedOcr = true;
      ride.driverNeedsManualCheck = false;
      ride.driverRecoverySource = 'targeted_driver_cell_consensus';
    }

    return out;
  }


  function driverEditDistance(leftValue, rightValue) {
    const left = cleanKey(leftValue);
    const right = cleanKey(rightValue);
    if (left === right) return 0;
    if (!left) return right.length;
    if (!right) return left.length;
    const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
    for (let i = 1; i <= left.length; i++) {
      let diagonal = previous[0];
      previous[0] = i;
      for (let j = 1; j <= right.length; j++) {
        const above = previous[j];
        const cost = left[i - 1] === right[j - 1] ? 0 : 1;
        previous[j] = Math.min(previous[j] + 1, previous[j - 1] + 1, diagonal + cost);
        diagonal = above;
      }
    }
    return previous[right.length];
  }

  function driverHasLatinDiacritic(value) {
    return /[ÄÖÜäöüßÀ-ÿ]/.test(cellText(value));
  }

  function driverTrailingInitialStem(value) {
    const tokens = cellText(value).split(/\s+/).filter(Boolean);
    if (tokens.length < 2) return '';
    const last = tokens[tokens.length - 1];
    if (!/^[A-ZÄÖÜ]$/.test(last)) return '';
    return tokens.slice(0, -1).join(' ');
  }

  function driverConsensusCandidateIsSafe(originalValue, candidateValue) {
    const original = normalizeDriverCandidate(originalValue);
    const candidate = normalizeDriverCandidate(candidateValue);
    if (!original || !candidate || original === candidate) return false;

    const originalKey = cleanKey(original);
    const candidateKey = cleanKey(candidate);
    if (!originalKey || !candidateKey) return false;

    // Reine Diakritik-/Großschreibungsverbesserung ist sicher, wenn die Basis gleich ist.
    if (originalKey === candidateKey) {
      return driverHasLatinDiacritic(candidate) && !driverHasLatinDiacritic(original);
    }

    // Ein finaler einbuchstabiger Namenszusatz darf nur dann ergänzt werden, wenn der
    // eigentliche Name gegenüber dem Primärwert identisch oder höchstens um EIN OCR-Zeichen
    // verschieden ist. Ohne Mehrfach-Konsens wird diese Regel nie angewendet.
    const stem = driverTrailingInitialStem(candidate);
    if (stem) {
      const stemDistance = driverEditDistance(original, stem);
      if (stemDistance <= 1) return true;
    }

    // Deutsche Diakritik kann bei englischer Primär-OCR zugleich einen Buchstaben verschieben.
    // Ein einziger Zeichenunterschied ist nur bei tatsächlich vorhandener Diakritik erlaubt.
    if (driverHasLatinDiacritic(candidate) && driverEditDistance(original, candidate) <= 1) return true;

    return false;
  }

  async function recoverDriverColumnConsensusTargeted(rides, imageCanvas, imageMeta, mapping) {
    if (!imageCanvas || !imageMeta || !window.Tesseract) return rides;
    const driverCol = mapping?.driver;
    if (driverCol === undefined) return rides;

    const boundaries = imageMeta.boundaries || [];
    const left = Number(boundaries[driverCol]);
    const right = Number(boundaries[driverCol + 1]);
    if (!Number.isFinite(left) || !Number.isFinite(right) || right <= left) return rides;

    const out = (Array.isArray(rides) ? rides : []).map(ride => ({ ...ride }));
    const rowsWithMeta = out.map(ride => {
      const matrixIndex = Number(ride.sourceRow || 0) - 1;
      const meta = imageMeta.rowMetaByMatrixIndex?.[matrixIndex];
      if (!meta) return null;
      const y0 = Number(meta.y0), y1 = Number(meta.y1);
      const cy = Number(meta.cy ?? ((y0 + y1) / 2));
      if (![y0, y1, cy].every(Number.isFinite) || y1 <= y0) return null;
      return { sourceRow: Number(ride.sourceRow), meta: { y0, y1, cy } };
    }).filter(Boolean);
    if (!rowsWithMeta.length) return out;

    const minY = Math.min(...rowsWithMeta.map(item => item.meta.y0));
    const maxY = Math.max(...rowsWithMeta.map(item => item.meta.y1));
    const cellWidth = Math.max(8, right - left);
    const padX = Math.max(1, cellWidth * 0.025);
    const attempts = [
      { name: 'deu-driver-psm4', scale: 2, options: { tessedit_pageseg_mode: '4' } },
      { name: 'deu-driver-psm6', scale: 3, options: { tessedit_pageseg_mode: '6' } },
      { name: 'deu-driver-psm11', scale: 2, options: { tessedit_pageseg_mode: '11' } }
    ];
    const status = $('importStatus');
    const votesByRow = new Map();
    const displayByRowKey = new Map();
    const attemptLogByRow = new Map();

    if (status) status.textContent = 'Fahrer-Spalte wird lokal mit deutscher OCR gegengeprüft …';

    try {
      for (const attempt of attempts) {
        const crop = cropCanvasRegion(imageCanvas, left + padX, minY, right - padX, maxY, attempt.scale);
        const second = await Tesseract.recognize(crop, 'deu', attempt.options);
        const rowCandidates = routeWordsBySourceRow(second, minY, attempt.scale, rowsWithMeta);

        rowsWithMeta.forEach(item => {
          const rawCandidate = routeOcrText(rowCandidates.get(item.sourceRow) || '');
          const candidate = normalizeDriverCandidate(rawCandidate);
          const log = attemptLogByRow.get(item.sourceRow) || [];
          log.push({ mode: attempt.name, candidate });
          attemptLogByRow.set(item.sourceRow, log);
          if (!candidate) return;

          const key = candidate.normalize('NFKC').toLocaleLowerCase('de-DE');
          const rowVotes = votesByRow.get(item.sourceRow) || new Map();
          rowVotes.set(key, (rowVotes.get(key) || 0) + 1);
          votesByRow.set(item.sourceRow, rowVotes);
          const displayKey = `${item.sourceRow}|${key}`;
          if (!displayByRowKey.has(displayKey)) displayByRowKey.set(displayKey, candidate);
        });
      }
    } catch (_) {
      return out;
    }

    out.forEach(ride => {
      const sourceRow = Number(ride.sourceRow);
      const original = normalizeDriverCandidate(ride.driver);
      ride.driverGermanColumnOcrAttempts = attemptLogByRow.get(sourceRow) || [];
      if (!original) return;

      const ranked = [...(votesByRow.get(sourceRow) || new Map()).entries()]
        .sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0], 'de'));
      const winner = ranked[0] || null;
      const runner = ranked[1] || null;
      if (!winner || winner[1] < 2) return;
      if (runner && winner[1] === runner[1]) return;

      const candidate = normalizeDriverCandidate(displayByRowKey.get(`${sourceRow}|${winner[0]}`) || '');
      if (!candidate || !driverConsensusCandidateIsSafe(original, candidate)) return;

      ride.driverRawOcr = ride.driverRawOcr || original;
      ride.driver = candidate;
      ride.driverRecoverySource = 'driver_german_column_consensus';

      // Reine Diakritikverbesserungen brauchen keinen zusätzlichen Warnhinweis.
      // Inhaltliche Ergänzungen/Ein-Zeichen-Korrekturen bleiben sichtbar prüfbar.
      if (cleanKey(original) !== cleanKey(candidate)) {
        ride.driverRecoveredFromTargetedOcr = true;
      } else {
        ride.driverRecoveredFromGermanColumnOcr = true;
        ride.driverNeedsManualCheck = false;
      }
    });

    return out;
  }

  // CORE-006L: Ortsnamen werden nicht per Wörterbuch oder Sonderfall korrigiert.
  // Stattdessen werden die beiden Routen-Spalten mit deutscher OCR lokal noch einmal
  // gelesen. Eine Änderung ist nur erlaubt, wenn zwei unabhängige Spalten-Durchläufe
  // exakt denselben Kandidaten liefern und sich dieser nur minimal vom Primärwert
  // unterscheidet, dabei aber eine echte lateinische Diakritik wiederherstellt.
  function routeOcrText(value) {
    return cellText(value)
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/^[^A-Za-zÄÖÜäöüßÀ-ÿ0-9]+/, '')
      .replace(/[^A-Za-zÄÖÜäöüßÀ-ÿ0-9)]+$/, '')
      .trim();
  }

  function routeOcrBase(value) {
    return routeOcrText(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('de-DE');
  }

  function routeOcrDistance(leftValue, rightValue) {
    const left = routeOcrBase(leftValue);
    const right = routeOcrBase(rightValue);
    if (left === right) return 0;
    if (!left) return right.length;
    if (!right) return left.length;

    const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
    for (let i = 1; i <= left.length; i++) {
      let diagonal = previous[0];
      previous[0] = i;
      for (let j = 1; j <= right.length; j++) {
        const above = previous[j];
        const cost = left[i - 1] === right[j - 1] ? 0 : 1;
        previous[j] = Math.min(
          previous[j] + 1,
          previous[j - 1] + 1,
          diagonal + cost
        );
        diagonal = above;
      }
    }
    return previous[right.length];
  }

  function routeHasLatinDiacritic(value) {
    return /[ÄÖÜäöüßÀ-ÿ]/.test(routeOcrText(value));
  }

  function routeChangedDiacriticTokenIsSafe(originalValue, candidateValue) {
    const original = routeOcrText(originalValue);
    const candidate = routeOcrText(candidateValue);
    if (!original || !candidate || original === candidate) return false;
    if (!routeHasLatinDiacritic(candidate)) return false;
    if (!/^[A-Za-zÄÖÜäöüßÀ-ÿ0-9 .,'’&()/+\-]+$/.test(candidate)) return false;

    const originalTokens = original.split(/\s+/);
    const candidateTokens = candidate.split(/\s+/);
    if (originalTokens.length !== candidateTokens.length) return false;
    if (Math.abs(original.length - candidate.length) > 1) return false;
    if (routeOcrDistance(original, candidate) > 1) return false;

    let changedTokens = 0;
    for (let index = 0; index < originalTokens.length; index++) {
      const left = originalTokens[index];
      const right = candidateTokens[index];
      if (left === right) continue;
      changedTokens += 1;
      if (changedTokens > 1) return false;
      if (right.length < 4) return false;
      if (!routeHasLatinDiacritic(right)) return false;
      if (routeOcrDistance(left, right) > 1) return false;
    }
    return changedTokens === 1;
  }

  function routeWordsBySourceRow(result, cropTop, cropScale, rowsWithMeta) {
    const grouped = new Map();
    const words = Array.isArray(result?.data?.words) ? result.data.words : [];

    words.forEach(word => {
      const text = routeOcrText(word?.text);
      const bbox = word?.bbox || {};
      const y0 = Number(bbox.y0);
      const y1 = Number(bbox.y1);
      const x0 = Number(bbox.x0);
      const confidence = Number(word?.confidence);
      if (!text || ![x0, y0, y1].every(Number.isFinite)) return;
      if (Number.isFinite(confidence) && confidence < 20) return;

      const sourceCy = cropTop + ((y0 + y1) / 2) / cropScale;
      let best = null;
      let bestDistance = Infinity;
      rowsWithMeta.forEach(item => {
        const meta = item.meta;
        const rowHeight = Math.max(8, Number(meta.y1) - Number(meta.y0));
        const pad = Math.max(2, rowHeight * 0.28);
        if (sourceCy < Number(meta.y0) - pad || sourceCy > Number(meta.y1) + pad) return;
        const distance = Math.abs(sourceCy - Number(meta.cy));
        if (distance < bestDistance) {
          best = item;
          bestDistance = distance;
        }
      });
      if (!best) return;

      const list = grouped.get(best.sourceRow) || [];
      list.push({ text, x: x0 / cropScale });
      grouped.set(best.sourceRow, list);
    });

    const byRow = new Map();
    grouped.forEach((items, sourceRow) => {
      const text = routeOcrText(items.sort((a,b) => a.x - b.x).map(item => item.text).join(' '));
      if (text) byRow.set(sourceRow, text);
    });
    return byRow;
  }

  async function recoverRouteDiacriticsTargeted(rides, imageCanvas, imageMeta, mapping) {
    if (!imageCanvas || !imageMeta || !window.Tesseract) return rides;
    const boundaries = imageMeta.boundaries || [];
    const status = $('importStatus');
    const out = (Array.isArray(rides) ? rides : []).map(ride => ({ ...ride }));
    const fields = [
      { field: 'pickup', label: 'Von' },
      { field: 'destination', label: 'Nach' }
    ];

    for (const descriptor of fields) {
      const column = mapping?.[descriptor.field];
      if (column === undefined) continue;
      const left = Number(boundaries[column]);
      const right = Number(boundaries[column + 1]);
      if (!Number.isFinite(left) || !Number.isFinite(right) || right <= left) continue;

      const rowsWithMeta = out.map(ride => {
        const matrixIndex = Number(ride.sourceRow || 0) - 1;
        const meta = imageMeta.rowMetaByMatrixIndex?.[matrixIndex];
        if (!meta) return null;
        const y0 = Number(meta.y0);
        const y1 = Number(meta.y1);
        const cy = Number(meta.cy ?? ((y0 + y1) / 2));
        if (![y0, y1, cy].every(Number.isFinite) || y1 <= y0) return null;
        return { sourceRow: Number(ride.sourceRow), meta: { y0, y1, cy } };
      }).filter(Boolean);
      if (!rowsWithMeta.length) continue;

      const minY = Math.min(...rowsWithMeta.map(item => item.meta.y0));
      const maxY = Math.max(...rowsWithMeta.map(item => item.meta.y1));
      const cellWidth = Math.max(8, right - left);
      const padX = Math.max(1, cellWidth * 0.025);
      const attempts = [
        { name: 'deu-column-psm4', scale: 2, options: { tessedit_pageseg_mode: '4' } },
        { name: 'deu-column-psm6', scale: 3, options: { tessedit_pageseg_mode: '6' } }
      ];
      const votesByRow = new Map();
      const displayByRowKey = new Map();
      const attemptLogByRow = new Map();

      if (status) status.textContent = `${descriptor.label}-Ortszellen werden lokal mit deutscher OCR gegengeprüft …`;

      try {
        for (const attempt of attempts) {
          const crop = cropCanvasRegion(imageCanvas, left + padX, minY, right - padX, maxY, attempt.scale);
          const second = await Tesseract.recognize(crop, 'deu', attempt.options);
          const rowCandidates = routeWordsBySourceRow(second, minY, attempt.scale, rowsWithMeta);

          rowsWithMeta.forEach(item => {
            const candidate = routeOcrText(rowCandidates.get(item.sourceRow) || '');
            const log = attemptLogByRow.get(item.sourceRow) || [];
            log.push({ mode: attempt.name, candidate });
            attemptLogByRow.set(item.sourceRow, log);
            if (!candidate) return;

            const key = candidate.normalize('NFKC').toLocaleLowerCase('de-DE');
            const rowVotes = votesByRow.get(item.sourceRow) || new Map();
            rowVotes.set(key, (rowVotes.get(key) || 0) + 1);
            votesByRow.set(item.sourceRow, rowVotes);
            const displayKey = `${item.sourceRow}|${key}`;
            if (!displayByRowKey.has(displayKey)) displayByRowKey.set(displayKey, candidate);
          });
        }
      } catch (_) {
        // Fehlende/noch nicht geladene deutsche Sprachdaten dürfen den Bildimport
        // niemals blockieren. Der sichere Primärwert bleibt dann unverändert.
      }

      out.forEach(ride => {
        const sourceRow = Number(ride.sourceRow);
        const original = routeOcrText(ride[descriptor.field]);
        ride[`${descriptor.field}TargetedOcrAttempts`] = attemptLogByRow.get(sourceRow) || [];
        if (!original) return;

        const ranked = [...(votesByRow.get(sourceRow) || new Map()).entries()]
          .sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0], 'de'));
        const winner = ranked[0] || null;
        const runner = ranked[1] || null;
        if (!winner || winner[1] < 2) return;
        if (runner && winner[1] === runner[1]) return;

        const candidate = routeOcrText(displayByRowKey.get(`${sourceRow}|${winner[0]}`) || '');
        if (!routeChangedDiacriticTokenIsSafe(original, candidate)) return;

        ride[`${descriptor.field}RawOcr`] = original;
        ride[descriptor.field] = candidate;
        ride[`${descriptor.field}RecoveredFromTargetedOcr`] = true;
        ride[`${descriptor.field}RecoverySource`] = 'targeted_route_diacritic_consensus';
      });
    }

    return out;
  }

  // CORE-005R: Preis-Kandidaten werden nur aus expliziten Dezimaldarstellungen
  // der gezielt ausgeschnittenen Preiszelle gewonnen. Eine verlorene Dezimalstelle
  // (z. B. reines "4760") wird NICHT erraten oder automatisch verschoben.
  function priceCandidatesFromOcrResult(result) {
    const parts = [];
    if (result?.data?.text) parts.push(result.data.text);
    (result?.data?.words || []).forEach(word => { if (word?.text) parts.push(word.text); });
    const joined = parts
      .join(' ')
      .replace(/[Oo]/g, '0')
      .replace(/([,.])\s+(?=\d{2}(?:\D|$))/g, '$1');
    const found = new Set();
    const pattern = /(?:^|[^0-9])(\d{1,4}(?:[.,]\d{3})*[.,]\d{2})(?!\d)/g;
    let match;
    while ((match = pattern.exec(joined))) {
      const token = match[1];
      const value = parseNumber(token);
      const check = pricePlausibility(value);
      if (!Number.isFinite(value) || value <= 0 || check.suspicious) continue;
      found.add((Math.round(value * 100) / 100).toFixed(2));
    }
    return [...found].map(Number);
  }

  async function recoverSuspiciousPricesTargeted(rides, imageCanvas, imageMeta, mapping) {
    if (!imageCanvas || !imageMeta || !window.Tesseract) return rides;
    const priceCol = mapping?.price;
    if (priceCol === undefined) return rides;

    const boundaries = imageMeta.boundaries || [];
    const left = Number(boundaries[priceCol]);
    const right = Number(boundaries[priceCol + 1]);
    if (!Number.isFinite(left) || !Number.isFinite(right) || right <= left) return rides;

    const status = $('importStatus');
    const out = (Array.isArray(rides) ? rides : []).map(ride => ({ ...ride }));

    for (let i = 0; i < out.length; i++) {
      const ride = out[i];
      if (ride.priceRequired === false) continue;
      const initialCheck = pricePlausibility(ride.price);
      if (!initialCheck.suspicious) continue;

      const matrixIndex = Number(ride.sourceRow || 0) - 1;
      const rowMeta = imageMeta.rowMetaByMatrixIndex?.[matrixIndex];
      if (!rowMeta) continue;

      const y0 = Number(rowMeta.y0 || 0);
      const y1 = Number(rowMeta.y1 || 0);
      const rowHeight = Math.max(18, y1 - y0);
      const cellWidth = Math.max(8, right - left);
      const padY = Math.max(2, rowHeight * 0.18);
      const padX = Math.max(1, cellWidth * 0.04);
      const regions = [
        [left + padX, y0 - padY, right - padX, y1 + padY, 1],
        [left + padX, y0 - padY, right - padX, y1 + padY, 2],
        [left, y0 - Math.max(2, rowHeight * 0.12), right, y1 + Math.max(2, rowHeight * 0.12), 2]
      ];

      if (status) status.textContent = `Preiszelle Zeile ${ride.sourceRow} wird lokal nachgelesen …`;
      const votes = new Map();
      const attempts = [];

      try {
        for (const [x0, cy0, x1, cy1, scale] of regions) {
          const crop = cropCanvasRegion(imageCanvas, x0, cy0, x1, cy1, scale);
          const second = await Tesseract.recognize(crop, 'eng');
          const candidates = priceCandidatesFromOcrResult(second);
          attempts.push(candidates.slice());
          if (candidates.length !== 1) continue;
          const candidate = Number(candidates[0]);
          const key = candidate.toFixed(2);
          votes.set(key, (votes.get(key) || 0) + 1);
        }
      } catch (_) {
        ride.priceTargetedOcrAttempts = attempts;
        continue;
      }

      ride.priceTargetedOcrAttempts = attempts;
      const ranked = [...votes.entries()]
        .sort((a, b) => b[1] - a[1] || Number(a[0]) - Number(b[0]));

      // Sicherheitsregel: mindestens zwei gezielte OCR-Crops muessen denselben
      // plausiblen Preis liefern. Bei Gleichstand oder Einzel-Treffer bleibt CORE-004K aktiv.
      if (!ranked.length || ranked[0][1] < 2) continue;
      if (ranked.length > 1 && ranked[0][1] === ranked[1][1]) continue;

      const recovered = Number(ranked[0][0]);
      if (pricePlausibility(recovered).suspicious) continue;

      ride.priceOcrInitial = Number(ride.price) || 0;
      ride.price = recovered;
      ride.priceRecoveredFromTargetedOcr = true;
      ride.priceRecoverySource = 'targeted_price_cell_consensus';
    }

    return out;
  }

  async function recoverMissingRideTimesTargeted(rides, imageCanvas, imageMeta, mapping) {
    if (!imageCanvas || !imageMeta || !window.Tesseract) return rides;
    const timeCol = mapping?.time;
    if (timeCol === undefined) return rides;
    const boundaries = imageMeta.boundaries || [];
    const left = Number(boundaries[timeCol]);
    const right = Number(boundaries[timeCol + 1]);
    if (!Number.isFinite(left) || !Number.isFinite(right) || right <= left) return rides;

    const status = $('importStatus');
    const out = (Array.isArray(rides) ? rides : []).map(ride => ({ ...ride }));

    for (let i = 0; i < out.length; i++) {
      const ride = out[i];
      if (ride.time) continue;
      const matrixIndex = Number(ride.sourceRow || 0) - 1;
      const rowMeta = imageMeta.rowMetaByMatrixIndex?.[matrixIndex];
      if (!rowMeta) continue;

      const y0 = Number(rowMeta.y0 || 0);
      const y1 = Number(rowMeta.y1 || 0);
      const rowHeight = Math.max(18, y1 - y0);
      const padY = Math.max(2, rowHeight * 0.18);
      const cellWidth = Math.max(8, right - left);
      const padX = Math.max(1, cellWidth * 0.04);
      const regions = [
        [left + padX, y0 - padY, right - padX, y1 + padY, 2],
        [left, y0 - padY, right, y1 + padY, 3]
      ];

      if (status) status.textContent = `Uhrzeitzelle Zeile ${ride.sourceRow} wird lokal nachgelesen …`;
      const votes = new Map();
      try {
        for (const [x0, cy0, x1, cy1, scale] of regions) {
          const crop = cropCanvasRegion(imageCanvas, x0, cy0, x1, cy1, scale);
          const second = await Tesseract.recognize(crop, 'eng');
          const candidates = rideTimeCandidatesFromOcrResult(second);
          if (candidates.length === 1) {
            const candidate = candidates[0];
            votes.set(candidate, (votes.get(candidate) || 0) + 1);
          }
        }
      } catch (_) {
        continue;
      }

      const ranked = [...votes.entries()].sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0]));
      if (!ranked.length) continue;
      if (ranked.length > 1 && ranked[0][1] === ranked[1][1]) continue;
      const recovered = ranked[0][0];
      ride.time = recovered;
      ride.planTime = recovered;
      ride.timeRecoveredFromTargetedOcr = true;
    }
    return out;
  }


  async function recoverSuspiciousRideTimesTargeted(rides, imageCanvas, imageMeta, mapping) {
    if (!imageCanvas || !imageMeta || !window.Tesseract) return rides;
    const timeCol = mapping?.time;
    if (timeCol === undefined) return rides;
    const boundaries = imageMeta.boundaries || [];
    const left = Number(boundaries[timeCol]);
    const right = Number(boundaries[timeCol + 1]);
    if (!Number.isFinite(left) || !Number.isFinite(right) || right <= left) return rides;

    const status = $('importStatus');
    const out = (Array.isArray(rides) ? rides : []).map(ride => ({ ...ride }));

    for (let i = 0; i < out.length; i++) {
      const ride = out[i];
      const initial = normalizeTime(ride.time || ride.dispoTime || ride.planTime);
      const initialMinutes = timeToMinutes(initial);
      if (initialMinutes === null || initialMinutes >= NEXT_DAY_CUTOFF_MINUTES) continue;

      const matrixIndex = Number(ride.sourceRow || 0) - 1;
      const rowMeta = imageMeta.rowMetaByMatrixIndex?.[matrixIndex];
      if (!rowMeta) continue;

      const y0 = Number(rowMeta.y0 || 0);
      const y1 = Number(rowMeta.y1 || 0);
      const rowHeight = Math.max(18, y1 - y0);
      const cellWidth = Math.max(8, right - left);
      const padY = Math.max(2, rowHeight * 0.16);
      const padX = Math.max(1, cellWidth * 0.035);
      const regions = [
        [left + padX, y0 - padY, right - padX, y1 + padY, 1],
        [left + padX, y0 - padY, right - padX, y1 + padY, 2],
        [left, y0 - Math.max(2, rowHeight * 0.10), right, y1 + Math.max(2, rowHeight * 0.10), 3]
      ];
      const ocrModes = [
        { name: 'default', options: {} },
        { name: 'single-line', options: { tessedit_pageseg_mode: '7', tessedit_char_whitelist: '0123456789:.' } },
        { name: 'single-word', options: { tessedit_pageseg_mode: '8', tessedit_char_whitelist: '0123456789:.' } }
      ];

      if (status) status.textContent = `Verdächtige Uhrzeitzelle Zeile ${ride.sourceRow} wird lokal nachgelesen …`;
      const votes = new Map();
      const attempts = [];

      try {
        for (const [x0, cy0, x1, cy1, scale] of regions) {
          const crop = cropCanvasRegion(imageCanvas, x0, cy0, x1, cy1, scale);
          for (const mode of ocrModes) {
            const second = await Tesseract.recognize(crop, 'eng', mode.options);
            const candidates = rideTimeCandidatesFromOcrResult(second);
            attempts.push({ mode: mode.name, scale, candidates: candidates.slice() });
            if (candidates.length !== 1) continue;
            const candidate = normalizeTime(candidates[0]);
            if (timeToMinutes(candidate) === null) continue;
            votes.set(candidate, (votes.get(candidate) || 0) + 1);
          }
        }
      } catch (_) {
        ride.timeSuspiciousOcrAttempts = attempts;
        continue;
      }

      ride.timeSuspiciousOcrAttempts = attempts;
      const ranked = [...votes.entries()].sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0]));
      const winner = ranked[0] || null;
      const runner = ranked[1] || null;

      // Keine Korrektur aufgrund eines Einzel-Treffers. Mindestens zwei lokale
      // OCR-Versuche müssen dieselbe alternative Zeit liefern und eindeutig gewinnen.
      if (!winner || winner[1] < 2) continue;
      if (runner && winner[1] === runner[1]) continue;
      const recovered = normalizeTime(winner[0]);
      if (!recovered || recovered === initial) continue;

      ride.timeOcrInitial = initial;
      ride.time = recovered;
      ride.planTime = recovered;
      ride.dispoTime = recovered;
      ride.dispo_time = recovered;
      ride.timeRecoveredFromTargetedOcr = true;
      ride.timeRecoverySource = 'targeted_suspicious_time_cell_consensus';
    }

    return out;
  }

  function sanitizeTargetedFlightCandidate(candidate, rideTime) {
    const normalized = normalizeFlightNumber(candidate);
    const time = normalizeTime(rideTime);
    if (!normalized || !time) return normalized;

    const minute = time.slice(3, 5);
    const match = normalized.match(/^(\d{2})([A-Z][A-Z0-9]\d{1,4}[A-Z]?)$/);
    if (!match || match[1] !== minute) return normalized;

    const remainder = normalizeFlightNumber(match[2]);
    if (!remainder || !looksLikeFlight(remainder)) return normalized;
    return remainder;
  }

  async function recoverMissingFlightNumbersTargeted(rides, imageCanvas, imageMeta, mapping) {
    if (!imageCanvas || !imageMeta || !window.Tesseract) return rides;
    const status = $('importStatus');
    const out = (Array.isArray(rides) ? rides : []).map(ride => ({ ...ride }));

    for (let i = 0; i < out.length; i++) {
      const ride = out[i];
      if (ride.flightNumber) continue;

      const routeType = classifyRide(ride.pickup, ride.destination, '', '');
      const field = routeType === 'arrival' ? 'arrivalFlight' : routeType === 'departure' ? 'departureFlight' : '';
      const colIndex = field ? mapping?.[field] : undefined;
      const matrixIndex = Number(ride.sourceRow || 0) - 1;
      const rowMeta = imageMeta.rowMetaByMatrixIndex?.[matrixIndex];
      if (colIndex === undefined || !rowMeta) continue;

      const boundaries = imageMeta.boundaries || [];
      const left = Number(boundaries[colIndex]);
      const right = Number(boundaries[colIndex + 1]);
      if (!Number.isFinite(left) || !Number.isFinite(right) || right <= left) continue;

      const y0 = Number(rowMeta.y0 || 0);
      const y1 = Number(rowMeta.y1 || 0);
      const rowHeight = Math.max(18, y1 - y0);

      // CORE-004H: bewusst ENG in Y-Richtung bleiben. CORE-004G nutzte fast eine
      // ganze Zeilenhöhe als Padding und konnte dadurch Flugnummern der Nachbarzeilen
      // mitlesen. Dann gab es mehrere Kandidaten und aus Sicherheitsgründen keine Übernahme.
      const tightPadY = Math.max(2, rowHeight * 0.22);
      const cellWidth = Math.max(8, right - left);
      const tightPadX = Math.max(2, cellWidth * 0.03);

      const regions = [
        // Die vorverarbeitete Planliste ist bereits auf bis zu 3200 px Breite skaliert.
        // Deshalb zuerst 1x lesen; 2x nur als geglätteten Sicherheitsversuch.
        [left + tightPadX, y0 - tightPadY, right - tightPadX, y1 + tightPadY, 1],
        [left - cellWidth * 0.08, y0 - tightPadY, right + cellWidth * 0.08, y1 + tightPadY, 2]
      ];

      // Als dritter Versuch beide Flugspalten gemeinsam, aber weiterhin nur dieselbe Zeile.
      const arrivalIndex = mapping?.arrivalFlight;
      const departureIndex = mapping?.departureFlight;
      if (arrivalIndex !== undefined && departureIndex !== undefined) {
        const a0 = Number(boundaries[Math.min(arrivalIndex, departureIndex)]);
        const a1 = Number(boundaries[Math.max(arrivalIndex, departureIndex) + 1]);
        if (Number.isFinite(a0) && Number.isFinite(a1) && a1 > a0) {
          regions.push([a0, y0 - tightPadY, a1, y1 + tightPadY, 1]);
        }
      }

      if (status) status.textContent = `Flugzelle Zeile ${ride.sourceRow} wird lokal eng nachgelesen …`;
      try {
        // CORE-004J: CORE-004I sammelte alle Varianten in einem Set. Schon ein einzelner
        // abweichender OCR-Versuch blockierte dadurch einen ansonsten stabil erkannten Flug.
        // Jetzt zählt jeder Crop höchstens eine Stimme. Übernommen wird nur:
        // 1) derselbe Kandidat aus mindestens zwei unabhängigen Crops oder
        // 2) genau ein Kandidat insgesamt, wenn alle übrigen Crops gar keinen Kandidaten liefern.
        const votes = new Map();
        const attempts = [];
        for (const [x0, cy0, x1, cy1, scale] of regions) {
          const crop = cropCanvasRegion(imageCanvas, x0, cy0, x1, cy1, scale);
          const second = await Tesseract.recognize(crop, 'eng');
          const candidates = [...new Set(
            flightCandidatesFromOcrResult(second)
              .map(candidate => sanitizeTargetedFlightCandidate(candidate, ride.planTime || ride.time))
              .filter(Boolean)
          )];
          attempts.push(candidates.slice());
          if (candidates.length === 1) {
            const candidate = candidates[0];
            votes.set(candidate, (votes.get(candidate) || 0) + 1);
          }
        }

        const ranked = [...votes.entries()].sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0]));
        let recovered = '';
        if (ranked.length === 1) {
          recovered = ranked[0][0];
        } else if (ranked.length > 1 && ranked[0][1] >= 2 && ranked[0][1] > ranked[1][1]) {
          recovered = ranked[0][0];
        }
        ride.flightTargetedOcrAttempts = attempts;
        if (!recovered) continue;
        ride.flightNumber = recovered;
        if (routeType === 'arrival') ride.arrivalFlight = recovered;
        if (routeType === 'departure') ride.departureFlight = recovered;
        ride.flightDirection = routeType;
        ride.flightRecoveredFromTargetedOcr = true;
        ride.flightNeedsManualCheck = true;
        ride.flightCheckConfidence = 'uncertain';
      } catch (_) {
        // Zweit-OCR ist nur Sicherheitsnetz. Bei Fehler bleibt die bestehende Warnung erhalten.
      }
    }
    return out;
  }

  function hasAmbiguousFlightPrefix(value) {
    const flight = normalizeFlightNumber(value);
    if (!flight) return false;
    // Flugdesignator ist in den ATMS-Listen in der Regel die ersten zwei Zeichen.
    // Nur 0/1 in diesem Prefix sind OCR-mehrdeutig; andere Ziffern bleiben unangetastet.
    return /^[A-Z0-9]{2}\d{1,4}[A-Z]?$/.test(flight) && /[01]/.test(flight.slice(0, 2));
  }

  function ambiguityEquivalentFlight(a, b) {
    const left = normalizeFlightNumber(a);
    const right = normalizeFlightNumber(b);
    if (!left || !right || left.length !== right.length || left === right) return false;
    const sameOrAmbiguous = (x, y) => {
      if (x === y) return true;
      const group1 = new Set(['I', '1', 'L']);
      const group0 = new Set(['O', '0']);
      return (group1.has(x) && group1.has(y)) || (group0.has(x) && group0.has(y));
    };
    for (let i = 0; i < left.length; i++) {
      if (!sameOrAmbiguous(left[i], right[i])) return false;
    }
    return true;
  }

  async function recoverAmbiguousFlightNumbersTargeted(rides, imageCanvas, imageMeta, mapping) {
    if (!imageCanvas || !imageMeta || !window.Tesseract) return rides;
    const status = $('importStatus');
    const out = (Array.isArray(rides) ? rides : []).map(ride => ({ ...ride }));

    for (let i = 0; i < out.length; i++) {
      const ride = out[i];
      const initial = normalizeFlightNumber(ride.flightNumber);
      if (!initial || !hasAmbiguousFlightPrefix(initial)) continue;

      const routeType = classifyRide(ride.pickup, ride.destination, ride.arrivalFlight, ride.departureFlight);
      const field = routeType === 'arrival' ? 'arrivalFlight' : routeType === 'departure' ? 'departureFlight' : '';
      const colIndex = field ? mapping?.[field] : undefined;
      const matrixIndex = Number(ride.sourceRow || 0) - 1;
      const rowMeta = imageMeta.rowMetaByMatrixIndex?.[matrixIndex];
      if (colIndex === undefined || !rowMeta) {
        ride.flightOcrAmbiguityNeedsReview = true;
        continue;
      }

      const boundaries = imageMeta.boundaries || [];
      const left = Number(boundaries[colIndex]);
      const right = Number(boundaries[colIndex + 1]);
      if (!Number.isFinite(left) || !Number.isFinite(right) || right <= left) {
        ride.flightOcrAmbiguityNeedsReview = true;
        continue;
      }

      const y0 = Number(rowMeta.y0 || 0);
      const y1 = Number(rowMeta.y1 || 0);
      const rowHeight = Math.max(18, y1 - y0);
      const cellWidth = Math.max(8, right - left);
      const padY = Math.max(2, rowHeight * 0.18);
      const padX = Math.max(2, cellWidth * 0.03);
      const regions = [
        [left + padX, y0 - padY, right - padX, y1 + padY, 1],
        [left + padX, y0 - padY, right - padX, y1 + padY, 2],
        [left + cellWidth * 0.08, y0 - rowHeight * 0.12, right - cellWidth * 0.08, y1 + rowHeight * 0.12, 3]
      ];

      if (status) status.textContent = `Mehrdeutige Flugzelle Zeile ${ride.sourceRow} wird lokal nachgelesen …`;
      const votes = new Map();
      const attempts = [];
      try {
        // CORE-005W1: Eine Tabellenzelle wird von Tesseract im Standard-Seitenmodus
        // bei I/1/L teils stabil falsch gelesen. Deshalb dieselben ENGEN Zell-Crops
        // zusätzlich als einzelne Textzeile bzw. einzelnes Wort lesen. Die Modi zählen
        // als getrennte OCR-Versuche; eine Korrektur braucht weiterhin >=2 Stimmen.
        const ocrModes = [
          { name: 'default', options: {} },
          { name: 'single-line', options: { tessedit_pageseg_mode: '7', tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' } },
          { name: 'single-word', options: { tessedit_pageseg_mode: '8', tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' } }
        ];
        for (const [x0, cy0, x1, cy1, scale] of regions) {
          const crop = cropCanvasRegion(imageCanvas, x0, cy0, x1, cy1, scale);
          for (const mode of ocrModes) {
            const second = await Tesseract.recognize(crop, 'eng', mode.options);
            const candidates = flightCandidatesFromOcrResult(second)
              .filter(candidate => candidate === initial || ambiguityEquivalentFlight(initial, candidate));
            attempts.push({ mode: mode.name, scale, candidates: candidates.slice() });
            if (candidates.length !== 1) continue;
            const candidate = candidates[0];
            votes.set(candidate, (votes.get(candidate) || 0) + 1);
          }
        }
      } catch (_) {
        ride.flightAmbiguousOcrAttempts = attempts;
        ride.flightOcrAmbiguityNeedsReview = true;
        continue;
      }

      ride.flightAmbiguousOcrAttempts = attempts;
      const ranked = [...votes.entries()].sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0]));
      const winner = ranked[0] || null;
      const runner = ranked[1] || null;

      // Nie aufgrund eines Einzel-Treffers korrigieren. Mindestens zwei enge Crops
      // muessen dieselbe alternative Lesart liefern und sie muss eindeutig gewinnen.
      if (winner && winner[0] !== initial && winner[1] >= 2 && (!runner || winner[1] > runner[1]) && ambiguityEquivalentFlight(initial, winner[0])) {
        const recovered = winner[0];
        ride.flightNumber = recovered;
        if (routeType === 'arrival') ride.arrivalFlight = recovered;
        if (routeType === 'departure') ride.departureFlight = recovered;
        ride.flightDirection = routeType;
        ride.flightOcrInitialAmbiguous = initial;
        ride.flightRecoveredFromAmbiguousOcr = true;
        ride.flightOcrAmbiguityNeedsReview = false;
        ride.flightNeedsManualCheck = true;
        ride.flightCheckConfidence = 'uncertain';
      } else {
        ride.flightOcrAmbiguityNeedsReview = true;
      }
    }
    return out;
  }

  // CORE-007D6: Wiederkehrende OCR-Texte nur dann vereinheitlichen, wenn
  // sich ihre Schreibweisen ausschließlich durch Trenner/Leerzeichen oder Groß-/
  // Kleinschreibung unterscheiden. Inhaltliche Buchstaben-/Ziffern-Abweichungen,
  // Diakritik-Abweichungen oder Einzelbeobachtungen bleiben unangetastet.
  function repeatedTextSignature(value) {
    const text = cellText(value).normalize('NFC').trim();
    if (!text) return '';
    return text
      .toLocaleLowerCase('de-DE')
      .replace(/[\s·._\-–—/:\\|]+/g, '');
  }

  function applyRepeatedTextConsistency(rides) {
    if (!Array.isArray(rides) || rides.length < 3) return rides;

    const fields = ['customer', 'company'];
    const out = rides.map(ride => ({ ...ride }));

    fields.forEach(field => {
      const groups = new Map();
      out.forEach((ride, index) => {
        const raw = cellText(ride?.[field]).normalize('NFC').trim();
        const signature = repeatedTextSignature(raw);
        // Kurze Codes/Initialen bleiben bewusst unberührt.
        if (!raw || signature.length < 4) return;
        if (!groups.has(signature)) groups.set(signature, []);
        groups.get(signature).push({ index, raw });
      });

      groups.forEach(entries => {
        if (entries.length < 3) return;
        const counts = new Map();
        entries.forEach(entry => counts.set(entry.raw, (counts.get(entry.raw) || 0) + 1));
        const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'de-DE'));
        const winner = ranked[0] || null;
        const runner = ranked[1] || null;

        // Mindestens zwei identische Beobachtungen und eine eindeutige Mehrheit.
        if (!winner || winner[1] < 2 || (runner && winner[1] <= runner[1])) return;

        entries.forEach(entry => {
          if (entry.raw === winner[0]) return;
          // Durch die gemeinsame Signature sind nur Separator-/Case-Varianten erlaubt.
          out[entry.index][field] = winner[0];
          out[entry.index].repeatedTextConsistency = {
            ...(out[entry.index].repeatedTextConsistency || {}),
            [field]: { from: entry.raw, to: winner[0], evidenceCount: winner[1] }
          };
          // Legacy-/UI-Alias nach einer Textvereinheitlichung erneut synchronisieren.
          out[entry.index].partner = cellText(out[entry.index].customer) || cellText(out[entry.index].company);
        });
      });
    });

    return out;
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
    let words = result?.data?.words || [];
    // CORE-007D4: Nur wenn kein sicherer Header vorhanden ist und die erste OCR
    // trotz mehrerer Zeitanker zu wenige Preisanker liefert, wird der linke
    // Preiskorridor zeilenweise gezielt nachgelesen. Das Ergebnis wird lediglich
    // als OCR-Anker ergänzt; die unveränderten Headerless-Sicherheitsguards
    // entscheiden anschließend weiterhin über Annahme oder Abbruch.
    words = await recoverHeaderlessPriceAnchorsTargeted(words, canvas, canvas.width);
    let matrix = imageWordsToMatrix(words, canvas.width);
    if (matrix.length <= 1) throw new Error('Im Bild wurden keine sicheren Fahrten erkannt. Bitte ein scharfes, vollständiges Querformat-Bild verwenden.');
    if (matrix._atmsImageMeta) {
      matrix = await recoverSyntheticImageRowsTargeted(matrix, canvas, matrix._atmsImageMeta);
      if (matrix._atmsImageMeta?.headerlessAtms) {
        matrix = await recoverHeaderlessCellsTargeted(matrix, canvas, matrix._atmsImageMeta);
        const recovery = matrix._atmsImageMeta?.headerlessCellRecovery;
        if (!recovery?.accepted) {
          const reason = cellText(recovery?.reason) || 'cell_recovery_not_accepted';
          const totalInvalid = Number(recovery?.totalInvalid || 0);
          const recoveredCells = Number(recovery?.recoveredCells || 0);
          throw new Error(`Der Ausschnitt ohne Kopfzeile blieb auch nach gezielter Zellprüfung nicht eindeutig genug. CORE-007D4 Diagnose: Grund=${reason} · UngültigeZellen=${totalInvalid} · Wiederhergestellt=${recoveredCells}. Bitte vollständige Kopfzeile mit hochladen.`);
        }
      }
    }
    return {
      kind: 'matrix',
      matrix,
      sheetName: 'Bild / WhatsApp',
      imageOcr: true,
      imageCanvas: canvas,
      imageMeta: matrix._atmsImageMeta || null
    };
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
    const imageMode = Boolean(state.file && isImageFile(state.file));
    // CORE-005A/007B: Mapping-Konfidenz ist eine technische Struktur-Sicherheit,
    // keine belegte Trefferquote aller Fahrtdaten. Sie bleibt intern erhalten,
    // wird beim Bildimport aber nicht mehr als allgemeine '% Erkennung' angezeigt.
    const shownConfidence = imageMode ? Math.min(Number(mappingInfo.confidence || 0), 0.99) : Number(mappingInfo.confidence || 0);
    if (!el) return;

    if (!imageMode) {
      el.innerHTML = `<b>${escapeHtml(mappingInfo.profile)}</b><span>${Math.round(shownConfidence * 100)} % Struktur-Sicherheit</span><small>${escapeHtml(labels.join(' · '))}</small>`;
      return;
    }

    const issues = Array.isArray(state.issues) ? state.issues : [];
    const actionable = issues.filter(issue => issue.kind !== 'flight_check');
    const errors = actionable.filter(issue => issue.level === 'error').length;
    const warnings = actionable.filter(issue => issue.level === 'warning').length;
    const rideCount = Array.isArray(state.rides) ? state.rides.length : 0;
    const clean = rideCount > 0 && errors === 0 && warnings === 0;
    const headline = clean
      ? '✓ OCR-Analyse sauber'
      : `OCR-Analyse · ${warnings} Hinweis${warnings === 1 ? '' : 'e'} · ${errors} Fehler`;
    const detail = rideCount
      ? `${rideCount}/${rideCount} Fahrten OCR-geprüft · ${warnings} Hinweis${warnings === 1 ? '' : 'e'} · ${errors} Fehler`
      : `${warnings} Hinweis${warnings === 1 ? '' : 'e'} · ${errors} Fehler`;

    // Technischen Wert maschinenlesbar behalten, ohne ihn als Erfolgsquote auszugeben.
    el.dataset.structureConfidence = String(Math.round(shownConfidence * 100));
    el.innerHTML = `<b>${escapeHtml(mappingInfo.profile)}</b><span>${escapeHtml(headline)}</span><small>${escapeHtml(detail)}<br>${escapeHtml(labels.join(' · '))}</small>`;
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

  function normalizeFlightForCurrentCheck(value) {
    let v = String(value || '').trim().toUpperCase().replace(/\s+/g, '');
    if (/^0S\d{1,4}[A-Z]?$/.test(v)) v = 'OS' + v.slice(2);
    return v;
  }

  function stagedFlightDirection(ride) {
    const explicit = String(ride?.flightDirection || '').trim().toLowerCase();
    if (explicit === 'arrival' || explicit === 'departure') return explicit;
    if (ride?.arrivalFlight) return 'arrival';
    if (ride?.departureFlight) return 'departure';
    const inferred = classifyRide(ride?.pickup, ride?.destination, ride?.arrivalFlight, ride?.departureFlight);
    return inferred === 'arrival' || inferred === 'departure' ? inferred : 'unknown';
  }

  function checkedSourceCount(item) {
    const declared = Number(item?.sourceCount);
    if (Number.isFinite(declared) && declared >= 0) return declared;
    const sources = Array.isArray(item?.sources) ? item.sources : [];
    const keys = new Set(sources.map(source => {
      if (typeof source === 'string') return source.trim().toLowerCase();
      return String(source?.url || source?.name || '').trim().toLowerCase();
    }).filter(Boolean));
    return keys.size;
  }

  function findCheckedFlightForRide(ride, checked) {
    const flight = normalizeFlightForCurrentCheck(ride?.flightNumber);
    if (!flight) return null;
    const date = cellText(ride?.date);
    const direction = stagedFlightDirection(ride);
    const flightTime = cellText(ride?.flightTime);
    const candidates = (Array.isArray(checked) ? checked : []).filter(item => {
      if (normalizeFlightForCurrentCheck(item?.flightNumber) !== flight) return false;
      const checkedDate = cellText(item?.date);
      if (date ? checkedDate !== date : Boolean(checkedDate)) return false;
      const checkedDirection = String(item?.direction || 'unknown').trim().toLowerCase();
      if (direction !== 'unknown' ? checkedDirection !== direction : checkedDirection !== 'unknown') return false;
      return true;
    });
    if (!candidates.length) return null;
    if (flightTime) {
      const exact = candidates.filter(item => cellText(item?.flightTime) === flightTime);
      if (exact.length === 1) return exact[0];
      if (exact.length > 1) return null;
      if (candidates.length === 1 && !cellText(candidates[0]?.flightTime)) return candidates[0];
      return null;
    }
    return candidates.length === 1 ? candidates[0] : null;
  }

  function stagedPlanIsActive() {
    return Boolean(state.rides.length && $('planAnalysis') && !$('planAnalysis').classList.contains('hidden'));
  }

  function applyGeminiResultsToStagedPlan(checked, appliedAt = new Date().toISOString()) {
    if (!Array.isArray(checked) || !checked.length || !state.rides.length) {
      return { matchedRides: 0, verifiedRides: 0, uncertainRides: 0 };
    }
    let matchedRides = 0, verifiedRides = 0, uncertainRides = 0;
    state.rides = state.rides.map(ride => {
      const hit = findCheckedFlightForRide(ride, checked);
      if (!hit) return ride;
      matchedRides++;
      const location = cellText(hit?.flightLocation || hit?.relevantLocation);
      const iata = String(hit?.iata || hit?.relevantIata || '').trim().toUpperCase();
      const confidence = String(hit?.confidence || '').trim().toLowerCase();
      const status = String(hit?.status || '').trim().toLowerCase();
      const verified = status === 'verified' && (confidence === 'verified' || confidence === 'high') && Boolean(location) && !Boolean(hit?.conflict) && checkedSourceCount(hit) >= 2;
      if (verified) verifiedRides++; else uncertainRides++;
      return {
        ...ride,
        flightLocation: verified ? normalizeFlightLocation(location) : ride.flightLocation,
        iata: verified && /^[A-Z]{3}$/.test(iata) ? iata : (ride.iata || ''),
        flightCheckConfidence: verified ? 'verified' : 'uncertain',
        flightNeedsManualCheck: !verified,
        flightCheckSourceNote: cellText(hit?.sourceNote) || ride.flightCheckSourceNote || '',
        flightCheckedAt: appliedAt,
        flightAutoModel: cellText(hit?.modelUsed)
      };
    });
    state.issues = validate(state.rides);
    render();
    return { matchedRides, verifiedRides, uncertainRides };
  }

  window.ATMSPlanImportHasStagedRides = stagedPlanIsActive;
  window.ATMSPlanImportApplyGeminiFlightResults = applyGeminiResultsToStagedPlan;

  function refreshIssuesAfterFlightSync() {
    // CORE-004P: Bei einem neuen Import keine alten gespeicherten Flugorte automatisch
    // als aktuelle Wahrheit zurück in die Planliste schreiben. Jede neue Liste wird neu geprüft.
    state.issues = validate(state.rides);
  }


  function resolvePriceIssue(rideId, action, priceValue) {
    const ride = state.rides.find(item => String(item.id) === String(rideId));
    if (!ride) return;

    if (action === 'suggestion' || action === 'manual') {
      const value = Number(priceValue);
      if (!Number.isFinite(value) || value <= 0) {
        if (typeof window.showToast === 'function') window.showToast('Bitte einen gültigen Preis eingeben', 'warn');
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
    } else if (action === 'zero') {
      ride.price = 0;
      state.priceDecisions[String(rideId)] = 'zero';
      if (typeof window.showToast === 'function') window.showToast('0,00 € als korrekt bestätigt', 'ok');
    } else if (action === 'original') {
      state.priceDecisions[String(rideId)] = 'original';
      if (typeof window.showToast === 'function') window.showToast('Originalpreis bestätigt', 'ok');
    }

    state.issues = validate(state.rides);
    render();
  }

  function render() {
    refreshIssuesAfterFlightSync();
    const rides = state.rides, issues = state.issues;
    const flightChecks = issues.filter(issue => issue.kind === 'flight_check');
    const actionableIssues = issues.filter(issue => issue.kind !== 'flight_check');
    const errors = actionableIssues.filter(issue => issue.level === 'error').length;
    const warnings = actionableIssues.filter(issue => issue.level === 'warning').length;
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

    const actionableHtml = actionableIssues.length
      ? actionableIssues.slice(0, 20).map(issue => {
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

          if (issue.kind === 'price') {
            const suggestion = Number(issue.suggestedPrice);
            const suggestionLabel = Number.isFinite(suggestion) && suggestion > 0
              ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(suggestion)
              : '';
            const originalLabel = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(issue.originalPrice) || 0);
            if (issue.missingPrice) {
              return `<div class="plan-issue ${issue.level}" style="padding-bottom:12px">
                <div><b>${rowLabel}</b> · ${escapeHtml(issue.text)}</div>
                <input type="text" inputmode="decimal" class="price-manual-input" data-ride-id="${escapeHtml(issue.rideId)}" placeholder="Preis z. B. 47,60" style="width:100%;box-sizing:border-box;margin-top:10px;padding:11px;border-radius:10px">
                <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
                  <button type="button" class="price-review-btn" data-price-action="manual" data-ride-id="${escapeHtml(issue.rideId)}" style="flex:1;min-width:145px;padding:10px;border-radius:10px;font-weight:800">Preis übernehmen</button>
                  <button type="button" class="price-review-btn" data-price-action="zero" data-ride-id="${escapeHtml(issue.rideId)}" style="flex:1;min-width:145px;padding:10px;border-radius:10px;font-weight:800">0,00 € ist korrekt</button>
                </div>
              </div>`;
            }
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
      : '<div class="plan-issue ok">✓ OCR-Analyse sauber: Keine ungelösten OCR-Hinweise.</div>';

    const flightCheckHtml = flightChecks.length
      ? `<div class="plan-issue" style="margin-top:10px;border-color:rgba(72,156,255,.45);background:rgba(7,33,63,.45)">
          <div><b>✈ Flugprüfung offen: ${escapeHtml(String(flightChecks.length))}</b></div>
          <div style="font-size:12px;opacity:.82;margin-top:5px">Diese Punkte stammen aus fehlenden oder noch nicht verifizierten Flugorten und zählen nicht als OCR-Fehler.</div>
          <div style="font-size:12px;line-height:1.5;margin-top:7px">${flightChecks.map(issue => escapeHtml(issue.flightNumber || '')).filter(Boolean).join(' · ')}</div>
        </div>`
      : '<div class="plan-issue ok" style="margin-top:10px">✓ Keine Flugprüfung offen.</div>';

    $('planIssues').innerHTML = actionableHtml + flightCheckHtml;

    $('planIssues').querySelectorAll('.date-boundary-btn').forEach(button => {
      button.addEventListener('click', () => {
        resolveDateBoundary(button.dataset.dateAction);
      });
    });

    $('planIssues').querySelectorAll('.price-review-btn').forEach(button => {
      button.addEventListener('click', () => {
        let value = button.dataset.suggestedPrice;
        if (button.dataset.priceAction === 'manual') {
          const input = Array.from($('planIssues').querySelectorAll('.price-manual-input'))
            .find(item => String(item.dataset.rideId) === String(button.dataset.rideId));
          value = parseNumber(input?.value || '');
        }
        resolvePriceIssue(
          button.dataset.rideId,
          button.dataset.priceAction,
          value
        );
      });
    });

    $('planPreviewBody').innerHTML = rides.slice(0, 80).map(ride => {
      const rowIssues = actionableIssues.filter(issue => Array.isArray(issue.rows) ? issue.rows.includes(ride.sourceRow) : issue.row === ride.sourceRow);
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

    $('importPlanBtn').disabled = rides.length === 0 || errors > 0 || actionableIssues.some(issue => issue.kind === 'price');
    const unresolvedPriceIssues = actionableIssues.filter(issue => issue.kind === 'price').length;
    $('importStatus').textContent = errors
      ? `${rides.length} Fahrten erkannt. ${errors} Fehler müssen vor dem Import behoben werden.`
      : unresolvedPriceIssues
        ? `${rides.length} Fahrten erkannt. ${unresolvedPriceIssues} auffälliger Preis muss vor der Übernahme bestätigt werden.`
        : flightChecks.length
          ? `${rides.length} Fahrten erkannt und OCR-geprüft. ${flightChecks.length} Flugprüfung(en) offen. Bereit zur Übernahme.`
          : `${rides.length} Fahrten erkannt und OCR-geprüft. Bereit zur Übernahme.`;
  }

  async function analyze() {
    if (!state.file) return;
    try {
      currentPlanDate();
      $('importStatus').textContent = isImageFile(state.file) ? 'Bildanalyse wird vorbereitet …' : 'Planliste wird analysiert …';
      const result = await readFile(state.file);
      if (result.kind === 'json') {
        const detectedJsonDate = detectPlanDateFromJsonRows(result.rows);
        if (detectedJsonDate) setDetectedPlanDate(detectedJsonDate, 'JSON');
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
      const detectedMatrixDate = detectPlanDateFromMatrix(matrix);
      if (detectedMatrixDate) setDetectedPlanDate(detectedMatrixDate, result.imageOcr ? 'Bildinhalt' : 'Planliste');
      const headerDetection = detectHeader(matrix);
      if (headerDetection.score < 3) throw new Error('Die Überschriften der Planliste wurden nicht eindeutig erkannt. Erwartet werden unter anderem Uhrzeit, Von und Nach.');
      const headers = uniqueHeaders(matrix[headerDetection.index]);
      let mappingInfo = detectAtmsMapping(headers);
      if (mappingInfo.confidence < 0.75) mappingInfo = genericMapping(headers);
      if (result.imageOcr) {
        const syntheticCount = Number(result.imageMeta?.syntheticAnchorCount || 0);
        const headerlessAtms = Boolean(result.imageMeta?.headerlessAtms);
        // Kopfzeilenlose Ausschnitte bleiben intern bewusst konservativer bewertet.
        // Die Prozentzahl wird seit CORE-007B nicht als Erfolgsquote angezeigt.
        const structuralCap = headerlessAtms
          ? 0.82
          : (syntheticCount ? Math.max(0.80, 0.98 - syntheticCount * 0.03) : 0.99);
        mappingInfo = {
          ...mappingInfo,
          confidence: Math.min(Number(mappingInfo.confidence || 0), structuralCap),
          profile: headerlessAtms
            ? 'ATMS Bildimport Flex · Kopfzeile sicher rekonstruiert'
            : (mappingInfo.confidence >= 0.85 ? 'ATMS Bildimport Flex' : 'ATMS Bildimport – Prüfung nötig')
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
        rides.push(makeRide(row, sourceRow, mappingInfo.mapping, state.file.name, { imageOcr: Boolean(result.imageOcr) }));
      });
      if (!rides.length) throw new Error('Unterhalb der Überschriften wurden keine Fahrten erkannt.');

      let preparedRides = rides;
      if (result.imageOcr && result.imageCanvas && result.imageMeta) {
        preparedRides = await recoverMissingRideTimesTargeted(
          preparedRides,
          result.imageCanvas,
          result.imageMeta,
          mappingInfo.mapping
        );
        preparedRides = await recoverSuspiciousRideTimesTargeted(
          preparedRides,
          result.imageCanvas,
          result.imageMeta,
          mappingInfo.mapping
        );
        preparedRides = await recoverSuspiciousPricesTargeted(
          preparedRides,
          result.imageCanvas,
          result.imageMeta,
          mappingInfo.mapping
        );
        preparedRides = await recoverRouteDiacriticsTargeted(
          preparedRides,
          result.imageCanvas,
          result.imageMeta,
          mappingInfo.mapping
        );
        preparedRides = await recoverMissingDriversTargeted(
          preparedRides,
          result.imageCanvas,
          result.imageMeta,
          mappingInfo.mapping
        );
        preparedRides = await recoverDriverColumnConsensusTargeted(
          preparedRides,
          result.imageCanvas,
          result.imageMeta,
          mappingInfo.mapping
        );
        preparedRides = await recoverMissingFlightNumbersTargeted(
          preparedRides,
          result.imageCanvas,
          result.imageMeta,
          mappingInfo.mapping
        );
        preparedRides = await recoverAmbiguousFlightNumbersTargeted(
          preparedRides,
          result.imageCanvas,
          result.imageMeta,
          mappingInfo.mapping
        );
        preparedRides = applyRepeatedTextConsistency(preparedRides);
      }

      state.matrix = matrix;
      state.rides = assignRideDates(preparedRides);
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
    if (file) {
      const detectedFileDate = detectPlanDateFromFile(file);
      if (detectedFileDate) setDetectedPlanDate(detectedFileDate, 'Dateiname');
    }
    $('analyzePlanBtn').disabled = !file;
    $('importPlanBtn').disabled = true;
    $('planAnalysis').classList.add('hidden');
    const planDate = currentPlanDate();
    $('importStatus').textContent = file ? `Ausgewählt: ${file.name} · Plantag ${formatPlanDate(planDate)}. Jetzt „Planliste analysieren“ tippen.` : 'Noch keine Planliste ausgewählt.';
  }

  window.addEventListener('atms:gemini-flight-result', event => {
    if (!state.rides.length) return;
    if (event?.detail?.scope === 'staged-auto') return;
    try {
      const checked = event?.detail?.checked;
      if (Array.isArray(checked) && checked.length) {
        applyGeminiResultsToStagedPlan(checked, new Date().toISOString());
      } else {
        state.issues = validate(state.rides);
        render();
      }
    } catch (_) {}
  });

  function importRides() {
    if (!state.rides.length) return;
    try {
      const normalized = state.rides.map((ride, index) => window.norm ? window.norm(ride, index) : ride);
      if (typeof window.applyImportedRides !== 'function') throw new Error('ATMS-Importfunktion ist nicht verfügbar.');
      localStorage.removeItem('atms_beta_14_3_1_rides');
       localStorage.removeItem('atms_beta_14_3_1_done');

       const result = window.applyImportedRides(normalized);
      if (result.cancelled) { $('importStatus').textContent = 'Import abgebrochen.'; return; }
      $('jsonInput').value = JSON.stringify({ rides: normalized }, null, 2);
      $('importStatus').textContent = result.mode === 'merge' ? `${result.count} Fahrten zusammengeführt.` : `${result.count} Fahrten übernommen.`;
      if (typeof window.showToast === 'function') window.showToast(`${result.count} Fahrten importiert`, 'ok');
      if (typeof window.render === 'function') window.render();
    } catch (error) {
      $('importStatus').textContent = `Importfehler: ${error.message}`;
    }
  }

  async function runAutomaticFlightCheck() {
    if (!state.rides.length) return;
    const status = $('importStatus');
    const button = $('copyFlightCheckBtn');
    const fallbackButton = $('copyFlightCheckFallbackBtn');
    const service = window.ATMSAutoFlight;
    const quotaSessionKey = 'atms_auto_flight_quota_blocked_session';

    if (sessionStorage.getItem(quotaSessionKey) === '1') {
      if (fallbackButton) fallbackButton.style.display = '';
      if (status) status.textContent = 'Automatische Flugprüfung ist in dieser Sitzung wegen erreichtem Gemini-Kontingent pausiert. Es werden keine weiteren Quota-Aufrufe gesendet. Bitte „Fallback: Prüfauftrag kopieren“ verwenden.';
      if (typeof window.showToast === 'function') window.showToast('Gemini-Kontingent erreicht · Fallback verwenden', 'warn');
      return;
    }

    if (!service || typeof service.verifyFlights !== 'function') {
      if (status) status.textContent = 'Automatische Flugprüfung ist noch nicht verfügbar. Der manuelle Prüfauftrag bleibt als Fallback verfügbar.';
      if (fallbackButton) fallbackButton.style.display = '';
      if (typeof window.showToast === 'function') window.showToast('Automatische Flugprüfung nicht verfügbar', 'warn');
      return;
    }

    if (button) {
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
    }
    if (fallbackButton) fallbackButton.style.display = 'none';

    try {
      if (status) status.textContent = 'Automatische aktuelle Flugprüfung wird gestartet …';
      const result = await service.verifyFlights(state.rides, {
        onProgress: progress => {
          if (!status) return;
          const current = Number(progress?.current || 0);
          const total = Number(progress?.total || 0);
          const flight = cellText(progress?.flightNumber);
          status.textContent = `Aktuelle Flugprüfung ${current}/${total}${flight ? ` · ${flight}` : ''} …`;
        }
      });

      const checked = Array.isArray(result?.checked) ? result.checked : [];
      if (!checked.length) throw new Error('Die automatische Flugprüfung hat kein auswertbares Ergebnis zurückgegeben.');

      const applied = applyGeminiResultsToStagedPlan(checked, cellText(result?.completedAt) || new Date().toISOString());
      if (typeof service.renderGrounding === 'function') service.renderGrounding(result?.grounding || []);

      const technicalFailures = Number(result?.technicalFailureCount || 0);
      const firstTechnicalError = cellText(result?.firstTechnicalError);
      const quotaFailure = technicalFailures > 0 && /(?:\b429\b|quota|rate[ -]?limit|exceeded)/i.test(firstTechnicalError);
      if (technicalFailures > 0) {
        if (fallbackButton) fallbackButton.style.display = '';
        if (quotaFailure) {
          sessionStorage.setItem(quotaSessionKey, '1');
          if (status) status.textContent = `Automatische Flugprüfung: ${applied.verifiedRides} Fahrt(en) sicher aktualisiert · ${applied.uncertainRides} unsicher. Gemini-Kontingent ist derzeit erreicht; weitere automatische Aufrufe werden in dieser Sitzung gestoppt. Vorhandene Flugorte bleiben erhalten. Bitte „Fallback: Prüfauftrag kopieren“ verwenden.`;
          if (typeof window.showToast === 'function') window.showToast('Gemini-Kontingent erreicht · Fallback verwenden', 'warn');
        } else {
          if (status) status.textContent = `Automatische Flugprüfung: ${applied.verifiedRides} Fahrt(en) sicher aktualisiert · ${applied.uncertainRides} unsicher. Technischer Fehler bei ${technicalFailures} Flug/Flügen. Vorhandene Flugorte bleiben bei Unsicherheit erhalten.`;
          if (typeof window.showToast === 'function') window.showToast('Flugprüfung teilweise technisch fehlgeschlagen', 'warn');
        }
      } else {
        if (status) status.textContent = `Automatische Flugprüfung abgeschlossen: ${applied.verifiedRides} Fahrt(en) sicher aktualisiert · ${applied.uncertainRides} unsicher → vorhandener Flugort bleibt.`;
        if (typeof window.showToast === 'function') window.showToast('Automatische Flugprüfung abgeschlossen', applied.uncertainRides ? 'warn' : 'ok');
      }

      try {
        window.dispatchEvent(new CustomEvent('atms:gemini-flight-result', { detail: { checked, scope: 'staged-auto' } }));
      } catch (_) {}
    } catch (error) {
      if (fallbackButton) fallbackButton.style.display = '';
      const message = cellText(error?.message) || 'unbekannter technischer Fehler';
      const quotaFailure = /(?:\b429\b|quota|rate[ -]?limit|exceeded)/i.test(message);
      if (quotaFailure) {
        sessionStorage.setItem(quotaSessionKey, '1');
        if (status) status.textContent = 'Automatische Flugprüfung derzeit wegen erreichtem Gemini-Kontingent nicht verfügbar. Es wurden keine Fahrtdaten überschrieben und in dieser Sitzung werden keine weiteren Quota-Aufrufe gesendet. Bitte „Fallback: Prüfauftrag kopieren“ verwenden.';
        if (typeof window.showToast === 'function') window.showToast('Gemini-Kontingent erreicht · Fallback verwenden', 'warn');
      } else {
        if (status) status.textContent = `Automatische Flugprüfung technisch fehlgeschlagen: ${message}. Vorhandene Fahrtdaten wurden nicht überschrieben. Fallback-Prüfauftrag ist verfügbar.`;
        if (typeof window.showToast === 'function') window.showToast('Automatische Flugprüfung fehlgeschlagen', 'warn');
      }
    } finally {
      if (button) {
        button.disabled = !state.rides.some(ride => ride.flightNumber);
        button.removeAttribute('aria-busy');
      }
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
    $('copyFlightCheckBtn')?.addEventListener('click', runAutomaticFlightCheck);
    $('copyFlightCheckFallbackBtn')?.addEventListener('click', copyFlightCheckPrompt);
    if (drop) {
      ['dragenter','dragover'].forEach(name => drop.addEventListener(name, event => { event.preventDefault(); drop.classList.add('over'); }));
      ['dragleave','drop'].forEach(name => drop.addEventListener(name, event => { event.preventDefault(); drop.classList.remove('over'); }));
      drop.addEventListener('drop', event => {
        const file = event.dataTransfer.files && event.dataTransfer.files[0];
        if (file) selectFile(file);
      });
    }
  }


  // CORE-005J:
  // Preis und PLAN/DISPO/LIVE werden jetzt nativ in app.js / pwa.js gerendert.
  // Kein MutationObserver-/Textknoten-Hack mehr in plan-import.js.

  document.addEventListener('DOMContentLoaded', init);
})();
