// ATMS PRO · CORE-004D · FLIGHT-011
// 12.08.2026 14:54 Uhr (Europe/Berlin)
// Firebase AI Logic + App Check + Gemini Developer API + Google Search grounding.
// Dieses Modul sendet niemals die vollständige Planliste oder das Planlistenbild an Gemini.
// Pro Request werden nur Flugnummer, Datum, Richtung, ggf. Flugzeit und ein vorhandener
// Flugort als Vergleichswert übertragen.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js';
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider
} from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-app-check.js';
import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend
} from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-ai.js';

const VERSION = 'CORE-004D-FLIGHT-011';
const MODEL_NAME = 'gemini-2.5-flash';

// Firebase-Web-Konfiguration: öffentliche App-Kennungen, keine Server-Secrets.
const firebaseConfig = {
  apiKey: 'AIzaSyA6Q_-YcmPhadF6hrgW-gttE2jCdKtlRGQ',
  authDomain: 'atms-pro.firebaseapp.com',
  projectId: 'atms-pro',
  storageBucket: 'atms-pro.firebasestorage.app',
  messagingSenderId: '112440704342',
  appId: '1:112440704342:web:8497a736d13dda91fd2af7'
};

// Öffentlicher reCAPTCHA-Enterprise-Site-Key für Firebase App Check.
const RECAPTCHA_ENTERPRISE_SITE_KEY = '6LegC4ItAAAAAFQygTQonjTOhe8X9CwKKa8I5iHe';

// Gemini 2.5 Flash supports Google Search grounding and structured output separately,
// but strict responseSchema + built-in tools in the same request is a Gemini 3 feature.
// CORE-004D therefore uses grounded text generation and validates/parses the JSON locally.


let initPromise = null;
let model = null;

const text = value => String(value ?? '').trim();
const upper = value => text(value).toUpperCase().replace(/\s+/g, '');

function normalizeDirection(ride) {
  if (ride?.flightDirection === 'arrival' || ride?.arrivalFlight) return 'arrival';
  if (ride?.flightDirection === 'departure' || ride?.departureFlight) return 'departure';
  return '';
}

function relevantSide(direction) {
  return direction === 'arrival' ? 'origin' : direction === 'departure' ? 'destination' : 'unknown';
}

function isRealFlightNumber(value) {
  const v = upper(value);
  if (!v || /^(VAN|PKW|BUS|SPRINTER|TAXI|WG)$/.test(v)) return false;
  return /^[A-Z0-9]{2,3}\d{1,4}[A-Z]?$/.test(v);
}

function safeHost(uri) {
  try { return new URL(uri).hostname.replace(/^www\./, ''); } catch (_) { return ''; }
}

function parseJsonObject(raw) {
  const source = text(raw);
  if (!source) return {};
  const attempts = [
    source,
    source.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
  ];
  const first = source.indexOf('{');
  const last = source.lastIndexOf('}');
  if (first >= 0 && last > first) attempts.push(source.slice(first, last + 1));
  for (const candidate of attempts) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    } catch (_) {}
  }
  return {};
}

function sameText(a, b) {
  return text(a).toLocaleLowerCase('de-DE').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '') ===
         text(b).toLocaleLowerCase('de-DE').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
}

function extractGrounding(response) {
  const metadata = response?.candidates?.[0]?.groundingMetadata || null;
  const chunks = Array.isArray(metadata?.groundingChunks) ? metadata.groundingChunks : [];
  const sourceMap = new Map();

  for (const chunk of chunks) {
    const web = chunk?.web;
    const uri = text(web?.uri);
    const title = text(web?.title) || safeHost(uri);
    if (!uri || !title) continue;
    // Search grounding URLs can be Google redirect URLs. The publisher/title is therefore
    // the more useful independence key; identical publisher names count only once.
    const identity = title.toLocaleLowerCase('de-DE');
    if (!sourceMap.has(identity)) sourceMap.set(identity, { name: title, url: uri });
  }

  return {
    renderedContent: text(metadata?.searchEntryPoint?.renderedContent),
    sources: [...sourceMap.values()].slice(0, 8),
    webSearchQueries: Array.isArray(metadata?.webSearchQueries) ? metadata.webSearchQueries.map(text).filter(Boolean) : []
  };
}

function currentLocationForFlight(item) {
  return text(item?.currentLocation || item?.locationFromPlan);
}

function uniqueFlights(rides) {
  if (window.ATMSFlight && typeof window.ATMSFlight.uniqueFlights === 'function') {
    return window.ATMSFlight.uniqueFlights(rides).map(item => ({
      flightNumber: upper(item.flightNumber),
      date: text(item.date),
      flightTime: text(item.flightTime),
      direction: text(item.direction),
      relevantSide: text(item.relevantSide) || relevantSide(text(item.direction)),
      locationFromPlan: currentLocationForFlight(item),
      sourceRows: Array.isArray(item.sourceRows) ? item.sourceRows.slice() : []
    })).filter(item => isRealFlightNumber(item.flightNumber));
  }

  const map = new Map();
  for (const ride of Array.isArray(rides) ? rides : []) {
    const flightNumber = upper(ride?.flightNumber || ride?.arrivalFlight || ride?.departureFlight);
    if (!isRealFlightNumber(flightNumber)) continue;
    const direction = normalizeDirection(ride);
    const date = text(ride?.date);
    const flightTime = text(ride?.flightTime);
    const key = `${flightNumber}|${date}|${direction}|${flightTime}`;
    if (!map.has(key)) map.set(key, {
      flightNumber,
      date,
      flightTime,
      direction,
      relevantSide: relevantSide(direction),
      locationFromPlan: text(ride?.flightLocation),
      sourceRows: []
    });
  }
  return [...map.values()];
}

async function ensureReady() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    if (location.protocol !== 'https:' || location.hostname !== 'yaso868.github.io') {
      throw new Error('Automatische Flugprüfung ist nur in der veröffentlichten ATMS-PRO-Web-App verfügbar.');
    }
    const app = initializeApp(firebaseConfig);
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_ENTERPRISE_SITE_KEY),
      isTokenAutoRefreshEnabled: true
    });
    const ai = getAI(app, { backend: new GoogleAIBackend() });
    model = getGenerativeModel(ai, {
      model: MODEL_NAME,
      tools: [{ googleSearch: {} }]
    });
    return true;
  })();
  return initPromise;
}

function buildPrompt(item) {
  const payload = {
    flightNumber: item.flightNumber,
    date: item.date,
    direction: item.direction,
    flightTime: item.flightTime || null,
    relevantSide: item.relevantSide,
    locationFromPlan: item.locationFromPlan || null
  };

  return `ATMS PRO – aktuelle Flugprüfung.\n\n` +
`Prüfe GENAU EINEN konkreten Flug mit Google Search anhand aktueller öffentlicher Webdaten. ` +
`Verwende keine gespeicherte oder typische Flugnummer→Route-Zuordnung. Das Datum ist zwingend.\n\n` +
`Regeln:\n` +
`1. Nutze Google Search für diese Prüfung. Ohne aktuelle Suchgrundlage darf status niemals "verified" sein.\n` +
`2. direction=arrival: relevantLocation ist der HERKUNFTSORT (origin) des konkreten Fluges nach Düsseldorf (DUS).\n` +
`3. direction=departure: relevantLocation ist der ZIELORT (destination) des konkreten Fluges ab Düsseldorf (DUS).\n` +
`4. flightTime ist nur ein Unterscheidungsmerkmal. Wenn null und mehrere passende Flüge existieren: needs_manual_check.\n` +
`5. status="verified" + confidence="high" nur, wenn mindestens zwei voneinander unabhängige, datumsspezifische Webquellen dieselbe konkrete DUS-Route bestätigen. ` +
`Nach Möglichkeit soll mindestens eine Quelle Flughafen/Airline-Primärquelle sein.\n` +
`6. Eine einzelne Quelle, widersprüchliche Quellen, unklare DUS-Verbindung oder fehlende Datumsbestätigung => needs_manual_check. Nicht raten.\n` +
`7. locationFromPlan ist nur Vergleichswert, keine Quelle. Bei sicherem Widerspruch conflict=true.\n` +
`8. Erfinde keine Städte oder IATA-Codes. Bei Unsicherheit leere relevante Felder und needs_manual_check.\n` +
`9. Antworte AUSSCHLIESSLICH mit genau einem JSON-Objekt, ohne Markdown, ohne Codeblock und ohne Text davor oder danach.\n` +
`Verwende exakt diese Felder: originCity, originIata, destinationCity, destinationIata, relevantLocation, relevantIata, status, confidence, conflict, sourceNote.\n` +
`status ist nur verified oder needs_manual_check; confidence ist nur high, medium oder low; conflict ist true oder false.\n\n` +
`Prüfdaten:\n${JSON.stringify(payload, null, 2)}`;
}

function checkedManual(item, note, grounding = null) {
  return {
    flightNumber: item.flightNumber,
    date: item.date,
    dateAssumed: false,
    flightTime: item.flightTime || '',
    direction: item.direction || 'unknown',
    flightLocation: item.locationFromPlan || '',
    relevantLocation: item.locationFromPlan || '',
    iata: '',
    confidence: 'uncertain',
    status: 'needs_manual_check',
    conflict: false,
    sources: grounding?.sources || [],
    sourceCount: grounding?.sources?.length || 0,
    sourceNote: note,
    geminiReportedCheckedAt: new Date().toISOString(),
    verificationDowngraded: false
  };
}

async function verifyOne(item) {
  if (!item.date || !['arrival', 'departure'].includes(item.direction)) {
    const g = { renderedContent: '', sources: [], webSearchQueries: [] };
    return { checked: checkedManual(item, 'Datum oder Flugrichtung ist nicht eindeutig – keine automatische Webprüfung.', g), grounding: g };
  }

  const result = await model.generateContent(buildPrompt(item));
  const response = result?.response;
  const grounding = extractGrounding(response);
  const rawText = response?.text?.() || '';
  const parsed = parseJsonObject(rawText);

  const originCity = text(parsed?.originCity);
  const originIata = upper(parsed?.originIata);
  const destinationCity = text(parsed?.destinationCity);
  const destinationIata = upper(parsed?.destinationIata);
  const relevantLocation = item.direction === 'arrival' ? originCity : destinationCity;
  const relevantIata = item.direction === 'arrival' ? originIata : destinationIata;
  const modelRelevantLocation = text(parsed?.relevantLocation);
  const modelRelevantIata = upper(parsed?.relevantIata);
  const modelStatus = text(parsed?.status).toLowerCase();
  const modelConfidence = text(parsed?.confidence).toLowerCase();
  const semanticMismatch = Boolean(modelRelevantLocation && relevantLocation && !sameText(modelRelevantLocation, relevantLocation)) ||
    Boolean(modelRelevantIata && relevantIata && modelRelevantIata !== relevantIata);
  const conflict = Boolean(parsed?.conflict) || semanticMismatch;
  const sourceCount = grounding.sources.length;
  const routeComplete = Boolean(originCity && destinationCity && /^[A-Z]{3}$/.test(originIata) && /^[A-Z]{3}$/.test(destinationIata));
  const claimedVerified = modelStatus === 'verified' && modelConfidence === 'high' && routeComplete && relevantLocation && !conflict;
  const verified = claimedVerified && sourceCount >= 2;
  const webCheckedAt = new Date().toISOString();

  const parseOk = Object.keys(parsed).length > 0;
  const noteBase = text(parsed?.sourceNote) || (verified
    ? 'Aktuelle Webprüfung bestätigt.'
    : parseOk ? 'Aktuelle Webprüfung nicht eindeutig genug.' : 'Google-Suche erfolgreich, Antwortformat konnte lokal nicht sicher ausgewertet werden.');
  const note = `${noteBase} · Google Search: ${sourceCount} unabhängige Quelle(n).`;

  return {
    checked: {
      flightNumber: item.flightNumber,
      date: item.date,
      dateAssumed: false,
      flightTime: item.flightTime || '',
      direction: item.direction,
      flightLocation: verified ? relevantLocation : (item.locationFromPlan || relevantLocation || ''),
      relevantLocation: verified ? relevantLocation : (item.locationFromPlan || relevantLocation || ''),
      iata: verified && /^[A-Z]{3}$/.test(relevantIata) ? relevantIata : '',
      confidence: verified ? 'verified' : 'uncertain',
      status: verified ? 'verified' : 'needs_manual_check',
      conflict,
      sources: grounding.sources,
      sourceCount,
      sourceNote: note,
      geminiReportedCheckedAt: webCheckedAt,
      verificationDowngraded: Boolean(claimedVerified && sourceCount < 2)
    },
    grounding: {
      ...grounding,
      flightNumber: item.flightNumber,
      date: item.date,
      direction: item.direction
    }
  };
}

async function verifyFlights(rides, options = {}) {
  await ensureReady();
  const flights = uniqueFlights(rides);
  if (!flights.length) throw new Error('Keine gültigen Flugnummern in der aktuellen Planliste gefunden.');

  const checked = [];
  const grounding = [];
  for (let i = 0; i < flights.length; i++) {
    const item = flights[i];
    options?.onProgress?.({ current: i + 1, total: flights.length, flightNumber: item.flightNumber });
    try {
      const one = await verifyOne(item);
      checked.push(one.checked);
      grounding.push(one.grounding);
    } catch (error) {
      const errorMessage = text(error?.message) || 'unbekannter Fehler';
      const errorCode = text(error?.code);
      const g = { renderedContent: '', sources: [], webSearchQueries: [], flightNumber: item.flightNumber, date: item.date, direction: item.direction };
      const manual = checkedManual(item, `Webprüfung technisch fehlgeschlagen: ${errorCode ? `${errorCode} · ` : ''}${errorMessage}`, g);
      manual.technicalFailure = true;
      manual.technicalErrorCode = errorCode;
      manual.technicalErrorMessage = errorMessage;
      checked.push(manual);
      grounding.push(g);
    }
  }
  const technicalFailures = checked.filter(item => item?.technicalFailure);
  return {
    version: VERSION,
    model: MODEL_NAME,
    checked,
    grounding,
    technicalFailureCount: technicalFailures.length,
    firstTechnicalError: technicalFailures[0]?.technicalErrorMessage || '',
    completedAt: new Date().toISOString()
  };
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
}

function renderGrounding(records) {
  const panel = document.getElementById('aiGroundingPanel');
  if (!panel) return;
  const list = Array.isArray(records) ? records : [];
  const withData = list.filter(r => r?.renderedContent || (Array.isArray(r?.sources) && r.sources.length));
  if (!withData.length) {
    panel.style.display = '';
    panel.innerHTML = '<div style="font-size:12px;opacity:.8">Keine Google-Search-Quellen erhalten. Deshalb wurde kein solcher Treffer automatisch als sicher übernommen.</div>';
    return;
  }

  panel.style.display = '';
  panel.innerHTML = `<div style="font-size:12px;font-weight:800;margin-bottom:6px">Google Search · aktuelle Flugquellen</div>` +
    withData.map(record => {
      const sources = Array.isArray(record.sources) ? record.sources : [];
      const links = sources.map(source => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin:3px 7px 3px 0">${escapeHtml(source.name)}</a>`).join('');
      // renderedContent is the compliant Google Search suggestions HTML/CSS returned by the API.
      const suggestions = record.renderedContent ? `<div class="atms-google-search-suggestions">${record.renderedContent}</div>` : '';
      return `<div style="padding:8px 0;border-top:1px solid rgba(255,255,255,.10)"><b style="font-size:12px">${escapeHtml(record.flightNumber || 'Flug')}</b>${suggestions}<div style="font-size:11px;line-height:1.35">${links || 'Keine Quellen'}</div></div>`;
    }).join('');
}

window.ATMSAutoFlight = {
  version: VERSION,
  model: MODEL_NAME,
  verifyFlights,
  renderGrounding,
  ready: ensureReady
};

window.dispatchEvent(new CustomEvent('atms:firebase-ai-module-ready', { detail: { version: VERSION, model: MODEL_NAME } }));
