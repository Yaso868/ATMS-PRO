// CORE-007D8A1F1D8P31F8 · 19.09.2026
// Modulare offizielle Airport-Datenschicht.
// - CGN: direkte PWA-Abfrage per CORS.
// - DUS: offizieller Endpoint + Parser sind vorbereitet; in der Browser-PWA bleibt
//   der Adapter wegen Airport-CORS inaktiv. Eine spätere native App aktiviert DUS,
//   indem sie einen zulässigen nativen JSON-Transport registriert.
// Keine GitHub-Datenbrücke und kein Proxy sind Bestandteil dieser Schicht.

const CGN_ENDPOINT='https://www.koeln-bonn-airport.de/fluggaeste/fluege/abflug-ankunft/fsjson';
const DUS_ENDPOINT='https://www.dus.com/api/sitecore/flightapi/SearchFlightsWithOutParams';

const adapters=new Map();
const transports=new Map();

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
  return value;
}
function getNativeBridge(){
  const bridge=typeof window!=='undefined'?window.ATMSNativeFlightBridge:null;
  if(!bridge)return null;
  if(typeof bridge.requestJson==='function')return request=>bridge.requestJson(request);
  if(typeof bridge.fetchJson==='function')return request=>bridge.fetchJson(request);
  return null;
}
function hasTransport(airportIata){
  const airport=upper(airportIata);
  return transports.has(airport)||Boolean(getNativeBridge());
}
async function requestViaTransport(airportIata,request){
  const airport=upper(airportIata);
  const transport=transports.get(airport)||getNativeBridge();
  if(typeof transport!=='function')throw new Error(`${airport||'Airport'} native transport unavailable`);
  const raw=await transport({...request,airportIata:airport});
  const payload=await normalizeTransportPayload(raw);
  if(payload==null)throw new Error(`${airport||'Airport'} transport returned no JSON`);
  return payload;
}
function registerTransport(airportIata,transportFn){
  const airport=upper(airportIata);
  if(!airport)throw new Error('airportIata fehlt');
  if(typeof transportFn!=='function')throw new Error('transportFn muss eine Funktion sein');
  transports.set(airport,transportFn);
  return true;
}
function unregisterTransport(airportIata){return transports.delete(upper(airportIata))}
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
    endpoint:adapter.endpoint||null
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
    ok:true,flightNumber:expectedFlight,date:text(item.date),airportEventDate:eventDate,airportEventDateDerived:Boolean(item.airportEventDateDerived),
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
  const payload=await requestViaTransport('DUS',{method:'GET',url:dusUrl(item),headers:{Accept:'application/json'},cache:'no-store'});
  const rows=Array.isArray(payload?.data?.flights)?payload.data.flights:Array.isArray(payload?.flights)?payload.flights:[];
  const expectedFlight=normalizeFlightNumber(item.flightNumber),eventDate=text(item.airportEventDate||item.date),expectedFlag=item.direction==='arrival'?'A':'D';
  const matches=rows.filter(row=>normalizeFlightNumber(row?.flightNumber)===expectedFlight&&(!row?.adFlag||upper(row.adFlag)===expectedFlag)&&(!eventDate||text(row?.flightDate)===eventDate));
  if(matches.length!==1)return{ok:false,reason:matches.length?'ambiguous':'not_found',flightNumber:expectedFlight,airportIata:'DUS',direction:item.direction,date:text(item.date),airportEventDate:eventDate};
  const row=matches[0],scheduled=clock(row?.scheduledTime),estimated=clock(row?.estimatedTime),actual=clock(row?.actualTime);
  const status=statusFromDus(row,item.direction,scheduled,estimated,actual),current=actual||estimated,delay=current&&scheduled?minuteDelta(scheduled,current):null;
  const point=item.direction==='departure'?(row?.destination||row?.arrivalDestination):(row?.origin||row?.departureOrigin||row?.destination);
  return{
    ok:true,flightNumber:expectedFlight,date:text(item.date),airportEventDate:eventDate,airportEventDateDerived:Boolean(item.airportEventDateDerived),
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
  return{checkedAt:new Date().toISOString(),flights:checked,unsupported,failures,capabilities:getCapabilities(),source:'official-airport-provider-v2'};
}

window.ATMSOfficialFlightProvider={
  version:'CORE-007D8A1F1D8P31F8',
  endpoints:{CGN:CGN_ENDPOINT,DUS:DUS_ENDPOINT},
  canHandle,
  getCapabilities,
  registerAdapter,
  registerTransport,
  unregisterTransport,
  fetchLive
};
