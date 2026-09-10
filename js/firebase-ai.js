// ATMS PRO · CORE-006P · FLIGHT-013 MULTI-AIRPORT
// 05.09.2026 (Europe/Berlin)
// Firebase AI Logic + App Check + Gemini Developer API + Google Search grounding.
// Datenschutz: niemals vollständige Planliste/Bild; nur Flugnummer, Datum, Richtung,
// ggf. Flugzeit und vorhandener Flugort als Vergleichswert.
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

const VERSION='CORE-006P-FLIGHT-013';
const PRIMARY_MODEL='gemini-3.7-flash';
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
  const raw=text(value);if(!raw)return'';
  const normalized=raw.toLocaleLowerCase('de-DE').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ');
  const up=raw.toUpperCase();
  if(normalized.includes('flughafen dusseldorf')||normalized.includes('dusseldorf airport'))return'DUS';
  if(normalized.includes('flughafen koln')||normalized.includes('cologne bonn airport')||normalized.includes('koln/bonn'))return'CGN';
  const exact=up.match(/^([A-Z]{3})$/);if(exact)return exact[1];
  if(/\b(?:AIRPORT|FLUGHAFEN|VORFELD|AIRSIDE)\b/i.test(raw)){
    const tokens=up.match(/\b[A-Z]{3}\b/g)||[];if(tokens.length===1)return tokens[0];
  }
  return'';
}
function flightAirportContext(ride){
  const p=airportIataFromPlace(ride?.pickup||ride?.abholort||'');
  const d=airportIataFromPlace(ride?.destination||ride?.zielort||ride?.ziel||'');
  if(p&&!d)return{airportIata:p,direction:'arrival'};
  if(!p&&d)return{airportIata:d,direction:'departure'};
  return{airportIata:'',direction:'unknown'};
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
function extractGrounding(response){
  const metadata=response?.candidates?.[0]?.groundingMetadata||null;
  const chunks=Array.isArray(metadata?.groundingChunks)?metadata.groundingChunks:[];
  const sourceMap=new Map();
  for(const chunk of chunks){
    const web=chunk?.web;
    const uri=text(web?.uri);
    const title=text(web?.title)||safeHost(uri);
    if(!uri||!title)continue;
    const identity=(safeHost(uri)||title).toLocaleLowerCase('de-DE');
    if(!sourceMap.has(identity))sourceMap.set(identity,{name:title,url:uri});
  }
  return{
    renderedContent:text(metadata?.searchEntryPoint?.renderedContent),
    sources:[...sourceMap.values()].slice(0,8),
    webSearchQueries:Array.isArray(metadata?.webSearchQueries)?metadata.webSearchQueries.map(text).filter(Boolean):[]
  };
}
function currentLocationForFlight(item){return text(item?.currentLocation||item?.locationFromPlan)}
function uniqueFlights(rides){
  if(window.ATMSFlight&&typeof window.ATMSFlight.uniqueFlights==='function'){
    return window.ATMSFlight.uniqueFlights(rides).map(item=>({
      flightNumber:upper(item.flightNumber),
      date:text(item.date),
      flightTime:text(item.flightTime),
      direction:text(item.direction),
      airportIata:upper(item.airportIata),
      relevantSide:text(item.relevantSide)||relevantSide(text(item.direction)),
      locationFromPlan:currentLocationForFlight(item),
      sourceRows:Array.isArray(item.sourceRows)?item.sourceRows.slice():[]
    })).filter(item=>isRealFlightNumber(item.flightNumber));
  }
  const map=new Map();
  for(const ride of Array.isArray(rides)?rides:[]){
    const flightNumber=upper(ride?.flightNumber||ride?.arrivalFlight||ride?.departureFlight);
    if(!isRealFlightNumber(flightNumber))continue;
    const ctx=flightAirportContext(ride);
    const direction=normalizeDirection(ride)||ctx.direction,date=text(ride?.date),flightTime=text(ride?.flightTime);
    const k=`${flightNumber}|${date}|${direction}|${flightTime}`;
    if(!map.has(k))map.set(k,{
      flightNumber,date,flightTime,direction,airportIata:ctx.airportIata,airportConflict:false,
      relevantSide:relevantSide(direction),locationFromPlan:text(ride?.flightLocation),sourceRows:[]
    });
    const item=map.get(k);
    if(ctx.airportIata){
      if(!item.airportIata)item.airportIata=ctx.airportIata;
      else if(item.airportIata!==ctx.airportIata){item.airportIata='';item.airportConflict=true;}
    }
    const row=Number(ride?.sourceRow||0);
    if(row&&!item.sourceRows.includes(row))item.sourceRows.push(row);
    if(!item.locationFromPlan&&text(ride?.flightLocation))item.locationFromPlan=text(ride.flightLocation);
  }
  return[...map.values()];
}

async function ensureReady(){
  if(initPromise)return initPromise;
  initPromise=(async()=>{
    if(location.protocol!=='https:'||location.hostname!=='yaso868.github.io'){
      throw new Error('Automatische Flugprüfung ist nur in der veröffentlichten ATMS-PRO-Web-App verfügbar.');
    }
    const app=initializeApp(firebaseConfig);
    initializeAppCheck(app,{
      provider:new ReCaptchaEnterpriseProvider(RECAPTCHA_ENTERPRISE_SITE_KEY),
      isTokenAutoRefreshEnabled:true
    });
    const ai=getAI(app,{backend:new GoogleAIBackend()});
    const options={tools:[{googleSearch:{}}]};
    primaryModel=getGenerativeModel(ai,{model:PRIMARY_MODEL,...options});
    fallbackModel=getGenerativeModel(ai,{model:FALLBACK_MODEL,...options});
    return true;
  })();
  return initPromise;
}

function buildPrompt(item){
  const payload={
    flightNumber:item.flightNumber,
    date:item.date,
    dateAssumed:false,
    direction:item.direction,
    airportIata:item.airportIata||null,
    flightTime:item.flightTime||null,
    relevantSide:item.relevantSide,
    locationFromPlan:item.locationFromPlan||null
  };
  return `ATMS PRO – FLIGHT-013 MULTI-AIRPORT strikte aktuelle Flugprüfung.\n\n`+
`Prüfe GENAU EINEN konkreten Flug mit Google Search anhand aktueller, DATUMSSPEZIFISCHER öffentlicher Webdaten. Verwende keine gespeicherte oder typische Flugnummer→Route-Zuordnung.\n\n`+
`VERBINDLICHE REGELN:\n`+
`1. Nutze Google Search. Ohne aktuelle Suchgrundlage darf status niemals "verified" sein.\n`+
`2. airportIata ist der für DIESE Fahrt relevante Flughafen. Verwende exakt diesen Flughafen und ersetze ihn niemals pauschal durch DUS.\n`+
`3. direction=arrival: relevantLocation ist der HERKUNFTSORT des konkreten Fluges NACH airportIata.\n`+
`4. direction=departure: relevantLocation ist der ZIELORT des konkreten Fluges AB airportIata.\n`+
`5. Wenn airportIata fehlt/null oder direction=unknown ist: needs_manual_check. Nicht raten.\n`+
`6. date ist der ATMS-Zuordnungstag und muss im ATMS-Ergebnis unverändert bleiben. Bei Nachtflügen über Mitternacht können Quellen denselben konkreten Flug unter einem benachbarten Service-/UTC-/Abflugtag führen. Nutze das nur zur Identifikation, wenn mindestens zwei unabhängige datumsspezifische Quellen Flugnummer, airportIata und Richtung eindeutig demselben Flug zuordnen; sonst needs_manual_check.\n`+
`7. flightTime ist ein zusätzliches Unterscheidungsmerkmal. Wenn mehrere passende Flüge existieren und die Zuordnung ohne flightTime nicht eindeutig ist: needs_manual_check.\n`+
`8. status="verified" und confidence="high" nur, wenn mindestens ZWEI voneinander unabhängige datumsspezifische Webquellen dieselbe konkrete Route bestätigen. Eine einzelne Quelle reicht nie.\n`+
`9. Prüfe zwingend, dass bei arrival destinationIata=airportIata und bei departure originIata=airportIata gilt. Andernfalls conflict=true und needs_manual_check.\n`+
`10. Bei widersprüchlichen Quellen, unklarer Airport-Zuordnung oder fehlender Datumsbestätigung: needs_manual_check. Nicht raten.\n`+
`11. locationFromPlan ist ausschließlich Vergleichswert, niemals Quelle. Bei sicherem Widerspruch conflict=true.\n`+
`12. Erfinde keine Städte, IATA-Codes, Quellen oder URLs.\n`+
`13. Antworte ausschließlich mit genau einem JSON-Objekt ohne Markdown. Felder: originCity, originIata, destinationCity, destinationIata, relevantLocation, relevantIata, status, confidence, conflict, sourceNote.\n`+
`status: verified|needs_manual_check; confidence: high|medium|low.\n\n`+
`Prüfdaten:\n${JSON.stringify(payload,null,2)}`;
}

function checkedManual(item,note,grounding=null){
  return{
    flightNumber:item.flightNumber,date:item.date,dateAssumed:false,flightTime:item.flightTime||'',
    direction:item.direction||'unknown',airportIata:item.airportIata||'',flightLocation:item.locationFromPlan||'',relevantLocation:item.locationFromPlan||'',
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
  if(!item.date||!['arrival','departure'].includes(item.direction)||!/^[A-Z]{3}$/.test(upper(item.airportIata))){
    const g={renderedContent:'',sources:[],webSearchQueries:[]};
    return{checked:checkedManual(item,'Datum, Flugrichtung oder relevanter Flughafen ist nicht eindeutig – keine automatische Webprüfung.',g),grounding:g};
  }
  const generated=await generateWithFallback(buildPrompt(item));
  const response=generated.result?.response;
  const grounding=extractGrounding(response);
  const parsed=parseJsonObject(response?.text?.()||'');
  const originCity=text(parsed?.originCity),originIata=upper(parsed?.originIata);
  const destinationCity=text(parsed?.destinationCity),destinationIata=upper(parsed?.destinationIata);
  const relevantLocation=item.direction==='arrival'?originCity:destinationCity;
  const relevantIata=item.direction==='arrival'?originIata:destinationIata;
  const modelRelevantLocation=text(parsed?.relevantLocation),modelRelevantIata=upper(parsed?.relevantIata);
  const semanticMismatch=Boolean(modelRelevantLocation&&relevantLocation&&!sameText(modelRelevantLocation,relevantLocation))||
    Boolean(modelRelevantIata&&relevantIata&&modelRelevantIata!==relevantIata);
  const airportIata=upper(item.airportIata);
  const airportMismatch=item.direction==='arrival'?destinationIata!==airportIata:originIata!==airportIata;
  const conflict=Boolean(parsed?.conflict)||semanticMismatch||airportMismatch;
  const sourceCount=grounding.sources.length;
  const routeComplete=Boolean(originCity&&destinationCity&&/^[A-Z]{3}$/.test(originIata)&&/^[A-Z]{3}$/.test(destinationIata));
  const claimedVerified=text(parsed?.status).toLowerCase()==='verified'&&text(parsed?.confidence).toLowerCase()==='high'&&routeComplete&&Boolean(relevantLocation)&&!conflict;
  const verified=claimedVerified&&sourceCount>=2;
  const webCheckedAt=new Date().toISOString();
  const parseOk=Object.keys(parsed).length>0;
  const noteBase=text(parsed?.sourceNote)||(verified?'Aktuelle Webprüfung bestätigt.':parseOk?'Aktuelle Webprüfung nicht eindeutig genug.':'Google-Suche erfolgreich, Antwortformat konnte lokal nicht sicher ausgewertet werden.');
  const modelNote=generated.fallbackUsed?` · Modell-Fallback: ${generated.modelUsed}`:` · Modell: ${generated.modelUsed}`;
  const note=`${noteBase} · Google Search: ${sourceCount} unabhängige Quelle(n).${modelNote}`;
  return{
    checked:{
      flightNumber:item.flightNumber,date:item.date,dateAssumed:false,flightTime:item.flightTime||'',direction:item.direction,airportIata,
      flightLocation:verified?relevantLocation:(item.locationFromPlan||relevantLocation||''),
      relevantLocation:verified?relevantLocation:(item.locationFromPlan||relevantLocation||''),
      iata:verified&&/^[A-Z]{3}$/.test(relevantIata)?relevantIata:'',
      confidence:verified?'verified':'uncertain',status:verified?'verified':'needs_manual_check',conflict,
      sources:grounding.sources,sourceCount,sourceNote:note,geminiReportedCheckedAt:webCheckedAt,
      verificationDowngraded:Boolean(claimedVerified&&sourceCount<2),modelUsed:generated.modelUsed
    },
    grounding:{...grounding,flightNumber:item.flightNumber,date:item.date,direction:item.direction,airportIata,modelUsed:generated.modelUsed}
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
      const g={renderedContent:'',sources:[],webSearchQueries:[],flightNumber:item.flightNumber,date:item.date,direction:item.direction,airportIata:item.airportIata||''};
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
      const suggestions=record.renderedContent?`<div class="atms-google-search-suggestions">${record.renderedContent}</div>`:'';
      return `<div style="padding:8px 0;border-top:1px solid rgba(255,255,255,.10)"><b style="font-size:12px">${escapeHtml(record.flightNumber||'Flug')}</b>${suggestions}<div style="font-size:11px;line-height:1.35">${links||'Keine Quellen'}</div></div>`;
    }).join('');
}

window.ATMSAutoFlight={
  version:VERSION,model:PRIMARY_MODEL,fallbackModel:FALLBACK_MODEL,verifyFlights,renderGrounding,ready:ensureReady
};
window.dispatchEvent(new CustomEvent('atms:firebase-ai-module-ready',{detail:{version:VERSION,model:PRIMARY_MODEL,fallbackModel:FALLBACK_MODEL}}));
