#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.join(__dirname,'..');
const core=require(path.join(root,'app','src','main','assets','js','ocr-integrity-core.js'));
let source=fs.readFileSync(path.join(root,'app','src','main','assets','js','plan-import.js'),'utf8');
const end="  document.addEventListener('DOMContentLoaded', init);\n})();";
source=source.replace(end,"  window.__P1145Test=Object.freeze({sourceTruthPrimaryEdgeVeto,strongPrimarySecondaryEdgeDegradation,singleInternalCompanyDelimiterLoss,edgeTableGlyphNoise});\n})();");
const sandbox={console,window:{ATMSOcrIntegrityCore:core,addEventListener(){},removeEventListener(){},dispatchEvent(){},location:{href:'https://atms.test/'}},document:{currentScript:{src:'https://atms.test/js/plan-import.js'},addEventListener(){},getElementById(){return null;},createElement(){return {getContext(){return null;},style:{},addEventListener(){}};},body:{appendChild(){}}},location:{href:'https://atms.test/'},performance:{now:()=>0},setTimeout,clearTimeout,setInterval,clearInterval,Map,Set,WeakMap,Promise,Array,Object,Number,String,Boolean,Math,Date,RegExp,JSON,Intl,URL,Blob,FileReader:function(){},TextEncoder,TextDecoder,navigator:{},localStorage:{getItem(){return null;},setItem(){},removeItem(){}},sessionStorage:{getItem(){return null;},setItem(){},removeItem(){}},CustomEvent:function(){},Image:function(){},File:function(){}};
sandbox.globalThis=sandbox;vm.createContext(sandbox);vm.runInContext(source,sandbox);const api=sandbox.window.__P1145Test;assert(api);

// Real-device P114.4 failure: secondary is primary plus only an extreme table rule.
// This geometry-only difference must be suppressed even if extra source-truth OCR
// cannot produce two stable views.
for (const c of ['| Get-E','| Get-E |','Get-E |','¦ Get-E │']) {
  const d=api.sourceTruthPrimaryEdgeVeto('Get-E',c,'company',[],3);
  assert.strictEqual(d?.reason,'secondary_extreme_table_rule_noise',`table-rule veto failed for ${c}`);
}

// Never strip internal rule glyphs or semantic characters.
for (const c of ['Get|E','Get-A','X Get-E','Get-E X','Get-E!']) {
  assert.strictEqual(api.sourceTruthPrimaryEdgeVeto('Get-E',c,'company',[],3),null,`semantic candidate incorrectly vetoed: ${c}`);
}

// Delimiter loss may be suppressed from repeated exact plan primaries even when raw
// confidence/source-truth is weak, but only at >=3 OTHER peers.
const weak={rawOcr:'GetE',normalizedValue:'GetE',confidence:40};
const recordedConsensus={from:'GetE',to:'Get-E',evidenceCount:6,source:'short_company_code_near_consensus'};
assert.strictEqual(api.strongPrimarySecondaryEdgeDegradation('Get-E','GetE',weak,6,[]),null);
let d=api.strongPrimarySecondaryEdgeDegradation('Get-E','GetE',weak,6,[],recordedConsensus);
assert.strictEqual(d?.reason,'secondary_internal_company_delimiter_loss');
// Too little recorded consensus is insufficient.
assert.strictEqual(api.strongPrimarySecondaryEdgeDegradation('Get-E','GetE',weak,6,[],{from:'GetE',to:'Get-E',evidenceCount:2}),null);
// A consensus for some other discarded form cannot release this candidate.
assert.strictEqual(api.strongPrimarySecondaryEdgeDegradation('Get-E','GetE',weak,6,[],{from:'GetA',to:'Get-E',evidenceCount:6}),null);

// Competing two-view exact-cell evidence for GetE keeps fail-closed.
const competing=[{scope:'cell_view',mode:'a',candidate:'GetE'},{scope:'cell_view',mode:'b',candidate:'GetE'}];
assert.strictEqual(api.strongPrimarySecondaryEdgeDegradation('Get-E','GetE',weak,6,competing,recordedConsensus),null);

// Semantic or whitespace changes remain conflicts regardless of peer count/consensus.
for (const c of ['Get-A','Get E','GetX','Get--E']) {
  assert.strictEqual(api.strongPrimarySecondaryEdgeDegradation('Get-E',c,weak,8,[],recordedConsensus),null,`semantic delimiter case incorrectly vetoed: ${c}`);
}

// Rule stripping applies only to bounded probe fields/patterns.
assert.strictEqual(api.sourceTruthPrimaryEdgeVeto('Eurowings','| Eurowings |','company',[],5),null);
assert.strictEqual(api.sourceTruthPrimaryEdgeVeto('Get-E','| Get-E |','customer',[],5),null);

console.log('P114.5 deterministic secondary boundary classification self-test: PASS');
