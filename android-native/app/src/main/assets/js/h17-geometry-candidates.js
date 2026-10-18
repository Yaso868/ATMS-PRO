/* H17: pixel-rule/OCR-center correspondence candidates. GEOMETRY ONLY. Never ride approval. */
(function(global){
 'use strict';
 const valid=x=>Number.isFinite(x)&&x>=0;
 function align(grid,metaRows,scaleY=1){
  if(!grid?.accepted||!grid.openTail||grid.openTail.fullyBounded!==false||
     !Array.isArray(grid.bands)||!Number.isFinite(grid.pitch)||grid.pitch<16||
     !Array.isArray(metaRows)||metaRows.length<2||metaRows.length!==grid.bands.length||
     !valid(scaleY)||scaleY===0||grid.bands.length>100)return null;
  const mapped=[];
  for(let i=0;i<metaRows.length;i++){
   const row=metaRows[i],band=grid.bands[i];
   // Synthetic or reconstructed OCR centers are never a measured correspondence.
   if(!row||!valid(row.cy)||!valid(row.y0)||!valid(row.y1)||row.y1<=row.y0||
      row.syntheticGap||row.synthetic||row.recovered||row.inferred||
      !band?.fullyBounded||!valid(band.y0)||!valid(band.y1)||band.y1<=band.y0)return null;
   const cy=row.cy*scaleY, y0=row.y0*scaleY,y1=row.y1*scaleY;
   // A word center must be inside exactly its measured physical band, not guessed
   // from a row number. OCR bbox must also intersect the physical band safely.
   if(!(cy>band.y0+grid.pitch*.14&&cy<band.y1-grid.pitch*.14)||
      Math.abs(cy-band.center)>grid.pitch*.23||
      y0<band.y0-grid.pitch*.12||y1>band.y1+grid.pitch*.12)return null;
   const other=grid.bands.filter(b=>cy>b.y0+grid.pitch*.14&&cy<b.y1-grid.pitch*.14);
   if(other.length!==1||other[0]!==band)return null;
   mapped.push(Object.freeze({matrixIndex:i+1,candidateBandIndex:i,y0:band.y0,y1:band.y1,
     evidence:'original_pixel_rule_plus_ocr_bbox',physicalMappingVerified:false}));
  }
  if(grid.bands[grid.bands.length-1].y1!==grid.openTail.y0)return null;
  return Object.freeze({version:'H17_GEOMETRY_CANDIDATES_ONLY',rows:Object.freeze(mapped),
    physicalMappingVerified:false,verifiedTextCells:0,mayImport:false,noRideApproval:true});
 }
 // H18: Audit the ACTUAL matrix-row bbox provenance against source pixel bands.
 // A status is only diagnostic; neither OCR order nor a matching center certifies a cell.
 function audit(grid,metaRows,scaleY=1,schemaColumns=13){
  if(!grid?.accepted||!Array.isArray(grid.bands)||!grid.openTail||
     !Array.isArray(metaRows)||metaRows.length<1||metaRows.length>100||
     metaRows.length!==grid.bands.length||!Number.isFinite(scaleY)||scaleY<=0||
     !Number.isInteger(schemaColumns)||schemaColumns<1||schemaColumns>40||
     !Number.isFinite(grid.pitch)||grid.pitch<16)return null;
  const flagged=[];
  for(let i=0;i<metaRows.length;i++){
   const r=metaRows[i],b=grid.bands[i];
   if(!r||!b?.fullyBounded||![r.cy,r.y0,r.y1,b.y0,b.y1].every(Number.isFinite)||
      r.y1<=r.y0||b.y1<=b.y0)return null;
   const cy=r.cy*scaleY,y0=r.y0*scaleY,y1=r.y1*scaleY;
   let reason=null;
   if(r.syntheticGap||r.synthetic||r.recovered||r.inferred) reason='synthetic_or_inferred';
   else if(!(cy>b.y0+grid.pitch*.14&&cy<b.y1-grid.pitch*.14)||
      Math.abs(cy-b.center)>grid.pitch*.23)reason='center_not_unique';
   else if(y0<b.y0-grid.pitch*.12||y1>b.y1+grid.pitch*.12)
      reason='bbox_crosses_physical_band';
   if(reason)flagged.push(Object.freeze({matrixIndex:i+1,reason}));
  }
  return Object.freeze({version:'H18_SOURCE_META_DIAGNOSTIC_ONLY',
    observedRows:metaRows.length,observedColumns:schemaColumns,
    reason:schemaColumns!==13?'schema_mismatch':flagged.length?'row_provenance_conflicts':'geometry_screen_only',
    flaggedRows:Object.freeze(flagged),allRowsProven:false,
    verifiedCellValues:0,physicalMappingVerified:false,mayImport:false,canPersist:false,noRideApproval:true});
 }
 const api=Object.freeze({align,audit});global.ATMSH17Geometry=api;
 if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
