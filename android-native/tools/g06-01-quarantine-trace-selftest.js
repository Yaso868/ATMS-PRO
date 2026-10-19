#!/usr/bin/env node
'use strict';
// Local-only test harness. Never invokes analysis/import, real OCR, network or storage.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.join(__dirname,'..');
const file=path.join(root,'app/src/main/assets/js/plan-import.js');
const source=fs.readFileSync(file,'utf8');
const suffix="  document.addEventListener('DOMContentLoaded', init);\n})();";
assert(source.includes(suffix));
const exposed=source.replace(suffix,"  window.__G06TraceTest={g06QuarantineCapture,reconcileCompanyConflictAfterRepeatedConsistency,applyRepeatedTextConsistency,markZeroSilentErrorIntegrity,validate,state};\n})();");
let storageCalls=0, importCalls=0, networkCalls=0, checks=0;
const trap=()=>{storageCalls++;throw Error('STORAGE FORBIDDEN');};
const window={ATMSOcrIntegrityCore:require(path.join(root,'app/src/main/assets/js/ocr-integrity-core.js')),addEventListener(){},location:{href:'https://atms.invalid/'},applyImportedRides(){importCalls++;throw Error('IMPORT FORBIDDEN')},fetch(){networkCalls++;throw Error('NETWORK FORBIDDEN')}};
const ctx={console,window,document:{currentScript:{src:'https://atms.invalid/js/plan-import.js'},addEventListener(){},getElementById(){return {disabled:true};},createElement(){return {getContext(){return null;},style:{},addEventListener(){}}},body:{appendChild(){}}},location:{href:'https://atms.invalid/'},performance:{now:()=>0},setTimeout,clearTimeout,setInterval,clearInterval,Map,Set,WeakMap,Promise,Array,Object,Number,String,Boolean,Math,Date,RegExp,JSON,Intl,URL,Blob,FileReader:function(){},TextEncoder,TextDecoder,navigator:{},localStorage:{getItem:trap,setItem:trap,removeItem:trap},sessionStorage:{getItem:trap,setItem:trap,removeItem:trap},fetch(){networkCalls++;throw Error('NETWORK FORBIDDEN')},CustomEvent:function(){},Image:function(){},File:function(){}};
ctx.globalThis=ctx; vm.createContext(ctx); vm.runInContext(exposed,ctx);
const api=window.__G06TraceTest;
function check(name,fn){fn();checks++;console.log('PASS',name);}
const raw=JSON.parse(fs.readFileSync(path.join(root,'tools/fixtures/golden-regression/P11410_REALGERAET_FIRMENKONFLIKT_DIAGNOSE.json'),'utf8'));
assert.equal(raw.attempts.length,9);
const attempts=raw.attempts.map(a=>({...a,cropQuality:a.cropQuality?{...a.cropQuality}:undefined}));
for(const a of attempts){if(a.scope==='source_truth_adaptive_company'||a.scope==='source_truth_full_cell') {a.sourceRow=raw.sourceRow;a.sourceColumn=raw.sourceColumn;a.field='company';}}
const primary={...raw.primarySourceEvidence,sourceRow:raw.sourceRow,sourceColumn:raw.sourceColumn,cropQuality:{...raw.primarySourceEvidence.cropQuality}};
function prepared(list=attempts) {
 const ride={sourceRow:raw.sourceRow,sourceImageOcr:true,company:raw.originalValue,companyOcrConflict:true,
 companyOcrConflictCandidate:raw.secondaryValue,companyOcrEvidence:{tag:'g06_fixture'},
 imageCellEvidence:{company:{sourceColumn:raw.sourceColumn,verificationSource:raw.verificationSource,
  verificationAttempts:list,primarySourceEvidence:primary,manualCheckRequired:true}},
 companyTargetedOcrAttempts:list};
 return [ride,...Array.from({length:raw.peerCount},(_,i)=>({sourceRow:100+i,sourceImageOcr:true,company:raw.originalValue}))];
}
function flow(input){
 const consistent=api.applyRepeatedTextConsistency(input);
 api.g06QuarantineCapture('before_p11411_reconciliation',consistent);
 const reconciled=api.reconcileCompanyConflictAfterRepeatedConsistency(consistent);
 api.g06QuarantineCapture('after_p11411_reconciliation',reconciled);
 const gated=api.markZeroSilentErrorIntegrity(reconciled);
 const issues=api.validate(gated);
 api.g06QuarantineCapture('after_final_validation',gated,issues);
 api.g06QuarantineCapture('after_import_gate_render',gated,issues);
 return {gated,issues};
}
const original=prepared();
check('trace OFF by default',()=>{api.state.previewOnlyAnalysis=true; assert.strictEqual(api.g06QuarantineCapture('disabled',original),null);assert.strictEqual(api.state.g06QuarantineTrace,undefined)});
check('trace prohibited if previewOnly FALSE',()=>{window.__ATMS_G06_01_LOCAL_TEST_TRACE__=true; api.state.previewOnlyAnalysis=false;assert.strictEqual(api.g06QuarantineCapture('unsafe',original),null);assert.strictEqual(api.state.g06QuarantineTrace,undefined)});
api.state.previewOnlyAnalysis=true;
const good=flow(original);
check('known nine attempts resolve in recorded functional replay',()=>{assert.strictEqual(good.gated[0].companyOcrConflict,false);assert.strictEqual(good.gated[0].companyOcrConflictResolvedAfterRepeatedConsistency,true)});
check('four distinct trace stages',()=>{assert.deepStrictEqual(Array.from(api.state.g06QuarantineTrace,x=>x.stage),['before_p11411_reconciliation','after_p11411_reconciliation','after_final_validation','after_import_gate_render'])});
check('trace before remains immutable after reconciliation',()=>{assert.strictEqual(api.state.g06QuarantineTrace[0].rides[0].companyOcrConflict,true);assert.strictEqual(api.state.g06QuarantineTrace[1].rides[0].companyOcrConflict,false)});
check('all nine attempts and source row/column captured in full',()=>{const a=api.state.g06QuarantineTrace[0].rides[0].imageCellEvidenceCompany.verificationAttempts;assert.strictEqual(a.length,9);assert.strictEqual(a.filter(x=>x.scope==='source_truth_adaptive_company'&&x.sourceRow===raw.sourceRow&&x.sourceColumn===raw.sourceColumn).length,2)});
check('primary OCR birth-record captured',()=>{const p=api.state.g06QuarantineTrace[0].rides[0].imageCellEvidenceCompany.primarySourceEvidence;assert.strictEqual(p.rawOcr,raw.originalValue);assert.strictEqual(p.sourceRow,raw.sourceRow);assert.strictEqual(p.sourceColumn,raw.sourceColumn)});
check('untruncated attempts (48) preserved',()=>{const big=prepared(Array.from({length:48},(_,i)=>({...attempts[i%9],mode:`mode_${i}`})));api.g06QuarantineCapture('untruncated',big);assert.strictEqual(api.state.g06QuarantineTrace.at(-1).rides[0].imageCellEvidenceCompany.verificationAttempts.length,48)});
check('trace contains diagnostic of final validation without rerunning checks',()=>{const out=api.state.g06QuarantineTrace.find(x=>x.stage==='after_final_validation').rides[0]; assert(Array.isArray(out.validationIssues));assert(!out.validationIssues.some(x=>x.level==='error'&&/Firma/.test(x.text)))});
check('trace capture alone never mutates OCR evidence',()=>{const probe=prepared();const before=JSON.stringify(probe);api.g06QuarantineCapture('immutability_probe',probe);assert.strictEqual(JSON.stringify(probe),before)});
const broken=prepared(attempts.map(a=>{const c={...a}; if(c.scope==='source_truth_adaptive_company')delete c.sourceRow;return c;}));
api.state.g06QuarantineTrace=[]; const blocked=flow(broken);
check('missing adaptive provenance remains blocked',()=>{assert.strictEqual(blocked.gated[0].companyOcrConflict,true);assert(blocked.issues.some(x=>x.level==='error'&&/Firma/.test(x.text)))});
check('blocked final validation is visible in full trace',()=>{const final=api.state.g06QuarantineTrace.find(x=>x.stage==='after_final_validation').rides[0];assert.strictEqual(final.companyOcrConflict,true);assert(final.validationIssues.some(x=>x.level==='error'&&/Firma/.test(x.text)))});
const oppose=prepared(attempts.concat([{scope:'source_truth_full_cell',mode:'independent',candidate:raw.secondaryValue,sourceRow:raw.sourceRow,sourceColumn:raw.sourceColumn,field:'company',cropQuality:attempts.find(x=>x.scope==='source_truth_full_cell').cropQuality}]));
api.state.g06QuarantineTrace=[];const refused=flow(oppose);
check('trusted independent opposition remains blocked',()=>{assert.strictEqual(refused.gated[0].companyOcrConflict,true);assert(refused.issues.some(x=>x.level==='error'&&/Firma/.test(x.text)))});
check('no storage/import/network interfaces called',()=>{assert.strictEqual(storageCalls,0);assert.strictEqual(importCalls,0);assert.strictEqual(networkCalls,0)});
check('no trace-window export and quarantine marker required',()=>{assert.strictEqual(window.__ATMSG06LocalTrace,undefined);assert(source.includes("window.__ATMS_G06_01_LOCAL_TEST_TRACE__ === true"));assert(source.includes('state.previewOnlyAnalysis === true'))});
check('instrumentation is wired before/after reconciliation and final validation',()=>{
 const i=source.indexOf("g06QuarantineCapture('before_p11411_reconciliation', preparedRides)");
 const j=source.indexOf("p54MeasureSync('company_conflict_post_consensus'");
 const k=source.indexOf("g06QuarantineCapture('after_p11411_reconciliation', preparedRides)");
 const v=source.indexOf("g06QuarantineCapture('after_final_validation', state.rides, state.issues)");
 assert(i>=0&&i<j&&j<k&&k<v);
});

// P11434 local adapter regressions: strict provenance on the same nine recorded OCR attempts.
function clonedAttempts() { return attempts.map(a=>({...a,cropQuality:a.cropQuality?{...a.cropQuality}:undefined})); }
function mustBlock(label,make) {
  const probe=prepared(make(clonedAttempts()));
  const r=flow(probe);
  check(label,()=>{assert.strictEqual(r.gated[0].companyOcrConflict,true);assert(r.issues.some(x=>x.level==='error'&&/Firma/.test(x.text)));});
}
check('all qualified full-cell source views are explicitly bound to original cell',()=>{
 assert.equal(attempts.filter(a=>a.scope==='source_truth_full_cell'&&a.sourceRow===raw.sourceRow&&a.sourceColumn===raw.sourceColumn&&a.field==='company').length,2);
});
mustBlock('P11434 full-cell source row missing blocks',a=>a.map(x=>{if(x.scope==='source_truth_full_cell')delete x.sourceRow;return x;}));
mustBlock('P11434 full-cell source column missing blocks',a=>a.map(x=>{if(x.scope==='source_truth_full_cell')delete x.sourceColumn;return x;}));
mustBlock('P11434 full-cell source row mismatch blocks',a=>a.map(x=>x.scope==='source_truth_full_cell'?{...x,sourceRow:raw.sourceRow+1}:x));
mustBlock('P11434 full-cell source column mismatch blocks',a=>a.map(x=>x.scope==='source_truth_full_cell'?{...x,sourceColumn:raw.sourceColumn+1}:x));
mustBlock('P11434 full-cell clipped glyph blocks',a=>a.map(x=>x.scope==='source_truth_full_cell'?{...x,cropQuality:{...x.cropQuality,rightEdgeClipped:true}}:x));
mustBlock('P11434 full-cell neighbor bleed blocks',a=>a.map(x=>x.scope==='source_truth_full_cell'?{...x,cropQuality:{...x.cropQuality,neighborColumnIncluded:true}}:x));
mustBlock('P11434 full-cell geometry uncertainty blocks',a=>a.map(x=>x.scope==='source_truth_full_cell'?{...x,cropQuality:{...x.cropQuality,targetCellGeometryConfirmed:false}}:x));
mustBlock('P11434 qualified opposing cell blocks',a=>a.concat([{...a.find(x=>x.scope==='source_truth_full_cell'),mode:'independent-counterproof',candidate:raw.secondaryValue}]));
check('P11434 original OCR truth and all nine candidates unchanged',()=>{
 assert.strictEqual(raw.attempts.length,9);
 assert.strictEqual(attempts.length,9);
 for(let i=0;i<9;i++)assert.strictEqual(attempts[i].candidate,raw.attempts[i].candidate);
});
check('P11434 all traces remain read-only after repeated negative regressions',()=>{assert.strictEqual(storageCalls,0);assert.strictEqual(importCalls,0);assert.strictEqual(networkCalls,0)});
console.log('G06-01 LOCAL TRACE:',checks+'/'+checks,'PASS; storage='+storageCalls+', import='+importCalls+', network='+networkCalls);
