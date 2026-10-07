#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.join(__dirname,'..');
const core=require(path.join(root,'app','src','main','assets','js','ocr-integrity-core.js'));
let source=fs.readFileSync(path.join(root,'app','src','main','assets','js','plan-import.js'),'utf8');
const end="  document.addEventListener('DOMContentLoaded', init);\n})();";
source=source.replace(end,"  window.__P1140Test=Object.freeze({strictTextEdgeExtension,sourceTruthFullCellConsensus,sourceTruthEdgeRecovery,sourceTruthExpandedEdgeRecovery,isHyphenatedCompanyEdgeProbe,isSingleTokenFlightLocationEdgeProbe});\n})();");
const sandbox={console,window:{ATMSOcrIntegrityCore:core,addEventListener(){},removeEventListener(){},dispatchEvent(){},location:{href:'https://atms.test/'}},document:{currentScript:{src:'https://atms.test/js/plan-import.js'},addEventListener(){},getElementById(){return null;},createElement(){return {getContext(){return null;},style:{},addEventListener(){}};},body:{appendChild(){}}},location:{href:'https://atms.test/'},performance:{now:()=>0},setTimeout,clearTimeout,setInterval,clearInterval,Map,Set,WeakMap,Promise,Array,Object,Number,String,Boolean,Math,Date,RegExp,JSON,Intl,URL,Blob,FileReader:function(){},TextEncoder,TextDecoder,navigator:{},localStorage:{getItem(){return null;},setItem(){},removeItem(){}},sessionStorage:{getItem(){return null;},setItem(){},removeItem(){}},CustomEvent:function(){},Image:function(){},File:function(){}};
sandbox.globalThis=sandbox;vm.createContext(sandbox);vm.runInContext(source,sandbox);
const api=sandbox.window.__P1140Test;assert(api);

// The production company veto must be source-truth driven and must not reintroduce
// the unrelated same-plan peer requirement that caused the P113.9 real-device block.
const companyVetoStart=source.indexOf('const sourceTruthKeepsCompanyPrimary = Boolean(');
assert(companyVetoStart>=0,'P114.0 company source-truth veto missing');
const companyVetoEnd=source.indexOf(');',companyVetoStart);
const companyVetoBlock=source.slice(companyVetoStart,companyVetoEnd+2);
assert(!companyVetoBlock.includes('primaryPeerCount'),'P114.0 company veto must not require a plan peer');
assert(companyVetoBlock.includes('sourceTruthConsensus'),'P114.0 company veto must require full-cell source-truth consensus');
assert(source.includes('sourceTruthExpandedEdgeTextOcr'),'P114.0 expanded source-truth OCR collector missing');
assert(source.includes('source_truth_expanded_cell_edge_consensus'),'P114.0 expanded source-truth correction source must remain diagnosable');
const q={fullCellIncluded:true,leftEdgeClipped:false,rightEdgeClipped:false,neighborColumnIncluded:false};
const full=(v,m)=>({scope:'source_truth_full_cell',mode:m,candidate:v,cropQuality:{...q}});
const exp=(v,m)=>({scope:'source_truth_edge_expanded',mode:m,candidate:v,cropQuality:{fullCellIncluded:true}});
// Company: two source-truth modes confirm the longer hyphenated primary even when there is no peer.
let cons=api.sourceTruthFullCellConsensus([full('Get-E','psm6'),full('Get-E','psm7')]);
assert.strictEqual(cons?.candidate,'Get-E');
assert.strictEqual(api.isHyphenatedCompanyEdgeProbe('Get-E'),true);
{ const e=api.strictTextEdgeExtension('Get-','Get-E',2); assert.strictEqual(e?.edge,'right'); assert.strictEqual(e?.loss,1); }
// Semantic conflict must not look like edge truncation.
assert.strictEqual(api.strictTextEdgeExtension('Get-A','Get-E',2),null);
// One source-truth view is insufficient.
assert.strictEqual(api.sourceTruthFullCellConsensus([full('Get-E','psm6')]),null);
// Flight location expanded family: two independent modes can restore only a strict 1-2 glyph edge extension.
let d=api.sourceTruthExpandedEdgeRecovery('msterdam',[exp('Amsterdam','psm6'),exp('Amsterdam','psm7')]);
assert.strictEqual(d?.candidate,'Amsterdam');assert.strictEqual(d?.edge,'left');assert.strictEqual(d?.loss,1);
assert.strictEqual(api.sourceTruthExpandedEdgeRecovery('msterdam',[exp('Amsterdam','psm6')]),null);
assert.strictEqual(api.sourceTruthExpandedEdgeRecovery('msterdam',[exp('Amsterdam','psm6'),exp('Rotterdam','psm7')]),null);
assert.strictEqual(api.sourceTruthExpandedEdgeRecovery('msterdam',[exp('19:20 Amsterdam','psm6'),exp('19:20 Amsterdam','psm7')]),null);
assert.strictEqual(api.sourceTruthExpandedEdgeRecovery('msterdam',[exp('Rotterdam','psm6'),exp('Rotterdam','psm7')]),null);
assert.strictEqual(api.sourceTruthExpandedEdgeRecovery('terdam',[exp('Amsterdam','psm6'),exp('Amsterdam','psm7')]),null);
console.log('P114.0 edge source-truth integrity self-test: PASS');
