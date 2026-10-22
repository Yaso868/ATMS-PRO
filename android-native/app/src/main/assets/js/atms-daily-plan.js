// ATMS PRO – Produkt-First Tagesansicht, lokale TEST-Variante.
// Reine Anzeige-Auswahl: NIE Bestandsfahrten, erledigte Markierungen oder Backups löschen.
(function(root){
  'use strict';
  const KEY='atms_active_plan_day_v1';
  const isoPattern=/^\d{4}-\d{2}-\d{2}$/;
  function valid(date){
    const s=String(date||'');
    if(!isoPattern.test(s))return false;
    const dt=new Date(s+'T12:00:00');
    return !Number.isNaN(dt.getTime()) && dt.getFullYear()===Number(s.slice(0,4)) && dt.getMonth()+1===Number(s.slice(5,7)) && dt.getDate()===Number(s.slice(8,10));
  }
  function today(now){
    const d=now instanceof Date?now:new Date();
    return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
  }
  function next(date){
    if(!valid(date))return '';
    const dt=new Date(date+'T12:00:00');
    dt.setDate(dt.getDate()+1);
    return today(dt);
  }
  function rideDay(ride){
    const r=ride||{};
    // Mitternacht/Folgetag: expliziter Plantag geht vor dem Fahrt-Kalendertag.
    const plan=String(r.planDate||r.plan_date||'').trim();
    if(plan)return valid(plan)?plan:''; // Nie einen fehlerhaften Plantag still ersetzen.
    const raw=String(r.date||r.datum||'').trim();
    return valid(raw)?raw:'';
  }
  function choose(storage){
    let current=today();
    try{const saved=storage?.getItem(KEY);if(valid(saved))current=saved;}catch(_){ }
    return {
      get(){return current;},
      select(date){
        if(!valid(date))return false;
        try{
          const prior=storage.getItem(KEY);
          storage.setItem(KEY,date);
          if(storage.getItem(KEY)!==date){
            if(prior===null)storage.removeItem(KEY); else storage.setItem(KEY,prior);
            return false;
          }
          current=date;
          return true;
        }catch(_){return false;}
      }
    };
  }
  const store=choose(root.localStorage);
  root.ATMSDailyPlan={
    get:()=>store.get(), select:d=>store.select(d), valid, today, next, rideDay,
    forDay:(list,date)=>Array.isArray(list)?list.filter(r=>rideDay(r)===date):[],
    undated:list=>Array.isArray(list)?list.filter(r=>!rideDay(r)):[],
    importDay:list=>{
      if(!Array.isArray(list)||!list.length)return '';
      const dates=[...new Set(list.map(rideDay))];
      return dates.length===1?dates[0]:'';
    }
  };
})(window);
