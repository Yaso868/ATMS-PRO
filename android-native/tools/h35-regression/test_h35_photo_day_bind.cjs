'use strict';
const assert=require('node:assert/strict'),crypto=require('node:crypto'),path=require('node:path'),fs=require('node:fs');
const h=require(path.join(process.env.ATMS_H35_NATIVE,'app/src/main/assets/js/h15-ride-drafts.js'));
let passed=0;
const ok=x=>{assert.ok(x);passed++;};
const equal=(x,y)=>{assert.deepEqual(x,y);passed++;};
const freeze=o=>{if(o&&typeof o==='object'&&!Object.isFrozen(o)){Object.values(o).forEach(freeze);Object.freeze(o);}return o;};
const x=[0,96,166,407,618,770,863,963,1058,1131,1193,1263,1433,1535];
function draftFor(label='image.jpg',bandList=[[11,380,411],[12,411,442]],rawFirst=false){
 const f=freeze({version:'H27_BLOCKED_SOURCE_CELLS_ONLY',sourceWidth:1536,sourceHeight:1034,sourceWordboxes:441,mayImport:false,canPersist:false,complete:false,verifiedRides:0,verifiedCells:0,physicalMappingVerified:false,noRideApproval:true,targets:bandList.map(([bandIndex,y0,y1])=>({bandIndex,y0,y1,reason:'wordboxes_without_matrix_row',wordCenters:rawFirst?1:0,geometricallyObservedCells:rawFirst?1:0,mayImport:false,rideIdentityVerified:false,cells:Array.from({length:13},(_,i)=>({column:i+1,x0:x[i],x1:x[i+1],originalOcrCandidate:rawFirst&&i===0?'20':'',hasGeometricallyContainedOcrWord:rawFirst&&i===0,verified:false,manualReviewed:false}))}))});
 const source={name:label,type:'image/jpeg',size:10000,lastModified:0};return {draft:h.createSourceCellDraft(f,source),source};
}
const fakeFile=(source,buf)=>({...source,async arrayBuffer(){return buf.buffer.slice(buf.byteOffset,buf.byteOffset+buf.byteLength)}});
const day=(selected='2026-10-07')=>({selectedDate:selected,headerDate:'',filenameDate:'2026-10-07',manualPlanDate:false,dateSourceConflict:false});
(async()=>{
 const {draft,source}=draftFor();ok(draft);
 const bytes=Buffer.alloc(10000,21),f=fakeFile(source,bytes),img={width:1536,height:1034,data:new Uint8ClampedArray(1536*1034*4)};
 img.data.fill(255);img.data[380*1536*4]=14;
 const proof11=await h.sourcePhysicalBandFingerprint(draft,11,f,img);ok(proof11);
 const proof12=await h.sourcePhysicalBandFingerprint(draft,12,f,img);ok(proof12);
 const cells=Array.from({length:13},()=>[]);
 const p1=h.sourceDecisionPhotoBinding(draft,11,proof11,day());ok(p1);equal(p1.decisions.length,13);
 equal(p1.originalFileSha256,crypto.createHash('sha256').update(bytes).digest('hex'));
 equal(p1.bandIndex,11);equal(p1.confirmedManualCells,0);
 const r1=h.sourceBoundDecisionReview(draft,p1,proof11,day(),cells);ok(r1);
 equal(r1.version,'H35_SOURCE_BOUND_DECISION_REVIEW_BLOCKED');equal(r1.photoAndPixelHashesMatched,true);
 equal(r1.structuredRideDraft,null);equal(r1.verifiedRides,0);equal(r1.mayImport,false);equal(r1.canPersist,false);
 equal(h.sourceBoundDecisionReview(draft,p1,proof12,day(),cells),null); // band changed
 equal(h.sourceDecisionPhotoBinding(draft,11,proof12,day()),null);
 equal(h.sourceBoundDecisionReview(draft,p1,proof11,day('2026-10-08'),cells),null); // day changed
 const diffDay={...day(),manualPlanDate:true};
 equal(h.sourceBoundDecisionReview(draft,p1,proof11,diffDay,cells),null);
 equal(h.sourceDecisionPhotoBinding(draft,11,proof11,null),null);
 const edited=h.updateSourceCellDraft(draft,11,1,'11:30',true,false);ok(edited);
 equal(h.sourceBoundDecisionReview(edited,p1,proof11,day(),cells),null); // stale manual receipt
 const p2=h.sourceDecisionPhotoBinding(edited,11,proof11,day());ok(p2);
 equal(p2.confirmedManualCells,1);ok(h.sourceBoundDecisionReview(edited,p2,proof11,day(),cells));
 const revoked=h.updateSourceCellDraft(edited,11,1,'11:30',false,false);ok(revoked);
 equal(h.sourceBoundDecisionReview(revoked,p2,proof11,day(),cells),null);
 equal(revoked.rows[0].cells[1].raw,null);
 const newRaw={...img,data:new Uint8ClampedArray(img.data)};
 newRaw.data[(385*1536+210)*4]^=77;
 const changedPixel=await h.sourcePhysicalBandFingerprint(draft,11,f,newRaw);ok(changedPixel);
 equal(h.sourceBoundDecisionReview(draft,p1,changedPixel,day(),cells),null); // edited image pixels
 const otherBytes=Buffer.alloc(10000,22),otherPhoto=await h.sourcePhysicalBandFingerprint(draft,11,fakeFile(source,otherBytes),img);ok(otherPhoto);
 equal(h.sourceBoundDecisionReview(draft,p1,otherPhoto,day(),cells),null);
 const forged={...proof11,originalFileSha256:'x'.repeat(64)};freeze(forged);
 equal(h.sourceDecisionPhotoBinding(draft,11,forged,day()),null);
 equal(h.sourceDecisionPhotoBinding({...draft,mayImport:true},11,proof11,day()),null);
 equal(h.sourceDecisionPhotoBinding(JSON.parse(JSON.stringify(draft)),11,proof11,day()),null);
 const tampered={...p1,mayImport:true};freeze(tampered);
 equal(h.sourceBoundDecisionReview(draft,tampered,proof11,day(),cells),null);
 const tamperedCell=freeze({...p1,decisions:freeze(p1.decisions.map((c,i)=>i===2?freeze({...c,manualConfirmed:true}):c))});
 equal(h.sourceBoundDecisionReview(draft,tamperedCell,proof11,day(),cells),null);
 const {draft:otherDraft}=draftFor('another-photo.jpg');ok(otherDraft);
 equal(h.sourceDecisionPhotoBinding(otherDraft,11,proof11,day()),null);
 const proofForBand12=h.sourceDecisionPhotoBinding(draft,12,proof12,day());ok(proofForBand12);
 equal(h.sourceBoundDecisionReview(draft,proofForBand12,proof11,day(),cells),null);
 const changedSelection=freeze({...day(),headerEvidence:null});
 ok(h.sourceBoundDecisionReview(draft,p1,proof11,changedSelection,cells));
 const samePhotoHeader={...day(),headerDate:'2026-10-07',dateSourceConflict:false};
 equal(h.sourceBoundDecisionReview(draft,p1,proof11,samePhotoHeader,cells),null);
 // Filling 13 cells cannot create independent date/ride verification.
 let filled=draft;
 for(let i=0;i<13;i++){
  const values=['120','12:30','Aachen','DUS Airport','Customer','Company','13:00','EW1234','Pkw','2','13:50','London','Driver'];
  filled=h.updateSourceCellDraft(filled,11,i,values[i],true,false);ok(filled);
 }
 const fullReceipt=h.sourceDecisionPhotoBinding(filled,11,proof11,day());ok(fullReceipt);
 equal(fullReceipt.confirmedManualCells,13);
 const fullReview=h.sourceBoundDecisionReview(filled,fullReceipt,proof11,day(),cells);ok(fullReview);
 equal(fullReview.currentManualReviewedCells,13);equal(fullReview.structuredRideDraft,null);
 equal(fullReview.uniqueRideIdentityVerified,false);equal(fullReview.selectedDayVerified,false);
 equal(fullReview.mayImport,false);equal(fullReview.canPersist,false);
 if(process.env.ATMS_H35_ORIGINAL_DIR){
  const dir=process.env.ATMS_H35_ORIGINAL_DIR;
  for(const [wa,height,bands,expectedHash] of [
   ['WA0000',1034,[[11,380,411],[12,411,442],[13,442,473]],'f9a26d902c2de88dc06ee7c4ab42e89f176e7023271f35f44c34d759e58673fa'],
   ['WA0001',1097,[[6,225,255],[11,381,409]],'f0b44c22cbd06afb0594920aed04e2c4eb6333c312054451af0988333526673d']]){
   const filename='IMG-20261007-'+wa+'.jpg',original=fs.readFileSync(path.join(dir,filename));
   equal(crypto.createHash('sha256').update(original).digest('hex'),expectedHash);
   const decoded=fs.readFileSync(path.join(dir,wa+'.rgba'));
   equal(decoded.length,1536*height*4);
   const ff=freeze({version:'H27_BLOCKED_SOURCE_CELLS_ONLY',sourceWidth:1536,sourceHeight:height,
    sourceWordboxes:wa==='WA0000'?441:581,mayImport:false,canPersist:false,complete:false,
    verifiedRides:0,verifiedCells:0,physicalMappingVerified:false,noRideApproval:true,
    targets:bands.map(([bandIndex,y0,y1])=>({bandIndex,y0,y1,reason:'synthetic_matrix_row',wordCenters:0,
     geometricallyObservedCells:0,mayImport:false,rideIdentityVerified:false,
     cells:Array.from({length:13},(_,i)=>({column:i+1,x0:x[i],x1:x[i+1],
      originalOcrCandidate:'',hasGeometricallyContainedOcrWord:false,verified:false,manualReviewed:false}))}))});
   const source={name:filename,type:'image/jpeg',size:original.length,lastModified:0};
   const d=h.createSourceCellDraft(ff,source);ok(d);
   const fileNow=fakeFile(source,original),imageNow={width:1536,height,data:new Uint8ClampedArray(decoded)};
   let oldReceipt=null,oldProof=null;
   for(const [band] of bands){
    const hashProof=await h.sourcePhysicalBandFingerprint(d,band,fileNow,imageNow);ok(hashProof);
    equal(hashProof.originalFileSha256,expectedHash);
    const receipt=h.sourceDecisionPhotoBinding(d,band,hashProof,day());ok(receipt);
    const review=h.sourceBoundDecisionReview(d,receipt,hashProof,day(),cells);ok(review);
    equal(review.structuredRideDraft,null);equal(review.mayImport,false);
    if(oldReceipt){equal(h.sourceBoundDecisionReview(d,oldReceipt,hashProof,day(),cells),null);
      equal(h.sourceBoundDecisionReview(d,receipt,oldProof,day(),cells),null);}
    oldReceipt=receipt;oldProof=hashProof;
   }
  }
 }
 console.log('H35 PHOTO+BAND+DAY MANUAL DECISION RECEIPT FAIL CLOSED PASS',passed,'assertions');
})().catch(e=>{console.error(e);process.exitCode=1});
