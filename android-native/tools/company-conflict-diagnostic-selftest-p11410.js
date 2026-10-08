#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.join(__dirname,'..');
const patched=fs.readFileSync(path.join(root,'app/src/main/assets/js/plan-import.js'),'utf8');
const original=fs.readFileSync(path.join(__dirname,'fixtures/p1149-diagnostic-comparison-plan-import.js'),'utf8');
const suffix="  document.addEventListener('DOMContentLoaded', init);\n})();";
let checks=0;
function ok(label,yes){assert(yes,label);checks++;console.log('PASS',label)}
function load(code, newer){
  const exports = newer ? ',buildCompanyConflictDiagnosticP11410' : '';
  const body=code.replace(suffix,`  window.__test={sourceTruthAdaptiveCompanyTailOcr,sourceTruthPrimaryEdgeVeto,reconcileCompanyConflictAfterRepeatedConsistency,markZeroSilentErrorIntegrity,validate${exports}};\n})();`);
  ok('test hooks compiled '+(newer?'P11410':'P1149'),body!==code);
  const ctx={console,window:{ATMSOcrIntegrityCore:require(path.join(root,'app/src/main/assets/js/ocr-integrity-core.js')),Tesseract:{},addEventListener(){},location:{href:'https://atms.test/'}},document:{currentScript:{src:'https://atms.test/js/plan-import.js'},addEventListener(){},getElementById(){return null;},createElement(){return {style:{},getContext(){return {drawImage(){},imageSmoothingEnabled:false}}}},body:{appendChild(){}}},location:{href:'https://atms.test/'},performance:{now:()=>0},setTimeout,clearTimeout,setInterval,clearInterval,Map,Set,WeakMap,Promise,Array,Object,Number,String,Boolean,Math,Date,RegExp,JSON,Intl,URL,Blob,FileReader:function(){},TextEncoder,TextDecoder,navigator:{},localStorage:{getItem(){return null;},setItem(){}},sessionStorage:{},CustomEvent:function(){},Image:function(){}};
  ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(body,ctx);return ctx.window.__test;
}
const old=load(original,false), now=load(patched,true);
// Fingerprint actual production decision bodies rather than a synthetic re-implementation.
function exactBody(src,fn,next){return src.slice(src.indexOf('  function '+fn+'('),src.indexOf('  function '+next+'('));}
ok('P114.9 source truth veto byte-identical',exactBody(original,'sourceTruthPrimaryEdgeVeto','sourceTruthEdgeRecovery')===exactBody(patched,'sourceTruthPrimaryEdgeVeto','sourceTruthEdgeRecovery'));
ok('P114.9 post-consensus decision byte-identical',exactBody(original,'reconcileCompanyConflictAfterRepeatedConsistency','applyRepeatedTextConsistency')===exactBody(patched,'reconcileCompanyConflictAfterRepeatedConsistency','applyRepeatedTextConsistency'));
function fixtures(){
 const canvas={width:1000,height:500}; const descriptor={left:200,right:300,column:2}; const row={y0:120,y1:155};
 const meta={boundaries:[0,100,200,300,400,500],rawOcrWords:[]}; return {canvas,descriptor,row,meta};
}
(async()=>{
 for(const scenario of ['missing_tesseract','invalid_geometry','neighbor_missing','neighbor_overlap','neighbor_clear','ocr_throws']){
   const {canvas,descriptor,row,meta}=fixtures();
   let workerCalls=0; let worker={recognize:async()=>{workerCalls++;if(scenario==='ocr_throws')throw Error('simulated');return {data:{text:'Alpha-Beta'}}}};
   if(scenario==='invalid_geometry')descriptor.right=199;
   if(scenario==='neighbor_overlap')meta.rawOcrWords=[{x0:315,x1:331,y0:125,y1:149,text:'SIDE'}];
   if(['neighbor_clear','ocr_throws'].includes(scenario))meta.rawOcrWords=[{x0:360,x1:385,y0:125,y1:149,text:'SIDE'}];
   const trace={};
   const args=[canvas,canvas,descriptor,row,17,worker,meta];
   const oldT=globalThis.___dummy;
   const previous=globalThis;
   const oldRes=await old.sourceTruthAdaptiveCompanyTailOcr(...args);
   const newRes=await now.sourceTruthAdaptiveCompanyTailOcr(...args,trace);
   ok(scenario+' results unchanged',JSON.stringify(oldRes)===JSON.stringify(newRes));
   if(scenario==='invalid_geometry')ok('invalid cell trace',trace.status==='invalid_target_cell_geometry');
   if(scenario==='neighbor_missing')ok('missing neighbor trace',trace.status==='neighbor_words_missing'&&trace.neighborWordsChecked===0);
   if(scenario==='neighbor_overlap')ok('overlap trace',trace.status==='neighbor_guard_overlap'&&trace.neighborWordsChecked===1);
   if(scenario==='neighbor_clear')ok('OCR modes trace',trace.status==='ocr_completed'&&trace.modes.length===2&&trace.modes.every(x=>x.candidate==='Alpha-Beta'));
   if(scenario==='ocr_throws')ok('fail-closed OCR errors still observable',trace.status==='ocr_completed'&&trace.modes.every(x=>!x.candidate));
 }
 const ride={sourceRow:17,company:'Alpha-Beta',companyOcrConflict:true,companyOcrConflictCandidate:'AlphaBeta',imageCellEvidence:{company:{sourceColumn:3,verificationSource:'exact_cell_multi_view_unresolved_conflict',verificationAttempts:[]}}};
 const all=[ride,{sourceRow:18,company:'Alpha-Beta'},{sourceRow:19,company:'Alpha-Beta'},{sourceRow:20,company:'Alpha-Beta'}];
 const before=JSON.stringify(all);
 const report=now.buildCompanyConflictDiagnosticP11410(all,[{sourceRow:17,status:'neighbor_words_missing'}]);
 ok('report is transient and truthful',report.diagnosticOnly===true&&report.noMutation===true&&report.conflictCount===1&&report.conflicts[0].adaptiveProbe.status==='neighbor_words_missing');
 ok('report never modifies ride/import fields',JSON.stringify(all)===before&&ride.companyOcrConflict===true);
 ok('report exposes missing/competing evidence',report.conflicts[0].sourceConsensus.adaptive===null&&report.conflicts[0].primaryVetoReason===null);
 ok('no hardcoded production row/company text',!patched.includes("sourceRow === 17")&&!patched.includes("current === 'Get-E'"));
 ok('UI copy action has actual diagnostic data',patched.includes('copyP11410DiagBtn')&&patched.includes('JSON.stringify(state.ocrCompanyConflictReportP11410,null,2)'));
 ok('diagnostic hook wired into real OCR phase',patched.includes('imageMeta,probe)')&&patched.includes('window.ATMSP11410CompanyTailProbes'));
 console.log('P114.10 OBSERVABILITY REGRESSION:',checks,'checks PASS');
})().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
