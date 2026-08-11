// CORE-001A 11.08.2026 14:41 Uhr (Europe/Berlin): New-import isolation + conflict safety + staged flight apply.
const KEY='atms_beta_14_3_1_rides',DONE='atms_beta_14_3_1_done',DONE_OPEN='atms_beta_14_3_1_done_open',WA_SETTINGS='atms_beta_14_3_1_whatsapp',DISP_SETTINGS='atms_dispatchers_v1',DRIVER_SETTINGS='atms_driver_contacts_v1',BACKUP_META='atms_backup_meta_v1',LIVE_SETTINGS='atms_live_disposition_v1',LIVE_LOG='atms_live_disposition_log_v1',DRIVER_SESSION='atms_driver_session_v1',INFO_CHAT_SETTINGS='atms_info_chat_v1',FLIGHT_CACHE='atms_flight_cache_v1',RIDE_OVERRIDE_KEY='atms_ride_overrides_v1';const $=id=>document.getElementById(id);let liveGeoWatchId=null;let rides=[];let done=new Set(JSON.parse(localStorage.getItem(DONE)||'[]'));let doneOpen=localStorage.getItem(DONE_OPEN)==='1';let mode='rides',driverFilter='',active=null;const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

let atmsToastTimer=0;
function showToast(message,type=''){const el=document.getElementById('atmsToast');if(!el)return;clearTimeout(atmsToastTimer);el.textContent=message;el.className='atms-toast '+type+' show';atmsToastTimer=setTimeout(()=>{el.className='atms-toast';},2600)}
function runStartupSelfCheck(){const required=['search','plusBtn','rideList','fileInput','loadBtn','exportBackupBtn','importBackupBtn','resetDataBtn'];const missing=required.filter(id=>!document.getElementById(id));if(missing.length){throw new Error('Fehlende App-Elemente: '+missing.join(', '));}return true;}
function first(...v){for(const x of v)if(x!==undefined&&x!==null&&String(x).trim()!=='')return String(x).trim();return ''}function clean(t){return t.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'')}function planTimeOf(r){return first(r.time,r.planTime,r.plan_abholzeit,r.planzeit,r.plan_zeit,r.abholzeit)}function dispoTimeOf(r){return first(r.dispoTime,r.dispo_time,r.dispoZeit,r.dispozeit,r.dispo_zeit,r.dispo_abholzeit,r.dispo_uhrzeit,r.uhrzeit2,r.uhrzeit_2,r.zweiteUhrzeit,r.secondColumnTime,r.dispositionTime,r.disposition_time,r.disponierte_abholzeit,r.zweite_uhrzeit,r.zweiteZeit,r.zweite_zeit,r.secondTime,r.second_time,r.secondPickupTime,r.pickupTimeDispo,r.pickup_time_dispo)}function liveTimeOf(r){return first(r.liveTime,r.currentTime,r.current_time,r.aktuelle_abholzeit,r.aktuelleZeit,r.aktuelle_zeit,r.live_abholzeit,r.flightradar_abholzeit,r.verspaetete_abholzeit,r.verspätete_abholzeit,r.livePickupTime,r.live_pickup_time)}function normalizeStops(r){const raw=r.bundleStops||r.stops||r.destinations||r.ziele||r.bundle_ziele||[];if(!Array.isArray(raw))return[];return raw.map((s,i)=>{if(typeof s==='string')return{name:s,persons:0,order:i+1};return{name:first(s.name,s.destination,s.ziel,s.ort,s.hotel),persons:Number(s.persons||s.personen||0),order:Number(s.order||s.reihenfolge||i+1)}}).filter(s=>s.name)}
function isBundleRide(r){return Boolean(r.bundle||r.isBundle||r.bundelfahrt||r.is_bundelfahrt||r.bundleRide||normalizeStops(r).length>1)}
function norm(r,i){const plan=planTimeOf(r),dispo=dispoTimeOf(r),live=liveTimeOf(r);return{...r,id:first(r.id,'ride-'+(i+1)),date:first(r.date,r.datum),time:plan,planTime:plan,dispoTime:dispo,liveTime:live,driver:first(r.driver,r.fahrer),pickup:first(r.pickup,r.abholort,r.start),destination:first(r.destination,r.zielort,r.ziel),flightNumber:first(r.flightNumber,r.flugnummer).toUpperCase(),flightLocation:first(r.flightLocation,r.flugort,r.ort),iata:first(r.iata),airline:first(r.airline),partner:first(r.partner,r.airline),company:first(r.company,r.firma,'WT'),vehicle:first(r.vehicle,r.fahrzeug,'Pkw'),persons:Number(r.persons||r.personen||0),price:Number(r.price||r.preis||0),currency:first(r.currency,'EUR'),notes:first(r.notes,r.hinweis),flightStatus:first(r.flightStatus,r.flugstatus,r.liveStatus,r.live_status),delayMinutes:Number(r.delayMinutes??r.delay_minutes??r.verspaetungMinuten??r.verspätung_minuten??r.delay??0),landed:Boolean(r.landed||r.gelandet),isBundle:isBundleRide(r),bundleStops:normalizeStops(r)}}
function normKey(v){return String(v||'').trim().toLowerCase().replace(/\s+/g,' ')}
function getRideOverrides(){
  try{
    const list=JSON.parse(localStorage.getItem(RIDE_OVERRIDE_KEY)||'[]');
    return Array.isArray(list)?list:[];
  }catch(_){return[]}
}
function saveRideOverrides(list){
  localStorage.setItem(RIDE_OVERRIDE_KEY,JSON.stringify((Array.isArray(list)?list:[]).slice(0,500)));
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
    if(hit.flightVerified===true&&String(hit.flightLocation||'').trim()){
      const loc=String(hit.flightLocation||'').trim();
      const iata=String(hit.iata||'').trim().toUpperCase();
      if(String(next.flightLocation||'').trim()!==loc||String(next.iata||'').trim().toUpperCase()!==iata){
        next.flightLocation=loc;
        next.iata=iata;
        next.flightCheckConfidence='verified';
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
function effectiveTime(r){return first(liveTimeOf(r),dispoTimeOf(r),planTimeOf(r))}function effectiveSource(r){if(liveTimeOf(r))return'live';if(dispoTimeOf(r))return'dispo';return'plan'}function parse(t){let p=JSON.parse(clean(t));if(p.rides)p=p.rides;if(!Array.isArray(p)||!p.length)throw Error('Keine Fahrten gefunden');return p.map(norm)}function save(){
  const corrected=applyRideOverrides(rides);
  rides=corrected.rides;
  localStorage.setItem(KEY,JSON.stringify(rides));
  localStorage.setItem(DONE,JSON.stringify([...done]));
}function money(v){return new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(v||0)}function cls(i){return ['','cyan','red','yellow'][i%4]}function matches(r){const q=$('search').value.toLowerCase().trim();return(!driverFilter||r.driver===driverFilter)&&(!q||[r.driver,r.pickup,r.destination,r.flightNumber,r.flightLocation,r.airline].join(' ').toLowerCase().includes(q))}
function flightStatusInfo(r){const raw=first(r.flightStatus,r.flugstatus,r.liveStatus,r.live_status).toLowerCase();const delay=Number(r.delayMinutes??r.delay_minutes??r.verspaetungMinuten??r.verspätung_minuten??r.delay??0)||0;if(r.landed||r.gelandet||/gelandet|landed|arrived/.test(raw))return{key:'landed',label:'Gelandet'};if(delay>0||/verspät|delay|late/.test(raw))return{key:'delayed',label:delay>0?`+${delay} Min.`:'Verspätet'};if(/pünkt|on.?time|scheduled/.test(raw))return{key:'on-time',label:'Pünktlich'};return{key:'unknown',label:'Keine Live-Daten'}}function flightStatusMarkup(r){const x=flightStatusInfo(r);return `<span class="flight-status ${x.key}">${esc(x.label)}</span>`}
function timeMarkup(r){const plan=planTimeOf(r);const current=effectiveTime(r);if(current&&plan&&current!==plan)return `<div class="time-stack"><div class="plan-small">${esc(plan)}</div><div class="current-large">${esc(current)}</div></div>`;return `<div class="time-single">${esc(current||plan||'--:--')}</div>`}
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
  return `<article class="ride ${cls(i)} ${r.isBundle?'bundle':''}" data-id="${esc(r.id)}"><span class="stripe"></span><div class="left"><div class="price">${money(r.price)}</div>${timeMarkup(r)}<div class="driver-left">${esc(r.driver||'Offen')}</div>${r.isBundle?'<div class="bundle-badge">BÜNDELFAHRT</div>':''}</div><div class="mid"><div class="route">${esc(bundleRoute)}</div><div class="partner">${esc(ridePartnerLabel(r))}</div><div class="meta">✈ ${esc(r.flightNumber||'–')} ${flightStatusMarkup(r)} &nbsp; 🚘 ${esc(r.vehicle)} &nbsp; 👤 ${r.persons||'–'}</div>${bundleFlightLocation}${stopRows}</div><div class="chev">›</div></article>`
}
function render(){showView('list');const vr=visualRides(rides);const isDone=r=>r._bundleMemberIds?r._bundleMemberIds.every(id=>done.has(id)):done.has(r.id);const byTime=(a,b)=>minutesOf(effectiveTime(a))-minutesOf(effectiveTime(b));const open=vr.filter(r=>!isDone(r)&&matches(r)).sort(byTime);const fin=vr.filter(r=>isDone(r)&&matches(r)).sort(byTime);
$('summary').textContent=`${mode==='all'?open.length+fin.length:open.length} Fahrten · ${driverFilter||'Alle Fahrer'}`;

const stats=$('dashboardStats');

if(stats){
 const drivers=[...new Set(rides.map(r=>r.driver).filter(Boolean))];
 const flights=[...new Set(rides.map(r=>r.flightNumber).filter(Boolean))];

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
 <b>${rides.filter(r=>r.flightStatus).length}</b>
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

function openCockpit(id){active=visualRides(rides).find(r=>r.id===id)||rides.find(r=>r.id===id);if(!active)return;showView('cockpit');const cockpitPlan=planTimeOf(active)||'--:--';const cockpitCurrent=effectiveTime(active)||'--:--';$('planTime').textContent=cockpitPlan;$('planTime').classList.toggle('plan-replaced',Boolean(cockpitPlan&&cockpitCurrent&&cockpitPlan!=='--:--'&&cockpitCurrent!==cockpitPlan));$('currentTime').textContent=cockpitCurrent;const source=effectiveSource(active);$('currentTimeLabel').textContent=source==='live'?'LIVE-ABHOLZEIT':source==='dispo'?'DISPO-ABHOLZEIT':'AKTUELLE ABHOLZEIT';$('driverA').textContent=$('driverB').textContent=active.driver||'Offen';$('overdue').textContent='';$('flightNum').textContent='✈ '+(active.flightNumber||'–');$('flightLoc').textContent=active.flightLocation?active.flightLocation+(active.iata?' ('+active.iata+')':''):'Flugort nicht verfügbar';const fsi=flightStatusInfo(active);$('cockFlightStatus').className='flight-status cock-flight-status '+fsi.key;$('cockFlightStatus').textContent=fsi.label;$('partner').textContent=active.partner||active.airline||'–';$('company').textContent=active.company||'–';const routeStops=Array.isArray(active.routeStops)?[...active.routeStops].sort((a,b)=>a.order-b.order):[];const routeBox=$('routeBox');if(active.isBundle&&routeStops.length){const stopHtml=routeStops.map((st,i)=>`<div class="bundle-route-stop ${i===routeStops.length-1?'final':''}"><span class="bundle-route-marker" style="border-color:${isAirport(st.name)?'#00a8ff':'#b45cff'}"></span><div><div class="bundle-route-name">${i+1}. ${esc(st.name)}</div><div class="bundle-route-meta">${st.persons||'–'} Pers. · ${st.type==='destination'?'Ziel':st.type==='start'?'Start':st.type==='pickup'?`${i+1}. Abholung`:`${i+1}. Stopp`}</div></div></div>`).join('');routeBox.innerHTML=`<div style="grid-column:1/-1;width:100%"><div class="bundle-route-title">BÜNDELFAHRT · ${routeStops.length} STOPPS</div><div class="bundle-route-list">${stopHtml}</div></div>`}else{routeBox.innerHTML=`<div class="timeline"><div class="circle"></div><div class="dash"></div><div class="circle bluec"></div></div><div><div id="pickup" class="place">${esc(active.pickup||'–')}</div><div id="pickupMeta" class="small">${active.persons||'–'} Pers. · Abholung</div><div id="destination" class="place">${esc(active.destination||'–')}</div><div id="destMeta" class="small">${active.persons||'–'} Pers. · Ziel</div></div>`;}$('persons').textContent=active.persons||'–';$('vehicle').textContent=active.vehicle||'–';$('price').textContent=money(active.price);$('price').title=active.isBundle?`${active.invoiceCount||1} Rechnung${(active.invoiceCount||1)===1?'':'en'}`:'';const activeDone=(active._bundleMemberIds||[active.id]).every(id=>done.has(id));$('doneBtn').textContent=activeDone?'Wieder öffnen':'Erledigt';$('statusBadge').textContent=activeDone?'ERLEDIGT':'PÜNKTLICH';renderDispatcherControls();renderDriverControls()}

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
  alert('ATMS-Daten wurden zurückgesetzt.');location.reload();
}


/* FLIGHT-001 – Gemini-Flugprüfung (halbautomatisch, ohne API) */
function flightDirectionForGemini(r){
  const d=directionOf(r);
  if(d==='airport_to_hotels')return'arrival';
  if(d==='hotels_to_airport')return'departure';
  return'unknown';
}

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
function saveFlightCache(list){
  localStorage.setItem(FLIGHT_CACHE,JSON.stringify((Array.isArray(list)?list:[]).slice(0,400)));
}
function upsertFlightCache(entries){
  if(!Array.isArray(entries)||!entries.length)return;
  let cache=getFlightCache();
  for(const entry of entries){
    const fp=String(entry.fingerprint||'');
    const rideId=String(entry.rideId||'');
    cache=cache.filter(x=>{
      const sameFingerprint=fp&&String(x.fingerprint||'')===fp;
      const sameRide=rideId&&String(x.rideId||'')===rideId;
      return !(sameFingerprint||sameRide);
    });
    cache.unshift(entry);
  }
  saveFlightCache(cache);
}
function findFlightCacheForRide(r){
  const flight=flightCacheNumber(r?.flightNumber||r?.arrivalFlight||r?.departureFlight);
  if(!flight)return null;
  const direction=flightDirectionForGemini(r);
  const fingerprint=flightRideFingerprint(r);
  const rideId=String(r?.id||'');
  const rideDate=String(r?.date||'').trim();
  const today=berlinDate();
  const candidates=getFlightCache().filter(x=>{
    if(!x||x.verified!==true)return false;
    if(flightCacheNumber(x.flightNumber)!==flight)return false;
    if(x.direction&&direction!=='unknown'&&x.direction!=='unknown'&&x.direction!==direction)return false;
    const exactRide=rideId&&String(x.rideId||'')===rideId;
    const exactFingerprint=fingerprint&&String(x.fingerprint||'')===fingerprint;
    if(!exactRide&&!exactFingerprint)return false;
    if(rideDate)return !x.date||String(x.date)===rideDate;
    const cacheDay=String(x.date||'').trim()||berlinDate(x.checkedAt||new Date());
    return cacheDay===today;
  });
  candidates.sort((a,b)=>new Date(b.checkedAt||0)-new Date(a.checkedAt||0));
  return candidates[0]||null;
}
function applyFlightCacheToRides(source){
  let changed=0;
  const out=(Array.isArray(source)?source:[]).map(r=>{
    const hit=findFlightCacheForRide(r);
    if(!hit)return r;
    const nextLocation=String(hit.flightLocation||'').trim();
    const nextIata=String(hit.iata||'').trim().toUpperCase();
    if(!nextLocation)return r;
    const nextDate=String(r.date||'').trim() || String(hit.date||'').trim();
    const sameLocation=String(r.flightLocation||'').trim()===nextLocation;
    const sameIata=String(r.iata||'').trim().toUpperCase()===nextIata;
    const sameCheck=String(r.flightCheckedAt||'')===String(hit.checkedAt||'');
    const sameDate=String(r.date||'').trim()===nextDate;
    if(sameLocation&&sameIata&&sameCheck&&sameDate)return r;
    changed++;
    return {
      ...r,
      date:nextDate,
      flightLocation:nextLocation,
      iata:nextIata,
      flightCheckConfidence:'verified',
      flightCheckedAt:hit.checkedAt||r.flightCheckedAt||''
    };
  });
  return {rides:out,changed};
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
    const flightTime=first(r.flightTime,r.flugzeit,r.flight_time);
    const locationFromPlan=first(r.locationFromPlan,r.flightLocation,r.flugort,r.ort);
    const key=[flight,date,direction,flightTime].join('|');
    if(!map.has(key))map.set(key,{
      flightNumber:flight,
      date,
      dateAssumed,
      flightTime:flightTime||null,
      direction,
      locationFromPlan
    });
  }
  return [...map.values()];
}
function buildGeminiFlightPrompt(){
  const items=flightCheckItems();
  if(!items.length)throw new Error('Keine Flugnummern in der aktuellen Planliste gefunden.');
  return `ATMS PRO – FLIGHT-007 DAY-002 strikte aktuelle Flugprüfung

Prüfe JEDE unten aufgeführte Flugnummer für den angegebenen Flugtag anhand aktueller, DATUMSSPEZIFISCHER Webdaten. Prüfe jeden Eintrag bei diesem Auftrag neu. Eine Flugnummer darf niemals allein aufgrund einer bekannten, früheren oder typischen Route einem Ort zugeordnet werden.

VERBINDLICHE VERIFIKATIONSREGELN:
1. direction=arrival: Gesucht ist der HERKUNFTSORT des konkreten Fluges nach Düsseldorf (DUS).
2. direction=departure: Gesucht ist der ZIELORT des konkreten Fluges ab Düsseldorf (DUS).
3. Verwende date EXAKT. Verifiziere ausdrücklich, dass die Flugnummer an diesem Datum mit Düsseldorf (DUS) als passendem Start- oder Zielairport existiert.
4. Allgemeine Flugpläne, typische Routen, historische Routenzuordnungen oder gespeicherte Flugnummer→Ort-Zuordnungen reichen NICHT.
5. status="verified" UND confidence="high" sind NUR erlaubt, wenn mindestens ZWEI voneinander unabhängige, datumsspezifische Quellen dieselbe konkrete Route bestätigen.
6. Mindestens eine der zwei Quellen soll nach Möglichkeit eine Primärquelle sein: Flughafen Düsseldorf oder offizielle Airline-Flugstatus-/Flugplanquelle. Die zweite Quelle soll unabhängig davon sein.
7. Wenn nur EINE geeignete Quelle gefunden wird: status="needs_manual_check" und confidence="medium" oder "low". NIEMALS verified/high.
8. Wenn keine geeignete datumsspezifische Quelle gefunden wird, Quellen widersprechen oder die konkrete DUS-Verbindung nicht sicher bestätigt werden kann: status="needs_manual_check". NICHT raten.
9. flightTime ist ein zusätzliches Unterscheidungsmerkmal. Wenn mehrere passende Flüge existieren und die Zuordnung ohne flightTime nicht eindeutig ist: status="needs_manual_check".
10. locationFromPlan ist ausschließlich ein Vergleichswert und KEINE Quelle. Prüfe auch vorhandene Planorte vollständig neu.
11. Weicht ein sicher verifiziertes Ergebnis von locationFromPlan ab, setze conflict=true.
12. Erfinde keine Orte, IATA-Codes, Quellen, URLs oder Prüfzeiten.
13. sources MUSS ein JSON-Array sein. Jede Quelle muss mindestens "name" und "url" enthalten. Nur tatsächlich für diesen Flug und dieses Datum verwendete Quellen eintragen.
14. Bei verified/high müssen mindestens zwei unterschiedliche sources-Einträge vorhanden sein.
15. sourceNote soll die Prüfung kurz zusammenfassen, darf aber sources nicht ersetzen.
16. checkedAt muss der tatsächliche Zeitpunkt dieser Webprüfung in ISO-8601-UTC sein. ATMS speichert zusätzlich selbst seinen Übernahmezeitpunkt.
17. Verwende EXAKT die unten definierten Feldnamen. Keine alternativen Namen wie flight_number, city, notes oder ein reines Array.
18. Antworte ausschließlich mit EINEM gültigen JSON-Objekt gemäß dem Schema. Kein Markdown, keine Erklärung vor oder nach dem JSON.

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
function parseGeminiFlightResult(text){
  const obj=JSON.parse(clean(String(text||'')));
  if(!obj || Array.isArray(obj) || typeof obj!=='object'){
    throw new Error('FLIGHT-007 erwartet ein JSON-Objekt mit dem Feld "flights".');
  }
  if(!Array.isArray(obj.flights) || !obj.flights.length){
    throw new Error('FLIGHT-007: Feld "flights" fehlt oder enthält keine Flüge.');
  }

  const requiredFields=[
    'flightNumber','date','dateAssumed','flightTime','direction',
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

    const conflict=Boolean(x.conflict);
    // CORE-001A: conflict=true darf niemals automatisch als verifiziert gelten.
    const claimedVerified=status==='verified' && confidence==='high' && Boolean(location) && !conflict;
    const verified=claimedVerified && sourceCount>=2;

    return {
      flightNumber,
      date:String(x.date||'').trim(),
      dateAssumed:Boolean(x.dateAssumed),
      flightTime:String(x.flightTime||'').trim(),
      direction,
      flightLocation:location,
      iata,
      confidence:verified?'verified':'uncertain',
      status:verified?'verified':'needs_manual_check',
      conflict,
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
    const box=$('geminiFlightResult');
    const checked=parseGeminiFlightResult(box?.value||'');
    // ATMS setzt den tatsächlichen lokalen Übernahme-/Prüfzeitpunkt selbst.
    // Ein von Gemini gelieferter checkedAt-Wert wird nicht als verlässlicher Zeitstempel gespeichert.
    const atmsCheckedAt=new Date().toISOString();

    // CORE-001A: Wenn gerade eine Planliste analysiert wird, müssen die Ergebnisse
    // direkt auf diese staged Liste angewendet werden. Alte gespeicherte Fahrten
    // und localStorage dürfen dabei nicht als Zwischenweg dienen.
    if(typeof window.ATMSPlanImportApplyGeminiFlightResults==='function' &&
       typeof window.ATMSPlanImportHasStagedRides==='function' &&
       window.ATMSPlanImportHasStagedRides()){
      const staged=window.ATMSPlanImportApplyGeminiFlightResults(checked,atmsCheckedAt);
      if(staged?.handled){
        if(box)box.value='';
        const status=$('geminiFlightStatus');
        const appliedFlights=Number(staged.appliedFlights||0);
        const matchedFlights=Number(staged.matchedFlights||0);
        const manualFlights=Number(staged.manualFlights||0);
        const appliedRides=Number(staged.appliedRides||0);
        const matchedRides=Number(staged.matchedRides||0);
        // CORE-001B: Benutzeranzeige zählt eindeutige Flüge statt intern gematchter
        // Fahrten. Bündelfahrten mit zwei Zeilen ergeben damit z. B. "1 Flugort übernommen".
        if(status)status.textContent=`${matchedFlights} Flug/Flüge geprüft · ${appliedFlights} Flugort(e) übernommen${manualFlights?` · ${manualFlights} manuell prüfen`:''}${matchedRides!==matchedFlights?` · ${matchedRides} Fahrt(en) betroffen`:''}${staged.downgraded?` · ${staged.downgraded} wegen <2 Quellen heruntergestuft`:''}.`;
        try{window.dispatchEvent(new CustomEvent('atms:gemini-flight-result',{detail:{checked,scope:'staged-plan',appliedAt:atmsCheckedAt}}));}catch(_){}
        if(appliedFlights>0){
          showToast(`${appliedFlights} Flugort${appliedFlights===1?'':'e'} im aktuellen Plan übernommen`,'ok');
        }else if(manualFlights>0){
          showToast(`0 Flugorte übernommen · ${manualFlights} manuell prüfen`,'warn');
        }else{
          showToast(`0 Flugorte übernommen · kein passender aktueller Flug gefunden`,'warn');
        }
        return;
      }
    }

    let updated=0,uncertain=0,downgraded=0;
    const cacheEntries=[];
    rides=rides.map(r=>{
      if(!r.flightNumber)return r;
      const flight=flightCacheNumber(r.flightNumber);
      const date=String(r.date||'').trim();
      const direction=flightDirectionForGemini(r);
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

      const verified=hit.confidence==='verified'&&!hit.conflict&&hit.flightLocation&&hit.flightLocation!=='Flugort prüfen';
      const checkedAt=atmsCheckedAt;
      updated++;if(!verified)uncertain++;if(hit.verificationDowngraded)downgraded++;

      cacheEntries.push({
        rideId:String(r.id||''),
        fingerprint:flightRideFingerprint(r),
        flightNumber:flight,
        direction,
        date:date||String(hit.date||'').trim(),
        flightTime:flightTime||String(hit.flightTime||'').trim(),
        flightLocation:verified?hit.flightLocation:'',
        iata:verified?hit.iata:'',
        verified:Boolean(verified),
        conflict:Boolean(hit.conflict),
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
    try{window.dispatchEvent(new CustomEvent('atms:gemini-flight-result',{detail:{checked,scope:'stored-rides',appliedAt:atmsCheckedAt}}));}catch(_){}
    if(box)box.value='';
    const status=$('geminiFlightStatus');if(status)status.textContent=`${updated} Fahrt(en) geprüft${uncertain?` · ${uncertain} unsicher → vorhandener Flugort bleibt · manuell prüfen`:''}${downgraded?` · ${downgraded} wegen <2 Quellen heruntergestuft`:''}.`;
    showToast(`${updated} Flugdaten übernommen`,'ok');
    render();
  }catch(e){const status=$('geminiFlightStatus');if(status)status.textContent='Fehler: '+e.message;showToast('Gemini-Ergebnis ungültig','warn');}
}
function ensureGeminiFlightPanel(){
  if($('geminiFlightPanel'))return;
  const load=$('loadBtn'),view=$('importView');if(!load||!view)return;
  const panel=document.createElement('section');panel.id='geminiFlightPanel';panel.style.cssText='margin:16px 0;padding:14px;border:1px solid rgba(255,255,255,.16);border-radius:14px;background:rgba(255,255,255,.04)';
  panel.innerHTML=`<div style="font-weight:800;margin-bottom:6px">🤖 Gemini-Flugprüfung</div><div style="font-size:13px;opacity:.8;margin-bottom:10px">Prüft Flugnummer + Datum neu. Keine feste Flugnummer→Ort-Zuordnung.</div><button type="button" id="copyGeminiFlightBtn" style="width:100%;padding:12px;border-radius:10px;font-weight:800">🤖 Gemini-Prüfauftrag kopieren</button><textarea id="geminiFlightPromptFallback" class="hidden" style="width:100%;min-height:120px;margin-top:10px" readonly></textarea><textarea id="geminiFlightResult" placeholder="Gemini-JSON hier einfügen" style="width:100%;min-height:120px;margin-top:10px"></textarea><button type="button" id="applyGeminiFlightBtn" style="width:100%;padding:12px;border-radius:10px;font-weight:800;margin-top:8px">✓ Geprüfte Flugorte übernehmen</button><div id="geminiFlightStatus" style="font-size:12px;opacity:.8;margin-top:8px">Noch keine Flugprüfung durchgeführt.</div>`;
  load.parentElement?.insertBefore(panel,load.nextSibling);
  $('copyGeminiFlightBtn')?.addEventListener('click',copyGeminiFlightPrompt);
  $('applyGeminiFlightBtn')?.addEventListener('click',applyGeminiFlightResult);
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

  try{
    localStorage.setItem('atms_import_previous_v1',JSON.stringify({
      savedAt:new Date().toISOString(),
      rides
    }));
  }catch(_){}

  // Planlisten-Import: neue Liste ersetzt alte Liste vollständig.
  // Alte Bestätigungen werden NICHT auf neue Fahrten übertragen, da neue Importe neue IDs besitzen.
  rides=newRides;
  const corrected=applyRideOverrides(rides);
  rides=corrected.rides;
  done=new Set([...done].filter(id=>rides.some(r=>r.id===id)));
  save();

  return {
    cancelled:false,
    mode:'replace',
    count:rides.length
  };
}



/* DEV 14.5.2 – Live-Disposition Logik */
let liveExpanded=false,liveSuggested=null,liveEtaRunId=0,liveEtaResults=new Map();
function getLiveSettings(){try{return Object.assign({driverId:'',consentByDriver:{},warnThreshold:7,mode:'standard',lastGeo:null,mapboxToken:'',stopBufferMinutes:5},JSON.parse(localStorage.getItem(LIVE_SETTINGS)||'{}'))}catch{return{driverId:'',consentByDriver:{},warnThreshold:7,mode:'standard',lastGeo:null,mapboxToken:'',stopBufferMinutes:5}}}
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
  const points=routePointsForRide(r);
  if(!points.length)return'';
  const hasGeo=geo&&Number.isFinite(Number(geo.lat))&&Number.isFinite(Number(geo.lng));
  const origin=hasGeo?`${Number(geo.lat)},${Number(geo.lng)}`:points[0];
  const destination=points.at(-1);
  const waypoints=(hasGeo?points.slice(0,-1):points.slice(1,-1)).filter(Boolean);
  const params=new URLSearchParams({api:'1',origin,destination,travelmode:'driving'});
  if(waypoints.length)params.set('waypoints',waypoints.join('|'));
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
function routeLabelForRide(r){const points=routePointsForRide(r);return points.length?points.join(' → '):'Keine Route verfügbar'}
function navigationSearchQuery(name){
  const n=String(name||'').trim();
  if(!n)return'';
  if(isAirport(n))return'Düsseldorf Airport, Flughafenstraße, Düsseldorf, Germany';
  if(/marriott\s*seestern|seestern\s*dus/i.test(n))return'Courtyard by Marriott Düsseldorf Seestern, Düsseldorf, Germany';
  if(/holiday\s*inn/i.test(n))return'Holiday Inn Düsseldorf - Neuss, Germany';
  if(/nh\s*nord/i.test(n))return'NH Düsseldorf City Nord, Düsseldorf, Germany';
  return /düsseldorf|duesseldorf|dus/i.test(n)?`${n}, Germany`:`${n}, Düsseldorf, Germany`;
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
function initLiveDisposition(){bindClick('liveEtaRefreshBtn',refreshLiveEta);bindClick('liveShiftToggleBtn',toggleDriverShift);bindClick('liveModeStandard',()=>setLiveMode('standard'));bindClick('liveModeRoute',()=>setLiveMode('route'));bindClick('liveGetPositionBtn',requestLivePosition);const sel=$('liveDriverSelect');if(sel)sel.addEventListener('change',e=>{const activeSession=getDriverSession();if(activeSession.active&&e.target.value!==activeSession.driverId){showToast(`Schicht von ${activeSession.driverName} zuerst beenden`,'warn');e.target.value=activeSession.driverId;return}const s=getLiveSettings();s.driverId=e.target.value;saveLiveSettings(s);const d=liveDriverList().find(x=>x.id===s.driverId);addLiveEvent(`Fahrer für die Routenprüfung ausgewählt: ${d?.name||'unbekannt'}. Standort dieses Handys muss für diesen Fahrer bestätigt werden.`);const btn=$('liveGetPositionBtn');if(btn)btn.textContent='📍 Standort dieses Handys verwenden';renderLiveDisposition()});const consent=$('liveTrackingConsent');if(consent)consent.addEventListener('change',e=>{const s=getLiveSettings();if(!s.consentByDriver)s.consentByDriver={};s.consentByDriver[s.driverId]=e.target.checked;saveLiveSettings(s);addLiveEvent(`${e.target.checked?'Trackingfreigabe erteilt':'Trackingfreigabe beendet'} für ${liveDriverList().find(x=>x.id===s.driverId)?.name||'Fahrer'}.`);renderLiveDisposition()});bindClick('liveRefreshBtn',renderLiveDisposition);bindClick('liveMoreRidesBtn',()=>{liveExpanded=!liveExpanded;renderLiveDisposition()});bindClick('liveApplySolutionBtn',applyLiveSolution);const th=$('liveWarnThreshold');if(th)th.addEventListener('change',e=>{const s=getLiveSettings();s.warnThreshold=Math.max(1,Math.min(60,Number(e.target.value)||7));saveLiveSettings(s);renderLiveDisposition()});bindClick('liveOpenMapBtn',()=>{const id=$('liveOpenMapBtn').dataset.rideId,r=visualRides(rides).find(x=>String(x.id)===String(id));if(!r)return;const settings=getLiveSettings(),driver=liveDriverList().find(x=>x.id===settings.driverId),geo=settings.lastGeo&&driver&&settings.lastGeo.driverId===driver.id?settings.lastGeo:null,url=googleMapsRouteUrl(r,geo);if(!url){showToast('Keine vollständige Route verfügbar','warn');return}window.open(url,'_blank')})}

function safeEl(id){return document.getElementById(id)}
function bindClick(id,handler){const el=safeEl(id);if(el)el.addEventListener('click',handler)}
function showAppError(error){
  console.error('ATMS Startfehler:',error);
  const box=safeEl('appError');
  if(box){box.hidden=false;box.textContent='ATMS-Fehler: '+(error&&error.message?error.message:String(error));}
}
function initApp(){
  try{
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
    bindClick('mapBtn',()=>{if(active){const rs=active.isBundle&&Array.isArray(active.routeStops)?active.routeStops:[];const origin=rs.length?rs[0].name:(active.pickup||'');const destination=rs.length?rs[rs.length-1].name:(active.destination||'');const waypoints=rs.length>2?rs.slice(1,-1).map(s=>s.name).join('|'):'';window.open(`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}${waypoints?'&waypoints='+encodeURIComponent(waypoints):''}`,'_blank')}});
    bindClick('doneBtn',()=>{if(!active)return;const ids=active._bundleMemberIds||[active.id];const allDone=ids.every(id=>done.has(id));ids.forEach(id=>allDone?done.delete(id):done.add(id));save();openCockpit(active.id)});
    const fileInput=safeEl('fileInput');if(fileInput)fileInput.addEventListener('change',async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;safeEl('jsonInput').value=await f.text();safeEl('importStatus').textContent='Datei geladen. Jetzt „Fahrten laden“ tippen.'});
    bindClick('loadBtn',()=>{try{const incoming=parse(safeEl('jsonInput').value);const result=applyImportedRides(incoming);if(result.cancelled){safeEl('importStatus').textContent='Import abgebrochen. Die aktuelle Planliste bleibt erhalten.';return}safeEl('importStatus').textContent=result.mode==='merge'?`Planlisten zusammengeführt: ${result.count} Fahrten.`:`Planliste ersetzt: ${result.count} Fahrten geladen.`;showToast(result.mode==='merge'?`${result.count} Fahrten zusammengeführt`:`${result.count} Fahrten importiert`,'ok');mode='rides';render()}catch(e){safeEl('importStatus').textContent='Fehler: '+e.message}});
    bindClick('clearBtn',()=>{safeEl('jsonInput').value='';rides=[];done.clear();save();safeEl('importStatus').textContent='Liste geleert.'});
    document.querySelectorAll('[data-nav]').forEach(b=>b.addEventListener('click',()=>{const n=b.dataset.nav;if(n==='settings'){document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x===b));showView('import');safeEl('cockpitDispatcherSelect')?.addEventListener('change',e=>setCurrentDispatcher(e.target.value));
    safeEl('cockpitDriverSelect')?.addEventListener('change',renderDriverControls);
    try{loadWhatsappSettings();renderNavigationSettings();updateBackupUI()}catch(e){showAppError(e)}}else if(n==='messages'){alert('Nachrichten sind für eine spätere Version vorbereitet.')}else if(n==='live'){renderLiveDisposition()}else if(n==='all'){openDrivers()}else{mode='rides';document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x===b));render()}}));

    ensureGeminiFlightPanel();
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

window.applyImportedRides=applyImportedRides;window.showToast=showToast;window.render=render;

window.buildGeminiFlightPrompt=buildGeminiFlightPrompt;window.copyGeminiFlightPrompt=copyGeminiFlightPrompt;window.applyGeminiFlightResult=applyGeminiFlightResult;
