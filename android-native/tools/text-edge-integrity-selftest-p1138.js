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
"  window.__P1138Test=Object.freeze({strongPrimarySecondaryEdgeDegradation,primarySingleTokenRawEdgeRecovery,strongPrimaryRouteSecondaryEdgeDegradation,primaryRouteRawEdgeRecovery,routeSecondaryEdgeDecision});\n})();");
const sandbox={console,window:{ATMSOcrIntegrityCore:core,addEventListener(){},removeEventListener(){},dispatchEvent(){},location:{href:'https://atms.test/'}},document:{currentScript:{src:'https://atms.test/js/plan-import.js'},addEventListener(){},getElementById(){return null;},createElement(){return {getContext(){return null;},style:{},addEventListener(){}};},body:{appendChild(){}}},location:{href:'https://atms.test/'},performance:{now:()=>0},setTimeout,clearTimeout,setInterval,clearInterval,Map,Set,WeakMap,Promise,Array,Object,Number,String,Boolean,Math,Date,RegExp,JSON,Intl,URL,Blob,FileReader:function(){},TextEncoder,TextDecoder,navigator:{},localStorage:{getItem(){return null;},setItem(){},removeItem(){}},sessionStorage:{getItem(){return null;},setItem(){},removeItem(){}},CustomEvent:function(){},Image:function(){},File:function(){}};
sandbox.globalThis=sandbox;vm.createContext(sandbox);vm.runInContext(source,sandbox,{filename:'plan-import-p1138.js'});
const api=sandbox.window.__P1138Test;
assert(api);
const evidence=(raw,confidence=92,wordCount=1)=>({rawOcr:raw,normalizedValue:raw,confidence,wordCount});

// Android-confirmed pattern class: terminal punctuation substitution must be weaker than strong primary+peer evidence.
let d=api.strongPrimarySecondaryEdgeDegradation('Eurowings','Eurowing:',evidence('Eurowings',92,1),7,[]);
assert.strictEqual(d?.reason,'secondary_terminal_punctuation_substitution');
assert.strictEqual(api.strongPrimarySecondaryEdgeDegradation('Eurowings','EurowingX',evidence('Eurowings',92,1),7,[]),null);
assert.strictEqual(api.strongPrimarySecondaryEdgeDegradation('Eurowings','Eurowing:',evidence('Eurowings',60,1),7,[]),null);
assert.strictEqual(api.strongPrimarySecondaryEdgeDegradation('Eurowings','Eurowing:',evidence('Eurowings',92,1),0,[]),null);
assert.strictEqual(api.strongPrimarySecondaryEdgeDegradation('Eurowings','Eurowing:',evidence('Eurowings',92,1),7,[{scope:'cell_view',candidate:'Eurowing:'},{scope:'cell_view',candidate:'Eurowing:'}]),null);

// Hyphenated short company code: only strict edge truncation is suppressible.
d=api.strongPrimarySecondaryEdgeDegradation('Get-E','Get-',evidence('Get-E',92,1),2,[]);
assert.strictEqual(d?.reason,'secondary_short_code_edge_truncation');
assert.strictEqual(api.strongPrimarySecondaryEdgeDegradation('Get-E','Get-A',evidence('Get-E',92,1),2,[]),null);
assert.strictEqual(api.strongPrimarySecondaryEdgeDegradation('Get-E','Get-',evidence('Get-E',92,1),0,[]),null);

// Single-token place recovery from strong raw full-image evidence.
d=api.primarySingleTokenRawEdgeRecovery('msterdam','Amsterdam',evidence('Amsterdam',93,1));
assert.strictEqual(d?.candidate,'Amsterdam');
assert.strictEqual(d?.edge,'left');
assert.strictEqual(api.primarySingleTokenRawEdgeRecovery('msterdam','Rotterdam',evidence('Rotterdam',93,1)),null);
assert.strictEqual(api.primarySingleTokenRawEdgeRecovery('msterdam','Amsterdam',evidence('Amsterdam',60,1)),null);
assert.strictEqual(api.primarySingleTokenRawEdgeRecovery('msterdam','Amsterdam',evidence('Amsterdam',93,2)),null);

// Multi-token route: later inset secondary OCR may not overwrite strong longer primary raw edge evidence.
d=api.strongPrimaryRouteSecondaryEdgeDegradation('Marriott Seestern DUS','arriott Seestern DUS',evidence('Marriott Seestern DUS',85,3));
assert.strictEqual(d?.reason,'secondary_left_edge_degradation_against_strong_primary_raw');
assert.strictEqual(api.strongPrimaryRouteSecondaryEdgeDegradation('Marriott Seestern DUS','Sheraton Seestern DUS',evidence('Marriott Seestern DUS',95,3)),null);
assert.strictEqual(api.strongPrimaryRouteSecondaryEdgeDegradation('Marriott Seestern DUS','arriott Seestern DUS',evidence('Marriott Seestern DUS',60,3)),null);

// Historical P113.7 route guard still behaves fail-closed for real semantic changes.
assert.strictEqual(api.routeSecondaryEdgeDecision('North Garden Inn','South Garden Inn',['North Garden Inn',''],96,2),null);

console.log('P113.8 text-edge integrity local prototype self-test: PASS');
