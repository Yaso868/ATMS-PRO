// ATMS PRO · CORE-007D8A1F1D8P31F5F6 · AUTO-FLIGHT EXPLICIT URL SOURCES
// 18.09.2026 (Europe/Berlin)
// Firebase AI Logic + App Check + Gemini Developer API + explicit URL Context sources.
// FLIGHT-008: deterministic dual-source check via Flightradar24 + FlightStats; Google Search remains supplementary.
// Datenschutz: niemals vollständige Planliste/Bild; nur Flugnummer, Datum, Richtung,
// ggf. Flugzeit und vorhandener Flugort als Vergleichswert.
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js';
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider
} from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-app-check.js';
import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend
} from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-ai.js';

const VERSION='CORE-007D8A1F1D8P31F5F6';
const PRIMARY_MODEL='gemini-3.8-flash';
const FALLBACK_MODEL='gemini-3.5-flash';

// Firebase-Web-Konfiguration: öffentliche App-Kennungen, keine Server-Secrets.
const firebaseConfig={
  apiKey:'AIzaSyA6Q_-YcmPhadF6hrgW-gttE2jCdKtlRGQ',
  authDomain:'atms-pro.firebaseapp.com',
  projectId:'atms-pro',
  storageBucket:'atms-pro.firebasestorage.app',
  messagingSenderId:'112440704342',
  appId:'1:112440704342:web:8497a736d13dda91fd2af7'
};
const RECAPTCHA_ENTERPRISE_SITE_KEY='6LegC4ItAAAAAFQygTQonjTOhe8X9CwKKa8I5iHe';

let initPromise=null;
let primaryModel=null;
let fallbackModel=null;
const text=value=>String(value??'').trim();
const upper=value=>text(value).toUpperCase().replace(/\s+/g,'');

function normalizeDirection(ride){
  if(ride?.flightDirection==='arrival'||ride?.arrivalFlight)return'arrival';
  if(ride?.flightDirection==='departure'||ride?.departureFlight)return'departure';
  return'';
}
function relevantSide(direction){
  return direction==='arrival'?'origin':direction==='departure'?'destination':'unknown';
}
function airportIataFromPlace(value){
  const raw=text(value);
  if(!raw)return'';
  const v=raw.toLocaleLowerCase('de-DE').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  if(/\bdus\b/.test(raw.toUpperCase())&&/(airport|flughafen|terminal|airport)/i.test(raw))return'DUS';
  if(/dusseldorf\s+(airport|flughafen)|flughafen\s+dusseldorf/.test(v))return'DUS';
  if(/\bcgn\b/.test(raw.toUpperCase())&&/(airport|flughafen|terminal|airport)/i.test(raw))return'CGN';
  if(/koln[\s-]*bonn\s+(airport|flughafen)|cologne[\s-]*bonn\s+airport|flughafen\s+koln[\s-]*bonn/.test(v))return'CGN';
  return'';
}
function airportContextForRide(ride){
  const direction=normalizeDirection(ride);
  const source=upper(ride?.sourcePlanAirportIata);
  const pickup=airportIataFromPlace(ride?.pickup||ride?.abholort);
  const destination=airportIataFromPlace(ride?.destination||ride?.zielort||ride?.ziel);
  let airportIata='';
  if(direction==='arrival')airportIata=pickup||source;
  else if(direction==='departure')airportIata=destination||source;
  else if(pickup&&!destination)airportIata=pickup;
  else if(destination&&!pickup)airportIata=destination;
  if(source&&airportIata&&source!==airportIata)return{airportIata:'',direction:'unknown',sourceConflict:true};
  return{airportIata:airportIata||source,direction:direction||((pickup&&!destination)?'arrival':(!pickup&&destination)?'departure':'unknown'),sourceConflict:false};
}
function airportEventContextForRide(ride){
  try{
    const ctx=window.ATMSAirportEventDateContextForRide?.(ride);
    if(ctx&&ctx.airportEventDate)return{
      airportEventDate:text(ctx.airportEventDate),
      airportEventDateDerived:Boolean(ctx.derived)
    };
  }catch(_){}
  return{airportEventDate:text(ride?.date),airportEventDateDerived:false};
}
function isRealFlightNumber(value){
  const v=upper(value);
  if(!v||/^(VAN|PKW|BUS|SPRINTER|TAXI|WG)$/.test(v))return false;
  const match=v.match(/^([A-Z0-9]{2,3})(\d{1,4})([A-Z]?)$/);
  return Boolean(match && /[A-Z]/.test(match[1]));
}
function safeHost(uri){
  try{return new URL(uri).hostname.replace(/^www\./,'')}catch(_){return''}
}
function sourceHostKey(uri){
  const host=safeHost(uri).toLocaleLowerCase('de-DE');
  if(host.endsWith('flightradar24.com'))return'flightradar24.com';
  if(host.endsWith('flightstats.com'))return'flightstats.com';
  return host;
}
function parseJsonObject(raw){
  const source=text(raw);
  if(!source)return{};
  const attempts=[source,source.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/i,'').trim()];
  const first=source.indexOf('{'),last=source.lastIndexOf('}');
  if(first>=0&&last>first)attempts.push(source.slice(first,last+1));
  for(const candidate of attempts){
    try{
      const parsed=JSON.parse(candidate);
      if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed))return parsed;
    }catch(_){}
  }
  return{};
}
function comparable(value){
  return text(value).toLocaleLowerCase('de-DE').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
}
function sameText(a,b){return comparable(a)===comparable(b)}
function booleanValue(value){
  if(value===true||value===false)return value;
  const v=text(value).toLowerCase();
  if(['true','1','yes','ja','y'].includes(v))return true;
  if(['false','0','no','nein','n',''].includes(v))return false;
  return false;
}
function sourceIdentity(source){
  const uri=text(source?.url||source?.uri);
  const title=text(source?.name||source?.title);
  const host=safeHost(uri).toLocaleLowerCase('de-DE');
  // Google may return a redirect URI for grounded sources. In that case the
  // publisher title is the better independence key than the redirect host.
  if(host&&!/(?:^|\.)(?:google\.com|googleapis\.com|cloud\.google\.com|vertexaisearch\.cloud\.google\.com)$/.test(host))return`host:${host}`;
  const titleKey=comparable(title);
  return titleKey?`title:${titleKey}`:(uri?`uri:${uri}`:'');
}
function mergeSources(...groups){
  const out=[],seen=new Set();
  for(const group of groups){
    for(const source of Array.isArray(group)?group:[]){
      const key=sourceIdentity(source);
      if(!key||seen.has(key))continue;
      seen.add(key);out.push(source);
    }
  }
  return out.slice(0,12);
}
function flightNumberParts(flightNumber){
  const match=upper(flightNumber).match(/^([A-Z0-9]{2,3})(\d{1,4})([A-Z]?)$/);
  if(!match)return null;
  return{carrier:match[1],number:`${match[2]}${match[3]||''}`};
}
function explicitSourceUrls(item){
  const parts=flightNumberParts(item?.flightNumber);
  const date=text(item?.airportEventDate||item?.date);
  const dm=date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!parts||!dm)return[];
  const [,year,month,day]=dm;
  const fr24=`https://www.flightradar24.com/data/flights/${upper(item.flightNumber).toLowerCase()}`;
  const flightStats=`https://www.flightstats.com/v2/flight-tracker/${encodeURIComponent(parts.carrier)}/${encodeURIComponent(parts.number)}?year=${year}&month=${month}&date=${day}`;
  return[
    {name:'Flightradar24',url:fr24,kind:'explicit'},
    {name:'FlightStats',url:flightStats,kind:'explicit'}
  ];
}
function extractUrlContext(response,expectedSources=[]){
  const metadata=response?.candidates?.[0]?.urlContextMetadata||response?.candidates?.[0]?.url_context_metadata||null;
  const records=Array.isArray(metadata?.urlMetadata)?metadata.urlMetadata:
    Array.isArray(metadata?.url_metadata)?metadata.url_metadata:[];
  const successful=[];
  for(const record of records){
    const url=text(record?.retrievedUrl||record?.retrieved_url);
    const status=upper(record?.urlRetrievalStatus||record?.url_retrieval_status);
    if(!url||!status.includes('SUCCESS'))continue;
    const expected=(expectedSources||[]).find(source=>{
      try{return sourceHostKey(source.url)===sourceHostKey(url)}catch(_){return false}
    });
    successful.push({
      name:expected?.name||safeHost(url)||'URL-Quelle',
      url,
      kind:'url_context'
    });
  }
  return{
    sources:mergeSources(successful),
    urlMetadata:records.map(record=>({
      url:text(record?.retrievedUrl||record?.retrieved_url),
      status:text(record?.urlRetrievalStatus||record?.url_retrieval_status)
    }))
  };
}
function extractGrounding(response,expectedSources=[]){
  const metadata=response?.candidates?.[0]?.groundingMetadata||null;
  const chunks=Array.isArray(metadata?.groundingChunks)?metadata.groundingChunks:[];
  const searchSources=[];
  for(const chunk of chunks){
    const web=chunk?.web;
    const uri=text(web?.uri);
    const title=text(web?.title)||safeHost(uri);
    if(!uri||!title)continue;
    searchSources.push({name:title,url:uri,kind:'google_search'});
  }
  const urlContext=extractUrlContext(response,expectedSources);
  return{
    renderedContent:text(metadata?.searchEntryPoint?.renderedContent),
    renderedContents:text(metadata?.searchEntryPoint?.renderedContent)?[text(metadata.searchEntryPoint.renderedContent)]:[],
    sources:mergeSources(urlContext.sources,searchSources),
    explicitSources:urlContext.sources,
    urlMetadata:urlContext.urlMetadata,
    webSearchQueries:Array.isArray(metadata?.webSearchQueries)?metadata.webSearchQueries.map(text).filter(Boolean):[]
  };
}
function currentLocationForFlight(item){return text(item?.currentLocation||item?.locationFromPlan)}
function uniqueFlights(rides){
  const map=new Map();
  for(const ride of Array.isArray(rides)?rides:[]){
    const flightNumber=upper(ride?.flightNumber||ride?.arrivalFlight||ride?.departureFlight);
    if(!isRealFlightNumber(flightNumber))continue;
    const airport=airportContextForRide(ride);
    const direction=airport.direction;
    const date=text(ride?.date);
    const event=airportEventContextForRide(ride);
    const airportEventDate=event.airportEventDate||date;
    const flightTime=text(ride?.flightTime);
    const airportIata=upper(airport.airportIata);
    const k=`${flightNumber}|${date}|${airportEventDate}|${airportIata}|${direction}|${flightTime}`;
    if(!map.has(k))map.set(k,{
      flightNumber,
      date,
      airportEventDate,
      airportEventDateDerived:Boolean(event.airportEventDateDerived),
      dateAssumed:false,
      flightTime,
      direction,
      airportIata:airportIata||null,
      relevantSide:relevantSide(direction),
      locationFromPlan:text(ride?.flightLocation),
      sourceRows:[]
    });
    const row=Number(ride?.sourceRow||0);
    if(row&&!map.get(k).sourceRows.includes(row))map.get(k).sourceRows.push(row);
  }
  return[...map.values()];
}

async function ensureReady(){
  if(initPromise)return initPromise;
  initPromise=(async()=>{
    if(location.protocol!=='https:'||location.hostname!=='yaso868.github.io'){
      throw new Error('Automatische Flugprüfung ist nur in der veröffentlichten ATMS-PRO-Web-App verfügbar.');
    }
    const app=getApps().length?getApp():initializeApp(firebaseConfig);
    if(!window.__ATMSFirebaseAppCheckInitialized){
      initializeAppCheck(app,{
        provider:new ReCaptchaEnterpriseProvider(RECAPTCHA_ENTERPRISE_SITE_KEY),
        isTokenAutoRefreshEnabled:true
      });
      window.__ATMSFirebaseAppCheckInitialized=true;
    }
    const ai=getAI(app,{backend:new GoogleAIBackend()});
    const options={tools:[{urlContext:{}},{googleSearch:{}}]};
    primaryModel=getGenerativeModel(ai,{model:PRIMARY_MODEL,...options});
    fallbackModel=getGenerativeModel(ai,{model:FALLBACK_MODEL,...options});
    return true;
  })();
  return initPromise;
}

function buildPrompt(item,options={}){
  const explicitSources=explicitSourceUrls(item);
  const payload={
    flightNumber:item.flightNumber,
    date:item.date,
    airportEventDate:item.airportEventDate,
    airportEventDateDerived:Boolean(item.airportEventDateDerived),
    direction:item.direction,
    airportIata:item.airportIata,
    flightTime:item.flightTime||null,
    relevantSide:item.relevantSide,
    locationFromPlan:item.locationFromPlan||null,
    sourceA:explicitSources[0]?.url||null,
    sourceB:explicitSources[1]?.url||null
  };
  return `ATMS PRO – FLIGHT-008 strikte aktuelle Flugprüfung.\n\n`+
`Prüfe GENAU EINEN konkreten Flug anhand der BEIDEN unten angegebenen öffentlichen URLs mit URL Context. Google Search darf nur ergänzen, ersetzt die beiden expliziten Quellen aber nicht.\n\n`+
`VERBINDLICHE REGELN:\n`+
`1. Rufe sourceA UND sourceB tatsächlich über URL Context ab. Ohne erfolgreich abgerufene Inhalte beider URLs: status="needs_manual_check".\n`+
`2. Werte sourceA und sourceB GETRENNT aus. Beide müssen die konkrete Flugnummer am airportEventDate und dieselben Origin-/Destination-IATA-Codes bestätigen.\n`+
`3. airportIata ist der für diese Fahrt relevante Flughafen und muss EXAKT zur Richtung passen.\n`+
`4. direction=arrival: airportIata muss destinationIata sein; relevantLocation ist der HERKUNFTSORT.\n`+
`5. direction=departure: airportIata muss originIata sein; relevantLocation ist der ZIELORT.\n`+
`6. flightTime ist nur ein Unterscheidungsmerkmal. Wenn mehrere Flüge am Datum nicht eindeutig trennbar sind: needs_manual_check.\n`+
`7. locationFromPlan ist nur Vergleichswert, niemals Quelle. Bei sicherem Widerspruch conflict=true.\n`+
`8. Erfinde keine Städte, IATA-Codes, Quellen oder Zeiten.\n`+
`9. sourceAConfirmed=true nur wenn sourceA die konkrete Route datumsspezifisch bestätigt. sourceBConfirmed entsprechend für sourceB.\n`+
`10. status="candidate" nur wenn sourceAConfirmed=true UND sourceBConfirmed=true UND beide dieselbe Route bestätigen. Sonst needs_manual_check.\n`+
`11. Antworte ausschließlich mit genau einem JSON-Objekt ohne Markdown. Felder: originCity, originIata, destinationCity, destinationIata, relevantLocation, relevantIata, status, confidence, conflict, sourceAConfirmed, sourceBConfirmed, sourceNote.\n`+
`confidence: high|medium|low.\n\n`+
`Prüfdaten:\n${JSON.stringify(payload,null,2)}`;
}
function parseRouteCandidate(item,generated){
  const response=generated.result?.response;
  const expectedSources=explicitSourceUrls(item);
  const grounding=extractGrounding(response,expectedSources);
  const parsed=parseJsonObject(response?.text?.()||'');
  const originCity=text(parsed?.originCity),originIata=upper(parsed?.originIata);
  const destinationCity=text(parsed?.destinationCity),destinationIata=upper(parsed?.destinationIata);
  const relevantIata=item.direction==='arrival'?originIata:destinationIata;
  const modelRelevantLocation=text(parsed?.relevantLocation),modelRelevantIata=upper(parsed?.relevantIata);
  const relevantLocation=(item.direction==='arrival'?originCity:destinationCity)||modelRelevantLocation;
  const semanticMismatch=Boolean(modelRelevantIata&&relevantIata&&modelRelevantIata!==relevantIata);
  const routeComplete=Boolean(/^[A-Z]{3}$/.test(originIata)&&/^[A-Z]{3}$/.test(destinationIata));
  const airportAnchored=Boolean(item.direction==='arrival'
    ? destinationIata===upper(item.airportIata)
    : item.direction==='departure'
      ? originIata===upper(item.airportIata)
      : false);
  const conflict=booleanValue(parsed?.conflict)||semanticMismatch||(routeComplete&&!airportAnchored);
  const sourceAConfirmed=booleanValue(parsed?.sourceAConfirmed);
  const sourceBConfirmed=booleanValue(parsed?.sourceBConfirmed);
  const explicitHosts=new Set((grounding.explicitSources||[]).map(source=>sourceHostKey(source.url)).filter(Boolean));
  const expectedHosts=expectedSources.map(source=>sourceHostKey(source.url)).filter(Boolean);
  const bothUrlsRetrieved=expectedHosts.length===2&&expectedHosts.every(host=>explicitHosts.has(host));
  const explicitConfirmed=bothUrlsRetrieved&&sourceAConfirmed&&sourceBConfirmed;
  const candidate=routeComplete&&airportAnchored&&Boolean(relevantLocation)&&Boolean(relevantIata)&&!conflict&&explicitConfirmed&&text(parsed?.status).toLowerCase()!=='needs_manual_check';
  return{
    candidate,parsed,grounding,conflict,originCity,originIata,destinationCity,destinationIata,relevantLocation,relevantIata,
    sourceAConfirmed,sourceBConfirmed,bothUrlsRetrieved,
    modelUsed:generated.modelUsed,fallbackUsed:Boolean(generated.fallbackUsed)
  };
}
function sameRoute(a,b){
  // F5F3: Two independent checks confirm the same route when the canonical
  // airport endpoints match. City labels are presentation text and may differ
  // by language or publisher wording.
  return Boolean(a?.candidate&&b?.candidate&&a.originIata===b.originIata&&a.destinationIata===b.destinationIata);
}
function independentSources(first,second){
  const firstKeys=new Set((first||[]).map(sourceIdentity).filter(Boolean));
  return (second||[]).some(source=>{const key=sourceIdentity(source);return Boolean(key&&!firstKeys.has(key));});
}
function checkedManual(item,note,grounding=null){
  return{
    flightNumber:item.flightNumber,date:item.date,airportEventDate:item.airportEventDate||item.date,
    airportEventDateDerived:Boolean(item.airportEventDateDerived),dateAssumed:false,flightTime:item.flightTime||'',
    direction:item.direction||'unknown',airportIata:item.airportIata||null,
    flightLocation:item.locationFromPlan||'',relevantLocation:item.locationFromPlan||'',
    iata:'',confidence:'uncertain',status:'needs_manual_check',conflict:false,
    sources:grounding?.sources||[],sourceCount:grounding?.sources?.length||0,sourceNote:note,
    geminiReportedCheckedAt:new Date().toISOString(),verificationDowngraded:false
  };
}

function isModelAvailabilityError(error){
  const msg=`${text(error?.code)} ${text(error?.message)}`.toLowerCase();
  return /model|not.?found|not.?available|unsupported|deprecated|retired|404|410/.test(msg);
}

async function generateWithFallback(prompt){
  try{
    return{result:await primaryModel.generateContent(prompt),modelUsed:PRIMARY_MODEL,fallbackUsed:false};
  }catch(primaryError){
    if(!isModelAvailabilityError(primaryError)||!fallbackModel)throw primaryError;
    try{
      return{result:await fallbackModel.generateContent(prompt),modelUsed:FALLBACK_MODEL,fallbackUsed:true};
    }catch(fallbackError){
      fallbackError.cause=primaryError;
      throw fallbackError;
    }
  }
}

async function verifyOne(item){
  if(!item.date||!item.airportEventDate||!item.airportIata||!['arrival','departure'].includes(item.direction)){
    const g={renderedContent:'',renderedContents:[],sources:[],explicitSources:[],urlMetadata:[],webSearchQueries:[]};
    return{checked:checkedManual(item,'Datum, Flughafen oder Flugrichtung ist nicht eindeutig – keine automatische Webprüfung.',g),grounding:g};
  }

  const generated=await generateWithFallback(buildPrompt(item));
  const parsedResult=parseRouteCandidate(item,generated);
  const verified=Boolean(parsedResult.candidate);
  const conflict=Boolean(parsedResult.conflict);
  const webCheckedAt=new Date().toISOString();
  const relevantLocation=verified?parsedResult.relevantLocation:'';
  const relevantIata=verified?parsedResult.relevantIata:'';
  const explicitCount=(parsedResult.grounding.explicitSources||[]).length;
  const noteBase=verified
    ? 'Flightradar24 und FlightStats bestätigen datumsspezifisch dieselbe konkrete Route.'
    : conflict
      ? 'Die beiden expliziten Webquellen widersprechen sich – keine automatische Übernahme.'
      : explicitCount<2
        ? `Explizite URL-Prüfung unvollständig (${explicitCount}/2 Quellen erfolgreich abgerufen) – FLIGHT-008 bleibt offen.`
        : 'Beide URLs wurden abgerufen, aber die Route wurde nicht von beiden datumsspezifisch bestätigt – FLIGHT-008 bleibt offen.';
  const modelNote=text(parsedResult.parsed?.sourceNote);
  const modelName=generated.fallbackUsed?`${generated.modelUsed} (Fallback)`:generated.modelUsed;
  const note=`${noteBase}${modelNote?` · ${modelNote}`:''} · Explizite Quellen: ${explicitCount}/2 · Modell: ${modelName}`;
  const grounding={
    ...parsedResult.grounding,
    flightNumber:item.flightNumber,date:item.date,airportEventDate:item.airportEventDate,
    airportIata:item.airportIata,direction:item.direction,verificationPasses:1
  };
  return{
    checked:{
      flightNumber:item.flightNumber,date:item.date,airportEventDate:item.airportEventDate,
      airportEventDateDerived:Boolean(item.airportEventDateDerived),dateAssumed:false,flightTime:item.flightTime||'',
      direction:item.direction,airportIata:item.airportIata||null,
      flightLocation:verified?relevantLocation:(item.locationFromPlan||parsedResult.relevantLocation||''),
      relevantLocation:verified?relevantLocation:(item.locationFromPlan||parsedResult.relevantLocation||''),
      iata:verified&&/^[A-Z]{3}$/.test(relevantIata)?relevantIata:'',
      confidence:verified?'verified':'uncertain',status:verified?'verified':'needs_manual_check',conflict,
      sources:parsedResult.grounding.sources,sourceCount:parsedResult.grounding.sources.length,sourceNote:note,
      geminiReportedCheckedAt:webCheckedAt,verificationDowngraded:Boolean(!verified),
      modelUsed:modelName,verificationPasses:1,
      explicitSourceCount:explicitCount,
      sourceAConfirmed:Boolean(parsedResult.sourceAConfirmed),
      sourceBConfirmed:Boolean(parsedResult.sourceBConfirmed)
    },
    grounding
  };
}
async function verifyFlights(rides,options={}){
  await ensureReady();
  const flights=uniqueFlights(rides);
  if(!flights.length)throw new Error('Keine gültigen Flugnummern in der aktuellen Planliste gefunden.');
  const checked=[],grounding=[];
  for(let i=0;i<flights.length;i++){
    const item=flights[i];
    options?.onProgress?.({current:i+1,total:flights.length,flightNumber:item.flightNumber});
    try{
      const one=await verifyOne(item);
      checked.push(one.checked);grounding.push(one.grounding);
    }catch(error){
      const errorMessage=text(error?.message)||'unbekannter Fehler',errorCode=text(error?.code);
      const g={renderedContent:'',sources:[],webSearchQueries:[],flightNumber:item.flightNumber,date:item.date,airportEventDate:item.airportEventDate,airportIata:item.airportIata,direction:item.direction};
      const manual=checkedManual(item,`Webprüfung technisch fehlgeschlagen: ${errorCode?`${errorCode} · `:''}${errorMessage}`,g);
      manual.technicalFailure=true;manual.technicalErrorCode=errorCode;manual.technicalErrorMessage=errorMessage;
      checked.push(manual);grounding.push(g);
    }
  }
  const failures=checked.filter(item=>item?.technicalFailure);
  return{
    version:VERSION,model:PRIMARY_MODEL,fallbackModel:FALLBACK_MODEL,checked,grounding,
    technicalFailureCount:failures.length,firstTechnicalError:failures[0]?.technicalErrorMessage||'',
    completedAt:new Date().toISOString()
  };
}

function escapeHtml(value){
  return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
function renderGrounding(records){
  const panel=document.getElementById('aiGroundingPanel');
  if(!panel)return;
  const list=Array.isArray(records)?records:[];
  const withData=list.filter(r=>r?.renderedContent||(Array.isArray(r?.sources)&&r.sources.length));
  if(!withData.length){
    panel.style.display='';
    panel.innerHTML='<div style="font-size:12px;opacity:.8">Keine erfolgreich abrufbaren Webquellen erhalten. Deshalb wurde kein solcher Treffer automatisch als sicher übernommen.</div>';
    return;
  }
  panel.style.display='';
  panel.innerHTML='<div style="font-size:12px;font-weight:800;margin-bottom:6px">Aktuelle Flugquellen · URL Context / Google Search</div>'+
    withData.map(record=>{
      const sources=Array.isArray(record.sources)?record.sources:[];
      const links=sources.map(source=>`<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin:3px 7px 3px 0">${escapeHtml(source.name)}</a>`).join('');
      const suggestionBlocks=(Array.isArray(record.renderedContents)&&record.renderedContents.length?record.renderedContents:[record.renderedContent]).filter(Boolean);
      const suggestions=suggestionBlocks.map(content=>`<div class="atms-google-search-suggestions">${content}</div>`).join('');
      return `<div style="padding:8px 0;border-top:1px solid rgba(255,255,255,.10)"><b style="font-size:12px">${escapeHtml(record.flightNumber||'Flug')}</b>${suggestions}<div style="font-size:11px;line-height:1.35">${links||'Keine Quellen'}</div></div>`;
    }).join('');
}

window.ATMSAutoFlight={
  version:VERSION,model:PRIMARY_MODEL,fallbackModel:FALLBACK_MODEL,verifyFlights,renderGrounding,ready:ensureReady
};
window.dispatchEvent(new CustomEvent('atms:firebase-ai-module-ready',{detail:{version:VERSION,model:PRIMARY_MODEL,fallbackModel:FALLBACK_MODEL}}));
