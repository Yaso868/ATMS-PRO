#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.join(__dirname,'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');

function validate(index,sw,pwa){
  const errors=[];
  const need=(ok,msg)=>{ if(!ok) errors.push(msg); };
  need(index.includes('CORE-007D8A1F1D8P11431'),'visible core version is not P11431');
  need(index.includes('./js/ocr-integrity-core.js?v=P11431'),'index OCR core query is not P11431');
  need(index.includes('./js/plan-import.js?v=P11431'),'index plan-import query is not P11431');
  need(index.includes('./js/pwa.js?v=P11431'),'index PWA bootstrap query is not P11431');
  need(sw.includes('atms-pro-pwa-2026-10-13-p11431-ap01-product-first'),'service-worker cache generation is not P11431');
  need(sw.includes('"./js/ocr-integrity-core.js?v=P11431"'),'service-worker OCR core shell query is not P11431');
  need(sw.includes('"./js/plan-import.js?v=P11431"'),'service-worker plan-import shell query is not P11431');
  need(sw.includes('"./js/pwa.js?v=P11431"'),'service-worker PWA shell query is not P11431');
  need(sw.includes('caches.match("./js/plan-import.js?v=P11431")'),'service-worker plan-import fallback is not P11431');
  need(pwa.includes("navigator.serviceWorker.register('./service-worker.js?v=P11431', {updateViaCache:'none'})"),'PWA registration is not forced to P11431/no-cache update');
  const activeSw=sw.split(/\r?\n/).filter(line=>!line.trim().startsWith('//')).join('\n');
  need(!/plan-import\.js\?v=P114[0-9](?![0-9])/.test(activeSw),'service-worker contains a stale active plan-import generation');
  need(!/ocr-integrity-core\.js\?v=P114[0-9](?![0-9])/.test(activeSw),'service-worker contains a stale active OCR-core generation');
  need(!/pwa\.js\?v=(?:CORE-[^"']+|P114[0-9](?![0-9]))/.test(activeSw),'service-worker contains a stale active PWA generation');
  return errors;
}

// CI build-graph audit: old version-specific asset tests must not remain mandatory
// after switching app asset generation. Functional P114.6 regressions remain active.
function activeAlignmentGates(build){
  return Array.from(build.matchAll(/dependsOn\s+tasks\.named\(['"]runtimeAssetAlignmentP(\d+)['"]\)/g),m=>m[1]);
}
const gradleBuild=read('app/build.gradle');
assert.deepStrictEqual(activeAlignmentGates(gradleBuild),['11431'],
  'preBuild must run exactly the current P114.27 asset alignment gate (no stale version-bound gate)');
assert(gradleBuild.includes("dependsOn tasks.named('companyConflictPostConsensusP1146')"),
  'keep P114.6 functional post-consensus regressions');
assert(gradleBuild.includes("dependsOn tasks.named('companyPrimaryAlreadyCorrectP1147')"),
  'keep P114.8 positive+negative production regressions');
assert(gradleBuild.includes("dependsOn tasks.named('masterPromptRuleGateP1147')"),
  'keep master-prompt verification');
assert(gradleBuild.includes("dependsOn tasks.named('headerlessUnassignedDriverP11416')"), 'require P114.16 driver safety gate');
assert(gradleBuild.includes("dependsOn tasks.named('previewVehiclePersonsP11419')"),'vehicle/person preview selftest must gate preBuild');
assert(gradleBuild.includes("dependsOn tasks.named('planDateIntegrityP11418')"),'P11418 validated date rules must remain enforced');
assert(gradleBuild.includes("dependsOn tasks.named('headerlessClockBoundaryP11415')"), 'retain P114.15 clock safety gate');
assert(gradleBuild.includes("dependsOn tasks.named('timeSourceIntegrityP11412')"), 'require P11412 time-source safety test retained');
assert(gradleBuild.includes("dependsOn tasks.named('headerlessFlightGateTraceP11413')"), 'require unchanged P11413 headerless flight-gate safety test');
assert(gradleBuild.includes("dependsOn tasks.named('headerlessMetadataIntegrityP11414')"), 'require P11414 early-return metadata-integrity safety test');
assert(gradleBuild.includes("dependsOn tasks.named('companySourceReconcileP11411')"), 'P11411 protected Get-E company regression must remain mandatory');
assert(gradleBuild.includes("dependsOn tasks.named('companyPrimaryProvenanceP1148')"),
  'keep P1148 immutable provenance and final import safety test');
// Red controls guard against reintroducing stale preBuild tasks on a future release.
for(const bad of [
  gradleBuild.replace("dependsOn tasks.named('runtimeAssetAlignmentP11431')", "dependsOn tasks.named('runtimeAssetAlignmentP1146')"),
  gradleBuild.replace("dependsOn tasks.named('runtimeAssetAlignmentP11431')", "dependsOn tasks.named('runtimeAssetAlignmentP11431')\n    dependsOn tasks.named('runtimeAssetAlignmentP1146')"),
  gradleBuild.replace("dependsOn tasks.named('runtimeAssetAlignmentP11431')", "")
]) assert.notDeepStrictEqual(activeAlignmentGates(bad),['11431'], 'stale/missing alignment gate should be rejected');

const index=read('app/src/main/assets/index.html');
const sw=read('app/src/main/assets/service-worker.js');
const pwa=read('app/src/main/assets/js/pwa.js');
assert.deepStrictEqual(validate(index,sw,pwa),[],'current runtime assets must be aligned');

for (const [name,badIndex,badSw,badPwa] of [
  ['stale index plan-import',index.replace('plan-import.js?v=P11431','plan-import.js?v=P1145'),sw,pwa],
  ['stale index OCR core',index.replace('ocr-integrity-core.js?v=P11431','ocr-integrity-core.js?v=P1145'),sw,pwa],
  ['stale index PWA bootstrap',index.replace('pwa.js?v=P11431','pwa.js?v=P1145'),sw,pwa],
  ['stale service-worker cache',index,sw.replace('p11431-ap01-product-first','p1145-company-boundary-classification'),pwa],
  ['stale service-worker plan shell',index,sw.replace('"./js/plan-import.js?v=P11431"','"./js/plan-import.js?v=P1145"'),pwa],
  ['stale service-worker fallback',index,sw.replace('caches.match("./js/plan-import.js?v=P11431")','caches.match("./js/plan-import.js?v=P1145")'),pwa],
  ['stale service-worker registration',index,sw,pwa.replace('service-worker.js?v=P11431','service-worker.js?v=P1145')],
  ['cached service-worker update mode',index,sw,pwa.replace("{updateViaCache:'none'}","{}")],
]) {
  assert(validate(badIndex,badSw,badPwa).length>0,`${name} was not detected`);
}

const plan=read('app/src/main/assets/js/plan-import.js');
assert(plan.includes('CORE-007D8A1F1D8P11426'),'P11426 airport first-source diagnostics marker missing; P11431 does not change OCR logic');
assert(plan.includes('runPreviewOnlyFlightCheck'), 'P11431 protected flight test handler missing');
assert(gradleBuild.includes("dependsOn tasks.named('safeFlightPreviewP11422')"), 'flight-only regression gate missing');
assert(gradleBuild.includes("dependsOn tasks.named('safeFlightEvidenceP11423')"), 'P11423 evidence rules must remain tested');
assert(gradleBuild.includes("dependsOn tasks.named('airportFirstSourceReasonsP11424')"), 'official airport read-only diagnostic gate mandatory');
assert(plan.includes('state.previewOnlyAnalysis'), 'P114.21 preview-only block missing');
assert(plan.includes('updateSelectedPlanFileStatus();'), 'P114.21 visible selected-date synchronization missing');
assert(plan.includes('CORE-007D8A1F1D8P11416'),'P11416 driver integrity source must remain present');
assert(plan.includes('PRIMARY-ALREADY-CORRECT COMPANY CONFLICT'),'P11416 production plan-import marker missing');
assert(plan.includes("p54MeasureSync('company_conflict_post_consensus'"),'P11431 production pipeline hook missing');

assert(read('tools/ap01-release/browser-gate.sh').includes('tools/ap01-release/navigation.py'),'navigation regression must run in browser gate');
console.log('P114.31 runtime asset + AP-01 preBuild alignment self-test: PASS');

// P114.31: prevent losing price/interior and route-integrity gates during the upgrade.
assert(gradleBuild.includes("dependsOn tasks.named('priceP11429Gate')"),'P11429 price admission gate must remain mandatory');
assert(gradleBuild.includes("dependsOn tasks.named('priceP11430Interior')"),'P11430 price-interior five-read gate must remain mandatory');
assert(gradleBuild.includes("dependsOn tasks.named('routeG4SemanticIntegrityP11431')"),'G4 semantic-route regression must gate preBuild');
assert(gradleBuild.includes("dependsOn tasks.named('routeG4FinalIntegrityP11431')"),'G4 final zero-silent-error regression must gate preBuild');
assert(gradleBuild.includes("versionCode 8")&&gradleBuild.includes("versionName '1.4.0-ap01-p11431-g4-route-test'"),'Android version bump mismatch');
assert(plan.includes('routeG4SemanticDecision('),'route protection helper missing');
assert(plan.includes('route_semantic_unverified_'),'final route-undoable silent change guard missing');
assert(plan.includes('p11429RecognizePriceCell('),'P11430 decimal-safe price OCR remains present');
console.log('P114.31 mandatory price + G4 gate checks: PASS');
