// CORE-006S2 · 10.09.2026: Excel-Adressimport liest XLSX-XML namespace-unabhängig (auch echte Excel-/Microsoft-365-Dateien mit Präfixen wie x:sheet/x:row). Keine Änderung an Adressdaten, Importmodi, Routing oder Fahrtenlogik.
// CORE-006S · 10.09.2026: Editierbare Orte-&-Adressen-Verwaltung mit sicherem Excel/CSV-Import/Export. Routen verwenden nur exakte Adressbuch-Treffer bzw. eindeutige Airport-Codes; keine Hotel-Filiale wird geraten. Bündelfahrten behalten die Planreihenfolge.
// CORE-006J · 09.09.2026: Zeitsemantik der Bild-Planliste verbindlich getrennt: erste Uhrzeit = DISPO, mittlere Uhrzeit = gespiegelte DISPO-Zeit, letzte Uhrzeit vor Ort = Flugzeit aus Liste. Flugzeit wird in Fahrtenkarte/Cockpit sichtbar; LIVE bleibt separates Abholzeitfeld mit Priorität LIVE > DISPO > PLAN.
// CORE-006I · 09.09.2026: Fahrtenansicht bewahrt die Reihenfolge der Planliste; keine automatische Umsortierung nach PLAN/DISPO/LIVE-Zeit.
// CORE-006A 09.09.2026: Explicit Plan Import Guard – Planimport nur nach echtem Nutzer-Klick; blockierte/importfremde Aufrufe werden protokolliert und bestehende Fahrten gesichert. Zusätzlich kann der letzte Zustand vor einem Planimport gezielt wiederhergestellt werden.
// CORE-005Z 09.09.2026: Multi-Airport Flight Context – Flugprüfung erkennt den tatsächlich beteiligten Flughafen (z. B. DUS oder CGN) aus Abholung/Ziel, ohne Flugnummer-Hardcoding; Gemini- und Live-Prüfauftrag werden airport-spezifisch.
// CORE-005Y 09.09.2026: Android JSON Input Guard – erkennt abgeschnittene Gemini-/Live-JSONs bereits beim Einfügen und meldet sie verständlich, ohne Flug-/Zeit-/Persistenzlogik zu ändern.
// CORE-005Q 08.09.2026: Flugpruef-Persistenz nach Neuimport: exakter Match Flugnummer+Datum+Richtung+Flugzeit; verifizierte Orte und manuelle Hinweise werden sofort wiederhergestellt.
// CORE-005P 08.09.2026: Globaler Arrival-Abholpuffer + manuell bestätigte Landungszeit im Live-Panel; PLAN/DISPO bleiben unverändert.
// CORE-005O 08.09.2026: Sichere OCR-Ortsnormalisierung für München-Fehllesungen; Originalwert bleibt intern erhalten.
// CORE-005N 08.09.2026: Live-Flugdaten-Fallback: aktueller Web-Prüfauftrag + sichere JSON-Übernahme, ohne PLAN/DISPO zu überschreiben.
// CORE-005M 08.09.2026: Dashboard-Hinweiszähler zählt echte manuelle/unsichere Flugprüfungen statt beliebiger flightStatus-Werte.
// CORE-005K 07.09.2026: Cockpit-Status ohne Live-Daten neutral; PÜNKTLICH nur bei bestätigtem On-Time-Status.
// CORE-005J 07.09.2026: Preis-fehlt nativ anzeigen; PWA rendert PLAN/DISPO/LIVE ohne nachträgliche DOM-Korrektur.
// CORE-004L 06.09.2026: Zeitlogik gehärtet. PLAN, DISPO und LIVE bleiben getrennt; Priorität LIVE > DISPO > PLAN.
// LIVE kann aus einer ausdrücklich gelieferten tatsächlichen Landezeit + 15 Min. Abholpuffer abgeleitet werden.
// CORE-004C HOTFIX 05.09.2026: Flugdaten-aendern-Button repariert; manuelle Korrekturen werden lokal pro Fahrt gespeichert.
// CORE-005V 08.09.2026: additive Persistenz-Sicherheitslage (Snapshot, Write-Read-Check, Recovery, Self-Test).
// CORE-005V1 08.09.2026: Persistenz-Panel bleibt nach dynamischem Import-UI-Render sichtbar (additiv, keine Importlogik geändert).
// CORE-005V2 08.09.2026: Persistenz-Panel im selben Import-Host direkt hinter Live-Flugdaten verankert; Mobile-Stack erweitert.
// CORE-005V3 08.09.2026: Persistenz-Panel wird direkt IN das sichtbare Live-Flugdaten-Panel gemountet; vorhandene Fehlplatzierung wird automatisch verschoben.
// CORE-005V4 08.09.2026: Kritische Safety-Schattenwerte werden bei normalen Snapshots niemals durch bloß fehlende localStorage-Keys verworfen; Startup/Import kann dadurch verlorene Flugdaten wiederherstellen.
const KEY='atms_beta_14_3_1_rides',DONE='atms_beta_14_3_1_done',DONE_OPEN='atms_beta_14_3_1_done_open',WA_SETTINGS='atms_beta_14_3_1_whatsapp',DISP_SETTINGS='atms_dispatchers_v1',DRIVER_SETTINGS='atms_driver_contacts_v1',BACKUP_META='atms_backup_meta_v1',LIVE_SETTINGS='atms_live_disposition_v1',LIVE_LOG='atms_live_disposition_log_v1',DRIVER_SESSION='atms_driver_session_v1',INFO_CHAT_SETTINGS='atms_info_chat_v1',FLIGHT_CACHE='atms_flight_cache_v1',FLIGHT_CACHE_BACKUP='atms_flight_cache_verified_v1',RIDE_OVERRIDE_KEY='atms_ride_overrides_v1';const ADDRESS_BOOK='atms_address_book_v1';const PERSIST_SAFETY_KEY='ATMSPRO_PERSISTENCE_SAFETY_V1',PERSIST_AUDIT_KEY='ATMSPRO_PERSISTENCE_AUDIT_V1',PERSIST_SCHEMA=1;const PERSIST_DURABLE_DB='ATMSPRO_PERSISTENCE_DURABLE_V1',PERSIST_DURABLE_STORE='critical',PERSIST_DURABLE_RECORD='latest';let persistenceDurableShadow=null,persistenceDurableReady=false,persistenceDurableError='';const $=id=>document.getElementById(id);let liveGeoWatchId=null;let rides=[];let done=new Set(JSON.parse(localStorage.getItem(DONE)||'[]'));let doneOpen=localStorage.getItem(DONE_OPEN)==='1';let mode='rides',driverFilter='',active=null;const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

let atmsToastTimer=0;
function showToast(message,type=''){const el=document.getElementById('atmsToast');if(!el)return;clearTimeout(atmsToastTimer);el.textContent=message;el.className='atms-toast '+type+' show';atmsToastTimer=setTimeout(()=>{el.className='atms-toast';},2600)}
function runStartupSelfCheck(){const required=['search','plusBtn','rideList','fileInput','loadBtn','exportBackupBtn','importBackupBtn','resetDataBtn'];const missing=required.filter(id=>!document.getElementById(id));if(missing.length){throw new Error('Fehlende App-Elemente: '+missing.join(', '));}return true;}
function first(...v){for(const x of v)if(x!==undefined&&x!==null&&String(x).trim()!=='')return String(x).trim();return ''}function clean(t){return t.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'')}
// CORE-004L: Planzeit darf nie von einer später berechneten Zeit überschrieben werden.
// Deshalb haben explizite PLAN-Felder Vorrang; das historische Feld `time` bleibt nur Fallback für alte Daten.
function planTimeOf(r){return first(r.planTime,r.plan_abholzeit,r.planzeit,r.plan_zeit,r.abholzeitPlan,r.planPickupTime,r.plan_pickup_time,r.time,r.abholzeit)}
function dispoTimeOf(r){return first(r.dispoTime,r.dispo_time,r.dispoZeit,r.dispozeit,r.dispo_zeit,r.dispo_abholzeit,r.dispo_uhrzeit,r.timeMirror,r.time_mirror,r.dispositionTime,r.disposition_time,r.disponierte_abholzeit,r.pickupTimeDispo,r.pickup_time_dispo,r.uhrzeit2,r.uhrzeit_2,r.zweiteUhrzeit,r.secondColumnTime,r.zweite_uhrzeit,r.zweiteZeit,r.zweite_zeit,r.secondTime,r.second_time,r.secondPickupTime)}
function listedFlightTimeOf(r){return first(r.flightTime,r.flugzeit,r.flight_time,r.currentFlightTime,r.current_flight_time)}
function explicitLiveTimeOf(r){return first(r.liveTime,r.live_time,r.currentPickupTime,r.current_pickup_time,r.aktuelle_abholzeit,r.aktuelleZeit,r.aktuelle_zeit,r.live_abholzeit,r.flightradar_abholzeit,r.verspaetete_abholzeit,r.verspätete_abholzeit,r.livePickupTime,r.live_pickup_time,r.currentTime,r.current_time)}
function actualLandingTimeOf(r){return first(r.actualLandingTime,r.actual_landing_time,r.landingTimeActual,r.landing_time_actual,r.landedAt,r.landed_at,r.actualArrivalTime,r.actual_arrival_time,r.flightActualArrival,r.flight_actual_arrival,r.realArrivalTime,r.real_arrival_time)}
function globalArrivalBufferMinutes(){const raw=Number(getLiveSettings().arrivalPickupBufferMinutes??15);return Number.isFinite(raw)?Math.max(0,Math.min(120,Math.round(raw))):15}
function liveBufferMinutesOf(r){const raw=Number(r?.liveBufferOverrideMinutes??r?.live_buffer_override_minutes??r?.liveBufferMinutes??r?.live_buffer_minutes??r?.pickupBufferMinutes??r?.pickup_buffer_minutes??globalArrivalBufferMinutes());return Number.isFinite(raw)?Math.max(0,Math.min(120,Math.round(raw))):globalArrivalBufferMinutes()}
function arrivalBufferMinutesForRide(r){const override=r?.liveBufferOverrideMinutes??r?.live_buffer_override_minutes;const raw=override===undefined||override===null||String(override).trim()===''?globalArrivalBufferMinutes():Number(override);return Number.isFinite(Number(raw))?Math.max(0,Math.min(120,Math.round(Number(raw)))):globalArrivalBufferMinutes()}
function clockPlusMinutes(value,minutes){
  const raw=String(value||'').trim();if(!raw)return'';
  const m=raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if(m){const total=((Number(m[1])*60+Number(m[2])+Number(minutes))%(24*60)+(24*60))%(24*60);return String(Math.floor(total/60)).padStart(2,'0')+':'+String(total%60).padStart(2,'0')}
  const d=new Date(raw);if(Number.isNaN(d.getTime()))return'';d.setMinutes(d.getMinutes()+Number(minutes));
  try{return new Intl.DateTimeFormat('de-DE',{timeZone:'Europe/Berlin',hour:'2-digit',minute:'2-digit',hour12:false}).format(d)}catch(_){return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}
}
function derivedLiveTimeOf(r){const landing=actualLandingTimeOf(r);return landing?clockPlusMinutes(landing,arrivalBufferMinutesForRide(r)):''}
function liveTimeOf(r){return first(explicitLiveTimeOf(r),derivedLiveTimeOf(r))}
function normalizeStops(r){const raw=r.bundleStops||r.stops||r.destinations||r.ziele||r.bundle_ziele||[];if(!Array.isArray(raw))return[];return raw.map((s,i)=>{if(typeof s==='string')return{name:s,persons:0,order:i+1};return{name:first(s.name,s.destination,s.ziel,s.ort,s.hotel),persons:Number(s.persons||s.personen||0),order:Number(s.order||s.reihenfolge||i+1)}}).filter(s=>s.name)}
function isBundleRide(r){return Boolean(r.bundle||r.isBundle||r.bundelfahrt||r.is_bundelfahrt||r.bundleRide||normalizeStops(r).length>1)}
function normalizeFlightLocationOcr(value){const raw=String(value||'').trim();if(!raw)return'';const key=raw.toLowerCase().replace(/\s+/g,' ');if(['miinchen','mienchen','munchen','muenchen'].includes(key))return'München';return raw}
function norm(r,i){const plan=planTimeOf(r),dispo=dispoTimeOf(r),landing=actualLandingTimeOf(r),buffer=liveBufferMinutesOf(r),live=liveTimeOf(r),listedFlightTime=listedFlightTimeOf(r),rawFlightLocation=first(r.flightLocation,r.flugort,r.ort),normalizedFlightLocation=normalizeFlightLocationOcr(rawFlightLocation);return{...r,id:first(r.id,'ride-'+(i+1)),date:first(r.date,r.datum),time:plan,planTime:plan,dispoTime:dispo,timeMirror:first(r.timeMirror,r.time_mirror),flightTime:listedFlightTime,liveTime:live,actualLandingTime:landing,liveBufferMinutes:buffer,liveTimeDerivedFromLanding:Boolean(!explicitLiveTimeOf(r)&&landing&&live),driver:first(r.driver,r.fahrer),pickup:first(r.pickup,r.abholort,r.start),destination:first(r.destination,r.zielort,r.ziel),flightNumber:first(r.flightNumber,r.flugnummer).toUpperCase(),flightLocationRaw:first(r.flightLocationRaw,r.sourceFlightLocationRaw,rawFlightLocation),flightLocation:normalizedFlightLocation,iata:first(r.iata),airline:first(r.airline),partner:first(r.partner,r.airline),company:first(r.company,r.firma,'WT'),vehicle:first(r.vehicle,r.fahrzeug,'Pkw'),persons:Number(r.persons||r.personen||0),price:Number(r.price||r.preis||0),currency:first(r.currency,'EUR'),notes:first(r.notes,r.hinweis),flightStatus:first(r.flightStatus,r.flugstatus,r.liveStatus,r.live_status),delayMinutes:Number(r.delayMinutes??r.delay_minutes??r.verspaetungMinuten??r.verspätung_minuten??r.delay??0),landed:Boolean(r.landed||r.gelandet),isBundle:isBundleRide(r),bundleStops:normalizeStops(r)}}
function normKey(v){return String(v||'').trim().toLowerCase().replace(/\s+/g,' ')}

// CORE-005V – additive Persistenz-Sicherheitslage. Bewusst außerhalb des atms_-Präfixes,
// damit ein versehentliches Prefix-Cleanup den letzten Snapshot nicht mitlöscht.
// Der absichtliche "ATMS-Daten zurücksetzen"-Ablauf löscht diese Sicherheitsdaten explizit mit.
function persistAudit(event,detail={}){
  try{
    const list=JSON.parse(localStorage.getItem(PERSIST_AUDIT_KEY)||'[]');
    const next=Array.isArray(list)?list:[];
    next.unshift({at:new Date().toISOString(),event:String(event||''),...detail});
    localStorage.setItem(PERSIST_AUDIT_KEY,JSON.stringify(next.slice(0,120)));
  }catch(_){ }
}
function readPersistenceSafety(){
  try{
    const obj=JSON.parse(localStorage.getItem(PERSIST_SAFETY_KEY)||'null');
    return obj&&typeof obj==='object'&&obj.storage&&typeof obj.storage==='object'?obj:null;
  }catch(_){return null}
}
function writePersistenceSafety(storage,reason='snapshot'){
  const payload={schema:PERSIST_SCHEMA,updatedAt:new Date().toISOString(),reason:String(reason||''),storage:{...(storage||{})}};
  localStorage.setItem(PERSIST_SAFETY_KEY,JSON.stringify(payload));
  return payload;
}
function updatePersistenceSafetyKey(key,rawValue,reason='write'){
  try{
    const prev=readPersistenceSafety();
    const storage={...(prev?.storage||{})};
    if(rawValue===null||rawValue===undefined)delete storage[key];else storage[key]=String(rawValue);
    writePersistenceSafety(storage,reason);
  }catch(_){ }
}
// CORE-005V5: Zweite, unabhaengige Persistenzschicht in IndexedDB.
// Sie ist absichtlich getrennt von localStorage, damit ein unerwarteter Verlust
// des kompletten Safety-/Audit-Containers die letzte verifizierte Flugpruefung
// nicht mehr mitreissen kann. Fehlende aktuelle Werte loeschen den Durable-Shadow nie.
function openPersistenceDurableDb(){
  return new Promise((resolve,reject)=>{
    try{
      if(!('indexedDB' in window))return reject(new Error('IndexedDB nicht verfuegbar'));
      const req=indexedDB.open(PERSIST_DURABLE_DB,1);
      req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(PERSIST_DURABLE_STORE))db.createObjectStore(PERSIST_DURABLE_STORE)};
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error||new Error('IndexedDB konnte nicht geoeffnet werden'));
    }catch(e){reject(e)}
  });
}
async function readPersistenceDurableShadow(){
  const db=await openPersistenceDurableDb();
  try{
    return await new Promise((resolve,reject)=>{
      const tx=db.transaction(PERSIST_DURABLE_STORE,'readonly');
      const req=tx.objectStore(PERSIST_DURABLE_STORE).get(PERSIST_DURABLE_RECORD);
      req.onsuccess=()=>resolve(req.result&&typeof req.result==='object'?req.result:null);
      req.onerror=()=>reject(req.error||new Error('Durable-Shadow konnte nicht gelesen werden'));
    });
  }finally{try{db.close()}catch(_){}}
}
async function writePersistenceDurableShadow(storage,reason='sync'){
  const db=await openPersistenceDurableDb();
  const payload={schema:PERSIST_SCHEMA,updatedAt:new Date().toISOString(),reason:String(reason||''),storage:{...(storage||{})}};
  try{
    await new Promise((resolve,reject)=>{
      const tx=db.transaction(PERSIST_DURABLE_STORE,'readwrite');
      tx.oncomplete=()=>resolve();
      tx.onerror=()=>reject(tx.error||new Error('Durable-Shadow Schreibfehler'));
      tx.objectStore(PERSIST_DURABLE_STORE).put(payload,PERSIST_DURABLE_RECORD);
    });
    persistenceDurableShadow=payload;
    persistenceDurableReady=true;
    persistenceDurableError='';
    persistAudit('durable_sync',{reason:String(reason||''),keys:Object.keys(payload.storage||{}).length});
    return payload;
  }finally{try{db.close()}catch(_){}}
}
function mergedCriticalShadowFromCurrent(){
  const storage={...(persistenceDurableShadow?.storage||{})};
  for(const key of [FLIGHT_CACHE,FLIGHT_CACHE_BACKUP,RIDE_OVERRIDE_KEY]){
    const raw=localStorage.getItem(key);
    if(typeof raw==='string'&&raw.length)storage[key]=raw;
  }
  return storage;
}
function syncPersistenceDurableShadow(reason='sync'){
  const storage=mergedCriticalShadowFromCurrent();
  if(!Object.keys(storage).length)return Promise.resolve(null);
  persistenceDurableShadow={schema:PERSIST_SCHEMA,updatedAt:new Date().toISOString(),reason:String(reason||''),storage};
  persistenceDurableReady=true;
  return writePersistenceDurableShadow(storage,reason).catch(e=>{
    persistenceDurableError=String(e?.message||e);
    persistAudit('durable_sync_failed',{reason:String(reason||''),message:persistenceDurableError});
    return null;
  });
}
async function initPersistenceDurableShadow(){
  try{
    const saved=await readPersistenceDurableShadow();
    if(saved&&saved.storage&&typeof saved.storage==='object')persistenceDurableShadow=saved;
    persistenceDurableReady=true;
    persistenceDurableError='';
    const result=restoreMissingCriticalPersistence('startup-durable');
    if(result.restored){
      recoverVerifiedFlightCache();
      const restoredRides=applyFlightCacheToRides(applyRideOverrides(rides).rides);
      rides=restoredRides.rides;
      save();
      render();
    }
    capturePersistenceSafety('startup-durable-ready');
    if(persistenceDurableShadow)persistAudit('durable_loaded',{keys:Object.keys(persistenceDurableShadow.storage||{}).length,restored:result.restored});
  }catch(e){
    persistenceDurableReady=true;
    persistenceDurableError=String(e?.message||e);
    persistAudit('durable_load_failed',{message:persistenceDurableError});
  }
}
function clearPersistenceDurableShadow(){
  persistenceDurableShadow=null;
  persistenceDurableReady=false;
  persistenceDurableError='';
  try{
    const req=indexedDB.deleteDatabase(PERSIST_DURABLE_DB);
    req.onsuccess=req.onerror=req.onblocked=()=>{};
  }catch(_){ }
}
function capturePersistenceSafety(reason='snapshot'){
  try{
    const previous=readPersistenceSafety();
    const storage={};
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);
      if(!k||!k.startsWith('atms_'))continue;
      const raw=localStorage.getItem(k);
      if(raw!==null)storage[k]=raw;
    }

    // CORE-005V4: Ein normaler Snapshot darf den letzten verifizierten Schutzwert
    // eines kritischen Bereichs NICHT verlieren, nur weil dieser Key im aktuellen
    // localStorage gerade fehlt. Genau das hatte zuvor einen guten Safety-Snapshot
    // beim nächsten Startup mit einem "leeren" Snapshot überschrieben.
    // Ein absichtlicher kompletter ATMS-Reset löscht PERSIST_SAFETY_KEY separat.
    const protectedCritical=[FLIGHT_CACHE,FLIGHT_CACHE_BACKUP,RIDE_OVERRIDE_KEY];
    const preserved=[];
    for(const key of protectedCritical){
      if(Object.prototype.hasOwnProperty.call(storage,key))continue;
      const oldRaw=previous?.storage?.[key];
      if(typeof oldRaw==='string'&&oldRaw.length){
        storage[key]=oldRaw;
        preserved.push(key);
      }
    }

    const payload=writePersistenceSafety(storage,reason);
    persistAudit('snapshot',{reason:String(reason||''),keys:Object.keys(storage).length,preservedCritical:preserved});
    syncPersistenceDurableShadow('snapshot:'+reason);
    return payload;
  }catch(e){persistAudit('snapshot_failed',{reason:String(reason||''),message:String(e?.message||e)});return null}
}
function safePersistentSetItem(key,rawValue,reason='write'){
  const value=String(rawValue??'');
  const before=localStorage.getItem(key);
  // Vor dem kritischen Schreibvorgang den letzten bekannten guten Wert sichern.
  if(before!==null)updatePersistenceSafetyKey(key,before,'prewrite:'+reason);
  try{
    localStorage.setItem(key,value);
    const readBack=localStorage.getItem(key);
    if(readBack!==value)throw new Error('Write-Read-Check fehlgeschlagen');
    updatePersistenceSafetyKey(key,value,'verified-write:'+reason);
    if([FLIGHT_CACHE,FLIGHT_CACHE_BACKUP,RIDE_OVERRIDE_KEY].includes(key)){
      const storage={...(persistenceDurableShadow?.storage||{})};storage[key]=value;persistenceDurableShadow={schema:PERSIST_SCHEMA,updatedAt:new Date().toISOString(),reason:'verified-write:'+reason,storage};persistenceDurableReady=true;
      writePersistenceDurableShadow(storage,'verified-write:'+reason).catch(e=>{persistenceDurableError=String(e?.message||e);persistAudit('durable_sync_failed',{reason:'verified-write:'+reason,message:persistenceDurableError})});
    }
    persistAudit('write_ok',{key,reason:String(reason||''),length:value.length});
    return true;
  }catch(e){
    try{if(before===null)localStorage.removeItem(key);else localStorage.setItem(key,before);}catch(_){ }
    persistAudit('write_failed',{key,reason:String(reason||''),message:String(e?.message||e)});
    return false;
  }
}
function restoreMissingCriticalPersistence(reason='auto-recovery'){
  const snap=readPersistenceSafety();
  const critical=[FLIGHT_CACHE,FLIGHT_CACHE_BACKUP,RIDE_OVERRIDE_KEY];
  const restored=[];
  for(const key of critical){
    if(localStorage.getItem(key)!==null)continue;
    const raw=(snap?.storage?.[key] ?? persistenceDurableShadow?.storage?.[key]);
    if(typeof raw!=='string'||!raw.length)continue;
    try{
      localStorage.setItem(key,raw);
      if(localStorage.getItem(key)===raw)restored.push(key);
    }catch(_){ }
  }
  if(restored.length)persistAudit('critical_recovery',{reason:String(reason||''),keys:restored});
  return {restored:restored.length,keys:restored};
}
function persistenceSelfTest(){
  const key='ATMSPRO_PERSISTENCE_SELFTEST_TMP';
  const token='ok-'+Date.now()+'-'+Math.random().toString(36).slice(2);
  try{
    localStorage.setItem(key,token);
    const ok=localStorage.getItem(key)===token;
    localStorage.removeItem(key);
    return {ok,storageWritable:ok,safetySnapshot:Boolean(readPersistenceSafety()),checkedAt:new Date().toISOString()};
  }catch(e){try{localStorage.removeItem(key)}catch(_){ }return {ok:false,storageWritable:false,safetySnapshot:Boolean(readPersistenceSafety()),checkedAt:new Date().toISOString(),error:String(e?.message||e)}}
}
function persistenceDiagnosis(){
  const snap=readPersistenceSafety();
  let audit=[];try{audit=JSON.parse(localStorage.getItem(PERSIST_AUDIT_KEY)||'[]');if(!Array.isArray(audit))audit=[]}catch(_){audit=[]}
  const inspect=key=>{
    const raw=localStorage.getItem(key),shadow=snap?.storage?.[key],durable=persistenceDurableShadow?.storage?.[key];
    let count=null,parseOk=true;
    if(raw!==null){try{const v=JSON.parse(raw);count=Array.isArray(v)?v.length:(v&&typeof v==='object'?Object.keys(v).length:null)}catch(_){parseOk=false}}
    return {key,present:raw!==null,rawLength:raw?.length||0,parseOk,count,shadowPresent:typeof shadow==='string',shadowLength:typeof shadow==='string'?shadow.length:0,durablePresent:typeof durable==='string',durableLength:typeof durable==='string'?durable.length:0};
  };
  return {
    diagnosis:'CORE-005V5 Durable Persistence Safety',generatedAt:new Date().toISOString(),schema:PERSIST_SCHEMA,
    selfTest:persistenceSelfTest(),
    safetySnapshot:{present:Boolean(snap),updatedAt:snap?.updatedAt||'',reason:snap?.reason||'',keys:snap?.storage?Object.keys(snap.storage).length:0},
    durableShadow:{present:Boolean(persistenceDurableShadow),ready:persistenceDurableReady,error:persistenceDurableError,updatedAt:persistenceDurableShadow?.updatedAt||'',reason:persistenceDurableShadow?.reason||'',keys:persistenceDurableShadow?.storage?Object.keys(persistenceDurableShadow.storage).length:0},
    critical:{rides:inspect(KEY),done:inspect(DONE),flightCache:inspect(FLIGHT_CACHE),verifiedFlightBackup:inspect(FLIGHT_CACHE_BACKUP),rideOverrides:inspect(RIDE_OVERRIDE_KEY)},
    recentAudit:audit.slice(0,30)
  };
}
function ensurePersistenceSafetyPanel(){
  const view=$('importView');if(!view)return false;
  const liveHost=$('liveFlightPanel');
  const existing=$('atmsPersistenceSafetyPanel');
  if(existing){
    // CORE-005V3: Wenn ein vorheriger Mount ausserhalb/unsichtbar gelandet ist,
    // wird dasselbe Panel ohne Neuanlage direkt in den sicher sichtbaren Live-Host verschoben.
    if(liveHost&&existing.parentElement!==liveHost)liveHost.appendChild(existing);
    return true;
  }
  const panel=document.createElement('section');panel.id='atmsPersistenceSafetyPanel';panel.style.cssText='margin:16px 0 0;padding:14px;border:1px solid rgba(255,255,255,.18);border-radius:14px;background:rgba(255,255,255,.04)';
  panel.innerHTML=`<div style="font-weight:800;margin-bottom:6px">🛡️ CORE-005V5 · Persistenz-Sicherheit</div><div style="font-size:13px;opacity:.82;margin-bottom:10px">Additive Schutzschicht: localStorage + unabhängiger IndexedDB-Durable-Shadow, Write-Read-Check, fehlende kritische Daten wiederherstellen und Diagnose. Keine Cloud.</div><button type="button" id="atmsPersistenceSelfTestBtn" style="width:100%;padding:12px;border-radius:10px;font-weight:800">🧪 Persistenz-Selbsttest</button><button type="button" id="atmsPersistenceCopyBtn" style="width:100%;padding:12px;border-radius:10px;font-weight:800;margin-top:8px">📋 Persistenz-Diagnose kopieren</button><button type="button" id="atmsPersistenceRecoverBtn" style="width:100%;padding:12px;border-radius:10px;font-weight:800;margin-top:8px">↩️ Fehlende geschützte Daten wiederherstellen</button><button type="button" id="atmsRestorePreviousImportBtn" style="width:100%;padding:12px;border-radius:10px;font-weight:800;margin-top:8px">↩️ Letzten Planimport rückgängig machen</button><pre id="atmsPersistenceOutput" style="white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;width:100%;max-width:100%;box-sizing:border-box;max-height:42vh;overflow:auto;margin:10px 0 0;padding:10px;border-radius:10px;background:rgba(0,0,0,.22);font-size:12px;line-height:1.4">Bereit.</pre>`;
  // CORE-005V3: Das Live-Flugdaten-Panel ist auf Mobil bereits nachweislich sichtbar.
  // Deshalb wird die Persistenz-Sicherheit als Kind dieses Panels gemountet.
  // Fallbacks bleiben nur fuer den unwahrscheinlichen Fall, dass Live noch nicht existiert.
  if(liveHost)liveHost.appendChild(panel);
  else{
    const gemini=$('geminiFlightPanel');
    if(gemini)gemini.appendChild(panel);
    else{
      const load=$('loadBtn');
      if(load?.parentElement)load.parentElement.appendChild(panel);
      else view.appendChild(panel);
    }
  }
  const paint=obj=>{const out=$('atmsPersistenceOutput');if(out)out.textContent=JSON.stringify(obj,null,2)};
  $('atmsPersistenceSelfTestBtn')?.addEventListener('click',()=>{const result=persistenceDiagnosis();paint(result);showToast(result.selfTest?.ok?'Persistenz-Selbsttest OK':'Persistenz-Selbsttest fehlgeschlagen',result.selfTest?.ok?'ok':'warn')});
  $('atmsPersistenceCopyBtn')?.addEventListener('click',async()=>{const text=JSON.stringify(persistenceDiagnosis(),null,2);paint(JSON.parse(text));try{await navigator.clipboard.writeText(text);showToast('Persistenz-Diagnose kopiert','ok')}catch(_){showToast('Diagnose wird angezeigt – bitte manuell kopieren','warn')}});
  $('atmsPersistenceRecoverBtn')?.addEventListener('click',()=>{if(!confirm('Nur aktuell FEHLENDE kritische Persistenzdaten aus dem letzten lokalen Sicherheits-Snapshot wiederherstellen? Vorhandene aktuelle Werte werden nicht überschrieben.'))return;const result=restoreMissingCriticalPersistence('manual');paint({recovery:result,diagnosis:persistenceDiagnosis()});showToast(result.restored?`${result.restored} Bereich(e) wiederhergestellt`:'Keine fehlenden geschützten Daten gefunden',result.restored?'ok':'warn')});
  $('atmsRestorePreviousImportBtn')?.addEventListener('click',restorePreviousPlanImport);
  return true;
}
function initPersistenceSafetyPanelObserver(){
  if(window.__atmsPersistenceSafetyPanelObserver)return;
  const attach=()=>{try{ensurePersistenceSafetyPanel()}catch(_){ }};
  attach();
  const observer=new MutationObserver(()=>{if(!$('atmsPersistenceSafetyPanel'))attach()});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  window.__atmsPersistenceSafetyPanelObserver=observer;
  window.addEventListener('focus',attach);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)attach()});
}


function getRideOverrides(){
  try{
    const list=JSON.parse(localStorage.getItem(RIDE_OVERRIDE_KEY)||'[]');
    return Array.isArray(list)?list:[];
  }catch(_){return[]}
}
function saveRideOverrides(list){
  return safePersistentSetItem(RIDE_OVERRIDE_KEY,JSON.stringify((Array.isArray(list)?list:[]).slice(0,500)),'ride-overrides');
}
function upsertRideOverride(rideId,patch){
  const id=String(rideId||'').trim();
  if(!id)return;
  let list=getRideOverrides();
  const existing=list.find(x=>String(x?.rideId||'')===id)||{rideId:id};
  const next={...existing,...patch,rideId:id,updatedAt:new Date().toISOString()};
  list=list.filter(x=>String(x?.rideId||'')!==id);
  list.unshift(next);
  saveRideOverrides(list);
}
function applyRideOverrides(source){
  const overrides=new Map(getRideOverrides().map(x=>[String(x?.rideId||''),x]));
  let changed=0;
  const out=(Array.isArray(source)?source:[]).map(r=>{
    const hit=overrides.get(String(r?.id||''));
    if(!hit)return r;
    let next={...r};
    if(Number.isFinite(Number(hit.price))&&Number(hit.price)>0&&Number(next.price)!==Number(hit.price)){
      next.price=Number(hit.price);
      next.priceConfirmedAt=hit.priceConfirmedAt||hit.updatedAt||'';
      changed++;
    }
    // CORE-004C HOTFIX 05.09.2026: manuelle Flugdaten-Korrekturen pro Fahrt dauerhaft anwenden.
    if(hit.manualFlightEdit===true){
      const no=String(hit.flightNumber??next.flightNumber??'').trim().toUpperCase().replace(/\s+/g,'');
      const loc=String(hit.flightLocation??next.flightLocation??'').trim();
      const iata=String(hit.iata??next.iata??'').trim().toUpperCase();
      if(String(next.flightNumber||'')!==no||String(next.flightLocation||'').trim()!==loc||String(next.iata||'').trim().toUpperCase()!==iata){
        next.flightNumber=no;
        next.flightLocation=loc;
        next.iata=iata;
        next.flightCheckConfidence='manual';
        next.flightNeedsManualCheck=Boolean(no);
        next.manualFlightEditAt=hit.manualFlightEditAt||hit.updatedAt||'';
        changed++;
      }
    }
    if(hit.flightVerified===true&&String(hit.flightLocation||'').trim()){
      const loc=String(hit.flightLocation||'').trim();
      const iata=String(hit.iata||'').trim().toUpperCase();
      if(String(next.flightLocation||'').trim()!==loc||String(next.iata||'').trim().toUpperCase()!==iata){
        next.flightLocation=loc;
        next.iata=iata;
        next.flightCheckConfidence='verified';
        next.flightNeedsManualCheck=false;
        next.flightCheckedAt=hit.flightCheckedAt||next.flightCheckedAt||'';
        changed++;
      }
    }
    return next;
  });
  return {rides:out,changed};
}
window.ATMSPersistPriceOverride=function(ride,price){
  const value=Number(price);
  if(!ride?.id||!Number.isFinite(value)||value<=0)return;
  upsertRideOverride(ride.id,{price:value,priceConfirmedAt:new Date().toISOString()});
};
window.ATMSApplyRideOverrides=function(source){
  return applyRideOverrides(source).rides;
};

// CORE-004C HOTFIX 05.09.2026: funktionierender Editor fuer Flugnummer, Flugort und IATA.
function normalizeManualFlightNumber(value){
  return String(value||'').trim().toUpperCase().replace(/\s+/g,'');
}
function ensureManualFlightEditor(){
  let sheet=document.getElementById('atmsManualFlightEditor');
  if(sheet)return sheet;
  sheet=document.createElement('div');
  sheet.id='atmsManualFlightEditor';
  sheet.style.cssText='display:none;position:fixed;inset:0;z-index:99998;background:rgba(0,10,16,.78);padding:18px;align-items:center;justify-content:center;';
  sheet.innerHTML=`<div style="width:min(520px,100%);background:#062331;border:1px solid #1e607d;border-radius:18px;padding:16px;box-shadow:0 20px 60px rgba(0,0,0,.45);color:#fff;font-family:system-ui,sans-serif">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px"><b style="font-size:20px">✎ Flugdaten ändern</b><span style="flex:1"></span><button id="atmsFlightEditClose" type="button" style="border:0;background:#123747;color:#fff;border-radius:10px;padding:8px 11px;font-size:18px">×</button></div>
    <label style="display:block;font-size:12px;color:#9fc0d0;margin:8px 0 4px">Flugnummer</label>
    <input id="atmsFlightEditNo" autocomplete="off" autocapitalize="characters" style="width:100%;box-sizing:border-box;border:1px solid #2b6077;border-radius:11px;background:#031923;color:#fff;padding:11px;font-size:18px" placeholder="z. B. EW9577">
    <label style="display:block;font-size:12px;color:#9fc0d0;margin:10px 0 4px">Flugort</label>
    <input id="atmsFlightEditPlace" autocomplete="off" style="width:100%;box-sizing:border-box;border:1px solid #2b6077;border-radius:11px;background:#031923;color:#fff;padding:11px;font-size:18px" placeholder="z. B. Palma">
    <label style="display:block;font-size:12px;color:#9fc0d0;margin:10px 0 4px">IATA (optional)</label>
    <input id="atmsFlightEditIata" autocomplete="off" autocapitalize="characters" maxlength="3" style="width:100%;box-sizing:border-box;border:1px solid #2b6077;border-radius:11px;background:#031923;color:#fff;padding:11px;font-size:18px" placeholder="z. B. PMI">
    <div style="font-size:11px;color:#90aeba;margin-top:10px">Manuelle Änderungen werden lokal für diese Fahrt gespeichert. Eine externe Flugprüfung bleibt davon getrennt.</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:15px"><button id="atmsFlightEditCancel" type="button" style="border:1px solid #2b6077;background:#123747;color:#fff;border-radius:12px;padding:12px;font-weight:800">Abbrechen</button><button id="atmsFlightEditSave" type="button" style="border:1px solid #22c96f;background:#087b42;color:#fff;border-radius:12px;padding:12px;font-weight:900">Speichern</button></div>
  </div>`;
  document.body.appendChild(sheet);
  const close=()=>{sheet.style.display='none'};
  sheet.querySelector('#atmsFlightEditClose').addEventListener('click',close);
  sheet.querySelector('#atmsFlightEditCancel').addEventListener('click',close);
  sheet.addEventListener('click',e=>{if(e.target===sheet)close()});
  sheet.querySelector('#atmsFlightEditSave').addEventListener('click',()=>{
    if(!active)return close();
    const no=normalizeManualFlightNumber(sheet.querySelector('#atmsFlightEditNo').value);
    const place=String(sheet.querySelector('#atmsFlightEditPlace').value||'').trim();
    const iata=String(sheet.querySelector('#atmsFlightEditIata').value||'').trim().toUpperCase();
    if(iata&&!/^[A-Z]{3}$/.test(iata)){alert('IATA muss aus genau 3 Buchstaben bestehen.');return}
    const ids=(active._bundleMemberIds||[active.id]).map(String);
    const editedAt=new Date().toISOString();
    rides=rides.map(r=>{
      if(!ids.includes(String(r.id)))return r;
      upsertRideOverride(r.id,{manualFlightEdit:true,flightNumber:no,flightLocation:place,iata,manualFlightEditAt:editedAt});
      return {...r,flightNumber:no,flightLocation:place,iata,flightCheckConfidence:'manual',flightNeedsManualCheck:Boolean(no),manualFlightEditAt:editedAt};
    });
    save();
    close();
    showToast('Flugdaten gespeichert','ok');
    openCockpit(active.id);
  });
  return sheet;
}
function openManualFlightEditor(){
  if(!active)return;
  const sheet=ensureManualFlightEditor();
  sheet.querySelector('#atmsFlightEditNo').value=active.flightNumber||'';
  sheet.querySelector('#atmsFlightEditPlace').value=active.flightLocation||'';
  sheet.querySelector('#atmsFlightEditIata').value=active.iata||'';
  sheet.style.display='flex';
  setTimeout(()=>sheet.querySelector('#atmsFlightEditNo').focus(),0);
}
function isAirport(v){const n=normKey(v);return n.includes('dus airport')||n==='dus' || n.includes('flughafen düsseldorf')||n.includes('duesseldorf airport')}
function directionOf(r){if(isAirport(r.pickup)&&!isAirport(r.destination))return'airport_to_hotels';if(!isAirport(r.pickup)&&isAirport(r.destination))return'hotels_to_airport';return'normal'}
function bundleGroupKey(r){const dir=directionOf(r);if(dir==='normal')return'';return [normKey(r.driver),planTimeOf(r),normKey(r.flightNumber),normKey(r.company||r.partner||r.airline),dir].join('|')}
function sameBundleGroup(a,b){const ka=bundleGroupKey(a),kb=bundleGroupKey(b);return Boolean(ka&&ka===kb)}
function hotelLabel(name){const n=String(name||'').trim();if(/nh\s*nord/i.test(n))return 'NH Nord DUS';if(/holiday\s*inn/i.test(n))return 'Holiday Inn DUS';return n}
function knownBundleRepair(r){
  const flight=normKey(r.flightNumber),driver=normKey(r.driver),time=planTimeOf(r),dir=directionOf(r);
  if(driver==='yannik'&&dir==='hotels_to_airport'&&((flight==='ew9344'&&time==='17:05')||(flight==='ew9422'&&time==='16:05'))){
    const total=Number(r.persons)||0;
    const holiday=flight==='ew9344'?3:Math.max(1,total-2);
    const nh=Math.max(1,total-holiday);
    return [{name:'Holiday Inn DUS',persons:holiday,order:1,type:'pickup'},{name:'NH Nord DUS',persons:nh,order:2,type:'pickup'},{name:'DUS Airport',persons:total,order:3,type:'destination'}];
  }
  return null
}
function routeFromMembers(members,explicitStops){
  const firstRide=members[0],dir=directionOf(firstRide),total=members.reduce((a,x)=>a+(Number(x.persons)||0),0);
  const repaired=knownBundleRepair(firstRide);if(repaired)return repaired;
  if(explicitStops&&firstRide.bundleStops.length){
    const raw=[...firstRide.bundleStops].sort((a,b)=>a.order-b.order).map((s,i)=>({name:hotelLabel(s.name),persons:Number(s.persons)||0,order:i+1,type:s.type||''}));
    if(dir==='hotels_to_airport'){
      const hotels=raw.filter(s=>!isAirport(s.name));
      return [...hotels.map((s,i)=>({...s,order:i+1,type:'pickup'})),{name:firstRide.destination||'DUS Airport',persons:total||Number(firstRide.persons)||0,order:hotels.length+1,type:'destination'}]
    }
    if(dir==='airport_to_hotels'){
      const hotels=raw.filter(s=>!isAirport(s.name));
      return [{name:firstRide.pickup||'DUS Airport',persons:total||Number(firstRide.persons)||0,order:1,type:'start'},...hotels.map((s,i)=>({...s,order:i+2,type:'destination'}))]
    }
  }
  if(dir==='hotels_to_airport'){
    const hotels=[];members.forEach(x=>{if(x.pickup&&!hotels.some(z=>normKey(z.name)===normKey(x.pickup)))hotels.push({name:hotelLabel(x.pickup),persons:Number(x.persons)||0})});
    return [...hotels.map((s,i)=>({...s,order:i+1,type:'pickup'})),{name:firstRide.destination||'DUS Airport',persons:total,order:hotels.length+1,type:'destination'}]
  }
  if(dir==='airport_to_hotels'){
    const hotels=[];members.forEach(x=>{if(x.destination&&!hotels.some(z=>normKey(z.name)===normKey(x.destination)))hotels.push({name:hotelLabel(x.destination),persons:Number(x.persons)||0})});
    return [{name:firstRide.pickup||'DUS Airport',persons:total,order:1,type:'start'},...hotels.map((s,i)=>({...s,order:i+2,type:'destination'}))]
  }
  return []
}
function bundleBilling(members){
  const seenFlights=new Set();
  let totalPrice=0,invoiceCount=0;
  for(const ride of members){
    const flight=normKey(ride.flightNumber);
    const price=Number(ride.price)||0;
    if(flight){
      if(seenFlights.has(flight))continue;
      seenFlights.add(flight);
    }
    totalPrice+=price;
    invoiceCount++;
  }
  return{price:totalPrice||Number(members[0]?.price)||0,invoiceCount:Math.max(1,invoiceCount)}
}
function visualRides(source){
  const used=new Set(),out=[];
  for(const r of source){
    if(used.has(r.id))continue;
    const key=bundleGroupKey(r);
    const group=key?source.filter(x=>!used.has(x.id)&&sameBundleGroup(r,x)):[r];
    const explicitStops=Array.isArray(r.bundleStops)&&r.bundleStops.length>1;
    const repair=knownBundleRepair(r);
    if(group.length>1||explicitStops||repair){
      const members=group.length>1?group:[r];members.forEach(x=>used.add(x.id));
      const routeStops=routeFromMembers(members,explicitStops);
      const firstRide=members[0],dir=directionOf(firstRide),total=members.reduce((a,x)=>a+(Number(x.persons)||0),0)||Number(firstRide.persons)||0;
      const hotelStops=routeStops.filter(s=>!isAirport(s.name));
      const pickup=dir==='hotels_to_airport'?(hotelStops[0]?.name||firstRide.pickup):(routeStops[0]?.name||firstRide.pickup);
      const destination=dir==='hotels_to_airport'?(routeStops.at(-1)?.name||firstRide.destination):(hotelStops.at(-1)?.name||firstRide.destination);
      const billing=bundleBilling(members);
      out.push({...firstRide,id:'bundle::'+members.map(x=>x.id).join('::'),isBundle:true,bundleDirection:dir,routeStops,bundleStops:hotelStops,_bundleMemberIds:members.map(x=>x.id),pickup,destination,persons:total,price:billing.price,invoiceCount:billing.invoiceCount});
    }else{used.add(r.id);out.push({...r,routeStops:[]})}
  }
  return out
}
window.norm=norm;
// CORE-004L Integrationspunkte: Zeiten getrennt aktualisieren, ohne PLAN zu überschreiben.
function updateRideTimeField(rideId,patch){
  const id=String(rideId||'').trim();if(!id)return false;
  const idx=rides.findIndex(r=>String(r?.id||'')===id);if(idx<0)return false;
  rides[idx]=norm({...rides[idx],...patch},idx);save();render();return true
}
window.ATMSSetDispoTime=function(rideId,time){return updateRideTimeField(rideId,{dispoTime:String(time||'').trim()})};
window.ATMSSetLiveTime=function(rideId,time){return updateRideTimeField(rideId,{liveTime:String(time||'').trim(),liveTimeDerivedFromLanding:false})};
window.ATMSSetActualLandingTime=function(rideId,landingTime,bufferMinutes){const patch={actualLandingTime:String(landingTime||'').trim(),liveTime:''};if(bufferMinutes!==undefined&&bufferMinutes!==null&&String(bufferMinutes).trim()!=='')patch.liveBufferOverrideMinutes=Math.max(0,Math.min(120,Math.round(Number(bufferMinutes)||0)));return updateRideTimeField(rideId,patch)};
window.ATMSTimeSnapshot=function(rideId){const r=rides.find(x=>String(x?.id||'')===String(rideId||''));if(!r)return null;return{planTime:planTimeOf(r),dispoTime:dispoTimeOf(r),timeMirror:first(r.timeMirror,r.time_mirror),flightTime:listedFlightTimeOf(r),actualLandingTime:actualLandingTimeOf(r),liveTime:liveTimeOf(r),liveBufferMinutes:liveBufferMinutesOf(r),effectiveTime:effectiveTime(r),effectiveSource:effectiveSource(r)}};
function effectiveTime(r){return first(liveTimeOf(r),dispoTimeOf(r),planTimeOf(r))}function effectiveSource(r){if(liveTimeOf(r))return'live';if(dispoTimeOf(r))return'dispo';return'plan'}function parse(t){let p=JSON.parse(clean(t));if(p.rides)p=p.rides;if(!Array.isArray(p)||!p.length)throw Error('Keine Fahrten gefunden');return p.map(norm)}function save(){
  const corrected=applyRideOverrides(rides);
  rides=corrected.rides;
  safePersistentSetItem(KEY,JSON.stringify(rides),'rides');
  safePersistentSetItem(DONE,JSON.stringify([...done]),'done');
}function money(v){return new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(v||0)}function ridePriceLabel(r){return r&&r.priceMissingFromSource&&!(Number(r.price)>0)?'Preis fehlt':money(r?.price)}function cls(i){return ['','cyan','red','yellow'][i%4]}function matches(r){const q=$('search').value.toLowerCase().trim();return(!driverFilter||r.driver===driverFilter)&&(!q||[r.driver,r.pickup,r.destination,r.flightNumber,r.flightLocation,r.airline].join(' ').toLowerCase().includes(q))}
function flightStatusInfo(r){const raw=first(r.flightStatus,r.flugstatus,r.liveStatus,r.live_status).toLowerCase();const delay=Number(r.delayMinutes??r.delay_minutes??r.verspaetungMinuten??r.verspätung_minuten??r.delay??0)||0;if(/storniert|cancelled|canceled/.test(raw))return{key:'cancelled',label:'Storniert'};if(r.landed||r.gelandet||/gelandet|landed|arrived/.test(raw))return{key:'landed',label:'Gelandet'};if(delay>0||/verspät|delay|late/.test(raw))return{key:'delayed',label:delay>0?`+${delay} Min.`:'Verspätet'};if(/pünkt|on.?time|scheduled/.test(raw))return{key:'on-time',label:'Pünktlich'};return{key:'unknown',label:'Keine Live-Daten'}}function flightStatusMarkup(r){const x=flightStatusInfo(r);return `<span class="flight-status ${x.key}">${esc(x.label)}</span>`}
function timeMarkup(r){
  const plan=planTimeOf(r),dispo=dispoTimeOf(r),live=liveTimeOf(r);
  const base=first(dispo,plan);
  if(live&&base&&live!==base)return `<div class="time-stack"><div class="plan-small">${esc(base)}</div><div class="current-large">${esc(live)}</div></div>`;
  if(!live&&dispo&&plan&&dispo!==plan)return `<div class="time-stack"><div class="plan-small">${esc(plan)}</div><div class="current-large">${esc(dispo)}</div></div>`;
  return `<div class="time-single">${esc(first(live,dispo,plan,'--:--'))}</div>`
}
function listedFlightTimeMarkup(r){
  const value=listedFlightTimeOf(r);
  return value?`<div class="flight-time-note" style="font-size:12px;font-weight:800;margin-top:4px;opacity:.88">🕒 Flugzeit Liste ${esc(value)}</div>`:''
}
function ridePartnerLabel(r){
  const left=String(r.partner||r.airline||r.customer||'').trim();
  const right=String(r.company||'').trim();
  if(left&&right&&left.toLowerCase()===right.toLowerCase())return left;
  return [left,right].filter(Boolean).join(' · ');
}
function rideCard(r,i){
  const routeStops=Array.isArray(r.routeStops)?[...r.routeStops].sort((a,b)=>a.order-b.order):[];
  const bundleRoute=r.isBundle?(r.bundleDirection==='airport_to_hotels'?`DUS Airport → Divers (${Math.max(0,routeStops.length-1)} Ziele)`:`Divers (${Math.max(0,routeStops.length-1)} Abholungen) → DUS Airport`):`${r.pickup||'Start'} → ${r.destination||'Ziel'}`;
  const bundleFlightLabel=r.bundleDirection==='airport_to_hotels'?'Herkunft':'Zielort';
  const manualFlightCheck=Boolean(r.flightNeedsManualCheck||r.flightCheckConfidence==='uncertain');
  const manualFlightBadge=manualFlightCheck?`<span style="font-size:11px;font-weight:800;padding:2px 7px;border-radius:7px;background:rgba(255,176,32,.14);border:1px solid rgba(255,176,32,.38);color:#ffc14d">⚠ manuell prüfen</span>`:'';
  const bundleFlightLocation=r.isBundle&&r.flightLocation?`<div class="flightloc" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:5px 0 4px"><span>✈ ${esc(r.flightLocation)}${r.iata?' ('+esc(r.iata)+')':''}</span><span style="font-size:12px;font-weight:800;padding:2px 7px;border-radius:7px;background:rgba(0,168,255,.15);border:1px solid rgba(0,168,255,.35);color:#16b8ff">${bundleFlightLabel}</span>${manualFlightBadge}</div>`:'';
  const stopRows=r.isBundle&&routeStops.length?`<div class="bundle-stops">${routeStops.map((st,idx)=>`<div class="bundle-stop-row"><span class="bundle-stop-dot" style="background:${isAirport(st.name)?'#00a8ff':'#b45cff'}"></span><span><b>${idx+1}. ${esc(st.name)}</b> <span class="bundle-stop-pax">· ${st.persons||'–'} Pers.${st.type==='destination'?' · Ziel':st.type==='start'?' · Start':st.type==='pickup'?` · ${idx+1}. Abholung`:''}</span></span></div>`).join('')}</div>`:`<div class="flightloc" style="display:flex;align-items:center;gap:7px;flex-wrap:wrap"><span>${esc(r.flightLocation||'Flugort nicht verfügbar')}${r.iata?' ('+esc(r.iata)+')':''}</span>${manualFlightBadge}</div>`;
  return `<article class="ride ${cls(i)} ${r.isBundle?'bundle':''}" data-id="${esc(r.id)}"><span class="stripe"></span><div class="left"><div class="price">${ridePriceLabel(r)}</div>${timeMarkup(r)}<div class="driver-left">${esc(r.driver||'Offen')}</div>${r.isBundle?'<div class="bundle-badge">BÜNDELFAHRT</div>':''}</div><div class="mid"><div class="route">${esc(bundleRoute)}</div><div class="partner">${esc(ridePartnerLabel(r))}</div><div class="meta">✈ ${esc(r.flightNumber||'–')} ${flightStatusMarkup(r)} &nbsp; 🚘 ${esc(r.vehicle)} &nbsp; 👤 ${r.persons||'–'}</div>${bundleFlightLocation}${listedFlightTimeMarkup(r)}${stopRows}</div><div class="chev">›</div></article>`
}
function render(){showView('list');const vr=visualRides(rides);const isDone=r=>r._bundleMemberIds?r._bundleMemberIds.every(id=>done.has(id)):done.has(r.id);
  // CORE-006I: Fahrtenansicht folgt der Reihenfolge der importierten Planliste.
  const open=vr.filter(r=>!isDone(r)&&matches(r));
  const fin=vr.filter(r=>isDone(r)&&matches(r));
$('summary').textContent=`${mode==='all'?open.length+fin.length:open.length} Fahrten · ${driverFilter||'Alle Fahrer'}`;

const stats=$('dashboardStats');

if(stats){
 const drivers=[...new Set(rides.map(r=>r.driver).filter(Boolean))];
 const flights=[...new Set(rides.map(r=>r.flightNumber).filter(Boolean))];
 const notices=rides.filter(r=>{
   const confidence=String(r?.flightCheckConfidence||'').trim().toLowerCase();
   return Boolean(r?.flightNeedsManualCheck || confidence==='uncertain' || r?.flightConflict===true || r?.conflict===true);
 }).length;

 stats.innerHTML=`
 <div class="dashboard-stat">
 <b>${rides.length}</b>
 <span>Fahrten</span>
 </div>

 <div class="dashboard-stat">
 <b>${drivers.length}</b>
 <span>Fahrer</span>
 </div>

 <div class="dashboard-stat">
 <b>${flights.length}</b>
 <span>Flüge</span>
 </div>

 <div class="dashboard-stat">
 <b>${notices}</b>
 <span>Hinweise</span>
 </div>`;
}
let h=`<section class="donebar"><div class="donehead" id="doneHead"><b>✓ Erledigte Fahrten</b><span>${fin.length}</span><button id="toggleDone" class="doneToggle" aria-label="Erledigte Fahrten ein- oder ausklappen">${doneOpen?'⌃':'⌄'}</button></div><div id="doneWrap" class="donewrap ${doneOpen?'':'hidden'}">${fin.length?fin.map(rideCard).join(''):'<div class="done-empty">Noch keine erledigten Fahrten.</div>'}</div></section>`;if(mode==='all'){h+=open.length?open.map(rideCard).join(''):'<div class="empty">Keine offenen Fahrten vorhanden.</div>'}else{h+=open.length?open.map(rideCard).join(''):'<div class="empty">Keine offenen Fahrten vorhanden.</div>'}$('rideList').innerHTML=h;document.querySelectorAll('[data-id]').forEach(x=>x.onclick=()=>openCockpit(x.dataset.id));const t=$('toggleDone');if(t)t.onclick=e=>{e.stopPropagation();doneOpen=!doneOpen;localStorage.setItem(DONE_OPEN,doneOpen?'1':'0');render()};const dh=$('doneHead');if(dh)dh.onclick=e=>{if(e.target.closest('[data-id]'))return;if(e.target.id==='toggleDone')return;doneOpen=!doneOpen;localStorage.setItem(DONE_OPEN,doneOpen?'1':'0');render()};}
function showView(v){['listView','cockpitView','importView','liveDispositionView'].forEach(id=>$(id).classList.add('hidden'));if(v==='list')$('listView').classList.remove('hidden');if(v==='cockpit')$('cockpitView').classList.remove('hidden');if(v==='import')$('importView').classList.remove('hidden');if(v==='live')$('liveDispositionView').classList.remove('hidden')}
function openDrivers(){
  const names=[...new Set(rides.map(r=>String(r.driver||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de'));
  const choices=[{label:'Alle Fahrten',value:''},...names.map(n=>({label:n,value:n}))];
  const box=$('driverChoices');
  const dialog=$('driverDialog');
  if(!box||!dialog){showAppError(new Error('Fahrerauswahl ist nicht verfügbar.'));return}
  box.className=choices.length>10?'ultra':choices.length>6?'dense':'';
  box.innerHTML=choices.map((c,i)=>`<button type="button" class="choice ${driverFilter===c.value?'selected':''}" data-choice-index="${i}"><span class="dot" style="background:${i===0?'#00a8ff':['#ffbd17','#54e20f','#ff3155','#19d8df'][(i-1)%4]}"></span>${esc(c.label)}<span class="grow"></span>${driverFilter===c.value?'✓':''}</button>`).join('');
  box.onclick=e=>{
    const b=e.target.closest('[data-choice-index]');if(!b)return;
    const c=choices[Number(b.dataset.choiceIndex)];if(!c)return;
    driverFilter=c.value;mode='all';dialog.classList.add('hidden');
    document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.nav==='all'));
    render();
  };
  dialog.classList.remove('hidden');
}

function openCockpit(id){active=visualRides(rides).find(r=>r.id===id)||rides.find(r=>r.id===id);if(!active)return;showView('cockpit');const cockpitDispo=first(dispoTimeOf(active),planTimeOf(active))||'--:--';const cockpitCurrent=effectiveTime(active)||'--:--';$('planTime').textContent=cockpitDispo;const leftTimeLabel=$('planTime')?.parentElement?.querySelector('.lbl');if(leftTimeLabel)leftTimeLabel.textContent='DISPO-ZEIT';$('planTime').classList.toggle('plan-replaced',Boolean(cockpitDispo&&cockpitCurrent&&cockpitDispo!=='--:--'&&cockpitCurrent!==cockpitDispo));$('currentTime').textContent=cockpitCurrent;const source=effectiveSource(active);$('currentTimeLabel').textContent=source==='live'?'LIVE-ABHOLZEIT':'AKTUELLE ABHOLZEIT';$('driverA').textContent=$('driverB').textContent=active.driver||'Offen';$('overdue').textContent='';$('flightNum').textContent='✈ '+(active.flightNumber||'–');$('flightLoc').textContent=active.flightLocation?active.flightLocation+(active.iata?' ('+active.iata+')':''):'Flugort nicht verfügbar';const flightTimeHost=$('flightLoc')?.parentElement;let flightListTime=$('flightListTime');if(flightTimeHost&&!flightListTime){flightListTime=document.createElement('div');flightListTime.id='flightListTime';flightListTime.style.cssText='font-size:14px;font-weight:800;margin-top:6px;opacity:.9';flightTimeHost.insertBefore(flightListTime,$('cockFlightStatus')||null)}if(flightListTime)flightListTime.textContent=listedFlightTimeOf(active)?`🕒 Flugzeit Liste ${listedFlightTimeOf(active)}`:'🕒 Flugzeit Liste –';const fsi=flightStatusInfo(active);$('cockFlightStatus').className='flight-status cock-flight-status '+fsi.key;$('cockFlightStatus').textContent=fsi.label;$('partner').textContent=active.partner||active.airline||'–';$('company').textContent=active.company||'–';const routeStops=Array.isArray(active.routeStops)?[...active.routeStops].sort((a,b)=>a.order-b.order):[];const routeBox=$('routeBox');if(active.isBundle&&routeStops.length){const stopHtml=routeStops.map((st,i)=>`<div class="bundle-route-stop ${i===routeStops.length-1?'final':''}"><span class="bundle-route-marker" style="border-color:${isAirport(st.name)?'#00a8ff':'#b45cff'}"></span><div><div class="bundle-route-name">${i+1}. ${esc(st.name)}</div><div class="bundle-route-meta">${st.persons||'–'} Pers. · ${st.type==='destination'?'Ziel':st.type==='start'?'Start':st.type==='pickup'?`${i+1}. Abholung`:`${i+1}. Stopp`}</div></div></div>`).join('');routeBox.innerHTML=`<div style="grid-column:1/-1;width:100%"><div class="bundle-route-title">BÜNDELFAHRT · ${routeStops.length} STOPPS</div><div class="bundle-route-list">${stopHtml}</div></div>`}else{routeBox.innerHTML=`<div class="timeline"><div class="circle"></div><div class="dash"></div><div class="circle bluec"></div></div><div><div id="pickup" class="place">${esc(active.pickup||'–')}</div><div id="pickupMeta" class="small">${active.persons||'–'} Pers. · Abholung</div><div id="destination" class="place">${esc(active.destination||'–')}</div><div id="destMeta" class="small">${active.persons||'–'} Pers. · Ziel</div></div>`;}$('persons').textContent=active.persons||'–';$('vehicle').textContent=active.vehicle||'–';$('price').textContent=ridePriceLabel(active);$('price').title=active.isBundle?`${active.invoiceCount||1} Rechnung${(active.invoiceCount||1)===1?'':'en'}`:'';const activeDone=(active._bundleMemberIds||[active.id]).every(id=>done.has(id));$('doneBtn').textContent=activeDone?'Wieder öffnen':'Erledigt';const statusBadge=$('statusBadge');if(statusBadge){let badgeText='KEINE LIVE-DATEN';let badgeTone='neutral';if(activeDone){badgeText='ERLEDIGT';badgeTone='done'}else if(fsi.key==='on-time'){badgeText='PÜNKTLICH';badgeTone='ok'}else if(fsi.key==='delayed'){badgeText=String(fsi.label||'VERSPÄTET').toUpperCase();badgeTone='warn'}else if(fsi.key==='landed'){badgeText='GELANDET';badgeTone='landed'}else if(fsi.key==='cancelled'){badgeText='STORNIERT';badgeTone='warn'}statusBadge.textContent=badgeText;statusBadge.dataset.atmsTone=badgeTone;if(badgeTone==='neutral'){statusBadge.style.color='#aebfc9';statusBadge.style.borderColor='rgba(174,191,201,.45)';statusBadge.style.background='rgba(174,191,201,.08)'}else{statusBadge.style.removeProperty('color');statusBadge.style.removeProperty('border-color');statusBadge.style.removeProperty('background')}}renderDispatcherControls();renderDriverControls();const editFlightBtn=document.querySelector('#cockpitView .edit');if(editFlightBtn)editFlightBtn.onclick=openManualFlightEditor}

function fullMessagePlace(name){
  const raw=String(name||'').trim();
  if(!raw)return'';
  const n=normKey(raw);
  const hasNh=/nh\s*nord/i.test(raw);
  const hasHoliday=/holiday\s*inn/i.test(raw);
  if(hasNh&&hasHoliday)return'Holiday Inn DUS & NH Nord DUS';
  if(/marriott\s*seestern/i.test(raw)||n==='seestern dus'||n==='seestern düsseldorf'||n==='seestern duesseldorf')return'Marriott Seestern DUS';
  if(hasHoliday)return'Holiday Inn DUS';
  if(hasNh)return'NH Nord DUS';
  return raw;
}
function uniqueMessagePlaces(values){
  const out=[];
  for(const value of values){
    const normalized=fullMessagePlace(value);
    if(!normalized)continue;
    normalized.split(/\s*&\s*/).forEach(part=>{
      const place=part.trim();
      if(place&&!out.some(x=>normKey(x)===normKey(place)))out.push(place);
    });
  }
  return out;
}
function rideMessagePlaces(r,kind){
  if(!r)return[];
  const rs=Array.isArray(r.routeStops)?[...r.routeStops].sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0)):[];
  const direction=r.bundleDirection||directionOf(r);
  if(r.isBundle&&rs.length){
    const wanted=kind==='pickup'
      ? rs.filter(x=>x.type==='pickup'||(direction==='hotels_to_airport'&&!isAirport(x.name)))
      : rs.filter(x=>x.type==='destination'||(direction==='airport_to_hotels'&&!isAirport(x.name)));
    const places=uniqueMessagePlaces(wanted.map(x=>x.name));
    if(places.length)return places;
  }
  return uniqueMessagePlaces([kind==='pickup'?r.pickup:r.destination]);
}
function ridePickupSummary(r){return rideMessagePlaces(r,'pickup').join(' & ')}
function rideDestinationSummary(r){return rideMessagePlaces(r,'destination').join(' & ')}
function getInfoChatSettings(){
  try{
    const saved=JSON.parse(localStorage.getItem(INFO_CHAT_SETTINGS)||'{}');
    const type=saved.type==='single'?'single':'group';
    return {
      name:String(saved.name||'INFO / STATUS').trim()||'INFO / STATUS',
      type,
      phone:String(saved.phone||'').trim()
    };
  }catch{return{name:'INFO / STATUS',type:'group',phone:''}}
}
function saveInfoChatSettings(){
  const name=String($('infoChatName')?.value||'').trim()||'INFO / STATUS';
  const type=$('infoChatType')?.value==='single'?'single':'group';
  const phone=String($('infoChatPhone')?.value||'').trim();
  if(type==='single'&&!cleanPhone(phone)){
    alert('Bitte für den WhatsApp-Einzelchat eine Telefonnummer eingeben.');
    return;
  }
  localStorage.setItem(INFO_CHAT_SETTINGS,JSON.stringify({name,type,phone}));
  renderInfoChatSettings();
  showToast('Info-/Status-Chat gespeichert','ok');
  updateBackupUI();
}
function renderInfoChatSettings(){
  const settings=getInfoChatSettings();
  const name=$('infoChatName'),type=$('infoChatType'),phone=$('infoChatPhone');
  const status=$('infoChatStatus'),button=$('infoStatusBtn');
  if(name&&document.activeElement!==name)name.value=settings.name;
  if(type)type.value=settings.type;
  if(phone&&document.activeElement!==phone)phone.value=settings.phone;
  if(phone){
    phone.disabled=settings.type!=='single';
    phone.placeholder=settings.type==='single'?'z. B. +4915112345678':'Bei WhatsApp-Gruppen nicht erforderlich';
  }
  if(status){
    status.textContent=settings.type==='single'
      ? `Aktiver Einzelchat: ${settings.name}${settings.phone?' · '+settings.phone:''}`
      : `Aktiver Gruppenchat: ${settings.name} · Gruppe wird in WhatsApp ausgewählt`;
  }
  if(button)button.textContent=`📢 ${settings.name}`;
}
function getWhatsappSettings(){return {infoChat:getInfoChatSettings()}}
function getDispatchers(){let d=[];try{d=JSON.parse(localStorage.getItem(DISP_SETTINGS)||'[]')}catch{}if(!Array.isArray(d))d=[];const legacy=(()=>{try{return JSON.parse(localStorage.getItem(WA_SETTINGS)||'{}')}catch{return{}}})();if(!d.length&&legacy.phone)d=[{id:'disp-1',name:legacy.name||'Ewa',phone:legacy.phone}];return d.filter(x=>x&&x.name)}
function saveDispatchers(list,currentId){localStorage.setItem(DISP_SETTINGS,JSON.stringify(list));if(currentId!==undefined)localStorage.setItem(DISP_SETTINGS+'_current',currentId||'')}
function currentDispatcherId(){return localStorage.getItem(DISP_SETTINGS+'_current')||''}
function getCurrentDispatcher(){const list=getDispatchers();return list.find(x=>x.id===currentDispatcherId())||list[0]||null}
function setCurrentDispatcher(id){saveDispatchers(getDispatchers(),id);renderDispatcherControls()}
function saveWhatsappSettings(){saveInfoChatSettings()}
function addDispatcher(){const name=$('dispatcherName').value.trim(),phone=$('dispatcherPhone').value.trim();if(!name||!cleanPhone(phone)){alert('Bitte Name und Telefonnummer eingeben.');return}const list=getDispatchers();if(list.length>=20){alert('Es können maximal 20 Disponenten gespeichert werden.');return}const id='disp-'+Date.now();list.push({id,name,phone});saveDispatchers(list,currentDispatcherId()||id);$('dispatcherName').value='';$('dispatcherPhone').value='';renderDispatcherList();renderDispatcherControls();updateBackupUI()}
function deleteDispatcher(id){let list=getDispatchers().filter(x=>x.id!==id);const next=currentDispatcherId()===id?(list[0]?.id||''):currentDispatcherId();saveDispatchers(list,next);renderDispatcherList();renderDispatcherControls();updateBackupUI()}
function chooseDispatcher(id){setCurrentDispatcher(id);renderDispatcherList()}
function renderDispatcherList(){const box=$('dispatcherList');if(!box)return;const list=getDispatchers(),current=currentDispatcherId()||(list[0]?.id||'');box.innerHTML=list.length?list.map(d=>`<div class="dispatcher-item"><div><b>${esc(d.name)}</b><small>${esc(d.phone)}</small>${d.id===current?'<div class="current-chip">✓ Aktueller Disponent</div>':''}</div><div class="dispatcher-item-actions"><button class="mini" type="button" onclick="chooseDispatcher('${d.id}')">Aktiv</button><a class="mini" href="tel:${cleanPhone(d.phone)}">📞</a><button class="mini danger" type="button" onclick="deleteDispatcher('${d.id}')">✕</button></div></div>`).join(''):'<div class="setting-note">Noch kein Disponent gespeichert.</div>'}
function renderDispatcherControls(){const sel=$('cockpitDispatcherSelect'),list=getDispatchers();if(!sel)return;let current=currentDispatcherId();if(!current&&list[0]){current=list[0].id;saveDispatchers(list,current)}sel.innerHTML=list.length?list.map(d=>`<option value="${d.id}" ${d.id===current?'selected':''}>👤 ${esc(d.name)}</option>`).join(''):'<option value="">Kein Disponent</option>';const d=getCurrentDispatcher(),phone=d?cleanPhone(d.phone):'';$('cockpitDispatcherInfo').textContent=d?`${d.name} · ${d.phone}`:'Bitte zuerst in den Einstellungen einen Disponenten anlegen.';$('cockpitCallBtn').href=phone?'tel:'+phone:'#';$('cockpitCallBtn').classList.toggle('hidden',!phone);$('cockpitDispatcherMessageBtn').disabled=!phone}
function loadWhatsappSettings(){renderInfoChatSettings();renderDispatcherList();renderDispatcherControls();renderDriverContactList();renderDriverControls();updateBackupUI()}
function cleanPhone(v){return String(v||'').replace(/[^0-9]/g,'')}
function getDriverContacts(){let d=[];try{d=JSON.parse(localStorage.getItem(DRIVER_SETTINGS)||'[]')}catch{}if(!Array.isArray(d))d=[];return d.filter(x=>x&&x.name).map(x=>({id:x.id||('driver-'+Date.now()+Math.random()),name:String(x.name||'').trim(),phone:String(x.phone||''),vehicle:String(x.vehicle||''),note:String(x.note||''),favorite:!!x.favorite,active:x.active!==false}))}
function saveDriverContacts(list){localStorage.setItem(DRIVER_SETTINGS,JSON.stringify(list))}
function resetDriverForm(){['driverContactName','driverContactPhone','driverContactVehicle','driverContactNote','driverContactEditId'].forEach(id=>{const e=$(id);if(e)e.value=''});if($('driverContactFavorite'))$('driverContactFavorite').checked=false;if($('driverContactActive'))$('driverContactActive').checked=true;if($('addDriverContact'))$('addDriverContact').textContent='+ Fahrer speichern'}
function addDriverContact(){const name=$('driverContactName').value.trim(),phone=$('driverContactPhone').value.trim(),vehicle=$('driverContactVehicle').value.trim(),note=$('driverContactNote').value.trim(),favorite=!!$('driverContactFavorite').checked,activeFlag=!!$('driverContactActive').checked,editId=$('driverContactEditId').value.trim();if(!name){alert('Bitte Fahrername eingeben.');return}if(phone&&!cleanPhone(phone)){alert('Bitte eine gültige Telefonnummer eingeben oder das Feld leer lassen.');return}const list=getDriverContacts();const duplicate=list.find(x=>normKey(x.name)===normKey(name)&&x.id!==editId);if(duplicate){alert('Dieser Fahrer ist bereits gespeichert.');return}if(editId){const d=list.find(x=>x.id===editId);if(d)Object.assign(d,{name,phone,vehicle,note,favorite,active:activeFlag})}else{list.push({id:'driver-'+Date.now(),name,phone,vehicle,note,favorite,active:activeFlag})}saveDriverContacts(list);resetDriverForm();renderDriverContactList();renderDriverControls();updateBackupUI();showToast(editId?'Fahrer aktualisiert':'Fahrer gespeichert','ok')}
function editDriverContact(id){const d=getDriverContacts().find(x=>x.id===id);if(!d)return;$('driverContactName').value=d.name;$('driverContactPhone').value=d.phone||'';$('driverContactVehicle').value=d.vehicle||'';$('driverContactNote').value=d.note||'';$('driverContactFavorite').checked=!!d.favorite;$('driverContactActive').checked=d.active!==false;$('driverContactEditId').value=d.id;$('addDriverContact').textContent='Änderungen speichern';$('driverContactName').scrollIntoView({behavior:'smooth',block:'center'})}
function deleteDriverContact(id){const d=getDriverContacts().find(x=>x.id===id);if(!d)return;if(rides.some(r=>normKey(r.driver)===normKey(d.name)&&!(r._bundleMemberIds||[r.id]).every(x=>done.has(x)))){alert(`Dieser Fahrer ist noch offenen Fahrten zugeordnet. Deaktiviere ihn stattdessen oder weise die Fahrten zuerst neu zu.`);return}if(!confirm(`Fahrer „${d.name}“ wirklich löschen?`))return;saveDriverContacts(getDriverContacts().filter(x=>x.id!==id));renderDriverContactList();renderDriverControls();updateBackupUI()}
function toggleDriverFavorite(id){const list=getDriverContacts(),d=list.find(x=>x.id===id);if(!d)return;d.favorite=!d.favorite;saveDriverContacts(list);renderDriverContactList();renderDriverControls()}
function toggleDriverActive(id){const list=getDriverContacts(),d=list.find(x=>x.id===id);if(!d)return;d.active=!d.active;saveDriverContacts(list);renderDriverContactList();renderDriverControls()}
function renderDriverContactList(){const box=$('driverContactList');if(!box)return;const q=normKey(($('driverContactSearch')&&$('driverContactSearch').value)||''),showInactive=!!($('driverShowInactive')&&$('driverShowInactive').checked);let list=getDriverContacts().filter(d=>(showInactive||d.active!==false)&&(!q||[d.name,d.phone,d.vehicle,d.note].some(v=>normKey(v).includes(q))));list.sort((a,b)=>(Number(b.favorite)-Number(a.favorite))||(Number(b.active)-Number(a.active))||a.name.localeCompare(b.name,'de'));box.innerHTML=list.length?list.map(d=>`<div class="dispatcher-item"><div><b>${d.favorite?'⭐ ':''}${esc(d.name)}</b><small>${esc(d.phone||'Keine Telefonnummer')}</small><div class="driver-item-meta">${d.vehicle?`<span class="driver-chip">🚐 ${esc(d.vehicle)}</span>`:''}<span class="driver-chip ${d.active?'active':'inactive'}">${d.active?'🟢 Aktiv':'🔴 Inaktiv'}</span>${d.favorite?'<span class="driver-chip fav">Favorit</span>':''}</div>${d.note?`<div class="driver-note">${esc(d.note)}</div>`:''}</div><div class="dispatcher-item-actions"><button class="mini" type="button" onclick="toggleDriverFavorite('${d.id}')">${d.favorite?'★':'☆'}</button><button class="mini" type="button" onclick="editDriverContact('${d.id}')">✎</button><button class="mini" type="button" onclick="toggleDriverActive('${d.id}')">${d.active?'Pause':'Aktiv'}</button>${cleanPhone(d.phone)?`<a class="mini" href="tel:${cleanPhone(d.phone)}">📞</a>`:''}<button class="mini danger" type="button" onclick="deleteDriverContact('${d.id}')">✕</button></div></div>`).join(''):'<div class="setting-note">Keine passenden Fahrer gefunden.</div>'}
function availableDrivers(){const byName=new Map();getDriverContacts().filter(d=>d.active!==false).forEach(d=>byName.set(normKey(d.name),{...d}));rides.forEach(r=>{const name=String(r.driver||'').trim();if(!name)return;const k=normKey(name);if(!byName.has(k))byName.set(k,{id:'ride-driver-'+k,name,phone:first(r.driverPhone,r.fahrerTelefon,r.fahrer_telefon,r.phone,r.telefon,r.tel),vehicle:r.vehicle||'',favorite:false,active:true})});return [...byName.values()].sort((a,b)=>(Number(b.favorite)-Number(a.favorite))||a.name.localeCompare(b.name,'de'))}
function selectedDriverContact(){const sel=$('cockpitDriverSelect');const list=availableDrivers();return list.find(x=>x.id===(sel&&sel.value))||list.find(x=>active&&normKey(x.name)===normKey(active.driver))||list[0]||null}
function renderDriverControls(){const sel=$('cockpitDriverSelect');if(!sel)return;const list=availableDrivers();const preferred=list.find(x=>active&&normKey(x.name)===normKey(active.driver));const current=preferred||(sel.value&&list.find(x=>x.id===sel.value))||list[0];sel.innerHTML=list.length?list.map(d=>`<option value="${d.id}" ${current&&d.id===current.id?'selected':''}>👤 ${esc(d.name)}</option>`).join(''):'<option value="">Kein Fahrer</option>';if(current)sel.value=current.id;const d=selectedDriverContact(),phone=cleanPhone(d&&d.phone);$('cockpitDriverInfo').textContent=d?[d.name,d.phone||'Telefonnummer fehlt',d.vehicle||'',d.note||''].filter(Boolean).join(' · '):'Bitte Fahrer in den Einstellungen anlegen.';$('cockpitDriverCallBtn').href=phone?'tel:'+phone:'#';$('cockpitDriverCallBtn').classList.toggle('hidden',!phone);$('cockpitDriverMessageBtn').disabled=!phone}
function privateRideMessage(r,targetLabel){
  if(!r)return'';
  const lines=[];
  lines.push(`Hallo${targetLabel?', '+targetLabel:''},`);
  lines.push('');
  lines.push(`Zeit: ${effectiveTime(r)||'–'} Uhr`);
  if(r.driver)lines.push(`Fahrer: ${r.driver}`);
  if(r.flightNumber)lines.push(`Flug: ${r.flightNumber}`);
  if(r.flightLocation)lines.push(`Flugort: ${r.flightLocation}${r.iata?` (${r.iata})`:''}`);
  lines.push(`Abholung: ${ridePickupSummary(r)||'–'}`);
  lines.push(`Ziel: ${rideDestinationSummary(r)||'–'}`);
  if(r.persons)lines.push(`Personen: ${r.persons}`);
  if(r.vehicle)lines.push(`Fahrzeug: ${r.vehicle}`);
  return lines.join('\n');
}
function openPrivateWhatsapp(phone,label,text=''){
  const p=cleanPhone(phone);
  if(!p){alert(`Für ${label||'diesen Kontakt'} ist keine Telefonnummer gespeichert.`);return}
  const encoded=encodeURIComponent(text||'');
  const mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const url=mobile
    ? `whatsapp://send?phone=${p}${encoded?`&text=${encoded}`:''}`
    : `https://api.whatsapp.com/send?phone=${p}${encoded?`&text=${encoded}`:''}`;
  window.location.href=url;
}
function openDispatcherMessage(){
  const d=getCurrentDispatcher();
  const text=infoStatusMessage(active);
  if(!text){alert('Für diese Fahrt konnte kein Dispo-Text erstellt werden.');return}
  openPrivateWhatsapp(d&&d.phone,d&&d.name||'den Disponenten',text);
}
function openDriverMessage(){
  const d=selectedDriverContact();
  openPrivateWhatsapp(d&&d.phone,d&&d.name||'den Fahrer',privateRideMessage(active,d&&d.name||''));
}
function infoStatusMessage(r){
  if(!r)return'';
  const direction=r.bundleDirection||directionOf(r);
  if(direction==='hotels_to_airport')return ridePickupSummary(r);
  if(direction==='airport_to_hotels')return rideDestinationSummary(r);
  return ridePickupSummary(r)||rideDestinationSummary(r);
}
function openInfoStatus(){
  if(!active)return;
  const text=infoStatusMessage(active);
  if(!text){alert('Für diese Fahrt konnte kein Info-/Status-Text erstellt werden.');return}
  const settings=getInfoChatSettings();
  if(settings.type==='single'){
    openPrivateWhatsapp(settings.phone,settings.name,text);
    return;
  }
  const encoded=encodeURIComponent(text);
  const mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  window.location.href=mobile?`whatsapp://send?text=${encoded}`:`https://api.whatsapp.com/send?text=${encoded}`;
}
function whatsappMessage(r){return infoStatusMessage(r)}
function openWhatsapp(){openInfoStatus()}
// CORE-004L BACKUP HOTFIX 06.09.2026: alle lokalen ATMS-Bereiche sicher in das Backup übernehmen.
function atmsStorageSnapshot(){
  const snapshot={};
  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i);
    if(key&&key.startsWith('atms_')) snapshot[key]=localStorage.getItem(key)??'';
  }
  return snapshot;
}
function backupPayload(){
  return {
    format:'ATMS_BACKUP',
    formatVersion:1,
    app:'ATMS PRO',
    appVersion:'14.6.8 CR-004.3',
    createdAt:new Date().toISOString(),
    storage:atmsStorageSnapshot()
  };
}
function downloadTextFile(text,name,type){
  const blob=new Blob([text],{type:type||'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function backupFileName(){
  const d=new Date(),p=n=>String(n).padStart(2,'0');
  return `ATMS_Backup_${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}.atms`;
}
function setBackupStatus(message,type){
  const el=$('backupStatus');if(el){el.textContent=message;el.className='backup-status '+(type||'');}
}
function updateBackupUI(){
  const ds=getDispatchers().length;
  let rc=0;try{rc=JSON.parse(localStorage.getItem(KEY)||'[]').length||0}catch{}
  const dc=$('backupDispatcherCount'),rr=$('backupRideCount');if(dc)dc.textContent=ds;if(rr)rr.textContent=rc;
  let meta={};try{meta=JSON.parse(localStorage.getItem(BACKUP_META)||'{}')}catch{}
  const info=$('infoBackupStatus');
  if(meta.createdAt){
    const dt=new Date(meta.createdAt);const text='Letzte Sicherung: '+dt.toLocaleDateString('de-DE')+' · '+dt.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});
    setBackupStatus(text,'ok');if(info){info.textContent=dt.toLocaleDateString('de-DE')+' · '+dt.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});info.classList.remove('warn');info.classList.add('status');}
  }else{setBackupStatus('Noch keine Sicherung erstellt.','warn');if(info){info.textContent='Noch keine Sicherung';info.classList.add('warn');info.classList.remove('status');}}
}
function exportAtmsBackup(){
  try{
    const payload=backupPayload();
    downloadTextFile(JSON.stringify(payload,null,2),backupFileName(),'application/octet-stream');
    localStorage.setItem(BACKUP_META,JSON.stringify({createdAt:payload.createdAt,appVersion:payload.appVersion}));
    updateBackupUI();
  }catch(e){setBackupStatus('Backup konnte nicht erstellt werden: '+e.message,'warn');}
}
function chooseBackupFile(){const input=$('backupFileInput');if(input){input.value='';input.click();}}
async function importAtmsBackup(file){
  try{
    const obj=JSON.parse(await file.text());
    if(!obj||obj.format!=='ATMS_BACKUP'||!obj.storage||typeof obj.storage!=='object') throw Error('Keine gültige ATMS-Backup-Datei.');
    const keys=Object.keys(obj.storage);
    if(!confirm(`Backup vom ${obj.createdAt?new Date(obj.createdAt).toLocaleString('de-DE'):'unbekannten Datum'} wiederherstellen?\n\n${keys.length} gespeicherte Bereiche werden übernommen.`))return;
    keys.forEach(k=>{if(k.startsWith('atms_'))localStorage.setItem(k,String(obj.storage[k]??''));});
    localStorage.setItem(BACKUP_META,JSON.stringify({createdAt:new Date().toISOString(),restoredFrom:obj.createdAt||'',appVersion:obj.appVersion||''}));
    alert('Backup wurde erfolgreich wiederhergestellt. ATMS wird neu geladen.');location.reload();
  }catch(e){setBackupStatus('Wiederherstellung fehlgeschlagen: '+e.message,'warn');alert('Backup konnte nicht importiert werden.');}
}
function resetAtmsData(){
  if(!confirm('Wirklich alle lokal gespeicherten ATMS-Daten löschen?\n\nDisponenten, Fahrten, Erledigt-Status und Einstellungen werden entfernt.'))return;
  if(!confirm('Letzte Sicherheitsabfrage: Daten endgültig zurücksetzen?'))return;
  const keys=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('atms_'))keys.push(k)}keys.forEach(k=>localStorage.removeItem(k));
  localStorage.removeItem(PERSIST_SAFETY_KEY);localStorage.removeItem(PERSIST_AUDIT_KEY);clearPersistenceDurableShadow();
  alert('ATMS-Daten wurden zurückgesetzt.');location.reload();
}


/* FLIGHT-001 – Gemini-Flugprüfung (halbautomatisch, ohne API) */
function flightAirportIataFromPlace(value){
  const raw=String(value||'').trim();
  if(!raw)return'';
  const upper=raw.toUpperCase();
  const n=normKey(raw);

  // Explizite, ausgeschriebene Flughafennamen bleiben sicher erkennbar.
  if(n.includes('flughafen düsseldorf')||n.includes('flughafen duesseldorf')||n.includes('düsseldorf airport')||n.includes('duesseldorf airport'))return'DUS';
  if(n.includes('flughafen köln')||n.includes('flughafen koeln')||n.includes('cologne bonn airport')||n.includes('köln/bonn')||n.includes('koeln/bonn'))return'CGN';

  // Ein reiner IATA-Code ist eindeutig.
  const exact=upper.match(/^([A-Z]{3})$/);
  if(exact)return exact[1];

  // Generisch: Drei-Buchstaben-IATA nur dann übernehmen, wenn der Text
  // eindeutig einen Flughafenbereich bezeichnet. Dadurch wird z. B.
  // "CGN Vorfeld" erkannt, aber "NH Nord DUS" NICHT als Flughafen.
  if(/\b(?:AIRPORT|FLUGHAFEN|VORFELD|AIRSIDE)\b/i.test(raw)){
    const tokens=upper.match(/\b[A-Z]{3}\b/g)||[];
    if(tokens.length===1)return tokens[0];
  }
  return'';
}
function flightAirportContext(r){
  const pickupIata=flightAirportIataFromPlace(r?.pickup||r?.abholort||'');
  const destinationIata=flightAirportIataFromPlace(r?.destination||r?.zielort||r?.ziel||'');
  if(pickupIata&&!destinationIata)return{airportIata:pickupIata,direction:'arrival'};
  if(!pickupIata&&destinationIata)return{airportIata:destinationIata,direction:'departure'};
  return{airportIata:'',direction:'unknown'};
}
function flightDirectionForGemini(r){return flightAirportContext(r).direction}
function flightAirportForGemini(r){return flightAirportContext(r).airportIata}

/* FLIGHT-CACHE-001 – geprüfte Gemini-Flugorte dauerhaft für exakt dieselbe Planfahrt sichern */
function flightCacheNumber(value){
  let v=String(value||'').trim().toUpperCase().replace(/\s+/g,'');
  if(/^0S\d{1,4}[A-Z]?$/.test(v))v='OS'+v.slice(2);
  return v;
}
function berlinDate(value=new Date()){
  try{
    return new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));
  }catch(_){
    const d=new Date(value),p=n=>String(n).padStart(2,'0');
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
  }
}
function flightRideFingerprint(r){
  const parts=[
    r?.sourceFile||'',
    Number(r?.sourceRow||0)||'',
    planTimeOf(r)||'',
    r?.pickup||'',
    r?.destination||'',
    flightCacheNumber(r?.flightNumber||r?.arrivalFlight||r?.departureFlight),
    flightDirectionForGemini(r),
    r?.flightTime||'',
    r?.driver||'',
    Number(r?.persons||0)||''
  ];
  return parts.map(v=>normKey(v)).join('|');
}
function getFlightCache(){
  try{
    const list=JSON.parse(localStorage.getItem(FLIGHT_CACHE)||'[]');
    return Array.isArray(list)?list:[];
  }catch(_){return[]}
}
function getVerifiedFlightCacheBackup(){
  try{
    const list=JSON.parse(localStorage.getItem(FLIGHT_CACHE_BACKUP)||'[]');
    return Array.isArray(list)?list:[];
  }catch(_){return[]}
}
function flightCacheEntryTuple(x){
  return {
    flight:flightCacheNumber(x?.flightNumber),
    date:String(x?.date||'').trim(),
    direction:String(x?.direction||'unknown').trim().toLowerCase(),
    flightTime:String(x?.flightTime||'').trim()
  };
}
function flightCacheTupleKey(x){
  const t=flightCacheEntryTuple(x);
  return [t.flight,t.date,t.direction,t.flightTime].join('|');
}
function isVerifiedFlightCacheEntry(x){
  return x?.verified===true&&Boolean(String(x?.flightLocation||'').trim());
}
function saveVerifiedFlightCacheBackup(list){
  const verified=(Array.isArray(list)?list:[]).filter(isVerifiedFlightCacheEntry);
  const byTuple=new Map();
  verified
    .slice()
    .sort((a,b)=>new Date(b?.checkedAt||0)-new Date(a?.checkedAt||0))
    .forEach(entry=>{const key=flightCacheTupleKey(entry);if(key&&!byTuple.has(key))byTuple.set(key,entry)});
  safePersistentSetItem(FLIGHT_CACHE_BACKUP,JSON.stringify(Array.from(byTuple.values()).slice(0,400)),'verified-flight-backup');
}
function saveFlightCache(list){
  const safe=(Array.isArray(list)?list:[]).slice(0,400);
  safePersistentSetItem(FLIGHT_CACHE,JSON.stringify(safe),'flight-cache');
  const merged=[...getVerifiedFlightCacheBackup(),...safe.filter(isVerifiedFlightCacheEntry)];
  saveVerifiedFlightCacheBackup(merged);
}
function recoverVerifiedFlightCache(){
  const backup=getVerifiedFlightCacheBackup();
  if(!backup.length)return 0;
  let cache=getFlightCache(),changed=0;
  for(const entry of backup){
    if(!isVerifiedFlightCacheEntry(entry))continue;
    const key=flightCacheTupleKey(entry);
    const already=cache.some(x=>flightCacheTupleKey(x)===key&&isVerifiedFlightCacheEntry(x));
    if(!already){cache.unshift(entry);changed++;}
  }
  if(changed){
    safePersistentSetItem(FLIGHT_CACHE,JSON.stringify(cache.slice(0,400)),'flight-cache-recovery');
  }
  return changed;
}
function upsertFlightCache(entries){
  if(!Array.isArray(entries)||!entries.length)return;
  let cache=getFlightCache();
  for(const entry of entries){
    const fp=String(entry.fingerprint||'');
    const rideId=String(entry.rideId||'');
    const incomingTuple=flightCacheTupleKey(entry);
    const incomingVerified=isVerifiedFlightCacheEntry(entry);

    // CORE-005T: Ein unsicherer/leerer Treffer darf einen bereits verifizierten
    // Eintrag desselben konkreten Fluges niemals verdrängen. Außerdem werden
    // gleiche rideId/fingerprint-Werte nur innerhalb desselben Datum/Richtung/Zeit-Tupels ersetzt.
    const protectedVerified=cache.some(x=>{
      if(!isVerifiedFlightCacheEntry(x)||flightCacheTupleKey(x)!==incomingTuple)return false;
      const sameFingerprint=fp&&String(x.fingerprint||'')===fp;
      const sameRide=rideId&&String(x.rideId||'')===rideId;
      return sameFingerprint||sameRide;
    });
    if(!incomingVerified&&protectedVerified)continue;

    cache=cache.filter(x=>{
      if(flightCacheTupleKey(x)!==incomingTuple)return true;
      const sameFingerprint=fp&&String(x.fingerprint||'')===fp;
      const sameRide=rideId&&String(x.rideId||'')===rideId;
      return !(sameFingerprint||sameRide);
    });
    cache.unshift(entry);
  }
  saveFlightCache(cache);
}
function flightCacheMatchTuple(r){
  const flight=flightCacheNumber(r?.flightNumber||r?.arrivalFlight||r?.departureFlight);
  const date=String(r?.date||'').trim();
  const direction=String(flightDirectionForGemini(r)||'unknown').trim().toLowerCase();
  const airportIata=String(flightAirportForGemini(r)||'').trim().toUpperCase();
  const flightTime=String(first(r?.flightTime,r?.flugzeit,r?.flight_time)||'').trim();
  return {flight,date,direction,airportIata,flightTime};
}
function findFlightCacheForRide(r){
  const key=flightCacheMatchTuple(r);
  // CORE-005Q: Ohne konkreten Plantag wird bewusst KEIN persistenter Treffer angewendet.
  // Dadurch kann niemals eine Pruefung eines anderen Tages in einen neuen Import rutschen.
  if(!key.flight||!key.date)return null;
  const candidates=getFlightCache().filter(x=>{
    if(!x)return false;
    const cacheFlight=flightCacheNumber(x.flightNumber);
    const cacheDate=String(x.date||'').trim();
    const cacheDirection=String(x.direction||'unknown').trim().toLowerCase();
    const cacheAirportIata=String(x.airportIata||'').trim().toUpperCase();
    const cacheFlightTime=String(x.flightTime||'').trim();

    // Bestehende ältere DUS-Cache-Einträge haben noch kein airportIata.
    // Diese bleiben für DUS kompatibel, dürfen aber niemals auf CGN oder
    // einen anderen Flughafen übertragen werden.
    if(cacheAirportIata&&key.airportIata&&cacheAirportIata!==key.airportIata)return false;
    if(!cacheAirportIata&&key.airportIata&&key.airportIata!=='DUS')return false;
    if(cacheAirportIata&&!key.airportIata)return false;

    return cacheFlight===key.flight
      && cacheDate===key.date
      && cacheDirection===key.direction
      && cacheFlightTime===key.flightTime;
  });
  candidates.sort((a,b)=>new Date(b.checkedAt||0)-new Date(a.checkedAt||0));
  return candidates[0]||null;
}
function applyFlightCacheToRides(source){
  let changed=0,verifiedRestored=0,manualRestored=0;
  const out=(Array.isArray(source)?source:[]).map(r=>{
    const hit=findFlightCacheForRide(r);
    if(!hit)return r;
    const verified=hit.verified===true && Boolean(String(hit.flightLocation||'').trim());
    const nextLocation=String(hit.flightLocation||'').trim();
    const nextIata=String(hit.iata||'').trim().toUpperCase();
    const next={...r};
    let rowChanged=false;

    if(verified){
      if(String(next.flightLocation||'').trim()!==nextLocation){next.flightLocation=nextLocation;rowChanged=true;}
      if(String(next.iata||'').trim().toUpperCase()!==nextIata){next.iata=nextIata;rowChanged=true;}
      if(next.flightCheckConfidence!=='verified'){next.flightCheckConfidence='verified';rowChanged=true;}
      if(next.flightNeedsManualCheck!==false){next.flightNeedsManualCheck=false;rowChanged=true;}
      if(Boolean(next.flightConflict)!==Boolean(hit.conflict)){next.flightConflict=Boolean(hit.conflict);rowChanged=true;}
      verifiedRestored++;
    }else{
      // Unsichere Pruefungen duerfen den vorhandenen Planort niemals loeschen oder ersetzen.
      // Der manuelle Hinweis wird aber sofort wiederhergestellt, damit der Zaehler nach Neuimport stimmt.
      if(next.flightCheckConfidence!=='uncertain'){next.flightCheckConfidence='uncertain';rowChanged=true;}
      if(next.flightNeedsManualCheck!==true){next.flightNeedsManualCheck=true;rowChanged=true;}
      if(Boolean(next.flightConflict)!==Boolean(hit.conflict)){next.flightConflict=Boolean(hit.conflict);rowChanged=true;}
      manualRestored++;
    }

    const checkedAt=String(hit.checkedAt||'');
    if(checkedAt&&String(next.flightCheckedAt||'')!==checkedAt){next.flightCheckedAt=checkedAt;rowChanged=true;}
    const sourceNote=String(hit.sourceNote||'').trim();
    if(sourceNote&&String(next.flightCheckSourceNote||'')!==sourceNote){next.flightCheckSourceNote=sourceNote;rowChanged=true;}
    if(rowChanged)changed++;
    return rowChanged?next:r;
  });
  return {rides:out,changed,verifiedRestored,manualRestored};
}
function flightCheckItems(source=rides){
  const map=new Map();
  for(const r of source){
    const flight=flightCacheNumber(r.flightNumber||r.arrivalFlight||r.departureFlight);
    if(!flight)continue;
    const rawDate=String(r.date||'').trim();
    const date=rawDate||berlinDate();
    const dateAssumed=!rawDate;
    const direction=flightDirectionForGemini(r);
    const airportIata=flightAirportForGemini(r);
    const flightTime=first(r.flightTime,r.flugzeit,r.flight_time);
    const locationFromPlan=first(r.locationFromPlan,r.flightLocation,r.flugort,r.ort);
    const key=[flight,date,airportIata,direction,flightTime].join('|');
    if(!map.has(key))map.set(key,{
      flightNumber:flight,
      date,
      dateAssumed,
      flightTime:flightTime||null,
      direction,
      airportIata:airportIata||null,
      locationFromPlan
    });
  }
  return [...map.values()];
}
function buildGeminiFlightPrompt(){
  const items=flightCheckItems();
  if(!items.length)throw new Error('Keine Flugnummern in der aktuellen Planliste gefunden.');
  return `ATMS PRO – FLIGHT-008 MULTI-AIRPORT strikte aktuelle Flugprüfung

Prüfe JEDE unten aufgeführte Flugnummer für den angegebenen Flugtag anhand aktueller, DATUMSSPEZIFISCHER Webdaten. Prüfe jeden Eintrag bei diesem Auftrag neu. Eine Flugnummer darf niemals allein aufgrund einer bekannten, früheren oder typischen Route einem Ort zugeordnet werden.

VERBINDLICHE VERIFIKATIONSREGELN:
1. airportIata ist der für DIESE Fahrt relevante Flughafen. Verwende exakt diesen Flughafen und ersetze ihn nicht durch DUS oder einen anderen Airport.
2. direction=arrival: Gesucht ist der HERKUNFTSORT des konkreten Fluges NACH airportIata.
3. direction=departure: Gesucht ist der ZIELORT des konkreten Fluges AB airportIata.
4. Verwende date EXAKT. Verifiziere ausdrücklich, dass die Flugnummer an diesem Datum mit airportIata als passendem Start- oder Zielairport existiert.
5. Wenn airportIata fehlt/null oder direction=unknown ist: status="needs_manual_check". Nicht raten.
6. Allgemeine Flugpläne, typische Routen, historische Routenzuordnungen oder gespeicherte Flugnummer→Ort-Zuordnungen reichen NICHT.
7. status="verified" UND confidence="high" sind NUR erlaubt, wenn mindestens ZWEI voneinander unabhängige, datumsspezifische Quellen dieselbe konkrete Route bestätigen.
8. Mindestens eine der zwei Quellen soll nach Möglichkeit die offizielle Quelle des betroffenen Flughafens oder der Airline sein. Die zweite Quelle soll unabhängig davon sein.
9. Wenn nur EINE geeignete Quelle gefunden wird: status="needs_manual_check" und confidence="medium" oder "low". NIEMALS verified/high.
10. Wenn keine geeignete datumsspezifische Quelle gefunden wird, Quellen widersprechen oder die konkrete Verbindung über airportIata nicht sicher bestätigt werden kann: status="needs_manual_check". NICHT raten.
11. flightTime ist ein zusätzliches Unterscheidungsmerkmal. Wenn mehrere passende Flüge existieren und die Zuordnung ohne flightTime nicht eindeutig ist: status="needs_manual_check".
12. locationFromPlan ist ausschließlich ein Vergleichswert und KEINE Quelle. Prüfe auch vorhandene Planorte vollständig neu.
13. Weicht ein sicher verifiziertes Ergebnis von locationFromPlan ab, setze conflict=true.
14. Erfinde keine Orte, IATA-Codes, Quellen, URLs oder Prüfzeiten.
15. sources MUSS ein JSON-Array sein. Jede Quelle muss mindestens "name" und "url" enthalten. Nur tatsächlich für diesen Flug, dieses Datum und airportIata verwendete Quellen eintragen.
16. Bei verified/high müssen mindestens zwei unterschiedliche sources-Einträge vorhanden sein.
17. sourceNote soll die Prüfung kurz zusammenfassen, darf aber sources nicht ersetzen.
18. checkedAt muss der tatsächliche Zeitpunkt dieser Webprüfung in ISO-8601-UTC sein. ATMS speichert zusätzlich selbst seinen Übernahmezeitpunkt.
19. Verwende EXAKT die unten definierten Feldnamen.
20. Antworte ausschließlich mit EINEM gültigen JSON-Objekt gemäß dem Schema. Kein Markdown, keine Erklärung vor oder nach dem JSON.

VERBINDLICHES JSON-SCHEMA:
{
  "checkedAt": "ISO-8601",
  "flights": [
    {
      "flightNumber": "EW0000",
      "date": "YYYY-MM-DD",
      "dateAssumed": false,
      "flightTime": null,
      "direction": "arrival|departure|unknown",
      "airportIata": "DUS|CGN|anderer IATA-Code|null",
      "originCity": "",
      "originIata": "",
      "destinationCity": "",
      "destinationIata": "",
      "relevantLocation": "",
      "status": "verified|needs_manual_check",
      "confidence": "high|medium|low",
      "conflict": false,
      "sources": [
        {
          "name": "Quelle 1",
          "url": "https://..."
        },
        {
          "name": "Quelle 2",
          "url": "https://..."
        }
      ],
      "sourceNote": ""
    }
  ]
}

WICHTIG:
- airportIata aus dem Prüfeintrag unverändert zurückgeben.
- Bei status="verified" + confidence="high": sources.length MUSS mindestens 2 sein.
- Bei weniger als 2 unabhängigen Quellen: status="needs_manual_check".
- Gib alle Prüfeinträge in derselben Reihenfolge zurück.

Zu prüfen:
${JSON.stringify(items,null,2)}`;
}
async function copyGeminiFlightPrompt(){
  try{
    const text=buildGeminiFlightPrompt();
    await navigator.clipboard.writeText(text);
    showToast('Gemini-Flugprüfung kopiert','ok');
    const status=$('geminiFlightStatus');if(status)status.textContent=`${flightCheckItems().length} Flugprüfung(en) kopiert. Jetzt in Gemini einfügen.`;
  }catch(e){
    const text=(()=>{try{return buildGeminiFlightPrompt()}catch{return''}})();
    const box=$('geminiFlightPromptFallback');if(box){box.value=text;box.classList.remove('hidden');box.select();}
    showToast('Prompt anzeigen und manuell kopieren','warn');
  }
}
/* CORE-005Y – Android JSON Input Guard */
function inspectAtmsJsonInput(text){
  const raw=clean(String(text||'')).trim();
  if(!raw)return{state:'empty',text:''};
  if(!raw.startsWith('{'))return{state:'invalid',text:raw,reason:'JSON muss mit { beginnen.'};

  const stack=[];
  let inString=false,escaped=false;

  for(let i=0;i<raw.length;i++){
    const ch=raw[i];

    if(inString){
      if(escaped){escaped=false;continue}
      if(ch==='\\'){escaped=true;continue}
      if(ch==='"'){inString=false}
      continue;
    }

    if(ch==='"'){inString=true;continue}
    if(ch==='{'||ch==='['){stack.push(ch);continue}
    if(ch==='}'||ch===']'){
      const expected=ch==='}'?'{':'[';
      const opened=stack.pop();
      if(opened!==expected)return{state:'invalid',text:raw,reason:'JSON-Klammern passen nicht zusammen.'};
    }
  }

  if(inString||escaped||stack.length||!raw.endsWith('}')){
    return{state:'incomplete',text:raw,reason:'JSON endet unvollständig.'};
  }

  try{
    JSON.parse(raw);
    return{state:'complete',text:raw};
  }catch(e){
    const message=String(e?.message||e);
    if(/unexpected end|unterminated string|end of json|unterminated/i.test(message)){
      return{state:'incomplete',text:raw,reason:message};
    }
    return{state:'invalid',text:raw,reason:message};
  }
}
function parseAtmsJsonObject(text,label){
  const result=inspectAtmsJsonInput(text);
  if(result.state==='empty')throw new Error(`${label}: Kein JSON eingefügt.`);
  if(result.state==='incomplete')throw new Error(`${label}: JSON ist unvollständig oder beim Kopieren abgeschnitten. Bitte vollständig neu kopieren.`);
  if(result.state==='invalid')throw new Error(`${label}: JSON ist ungültig${result.reason?` (${result.reason})`:''}.`);
  return JSON.parse(result.text);
}
function installJsonInputGuard(inputId,statusId,label){
  const input=$(inputId),status=$(statusId);
  if(!input||!status||input.dataset.atmsJsonGuard==='1')return;
  input.dataset.atmsJsonGuard='1';
  input.addEventListener('input',()=>{
    const result=inspectAtmsJsonInput(input.value);
    if(result.state==='empty'){
      status.textContent=`Noch kein ${label} eingefügt.`;
      return;
    }
    if(result.state==='incomplete'){
      status.textContent=`⚠ ${label} unvollständig/abgeschnitten – bitte vollständig neu kopieren.`;
      return;
    }
    if(result.state==='invalid'){
      status.textContent=`⚠ ${label} syntaktisch ungültig – bitte JSON prüfen.`;
      return;
    }
    status.textContent=`✓ ${label} vollständig erkannt. Bereit zur Übernahme.`;
  });
}

function parseGeminiFlightResult(text){
  const obj=parseAtmsJsonObject(text,'Gemini-JSON');
  if(!obj || Array.isArray(obj) || typeof obj!=='object'){
    throw new Error('FLIGHT-007 erwartet ein JSON-Objekt mit dem Feld "flights".');
  }
  if(!Array.isArray(obj.flights) || !obj.flights.length){
    throw new Error('FLIGHT-007: Feld "flights" fehlt oder enthält keine Flüge.');
  }

  const requiredFields=[
    'flightNumber','date','dateAssumed','flightTime','direction','airportIata',
    'originCity','originIata','destinationCity','destinationIata',
    'relevantLocation','status','confidence','conflict','sources','sourceNote'
  ];

  return obj.flights.map((x,index)=>{
    if(!x || typeof x!=='object' || Array.isArray(x)){
      throw new Error(`FLIGHT-007: Flug ${index+1} ist kein gültiges Objekt.`);
    }

    const missing=requiredFields.filter(key=>!(key in x));
    if(missing.length){
      throw new Error(`FLIGHT-007: Flug ${index+1} verwendet nicht das verbindliche Schema. Fehlend: ${missing.join(', ')}.`);
    }

    if(!Array.isArray(x.sources)){
      throw new Error(`FLIGHT-007: sources bei Flug ${index+1} muss ein Array sein.`);
    }

    const flightNumber=String(x.flightNumber||'').trim().toUpperCase();
    if(!flightNumber){
      throw new Error(`FLIGHT-007: flightNumber bei Flug ${index+1} fehlt.`);
    }

    const direction=String(x.direction||'unknown').trim().toLowerCase();
    const airportIata=String(x.airportIata||'').trim().toUpperCase();
    if(airportIata&&!/^[A-Z]{3}$/.test(airportIata)){
      throw new Error(`FLIGHT-008: airportIata bei Flug ${index+1} ist ungültig.`);
    }
    const location=String(x.relevantLocation||'').trim();
    const iata=String(
      x.iata ||
      (direction==='arrival'?x.originIata:'') ||
      (direction==='departure'?x.destinationIata:'') ||
      ''
    ).trim().toUpperCase();

    const status=String(x.status||'').trim().toLowerCase();
    const confidence=String(x.confidence||'').trim().toLowerCase();

    const normalizedSources=x.sources.map(source=>{
      if(typeof source==='string'){
        return {name:source.trim(),url:source.trim()};
      }
      return {
        name:String(source?.name||'').trim(),
        url:String(source?.url||'').trim()
      };
    }).filter(source=>source.name && source.url);

    const uniqueSourceKeys=new Set(
      normalizedSources.map(source=>String(source.url||source.name).trim().toLowerCase())
    );
    const sourceCount=uniqueSourceKeys.size;

    const claimedVerified=status==='verified' && confidence==='high' && Boolean(location);
    const verified=claimedVerified && sourceCount>=2;

    return {
      flightNumber,
      date:String(x.date||'').trim(),
      dateAssumed:Boolean(x.dateAssumed),
      flightTime:String(x.flightTime||'').trim(),
      direction,
      airportIata,
      flightLocation:location,
      iata,
      confidence:verified?'verified':'uncertain',
      status:verified?'verified':'needs_manual_check',
      conflict:Boolean(x.conflict),
      sources:normalizedSources,
      sourceCount,
      sourceNote:String(x.sourceNote||'').trim(),
      geminiReportedCheckedAt:String(obj.checkedAt||''),
      verificationDowngraded:Boolean(claimedVerified && sourceCount<2)
    };
  }).filter(x=>x.flightNumber);
}
function applyGeminiFlightResult(){
  try{
    capturePersistenceSafety('before-gemini-flight-apply');
    const box=$('geminiFlightResult');
    const checked=parseGeminiFlightResult(box?.value||'');
    // ATMS setzt den tatsächlichen lokalen Übernahme-/Prüfzeitpunkt selbst.
    // Ein von Gemini gelieferter checkedAt-Wert wird nicht als verlässlicher Zeitstempel gespeichert.
    const atmsCheckedAt=new Date().toISOString();
    let updated=0,uncertain=0,downgraded=0;
    const cacheEntries=[];
    rides=rides.map(r=>{
      if(!r.flightNumber)return r;
      const flight=flightCacheNumber(r.flightNumber);
      const date=String(r.date||'').trim();
      const direction=flightDirectionForGemini(r);
      const airportIata=flightAirportForGemini(r);
      const flightTime=String(r.flightTime||'').trim();

      // FLIGHT-007 + DAY-002:
      // Bei gemischten Plantagen niemals nur anhand der Flugnummer zurückfallen.
      // Datum und Richtung müssen zum konkreten Ride passen.
      const candidates=checked.filter(x=>{
        if(flightCacheNumber(x.flightNumber)!==flight)return false;

        const checkedDate=String(x.date||'').trim();
        if(date){
          if(!checkedDate || checkedDate!==date)return false;
        }else if(checkedDate){
          return false;
        }

        const checkedDirection=String(x.direction||'unknown').trim().toLowerCase();
        if(direction!=='unknown'){
          if(checkedDirection==='unknown' || checkedDirection!==direction)return false;
        }else if(checkedDirection!=='unknown'){
          return false;
        }

        const checkedAirportIata=String(x.airportIata||'').trim().toUpperCase();
        if(airportIata){
          if(!checkedAirportIata || checkedAirportIata!==airportIata)return false;
        }else if(checkedAirportIata){
          return false;
        }

        return true;
      });

      let hit=null;

      // Wenn ATMS eine Flugzeit kennt, muss sie bei mehreren Treffern exakt passen.
      if(flightTime){
        const exactTime=candidates.filter(x=>String(x.flightTime||'').trim()===flightTime);
        if(exactTime.length===1)hit=exactTime[0];
        else if(exactTime.length>1)hit=null;
        else if(candidates.length===1 && !String(candidates[0].flightTime||'').trim())hit=candidates[0];
      }else{
        // Ohne Flugzeit nur übernehmen, wenn Flugnummer+Datum+Richtung genau EINEN Treffer liefern.
        if(candidates.length===1)hit=candidates[0];
      }

      // Keine unsichere Ersatzsuche über andere Daten/Plantagen.
      if(!hit)return r;

      const verified=hit.confidence==='verified'&&hit.flightLocation&&hit.flightLocation!=='Flugort prüfen';
      const checkedAt=atmsCheckedAt;
      updated++;if(!verified)uncertain++;if(hit.verificationDowngraded)downgraded++;

      cacheEntries.push({
        rideId:String(r.id||''),
        fingerprint:flightRideFingerprint(r),
        flightNumber:flight,
        direction,
        airportIata:airportIata||String(hit.airportIata||'').trim().toUpperCase(),
        date:date||String(hit.date||'').trim(),
        flightTime:flightTime||String(hit.flightTime||'').trim(),
        flightLocation:verified?hit.flightLocation:'',
        iata:verified?hit.iata:'',
        verified:Boolean(verified),
        conflict:Boolean(hit.conflict),
        sourceNote:String(hit.sourceNote||'').trim(),
        sourceCount:Number(hit.sourceCount||0)||0,
        checkedAt,
        sourceFile:String(r.sourceFile||''),
        sourceRow:Number(r.sourceRow||0)||0
      });

      if(verified){
        upsertRideOverride(r.id,{
          flightVerified:true,
          flightLocation:hit.flightLocation,
          iata:hit.iata||'',
          flightNeedsManualCheck:false,
          flightCheckedAt:checkedAt
        });
      }

      return {
        ...r,
        date:date || String(hit.date||'').trim(),
        // FLIGHT-007B: Ein unsicheres Ergebnis darf vorhandene Daten niemals verschlechtern.
        // Bestehenden Plan-/Prüfort und IATA bei needs_manual_check unverändert behalten.
        flightLocation:verified?hit.flightLocation:r.flightLocation,
        iata:verified?hit.iata:(r.iata||''),
        flightCheckConfidence:verified?'verified':'uncertain',
        flightNeedsManualCheck:!verified,
        flightCheckSourceNote:String(hit.sourceNote||'').trim(),
        flightCheckedAt:checkedAt
      };
    });
    upsertFlightCache(cacheEntries);
    save();
    capturePersistenceSafety('after-gemini-flight-apply');
    syncPersistenceDurableShadow('after-gemini-flight-apply');
    try{window.dispatchEvent(new CustomEvent('atms:gemini-flight-result',{detail:{checked}}));}catch(_){}
    if(box)box.value='';
    const status=$('geminiFlightStatus');if(status)status.textContent=`${updated} Fahrt(en) geprüft${uncertain?` · ${uncertain} unsicher → vorhandener Flugort bleibt · manuell prüfen`:''}${downgraded?` · ${downgraded} wegen <2 Quellen heruntergestuft`:''}.`;
    showToast(`${updated} Flugdaten übernommen`,'ok');
    render();
  }catch(e){const status=$('geminiFlightStatus');if(status)status.textContent='Fehler: '+e.message;showToast('Gemini-Ergebnis ungültig','warn');}
}
// CORE-005Q2 – Import/Gemini auf Smartphones immer einspaltig und vollständig erreichbar.
function ensureMobileImportLayoutFix(){
  const load=$('loadBtn'),view=$('importView');
  const host=load?.parentElement||view;
  if(!host)return;
  host.classList.add('atms-import-mobile-stack');
  if($('atmsMobileImportLayoutFix'))return;
  const style=document.createElement('style');
  style.id='atmsMobileImportLayoutFix';
  style.textContent=`
    @media (max-width: 900px){
      .atms-import-mobile-stack{
        grid-template-columns:minmax(0,1fr)!important;
        grid-auto-columns:minmax(0,1fr)!important;
        width:100%!important;
        max-width:100%!important;
        min-width:0!important;
      }
      .atms-import-mobile-stack > *{
        max-width:100%!important;
        min-width:0!important;
        box-sizing:border-box!important;
      }
      .atms-import-mobile-stack > #loadBtn,
      .atms-import-mobile-stack > #geminiFlightPanel,
      .atms-import-mobile-stack > #liveFlightPanel,
      .atms-import-mobile-stack > #atmsPersistenceSafetyPanel{
        grid-column:1 / -1!important;
        width:100%!important;
        max-width:100%!important;
        min-width:0!important;
        box-sizing:border-box!important;
      }
      #geminiFlightPanel textarea,
      #liveFlightPanel textarea,
      #geminiFlightPanel input,
      #liveFlightPanel input,
      #geminiFlightPanel button,
      #liveFlightPanel button,
      #atmsPersistenceSafetyPanel button,
      #atmsPersistenceSafetyPanel pre{
        max-width:100%!important;
        box-sizing:border-box!important;
      }
    }
  `;
  document.head.appendChild(style);
}
function ensureGeminiFlightPanel(){
  ensureMobileImportLayoutFix();
  if($('geminiFlightPanel'))return;
  const load=$('loadBtn'),view=$('importView');if(!load||!view)return;
  const panel=document.createElement('section');panel.id='geminiFlightPanel';panel.style.cssText='margin:16px 0;padding:14px;border:1px solid rgba(255,255,255,.16);border-radius:14px;background:rgba(255,255,255,.04)';
  panel.innerHTML=`<div style="font-weight:800;margin-bottom:6px">🤖 Gemini-Flugprüfung</div><div style="font-size:13px;opacity:.8;margin-bottom:10px">Prüft Flugnummer + Datum neu. Keine feste Flugnummer→Ort-Zuordnung.</div><button type="button" id="copyGeminiFlightBtn" style="width:100%;padding:12px;border-radius:10px;font-weight:800">🤖 Gemini-Prüfauftrag kopieren</button><textarea id="geminiFlightPromptFallback" class="hidden" style="width:100%;min-height:120px;margin-top:10px" readonly></textarea><textarea id="geminiFlightResult" placeholder="Gemini-JSON hier einfügen" style="width:100%;min-height:120px;margin-top:10px"></textarea><button type="button" id="applyGeminiFlightBtn" style="width:100%;padding:12px;border-radius:10px;font-weight:800;margin-top:8px">✓ Geprüfte Flugorte übernehmen</button><div id="geminiFlightStatus" style="font-size:12px;opacity:.8;margin-top:8px">Noch keine Flugprüfung durchgeführt.</div>`;
  load.parentElement?.insertBefore(panel,load.nextSibling);
  $('copyGeminiFlightBtn')?.addEventListener('click',copyGeminiFlightPrompt);
  $('applyGeminiFlightBtn')?.addEventListener('click',applyGeminiFlightResult);
  installJsonInputGuard('geminiFlightResult','geminiFlightStatus','Gemini-JSON');
}


// CORE-005N – Live-Flugdaten werden getrennt von PLAN/DISPO gespeichert.
function liveFlightCheckItems(source=rides){
  const map=new Map();
  for(const r of (Array.isArray(source)?source:[])){
    const flight=flightCacheNumber(r.flightNumber||r.arrivalFlight||r.departureFlight);
    if(!flight)continue;
    const date=String(r.date||'').trim()||berlinDate();
    const direction=flightDirectionForGemini(r);
    const airportIata=flightAirportForGemini(r);
    const key=[flight,date,airportIata,direction].join('|');
    if(!map.has(key))map.set(key,{flightNumber:flight,date,direction,airportIata:airportIata||null,flightLocation:String(r.flightLocation||'').trim()||null,planPickupTime:planTimeOf(r)||null});
  }
  return [...map.values()];
}
function buildLiveFlightPrompt(){
  const items=liveFlightCheckItems();
  if(!items.length)throw new Error('Keine Flüge in den aktuell gespeicherten Fahrten gefunden.');
  return `ATMS PRO – LIVE-FLIGHT-002 MULTI-AIRPORT strikte aktuelle Live-Flugprüfung

Prüfe JEDE unten aufgeführte Flugnummer für den angegebenen Tag anhand AKTUELLER öffentlicher Webdaten. Keine historischen/typischen Routen als Live-Status verwenden.

VERBINDLICHE REGELN:
1. airportIata ist der für die konkrete Fahrt relevante Flughafen. Verwende exakt diesen Airport.
2. direction=departure: airportIata ist der Abflugairport. Relevant sind aktueller Status und die aktuelle Abflugzeit an airportIata.
3. direction=arrival: airportIata ist der Zielairport. Relevant sind aktueller Status und die aktuelle Ankunftszeit an airportIata.
4. date exakt verwenden. Keine Daten eines anderen Tages oder eines anderen Airports übernehmen.
5. confirmed=true nur mit mindestens ZWEI voneinander unabhängigen, aktuellen/datumsspezifischen Quellen. Mindestens eine Quelle nach Möglichkeit der betroffene Airport, die Airline oder ein etablierter Live-Tracker.
6. Wenn airportIata fehlt/null oder direction=unknown ist: confirmed=false, status=unknown. Nicht raten.
7. Wenn der Flug noch nicht gestartet ist und keine belastbare Schätzung existiert, Status scheduled/on_time ist erlaubt, aber Zeiten nur aus tatsächlich angezeigten aktuellen Daten übernehmen.
8. Bei Widerspruch, unklarer Zuordnung oder weniger als 2 geeigneten Quellen: confirmed=false, status=unknown. Nicht raten.
9. airportScheduledTime, airportEstimatedTime und airportActualTime immer als lokale Zeit des betroffenen Airports HH:MM zurückgeben oder null. Der globale ATMS-Abholpuffer wird erst lokal in der App addiert und darf nicht in diese Zeiten eingerechnet werden.
10. delayMinutes ist die aktuelle Abweichung am Ereignis des betroffenen Airports in ganzen Minuten; wenn nicht belastbar bestimmbar, null.
11. sources enthält nur tatsächlich verwendete Quellen mit name und url. Keine URLs erfinden.
12. checkedAt ist der tatsächliche Web-Prüfzeitpunkt in ISO-8601.
13. airportIata aus dem Prüfeintrag unverändert zurückgeben.
14. Antworte ausschließlich mit EINEM gültigen JSON-Objekt. Kein Markdown.

JSON-SCHEMA:
{
  "checkedAt":"ISO-8601",
  "flights":[{
    "flightNumber":"EW0000",
    "date":"YYYY-MM-DD",
    "direction":"arrival|departure|unknown",
    "airportIata":"DUS|CGN|anderer IATA-Code|null",
    "status":"scheduled|on_time|delayed|landed|cancelled|unknown",
    "airportScheduledTime":"HH:MM|null",
    "airportEstimatedTime":"HH:MM|null",
    "airportActualTime":"HH:MM|null",
    "delayMinutes":null,
    "confirmed":false,
    "sources":[{"name":"","url":""}],
    "sourceNote":""
  }]
}

Zu prüfen:
${JSON.stringify(items,null,2)}`;
}
async function copyLiveFlightPrompt(){
  try{
    const text=buildLiveFlightPrompt();
    await navigator.clipboard.writeText(text);
    const status=$('liveFlightImportStatus');if(status)status.textContent=`${liveFlightCheckItems().length} Live-Flugprüfung(en) kopiert. Ergebnis danach unten einfügen.`;
    showToast('Live-Flugprüfauftrag kopiert','ok');
  }catch(e){
    const text=(()=>{try{return buildLiveFlightPrompt()}catch{return''}})();
    const box=$('liveFlightPromptFallback');if(box){box.value=text;box.classList.remove('hidden');box.select();}
    const status=$('liveFlightImportStatus');if(status)status.textContent='Prompt anzeigen und manuell kopieren.';
    showToast('Live-Prüfauftrag anzeigen','warn');
  }
}
function strictClockOrNull(value){
  if(value===null||value===undefined||value==='')return null;
  const v=String(value).trim();
  return /^([01]?\d|2[0-3]):[0-5]\d$/.test(v)?v:null;
}
function minuteDeltaClock(from,to){
  const a=strictClockOrNull(from),b=strictClockOrNull(to);if(!a||!b)return null;
  const [ah,am]=a.split(':').map(Number),[bh,bm]=b.split(':').map(Number);
  let d=bh*60+bm-(ah*60+am);if(d<-720)d+=1440;if(d>720)d-=1440;return d;
}
function parseLiveFlightResult(text){
  const obj=parseAtmsJsonObject(text,'Live-Flug-JSON');
  if(!obj||Array.isArray(obj)||typeof obj!=='object'||!Array.isArray(obj.flights)||!obj.flights.length)throw new Error('LIVE-FLIGHT-001 erwartet ein JSON-Objekt mit dem Feld "flights".');
  return obj.flights.map((x,index)=>{
    if(!x||typeof x!=='object'||Array.isArray(x))throw new Error(`Live-Flug ${index+1} ist ungültig.`);
    const flightNumber=flightCacheNumber(x.flightNumber);if(!flightNumber)throw new Error(`flightNumber bei Live-Flug ${index+1} fehlt.`);
    const date=String(x.date||'').trim();
    const direction=String(x.direction||'unknown').trim().toLowerCase();
    const airportIata=String(x.airportIata||'').trim().toUpperCase();
    if(airportIata&&!/^[A-Z]{3}$/.test(airportIata))throw new Error(`airportIata bei Live-Flug ${index+1} ist ungültig.`);
    const allowedStatus=new Set(['scheduled','on_time','delayed','landed','cancelled','unknown']);
    const status=allowedStatus.has(String(x.status||'unknown').trim().toLowerCase())?String(x.status||'unknown').trim().toLowerCase():'unknown';
    const sources=Array.isArray(x.sources)?x.sources.map(src=>({name:String(src?.name||'').trim(),url:String(src?.url||'').trim()})).filter(src=>src.name&&src.url):[];
    const uniqueSources=new Set(sources.map(src=>src.url.toLowerCase())).size;
    const confirmed=Boolean(x.confirmed)&&uniqueSources>=2&&status!=='unknown';
    const scheduled=strictClockOrNull(x.airportScheduledTime??x.dusScheduledTime);
    const estimated=strictClockOrNull(x.airportEstimatedTime??x.dusEstimatedTime);
    const actual=strictClockOrNull(x.airportActualTime??x.dusActualTime);
    let delay=x.delayMinutes===null||x.delayMinutes===undefined||x.delayMinutes===''?null:Number(x.delayMinutes);
    if(!Number.isFinite(delay))delay=null;
    if(delay===null){const current=actual||estimated;if(scheduled&&current)delay=minuteDeltaClock(scheduled,current);}
    return {flightNumber,date,direction,airportIata,status,airportScheduledTime:scheduled,airportEstimatedTime:estimated,airportActualTime:actual,delayMinutes:delay,confirmed,sources,sourceNote:String(x.sourceNote||'').trim(),reportedCheckedAt:String(obj.checkedAt||'').trim()};
  });
}
function livePickupFromCheck(ride,hit){
  if(!ride||!hit||!hit.confirmed)return'';
  if(hit.status==='cancelled')return'';
  if(hit.direction==='arrival'){
    const arrival=hit.airportActualTime||hit.airportEstimatedTime;
    return arrival?clockPlusMinutes(arrival,arrivalBufferMinutesForRide(ride)):'';
  }
  if(hit.direction==='departure'){
    const plan=planTimeOf(ride);if(!plan)return'';
    const delay=Number(hit.delayMinutes);
    if(Number.isFinite(delay))return clockPlusMinutes(plan,delay);
    return hit.status==='on_time'||hit.status==='scheduled'?plan:'';
  }
  return'';
}
function applyLiveFlightResult(){
  try{
    const box=$('liveFlightResult');
    const checked=parseLiveFlightResult(box?.value||'');
    const checkedAt=new Date().toISOString();
    let updated=0,uncertain=0;
    rides=rides.map(r=>{
      const flight=flightCacheNumber(r.flightNumber);if(!flight)return r;
      const date=String(r.date||'').trim();
      const direction=flightDirectionForGemini(r);
      const airportIata=flightAirportForGemini(r);
      const candidates=checked.filter(x=>flightCacheNumber(x.flightNumber)===flight&&(!date||x.date===date)&&x.direction===direction&&String(x.airportIata||'').trim().toUpperCase()===String(airportIata||'').trim().toUpperCase());
      if(candidates.length!==1)return r;
      const hit=candidates[0];
      if(!hit.confirmed){uncertain++;return r;}
      const nextLive=livePickupFromCheck(r,hit);
      const rawStatus=hit.status==='landed'?'landed':hit.status==='delayed'?'delayed':hit.status==='cancelled'?'cancelled':(hit.status==='on_time'||hit.status==='scheduled')?'on-time':'unknown';
      updated++;
      return norm({...r,
        liveTime:nextLive||r.liveTime||'',
        live_time:nextLive||r.live_time||'',
        flightStatus:rawStatus,
        delayMinutes:Number.isFinite(Number(hit.delayMinutes))?Number(hit.delayMinutes):0,
        landed:hit.status==='landed',
        liveFlightStatus:hit.status,
        liveFlightAirportIata:airportIata||'',
        liveFlightScheduledTime:hit.airportScheduledTime||'',
        liveFlightEstimatedTime:hit.airportEstimatedTime||'',
        liveFlightActualTime:hit.airportActualTime||'',
        liveCheckedAt:checkedAt,
        liveSourceNote:hit.sourceNote,
        liveSources:hit.sources
      },0);
    });
    save();render();
    if(box)box.value='';
    const status=$('liveFlightImportStatus');if(status)status.textContent=`${updated} Fahrt(en) mit bestätigten Live-Flugdaten aktualisiert${uncertain?` · ${uncertain} unsicher nicht verändert`:''}.`;
    showToast(`${updated} Live-Flugdaten übernommen`,'ok');
  }catch(e){const status=$('liveFlightImportStatus');if(status)status.textContent='Fehler: '+e.message;showToast('Live-Flugergebnis ungültig','warn');}
}
function renderArrivalBufferSetting(){
  const input=$('liveArrivalBuffer');if(input&&document.activeElement!==input)input.value=String(globalArrivalBufferMinutes());
  const note=$('liveArrivalBufferNote');if(note)note.textContent=`Gilt global für alle Ankunftsflüge: bestätigte Landungszeit + ${globalArrivalBufferMinutes()} Min. = LIVE-Abholzeit.`;
}
function saveArrivalBufferSetting(){
  const input=$('liveArrivalBuffer');const raw=Number(input?.value);
  if(!Number.isFinite(raw)||raw<0||raw>120){showToast('Puffer bitte zwischen 0 und 120 Minuten eingeben','warn');return}
  const buffer=Math.round(raw),s=getLiveSettings();s.arrivalPickupBufferMinutes=buffer;saveLiveSettings(s);
  let recalculated=0;
  rides=rides.map(r=>{
    if(flightDirectionForGemini(r)!=='arrival'||String(r.liveFlightStatus||'').toLowerCase()==='cancelled')return r;
    const arrival=first(r.liveFlightActualTime,r.liveFlightEstimatedTime,actualLandingTimeOf(r));
    if(!arrival)return r;
    const live=clockPlusMinutes(arrival,buffer);if(!live)return r;
    recalculated++;
    return norm({...r,liveTime:live,live_time:live},0);
  });
  if(recalculated){save();render();}
  renderArrivalBufferSetting();
  const status=$('liveArrivalBufferNote');if(status)status.textContent=`Gilt global für alle Ankunftsflüge: bestätigte Landungszeit + ${buffer} Min. = LIVE-Abholzeit.${recalculated?` ${recalculated} vorhandene LIVE-Fahrt(en) neu berechnet.`:''}`;
  showToast(`Arrival-Puffer: ${buffer} Min. gespeichert`,'ok');
}
function applyManualArrivalLanding(){
  try{
    const flight=flightCacheNumber($('manualArrivalFlight')?.value||'');
    const actual=strictClockOrNull($('manualArrivalTime')?.value||'');
    if(!flight)throw new Error('Bitte eine Flugnummer eingeben.');
    if(!actual)throw new Error('Bitte die bestätigte Landungszeit als HH:MM eingeben.');
    const matching=rides.filter(r=>flightCacheNumber(r.flightNumber)===flight&&flightDirectionForGemini(r)==='arrival');
    if(!matching.length)throw new Error(`${flight} wurde in den gespeicherten Ankunftsfahrten nicht gefunden.`);
    const dates=[...new Set(matching.map(r=>String(r.date||'').trim()).filter(Boolean))];
    if(dates.length>1)throw new Error(`${flight} kommt an mehreren Plantagen vor. Bitte zuerst nur den aktuellen Plantag laden.`);
    const buffer=globalArrivalBufferMinutes();
    const live=clockPlusMinutes(actual,buffer);
    const checkedAt=new Date().toISOString();
    let updated=0;
    rides=rides.map(r=>{
      if(flightCacheNumber(r.flightNumber)!==flight||flightDirectionForGemini(r)!=='arrival')return r;
      updated++;
      return norm({...r,
        actualLandingTime:actual,
        liveTime:live,
        live_time:live,
        flightStatus:'landed',
        landed:true,
        liveFlightStatus:'landed',
        liveFlightActualTime:actual,
        liveCheckedAt:checkedAt,
        liveManualConfirmed:true,
        liveSourceNote:'Landungszeit manuell vom Disponenten bestätigt.',
        liveSources:[]
      },0);
    });
    save();render();
    const status=$('manualArrivalStatus');if(status)status.textContent=`${updated} Fahrt(en) aktualisiert · ${actual} + ${buffer} Min. = LIVE ${live}.`;
    showToast(`${flight}: LIVE ${live}`,'ok');
  }catch(e){const status=$('manualArrivalStatus');if(status)status.textContent='Fehler: '+e.message;showToast('Manuelle Landungszeit nicht übernommen','warn')}
}
function ensureLiveFlightPanel(){
  ensureMobileImportLayoutFix();
  if($('liveFlightPanel'))return;
  const view=$('importView');if(!view)return;
  const panel=document.createElement('section');panel.id='liveFlightPanel';panel.style.cssText='margin:16px 0;padding:14px;border:1px solid rgba(52,199,255,.32);border-radius:14px;background:rgba(10,80,110,.10)';
  panel.innerHTML=`<div style="font-weight:800;margin-bottom:6px">📡 Live-Flugdaten</div><div style="font-size:13px;opacity:.82;margin-bottom:10px">Aktuellen Status prüfen, ohne PLAN oder DISPO zu überschreiben. LIVE bleibt ein eigenes Zeitfeld.</div><div style="padding:10px;border:1px solid rgba(255,255,255,.14);border-radius:10px;margin-bottom:10px"><div style="font-weight:800;margin-bottom:6px">⏱ Standard-Abholpuffer nach Landung</div><div style="display:flex;gap:8px;align-items:center"><input id="liveArrivalBuffer" type="number" min="0" max="120" step="1" inputmode="numeric" style="width:90px;padding:10px;border-radius:9px"><span>Minuten</span><button type="button" id="saveLiveArrivalBufferBtn" style="margin-left:auto;padding:10px 12px;border-radius:9px;font-weight:800">Speichern</button></div><div id="liveArrivalBufferNote" style="font-size:12px;opacity:.8;margin-top:6px"></div></div><button type="button" id="copyLiveFlightBtn" style="width:100%;padding:12px;border-radius:10px;font-weight:800">📡 Live-Prüfauftrag kopieren</button><textarea id="liveFlightPromptFallback" class="hidden" style="width:100%;min-height:120px;margin-top:10px" readonly></textarea><textarea id="liveFlightResult" placeholder="Live-Flug-JSON hier einfügen" style="width:100%;min-height:120px;margin-top:10px"></textarea><button type="button" id="applyLiveFlightBtn" style="width:100%;padding:12px;border-radius:10px;font-weight:800;margin-top:8px">✓ Live-Flugdaten übernehmen</button><div id="liveFlightImportStatus" style="font-size:12px;opacity:.8;margin-top:8px">Noch keine Live-Flugprüfung durchgeführt.</div><div style="height:1px;background:rgba(255,255,255,.12);margin:14px 0"></div><div style="font-weight:800;margin-bottom:6px">✋ Manuell bestätigte Landung</div><div style="font-size:12px;opacity:.8;margin-bottom:8px">Für eine vom Disponenten z. B. in Flightradar24 eindeutig bestätigte Landungszeit. Nutzt den globalen Puffer oben.</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><input id="manualArrivalFlight" placeholder="Flugnr. z. B. EW9841" autocomplete="off" style="padding:10px;border-radius:9px;min-width:0"><input id="manualArrivalTime" type="time" step="60" style="padding:10px;border-radius:9px;min-width:0"></div><button type="button" id="applyManualArrivalBtn" style="width:100%;padding:12px;border-radius:10px;font-weight:800;margin-top:8px">✓ Bestätigte Landung übernehmen</button><div id="manualArrivalStatus" style="font-size:12px;opacity:.8;margin-top:8px">Noch keine manuelle Landungszeit übernommen.</div>`;
  const anchor=$('geminiFlightPanel');
  if(anchor)anchor.insertAdjacentElement('afterend',panel);else view.appendChild(panel);
  $('copyLiveFlightBtn')?.addEventListener('click',copyLiveFlightPrompt);
  $('applyLiveFlightBtn')?.addEventListener('click',applyLiveFlightResult);
  installJsonInputGuard('liveFlightResult','liveFlightImportStatus','Live-Flug-JSON');
  $('saveLiveArrivalBufferBtn')?.addEventListener('click',saveArrivalBufferSetting);
  $('applyManualArrivalBtn')?.addEventListener('click',applyManualArrivalLanding);
  renderArrivalBufferSetting();
}

/* CORE-006A – Planimport nur nach explizitem, echtem Nutzer-Klick */
let atmsPlanImportAuthorization={armed:false,source:'',at:0};

function armPlanImportAuthorization(source){
  atmsPlanImportAuthorization={
    armed:true,
    source:String(source||''),
    at:Date.now()
  };
  persistAudit('plan_import_authorized',{source:String(source||'')});
}
function consumePlanImportAuthorization(){
  const auth=atmsPlanImportAuthorization;
  atmsPlanImportAuthorization={armed:false,source:'',at:0};
  const age=Date.now()-Number(auth?.at||0);
  return {
    ok:Boolean(auth?.armed)&&age>=0&&age<=5000,
    source:String(auth?.source||''),
    ageMs:Number.isFinite(age)?age:null
  };
}
function installPlanImportTrustedClickGuard(){
  if(window.__atmsPlanImportTrustedClickGuard)return;
  document.addEventListener('click',event=>{
    const target=event.target instanceof Element?event.target:event.target?.parentElement;
    const button=target?.closest?.('#importPlanBtn,#loadBtn');
    if(!button)return;

    // Programmgesteuerte .click()-Aufrufe sind nicht vertrauenswürdig und dürfen
    // weder plan-import.js noch den Legacy-JSON-Import erreichen.
    if(event.isTrusted!==true){
      event.preventDefault();
      event.stopImmediatePropagation();
      persistAudit('plan_import_untrusted_click_blocked',{source:button.id||''});
      try{showToast('Automatischer Planimport aus Sicherheitsgründen blockiert','warn')}catch(_){}
      return;
    }
    armPlanImportAuthorization(button.id||'');
  },true);
  window.__atmsPlanImportTrustedClickGuard=true;
}
installPlanImportTrustedClickGuard();

function restoreCurrentRidesAfterBlockedImport(){
  try{
    safePersistentSetItem(KEY,JSON.stringify(Array.isArray(rides)?rides:[]),'blocked-plan-import-rides');
    safePersistentSetItem(DONE,JSON.stringify([...done]),'blocked-plan-import-done');
    capturePersistenceSafety('blocked-plan-import');
    syncPersistenceDurableShadow('blocked-plan-import');
  }catch(_){}
}
function readPreviousPlanImportSnapshot(){
  try{
    const raw=JSON.parse(localStorage.getItem('atms_import_previous_v1')||'null');
    if(!raw||!Array.isArray(raw.rides)||!raw.rides.length)return null;
    return raw;
  }catch(_){return null}
}
function restorePreviousPlanImport(){
  const previous=readPreviousPlanImportSnapshot();
  if(!previous){
    showToast('Kein vorheriger Planimport-Zustand gefunden','warn');
    return false;
  }
  const stamp=previous.savedAt?new Date(previous.savedAt).toLocaleString('de-DE'):'unbekannter Zeitpunkt';
  if(!confirm(`Letzten Zustand VOR dem Planimport wiederherstellen?

Gespeichert: ${stamp}
Fahrten: ${previous.rides.length}

Der aktuelle Zustand wird vorher zusätzlich lokal gesichert.`))return false;

  try{
    localStorage.setItem('atms_import_recovery_current_v1',JSON.stringify({
      savedAt:new Date().toISOString(),
      rides:Array.isArray(rides)?rides:[],
      done:[...done]
    }));
  }catch(_){}

  rides=previous.rides.map((r,i)=>norm(r,i));
  done=new Set([...done].filter(id=>rides.some(r=>String(r.id)===String(id))));
  save();
  capturePersistenceSafety('manual-restore-previous-plan-import');
  syncPersistenceDurableShadow('manual-restore-previous-plan-import');
  persistAudit('previous_plan_import_restored',{
    snapshotSavedAt:String(previous.savedAt||''),
    rides:rides.length
  });
  render();
  updateBackupUI();
  showToast(`${rides.length} Fahrten aus Zustand vor letztem Planimport wiederhergestellt`,'ok');
  return true;
}

function importChoice(newRides){
  if(!Array.isArray(newRides)||!newRides.length)throw Error('Keine Fahrten gefunden');
  if(!rides.length)return 'replace';
  const replace=confirm(`Neue Planliste mit ${newRides.length} Fahrten erkannt.

OK = aktuelle Fahrten ERSETZEN (empfohlen)
Abbrechen = weitere Auswahl`);
  if(replace)return 'replace';
  const merge=confirm(`Möchtest du die neue Planliste mit den vorhandenen ${rides.length} Fahrten ZUSAMMENFÜHREN?

OK = zusammenführen
Abbrechen = Import abbrechen`);
  return merge?'merge':'cancel';
}
function mergeImportedRides(current,incoming){
  const map=new Map();
  current.forEach(r=>map.set(String(r.id),r));
  incoming.forEach(r=>map.set(String(r.id),r));
  return [...map.values()];
}
function applyImportedRides(newRides){
  if(!Array.isArray(newRides)||!newRides.length) throw Error('Keine Fahrten gefunden');

  const importAuthorization=consumePlanImportAuthorization();
  if(!importAuthorization.ok){
    const stack=String(new Error('blocked-plan-import').stack||'').split('\n').slice(1,6).join(' | ');
    persistAudit('plan_import_blocked',{
      reason:'missing-trusted-user-click',
      incomingCount:newRides.length,
      source:importAuthorization.source,
      ageMs:importAuthorization.ageMs,
      stack
    });
    restoreCurrentRidesAfterBlockedImport();
    throw Error('Sicherheitsblock: Planimport wurde nicht durch „Geprüfte Fahrten übernehmen“ oder „JSON laden“ gestartet.');
  }
  persistAudit('plan_import_started',{
    source:importAuthorization.source,
    incomingCount:newRides.length
  });

  // CORE-005V: vor Import Snapshot; falls ein fremder Importpfad kritische atms_-Keys entfernt hat,
  // nur fehlende kritische Daten aus dem Snapshot zurückholen. Vorhandene Werte bleiben unberührt.
  restoreMissingCriticalPersistence('before-plan-import');
  syncPersistenceDurableShadow('before-plan-import');
  capturePersistenceSafety('before-plan-import');

  try{
    localStorage.setItem('atms_import_previous_v1',JSON.stringify({
      savedAt:new Date().toISOString(),
      rides
    }));
  }catch(_){}

  // CORE-005Q1: Ein Plan ohne eigenes Datum bekommt beim Import einmalig den
  // konkreten Plantag (Europe/Berlin). Dadurch kann der Flug-Cache sicher mit
  // Flugnummer + Plantag + Richtung + Flugzeit matchen, ohne morgen versehentlich
  // die heutige Pruefung auf einen neuen Plan anzuwenden. Ein im Plan vorhandenes
  // Datum bleibt unveraendert.
  const importedAt=new Date().toISOString();
  const assumedPlantDay=berlinDate();
  rides=newRides.map(r=>{
    const explicitDate=String(first(r?.date,r?.datum)||'').trim();
    if(explicitDate)return r;
    return {...r,date:assumedPlantDay,dateAssumed:true,planDateAssumed:true,planImportedAt:importedAt};
  });
  const corrected=applyRideOverrides(rides);
  rides=corrected.rides;
  // CORE-005Q: Flugpruefungen des EXAKT gleichen konkreten Fluges werden direkt
  // beim Neuimport wieder angewendet. Match: Flugnummer + Datum + Richtung + Flugzeit.
  // Andere Plantage oder nur aehnliche Flugnummern werden niemals uebernommen.
  const restored=applyFlightCacheToRides(rides);
  rides=restored.rides;
  done=new Set([...done].filter(id=>rides.some(r=>r.id===id)));
  save();
  capturePersistenceSafety('after-plan-import');
  syncPersistenceDurableShadow('after-plan-import');

  return {
    cancelled:false,
    mode:'replace',
    count:rides.length,
    restoredFlightChecks:restored.changed,
    restoredVerifiedFlights:restored.verifiedRestored,
    restoredManualChecks:restored.manualRestored
  };
}



/* DEV 14.5.2 – Live-Disposition Logik */
let liveExpanded=false,liveSuggested=null,liveEtaRunId=0,liveEtaResults=new Map();
function getLiveSettings(){try{return Object.assign({driverId:'',consentByDriver:{},warnThreshold:7,mode:'standard',lastGeo:null,mapboxToken:'',stopBufferMinutes:5,arrivalPickupBufferMinutes:15},JSON.parse(localStorage.getItem(LIVE_SETTINGS)||'{}'))}catch{return{driverId:'',consentByDriver:{},warnThreshold:7,mode:'standard',lastGeo:null,mapboxToken:'',stopBufferMinutes:5,arrivalPickupBufferMinutes:15}}}
function saveLiveSettings(s){localStorage.setItem(LIVE_SETTINGS,JSON.stringify(s))}
function renderNavigationSettings(){
  const s=getLiveSettings(),token=$('mapboxToken'),buffer=$('liveStopBuffer'),status=$('navigationStatus'),api=$('liveApiStatus');
  if(token&&document.activeElement!==token)token.value=s.mapboxToken||'';
  if(buffer&&document.activeElement!==buffer)buffer.value=Number(s.stopBufferMinutes||5);
  if(status)status.textContent=s.mapboxToken?'Mapbox-Token lokal gespeichert. Live-ETA kann getestet werden.':'Noch kein Mapbox-Token gespeichert.';
  if(api)api.textContent=s.mapboxToken?'Mapbox bereit':'Lokal / keine API';
}
function saveNavigationSettings(){
  const token=String($('mapboxToken')?.value||'').trim(),buffer=Math.max(0,Math.min(30,Number($('liveStopBuffer')?.value)||0));
  const s=getLiveSettings();s.mapboxToken=token;s.stopBufferMinutes=buffer;saveLiveSettings(s);renderNavigationSettings();showToast(token?'Navigationseinstellungen gespeichert':'Token entfernt','ok');
}
async function testNavigationApi(){
  const status=$('navigationStatus'),btn=$('testNavigationApiBtn');
  const token=String($('mapboxToken')?.value||getLiveSettings().mapboxToken||'').trim();
  if(!token){if(status)status.textContent='Bitte zuerst einen Mapbox-Token eintragen.';return}
  if(btn){btn.disabled=true;btn.textContent='API wird getestet …'}
  try{
    const p=await mapboxGeocode('DUS Airport',token,null);
    if(!p)throw new Error('DUS Airport konnte nicht gefunden werden.');
    if(status)status.textContent='✓ Mapbox-Verbindung funktioniert. DUS Airport wurde erkannt.';
    showToast('Mapbox-Verbindung funktioniert','ok');
  }catch(e){if(status)status.textContent='Mapbox-Test fehlgeschlagen: '+e.message;showToast('Mapbox-Test fehlgeschlagen','warn')}
  finally{if(btn){btn.disabled=false;btn.textContent='Verbindung testen'}}
}
function getDriverSession(){try{return Object.assign({active:false,driverId:'',driverName:'',startedAt:null,lastPositionAt:null},JSON.parse(localStorage.getItem(DRIVER_SESSION)||'{}'))}catch{return{active:false,driverId:'',driverName:'',startedAt:null,lastPositionAt:null}}}
function saveDriverSession(s){localStorage.setItem(DRIVER_SESSION,JSON.stringify(s))}
function stopLiveGeoWatch(){if(liveGeoWatchId!==null&&navigator.geolocation){navigator.geolocation.clearWatch(liveGeoWatchId);liveGeoWatchId=null}}
function updateSessionPosition(pos){const session=getDriverSession();if(!session.active)return;const settings=getLiveSettings();settings.lastGeo={driverId:session.driverId,driverName:session.driverName,lat:pos.coords.latitude,lng:pos.coords.longitude,accuracy:pos.coords.accuracy,time:new Date().toISOString()};saveLiveSettings(settings);session.lastPositionAt=settings.lastGeo.time;saveDriverSession(session);renderDriverSessionCard();}
function startLiveGeoWatch(){stopLiveGeoWatch();const session=getDriverSession(),settings=getLiveSettings();if(!session.active||!navigator.geolocation||!settings.consentByDriver?.[session.driverId])return;liveGeoWatchId=navigator.geolocation.watchPosition(updateSessionPosition,err=>{addLiveEvent(`GPS-Aktualisierung für ${session.driverName} nicht möglich: ${err.message||'unbekannter Fehler'}.`,'warn');renderDriverSessionCard()}, {enableHighAccuracy:true,maximumAge:15000,timeout:20000})}
function renderDriverSessionCard(){const box=$('liveSessionDriver');if(!box)return;const session=getDriverSession(),settings=getLiveSettings(),drivers=liveDriverList();const selected=drivers.find(x=>x.id===settings.driverId);if(session.active){box.innerHTML=`<span style="color:#39df78">● Aktiv:</span> ${esc(session.driverName)} ist diesem Handy zugeordnet.`;$('liveShiftStatus').textContent='Aktiv';$('liveShiftStatus').className='session-status on';$('liveShiftStarted').textContent=session.startedAt?new Date(session.startedAt).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}):'–';const consent=!!settings.consentByDriver?.[session.driverId],geo=settings.lastGeo&&settings.lastGeo.driverId===session.driverId?settings.lastGeo:null;$('liveGpsStatus').textContent=consent?(geo?'Aktiv':'Bereit'):'Zustimmung fehlt';$('liveGpsStatus').className='session-status '+(consent?'on':'warn');$('liveShiftLastPosition').textContent=geo?`${new Date(geo.time).toLocaleTimeString('de-DE')} · ±${Math.round(geo.accuracy||0)} m`:'–';$('liveShiftToggleBtn').textContent='■ Schicht beenden';$('liveShiftToggleBtn').className='live-action stop';}else{box.textContent=selected?`Ausgewählt: ${selected.name}. Beim Schichtstart wird dieses Handy diesem Fahrer zugeordnet.`:'Bitte Fahrer auswählen.';$('liveShiftStatus').textContent='Nicht gestartet';$('liveShiftStatus').className='session-status off';$('liveGpsStatus').textContent='Nicht aktiv';$('liveGpsStatus').className='session-status off';$('liveShiftStarted').textContent='–';$('liveShiftLastPosition').textContent='–';$('liveShiftToggleBtn').textContent='▶ Schicht starten';$('liveShiftToggleBtn').className='live-action primary';}}
function toggleDriverShift(){const session=getDriverSession(),settings=getLiveSettings(),driver=liveDriverList().find(x=>x.id===settings.driverId);if(session.active){if(!confirm(`Schicht von ${session.driverName} beenden?`))return;stopLiveGeoWatch();addLiveEvent(`Schicht beendet: ${session.driverName}. GPS-Übertragung dieses Handys wurde gestoppt.`,'ok');saveDriverSession({active:false,driverId:'',driverName:'',startedAt:null,lastPositionAt:null});showToast('Schicht beendet','ok');renderLiveDisposition();return}if(!driver){showToast('Bitte Fahrer auswählen','warn');return}if(!settings.consentByDriver?.[driver.id]){showToast('Bitte zuerst Zustimmung aktivieren','warn');return}saveDriverSession({active:true,driverId:driver.id,driverName:driver.name,startedAt:new Date().toISOString(),lastPositionAt:null});addLiveEvent(`Schicht gestartet: ${driver.name} wurde diesem Handy zugeordnet. GPS-Aktualisierung wird gestartet.`,'ok');showToast(`${driver.name}: Schicht gestartet`,'ok');startLiveGeoWatch();renderLiveDisposition()}

function getLiveLog(){try{const x=JSON.parse(localStorage.getItem(LIVE_LOG)||'[]');return Array.isArray(x)?x:[]}catch{return[]}}
function addLiveEvent(message,type='info'){const list=getLiveLog();list.unshift({at:new Date().toISOString(),message,type});localStorage.setItem(LIVE_LOG,JSON.stringify(list.slice(0,60)));renderLiveLog()}
function renderLiveLog(){const box=$('liveEventLog');if(!box)return;const list=getLiveLog();box.innerHTML=list.length?list.map(x=>`<div class="live-log-item"><b>${new Date(x.at).toLocaleString('de-DE')}</b><br>${esc(x.message)}</div>`).join(''):'<div class="live-empty">Noch keine Ereignisse protokolliert.</div>'}
function liveDriverList(){const contacts=getDriverContacts().filter(x=>x.active!==false);const names=[...new Set(rides.map(r=>r.driver).filter(Boolean))];names.forEach(name=>{if(!contacts.some(c=>normKey(c.name)===normKey(name)))contacts.push({id:'ride-'+normKey(name),name,phone:'',vehicle:'',active:true,fromRide:true})});return contacts}
function minutesOf(t){const m=String(t||'').match(/(\d{1,2}):(\d{2})/);return m?(+m[1]*60 + +m[2]):99999}
function ridesForLiveDriver(name){return visualRides(rides).filter(r=>normKey(r.driver)===normKey(name)&&!(r._bundleMemberIds||[r.id]).every(id=>done.has(id))).sort((a,b)=>minutesOf(effectiveTime(a))-minutesOf(effectiveTime(b)))}
function delayForRide(r){return Math.max(0,Number(r.delayMinutes||0))}
function liveStatusClass(d,threshold){return d>=threshold?'bad':d>0?'warn':'good'}
function liveRouteMode(){return getLiveSettings().mode==='route'}
function setLiveMode(mode){const s=getLiveSettings();s.mode=mode==='route'?'route':'standard';saveLiveSettings(s);renderLiveDisposition()}
function routeStatusLabel(delay,threshold){if(delay>=threshold)return['Verspätet','bad'];if(delay>0)return['Gefährdet','warn'];return['Pünktlich','good']}
function minutesUntilEffectiveTime(r){
  const t=effectiveTime(r),m=String(t||'').match(/(\d{1,2}):(\d{2})/);if(!m)return null;
  const now=new Date(),target=new Date(now);target.setHours(Number(m[1]),Number(m[2]),0,0);
  let diff=Math.round((target-now)/60000);
  if(diff < -720)diff+=1440;
  return diff;
}
function livePickupClockLabel(r){
  const diff=minutesUntilEffectiveTime(r);if(diff===null)return'Zeit nicht verfügbar';
  if(diff>0)return`noch ${diff} Min. bis Abholzeit`;
  if(diff===0)return'Abholzeit jetzt';
  return`${Math.abs(diff)} Min. nach Abholzeit`;
}
function geoAgeLabel(geo){
  if(!geo||!geo.time)return'kein GPS-Stand';
  const age=Math.max(0,Math.round((Date.now()-new Date(geo.time).getTime())/60000));
  return age<1?'GPS gerade aktualisiert':`GPS vor ${age} Min.`;
}
function routePointsForRide(r){
  if(!r)return[];
  const raw=r.isBundle&&Array.isArray(r.routeStops)&&r.routeStops.length
    ? [...r.routeStops].sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0)).map(x=>x.name)
    : [r.pickup,r.destination];
  const out=[];
  raw.forEach(value=>{const name=String(value||'').trim();if(name&&!out.some(x=>normKey(x)===normKey(name)))out.push(name)});
  return out;
}
function googleMapsRouteUrl(r,geo){
  const route=routeAddressResolution(r);
  if(!route.points.length)return{url:'',missing:[]};
  if(route.missing.length)return{url:'',missing:route.missing};
  const values=route.resolved.map(x=>x.value),hasGeo=geo&&Number.isFinite(Number(geo.lat))&&Number.isFinite(Number(geo.lng)),origin=hasGeo?`${Number(geo.lat)},${Number(geo.lng)}`:values[0],destination=values.at(-1),waypoints=(hasGeo?values.slice(0,-1):values.slice(1,-1)).filter(Boolean),params=new URLSearchParams({api:'1',origin,destination,travelmode:'driving'});
  if(waypoints.length)params.set('waypoints',waypoints.join('|'));
  return{url:`https://www.google.com/maps/dir/?${params.toString()}`,missing:[]};
}
function openGoogleMapsRoute(r,geo=null){const result=googleMapsRouteUrl(r,geo);if(result.missing?.length){showMissingRouteAddresses(result.missing);return false}if(!result.url){showToast('Keine vollständige Route verfügbar','warn');return false}window.open(result.url,'_blank');return true}
function routeLabelForRide(r){const points=routePointsForRide(r);return points.length?points.join(' → '):'Keine Route verfügbar'}
// CORE-006S – Lokales, editierbares Orts-/Adressbuch.
function normalizeAddressAlias(value){return normKey(String(value||'').replace(/[.,;:]+$/g,''))}
function normalizeAddressBookEntry(raw,index=0){
  const name=String(raw?.name??raw?.shortName??raw?.kurzname??raw?.planName??'').trim();
  const address=String(raw?.address??raw?.adresse??'').trim();
  let aliases=raw?.aliases??raw?.aliase??raw?.alias??[];
  if(typeof aliases==='string')aliases=aliases.split(/\r?\n|\|/g);
  if(!Array.isArray(aliases))aliases=[];
  aliases=[...new Set(aliases.map(x=>String(x||'').trim()).filter(Boolean).filter(x=>normalizeAddressAlias(x)!==normalizeAddressAlias(name)))];
  return {id:String(raw?.id||`addr-${Date.now()}-${index}-${Math.random().toString(36).slice(2,8)}`),name,address,aliases,note:String(raw?.note??raw?.notiz??'').trim(),createdAt:String(raw?.createdAt||new Date().toISOString()),updatedAt:String(raw?.updatedAt||raw?.createdAt||new Date().toISOString())};
}
function getAddressBook(){try{const raw=JSON.parse(localStorage.getItem(ADDRESS_BOOK)||'[]');return(Array.isArray(raw)?raw:[]).map(normalizeAddressBookEntry).filter(x=>x.name&&x.address)}catch(_){return[]}}
function saveAddressBook(list,reason='address-book'){const clean=(Array.isArray(list)?list:[]).map(normalizeAddressBookEntry).filter(x=>x.name&&x.address).slice(0,3000);const ok=safePersistentSetItem(ADDRESS_BOOK,JSON.stringify(clean),reason);if(ok){capturePersistenceSafety(reason);try{updateBackupUI()}catch(_){}}return ok}
function addressBookTerms(entry){return[entry?.name,...(Array.isArray(entry?.aliases)?entry.aliases:[])].map(normalizeAddressAlias).filter(Boolean)}
function findAddressBookEntry(place){const key=normalizeAddressAlias(place);if(!key)return null;const hits=getAddressBook().filter(entry=>addressBookTerms(entry).includes(key));return hits.length===1?hits[0]:null}
function addressBookHasCollision(candidate,excludeId=''){const wanted=new Set(addressBookTerms(candidate));if(!wanted.size)return null;return getAddressBook().find(entry=>String(entry.id)!==String(excludeId)&&addressBookTerms(entry).some(term=>wanted.has(term)))||null}
function resetAddressBookForm(){for(const id of['addressBookEditId','addressBookName','addressBookAddress','addressBookAliases','addressBookNote']){const el=$(id);if(el)el.value=''}const saveBtn=$('addressBookSaveBtn'),cancelBtn=$('addressBookCancelEditBtn');if(saveBtn)saveBtn.textContent='+ Adresse speichern';if(cancelBtn)cancelBtn.classList.add('hidden')}
function renderAddressBook(){
  const host=$('addressBookList'),status=$('addressBookStatus');if(!host)return;
  const q=normKey($('addressBookSearch')?.value||''),all=getAddressBook();
  const visible=all.filter(e=>!q||[e.name,e.address,...e.aliases,e.note].some(v=>normKey(v).includes(q)));
  if(status)status.textContent=`${all.length} Adresse(n) gespeichert · lokal auf diesem Gerät`;
  host.innerHTML=visible.length?visible.map(e=>`<div class="dispatcher-item" data-address-id="${esc(e.id)}"><div style="min-width:0"><b>${esc(e.name)}</b><small style="display:block;white-space:normal">${esc(e.address)}</small>${e.aliases.length?`<div class="driver-note">Alias: ${e.aliases.map(esc).join(' · ')}</div>`:''}${e.note?`<div class="driver-note">${esc(e.note)}</div>`:''}</div><div class="dispatcher-item-actions"><button type="button" class="mini" data-address-action="edit">✎</button><button type="button" class="mini danger" data-address-action="delete">✕</button></div></div>`).join(''):'<div class="setting-note">Noch keine passenden Orte & Adressen gespeichert.</div>';
}
function saveAddressBookForm(){
  const editId=String($('addressBookEditId')?.value||'').trim(),name=String($('addressBookName')?.value||'').trim(),address=String($('addressBookAddress')?.value||'').trim(),aliases=String($('addressBookAliases')?.value||'').split(/\r?\n|\|/g).map(x=>x.trim()).filter(Boolean),note=String($('addressBookNote')?.value||'').trim();
  if(!name){showToast('Bitte Kurzname / Planname eingeben','warn');return}if(!address){showToast('Bitte vollständige Adresse eingeben','warn');return}
  const list=getAddressBook(),old=list.find(x=>String(x.id)===editId),candidate=normalizeAddressBookEntry({...old,id:editId||undefined,name,address,aliases,note,createdAt:old?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()});
  const collision=addressBookHasCollision(candidate,editId);if(collision){alert(`Kurzname oder Alias ist bereits „${collision.name}“ zugeordnet. Bitte einen eindeutigen Namen/Alias verwenden.`);return}
  const next=editId?list.map(x=>String(x.id)===editId?candidate:x):[candidate,...list];if(!saveAddressBook(next,'address-book-edit')){showToast('Adresse konnte nicht gespeichert werden','warn');return}resetAddressBookForm();renderAddressBook();showToast(editId?'Adresse geändert':'Adresse gespeichert','ok');
}
function editAddressBookEntry(id){const e=getAddressBook().find(x=>String(x.id)===String(id));if(!e)return;$('addressBookEditId').value=e.id;$('addressBookName').value=e.name;$('addressBookAddress').value=e.address;$('addressBookAliases').value=e.aliases.join('\n');$('addressBookNote').value=e.note||'';$('addressBookSaveBtn').textContent='Änderungen speichern';$('addressBookCancelEditBtn')?.classList.remove('hidden');$('addressBookName')?.scrollIntoView({behavior:'smooth',block:'center'})}
function deleteAddressBookEntry(id){const e=getAddressBook().find(x=>String(x.id)===String(id));if(!e)return;if(!confirm(`Ort „${e.name}“ wirklich aus Orte & Adressen löschen?`))return;saveAddressBook(getAddressBook().filter(x=>String(x.id)!==String(id)),'address-book-delete');resetAddressBookForm();renderAddressBook();showToast('Adresse gelöscht','ok')}
function addressBookImportMode(count){const current=getAddressBook();if(!current.length)return'replace';if(confirm(`${count} Adresse(n) wurden erkannt.\n\nOK = Bestehende Adressen BEHALTEN & Import ERGÄNZEN\nAbbrechen = weitere Auswahl`))return'merge';return confirm(`Bestehende ${current.length} Adresse(n) durch die Importdatei ERSETZEN?\n\nOK = bestehende Adressen ersetzen\nAbbrechen = Import ohne Änderung abbrechen`)?'replace':'cancel'}
function validateImportedAddressEntries(rows){const out=[],seen=new Set();for(let i=0;i<rows.length;i++){const e=normalizeAddressBookEntry(rows[i],i);if(!e.name&&!e.address)continue;if(!e.name||!e.address)throw new Error(`Zeile ${i+2}: Kurzname und Adresse sind erforderlich.`);const terms=addressBookTerms(e);if(terms.some(t=>seen.has(t)))throw new Error(`Zeile ${i+2}: Kurzname/Alias kommt in der Importdatei doppelt vor.`);terms.forEach(t=>seen.add(t));out.push(e)}if(!out.length)throw new Error('Keine gültigen Adressen in der Datei gefunden.');return out}
function csvDetectDelimiter(text){const line=String(text||'').split(/\r?\n/).find(x=>x.trim())||'';return(line.match(/;/g)||[]).length>=(line.match(/,/g)||[]).length?';':','}
function parseDelimitedRows(text){const src=String(text||'').replace(/^\uFEFF/,''),d=csvDetectDelimiter(src),rows=[];let row=[],cell='',quoted=false;for(let i=0;i<src.length;i++){const ch=src[i];if(quoted){if(ch==='"'&&src[i+1]==='"'){cell+='"';i++;continue}if(ch==='"'){quoted=false;continue}cell+=ch;continue}if(ch==='"'){quoted=true;continue}if(ch===d){row.push(cell);cell='';continue}if(ch==='\n'){row.push(cell.replace(/\r$/,''));rows.push(row);row=[];cell='';continue}cell+=ch}if(cell.length||row.length){row.push(cell.replace(/\r$/,''));rows.push(row)}return rows.filter(r=>r.some(c=>String(c||'').trim()))}
function addressRowsFromMatrix(matrix){if(!Array.isArray(matrix)||!matrix.length)throw new Error('Datei enthält keine Tabellenzeilen.');const headers=matrix[0].map(v=>normKey(v).replace(/[ _-]+/g,'')),pick=names=>{for(const n of names){const i=headers.indexOf(n);if(i>=0)return i}return-1},nameI=pick(['kurzname','planname','name','ort']),addressI=pick(['adresse','address','vollständigeadresse','vollstaendigeadresse']),aliasI=pick(['aliase','alias','aliases']),noteI=pick(['notiz','note','hinweis']);if(nameI<0||addressI<0)throw new Error('Benötigte Spalten fehlen. Erwartet: „Kurzname“ und „Adresse“.');return matrix.slice(1).map(row=>({name:String(row[nameI]??'').trim(),address:String(row[addressI]??'').trim(),aliases:String(aliasI>=0?row[aliasI]??'':'').split(/\r?\n|\|/g).map(x=>x.trim()).filter(Boolean),note:String(noteI>=0?row[noteI]??'':'').trim()}))}
function xmlEscape(value){return String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;')}
function xlsxColumnName(index){let n=index+1,out='';while(n){n--;out=String.fromCharCode(65+n%26)+out;n=Math.floor(n/26)}return out}
function loadAddressBookJsZip(){if(window.JSZip)return Promise.resolve(window.JSZip);if(window.__atmsJsZipPromise)return window.__atmsJsZipPromise;window.__atmsJsZipPromise=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL('js/jszip.min.js',document.baseURI).href;script.async=true;script.onload=()=>window.JSZip?resolve(window.JSZip):reject(new Error('Excel-Modul wurde nicht geladen.'));script.onerror=()=>reject(new Error('Excel-Modul js/jszip.min.js fehlt. Bitte CORE-006S vollständig installieren.'));document.head.appendChild(script)});return window.__atmsJsZipPromise}
function xmlLocalElements(root,name){
  if(!root)return[];
  try{const byNs=[...root.getElementsByTagNameNS('*',name)];if(byNs.length)return byNs}catch(_){}
  const direct=[...root.getElementsByTagName(name)];if(direct.length)return direct;
  return [...root.getElementsByTagName('*')].filter(el=>String(el.localName||el.nodeName||'').split(':').at(-1)===name);
}
async function parseAddressBookXlsx(file){
  const JSZip=await loadAddressBookJsZip(),zip=await JSZip.loadAsync(await file.arrayBuffer()),wbFile=zip.file('xl/workbook.xml'),relsFile=zip.file('xl/_rels/workbook.xml.rels');if(!wbFile||!relsFile)throw new Error('Excel-Datei enthält keine lesbare Arbeitsmappe.');
  const parser=new DOMParser(),wb=parser.parseFromString(await wbFile.async('text'),'application/xml'),sheet=xmlLocalElements(wb,'sheet')[0];if(!sheet)throw new Error('Excel-Datei enthält kein Arbeitsblatt.');const relId=sheet.getAttribute('r:id')||sheet.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id');
  const rels=parser.parseFromString(await relsFile.async('text'),'application/xml');let target='';for(const rel of xmlLocalElements(rels,'Relationship'))if(rel.getAttribute('Id')===relId){target=rel.getAttribute('Target')||'';break}if(!target)target='worksheets/sheet1.xml';target=target.replace(/^\/?xl\//,'').replace(/^\//,'');const sheetFile=zip.file('xl/'+target.replace(/^\.\//,''));if(!sheetFile)throw new Error('Erstes Excel-Arbeitsblatt konnte nicht gelesen werden.');
  let shared=[];const sharedFile=zip.file('xl/sharedStrings.xml');if(sharedFile){const doc=parser.parseFromString(await sharedFile.async('text'),'application/xml');shared=xmlLocalElements(doc,'si').map(si=>xmlLocalElements(si,'t').map(t=>t.textContent||'').join(''))}
  const doc=parser.parseFromString(await sheetFile.async('text'),'application/xml'),matrix=[];for(const rowEl of xmlLocalElements(doc,'row')){const row=[];for(const c of xmlLocalElements(rowEl,'c')){const ref=c.getAttribute('r')||'',letters=(ref.match(/[A-Z]+/i)||['A'])[0].toUpperCase();let idx=0;for(const ch of letters)idx=idx*26+(ch.charCodeAt(0)-64);idx=Math.max(0,idx-1);const type=c.getAttribute('t')||'';let value='';if(type==='inlineStr')value=xmlLocalElements(c,'t').map(t=>t.textContent||'').join('');else{const v=xmlLocalElements(c,'v')[0]?.textContent||'';value=type==='s'?String(shared[Number(v)]??''):v}row[idx]=value}matrix.push(row)}return addressRowsFromMatrix(matrix)
}
async function parseAddressBookFile(file){const n=String(file?.name||'').toLowerCase();if(n.endsWith('.xlsx'))return validateImportedAddressEntries(await parseAddressBookXlsx(file));if(n.endsWith('.csv')||n.endsWith('.txt'))return validateImportedAddressEntries(addressRowsFromMatrix(parseDelimitedRows(await file.text())));throw new Error('Bitte eine Excel-Datei (.xlsx) oder CSV-Datei (.csv) auswählen.')}
function mergeAddressBookImported(imported){const current=getAddressBook(),next=[...current],owner=new Map();let added=0,unchanged=0,conflicts=0;current.forEach(e=>addressBookTerms(e).forEach(t=>{if(!owner.has(t))owner.set(t,e)}));for(const e of imported){const collision=addressBookTerms(e).map(t=>owner.get(t)).find(Boolean);if(collision){if(normalizeAddressAlias(collision.name)===normalizeAddressAlias(e.name)&&normKey(collision.address)===normKey(e.address))unchanged++;else conflicts++;continue}const fresh=normalizeAddressBookEntry({...e,id:undefined,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});next.push(fresh);addressBookTerms(fresh).forEach(t=>owner.set(t,fresh));added++}return{list:next,added,unchanged,conflicts}}
async function importAddressBookFile(file){try{const imported=await parseAddressBookFile(file),mode=addressBookImportMode(imported.length);if(mode==='cancel'){showToast('Adressimport abgebrochen','warn');return}capturePersistenceSafety('before-address-book-import');try{localStorage.setItem('atms_address_book_previous_import_v1',JSON.stringify({savedAt:new Date().toISOString(),addresses:getAddressBook()}))}catch(_){ }if(mode==='replace'){const now=new Date().toISOString(),fresh=imported.map((e,i)=>normalizeAddressBookEntry({...e,id:`addr-${Date.now()}-${i}`,createdAt:now,updatedAt:now},i));saveAddressBook(fresh,'address-book-import-replace');renderAddressBook();const status=$('addressBookStatus');if(status)status.textContent=`${fresh.length} Adresse(n) gespeichert · bestehende Adressen wurden ersetzt.`;showToast(`${fresh.length} Adressen importiert · bestehende ersetzt`,'ok');return}const m=mergeAddressBookImported(imported);saveAddressBook(m.list,'address-book-import-merge');renderAddressBook();const msg=`${m.added} neu · ${m.unchanged} unverändert${m.conflicts?` · ${m.conflicts} Konflikt(e) nicht überschrieben`:''}`;const status=$('addressBookStatus');if(status)status.textContent=msg;showToast(msg,m.conflicts?'warn':'ok')}catch(e){const status=$('addressBookStatus');if(status)status.textContent='Importfehler: '+e.message;showToast('Adressimport fehlgeschlagen','warn')}}
function addressBookExportRows(){return[['Kurzname','Adresse','Aliase','Notiz'],...getAddressBook().map(e=>[e.name,e.address,e.aliases.join(' | '),e.note||''])]}
function csvCell(v){v=String(v??'');return/[;"\r\n]/.test(v)?`"${v.replace(/"/g,'""')}"`:v}
function exportAddressBookCsv(){const rows=addressBookExportRows(),empty=rows.length<=1,text='\uFEFF'+rows.map(r=>r.map(csvCell).join(';')).join('\r\n'),d=new Date(),p=n=>String(n).padStart(2,'0');downloadTextFile(text,`ATMS_Adressen_${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}.csv`,'text/csv;charset=utf-8');showToast(empty?'CSV-Adressvorlage exportiert':'CSV-Adressliste exportiert','ok')}
async function exportAddressBookXlsx(){try{const rows=addressBookExportRows(),empty=rows.length<=1,JSZip=await loadAddressBookJsZip(),zip=new JSZip(),sheetRows=rows.map((r,ri)=>`<row r="${ri+1}">${r.map((v,ci)=>`<c r="${xlsxColumnName(ci)}${ri+1}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(v)}</t></is></c>`).join('')}</row>`).join('');zip.file('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>');zip.file('_rels/.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');zip.file('xl/workbook.xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="ATMS Adressen" sheetId="1" r:id="rId1"/></sheets></workbook>');zip.file('xl/_rels/workbook.xml.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>');zip.file('xl/worksheets/sheet1.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`);const xlsxMime='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE',mimeType:xlsxMime}),url=URL.createObjectURL(blob),a=document.createElement('a'),d=new Date(),p=n=>String(n).padStart(2,'0');a.href=url;a.download=`ATMS_Adressen_${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}.xlsx`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);showToast(empty?'Excel-Adressvorlage exportiert':'Excel-Adressliste exportiert','ok')}catch(e){const status=$('addressBookStatus');if(status)status.textContent='Excel-Exportfehler: '+e.message;showToast('Excel-Export fehlgeschlagen','warn')}}
function ensureAddressBookPanel(){
  const view=$('importView');if(!view)return false;let panel=$('atmsAddressBookPanel');if(panel){renderAddressBook();return true}
  panel=document.createElement('section');panel.id='atmsAddressBookPanel';panel.style.cssText='margin:16px 0;padding:14px;border:1px solid rgba(108,207,255,.32);border-radius:14px;background:rgba(20,90,120,.10)';
  panel.innerHTML=`<div style="font-weight:900;margin-bottom:5px">📍 Orte & Adressen</div><div style="font-size:12px;opacity:.82;margin-bottom:10px">Lokales Adressbuch für „Route öffnen“ und Live-Routing. Hotels werden nur über exakte Kurznamen/Aliase zugeordnet.</div><input id="addressBookSearch" placeholder="Adressen durchsuchen" autocomplete="off" style="width:100%;box-sizing:border-box;padding:10px;border-radius:9px;margin-bottom:10px"><input id="addressBookEditId" type="hidden"><label style="display:block;font-size:12px;opacity:.8;margin:5px 0">Kurzname / Planname</label><input id="addressBookName" placeholder="z. B. Holiday Inn Toulouseallee" autocomplete="off" style="width:100%;box-sizing:border-box;padding:10px;border-radius:9px"><label style="display:block;font-size:12px;opacity:.8;margin:8px 0 5px">Vollständige Adresse</label><input id="addressBookAddress" placeholder="Straße Hausnummer, PLZ Ort" autocomplete="street-address" style="width:100%;box-sizing:border-box;padding:10px;border-radius:9px"><label style="display:block;font-size:12px;opacity:.8;margin:8px 0 5px">Aliase (optional · je Zeile oder mit | trennen)</label><textarea id="addressBookAliases" placeholder="z. B. Holiday Inn DUS" style="width:100%;box-sizing:border-box;min-height:70px;padding:10px;border-radius:9px"></textarea><label style="display:block;font-size:12px;opacity:.8;margin:8px 0 5px">Notiz (optional)</label><input id="addressBookNote" placeholder="z. B. Haupteingang / Buszufahrt" style="width:100%;box-sizing:border-box;padding:10px;border-radius:9px"><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px"><button type="button" id="addressBookSaveBtn" style="padding:11px;border-radius:10px;font-weight:900">+ Adresse speichern</button><button type="button" id="addressBookCancelEditBtn" class="hidden" style="padding:11px;border-radius:10px;font-weight:800">Bearbeiten abbrechen</button></div><div style="height:1px;background:rgba(255,255,255,.12);margin:14px 0"></div><div style="display:grid;grid-template-columns:1fr;gap:8px"><button type="button" id="addressBookImportBtn" style="padding:11px;border-radius:10px;font-weight:850">📥 Excel/CSV importieren</button><input id="addressBookImportInput" type="file" accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" class="hidden"><button type="button" id="addressBookExportXlsxBtn" style="padding:11px;border-radius:10px;font-weight:850">📤 Excel exportieren</button><button type="button" id="addressBookExportCsvBtn" style="padding:11px;border-radius:10px;font-weight:850">📤 CSV exportieren</button></div><div id="addressBookStatus" style="font-size:12px;opacity:.82;margin:10px 0"></div><div id="addressBookList" style="display:grid;gap:8px"></div>`;
  const anchor=$('geminiFlightPanel');if(anchor&&anchor.parentElement===view)view.insertBefore(panel,anchor);else view.appendChild(panel);
  $('addressBookSaveBtn')?.addEventListener('click',saveAddressBookForm);$('addressBookCancelEditBtn')?.addEventListener('click',()=>{resetAddressBookForm();renderAddressBook()});$('addressBookSearch')?.addEventListener('input',renderAddressBook);$('addressBookList')?.addEventListener('click',e=>{const btn=e.target.closest('[data-address-action]'),row=e.target.closest('[data-address-id]');if(!btn||!row)return;const id=row.dataset.addressId;if(btn.dataset.addressAction==='edit')editAddressBookEntry(id);else if(btn.dataset.addressAction==='delete')deleteAddressBookEntry(id)});$('addressBookImportBtn')?.addEventListener('click',()=>{const input=$('addressBookImportInput');if(input){input.value='';input.click()}});$('addressBookImportInput')?.addEventListener('change',e=>{const file=e.target.files?.[0];if(file)importAddressBookFile(file)});$('addressBookExportXlsxBtn')?.addEventListener('click',exportAddressBookXlsx);$('addressBookExportCsvBtn')?.addEventListener('click',exportAddressBookCsv);renderAddressBook();return true
}
function navigationResolvedPoint(name){const raw=String(name||'').trim();if(!raw)return{ok:false,name:raw,value:''};const entry=findAddressBookEntry(raw);if(entry)return{ok:true,name:raw,value:entry.address,entry};const iata=flightAirportIataFromPlace(raw);if(iata==='DUS')return{ok:true,name:raw,value:'Düsseldorf Airport (DUS), Düsseldorf, Germany',airportIata:iata};if(iata==='CGN')return{ok:true,name:raw,value:'Cologne Bonn Airport (CGN), Köln, Germany',airportIata:iata};if(iata)return{ok:true,name:raw,value:`${iata} Airport`,airportIata:iata};return{ok:false,name:raw,value:''}}
function routeAddressResolution(r){const points=routePointsForRide(r),resolved=points.map(navigationResolvedPoint),missing=resolved.filter(x=>!x.ok).map(x=>x.name);return{points,resolved,missing}}
function showMissingRouteAddresses(missing){const unique=[...new Set((missing||[]).map(x=>String(x||'').trim()).filter(Boolean))];if(unique.length)alert(`Für folgende Orte fehlt eine eindeutige Adresse in „Orte & Adressen“:\n\n${unique.map(x=>'• '+x).join('\n')}\n\nBitte die Adresse einmal unter Einstellungen → Orte & Adressen hinterlegen. ATMS öffnet bewusst keine geratenen Hotel-Adressen.`)}
function navigationSearchQuery(name){
  const resolved=navigationResolvedPoint(name);
  return resolved.ok?resolved.value:'';
}
async function mapboxGeocode(name,token,proximity){
  const q=navigationSearchQuery(name);if(!q)return null;
  const params=new URLSearchParams({q,access_token:token,limit:'1',autocomplete:'false',language:'de',country:'de'});
  if(proximity&&Number.isFinite(Number(proximity.lng))&&Number.isFinite(Number(proximity.lat)))params.set('proximity',`${Number(proximity.lng)},${Number(proximity.lat)}`);
  const res=await fetch(`https://api.mapbox.com/search/geocode/v6/forward?${params.toString()}`);
  if(!res.ok){let msg=`Geocoding HTTP ${res.status}`;try{const j=await res.json();if(j?.message)msg=j.message}catch{}throw new Error(msg)}
  const data=await res.json(),feature=data?.features?.[0],coords=feature?.geometry?.coordinates;
  if(!Array.isArray(coords)||coords.length<2)return null;
  return{lng:Number(coords[0]),lat:Number(coords[1]),label:feature.properties?.full_address||feature.properties?.name||name,source:name};
}
async function mapboxDirections(coords,token){
  if(!Array.isArray(coords)||coords.length<2)throw new Error('Zu wenige Koordinaten für die Route.');
  const coordinateText=coords.map(p=>`${Number(p.lng)},${Number(p.lat)}`).join(';');
  const params=new URLSearchParams({access_token:token,overview:'false',steps:'false'});
  const res=await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${coordinateText}?${params.toString()}`);
  if(!res.ok){let msg=`Routing HTTP ${res.status}`;try{const j=await res.json();if(j?.message)msg=j.message}catch{}throw new Error(msg)}
  const data=await res.json(),route=data?.routes?.[0];if(!route)throw new Error(data?.message||'Keine Route gefunden.');return route;
}
function targetDateForRide(r,reference){
  const t=effectiveTime(r),m=String(t||'').match(/(\d{1,2}):(\d{2})/);if(!m)return null;
  const ref=new Date(reference||Date.now()),target=new Date(ref);target.setHours(Number(m[1]),Number(m[2]),0,0);
  if(target.getTime()<ref.getTime()-12*3600000)target.setDate(target.getDate()+1);
  return target;
}
function clockOf(value){return new Date(value).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}
function durationLabel(seconds){const min=Math.max(0,Math.round(Number(seconds||0)/60));return min<60?`${min} Min.`:`${Math.floor(min/60)} Std. ${min%60} Min.`}
function distanceLabel(meters){const km=Number(meters||0)/1000;return km<10?`${km.toFixed(1)} km`:`${Math.round(km)} km`}
function etaAssessment(lateMinutes,marginMinutes,threshold){
  if(lateMinutes>threshold)return{key:'bad',label:`VERSPÄTUNG +${lateMinutes} MIN.`};
  if(lateMinutes>0)return{key:'warn',label:`KNAPP · +${lateMinutes} MIN.`};
  if(marginMinutes<=threshold)return{key:'warn',label:`KNAPP · ${Math.max(0,marginMinutes)} MIN. PUFFER`};
  return{key:'good',label:`MACHBAR · ${marginMinutes} MIN. PUFFER`};
}
async function calculateLiveEta(driver,drides){
  const s=getLiveSettings(),token=String(s.mapboxToken||'').trim(),geo=s.lastGeo&&s.lastGeo.driverId===driver.id?s.lastGeo:null;
  if(!token)throw new Error('Mapbox-Token fehlt. In Einstellungen → Navigation eintragen.');
  if(!geo)throw new Error('Aktueller Handy-Standort fehlt. Zuerst Standort dieses Handys verwenden.');
  const threshold=Math.max(1,Number(s.warnThreshold||7)),buffer=Math.max(0,Number(s.stopBufferMinutes||5));
  const runId=++liveEtaRunId,results=[];let cursor=new Date(),origin={lng:Number(geo.lng),lat:Number(geo.lat)},proximity={lng:Number(geo.lng),lat:Number(geo.lat)};
  for(const ride of drides.slice(0,4)){
    if(runId!==liveEtaRunId)return null;
    const names=routePointsForRide(ride);if(!names.length)continue;
    const points=[];
    for(const name of names){const p=await mapboxGeocode(name,token,proximity);if(!p)throw new Error(`Ort nicht gefunden: ${name}`);points.push(p)}
    const route=await mapboxDirections([origin,...points],token),legs=Array.isArray(route.legs)?route.legs:[];
    if(!legs.length)throw new Error(`Keine Fahrzeit für ${ride.pickup||ride.id} erhalten.`);
    const scheduled=targetDateForRide(ride,cursor),toPickupSeconds=Number(legs[0]?.duration||0),arrivalPickup=new Date(cursor.getTime()+toPickupSeconds*1000);
    const lateMinutes=scheduled?Math.max(0,Math.ceil((arrivalPickup-scheduled)/60000)):0;
    const marginMinutes=scheduled?Math.floor((scheduled-arrivalPickup)/60000):0;
    const assessment=etaAssessment(lateMinutes,marginMinutes,threshold);
    let finishBase=scheduled&&arrivalPickup<scheduled?new Date(scheduled):arrivalPickup;
    let finishMs=finishBase.getTime();
    const pickupAndIntermediateStops=Math.max(0,points.length-1);
    if(pickupAndIntermediateStops>0)finishMs+=buffer*60000;
    for(let i=1;i<legs.length;i++){
      finishMs+=Number(legs[i]?.duration||0)*1000;
      if(i<legs.length-1)finishMs+=buffer*60000;
    }
    const finish=new Date(finishMs);
    const result={rideId:String(ride.id),pickup:ride.pickup,destination:ride.destination,scheduled:scheduled?.toISOString()||'',arrivalPickup:arrivalPickup.toISOString(),finish:finish.toISOString(),lateMinutes,marginMinutes,assessment,duration:Number(route.duration||0),distance:Number(route.distance||0),points:names};
    results.push(result);liveEtaResults.set(String(ride.id),result);cursor=finish;origin=points.at(-1);proximity=origin;
  }
  return results;
}
function renderLiveEtaResults(results){
  const box=$('liveEtaState');if(!box)return;
  if(!results||!results.length){box.innerHTML='<b>Live-ETA:</b> Keine berechenbaren Fahrten.';return}
  box.innerHTML=results.map((x,i)=>`<div class="route-step ${x.assessment.key==='bad'?'warn':x.assessment.key==='warn'?'warn':'ok'}"><span class="step-icon">${i+1}</span><div><b>${esc(i===0?'Aktuelle Fahrt':'Folgefahrt')} · ${esc(x.pickup||'Abholung')}</b><small>ETA Abholung ${esc(clockOf(x.arrivalPickup))}${x.scheduled?` · geplant ${esc(clockOf(x.scheduled))}`:''} · Ziel ca. ${esc(clockOf(x.finish))} · ${esc(distanceLabel(x.distance))} / ${esc(durationLabel(x.duration))}</small></div><em>${esc(x.assessment.label)}</em></div>`).join('');
  const first=results[0];
  if(first){const d=$('liveDelayContent');if(d)d.innerHTML=`<div class="delay-number">${first.lateMinutes?`+${first.lateMinutes} Minuten`:`${Math.max(0,first.marginMinutes)} Min. Puffer`}</div><b>${esc(first.pickup||'Abholung')} → ${esc(first.destination||'Ziel')}</b><div class="live-meta">Mapbox Live-ETA · Abholung ca. ${esc(clockOf(first.arrivalPickup))} · Fahrtende ca. ${esc(clockOf(first.finish))}</div>`;}
}
async function refreshLiveEta(){
  const box=$('liveEtaState'),btn=$('liveEtaRefreshBtn'),s=getLiveSettings(),driver=liveDriverList().find(x=>x.id===s.driverId);
  if(!driver){if(box)box.innerHTML='<b>Live-ETA:</b> Bitte Fahrer auswählen.';return}
  const drides=ridesForLiveDriver(driver.name);if(!drides.length){if(box)box.innerHTML='<b>Live-ETA:</b> Keine offenen Fahrten.';return}
  if(btn){btn.disabled=true;btn.textContent='⏳ Live-ETA wird berechnet …'}if(box)box.innerHTML='<b>Live-ETA:</b> Orte und aktuelle Fahrzeiten werden geprüft …';
  try{const results=await calculateLiveEta(driver,drides);if(results){renderLiveDisposition(false);renderLiveEtaResults(results)}}
  catch(e){if(box)box.innerHTML=`<b>Live-ETA nicht verfügbar:</b> ${esc(e.message)}`;showToast('Live-ETA konnte nicht berechnet werden','warn')}
  finally{if(btn){btn.disabled=false;btn.textContent='🚦 Live-ETA aktualisieren'}}
}
function renderRouteCheck(driver,drides,threshold){
  const card=$('liveRouteCheckCard'),standard=$('liveModeStandard'),route=$('liveModeRoute');if(!card)return;
  const on=liveRouteMode();card.classList.toggle('route-hidden',!on);standard?.classList.toggle('active',!on);route?.classList.toggle('active',on);if(!on)return;
  const s=getLiveSettings(),geo=(s.lastGeo&&s.lastGeo.driverId===driver.id)?s.lastGeo:null,notice=$('livePhoneDriverNotice');
  if(notice)notice.innerHTML=`<b>Zuordnung:</b> Die GPS-Position dieses Handys wird ausschließlich für die Fahrten von <b>${esc(driver.name)}</b> verwendet. Bitte stelle sicher, dass ${esc(driver.name)} dieses Gerät verwendet.`;
  const chain=[];
  chain.push(`<div class="route-step ${geo?'ok':'pending'}"><span class="step-icon">${geo?'✓':'1'}</span><div><b>Standort dieses Handys</b><small>${geo?`${Number(geo.lat).toFixed(5)}, ${Number(geo.lng).toFixed(5)} · Genauigkeit ${Math.round(geo.accuracy||0)} m`:'Tippe auf „Standort dieses Handys verwenden“'}</small></div><em>${geo?'ermittelt':'offen'}</em></div>`);
  drides.slice(0,6).forEach((r,i)=>{
    const eta=liveEtaResults.get(String(r.id));
    if(eta){
      const cls=eta.assessment.key==='good'?'ok':'warn';
      chain.push(`<div class="route-step ${cls}"><span class="step-icon">${i+2}</span><div><b>${i===0?'GPS → Abholort → Ziel':'Vorheriges Ziel → Abholort → Ziel'}</b><small>${esc(r.pickup||'Abholort fehlt')} → ${esc(r.destination||'Ziel fehlt')} · ETA ${esc(clockOf(eta.arrivalPickup))} · Ziel ca. ${esc(clockOf(eta.finish))}</small></div><em>${esc(eta.assessment.label)}</em></div>`);
      return;
    }
    const delay=delayForRide(r),[label,cls]=routeStatusLabel(delay,threshold),hasPrediction=delay!==0||Boolean(r.delay||r.delayMinutes||r.delayText);
    chain.push(`<div class="route-step ${hasPrediction?(cls==='bad'||cls==='warn'?'warn':'ok'):'pending'}"><span class="step-icon">${i+2}</span><div><b>${i===0?'Position → Abholort → Ziel':'Vorheriges Ziel → Abholort → Ziel'}</b><small>${esc(r.pickup||'Abholort fehlt')} → ${esc(r.destination||'Ziel fehlt')} · ${esc(livePickupClockLabel(r))}</small></div><em>${hasPrediction?(delay?`+${delay} Min. · ${label}`:label):(i===0?'ZEITCHECK':'PLANPRÜFUNG')}</em></div>`);
  });
  $('liveRouteChain').innerHTML=chain.join('');
  const etaValues=drides.map(r=>liveEtaResults.get(String(r.id))).filter(Boolean),late=etaValues.length?etaValues.filter(x=>x.assessment.key==='bad').length:drides.filter(r=>delayForRide(r)>=threshold).length,risk=etaValues.length?etaValues.filter(x=>x.assessment.key==='warn').length:drides.filter(r=>delayForRide(r)>0&&delayForRide(r)<threshold).length,onTime=etaValues.length?etaValues.filter(x=>x.assessment.key==='good').length:drides.filter(r=>delayForRide(r)<=0).length;
  $('liveRouteSummary').innerHTML=`<div><small>MACHBAR</small><b style="color:#59ef8b">${onTime}</b></div><div><small>KNAPP</small><b style="color:#ffc95a">${risk}</b></div><div><small>VERSPÄTET</small><b style="color:#ff7189">${late}</b></div>`;
  $('liveGeoState').innerHTML=geo?`<b>Standort dieses Handys verwendet:</b> ${Number(geo.lat).toFixed(5)}, ${Number(geo.lng).toFixed(5)} · ${esc(driver.name)} zugeordnet · ${esc(geoAgeLabel(geo))} · zuletzt ${new Date(geo.time).toLocaleTimeString('de-DE')}`:`<b>Standort dieses Handys:</b> noch nicht ermittelt. Tippe auf den Button und erlaube den Standortzugriff. Die Position wird danach ${esc(driver.name)} zugeordnet.`;
  drides.filter(r=>delayForRide(r)>=threshold).forEach(r=>ensureLiveDelayEvent(driver,r,threshold));
}
function ensureLiveDelayEvent(driver,ride,threshold){const key=`ATMS_LIVE_WARN_${driver.id}_${ride.id}`;const delay=delayForRide(ride);let prior=null;try{prior=JSON.parse(localStorage.getItem(key)||'null')}catch{}if(prior&&prior.delay===delay)return;addLiveEvent(`Automatische Verspätungswarnung: ${driver.name}, Fahrt ${ride.id}, ${ride.pickup||'Abholung'} → ${ride.destination||'Ziel'}, Prognose +${delay} Min., Warnschwelle ${threshold} Min. Nachricht für Info-Chat und Dispo erstellt.`,'warn');localStorage.setItem(key,JSON.stringify({delay,time:new Date().toISOString()}))}
function requestLivePosition(){
  const state=$('liveGeoState'),btn=$('liveGetPositionBtn');
  const fail=(msg,detail='')=>{if(state)state.innerHTML=`<b>Standort konnte nicht verwendet werden.</b><br>${esc(msg)}${detail?`<br><small>${esc(detail)}</small>`:''}`;showToast(msg,'warn');if(btn){btn.disabled=false;btn.textContent='📍 Standortfreigabe erneut anfordern'}};
  if(!navigator.geolocation){fail('Dieses Gerät oder dieser Browser unterstützt keine Standortermittlung.');return}
  if(['file:','content:'].includes(location.protocol)){fail('Die App wurde direkt aus dem Download- oder Dateibereich geöffnet. In diesem Modus blockiert Chrome den GPS-Zugriff.','Aktuelle Adresse: '+location.protocol+'//…  · Öffne ATMS PRO über eine HTTPS-Adresse. Eine Änderung der Chrome-App-Berechtigung allein reicht hier nicht aus.');return}
  if(!window.isSecureContext && location.hostname!=='localhost'){fail('Standortzugriff ist nur über eine sichere HTTPS-Verbindung möglich.');return}
  const s0=getLiveSettings(),driver=liveDriverList().find(x=>x.id===s0.driverId);
  if(!driver){fail('Bitte zuerst einen Fahrer auswählen.');return}
  if(btn){btn.disabled=true;btn.textContent='Standortfreigabe wird angefordert …'}
  if(state)state.innerHTML=`<b>Standortfreigabe wird angefordert.</b><br>Bitte bestätige die Standortabfrage von Android/iPhone für ${esc(driver.name)}.`;
  const options={enableHighAccuracy:true,timeout:20000,maximumAge:0};
  navigator.geolocation.getCurrentPosition(pos=>{
    const s=getLiveSettings();
    s.lastGeo={driverId:driver.id,driverName:driver.name,lat:pos.coords.latitude,lng:pos.coords.longitude,accuracy:pos.coords.accuracy,time:new Date().toISOString()};
    saveLiveSettings(s);
    addLiveEvent(`Standort dieses Handys wurde ${driver.name} für die Routenprüfung zugeordnet (Genauigkeit ca. ${Math.round(pos.coords.accuracy)} m).`,'ok');
    if(btn){btn.disabled=false;btn.textContent='🔄 Standort dieses Handys aktualisieren'}
    renderLiveDisposition();
  },err=>{
    let msg='Position konnte nicht ermittelt werden.';
    let detail='Bitte GPS einschalten und erneut versuchen.';
    if(err.code===1){msg='Chrome hat den Standortzugriff blockiert.';detail=location.protocol==='https:'?'Erlaube den Standort für diese Website über das Schloss-/Website-Symbol in Chrome und lade die Seite neu.':'ATMS PRO muss über HTTPS geöffnet werden; direkt geöffnete Download-Dateien (content:// oder file://) können keinen GPS-Zugriff erhalten.'}
    else if(err.code===2){msg='Der Standort ist momentan nicht verfügbar.';detail='Aktiviere GPS/Standortdienste und prüfe die Internetverbindung.'}
    else if(err.code===3){msg='Die Standortermittlung hat zu lange gedauert.';detail='Gehe möglichst ins Freie oder versuche es erneut.'}
    fail(msg,detail);
  },options)
}
function renderLiveDisposition(resetEta=true){showView('live');document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x.dataset.nav==='live'));const s=getLiveSettings(),drivers=liveDriverList(),sel=$('liveDriverSelect');if(!drivers.length){sel.innerHTML='<option value="">Keine Fahrer vorhanden</option>';renderLiveEmpty();return}if(!s.driverId||!drivers.some(d=>d.id===s.driverId))s.driverId=drivers[0].id;sel.innerHTML=drivers.map(d=>`<option value="${esc(d.id)}" ${d.id===s.driverId?'selected':''}>${d.favorite?'⭐ ':''}${esc(d.name)}${d.vehicle?' · '+esc(d.vehicle):''}</option>`).join('');sel.value=s.driverId;saveLiveSettings(s);renderNavigationSettings();const d=drivers.find(x=>x.id===s.driverId),consent=!!s.consentByDriver?.[s.driverId];$('liveTrackingConsent').checked=consent;$('liveWarnThreshold').value=s.warnThreshold||7;$('liveTrackingState').textContent=consent?'Tracking freigegeben':'Zustimmung ausstehend';$('liveTrackingState').className='tracking-state '+(consent?'active':'wait');$('liveTrackingMeta').textContent=consent?'Zustimmung gespeichert. Die Position kann auf diesem Handy für die Routenprüfung ermittelt werden.':'Tracking wird erst nach eindeutiger Zustimmung aktiviert.';const tracked=drivers.filter(x=>s.consentByDriver?.[x.id]);$('liveSingleDriverNotice').textContent=tracked.length<=1?`Hinweis: Aktuell ist nur ${d.name} für Live-Disposition ausgewählt/verfügbar. Fahrerwechsel werden nur bei real vorhandenen Daten vorgeschlagen.`:`${tracked.length} Fahrer mit Freigabestatus verfügbar.`;const drides=ridesForLiveDriver(d.name),limit=liveExpanded?drides.length:4,threshold=Number(s.warnThreshold||7);$('liveTimeline').innerHTML=drides.length?drides.slice(0,limit).map((r,i)=>{const delay=delayForRide(r),cls=liveStatusClass(delay,threshold);return `<div class="timeline-item ${cls}"><div class="timeline-top"><div><div class="timeline-time">${esc(effectiveTime(r)||'–')}</div><div class="timeline-route">${esc(r.pickup||'Start nicht verfügbar')} → ${esc(r.destination||'Ziel nicht verfügbar')}</div></div><span class="timeline-status">${i===0?'AKTUELL':i===1?'NÄCHSTE':i===2?'ÜBERNÄCHSTE':'GEPLANT'}</span></div><div class="timeline-sub">${delay?`Prognose: +${delay} Min.`:'Pünktlich / keine Verspätung gemeldet'} · ${esc(r.flightNumber||r.id)}</div></div>`}).join(''):'<div class="live-empty">Keine offenen Fahrten für diesen Fahrer.</div>';$('liveMoreRidesBtn').style.display=drides.length>4?'block':'none';$('liveMoreRidesBtn').textContent=liveExpanded?'Weniger Fahrten anzeigen':'Weitere Fahrten anzeigen';const critical=drides.find(r=>delayForRide(r)>=threshold)||drides.find(r=>delayForRide(r)>0);renderLiveDelayAndSolution(d,critical,drivers,drides,threshold,consent);renderRouteCheck(d,drides,threshold);renderDriverSessionCard();const routeRide=drides[0]||critical;const routeGeo=s.lastGeo&&s.lastGeo.driverId===d.id?s.lastGeo:null;const routeLabel=routeRide?routeLabelForRide(routeRide):'';$('liveMap').innerHTML=routeRide?`<b>${routeGeo?'Standort dieses Handys':esc(routePointsForRide(routeRide)[0]||routeRide.pickup||'Start')}</b><span>↓ Route mit allen Stopps</span><b>${esc(routeLabel)}</b><small>${routeGeo?'GPS-Standort → Abholort/Stopps → Ziel':'Ohne GPS startet die Route am ersten Abholort'} · Google Maps berechnet Navigation und Verkehr</small>`:'<span>Keine Route verfügbar</span>';$('liveOpenMapBtn').disabled=!routeRide;$('liveOpenMapBtn').dataset.rideId=routeRide?.id||'';$('liveLastUpdate').textContent=new Date().toLocaleTimeString('de-DE');$('liveSystemPill').textContent=consent?'● LIVE-BEREIT':'● ZUSTIMMUNG OFFEN';if(resetEta){const eta=$('liveEtaState');if(eta)eta.innerHTML=s.mapboxToken?(routeGeo?'<b>Live-ETA bereit.</b> Tippe auf „Live-ETA aktualisieren“.':'<b>Live-ETA wartet auf GPS.</b> Standort dieses Handys zuerst ermitteln.'):'<b>Live-ETA nicht eingerichtet.</b> Mapbox-Token unter Einstellungen → Navigation speichern.';}renderLiveLog()}
function renderLiveEmpty(){$('liveTimeline').innerHTML='<div class="live-empty">Bitte zuerst Fahrer oder Fahrten anlegen.</div>';$('liveDelayContent').innerHTML='<div class="live-empty">Keine Prüfung möglich.</div>';$('liveSolutionContent').innerHTML='<div class="live-empty">Keine Lösung verfügbar.</div>';$('liveApplySolutionBtn').disabled=true;renderLiveLog()}
function renderLiveDelayAndSolution(driver,critical,drivers,drides,threshold,consent){liveSuggested=null;if(!critical){$('liveDelayContent').innerHTML='<div class="tracking-state active">Keine Verspätung erkannt</div><div class="live-meta">Alle vorhandenen Fahrtdaten liegen unter der Warnschwelle.</div>';$('liveSolutionContent').innerHTML='<div class="live-empty">Aktuell ist keine Umplanung erforderlich.</div>';$('liveApplySolutionBtn').disabled=true;return}const delay=delayForRide(critical);$('liveDelayContent').innerHTML=`<div class="delay-number">+${delay} Minuten</div><b>${esc(critical.pickup)} → ${esc(critical.destination)}</b><div class="live-meta">Warnschwelle: ${threshold} Min. · Betroffene Fahrt: ${esc(critical.id)}</div>`;const alternatives=drivers.filter(x=>x.id!==driver.id&&x.active!==false&&getLiveSettings().consentByDriver?.[x.id]);if(!alternatives.length){$('liveSolutionContent').innerHTML='<div class="solution-title">Dispo manuell informieren</div><div class="solution-details">Kein weiterer Fahrer mit gültiger Freigabe und realen Daten verfügbar. Es wird kein Ersatzfahrer simuliert.</div>';$('liveApplySolutionBtn').disabled=true;return}const alt=alternatives[0];liveSuggested={rideId:critical.id,fromDriver:driver.name,toDriver:alt.name,toId:alt.id,delay};$('liveSolutionContent').innerHTML=`<span class="solution-badge">BESTE VERFÜGBARE LÖSUNG</span><div class="solution-title">Fahrt an ${esc(alt.name)} anfragen</div><div class="solution-details">Fahrt ${esc(critical.id)} kontrolliert zur Übernahme anbieten.<br>Vor Ausführung werden Verfügbarkeit, Bestätigung und aktuelle Daten erneut geprüft.</div>`;$('liveApplySolutionBtn').disabled=!consent}
function applyLiveSolution(){if(!liveSuggested)return;const s=getLiveSettings(),drivers=liveDriverList(),target=drivers.find(x=>x.id===liveSuggested.toId);if(!target||target.active===false||!s.consentByDriver?.[target.id]){addLiveEvent('Übergabe abgebrochen: Ersatzfahrer nicht mehr verfügbar oder Trackingfreigabe fehlt.','warn');showToast('Übergabe nicht möglich','warn');renderLiveDisposition();return}if(!confirm(`Fahrt ${liveSuggested.rideId} an ${target.name} zur Übernahme zuweisen?`))return;const original=rides.find(r=>String(r.id)===String(liveSuggested.rideId));if(!original){showToast('Fahrt nicht gefunden','error');return}original.driver=target.name;save();addLiveEvent(`Übergabe erfolgreich: Fahrt ${liveSuggested.rideId} von ${liveSuggested.fromDriver} an ${target.name}. Prognostizierte Verspätung: +${liveSuggested.delay} Min.`,'ok');showToast('Fahrt neu zugeordnet','ok');renderLiveDisposition()}
function initLiveDisposition(){bindClick('liveEtaRefreshBtn',refreshLiveEta);bindClick('liveShiftToggleBtn',toggleDriverShift);bindClick('liveModeStandard',()=>setLiveMode('standard'));bindClick('liveModeRoute',()=>setLiveMode('route'));bindClick('liveGetPositionBtn',requestLivePosition);const sel=$('liveDriverSelect');if(sel)sel.addEventListener('change',e=>{const activeSession=getDriverSession();if(activeSession.active&&e.target.value!==activeSession.driverId){showToast(`Schicht von ${activeSession.driverName} zuerst beenden`,'warn');e.target.value=activeSession.driverId;return}const s=getLiveSettings();s.driverId=e.target.value;saveLiveSettings(s);const d=liveDriverList().find(x=>x.id===s.driverId);addLiveEvent(`Fahrer für die Routenprüfung ausgewählt: ${d?.name||'unbekannt'}. Standort dieses Handys muss für diesen Fahrer bestätigt werden.`);const btn=$('liveGetPositionBtn');if(btn)btn.textContent='📍 Standort dieses Handys verwenden';renderLiveDisposition()});const consent=$('liveTrackingConsent');if(consent)consent.addEventListener('change',e=>{const s=getLiveSettings();if(!s.consentByDriver)s.consentByDriver={};s.consentByDriver[s.driverId]=e.target.checked;saveLiveSettings(s);addLiveEvent(`${e.target.checked?'Trackingfreigabe erteilt':'Trackingfreigabe beendet'} für ${liveDriverList().find(x=>x.id===s.driverId)?.name||'Fahrer'}.`);renderLiveDisposition()});bindClick('liveRefreshBtn',renderLiveDisposition);bindClick('liveMoreRidesBtn',()=>{liveExpanded=!liveExpanded;renderLiveDisposition()});bindClick('liveApplySolutionBtn',applyLiveSolution);const th=$('liveWarnThreshold');if(th)th.addEventListener('change',e=>{const s=getLiveSettings();s.warnThreshold=Math.max(1,Math.min(60,Number(e.target.value)||7));saveLiveSettings(s);renderLiveDisposition()});bindClick('liveOpenMapBtn',()=>{const id=$('liveOpenMapBtn').dataset.rideId,r=visualRides(rides).find(x=>String(x.id)===String(id));if(!r)return;const settings=getLiveSettings(),driver=liveDriverList().find(x=>x.id===settings.driverId),geo=settings.lastGeo&&driver&&settings.lastGeo.driverId===driver.id?settings.lastGeo:null,result=googleMapsRouteUrl(r,geo);if(result.missing?.length){showMissingRouteAddresses(result.missing);return}if(!result.url){showToast('Keine vollständige Route verfügbar','warn');return}window.open(result.url,'_blank')})}

function safeEl(id){return document.getElementById(id)}
function bindClick(id,handler){const el=safeEl(id);if(el)el.addEventListener('click',handler)}
function showAppError(error){
  console.error('ATMS Startfehler:',error);
  const box=safeEl('appError');
  if(box){box.hidden=false;box.textContent='ATMS-Fehler: '+(error&&error.message?error.message:String(error));}
}

// CORE-004M · 06.09.2026: Ergebnis der automatischen Flugprüfung dauerhaft sichtbar halten.
// Die bestehende kurze Toast-Meldung bleibt unverändert. Zusätzlich merkt ATMS das letzte
// aussagekräftige Ergebnis/den letzten technischen Fehler und zeigt ihn direkt unter dem
// Flugprüf-Status an, auch wenn plan-import.js danach den normalen Flugzähler neu rendert.
function initPersistentFlightCheckStatus(){
  const STORAGE_KEY='atms_flight_check_last_status_v1';
  const isImportant=text=>/fehlgeschlagen|fehler|nicht bereit|offline|benötigt internet|technisch|ki-anfrage|aktuell geprüft|automatisch übernommen|manuell prüfen/i.test(String(text||''));
  const paint=(box,text,at='')=>{
    if(!box||!text)return;
    const isError=/fehlgeschlagen|fehler|nicht bereit|offline|technisch|ki-anfrage/i.test(text);
    box.style.display='block';
    box.style.marginTop='10px';
    box.style.padding='10px 12px';
    box.style.borderRadius='10px';
    box.style.border=`1px solid ${isError?'rgba(255,113,137,.65)':'rgba(89,239,139,.5)'}`;
    box.style.background=isError?'rgba(95,20,36,.35)':'rgba(20,85,48,.28)';
    box.style.color=isError?'#ffd5dd':'#c9ffda';
    box.style.fontSize='12px';
    box.style.lineHeight='1.45';
    box.style.whiteSpace='pre-wrap';
    box.textContent=`Letztes Ergebnis${at?` · ${at}`:''}: ${text}`;
  };
  const attach=()=>{
    const source=document.getElementById('flightCheckStatus');
    if(!source||source.dataset.atmsPersistentWatched==='1')return false;
    source.dataset.atmsPersistentWatched='1';
    let box=document.getElementById('atmsPersistentFlightCheckStatus');
    if(!box){
      box=document.createElement('div');
      box.id='atmsPersistentFlightCheckStatus';
      box.style.display='none';
      source.insertAdjacentElement('afterend',box);
    }
    try{
      const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      if(saved?.text)paint(box,String(saved.text),String(saved.at||''));
    }catch(_){ }
    const remember=()=>{
      const value=String(source.textContent||'').trim();
      if(!value||!isImportant(value))return;
      const at=new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
      try{localStorage.setItem(STORAGE_KEY,JSON.stringify({text:value,at,createdAt:new Date().toISOString()}));}catch(_){ }
      paint(box,value,at);
    };
    new MutationObserver(remember).observe(source,{childList:true,subtree:true,characterData:true});
    remember();
    return true;
  };
  if(attach())return;
  const rootObserver=new MutationObserver(()=>{if(attach())rootObserver.disconnect()});
  rootObserver.observe(document.documentElement,{childList:true,subtree:true});
}

function initApp(){
  try{
    // CORE-005T 08.09.2026: verifizierte Flight-Cache-Eintraege redundant schuetzen und ggf. wiederherstellen.
    restoreMissingCriticalPersistence('startup');
    recoverVerifiedFlightCache();
    capturePersistenceSafety('startup');
    initPersistenceDurableShadow();
    initPersistentFlightCheckStatus();
    bindClick('driverBtn',openDrivers);
    bindClick('cockpitDispatcherMessageBtn',openDispatcherMessage);
    bindClick('cockpitDriverMessageBtn',openDriverMessage);
    bindClick('infoStatusBtn',openInfoStatus);
    bindClick('addDriverContact',addDriverContact);
    const driverSearch=safeEl('driverContactSearch');if(driverSearch)driverSearch.addEventListener('input',renderDriverContactList);
    const showInactive=safeEl('driverShowInactive');if(showInactive)showInactive.addEventListener('change',renderDriverContactList);
    const dispatcherSelect=safeEl('cockpitDispatcherSelect');
    if(dispatcherSelect)dispatcherSelect.addEventListener('change',e=>setCurrentDispatcher(e.target.value));
    bindClick('saveInfoChatBtn',saveInfoChatSettings);bindClick('saveNavigationSettingsBtn',saveNavigationSettings);bindClick('testNavigationApiBtn',testNavigationApi);
    const infoChatType=$('infoChatType');
    if(infoChatType)infoChatType.addEventListener('change',renderInfoChatSettings);
    bindClick('addDispatcher',addDispatcher);
    bindClick('exportBackupBtn',exportAtmsBackup);
    bindClick('importBackupBtn',chooseBackupFile);
    bindClick('resetDataBtn',resetAtmsData);
    const backupInput=safeEl('backupFileInput');if(backupInput)backupInput.addEventListener('change',e=>{const f=e.target.files&&e.target.files[0];if(f)importAtmsBackup(f)});
    bindClick('closeDrivers',()=>safeEl('driverDialog')?.classList.add('hidden'));
    const driverDialog=safeEl('driverDialog');
    if(driverDialog)driverDialog.addEventListener('click',e=>{if(e.target===driverDialog)driverDialog.classList.add('hidden')});
    const driverSheet=safeEl('driverSheet');if(driverSheet)driverSheet.addEventListener('click',e=>e.stopPropagation());
    bindClick('backBtn',render);
    bindClick('importBack',render);
    bindClick('plusBtn',()=>showView('import'));
    const search=safeEl('search');if(search)search.addEventListener('input',render);
    bindClick('mapBtn',()=>{if(active)openGoogleMapsRoute(active,null)});
    bindClick('doneBtn',()=>{if(!active)return;const ids=active._bundleMemberIds||[active.id];const allDone=ids.every(id=>done.has(id));ids.forEach(id=>allDone?done.delete(id):done.add(id));save();openCockpit(active.id)});
    const fileInput=safeEl('fileInput');if(fileInput)fileInput.addEventListener('change',async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;safeEl('jsonInput').value=await f.text();safeEl('importStatus').textContent='Datei geladen. Jetzt „Fahrten laden“ tippen.'});
    bindClick('loadBtn',()=>{try{const incoming=parse(safeEl('jsonInput').value);const result=applyImportedRides(incoming);if(result.cancelled){safeEl('importStatus').textContent='Import abgebrochen. Die aktuelle Planliste bleibt erhalten.';return}safeEl('importStatus').textContent=result.mode==='merge'?`Planlisten zusammengeführt: ${result.count} Fahrten.`:`Planliste ersetzt: ${result.count} Fahrten geladen.`;showToast(result.mode==='merge'?`${result.count} Fahrten zusammengeführt`:`${result.count} Fahrten importiert`,'ok');mode='rides';render()}catch(e){safeEl('importStatus').textContent='Fehler: '+e.message}});
    bindClick('clearBtn',()=>{safeEl('jsonInput').value='';rides=[];done.clear();save();safeEl('importStatus').textContent='Liste geleert.'});
    document.querySelectorAll('[data-nav]').forEach(b=>b.addEventListener('click',()=>{const n=b.dataset.nav;if(n==='settings'){document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x===b));showView('import');safeEl('cockpitDispatcherSelect')?.addEventListener('change',e=>setCurrentDispatcher(e.target.value));
    safeEl('cockpitDriverSelect')?.addEventListener('change',renderDriverControls);
    try{loadWhatsappSettings();renderNavigationSettings();ensureAddressBookPanel();renderAddressBook();updateBackupUI()}catch(e){showAppError(e)}}else if(n==='messages'){alert('Nachrichten sind für eine spätere Version vorbereitet.')}else if(n==='live'){renderLiveDisposition()}else if(n==='all'){openDrivers()}else{mode='rides';document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x===b));render()}}));

    ensureMobileImportLayoutFix();
    ensureGeminiFlightPanel();
    ensureAddressBookPanel();
    ensureLiveFlightPanel();
    ensurePersistenceSafetyPanel();
    initPersistenceSafetyPanelObserver();
    try{
      rides=JSON.parse(localStorage.getItem(KEY)||'[]').map(norm);
      const overrideRestore=applyRideOverrides(rides);
      rides=overrideRestore.rides;
      const restored=applyFlightCacheToRides(rides);
      rides=restored.rides;
      if(overrideRestore.changed||restored.changed)save();
    }catch(e){rides=[]}
    initLiveDisposition();
    if(getDriverSession().active)startLiveGeoWatch();
    try{loadWhatsappSettings();renderNavigationSettings();updateBackupUI()}catch(e){console.warn('Einstellungen konnten nicht geladen werden',e)}
    if(rides.length){const ji=safeEl('jsonInput');if(ji)ji.value=JSON.stringify({rides},null,2);render()}else{showView('import')}
  }catch(error){showAppError(error);try{showView('import')}catch(_){} }
}
window.addEventListener('error',e=>showAppError(e.error||e.message));
window.addEventListener('unhandledrejection',e=>showAppError(e.reason));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initApp);else initApp();

window.ATMSAddressBook={get:getAddressBook,render:renderAddressBook,find:findAddressBookEntry};
window.ATMSPersistenceDiagnosis=persistenceDiagnosis;window.ATMSPersistenceSnapshot=capturePersistenceSafety;window.ATMSRestorePreviousPlanImport=restorePreviousPlanImport;window.applyImportedRides=applyImportedRides;window.showToast=showToast;window.render=render;

window.buildGeminiFlightPrompt=buildGeminiFlightPrompt;window.copyGeminiFlightPrompt=copyGeminiFlightPrompt;window.applyGeminiFlightResult=applyGeminiFlightResult;
window.buildLiveFlightPrompt=buildLiveFlightPrompt;window.copyLiveFlightPrompt=copyLiveFlightPrompt;window.applyLiveFlightResult=applyLiveFlightResult;
