/* H27: source-bounded OCR-word review for existing H26 blocked bands only.
 * No guessed cell values, verified rides, state changes, imports or persistence. */
(function(global){
 'use strict';
 const int=n=>Number.isSafeInteger(n)&&n>=0;
 const safeText=t=>typeof t==='string'&&t.length<=300;
 function build({sourceAudit,pixelEvidence}){
  const a=sourceAudit,p=pixelEvidence;
  if(a?.version!=='H26_ORIGINAL_SOURCE_BAND_AUDIT_ONLY'||a.mayImport!==false||
     a.canPersist!==false||a.complete!==false||a.rideIdentityVerified!==false||a.verifiedRides!==0||
     p?.version!=='H19_PIXEL_WORD_REVIEW_ONLY'||p.mayImport!==false||
     p.canPersist!==false||p.complete!==false||p.physicalMappingVerified!==false||
     p.verifiedTextCells!==0||p.originalMatrixReplaced!==false||
     !int(p.sourceWidth)||!int(p.sourceHeight)||!int(a.sourceWordboxes)||
     !int(p.assignedWords)||!int(p.excludedWords)||
     a.sourceWordboxes!==p.assignedWords+p.excludedWords||
     !int(a.observedBoundedBands)||a.observedBoundedBands<2||a.observedBoundedBands>90||
     !Array.isArray(a.flags)||a.flags.length!==a.observedBoundedBands+1||
     !Array.isArray(p.pixelBands)||p.pixelBands.length!==a.observedBoundedBands||
     !Array.isArray(p.reviewRows)||p.reviewRows.length!==a.observedBoundedBands||
     !Array.isArray(p.boundaries)||p.boundaries.length!==14||
     p.boundaries[0]>2||p.boundaries[13]>p.sourceWidth||p.sourceWidth-p.boundaries[13]>2||
     p.boundaries.some((v,i)=>!int(v)||v>p.sourceWidth||(i>0&&v-p.boundaries[i-1]<=34))||
     !p.reviewRows.every(row=>Array.isArray(row)&&row.length===13&&row.every(safeText)))return null;
  const targets=[];
  for(let i=0;i<a.flags.length;i++){
   const f=a.flags[i];
   if(!f||f.bandIndex!==i+1||!int(f.y0)||!int(f.y1)||f.y1<=f.y0||
      !int(f.wordCenterCount)||!int(f.sourceRows)||!int(f.originalMatrixRows)||
      !int(f.syntheticMatrixRows)||typeof f.reason!=='string'||f.identityVerified!==false)return null;
   if(i===a.observedBoundedBands){
    if(f.reason!=='open_tail'||f.y1!==p.sourceHeight||f.y0!==p.pixelBands[i-1].y1)return null;
    continue;
   }
   const b=p.pixelBands[i];
   if(f.y0!==b.y0||f.y1!==b.y1||
      (i>0&&f.y0!==a.flags[i-1].y1))return null;
   if(!['synthetic_matrix_row','wordboxes_without_matrix_row'].includes(f.reason))continue;
   const cells=Object.freeze(p.reviewRows[i].map((t,ci)=>Object.freeze({
    column:ci+1,x0:p.boundaries[ci],x1:p.boundaries[ci+1],
    originalOcrCandidate:t,hasGeometricallyContainedOcrWord:t.length>0,
    manualReviewed:false,verified:false,source:'fully_bounded_original_ocr_wordbox_only'})));
   targets.push(Object.freeze({bandIndex:f.bandIndex,y0:f.y0,y1:f.y1,
     reason:f.reason,wordCenters:f.wordCenterCount,cells,
     geometricallyObservedCells:cells.filter(c=>c.hasGeometricallyContainedOcrWord).length,
     rideIdentityVerified:false,mayImport:false}));
  }
  if(!targets.length)return null;
  return Object.freeze({version:'H27_BLOCKED_SOURCE_CELLS_ONLY',sourceWidth:p.sourceWidth,
    sourceHeight:p.sourceHeight,sourceWordboxes:a.sourceWordboxes,
    targets:Object.freeze(targets),observedPhysicalBands:a.observedBoundedBands,
    verifiedCells:0,verifiedRides:0,physicalMappingVerified:false,complete:false,
    canPersist:false,mayImport:false,noRideApproval:true});
 }
 const api=Object.freeze({build});global.ATMSH27SourceCells=api;
 if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
