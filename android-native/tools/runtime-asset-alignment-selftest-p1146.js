#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.join(__dirname,'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');

function validate(index,sw,pwa){
  const errors=[];
  const need=(ok,msg)=>{ if(!ok) errors.push(msg); };
  need(index.includes('CORE-007D8A1F1D8P1146'),'visible core version is not P1146');
  need(index.includes('./js/ocr-integrity-core.js?v=P1146'),'index OCR core query is not P1146');
  need(index.includes('./js/plan-import.js?v=P1146'),'index plan-import query is not P1146');
  need(index.includes('./js/pwa.js?v=P1146'),'index PWA bootstrap query is not P1146');
  need(sw.includes('atms-pro-pwa-2026-10-08-p1146-post-consensus-conflict-reconciliation'),'service-worker cache generation is not P1146');
  need(sw.includes('"./js/ocr-integrity-core.js?v=P1146"'),'service-worker OCR core shell query is not P1146');
  need(sw.includes('"./js/plan-import.js?v=P1146"'),'service-worker plan-import shell query is not P1146');
  need(sw.includes('"./js/pwa.js?v=P1146"'),'service-worker PWA shell query is not P1146');
  need(sw.includes('caches.match("./js/plan-import.js?v=P1146")'),'service-worker plan-import fallback is not P1146');
  need(pwa.includes("navigator.serviceWorker.register('./service-worker.js?v=P1146', {updateViaCache:'none'})"),'PWA registration is not forced to P1146/no-cache update');
  const activeSw=sw.split(/\r?\n/).filter(line=>!line.trim().startsWith('//')).join('\n');
  need(!/plan-import\.js\?v=P114[0-5]/.test(activeSw),'service-worker contains a stale active plan-import generation');
  need(!/ocr-integrity-core\.js\?v=P114[0-5]/.test(activeSw),'service-worker contains a stale active OCR-core generation');
  need(!/pwa\.js\?v=(?:CORE-[^"']+|P114[0-5])/.test(activeSw),'service-worker contains a stale active PWA generation');
  return errors;
}

const index=read('app/src/main/assets/index.html');
const sw=read('app/src/main/assets/service-worker.js');
const pwa=read('app/src/main/assets/js/pwa.js');
assert.deepStrictEqual(validate(index,sw,pwa),[],'current runtime assets must be aligned');

for (const [name,badIndex,badSw,badPwa] of [
  ['stale index plan-import',index.replace('plan-import.js?v=P1146','plan-import.js?v=P1145'),sw,pwa],
  ['stale index OCR core',index.replace('ocr-integrity-core.js?v=P1146','ocr-integrity-core.js?v=P1145'),sw,pwa],
  ['stale index PWA bootstrap',index.replace('pwa.js?v=P1146','pwa.js?v=P1145'),sw,pwa],
  ['stale service-worker cache',index,sw.replace('p1146-post-consensus-conflict-reconciliation','p1145-company-boundary-classification'),pwa],
  ['stale service-worker plan shell',index,sw.replace('"./js/plan-import.js?v=P1146"','"./js/plan-import.js?v=P1145"'),pwa],
  ['stale service-worker fallback',index,sw.replace('caches.match("./js/plan-import.js?v=P1146")','caches.match("./js/plan-import.js?v=P1145")'),pwa],
  ['stale service-worker registration',index,sw,pwa.replace('service-worker.js?v=P1146','service-worker.js?v=P1145')],
  ['cached service-worker update mode',index,sw,pwa.replace("{updateViaCache:'none'}","{}")],
]) {
  assert(validate(badIndex,badSw,badPwa).length>0,`${name} was not detected`);
}

const plan=read('app/src/main/assets/js/plan-import.js');
assert(plan.includes('CORE-007D8A1F1D8P1146'),'P1146 plan-import semantics marker missing');
assert(plan.includes('POST-CONSENSUS CONFLICT RECONCILIATION'),'P1146 post-consensus logic marker missing');
assert(plan.includes("p54MeasureSync('company_conflict_post_consensus'"),'P1146 production pipeline hook missing');

console.log('P114.6 runtime asset alignment self-test: PASS');
