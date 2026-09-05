(function(){
  const installBox=document.getElementById('pwaInstall');
  const installNow=document.getElementById('pwaInstallNow');
  const installLater=document.getElementById('pwaInstallLater');
  const offline=document.getElementById('pwaOffline');
  let deferredPrompt=null;
  function updateOnline(){
    if(offline) offline.classList.toggle('hidden', navigator.onLine);
  }
  window.addEventListener('online', updateOnline);
  window.addEventListener('offline', updateOnline);
  updateOnline();
  if('serviceWorker' in navigator){
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('./service-worker.js').catch(function(err){
        console.warn('Service Worker konnte nicht registriert werden:', err);
      });
    });
  }
  window.addEventListener('beforeinstallprompt', function(event){
    event.preventDefault();
    deferredPrompt=event;
    if(installBox && localStorage.getItem('atms_pwa_install_later')!=='1') installBox.classList.remove('hidden');
  });
  if(installNow) installNow.addEventListener('click', async function(){
    if(!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt=null;
    installBox.classList.add('hidden');
  });
  if(installLater) installLater.addEventListener('click', function(){
    localStorage.setItem('atms_pwa_install_later','1');
    installBox.classList.add('hidden');
  });
  window.addEventListener('appinstalled', function(){
    deferredPrompt=null;
    if(installBox) installBox.classList.add('hidden');
  });
})();
/* ==========================================================
   ATMS PRO – Fahrtenübersicht UI Phase 1 / Schritt 6
   Statuszeile pro Fahrtenkarte + bessere mobile Lesbarkeit.
   Patch: 08.08.2026 · 23:09 Uhr (Europe/Berlin)
   WICHTIG:
   - Keine Änderung an Fahrtenimport, FLIGHT-003, Flugcache,
     Bündellogik, Cockpit oder LocalStorage.
   - Die bestehende STEP5-Sortierung in app.js bleibt unangetastet.
   - "Pünktlich" wird nur gezeigt, wenn dafür echte aktuelle/
     Dispo-Daten oder ein vorhandener On-Time-Status vorliegen.
   ========================================================== */
(function(){
  'use strict';

  const STYLE_ID='atms-ui-step6-status-style';
  const STATUS_CLASS='ride-statusline';
  function ensureStyle(){
    if(document.getElementById(STYLE_ID)) return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      /* UI Schritt 6 – gut lesbare Statuszeile */
      #listView .ride.${STATUS_CLASS}-ready{grid-template-rows:auto auto}
      #listView .${STATUS_CLASS}{
        grid-column:1 / -1;
        display:grid;
        grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);
        align-items:center;
        gap:8px;
        min-height:39px;
        padding:7px 12px 8px 14px;
        border-top:1px solid rgba(83,136,159,.28);
        background:rgba(0,17,27,.23);
        color:#e5eef4;
        font-size:13px;
        line-height:1.1;
      }
      #listView .${STATUS_CLASS}-side{white-space:nowrap;color:#d6e1e8}
      #listView .${STATUS_CLASS}-side:last-child{text-align:right}
      #listView .${STATUS_CLASS}-side b{font-size:15px;color:#fff;margin-left:3px}
      #listView .${STATUS_CLASS}-state{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        gap:7px;
        min-width:116px;
        font-size:14px;
        font-weight:900;
        letter-spacing:.15px;
        white-space:nowrap;
      }
      #listView .${STATUS_CLASS}-dot{width:9px;height:9px;border-radius:50%;flex:0 0 9px;background:#8296a2}
      #listView .${STATUS_CLASS}-state.on-time{color:#54e20f}
      #listView .${STATUS_CLASS}-state.on-time .${STATUS_CLASS}-dot{background:#54e20f}
      #listView .${STATUS_CLASS}-state.delayed{color:#ff536d}
      #listView .${STATUS_CLASS}-state.delayed .${STATUS_CLASS}-dot{background:#ff3155}
      #listView .${STATUS_CLASS}-state.landed{color:#34c4ff}
      #listView .${STATUS_CLASS}-state.landed .${STATUS_CLASS}-dot{background:#00a8ff}
      #listView .${STATUS_CLASS}-state.unknown{color:#aebfc9}
      #listView .${STATUS_CLASS}-state.unknown .${STATUS_CLASS}-dot{background:#93a7b3}
      /* Die in der Vorschau bestätigte, etwas größere Lesbarkeit. */
      #listView .price,
      #listView .time,
      #listView .time-single,
      #listView .time-stack .current-large{font-size:18px}
      #listView .driver-left{font-size:14px}
      #listView .route{font-size:15px;line-height:1.18}
      #listView .partner{font-size:12px}
      #listView .meta{font-size:13px;line-height:1.2}
      #listView .flightloc{font-size:13px;line-height:1.2}
      #listView .ride.bundle .bundle-stops{font-size:11px;line-height:1.2}
      #listView .ride.bundle .bundle-stop-row b{font-size:11.5px}
      #listView .ride.bundle .bundle-stop-pax{font-size:10.5px}
      #listView .ride.bundle .bundle-badge{font-size:10px}
      #listView .ride.${STATUS_CLASS}-ready .chev{top:calc(50% - 19px)}
      @media(max-width:390px){
        #listView .${STATUS_CLASS}{padding:7px 9px 8px 12px;gap:5px;font-size:12px}
        #listView .${STATUS_CLASS}-side b{font-size:14px}
        #listView .${STATUS_CLASS}-state{min-width:104px;font-size:13px;gap:5px}
        #listView .route{font-size:14px}
        #listView .meta,#listView .flightloc{font-size:12px}
        #listView .ride.bundle .bundle-stops{font-size:10.5px}
        #listView .ride.bundle .bundle-stop-row b{font-size:11px}
        #listView .ride.bundle .bundle-stop-pax{font-size:10px}
      }
    `;
    document.head.appendChild(style);
  }
  function clockMinutes(value){
    const m=String(value||'').trim().match(/^(\d{1,2}):(\d{2})$/);
    if(!m) return null;
    const h=Number(m[1]),min=Number(m[2]);
    if(h<0||h>23||min<0||min>59) return null;
    return h*60+min;
  }
  function minuteDiff(plan,current){
    const p=clockMinutes(plan),c=clockMinutes(current);
    if(p===null||c===null) return null;
    let d=c-p;
    if(d>720) d-=1440;
    if(d<-720) d+=1440;
    return d;
  }
  function rideLookup(){
    try{
      if(typeof visualRides==='function' && typeof rides!=='undefined' && Array.isArray(rides)){
        return new Map(visualRides(rides).map(r=>[String(r.id),r]));
      }
    }catch(_){ }
    return new Map();
  }
  function cardFallback(card){
    const single=card.querySelector('.time-single')?.textContent.trim()||'';
    const plan=card.querySelector('.time-stack .plan-small')?.textContent.trim()||single||'--:--';
    const current=card.querySelector('.time-stack .current-large')?.textContent.trim()||'';
    const badge=card.querySelector('.flight-status');
    const label=(badge?.textContent||'Keine Live-Daten').trim();
    let key='unknown';
    if(badge?.classList.contains('delayed')) key='delayed';
    else if(badge?.classList.contains('on-time')) key='on-time';
    else if(badge?.classList.contains('landed')) key='landed';
    return {plan,current,key,label};
  }
  function timingInfo(card,ride){
    if(!ride) return cardFallback(card);
    const plan=(typeof planTimeOf==='function' ? planTimeOf(ride) : (ride.planTime||ride.time||'')) || '--:--';
    let source='plan';
    try{ if(typeof effectiveSource==='function') source=effectiveSource(ride)||'plan'; }catch(_){ }
    let current='';
    if(source==='live' || source==='dispo'){
      try{ current=typeof effectiveTime==='function' ? effectiveTime(ride) : ''; }catch(_){ current=''; }
    }
    let existing={key:'unknown',label:'Keine Live-Daten'};
    try{ if(typeof flightStatusInfo==='function') existing=flightStatusInfo(ride)||existing; }catch(_){ }
    const explicitDelay=Number(ride.delayMinutes??ride.delay_minutes??ride.verspaetungMinuten??ride.verspätung_minuten??ride.delay??0)||0;
    const diff=current ? minuteDiff(plan,current) : null;
    if(diff!==null){
      if(diff>0) return {plan,current,key:'delayed',label:`+${diff} MIN`};
      return {plan,current,key:'on-time',label:'PÜNKTLICH'};
    }
    if(explicitDelay>0) return {plan,current,key:'delayed',label:`+${explicitDelay} MIN`};
    if(existing.key==='on-time') return {plan,current,key:'on-time',label:'PÜNKTLICH'};
    if(existing.key==='landed') return {plan,current,key:'landed',label:'GELANDET'};
    if(existing.key==='delayed') return {plan,current,key:'delayed',label:String(existing.label||'VERSPÄTET').toUpperCase().replace(/\.$/,'')};
    return {plan,current,key:'unknown',label:'KEINE LIVE-DATEN'};
  }
  function createStatusLine(info){
    const line=document.createElement('div');
    line.className=STATUS_CLASS;
    const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
    const current=info.current||'--:--';
    line.innerHTML=`
      <span class="${STATUS_CLASS}-side">Geplant <b>${safe(info.plan||'--:--')}</b></span>
      <span class="${STATUS_CLASS}-state ${safe(info.key||'unknown')}"><i class="${STATUS_CLASS}-dot"></i>${safe(info.label||'KEINE LIVE-DATEN')}</span>
      <span class="${STATUS_CLASS}-side">Aktuell <b>${safe(current)}</b></span>
    `;
    return line;
  }
  function refreshCards(){
    ensureStyle();
    const lookup=rideLookup();
    document.querySelectorAll('#listView .ride[data-id]').forEach(card=>{
      const id=String(card.dataset.id||'');
      const ride=lookup.get(id);
      const info=timingInfo(card,ride);
      const old=card.querySelector(':scope > .'+STATUS_CLASS);
      if(old) old.remove();
      card.appendChild(createStatusLine(info));
      card.classList.add(STATUS_CLASS+'-ready');
    });
  }
  let raf=0;
  function scheduleRefresh(){
    if(raf) return;
    raf=requestAnimationFrame(()=>{
      raf=0;
      refreshCards();
    });
  }
  function init(){
    ensureStyle();
    scheduleRefresh();
    const list=document.getElementById('rideList');
    if(!list) return;
    const observer=new MutationObserver(()=>scheduleRefresh());
    observer.observe(list,{childList:true,subtree:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();

// ATMS PRO STEP 10 – JFIF/Bilddaten nicht im erweiterten JSON-Feld anzeigen.
// Der direkte Planimport und der Bildimport bleiben unverändert.
(function(){
  'use strict';
  function looksLikeBinaryImageText(value){
    const text=String(value||'');
    if(!text) return false;
    if(text.includes('JFIF') || text.includes('Exif')) return true;
    const replacementCount=(text.match(/\uFFFD/g)||[]).length;
    return replacementCount >= 2;
  }

  function initImportBinaryGuard(){
    const fileInput=document.getElementById('fileInput');
    const jsonInput=document.getElementById('jsonInput');
    if(!fileInput || !jsonInput) return;
    fileInput.addEventListener('change',function(event){
      const file=event.target.files && event.target.files[0];
      if(!file) return;
      const name=String(file.name||'').toLowerCase();
      const type=String(file.type||'').toLowerCase();
      const isJson=name.endsWith('.json') || type==='application/json';
      if(isJson) return;
      // app.js liest den gemeinsamen Datei-Input in älteren Builds zusätzlich als Text.
      // Bei JPG/PNG erscheint dadurch binärer JFIF/Exif-Zeichensalat im Legacy-JSON-Feld.
      // Einige kurze Nachprüfungen fangen auch das asynchrone File.text() sicher ab.
      let checks=0;
      const timer=setInterval(function(){
        checks++;
        if(looksLikeBinaryImageText(jsonInput.value)) jsonInput.value='';
        if(checks>=30) clearInterval(timer);
      },100);
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initImportBinaryGuard,{once:true});
  else initImportBinaryGuard();
})();

/* ==========================================================
   ATMS PRO · CORE-004E · 05.09.2026
   Konsolidierter Sicherheits-/Bedienungs-Hotfix
   - bestehendes Layout unverändert
   - Flugdaten-Editor wieder funktionsfähig
   - OCR-Zeilensicherheitsnetz für verlorene Flugnummern
   - Plan-/Dispo-/Live-Zeit strikt getrennt
   - Live-Landezeit + Standardpuffer 15 Min. unterstützt
   ========================================================== */
(function(){
  'use strict';

  const VERSION='CORE-004E';
  const MANUAL_EDIT_KEY='atms_core004e_manual_flight_edits_v1';
  const OFFSET_KEY='atms_landing_pickup_offset_v1';
  let ocrFlightRecoveryByRow=new Map();

  const str=v=>String(v??'').trim();
  const key=v=>str(v).toLocaleLowerCase('de-DE').replace(/\s+/g,' ');

  function normalizeFlightNo(value){
    let v=str(value).toUpperCase().replace(/\s+/g,'');
    v=v.replace(/^[\[\(\{<"'`´’‘“”|_.,;:\/\\+\-–—]+|[\]\)\}>"'`´’‘“”|_.,;:\/\\+\-–—]+$/g,'');
    if(/^0S\d{1,4}[A-Z]?$/.test(v))v='OS'+v.slice(2);
    if(/^(VAN|PKW|BUS|SPRINTER|TAXI|WG)$/.test(v))return'';
    return v;
  }

  function isFlightNo(value){
    const v=normalizeFlightNo(value);
    if(!v)return false;
    // Mindestens ein Buchstabe im Airline-Prefix; reine Uhrzeiten/Zahlen sind ausgeschlossen.
    const match=v.match(/^([A-Z0-9]{2,3})(\d{1,4})([A-Z]?)$/);
    return Boolean(match && /[A-Z]/.test(match[1]));
  }

  function isAirportName(value){
    const n=key(value);
    return n.includes('dus airport') || n==='dus' || n.includes('flughafen düsseldorf') || n.includes('flughafen duesseldorf') || n.includes('düsseldorf airport') || n.includes('duesseldorf airport');
  }

  function inferFlightDirection(ride){
    if(ride?.flightDirection==='arrival' || ride?.arrivalFlight)return'arrival';
    if(ride?.flightDirection==='departure' || ride?.departureFlight)return'departure';
    const p=isAirportName(ride?.pickup),d=isAirportName(ride?.destination);
    if(p&&!d)return'arrival';
    if(!p&&d)return'departure';
    return'';
  }

  function flightFingerprint(ride){
    return [
      str(ride?.date||ride?.datum),
      Number(ride?.sourceRow||0)||'',
      str(ride?.planTime||ride?.time||ride?.plan_abholzeit),
      key(ride?.pickup||ride?.abholort),
      key(ride?.destination||ride?.zielort),
      key(ride?.driver||ride?.fahrer)
    ].join('|');
  }

  function readManualEdits(){
    try{
      const v=JSON.parse(localStorage.getItem(MANUAL_EDIT_KEY)||'{}');
      return v&&typeof v==='object'&&!Array.isArray(v)?v:{};
    }catch(_){return{}}
  }

  function saveManualEdit(ride,patch){
    const fp=flightFingerprint(ride);
    if(!fp)return;
    const all=readManualEdits();
    all[fp]={...patch,updatedAt:new Date().toISOString()};
    const entries=Object.entries(all).sort((a,b)=>String(b[1]?.updatedAt||'').localeCompare(String(a[1]?.updatedAt||''))).slice(0,300);
    localStorage.setItem(MANUAL_EDIT_KEY,JSON.stringify(Object.fromEntries(entries)));
  }

  function applyStoredManualEdits(list){
    const edits=readManualEdits();
    let changed=0;
    (Array.isArray(list)?list:[]).forEach(ride=>{
      const hit=edits[flightFingerprint(ride)];
      if(!hit)return;
      const no=normalizeFlightNo(hit.flightNumber);
      const loc=str(hit.flightLocation);
      const iata=str(hit.iata).toUpperCase();
      const dir=hit.flightDirection||inferFlightDirection(ride);
      ride.flightNumber=no;
      ride.arrivalFlight=dir==='arrival'?no:'';
      ride.departureFlight=dir==='departure'?no:'';
      ride.flightDirection=dir;
      ride.flightLocation=loc;
      ride.iata=iata;
      ride.flightCheckConfidence='manual';
      ride.flightNeedsManualCheck=Boolean(no);
      ride.manualFlightEditAt=hit.updatedAt||'';
      changed++;
    });
    return changed;
  }

  function applyRecoveredFlightToRide(ride){
    if(!ride || normalizeFlightNo(ride.flightNumber||ride.arrivalFlight||ride.departureFlight))return false;
    const row=Number(ride.sourceRow||0);
    const recovered=normalizeFlightNo(ocrFlightRecoveryByRow.get(row));
    if(!recovered||!isFlightNo(recovered))return false;
    const dir=inferFlightDirection(ride);
    if(!dir)return false; // niemals Richtung raten
    ride.flightNumber=recovered;
    ride.arrivalFlight=dir==='arrival'?recovered:'';
    ride.departureFlight=dir==='departure'?recovered:'';
    ride.flightDirection=dir;
    ride.flightRecoveredFromOcr=true;
    ride.flightRecoverySource='same-ocr-row-unique-flight';
    ride.flightNeedsManualCheck=true; // wird erst durch aktuelle Webprüfung wieder auf false gesetzt
    return true;
  }

  function patchRecoveredFlights(list){
    let n=0;
    (Array.isArray(list)?list:[]).forEach(ride=>{if(applyRecoveredFlightToRide(ride))n++;});
    return n;
  }

  function cleanHeaderKey(value){
    return str(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'');
  }

  function groupOcrLines(words){
    const usable=(words||[]).filter(w=>{
      const conf=Number(w?.confidence??w?.conf??0);
      return str(w?.text)&&conf>=28&&w?.bbox;
    }).map(w=>({
      text:str(w.text),
      x0:Number(w.bbox.x0||0),x1:Number(w.bbox.x1||0),
      y0:Number(w.bbox.y0||0),y1:Number(w.bbox.y1||0),
      cy:(Number(w.bbox.y0||0)+Number(w.bbox.y1||0))/2
    })).sort((a,b)=>a.cy-b.cy||a.x0-b.x0);
    const heights=usable.map(w=>Math.max(1,w.y1-w.y0)).sort((a,b)=>a-b);
    const medianH=heights.length?heights[Math.floor(heights.length/2)]:20;
    const tolerance=Math.max(10,medianH*.72);
    const lines=[];
    usable.forEach(word=>{
      let line=lines.find(item=>Math.abs(item.cy-word.cy)<=tolerance);
      if(!line){line={cy:word.cy,words:[]};lines.push(line)}
      line.words.push(word);
      line.cy=line.words.reduce((s,w)=>s+w.cy,0)/line.words.length;
    });
    lines.forEach(line=>line.words.sort((a,b)=>a.x0-b.x0));
    return lines.sort((a,b)=>a.cy-b.cy);
  }

  function headerScore(line){
    const keys=(line?.words||[]).map(w=>cleanHeaderKey(w.text));
    const joined=keys.join(' ');
    let score=0;
    ['preis','uhrzeit','von','nach','name','firma','pers','ort','fahrer','wg'].forEach(k=>{if(keys.includes(k))score++});
    if(/flug\s*(ang|ank|ankunft)/.test(joined)||keys.some(k=>/^flug(ang|ank|ankunft)$/.test(k)))score++;
    if(/flug\s*(ausg|aus|abg|abflug)/.test(joined)||keys.some(k=>/^flug(ausg|aus|abg|abflug)$/.test(k)))score++;
    if(keys.includes('von')&&keys.includes('nach'))score+=2;
    return score;
  }

  function looksLikeClock(value){
    return /^\d{1,2}[:.]\d{2}$/.test(str(value));
  }

  function captureOcrFlightRecoveries(result){
    try{
      const words=result?.data?.words||[];
      const lines=groupOcrLines(words);
      if(!lines.length)return;
      let headerIndex=-1,best=-1;
      lines.slice(0,35).forEach((line,i)=>{const s=headerScore(line);if(s>best){best=s;headerIndex=i}});
      if(headerIndex<0||best<6)return;
      const map=new Map();
      let matrixRow=1; // Header ist Matrix-Zeile 1; erste Fahrt wird sourceRow=2.
      for(const line of lines.slice(headerIndex+1)){
        const texts=(line.words||[]).map(w=>str(w.text)).filter(Boolean);
        const flights=[...new Set(texts.map(normalizeFlightNo).filter(isFlightNo))];
        const hasTime=texts.some(looksLikeClock)||texts.some(v=>/^\d{3,4}$/.test(str(v).replace(/\D/g,'')));
        if(texts.length<3||(!hasTime&&!flights.length))continue;
        matrixRow++;
        if(flights.length===1)map.set(matrixRow,flights[0]);
      }
      ocrFlightRecoveryByRow=map;
      window.ATMSCore004ERecovery={version:VERSION,rows:Object.fromEntries(map),capturedAt:new Date().toISOString()};
    }catch(error){
      console.warn('CORE-004E OCR-Sicherheitsnetz konnte nicht vorbereitet werden:',error);
    }
  }

  function installTesseractCapture(){
    const t=window.Tesseract;
    if(!t||typeof t.recognize!=='function'||t.__atmsCore004eWrapped)return;
    const original=t.recognize.bind(t);
    t.recognize=async function(...args){
      const result=await original(...args);
      captureOcrFlightRecoveries(result);
      return result;
    };
    t.__atmsCore004eWrapped=true;
  }

  function wrapAutoFlight(){
    const service=window.ATMSAutoFlight;
    if(!service||typeof service.verifyFlights!=='function'||service.__atmsCore004eWrapped)return;
    const original=service.verifyFlights.bind(service);
    service.verifyFlights=async function(list,options){
      const recovered=patchRecoveredFlights(list);
      if(recovered&&typeof window.showToast==='function')window.showToast(`${recovered} Flugnummer aus derselben OCR-Zeile sicher wiederhergestellt`,'ok');
      return original(list,options);
    };
    service.__atmsCore004eWrapped=true;
  }

  function wrapImport(){
    if(typeof window.applyImportedRides!=='function'||window.applyImportedRides.__atmsCore004eWrapped)return;
    const original=window.applyImportedRides;
    const wrapped=function(list){
      patchRecoveredFlights(list);
      applyStoredManualEdits(list);
      return original(list);
    };
    wrapped.__atmsCore004eWrapped=true;
    window.applyImportedRides=wrapped;
  }

  // Manuelle Flugdaten aus dem Cockpit bei Re-Import desselben Plantags erhalten.
  function wrapRideOverrides(){
    try{
      if(typeof applyRideOverrides!=='function'||applyRideOverrides.__atmsCore004eWrapped)return;
      const original=applyRideOverrides;
      const wrapped=function(source){
        const base=original(source);
        const out=Array.isArray(base?.rides)?base.rides:(Array.isArray(source)?source:[]);
        const manualChanged=applyStoredManualEdits(out);
        return {rides:out,changed:Number(base?.changed||0)+manualChanged};
      };
      wrapped.__atmsCore004eWrapped=true;
      applyRideOverrides=wrapped;
      window.ATMSApplyRideOverrides=source=>applyRideOverrides(source).rides;
    }catch(error){console.warn('CORE-004E Override-Schutz nicht aktiv:',error)}
  }

  function addMinutes(time,minutes){
    const m=str(time).match(/^(\d{1,2}):(\d{2})$/);
    if(!m)return'';
    let total=Number(m[1])*60+Number(m[2])+Number(minutes||0);
    total=((total%1440)+1440)%1440;
    return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
  }

  function pickupOffset(){
    const raw=Number(localStorage.getItem(OFFSET_KEY));
    return Number.isFinite(raw)&&raw>=0&&raw<=180?raw:15;
  }

  function directLivePickup(ride){
    const vals=[
      ride?.liveTime,ride?.currentTime,ride?.current_time,ride?.aktuelle_abholzeit,
      ride?.aktuelleZeit,ride?.aktuelle_zeit,ride?.live_abholzeit,ride?.flightradar_abholzeit,
      ride?.verspaetete_abholzeit,ride?.['verspätete_abholzeit'],ride?.livePickupTime,ride?.live_pickup_time
    ];
    return vals.map(str).find(Boolean)||'';
  }

  function landingTime(ride){
    const vals=[
      ride?.flightradar_landezeit,ride?.flightLandingTime,ride?.landingTime,ride?.liveLandingTime,
      ride?.estimatedLandingTime,ride?.etaLanding,ride?.actualLandingTime,ride?.landezeit,
      ride?.estimated_landing_time,ride?.actual_landing_time
    ];
    return vals.map(str).find(Boolean)||'';
  }

  function wrapPlanImportNormForLiveLanding(){
    try{
      const oldNorm=window.norm;
      if(typeof oldNorm!=='function'||oldNorm.__atmsCore004eLandingWrapped)return;
      const wrapped=function(raw,index){
        const hadDirectLive=Boolean(directLivePickup(raw));
        const normalized=oldNorm(raw,index);
        // Wenn nur eine Landezeit geliefert wurde, darf norm() daraus keine dauerhaft gespeicherte
        // Live-Abholzeit machen. Die Abholzeit wird dynamisch mit dem aktuellen 15-Min.-Puffer berechnet.
        if(!hadDirectLive && landingTime(raw) && normalized && typeof normalized==='object') normalized.liveTime='';
        return normalized;
      };
      wrapped.__atmsCore004eLandingWrapped=true;
      window.norm=wrapped;
    }catch(error){console.warn('CORE-004E Live-Landezeit-Normalisierung nicht aktiv:',error)}
  }

  function installTimePriority(){
    try{
      liveTimeOf=function(ride){
        const direct=directLivePickup(ride);
        if(direct)return direct;
        const landing=landingTime(ride);
        return landing?addMinutes(landing,pickupOffset()):'';
      };
      effectiveTime=function(ride){return first(liveTimeOf(ride),dispoTimeOf(ride),planTimeOf(ride))};
      effectiveSource=function(ride){if(liveTimeOf(ride))return'live';if(dispoTimeOf(ride))return'dispo';return'plan'};
      window.ATMSPickupTime={
        version:VERSION,
        getOffset:pickupOffset,
        setOffset(minutes){
          const n=Number(minutes);
          if(!Number.isFinite(n)||n<0||n>180)throw new Error('Landung→Pickup muss zwischen 0 und 180 Minuten liegen.');
          localStorage.setItem(OFFSET_KEY,String(Math.round(n)));
          try{if(typeof render==='function')render()}catch(_){}
          return Math.round(n);
        }
      };
    }catch(error){console.warn('CORE-004E Zeitpriorität konnte nicht aktiviert werden:',error)}
  }

  function ensureFlightEditor(){
    let sheet=document.getElementById('atmsCore004eFlightEditor');
    if(sheet)return sheet;
    sheet=document.createElement('div');
    sheet.id='atmsCore004eFlightEditor';
    sheet.style.cssText='display:none;position:fixed;inset:0;z-index:99998;background:rgba(0,10,16,.78);padding:18px;align-items:center;justify-content:center';
    sheet.innerHTML=`<div style="width:min(520px,100%);background:#062331;border:1px solid #1e607d;border-radius:18px;padding:16px;box-shadow:0 20px 60px rgba(0,0,0,.45);color:#fff;font-family:system-ui,sans-serif">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px"><b style="font-size:20px">✎ Flugdaten ändern</b><span style="flex:1"></span><button id="atmsCore004eClose" type="button" style="border:0;background:#123747;color:#fff;border-radius:10px;padding:8px 11px;font-size:18px">×</button></div>
      <label style="display:block;font-size:12px;color:#9fc0d0;margin:8px 0 4px">Flugnummer</label>
      <input id="atmsCore004eNo" autocomplete="off" autocapitalize="characters" style="width:100%;box-sizing:border-box;border:1px solid #2b6077;border-radius:11px;background:#031923;color:#fff;padding:11px;font-size:18px" placeholder="z. B. EW9577">
      <label style="display:block;font-size:12px;color:#9fc0d0;margin:10px 0 4px">Flugort</label>
      <input id="atmsCore004ePlace" autocomplete="off" style="width:100%;box-sizing:border-box;border:1px solid #2b6077;border-radius:11px;background:#031923;color:#fff;padding:11px;font-size:18px" placeholder="z. B. Palma">
      <label style="display:block;font-size:12px;color:#9fc0d0;margin:10px 0 4px">IATA (optional)</label>
      <input id="atmsCore004eIata" autocomplete="off" autocapitalize="characters" maxlength="3" style="width:100%;box-sizing:border-box;border:1px solid #2b6077;border-radius:11px;background:#031923;color:#fff;padding:11px;font-size:18px" placeholder="PMI">
      <div style="font-size:11px;color:#9fc0d0;line-height:1.35;margin-top:10px">Manuelle Änderungen werden gespeichert, aber bei einer vorhandenen Flugnummer bewusst wieder als „zu prüfen“ markiert. Eine aktuelle Webprüfung kann sie anschließend bestätigen.</div>
      <div style="display:flex;gap:9px;margin-top:14px"><button id="atmsCore004eCancel" type="button" style="flex:1;border:1px solid #2b6077;background:#102f3d;color:#fff;border-radius:11px;padding:11px;font-weight:800">Abbrechen</button><button id="atmsCore004eSave" type="button" style="flex:1;border:0;background:#087b42;color:#fff;border-radius:11px;padding:11px;font-weight:900">Speichern</button></div>
      <div id="atmsCore004eError" style="display:none;margin-top:10px;color:#ffb1bc;font-size:12px"></div>
    </div>`;
    document.body.appendChild(sheet);
    const close=()=>{sheet.style.display='none'};
    sheet.querySelector('#atmsCore004eClose').onclick=close;
    sheet.querySelector('#atmsCore004eCancel').onclick=close;
    sheet.addEventListener('click',event=>{if(event.target===sheet)close()});
    sheet.querySelector('#atmsCore004eSave').onclick=saveFlightEditor;
    return sheet;
  }

  function openFlightEditor(){
    try{
      if(typeof active==='undefined'||!active)return;
      const sheet=ensureFlightEditor();
      sheet.querySelector('#atmsCore004eNo').value=normalizeFlightNo(active.flightNumber||active.arrivalFlight||active.departureFlight);
      sheet.querySelector('#atmsCore004ePlace').value=str(active.flightLocation);
      sheet.querySelector('#atmsCore004eIata').value=str(active.iata).toUpperCase();
      sheet.querySelector('#atmsCore004eError').style.display='none';
      sheet.style.display='flex';
      setTimeout(()=>sheet.querySelector('#atmsCore004eNo')?.focus(),0);
    }catch(error){console.error(error)}
  }

  function saveFlightEditor(){
    const sheet=ensureFlightEditor();
    const errorBox=sheet.querySelector('#atmsCore004eError');
    try{
      if(typeof active==='undefined'||!active)throw new Error('Keine Fahrt ausgewählt.');
      const no=normalizeFlightNo(sheet.querySelector('#atmsCore004eNo').value);
      const place=str(sheet.querySelector('#atmsCore004ePlace').value);
      const iata=str(sheet.querySelector('#atmsCore004eIata').value).toUpperCase();
      if(no&&!isFlightNo(no))throw new Error('Flugnummer bitte prüfen, z. B. EW9577.');
      if(iata&&!/^[A-Z]{3}$/.test(iata))throw new Error('IATA muss aus genau 3 Buchstaben bestehen, z. B. PMI.');
      const dir=inferFlightDirection(active);
      if(no&&!dir)throw new Error('Flugrichtung ist für diese Fahrt nicht eindeutig. ATMS rät nicht.');
      const ids=Array.isArray(active._bundleMemberIds)&&active._bundleMemberIds.length?active._bundleMemberIds:[active.id];
      if(typeof rides==='undefined'||!Array.isArray(rides))throw new Error('Fahrtenliste ist nicht verfügbar.');
      rides.forEach(ride=>{
        if(!ids.includes(ride.id))return;
        const rideDir=dir||inferFlightDirection(ride);
        ride.flightNumber=no;
        ride.arrivalFlight=rideDir==='arrival'?no:'';
        ride.departureFlight=rideDir==='departure'?no:'';
        ride.flightDirection=rideDir;
        ride.flightLocation=place;
        ride.iata=iata;
        ride.flightCheckConfidence='manual';
        ride.flightNeedsManualCheck=Boolean(no);
        ride.manualFlightEditAt=new Date().toISOString();
        saveManualEdit(ride,{flightNumber:no,flightLocation:place,iata,flightDirection:rideDir});
        try{
          if(typeof upsertRideOverride==='function')upsertRideOverride(ride.id,{manualFlightEdit:true,flightNumber:no,flightLocation:place,iata,flightDirection:rideDir,manualFlightEditAt:new Date().toISOString()});
        }catch(_){}
      });
      if(typeof save==='function')save();
      sheet.style.display='none';
      if(typeof window.showToast==='function')window.showToast('Flugdaten gespeichert · aktuelle Prüfung empfohlen','ok');
      if(typeof openCockpit==='function')openCockpit(active.id);
    }catch(error){
      errorBox.textContent=error.message||String(error);
      errorBox.style.display='block';
    }
  }

  function bindFlightEditor(){
    document.addEventListener('click',event=>{
      const button=event.target.closest?.('#cockpitView .edit');
      if(!button)return;
      event.preventDefault();
      event.stopPropagation();
      openFlightEditor();
    },true);
  }

  function init(){
    installTesseractCapture();
    installTimePriority();
    wrapPlanImportNormForLiveLanding();
    wrapRideOverrides();
    wrapImport();
    wrapAutoFlight();
    bindFlightEditor();
    window.addEventListener('atms:firebase-ai-module-ready',()=>setTimeout(wrapAutoFlight,0));
    // Bereits geladene Fahrten nicht verändern, außer gespeicherte explizite manuelle Korrekturen wiederherzustellen.
    try{
      if(typeof rides!=='undefined'&&Array.isArray(rides)){
        const changed=applyStoredManualEdits(rides);
        if(changed&&typeof save==='function')save();
      }
    }catch(_){}
    console.info(`ATMS PRO ${VERSION} aktiv`);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
