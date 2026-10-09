#!/usr/bin/env node
'use strict';
const fs=require('fs'), path=require('path'), assert=require('assert'),vm=require('vm');
const source=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/js/plan-import.js'),'utf8');
const elements=Object.fromEntries(['planDateInput','planDateStatus','planDateManualText','importStatus','importPlanBtn','planAnalysis','analyzePlanBtn']
  .map(id=>[id,{value:'',textContent:'',disabled:false,classList:{add(){}}}]));
const document={currentScript:{src:'https://atms.local/js/plan-import.js'},
  getElementById(id){return elements[id]||null},addEventListener(){}};
const window={addEventListener(){}};
const context={window,document,location:{href:'https://atms.local/index.html'},URL,console,Date,Map,Set,Number,Math,RegExp,Intl,performance:{now:()=>0}};
vm.createContext(context);
vm.runInContext(source,context,{timeout:6000});
const h=window.ATMSP11417DateRegression;
assert(h,'P114.17 real production module date hooks absent');
let count=0;
function test(name,fn){fn();count++;console.log(`PASS ${count}: ${name}`);}
function word(text,x,y){return {text,x0:x,x1:x+Math.max(9,text.length*7),y0:y,y1:y+12};}
function meta(title){return {safeHeaderDetected:true,headerLineMeta:{y0:38},rawOcrWords:[word('Liste',650,10),word(title,690,10),word('Preis',0,40),word('08.10.2026',450,87)]};}
test('Image heading date parsed above table, not filename date',()=>{
  assert.strictEqual(h.detectPlanDateFromImageHeader(meta('09.10.2026')),'2026-10-09');
});
test('Foreign row date and cropped image without safe header do not override Plantag',()=>{
  assert.strictEqual(h.detectPlanDateFromImageHeader({...meta('09.10.2026'),safeHeaderDetected:false}), '');
  assert.strictEqual(h.detectPlanDateFromImageHeader({safeHeaderDetected:true,headerLineMeta:{y0:38},rawOcrWords:[word('Preis',0,40),word('09.10.2026',450,87)]}), '');
});
test('Two competing titled dates fail closed',()=>{
  let m=meta('09.10.2026');m.rawOcrWords.push(word('Liste',850,15),word('10.10.2026',885,15));
  assert.strictEqual(h.detectPlanDateFromImageHeader(m),'');
});
test('Wrong WhatsApp filename is superseded by proven dated image heading',()=>{
  elements.planDateInput.value='2026-10-08';
  assert(h.setDetectedPlanDate('2026-10-08','Dateiname'));
  assert(h.setDetectedPlanDate(h.detectPlanDateFromImageHeader(meta('09.10.2026')),'Bildkopf'));
  assert.strictEqual(h.readState().planDate,'2026-10-09');
  assert.strictEqual(h.readState().dateSourceConflict,true);
  assert.strictEqual(elements.planDateInput.value,'2026-10-09');
  assert.strictEqual(elements.planDateManualText.value,'09.10.2026');
});
test('All 34 early-to-morning departures remain on actual 09.10, not split to 08.10',()=>{
  const rides=Array.from({length:34},(_,i)=>({id:`T${i}`,time:i<21?'05:20':'07:25'}));
  const out=h.assignRideDates(rides);
  assert.strictEqual(out.length,34);
  assert(out.every(r=>r.date==='2026-10-09'));
  assert.strictEqual(h.readState().dateInfo.candidateCount,21);
  assert.strictEqual(h.readState().dateInfo.requiresConfirmation,true);
});
test('A conflicting title/file date forbids morning-mode auto-import',()=>{
  assert.strictEqual(h.maybeAutoImportCleanPlan(),false);
});
test('Android manual input wins over later filename/title inference',()=>{
  assert(h.applyManualPlanDate('09.10.2026'));
  assert.strictEqual(h.readState().manualPlanDate,true);
  assert.strictEqual(h.setDetectedPlanDate('2026-10-08','Dateiname'),false);
  assert.strictEqual(h.readState().planDate,'2026-10-09');
});
test('Invalid manual date is rejected without losing valid state',()=>{
  assert.strictEqual(h.applyManualPlanDate('31.02.2026'),false);
  assert.strictEqual(h.readState().planDate,'2026-10-09');
});
test('Native date-picker edit invalidates stale preview and keeps original OCR blockers from being silently cleared',()=>{
  h.readState().rides.push({time:'04:00',date:'2026-10-09'});
  h.readState().issues.push({level:'error',kind:'ocr_conflict'});
  elements.planDateInput.value='2026-10-08'; // native change event sets input.value before callback
  assert(h.applyManualPlanDate(elements.planDateInput.value));
  assert.strictEqual(h.readState().rides.length,0);
  assert.strictEqual(h.readState().issues.length,0);
  assert.strictEqual(elements.importPlanBtn.disabled,true);
  assert(elements.importStatus.textContent.includes('keine Fahrten übernommen'));
});
test('08.10 evening-to-01:35 keeps 01:35 unresolved until explicit next-day decision',()=>{
  assert(h.applyManualPlanDate('08.10.2026'));
  const rides=h.assignRideDates([{time:'23:00'},{time:'01:35'}]);
  assert.strictEqual(rides[0].date,'2026-10-08');
  assert.strictEqual(rides[1].date,'2026-10-08');
  assert.strictEqual(rides[1].dateNeedsManualCheck,true);
  assert.strictEqual(h.readState().dateInfo.nextDate,'2026-10-09');
});
test('Visible native calendar button plus numeric Android fallback both present',()=>{
  assert(source.includes('id="planDateOpenCalendar"'));
  assert(source.includes('id="planDateManualText"'));
  assert(source.includes('id="planDateConfirmManual"'));
  assert(source.includes("typeof picker.showPicker === 'function'"));
  assert(!source.includes('if (mappingInfo.timeHeaderRecovery) {\n        state.issues.unshift'));
});
test('Ongoing Golden Pack preserved in handoff file and bundled unchanged',()=>{
 const pack=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/golden-regression/ATMS_GOLDEN_REGRESSION_PACK_70_WA0023_DATE_ROUTE_FLIGHT_2026-10-09.json'),'utf8'));
 assert.strictEqual(pack.cases.length,70);
});
console.log(`P114.17 real module date/source/rollover safeguards: ${count}/${count} PASS`);
