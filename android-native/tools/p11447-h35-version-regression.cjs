#!/usr/bin/env node
'use strict';
// P11447 surgical release-pin coverage. Historical 6-module integrity is checked
// by the original h35-source-guard.cjs task, not short-circuited here.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const guard=read('tools/h35-source-guard.cjs');
const index=read('app/src/main/assets/index.html');
const sw=read('app/src/main/assets/service-worker.js');
const versionRe=/class="info-detail-label">Version<\/div><div class="info-detail-value">CORE-007D8A1F1D8P(\d+)<\/div>/;
const guardMatch=guard.match(/versionMatch && versionMatch\[1\]==='(\d+)'/g);
assert.deepEqual(guardMatch,["versionMatch && versionMatch[1]==='11447'"], 'H35 must keep exactly one exact current runtime version');
const pinnedMatch=guard.match(/const pinned=\{[^\n]+\};/g);
assert(pinnedMatch && pinnedMatch.length===1, 'H35 original pinned checks must remain');
assert.equal((pinnedMatch[0].match(/[a-f0-9]{40}/g)||[]).length,6,'six historical module SHA1 pins');
const runtime=(index.match(versionRe)||[])[1];
assert.equal(runtime,'11447', 'the actual runtime must be P11447');
const accepted = text => {
 const m=text.match(versionRe);
 return !!(m && m[1] === '11447');
};
assert(accepted(index),'matching P11447 runtime accepted');
for(const invalid of ['11446','11448','114470','0']) {
 assert(!accepted(index.replace('CORE-007D8A1F1D8P11447','CORE-007D8A1F1D8P'+invalid)),`wrong runtime ${invalid} must be blocked`);
}
assert(!accepted(index.replace('CORE-007D8A1F1D8P11447','CORE-INVALID')),'missing runtime must be blocked');
assert.equal(index.split('<script src="./js/plan-import.js?v=P11447" defer></script>').length,2,'single current import script tag');
assert.equal(index.split('CORE-007D8A1F1D8P11447').length,2,'single runtime version display');
assert(sw.includes('h35-modules-integrated'),'H35 offline source modules retained');
assert(guard.includes('assert.equal(shaGit(b),pinned[name]'), 'H35 module hash must still be checked');
assert(guard.includes('assert(position>previous'), 'H35 source module order must still be checked');
assert(guard.includes("!t.includes('localStorage.setItem(')"), 'H35 read-only guard must still be checked');
assert(guard.includes("!t.includes('indexedDB.open(')"), 'H35 no-IndexedDB guard must still be checked');
assert(guard.includes('historical H35 protection test failed: ${n}'),'H35 regression subprocesses must still run');
console.log('P11447 H35 bounded runtime version and retained history: 15 checks PASS (including 5 invalid runtime variants)');
