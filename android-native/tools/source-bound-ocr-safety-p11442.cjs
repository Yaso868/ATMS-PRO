'use strict';
// P11442: Execute the real production source-bound functions in isolation.
// No app mocks may replace their source-bound decision or image SHA verification.
const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');
const {webcrypto,createHash}=require('crypto');
const root=path.resolve(__dirname,'..');
const code=fs.readFileSync(path.join(root,'app/src/main/assets/js/plan-import.js'),'utf8');
const start=code.indexOf('  // P11442: BOUND-TO-ORIGINAL two-row exception');
const end=code.indexOf('  function makeRide(row, rowNumber, mapping, fileName, options = {}) {',start);
assert(start>0 && end>start && code.indexOf('  // P11442: BOUND-TO-ORIGINAL',start+8)===-1);
// Non-sensitive geometric transcription of the 22-plan golden; no source
// image distributed in GitHub. Optional LOCAL file verifies real WebCrypto.
const fixture={source_image_sha256:'2e34a0d568e19fdb073bc4db141175a7cd686483544df7f43d3bae3e2f3e0e73',rows:[{"ride_time":"12:20","price_eur_source":"35,00","pickup":"DUS Airport","destination":"Marriott Seestern DUS","customer":"Avion","company":"Get-E","arrival_flight":"A3840","departure_flight":"","vehicle":"Pkw","persons":1,"flight_time_cell_raw":"12:10","driver":"Yannik","notes":""},{"ride_time":"12:35","price_eur_source":"35,00","pickup":"DUS Airport","destination":"Marriott Seestern DUS","customer":"Avion","company":"Get-E","arrival_flight":"EW9853","departure_flight":"","vehicle":"Van","persons":6,"flight_time_cell_raw":"12:30","driver":"Schimmi","notes":""},{"ride_time":"12:40","price_eur_source":"47,60","pickup":"DUS Airport","destination":"NH Nord-Holiday Inn","customer":"Eurowings","company":"WT","arrival_flight":"EW9573","departure_flight":"","vehicle":"Van","persons":5,"flight_time_cell_raw":"12:40","driver":"Yannik","notes":""},{"ride_time":"12:45","price_eur_source":"47,60","pickup":"DUS Airport","destination":"NH Nord-Holiday Inn","customer":"Eurowings","company":"WT","arrival_flight":"EW9613","departure_flight":"","vehicle":"Van","persons":6,"flight_time_cell_raw":"12:40","driver":"Elef","notes":""},{"ride_time":"13:00","price_eur_source":"47,60","pickup":"DUS Airport","destination":"Holiday Inn","customer":"Eurowings","company":"WT","arrival_flight":"","departure_flight":"","vehicle":"Pkw","persons":1,"flight_time_cell_raw":"13:00","driver":"Schimmi","notes":""},{"ride_time":"13:45","price_eur_source":"35,00","pickup":"Marriott Seestern DUS","destination":"DUS Airport","customer":"Avion","company":"Get-E","arrival_flight":"","departure_flight":"BT934","vehicle":"Pkw","persons":3,"flight_time_cell_raw":"","driver":"Yannik","notes":""},{"ride_time":"13:50","price_eur_source":"47,60","pickup":"DUS Airport","destination":"NH Nord-Holiday Inn","customer":"Eurowings","company":"WT","arrival_flight":"EW9569","departure_flight":"","vehicle":"Van","persons":4,"flight_time_cell_raw":"13:50","driver":"Yannik","notes":""},{"ride_time":"13:15","price_eur_source":"35,00","pickup":"DUS Airport","destination":"Marriott Seestern DUS","customer":"Avion","company":"Get-E","arrival_flight":"EW9883","departure_flight":"","vehicle":"Pkw","persons":1,"flight_time_cell_raw":"14:10","driver":"Elef","notes":""},{"ride_time":"14:40","price_eur_source":"47,60","pickup":"Holiday Inn DUS","destination":"DUS Airport","customer":"Eurowings","company":"WT","arrival_flight":"","departure_flight":"EW9510","vehicle":"Van","persons":4,"flight_time_cell_raw":"","driver":"Yannik","notes":""},{"ride_time":"14:40","price_eur_source":"47,60","pickup":"NH Nord DUS","destination":"DUS Airport","customer":"Eurowings","company":"WT","arrival_flight":"","departure_flight":"EW9510","vehicle":"Pkw","persons":2,"flight_time_cell_raw":"","driver":"Yannik","notes":""},{"ride_time":"15:20","price_eur_source":"47,60","pickup":"NH Nord DUS","destination":"DUS Airport","customer":"Eurowings","company":"WT","arrival_flight":"","departure_flight":"EW9754","vehicle":"Pkw","persons":2,"flight_time_cell_raw":"","driver":"Lana","notes":""},{"ride_time":"15:30","price_eur_source":"47,60","pickup":"Trainingscenter DUS","destination":"NH Nord-Holiday Inn","customer":"Eurowings","company":"WT","arrival_flight":"","departure_flight":"","vehicle":"Van","persons":7,"flight_time_cell_raw":"","driver":"Sabrina","notes":""},{"ride_time":"15:30","price_eur_source":"35,70","pickup":"Trainingscenter DUS","destination":"DUS Airport","customer":"Eurowings","company":"WT","arrival_flight":"","departure_flight":"OS166","vehicle":"Pkw","persons":3,"flight_time_cell_raw":"2HK nicht","driver":"Yannik","notes":""},{"ride_time":"15:30","price_eur_source":"35,70","pickup":"Trainingscenter DUS","destination":"DUS Airport","customer":"Eurowings","company":"WT","arrival_flight":"","departure_flight":"EW4203","vehicle":"Van","persons":7,"flight_time_cell_raw":"","driver":"Yannik","notes":""},{"ride_time":"15:40","price_eur_source":"35,00","pickup":"Marriott Seestern DUS","destination":"DUS Airport","customer":"Avion","company":"Get-E","arrival_flight":"","departure_flight":"EW9886","vehicle":"Van","persons":6,"flight_time_cell_raw":"","driver":"Lana","notes":""},{"ride_time":"15:45","price_eur_source":"35,00","pickup":"DUS Airport","destination":"Marriott Seestern DUS","customer":"Avion","company":"Get-E","arrival_flight":"EW9903","departure_flight":"","vehicle":"Van","persons":6,"flight_time_cell_raw":"15:45","driver":"Lana","notes":""},{"ride_time":"15:45","price_eur_source":"35,70","pickup":"Trainingscenter DUS","destination":"DUS Airport","customer":"Eurowings","company":"WT","arrival_flight":"","departure_flight":"EW9754","vehicle":"Pkw","persons":2,"flight_time_cell_raw":"","driver":"Yannik","notes":""},{"ride_time":"15:55","price_eur_source":"47,60","pickup":"Holiday Inn DUS","destination":"DUS Airport","customer":"Eurowings","company":"WT","arrival_flight":"","departure_flight":"EW9422","vehicle":"Pkw","persons":3,"flight_time_cell_raw":"","driver":"Sabrina","notes":""},{"ride_time":"15:55","price_eur_source":"47,60","pickup":"NH Nord DUS","destination":"DUS Airport","customer":"Eurowings","company":"WT","arrival_flight":"","departure_flight":"EW9422","vehicle":"Pkw","persons":1,"flight_time_cell_raw":"","driver":"Sabrina","notes":""},{"ride_time":"16:15","price_eur_source":"35,00","pickup":"Marriott Seestern DUS","destination":"DUS Airport","customer":"Avion","company":"Get-E","arrival_flight":"","departure_flight":"EW9784","vehicle":"Van","persons":6,"flight_time_cell_raw":"","driver":"Lana","notes":""},{"ride_time":"16:25","price_eur_source":"35,00","pickup":"DUS Airport","destination":"Marriott Seestern DUS","customer":"Avion","company":"Get-E","arrival_flight":"EW9675","departure_flight":"","vehicle":"Van","persons":6,"flight_time_cell_raw":"","driver":"Yannik","notes":""},{"ride_time":"16:55","price_eur_source":"35,70","pickup":"Trainingscenter DUS","destination":"Novotel DUS","customer":"Eurowings","company":"WT","arrival_flight":"","departure_flight":"","vehicle":"Pkw","persons":1,"flight_time_cell_raw":"","driver":"Sabrina","notes":""}]};
const originalPath=process.env.ATMS_P11442_LOCAL_ORIGINAL_IMAGE;
const img=originalPath ? fs.readFileSync(originalPath) : Buffer.from('P11442 CI synthetic photo placeholder','utf8');
if(originalPath) assert.strictEqual(createHash('sha256').update(img).digest('hex'),fixture.source_image_sha256);
const cryptoForSource=originalPath ? webcrypto : {
 subtle:{digest:async(name,raw)=>{
  assert.strictEqual(name,'SHA-256');
  return Uint8Array.from(Buffer.from(
   Buffer.compare(Buffer.from(raw),img)===0 ? fixture.source_image_sha256 : '0'.repeat(64),'hex')).buffer;
 }}
};
assert.strictEqual(fixture.rows.length,22);
const stage=code.slice(start,end);
let checks=0;
const tick=()=>checks++;
const getFns=(state,cryptoObj=webcrypto)=> {
 const context={state,crypto:cryptoObj,globalThis:{crypto:cryptoObj},cellText: v=> String(v??'').trim(),routeOcrText: v=> String(v??'').trim()};
 vm.runInNewContext(stage+';globalThis.extractFns={p11442OriginalOnlyResolve,p11442OriginalImageBoundedReconciliation,p11442OriginalRowContextIsExact,p11442VerifiedSourceBoundRouteProof,P11442_ORIGINAL_SHA256};',context);
 return context.globalThis.extractFns;
};
function sampleRows() {
 return fixture.rows.map((a,i)=>({
  sourceRow:i+2,sourceImageOcr:true,sourceFile:'97633.jpg',time:a.ride_time,
  pickup:a.pickup,destination:a.destination,customer:a.customer,company:a.company,
  arrivalFlight:a.arrival_flight,departureFlight:a.departure_flight,vehicle:a.vehicle,
  persons:a.persons,price:Number(a.price_eur_source.replace(',','.')),driver:a.driver,
  flightTime:a.flight_time_cell_raw,notes:a.notes,
  imageCellEvidence:{destination:{rawOcr:a.destination,manualCheckRequired:false},flightTime:{rawOcr:a.flight_time_cell_raw,manualCheckRequired:false}}
 }));
}
function makeBlockedRows(){const a=sampleRows();a[0].destination='Mariott Seestem DUS';a[0].destinationOcrConflict=true;a[0].destinationOcrConflictCandidate='Marriott Seestern DUS';a[0].imageCellEvidence.destination.rawOcr='Mariott Seestem DUS';a[12].flightTime='nicht';a[12].imageCellEvidence.flightTime.rawOcr='nicht';return a;}
const input=makeBlockedRows();
let output=getFns({}) .p11442OriginalOnlyResolve(input,true);
assert.strictEqual(output.length,22);tick();
assert.strictEqual(output[0].destination,'Marriott Seestern DUS');tick();
assert.strictEqual(output[0].destinationOcrConflict,false);tick();
assert.strictEqual(output[0].destinationP11442Proof.sourceRow,2);tick();
const proofFn=getFns({}).p11442VerifiedSourceBoundRouteProof;
assert.strictEqual(proofFn(output[0],'destination',output[0].imageCellEvidence.destination,'Mariott Seestem DUS','Marriott Seestern DUS'),true);tick();
for(const [key,p,source,final] of [
 ['differentField','pickup','Mariott Seestem DUS','Marriott Seestern DUS'],
 ['differentPrimary','destination','Mariott Seestem DUS X','Marriott Seestern DUS'],
 ['differentFinal','destination','Mariott Seestem DUS','Marriott Seestern DUS X']]) {
 assert.strictEqual(proofFn(output[0],p,output[0].imageCellEvidence.destination,source,final),false,key);tick();
}
for (const mutate of [
 r=>r.destinationP11442Proof.sourceSha256='0'.repeat(64),
 r=>r.destinationP11442Proof.sourceRow=12,
 r=>r.destinationOcrConflict=true,
 r=>r.driver='Lana',
 r=>r.imageCellEvidence.destination.rawOcr='Another location']) {
 const rr=JSON.parse(JSON.stringify(output[0])); mutate(rr);
 assert.strictEqual(proofFn(rr,'destination',rr.imageCellEvidence.destination,'Mariott Seestem DUS','Marriott Seestern DUS'),false);tick();
}

assert.strictEqual(output[12].flightTime,'');tick();
assert.strictEqual(output[12].notes,'2HK nicht');tick();
assert.strictEqual(output[12].flightTimeOriginalNoteOcr,'nicht');tick();
assert.strictEqual(output[12].flightTimeP11442NoteProof.sourceRow,14);tick();
assert.strictEqual(input[0].destination,'Mariott Seestem DUS');tick();
assert.strictEqual(input[12].flightTime,'nicht');tick();
for(let i=0;i<22;i++){
 assert.strictEqual(output[i].sourceRow,i+2);tick();
 if(i!==0 && i!==12)assert.deepStrictEqual(JSON.parse(JSON.stringify(output[i])),JSON.parse(JSON.stringify(input[i]))),tick();
}
assert.strictEqual(output[7].time,'13:15');tick();
assert.strictEqual(output[7].flightTime,'14:10');tick();
assert.notStrictEqual(output[10].sourceRow,output[16].sourceRow);tick();
assert.strictEqual(output[10].departureFlight,'EW9754');tick();
assert.strictEqual(output[16].departureFlight,'EW9754');tick();
// Absolutely no correction of either issue on unverified (different) image.
output=getFns({}).p11442OriginalOnlyResolve(input,false);
assert.deepStrictEqual(JSON.parse(JSON.stringify(output)),JSON.parse(JSON.stringify(input)));tick();
const mods=[
 ['route-other-primary',a=>a[0].destination='Mariott Seestern DUS'],
 ['route-other-secondary',a=>a[0].destinationOcrConflictCandidate='Marri0tt Seestern DUS'],
 ['route-secondary-missing',a=>delete a[0].destinationOcrConflictCandidate],
 ['route-no-conflict',a=>a[0].destinationOcrConflict=false],
 ['route-list-conflict',a=>a[0].destinationOcrConflictFromListConsensus=true],
 ['route-geometry-missing',a=>delete a[0].imageCellEvidence.destination.rawOcr],
 ['route-manual-blocker',a=>a[0].imageCellEvidence.destination.manualCheckRequired=true],
 ['route-other-driver',a=>a[0].driver='Lana'],
 ['route-other-flight',a=>a[0].arrivalFlight='A3841'],
 ['route-other-company',a=>a[0].company='GetE'],
 ['route-other-customer',a=>a[0].customer='Avlon'],
 ['route-other-vehicle',a=>a[0].vehicle='Van'],
 ['route-other-persons',a=>a[0].persons=2],
 ['route-other-price',a=>a[0].price=3500],
 ['route-other-time',a=>a[0].time='12:30'],
 ['route-other-pickup',a=>a[0].pickup='Novotel DUS'],
 ['route-destination-cellconflict',a=>a[0].destinationCellConflict=true],
 ['route-no-image-evidence',a=>delete a[0].imageCellEvidence.destination],
 ['note-other-flight-time',a=>a[12].flightTime='15:40'],
 ['note-missing-time',a=>a[12].flightTime=''],
 ['note-neighborword',a=>a[12].flightTime='nicht heute'],
 ['note-other-primary',a=>a[12].imageCellEvidence.flightTime.rawOcr='15:30'],
 ['note-primary-other',a=>a[12].imageCellEvidence.flightTime.rawOcr='nicht sicher'],
 ['note-uncertain',a=>a[12].flightTimeUncertain=true],
 ['note-conflict',a=>a[12].flightTimeOcrConflict=true],
 ['note-clock-conflict',a=>a[12].flightTimeCellConflict=true],
 ['note-glyph',a=>a[12].flightTimeSourceGlyphAmbiguity='15:307'],
 ['note-manual-blocker',a=>a[12].imageCellEvidence.flightTime.manualCheckRequired=true],
 ['note-other-driver',a=>a[12].driver='Sabrina'],
 ['note-other-flight',a=>a[12].departureFlight='OS167'],
 ['note-arrival-instead',a=>{a[12].arrivalFlight='OS166';a[12].departureFlight='';}],
 ['note-other-company',a=>a[12].company='Get-E'],
 ['note-other-customer',a=>a[12].customer='Avion'],
 ['note-other-vehicle',a=>a[12].vehicle='Van'],
 ['note-other-persons',a=>a[12].persons=7],
 ['note-other-price',a=>a[12].price=3500],
 ['note-other-time',a=>a[12].time='15:45'],
 ['note-other-pickup',a=>a[12].pickup='Holiday Inn DUS'],
 ['note-other-destination',a=>a[12].destination='Marriott Seestern DUS'],
 ['note-row-missing',a=>a.splice(12,1)],
 ['duplicate-row',a=>a[13].sourceRow=14],
 ['row-order',a=>{const t=a[12];a[12]=a[13];a[13]=t;}],
 ['synthetic-different-file',a=>a[12].sourceImageOcr=false],
];
for(const [name,modify] of mods){
 const x=makeBlockedRows();modify(x);const y=getFns({}).p11442OriginalOnlyResolve(x,true);
 if(name.startsWith('route-'))assert.strictEqual(y[0].destination,x[0].destination,name);
 if(name.startsWith('note-'))assert.strictEqual(y[12].flightTime,x[12].flightTime,name);
 if(['note-row-missing','duplicate-row','row-order','synthetic-different-file'].includes(name))assert.deepStrictEqual(JSON.parse(JSON.stringify(y)),JSON.parse(JSON.stringify(x)),name);
 tick();
}
for(const raw of ['2HK nicht','nicht']) {
 const x=makeBlockedRows();x[12].flightTime=raw; x[12].imageCellEvidence.flightTime.rawOcr=raw;
 const y=getFns({}).p11442OriginalOnlyResolve(x,true);
 assert.strictEqual(y[12].notes,'2HK nicht'); assert.strictEqual(y[12].flightTime,'');tick();tick();
}
// R2: P113.1 fixture-isolation and independently observed SAME-image peer quorum.
// Never promote a candidate based on the source row alone.
assert(!code.includes('Marriott Seestern DUS'));
tick();
for (const [name,edit] of [
  ['peer-quorum-missing', a=>{ for (const i of [7,15,20]) a[i].destination='Different location'; }],
  ['peer-quorum-conflicting', a=>{ for (const i of [7,15,20]) a[i].destinationOcrConflict=true; }],
  ['peer-quorum-cell-conflict', a=>{ for (const i of [7,15,20]) a[i].destinationCellConflict=true; }],
  ['peer-quorum-geometry-uncertain', a=>{ for (const i of [7,15,20]) a[i].imageCellEvidence.destination.manualCheckRequired=true; }],
  ['source-primary-mismatch', a=>{ a[0].imageCellEvidence.destination.rawOcr='Marriot Seestem DUS'; }],
  ['candidate-digit', a=>{ a[0].destinationOcrConflictCandidate='Marri0tt Seestern DUS'; }],
  ['candidate-distant', a=>{ a[0].destinationOcrConflictCandidate='Different location DUS'; for(const i of [1,7,15,20]) a[i].destination='Different location DUS'; }],
  ['candidate-final-token-changed', a=>{ a[0].destinationOcrConflictCandidate='Marriott Seestern CGN'; for(const i of [1,7,15,20]) a[i].destination='Marriott Seestern CGN'; }],
]) {
  const x=makeBlockedRows();edit(x);
  const y=getFns({}).p11442OriginalOnlyResolve(x,true);
  assert.strictEqual(y[0].destination,x[0].destination,name);
  assert.strictEqual(y[0].destinationOcrConflict,true,name);
  tick();
}

// Property protection: every other OCR field/row is byte-exactly unchanged.
const fkeys=Object.keys(input[1]);
for(const row of [1,2,3,4,5,6,7,8,9,10,11,13,14,15,16,17,18,19,20,21]){
 const before=JSON.stringify(input[row]);const after=JSON.stringify(getFns({}).p11442OriginalOnlyResolve(input,true)[row]);
 assert.strictEqual(after,before);tick();
}
(async()=>{
 const selected={name:'97633.jpg',arrayBuffer:async()=>img};
 const goodState={file:selected,files:[selected]};
 let res=await getFns(goodState,cryptoForSource).p11442OriginalImageBoundedReconciliation(makeBlockedRows());
 assert.strictEqual(res[0].destination,'Marriott Seestern DUS');tick();
 assert.strictEqual(res[12].notes,'2HK nicht');tick();
 const damaged=Buffer.from(img);damaged[Math.max(0,damaged.length-2)]^=1;
 const alteredFile={name:'97633.jpg',arrayBuffer:async()=>damaged};
 res=await getFns({file:alteredFile,files:[alteredFile]},cryptoForSource).p11442OriginalImageBoundedReconciliation(makeBlockedRows());
 assert.strictEqual(res[0].destination,'Mariott Seestem DUS');tick();
 assert.strictEqual(res[12].flightTime,'nicht');tick();
 res=await getFns(goodState,{}).p11442OriginalImageBoundedReconciliation(makeBlockedRows());
 assert.strictEqual(res[12].flightTime,'nicht');tick();
 res=await getFns({file:selected,files:[selected,selected]}).p11442OriginalImageBoundedReconciliation(makeBlockedRows());
 assert.strictEqual(res[0].destination,'Mariott Seestem DUS');tick();
 res=await getFns({file:alteredFile,files:[selected]}).p11442OriginalImageBoundedReconciliation(makeBlockedRows());
 assert.strictEqual(res[0].destination,'Mariott Seestem DUS');tick();
 res=await getFns({file:null,files:[]}).p11442OriginalImageBoundedReconciliation(makeBlockedRows());
 assert.strictEqual(res[0].destination,'Mariott Seestem DUS');tick();
 console.log('P11442 SOURCE-BOUND OCR SAFETY PASS; assertions='+checks+'; negative scenarios='+mods.length+'; image_sha_mode='+(originalPath?'REAL_SHA256':'SAFE_CI_FIXTURE'));
})().catch(e=>{console.error(e);process.exit(1)});
