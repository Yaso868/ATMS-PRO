(() => {
  'use strict';

  const PROFILE_KEY = 'atms_import_profile_v1';
  const state = { file: null, matrix: [], rides: [], issues: [], meta: {}, mapping: null };
  const $ = id => document.getElementById(id);
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const cleanKey = value => String(value || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '');
  const cellText = value => value === null || value === undefined ? '' : String(value).trim();

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
    const match = text.match(/(?:^|\s)(\d{1,2})[:.](\d{2})(?:\s|$)/);
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

  function fieldForHeader(header, counters) {
    const key = header.key;
    const occurrence = header.occurrence;
    if (key === 'uhrzeit') return occurrence === 1 ? 'time' : 'flightTime';
    if (key === 'wg') return occurrence === 1 ? 'vehicle' : 'driver';
    for (const [field, list] of Object.entries(aliases)) {
      if (list.includes(key)) return field;
    }
    counters[key] = (counters[key] || 0) + 1;
    return '';
  }

  function detectAtmsMapping(headers) {
    const counters = {};
    const mapping = {};
    headers.forEach(header => {
      const field = fieldForHeader(header, counters);
      if (field && mapping[field] === undefined) mapping[field] = header.index;
    });
    const confidenceFields = ['time','pickup','destination','driver'];
    const confidence = confidenceFields.filter(field => mapping[field] !== undefined).length / confidenceFields.length;
    return { mapping, confidence, profile: confidence >= 0.75 ? 'ATMS Standard-Planliste' : 'Automatische Spaltenerkennung' };
  }

  function genericMapping(headers) {
    const mapping = {};
    for (const [field, list] of Object.entries(aliases)) {
      const match = headers.find(header => list.includes(header.key));
      if (match) mapping[field] = match.index;
    }
    return { mapping, confidence: ['time','pickup','destination'].filter(field => mapping[field] !== undefined).length / 3, profile: 'Allgemeiner Tabellenimport' };
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
    if (mapped) return mapped;

    // ATMS Standard Planliste: erste Wg-Spalte = Fahrzeug
    const fixedVehicle = cellText(row[9]);
    return fixedVehicle || 'Pkw';
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
      date: '',
      time: normalizeTime(valueAt(row, mapping, 'time')),
      planTime: normalizeTime(valueAt(row, mapping, 'time')),
      flightTime: normalizeTime(valueAt(row, mapping, 'flightTime')),
      pickup,
      destination,
      customer,
      company,
      partner: company,
      arrivalFlight,
      departureFlight,
      flightNumber,
      flightDirection: arrivalFlight ? 'arrival' : departureFlight ? 'departure' : '',
      flightLocation: cellText(valueAt(row, mapping, 'flightLocation')),
      vehicle: getVehicleValue(row, mapping),
      persons: parseNumber(valueAt(row, mapping, 'persons')),
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
    rides.forEach(ride => {
      const row = ride.sourceRow;
      if (!ride.time) issues.push({ level: 'error', row, text: 'Abholzeit fehlt' });
      if (!ride.pickup) issues.push({ level: 'error', row, text: 'Abholort fehlt' });
      if (!ride.destination) issues.push({ level: 'error', row, text: 'Ziel fehlt' });
      if (!ride.driver) issues.push({ level: 'warning', row, text: 'Fahrer fehlt – Fahrt bleibt offen' });
      if (ride.flightNumber && !looksLikeFlight(ride.flightNumber)) issues.push({ level: 'warning', row, text: `Flugnummer „${ride.flightNumber}“ bitte prüfen` });
      if (ride.flightNumber && !ride.flightLocation) issues.push({ level: 'warning', row, text: `Flugort für ${ride.flightNumber} fehlt – aktuelle Gemini-Prüfung empfohlen` });
      if (ride.persons < 0) issues.push({ level: 'warning', row, text: 'Personenzahl ist ungültig' });
      const fingerprint = [ride.time, cleanKey(ride.pickup), cleanKey(ride.destination), cleanKey(ride.driver), ride.flightNumber].join('|');
      if (fingerprints.has(fingerprint)) issues.push({ level: 'warning', row, text: 'Mögliche doppelte Fahrt erkannt' });
      fingerprints.add(fingerprint);
    });
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

  // ATMS Bild-Planliste: 13 echte Spalten.
  // Wichtig: Zwischen "Firma" und "Flug ang." gibt es KEINE zusätzliche Uhrzeit-Spalte.
  const IMAGE_HEADERS = ['Preis','Uhrzeit','Von','Nach','Name','Firma','Flug ang.','Flug ausg.','Wg','Pers','Uhrzeit','Ort','Wg'];
  const IMAGE_COLUMN_RATIOS = [0,0.06,0.107,0.260,0.396,0.486,0.547,0.612,0.675,0.718,0.759,0.823,0.931,1.001];

  function imageWordsToMatrix(words, width) {
    const usable = (words || []).filter(w => {
      const text = cellText(w.text);
      const conf = Number(w.confidence ?? w.conf ?? 0);
      return text && conf >= 28 && w.bbox;
    }).map(w => ({
      text: cellText(w.text),
      x0: w.bbox.x0, x1: w.bbox.x1,
      y0: w.bbox.y0, y1: w.bbox.y1,
      cy: (w.bbox.y0 + w.bbox.y1) / 2
    })).sort((a,b) => a.cy - b.cy || a.x0 - b.x0);

    const heights = usable.map(w => Math.max(1, w.y1 - w.y0)).sort((a,b)=>a-b);
    const medianH = heights.length ? heights[Math.floor(heights.length/2)] : 20;
    const tolerance = Math.max(10, medianH * 0.75);
    const lines = [];
    usable.forEach(word => {
      let line = lines.find(l => Math.abs(l.cy - word.cy) <= tolerance);
      if (!line) { line = { cy: word.cy, words: [] }; lines.push(line); }
      line.words.push(word);
      line.cy = line.words.reduce((sum,w)=>sum+w.cy,0) / line.words.length;
    });
    lines.sort((a,b)=>a.cy-b.cy);

    const rows = [];
    lines.forEach(line => {
      const cells = Array(14).fill('').map(()=>[]);
      line.words.sort((a,b)=>a.x0-b.x0).forEach(word => {
        const cx = (word.x0 + word.x1) / 2 / width;
        let col = IMAGE_COLUMN_RATIOS.findIndex((r,i)=>i<IMAGE_COLUMN_RATIOS.length-1 && cx >= r && cx < IMAGE_COLUMN_RATIOS[i+1]);
        if (col < 0) col = 13;
        cells[col].push(word.text);
      });
      const row = cells.map(parts => parts.join(' ').replace(/\s+/g,' ').trim());
      const time = normalizeTime(row[1]);
      const hasRoute = row[2] || row[3];
      if ((/^\d{1,2}:\d{2}$/.test(time) || /^\d{3,4}$/.test(row[1].replace(/\D/g,''))) && hasRoute) {
        row[1] = time;
        rows.push(row);
      }
    });
    return [IMAGE_HEADERS, ...rows];
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

  function render() {
    const rides = state.rides, issues = state.issues;
    const errors = issues.filter(issue => issue.level === 'error').length;
    const warnings = issues.filter(issue => issue.level === 'warning').length;
    $('planAnalysis').classList.remove('hidden');
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
      ? issues.slice(0, 20).map(issue => `<div class="plan-issue ${issue.level}"><b>Zeile ${issue.row}</b> · ${escapeHtml(issue.text)}</div>`).join('')
      : '<div class="plan-issue ok">✓ Keine kritischen Probleme erkannt.</div>';

    $('planPreviewBody').innerHTML = rides.slice(0, 80).map(ride => {
      const rowIssues = issues.filter(issue => issue.row === ride.sourceRow);
      const status = rowIssues.some(issue => issue.level === 'error') ? 'Fehler' : rowIssues.length ? 'Prüfen' : 'OK';
      const typeLabels = { arrival: 'Ankunft', departure: 'Abflug', hotel: 'Hotel', transfer: 'Transfer' };
      return `<tr>
        <td>${escapeHtml(ride.time || '–')}</td>
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

    $('importPlanBtn').disabled = rides.length === 0 || errors > 0;
    $('importStatus').textContent = errors
      ? `${rides.length} Fahrten erkannt. ${errors} Fehler müssen vor dem Import behoben werden.`
      : `${rides.length} Fahrten erkannt und geprüft. Bereit zur Übernahme.`;
  }

  async function analyze() {
    if (!state.file) return;
    try {
      $('importStatus').textContent = isImageFile(state.file) ? 'Bildanalyse wird vorbereitet …' : 'Planliste wird analysiert …';
      const result = await readFile(state.file);
      if (result.kind === 'json') {
        state.rides = result.rows.map((ride, index) => window.norm ? window.norm(ride, index) : ride);
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
      if (mappingInfo.confidence < 1) {
        const missing = ['time','pickup','destination'].filter(field => mappingInfo.mapping[field] === undefined);
        if (missing.length) throw new Error(`Pflichtspalten nicht erkannt: ${missing.join(', ')}.`);
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
      state.rides = window.ATMSFlight ? window.ATMSFlight.prepareRides(rides) : rides;
      state.mapping = mappingInfo.mapping;
      state.meta = { sheetName: result.sheetName, headerRow: headerDetection.index + 1, profile: result.imageOcr ? 'ATMS Bildimport Alpha' : mappingInfo.profile };
      if (result.imageOcr) mappingInfo = { ...mappingInfo, profile: 'ATMS Bildimport Alpha' };
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
    $('analyzePlanBtn').disabled = !file;
    $('importPlanBtn').disabled = true;
    $('planAnalysis').classList.add('hidden');
    $('importStatus').textContent = file ? `Ausgewählt: ${file.name}. Jetzt „Planliste analysieren“ tippen.` : 'Noch keine Planliste ausgewählt.';
  }

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
