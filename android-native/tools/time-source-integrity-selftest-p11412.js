#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.join(__dirname,'..');
const core=require(path.join(root,'app/src/main/assets/js/ocr-integrity-core.js'));
let source=fs.readFileSync(path.join(root,'app/src/main/assets/js/plan-import.js'),'utf8');
const end="  document.addEventListener('DOMContentLoaded', init);\n})();";
assert(source.includes(end));
source=source.replace(end,"  window.__P11412Test={recoverSuspiciousRideTimesTargeted,validate};\n})();");
// The approved 61-case register is additive: the historical 60-case fixture
// remains immutable to preserve all older P113/P114 test programs.
const oldPack=JSON.parse(fs.readFileSync(path.join(root,'tools/fixtures/golden-regression/ATMS_GOLDEN_REGRESSION_PACK_FINAL_manifest.json'),'utf8'));
const approvedPack=JSON.parse(fs.readFileSync(path.join(root,'tools/fixtures/golden-regression/ATMS_GOLDEN_REGRESSION_PACK_61_FALL_2026-10-08.json'),'utf8'));
assert.equal(oldPack.cases.length,60);
assert.equal(approvedPack.cases.length,61);
assert.equal(approvedPack.summary.caseRecords,61);
assert.deepStrictEqual(approvedPack.cases.slice(0,59),oldPack.cases.slice(0,59));
assert.equal(approvedPack.cases[59].id,oldPack.cases[59].id);
assert.equal(approvedPack.cases[59].status,'PASSED_REAL_DEVICE_P11411_REFERENCE_PLAN_OCR');
assert.equal(approvedPack.cases[60].id,'GE-20261008-WA0010-R12-PICKUPTIME-1355-VS-1356-P11411');
assert.equal(new Set(approvedPack.cases.map(c=>c.id)).size,61);
let checks=0;
async function check(name,scenario,assertions){
 const events=[];
 const settings={};
 const mockTesseract={async createWorker(language,_,options){
  assert.equal(language,'eng');
  const worker={
   async setParameters(params){settings.psm=String(params.tessedit_pageseg_mode);settings.whitelist=params.tessedit_char_whitelist;events.push({type:'parameters',psm:settings.psm});},
   async recognize(canvas){
    const crop=canvas._crop;
    const psm=settings.psm;
    assert(psm,'recognition without applied PSM');
    const isCell=psm==='7'||(psm==='6'&&crop.sx>=210);
    const idx=psm==='4'?0:psm==='6'?1:2;
    const value=isCell?(psm==='7'?scenario.cell?.[0]:scenario.cell?.[1]):scenario.column?.[idx];
    events.push({type:'recognize',psm,isCell,crop,value});
    const out=value?{data:{text:value,words:[{text:value,bbox:{x0:5,y0:Math.max(0,canvas.height/2-7),x1:70,y1:canvas.height/2+7},confidence:90}]}}:{data:{text:'',words:[]}};
    return out;
   },
   async terminate(){events.push({type:'terminate'});}
  };
  return worker;
 }};
 const fakeDocument={currentScript:{src:'https://atms.test/js/plan-import.js'},addEventListener(){},getElementById(){return null;},createElement(tag){
  if(tag!=='canvas')return {style:{},addEventListener(){}};
  const canvas={width:1,height:1,style:{},getContext(){return {drawImage(src,sx,sy,sw,sh){canvas._crop={sx,sy,sw,sh};},imageSmoothingEnabled:false,imageSmoothingQuality:'high'}}};return canvas;
 },body:{appendChild(){}}};
 const s={console,window:{Tesseract:mockTesseract,ATMSOcrIntegrityCore:core,addEventListener(){},removeEventListener(){},dispatchEvent(){},location:{href:'https://atms.test/'}},document:fakeDocument,location:{href:'https://atms.test/'},performance:{now:()=>0},setTimeout,clearTimeout,setInterval,clearInterval,Map,Set,WeakMap,Promise,Array,Object,Number,String,Boolean,Math,Date,RegExp,JSON,Intl,URL,Blob,FileReader:function(){},TextEncoder,TextDecoder,navigator:{},localStorage:{getItem(){return null;},setItem(){},removeItem(){}},sessionStorage:{getItem(){return null;},setItem(){},removeItem(){}},CustomEvent:function(){},Image:function(){},File:function(){}};
 s.globalThis=s;s.Tesseract=mockTesseract;vm.createContext(s);vm.runInContext(source,s);
 const ride={sourceRow:12,sourceImageOcr:true,time:'13:55',dispoTime:'13:55',planTime:'13:55',timeMirror:scenario.mirror||'',imageCellEvidence:{time:{field:'time',sourceRow:12,sourceColumn:1,cellBounds:{left:197.25,right:436.75,top:752,bottom:798},rawOcr:scenario.primaryRaw||'13:55',confidence:scenario.confidence??95.3,verificationSource:'primary_full_image_cell_assignment',geometryConfidence:'high',cropQuality:{fullCellIncluded:true,leftEdgeClipped:false,rightEdgeClipped:false,neighborColumnIncluded:false,...(scenario.quality||{})}}}};
 const imageMeta={boundaries:[0,197.25,436.75],rowMetaByMatrixIndex:{11:{y0:752,y1:798,cy:775}}};
 const result=await s.window.__P11412Test.recoverSuspiciousRideTimesTargeted([ride],{width:3200,height:1430},imageMeta,{time:1});
 assertions(result[0],events);
 assert(events.some(e=>e.type==='terminate'),name+' worker cleanup');
 assert.deepStrictEqual(events.filter(e=>e.type==='parameters').slice(0,3).map(e=>e.psm),['4','6','11'],name+' actual PSM configured');
 assert.equal(events.filter(e=>e.type==='recognize'&&!e.isCell).length>=3,true);
 checks++;console.log('PASS',name);
}
(async()=>{
 const batch=['13:56','13:55','13:56'];
 await check('REAL 13:55 strong primary vs 13:56 column / both configured exact-cells confirm primary',{column:batch,cell:['13:55','13:55']},r=>{assert.equal(r.time,'13:55');assert.equal(r.timeSuspiciousHardBlock,undefined);assert.equal(r.timeSuspiciousColumnNoiseRejected,true);assert.equal(r.timeSuspiciousFullCellProof.status,'qualified_primary_confirmed');});
 await check('REAL alternative plus two full-cell readings of other time stays blocked',{column:batch,cell:['13:56','13:56']},r=>{assert.equal(r.time,'13:55');assert.equal(r.timeSuspiciousHardBlock,true);});
 await check('one full-cell primary read is insufficient',{column:batch,cell:['13:55','']},r=>{assert.equal(r.timeSuspiciousHardBlock,true);});
 await check('full-cell reads disagree => no false clearance',{column:batch,cell:['13:55','13:56']},r=>{assert.equal(r.timeSuspiciousHardBlock,true);});
 await check('weak primary OCR confidence stays fail-closed',{column:batch,cell:['13:55','13:55'],confidence:78},r=>{assert.equal(r.timeSuspiciousHardBlock,true);});
 await check('primary OCR text differs stays fail-closed',{column:batch,cell:['13:55','13:55'],primaryRaw:'13:56'},r=>{assert.equal(r.timeSuspiciousHardBlock,true);});
 await check('clipped source cell stays fail-closed',{column:batch,cell:['13:55','13:55'],quality:{rightEdgeClipped:true}},r=>{assert.equal(r.timeSuspiciousHardBlock,true);});
 await check('semantic mirror verifies original',{column:batch,mirror:'13:55',cell:['13:55','13:55']},r=>{assert.equal(r.timeSuspiciousHardBlock,false);assert.equal(r.time,'13:55');});
 await check('semantic mirror verifies alternative; no silent non-mirror change',{column:batch,mirror:'13:56',cell:['13:55','13:55']},r=>{assert.equal(r.time,'13:56');assert.equal(r.timeRecoverySource,'targeted_suspicious_time_column_consensus_mirror_confirmed');});
 await check('contrary independent mirror stays fail-closed',{column:batch,mirror:'13:50',cell:['13:55','13:55']},r=>{assert.equal(r.timeSuspiciousHardBlock,true);});
 await check('single column alternate never triggers correction',{column:['13:56','13:55','13:55'],cell:['13:55','13:55']},r=>{assert.equal(r.time,'13:55');assert.equal(r.timeSuspiciousHardBlock,undefined);});
 await check('three exact 13:55 column values unchanged',{column:['13:55','13:55','13:55'],cell:['13:55','13:55']},r=>{assert.equal(r.time,'13:55');assert.equal(r.timeSuspiciousBatchConfirmed,true);assert.equal(r.timeSuspiciousFullCellProof,undefined);});
 console.log('P11412 TIME SOURCE INTEGRITY:',checks+'/'+checks,'PASS');
})().catch(e=>{console.error(e);process.exit(1)});
