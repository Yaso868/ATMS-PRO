// ATMS PRO · CORE-007D8A1F1D8P31F5F4 · AUTO-FLIGHT RESPONSE NORMALIZATION FIX
// 05.09.2026 (Europe/Berlin)
// Firebase AI Logic + App Check + Gemini Developer API + Google Search grounding.
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

const VERSION='CORE-007D8A1F1D8P31F5F4';
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
function extractGrounding(response){
  const metadata=response?.candidates?.[0]?.groundingMetadata||null;
  const chunks=Array.isArray(metadata?.groundingChunks)?metadata.groundingChunks:[];
  const sources=[];
  for(const chunk of chunks){
    const web=chunk?.web;
    const uri=text(web?.uri);
    const title=text(web?.title)||safeHost(uri);
    if(!uri||!title)continue;
    sources.push({name:title,url:uri});
  }
  return{
    renderedContent:text(metadata?.searchEntryPoint?.renderedContent),
    renderedContents:text(metadata?.searchEntryPoint?.renderedContent)?[text(metadata.searchEntryPoint.renderedContent)]:[],
    sources:mergeSources(sources),
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
    const options={tools:[{googleSearch:{}}]};
    primaryModel=getGenerativeModel(ai,{model:PRIMARY_MODEL,...options});
    fallbackModel=getGenerativeModel(ai,{model:FALLBACK_MODEL,...options});
    return true;
  })();
  return initPromise;
}

function buildPrompt(item,options={}){
  const payload={
    flightNumber:item.flightNumber,
    date:item.date,
    airportEventDate:item.airportEventDate,
    airportEventDateDerived:Boolean(item.airportEventDateDerived),
    direction:item.direction,
    airportIata:item.airportIata,
    flightTime:item.flightTime||null,
    relevantSide:item.relevantSide,
    locationFromPlan:item.locationFromPlan||null
  };
  const phase=text(options?.phase)||'discovery';
  const priorCandidate=options?.priorCandidate||null;
  const excludedSources=Array.isArray(options?.excludedSources)?options.excludedSources.map(text).filter(Boolean):[];
  const secondPass=phase==='confirmation';
  return `ATMS PRO – FLIGHT-008 strikte aktuelle Flugprüfung.\n\n`+
`Prüfe GENAU EINEN konkreten Flug mit Google Search anhand aktueller, DATUMSSPEZIFISCHER öffentlicher Webdaten. Verwende keine gespeicherte oder typische Flugnummer→Route-Zuordnung.\n\n`+
(secondPass
  ? `DIES IST DIE UNABHÄNGIGE ZWEITPRÜFUNG. Suche eine vom ersten Treffer unabhängige Bestätigung. Verwende nach Möglichkeit Airport oder Airline; sonst einen seriösen unabhängigen Flugtracker. Verlasse dich NICHT auf bereits verwendete Quellen/Publisher: ${excludedSources.length?excludedSources.join(' | '):'keine angegeben'}.\nVorläufiger Kandidat aus Prüfung 1 (nur zum Gegenprüfen, nicht als Quelle): ${JSON.stringify(priorCandidate)}\n\n`
  : `DIES IST PRÜFUNG 1. Ermittle die konkrete Route. Schon EINE datumsspezifische Quelle darf einen Kandidaten liefern; ATMS führt bei weniger als zwei unabhängigen Quellen automatisch eine zweite, unabhängige Prüfung durch.\n\n`)+
`VERBINDLICHE REGELN:\n`+
`1. Nutze Google Search. Ohne aktuelle Suchgrundlage darf kein Routenkandidat ausgegeben werden.\n`+
`2. airportIata ist der für diese Fahrt relevante Flughafen und muss EXAKT verwendet werden.\n`+
`3. direction=arrival: relevantLocation ist der HERKUNFTSORT des konkreten Fluges NACH airportIata.\n`+
`4. direction=departure: relevantLocation ist der ZIELORT des konkreten Fluges AB airportIata.\n`+
`5. Für die Webprüfung ist airportEventDate EXAKT maßgeblich. date bleibt unverändert das ATMS-Fahrtdatum.\n`+
`6. flightTime ist nur ein Unterscheidungsmerkmal. Wenn mehrere passende Flüge existieren und keine eindeutige Zuordnung möglich ist: needs_manual_check.\n`+
`7. locationFromPlan ist ausschließlich Vergleichswert, niemals Quelle. Bei sicherem Widerspruch conflict=true.\n`+
`8. Erfinde keine Städte, IATA-Codes, Quellen oder Zeiten.\n`+
`9. Antworte ausschließlich mit genau einem JSON-Objekt ohne Markdown. Felder: originCity, originIata, destinationCity, destinationIata, relevantLocation, relevantIata, status, confidence, conflict, sourceNote.\n`+
`status: candidate|needs_manual_check; confidence: high|medium|low.\n\n`+
`Prüfdaten:\n${JSON.stringify(payload,null,2)}`;
}
function parseRouteCandidate(item,generated){
  const response=generated.result?.response;
  const grounding=extractGrounding(response);
  const parsed=parseJsonObject(response?.text?.()||'');
  const originCity=text(parsed?.originCity),originIata=upper(parsed?.originIata);
  const destinationCity=text(parsed?.destinationCity),destinationIata=upper(parsed?.destinationIata);
  const relevantIata=item.direction==='arrival'?originIata:destinationIata;
  const modelRelevantLocation=text(parsed?.relevantLocation),modelRelevantIata=upper(parsed?.relevantIata);
  // F5F4: Gemini/Firebase may legitimately return a route with canonical IATA
  // endpoints even when one localized city label is omitted. The IATA pair is
  // the route identity; relevantLocation is presentation text and may fall back
  // to the explicit relevantLocation field from the grounded response.
  const relevantLocation=(item.direction==='arrival'?originCity:destinationCity)||modelRelevantLocation;
  const semanticMismatch=Boolean(modelRelevantIata&&relevantIata&&modelRelevantIata!==relevantIata);
  const routeComplete=Boolean(/^[A-Z]{3}$/.test(originIata)&&/^[A-Z]{3}$/.test(destinationIata));
  const airportAnchored=Boolean(item.direction==='arrival'
    ? destinationIata===upper(item.airportIata)
    : item.direction==='departure'
      ? originIata===upper(item.airportIata)
      : false);
  const conflict=booleanValue(parsed?.conflict)||semanticMismatch||(routeComplete&&!airportAnchored);
  const hasGrounding=grounding.sources.length>0||grounding.webSearchQueries.length>0;
  const candidate=routeComplete&&airportAnchored&&Boolean(relevantLocation)&&Boolean(relevantIata)&&!conflict&&hasGrounding&&text(parsed?.status).toLowerCase()!=='needs_manual_check';
  return{
    candidate,parsed,grounding,conflict,originCity,originIata,destinationCity,destinationIata,relevantLocation,relevantIata,
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
    const g={renderedContent:'',renderedContents:[],sources:[],webSearchQueries:[]};
    return{checked:checkedManual(item,'Datum, Flughafen oder Flugrichtung ist nicht eindeutig – keine automatische Webprüfung.',g),grounding:g};
  }

  const firstGenerated=await generateWithFallback(buildPrompt(item,{phase:'discovery'}));
  const first=parseRouteCandidate(item,firstGenerated);
  let second=null;
  let sources=first.grounding.sources;
  let renderedContents=[...(first.grounding.renderedContents||[])];
  let queries=[...(first.grounding.webSearchQueries||[])];

  // FLIGHT-008 bleibt strikt: zwei voneinander unabhängige, datumsspezifische
  // Webquellen sind Pflicht. Liefert Google Search im ersten Lauf nur eine
  // Quelle, fordert ATMS automatisch eine zweite, unabhängige Bestätigung an.
  if(first.candidate&&sources.length<2){
    const excludedSources=sources.map(source=>text(source.name)||safeHost(source.url)).filter(Boolean);
    const priorCandidate={originCity:first.originCity,originIata:first.originIata,destinationCity:first.destinationCity,destinationIata:first.destinationIata};
    const secondGenerated=await generateWithFallback(buildPrompt(item,{phase:'confirmation',priorCandidate,excludedSources}));
    second=parseRouteCandidate(item,secondGenerated);
    sources=mergeSources(first.grounding.sources,second.grounding.sources);
    renderedContents.push(...(second.grounding.renderedContents||[]));
    queries.push(...(second.grounding.webSearchQueries||[]));
  }

  const twoSourcesInFirst=first.candidate&&first.grounding.sources.length>=2;
  const twoPassConfirmed=Boolean(first.candidate&&second&&sameRoute(first,second)&&independentSources(first.grounding.sources,second.grounding.sources));
  const verified=Boolean(twoSourcesInFirst||twoPassConfirmed);
  const conflict=Boolean(first.conflict||(second&&second.conflict)||(second&&second.candidate&&!sameRoute(first,second)));
  const webCheckedAt=new Date().toISOString();
  const resultCandidate=verified?first:null;
  const relevantLocation=resultCandidate?.relevantLocation||'';
  const relevantIata=resultCandidate?.relevantIata||'';
  const firstNote=text(first.parsed?.sourceNote);
  const secondNote=text(second?.parsed?.sourceNote);
  const modelNames=[first.modelUsed,second?.modelUsed].filter(Boolean).join(' + ');
  const noteBase=verified
    ? (twoPassConfirmed?'Zwei unabhängige Webprüfungen bestätigen dieselbe konkrete Route.':'Mindestens zwei unabhängige Webquellen bestätigen dieselbe konkrete Route.')
    : (conflict?'Unabhängige Webprüfung widerspricht sich – keine automatische Übernahme.':first.candidate?'Nur eine unabhängig bestätigte Webquelle verfügbar – FLIGHT-008 bleibt offen.':'Aktuelle Webprüfung nicht eindeutig genug.');
  const detail=[firstNote,secondNote].filter(Boolean).join(' | ');
  const note=`${noteBase}${detail?` · ${detail}`:''} · Unabhängige Quellen: ${sources.length}.${modelNames?` · Modell: ${modelNames}`:''}`;
  const grounding={
    renderedContent:renderedContents[0]||'',renderedContents,
    sources,webSearchQueries:[...new Set(queries)],flightNumber:item.flightNumber,date:item.date,
    airportEventDate:item.airportEventDate,airportIata:item.airportIata,direction:item.direction,
    verificationPasses:second?2:1
  };
  return{
    checked:{
      flightNumber:item.flightNumber,date:item.date,airportEventDate:item.airportEventDate,
      airportEventDateDerived:Boolean(item.airportEventDateDerived),dateAssumed:false,flightTime:item.flightTime||'',
      direction:item.direction,airportIata:item.airportIata||null,
      flightLocation:verified?relevantLocation:(item.locationFromPlan||first.relevantLocation||''),
      relevantLocation:verified?relevantLocation:(item.locationFromPlan||first.relevantLocation||''),
      iata:verified&&/^[A-Z]{3}$/.test(relevantIata)?relevantIata:'',
      confidence:verified?'verified':'uncertain',status:verified?'verified':'needs_manual_check',conflict,
      sources,sourceCount:sources.length,sourceNote:note,geminiReportedCheckedAt:webCheckedAt,
      verificationDowngraded:Boolean(first.candidate&&!verified),modelUsed:modelNames,verificationPasses:second?2:1
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
    panel.innerHTML='<div style="font-size:12px;opacity:.8">Keine Google-Search-Quellen erhalten. Deshalb wurde kein solcher Treffer automatisch als sicher übernommen.</div>';
    return;
  }
  panel.style.display='';
  panel.innerHTML='<div style="font-size:12px;font-weight:800;margin-bottom:6px">Google Search · aktuelle Flugquellen</div>'+
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
