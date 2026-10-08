#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.join(__dirname,'..');
const core=require(path.join(root,'app','src','main','assets','js','ocr-integrity-core.js'));
let source=fs.readFileSync(path.join(root,'app','src','main','assets','js','plan-import.js'),'utf8');
const end="  document.addEventListener('DOMContentLoaded', init);\n})();";
source=source.replace(end,"  window.__P1147Test=Object.freeze({applyRepeatedTextConsistency,reconcileCompanyConflictAfterRepeatedConsistency,markZeroSilentErrorIntegrity,validate,edgeTableGlyphNoise,singleInternalCompanyDelimiterLoss});\n})();");
const sandbox={console,window:{ATMSOcrIntegrityCore:core,addEventListener(){},removeEventListener(){},dispatchEvent(){},location:{href:'https://atms.test/'}},document:{currentScript:{src:'https://atms.test/js/plan-import.js'},addEventListener(){},getElementById(){return null;},createElement(){return {getContext(){return null;},style:{},addEventListener(){}};},body:{appendChild(){}}},location:{href:'https://atms.test/'},performance:{now:()=>0},setTimeout,clearTimeout,setInterval,clearInterval,Map,Set,WeakMap,Promise,Array,Object,Number,String,Boolean,Math,Date,RegExp,JSON,Intl,URL,Blob,FileReader:function(){},TextEncoder,TextDecoder,navigator:{},localStorage:{getItem(){return null;},setItem(){},removeItem(){}},sessionStorage:{getItem(){return null;},setItem(){},removeItem(){}},CustomEvent:function(){},Image:function(){},File:function(){}};
sandbox.globalThis=sandbox;vm.createContext(sandbox);vm.runInContext(source,sandbox);const api=sandbox.window.__P1147Test;assert(api);


// Real production order: earlier text-OCR conflict -> repeated-text consensus ->
// post-consensus reconciler -> zero-silent-error gate. Synthetic input models the
// post-OCR ride evidence; the actual unmodified production functions are executed.
const strongCell=(raw='Get-E',confidence=93,changes={})=>({
  rawOcr:raw,confidence,verificationSource:'primary_full_image_cell_assignment',
  manualCheckRequired:true,
  cropQuality:{fullCellIncluded:true,leftEdgeClipped:false,rightEdgeClipped:false,neighborColumnIncluded:false},
  verificationAttempts:[],...changes
});
const full=(candidate,mode,scope='source_truth_full_cell')=>({scope,field:'company',candidate,mode,cropQuality:{fullCellIncluded:true,neighborColumnIncluded:false,leftEdgeClipped:false,rightEdgeClipped:false}});
const cell=(candidate,mode)=>({scope:'cell_view',candidate,mode});
function pipeline({primary='Get-E',secondary='GetE',peers=8,companyEvidence=strongCell(),extra={},peerValue='Get-E'}){
  const r=[{sourceRow:17,sourceImageOcr:true,customer:'Test',company:primary,companyOcrConflict:true,companyOcrConflictCandidate:secondary,
    imageCellEvidence:{company:companyEvidence},...extra}];
  for(let i=0;i<peers;i++) r.push({sourceRow:i+20,company:peerValue,sourceImageOcr:true,customer:'Test',imageCellEvidence:{company:strongCell(peerValue,94,{manualCheckRequired:false})}});
  const consistent=api.applyRepeatedTextConsistency(r);
  const afterConsistency=consistent[0];
  const reconciled=api.reconcileCompanyConflictAfterRepeatedConsistency(consistent);
  const gate=api.markZeroSilentErrorIntegrity(reconciled);
  const companyErrors=api.validate(gate).filter(item=>item.level==='error' && item.kind==='text_ocr' && /Firma/.test(item.text));
  return {row:reconciled[0],gate:gate[0],record:afterConsistency.repeatedTextConsistency?.company||null,companyErrors};
}
let positive=0,negative=0;
function allowed(name,args){
  const {row,gate,companyErrors}=pipeline(args);
  assert.strictEqual(row.company,'Get-E',name+' primary must remain intact');
  assert.strictEqual(row.companyOcrConflict,false,name+' should clear stale conflict');
  assert.strictEqual(companyErrors.length,0,name+' must have no company blocking errors');
  assert.strictEqual(row.companyOcrSecondaryEdgeNoiseIgnored,true,name+' provenance');
  positive++; console.log('POSITIVE PASS:',name);
}
function blocked(name,args){
  const {row,gate,companyErrors}=pipeline(args);
  assert.strictEqual(row.companyOcrConflict,true,name+' conflict must remain');
  assert(companyErrors.length>0,name+' final validate() must block the unresolved company conflict');
  negative++; console.log('FAIL-CLOSED PASS:',name);
}
allowed('already correct high-confidence full-image primary',{primary:'Get-E',secondary:'GetE'});
allowed('already correct 2 independent complete-cell views',{primary:'Get-E',secondary:'GetE',companyEvidence:strongCell('',null,{verificationAttempts:[full('Get-E','original'),full('Get-E','grayscale')]})});
allowed('already correct 2 edge-expanded source views',{primary:'Get-E',secondary:'GetE',companyEvidence:strongCell('',null,{verificationAttempts:[full('Get-E','original','source_truth_edge_expanded'),full('Get-E','grayscale','source_truth_edge_expanded')]})});
allowed('existing P1146 repeated-consensus correction',{primary:'GetE',secondary:'GetE',companyEvidence:strongCell('GetE',67,{cropQuality:{fullCellIncluded:false}})});
blocked('no primary evidence',{primary:'Get-E',secondary:'GetE',companyEvidence:strongCell('',null)});
blocked('unverified raw primary source',{companyEvidence:strongCell('Get-E',92,{verificationSource:'secondary_cropped'})});
blocked('weak raw primary confidence',{companyEvidence:strongCell('Get-E',79)});
blocked('missing confidence',{companyEvidence:strongCell('Get-E',null)});
blocked('clipped full-image cell',{companyEvidence:strongCell('Get-E',99,{cropQuality:{fullCellIncluded:false,leftEdgeClipped:true,rightEdgeClipped:false,neighborColumnIncluded:false}})});
blocked('neighbor bleed',{companyEvidence:strongCell('Get-E',99,{cropQuality:{fullCellIncluded:true,leftEdgeClipped:false,rightEdgeClipped:false,neighborColumnIncluded:true}})});
blocked('only 2 peers',{peers:2});
blocked('independent cell views support secondary',{companyEvidence:strongCell('Get-E',95,{verificationAttempts:[cell('GetE','plain'),cell('GetE','threshold')]})});
blocked('two full-cell views support secondary',{companyEvidence:strongCell('Get-E',95,{verificationAttempts:[full('GetE','plain'),full('GetE','grayscale')]})});
blocked('two expanded views support secondary',{companyEvidence:strongCell('Get-E',95,{verificationAttempts:[full('GetE','plain','source_truth_edge_expanded'),full('GetE','grayscale','source_truth_edge_expanded')]})});
for(const alternative of ['Get-A','Get E','GetX','Get|E','X Get-E','Get-E X','GEtA']){
 blocked('semantic alternative '+alternative,{secondary:alternative});
}
blocked('different primary peer value',{peerValue:'Get-A'});
blocked('nonhyphenated company',{primary:'Avion',secondary:'AvionX',peerValue:'Avion',companyEvidence:strongCell('Avion',96)});
blocked('mixed evidence no independent quorum',{companyEvidence:strongCell('',null,{verificationAttempts:[full('Get-E','single')]})});

// Persistent Golden pack must never lose this latest real-device error.
const manifest=JSON.parse(fs.readFileSync(path.join(root,'tools/fixtures/golden-regression/ATMS_GOLDEN_REGRESSION_PACK_FINAL_manifest.json'),'utf8'));
const goldenCase=manifest.cases.find(c=>c.id==='GE-20261007-WA0001-R17-PRIMARY-ALREADY-CORRECT-P1146');
assert(goldenCase && goldenCase.previousActual?.importBlocked===true && goldenCase.expected?.importBlockedByTextConflict===false);
assert.strictEqual(manifest.summary.caseRecords,manifest.cases.length);
assert.strictEqual(manifest.p1147.realDeviceProofPending,true);

console.log(`P114.7 REAL-PIPELINE primary-correct & fail-closed matrix: ${positive} positive / ${negative} negative PASS`);
