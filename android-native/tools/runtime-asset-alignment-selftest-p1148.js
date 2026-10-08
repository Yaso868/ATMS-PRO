#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.join(__dirname,'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');

function validate(index,sw,pwa){
  const errors=[];
  const need=(ok,msg)=>{ if(!ok) errors.push(msg); };
  need(index.includes('CORE-007D8A1F1D8P1148'),'visible core version is not P1148');
  need(index.includes('./js/ocr-integrity-core.js?v=P1148'),'index OCR core query is not P1148');
  need(index.includes('./js/plan-import.js?v=P1148'),'index plan-import query is not P1148');
  need(index.includes('./js/pwa.js?v=P1148'),'index PWA bootstrap query is not P1148');
  need(sw.includes('atms-pro-pwa-2026-10-08-p1148-immutable-primary-provenance'),'service-worker cache generation is not P1148');
  need(sw.includes('"./js/ocr-integrity-core.js?v=P1148"'),'service-worker OCR core shell query is not P1148');
  need(sw.includes('"./js/plan-import.js?v=P1148"'),'service-worker plan-import shell query is not P1148');
  need(sw.includes('"./js/pwa.js?v=P1148"'),'service-worker PWA shell query is not P1148');
  need(sw.includes('caches.match("./js/plan-import.js?v=P1148")'),'service-worker plan-import fallback is not P1148');
  need(pwa.includes("navigator.serviceWorker.register('./service-worker.js?v=P1148', {updateViaCache:'none'})"),'PWA registration is not forced to P1148/no-cache update');
  const activeSw=sw.split(/\r?\n/).filter(line=>!line.trim().startsWith('//')).join('\n');
  need(!/plan-import\.js\?v=P114[0-6]/.test(activeSw),'service-worker contains a stale active plan-import generation');
  need(!/ocr-integrity-core\.js\?v=P114[0-6]/.test(activeSw),'service-worker contains a stale active OCR-core generation');
  need(!/pwa\.js\?v=(?:CORE-[^"']+|P114[0-6])/.test(activeSw),'service-worker contains a stale active PWA generation');
  return errors;
}

// CI build-graph audit: old version-specific asset tests must not remain mandatory
// after switching app asset generation. Functional P114.6 regressions remain active.
function activeAlignmentGates(build){
  return Array.from(build.matchAll(/dependsOn\s+tasks\.named\(['"]runtimeAssetAlignmentP(\d+)['"]\)/g),m=>m[1]);
}
const gradleBuild=read('app/build.gradle');
assert.deepStrictEqual(activeAlignmentGates(gradleBuild),['1148'],
  'preBuild must run exactly the current P114.8 asset alignment gate (no stale version-bound gate)');
assert(gradleBuild.includes("dependsOn tasks.named('companyConflictPostConsensusP1146')"),
  'keep P114.6 functional post-consensus regressions');
assert(gradleBuild.includes("dependsOn tasks.named('companyPrimaryAlreadyCorrectP1147')"),
  'keep P114.8 positive+negative production regressions');
assert(gradleBuild.includes("dependsOn tasks.named('masterPromptRuleGateP1147')"),
  'keep master-prompt verification');
assert(gradleBuild.includes("dependsOn tasks.named('companyPrimaryProvenanceP1148')"),
  'keep P1148 immutable provenance and final import safety test');
// Red controls guard against reintroducing stale preBuild tasks on a future release.
for(const bad of [
  gradleBuild.replace("dependsOn tasks.named('runtimeAssetAlignmentP1148')", "dependsOn tasks.named('runtimeAssetAlignmentP1146')"),
  gradleBuild.replace("dependsOn tasks.named('runtimeAssetAlignmentP1148')", "dependsOn tasks.named('runtimeAssetAlignmentP1148')\n    dependsOn tasks.named('runtimeAssetAlignmentP1146')"),
  gradleBuild.replace("dependsOn tasks.named('runtimeAssetAlignmentP1148')", "")
]) assert.notDeepStrictEqual(activeAlignmentGates(bad),['1148'], 'stale/missing alignment gate should be rejected');

const index=read('app/src/main/assets/index.html');
const sw=read('app/src/main/assets/service-worker.js');
const pwa=read('app/src/main/assets/js/pwa.js');
assert.deepStrictEqual(validate(index,sw,pwa),[],'current runtime assets must be aligned');

for (const [name,badIndex,badSw,badPwa] of [
  ['stale index plan-import',index.replace('plan-import.js?v=P1148','plan-import.js?v=P1145'),sw,pwa],
  ['stale index OCR core',index.replace('ocr-integrity-core.js?v=P1148','ocr-integrity-core.js?v=P1145'),sw,pwa],
  ['stale index PWA bootstrap',index.replace('pwa.js?v=P1148','pwa.js?v=P1145'),sw,pwa],
  ['stale service-worker cache',index,sw.replace('p1148-immutable-primary-provenance','p1145-company-boundary-classification'),pwa],
  ['stale service-worker plan shell',index,sw.replace('"./js/plan-import.js?v=P1148"','"./js/plan-import.js?v=P1145"'),pwa],
  ['stale service-worker fallback',index,sw.replace('caches.match("./js/plan-import.js?v=P1148")','caches.match("./js/plan-import.js?v=P1145")'),pwa],
  ['stale service-worker registration',index,sw,pwa.replace('service-worker.js?v=P1148','service-worker.js?v=P1145')],
  ['cached service-worker update mode',index,sw,pwa.replace("{updateViaCache:'none'}","{}")],
]) {
  assert(validate(badIndex,badSw,badPwa).length>0,`${name} was not detected`);
}

const plan=read('app/src/main/assets/js/plan-import.js');
assert(plan.includes('CORE-007D8A1F1D8P1148'),'P1148 plan-import semantics marker missing');
assert(plan.includes('PRIMARY-ALREADY-CORRECT COMPANY CONFLICT'),'P1148 production plan-import marker missing');
assert(plan.includes("p54MeasureSync('company_conflict_post_consensus'"),'P1148 production pipeline hook missing');

console.log('P114.8 runtime asset alignment self-test: PASS');
