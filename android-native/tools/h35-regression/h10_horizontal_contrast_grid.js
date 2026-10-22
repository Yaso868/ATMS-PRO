'use strict';
// READ-ONLY / fail-closed. RGB image pixel evidence; this module never emits rides or inserts rows.
// User original pictures and OCR texts must not be bundled with this module.
function medianSorted(a) { const b=[...a].sort((x,y)=>x-y);return b.length? (b[Math.floor((b.length-1)/2)]+b[Math.floor(b.length/2)])/2:NaN; }
function h10HorizontalContrastGrid(img,hints={}) {
  const reject=(reason,extras={})=>({accepted:false,reason,lines:[],bands:[],...extras});
  const {width:w,height:h,channels:ch,data}=img||{};
  if(!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<110||![3,4].includes(ch)||!data||data.length<w*h*ch) return reject('invalid_pixels');
  const headerCy=Number(hints.headerCy),headerEnd=Number(hints.headerEnd);
  if(!Number.isFinite(headerCy)||!Number.isFinite(headerEnd)||headerCy<8||headerEnd>=h) return reject('header_not_proven');
  const rowCenters=Array.isArray(hints.rowCenters)?hints.rowCenters.filter(Number.isFinite).sort((a,b)=>a-b):[];
  const adjacentGaps=rowCenters.slice(1).map((a,i)=>a-rowCenters[i]).filter(v=>v>=12&&v<=h*.1);
  const hintGap=medianSorted(adjacentGaps);
  if(!Number.isFinite(hintGap)||hintGap<12||hintGap>h*.15) return reject('ocr_row_pitch_unavailable');
  // Pixel sampling offset derives only from the median *observed* OCR row pitch.
  const off=Math.max(2,Math.round(hintGap*.13));
  const sampleStep=Math.max(3,Math.round(w/300));
  const x0=Math.floor(w*.06), x1=Math.ceil(w*.96), sampled=Math.ceil((x1-x0)/sampleStep);
  if(sampled<140) return reject('insufficient_width');
  const candidates=[];
  for(let y=Math.max(off,Math.floor(headerCy-hintGap*.9));y<h-off;y++) {
    const values=[]; let positive=0;
    for(let x=x0;x<x1;x+=sampleStep){
      const i=(y*w+x)*ch,ip=((y-off)*w+x)*ch,iq=((y+off)*w+x)*ch;
      const c=(data[i]+data[i+1]+data[i+2])/3;
      const a=(data[ip]+data[ip+1]+data[ip+2])/3;
      const b=(data[iq]+data[iq+1]+data[iq+2])/3;
      const dip=(a+b)*.5-c;
      values.push(dip);
      if(dip>8)positive++;
    }
    const med=medianSorted(values);
    if(med>12 && positive/values.length>.73) candidates.push({y,med});
  }
  if(candidates.length<4) return reject('too_few_line_candidates');
  const clusters=[];
  candidates.forEach(point=>{
    const last=clusters[clusters.length-1];
    if(!last||point.y>last[last.length-1].y+2) clusters.push([point]); else last.push(point);
  });
  const lines=clusters.map(cluster=>cluster.slice().sort((a,b)=>b.med-a.med||a.y-b.y)[0].y).sort((a,b)=>a-b);
  // The header OCR box may spill into the first data row. In that narrow case
  // locate the actual header baseline using an OBSERVED raster line and the
  // independently measured first OCR data-row center. Never infer a new line.
  let close=lines.filter(y=>Math.abs(y-headerEnd)<=Math.max(3,hintGap*.29) && y>headerCy+hintGap*.20 && y<headerCy+hintGap*.80);
  if(close.length!==1) {
    const firstDataCy=rowCenters[0];
    const headerOverlapsFirstData=Number.isFinite(firstDataCy) &&
      headerEnd>firstDataCy && headerEnd-firstDataCy<=hintGap*.60;
    const predictedTop=firstDataCy-hintGap*.5;
    const physicalCandidates=lines.filter(y=>
      Math.abs(y-predictedTop)<=Math.max(3,hintGap*.22) &&
      y>headerCy+hintGap*.16 && y<headerCy+hintGap*.72 &&
      firstDataCy-y>hintGap*.25 && firstDataCy-y<hintGap*.75 &&
      headerEnd-y>0 && headerEnd-y<=hintGap*1.05);
    if(!headerOverlapsFirstData||physicalCandidates.length!==1)
      return reject('header_bottom_not_unique',{lineCount:lines.length});
    close=physicalCandidates;
  }
  const first=close[0], gridLines=lines.filter(y=>y>=first);
  const gaps=gridLines.slice(1).map((y,i)=>y-gridLines[i]);
  if(gaps.length<2||gaps.length>60) return reject('implausible_rule_count',{lineCount:gridLines.length});
  const pitch=medianSorted(gaps);
  if(pitch<16||pitch>h*.25||Math.abs(pitch-hintGap)>Math.max(4,hintGap*.18)) return reject('pitch_mismatch',{lineCount:gridLines.length});
  // One missing or fake rule is NOT interpolated: the whole candidate fails.
  if(gaps.some(g=>Math.abs(g-pitch)>Math.max(2,pitch*.10))) return reject('irregular_physical_grid',{lineCount:gridLines.length});
  // A sustained one-way 3px body displacement is not a globally stable grid.
  // A single locally offset line with compensating next/previous gap is allowed.
  const phaseShift=Math.max(2.4,pitch*.08);
  if(gaps.some((g,i)=>g>pitch+phaseShift &&
      !gaps.slice(Math.max(0,i-2),Math.min(gaps.length,i+3)).some(other=>other<pitch-phaseShift)))
    return reject('uncompensated_grid_phase_shift',{lineCount:gridLines.length});
  const bands=gridLines.slice(1).map((stop,i)=>({y0:gridLines[i],y1:stop,center:(gridLines[i]+stop)/2,fullyBounded:true}));
  // An OCR-bearing final row cut at image bottom can be a candidate only, never an approved full band.
  const remaining=h-gridLines[gridLines.length-1];
  const trailingOpen=remaining>pitch*.6&&remaining<pitch*1.24;
  if(remaining>pitch*1.24) return reject('unbounded_tail_gap',{lineCount:gridLines.length});
  return {accepted:true,reason:'geometry_only',lines:gridLines,bands,pitch,trailingOpen,
    openTail:trailingOpen?{y0:gridLines[gridLines.length-1],y1:h,fullyBounded:false}:null,
    noRideApproval:true,originalRowsUnchanged:true};
}
// Matches OCR row geometry against actual pixel-bounded physical bands.
// Emits ONLY aggregate correspondence. It cannot create records, text, or imports.
function h10CompareMatrixRows(grid,rowCenters,scaleY=1) {
 const reject=reason=>({accepted:false,reason,noRideApproval:true});
 if(!grid?.accepted||!Array.isArray(rowCenters)||!Number.isFinite(scaleY)||scaleY<=0) return reject('grid_or_rows_unavailable');
 const bands=grid.bands.concat(grid.openTail?[{...grid.openTail,center:(grid.openTail.y0+grid.openTail.y1)/2}]:[]);
 const matched=new Set(),duplicates=[],unmapped=[];
 for(let i=0;i<rowCenters.length;i++) {
   const cy=Number(rowCenters[i])*scaleY;
   if(!Number.isFinite(cy)) return reject('unmeasured_ocr_row');
   let closest=-1,delta=Infinity;
   for(let j=0;j<bands.length;j++) {
     const dist=Math.abs(cy-bands[j].center);
     if(dist<delta){delta=dist;closest=j;}
   }
   if(delta>grid.pitch*.34){unmapped.push(i);continue;}
   if(matched.has(closest))duplicates.push(i);
   matched.add(closest);
 }
 if(duplicates.length||unmapped.length) return {accepted:false,reason:'row_collision_or_unmapped',duplicateCount:duplicates.length,unmappedCount:unmapped.length,noRideApproval:true};
 const uncovered=bands.map((b,j)=>({j,fullyBounded:b.fullyBounded})).filter(b=>!matched.has(b.j));
 return {accepted:true,reason:'row_geometry_only',sourceRows:rowCenters.length,
   physicalBandCandidates:bands.length,fullyBoundedUnmatched:uncovered.filter(b=>b.fullyBounded).length,
   unboundedUnmatched:uncovered.filter(b=>!b.fullyBounded).length,unmatchedBandIndices:uncovered.map(b=>b.j),
   noRideApproval:true,noMatrixMutation:true};
}
module.exports={h10HorizontalContrastGrid,h10CompareMatrixRows};
