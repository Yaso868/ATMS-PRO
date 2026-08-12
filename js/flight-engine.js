(() => {
  'use strict';

  const VERSION = 'FLIGHT-008-CORE004A';
  const FLIGHT_CACHE_KEY = 'atms_flight_cache_v1';

  const text = value => String(value ?? '').trim();
  const upper = value => {
    let v = text(value).toUpperCase().replace(/\s+/g, '');
    if (/^0S\d{1,4}[A-Z]?$/.test(v)) v = 'OS' + v.slice(2);
    return v;
  };
  const isRealFlightNumber = value => {
    const v = upper(value);
    if (!v || /^(VAN|PKW|BUS|SPRINTER|TAXI|WG)$/.test(v)) return false;
    return /^[A-Z0-9]{2,3}\d{1,4}[A-Z]?$/.test(v);
  };
  function normalizeDirection(ride) {
    if (ride?.flightDirection === 'arrival' || ride?.arrivalFlight) return 'arrival';
    if (ride?.flightDirection === 'departure' || ride?.departureFlight) return 'departure';
    return '';
  }

  function relevantSide(direction) {
    if (direction === 'arrival') return 'origin';
    if (direction === 'departure') return 'destination';
    return 'unknown';
  }

  // CORE-001A · 11.08.2026 14:41 Uhr (Europe/Berlin):
  // Der persistente Flugcache bleibt ausschließlich als Historie/Audit erhalten.
  // Er darf bei einem neuen aktuellen Planimport niemals automatisch einen Flugort
  // einsetzen. Jeder neue Import muss für seinen konkreten Prüflauf neu geprüft werden.
  function getVerifiedFlightCache() {
    try {
      const list = JSON.parse(localStorage.getItem(FLIGHT_CACHE_KEY) || '[]');
      return Array.isArray(list) ? list : [];
    } catch (_) {
      return [];
    }
  }


  function saveVerifiedFlightCache(list) {
    try {
      localStorage.setItem(FLIGHT_CACHE_KEY, JSON.stringify((Array.isArray(list) ? list : []).slice(0, 400)));
    } catch (_) {}
  }

  // FLIGHT-005: Gemini-Ergebnisse werden zusätzlich direkt mit dem vom
  // Prüfauftrag zurückgegebenen Plantag gespeichert. Dadurch bleibt ein
  // Ergebnis für 09.08.2026 auch dann 09.08.2026, wenn im alten Fahrtenbestand
  // noch Fahrten vom Vortag liegen.
  function cacheVerifiedGeminiResults(checked) {
    if (!Array.isArray(checked) || !checked.length) return 0;
    let cache = getVerifiedFlightCache();
    let added = 0;
    checked.forEach(item => {
      const flightNumber = upper(item?.flightNumber);
      const date = text(item?.date);
      const direction = text(item?.direction) || 'unknown';
      const flightTime = text(item?.flightTime);
      const location = text(item?.flightLocation || item?.relevantLocation);
      const confidence = text(item?.confidence).toLowerCase();
      const status = text(item?.status).toLowerCase();
      const verified = Boolean(location && location !== 'Flugort prüfen' && !item?.conflict && (
        confidence === 'verified' || confidence === 'high' || confidence === 'medium' || status === 'verified'
      ));
      if (!flightNumber || !date || !verified) return;
      const iata = text(item?.iata || (direction === 'arrival' ? item?.originIata : '') || (direction === 'departure' ? item?.destinationIata : '')).toUpperCase();
      const sameKey = x => upper(x?.flightNumber) === flightNumber && text(x?.date) === date && (text(x?.direction) || 'unknown') === direction && text(x?.flightTime) === flightTime;
      cache = cache.filter(x => !sameKey(x));
      cache.unshift({
        rideId: '',
        fingerprint: '',
        flightNumber,
        direction,
        date,
        flightTime,
        flightLocation: location,
        iata,
        verified: true,
        conflict: false,
        checkedAt: text(item?.checkedAt) || new Date().toISOString(),
        sourceFile: '',
        sourceRow: 0,
        source: 'gemini-plan-date'
      });
      added++;
    });
    if (added) saveVerifiedFlightCache(cache);
    return added;
  }

  function verifiedCacheHit(ride, flightNumber, direction) {
    const date = text(ride?.date);
    const flightTime = text(ride?.flightTime);
    if (!flightNumber || !date) return null;

    let candidates = getVerifiedFlightCache().filter(item => {
      if (!item || item.verified !== true) return false;
      if (upper(item.flightNumber) !== flightNumber) return false;
      if (text(item.date) !== date) return false;
      const itemDirection = text(item.direction);
      if (direction && itemDirection && itemDirection !== 'unknown' && itemDirection !== direction) return false;
      const location = text(item.flightLocation);
      return Boolean(location && location !== 'Flugort prüfen');
    });

    if (!candidates.length) return null;

    if (flightTime) {
      const exactTime = candidates.filter(item => text(item.flightTime) === flightTime);
      if (exactTime.length) candidates = exactTime;
      else {
        const noTime = candidates.filter(item => !text(item.flightTime));
        if (noTime.length) candidates = noTime;
        else return null;
      }
    } else {
      // Ohne Flugzeit nur Cache-Einträge ohne abweichende konkrete Flugzeit zulassen.
      // So wird nicht versehentlich ein anderer Umlauf derselben Flugnummer übernommen.
      const noTime = candidates.filter(item => !text(item.flightTime));
      if (noTime.length) candidates = noTime;
    }

    const locations = new Map();
    candidates.forEach(item => {
      const location = text(item.flightLocation);
      const key = location.toLocaleLowerCase('de-DE');
      if (!locations.has(key)) locations.set(key, location);
    });

    // Widersprüchliche Orte = keine automatische Übernahme.
    if (locations.size !== 1) return null;

    candidates.sort((a, b) => new Date(b.checkedAt || 0) - new Date(a.checkedAt || 0));
    return candidates[0] || null;
  }

  function prepareRide(ride) {
    const flightNumber = upper(ride?.flightNumber || ride?.arrivalFlight || ride?.departureFlight);
    const currentLocation = text(ride?.flightLocation);
    const direction = normalizeDirection(ride);
    if (!flightNumber) {
      return {
        ...ride,
        flightVerification: {
          version: VERSION,
          status: 'not-required',
          source: 'none',
          direction,
          relevantSide: relevantSide(direction),
          checkedAt: null
        }
      };
    }

    // CORE-001A: Persistente Altprüfungen werden hier bewusst NICHT abgefragt.
    // Ein leerer Flugort bleibt leer und wird für den aktuellen Import neu geprüft.
    const resolvedLocation = currentLocation;
    const source = currentLocation ? 'plan-list' : 'unverified';
    const status = currentLocation ? 'location-from-plan' : 'needs-current-check';

    return {
      ...ride,
      flightLocation: resolvedLocation,
      iata: text(ride?.iata).toUpperCase(),
      flightCheckConfidence: ride?.flightCheckConfidence,
      flightCheckedAt: ride?.flightCheckedAt,
      flightVerification: {
        version: VERSION,
        status,
        source,
        direction,
        relevantSide: relevantSide(direction),
        currentLocation: resolvedLocation,
        checkedAt: null
      }
    };
  }

  function prepareRides(rides) {
    return Array.isArray(rides) ? rides.map(prepareRide) : [];
  }
  function uniqueFlights(rides) {
    const map = new Map();
    for (const ride of Array.isArray(rides) ? rides : []) {
      const flightNumber = upper(ride?.flightNumber || ride?.arrivalFlight || ride?.departureFlight);
      if (!isRealFlightNumber(flightNumber)) continue;
      const direction = normalizeDirection(ride);
      const flightTime = text(ride?.flightTime);
      const key = `${flightNumber}|${direction || 'unknown'}|${text(ride?.date)}|${flightTime}`;
      if (!map.has(key)) {
        map.set(key, {
          flightNumber,
          date: text(ride?.date),
          flightTime,
          direction,
          relevantSide: relevantSide(direction),
          currentLocation: text(ride?.flightLocation),
          sourceRows: []
        });
      }
      const item = map.get(key);
      const row = Number(ride?.sourceRow || 0);
      if (row && !item.sourceRows.includes(row)) item.sourceRows.push(row);
      if (!item.currentLocation && text(ride?.flightLocation)) item.currentLocation = text(ride.flightLocation);
    }
    return [...map.values()];
  }
  let refreshScheduled = false;
  function applyVerifiedCacheInPlace(rides) {
    // CORE-001A: absichtlich deaktiviert. API bleibt aus Rückwärtskompatibilität
    // vorhanden, verändert aber keine neue Planliste mehr.
    return 0;
  }
  function schedulePlanImportRefresh() {
    if (refreshScheduled) return;
    refreshScheduled = true;
    setTimeout(() => {
      refreshScheduled = false;
      try {
        window.dispatchEvent(new CustomEvent('atms:gemini-flight-result', { detail: { cacheRefresh: true } }));
      } catch (_) {}
    }, 0);
  }
  function summary(rides) {
    // CORE-001A: summary() ist rein lesend und verändert die Planliste nicht mehr.
    const flights = uniqueFlights(rides);
    return {
      total: flights.length,
      withLocation: flights.filter(x => x.currentLocation).length,
      needsCheck: flights.filter(x => !x.currentLocation).length
    };
  }
  function buildGeminiPrompt(rides) {
    const flights = uniqueFlights(rides);
    const activePlanDate = text(document.getElementById('planDateInput')?.value);
    const payload = flights.map(f => ({
      flightNumber: f.flightNumber,
      date: f.date || activePlanDate || null,
      flightTime: f.flightTime || null,
      direction: f.direction || null,
      relevantSide: f.relevantSide,
      locationFromPlan: f.currentLocation || null,
      sourceRows: f.sourceRows
    }));
    return `ATMS PRO – ${VERSION} strikte aktuelle Flugprüfung\n\n` +
`Prüfe JEDE unten aufgeführte Flugnummer für den angegebenen Flugtag anhand aktueller, datumsspezifischer öffentlicher Webdaten. Keine dauerhaft gespeicherte Flugnummer→Ort-Zuordnung verwenden.\n\n` +
`VERBINDLICHE REGELN:\n` +
`1. direction=arrival: relevant ist der HERKUNFTSORT (origin) des konkreten Fluges nach DUS.\n` +
`2. direction=departure: relevant ist der ZIELORT (destination) des konkreten Fluges ab DUS.\n` +
`3. date exakt verwenden; flightTime exakt zurückgeben und zur Unterscheidung nutzen.\n` +
`4. locationFromPlan ist nur Vergleichswert, niemals Quelle. Widerspruch => conflict=true.\n` +
`5. verified + high nur mit mindestens ZWEI voneinander unabhängigen, datumsspezifischen Quellen. Mindestens eine Quelle nach Möglichkeit Primärquelle (DUS/Airline).\n` +
`6. Nur eine geeignete Quelle, widersprüchliche Daten, nicht eindeutiger Flug oder keine sichere DUS-Verbindung => needs_manual_check. Nicht raten.\n` +
`7. sources muss die tatsächlich verwendeten Quellen mit name und url enthalten. Keine Quellen/URLs erfinden.\n` +
`8. checkedAt ist der tatsächliche Web-Prüfzeitpunkt in ISO-8601.\n` +
`9. Antworte ausschließlich mit EINEM gültigen JSON-Objekt, kein Markdown.\n\n` +
`JSON-SCHEMA:\n` +
`{\n  "checkedAt":"ISO-8601",\n  "flights":[{\n    "flightNumber":"EW0000",\n    "date":"YYYY-MM-DD",\n    "dateAssumed":false,\n    "flightTime":null,\n    "direction":"arrival|departure|unknown",\n    "originCity":"",\n    "originIata":"",\n    "destinationCity":"",\n    "destinationIata":"",\n    "relevantLocation":"",\n    "status":"verified|needs_manual_check",\n    "confidence":"high|medium|low",\n    "conflict":false,\n    "sources":[{"name":"","url":""}],\n    "sourceNote":""\n  }]\n}\n\n` +
`Zu prüfende Flüge:\n${JSON.stringify(payload, null, 2)}`;
  }
  function applyResults(rides, result) {
    const resultFlights = Array.isArray(result?.flights) ? result.flights : [];
    const byKey = new Map();
    resultFlights.forEach(item => {
      const flightNumber = upper(item.flightNumber);
      const direction = text(item.direction) || 'unknown';
      const date = text(item.date);
      const flightTime = text(item.flightTime);
      byKey.set(`${flightNumber}|${direction}|${date}|${flightTime}`, item);
      if (!flightTime) byKey.set(`${flightNumber}|${direction}|${date}|`, item);
      if (!date && !flightTime) byKey.set(`${flightNumber}|${direction}||`, item);
    });
    return (Array.isArray(rides) ? rides : []).map(ride => {
      const flightNumber = upper(ride?.flightNumber || ride?.arrivalFlight || ride?.departureFlight);
      if (!flightNumber) return ride;
      const direction = normalizeDirection(ride);
      const date = text(ride?.date);
      const flightTime = text(ride?.flightTime);
      const resultItem =
        byKey.get(`${flightNumber}|${direction || 'unknown'}|${date}|${flightTime}`) ||
        byKey.get(`${flightNumber}|${direction || 'unknown'}|${date}|`) ||
        byKey.get(`${flightNumber}|${direction || 'unknown'}||`);
      if (!resultItem) return ride;
      const verified = resultItem.status === 'verified' && !Boolean(resultItem.conflict) && text(resultItem.relevantLocation);
      const existingLocation = text(ride.flightLocation);
      return {
        ...ride,
        flightLocation: existingLocation || (verified ? text(resultItem.relevantLocation) : ''),
        flightVerification: {
          version: VERSION,
          status: verified ? 'verified' : 'needs-manual-check',
          source: 'gemini-result',
          direction,
          relevantSide: relevantSide(direction),
          currentLocation: existingLocation,
          suggestedLocation: verified ? text(resultItem.relevantLocation) : '',
          conflict: Boolean(resultItem.conflict),
          confidence: text(resultItem.confidence),
          checkedAt: text(result?.checkedAt) || new Date().toISOString()
        }
      };
    });
  }

  // Ergebnisse aus dem Gemini-Feld von app.js zusätzlich nach dem tatsächlichen
  // Ergebnisdatum cachen. Danach kann die Planlisten-Vorschau denselben Plantag
  // sofort wiederverwenden.
  window.addEventListener('atms:gemini-flight-result', event => {
    try {
      const checked = event?.detail?.checked;
      if (Array.isArray(checked) && checked.length) cacheVerifiedGeminiResults(checked);
    } catch (_) {}
  });

  // Das gemeinsame Datei-Feld wird sowohl vom Planlisten-Import als auch vom
  // alten JSON-Import beobachtet. Bilder/Excel dürfen deshalb nicht als Binärtext
  // (z. B. "JFIF") im JSON-Feld landen.
  document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('fileInput');
    if (!input) return;
    input.addEventListener('change', event => {
      const file = event.target?.files?.[0];
      if (!file) return;
      const name = String(file.name || '').toLowerCase();
      const isJson = /\.json$/i.test(name) || /application\/json/i.test(file.type || '');
      if (isJson) return;
      setTimeout(() => {
        const box = document.getElementById('jsonInput');
        if (box) box.value = '';
      }, 0);
    });
  });

  window.ATMSFlight = {
    version: VERSION,
    prepareRide,
    prepareRides,
    uniqueFlights,
    summary,
    buildGeminiPrompt,
    applyResults,
    cacheVerifiedGeminiResults,
    applyVerifiedCacheInPlace
  };
})();
