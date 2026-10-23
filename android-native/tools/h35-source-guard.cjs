#!/usr/bin/env node
'use strict';
// Every old source module is pinned to the byte-exact code held on GitHub testbranch;
// H35 review is NEVER an independent import permission.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const assets=path.join(root,'app/src/main/assets');
const pinned={"h13-review-only.js": "b537a042d19020b234d7a705cef94368c6b6cbde", "h15-ride-drafts.js": "cbf832f20efa333e3c375ab4b050103c5af16216", "h17-geometry-candidates.js": "c7a9a63a32b283eca1b51b1fa4785cd25352395c", "h19-pixel-review.js": "23ffb7bf3116383dc9173834082f1af8badbdbe2", "h26-source-band-audit.js": "5bacb510a95ea0317c77492f2c0b72e4b452fb4b", "h27-source-cell-focus.js": "8bab1e7a8c3047dba839bfcbca6ca4c213b3eac0"};
function shaGit(b){return crypto.createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${b.length}\0`),b])).digest('hex')}
const index=fs.readFileSync(path.join(assets,'index.html'),'utf8');
const sw=fs.readFileSync(path.join(assets,'service-worker.js'),'utf8');
assert.match(index,/id="h13ReviewPanel"[^>]*hidden|id="h13ReviewPanel"\s+hidden/,'missing hidden H13 blocked-row review UI');
assert.match(sw,/cache\.addAll\(APP_SHELL\)/,'offline app-shell preload missing');
assert.match(sw,/h35-modules-integrated/,'new cache generation missing');
const shell=sw.slice(sw.indexOf('const APP_SHELL = ['),sw.indexOf('];',sw.indexOf('const APP_SHELL = [')));
const order=['h17-geometry-candidates.js','h26-source-band-audit.js','h27-source-cell-focus.js','h19-pixel-review.js','h15-ride-drafts.js','h13-review-only.js'];
let previous=-1;
for(const name of order){
 const filename=path.join(assets,'js',name),b=fs.readFileSync(filename);
 assert.equal(shaGit(b),pinned[name],`original source changed for ${name}`);
 const src=`./js/${name}?v=P11436H35`;
 assert.equal(index.split(src).length,2,`${name} script missing or repeated in HTML`);
 assert.equal(shell.split(`"${src}"`).length,2,`${name} missing or repeated in offline APP_SHELL`);
 const position=index.indexOf(src);
 assert(position>previous,`review module execution order wrong: ${name}`);
 previous=position;
}
// P11439: preserve H35 helper hashes/order; assert the current diagnostic import bundle loads after them.
const versionMatch = index.match(/class="info-detail-label">Version<\/div><div class="info-detail-value">CORE-007D8A1F1D8P(\d+)<\/div>/);
assert(versionMatch && versionMatch[1]==='11449', 'unexpected current H35 runtime generation');
const planScript=`<script src="./js/plan-import.js?v=P${versionMatch[1]}" defer></script>`;
assert.equal(index.split(planScript).length,2,'current P11441 plan-import script missing or repeated');
assert(previous<index.indexOf(planScript),'blocked-row helpers must load before import JS');
for(const name of ['h13-review-only.js','h15-ride-drafts.js','h17-geometry-candidates.js','h19-pixel-review.js','h26-source-band-audit.js','h27-source-cell-focus.js']){
 const t=fs.readFileSync(path.join(assets,'js',name),'utf8');
 assert(!t.includes('localStorage.setItem(')&&!t.includes('indexedDB.open('),'review module must not persist state');
}
const env={...process.env,ATMS_H15_ANDROID_NATIVE:root,ATMS_H19_NATIVE:root,ATMS_H26_NATIVE:root,ATMS_H27_NATIVE:root,ATMS_H35_NATIVE:root};
const names=['test_h15_draft.cjs','test_h19_negative.cjs','test_h26_source_band.cjs','test_h27_focus.cjs','test_h35_photo_day_bind.cjs'];
for(const n of names){
 const p=cp.spawnSync(process.execPath,[path.join(root,'tools/h35-regression',n)],{env,encoding:'utf8',timeout:20000});
 assert.equal(p.status,0,`historical H35 protection test failed: ${n}\n${p.stdout}\n${p.stderr}`);
 process.stdout.write((p.stdout||'').trim()+'\n');
}
console.log('H35 historical 6-module source + offline script + readonly safety preBuild gate: PASS');
