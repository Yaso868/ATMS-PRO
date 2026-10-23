'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const prod = fs.readFileSync(path.join(__dirname,'../app/src/main/assets/js/plan-import.js'),'utf8');
const sectionStart = prod.indexOf('  // P11444: Source-cell generic');
const sectionEnd = prod.indexOf('  // P11442 G4 replay:', sectionStart);
assert(sectionStart >= 0 && sectionEnd > sectionStart, 'real integrated P11444 source not found');
const code = prod.slice(sectionStart, sectionEnd);
const routeStart = prod.indexOf('  function p11442RouteEditProof(');
const routeEnd = prod.indexOf('  // P11443:', routeStart);
assert(routeStart >= 0 && routeEnd > routeStart, 'real P11442 route proof missing');
const realRoute = prod.slice(routeStart,routeEnd);

let checks = 0, negatives = 0;
const tick=()=>checks++;
const cellText = x => String(x ?? '').trim();
const timeToMinutes = x => /^([01]?\d|2[0-3]):[0-5]\d$/.test(String(x)) ? 1 : null;
function normalizeTime(v){const s=cellText(v);const m=s.match(/(?:^|\s)(\d{1,2})[:.](\d{2})(?!\d)/);return m?m[1].padStart(2,'0')+':'+m[2]:s;}
function routeOcrText(v) {return cellText(v);}

function evidence(field, row, raw) {
 const quality={fullCellIncluded:true,leftEdgeClipped:false,rightEdgeClipped:false,neighborColumnIncluded:false};
 return {rawOcr:raw,sourceRow:row,sourceColumn:field==='destination'?4:11,confidence:79,cropQuality:quality,manualCheckRequired:false,verificationAttempts:[],primarySourceEvidence:Object.freeze({rawOcr:raw,sourceRow:row,sourceColumn:field==='destination'?4:11,verificationSource:'primary_full_image_cell_assignment',cropQuality:quality})};
}
function reading(ride,field,text,mode) {return {scope:'source_truth_full_cell',field,sourceRow:ride.sourceRow,sourceColumn:ride.imageCellEvidence[field].sourceColumn,mode,candidate:text,cropQuality:{fullCellIncluded:true,targetCellGeometryConfirmed:true,leftEdgeClipped:false,rightEdgeClipped:false,neighborColumnIncluded:false}};}
function reads(ride,field,text){return ['source-truth-full-cell-psm6','source-truth-full-cell-psm7'].map(mode=>reading(ride,field,text,mode));}
function exampleRoute(){return {sourceRow:2,sourceImageOcr:true,time:'12:20',driver:'Yannik',destination:'Mariott Seestem DUS',destinationOcrConflict:true,destinationOcrConflictCandidate:'Marriott Seestern DUS',destinationCellConflict:false,imageCellEvidence:{destination:evidence('destination',2,'Mariott Seestem DUS')}};}
function exampleNote(){return {sourceRow:14,sourceImageOcr:true,time:'15:30',departureFlight:'OS166',flightTime:'nicht',notes:'',imageCellEvidence:{flightTime:evidence('flightTime',14,'nicht')}};}
const ctx={cellText,normalizeTime,timeToMinutes,routeOcrText,window:{Tesseract:true}};
vm.createContext(ctx);
vm.runInContext(realRoute+'\n'+code+`\nthis.fns={p11444ResolveOneSourceCell,p11444QualifiedCellReadings,p11444VerifiedSourceBoundRouteProof,p11444ReconcileSourceCells,p11444SafeNote,p11444HasMixedFlightTimeRaw};`,ctx,{timeout:1000});
const f=ctx.fns;
const noteSamples=[
 ['2HK nicht','2HK nicht'], ['2HK/15:30 nicht',''], ['2HK|15:30 nicht',''],
 ['2HK/15.30 nicht',''], ['2HK/1530 nicht',''], ['2HK (15:30) nicht',''],
 ['2HK 15:30 nicht',''], ['2HK/1520 nicht',''], ['2HK nicht 2HK','2HK nicht 2HK'],
 ['nicht',''], ['2HK 15:307 nicht',''],
 ['2HK1530 nicht',''], ['EW9031 nicht',''], ['PAX1540 nicht',''],
 ['2HK1530/1540 nicht',''], ['2HK nicht 2026',''], ['2HK nicht 15:30','']
];
for (const [value,expected] of noteSamples){
 assert.equal(f.p11444SafeNote(value),expected,`note grammar: ${value}`);tick();
 if(!expected)negatives++;
}

// R3: exact-table-edge, punctuation, and multi-clock cases must remain blocked.
const mixedFlightSamples=[
  ['15:30|2HK',true],['2HK|15:30',true],['15:30 / 2HK',true],
  ['15:30/2HK',true],['2HK/15:30',true],['15:30Uhr',true],
  ['15:30 2HK',true],['15:30|15:30',true],['15:30/15:40',true],
  ['15:30.00',true],['15:307',true],['115:30',true],
  ['2HK15:30',true],['15:30 (nicht)',true],['15:30|nicht',true],
  ['2HK nicht',false],['nicht',false],['',false],['15:30',false],
  ['15.30',false],['|15:30|',false],['15:30?',false],
  ['15:30 |',false],['| 15:30',false],['kein Flug',false],
  ['14:00 14:00',true],['15:30 und später',true],
];
for (const [raw,expected] of mixedFlightSamples) {
  assert.equal(f.p11444HasMixedFlightTimeRaw(raw),expected,raw);
  tick(); if(expected)negatives++;
}

let r=exampleRoute(); const before=JSON.stringify(r);
let fixed=f.p11444ResolveOneSourceCell(r,'destination',reads(r,'destination','Marriott Seestern DUS'));
assert.equal(fixed.destination,'Marriott Seestern DUS');tick();
assert.equal(fixed.destinationOcrConflict,false);tick();
assert.equal(JSON.stringify(r),before,'source ride must remain unchanged');tick();
assert.equal(f.p11444VerifiedSourceBoundRouteProof(fixed,'destination',r.imageCellEvidence.destination,'Mariott Seestem DUS','Marriott Seestern DUS'),true);tick();
assert.equal(f.p11444VerifiedSourceBoundRouteProof(fixed,'pickup',r.imageCellEvidence.destination,'Mariott Seestem DUS','Marriott Seestern DUS'),false);tick();
const forged={...fixed,destinationP11444Proof:{...fixed.destinationP11444Proof}};
assert.equal(f.p11444VerifiedSourceBoundRouteProof(forged,'destination',r.imageCellEvidence.destination,'Mariott Seestem DUS','Marriott Seestern DUS'),false,'import JSON must not forge a proof');tick();negatives++;
r=exampleNote();const input=JSON.stringify(r);
fixed=f.p11444ResolveOneSourceCell(r,'flightTime',reads(r,'flightTime','2HK nicht'));
assert.equal(fixed.flightTime,'');tick();
assert.equal(fixed.notes,'2HK nicht');tick();
assert.equal(fixed.flightTimeP11444NoteProof.originalRaw,'nicht');tick();
assert.equal(JSON.stringify(r),input);tick();
const cases=[
 ['one read missing',(r)=>[reading(r,'flightTime','2HK nicht','source-truth-full-cell-psm6')]],
 ['two same modes',(r)=>[reading(r,'flightTime','2HK nicht','source-truth-full-cell-psm6'),reading(r,'flightTime','2HK nicht','source-truth-full-cell-psm6')]],
 ['disagreeing OCR',(r)=>[reading(r,'flightTime','2HK nicht','source-truth-full-cell-psm6'),reading(r,'flightTime','nicht','source-truth-full-cell-psm7')]],
 ['wrong row',(r,a)=>{a[0].sourceRow=13;return a}],
 ['wrong column',(r,a)=>{a[0].sourceColumn=12;return a}],
 ['clipped geometry',(r,a)=>{a[0].cropQuality.leftEdgeClipped=true;return a}],
 ['neighbor included',(r,a)=>{a[1].cropQuality.neighborColumnIncluded=true;return a}],
 ['other clock',(r,a)=>{a[1].candidate='15:30';return a}],
 ['uncertain glyph',(r,a)=>{r.flightTimeSourceGlyphAmbiguity='15:307';return a}],
 ['uncertain flight',(r,a)=>{r.flightTimeUncertain=true;return a}],
 ['source-cell manual block',(r,a)=>{r.imageCellEvidence.flightTime.manualCheckRequired=true;return a}],
 ['source-notes mismatch',(r,a)=>{r.imageCellEvidence.flightTime.rawOcr='15:30';return a}],
 ['trusted third opposition',(r,a)=>{r.imageCellEvidence.flightTime.verificationAttempts=[{scope:'source_truth_full_cell',candidate:'Achtung',cropQuality:{fullCellIncluded:true,targetCellGeometryConfirmed:true,neighborColumnIncluded:false,leftEdgeClipped:false,rightEdgeClipped:false}}];return a}],
 ['actual flight time',(r,a)=>{r.flightTime='15:30';return a}],
 ['time with question mark',(r,a)=>{r.flightTime='15:30?';return a}],
 ['only nicht',(r,a)=>a.map(x=>({...x,candidate:'nicht'}))],
 ['not a flight note',(r,a)=>a.map(x=>({...x,candidate:'15:30'}))],
 ['flight with mixed note',(r,a)=>a.map(x=>({...x,candidate:'2HK 15:30'}))],
 ['mixed note slash clock',(r,a)=>a.map(x=>({...x,candidate:'2HK/15:30 nicht'}))],
 ['mixed note pipe clock',(r,a)=>a.map(x=>({...x,candidate:'2HK|15:30 nicht'}))],
 ['mixed note semicolon clock',(r,a)=>a.map(x=>({...x,candidate:'2HK;15:30 nicht'}))],
 ['mixed note decimal clock',(r,a)=>a.map(x=>({...x,candidate:'2HK/15.30 nicht'}))],
 ['mixed note compact clock',(r,a)=>a.map(x=>({...x,candidate:'2HK/1530 nicht'}))],
 ['mixed note clock in brackets',(r,a)=>a.map(x=>({...x,candidate:'2HK (15:30) nicht'}))],
 ['mixed note multiple clocks',(r,a)=>a.map(x=>({...x,candidate:'2HK 15:30/15:40 nicht'}))],
 ['mixed note damaged attached clock',(r,a)=>a.map(x=>({...x,candidate:'2HK/15:307 nicht'}))],
 ['note with numeric runway',(r,a)=>a.map(x=>({...x,candidate:'2HK/1520 nicht'}))],

 ['invalid note glyph',(r,a)=>a.map(x=>({...x,candidate:'2HK nicht?'}))],
 ['arrival flight contradiction',(r,a)=>{r.flightTimeOcrConflict=true;return a}],
];
for(const [name,mut] of cases){const x=exampleNote();let a=reads(x,'flightTime','2HK nicht');const changed=mut(x,a);if(changed)a=changed;
const got=f.p11444ResolveOneSourceCell(x,'flightTime',a);
assert.equal(got.flightTime,x.flightTime,name);assert.equal(got.notes,x.notes,name);tick();negatives++;}
const routeCases=[
 ['different address',(r,a)=>a.map(x=>({...x,candidate:'Hilton Seestern DUS'}))],
 ['different city suffix',(r,a)=>a.map(x=>({...x,candidate:'Marriott Seestern CGN'}))],
 ['conflicting PSM',(r,a)=>{a[1].candidate='Mariott Seestern DUS';return a}],
 ['manual conflict',(r,a)=>{r.imageCellEvidence.destination.manualCheckRequired=true;return a}],
 ['independent cell conflict',(r,a)=>{r.destinationCellConflict=true;return a}],
 ['list consensus only',(r,a)=>{r.destinationOcrConflictFromListConsensus=true;return a}],
 ['actual different final',(r,a)=>{r.destinationOcrConflictCandidate='Different Hotel DUS';return a}],
 ['primary mismatch',(r,a)=>{r.destination='New Hotel DUS';return a}],
 ['missing birth record',(r,a)=>{delete r.imageCellEvidence.destination.primarySourceEvidence;return a}],
 ['untrusted image',(r,a)=>{r.sourceImageOcr=false;return a}],
];
for(const [name,mut] of routeCases){const x=exampleRoute();let a=reads(x,'destination','Marriott Seestern DUS');const changed=mut(x,a);if(changed)a=changed;
const got=f.p11444ResolveOneSourceCell(x,'destination',a);
assert.equal(got.destination,x.destination,name);tick();negatives++;}
// All 22 physical rides remain independent; none may be reordered or deduplicated.
const twentyTwo=Array.from({length:22},(_,i)=>({sourceRow:i+2,sourceImageOcr:true,time:'15:30',vehicle:i%2?'Van':'Pkw',persons:(i%7)+1,price:i%2?47.6:35,departureFlight:i%2?'EW9510':'EW9754',notes:'',flightTime:'',imageCellEvidence:{}}));
twentyTwo[0]=exampleRoute();twentyTwo[12]=exampleNote();
const prior=twentyTwo.map(x=>JSON.stringify(x));
const sourceTruthCanvas={width:1000,height:1000,pixelOrigin:'unmodified_source'};
const processedCanvas={width:1000,height:1000,pixelOrigin:'processed'};
let sourceOcrCalls=0;
ctx.sourceTruthFullCellTextOcr=async (source,processed,_descriptor,_meta,row,field)=>{
 assert.equal(source,sourceTruthCanvas,'OCR must read original source pixels');tick();
 assert.equal(processed,processedCanvas,'second canvas must stay processed');tick();
 sourceOcrCalls++;
 const ride={sourceRow:row,imageCellEvidence:{[field]:{sourceColumn:field==='destination'?4:11}}};
 return reads(ride,field,field==='destination'?'Marriott Seestern DUS':'2HK nicht');
};
const boundaries=Array.from({length:15},(_,i)=>i*50);
const imageMeta={width:1000,height:1000,boundaries,rowMetaByMatrixIndex:Array.from({length:24},(_,i)=>({y0:i*20,y1:i*20+15}))};
(async()=>{
 for(const [name,invalidSource,invalidProcessed,invalidMeta] of [
  ['missing source',null,processedCanvas,imageMeta],
  ['source equals processed',processedCanvas,processedCanvas,imageMeta],
  ['different source width',{width:999,height:1000},processedCanvas,imageMeta],
  ['different source height',{width:1000,height:999},processedCanvas,imageMeta],
  ['zero width',{width:0,height:1000},processedCanvas,imageMeta],
  ['fractional dimension',{width:1000.5,height:1000},processedCanvas,imageMeta],
  ['meta width mismatch',sourceTruthCanvas,processedCanvas,{...imageMeta,width:999}],
  ['meta height mismatch',sourceTruthCanvas,processedCanvas,{...imageMeta,height:999}],
  ['no processed canvas',sourceTruthCanvas,null,imageMeta],
 ]) {
  const initialCalls=sourceOcrCalls;
  const blocked=await f.p11444ReconcileSourceCells(twentyTwo,invalidSource,invalidProcessed,invalidMeta,{destination:4,flightTime:11});
  assert.deepEqual(blocked.map(x=>JSON.stringify(x)),prior,`${name}: must fail-closed`);tick();negatives++;
  assert.equal(sourceOcrCalls,initialCalls,`${name}: should not call OCR`);tick();
 }
 const out=await f.p11444ReconcileSourceCells(twentyTwo,sourceTruthCanvas,processedCanvas,imageMeta,{destination:4,flightTime:11});
 assert.equal(out.length,22);tick();
 assert.equal(out[0].destination,'Marriott Seestern DUS');tick();
 assert.equal(out[12].notes,'2HK nicht');tick();
 assert.equal(sourceOcrCalls,2,'only two actually affected cells are re-OCRed');tick();
 for(let i=0;i<22;i++){
 assert.equal(out[i].sourceRow,twentyTwo[i].sourceRow);tick();
 for(const k of ['time','vehicle','persons','price','departureFlight']){assert.equal(out[i][k],twentyTwo[i][k]);tick();}
 assert.equal(JSON.stringify(twentyTwo[i]),prior[i]);tick();
 }
 // R5 same-row preservation: later flightTime correction may NOT overwrite an earlier
 // destination correction on the same physical source row (no duplicate/carryover).
 const both={...exampleRoute(),flightTime:'nicht',notes:'',imageCellEvidence:{
   destination:evidence('destination',2,'Mariott Seestem DUS'),
   flightTime:evidence('flightTime',2,'nicht')
 }};
 const bothBefore=JSON.stringify(both);
 const combined=await f.p11444ReconcileSourceCells([both],sourceTruthCanvas,processedCanvas,imageMeta,{destination:4,flightTime:11});
 assert.equal(combined.length,1);tick();
 assert.equal(combined[0].destination,'Marriott Seestern DUS','route fix must survive later same-row note fix');tick();
 assert.equal(combined[0].destinationOcrConflict,false);tick();
 assert.equal(combined[0].flightTime,'');tick();
 assert.equal(combined[0].notes,'2HK nicht');tick();
 assert.equal(JSON.stringify(both),bothBefore,'source immutable');tick();
 assert.equal(f.p11444VerifiedSourceBoundRouteProof(combined[0],'destination',both.imageCellEvidence.destination,
   'Mariott Seestem DUS','Marriott Seestern DUS'),true,'source-bound proof must survive');tick();
 // Re-import/read twice must not add duplicate notes or repeat transformations.
 const beforeSecondPass=sourceOcrCalls;
 const secondPass=await f.p11444ReconcileSourceCells(combined,sourceTruthCanvas,processedCanvas,imageMeta,{destination:4,flightTime:11});
 assert.equal(JSON.stringify(secondPass),JSON.stringify(combined),'idempotent same-row review');tick();
 assert.equal(sourceOcrCalls,beforeSecondPass,'nothing re-OCRed on already corrected record');tick();
 // Note veto must never undo an independently validated destination on same row.
 const vetoed={...both,flightTimeOcrConflict:true};
 const vetoedOut=await f.p11444ReconcileSourceCells([vetoed],sourceTruthCanvas,processedCanvas,imageMeta,{destination:4,flightTime:11});
 assert.equal(vetoedOut[0].destination,'Marriott Seestern DUS');tick();
 assert.equal(vetoedOut[0].flightTime,'nicht');tick();
 assert.equal(vetoedOut[0].notes,'');tick();negatives++;

 console.log(`P11444 ISOLATED LOGIC: PASS | checks ${checks} | negative ${negatives} | 22 rides intact`);
})().catch(e=>{console.error(e);process.exit(1)});
