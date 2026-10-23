'use strict';
const fs=require('node:fs'), path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const crypto=require('node:crypto').webcrypto;
const prod=fs.readFileSync(path.resolve(__dirname,'../app/src/main/assets/js/plan-import.js'),'utf8');
const start=prod.indexOf('  // P11448 LOCAL ONLY.');
const end=prod.indexOf('  function ap01ConflictEvidenceList(ride) {',start);
assert(start>0 && end>start,'actual P11448 source block missing');
const original=prod.slice(start,end);
let passed=0,negative=0;
const pass=()=>passed++;
const check=(ok,name)=>{assert(ok,name);pass();};
const blocked=(v,name)=>{assert(!v,name);negative++};
const file={name:'plan.jpg', async arrayBuffer(){return Uint8Array.of(1,2,3,4,5).buffer;}};
let state,ride,source,dom,drawCalls;
const date='2026-10-23';
function initialize(){
 drawCalls=[];
 const ctx2d={clearRect(){},drawImage(...args){drawCalls.push(args);},set imageSmoothingEnabled(x){}};
 dom={ap01EditorError:{textContent:''}, ap01OriginalCellReview:{hidden:false,dataset:{field:'company'}},
 ap01OriginalCellCanvas:{width:0,height:0,getContext:()=>ctx2d},
 ap01OriginalCellApproved:{checked:false}, ap01OriginalCellCaption:{textContent:''},
 ap01OriginalCellConfirm:{disabled:false},ap01EditorFields:{querySelectorAll:()=>dom.inputs,querySelector:(s)=>dom.inputs.find(x=>s.includes(`data-field="${x.dataset.field}"`))},
 ap01RideEditor:{hidden:false}};
 ride={id:'r2',sourceImageOcr:true,sourceRow:2,sourceFile:file.name,planDate:date,date,time:'06:40',
 company:'Get-E',destination:'Marriott Seesten DUS',pickup:'DUS Airport',arrivalFlight:'EW9895',flightNumber:'EW9895',departureFlight:'',
 companyOcrConflict:true,destinationOcrConflict:true,destinationCellConflict:false,
 imageCellEvidence:{company:{field:'company',sourceRow:2,sourceColumn:5,
 cellBounds:{left:100,top:55,right:240,bottom:90},primarySourceEvidence:{rawOcr:'GetE'},
 cropQuality:{fullCellIncluded:true,leftEdgeClipped:false,rightEdgeClipped:false,neighborColumnIncluded:false}},
 destination:{field:'destination',sourceRow:2,sourceColumn:3,
 cellBounds:{left:10,top:55,right:90,bottom:90},primarySourceEvidence:{rawOcr:'Marriott Seesten DUS'},
 cropQuality:{fullCellIncluded:true,leftEdgeClipped:false,rightEdgeClipped:false,neighborColumnIncluded:false}}},
 importIntegrityStatus:'blocked',importIntegrityConflicts:[{code:'route_semantic_unverified_destination',text:'route'}]};
 const companyBound=[0,0,0,10,90,100,240,300],meta={width:300,height:100,
 boundaries:companyBound,rowMetaByMatrixIndex:{1:{y0:55,y1:90}}};
 source={file,canvas:{width:300,height:100},meta,generation:1};
 state={file,files:[file],rides:[ride],planDate:date,mapping:{company:5,destination:3},
 pipelineGeneration:1,ap01EditorOpenId:'r2',ap01ReviewConfirmed:false,previewOnlyAnalysis:false,
 analysisRunInProgress:false,autoPipelineInProgress:false};
 dom.inputs=[['company','Get-E'],['destination','Marriott Seesten DUS'],['pickup','DUS Airport'],['date',date],['time','06:40'],['flightNumber','EW9895']].map(([field,value])=>({dataset:{field},value}));
}
initialize();
const ctx={state,globalThis:{crypto},crypto,window:{},document:{},AP01_KEYS:dom.inputs.map(i=>i.dataset.field),
 $,cellText:v=>String(v??'').trim(),isImageFile:f=>/\.jpg$/i.test(f.name),
 ap01RideById:id=>state.rides.find(r=>r.id===id),
 classifyRide:()=> 'arrival',validate:()=>[],writeCurrentAnalysisJsonPreview:()=>{},
 ap01CloseEditor:()=>{state.ap01EditorOpenId=null;},Date,Number,Set,Map,WeakMap,Array,JSON,Error};
function $(id){return dom[id]??null;}
vm.createContext(ctx);
vm.runInContext(original+'\nthis.f={source:p11448SourceCell,eligible:p11448Eligible,present:p11448PresentCell,confirm:p11448ConfirmOriginalCell,guard:p11448Guard,verify:p11448PreImportVerify,receipt:p11448ReceiptValid,setSource:(v)=>p11448Source=v,token:p11448Tokens};',ctx);
const f=ctx.f;
// Execute the actual production import-blocker function, not a relaxed test copy.
const conflictStart=prod.indexOf('  function ap01ConflictEvidenceList(ride) {');
const conflictEnd=prod.indexOf('  function ap01OpenEditor(id) {',conflictStart);
const blockerStart=prod.indexOf('  function ap01ImportBlockers() {');
const blockerEnd=prod.indexOf('  function render() {',blockerStart);
assert(conflictStart>=0&&conflictEnd>conflictStart&&blockerStart>=0&&blockerEnd>blockerStart);
vm.runInContext(prod.slice(conflictStart,conflictEnd)+'\n'+prod.slice(blockerStart,blockerEnd)+'\nthis.importBlockers=ap01ImportBlockers;',ctx);
(async()=>{
 f.setSource(source);
 check(f.eligible(ride,'company'),'company conflict eligible');
 check(f.eligible(ride,'destination'),'destination conflict eligible');
 blocked(f.eligible(ride,'price'),'price never bypassable');
 blocked(f.eligible(ride,'flightNumber'),'flight never bypassable');
 blocked(f.eligible(ride,'driver'),'driver never bypassable');
 blocked(f.eligible(ride,'date'),'date never bypassable');
 const foreign={...ride,sourceRow:3};blocked(f.source(foreign,'company'),'foreign ride rejected');
 const other={...ride,id:'r3',sourceRow:3};state.rides.push(other);
 blocked(f.source(other,'company'),'other row not approved');state.rides.pop();
 const oldCol=ride.imageCellEvidence.company.sourceColumn;ride.imageCellEvidence.company.sourceColumn=4;
 blocked(f.eligible(ride,'company'),'foreign column rejected');ride.imageCellEvidence.company.sourceColumn=oldCol;
 const crop=ride.imageCellEvidence.company.cropQuality;crop.neighborColumnIncluded=true;
 blocked(f.eligible(ride,'company'),'neighbor intrusion rejected');crop.neighborColumnIncluded=false;
 crop.leftEdgeClipped=true;blocked(f.eligible(ride,'company'),'clipped rejected');crop.leftEdgeClipped=false;
 const oldBound=ride.imageCellEvidence.company.cellBounds.left;ride.imageCellEvidence.company.cellBounds.left=-1;
 blocked(f.eligible(ride,'company'),'out-of-bounds crop rejected');ride.imageCellEvidence.company.cellBounds.left=oldBound;
 state.previewOnlyAnalysis=true;blocked(f.eligible(ride,'company'),'test-only mode stays isolated');state.previewOnlyAnalysis=false;
 state.analysisRunInProgress=true;check(f.eligible(ride,'company'),'source image remains visible while analysis settles');state.analysisRunInProgress=false;
 source.generation=2;blocked(f.eligible(ride,'company'),'stale generation rejected');source.generation=1;
 const oldfile=state.file;state.file={name:'plan.jpg'};blocked(f.eligible(ride,'company'),'different file object rejected');state.file=oldfile;
 check(f.present(ride,'company') && drawCalls.length===1,'original cell is actually cropped');
 blocked(await f.confirm(),'checkbox unchecked cannot authorize');
 dom.ap01OriginalCellApproved.checked=true;
 dom.inputs.find(i=>i.dataset.field==='date').value='2026-10-24';
 blocked(await f.confirm(),'another edited field cannot be smuggled into confirmation');
 dom.inputs.find(i=>i.dataset.field==='date').value=date;
 check(await f.confirm(),'explicit company field accepted with original bytes');
 check(!ride.companyOcrConflict,'company conflict cleared');
 check(ride.destinationOcrConflict,'destination not silently approved');
 check(ride.importIntegrityStatus==='blocked','unrelated route integrity remains blocked');
 check(ride.ap01ManualCellReviews.length===1,'audit captures one exact cell');
 check(f.guard()==='', 'guard accepts live review');
 state.ap01ReviewConfirmed=true;
 check(ctx.importBlockers().includes('Ungeklärte OCR-/Integritätskonflikte'),
   'confirming company cannot release unresolved destination');negative++;
 state.ap01ReviewConfirmed=false;
 await f.verify();pass();
 ride.company='GetE';check(Boolean(f.guard()),'changed value invalidates receipt');negative++;
 ride.company='Get-E';check(!f.guard(),'restored value matches receipt');
 state.ap01EditorOpenId='r2';dom.ap01OriginalCellReview.dataset.field='destination';
 check(f.present(ride,'destination'),'destination crop rendered');
 dom.inputs.find(x=>x.dataset.field==='destination').value='Marriott Seestern DUS';
 dom.ap01OriginalCellApproved.checked=true;
 check(await f.confirm(),'destination explicitly reviewed');
 check(ride.destination==='Marriott Seestern DUS' && !ride.destinationOcrConflict,'target only resolved');
 check(ride.importIntegrityConflicts.length===0 && ride.importIntegrityStatus==='ok','only known target route-conflict code cleared');
 check(ride.ap01ManualCellReviews.length===2,'two exact field audits');
 check(!f.guard(),'both receipts valid');
 state.ap01ReviewConfirmed=true;
 check(ctx.importBlockers().length===0,'two individual reviews allow only clean stage to proceed');
 state.rides.push({...ride,id:'clone-double',sourceRow:2});
 check(ctx.importBlockers().some(x=>x.includes('Doppelte Quellzeile')), 'duplicate source row still blocked');negative++;
 state.rides.pop();
 ride.flightTimeSourceGlyphAmbiguity='15:307';
 check(ctx.importBlockers().some(x=>x.includes('Flugzeit')), 'flight glyph source guard retained');negative++;
 delete ride.flightTimeSourceGlyphAmbiguity;
 ride.importIntegrityConflicts=[{code:'flight_time_conflict',text:'critical'}];ride.importIntegrityStatus='blocked';
 check(ctx.importBlockers().some(x=>x.includes('Ungeklärte')), 'independent integrity conflict remains blocked');negative++;
 ride.importIntegrityConflicts=[];ride.importIntegrityStatus='ok';
 state.ap01ReviewConfirmed=false;
 check(ctx.importBlockers().includes('Vorschau noch nicht ausdrücklich bestätigt'), 'global preview confirmation still required');negative++;
 await f.verify();pass();
 const originalRow=ride.sourceRow;ride.sourceRow=3;check(Boolean(f.guard()),'source row changed blocked');negative++;ride.sourceRow=originalRow;
 const originalDate=ride.date;ride.date='2026-10-24';check(Boolean(f.guard()),'date change blocked');negative++;ride.date=originalDate;
 source.meta.boundaries[4]=91;check(Boolean(f.guard()),'geometry drift blocked');negative++;source.meta.boundaries[4]=90;
 const oldEvidence=ride.imageCellEvidence.company.primarySourceEvidence.rawOcr;
 ride.imageCellEvidence.company.primarySourceEvidence.rawOcr='forged';check(Boolean(f.guard()),'original raw mutation blocked');negative++;ride.imageCellEvidence.company.primarySourceEvidence.rawOcr=oldEvidence;
 const originalList=ride.ap01ManualCellReviews;ride.ap01ManualCellReviews=[];
 check(Boolean(f.guard()),'forged or lost audit blocked');negative++;ride.ap01ManualCellReviews=originalList;
 const originalFiles=state.files;state.files=[];check(Boolean(f.guard()),'no active selected photo blocked');negative++;state.files=originalFiles;
 const clone={...ride};state.rides=[clone];check(Boolean(f.guard()),'forged JSON/restaged clone no live token');negative++;state.rides=[ride];
 let changedBytes=false;file.arrayBuffer=async()=>{if(changedBytes)return Uint8Array.of(6,7,8,9).buffer;return Uint8Array.of(1,2,3,4,5).buffer;};
 changedBytes=true;let rejected=false;try{await f.verify();}catch(e){rejected=true;}check(rejected,'changed original image bytes block import');negative++;
 changedBytes=false;await f.verify();pass();
 console.log(`P11448 LOCAL original-cell review: ${passed} positive assertions / ${negative} negative guards PASS; no actual import or storage calls`);
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
