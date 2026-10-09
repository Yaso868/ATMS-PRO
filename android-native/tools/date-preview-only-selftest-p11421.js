#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),src=fs.readFileSync(path.join(root,'app/src/main/assets/js/plan-import.js'),'utf8');
const html=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8');
const ids=['planDateInput','planDateStatus','planDateManualText','importStatus','importPlanBtn','planAnalysis','analyzePlanBtn','previewOnlyPlanBtn','jsonInput'];
const els=Object.fromEntries(ids.map(id=>[id,{value:'',textContent:'',disabled:false,classList:{add(){},remove(){}},addEventListener(){}}]));
const window={addEventListener(){},showToast(){}};
const document={currentScript:{src:'https://atms.local/js/plan-import.js'},getElementById(id){return els[id]||null;},addEventListener(){}};
const ctx={window,document,location:{href:'https://atms.local/'},URL,console,Date,Map,Set,Math,Number,RegExp,Intl,performance:{now:()=>0}};
vm.createContext(ctx);vm.runInContext(src,ctx,{timeout:8000});
const h=window.ATMSP11421PreviewRegression;
assert(h,'production preview-only hooks not registered');
assert(html.includes('id="previewOnlyPlanBtn"')&&html.includes('Nur Testanalyse'),'visible distinct preview button required');
assert(src.includes("$('previewOnlyPlanBtn')?.addEventListener('click', () => { state.previewOnlyAnalysis = true; void analyze(); })"),'preview-only button must call safe branch');
assert(src.includes("$('analyzePlanBtn')?.addEventListener('click', () => { state.previewOnlyAnalysis = false; void analyze(); })"),'normal production automation still available');
assert(src.includes('state.previewOnlyAnalysis || rides.length === 0'),'render must disable commit in preview');
assert(src.includes('if (state.previewOnlyAnalysis) return false;'),'preview-only must gate automatic pipeline');
assert(src.includes('if (!state.previewOnlyAnalysis) localStorage.setItem(PROFILE_KEY'),'preview must not update saved OCR profile');
let checks=0;const test=(name,fn)=>{fn();checks++;console.log('PASS '+checks+': '+name)};
const file={name:'IMG-20261008-WA0023.jpg',type:'image/jpeg'};
test('file-selected 08.10. then manual 09.10. updates displayed file selection to 09.10.',()=>{
 h.selectFiles([file]);
 assert(els.importStatus.textContent.includes('08.10.2026'));
 assert(h.applyManualPlanDate('09.10.2026'));
 assert(els.planDateStatus.textContent.includes('09.10.2026'));
 assert(els.importStatus.textContent.includes('Plantag 09.10.2026'));
 assert(!els.importStatus.textContent.includes('Plantag 08.10.2026'));
 assert.equal(h.readState().planDate,'2026-10-09');
});
test('manual date pre-selection not lost when WhatsApp filename supplies different day',()=>{
 h.selectFiles([file]);
 assert.equal(h.readState().planDate,'2026-10-09');
 assert(els.importStatus.textContent.includes('Plantag 09.10.2026'));
});
test('invalid date does not silently replace proven date',()=>{
 assert.equal(h.applyManualPlanDate('31.02.2026'),false);
 assert.equal(h.readState().planDate,'2026-10-09');
});
let authorizations=0, writes=0;
window.ATMSAuthorizeCleanPlanAutoImport=()=>{authorizations++;return {ok:true}};
window.applyImportedRides=()=>{writes++;return {count:1,historySaved:true}};
test('automatic Morgen pipeline is categorically refused for preview-only',()=>{
 const s=h.readState();s.previewOnlyAnalysis=true;s.rides=[{time:'08:15',driver:'Lana'}];s.issues=[];
 assert.equal(h.maybeAutoImportCleanPlan(),false);
 assert.equal(authorizations,0);
 assert.equal(s.autoPipelineInProgress,false);
});
(async()=>{
 await new Promise(r=>setImmediate(r));
 const v=await h.importRides({auto:true});
 assert.equal(v,false,'even auto import must refuse in preview');
 assert.equal(writes,0,'no calls to persistent applyImportedRides');
 assert(els.importStatus.textContent.includes('Keine Fahrten übernommen'));
 console.log('PASS '+(++checks)+': backend rejects preview auto import even with staged rides');
 const manual=await h.importRides({auto:false});
 assert.equal(manual,false,'manual import refused also');
 assert.equal(writes,0);
 console.log('PASS '+(++checks)+': backend rejects preview manual import');
 h.selectFiles([file]);
 assert.equal(h.readState().previewOnlyAnalysis,false);
 console.log('PASS '+(++checks)+': new selection clears preview state');
 assert.equal(els.previewOnlyPlanBtn.disabled,false);
 assert.equal(els.analyzePlanBtn.disabled,false);
 console.log('PASS '+(++checks)+': both analysis routes available after selecting a file');
 console.log(`P114.21 preview-only & date regression: ${checks}/${checks} PASS`);
})().catch(e=>{console.error(e);process.exit(1)});
