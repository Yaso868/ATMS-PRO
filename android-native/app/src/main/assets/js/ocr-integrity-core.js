// CORE-007D8A1F1D8P1137 · 07.10.2026: MIRROR-SCHEMA + EDGE EVIDENCE INTEGRITY – recover a missing middle mirror-time schema from repeated row-aligned raw clocks; add symmetric secondary edge-degradation guards while keeping fail-closed evidence requirements.
// CORE-007D8A1F1D8P1136 · 07.10.2026: ROW-ALIGNED TIME GEOMETRY – second-stage raw-word price/time row pairing recovers a missing primary ride-time anchor without depending on OCR line grouping; fail closed on weak/competing evidence.
// CORE-007D8A1F1D8P1135 · 07.10.2026: HEADER/TIME GEOMETRY RECOVERY – recover only a missing primary ride-time header from repeated raw OCR clock geometry between Preis and Von; fail closed on weak or competing evidence.
// CORE-007D8A1F1D8P1134 · 07.10.2026: EDGE-GLYPH ADJUDICATION – exact independent batch candidate + invariant short-code core + bounded multi-view edge-state evidence; fail closed on competing evidence.
// CORE-007D8A1F1D8P11331 · 07.10.2026: P113.3.1 RUNTIME GATE – OCR consensus semantics unchanged; paired with executable plan-import runtime smoke.
// CORE-007D8A1F1D8P1133 · 07.10.2026: GPT-VISION CELL REPLAY – exact-cell/content-region consensus with bounded evidence diversity and crop-quality gating; CORRECT OR FAIL CLOSED.
// CORE-007D8A1F1D8P1132 · 07.10.2026: CHATGPT-LIKE CELL EVIDENCE – exact-cell multi-view consensus with crop-quality gating; CORRECT OR FAIL CLOSED. Historical fixture values remain test-only; no flight/driver/place hardcodes.
// CORE-007D8A1F1D8P1131 · 07.10.2026: GOLDEN ERROR FOLLOW-UP – generic left-edge text degradation detection, short-code image consensus and safer one-digit flight correction. Historical fixture values remain test-only; no flight/driver/place hardcodes.
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

  function inferRideTimeAnchorFromRawLines(lines,headerIndex,headerAnchors){
    const rows=Array.isArray(lines)?lines:[];
    const anchors=(Array.isArray(headerAnchors)?headerAnchors:[])
      .map(anchor=>({key:text(anchor?.key).toLowerCase(),x:Number(anchor?.x)}))
      .filter(anchor=>anchor.key&&Number.isFinite(anchor.x))
      .sort((a,b)=>a.x-b.x);
    const price=anchors.find(anchor=>anchor.key==='preis'||anchor.key==='price');
    const pickup=anchors.find(anchor=>anchor.key==='von'||anchor.key==='from');
    if(!price||!pickup||!(pickup.x>price.x))return null;
    const span=pickup.x-price.x;
    if(!Number.isFinite(span)||span<24)return null;
    const isTimeKey=key=>key==='uhrzeit'||key==='zeit'||key==='time';
    if(anchors.some(anchor=>isTimeKey(anchor.key)&&anchor.x>price.x&&anchor.x<pickup.x))return null;

    // P113.5: inspect raw OCR geometry BEFORE the table matrix can collapse the
    // missing primary time column. Only a stable multi-row clock cluster in the
    // interior Preis→Von corridor may restore one header anchor.
    const minX=price.x+span*0.10;
    const maxX=pickup.x-span*0.10;
    const tolerance=Math.max(8,span*0.08);
    const start=Math.max(0,Number(headerIndex||0)+1);
    const candidates=[];
    let seen=0;
    const sample=rows.slice(start,start+40);
    for(let rowOffset=0;rowOffset<sample.length;rowOffset++){
      const line=sample[rowOffset];
      const words=(Array.isArray(line?.words)?line.words:[])
        .map(word=>({
          raw:text(word?.text),
          x0:Number(word?.x0 ?? word?.bbox?.x0),
          x1:Number(word?.x1 ?? word?.bbox?.x1)
        }))
        .filter(word=>word.raw&&Number.isFinite(word.x0)&&Number.isFinite(word.x1))
        .map(word=>({...word,cx:(word.x0+word.x1)/2}))
        .filter(word=>word.cx>minX&&word.cx<maxX)
        .sort((a,b)=>a.x0-b.x0);
      if(!words.length)continue;
      seen++;
      const perRow=[];
      const addCandidate=(raw,x)=>{
        const parsed=parseClockTimeWithBoundaryNoise(raw).value||parseClockTime(raw);
        if(!parsed||!Number.isFinite(x))return;
        if(!perRow.some(item=>item.value===parsed&&Math.abs(item.x-x)<=1))perRow.push({value:parsed,x});
      };
      for(const word of words)addCandidate(word.raw,word.cx);
      for(let i=0;i<words.length;i++){
        let joined=words[i].raw;
        let left=words[i].x0,right=words[i].x1;
        for(let j=i+1;j<Math.min(words.length,i+3);j++){
          const gap=words[j].x0-right;
          if(!Number.isFinite(gap)||gap>tolerance*0.75)break;
          joined+=words[j].raw;
          right=words[j].x1;
          addCandidate(joined,(left+right)/2);
        }
      }
      for(const item of perRow)candidates.push({row:rowOffset,x:item.x});
    }
    if(seen<3||candidates.length<3)return null;

    const clusters=[];
    for(const candidate of candidates.sort((a,b)=>a.x-b.x)){
      let best=null,bestDistance=Infinity;
      for(const cluster of clusters){
        const distance=Math.abs(candidate.x-cluster.center);
        if(distance<=tolerance&&distance<bestDistance){best=cluster;bestDistance=distance;}
      }
      if(!best){best={xs:[],rows:new Set(),center:candidate.x};clusters.push(best);}
      best.xs.push(candidate.x);
      best.rows.add(candidate.row);
      const sorted=best.xs.slice().sort((a,b)=>a-b);
      best.center=sorted[Math.floor(sorted.length/2)];
    }
    const ranked=clusters
      .map(cluster=>({x:cluster.center,valid:cluster.rows.size,xs:cluster.xs.slice()}))
      .sort((a,b)=>b.valid-a.valid||a.x-b.x);
    const winner=ranked[0];
    const runner=ranked[1];
    if(!winner||winner.valid<3||winner.valid/seen<0.60)return null;
    // Any second stable clock column inside the same Preis→Von corridor makes the
    // geometry ambiguous. One-off noise is tolerated; repeated competition is not.
    if(runner&&runner.valid>=2)return null;
    return{
      x:winner.x,
      valid:winner.valid,
      seen,
      coverage:Number((winner.valid/seen).toFixed(3)),
      reason:'validated_raw_clock_geometry_between_price_and_pickup'
    };
  }

  function inferRideTimeLeftGeometryFromRawWords(words,headerAnchors,imageWidth,options={}){
    const anchors=(Array.isArray(headerAnchors)?headerAnchors:[])
      .map(anchor=>({key:text(anchor?.key).toLowerCase(),x:Number(anchor?.x)}))
      .filter(anchor=>anchor.key&&Number.isFinite(anchor.x))
      .sort((a,b)=>a.x-b.x);
    const pickup=anchors.find(anchor=>anchor.key==='von'||anchor.key==='from');
    const priceHeader=anchors.find(anchor=>anchor.key==='preis'||anchor.key==='price');
    const isTimeKey=key=>key==='uhrzeit'||key==='zeit'||key==='time';
    const width=Number(imageWidth);
    const reject=(reason,extra={})=>({
      accepted:false,
      reason,
      priceHeaderPresent:Boolean(priceHeader),
      pickupHeaderPresent:Boolean(pickup),
      ...extra
    });
    if(!pickup||!(pickup.x>0))return reject('missing_pickup_header');
    const primaryTimeHeaderPresent=anchors.some(anchor=>isTimeKey(anchor.key)&&anchor.x<pickup.x);
    if(primaryTimeHeaderPresent&&!Boolean(options?.allowExistingPrimaryHeader))return reject('primary_time_header_present');

    const normalized=(Array.isArray(words)?words:[]).map((word,index)=>{
      const x0=Number(word?.x0 ?? word?.bbox?.x0),x1=Number(word?.x1 ?? word?.bbox?.x1);
      const y0=Number(word?.y0 ?? word?.bbox?.y0),y1=Number(word?.y1 ?? word?.bbox?.y1);
      const raw=text(word?.text);
      if(!raw||![x0,x1,y0,y1].every(Number.isFinite)||x1<=x0||y1<=y0)return null;
      return {index,raw,x0,x1,y0,y1,cx:(x0+x1)/2,cy:(y0+y1)/2,w:x1-x0,h:y1-y0};
    }).filter(Boolean);
    if(normalized.length<6)return reject('insufficient_raw_words',{rawWords:normalized.length});

    const strictPrice=value=>{
      const raw=text(value).replace(/[Oo]/g,'0').replace(/\s+/g,'').replace(/[€$£]/g,'');
      const match=raw.match(/^[|¦│\[\]=~]*([+-]?\d{1,4}(?:[.,]\d{3})*[.,]\d{2})[|¦│\[\]=~]*$/u);
      if(!match)return'';
      const numeric=Number(match[1].replace(/\.(?=\d{3}(?:[.,]|$))/g,'').replace(',','.'));
      return Number.isFinite(numeric)&&numeric>0&&numeric<10000?match[1]:'';
    };
    const priceWords=normalized.filter(word=>word.cx<pickup.x&&strictPrice(word.raw));
    const timeWords=normalized.filter(word=>word.cx<pickup.x&&Boolean(parseClockTimeWithBoundaryNoise(word.raw).value||parseClockTime(word.raw)));
    if(priceWords.length<3)return reject('insufficient_price_rows',{priceWords:priceWords.length,timeWords:timeWords.length});
    if(timeWords.length<3)return reject('insufficient_time_rows',{priceWords:priceWords.length,timeWords:timeWords.length});

    const median=list=>{
      const values=(list||[]).map(Number).filter(Number.isFinite).sort((a,b)=>a-b);
      if(!values.length)return 0;
      const mid=Math.floor(values.length/2);
      return values.length%2?values[mid]:(values[mid-1]+values[mid])/2;
    };
    const medianH=median([...priceWords,...timeWords].map(word=>word.h))||12;
    const medianW=median([...priceWords,...timeWords].map(word=>word.w))||20;
    const yTolerance=Math.max(6,Math.min(42,medianH*0.90));
    const xTolerance=Math.max(8,Math.min(42,medianW*0.45,Number.isFinite(width)&&width>0?width*0.018:42));

    const clusterByX=items=>{
      const clusters=[];
      for(const item of items.slice().sort((a,b)=>a.cx-b.cx)){
        let winner=null,distance=Infinity;
        for(const cluster of clusters){
          const delta=Math.abs(item.cx-cluster.center);
          if(delta<=xTolerance&&delta<distance){winner=cluster;distance=delta;}
        }
        if(!winner){winner={items:[],center:item.cx};clusters.push(winner);}
        winner.items.push(item);
        winner.center=median(winner.items.map(entry=>entry.cx));
      }
      return clusters;
    };
    const uniqueRows=items=>{
      const rows=[];
      for(const item of items.slice().sort((a,b)=>a.cy-b.cy)){
        const previous=rows[rows.length-1];
        if(previous&&Math.abs(item.cy-previous.cy)<=yTolerance){
          previous.items.push(item);
          previous.cy=median(previous.items.map(entry=>entry.cy));
        }else rows.push({cy:item.cy,items:[item]});
      }
      return rows;
    };
    const pairRows=(leftItems,rightItems)=>{
      const leftRows=uniqueRows(leftItems),rightRows=uniqueRows(rightItems),used=new Set();
      let matched=0;
      for(const left of leftRows){
        let best=-1,bestDistance=Infinity;
        for(let i=0;i<rightRows.length;i++){
          if(used.has(i))continue;
          const distance=Math.abs(left.cy-rightRows[i].cy);
          if(distance<=yTolerance&&distance<bestDistance){best=i;bestDistance=distance;}
        }
        if(best>=0){used.add(best);matched++;}
      }
      return {matched,leftRows:leftRows.length,rightRows:rightRows.length};
    };

    const priceClusters=clusterByX(priceWords).map(cluster=>({...cluster,rowCount:uniqueRows(cluster.items).length}));
    const timeClusters=clusterByX(timeWords).map(cluster=>({...cluster,rowCount:uniqueRows(cluster.items).length}));
    const stablePrices=priceClusters.filter(cluster=>cluster.rowCount>=3);
    const stableTimes=timeClusters.filter(cluster=>cluster.rowCount>=2);
    if(!stablePrices.length)return reject('no_stable_price_cluster',{priceWords:priceWords.length,timeWords:timeWords.length});
    if(!stableTimes.some(cluster=>cluster.rowCount>=3))return reject('no_stable_time_cluster',{priceWords:priceWords.length,timeWords:timeWords.length});

    const pairCandidates=[];
    for(const price of stablePrices){
      if(priceHeader){
        const span=Math.max(1,pickup.x-priceHeader.x);
        const headerTolerance=Math.max(xTolerance*2,span*0.24);
        if(Math.abs(price.center-priceHeader.x)>headerTolerance)continue;
      }
      for(const time of stableTimes.filter(cluster=>cluster.rowCount>=3)){
        const minGap=Math.max(8,xTolerance*0.70);
        if(!(time.center>price.center+minGap&&time.center<pickup.x-minGap))continue;
        const paired=pairRows(price.items,time.items);
        if(paired.matched<3)continue;
        const priceCoverage=paired.leftRows?paired.matched/paired.leftRows:0;
        const timeCoverage=paired.rightRows?paired.matched/paired.rightRows:0;
        if(priceCoverage<0.60||timeCoverage<0.60)continue;
        pairCandidates.push({price,time,...paired,priceCoverage,timeCoverage});
      }
    }
    pairCandidates.sort((a,b)=>
      b.matched-a.matched||
      Math.min(b.priceCoverage,b.timeCoverage)-Math.min(a.priceCoverage,a.timeCoverage)||
      a.time.center-b.time.center
    );
    const winner=pairCandidates[0];
    if(!winner)return reject('no_row_aligned_price_time_pair',{
      priceWords:priceWords.length,
      timeWords:timeWords.length,
      stablePriceClusters:stablePrices.length,
      stableTimeClusters:stableTimes.filter(cluster=>cluster.rowCount>=3).length
    });

    // A second clock cluster with repeated rows in the same inferred Preis→Von
    // corridor is unsafe. One-off OCR noise is tolerated, repeated competition is not.
    const competingTimes=stableTimes.filter(cluster=>
      cluster!==winner.time&&
      cluster.rowCount>=2&&
      cluster.center>winner.price.center&&
      cluster.center<pickup.x
    );
    if(competingTimes.length)return reject('competing_time_cluster',{
      matchedRows:winner.matched,
      priceRows:winner.leftRows,
      timeRows:winner.rightRows,
      competingTimeClusters:competingTimes.length
    });

    // Without an observed Preis header, the recurring decimal column itself is the
    // only reason to introduce a synthetic Preis anchor. Competing recurring decimal
    // columns are therefore rejected rather than guessed away.
    if(!priceHeader){
      const competingPrices=stablePrices.filter(cluster=>
        cluster!==winner.price&&cluster.rowCount>=2&&cluster.center<winner.time.center
      );
      if(competingPrices.length)return reject('competing_price_cluster',{
        matchedRows:winner.matched,
        priceRows:winner.leftRows,
        timeRows:winner.rightRows,
        competingPriceClusters:competingPrices.length
      });
    }

    return{
      accepted:true,
      reason:'validated_row_aligned_price_time_geometry',
      priceHeaderPresent:Boolean(priceHeader),
      primaryTimeHeaderPresent,
      recoverPriceHeader:!priceHeader,
      priceX:winner.price.center,
      timeX:winner.time.center,
      pickupX:pickup.x,
      matchedRows:winner.matched,
      priceRows:winner.leftRows,
      timeRows:winner.rightRows,
      priceCoverage:Number(winner.priceCoverage.toFixed(3)),
      timeCoverage:Number(winner.timeCoverage.toFixed(3)),
      xTolerance:Number(xTolerance.toFixed(2)),
      yTolerance:Number(yTolerance.toFixed(2))
    };
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


  function leftEdgeTextDegradation(referenceValue,candidateValue){
    const reference=textIntegrityNormalize(referenceValue).normalize('NFKC').toLocaleLowerCase('de-DE');
    const candidate=textIntegrityNormalize(candidateValue).normalize('NFKC').toLocaleLowerCase('de-DE');
    if(!reference||!candidate||reference===candidate)return null;
    // This guard is specifically for a shorter secondary reading caused by a
    // clipped left cell edge. Same-length first-token differences remain real
    // conflicts (for example two genuinely different place names).
    const lengthLoss=reference.length-candidate.length;
    if(lengthLoss<1||lengthLoss>5||Math.min(reference.length,candidate.length)<8)return null;
    let common=0;
    while(common<reference.length&&common<candidate.length&&reference[reference.length-1-common]===candidate[candidate.length-1-common])common++;
    if(common<8||common/Math.max(1,candidate.length)<0.78)return null;
    const referencePrefix=reference.slice(0,reference.length-common);
    const candidatePrefix=candidate.slice(0,candidate.length-common);
    if(!referencePrefix||referencePrefix.length>5||candidatePrefix.length>2)return null;
    const suffix=reference.slice(reference.length-common);
    if(!/\s/.test(suffix))return null;
    return{referencePrefix,candidatePrefix,commonSuffix:suffix,commonLength:common,coverage:common/candidate.length};
  }

  function rightEdgeTextDegradation(referenceValue,candidateValue){
    const reference=textIntegrityNormalize(referenceValue).normalize('NFKC').toLocaleLowerCase('de-DE');
    const candidate=textIntegrityNormalize(candidateValue).normalize('NFKC').toLocaleLowerCase('de-DE');
    if(!reference||!candidate||reference===candidate)return null;
    const lengthLoss=reference.length-candidate.length;
    if(lengthLoss<1||lengthLoss>5||Math.min(reference.length,candidate.length)<8)return null;
    let common=0;
    while(common<reference.length&&common<candidate.length&&reference[common]===candidate[common])common++;
    if(common<8||common/Math.max(1,candidate.length)<0.78)return null;
    const referenceSuffix=reference.slice(common);
    const candidateSuffix=candidate.slice(common);
    if(!referenceSuffix||referenceSuffix.length>5||candidateSuffix.length>2)return null;
    const prefix=reference.slice(0,common);
    if(!/\s/.test(prefix))return null;
    return{referenceSuffix,candidateSuffix,commonPrefix:prefix,commonLength:common,coverage:common/candidate.length};
  }

  function edgeGlyphTextDegradation(referenceValue,candidateValue){
    const reference=textIntegrityNormalize(referenceValue).normalize('NFKC').toLocaleLowerCase('de-DE');
    const candidate=textIntegrityNormalize(candidateValue).normalize('NFKC').toLocaleLowerCase('de-DE');
    if(!reference||!candidate||reference===candidate||reference.length!==candidate.length||reference.length<8)return null;
    if(!/\s/.test(reference)||!/\s/.test(candidate))return null;
    let diff=-1;
    for(let i=0;i<reference.length;i++){
      if(reference[i]===candidate[i])continue;
      if(diff!==-1)return null;
      diff=i;
    }
    if(diff<0)return null;
    const edge=diff<=1?'left':(diff>=reference.length-2?'right':'');
    if(!edge)return null;
    const commonLength=reference.length-1;
    const coverage=commonLength/reference.length;
    if(commonLength<8||coverage<0.90)return null;
    return{edge,index:diff,referenceGlyph:reference[diff],candidateGlyph:candidate[diff],commonLength,coverage};
  }

  function shortCodeImageConsensusPromotion(originalValue,candidateValue,attempts){
    const original=text(originalValue).replace(/\s+/g,'').toUpperCase();
    const candidate=text(candidateValue).replace(/\s+/g,'').toUpperCase();
    if(!/^[A-Z0-9]{2,5}$/.test(original)||!/^[A-Z0-9]{2,5}$/.test(candidate)||original===candidate)return null;
    if(textIntegrityEditDistance(original,candidate)!==1)return null;
    let batch=0,local=0,localOther=0;
    const localModes=new Set();
    for(const attempt of (Array.isArray(attempts)?attempts:[])){
      const value=text(attempt?.candidate).replace(/\s+/g,'').toUpperCase();
      if(!value)continue;
      const scope=text(attempt?.scope)||'unknown';
      if(value===candidate){
        if(scope==='batch')batch++;
        if(scope==='local'){local++;localModes.add(text(attempt?.mode)||`local-${local}`);}
      }else if(scope==='local'&&/^[A-Z0-9]{2,5}$/.test(value)){
        localOther++;
      }
    }
    if(batch>=1&&local>=2&&localModes.size>=2&&localOther===0)return{candidate,batch,local,localModes:localModes.size};
    return null;
  }

  function exactCellMultiViewConsensus(originalValue,attempts,cropQuality){
    const original=text(originalValue).replace(/\s+/g,'').toUpperCase();
    if(!/^[A-Z0-9]{2,6}$/.test(original))return null;
    const quality=cropQuality&&typeof cropQuality==='object'?cropQuality:{};
    if(quality.fullCellIncluded===false||quality.leftEdgeClipped===true||quality.rightEdgeClipped===true||quality.neighborColumnIncluded===true)return null;

    const exactStats=new Map();
    const batchStats=new Map();
    for(const attempt of (Array.isArray(attempts)?attempts:[])){
      const candidate=text(attempt?.candidate).replace(/\s+/g,'').toUpperCase();
      if(!/^[A-Z0-9]{2,6}$/.test(candidate))continue;
      const scope=text(attempt?.scope)||'unknown';
      if(scope==='cell_view'){
        const q=attempt?.cropQuality&&typeof attempt.cropQuality==='object'?attempt.cropQuality:{};
        if(q.fullCellIncluded===false||q.leftEdgeClipped===true||q.rightEdgeClipped===true||q.neighborColumnIncluded===true)continue;
        const current=exactStats.get(candidate)||{candidate,votes:0,modes:new Set(),families:new Set()};
        current.votes++;
        current.modes.add(text(attempt?.mode)||`cell-view-${current.votes}`);
        current.families.add(`${text(attempt?.viewRegion)||'full_cell'}|${text(attempt?.transform)||'original'}`);
        exactStats.set(candidate,current);
      }else if(scope==='batch'){
        batchStats.set(candidate,(batchStats.get(candidate)||0)+1);
      }
    }

    const ranked=[...exactStats.values()].sort((a,b)=>b.votes-a.votes||b.modes.size-a.modes.size||a.candidate.localeCompare(b.candidate));
    const winner=ranked[0]||null,runner=ranked[1]||null;
    if(!winner||winner.candidate===original||textIntegrityEditDistance(original,winner.candidate)!==1)return null;
    const winnerBatch=Number(batchStats.get(winner.candidate)||0);
    const originalExact=Number(exactStats.get(original)?.votes||0);
    const runnerVotes=Number(runner?.votes||0);
    const exactMargin=winner.votes-Math.max(originalExact,runnerVotes);
    const evidenceFamilies=Number(winner.families?.size||0);
    const enoughExact=winner.votes>=3&&winner.modes.size>=3&&evidenceFamilies>=2&&exactMargin>=2;
    const batchBacked=winnerBatch>=1&&winner.votes>=2&&winner.modes.size>=2&&evidenceFamilies>=2&&exactMargin>=2;
    if(!enoughExact&&!batchBacked)return null;
    return{
      candidate:winner.candidate,
      exactViews:winner.votes,
      exactModes:winner.modes.size,
      evidenceFamilies,
      batch:winnerBatch,
      originalExact,
      runnerExact:runnerVotes,
      strength:winner.votes>=3&&evidenceFamilies>=2?'strong':'supported'
    };
  }

  function edgeGlyphAdjudication(originalValue,attempts,cropQuality){
    const original=text(originalValue).replace(/\s+/g,'').toUpperCase();
    if(!/^[A-Z0-9]{3,6}$/.test(original))return null;
    const quality=cropQuality&&typeof cropQuality==='object'?cropQuality:{};
    if(quality.fullCellIncluded===false||quality.leftEdgeClipped===true||quality.rightEdgeClipped===true||quality.neighborColumnIncluded===true)return null;

    const batchValues=[];
    const cellAttempts=[];
    for(const attempt of (Array.isArray(attempts)?attempts:[])){
      const candidate=text(attempt?.candidate).replace(/\s+/g,'').toUpperCase();
      if(!candidate)continue;
      const scope=text(attempt?.scope)||'unknown';
      if(scope==='batch'&&/^[A-Z0-9]{2,6}$/.test(candidate))batchValues.push(candidate);
      if(scope==='cell_view'&&/^[A-Z0-9]{2,6}$/.test(candidate)){
        const q=attempt?.cropQuality&&typeof attempt.cropQuality==='object'?attempt.cropQuality:{};
        if(q.fullCellIncluded===false||q.leftEdgeClipped===true||q.rightEdgeClipped===true||q.neighborColumnIncluded===true)continue;
        cellAttempts.push({
          candidate,
          mode:text(attempt?.mode)||'',
          viewRegion:text(attempt?.viewRegion)||'full_cell',
          transform:text(attempt?.transform)||'original'
        });
      }
    }

    const uniqueBatch=[...new Set(batchValues)];
    // P113.4 deliberately requires one exact independent batch answer. Any
    // competing non-empty batch value keeps the case fail-closed.
    if(uniqueBatch.length!==1)return null;
    const candidate=uniqueBatch[0];
    if(!/^[A-Z0-9]{3,6}$/.test(candidate)||candidate===original||candidate.length!==original.length)return null;

    let edge='';
    let core='';
    if(original.slice(1)===candidate.slice(1)&&original[0]!==candidate[0]){
      edge='left';core=candidate.slice(1);
    }else if(original.slice(0,-1)===candidate.slice(0,-1)&&original.at(-1)!==candidate.at(-1)){
      edge='right';core=candidate.slice(0,-1);
    }else return null;
    if(core.length<2)return null;

    const compatible=[];
    const edgeStates=new Set();
    const families=new Set();
    let missingEdge=0;
    for(const item of cellAttempts){
      const value=item.candidate;
      let state='';
      let ok=false;
      if(value===core){
        ok=true;state='∅';missingEdge++;
      }else if(value.length===candidate.length){
        const sameCore=edge==='left'?value.slice(1)===core:value.slice(0,-1)===core;
        if(sameCore){
          ok=true;state=edge==='left'?value[0]:value.at(-1);
        }
      }
      // A non-empty exact-cell view with a different core is competing image
      // evidence. Do not adjudicate through it.
      if(!ok)return null;
      compatible.push(item);
      edgeStates.add(state);
      const sourceFamily=/processed/i.test(item.mode)?'processed':item.transform;
      families.add(`${item.viewRegion}|${sourceFamily}`);
    }

    if(compatible.length<3||families.size<2||edgeStates.size<2||missingEdge<1)return null;
    return{
      candidate,
      edge,
      core,
      compatibleViews:compatible.length,
      evidenceFamilies:families.size,
      edgeStates:edgeStates.size,
      missingEdgeViews:missingEdge,
      batch:batchValues.filter(value=>value===candidate).length,
      strength:'edge_glyph_adjudicated'
    };
  }

  function oneNumericEditAutoCorrectionAllowed(initialValue,candidateValue,attempts,primaryConfidence,hasContextPeer){
    const initial=flight(initialValue),candidate=flight(candidateValue);
    if(!oneNumericEditFlightAlternative(initial,candidate))return false;
    const suggestion=suggestOneNumericEditCorrection(initial,attempts);
    if(!suggestion||suggestion.candidate!==candidate||!suggestion.changed)return false;
    if(Boolean(hasContextPeer))return true;
    const confidence=Number(primaryConfidence);
    if(!Number.isFinite(confidence))return true;
    if(confidence<=35)return true;
    // A moderate/high-confidence primary word must not be overwritten by a two-crop
    // alternative alone. Four unanimous targeted votes across two crops are required.
    return suggestion.votes>=4&&suggestion.crops>=2;
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

  return Object.freeze({flight,singleDeletionPrefixMatch,boundaryGlyphShift,safeLongPrefixFlightAlternative,oneNumericEditFlightAlternative,oneNumericEditConflictEvidence,suggestOneNumericEditCorrection,suggestLongPrefixCorrection,parseClockTime,parseClockTimeWithBoundaryNoise,inferRideTimeColumnFromMatrix,inferRideTimeAnchorFromRawLines,inferRideTimeLeftGeometryFromRawWords,parseEuropeanNumber,pricePlausibility,repeatedTextSignature,suggestShortCodeConsensus,driverUncertaintyMarker,standardFlightPeerContextMatch,oneNumericEditContextPeerIndices,listConsensusPeerCount,leftEdgeTextDegradation,rightEdgeTextDegradation,edgeGlyphTextDegradation,shortCodeImageConsensusPromotion,exactCellMultiViewConsensus,edgeGlyphAdjudication,oneNumericEditAutoCorrectionAllowed,textIntegrityNormalize,textIntegrityEditDistance,suggestNeighborCustomerAfterRouteBoundaryRecovery,textIntegrityHasDiacritic,textIntegritySuspiciousEdgePunctuation,textIntegrityPotentialGlyphSplit,textIntegrityEdgePunctuationAlternative,safeTextIntegrityAlternative,textIntegrityEdgeConflictPromotion,decideTextIntegrity});
});
