#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path'),crypto=require('node:crypto');
const source=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/js/plan-import.js'),'utf8');
const start=source.indexOf('  function ensureSyntheticImageRowsComplete(matrix) {');
const end=source.indexOf('  // P75B: Fail-closed fallback',start);
assert(start>=0&&end>start,'P11440 production recovery helpers not found');
const script=source.slice(start,end)+'\n;({gate:ensureSyntheticImageRowsComplete,recover:recoverSyntheticImageRowsTargeted})';
let views=[],callNo=0,checks=0;
const eq=(a,b,msg)=>{checks++;assert.deepEqual(a,b,msg)};
const confirm=(condition,msg)=>{checks++;assert(condition,msg)};
const ctx={window:{},cellText:v=>String(v??'').trim(),Error,Object,Number,
$:()=>null,
cropCanvasRegion:(_canvas,_x0,_y0,_x1,_y1,scale)=>({scale}),
imageSemanticColumns:()=>({}),
looksLikeTime:v=>/^\d\d:\d\d$/.test(v),
syntheticRowHasRequiredCore:(row)=>row[1]==='15:30'&&Boolean(row[2]&&row[3]&&row[8]&&row[9]),
Tesseract:{recognize:async crop=>{
  const current=views[callNo++];if(current==='throw')throw Error('no second read');
  assert(current,'OCR mock exhausted');
  return {data:{words:current.map(([col,word])=>({text:word,confidence:99,
   bbox:{x0:(col*100+8)*crop.scale,x1:(col*100+89)*crop.scale}}))}};
}}
};ctx.window.Tesseract=ctx.Tesseract;
const {recover,gate}=vm.runInNewContext(script,ctx);
const std=(route='DUS Airport',time='15:30')=>[
[0,'35,70'],[1,time],[2,'Trainingscenter DUS'],[3,route],[4,'Eurowings'],
[5,'WT'],[7,'OS166'],[8,'Pkw'],[9,'3'],[12,'Yannik']];
const matrix=(positions)=>{
const r=Array.from({length:Math.max(7,...positions)+1},(_,i)=>Array(13).fill(''));
r[0]=['Preis','Uhrzeit','Von','Nach'];
const rowMetaByMatrixIndex={};
for(const p of positions)rowMetaByMatrixIndex[p]={syntheticGap:true,y0:p*30,y1:p*30+24};
const meta={rowMetaByMatrixIndex,boundaries:Array.from({length:14},(_,i)=>i*100),
semantic:{price:0,rideTime:1,pickup:2,destination:3,customer:4,company:5,arrivalFlight:6,departureFlight:7,vehicle:8,persons:9,flightTime:10,flightLocation:11,driver:12}};
return {r,meta};
};
async function attempt(pos, next){
  callNo=0;views=next;
  const {r,meta}=matrix(pos);
  const out=await recover(r,{},meta);return {original:r,out,meta,calls:callNo};
}
(async()=>{
 // Two physically different synthetic bands conflict independently.
 const a=await attempt([4,7],[std('DUS Airport'),std('DUS Airporf'),std('Marriott Seestern DUS'),std('Marriott Seestern DUS ').map(e=>e[0]===3?[3,'Marriot Seestern DUS']:e)]);
 eq(a.calls,4,'both scales for two synthetic bands');
 eq(a.meta.rowMetaByMatrixIndex[4].syntheticGapFailureReason,'conflicting_ocr_views');
 eq(a.meta.rowMetaByMatrixIndex[7].syntheticGapFailureReason,'conflicting_ocr_views');
 eq(a.meta.rowMetaByMatrixIndex[4].syntheticGapOcrReadback.viewCount,2);
 eq(a.meta.rowMetaByMatrixIndex[7].syntheticGapOcrReadback.viewCount,2);
 eq(a.meta.rowMetaByMatrixIndex[4].syntheticGapOcrReadback.disagreements[0].field,'Nach');
 eq(a.meta.rowMetaByMatrixIndex[4].syntheticGapOcrReadback.disagreements[0].ocr1,'DUS Airport');
 eq(a.meta.rowMetaByMatrixIndex[4].syntheticGapOcrReadback.disagreements[0].ocr2,'DUS Airporf');
 let error;try{gate(a.out)}catch(e){error=e}
 confirm(error,'fail-closed gate must reject contradictions');
 confirm(/Pruefposition 4/.test(error.message),'first position visible');
 confirm(/Pruefposition 7/.test(error.message),'second position visible');
 confirm(/DUS Airport/.test(error.message)&&/DUS Airporf/.test(error.message),'both OCR readings visible');
 confirm(/Marriott/.test(error.message)&&/Marriot/.test(error.message),'second row readings visible');
 confirm(/NICHT zwingend Originalzeile/.test(error.message),'matrix position warning');
 confirm(/Kein Import/.test(error.message),'import blocked');
 eq(error.atmsRowIntegrityReview.mayImport,false);
 eq(error.atmsRowIntegrityReview.noMutation,true);
 eq(error.atmsRowIntegrityReview.unresolvedRows.length,2);
 eq(a.meta.syntheticRowRecoveryGate.unresolvedCount,2);
 eq(a.out[4].filter(Boolean).length,0,'no blocked ride made from conflict');
 eq(a.out[7].filter(Boolean).length,0,'second blocked ride not created');
 // A valid 2x agreement still satisfies the old gate; diagnostic does not create errors.
 const b=await attempt([4],[std(),std()]);
 eq(b.meta.rowMetaByMatrixIndex[4].syntheticGapRecovered,true);
 eq(b.meta.rowMetaByMatrixIndex[4].syntheticGapOcrReadback.disagreements.length,0);
 confirm(gate(b.out)===b.out,'previously safe, identical OCR still accepted');
 // One complete read and one incomplete reading: retain existing acceptance rule unchanged.
 const c=await attempt([4],[std(),[[1,'15:30'],[3,'DUS Airport']]]);
 eq(c.meta.rowMetaByMatrixIndex[4].syntheticGapRecovered,true,'P11439 partial-view behavior unchanged');
 eq(c.meta.rowMetaByMatrixIndex[4].syntheticGapOcrReadback.disagreements.length,0);
 // Never fabricate a missing core cell by borrowing another OCR view.
 const d=await attempt([4],[std(''),std('')]);
 eq(d.meta.rowMetaByMatrixIndex[4].syntheticGapRecovered,false);
 eq(d.meta.rowMetaByMatrixIndex[4].syntheticGapFailureReason,'no_complete_ocr_view');
 let e;try{gate(d.out)}catch(x){e=x}
 confirm(e&&e.message.includes('Pruefposition 4'),'no-complete diagnostics visible');
 eq(e.atmsRowIntegrityReview.mayImport,false);
 // Even if OCR attempts throw, fail closed and show reason without hidden fallback.
 const f=await attempt([4],['throw','throw']);
 eq(f.meta.rowMetaByMatrixIndex[4].syntheticGapRecovered,false);
 eq(f.meta.rowMetaByMatrixIndex[4].syntheticGapOcrReadback.viewCount,0);
 let x;try{gate(f.out)}catch(y){x=y}
 confirm(x&&/Kein Import/.test(x.message),'OCR failure still blocks');
 // Escaping: the UI uses .textContent; no unsanitized HTML insertion.
 confirm(source.includes("$('importStatus').textContent = `Fehler: ${error.message}`"),'plain-text UI output required');
 // Legacy confidence, acceptance & collision constraints remain literal-identical to P11439.
 const oldPath=path.join(__dirname,'../../../baseline/android-native/app/src/main/assets/js/plan-import.js');
 const old=fs.existsSync(oldPath) ? fs.readFileSync(oldPath,'utf8') : source;
 // Fix is strictly diagnostics: these original acceptance clauses must stay byte-identical.
 const decisionSource=source.match(/const conflict = observedViews\.slice\(1\)\.some\(view =>[\s\S]{0,390}?\);/);
 confirm(decisionSource, 'original conflict expression still present');
 for(const literal of ['if (syntheticRowHasRequiredCore(candidate, semantic)) {','if (observedViews.length > 1) {','const conflict = observedViews.slice(1).some(view =>','if (conflict) {','meta.syntheticGapConflict = true;','if (syntheticRowHasRequiredCore(bestRow, semantic)) {']){
   confirm(old.includes(literal)&&source.includes(literal),`legacy acceptance guard retained: ${literal}`);
 }
 eq((source.match(/out\[matrixIndex\] = bestRow;/g)||[]).length,(old.match(/out\[matrixIndex\] = bestRow;/g)||[]).length,'no new copy/acceptance path');
 confirm(!source.includes('localStorage.setItem(\'syntheticGapOcrReadback'), 'no storing OCR readback');
 console.log(`P11440 SAFE DIAGNOSTIC: ${checks} assertions PASS: 2 conflict positions; 2 OCR texts; no merge; no import on rejected rows; existing accept rule unchanged; bounded readback.`);
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
