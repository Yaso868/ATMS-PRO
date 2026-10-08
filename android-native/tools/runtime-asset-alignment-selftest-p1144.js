#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.join(__dirname,'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');

function validate(index,sw,pwa){
  const errors=[];
  const need=(ok,msg)=>{ if(!ok) errors.push(msg); };
  need(index.includes('CORE-007D8A1F1D8P1144'),'visible core version is not P1144');
  need(index.includes('./js/ocr-integrity-core.js?v=P1144'),'index OCR core query is not P1144');
  need(index.includes('./js/plan-import.js?v=P1144'),'index plan-import query is not P1144');
  need(index.includes('./js/pwa.js?v=P1144'),'index PWA bootstrap query is not P1144');
  need(sw.includes('atms-pro-pwa-2026-10-08-p1144-runtime-asset-alignment'),'service-worker cache generation is not P1144');
  need(sw.includes('"./js/ocr-integrity-core.js?v=P1144"'),'service-worker OCR core shell query is not P1144');
  need(sw.includes('"./js/plan-import.js?v=P1144"'),'service-worker plan-import shell query is not P1144');
  need(sw.includes('"./js/pwa.js?v=P1144"'),'service-worker PWA shell query is not P1144');
  need(sw.includes('caches.match("./js/plan-import.js?v=P1144")'),'service-worker plan-import fallback is not P1144');
  need(pwa.includes("navigator.serviceWorker.register('./service-worker.js?v=P1144', {updateViaCache:'none'})"),'PWA registration is not forced to P1144/no-cache update');
  const activeSw=sw.split(/\r?\n/).filter(line=>!line.trim().startsWith('//')).join('\n');
  need(!/plan-import\.js\?v=P114[0-3]/.test(activeSw),'service-worker contains a stale active plan-import generation');
  need(!/ocr-integrity-core\.js\?v=P114[0-3]/.test(activeSw),'service-worker contains a stale active OCR-core generation');
  need(!/pwa\.js\?v=(?:CORE-[^"']+|P114[0-3])/.test(activeSw),'service-worker contains a stale active PWA generation');
  return errors;
}

const index=read('app/src/main/assets/index.html');
const sw=read('app/src/main/assets/service-worker.js');
const pwa=read('app/src/main/assets/js/pwa.js');
assert.deepStrictEqual(validate(index,sw,pwa),[],'current runtime assets must be aligned');

// Negative controls: every stale generation must be caught independently.
for (const [name,badIndex,badSw,badPwa] of [
  ['stale index plan-import',index.replace('plan-import.js?v=P1144','plan-import.js?v=P1143'),sw,pwa],
  ['stale index OCR core',index.replace('ocr-integrity-core.js?v=P1144','ocr-integrity-core.js?v=P1142'),sw,pwa],
  ['stale index PWA bootstrap',index.replace('pwa.js?v=P1144','pwa.js?v=P1121'),sw,pwa],
  ['stale service-worker cache',index,sw.replace('p1144-runtime-asset-alignment','p1143-realstate-source-truth-normalization'),pwa],
  ['stale service-worker plan shell',index,sw.replace('"./js/plan-import.js?v=P1144"','"./js/plan-import.js?v=P1143"'),pwa],
  ['stale service-worker fallback',index,sw.replace('caches.match("./js/plan-import.js?v=P1144")','caches.match("./js/plan-import.js?v=P1143")'),pwa],
  ['stale service-worker registration',index,sw,pwa.replace("service-worker.js?v=P1144","service-worker.js?v=P1143")],
  ['cached service-worker update mode',index,sw,pwa.replace("{updateViaCache:'none'}","{}")],
]) {
  assert(validate(badIndex,badSw,badPwa).length>0,`${name} was not detected`);
}

// P1144 is runtime-only: the production OCR/import semantics must still be P1143.
const plan=read('app/src/main/assets/js/plan-import.js');
assert(plan.includes('CORE-007D8A1F1D8P1143'),'P1143 plan-import semantics marker missing');
assert(plan.includes('REALSTATE SOURCE-TRUTH NORMALIZATION'),'P1143 source-truth logic marker missing');

console.log('P114.4 runtime asset alignment self-test: PASS');
