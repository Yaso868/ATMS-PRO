#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function validate(g,m,d,i,sw,pwa){
 const errors=[];const need=(ok,msg)=>{if(!ok)errors.push(msg);};
 need(g.includes("applicationId 'de.atmspro.app'"),'namespace base changed');
 need((g.match(/applicationIdSuffix '\.qa2'/g)||[]).length===2,'QA2 suffix not set for debug+release');
 need(!g.includes("applicationIdSuffix '.qa'"),'legacy QA suffix still present');
 need(g.includes('signingConfig signingConfigs.atmsStable'),'stable signing config not active for debug');
 need(g.includes('refusing ephemeral debug certificate'),'missing fail-closed fallback rule');
 need(g.includes('versionCode 21')&&g.includes('p11445-qa2-row-fence'),'version not aligned');
 need(m.includes('android:label="ATMS PRO TEST 2"')&&d.includes('android:label="ATMS PRO TEST 2"'),'missing separate launcher label');
 need(i.includes('CORE-007D8A1F1D8P11445'),'runtime version not P11445');
 need(sw.includes('p11445-row-fence-qa2'),'cache not P11445');
 need(pwa.includes('service-worker.js?v=P11445'),'PWA registration not P11445');
 need(g.includes("dependsOn tasks.named('runtimeAssetAlignmentP11445')"),'runtime gate missing');
 need(g.includes("dependsOn tasks.named('qa2SigningSourceSafetyP11445')"),'signing source gate missing');
 need(g.includes("finalizedBy tasks.named('verifyQa2SignedApkP11438')"),'post-build real APK signed gate missing');
 need(g.includes('verifyPackagedOcrLanguageAssetsP11437'),'keep OCR 404 after-build prevention gate');
 need(read('app/src/main/assets/js/atms-offline-tesseract.js').includes('gzip: false'),'OCR 404 fix missing');
 return errors;
}
const args=[read('app/build.gradle'),read('app/src/main/AndroidManifest.xml'),read('app/src/debug/AndroidManifest.xml'),read('app/src/main/assets/index.html'),read('app/src/main/assets/service-worker.js'),read('app/src/main/assets/js/pwa.js')];
assert.deepEqual(validate(...args),[]);
const bad=[
 ['old debug suffix',0,"applicationIdSuffix '.qa2'","applicationIdSuffix '.qa'"],
 ['missing signing',0,'signingConfig signingConfigs.atmsStable','// signing missing'],
 ['missing no-fallback',0,'refusing ephemeral debug certificate','allow random cert'],
 ['missing APK signing gate',0,"finalizedBy tasks.named('verifyQa2SignedApkP11438')",'// missing signing gate'],
 ['old runtime version',3,'CORE-007D8A1F1D8P11445','CORE-007D8A1F1D8P11437'],
 ['stale cache',4,'p11445-row-fence-qa2','p11437-daily-ui-r1-qa-only'],
 ['stale SW',5,'service-worker.js?v=P11445','service-worker.js?v=P11437'],
 ['wrong launcher',2,'ATMS PRO TEST 2','ATMS PRO TEST']
];
for(const [name,index,old,next] of bad){const tmp=[...args];assert(tmp[index].includes(old),name+' fixture');tmp[index]=tmp[index].replace(old,next);assert(validate(...tmp).length>0,name+' not caught');}
console.log('P11445 QA2 signing + isolated package source: PASS (8 negative tests)');
