#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.join(__dirname,'..');
const core=require(path.join(root,'app','src','main','assets','js','ocr-integrity-core.js'));
let source=fs.readFileSync(path.join(root,'app','src','main','assets','js','plan-import.js'),'utf8');
const end="  document.addEventListener('DOMContentLoaded', init);\n})();";
source=source.replace(end,"  window.__P1142Test=Object.freeze({sourceTruthPrimaryEdgeVeto,edgeTableGlyphNoise,singleInternalCompanyDelimiterLoss});\n})();");
const sandbox={console,window:{ATMSOcrIntegrityCore:core,addEventListener(){},removeEventListener(){},dispatchEvent(){},location:{href:'https://atms.test/'}},document:{currentScript:{src:'https://atms.test/js/plan-import.js'},addEventListener(){},getElementById(){return null;},createElement(){return {getContext(){return null;},style:{},addEventListener(){}};},body:{appendChild(){}}},location:{href:'https://atms.test/'},performance:{now:()=>0},setTimeout,clearTimeout,setInterval,clearInterval,Map,Set,WeakMap,Promise,Array,Object,Number,String,Boolean,Math,Date,RegExp,JSON,Intl,URL,Blob,FileReader:function(){},TextEncoder,TextDecoder,navigator:{},localStorage:{getItem(){return null;},setItem(){},removeItem(){}},sessionStorage:{getItem(){return null;},setItem(){},removeItem(){}},CustomEvent:function(){},Image:function(){},File:function(){}};
sandbox.globalThis=sandbox;vm.createContext(sandbox);vm.runInContext(source,sandbox);const api=sandbox.window.__P1142Test;assert(api);
const full=(v,m)=>({scope:'source_truth_full_cell',mode:m,candidate:v,cropQuality:{fullCellIncluded:true,leftEdgeClipped:false,rightEdgeClipped:false,neighborColumnIncluded:false}});
const exp=(v,m)=>({scope:'source_truth_edge_expanded',mode:m,candidate:v,cropQuality:{fullCellIncluded:true}});
const views=[full('Get-E','psm6'),full('Get-E','psm7')];
const positives=['| Get-E','| Get-E |','Get-E |'];
for (const c of positives) {
  const d=api.sourceTruthPrimaryEdgeVeto('Get-E',c,'company',views);
  assert.strictEqual(d?.reason,'source_truth_primary_table_edge_veto', c);
}
let d=api.sourceTruthPrimaryEdgeVeto('Get-E','GetE','company',views);
assert.strictEqual(d?.reason,'source_truth_primary_internal_delimiter_loss_veto');
assert.strictEqual(api.singleInternalCompanyDelimiterLoss('Get-E','GetE'),true);
// Existing positive stays green.
d=api.sourceTruthPrimaryEdgeVeto('Get-E','Get-','company',[exp('Get-E','psm6'),exp('Get-E','psm7')]);
assert.strictEqual(d?.reason,'source_truth_primary_edge_truncation_veto');
// Weak/disagreeing evidence stays fail-closed.
assert.strictEqual(api.sourceTruthPrimaryEdgeVeto('Get-E','| Get-E','company',[full('Get-E','psm6')]),null);
assert.strictEqual(api.sourceTruthPrimaryEdgeVeto('Get-E','GetE','company',[full('Get-E','psm6'),full('Get-A','psm7')]),null);
// Semantic and non-boundary alternatives remain conflicts.
assert.strictEqual(api.sourceTruthPrimaryEdgeVeto('Get-E','Get-A','company',views),null);
assert.strictEqual(api.sourceTruthPrimaryEdgeVeto('Get-E','Get E','company',views),null);
assert.strictEqual(api.sourceTruthPrimaryEdgeVeto('AB-CD','ABXD','company',[full('AB-CD','psm6'),full('AB-CD','psm7')]),null);
// Generic delimiter loss allowed only for one internal separator and exact otherwise.
assert.strictEqual(api.singleInternalCompanyDelimiterLoss('AB-CD','ABCD'),true);
assert.strictEqual(api.singleInternalCompanyDelimiterLoss('AB-CD','ABCE'),false);
assert.strictEqual(api.singleInternalCompanyDelimiterLoss('AB-CD-EF','ABCDEF'),false);
console.log('P114.2 company boundary veto self-test: PASS');
