// ATMS PRO P107.1 – browser/node shared OCR-integrity helpers.
// Production logic is generic. Historical concrete values belong only in regression fixtures.
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.ATMSOcrIntegrityCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const text=v=>v===null||v===undefined?'':String(v).trim();
  const flight=v=>{
    const n=text(v).toUpperCase().replace(/\s+/g,'');
    if(!n||!/[A-Z]/.test(n)||!/\d/.test(n)||!/^[A-Z0-9]{2,4}\d{1,4}[A-Z]?$/.test(n))return'';
    return n;
  };
  function singleDeletionPrefixMatch(longPrefix,shortPrefix){
    if(!longPrefix||!shortPrefix||longPrefix.length!==shortPrefix.length+1)return false;
    for(let drop=0;drop<longPrefix.length;drop++)if(longPrefix.slice(0,drop)+longPrefix.slice(drop+1)===shortPrefix)return true;
    return false;
  }
  function boundaryGlyphShift(initialValue,candidateValue){
    const initial=flight(initialValue),candidate=flight(candidateValue);
    if(!/^[A-Z]{3}\d{1,4}[A-Z]?$/.test(initial)||!/^[A-Z0-9]{2}\d{1,4}[A-Z]?$/.test(candidate))return false;
    if(initial.length!==candidate.length||initial===candidate||initial.slice(0,2)!==candidate.slice(0,2))return false;
    if(!/[A-Z]/.test(initial[2])||!/\d/.test(candidate[2]))return false;
    return initial.slice(3)===candidate.slice(3);
  }
  function safeLongPrefixFlightAlternative(initialValue,candidateValue){
    const initial=flight(initialValue),candidate=flight(candidateValue);
    const im=initial.match(/^([A-Z]{3,4})(\d{1,4}[A-Z]?)$/),cm=candidate.match(/^([A-Z0-9]{2})(\d{1,4}[A-Z]?)$/);
    if(!im||!cm||candidate===initial)return false;
    if(im[2]===cm[2]&&singleDeletionPrefixMatch(im[1],cm[1]))return true;
    return boundaryGlyphShift(initial,candidate);
  }
  function suggestLongPrefixCorrection(initialValue,attempts){
    const initial=flight(initialValue);if(!initial)return null;
    const votes=new Map(),crops=new Map();
    for(const attempt of (Array.isArray(attempts)?attempts:[])){
      const unique=[...new Set((Array.isArray(attempt?.candidates)?attempt.candidates:[]).map(flight).filter(Boolean))];
      if(unique.length!==1)continue;
      const c=unique[0];
      if(c!==initial&&!safeLongPrefixFlightAlternative(initial,c))continue;
      votes.set(c,(votes.get(c)||0)+1);
      if(!crops.has(c))crops.set(c,new Set());
      const crop=Number(attempt?.crop||0);if(crop)crops.get(c).add(crop);
    }
    const ranked=[...votes.entries()].filter(([c])=>c!==initial&&safeLongPrefixFlightAlternative(initial,c)).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
    const winner=ranked[0],runner=ranked[1],initialVotes=Number(votes.get(initial)||0);
    if(!winner||winner[1]<3||winner[1]<=initialVotes||(runner&&winner[1]<=runner[1]))return null;
    return {candidate:winner[0],votes:winner[1],crops:crops.get(winner[0])?.size||0,initialVotes};
  }
  function parseClockTime(value){
    const raw=text(value).replace(/[Oo]/g,'0').replace(/[Il]/g,'1').trim();
    if(!raw)return'';
    let m=raw.match(/^([0-2]?\d)[:.]([0-5]\d)$/);
    if(m){const hh=Number(m[1]),mm=Number(m[2]);if(hh<=23)return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;}
    if(/^\d{3,4}$/.test(raw)){const d=raw.padStart(4,'0'),hh=Number(d.slice(0,2)),mm=Number(d.slice(2));if(hh<=23&&mm<=59)return `${d.slice(0,2)}:${d.slice(2)}`;}
    return'';
  }
  function inferRideTimeColumnFromMatrix(matrix,headerIndex,mapping){
    const rows=Array.isArray(matrix)?matrix:[];
    const pickup=Number(mapping?.pickup);
    if(!Number.isInteger(pickup)||pickup<=0)return null;
    const candidate=pickup-1;
    for(const [field,index] of Object.entries(mapping||{})){
      if(field!=='time'&&Number(index)===candidate)return null;
    }
    let seen=0,valid=0;
    for(const row of rows.slice(Math.max(0,Number(headerIndex||0)+1),Math.max(0,Number(headerIndex||0)+1)+40)){
      if(!Array.isArray(row))continue;
      const raw=text(row[candidate]);
      if(!raw)continue;
      seen++;
      if(parseClockTime(raw))valid++;
    }
    if(valid>=3&&seen>=3&&valid/seen>=0.60)return{index:candidate,valid,seen,reason:'validated_time_column_left_of_pickup'};
    return null;
  }

  function parseEuropeanNumber(value){
    if(typeof value==='number')return Number.isFinite(value)?value:0;
    const normalized=text(value).replace(/[^0-9,.-]/g,'').replace(/\.(?=\d{3}(?:\D|$))/g,'').replace(',','.');
    const number=Number(normalized);return Number.isFinite(number)?number:0;
  }
  function pricePlausibility(value){
    const price=Number(value)||0;
    if(price<=0)return{suspicious:true,suggestion:null,missing:true};
    if(price>=1000){const decimalSuggestion=price/100;const suggestion=decimalSuggestion>=10&&decimalSuggestion<1000?decimalSuggestion:null;return{suspicious:true,suggestion,missing:false};}
    return{suspicious:false,suggestion:null,missing:false};
  }
  function repeatedTextSignature(value){
    const t=text(value).normalize('NFC').toLocaleLowerCase('de-DE');
    return t.replace(/[\s·._~\-–—/:\\|]+/g,'');
  }
  function driverUncertaintyMarker(value){
    const raw=text(value).replace(/\s+/g,' ');if(!raw)return null;
    const m=raw.match(/([?!]+)\s*$/);if(!m)return null;
    const body=raw.slice(0,m.index).trim();
    if(!/^[A-Za-zÄÖÜäöüßÀ-ÿ][A-Za-zÄÖÜäöüßÀ-ÿ\- ]{1,38}$/.test(body))return null;
    return {body,marker:m[1],display:`${body}${m[1]}`};
  }
  const key=v=>text(v).toLocaleLowerCase('de-DE').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'');
  function listConsensusPeerCount(rides,index,candidateValue){
    const list=Array.isArray(rides)?rides:[],target=list[index],candidate=flight(candidateValue);if(!target||!candidate)return 0;
    const direction=text(target.flightDirection),location=key(target.flightLocation);if(!direction||!location)return 0;
    let count=0;
    list.forEach((ride,i)=>{if(i===index)return;if(text(ride?.flightDirection)!==direction)return;if(key(ride?.flightLocation)!==location)return;if(flight(ride?.flightNumber)===candidate)count++;});
    return count;
  }
  return Object.freeze({flight,singleDeletionPrefixMatch,boundaryGlyphShift,safeLongPrefixFlightAlternative,suggestLongPrefixCorrection,parseClockTime,inferRideTimeColumnFromMatrix,parseEuropeanNumber,pricePlausibility,repeatedTextSignature,driverUncertaintyMarker,listConsensusPeerCount});
});
