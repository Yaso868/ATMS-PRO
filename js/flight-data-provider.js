// CORE-007D8A1F1D8P31F6 · 18.09.2026
// Offizielle Airport-Datenquelle mit austauschbarem Provider-Interface.
// CGN kann in der PWA direkt per CORS gelesen werden. DUS bleibt in der PWA
// bewusst deaktiviert, weil die offizielle DUS-API Access-Control-Allow-Origin
// auf https://cmk.dus.com begrenzt; derselbe Provider kann spaeter in einer
// nativen App ohne Browser-CORS an den DUS-Endpunkt angeschlossen werden.

const CGN_ENDPOINT = 'https://www.koeln-bonn-airport.de/fluggaeste/fluege/abflug-ankunft/fsjson';
const DUS_ENDPOINT = 'https://www.dus.com/api/sitecore/flightapi/SearchFlightsWithOutParams';

function text(value){ return String(value ?? '').trim(); }
function upper(value){ return text(value).toUpperCase(); }
function normalizeFlightNumber(value){
  return upper(value).replace(/\s+/g,'').replace(/^0S(?=\d)/,'OS');
}
function cleanHtml(value){
  const raw=text(value);
  if(!raw) return '';
  const box=document.createElement('div');
  box.innerHTML=raw;
  return text(box.textContent||box.innerText||'').replace(/\s+/g,' ');
}
function clock(value){
  const raw=text(value);
  const m=raw.match(/(?:^|\D)([01]?\d|2[0-3]):([0-5]\d)(?:\D|$)/);
  return m ? `${String(Number(m[1])).padStart(2,'0')}:${m[2]}` : '';
}
function clocks(value){
  const out=[];
  for(const match of text(value).matchAll(/([01]?\d|2[0-3]):([0-5]\d)/g)){
    const v=`${String(Number(match[1])).padStart(2,'0')}:${match[2]}`;
    if(!out.includes(v)) out.push(v);
  }
  return out;
}
function minuteDelta(from,to){
  const a=clock(from),b=clock(to); if(!a||!b) return null;
  const [ah,am]=a.split(':').map(Number),[bh,bm]=b.split(':').map(Number);
  let d=(bh*60+bm)-(ah*60+am); if(d<-720)d+=1440; if(d>720)d-=1440; return d;
}
function localEpochSeconds(date,time){
  const safeDate=/^\d{4}-\d{2}-\d{2}$/.test(text(date))?text(date):'';
  const safeTime=/^([01]?\d|2[0-3]):[0-5]\d$/.test(text(time))?text(time):'00:00';
  if(!safeDate) return '';
  const parsed=new Date(`${safeDate}T${safeTime}:00`);
  return Number.isNaN(parsed.getTime())?'':String(Math.floor(parsed.getTime()/1000));
}
function statusFromCgn(row,direction,scheduled,estimated,actual){
  const label=cleanHtml(row?.statusF).toLowerCase();
  const code=upper(row?.status);
  if(/annull|cancel/.test(label)) return 'cancelled';
  if(direction==='departure' && (/gestartet|abgeflogen|departed/.test(label)||code==='S')) return 'departed';
  if(direction==='arrival' && (/gelandet|angekommen|landed/.test(label)||code==='L')) return 'landed';
  const current=actual||estimated;
  const delay=current&&scheduled?minuteDelta(scheduled,current):null;
  if(Number.isFinite(delay)&&delay>0) return 'delayed';
  if(/pünkt|on time/.test(label)) return 'on_time';
  return 'scheduled';
}
function cgnTimes(row,direction){
  const scheduled=clock(row?.time)||clock(row?.STT)||clock(row?.datetime);
  const explicitExpected=clock(row?.expected);
  const outClocks=clocks(row?.time_out||row?.date_out||row?.date_out_bf);
  const shownCurrent=outClocks.length?outClocks[outClocks.length-1]:'';
  const label=cleanHtml(row?.statusF).toLowerCase();
  const code=upper(row?.status);
  const completed=direction==='departure'
    ? (/gestartet|abgeflogen|departed/.test(label)||code==='S')
    : (/gelandet|angekommen|landed/.test(label)||code==='L');
  const actual=completed?(shownCurrent||scheduled):'';
  const estimated=!completed?(explicitExpected||(shownCurrent&&shownCurrent!==scheduled?shownCurrent:'')):'';
  return{scheduled,estimated,actual};
}
function cgnBody(item){
  const mode=item.direction==='arrival'?'A':'D';
  const eventDate=text(item.airportEventDate||item.date);
  const eventTime=clock(item.flightTime)||'00:00';
  const params=new URLSearchParams();
  params.set('mode',mode);
  params.set('more','');
  params.set('flightsperpage','');
  params.set('tolerance','');
  params.set('page','0');
  params.set('START',localEpochSeconds(eventDate,eventTime));
  params.set('END','');
  params.set('destination',normalizeFlightNumber(item.flightNumber));
  params.set('date',`${eventDate}T${eventTime}`);
  return params;
}
async function fetchCgnItem(item){
  const response=await fetch(CGN_ENDPOINT,{
    method:'POST',
    body:cgnBody(item),
    mode:'cors',
    credentials:'omit',
    cache:'no-store'
  });
  if(!response.ok) throw new Error(`CGN HTTP ${response.status}`);
  const payload=await response.json();
  const rows=Array.isArray(payload?.flights)?payload.flights:[];
  const expectedFlight=normalizeFlightNumber(item.flightNumber);
  const eventDate=text(item.airportEventDate||item.date);
  const expectedMode=item.direction==='arrival'?'A':'D';
  const matches=rows.filter(row=>{
    if(normalizeFlightNumber(row?.number||row?.bflabel)!==expectedFlight) return false;
    if(upper(row?.mode)!==expectedMode) return false;
    const rowDate=(text(row?.STT).match(/^(\d{4}-\d{2}-\d{2})/)||[])[1] || (text(row?.id).match(/^(\d{4}-\d{2}-\d{2})/)||[])[1] || '';
    return !eventDate || rowDate===eventDate;
  });
  if(matches.length!==1){
    return{ok:false,reason:matches.length?'ambiguous':'not_found',flightNumber:expectedFlight,airportIata:'CGN',direction:item.direction,date:text(item.date),airportEventDate:eventDate};
  }
  const row=matches[0];
  const times=cgnTimes(row,item.direction);
  const status=statusFromCgn(row,item.direction,times.scheduled,times.estimated,times.actual);
  const current=times.actual||times.estimated;
  const delay=current&&times.scheduled?minuteDelta(times.scheduled,current):null;
  return{
    ok:true,
    flightNumber:expectedFlight,
    date:text(item.date),
    airportEventDate:eventDate,
    airportEventDateDerived:Boolean(item.airportEventDateDerived),
    direction:item.direction,
    airportIata:'CGN',
    status,
    airportScheduledTime:times.scheduled||null,
    airportEstimatedTime:times.estimated||null,
    airportActualTime:times.actual||null,
    delayMinutes:Number.isFinite(delay)?delay:null,
    confirmed:true,
    sourceConflict:false,
    resolutionMode:'single_primary',
    prioritySourceUrl:null,
    sources:[{name:'Köln Bonn Airport',url:CGN_ENDPOINT}],
    sourceNote:'Offizielle CGN-Flugquelle direkt von koeln-bonn-airport.de',
    route:{
      location:text(row?.destination_expanded)||null,
      iata:upper(row?.destination)||null,
      mode:expectedMode
    },
    rawId:text(row?.id)||null
  };
}

async function fetchLive(items,{onProgress}={}){
  const input=Array.isArray(items)?items:[];
  const checked=[];
  const unsupported=[];
  const failures=[];
  let current=0;
  for(const item of input){
    current++;
    const airport=upper(item?.airportIata);
    if(typeof onProgress==='function') onProgress({current,total:input.length,flightNumber:normalizeFlightNumber(item?.flightNumber),airportIata:airport});
    if(airport==='CGN'){
      try{
        const result=await fetchCgnItem(item);
        if(result.ok) checked.push(result); else failures.push(result);
      }catch(error){
        failures.push({ok:false,reason:'technical',flightNumber:normalizeFlightNumber(item?.flightNumber),airportIata:'CGN',message:text(error?.message)||'CGN-Abruf fehlgeschlagen'});
      }
      continue;
    }
    if(airport==='DUS'){
      unsupported.push({flightNumber:normalizeFlightNumber(item?.flightNumber),airportIata:'DUS',reason:'browser_cors',nativeEndpoint:DUS_ENDPOINT});
      continue;
    }
    unsupported.push({flightNumber:normalizeFlightNumber(item?.flightNumber),airportIata:airport||null,reason:'provider_not_configured'});
  }
  return{
    checkedAt:new Date().toISOString(),
    flights:checked,
    unsupported,
    failures,
    source:'official-airport-provider-v1'
  };
}

window.ATMSOfficialFlightProvider={
  version:'CORE-007D8A1F1D8P31F6',
  endpoints:{CGN:CGN_ENDPOINT,DUS:DUS_ENDPOINT},
  fetchLive
};
