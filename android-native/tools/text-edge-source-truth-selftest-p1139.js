#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const assert=require('assert');
const root=path.join(__dirname,'..');
const core=require(path.join(root,'app','src','main','assets','js','ocr-integrity-core.js'));
let source=fs.readFileSync(path.join(root,'app','src','main','assets','js','plan-import.js'),'utf8');
const endMarker="  document.addEventListener('DOMContentLoaded', init);\n})();";
if(!source.includes(endMarker)) throw new Error('hook marker missing');
source=source.replace(endMarker,
"  window.__P1139Test=Object.freeze({strictTextEdgeExtension,sourceTruthCellCandidate,sourceTruthFullCellConsensus,sourceTruthEdgeRecovery,strongPrimarySecondaryEdgeDegradation,isHyphenatedCompanyEdgeProbe,isSingleTokenFlightLocationEdgeProbe});\n})();");
const sandbox={console,window:{ATMSOcrIntegrityCore:core,addEventListener(){},removeEventListener(){},dispatchEvent(){},location:{href:'https://atms.test/'}},document:{currentScript:{src:'https://atms.test/js/plan-import.js'},addEventListener(){},getElementById(){return null;},createElement(){return {getContext(){return null;},style:{},addEventListener(){}};},body:{appendChild(){}}},location:{href:'https://atms.test/'},performance:{now:()=>0},setTimeout,clearTimeout,setInterval,clearInterval,Map,Set,WeakMap,Promise,Array,Object,Number,String,Boolean,Math,Date,RegExp,JSON,Intl,URL,Blob,FileReader:function(){},TextEncoder,TextDecoder,navigator:{},localStorage:{getItem(){return null;},setItem(){},removeItem(){}},sessionStorage:{getItem(){return null;},setItem(){},removeItem(){}},CustomEvent:function(){},Image:function(){},File:function(){}};
sandbox.globalThis=sandbox;vm.createContext(sandbox);vm.runInContext(source,sandbox,{filename:'plan-import-p1139.js'});
const api=sandbox.window.__P1139Test; assert(api);
const q={fullCellIncluded:true,leftEdgeClipped:false,rightEdgeClipped:false,neighborColumnIncluded:false,targetCellGeometryConfirmed:true};
const view=(candidate,mode,quality=q)=>({scope:'source_truth_full_cell',mode,candidate,cropQuality:{...quality}});

// Company source-truth crop may include a literal vertical table rule. The rule is
// removable only as an extreme-edge glyph; the actual hyphenated code is preserved.
assert.strictEqual(api.sourceTruthCellCandidate('Get-E |','company'),'Get-E');
assert.strictEqual(api.sourceTruthCellCandidate('| Get-E','company'),'Get-E');
assert.strictEqual(api.sourceTruthCellCandidate('Get-E','company'),'Get-E');
assert.strictEqual(api.sourceTruthCellCandidate('Get-A','company'),'Get-A');

let attempts=[view('Get-E','psm6'),view('Get-E','psm7')];
assert.strictEqual(api.isHyphenatedCompanyEdgeProbe('Get-E'),true);
assert.strictEqual(api.isHyphenatedCompanyEdgeProbe('WT'),false);
let d=api.strongPrimarySecondaryEdgeDegradation('Get-E','Get-',{rawOcr:'Get-',normalizedValue:'Get-',confidence:92,wordCount:1},2,attempts);
assert.strictEqual(d?.reason,'secondary_short_code_edge_truncation');
assert.strictEqual(d?.sourceTruthViews,2);
assert.strictEqual(api.strongPrimarySecondaryEdgeDegradation('Get-E','Get-A',{rawOcr:'Get-',normalizedValue:'Get-',confidence:92,wordCount:1},2,attempts),null);
assert.strictEqual(api.strongPrimarySecondaryEdgeDegradation('Get-E','Get-',{rawOcr:'Get-',normalizedValue:'Get-',confidence:92,wordCount:1},0,attempts),null);
assert.strictEqual(api.strongPrimarySecondaryEdgeDegradation('Get-E','Get-',{rawOcr:'Get-',normalizedValue:'Get-',confidence:92,wordCount:1},2,[view('Get-E','psm6')]),null);
assert.strictEqual(api.strongPrimarySecondaryEdgeDegradation('Get-E','Get-',{rawOcr:'Get-',normalizedValue:'Get-',confidence:92,wordCount:1},2,[view('Get-E','psm6'),view('Get-A','psm7')]),null);

assert.strictEqual(api.isSingleTokenFlightLocationEdgeProbe('msterdam'),true);
attempts=[view('Amsterdam','psm6'),view('Amsterdam','psm7')];
d=api.sourceTruthEdgeRecovery('msterdam',attempts);
assert.strictEqual(d?.candidate,'Amsterdam');
assert.strictEqual(d?.edge,'left');
assert.strictEqual(d?.loss,1);
assert.strictEqual(api.sourceTruthEdgeRecovery('msterdam',[view('Rotterdam','psm6'),view('Rotterdam','psm7')]),null);
assert.strictEqual(api.sourceTruthEdgeRecovery('msterdam',[view('Amsterdam','psm6')]),null);
assert.strictEqual(api.sourceTruthEdgeRecovery('msterdam',[view('Amsterdam','psm6'),view('Rotterdam','psm7')]),null);
assert.strictEqual(api.sourceTruthEdgeRecovery('msterdam',[view('Amsterdam','psm6',{...q,neighborColumnIncluded:true}),view('Amsterdam','psm7')]),null);
assert.strictEqual(api.sourceTruthEdgeRecovery('msterdam',[view('Amsterdam','psm6',{...q,leftEdgeClipped:true}),view('Amsterdam','psm7')]),null);
assert.strictEqual(api.sourceTruthEdgeRecovery('terdam',[view('Amsterdam','psm6'),view('Amsterdam','psm7')]),null,'loss >2 must remain fail-closed');
console.log('P113.9 source-truth full-cell text-edge self-test: PASS');
