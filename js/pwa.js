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
