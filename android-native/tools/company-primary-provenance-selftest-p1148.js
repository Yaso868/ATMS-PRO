#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.join(__dirname,'..');
const core=require(path.join(root,'app/src/main/assets/js/ocr-integrity-core.js'));
let source=fs.readFileSync(path.join(root,'app/src/main/assets/js/plan-import.js'),'utf8');
const end="  document.addEventListener('DOMContentLoaded', init);\n})();";
assert(source.includes(end));
source=source.replace(end,"  window.__P1148Test={imageCellEvidenceForRide,applyRepeatedTextConsistency,reconcileCompanyConflictAfterRepeatedConsistency,markZeroSilentErrorIntegrity,validate};\n})();");
const sandbox={console,window:{ATMSOcrIntegrityCore:core,addEventListener(){},removeEventListener(){},dispatchEvent(){},location:{href:'https://atms.test/'}},document:{currentScript:{src:'https://atms.test/js/plan-import.js'},addEventListener(){},getElementById(){return null;},createElement(){return {getContext(){return null;},style:{},addEventListener(){}};},body:{appendChild(){}}},location:{href:'https://atms.test/'},performance:{now:()=>0},setTimeout,clearTimeout,setInterval,clearInterval,Map,Set,WeakMap,Promise,Array,Object,Number,String,Boolean,Math,Date,RegExp,JSON,Intl,URL,Blob,FileReader:function(){},TextEncoder,TextDecoder,navigator:{},localStorage:{getItem(){return null;},setItem(){},removeItem(){}},sessionStorage:{getItem(){return null;},setItem(){},removeItem(){}},CustomEvent:function(){},Image:function(){},File:function(){}};
sandbox.globalThis=sandbox;vm.createContext(sandbox);vm.runInContext(source,sandbox);
const api=sandbox.window.__P1148Test;
const crop=()=>({fullCellIncluded:true,leftEdgeClipped:false,rightEdgeClipped:false,neighborColumnIncluded:false});
const birth=(raw='Get-E',confidence=95,patch={})=>({rawOcr:raw,confidence,sourceRow:17,sourceColumn:5,verificationSource:'primary_full_image_cell_assignment',cropQuality:crop(),...patch});
const attempt=(candidate,scope='cell_view',mode='plain')=>({candidate,scope,mode});
function pipeline({primary='Get-E',secondary='GetE',origin=birth(),history='exact_cell_multi_view_unresolved_conflict',views=[],peers=8,productionEvidence=null}){
 const rows=[{sourceRow:17,sourceImageOcr:true,company:primary,companyOcrConflict:true,companyOcrConflictCandidate:secondary,imageCellEvidence:{company:productionEvidence || {sourceRow:17,sourceColumn:5,rawOcr:origin?.rawOcr||'',verificationSource:history,confidence:origin?.confidence,cropQuality:crop(),primarySourceEvidence:origin,verificationAttempts:views,manualCheckRequired:true}}}];
 for(let i=0;i<peers;i++)rows.push({sourceRow:20+i,sourceImageOcr:true,company:primary});
 const consistent=api.applyRepeatedTextConsistency(rows);
 const reconciled=api.reconcileCompanyConflictAfterRepeatedConsistency(consistent);
 const output=api.markZeroSilentErrorIntegrity(reconciled);
 const errors=api.validate(output).filter(x=>x.level==='error'&&/Firma/.test(x.text));
 return {row:output[0],errors};
}
let nPass=0; function run(name,data,expected){const result=pipeline(data); assert.equal(result.row.companyOcrConflict,!expected,name+' flag'); assert.equal(result.errors.length===0,expected,name+' final import safety');console.log((expected?'POSITIVE':'FAIL-CLOSED')+' PASS '+name);nPass++}
// Complete cell-construction pathway: real raw-image word geometry ->
// real imageCellEvidenceForRide() -> independent review mutates source marker
// -> real repeated-consensus -> real reconciliation -> final import validation.
function fromProductionFactory(raw, confidence){
 const rows=Array(16).fill(null);rows.push({y0:0,y1:20});
 const imageMeta={rowMetaByMatrixIndex:rows,boundaries:[0,100,200,300,400,500,600],width:700,safeHeaderDetected:true,
  rawOcrWords:[{text:raw,confidence,x0:525,x1:565,y0:3,y1:14}]};
 const e=api.imageCellEvidenceForRide({sourceRow:17},imageMeta,{company:5}).company;
 assert(e && e.primarySourceEvidence,'Original evidence must be emitted by production factory');
 assert(Object.isFrozen(e.primarySourceEvidence));
 assert.equal(e.primarySourceEvidence.rawOcr,raw);
 assert.equal(e.primarySourceEvidence.sourceRow,17);
 assert.equal(e.primarySourceEvidence.sourceColumn,5);
 e.verificationSource='exact_cell_multi_view_unresolved_conflict'; // second-stage state mutation
 e.manualCheckRequired=true;e.verificationAttempts=[];
 assert.equal(e.primarySourceEvidence.verificationSource,'primary_full_image_cell_assignment');
 return e;
}
run('REAL FACTORY primary OCR survives second-stage status mutation',
 {productionEvidence:fromProductionFactory('Get-E',95)},true);
run('REAL FACTORY wrong raw OCR remains blocked',
 {productionEvidence:fromProductionFactory('GetE',95)},false);
run('REAL FACTORY low-confidence OCR remains blocked',
 {productionEvidence:fromProductionFactory('Get-E',70)},false);
run('original primary provenance intact despite later unresolved conflict',{history:'exact_cell_multi_view_unresolved_conflict'},true);
run('original primary provenance intact despite later unresolved alternative',{history:'exact_cell_multi_view_unresolved_alternative'},true);
run('original primary provenance intact despite later pending',{history:'exact_cell_multi_view_pending_consensus'},true);
run('primary absent',{origin:null},false);
run('primary untrusted provenance',{origin:birth('Get-E',92,{verificationSource:'secondary_cropped'})},false);
run('original raw differs from current',{origin:birth('GetE')},false);
run('primary confidence below threshold',{origin:birth('Get-E',79)},false);
run('primary confidence missing',{origin:birth('Get-E',null)},false);
run('primary cropped edge',{origin:birth('Get-E',95,{cropQuality:{...crop(),leftEdgeClipped:true}})},false);
run('primary foreign source-row',{origin:birth('Get-E',95,{sourceRow:18})},false);
run('primary foreign source-column',{origin:birth('Get-E',95,{sourceColumn:6})},false);
run('insufficient same-plan peers',{peers:2},false);
run('two independent opposing cell views',{views:[attempt('GetE','cell_view','plain'),attempt('GetE','cell_view','contrast')]},false);
run('opposing complete-cell sources',{views:[attempt('GetE','source_truth_full_cell','plain'),attempt('GetE','source_truth_full_cell','contrast')]},false);
run('opposing expanded-cell sources',{views:[attempt('GetE','source_truth_edge_expanded','plain'),attempt('GetE','source_truth_edge_expanded','contrast')]},false);
run('semantic alternative',{secondary:'GetA'},false);
console.log('P1148 PROVENANCE + FINAL IMPORT GATE '+nPass+'/'+nPass+' PASS');
