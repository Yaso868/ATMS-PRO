/* ATMS H19: FAIL-CLOSED original-pixel 13-column REVIEW ONLY. Not a parser or importer. */
(function(global){
 'use strict';
 const NUM=n=>typeof n==='number'&&Number.isFinite(n);
 function build({rowGrid,columnGrid,words,sourceWidth,sourceHeight,ocrWidth,ocrHeight}){
  if(!rowGrid?.accepted||!rowGrid.openTail||rowGrid.openTail.fullyBounded!==false||
     !columnGrid?.accepted||!columnGrid.header?.accepted||!columnGrid.body?.accepted||
     !Array.isArray(rowGrid.bands)||rowGrid.bands.length<3||rowGrid.bands.length>60||
     !Array.isArray(columnGrid.boundaries)||columnGrid.boundaries.length!==14||
     !Number.isSafeInteger(sourceWidth)||sourceWidth<500||sourceWidth>2200||
     !Number.isSafeInteger(sourceHeight)||sourceHeight<110||sourceHeight>3600||
     !NUM(ocrWidth)||!NUM(ocrHeight)||ocrWidth<100||ocrHeight<100||
     !Array.isArray(words)||words.length<2||words.length>10000)return null;
  const bounds=columnGrid.boundaries;
  if(bounds[0]>2||sourceWidth-bounds[13]>2||bounds.some((n,i)=>!NUM(n)||n<0||n>sourceWidth||
     (i>0&&n-bounds[i-1]<=34)))return null;
  const bands=rowGrid.bands;
  if(!NUM(rowGrid.pitch)||rowGrid.pitch<16||rowGrid.openTail.y0!==bands[bands.length-1].y1||
     rowGrid.openTail.y1!==sourceHeight||rowGrid.openTail.y1-rowGrid.openTail.y0<11||
     bands.some((b,i)=>!b?.fullyBounded||!NUM(b.y0)||!NUM(b.y1)||b.y1-b.y0<16||
       (i>0&&b.y0!==bands[i-1].y1)))return null;
  // Source OCR must have measurable source boxes. We never resplit a straddling OCR word.
  const sx=sourceWidth/ocrWidth,sy=sourceHeight/ocrHeight;
  if(!NUM(sx)||!NUM(sy)||sx<=0||sy<=0||sx>5||sy>5)return null;
  const assigned=bands.map(()=>Array.from({length:13},()=>[]));
  let rejected=0,inside=0;
  // H20: explain excluded word geometry without copying, guessing or relocating
  // its text. An ambiguous word may merely TOUCH these cells; it is not theirs.
  const excludedByReason={invalid:0,header:0,headerBoundary:0,tail:0,tailBoundary:0,
    rowBoundary:0,columnBoundary:0,bothBoundaries:0};
  const attentionRows=bands.map(()=>Array.from({length:13},()=>0));
  function exclude(reason,b){
   rejected++;excludedByReason[reason]++;
   if(!b)return;
   const possible=[];
   for(let ri=0;ri<bands.length;ri++)for(let ci=0;ci<13;ci++){
    if(Math.min(b.y1,bands[ri].y1)-Math.max(b.y0,bands[ri].y0)>1 &&
       Math.min(b.x1,bounds[ci+1])-Math.max(b.x0,bounds[ci])>1)
      possible.push([ri,ci]);
   }
   // Wide / badly merged OCR boxes are intentionally not assigned to cells.
   if(possible.length>0 && possible.length<=4)
     for(const [ri,ci] of possible)attentionRows[ri][ci]++;
  }
  for(const w of words){
   const b=w?.bbox||w;
   if(!NUM(b?.x0)||!NUM(b?.x1)||!NUM(b?.y0)||!NUM(b?.y1)||
      typeof w?.text!=='string'||w.text.length>160||w.text.length===0||
      b.x1<=b.x0||b.y1<=b.y0){exclude('invalid');continue;}
   const x0=b.x0*sx,x1=b.x1*sx,y0=b.y0*sy,y1=b.y1*sy;
   // Words touching divider lines or crossing a row/column cannot be claimed by a cell.
   const c=bounds.findIndex((right,i)=>i>0&&x0>=bounds[i-1]+1.5&&x1<=right-1.5)-1;
   let r=-1;
   for(let i=0;i<bands.length;i++){
    if(y0>=bands[i].y0+1.5 && y1<=bands[i].y1-1.5){r=i;break;}
   }
   if(c<0||c>=13||r<0){
    let reason;
    if(y1<=bands[0].y0) reason='header';
    else if(y0<bands[0].y0)reason='headerBoundary';
    else if(y0>=rowGrid.openTail.y0)reason='tail';
    else if(y1>rowGrid.openTail.y0)reason='tailBoundary';
    else if(r<0 && c<0)reason='bothBoundaries';
    else if(r<0)reason='rowBoundary';
    else reason='columnBoundary';
    exclude(reason,{x0,x1,y0,y1});continue;
   }
   assigned[r][c].push({text:w.text,x0,y0});inside++;
  }
  if(!inside)return null;
  const reviewRows=assigned.map(row=>Object.freeze(row.map(cell=>{
   // Only OCR text observed entirely inside its cell. Never synthesize blank values.
   return cell.sort((a,b)=>a.y0-b.y0||a.x0-b.x0).map(w=>w.text).join(' ').slice(0,300);
  })));
  const observedCells=reviewRows.flat().filter(Boolean).length;
  return Object.freeze({version:'H19_PIXEL_WORD_REVIEW_ONLY',
    reviewRows:Object.freeze(reviewRows),pixelBands:Object.freeze(bands.map(b=>Object.freeze({y0:b.y0,y1:b.y1}))),
    boundaries:Object.freeze(bounds.slice()),sourceWidth,sourceHeight,
    assignedWords:inside,excludedWords:rejected,observedCells,
    excludedByReason:Object.freeze(excludedByReason),
    attentionRows:Object.freeze(attentionRows.map(row=>Object.freeze(row))),
    source:'original_ocr_bbox_entirely_inside_observed_pixel_cell',
    originalMatrixReplaced:false,physicalMappingVerified:false,verifiedTextCells:0,
    mayImport:false,canPersist:false,complete:false,noRideApproval:true});
 }
 const api=Object.freeze({build});global.ATMSH19PixelReview=api;
 if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
