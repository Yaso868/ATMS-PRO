/* ATMS H15 - transient, fail-closed structured preview drafts. NOT RIDES / NOT IMPORT AUTHORITY. */
(function(global){
 'use strict';
 const fields=Object.freeze(['price','rideTime','from','to','customer','company','secondTime','flightNumber','vehicle','persons','flightTime','flightPlace','driver']);
 const MAX_ROWS=100, MAX_RAW=300, MAX_EDIT=160;
 // H16: Syntax screening ONLY. No semantic/physical verification and never import authority.
 // Manual review requires a valid value, but a valid syntax is NOT a confirmed journey.
 function syntaxOf(index,value,explicitEmptyDriver=false){
  if(!Number.isInteger(index)||index<0||index>=fields.length||
     typeof value!=='string'||value.length>MAX_EDIT||
     typeof explicitEmptyDriver!=='boolean'||(explicitEmptyDriver&&index!==12))
    return Object.freeze({ok:false,reason:'invalid_input'});
  if(/[\u0000-\u001f\u007f]/u.test(value))return Object.freeze({ok:false,reason:'control_characters'});
  const v=value.trim();
  if(explicitEmptyDriver)return Object.freeze({ok:!v,reason:v?'empty_driver_conflicts_with_text':'explicit_blank_driver'});
  if(!v)return Object.freeze({ok:false,reason:'empty_value'});
  let valid=true,reason='syntax_only';
  switch(index){
   case 0: {const norm=v.replace(',','.');valid=/^\d{1,6}(?:\.\d{1,2})?$/.test(norm)&&Number(norm)<=100000;reason='price_format';break;}
   case 1: case 6: case 10:
     valid=/^(?:[01]?\d|2[0-3]):[0-5]\d$/.test(v);reason='time_format';break;
   case 7:
     valid=/^[A-Za-z0-9]{2,3}\s?\d{1,5}[A-Za-z]?$/.test(v);reason='flight_number_format';break;
   case 8:
     valid=v.length<=80&&!/^\d+(?:[.,]\d+)?$/.test(v);reason='vehicle_text';break;
   case 9:
     valid=/^[1-9]\d?$/.test(v);reason='persons_range';break;
   case 12:
     valid=v.length<=80 && /[\p{L}]/u.test(v);reason='driver_text';break;
   default:
     valid=v.length<=MAX_EDIT;reason='nonempty_text';
  }
  return Object.freeze({ok:valid,reason:valid?'syntax_only':reason});
 }
 const validCount=x=>Number.isSafeInteger(x)&&x>=0;
 const frozen=x=>{if(x&&typeof x==='object'&&!Object.isFrozen(x)){
   Object.values(x).forEach(frozen);Object.freeze(x);
 }return x;};
 function create(issue,source){
  if(!issue||issue.version!=='H12_LOCAL_REVIEW_BLOCK'||issue.mayImport!==false||
     issue.requiresExplicitReview!==true||issue.verifiedCellValues!==0||
     !validCount(issue.boundedMissing)||issue.boundedMissing!==0||
     !validCount(issue.openTailMissing)||issue.openTailMissing!==1||
     !Array.isArray(issue.reviewRows)||issue.reviewRows.length<1||issue.reviewRows.length>MAX_ROWS||
     !issue.reviewRows.every(row=>Array.isArray(row)&&row.length===fields.length&&row.every(s=>typeof s==='string'&&s.length<=MAX_RAW))) return null;
  const g=issue.reviewGeometry;
  if(!g||g.pixelGeometryOnly!==true||g.fullyBounded!==false||g.verifiedTextCells!==0||
     !validCount(g.sourceWidth)||!validCount(g.sourceHeight)||g.sourceWidth<500||g.sourceWidth>2200||
     g.sourceHeight<110||g.sourceHeight>3600||!validCount(g.top)||!validCount(g.bottom)||
     g.top<=0||g.bottom!==g.sourceHeight||g.bottom-g.top<11||g.bottom-g.top>80||
     !Array.isArray(g.boundaries)||g.boundaries.length!==14||
     !g.boundaries.every(validCount)||g.boundaries[0]>2||g.sourceWidth-g.boundaries[13]>2||
     g.boundaries.some((v,i)=>i>0&&v-g.boundaries[i-1]<=34))return null;
  if(!source||typeof source.name!=='string'||!source.name||source.name.length>255||
     !validCount(source.size)||source.size<1||source.size>16000000||
     !['image/jpeg','image/png','image/webp'].includes(source.type)||
     !validCount(source.lastModified))return null;
  // H17 candidate bands are optional, never authoritative. Bad/fabricated
  // bounds must not turn OCR order into a claimed physical identity.
  const candidate=issue.reviewBandCandidates;
  const physicalCandidates= candidate?.version==='H17_GEOMETRY_CANDIDATES_ONLY' &&
    candidate?.physicalMappingVerified===false && candidate?.mayImport===false &&
    candidate?.noRideApproval===true && candidate?.verifiedTextCells===0 &&
    Array.isArray(candidate.rows) && candidate.rows.length===issue.reviewRows.length &&
    candidate.rows.every((c,i)=>c?.physicalMappingVerified===false &&
      c?.matrixIndex===i+1 && c?.candidateBandIndex===i &&
      c?.evidence==='original_pixel_rule_plus_ocr_bbox' &&
      Number.isSafeInteger(c?.y0) && Number.isSafeInteger(c?.y1) &&
      c.y0>=0 && c.y1>c.y0 && c.y1<=g.top &&
      (i===0 || candidate.rows[i-1].y1===c.y0)) &&
    candidate.rows[candidate.rows.length-1].y1===g.top ? candidate.rows : null;
  // H18: optional original OCR bbox conflict badges. They do not change a raw value.
  const provenance=issue.reviewRowMetaAudit;
  const provenanceFlags=provenance?.version==='H18_SOURCE_META_DIAGNOSTIC_ONLY'&&
    provenance?.mayImport===false&&provenance?.canPersist===false&&
    provenance?.physicalMappingVerified===false&&provenance?.verifiedCellValues===0&&
    provenance?.allRowsProven===false&&provenance?.observedRows===issue.reviewRows.length&&
    provenance?.observedColumns===13&&
    Array.isArray(provenance.flaggedRows)&&provenance.flaggedRows.length<=issue.reviewRows.length&&
    provenance.flaggedRows.every((r,i)=>Number.isSafeInteger(r?.matrixIndex)&&r.matrixIndex>=1&&
      r.matrixIndex<=issue.reviewRows.length&&
      (i===0||r.matrixIndex>provenance.flaggedRows[i-1].matrixIndex)&&
      ['synthetic_or_inferred','center_not_unique','bbox_crosses_physical_band'].includes(r.reason))
    ? provenance.flaggedRows:null;
  // H19: trusted only as a read-only geometry source. The original matrix was
  // 10 columns; these 13 values are OCR words fully inside measured pixel cells,
  // NOT parsed rides, verified rows or approved text. Invalid claims fail closed.
  const pixel=issue.reviewPixelFallback;
  const pixelValid=pixel?.version==='H19_PIXEL_WORD_REVIEW_ONLY' &&
    pixel?.sourceMatrixColumns===10&&pixel?.physicalMappingVerified===false&&
    pixel?.mayImport===false&&pixel?.canPersist===false&&
    pixel?.verifiedTextCells===0 && validCount(pixel?.assignedWords)&&
    validCount(pixel?.excludedWords)&&validCount(pixel?.observedCells)&&
    pixel.observedCells<=issue.reviewRows.length*13;
  if(pixel && !pixelValid)return null;
  // H20: optional coordinate-only conflict metadata, never OCR evidence or approval.
  // Reject ANY incomplete or inconsistent extension instead of trusting it.
  const hasH20=pixel && (pixel.attentionRows!==undefined ||
    pixel.reviewBands!==undefined || pixel.excludedByReason!==undefined);
  let h20Attention=null;
  if(hasH20){
    const reasons=['invalid','header','headerBoundary','tail','tailBoundary',
      'rowBoundary','columnBoundary','bothBoundaries'];
    if(!pixelValid || !Array.isArray(pixel.attentionRows)||
      pixel.attentionRows.length!==issue.reviewRows.length||
      !pixel.attentionRows.every(row=>Array.isArray(row)&&row.length===13&&
        row.every(n=>validCount(n)&&n<=pixel.excludedWords))||
      !Array.isArray(pixel.reviewBands)||pixel.reviewBands.length!==issue.reviewRows.length||
      !pixel.reviewBands.every((b,i)=>validCount(b?.y0)&&validCount(b?.y1)&&
        b.y1>b.y0&&b.y1<=g.top&&(i===0 || b.y0===pixel.reviewBands[i-1].y1))||
      pixel.reviewBands[pixel.reviewBands.length-1].y1!==g.top||
      pixel.reviewBands[0].y0<0||
      !pixel.excludedByReason || Object.keys(pixel.excludedByReason).length!==reasons.length||
      !reasons.every(key=>validCount(pixel.excludedByReason[key]))||
      reasons.reduce((sum,key)=>sum+pixel.excludedByReason[key],0)!==pixel.excludedWords)
      return null;
    h20Attention=pixel.attentionRows;
  }
  // Matrix order is OCR order only. Physical-band ID is still not verified.
  const rows=issue.reviewRows.map((row,i)=>({
    sourceRowNumber:i+1,physicalBandIndex:null,
    candidatePhysicalBandIndex:physicalCandidates?physicalCandidates[i].candidateBandIndex:null,
    candidatePhysicalY:physicalCandidates?Object.freeze({y0:physicalCandidates[i].y0,y1:physicalCandidates[i].y1}):null,
    physicalCandidateEvidence:physicalCandidates?'geometry_only':'unavailable',
    sourceRowGeometryIssue:provenanceFlags?.find(r=>r.matrixIndex===i+1)?.reason||null,status:'ocr_unverified',
    observedPixelBand:h20Attention?Object.freeze({y0:pixel.reviewBands[i].y0,y1:pixel.reviewBands[i].y1,evidence:'original_pixel_horizontal_band_only'}):null,
    cells:fields.map((field,k)=>({field,raw:row[k],value:null,status:'ocr_unverified',confirmed:false,
      syntax:syntaxOf(k,row[k]).ok?'syntax_plausible':'syntax_unresolved',
      borderWordWarningCount:h20Attention?h20Attention[i][k]:0}))
  }));
  rows.push({sourceRowNumber:null,physicalBandIndex:null,status:'open_tail_blocked',
    geometry:{top:g.top,bottom:g.bottom,boundaries:g.boundaries.slice()},
    cells:fields.map(field=>({field,raw:null,value:null,status:'requires_manual_review',confirmed:false,syntax:'unassessed'}))
  });
  return frozen({schema:'ATMS_H15_REVIEW_DRAFT_V1',source:{name:source.name,size:source.size,
   lastModified:source.lastModified,type:source.type,width:g.sourceWidth,height:g.sourceHeight},
   rows,sourcePixelReviewOnly:pixelValid===true,sourceBorderWordReviewOnly:Boolean(h20Attention),sourceOcrRows:issue.reviewRows.length,openTailRows:1,allRowsCount:rows.length,
   mayImport:false,canPersist:false,complete:false,physicalMappingVerified:false});
 }
 function updateTail(draft,index,value,confirm=false,explicitEmptyDriver=false){
  if(!draft||draft.schema!=='ATMS_H15_REVIEW_DRAFT_V1'||draft.mayImport!==false||
    draft.canPersist!==false||draft.complete!==false||draft.physicalMappingVerified!==false||
    draft.openTailRows!==1||!Number.isSafeInteger(draft.sourceOcrRows)||
    draft.rows?.length!==draft.sourceOcrRows+1||
    draft.allRowsCount!==draft.rows.length||!Number.isInteger(index)||index<0||index>=fields.length||
    typeof value!=='string'||value.length>MAX_EDIT||typeof confirm!=='boolean'||
    typeof explicitEmptyDriver!=='boolean'||(explicitEmptyDriver&&index!==12))return null;
  const check=syntaxOf(index,value,explicitEmptyDriver);
  if(confirm&&!check.ok)return null;
  const text=value.trim();
  if(confirm&&!text&&!explicitEmptyDriver)return null;
  const last=draft.rows[draft.rows.length-1];
  if(last?.status!=='open_tail_blocked'||last.cells?.length!==fields.length)return null;
  const rows=draft.rows.slice();
  rows[rows.length-1]={...last,cells:last.cells.map((cell,i)=> i!==index?cell:{
    field:fields[index],raw:null,value:explicitEmptyDriver&&confirm?'Nicht zugewiesen':text,
    status:confirm?'manual_review_only':'requires_manual_review',confirmed:confirm,
    syntax:check.ok?'syntax_plausible':'syntax_invalid',
    explicitEmptyDriver:confirm&&explicitEmptyDriver
  })};
  return frozen({...draft,rows,mayImport:false,canPersist:false,complete:false,physicalMappingVerified:false});
 }
 // H21: explicit, CELL-SCOPED human review of a bounded source-pixel crop.
 // Still neither physical ride identity nor a persist/import decision.
 function updatePixelCell(draft,rowIndex,index,value,confirm=false,explicitEmptyDriver=false){
  if(!draft || draft.schema!=='ATMS_H15_REVIEW_DRAFT_V1'||
     draft.sourcePixelReviewOnly!==true||draft.sourceBorderWordReviewOnly!==true||
     draft.mayImport!==false||draft.canPersist!==false||draft.complete!==false||
     draft.physicalMappingVerified!==false||draft.openTailRows!==1||
     !Object.isFrozen(draft)||!Object.isFrozen(draft.rows)||
     !Number.isSafeInteger(draft.sourceOcrRows)||draft.sourceOcrRows<1||draft.sourceOcrRows>MAX_ROWS||
     draft.rows.length!==draft.sourceOcrRows+1||draft.allRowsCount!==draft.rows.length||
     !Number.isSafeInteger(rowIndex)||rowIndex<0||rowIndex>=draft.sourceOcrRows||
     !Number.isInteger(index)||index<0||index>=fields.length||
     typeof value!=='string'||value.length>MAX_EDIT||typeof confirm!=='boolean'||
     typeof explicitEmptyDriver!=='boolean'||(explicitEmptyDriver&&index!==12))return null;
  const row=draft.rows[rowIndex],cell=row?.cells?.[index];
  if(row?.sourceRowNumber!==rowIndex+1||row.status!=='ocr_unverified'||
     row.physicalBandIndex!==null||!Array.isArray(row.cells)||row.cells.length!==13||
     !Object.isFrozen(row)||!Object.isFrozen(cell)||
     cell?.field!==fields[index]||typeof cell.raw!=='string'||cell.raw.length>MAX_RAW||
     !validCount(cell.borderWordWarningCount))return null;
  const check=syntaxOf(index,value,explicitEmptyDriver);
  if(confirm&&!check.ok)return null;
  const text=value.trim();
  if(confirm&&!text&&!explicitEmptyDriver)return null;
  const newCell={...cell,
    value:confirm&&explicitEmptyDriver?'Nicht zugewiesen':text,
    confirmed:confirm,explicitEmptyDriver:confirm&&explicitEmptyDriver,
    status:confirm?'manual_review_only':'ocr_unverified',
    manualScope:'one_original_pixel_cell_only',
    syntax:check.ok?'syntax_plausible':'syntax_invalid'};
  const rows=draft.rows.slice();
  rows[rowIndex]={...row,cells:row.cells.map((c,i)=>i===index?newCell:c)};
  return frozen({...draft,rows,mayImport:false,canPersist:false,complete:false,physicalMappingVerified:false});
 }
 // H23: Review-only calendar context, never an independently verified Plantag.
 // A filename, system default or explicit user input alone does not prove the
 // date printed on the ORIGINAL plan image. No flight/date import authority.
 function validIsoDate(value){
  if(typeof value!=='string'||!/^20\d{2}-\d{2}-\d{2}$/.test(value))return false;
  const [y,m,d]=value.split('-').map(Number);
  const utc=new Date(Date.UTC(y,m-1,d));
  return utc.getUTCFullYear()===y&&utc.getUTCMonth()+1===m&&utc.getUTCDate()===d;
 }
 function planDateReview(context){
  if(context===undefined||context===null)return frozen({status:'not_available',selectedDate:null,
    dateVerified:false,canPersist:false,mayImport:false});
  if(typeof context!=='object'||Array.isArray(context)||
     typeof context.manualPlanDate!=='boolean'||typeof context.dateSourceConflict!=='boolean'||
     !['selectedDate','headerDate','filenameDate'].every(k=>
       typeof context[k]==='string'&&(context[k]===''||validIsoDate(context[k]))))return null;
  // H24 accepts only a strict, geometry-backed OCR candidate. This is
  // never a verified date and never an import authorization.
  const evidence=context.headerEvidence;
  if(evidence!==undefined&&evidence!==null){
    if(typeof evidence!=='object'||Array.isArray(evidence)||
       evidence.version!=='H24_ORIGINAL_HEADER_OCR_CANDIDATE'||
       evidence.status!=='header_ocr_candidate_unverified'||
       evidence.primaryImageWords!==true||evidence.dateVerified!==false||
       evidence.mayImport!==false||evidence.canPersist!==false||
       !validIsoDate(evidence.date)||context.headerDate!==evidence.date||
       !['anchorY0','anchorY1','dateY0','dateY1','headerTop'].every(k=>
         typeof evidence[k]==='number'&&Number.isFinite(evidence[k])&&evidence[k]>=0)||
       evidence.anchorY0>=evidence.anchorY1||evidence.dateY0>=evidence.dateY1||
       evidence.anchorY1>evidence.headerTop||evidence.dateY1>evidence.headerTop+2||
       (evidence.dateY0+evidence.dateY1)/2>=evidence.headerTop)return null;
  }
  const selected=context.selectedDate||null,header=context.headerDate||null;
  const filename=context.filenameDate||null;
  const disagreement=Boolean(context.dateSourceConflict||
    (header&&filename&&header!==filename)||
    (context.manualPlanDate&&header&&selected!==header));
  return frozen({status:disagreement?'source_conflict':context.manualPlanDate&&selected?
      'manual_selection_unverified':header?'header_date_unverified':filename?
      'filename_date_unverified':'not_available',
    headerOcrCandidate:Boolean(evidence),headerOcrDate:evidence?.date||null,
    headerOcrDateVerified:false,
    selectedDate:selected,headerDate:header,filenameDate:filename,
    dateVerified:false,canPersist:false,mayImport:false});
 }
 // H22: a read-only STATUS of the review draft, not a trip validator or an
 // import permission. A field that merely passed OCR syntax is NEVER treated
 // as user-reviewed; image-band/source/flight/date proof remains outstanding.
 // These six fields are minimum review checkpoints, NOT the full production
 // required-field contract (which remains subject to the existing import gate).
 const coreIndices=Object.freeze([1,2,3,8,9,12]);
 function reviewStatus(draft,dateContext){
  if(!draft||draft.schema!=='ATMS_H15_REVIEW_DRAFT_V1'||
     draft.mayImport!==false||draft.canPersist!==false||draft.complete!==false||
     draft.physicalMappingVerified!==false||draft.openTailRows!==1||
     !Number.isSafeInteger(draft.sourceOcrRows)||draft.sourceOcrRows<1||draft.sourceOcrRows>MAX_ROWS||
     !Array.isArray(draft.rows)||draft.rows.length!==draft.sourceOcrRows+1||
     draft.allRowsCount!==draft.rows.length||!Object.isFrozen(draft)||
     !Object.isFrozen(draft.rows))return null;
  const dateReview=planDateReview(dateContext);
  if(!dateReview)return null;
  const statuses=[];let reviewedCount=0;let openCoreCount=0;let sourceRawCount=0;
  let previousPixelBandEnd=null;
  for(let ri=0;ri<draft.rows.length;ri++){
   const row=draft.rows[ri],tail=ri===draft.sourceOcrRows;
   if(!row||!Array.isArray(row.cells)||row.cells.length!==fields.length||
      row.physicalBandIndex!==null||!Object.isFrozen(row)||
      row.status!==(tail?'open_tail_blocked':'ocr_unverified')||
      (tail?row.sourceRowNumber!==null:row.sourceRowNumber!==ri+1))return null;
   // Physical PIXEL-BAND provenance is visible and immutable, but it never
   // certifies the ID of an OCR-MATRIX row or the identity of a ride.
   const band=row.observedPixelBand;
   if(tail ? band!==undefined : (draft.sourcePixelReviewOnly===true&&
      draft.sourceBorderWordReviewOnly===true &&
      (!band||!Object.isFrozen(band)||band.evidence!=='original_pixel_horizontal_band_only'||
      !validCount(band.y0)||!validCount(band.y1)||band.y1<=band.y0||
      band.y1>draft.source.height)))return null;
   if(!tail && band){
     if(previousPixelBandEnd!==null&&band.y0!==previousPixelBandEnd)return null;
     previousPixelBandEnd=band.y1;
   }
   if(tail && previousPixelBandEnd!==null &&
      (row.geometry?.top!==previousPixelBandEnd||
       row.geometry?.bottom!==draft.source.height))return null;
   let confirmed=0,confirmedCore=0,invalidCore=0,unresolvedSyntax=0,rawCells=0;
   const pending=[];
   for(let ci=0;ci<fields.length;ci++){
    const c=row.cells[ci];
    if(!c||c.field!==fields[ci]||!Object.isFrozen(c)||
       typeof c.confirmed!=='boolean'||typeof c.status!=='string'||
       !(c.raw===null&&tail||typeof c.raw==='string'&&!tail&&c.raw.length<=MAX_RAW))return null;
    if(c.raw!==null&&c.raw.trim())rawCells++;
    if(c.syntax==='syntax_unresolved'||c.syntax==='syntax_invalid')unresolvedSyntax++;
    if(c.confirmed){
     const empty=ci===12&&c.explicitEmptyDriver===true;
     const valid=syntaxOf(ci,empty?'':String(c.value??''),empty);
     if(!valid.ok||c.status!=='manual_review_only'||
        (empty&&c.value!=='Nicht zugewiesen')||
        (!empty&&(typeof c.value!=='string'||!c.value.trim())))return null;
     confirmed++;
    }
    if(coreIndices.includes(ci)){
     if(c.confirmed)confirmedCore++;
     else{
      pending.push(fields[ci]);
      if(c.syntax==='syntax_invalid')invalidCore++;
     }
    }
   }
   reviewedCount+=confirmed;openCoreCount+=pending.length;sourceRawCount+=rawCells;
   statuses.push(Object.freeze({rowIndex:ri,sourceRowNumber:row.sourceRowNumber,
     status:tail?'blocked_open_tail':pending.length?'blocked_core_review_pending':'blocked_core_reviewed_only',
     coreReviewed:confirmedCore,coreTotal:coreIndices.length,
     pendingCore:Object.freeze(pending),invalidCore,
     manuallyReviewedCells:confirmed,totalCells:fields.length,
     originalRawCells:rawCells,unresolvedSyntax,
     originalPixelBand:band?Object.freeze({y0:band.y0,y1:band.y1}):null,
     physicalPixelBandObserved:Boolean(band),rideIdentityVerified:false,
     physicalMappingVerified:false,complete:false,mayImport:false,canPersist:false}));
  }
  return frozen({version:'H22_LOCAL_REVIEW_STATUS_ONLY',rows:statuses,
    totalRows:statuses.length,sourceOcrRows:draft.sourceOcrRows,
    openTailRows:1,planDateReview:dateReview,coreTotal:statuses.length*coreIndices.length,
    corePending:openCoreCount,manuallyReviewedCells:reviewedCount,
    originalRawCells:sourceRawCount,verifiedRides:0,
    physicalMappingVerified:false,complete:false,mayImport:false,canPersist:false,
    requiresFinalProductionValidation:true,requiresSourceBandProof:true,
    requiresFlightAndDateReview:true});
 }
 // H25: One non-authorizing evidence contract for the SAME blocked 14+1 review.
 // Neither OCR syntax, a manual transcription, a geometric band, nor a header
 // date is independent confirmation of a journey, route, airport or flight.
 function integratedEvidenceReview(draft,dateContext){
  const base=reviewStatus(draft,dateContext);
  if(!base||base.mayImport!==false||base.canPersist!==false||
     base.physicalMappingVerified!==false||base.verifiedRides!==0||
     base.rows.length!==draft.rows.length)return null;
  const day=base.planDateReview;
  if(day?.dateVerified!==false||day?.mayImport!==false||day?.canPersist!==false)return null;
  const entries=[];
  const totals={manualUnverified:0,ocrSyntaxOnly:0,ocrUnresolved:0,missingOriginal:0,
    borderWarnings:0,originalBands:0,sourceConflicts:0};
  for(let ri=0;ri<draft.rows.length;ri++){
   const row=draft.rows[ri],prior=base.rows[ri],tail=ri===draft.sourceOcrRows;
   if(prior?.rowIndex!==ri||prior.rideIdentityVerified!==false||prior.mayImport!==false||
      prior.canPersist!==false||prior.complete!==false||prior.physicalMappingVerified!==false)return null;
   const fieldStates=[];const checks=[];
   for(let ci=0;ci<fields.length;ci++){
    const c=row.cells[ci];
    const border=c.borderWordWarningCount??0;
    if(!validCount(border))return null;
    let kind;
    if(c.confirmed){
      if(c.status!=='manual_review_only'||!syntaxOf(ci,c.explicitEmptyDriver?'':c.value,c.explicitEmptyDriver===true).ok)return null;
      kind='manual_review_unverified';totals.manualUnverified++;
    }else if(tail||c.raw===null){
      kind='missing_original';totals.missingOriginal++;
    }else if(c.syntax==='syntax_plausible'){
      kind='ocr_syntax_only';totals.ocrSyntaxOnly++;
    }else{
      kind='ocr_unresolved';totals.ocrUnresolved++;
    }
    if(border>0){totals.borderWarnings++;checks.push('wordbox_border_requires_image_review');}
    fieldStates.push(Object.freeze({field:fields[ci],column:ci+1,evidence:kind,
      originalRawPreserved:c.raw!==null,hasManualEntry:typeof c.value==='string'&&c.value.length>0,
      borderWarning:border>0,sourceVerified:false,semanticallyVerified:false}));
   }
   if(prior.physicalPixelBandObserved)totals.originalBands++;
   if(!tail && !prior.physicalPixelBandObserved)checks.push('physical_band_not_observed');
   if(!tail && row.sourceRowGeometryIssue)checks.push('ocr_row_geometry_unresolved');
   const pickup=row.cells[2],dropoff=row.cells[3];
   // Equal place names are a targeted *review hint*, not an invalid ride.
   if(pickup.confirmed&&dropoff.confirmed&&
      pickup.value.trim().toLocaleLowerCase('de')===dropoff.value.trim().toLocaleLowerCase('de'))
      checks.push('same_pickup_and_destination_review');
   const flight=row.cells[7],flightTime=row.cells[10],flightPlace=row.cells[11];
   if(flight.confirmed&&(!flightTime.confirmed||!flightPlace.confirmed))
      checks.push('flight_context_not_fully_reviewed');
   if(day.status==='source_conflict')checks.push('plan_date_source_conflict');
   if(day.status==='not_available')checks.push('plan_date_not_available');
   if(tail)checks.push('open_tail_not_physical_ride');
   totals.sourceConflicts+=checks.filter(x=>x==='plan_date_source_conflict').length;
   entries.push(Object.freeze({rowIndex:ri,originalPixelBand:prior.originalPixelBand,
     physicalBandObserved:prior.physicalPixelBandObserved,rideIdentityVerified:false,
     dateEvidence:day.status,fieldStates:Object.freeze(fieldStates),
     checkHints:Object.freeze([...new Set(checks)]),
     manuallyReviewedCells:prior.manuallyReviewedCells,
     coreReviewed:prior.coreReviewed,coreTotal:prior.coreTotal,
     status:tail?'blocked_open_tail':'blocked_original_ride_unverified',
     semanticReviewComplete:false,flightVerified:false,mayImport:false,canPersist:false}));
  }
  const result={version:'H25_INTEGRATED_EVIDENCE_REVIEW_ONLY',rows:entries,
    rowCount:entries.length,sourceOcrRows:draft.sourceOcrRows,openTailRows:1,
    dateReview:day,counts:totals,verifiedRides:0,verifiedFlightChecks:0,
    rideIdentityVerified:false,semanticReviewComplete:false,
    requiresManualSourceReview:true,mayImport:false,canPersist:false,complete:false};
  return frozen(result);
 }

 // H28: isolated, HUMAN-ONLY inspection of H27 unproven source bands.
 // This is an H15 source-cell review draft, NOT the H15 ride-draft schema.
 // In particular, an image band with no bounded OCR word stays raw:null.
 const sourceCellSchema='ATMS_H15_SOURCE_CELL_REVIEW_ONLY';
 function sourceCellReviewStatus(draft){
  if(!draft||draft.schema!==sourceCellSchema||!Object.isFrozen(draft)||
     draft.mayImport!==false||draft.canPersist!==false||draft.complete!==false||
     draft.rideIdentityVerified!==false||draft.physicalMappingVerified!==false||
     draft.verifiedRides!==0||draft.verifiedCells!==0||draft.noRideApproval!==true||
     !draft.source||!Object.isFrozen(draft.source)||
     typeof draft.source.name!=='string'||!draft.source.name||draft.source.name.length>255||
     !['image/jpeg','image/png','image/webp'].includes(draft.source.type)||
     !validCount(draft.source.size)||draft.source.size<1||draft.source.size>16000000||
     !validCount(draft.source.lastModified)||
     !validCount(draft.source.width)||draft.source.width<500||draft.source.width>2200||
     !validCount(draft.source.height)||draft.source.height<110||draft.source.height>3600||
     !validCount(draft.sourceWordboxes)||
     !Array.isArray(draft.rows)||!Object.isFrozen(draft.rows)||
     draft.rows.length<1||draft.rows.length>MAX_ROWS)return null;
  let previouslyEnded=-1,reviewed=0,rawCells=0,emptyOriginal=0;
  const rows=[];
  for(const row of draft.rows){
   if(!row||!Object.isFrozen(row)||!validCount(row.bandIndex)||row.bandIndex<1||
      (rows.length&&row.bandIndex<=rows[rows.length-1].bandIndex)||
      !validCount(row.y0)||!validCount(row.y1)||row.y1<=row.y0||
      row.y1>draft.source.height||row.y0<previouslyEnded||
      !['synthetic_matrix_row','wordboxes_without_matrix_row'].includes(row.reason)||
      row.rideIdentityVerified!==false||row.mayImport!==false||
      row.canPersist!==false||row.status!=='unproven_original_band'||
      !Array.isArray(row.cells)||!Object.isFrozen(row.cells)||row.cells.length!==13||
      !validCount(row.geometricallyObservedCells)||row.geometricallyObservedCells>13)return null;
   previouslyEnded=row.y1;
   let bounded=0,manually=0;
   let previousX=-1;
   for(let ci=0;ci<13;ci++){
    const c=row.cells[ci];
    if(!c||!Object.isFrozen(c)||c.column!==ci+1||c.field!==fields[ci]||
       !validCount(c.x0)||!validCount(c.x1)||c.x1-c.x0<=34||
       c.x1>draft.source.width||c.x0<=previousX||
       !(c.raw===null||typeof c.raw==='string'&&c.raw.length>0&&c.raw.length<=MAX_RAW)||
       typeof c.value!=='string'||c.value.length>MAX_EDIT||
       typeof c.confirmed!=='boolean'||typeof c.explicitEmptyDriver!=='boolean'||
       (c.explicitEmptyDriver&&ci!==12)||
       !['source_cell_unreviewed','manual_review_only'].includes(c.status)||
       c.status===(c.confirmed?'source_cell_unreviewed':'manual_review_only')||
       c.sourceEvidence!=='fully_bounded_original_ocr_wordbox_only'||
       c.sourceVerified!==false||c.rideIdentityVerified!==false)return null;
    if(ci>0 && c.x0!==row.cells[ci-1].x1)return null;
    previousX=c.x0;
    if(c.raw!==null)bounded++;else emptyOriginal++;
    if(c.confirmed){
     const check=syntaxOf(ci,c.explicitEmptyDriver?'':c.value,c.explicitEmptyDriver);
     if(!check.ok||(c.explicitEmptyDriver&&c.value!=='Nicht zugewiesen')||
        (!c.explicitEmptyDriver&&!c.value.trim()))return null;
     manually++;
    }else if(c.explicitEmptyDriver)return null;
   }
   if(bounded!==row.geometricallyObservedCells)return null;
   rawCells+=bounded;reviewed+=manually;
   rows.push(Object.freeze({bandIndex:row.bandIndex,reason:row.reason,
    boundedOriginalCells:bounded,missingOriginalCells:13-bounded,
    manualReviewedUnverified:manually,unreviewedCells:13-manually,
    rideIdentityVerified:false,mayImport:false,canPersist:false}));
  }
  return frozen({version:'H28_SOURCE_CELL_REVIEW_STATUS_ONLY',rows,
   manualReviewedUnverified:reviewed,boundedOriginalCells:rawCells,
   missingOriginalCells:emptyOriginal,verifiedCells:0,verifiedRides:0,
   rideIdentityVerified:false,mayImport:false,canPersist:false,complete:false});
 }
 function createSourceCellDraft(focus,source){
  if(focus?.version!=='H27_BLOCKED_SOURCE_CELLS_ONLY'||
     focus.mayImport!==false||focus.canPersist!==false||focus.complete!==false||
     focus.verifiedRides!==0||focus.verifiedCells!==0||
     focus.physicalMappingVerified!==false||focus.noRideApproval!==true||
     !Object.isFrozen(focus)||!Object.isFrozen(focus.targets)||
     !Array.isArray(focus.targets)||focus.targets.length<1||focus.targets.length>MAX_ROWS||
     !validCount(focus.sourceWidth)||!validCount(focus.sourceHeight)||
     !validCount(focus.sourceWordboxes)||
     !source||typeof source.name!=='string'||!source.name||source.name.length>255||
     !validCount(source.size)||source.size<1||source.size>16000000||
     !validCount(source.lastModified)||
     !['image/jpeg','image/png','image/webp'].includes(source.type))return null;
  const rows=[];
  let previousBand=0;
  for(const t of focus.targets){
   if(!t||!Object.isFrozen(t)||!validCount(t.bandIndex)||t.bandIndex<=previousBand||
      !validCount(t.y0)||!validCount(t.y1)||t.y1<=t.y0||t.y1>focus.sourceHeight||
      !['synthetic_matrix_row','wordboxes_without_matrix_row'].includes(t.reason)||
      t.rideIdentityVerified!==false||t.mayImport!==false||
      !validCount(t.geometricallyObservedCells)||
      !Array.isArray(t.cells)||!Object.isFrozen(t.cells)||t.cells.length!==13)return null;
   previousBand=t.bandIndex;
   let bounded=0;
   const cells=[];
   for(let ci=0;ci<13;ci++){
    const c=t.cells[ci];
    if(!c||!Object.isFrozen(c)||c.column!==ci+1||
       !validCount(c.x0)||!validCount(c.x1)||c.x1-c.x0<=34||
       c.x1>focus.sourceWidth||(ci>0&&c.x0!==t.cells[ci-1].x1)||
       typeof c.originalOcrCandidate!=='string'||c.originalOcrCandidate.length>MAX_RAW||
       c.verified!==false||c.manualReviewed!==false||
       c.hasGeometricallyContainedOcrWord!==Boolean(c.originalOcrCandidate.length))return null;
    if(c.originalOcrCandidate.length)bounded++;
    cells.push({column:ci+1,field:fields[ci],x0:c.x0,x1:c.x1,
      raw:c.originalOcrCandidate||null,value:'',status:'source_cell_unreviewed',
      confirmed:false,explicitEmptyDriver:false,
      sourceEvidence:'fully_bounded_original_ocr_wordbox_only',
      sourceVerified:false,rideIdentityVerified:false});
   }
   if(bounded!==t.geometricallyObservedCells)return null;
   rows.push({bandIndex:t.bandIndex,y0:t.y0,y1:t.y1,reason:t.reason,
     status:'unproven_original_band',geometricallyObservedCells:bounded,
     rideIdentityVerified:false,mayImport:false,canPersist:false,cells});
  }
  const draft=frozen({schema:sourceCellSchema,
   source:{name:source.name,type:source.type,size:source.size,lastModified:source.lastModified,
     width:focus.sourceWidth,height:focus.sourceHeight},
   sourceWordboxes:focus.sourceWordboxes,rows,verifiedCells:0,verifiedRides:0,
   rideIdentityVerified:false,physicalMappingVerified:false,complete:false,
   mayImport:false,canPersist:false,noRideApproval:true});
  return sourceCellReviewStatus(draft)?draft:null;
 }
 function updateSourceCellDraft(draft,bandIndex,columnIndex,value,confirm=false,explicitEmptyDriver=false){
  if(!sourceCellReviewStatus(draft)||!Number.isInteger(bandIndex)||bandIndex<1||
     !Number.isInteger(columnIndex)||columnIndex<0||columnIndex>12||
     typeof value!=='string'||value.length>MAX_EDIT||
     typeof confirm!=='boolean'||typeof explicitEmptyDriver!=='boolean'||
     (explicitEmptyDriver&&columnIndex!==12))return null;
  const idx=draft.rows.findIndex(r=>r.bandIndex===bandIndex);
  if(idx<0)return null;
  const check=syntaxOf(columnIndex,value,explicitEmptyDriver);
  if(confirm&&!check.ok)return null;
  const text=value.trim();
  if(confirm&&!text&&!explicitEmptyDriver)return null;
  const old=draft.rows[idx],oldCell=old.cells[columnIndex];
  const newCell={...oldCell,value:confirm&&explicitEmptyDriver?'Nicht zugewiesen':text,
    confirmed:confirm,explicitEmptyDriver:confirm&&explicitEmptyDriver,
    status:confirm?'manual_review_only':'source_cell_unreviewed'};
  const rows=draft.rows.slice();
  rows[idx]={...old,cells:old.cells.map((c,i)=>i===columnIndex?newCell:c)};
  const result=frozen({...draft,rows,mayImport:false,canPersist:false,complete:false,
    rideIdentityVerified:false,physicalMappingVerified:false,verifiedCells:0,verifiedRides:0});
  return sourceCellReviewStatus(result)?result:null;
 }

 // H29: Cross-check original source-cell decisions against the EXISTING H15
 // field contract. This is a read-only readiness audit, NOT ride construction.
 // In H26/H27 source-gap cases there is no independently proved matrix-row
 // identity; the audit MUST NOT turn a fully manual transcription into a ride.
 const sourceRideCore=Object.freeze([1,2,3,8,9,12]);
 function sourceRideBridgeReview(draft,dateContext){
  const sourceStatus=sourceCellReviewStatus(draft);
  const date=planDateReview(dateContext);
  if(!sourceStatus||!date)return null;
  // Even a matching header OCR candidate is not independent date truth.
  const dateCandidateAligned=Boolean(date.headerOcrCandidate &&
    date.status!=='source_conflict' && date.headerDate &&
    date.selectedDate===date.headerDate);
  const headerCandidate=date.headerOcrCandidate===true;
  const rows=[];
  for(const r of draft.rows){
   const missing=[];
   let manualCore=0,originalBoundedCore=0;
   const required=sourceRideCore.map(ci=>{
    const c=r.cells[ci];
    // These cells share the same original pixel band by construction. Its
    // identity as a unique journey has NOT been independently established.
    const hasBoundedOriginal=c.raw!==null;
    const manualReviewed=c.confirmed===true;
    if(hasBoundedOriginal)originalBoundedCore++;
    if(manualReviewed)manualCore++;
    if(!hasBoundedOriginal)missing.push(fields[ci]+':no_bounded_original_word');
    if(!manualReviewed)missing.push(fields[ci]+':not_manually_reviewed');
    return Object.freeze({column:ci+1,field:fields[ci],
      originalBoundedWord:hasBoundedOriginal,manualReviewedUnverified:manualReviewed,
      sameObservedPixelBand:true,syntaxOnly:manualReviewed&&syntaxOf(ci,
        c.explicitEmptyDriver?'':c.value,c.explicitEmptyDriver).ok,
      semanticallyVerified:false});
   });
   if(!headerCandidate)missing.push('date:no_geometric_header_ocr_candidate');
   else if(!dateCandidateAligned)missing.push('date:unmatched_or_conflicting_selected_day');
   // An OCR header candidate and manual date selection cannot prove a day.
   missing.push('date:not_independently_verified');
   missing.push('ride:physical_row_identity_unproven');
   if(r.reason==='synthetic_matrix_row')missing.push('ride:synthetic_parser_row');
   else missing.push('ride:wordboxes_without_matrix_row');
   rows.push(Object.freeze({bandIndex:r.bandIndex,pixelBand:Object.freeze({y0:r.y0,y1:r.y1}),
     sourceReason:r.reason,required:Object.freeze(required),
     manualReviewedCore:manualCore,originalBoundedCore,
     requiredCoreCount:sourceRideCore.length,missingEvidence:Object.freeze(missing),
     dateHeaderCandidateAlignedUnverified:dateCandidateAligned,
     observedBandOnly:true,sourceRowIdentityVerified:false,
     structuredRideDraft:null,linkedToRideDraft:false,
     status:'blocked_unproven_original_ride',mayImport:false,canPersist:false}));
  }
  return frozen({version:'H29_SOURCE_RIDE_BRIDGE_AUDIT_ONLY',sourceFile:draft.source.name,
    dateStatus:date.status,headerDateOcrCandidateUnverified:headerCandidate,
    matchedHeaderCandidateUnverified:dateCandidateAligned,
    rows,linkedRideDrafts:0,verifiedRides:0,verifiedCells:0,
    physicalMappingVerified:false,rideIdentityVerified:false,complete:false,
    mayImport:false,canPersist:false});
 }
 // H31: compare a secondary, SAME-IMAGE OCR reread to the immutable full-image
 // original and an explicit manual decision. Similar strings are never independent
 // verification; no field or ride is constructed or copied into the source draft.
 function secondarySourceCellAudit(draft,bandIndex,columnIndex,proposals){
  if(!sourceCellReviewStatus(draft)||!Number.isSafeInteger(bandIndex)||
     !Number.isSafeInteger(columnIndex)||columnIndex<0||columnIndex>=fields.length||
     !Array.isArray(proposals)||proposals.length>2||
     !proposals.every(t=>typeof t==='string'&&t.length>0&&t.length<=MAX_EDIT&&
        !/[\u0000-\u001f\u007f]/u.test(t)))return null;
  const row=draft.rows.find(r=>r.bandIndex===bandIndex);
  if(!row)return null;
  const cell=row.cells[columnIndex];
  const distinct=[...new Set(proposals)];
  const viable=distinct.filter(t=>syntaxOf(columnIndex,t).ok);
  const sameOriginal=cell.raw!==null&&distinct.some(t=>t===cell.raw);
  const sameManual=cell.confirmed&&!cell.explicitEmptyDriver&&distinct.some(t=>t===cell.value);
  const result={version:'H31_SECONDARY_SAME_IMAGE_FIELD_CHECK_ONLY',bandIndex,
   column:columnIndex+1,field:fields[columnIndex],
   modesCompared:proposals.length,uniqueSecondaryCandidates:distinct.length,
   plausibleSyntaxCandidates:viable.length,secondaryConflict:distinct.length>1,
   fullImageOriginalPresent:cell.raw!==null,
   exactMatchOriginalUnverified:sameOriginal,
   humanReviewedUnverified:cell.confirmed,
   exactMatchManualUnverified:sameManual,
   missingSourceCoreProof:cell.raw===null,
   evidenceClass:distinct.length===0?'no_secondary_ocr':
     distinct.length>1?'secondary_ocr_disagreement':
     viable.length===0?'secondary_syntax_unresolved':
     'secondary_syntax_candidate_only',
   samePhotographNotIndependent:true,sourceIdentityVerified:false,
   dateVerified:false,fieldVerified:false,rideIdentityVerified:false,
   structuredRideDraft:null,verifiedCells:0,verifiedRides:0,
   complete:false,mayImport:false,canPersist:false};
  return frozen(result);
 }
 // H32: one source-separated status for ALL 13 physical cells in ONE
 // problematic original band. Crop OCR and full-image OCR are the SAME photo,
 // and user text is a separate decision. None proves a physical ride or date.
 // This consumes existing H28/H29/H31 contracts, creates NO ride drafts.
 function sourceBandEvidenceReview(draft,dateContext,bandIndex,secondaryByCell){
  if(!Number.isSafeInteger(bandIndex)||bandIndex<1||
     !Array.isArray(secondaryByCell)||secondaryByCell.length!==fields.length||
     !secondaryByCell.every(v=>Array.isArray(v)&&v.length<=2))return null;
  const bridge=sourceRideBridgeReview(draft,dateContext);
  if(!bridge||bridge.mayImport!==false||bridge.canPersist!==false||
     bridge.rideIdentityVerified!==false||bridge.verifiedRides!==0||
     bridge.linkedRideDrafts!==0)return null;
  const row=draft.rows.find(r=>r.bandIndex===bandIndex);
  const bridgeRow=bridge.rows.find(r=>r.bandIndex===bandIndex);
  if(!row||!bridgeRow||bridgeRow.sourceRowIdentityVerified!==false||
     bridgeRow.structuredRideDraft!==null)return null;
  const checked=[];const missing=[];
  let bounded=0,manual=0,secondaryCells=0,secondaryPlausible=0,
      sourceConflicts=0,unresolvedCore=0;
  for(let ci=0;ci<13;ci++){
   const c=row.cells[ci];
   const comparison=secondarySourceCellAudit(draft,bandIndex,ci,secondaryByCell[ci]);
   if(!comparison||comparison.sourceIdentityVerified!==false||
      comparison.samePhotographNotIndependent!==true||comparison.fieldVerified!==false)return null;
   const original=c.raw!==null,reviewed=c.confirmed===true,
      secondary=comparison.uniqueSecondaryCandidates>0,
      plausible=comparison.plausibleSyntaxCandidates>0,
      core=sourceRideCore.includes(ci);
   if(original)bounded++;
   if(reviewed)manual++;
   if(secondary)secondaryCells++;
   if(plausible)secondaryPlausible++;
   if(comparison.secondaryConflict)sourceConflicts++;
   const proof=[];
   if(!original)proof.push('full_image_cell_wordbox_missing');
   if(!secondary)proof.push('secondary_crop_ocr_not_available');
   if(secondary&&!plausible)proof.push('secondary_field_syntax_unresolved');
   if(comparison.secondaryConflict)proof.push('secondary_crop_disagreement');
   // Even a syntactically valid OCR word is NOT manually verified.
   if(!reviewed)proof.push('manual_cell_not_reviewed');
   if(core && (!original||!reviewed||!plausible)){
    unresolvedCore++;
    missing.push(`${fields[ci]}:unproven_core_source`);
   }
   checked.push(Object.freeze({column:ci+1,field:fields[ci],
    sourcePixelBand:Object.freeze({y0:row.y0,y1:row.y1}),
    fullImageOriginalPresent:original,
    fullImageSyntaxPlausibleUnverified:original&&syntaxOf(ci,c.raw).ok,
    secondaryCropPresent:secondary,
    secondarySyntaxPlausibleUnverified:plausible,
    secondaryWordboxGeometryIndependentlyConfirmed:false,
    samePhotoNotIndependent:true,
    secondaryConflict:comparison.secondaryConflict,
    sameTextAsOriginalNotCorroboration:comparison.exactMatchOriginalUnverified,
    sameTextAsManualNotCorroboration:comparison.exactMatchManualUnverified,
    manualReviewedUnverified:reviewed,
    manualExplicitEmptyDriver:reviewed&&c.explicitEmptyDriver,
    missingProof:Object.freeze(proof),
    fieldVerified:false,physicalRideIdentityVerified:false}));
  }
  missing.push(...bridgeRow.missingEvidence);
  // Never upgrade based on 13 OCR matches or 13 manual confirmations.
  return frozen({version:'H32_ALL_13_CELLS_SOURCE_SEPARATED_BLOCKED',
   sourceBandIndex:bandIndex,
   sourceFile:draft.source.name,
   sourceReason:row.reason,
   observedPixelBand:{y0:row.y0,y1:row.y1},
   dateStatus:bridge.dateStatus,
   headerDateOcrCandidateUnverified:bridge.headerDateOcrCandidateUnverified,
   cells:checked,
   totals:{cells:13,fullImageBoundedCells:bounded,missingOriginalCells:13-bounded,
    secondaryCandidateCells:secondaryCells,secondarySyntaxPlausibleCells:secondaryPlausible,
    manuallyReviewedUnverifiedCells:manual,secondaryConflicts:sourceConflicts,
    unprovenCoreFields:unresolvedCore},
   missingEvidence:Object.freeze(missing),
   dateVerified:false,fullRowSourceVerified:false,independentEvidenceVerified:false,
   physicalRideIdentityVerified:false,rideIdentityVerified:false,
   structuredRideDraft:null,linkedRideDrafts:0,verifiedCells:0,verifiedRides:0,
   complete:false,mayImport:false,canPersist:false});
 }
 // H33: semantic preflight of the SAME physical image band and manually
 // reviewed H28 fields. This is neither an OCR correction nor a ride constructor.
 // Field syntax, full-image wordboxes and secondary suggestions remain separate.
 // The actual H26/H27 source-gap cannot prove a unique ride or a verified day.
 function sourceRideSemanticPreflight(draft,dateContext,bandIndex,secondaryByCell){
  const band=sourceBandEvidenceReview(draft,dateContext,bandIndex,secondaryByCell);
  if(!band||band.structuredRideDraft!==null||band.verifiedRides!==0||
     band.mayImport!==false||band.canPersist!==false||
     band.physicalRideIdentityVerified!==false||band.cells?.length!==13)return null;
  const row=draft.rows.find(r=>r.bandIndex===bandIndex);
  if(!row||row.y0!==band.observedPixelBand.y0||row.y1!==band.observedPixelBand.y1||
     !['synthetic_matrix_row','wordboxes_without_matrix_row'].includes(row.reason))return null;
  const details=[];const barriers=[];
  let manualCore=0,fullImageCore=0,secondaryCore=0,manualCoreSyntax=0;
  for(const ci of sourceRideCore){
   const cell=row.cells[ci],ev=band.cells[ci];
   if(!cell||!ev||ev.column!==ci+1||ev.field!==fields[ci])return null;
   const manual=cell.confirmed===true;
   const explicitUnassigned=ci===12&&cell.explicitEmptyDriver===true;
   const val=manual?(explicitUnassigned?'':cell.value.trim()):'';
   const syntax=manual?syntaxOf(ci,val,explicitUnassigned):{ok:false};
   const hasOriginal=cell.raw!==null;
   const secondaryPlausible=ev.secondarySyntaxPlausibleUnverified===true;
   const rawMatchesManual=manual&&hasOriginal&&!explicitUnassigned&&cell.raw.trim()===val;
   const sourceContradiction=manual&&hasOriginal&&
      (explicitUnassigned||cell.raw.trim()!==val);
   if(manual)manualCore++;
   if(hasOriginal)fullImageCore++;
   if(secondaryPlausible)secondaryCore++;
   if(manual&&syntax.ok)manualCoreSyntax++;
   const missing=[];
   if(!manual)missing.push('manual_review_missing');
   if(manual&&!syntax.ok)missing.push('manual_field_syntax_unresolved');
   if(!hasOriginal)missing.push('full_image_original_cell_missing');
   if(sourceContradiction)missing.push('manual_original_disagreement');
   if(ev.secondaryConflict)missing.push('secondary_ocr_disagreement');
   if(!secondaryPlausible)missing.push('secondary_syntax_or_geometry_not_proven');
   if(ci===8 && manual && !['Pkw','Van'].includes(val))
     missing.push('vehicle_category_not_evidenced');
   if(ci===12 && explicitUnassigned && hasOriginal)
     missing.push('blank_driver_conflicts_with_original_text');
   details.push(Object.freeze({column:ci+1,field:fields[ci],
     manualReviewedUnverified:manual,manualSyntaxPlausibleUnverified:manual&&syntax.ok,
     originalFullImageBounded:hasOriginal,secondarySyntaxPlausibleUnverified:secondaryPlausible,
     manualMatchesOriginalNotIndependent:rawMatchesManual,
     sourceConflict:sourceContradiction||ev.secondaryConflict,
     explicitBlankDriverUnverified:explicitUnassigned,
     missingEvidence:Object.freeze(missing),fieldVerified:false}));
   missing.forEach(reason=>barriers.push(`${fields[ci]}:${reason}`));
  }
  // A route equality warning is based ONLY on explicit manual text; the
  // parser does not infer route roles from flight direction or adjacent rows.
  const from=row.cells[2],to=row.cells[3];
  const normalize=t=>t.trim().replace(/\s+/g,' ').toLocaleLowerCase('de');
  const sameRoute=from.confirmed&&to.confirmed&&
     normalize(from.value)===normalize(to.value);
  if(sameRoute)barriers.push('route:from_and_to_identical_manual_text');
  // A matching OCR header and manually selected date are NOT two sources.
  barriers.push('date:independent_source_and_calendar_day_unverified');
  barriers.push('ride:unique_original_row_identity_unproven');
  barriers.push(row.reason==='synthetic_matrix_row'? 
    'ride:synthetic_matrix_row':'ride:wordboxes_without_matrix_row');
  barriers.push('flight:independent_route_day_check_missing');
  return frozen({version:'H33_SOURCE_RIDE_SEMANTIC_PREFLIGHT_BLOCKED',
   sourceFile:draft.source.name,bandIndex,sourceReason:row.reason,
   physicalBand:{y0:row.y0,y1:row.y1},
   physicalBandObservedOnly:true,physicalRowIsRideUnverified:true,
   dateStatus:band.dateStatus,headerOcrCandidateUnverified:band.headerDateOcrCandidateUnverified,
   requiredFields:details,totals:{requiredCore:6,manualReviewedCore:manualCore,
    manualSyntaxPlausibleCore:manualCoreSyntax,fullImageBoundedCore:fullImageCore,
    secondarySyntaxOnlyCore:secondaryCore},
   sameManualFromToWarning:sameRoute,missingEvidence:barriers,
   candidateDataTransferred:false,samePhotoNotIndependent:true,
   selectedDayVerified:false,uniqueRideIdentityVerified:false,
   independentlyVerifiedCells:0,structuredRideDraft:null,linkedRideDrafts:0,
   verifiedCells:0,verifiedRides:0,complete:false,mayImport:false,canPersist:false});
 }
 // H34: bind a PHYSICAL TABLE BAND to the bytes of the selected ORIGINAL
 // image and to its decoded RGBA pixels. No OCR, date, journey or parser row
 // is certified. Repeated source metadata (name/size/time) is not proof.
 // The caller decodes precisely that file to RGBA; cryptographic SHA256
 // fails closed when WebCrypto is unavailable. Never authorizes a ride.
 async function sourcePhysicalBandFingerprint(draft,bandIndex,file,imageData){
  if(!sourceCellReviewStatus(draft)||!Number.isSafeInteger(bandIndex)||bandIndex<1||
     !file||typeof file.arrayBuffer!=='function'||
     !['name','type','size','lastModified'].every(k=>file[k]===draft.source[k])||
     !imageData||imageData.width!==draft.source.width||
     imageData.height!==draft.source.height||
     !(imageData.data instanceof Uint8ClampedArray)||
     imageData.data.length!==imageData.width*imageData.height*4||
     typeof global.crypto?.subtle?.digest!=='function')return null;
  const row=draft.rows.find(r=>r.bandIndex===bandIndex);
  if(!row||row.rideIdentityVerified!==false||row.status!=='unproven_original_band'||
     row.cells.length!==13||row.cells[0].x0>2||
     imageData.width-row.cells[12].x1>2||
     row.cells.some((c,i)=>c.x1-c.x0<=34||
       (i>0&&c.x0!==row.cells[i-1].x1)))return null;
  try{
   const bytes=await file.arrayBuffer();
   if(!(bytes instanceof ArrayBuffer)||bytes.byteLength!==file.size||
      bytes.byteLength>16000000)return null;
   const digest=async data=>Array.from(new Uint8Array(await global.crypto.subtle.digest('SHA-256',data)))
     .map(v=>v.toString(16).padStart(2,'0')).join('');
   const fileSha=await digest(bytes);
   // Encode coordinates and cell boundaries BEFORE the original RGBA pixels;
   // two equal-color bands are distinct because their physical positions differ.
   const bounds=[imageData.width,imageData.height,bandIndex,row.y0,row.y1,
     ...row.cells.map(c=>c.x0),row.cells[12].x1];
   const prefix=new Uint8Array(bounds.length*4);
   const view=new DataView(prefix.buffer);
   bounds.forEach((v,i)=>view.setUint32(i*4,v,true));
   const x0=row.cells[0].x0,x1=row.cells[12].x1;
   const rowLen=(x1-x0)*4;
   const selected=new Uint8Array(prefix.length+(row.y1-row.y0)*rowLen);
   selected.set(prefix);
   for(let y=row.y0;y<row.y1;y++){
     const start=(y*imageData.width+x0)*4;
     selected.set(imageData.data.subarray(start,start+rowLen),
       prefix.length+(y-row.y0)*rowLen);
   }
   const pixelSha=await digest(selected.buffer);
   return frozen({version:'H34_ORIGINAL_PIXEL_BAND_FINGERPRINT_ONLY',
     originalFileSha256:fileSha,decodedPixelBandSha256:pixelSha,
     sourceName:draft.source.name,sourceWidth:imageData.width,sourceHeight:imageData.height,
     bandIndex,pixelBand:{y0:row.y0,y1:row.y1},
     physicalTableRegionObserved:true,uniquePhotoRegionFingerprint:true,
     independentRideIdentityVerified:false,parserRowMapped:false,
     originalImageDateVerified:false,fieldVerified:false,verifiedCells:0,
     structuredRideDraft:null,verifiedRides:0,mayImport:false,canPersist:false,
     complete:false});
  }catch(_error){return null;}
 }
 // H35: attach existing HUMAN-ONLY cell decisions to the ACTUAL photo+pixel
 // fingerprint and the EXACT current plan-day evidence. This is a frozen
 // provenance receipt, not verified route/date/ride content or import authority.
 const H35_PROOF='H35_MANUAL_CELLS_PHOTO_BAND_DAY_BOUND_ONLY';
 const sha256hex=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
 function h35DateContext(context){
  const date=planDateReview(context);
  // An unknown day is not a usable decision-day binding. A filename/header
  // or manual date is allowed only as UNVERIFIED, never imported.
  if(!date||date.dateVerified!==false||date.mayImport!==false||date.canPersist!==false||
     !context||typeof context!=='object'||Array.isArray(context))return null;
  const h=context.headerEvidence||null;
  const evidence=h?{version:h.version,date:h.date,anchorY0:h.anchorY0,
    anchorY1:h.anchorY1,dateY0:h.dateY0,dateY1:h.dateY1,headerTop:h.headerTop}:null;
  return frozen({selectedDate:date.selectedDate,headerDate:date.headerDate,
    filenameDate:date.filenameDate,manualPlanDate:context.manualPlanDate,
    dateSourceConflict:context.dateSourceConflict,status:date.status,
    headerEvidence:evidence,dateVerified:false});
 }
 function sourceDecisionPhotoBinding(draft,bandIndex,proof,dateContext){
  if(!sourceCellReviewStatus(draft)||!Number.isSafeInteger(bandIndex)||bandIndex<1||
     !proof||!Object.isFrozen(proof)||proof.version!=='H34_ORIGINAL_PIXEL_BAND_FINGERPRINT_ONLY'||
     !sha256hex(proof.originalFileSha256)||!sha256hex(proof.decodedPixelBandSha256)||
     proof.physicalTableRegionObserved!==true||proof.uniquePhotoRegionFingerprint!==true||
     proof.independentRideIdentityVerified!==false||proof.parserRowMapped!==false||
     proof.originalImageDateVerified!==false||proof.fieldVerified!==false||
     proof.verifiedCells!==0||proof.verifiedRides!==0||proof.structuredRideDraft!==null||
     proof.mayImport!==false||proof.canPersist!==false||proof.complete!==false||
     proof.sourceName!==draft.source.name||proof.sourceWidth!==draft.source.width||
     proof.sourceHeight!==draft.source.height||proof.bandIndex!==bandIndex)return null;
  const row=draft.rows.find(r=>r.bandIndex===bandIndex);
  if(!row||!Object.isFrozen(row)||!Object.isFrozen(proof.pixelBand)||
     proof.pixelBand.y0!==row.y0||proof.pixelBand.y1!==row.y1)return null;
  const day=h35DateContext(dateContext);
  if(!day)return null;
  return frozen({version:H35_PROOF,
    source:{...draft.source},
    originalFileSha256:proof.originalFileSha256,
    decodedPixelBandSha256:proof.decodedPixelBandSha256,
    bandIndex,pixelBand:{y0:row.y0,y1:row.y1},
    reason:row.reason,day,
    decisions:row.cells.map(c=>({column:c.column,field:c.field,x0:c.x0,x1:c.x1,
      raw:c.raw,manualValue:c.value,manualConfirmed:c.confirmed,
      explicitEmptyDriver:c.explicitEmptyDriver})),
    confirmedManualCells:row.cells.filter(c=>c.confirmed).length,
    physicalTableRegionObserved:true,photoBoundUnverified:true,
    decisionSourceDayBoundUnverified:true,selectedDayVerified:false,
    independentRideIdentityVerified:false,structuredRideDraft:null,
    linkedRideDrafts:0,verifiedRides:0,verifiedCells:0,
    complete:false,mayImport:false,canPersist:false});
 }
 function sourceBoundDecisionReview(draft,receipt,proof,dateContext,secondaryByCell){
  if(!receipt||!Object.isFrozen(receipt)||receipt.version!==H35_PROOF||
     !Object.isFrozen(receipt.decisions)||!Object.isFrozen(receipt.source)||
     !Object.isFrozen(receipt.day)||!Object.isFrozen(receipt.pixelBand)||
     receipt.photoBoundUnverified!==true||receipt.decisionSourceDayBoundUnverified!==true||
     receipt.selectedDayVerified!==false||receipt.independentRideIdentityVerified!==false||
     receipt.structuredRideDraft!==null||receipt.linkedRideDrafts!==0||
     receipt.verifiedRides!==0||receipt.verifiedCells!==0||receipt.complete!==false||
     receipt.mayImport!==false||receipt.canPersist!==false)return null;
  const actual=sourceDecisionPhotoBinding(draft,receipt.bandIndex,proof,dateContext);
  if(!actual||JSON.stringify(actual)!==JSON.stringify(receipt))return null;
  const semantic=sourceRideSemanticPreflight(draft,dateContext,receipt.bandIndex,secondaryByCell);
  if(!semantic||semantic.structuredRideDraft!==null||semantic.verifiedRides!==0||
     semantic.mayImport!==false||semantic.canPersist!==false)return null;
  return frozen({version:'H35_SOURCE_BOUND_DECISION_REVIEW_BLOCKED',bandIndex:receipt.bandIndex,
    photoAndPixelHashesMatched:true,allThirteenCellPositionsMatched:true,
    manualDecisionSnapshotMatched:true,unverifiedDayContextMatched:true,
    currentManualReviewedCells:receipt.confirmedManualCells,
    selectedDayVerified:false,uniqueRideIdentityVerified:false,
    semanticBlockers:semantic.missingEvidence,
    structuredRideDraft:null,linkedRideDrafts:0,verifiedRides:0,verifiedCells:0,
    complete:false,mayImport:false,canPersist:false});
 }
 const api=Object.freeze({fields,create,updateTail,updatePixelCell,syntaxOf,reviewStatus,integratedEvidenceReview,createSourceCellDraft,updateSourceCellDraft,sourceCellReviewStatus,sourceRideBridgeReview,secondarySourceCellAudit,sourceBandEvidenceReview,sourceRideSemanticPreflight,sourcePhysicalBandFingerprint,sourceDecisionPhotoBinding,sourceBoundDecisionReview});
 global.ATMSH15Drafts=api;
 if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
