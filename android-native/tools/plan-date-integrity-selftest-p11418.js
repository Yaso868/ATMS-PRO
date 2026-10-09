#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/js/plan-import.js'),'utf8');
const ids=['planDateInput','planDateStatus','planDateManualText','importStatus','importPlanBtn','planAnalysis','analyzePlanBtn','jsonInput'];
const els=Object.fromEntries(ids.map(id=>[id,{value:'',textContent:'',disabled:false,classList:{add() {}, remove() {}}}]));
const window={addEventListener(){}};
const document={currentScript:{src:'https://atms.local/js/plan-import.js'},getElementById(id){return els[id]||null;},addEventListener(){}};
const ctx={window,document,location:{href:'https://atms.local/index.html'},URL,console,Date,Map,Set,Math,Number,RegExp,Intl,performance:{now:()=>0}};
vm.createContext(ctx);vm.runInContext(source,ctx,{timeout:7000});
const h=window.ATMSP11418Regression;assert(h,'production P11418 hooks absent');
let n=0;function test(name,fn){fn();console.log(`PASS ${++n}: ${name}`);}
function file(name){return {name,type:'image/jpeg'};}
const at=(times)=>times.map((time,i)=>({id:String(i),time}));
test('Manually confirmed 09 Oct survives 08 Oct WhatsApp filename at actual file selection',()=>{
 assert(h.applyManualPlanDate('09.10.2026'));
 h.selectFiles([file('IMG-20261008-WA0023.jpg')]);
 assert.strictEqual(h.readState().planDate,'2026-10-09');
 assert.strictEqual(h.readState().manualPlanDate,true);
 assert.strictEqual(h.readState().filenamePlanDate,'2026-10-08');
 assert(els.importStatus.textContent.includes('09.10.2026'));
});
test('After file selection, 34 early/morning 09 October rides need NO rollover review',()=>{
 const out=h.assignRideDates(at([...Array(21).fill('05:15'),...Array(13).fill('08:25')]));
 assert(out.every(x=>x.date==='2026-10-09' && !x.dateNeedsManualCheck));
 assert.strictEqual(h.readState().dateInfo.candidateCount,0);
 assert.strictEqual(h.readState().dateInfo.requiresConfirmation,false);
});
test('08 Oct 23:00 and 09 Oct 01:35 remains manual crossover candidate',()=>{
 assert(h.applyManualPlanDate('08.10.2026'));
 const out=h.assignRideDates(at(['22:30','23:00','01:35','05:50']));
 assert(out.slice(2).every(x=>x.dateNeedsManualCheck));
 assert(out.slice(0,2).every(x=>!x.dateNeedsManualCheck));
 assert.strictEqual(h.readState().dateInfo.candidateCount,2);
 assert.strictEqual(h.readState().dateInfo.requiresConfirmation,true);
});
test('Unordered previous-evening/early-morning still triggers review',()=>{
 const out=h.assignRideDates(at(['01:35','23:00','04:50']));
 assert(out[0].dateNeedsManualCheck && out[2].dateNeedsManualCheck);
});
test('Without verified title or manual Plantag, early clock remains fail closed',()=>{
 h.readState().manualPlanDate=false;h.readState().headerPlanDate='';
 const out=h.assignRideDates(at(['01:35','08:25']));
 assert(out[0].dateNeedsManualCheck);
});
test('Contradictory manual date and independent header preserves manual date but blocks autoimport',()=>{
 h.applyManualPlanDate('09.10.2026');h.setDetectedPlanDate('2026-10-08','Bildkopf');
 assert.strictEqual(h.readState().planDate,'2026-10-09');
 assert.strictEqual(h.readState().dateSourceConflict,true);
 assert.strictEqual(window.ATMSP11417DateRegression.maybeAutoImportCleanPlan(),false);
});
test('Trusted matching title and manual date avoids false warning without late-evening clock',()=>{
 h.setDetectedPlanDate('2026-10-09','Bildkopf');
 const out=h.assignRideDates(at(['01:35','05:50','07:20']));
 assert(out.every(x=>!x.dateNeedsManualCheck));
});
const exampleRides=[
 {pickup:'Marriott Seestern DUS',destination:'DUS Airport'},
 {pickup:'Marriott Seestern DUS',destination:'DUS Airport'},
 {pickup:'Marriott Seestern DUS',destination:'DUS Airport'}
];
const row={y0:150,y1:198};
const meta={rawOcrWords:[{text:'Marriott',x0:400,x1:535,y0:164,y1:192,confidence:93}]};
test('True left matrix clipping with two route peers keeps strong full-image route',()=>{
 const proof=h.provenRouteLeftClipAtMatrixBoundary('Marriott Seestern DUS','Seestern DUS',meta,row,436,831,exampleRides,exampleRides[0],'pickup');
 assert(proof && proof.peers===2 && proof.reason==='verified_primary_left_clip_of_secondary');
});
test('Different real route, missing confidence or non-clipped prefix are vetoed',()=>{
 for (const candidate of ['Seestern Köln','Marriott Seestern','DUS'])
   assert.strictEqual(h.provenRouteLeftClipAtMatrixBoundary('Marriott Seestern DUS',candidate,meta,row,436,831,exampleRides,exampleRides[0],'pickup'),null);
 assert.strictEqual(h.provenRouteLeftClipAtMatrixBoundary('Marriott Seestern DUS','Seestern DUS',{rawOcrWords:[{...meta.rawOcrWords[0],confidence:60}]},row,436,831,exampleRides,exampleRides[0],'pickup'),null);
 assert.strictEqual(h.provenRouteLeftClipAtMatrixBoundary('Marriott Seestern DUS','Seestern DUS',meta,row,436,831,exampleRides,exampleRides[0],'pickup',['Andere Route']),null);
});
const attempts=[1,2,3].flatMap((crop)=>['single-block','single-line','single-word'].map(mode=>({crop,mode,rawText:crop===1?'EWS9420':'EW9420'})));
test('6 exact crop/mode views + unanimous numeric tail permit strict doubled-damage OCR',()=>{
 assert(h.doubleGlyphLongPrefixShape('EWS8420','EW9420'));
 const proof=h.strictDoubleGlyphLongPrefixProof('EWS8420','EW9420',attempts);
 assert(proof && proof.supportingViews===6 && proof.crops===2);
});
test('Competing numeric reading or insufficient crop independence stays blocked',()=>{
 assert.strictEqual(h.strictDoubleGlyphLongPrefixProof('EWS8420','EW9420',attempts.map((a,i)=>i===0?{...a,rawText:'EWS8420'}:a)),null);
 assert.strictEqual(h.strictDoubleGlyphLongPrefixProof('EWS8420','EW9420',attempts.slice(3,6)),null);
 assert.strictEqual(h.strictDoubleGlyphLongPrefixProof('EWS8420','EW9420',attempts.map((a,i)=>({...a,crop:1}))),null);
 assert(!h.doubleGlyphLongPrefixShape('EW8420','EW9420'));
});
test('Golden Regression Pack holds 70 unchanged baseline fixtures',()=>{
 const pack=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/golden-regression/ATMS_GOLDEN_REGRESSION_PACK_70_WA0023_DATE_ROUTE_FLIGHT_2026-10-09.json'),'utf8'));
 assert.strictEqual(pack.cases.length,70);
});
test('Golden 72 extends unchanged 70 base and retains unresolved GE-67',()=>{
 const dir=path.join(__dirname,'fixtures/golden-regression');
 const prior=JSON.parse(fs.readFileSync(path.join(dir,'ATMS_GOLDEN_REGRESSION_PACK_70_WA0023_DATE_ROUTE_FLIGHT_2026-10-09.json'),'utf8'));
 const next=JSON.parse(fs.readFileSync(path.join(dir,'ATMS_GOLDEN_REGRESSION_PACK_72_P11418_DATE_PRIORITY_MIDNIGHT_2026-10-09.json'),'utf8'));
 assert.strictEqual(next.cases.length,72);
 assert.strictEqual(JSON.stringify(next.cases.slice(0,70)),JSON.stringify(prior.cases));
 assert(next.cases.some(x=>String(x.id).includes('REIMPORT-DRIVER-CHANGE-DUPLICATE')));
 assert.strictEqual(new Set(next.cases.map(x=>x.id)).size,72);
});
console.log(`P114.18 targeted production-module regression: ${n}/${n} PASS`);
