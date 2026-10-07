#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.join(__dirname,'..');
const core=require(path.join(root,'app','src','main','assets','js','ocr-integrity-core.js'));
let source=fs.readFileSync(path.join(root,'app','src','main','assets','js','plan-import.js'),'utf8');
const end="  document.addEventListener('DOMContentLoaded', init);\n})();";
source=source.replace(end,"  window.__P1141Test=Object.freeze({strictTextEdgeExtension,sourceTruthFullCellConsensus,sourceTruthExpandedCellConsensus,sourceTruthPrimaryEdgeVeto,edgeTableGlyphNoise,sourceTruthCellCandidate});\n})();");
const sandbox={console,window:{ATMSOcrIntegrityCore:core,addEventListener(){},removeEventListener(){},dispatchEvent(){},location:{href:'https://atms.test/'}},document:{currentScript:{src:'https://atms.test/js/plan-import.js'},addEventListener(){},getElementById(){return null;},createElement(){return {getContext(){return null;},style:{},addEventListener(){}};},body:{appendChild(){}}},location:{href:'https://atms.test/'},performance:{now:()=>0},setTimeout,clearTimeout,setInterval,clearInterval,Map,Set,WeakMap,Promise,Array,Object,Number,String,Boolean,Math,Date,RegExp,JSON,Intl,URL,Blob,FileReader:function(){},TextEncoder,TextDecoder,navigator:{},localStorage:{getItem(){return null;},setItem(){},removeItem(){}},sessionStorage:{getItem(){return null;},setItem(){},removeItem(){}},CustomEvent:function(){},Image:function(){},File:function(){}};
sandbox.globalThis=sandbox;vm.createContext(sandbox);vm.runInContext(source,sandbox);const api=sandbox.window.__P1141Test;assert(api);
const full=(v,m)=>({scope:'source_truth_full_cell',mode:m,candidate:v,cropQuality:{fullCellIncluded:true,leftEdgeClipped:false,rightEdgeClipped:false,neighborColumnIncluded:false}});
const exp=(v,m)=>({scope:'source_truth_edge_expanded',mode:m,candidate:v,cropQuality:{fullCellIncluded:true}});
// Real-device-shaped positive cases.
let d=api.sourceTruthPrimaryEdgeVeto('Get-E','Get-','company',[exp('Get-E','psm6'),exp('Get-E','psm7')]);
assert.strictEqual(d?.reason,'source_truth_primary_edge_truncation_veto');
assert.strictEqual(d?.source,'edge_expanded');
d=api.sourceTruthPrimaryEdgeVeto('Amsterdam','msterdam','flightLocation',[exp('Amsterdam','psm6'),exp('Amsterdam','psm7')]);
assert.strictEqual(d?.reason,'source_truth_primary_edge_truncation_veto');
d=api.sourceTruthPrimaryEdgeVeto('Krakau','Krakau |','flightLocation',[full('Krakau','psm6'),full('Krakau','psm7')]);
assert.strictEqual(d?.reason,'source_truth_primary_table_edge_veto');
assert.strictEqual(api.sourceTruthCellCandidate('Krakau |','flightLocation'),'Krakau');
// Negative/fail-closed.
assert.strictEqual(api.sourceTruthPrimaryEdgeVeto('Get-E','Get-A','company',[exp('Get-E','psm6'),exp('Get-E','psm7')]),null);
assert.strictEqual(api.sourceTruthPrimaryEdgeVeto('Amsterdam','Rotterdam','flightLocation',[exp('Amsterdam','psm6'),exp('Amsterdam','psm7')]),null);
assert.strictEqual(api.sourceTruthPrimaryEdgeVeto('Krakau','Prag |','flightLocation',[full('Krakau','psm6'),full('Krakau','psm7')]),null);
assert.strictEqual(api.sourceTruthPrimaryEdgeVeto('Get-E','Get-','company',[exp('Get-E','psm6')]),null);
assert.strictEqual(api.sourceTruthPrimaryEdgeVeto('Amsterdam','msterdam','flightLocation',[exp('Amsterdam','psm6'),exp('Rotterdam','psm7')]),null);
assert.strictEqual(api.sourceTruthPrimaryEdgeVeto('Paris','Paris |','flightLocation',[]),null);
console.log('P114.1 edge primary source-truth veto self-test: PASS');
