// CORE-007D8A1F1D8P113 · 07.10.2026: FINAL PLANLISTEN STABILIZATION – pure helpers for strict boundary-clock cleanup and strong short-code consensus. Historical fixture values remain test-only; no flight/driver/place hardcodes.
// ATMS PRO P110 – Golden Error Pack helpers: neighbor-cell cleanup after proven route-boundary recovery + suspicious mixed flight-prefix support; fail-closed retained.
// ATMS PRO P109.2 – browser/node shared OCR-integrity helpers (generic edge-consensus promotion added; fail-closed retained).
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
    // P110: Neben 3–4 Buchstaben ist ein führendes OCR-Ziffernartefakt vor einem
    // zweibuchstabigen Designator auffällig (z. B. Struktur 0AB123 -> AB123).
    // Es wird NICHT blind entfernt: diese Funktion bewertet nur einen bereits lokal
    // aus derselben Flugzelle gelesenen 2-stelligen Kandidaten; die bestehende
    // Mehrfach-OCR-/Mehrcrop-Konsenslogik entscheidet anschließend fail-closed.
    const im=initial.match(/^([A-Z]{3,4}|[0-9][A-Z]{2})(\d{1,4}[A-Z]?)$/),cm=candidate.match(/^([A-Z0-9]{2})(\d{1,4}[A-Z]?)$/);
    if(!im||!cm||candidate===initial)return false;
    if(im[2]===cm[2]&&singleDeletionPrefixMatch(im[1],cm[1]))return true;
    return boundaryGlyphShift(initial,candidate);
  }
  function oneNumericEditFlightAlternative(initialValue,candidateValue){
    const initial=flight(initialValue),candidate=flight(candidateValue);
    const im=initial.match(/^([A-Z0-9]{2})(\d{1,4})([A-Z]?)$/);
    const cm=candidate.match(/^([A-Z0-9]{2})(\d{1,4})([A-Z]?)$/);
    if(!im||!cm||initial===candidate)return false;
    if(im[1]!==cm[1]||im[3]!==cm[3]||im[2].length!==cm[2].length)return false;
    let edits=0;
    for(let i=0;i<im[2].length;i++)if(im[2][i]!==cm[2][i])edits++;
    return edits===1;
  }
  function oneNumericEditConflictEvidence(initialValue,attempts){
    const initial=flight(initialValue);if(!initial)return null;
    const votes=new Map(),crops=new Map();
    for(const attempt of (Array.isArray(attempts)?attempts:[])){
      const unique=[...new Set((Array.isArray(attempt?.candidates)?attempt.candidates:[]).map(flight).filter(Boolean))];
      if(unique.length!==1)continue;
      const c=unique[0];
      if(!oneNumericEditFlightAlternative(initial,c))continue;
      votes.set(c,(votes.get(c)||0)+1);
      if(!crops.has(c))crops.set(c,new Set());
      const crop=Number(attempt?.crop||0);if(crop)crops.get(c).add(crop);
    }
    const ranked=[...votes.entries()]
      .map(([candidate,count])=>({candidate,votes:count,crops:crops.get(candidate)?.size||0}))
      .filter(item=>item.votes>=2&&item.crops>=2)
      .sort((a,b)=>b.votes-a.votes||b.crops-a.crops||a.candidate.localeCompare(b.candidate));
    if(!ranked.length)return null;
    if(ranked[1]&&ranked[1].votes===ranked[0].votes&&ranked[1].crops===ranked[0].crops)return null;
    return ranked[0];
  }
  function suggestOneNumericEditCorrection(initialValue,attempts){
    const initial=flight(initialValue);if(!initial)return null;
    const votes=new Map(),crops=new Map();
    for(const attempt of (Array.isArray(attempts)?attempts:[])){
      const unique=[...new Set((Array.isArray(attempt?.candidates)?attempt.candidates:[]).map(flight).filter(Boolean))];
      if(unique.length!==1)continue;
      const c=unique[0];
      if(c!==initial&&!oneNumericEditFlightAlternative(initial,c))continue;
      votes.set(c,(votes.get(c)||0)+1);
      if(!crops.has(c))crops.set(c,new Set());
      const crop=Number(attempt?.crop||0);if(crop)crops.get(c).add(crop);
    }
    const ranked=[...votes.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
    const winner=ranked[0],runner=ranked[1],winnerCrops=winner?(crops.get(winner[0])?.size||0):0;
    if(!winner||winnerCrops<2||(runner&&winner[1]<=runner[1]))return null;
    const changed=winner[0]!==initial,initialVotes=Number(votes.get(initial)||0);
    // P107.6: For a changed one-digit reading, two genuinely separate crops are enough
    // only when the original value receives ZERO targeted votes. Confirmation of an
    // unchanged value keeps the stricter 3-vote threshold. This lets clear two-crop
    // corrections converge without allowing a mixed initial/alternative vote to auto-win.
    if(changed){
      const strongClassic=winner[1]>=3&&winner[1]>initialVotes;
      const cleanTwoCrop=winner[1]>=2&&initialVotes===0;
      if(!strongClassic&&!cleanTwoCrop)return null;
    }else if(winner[1]<3)return null;
    return {candidate:winner[0],votes:winner[1],crops:winnerCrops,changed};
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
  function parseClockTimeWithBoundaryNoise(value){
    const raw=text(value);
    if(!raw)return{value:'',changed:false,raw:''};
    const direct=parseClockTime(raw);
    if(direct)return{value:direct,changed:false,raw};
    // P113: Only isolated table/border glyphs may be removed. The remaining cell
    // must be one complete clock token; no embedded text, prefix or suffix is guessed.
    const m=raw.match(/^\s*[|¦│\[\]=~]+\s*([0-2]?\d[:.]\d{2}|\d{3,4})\s*[|¦│\[\]=~]*\s*$/u);
    if(!m)return{value:'',changed:false,raw};
    const parsed=parseClockTime(m[1]);
    return parsed?{value:parsed,changed:true,raw}:{value:'',changed:false,raw};
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
  function suggestShortCodeConsensus(originalValue,peerValues){
    const original=text(originalValue).replace(/\s+/g,'');
    if(!/^[A-Za-z]{2,4}$/.test(original))return null;
    const peers=(Array.isArray(peerValues)?peerValues:[])
      .map(value=>text(value).replace(/\s+/g,''))
      .filter(value=>/^[A-Za-z]{2,4}$/.test(value));
    const counts=new Map();
    for(const value of peers)counts.set(value,(counts.get(value)||0)+1);
    const candidates=[...counts.entries()]
      .filter(([candidate,count])=>candidate!==original&&count>=3&&textIntegrityEditDistance(original,candidate)===1)
      .filter(([candidate])=>Math.abs(candidate.length-original.length)<=1)
      .sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'de-DE'));
    if(!candidates.length)return null;
    if(candidates[1]&&candidates[1][1]===candidates[0][1])return null;
    return{candidate:candidates[0][0],evidenceCount:candidates[0][1]};
  }
  function driverUncertaintyMarker(value){
    const raw=text(value).replace(/\s+/g,' ');if(!raw)return null;
    const m=raw.match(/([?!]+)\s*$/);if(!m)return null;
    const body=raw.slice(0,m.index).trim();
    if(!/^[A-Za-zÄÖÜäöüßÀ-ÿ][A-Za-zÄÖÜäöüßÀ-ÿ\- ]{1,38}$/.test(body))return null;
    return {body,marker:m[1],display:`${body}${m[1]}`};
  }
  const key=v=>text(v).toLocaleLowerCase('de-DE').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'');

  function standardFlightPeerContextMatch(leftRide,rightRide){
    const left=leftRide||{},right=rightRide||{};
    const ld=text(left.flightDirection),rd=text(right.flightDirection);
    if(!ld||ld!==rd)return false;
    const lt=parseClockTime(left.flightTime),rt=parseClockTime(right.flightTime);
    if(!lt||lt!==rt)return false;
    const ll=key(left.flightLocation),rl=key(right.flightLocation);
    if(ll||rl)return Boolean(ll&&rl&&ll===rl);
    return true;
  }
  function oneNumericEditContextPeerIndices(rides,index){
    const list=Array.isArray(rides)?rides:[],target=list[index],initial=flight(target?.flightNumber);
    if(!target||!initial)return[];
    const hits=[];
    list.forEach((ride,i)=>{
      if(i===index||!standardFlightPeerContextMatch(target,ride))return;
      if(oneNumericEditFlightAlternative(initial,ride?.flightNumber))hits.push(i);
    });
    return hits;
  }
  function listConsensusPeerCount(rides,index,candidateValue){
    const list=Array.isArray(rides)?rides:[],target=list[index],candidate=flight(candidateValue);if(!target||!candidate)return 0;
    const direction=text(target.flightDirection),location=key(target.flightLocation);if(!direction||!location)return 0;
    let count=0;
    list.forEach((ride,i)=>{if(i===index)return;if(text(ride?.flightDirection)!==direction)return;if(key(ride?.flightLocation)!==location)return;if(flight(ride?.flightNumber)===candidate)count++;});
    return count;
  }

  function textIntegrityNormalize(value){
    return text(value).normalize('NFC').replace(/[\r\n\t]+/g,' ').replace(/\s+/g,' ').trim();
  }
  function textIntegrityEditDistance(leftValue,rightValue){
    const a=textIntegrityNormalize(leftValue).toLocaleLowerCase('de-DE');
    const b=textIntegrityNormalize(rightValue).toLocaleLowerCase('de-DE');
    if(a===b)return 0;
    if(!a)return b.length;
    if(!b)return a.length;
    const prev=Array.from({length:b.length+1},(_,i)=>i);
    for(let i=1;i<=a.length;i++){
      let diagonal=prev[0];
      prev[0]=i;
      for(let j=1;j<=b.length;j++){
        const old=prev[j];
        prev[j]=Math.min(prev[j]+1,prev[j-1]+1,diagonal+(a[i-1]===b[j-1]?0:1));
        diagonal=old;
      }
    }
    return prev[b.length];
  }

  // P110: Nach einer bereits geometrisch + wiederholt belegten Routen-Randwort-
  // Recovery darf dasselbe Wort aus der direkt benachbarten Kundenzelle entfernt
  // werden, aber nur wenn der verbleibende Kundenwert mindestens zweimal in derselben
  // Liste exakt vorkommt. Diese Funktion entscheidet NICHT, ob das Randwort zur Route
  // gehoert; sie verarbeitet nur den bereits extern belegten Recovery-Token.
  function suggestNeighborCustomerAfterRouteBoundaryRecovery(customerValue,recoveredTokenValue,peerCustomerValues){
    const customer=textIntegrityNormalize(customerValue);
    const recoveredToken=textIntegrityNormalize(recoveredTokenValue);
    if(!customer||!recoveredToken)return null;
    const parts=customer.split(/\s+/).filter(Boolean);
    if(parts.length<2)return null;
    const firstKey=parts[0].normalize('NFKC').toLocaleLowerCase('de-DE');
    const tokenKey=recoveredToken.normalize('NFKC').toLocaleLowerCase('de-DE');
    if(firstKey!==tokenKey)return null;
    const remainder=parts.slice(1).join(' ');
    if(!/[A-Za-zÄÖÜäöüßÀ-ÿ]/u.test(remainder))return null;
    const remainderKey=remainder.normalize('NFKC').toLocaleLowerCase('de-DE');
    const peers=(Array.isArray(peerCustomerValues)?peerCustomerValues:[])
      .map(textIntegrityNormalize)
      .filter(Boolean)
      .filter(value=>value.normalize('NFKC').toLocaleLowerCase('de-DE')===remainderKey);
    if(peers.length<2)return null;
    const counts=new Map();
    for(const value of peers)counts.set(value,(counts.get(value)||0)+1);
    const ranked=[...counts.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'de-DE'));
    return {customer:ranked[0]?.[0]||remainder,recoveredToken,customerPeerCount:peers.length};
  }
  function textIntegrityHasDiacritic(value){
    const normalized=textIntegrityNormalize(value);
    if(!normalized)return false;
    return /[\u0300-\u036f]/u.test(normalized.normalize('NFD')) || /ß/u.test(normalized);
  }
  function textIntegritySuspiciousEdgePunctuation(value){
    const raw=textIntegrityNormalize(value);
    if(!raw)return false;
    return /^[‘’“”"'`´|¦│~]{1,2}(?=[A-Za-zÄÖÜäöüßÀ-ÿ0-9])/u.test(raw) ||
      /[A-Za-zÄÖÜäöüßÀ-ÿ0-9][‘’“”"'`´|¦│~]{1,2}$/u.test(raw);
  }
  function textIntegrityPotentialGlyphSplit(value){
    const raw=textIntegrityNormalize(value);
    // Trigger only: a repeated narrow-glyph sequence may be a segmented diacritic.
    // It NEVER changes text by itself; only independent image OCR can decide.
    return /[A-Za-zÄÖÜäöüßÀ-ÿ]ii[A-Za-zÄÖÜäöüßÀ-ÿ]/iu.test(raw);
  }
  function textIntegrityEdgeCore(value){
    return textIntegrityNormalize(value)
      .replace(/^[‘’“”"'`´|¦│~]{1,2}/u,'')
      .replace(/[‘’“”"'`´|¦│~]{1,2}$/u,'')
      .trim();
  }
  function textIntegrityEdgePunctuationAlternative(originalValue,candidateValue){
    const original=textIntegrityNormalize(originalValue);
    const candidate=textIntegrityNormalize(candidateValue);
    if(!original||!candidate||original===candidate)return false;
    const ol=original.toLocaleLowerCase('de-DE');
    const cl=candidate.toLocaleLowerCase('de-DE');
    const oc=textIntegrityEdgeCore(ol),cc=textIntegrityEdgeCore(cl);
    return Boolean(oc&&cc&&oc===cc&&(oc!==ol||cc!==cl));
  }
  function safeTextIntegrityAlternative(originalValue,candidateValue){
    const original=textIntegrityNormalize(originalValue);
    const candidate=textIntegrityNormalize(candidateValue);
    if(!original||!candidate||original===candidate)return false;
    const ol=original.toLocaleLowerCase('de-DE');
    const cl=candidate.toLocaleLowerCase('de-DE');
    if(textIntegrityEdgePunctuationAlternative(original,candidate))return true;
    const distance=textIntegrityEditDistance(ol,cl);
    if(distance===1 && Math.min(ol.length,cl.length)>=3)return true;
    const candidateHasDiacritic=textIntegrityHasDiacritic(candidate);
    const originalHasDiacritic=textIntegrityHasDiacritic(original);
    if(distance<=2 && candidateHasDiacritic && !originalHasDiacritic &&
       ol[0]===cl[0] && ol[ol.length-1]===cl[cl.length-1] && Math.min(ol.length,cl.length)>=4)return true;
    return false;
  }
  function textIntegrityEdgeConflictPromotion(originalValue,candidateValue,attempts,peerCount){
    const original=textIntegrityNormalize(originalValue);
    const candidate=textIntegrityNormalize(candidateValue);
    const peers=Number(peerCount||0);
    if(!original||!candidate||peers<2||!textIntegrityEdgePunctuationAlternative(original,candidate)){
      return {ok:false,mode:'',candidateBatch:0,candidateLocal:0,localModes:0,localOther:0,originalBatch:0};
    }
    const originalKey=original.normalize('NFKC').toLocaleLowerCase('de-DE');
    const candidateKey=candidate.normalize('NFKC').toLocaleLowerCase('de-DE');
    let candidateBatch=0,candidateLocal=0,localOther=0,originalBatch=0;
    const localModes=new Set();
    for(const attempt of (Array.isArray(attempts)?attempts:[])){
      const scope=text(attempt?.scope)||'unknown';
      const value=textIntegrityNormalize(attempt?.candidate);
      if(!value)continue;
      const valueKey=value.normalize('NFKC').toLocaleLowerCase('de-DE');
      if(scope==='batch'&&valueKey===originalKey)originalBatch++;
      if(valueKey===candidateKey){
        if(scope==='batch')candidateBatch++;
        if(scope==='local'){
          candidateLocal++;
          localModes.add(text(attempt?.mode)||`local-${candidateLocal}`);
        }
      }else if(scope==='local'){
        localOther++;
      }
    }
    // Classic P109.1 path: one batch + one local image read + >=2 current-plan peers.
    if(candidateBatch>=1&&candidateLocal>=1){
      return {ok:true,mode:'batch_local_peers',candidateBatch,candidateLocal,localModes:localModes.size,localOther,originalBatch};
    }
    // P109.2 path: for PURE edge-punctuation alternatives only, two unanimous local
    // image reads from distinct OCR modes/crops plus >=2 peers may resolve the tie even
    // when the single composite batch read is noisy or favors a third near candidate.
    // A batch vote for the original or any competing non-empty local reading keeps the
    // case fail-closed. Same-plan repetition alone can never promote a correction.
    if(candidateLocal>=2&&localModes.size>=2&&localOther===0&&originalBatch===0){
      return {ok:true,mode:'dual_local_peers',candidateBatch,candidateLocal,localModes:localModes.size,localOther,originalBatch};
    }
    return {ok:false,mode:'',candidateBatch,candidateLocal,localModes:localModes.size,localOther,originalBatch};
  }

  function decideTextIntegrity(originalValue,attempts){
    const original=textIntegrityNormalize(originalValue);
    const normalizedAttempts=(Array.isArray(attempts)?attempts:[])
      .map(item=>({scope:text(item?.scope)||'unknown',candidate:textIntegrityNormalize(item?.candidate)}))
      .filter(item=>item.candidate && (item.candidate===original || safeTextIntegrityAlternative(original,item.candidate)));
    const stats=new Map();
    for(const item of normalizedAttempts){
      const key=item.candidate.normalize('NFKC').toLocaleLowerCase('de-DE');
      const current=stats.get(key)||{candidate:item.candidate,total:0,batch:0,local:0};
      current.total++;
      if(item.scope==='batch')current.batch++;
      if(item.scope==='local')current.local++;
      stats.set(key,current);
    }
    const ranked=[...stats.values()].sort((a,b)=>b.total-a.total||b.local-a.local||b.batch-a.batch||a.candidate.localeCompare(b.candidate,'de'));
    const winner=ranked[0]||null,runner=ranked[1]||null;
    if(winner && winner.candidate!==original && safeTextIntegrityAlternative(original,winner.candidate) &&
       winner.total>=3 && winner.local>=2 && winner.batch>=1 && (!runner || runner.total<=1)){
      return {status:'correct',candidate:winner.candidate,evidence:{total:winner.total,batch:winner.batch,local:winner.local}};
    }
    const competing=ranked.filter(item=>item.candidate!==original && safeTextIntegrityAlternative(original,item.candidate));
    const conflict=competing.find(item=>item.local>=2 || item.batch>=2 || (item.batch>=1&&item.local>=1));
    if(conflict){
      return {status:'conflict',candidate:conflict.candidate,evidence:{total:conflict.total,batch:conflict.batch,local:conflict.local}};
    }
    return {status:textIntegritySuspiciousEdgePunctuation(original)?'suspicious':'ok',candidate:original,evidence:null};
  }

  return Object.freeze({flight,singleDeletionPrefixMatch,boundaryGlyphShift,safeLongPrefixFlightAlternative,oneNumericEditFlightAlternative,oneNumericEditConflictEvidence,suggestOneNumericEditCorrection,suggestLongPrefixCorrection,parseClockTime,parseClockTimeWithBoundaryNoise,inferRideTimeColumnFromMatrix,parseEuropeanNumber,pricePlausibility,repeatedTextSignature,suggestShortCodeConsensus,driverUncertaintyMarker,standardFlightPeerContextMatch,oneNumericEditContextPeerIndices,listConsensusPeerCount,textIntegrityNormalize,textIntegrityEditDistance,suggestNeighborCustomerAfterRouteBoundaryRecovery,textIntegrityHasDiacritic,textIntegritySuspiciousEdgePunctuation,textIntegrityPotentialGlyphSplit,textIntegrityEdgePunctuationAlternative,safeTextIntegrityAlternative,textIntegrityEdgeConflictPromotion,decideTextIntegrity});
});
