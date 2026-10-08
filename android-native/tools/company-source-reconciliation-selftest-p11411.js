#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.join(__dirname,'..');
const core=require(path.join(root,'app/src/main/assets/js/ocr-integrity-core.js'));
let source=fs.readFileSync(path.join(root,'app/src/main/assets/js/plan-import.js'),'utf8');
const end="  document.addEventListener('DOMContentLoaded', init);\n})();";
assert(source.includes(end),'production test hook must be installed');
source=source.replace(end,"  window.__P11411Test={adaptiveCompanyTailConsensus,verifiedCompanySourceReconciliation,applyRepeatedTextConsistency,reconcileCompanyConflictAfterRepeatedConsistency,markZeroSilentErrorIntegrity,validate};\n})();");
const s={console,window:{ATMSOcrIntegrityCore:core,addEventListener(){},removeEventListener(){},dispatchEvent(){},location:{href:'https://atms.test/'}},document:{currentScript:{src:'https://atms.test/js/plan-import.js'},addEventListener(){},getElementById(){return null;},createElement(){return {getContext(){return null;},style:{},addEventListener(){}};},body:{appendChild(){}}},location:{href:'https://atms.test/'},performance:{now:()=>0},setTimeout,clearTimeout,setInterval,clearInterval,Map,Set,WeakMap,Promise,Array,Object,Number,String,Boolean,Math,Date,RegExp,JSON,Intl,URL,Blob,FileReader:function(){},TextEncoder,TextDecoder,navigator:{},localStorage:{getItem(){return null;},setItem(){},removeItem(){}},sessionStorage:{getItem(){return null;},setItem(){},removeItem(){}},CustomEvent:function(){},Image:function(){},File:function(){}};
s.globalThis=s;vm.createContext(s);vm.runInContext(source,s);const api=s.window.__P11411Test;
const fixture=JSON.parse(fs.readFileSync(path.join(root,'tools/fixtures/golden-regression/P11410_REALGERAET_FIRMENKONFLIKT_DIAGNOSE.json'),'utf8'));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'tools/fixtures/golden-regression/ATMS_GOLDEN_REGRESSION_PACK_FINAL_manifest.json'),'utf8'));
const cases=manifest.cases||[];
assert.equal(manifest.summary.caseRecords,60);assert.equal(cases.length,60);
const target=cases.find(c=>c.id==='GE-20261007-WA0001-R17-PRIMARY-ALREADY-CORRECT-P1146');
assert(target,'original existing Golden Error remains; no duplicate case');
assert.equal(fixture.sourceSha256,'f0b44c22cbd06afb0594920aed04e2c4eb6333c312054451af0988333526673d');
assert.equal(fixture.attempts.length,9); // actual recorded Android attempts
const base=fixture.attempts.map(a=>({...a,cropQuality:a.cropQuality?{...a.cropQuality}:undefined}));
for(const a of base){if(a.scope==='source_truth_adaptive_company'){a.sourceRow=fixture.sourceRow;a.sourceColumn=fixture.sourceColumn;a.field='company';}}
const sourcePrimary={...fixture.primarySourceEvidence,sourceRow:fixture.sourceRow,sourceColumn:fixture.sourceColumn,cropQuality:{...fixture.primarySourceEvidence.cropQuality}};
function build({attempts=base, primary=sourcePrimary, current=fixture.originalValue, secondary=fixture.secondaryValue, peers=fixture.peerCount, sourceColumn=fixture.sourceColumn, row=fixture.sourceRow, flagged=true}={}){
 const first={sourceRow:row,sourceImageOcr:true,company:current,companyOcrConflict:flagged,companyOcrConflictCandidate:secondary,customer:'Real device test',imageCellEvidence:{company:{sourceColumn,verificationSource:fixture.verificationSource,verificationAttempts:attempts,primarySourceEvidence:primary,manualCheckRequired:true}}};
 const rows=[first];for(let n=0;n<peers;n++)rows.push({sourceRow:35+n,sourceImageOcr:true,company:current});
 const after=api.applyRepeatedTextConsistency(rows);
 const reconciled=api.reconcileCompanyConflictAfterRepeatedConsistency(after);
 const gated=api.markZeroSilentErrorIntegrity(reconciled);
 const errors=api.validate(gated).filter(x=>x.level==='error' && /Firma/.test(x.text));
 return {entry:gated[0],errors,proof:api.verifiedCompanySourceReconciliation(after[0],current,secondary,peers,attempts)};
}
let checks=0;
function permitted(name,args={}){const r=build(args);assert.strictEqual(r.entry.companyOcrConflict,false,name+' must resolve');assert.strictEqual(r.errors.length,0,name+' final validate must allow');assert.strictEqual(r.entry.company,fixture.originalValue,name+' must not mutate primary');checks++;console.log('POSITIVE PASS',name);}
function blocked(name,args={}){const r=build(args);assert.strictEqual(r.entry.companyOcrConflict,true,name+' must block');assert(r.errors.length>0,name+' final validate must block');checks++;console.log('FAIL-CLOSED PASS',name);}
const copy=()=>base.map(x=>({...x,cropQuality:x.cropQuality?{...x.cropQuality}:undefined}));
permitted('ACTUAL P11410 ANDROID TRACE 9 OCR attempts: source weighted, 0 company errors');
let clean=copy().filter(x=>x.scope!=='source_truth_edge_expanded');permitted('same independent full + adaptive source without noisy expanded alternative',{attempts:clean});
assert.strictEqual(api.adaptiveCompanyTailConsensus(base,fixture.sourceRow,fixture.sourceColumn).candidate,fixture.originalValue);checks++;console.log('POSITIVE PASS adaptive provenance survives transfer');
blocked('old P11410 metadata loss remains fail-closed',{attempts:base.map(x=>{const a={...x};delete a.sourceRow;delete a.sourceColumn;return a;})});
blocked('adaptive both missing',{attempts:base.filter(a=>a.scope!=='source_truth_adaptive_company')});
blocked('full-cell both missing',{attempts:base.filter(a=>a.scope!=='source_truth_full_cell')});
blocked('only one adaptive view',{attempts:base.filter(a=>a.mode!=='adaptive-company-psm7')});
blocked('only one full view',{attempts:base.filter(a=>a.mode!=='source-truth-full-cell-psm7')});
blocked('foreign adaptive row',{attempts:base.map(a=>a.scope==='source_truth_adaptive_company'?{...a,sourceRow:a.sourceRow+1}:a)});
blocked('foreign adaptive column',{attempts:base.map(a=>a.scope==='source_truth_adaptive_company'?{...a,sourceColumn:a.sourceColumn+1}:a)});
blocked('wrong primary provenance',{primary:{...sourcePrimary,verificationSource:'independent_text'}});
blocked('wrong primary raw',{primary:{...sourcePrimary,rawOcr:fixture.secondaryValue}});
blocked('primary confidence too low',{primary:{...sourcePrimary,confidence:78}});
blocked('missing primary confidence',{primary:{...sourcePrimary,confidence:null}});
blocked('primary clipped',{primary:{...sourcePrimary,cropQuality:{...sourcePrimary.cropQuality,rightEdgeClipped:true}}});
blocked('primary foreign source-column',{primary:{...sourcePrimary,sourceColumn:sourcePrimary.sourceColumn+1}});
blocked('insufficient same plan peers',{peers:2});
blocked('semantic alternative',{secondary:'Get-A'});
blocked('strong neighbor-safe expanded OCR counterevidence',{attempts:base.map(a=>a.scope==='source_truth_edge_expanded'?{...a,cropQuality:{...a.cropQuality,neighborColumnIncluded:false}}:a)});
blocked('competing two exact cell views',{attempts:base.concat([{scope:'cell_view',candidate:fixture.secondaryValue,mode:'plain'},{scope:'cell_view',candidate:fixture.secondaryValue,mode:'contrast'}])});
blocked('independent complete-cell counterevidence',{attempts:base.map(a=>a.scope==='source_truth_full_cell'?{...a,candidate:fixture.secondaryValue}:a)});
blocked('adaptive contrary OCR',{attempts:base.map(a=>a.scope==='source_truth_adaptive_company'?{...a,candidate:fixture.secondaryValue}:a)});
blocked('one strong complete-cell contradicts',{attempts:base.concat([{scope:'source_truth_full_cell',mode:'independent',candidate:fixture.secondaryValue,cropQuality:base[3].cropQuality}])});
blocked('one strong adaptive contradicts',{attempts:base.concat([{scope:'source_truth_adaptive_company',mode:'independent',sourceRow:fixture.sourceRow,sourceColumn:fixture.sourceColumn,candidate:fixture.secondaryValue,cropQuality:base[7].cropQuality}])});
blocked('bad adaptive neighbor overlap',{attempts:base.map(a=>a.scope==='source_truth_adaptive_company'?{...a,cropQuality:{...a.cropQuality,neighborColumnIncluded:true}}:a)});

blocked('one strong full cell alternative without weak expanded blocker',{attempts:base.filter(a=>a.scope!=='source_truth_edge_expanded').concat([{scope:'source_truth_full_cell',mode:'independent',candidate:fixture.secondaryValue,cropQuality:base[3].cropQuality}])});
blocked('one strong expanded alternative without weak expanded quorum',{attempts:base.filter(a=>a.scope!=='source_truth_edge_expanded').concat([{scope:'source_truth_edge_expanded',mode:'independent',candidate:fixture.secondaryValue,cropQuality:{...base[5].cropQuality,neighborColumnIncluded:false}}])});

// Data-path check: the same real OCR fields must be preserved in final evidence. Do not accept a mocking dictionary alone.
assert(source.includes("sourceRow: Number(attempt.sourceRow)"));assert(source.includes("sourceColumn: Number(attempt.sourceColumn)"));checks++;
console.log(`P11411 REAL ANDROID EVIDENCE -> CONSENSUS -> ZERO-SILENT-ERROR -> VALIDATE: ${checks}/${checks} PASS`);
