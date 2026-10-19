#!/usr/bin/env node
'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(process.argv[2],'utf8');
const functions=['routeOcrText','routeOcrBase','routeOcrDistance','routeG4SemanticDecision','routeG4VerifiedFinalHandoff','markZeroSilentErrorIntegrity'];
function code(name){const a=source.indexOf('  function '+name+'(');if(a<0)throw Error('missing '+name);const b=source.indexOf('\n  }\n',a);if(b<0)throw Error('function end '+name);return source.slice(a,b+5)}
const context={
 cellText:v=>String(v??'').trim(),
 flightCandidatesFromRow:()=>[],
 cellEvidenceRawValue:(v,f)=>v[f]?.rawOcr||'',
 normalizeVehicleBoundaryOcrNoise:()=>'',
 parseNumber:()=>null,
 uniqueClockCandidateFromCell:()=>'',
 normalizeTime:v=>String(v||''),
 timeToMinutes:()=>null,
 normalizeDriverCandidate:()=>'',
 cleanKey:v=>String(v??'').trim().toLowerCase(),
};vm.createContext(context);
vm.runInContext(functions.map(code).join('\n')+'\nthis.finalCheck=markZeroSilentErrorIntegrity;',context);
let passed=0;
function check(name,opts){
 const field=opts.field||'destination';
 const ride={sourceImageOcr:true, sourceRow:2,[field]:opts.final,imageCellEvidence:{[field]:{rawOcr:opts.raw,confidence:opts.confidence??94,verificationSource:'primary_full_image_cell_assignment',geometryConfidence:'high',cropQuality:{fullCellIncluded:true,leftEdgeClipped:false,rightEdgeClipped:false,neighborColumnIncluded:false}}},...opts.flags};
 const [end]=context.finalCheck([ride]);
 assert.equal(end.importIntegrityStatus,opts.block?'blocked':'ok',name);
 assert.equal((end.importIntegrityConflicts||[]).some(c=>c.code===`route_semantic_unverified_${field}`),Boolean(opts.block),name+' route status');
 if(opts.block){assert.equal(end.routeG4FinalIntegrity[field].primaryRaw,opts.raw);assert.equal(end.routeG4FinalIntegrity[field].finalValue,opts.final);}
 if(opts.field==='pickup'){assert.equal(end.destination,undefined,'pickup only does not manufacture destination');}
 passed++;console.log('PASS '+passed+' '+name);
}
check('N12: late silent Inn->Inr becomes blocked',{raw:'NH Nord-Holiday Inn',final:'NH Nord-Holiday Inr',block:true});
check('N12: after list consensus Marriott DUS->XUS blocked',{raw:'Marriott Seestern DUS',final:'Marriott Seestern XUS',block:true,flags:{routeTextConsistency:{destination:{from:'Marriott Seestern DUS',to:'Marriott Seestern XUS',evidenceCount:3,kind:'substitution'}}}});
check('N12: price is independent field',{raw:'NH Nord-Holiday Inn',final:'NH Nord-Holiday Inn',block:false,flags:{price:35,priceRawSource:'€ 35,00'}});
check('P01: unchanged source route',{raw:'Marriott Seestern DUS',final:'Marriott Seestern DUS',block:false});
check('P04: diacritic only is semantically equivalent',{raw:'Cafe Zentrum',final:'Café Zentrum',block:false});
check('P07: bounded right edge word spillover with provenance',{raw:'Marriott Seestern',final:'Marriott Seestern DUS',block:false,flags:{destinationRecoveredFromBoundaryOcr:true,destinationBoundaryRecoverySource:'repeated_right_boundary_overlap',destinationBoundaryRecoveryEvidence:2,destinationBoundaryRecoveryToken:'DUS'}});
check('P07 negative: unverifiable spillover rejected',{raw:'Marriott Seestern',final:'Marriott Seestern DUS',block:true,flags:{destinationRecoveredFromBoundaryOcr:true,destinationBoundaryRecoverySource:'repeated_right_boundary_overlap',destinationBoundaryRecoveryEvidence:1,destinationBoundaryRecoveryToken:'DUS'}});
check('P08: pickup independent after pipeline',{field:'pickup',raw:'DUS Airport',final:'XUS Airport',block:true});
check('P08: destination independent after pipeline',{field:'destination',raw:'DUS Airport',final:'XUS Airport',block:true});
check('P09: already-confirmed empty-cell recovery retained',{raw:'Marriot',final:'Marriott',block:false,flags:{destinationRecoveredFromMissingTargetedOcr:true,destinationMissingTargetedOcrEvidence:2,destinationMissingTargetedOcrSource:'p95_unanimous_cell_crops_plus_near_primary_raw_plus_exact_sibling',destinationMissingTargetedOcrRawEvidence:[{candidate:'Marriot'}]}});
check('P09 negative: weak empty-cell claim blocked',{raw:'Marriot',final:'Marriott',block:true,flags:{destinationRecoveredFromMissingTargetedOcr:true,destinationMissingTargetedOcrEvidence:1,destinationMissingTargetedOcrSource:'p95_unanimous_cell_crops_plus_near_primary_raw_plus_exact_sibling',destinationMissingTargetedOcrRawEvidence:[{candidate:'Marriot'}]}});
// Exact immutable baseline/price code is checked by the source-patch QA script.
assert(source.includes("kind: 'import_integrity'"),'validator converts integrity conflicts to blocking errors');
assert(source.includes('blockingNonFlightIssues(validate(state.rides))'),'pre-import guard must be kept');
passed++;console.log('PASS '+passed+' existing error and import block wiring');
console.log(`RESULT ${passed}/${passed} REAL FINAL-INTEGRITY FUNCTION REPLAY PASS (simulated ride evidence, no Android, no import)`);
