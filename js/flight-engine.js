(() => {
  'use strict';

  const VERSION = 'FLIGHT-002';

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

    return {
      ...ride,
      flightVerification: {
        version: VERSION,
        status: currentLocation ? 'location-from-plan' : 'needs-current-check',
        source: currentLocation ? 'plan-list' : 'unverified',
        direction,
        relevantSide: relevantSide(direction),
        currentLocation,
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

  function summary(rides) {
    const flights = uniqueFlights(rides);
    return {
      total: flights.length,
      withLocation: flights.filter(x => x.currentLocation).length,
      needsCheck: flights.filter(x => !x.currentLocation).length
    };
  }

  function buildGeminiPrompt(rides) {
    const flights = uniqueFlights(rides);
    const payload = flights.map(f => ({
      flightNumber: f.flightNumber,
      date: f.date || null,
      flightTime: f.flightTime || null,
      direction: f.direction || null,
      relevantSide: f.relevantSide,
      locationFromPlan: f.currentLocation || null,
      sourceRows: f.sourceRows
    }));

    return `ATMS PRO – FLIGHT-001 Flugprüfung\n\n` +
`Aufgabe:\n` +
`Prüfe jede unten aufgeführte Flugnummer mit möglichst aktuellen öffentlichen Webdaten für den konkreten Flugtag. Verwende keine dauerhaft gespeicherte Zuordnung \"Flugnummer = Ort\". Dieselbe Flugnummer kann an einem anderen Tag eine andere Route haben.\n\n` +
`WICHTIG:\n` +
`- direction = arrival: Für ATMS ist der HERKUNFTSORT (origin) relevant.\n` +
`- direction = departure: Für ATMS ist der ZIELORT (destination) relevant.\n` +
`- Wenn date null ist, nutze den heutigen Tag in Europe/Berlin und setze dateAssumed=true.\n` +
`- flightTime ist die Flugzeit aus der Planliste. Verwende sie zur Unterscheidung mehrerer Flüge mit derselben Flugnummer am selben Tag.\n` +
`- Gleiche Flugnummer + gleiches Datum + gleiche Richtung + gleiche flightTime = derselbe zu prüfende Flug. Unterschiedliche flightTime = getrennt prüfen.\n` +
`- Wenn ein eindeutiger aktueller Flug nicht sicher gefunden wird, NICHT raten. status muss dann \"needs_manual_check\" sein.\n` +
`- locationFromPlan ist nur ein Vergleichswert aus der Dispoliste. Bei Widerspruch kennzeichne conflict=true; überschreibe nicht still.\n` +
`- Gib ausschließlich valides JSON zurück, keinen Markdown-Text.\n\n` +
`Ausgabeformat:\n` +
`{\n  \"checkedAt\": \"ISO-8601\",\n  \"flights\": [\n    {\n      \"flightNumber\": \"EW9442\",\n      \"date\": \"YYYY-MM-DD\",\n      \"dateAssumed\": false,\n      \"direction\": \"arrival|departure\",\n      \"originCity\": \"\",\n      \"originIata\": \"\",\n      \"destinationCity\": \"\",\n      \"destinationIata\": \"\",\n      \"relevantLocation\": \"\",\n      \"status\": \"verified|needs_manual_check\",\n      \"confidence\": \"high|medium|low\",\n      \"conflict\": false,\n      \"sourceNote\": \"kurze Angabe, worauf die Prüfung basiert\"\n    }\n  ]\n}\n\n` +
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

      const verified = resultItem.status === 'verified' && text(resultItem.relevantLocation);
      const existingLocation = text(ride.flightLocation);
      return {
        ...ride,
        flightLocation: existingLocation || (verified ? text(resultItem.relevantLocation) : ''),
        flightVerification: {
          version: VERSION,
          status: verified ? (resultItem.conflict ? 'verified-conflict' : 'verified') : 'needs-manual-check',
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

  window.ATMSFlight = {
    version: VERSION,
    prepareRide,
    prepareRides,
    uniqueFlights,
    summary,
    buildGeminiPrompt,
    applyResults
  };
})();
