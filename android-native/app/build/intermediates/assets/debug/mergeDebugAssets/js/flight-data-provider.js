// CORE-007D8A1F1D8P36 · 22.09.2026: Provider-Ausgaben spiegeln flightTime zurück, damit der neue automatische Planimport gleiche Flugnummern am selben Tag weiterhin streng unterscheiden kann. DUS-/CGN-Endpunkte, Parser und Native-Allowlist bleiben unverändert.
// CORE-007D8A1F1D8P31F11 · 20.09.2026
// NATIVE-APP-BRIDGE – die spätere native Hülle kann ihren freigegebenen Netzwerktransport
// zur Laufzeit registrieren oder als window.ATMSNativeFlightBridge bereitstellen. ATMS erkennt
// die Bridge automatisch, prüft die Contract-Version und kann danach DUS ohne GitHub/Proxy
// über denselben Parser + dieselbe LIVE-Logik wie im Test-Hook verwenden.
// P31F10-Test-Hook bleibt als isolierter Techniktest erhalten.
// Native-ready offizielle Airport-Datenschicht.
// - CGN: direkte PWA-Abfrage per CORS.
// - DUS: offizieller Endpoint + Parser + versionierter Native-Transport-Vertrag.
//   In der Browser-PWA bleibt der Adapter wegen Airport-CORS inaktiv. Eine spätere
//   native App registriert nur den Transport; Parser/LIVE-Logik bleiben identisch.
// Keine GitHub-Datenbrücke und kein Proxy sind Bestandteil dieser Schicht.

const CGN_ENDPOINT='https://www.koeln-bonn-airport.de/fluggaeste/fluege/abflug-ankunft/fsjson';
const DUS_ENDPOINT='https://www.dus.com/api/sitecore/flightapi/SearchFlightsWithOutParams';
const NATIVE_TRANSPORT_CONTRACT_VERSION='ATMS-FLIGHT-NATIVE-1';
const NATIVE_TRANSPORT_TIMEOUT_MS=15000;
const NATIVE_ALLOWED_ENDPOINTS={DUS:{host:'www.dus.com',path:'/api/sitecore/flightapi/SearchFlightsWithOutParams',methods:['GET']}};

const adapters=new Map();
const transports=new Map();
let explicitNativeBridge=null;

function text(value){return String(value??'').trim()}
function upper(value){return text(value).toUpperCase()}
function normalizeFlightNumber(value){return upper(value).replace(/\s+/g,'').replace(/^0S(?=\d)/,'OS')}
function clock(value){
  const raw=text(value);
  const m=raw.match(/(?:^|\D)([01]?\d|2[0-3]):([0-5]\d)(?:\D|$)/);
  return m?`${String(Number(m[1])).padStart(2,'0')}:${m[2]}`:'';
}
function clocks(value){
  const out=[];
  for(const match of text(value).matchAll(/([01]?\d|2[0-3]):([0-5]\d)/g)){
    const v=`${String(Number(match[1])).padStart(2,'0')}:${match[2]}`;
    if(!out.includes(v))out.push(v);
  }
  return out;
}
function cleanHtml(value){
  const raw=text(value);if(!raw)return'';
  if(typeof document==='undefined')return raw.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  const box=document.createElement('div');box.innerHTML=raw;
  return text(box.textContent||box.innerText||'').replace(/\s+/g,' ');
}
function minuteDelta(from,to){
  const a=clock(from),b=clock(to);if(!a||!b)return null;
  const [ah,am]=a.split(':').map(Number),[bh,bm]=b.split(':').map(Number);
  let d=(bh*60+bm)-(ah*60+am);if(d<-720)d+=1440;if(d>720)d-=1440;return d;
}
function localEpochSeconds(date,time){
  const safeDate=/^\d{4}-\d{2}-\d{2}$/.test(text(date))?text(date):'';
  const safeTime=/^([01]?\d|2[0-3]):[0-5]\d$/.test(text(time))?text(time):'00:00';
  if(!safeDate)return'';
  const parsed=new Date(`${safeDate}T${safeTime}:00`);
  return Number.isNaN(parsed.getTime())?'':String(Math.floor(parsed.getTime()/1000));
}
function isoDateAdd(date,days){
  const m=text(date).match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!m)return'';
  const d=new Date(Date.UTC(Number(m[1]),Number(m[2])-1,Number(m[3])+Number(days||0)));
  return d.toISOString().slice(0,10);
}
function berlinOffset(date){
  try{
    const probe=new Date(`${text(date)}T12:00:00Z`);
    const part=new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Berlin',timeZoneName:'longOffset',hour:'2-digit'}).formatToParts(probe).find(p=>p.type==='timeZoneName')?.value||'';
    const m=part.match(/GMT([+-]\d{2}:\d{2})/);if(m)return m[1];
  }catch(_){ }
  return'+01:00';
}
function normalizeTransportPayload(value){
  if(value==null)return null;
  if(typeof value==='string'){
    try{return JSON.parse(value)}catch{return null}
  }
  if(typeof value==='object'&&typeof value.json==='function')return value.json();
  if(typeof value==='object'&&'body' in value&&typeof value.body==='string'){
    try{return JSON.parse(value.body)}catch{return null}
  }
  if(typeof value==='object'&&'data' in value&&value.data!=null&&Object.keys(value).length<=4){
    const nested=value.data;
    if(typeof nested==='string'){
      try{return JSON.parse(nested)}catch{return nested}
    }
    if(typeof nested==='object')return nested;
  }
  return value;
}
function nativeRequestId(airport){
  const rnd=Math.random().toString(36).slice(2,10);
  return`atms-${String(airport||'flight').toLowerCase()}-${Date.now()}-${rnd}`;
}
function validateNativeRequest(airportIata,request){
  const airport=upper(airportIata),rule=NATIVE_ALLOWED_ENDPOINTS[airport];
  if(!rule)throw new Error(`${airport||'Airport'} native endpoint not allowed`);
  const method=upper(request?.method||'GET');
  if(!rule.methods.includes(method))throw new Error(`${airport} native method not allowed: ${method}`);
  let url;
  try{url=new URL(String(request?.url||''))}catch{throw new Error(`${airport} native URL invalid`)}
  if(url.protocol!=='https:'||url.hostname.toLowerCase()!==rule.host||url.pathname!==rule.path){
    throw new Error(`${airport} native URL not allowlisted`);
  }
  return{
    contractVersion:NATIVE_TRANSPORT_CONTRACT_VERSION,
    requestId:text(request?.requestId)||nativeRequestId(airport),
    airportIata:airport,
    method,
    url:url.toString(),
    headers:{Accept:'application/json'},
    responseType:'json',
    timeoutMs:Number.isFinite(Number(request?.timeoutMs))?Math.max(1000,Math.min(30000,Number(request.timeoutMs))):NATIVE_TRANSPORT_TIMEOUT_MS,
    cache:'no-store'
  };
}
function nativeBridgeObject(){
  if(explicitNativeBridge)return explicitNativeBridge;
  return typeof window!=='undefined'?window.ATMSNativeFlightBridge:null;
}
function nativeBridgeDeclaredContract(bridge){return text(bridge?.contractVersion||bridge?.atmsFlightContractVersion)}
function nativeBridgeCompatible(bridge){
  if(!bridge)return false;
  const declared=nativeBridgeDeclaredContract(bridge);
  return !declared||declared===NATIVE_TRANSPORT_CONTRACT_VERSION;
}
function nativeBridgeRequestFunction(bridge){
  if(!nativeBridgeCompatible(bridge))return null;
  if(typeof bridge.requestJson==='function')return request=>bridge.requestJson(request);
  // Raw Android WebView bridges usually accept strings more reliably than JS objects.
  if(typeof bridge.requestJsonString==='function')return request=>bridge.requestJsonString(JSON.stringify(request));
  if(typeof bridge.fetchJson==='function')return request=>bridge.fetchJson(request);
  if(typeof bridge.request==='function')return request=>bridge.request(request);
  return null;
}
function getNativeBridge(){return nativeBridgeRequestFunction(nativeBridgeObject())}
function getNativeRuntimeState(){
  const bridge=nativeBridgeObject(),declared=nativeBridgeDeclaredContract(bridge),request=getNativeBridge();
  return{
    available:Boolean(request),
    source:explicitNativeBridge?'registered':bridge?'window':null,
    compatible:bridge?nativeBridgeCompatible(bridge):false,
    declaredContractVersion:declared||null,
    requiredContractVersion:NATIVE_TRANSPORT_CONTRACT_VERSION,
    methods:bridge?['requestJson','requestJsonString','fetchJson','request'].filter(name=>typeof bridge[name]==='function'):[]
  };
}
function announceNativeBridgeReady(){
  if(typeof window==='undefined'||typeof window.dispatchEvent!=='function')return;
  try{
    const detail=getNativeRuntimeState();
    if(typeof CustomEvent==='function')window.dispatchEvent(new CustomEvent('atms-native-flight-bridge-ready',{detail}));
    else window.dispatchEvent({type:'atms-native-flight-bridge-ready',detail});
  }catch(_){ }
}
function registerNativeBridge(bridge){
  if(!bridge||typeof bridge!=='object')throw new Error('Native Bridge fehlt oder ist ungültig');
  const declared=nativeBridgeDeclaredContract(bridge);
  if(declared&&declared!==NATIVE_TRANSPORT_CONTRACT_VERSION)throw new Error(`Native Bridge Contract ${declared} ist nicht kompatibel mit ${NATIVE_TRANSPORT_CONTRACT_VERSION}`);
  if(!nativeBridgeRequestFunction(bridge))throw new Error('Native Bridge stellt keine unterstützte Request-Methode bereit');
  explicitNativeBridge=bridge;
  announceNativeBridgeReady();
  return getNativeRuntimeState();
}
function unregisterNativeBridge(){explicitNativeBridge=null;return getNativeRuntimeState()}
function notifyNativeBridgeReady(){announceNativeBridgeReady();return getNativeRuntimeState()}
function hasTransport(airportIata){
  const airport=upper(airportIata);
  return transports.has(airport)||Boolean(getNativeBridge());
}
async function withTimeout(promise,timeoutMs,label){
  let timer;
  try{
    return await Promise.race([
      Promise.resolve(promise),
      new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(`${label||'Native transport'} timeout`)),timeoutMs)})
    ]);
  }finally{if(timer)clearTimeout(timer)}
}
async function requestViaTransport(airportIata,request){
  const airport=upper(airportIata),normalized=validateNativeRequest(airport,request);
  const transport=transports.get(airport)||getNativeBridge();
  if(typeof transport!=='function')throw new Error(`${airport||'Airport'} native transport unavailable`);
  const raw=await withTimeout(transport(normalized),normalized.timeoutMs,`${airport} native transport`);
  const payload=await normalizeTransportPayload(raw);
  if(payload==null)throw new Error(`${airport||'Airport'} transport returned no JSON`);
  return payload;
}
function registerTransport(airportIata,transportFn){
  const airport=upper(airportIata);
  if(!airport)throw new Error('airportIata fehlt');
  if(!NATIVE_ALLOWED_ENDPOINTS[airport])throw new Error(`${airport} besitzt keinen freigegebenen Native-Endpunkt`);
  if(typeof transportFn!=='function')throw new Error('transportFn muss eine Funktion sein');
  transports.set(airport,transportFn);
  return true;
}
function unregisterTransport(airportIata){return transports.delete(upper(airportIata))}
function getNativeTransportContract(){
  return{
    version:NATIVE_TRANSPORT_CONTRACT_VERSION,
    responseType:'json',
    timeoutMs:NATIVE_TRANSPORT_TIMEOUT_MS,
    allowedEndpoints:Object.fromEntries(Object.entries(NATIVE_ALLOWED_ENDPOINTS).map(([airport,rule])=>[airport,{...rule,methods:[...rule.methods]}])),
    requestFields:['contractVersion','requestId','airportIata','method','url','headers','responseType','timeoutMs','cache'],
    responseAccepted:['plain JSON object','JSON string','{ body: JSON-string }','{ data: JSON-object|string }'],
    bridgeMethodsAccepted:['requestJson(requestObject)','requestJsonString(JSON-string)','fetchJson(requestObject)','request(requestObject)'],
    bridgeReadyEvent:'atms-native-flight-bridge-ready',
    note:'Die native App führt ausschließlich den freigegebenen HTTPS-Request aus und gibt JSON an ATMS zurück. Keine GitHub-Bridge/kein Proxy erforderlich.'
  };
}


// P31F10: Kontrollierte DUS-Testantwort aus dem zuvor am offiziellen DUS-Endpunkt
// beobachteten Schema. Sie dient ausschließlich dazu, Transportvertrag + Parser innerhalb
// von ATMS zu testen, solange die native Android-Hülle noch nicht existiert.
const DUS_NATIVE_TEST_ITEM=Object.freeze({
  flightNumber:'OS168',date:'2026-09-18',airportEventDate:'2026-09-18',airportEventDateDerived:false,
  direction:'departure',airportIata:'DUS',flightTime:'20:00'
});
const DUS_NATIVE_TEST_PAYLOAD=Object.freeze({
  data:{
    totalCount:1,count:1,offset:0,start:'2026-09-18T20:00:00+02:00',stop:'2026-09-18T21:05:00+02:00',more:false,
    flights:[{
      id:3622405,flightNumber:'OS 168',adFlag:'D',flightDate:'2026-09-18',
      destination:{iataCode:'VIE',icaoCode:'LOWW',name:'Wien',city:{name:'Wien'}},
      airline:{iataCode:'OS',icaoCode:'AUA',name:'Austrian Airlines'},
      scheduledTime:'2026-09-18T20:00:00+02:00',estimatedTime:null,actualTime:'2026-09-18T20:08:21+02:00',
      status:{code:'S',description:'Gestartet',publicStatus:{name:'gestartet'}}
    }]
  },
  serviceType:'live',hasError:false,internalErrorMessage:'',errorCode:''
});

function cloneJson(value){return JSON.parse(JSON.stringify(value))}
async function runDusNativeTransportSelfTest(){
  const previous=transports.has('DUS')?transports.get('DUS'):null;
  let capturedRequest=null;
  const testTransport=async request=>{
    capturedRequest=cloneJson(request);
    // Der Testtransport akzeptiert ausschließlich den bereits validierten DUS-Vertrag.
    if(request?.contractVersion!==NATIVE_TRANSPORT_CONTRACT_VERSION)throw new Error('Testtransport: falsche Contract-Version');
    if(request?.airportIata!=='DUS'||request?.method!=='GET')throw new Error('Testtransport: unerwarteter Request');
    return cloneJson(DUS_NATIVE_TEST_PAYLOAD);
  };
  transports.set('DUS',testTransport);
  try{
    const result=await fetchLive([DUS_NATIVE_TEST_ITEM]);
    const hit=Array.isArray(result?.flights)?result.flights[0]:null;
    const checks={
      oneResult:Boolean(hit&&result.flights.length===1),
      flightNumber:hit?.flightNumber==='OS168',
      flightTime:hit?.flightTime==='20:00',
      route:hit?.route?.iata==='VIE'&&hit?.route?.location==='Wien',
      scheduled:hit?.airportScheduledTime==='20:00',
      actual:hit?.airportActualTime==='20:08',
      status:hit?.status==='departed',
      delay:hit?.delayMinutes===8,
      contract:capturedRequest?.contractVersion===NATIVE_TRANSPORT_CONTRACT_VERSION,
      allowlistedUrl:Boolean(capturedRequest?.url&&capturedRequest.url.startsWith(DUS_ENDPOINT+'?'))
    };
    const ok=Object.values(checks).every(Boolean);
    return{
      ok,
      test:'DUS Native Transport Contract + Parser',
      checkedAt:new Date().toISOString(),
      contractVersion:NATIVE_TRANSPORT_CONTRACT_VERSION,
      checks,
      request:capturedRequest,
      received:hit?{
        flightNumber:hit.flightNumber,flightTime:hit.flightTime,route:hit.route,scheduled:hit.airportScheduledTime,
        estimated:hit.airportEstimatedTime,actual:hit.airportActualTime,status:hit.status,delayMinutes:hit.delayMinutes
      }:null,
      expected:{flightNumber:'OS168',flightTime:'20:00',route:{location:'Wien',iata:'VIE'},scheduled:'20:00',actual:'20:08',status:'departed',delayMinutes:8},
      failures:result?.failures||[],unsupported:result?.unsupported||[]
    };
  }catch(error){
    return{ok:false,test:'DUS Native Transport Contract + Parser',checkedAt:new Date().toISOString(),contractVersion:NATIVE_TRANSPORT_CONTRACT_VERSION,error:text(error?.message)||String(error||'Unbekannter Fehler'),request:capturedRequest};
  }finally{
    if(previous)transports.set('DUS',previous);else transports.delete('DUS');
  }
}
function registerAdapter(adapter){
  const airport=upper(adapter?.airportIata);
  if(!airport||typeof adapter?.fetchItem!=='function')throw new Error('Ungültiger Airport-Adapter');
  adapters.set(airport,{...adapter,airportIata:airport});
  return true;
}
function adapterFor(item){return adapters.get(upper(item?.airportIata))||null}
function canHandle(item){
  const adapter=adapterFor(item);if(!adapter)return false;
  return typeof adapter.isAvailable==='function'?Boolean(adapter.isAvailable(item)):true;
}
function getCapabilities(){
  return [...adapters.values()].map(adapter=>({
    airportIata:adapter.airportIata,
    available:typeof adapter.isAvailable==='function'?Boolean(adapter.isAvailable()):true,
    runtime:adapter.runtime||'web',
    sourceName:adapter.sourceName||adapter.airportIata,
    endpoint:adapter.endpoint||null,
    nativeTransportRequired:adapter.runtime==='native'&&!hasTransport(adapter.airportIata),
    nativeContractVersion:adapter.runtime==='native'?NATIVE_TRANSPORT_CONTRACT_VERSION:null
  }));
}

function statusFromCgn(row,direction,scheduled,estimated,actual){
  const label=cleanHtml(row?.statusF).toLowerCase(),code=upper(row?.status);
  if(/annull|cancel/.test(label))return'cancelled';
  if(direction==='departure'&&(/gestartet|abgeflogen|departed/.test(label)||code==='S'))return'departed';
  if(direction==='arrival'&&(/gelandet|angekommen|landed/.test(label)||code==='L'))return'landed';
  const current=actual||estimated,delay=current&&scheduled?minuteDelta(scheduled,current):null;
  if(Number.isFinite(delay)&&delay>0)return'delayed';
  if(/pünkt|on time/.test(label))return'on_time';
  return'scheduled';
}
function cgnTimes(row,direction){
  const scheduled=clock(row?.time)||clock(row?.STT)||clock(row?.datetime);
  const explicitExpected=clock(row?.expected);
  const outClocks=clocks(row?.time_out||row?.date_out||row?.date_out_bf);
  const shownCurrent=outClocks.length?outClocks[outClocks.length-1]:'';
  const label=cleanHtml(row?.statusF).toLowerCase(),code=upper(row?.status);
  const completed=direction==='departure'?(/gestartet|abgeflogen|departed/.test(label)||code==='S'):(/gelandet|angekommen|landed/.test(label)||code==='L');
  return{
    scheduled,
    estimated:!completed?(explicitExpected||(shownCurrent&&shownCurrent!==scheduled?shownCurrent:'')):'',
    actual:completed?(shownCurrent||scheduled):''
  };
}
function cgnBody(item){
  const mode=item.direction==='arrival'?'A':'D';
  const eventDate=text(item.airportEventDate||item.date),eventTime=clock(item.flightTime)||'00:00';
  const params=new URLSearchParams();
  params.set('mode',mode);params.set('more','');params.set('flightsperpage','');params.set('tolerance','');params.set('page','0');
  params.set('START',localEpochSeconds(eventDate,eventTime));params.set('END','');
  params.set('destination',normalizeFlightNumber(item.flightNumber));params.set('date',`${eventDate}T${eventTime}`);
  return params;
}
async function fetchCgnItem(item){
  const response=await fetch(CGN_ENDPOINT,{method:'POST',body:cgnBody(item),mode:'cors',credentials:'omit',cache:'no-store'});
  if(!response.ok)throw new Error(`CGN HTTP ${response.status}`);
  const payload=await response.json(),rows=Array.isArray(payload?.flights)?payload.flights:[];
  const expectedFlight=normalizeFlightNumber(item.flightNumber),eventDate=text(item.airportEventDate||item.date),expectedMode=item.direction==='arrival'?'A':'D';
  const matches=rows.filter(row=>{
    if(normalizeFlightNumber(row?.number||row?.bflabel)!==expectedFlight)return false;
    if(upper(row?.mode)!==expectedMode)return false;
    const rowDate=(text(row?.STT).match(/^(\d{4}-\d{2}-\d{2})/)||[])[1]||(text(row?.id).match(/^(\d{4}-\d{2}-\d{2})/)||[])[1]||'';
    return !eventDate||rowDate===eventDate;
  });
  if(matches.length!==1)return{ok:false,reason:matches.length?'ambiguous':'not_found',flightNumber:expectedFlight,airportIata:'CGN',direction:item.direction,date:text(item.date),airportEventDate:eventDate};
  const row=matches[0],times=cgnTimes(row,item.direction),status=statusFromCgn(row,item.direction,times.scheduled,times.estimated,times.actual);
  const current=times.actual||times.estimated,delay=current&&times.scheduled?minuteDelta(times.scheduled,current):null;
  return{
    ok:true,flightNumber:expectedFlight,date:text(item.date),airportEventDate:eventDate,airportEventDateDerived:Boolean(item.airportEventDateDerived),flightTime:clock(item.flightTime)||null,
    direction:item.direction,airportIata:'CGN',status,airportScheduledTime:times.scheduled||null,airportEstimatedTime:times.estimated||null,
    airportActualTime:times.actual||null,delayMinutes:Number.isFinite(delay)?delay:null,confirmed:true,sourceConflict:false,resolutionMode:'single_primary',
    prioritySourceUrl:null,sources:[{name:'Köln Bonn Airport',url:CGN_ENDPOINT}],sourceNote:'Offizielle CGN-Flugquelle direkt von koeln-bonn-airport.de',
    route:{location:text(row?.destination_expanded)||null,iata:upper(row?.destination)||null,mode:expectedMode},rawId:text(row?.id)||null
  };
}

function dusUrl(item){
  const eventDate=text(item.airportEventDate||item.date),arrival=item.direction==='arrival';
  const nextDate=isoDateAdd(eventDate,1)||eventDate,offset=berlinOffset(eventDate),nextOffset=berlinOffset(nextDate);
  const params=new URLSearchParams();
  params.set('lang','de');params.set('arrival',arrival?'true':'false');params.set('offset','0');params.set('codeshare','true');params.set('count','500');
  params.set('flightStartTime',`${eventDate}T00:00:00${offset}`);params.set('flightEndTime',`${nextDate}T05:59:59${nextOffset}`);params.set('showDetails','false');
  return`${DUS_ENDPOINT}?${params.toString()}`;
}
function statusFromDus(row,direction,scheduled,estimated,actual){
  const label=text(row?.status?.publicStatus?.name||row?.status?.description).toLowerCase(),code=upper(row?.status?.code);
  if(/annull|cancel/.test(label))return'cancelled';
  if(direction==='departure'&&(/gestartet|abgeflogen|departed/.test(label)||code==='S'))return'departed';
  if(direction==='arrival'&&(/gelandet|angekommen|landed/.test(label)||code==='L'))return'landed';
  const current=actual||estimated,delay=current&&scheduled?minuteDelta(scheduled,current):null;
  if(Number.isFinite(delay)&&delay>0)return'delayed';
  if(/pünkt|on time/.test(label))return'on_time';
  return'scheduled';
}
async function fetchDusItem(item){
  const payload=await requestViaTransport('DUS',{method:'GET',url:dusUrl(item),headers:{Accept:'application/json'},cache:'no-store',timeoutMs:NATIVE_TRANSPORT_TIMEOUT_MS});
  const rows=Array.isArray(payload?.data?.flights)?payload.data.flights:Array.isArray(payload?.flights)?payload.flights:[];
  const expectedFlight=normalizeFlightNumber(item.flightNumber),eventDate=text(item.airportEventDate||item.date),expectedFlag=item.direction==='arrival'?'A':'D';
  const matches=rows.filter(row=>normalizeFlightNumber(row?.flightNumber)===expectedFlight&&(!row?.adFlag||upper(row.adFlag)===expectedFlag)&&(!eventDate||text(row?.flightDate)===eventDate));
  if(matches.length!==1)return{ok:false,reason:matches.length?'ambiguous':'not_found',flightNumber:expectedFlight,airportIata:'DUS',direction:item.direction,date:text(item.date),airportEventDate:eventDate};
  const row=matches[0],scheduled=clock(row?.scheduledTime),estimated=clock(row?.estimatedTime),actual=clock(row?.actualTime);
  const status=statusFromDus(row,item.direction,scheduled,estimated,actual),current=actual||estimated,delay=current&&scheduled?minuteDelta(scheduled,current):null;
  const point=item.direction==='departure'?(row?.destination||row?.arrivalDestination):(row?.origin||row?.departureOrigin||row?.destination);
  return{
    ok:true,flightNumber:expectedFlight,date:text(item.date),airportEventDate:eventDate,airportEventDateDerived:Boolean(item.airportEventDateDerived),flightTime:clock(item.flightTime)||null,
    direction:item.direction,airportIata:'DUS',status,airportScheduledTime:scheduled||null,airportEstimatedTime:estimated||null,airportActualTime:actual||null,
    delayMinutes:Number.isFinite(delay)?delay:null,confirmed:true,sourceConflict:false,resolutionMode:'single_primary',prioritySourceUrl:null,
    sources:[{name:'Düsseldorf Airport',url:DUS_ENDPOINT}],sourceNote:'Offizielle DUS-Flugquelle direkt von dus.com über nativen Transport',
    route:{location:text(point?.city?.name||point?.name)||null,iata:upper(point?.iataCode)||null,mode:expectedFlag},rawId:text(row?.id)||null
  };
}

registerAdapter({airportIata:'CGN',runtime:'pwa',sourceName:'Köln Bonn Airport',endpoint:CGN_ENDPOINT,isAvailable:()=>typeof fetch==='function',fetchItem:fetchCgnItem});
registerAdapter({airportIata:'DUS',runtime:'native',sourceName:'Düsseldorf Airport',endpoint:DUS_ENDPOINT,isAvailable:()=>hasTransport('DUS'),fetchItem:fetchDusItem});

async function fetchLive(items,{onProgress}={}){
  const input=Array.isArray(items)?items:[],checked=[],unsupported=[],failures=[];let current=0;
  for(const item of input){
    current++;
    const airport=upper(item?.airportIata),flightNumber=normalizeFlightNumber(item?.flightNumber),adapter=adapterFor(item);
    if(typeof onProgress==='function')onProgress({current,total:input.length,flightNumber,airportIata:airport});
    if(!adapter){unsupported.push({flightNumber,airportIata:airport||null,reason:'provider_not_configured'});continue}
    if(!canHandle(item)){
      unsupported.push({flightNumber,airportIata:airport||null,reason:airport==='DUS'?'native_transport_required':'provider_unavailable',runtime:adapter.runtime||null,endpoint:adapter.endpoint||null});
      continue;
    }
    try{
      const result=await adapter.fetchItem(item);
      if(result?.ok)checked.push(result);else failures.push(result||{ok:false,reason:'empty_result',flightNumber,airportIata:airport});
    }catch(error){
      failures.push({ok:false,reason:'technical',flightNumber,airportIata:airport||null,message:text(error?.message)||`${airport||'Airport'}-Abruf fehlgeschlagen`});
    }
  }
  return{checkedAt:new Date().toISOString(),flights:checked,unsupported,failures,capabilities:getCapabilities(),source:'official-airport-provider-v3'};
}

window.ATMSOfficialFlightProvider={
  version:'CORE-007D8A1F1D8P36',
  endpoints:{CGN:CGN_ENDPOINT,DUS:DUS_ENDPOINT},
  nativeTransportContract:getNativeTransportContract(),
  getNativeTransportContract,
  getNativeRuntimeState,
  registerNativeBridge,
  unregisterNativeBridge,
  notifyNativeBridgeReady,
  canHandle,
  getCapabilities,
  registerAdapter,
  registerTransport,
  unregisterTransport,
  runDusNativeTransportSelfTest,
  fetchLive
};
