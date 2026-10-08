#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.join(__dirname,'..');
const core=require(path.join(root,'app','src','main','assets','js','ocr-integrity-core.js'));
let source=fs.readFileSync(path.join(root,'app','src','main','assets','js','plan-import.js'),'utf8');
const end="  document.addEventListener('DOMContentLoaded', init);\n})();";
source=source.replace(end,"  window.__P1146Test=Object.freeze({applyRepeatedTextConsistency,reconcileCompanyConflictAfterRepeatedConsistency,markZeroSilentErrorIntegrity,edgeTableGlyphNoise,singleInternalCompanyDelimiterLoss});\n})();");
const sandbox={console,window:{ATMSOcrIntegrityCore:core,addEventListener(){},removeEventListener(){},dispatchEvent(){},location:{href:'https://atms.test/'}},document:{currentScript:{src:'https://atms.test/js/plan-import.js'},addEventListener(){},getElementById(){return null;},createElement(){return {getContext(){return null;},style:{},addEventListener(){}};},body:{appendChild(){}}},location:{href:'https://atms.test/'},performance:{now:()=>0},setTimeout,clearTimeout,setInterval,clearInterval,Map,Set,WeakMap,Promise,Array,Object,Number,String,Boolean,Math,Date,RegExp,JSON,Intl,URL,Blob,FileReader:function(){},TextEncoder,TextDecoder,navigator:{},localStorage:{getItem(){return null;},setItem(){},removeItem(){}},sessionStorage:{getItem(){return null;},setItem(){},removeItem(){}},CustomEvent:function(){},Image:function(){},File:function(){}};
sandbox.globalThis=sandbox;vm.createContext(sandbox);vm.runInContext(source,sandbox);const api=sandbox.window.__P1146Test;assert(api);

const basePeers = Array.from({length:8},(_,i)=>({sourceRow:i+2,company:'Get-E'}));
// Real P114.5 ordering failure: conflict already exists before repeated consistency.
const cases=['| Get-E','| Get-E |','| Get-E |','Get-E |','| Get-E |','| Get-E |','| Get-E |','Get-E |'];
let rides=basePeers.map((r,i)=>({...r,companyOcrConflict:true,companyOcrConflictCandidate:cases[i],imageCellEvidence:{company:{manualCheckRequired:true}}}));
// Add the delimiter-loss row in its pre-consensus form.
rides.push({sourceRow:17,company:'GetE',companyOcrConflict:true,companyOcrConflictCandidate:'GetE',imageCellEvidence:{company:{manualCheckRequired:true,verificationAttempts:[]}}});
// Add extra exact current peers to ensure unique repeated majority.
rides.push({sourceRow:40,company:'Get-E'},{sourceRow:41,company:'Get-E'},{sourceRow:42,company:'Get-E'});
let afterConsensus=api.applyRepeatedTextConsistency(rides);
const delimiter=afterConsensus.find(r=>r.sourceRow===17);
assert.strictEqual(delimiter.company,'Get-E','repeated consistency must first resolve GetE -> Get-E');
assert.strictEqual(delimiter.repeatedTextConsistency?.company?.from,'GetE');
assert(Number(delimiter.repeatedTextConsistency?.company?.evidenceCount||0)>=3);
let resolved=api.reconcileCompanyConflictAfterRepeatedConsistency(afterConsensus);
for(const row of [2,3,4,5,6,7,8,9]) assert.strictEqual(resolved.find(r=>r.sourceRow===row).companyOcrConflict,false,`table-rule stale conflict remained row ${row}`);
assert.strictEqual(resolved.find(r=>r.sourceRow===17).companyOcrConflict,false,'delimiter-loss stale conflict remained');

// Semantic alternatives remain blocked.
for(const bad of ['Get-A','Get E','GetX','Get|E','X Get-E','Get-E X']) {
  const rr=[{sourceRow:1,company:'Get-E',companyOcrConflict:true,companyOcrConflictCandidate:bad},{sourceRow:2,company:'Get-E'},{sourceRow:3,company:'Get-E'},{sourceRow:4,company:'Get-E'}];
  const out=api.reconcileCompanyConflictAfterRepeatedConsistency(rr);
  assert.strictEqual(out[0].companyOcrConflict,true,`semantic conflict incorrectly cleared: ${bad}`);
}

// Non-hyphenated company names never use this narrow reconciler.
{
  const rr=[{sourceRow:1,company:'Eurowings',companyOcrConflict:true,companyOcrConflictCandidate:'| Eurowings |'},{sourceRow:2,company:'Eurowings'},{sourceRow:3,company:'Eurowings'}];
  assert.strictEqual(api.reconcileCompanyConflictAfterRepeatedConsistency(rr)[0].companyOcrConflict,true);
}

// Delimiter loss needs explicit recorded consensus provenance.
{
  const rr=[{sourceRow:1,company:'Get-E',companyOcrConflict:true,companyOcrConflictCandidate:'GetE',repeatedTextConsistency:{company:{from:'GetE',to:'Get-E',evidenceCount:2}}},{sourceRow:2,company:'Get-E'},{sourceRow:3,company:'Get-E'},{sourceRow:4,company:'Get-E'}];
  assert.strictEqual(api.reconcileCompanyConflictAfterRepeatedConsistency(rr)[0].companyOcrConflict,true);
}
// Two exact-cell views for the delimiter-less candidate keep fail-closed.
{
  const rr=[{sourceRow:1,company:'Get-E',companyOcrConflict:true,companyOcrConflictCandidate:'GetE',repeatedTextConsistency:{company:{from:'GetE',to:'Get-E',evidenceCount:4}},imageCellEvidence:{company:{verificationAttempts:[{scope:'cell_view',candidate:'GetE'},{scope:'cell_view',candidate:'GetE'}]}}},{sourceRow:2,company:'Get-E'},{sourceRow:3,company:'Get-E'},{sourceRow:4,company:'Get-E'}];
  assert.strictEqual(api.reconcileCompanyConflictAfterRepeatedConsistency(rr)[0].companyOcrConflict,true);
}


// Zero-silent gate must stay green after a reconciled company conflict.
{
  const rr=[
    {sourceRow:1,sourceImageOcr:true,customer:'Avion',company:'Get-E',companyOcrConflict:true,companyOcrConflictCandidate:'| Get-E |',imageCellEvidence:{company:{rawOcr:'Get-E',manualCheckRequired:true}}},
    {sourceRow:2,sourceImageOcr:true,customer:'Avion',company:'Get-E',imageCellEvidence:{company:{rawOcr:'Get-E'}}},
    {sourceRow:3,sourceImageOcr:true,customer:'Avion',company:'Get-E',imageCellEvidence:{company:{rawOcr:'Get-E'}}}
  ];
  const reconciled=api.reconcileCompanyConflictAfterRepeatedConsistency(rr);
  const gated=api.markZeroSilentErrorIntegrity(reconciled);
  assert.strictEqual(gated[0].companyOcrConflict,false);
  assert.strictEqual(gated[0].importIntegrityStatus,'ok');
}

console.log('P114.6 post-consensus stale company conflict reconciliation self-test: PASS');
