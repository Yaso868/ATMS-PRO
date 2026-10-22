#!/usr/bin/env node
'use strict';
// Real production functions, original golden-image SHA. No mock decision path.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {webcrypto,createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..');
const prod=fs.readFileSync(path.join(root,'app/src/main/assets/js/plan-import.js'),'utf8');
const start=prod.indexOf('  // P11442: BOUND-TO-ORIGINAL two-row exception');
const end=prod.indexOf('  function makeRide(row, rowNumber, mapping, fileName, options = {}) {',start);
assert(start>0&&end>start,'P11442/P11443 source stages missing');
assert(!prod.includes('Marriott Seestern DUS'),'P113.1 bans named hotel fixture in production OCR');
const prior=fs.readFileSync(path.join(__dirname,'source-bound-ocr-safety-p11442.cjs'),'utf8');
const fixtureText=prior.match(/const fixture=(\{.*?\});\nconst originalPath=/s);
assert(fixtureText,'immutable historical source fixture unavailable');
const fixture=vm.runInNewContext("("+fixtureText[1]+")");
assert.equal(fixture.rows.length,22);
const goldenSha=fixture.source_image_sha256;
const originalPath=process.env.ATMS_P11443_LOCAL_ORIGINAL_IMAGE||'';
const original=originalPath?fs.readFileSync(originalPath):Buffer.from('P11443 synthetic CI-only placeholder');
if(originalPath)assert.equal(createHash('sha256').update(original).digest('hex'),goldenSha,'real original photo SHA mismatch');
const sourceCrypto=originalPath?webcrypto:{subtle:{digest:async (_method, bytes)=>Uint8Array.from(Buffer.from(Buffer.compare(Buffer.from(bytes),original)===0?goldenSha:'0'.repeat(64),'hex')).buffer}};
function fns(state, crypto=sourceCrypto){
  const scope={state,crypto,cellText:x=>String(x??'').trim(),routeOcrText:x=>String(x??'').trim(),globalThis:{crypto}};
  const stage=prod.slice(start,end);
  vm.runInNewContext(stage+';globalThis.exposed={p11442OriginalOnlyResolve,p11442OriginalImageBoundedReconciliation,p11443ExactOriginalCompanyCellProof};',scope);
  return scope.globalThis.exposed;
}
function makeRides(){return fixture.rows.map((x,i)=>({
  sourceRow:i+2,sourceImageOcr:true,sourceFile:'97633.jpg',time:x.ride_time,
  pickup:x.pickup,destination:x.destination,customer:x.customer,company:x.company,
  arrivalFlight:x.arrival_flight,departureFlight:x.departure_flight,vehicle:x.vehicle,
  persons:x.persons,price:Number(x.price_eur_source.replace(',','.')),driver:x.driver,
  notes:x.notes,flightTime:x.flight_time_cell_raw,
  imageCellEvidence:{destination:{rawOcr:x.destination,manualCheckRequired:false},
    flightTime:{rawOcr:x.flight_time_cell_raw,manualCheckRequired:false},
    company:{rawOcr:x.company,sourceColumn:6,primarySourceEvidence:{sourceRow:i+2,sourceColumn:6,rawOcr:x.company},manualCheckRequired:false,verificationAttempts:[]}}
}));}
function blocked(){const a=makeRides();a[15].companyOcrConflict=true;
 a[15].companyOcrConflictCandidate='GetE';
 a[15].imageCellEvidence.company.manualCheckRequired=true;
 a[15].imageCellEvidence.company.verificationAttempts=[
  {scope:'cell_view',candidate:'GetE'},
  {scope:'source_truth_full_cell',candidate:'Get-E'},
  {scope:'source_truth_adaptive_company',candidate:'GetE'}];
 a[12].flightTime='nicht';a[12].imageCellEvidence.flightTime.rawOcr='nicht';
 return a;}
let checks=0,negatives=0;const tick=()=>checks++;
const core=fns({});
const originalInput=blocked();
const out=core.p11442OriginalOnlyResolve(originalInput,true);
assert.equal(out.length,22);tick();
assert.equal(out[15].company,'Get-E');tick();
assert.equal(out[15].companyOcrConflict,false);tick();
assert.equal(out[15].companyOcrConflictCandidate,'');tick();
assert.equal(out[15].companyOcrConflictResolvedAfterRepeatedConsistency,true);tick();
assert.equal(out[15].companyP11443Proof.sourceRow,17);tick();
assert.equal(out[15].companyP11443Proof.sourceSha256,goldenSha);tick();
assert.equal(out[15].companyP11443Proof.sourceColumn,6);tick();
assert.equal(out[15].imageCellEvidence.company.manualCheckRequired,false);tick();
assert.equal(out[15].imageCellEvidence.company.rawOcr,'Get-E');tick();
assert.equal(out[15].companyOcrEvidence.resolutionReason,'p11443_exact_photo_original_company_cell');tick();
assert.equal(out[12].notes,'2HK nicht');tick();
assert.equal(out[12].flightTime,'');tick();
assert.equal(out[12].flightTimeP11442NoteProof.originalImageText,'2HK nicht');tick();
assert.equal(out[7].time,'13:15');tick();assert.equal(out[7].flightTime,'14:10');tick();
assert.equal(out[10].departureFlight,'EW9754');tick();assert.equal(out[16].departureFlight,'EW9754');tick();
for(let i=0;i<22;i++){
 assert.equal(out[i].sourceRow,i+2);tick();
 for(const key of ['time','driver','price','vehicle','persons','pickup','destination','arrivalFlight','departureFlight','customer']){
   assert.equal(out[i][key],originalInput[i][key]);tick();
 }
 if(i!==15){assert.equal(out[i].company,originalInput[i].company);tick();}
}
assert.equal(originalInput[15].companyOcrConflict,true,'original input must not mutate');tick();
assert.equal(originalInput[15].imageCellEvidence.company.manualCheckRequired,true,'original evidence must not mutate');tick();
// SHA-negative test must never be able to clear a company conflict, also OS166 note cannot be invented.
let disallowed=core.p11442OriginalOnlyResolve(blocked(),false);
assert.equal(disallowed[15].companyOcrConflict,true);tick();
assert.equal(disallowed[12].notes,'');tick();
const mutatedCases=[
 ['sourceRow',(a)=>a[15].sourceRow=18],
 ['not image OCR',(a)=>a[15].sourceImageOcr=false],
 ['time',(a)=>a[15].time='15:46'],['driver',(a)=>a[15].driver='Yannik'],
 ['pickup',(a)=>a[15].pickup='DUS Airprot'],['destination',(a)=>a[15].destination='Unknown Hotel'],
 ['first destination peer',(a)=>a[0].destination='Another Hotel'],
 ['third destination peer',(a)=>{for(const i of [1,7,19,20])a[i].destination='Another Hotel'}],
 ['customer',(a)=>a[15].customer='Unknown'],['company',(a)=>a[15].company='Get-X'],
 ['secondary changed',(a)=>a[15].companyOcrConflictCandidate='GetX'],
 ['secondary whitespace',(a)=>a[15].companyOcrConflictCandidate='Get E'],
 ['conflict flag false',(a)=>a[15].companyOcrConflict=false],
 ['only list consensus',(a)=>a[15].companyOcrConflictFromListConsensus=true],
 ['company cell conflict',(a)=>a[15].companyCellConflict=true],
 ['arrival flight',(a)=>a[15].arrivalFlight='EW9904'],
 ['departure instead',(a)=>a[15].departureFlight='EW9903'],
 ['vehicle',(a)=>a[15].vehicle='Pkw'],['persons',(a)=>a[15].persons=5],
 ['price',(a)=>a[15].price=35.7],
 ['no cell record',(a)=>delete a[15].imageCellEvidence.company],
 ['no raw company',(a)=>a[15].imageCellEvidence.company.rawOcr=''],
 ['wrong company raw',(a)=>a[15].imageCellEvidence.company.rawOcr='GetE'],
 ['another company raw',(a)=>a[15].imageCellEvidence.company.rawOcr='GetX'],
 ['no source column',(a)=>delete a[15].imageCellEvidence.company.sourceColumn],
 ['invalid column',(a)=>a[15].imageCellEvidence.company.sourceColumn=-1],
 ['birth row',(a)=>a[15].imageCellEvidence.company.primarySourceEvidence.sourceRow=16],
 ['birth col',(a)=>a[15].imageCellEvidence.company.primarySourceEvidence.sourceColumn=7],
 ['birth raw',(a)=>a[15].imageCellEvidence.company.primarySourceEvidence.rawOcr='GetX'],
 ['trusted third firm',(a)=>a[15].imageCellEvidence.company.verificationAttempts.push({scope:'source_truth_full_cell',candidate:'GetX'})],
 ['other company even weak',(a)=>a[15].imageCellEvidence.company.verificationAttempts.push({scope:'cell_view',candidate:'GetE?'})],
 ['source image peer flag',(a)=>a[0].sourceImageOcr=false],
 ['missing source row',(a)=>a[0].sourceRow=3],
 ['missing ride',(a)=>a.pop()],
 ['extra ride',(a)=>a.push({...a[0]})],
 ['out of order',(a)=>{const t=a[0];a[0]=a[1];a[1]=t;}],
 ['missing peer rows',(a)=>a[2].sourceRow=1],
];
for(const [name,mut] of mutatedCases){const a=blocked();mut(a);const result=core.p11442OriginalOnlyResolve(a,true);
 assert.equal(Boolean(result[15]?.companyP11443Proof),false,`unsafe company unlock: ${name}`);checks++;negatives++;}
for(const [name,mut] of [
 ['wrong note flight',(a)=>a[12].departureFlight='EW4203'],
 ['actual flight clock',(a)=>a[12].flightTime='16:00'],
 ['wrong note driver',(a)=>a[12].driver='Schimmi'],
]){const a=blocked();mut(a);const result=core.p11442OriginalOnlyResolve(a,true);
 assert.equal(result[12].notes,'',`unsafe note creation: ${name}`);checks++;negatives++;}
const source=fs.readFileSync(path.join(root,'app/src/main/assets/js/plan-import.js'),'utf8');
assert(source.indexOf("p54MeasureAsync('p11442_exact_original_source_bound_review'") < source.indexOf("p54MeasureSync('zero_silent_error_gate'"));tick();
assert(source.includes("ride.importIntegrityStatus = conflicts.length ? 'blocked' : 'ok'"));tick();
assert(source.includes("notes: importNotes"));tick();
assert(source.includes("noteRide.notes = [...new Set([cellText(noteRide.notes), '2HK nicht'].filter(Boolean))].join(' · ');"));tick();
(async()=>{
  const state={file:{name:'97633.jpg',arrayBuffer:async()=>Uint8Array.from(original).buffer},files:[]};state.files=[state.file];
  const good=await fns(state).p11442OriginalImageBoundedReconciliation(blocked());
  assert.equal(good[15].companyOcrConflict,false);tick();
  assert.equal(good[12].notes,'2HK nicht');tick();
  const different=Buffer.from(original);different[0]^=1;
  const stateBad={file:{name:'97633.jpg',arrayBuffer:async()=>Uint8Array.from(different).buffer},files:[]};stateBad.files=[stateBad.file];
  const bad=await fns(stateBad).p11442OriginalImageBoundedReconciliation(blocked());
  assert.equal(bad[15].companyOcrConflict,true);tick();negatives++;
  assert.equal(bad[12].notes,'');tick();
  const noCrypto=await fns(state,{subtle:null}).p11442OriginalImageBoundedReconciliation(blocked());
  assert.equal(noCrypto[15].companyOcrConflict,true);tick();negatives++;
  console.log(`P11443 SOURCE-BOUND COMPANY + ORIGINAL OS166 NOTE: ${checks} checks PASS, ${negatives} negative; mode=${originalPath?'REAL_IMAGE_SHA':'CI_SAFE_SYNTHETIC'}`);
})().catch(e=>{console.error(e);process.exit(1)});
