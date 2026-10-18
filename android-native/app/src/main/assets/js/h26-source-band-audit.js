/* ATMS H26 - local-only, fail-closed ORIGINAL wordbox / physical band provenance.
 * Geometry is NOT a ride, a verified OCR cell, or an import authorization.
 * Never retains/transmits raw text, never creates synthetic rides. */
(function(global){
 'use strict';
 const finite = n => typeof n === 'number' && Number.isFinite(n);
 const nonnegative = n => finite(n) && n >= 0;
 const integer = n => Number.isSafeInteger(n) && n >= 0;
 function audit({grid,rows,words,sourceWidth,sourceHeight,ocrWidth,ocrHeight}) {
  if(!grid?.accepted || !Array.isArray(grid.bands) || grid.bands.length<2 || grid.bands.length>100 ||
     !finite(grid.pitch) || grid.pitch<16 || !grid.openTail || grid.openTail.fullyBounded!==false ||
     !Array.isArray(rows) || rows.length<2 || rows.length>100 || !Array.isArray(words) || words.length<2 || words.length>15000 ||
     !integer(sourceWidth) || sourceWidth<500 || sourceWidth>2200 || !integer(sourceHeight) || sourceHeight<110 || sourceHeight>3600 ||
     !finite(ocrWidth) || ocrWidth<100 || !finite(ocrHeight) || ocrHeight<100)return null;
  const sx=sourceWidth/ocrWidth,sy=sourceHeight/ocrHeight;
  if(!finite(sx)||!finite(sy)||sx<=0||sy<=0||sx>5||sy>5)return null;
  const bands=[...grid.bands,grid.openTail];
  if(grid.openTail.y1!==sourceHeight || grid.openTail.y0!==grid.bands[grid.bands.length-1].y1 ||
     bands.some((b,i)=>!nonnegative(b.y0)||!nonnegative(b.y1)||b.y1<=b.y0 ||
       (i>0&&b.y0!==bands[i-1].y1) || (i<bands.length-1&&b.fullyBounded!==true)))return null;
  // Row-to-band indexes are ONLY nearest pixel-center candidates, not identities.
  const mapping=bands.map(()=>({realRows:0,syntheticRows:0,sourceRows:0,wordCenters:0,unmappedRows:0}));
  let unmatchedRowCenters=0,syntheticCount=0;
  for(const r of rows){
   if(!r || !finite(r.cy) || !finite(r.y0)||!finite(r.y1)||r.y1<=r.y0)return null;
   const cy=r.cy*sy;
   let nearest=-1,delta=Infinity;
   bands.forEach((b,i)=>{const d=Math.abs(cy-(b.y0+b.y1)/2);if(d<delta){delta=d;nearest=i;}});
   const synthetic=Boolean(r.syntheticGap||r.synthetic||r.inferred||r.recovered);
   if(synthetic)syntheticCount++;
   if(delta>grid.pitch*.34){unmatchedRowCenters++;continue;}
   mapping[nearest].sourceRows++;
   if(synthetic)mapping[nearest].syntheticRows++;
   else mapping[nearest].realRows++;
  }
  let unlocatedWords=0;
  for(const w of words){
   const b=w?.bbox||w;
   if(!b || ![b.x0,b.x1,b.y0,b.y1].every(finite)||b.x0<0||b.y0<0||
     b.x1<=b.x0||b.y1<=b.y0){unlocatedWords++;continue;}
   const cy=(b.y0+b.y1)*.5*sy;
   const idx=bands.findIndex(band=>cy>=band.y0&&cy<band.y1);
   if(idx<0){unlocatedWords++;continue;}
   mapping[idx].wordCenters++;
  }
  const flags=Object.freeze(mapping.map((v,i)=>{
    const b=bands[i],type=b.fullyBounded!==true?'open_tail':
      v.realRows>1?'competing_source_rows':v.syntheticRows>0?'synthetic_matrix_row':
      v.realRows===0 && v.wordCenters>0?'wordboxes_without_matrix_row':
      v.realRows===0?'pixel_band_without_matrix_provenance':'geometry_candidate_only';
    return Object.freeze({bandIndex:i+1,y0:b.y0,y1:b.y1,sourceRows:v.sourceRows,
      originalMatrixRows:v.realRows,syntheticMatrixRows:v.syntheticRows,wordCenterCount:v.wordCenters,
      reason:type,identityVerified:false});
  }));
  const missing=flags.filter(v=>v.reason==='wordboxes_without_matrix_row');
  const synthetic=flags.filter(v=>v.reason==='synthetic_matrix_row');
  const needsReview=flags.some(v=>v.reason!=='geometry_candidate_only');
  return Object.freeze({version:'H26_ORIGINAL_SOURCE_BAND_AUDIT_ONLY',
    observedBoundedBands:grid.bands.length,hasOpenTail:true,sourceMatrixRows:rows.length,
    sourceWordboxes:words.length,unlocatedWords,unmatchedRowCenters,
    syntheticSourceRows:syntheticCount,missingBoundedBandsWithWordCenters:missing.length,
    unresolvedBoundedBands:flags.filter(v=>v.reason!=='geometry_candidate_only'&&v.reason!=='open_tail').length,
    flags,requiresExplicitReview:needsReview,sourceContentVerified:false,rideIdentityVerified:false,
    verifiedCells:0,verifiedRides:0,mayImport:false,canPersist:false,complete:false,noRideApproval:true});
 }
 const api=Object.freeze({audit});global.ATMSH26SourceBands=api;
 if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
