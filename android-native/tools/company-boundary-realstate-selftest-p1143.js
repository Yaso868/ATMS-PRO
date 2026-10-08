#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.join(__dirname,'..');
const core=require(path.join(root,'app','src','main','assets','js','ocr-integrity-core.js'));
let source=fs.readFileSync(path.join(root,'app','src','main','assets','js','plan-import.js'),'utf8');
const end="  document.addEventListener('DOMContentLoaded', init);\n})();";
source=source.replace(end,"  window.__P1143Test=Object.freeze({sourceTruthFullCellConsensus,sourceTruthPrimaryEdgeVeto,strongPrimarySecondaryEdgeDegradation,singleInternalCompanyDelimiterLoss});\n})();");
const sandbox={console,window:{ATMSOcrIntegrityCore:core,addEventListener(){},removeEventListener(){},dispatchEvent(){},location:{href:'https://atms.test/'}},document:{currentScript:{src:'https://atms.test/js/plan-import.js'},addEventListener(){},getElementById(){return null;},createElement(){return {getContext(){return null;},style:{},addEventListener(){}};},body:{appendChild(){}}},location:{href:'https://atms.test/'},performance:{now:()=>0},setTimeout,clearTimeout,setInterval,clearInterval,Map,Set,WeakMap,Promise,Array,Object,Number,String,Boolean,Math,Date,RegExp,JSON,Intl,URL,Blob,FileReader:function(){},TextEncoder,TextDecoder,navigator:{},localStorage:{getItem(){return null;},setItem(){},removeItem(){}},sessionStorage:{getItem(){return null;},setItem(){},removeItem(){}},CustomEvent:function(){},Image:function(){},File:function(){}};
sandbox.globalThis=sandbox;vm.createContext(sandbox);vm.runInContext(source,sandbox);const api=sandbox.window.__P1143Test;assert(api);
const full=(v,m)=>({scope:'source_truth_full_cell',mode:m,candidate:v,field:'company',cropQuality:{fullCellIncluded:true,leftEdgeClipped:false,rightEdgeClipped:false,neighborColumnIncluded:false}});
// Reproduce actual WA0001 secondary table-rule states, while full-cell OCR may itself retain the printed rule.
for (const c of ['| Get-E','| Get-E |','Get-E |']) {
  const attempts=[full('| Get-E |','psm6'),full('Get-E |','psm7')];
  const cons=api.sourceTruthFullCellConsensus(attempts);
  assert.strictEqual(cons?.candidate,'Get-E',`normalized consensus failed for ${c}`);
  const d=api.sourceTruthPrimaryEdgeVeto('Get-E',c,'company',attempts);
  assert.strictEqual(d?.reason,'source_truth_primary_table_edge_veto',`veto failed for ${c}`);
}
// Reproduce delimiter-loss state where source-truth may also lose the hyphen; use strong high-confidence primary + repeated peers.
const delimiterAttempts=[full('GetE','psm6'),full('GetE','psm7')];
assert.strictEqual(api.sourceTruthPrimaryEdgeVeto('Get-E','GetE','company',delimiterAttempts),null);
let d=api.strongPrimarySecondaryEdgeDegradation('Get-E','GetE',{rawOcr:'Get-E',normalizedValue:'Get-E',confidence:92},2,delimiterAttempts);
assert.strictEqual(d?.reason,'secondary_internal_company_delimiter_loss');
// One peer is deliberately insufficient for internal delimiter loss.
d=api.strongPrimarySecondaryEdgeDegradation('Get-E','GetE',{rawOcr:'Get-E',normalizedValue:'Get-E',confidence:92},1,delimiterAttempts);
assert.strictEqual(d,null);
// Semantic alternatives remain blocked.
assert.strictEqual(api.strongPrimarySecondaryEdgeDegradation('Get-E','GetA',{rawOcr:'Get-E',normalizedValue:'Get-E',confidence:92},4,delimiterAttempts),null);

// Full-cell normalization must not mutate internal semantic content.
let semanticAttempts=[full('| Get-A |','psm6'),full('Get-A |','psm7')];
assert.strictEqual(api.sourceTruthFullCellConsensus(semanticAttempts)?.candidate,'Get-A');
assert.strictEqual(api.sourceTruthPrimaryEdgeVeto('Get-E','Get-A','company',semanticAttempts),null);

// Delimiter-loss fallback needs strong exact raw primary OCR and >=2 same-plan peers.
assert.strictEqual(api.strongPrimarySecondaryEdgeDegradation('Get-E','GetE',{rawOcr:'GetE',normalizedValue:'GetE',confidence:99},4,delimiterAttempts),null);
assert.strictEqual(api.strongPrimarySecondaryEdgeDegradation('Get-E','GetE',{rawOcr:'Get-E',normalizedValue:'Get-E',confidence:79},4,delimiterAttempts),null);

// Two exact cell-view votes for the secondary value are competing evidence and must block release.
const competing=delimiterAttempts.concat([
  {scope:'cell_view',mode:'a',candidate:'GetE'},
  {scope:'cell_view',mode:'b',candidate:'GetE'}
]);
assert.strictEqual(api.strongPrimarySecondaryEdgeDegradation('Get-E','GetE',{rawOcr:'Get-E',normalizedValue:'Get-E',confidence:92},4,competing),null);

// Delimiter changed to whitespace is not the same as one missing delimiter.
assert.strictEqual(api.strongPrimarySecondaryEdgeDegradation('Get-E','Get E',{rawOcr:'Get-E',normalizedValue:'Get-E',confidence:92},4,delimiterAttempts),null);

console.log('P114.3 WA0001 real-state company-boundary self-test: PASS');
