'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/js/plan-import.js'),'utf8');
const once=(x)=>assert.equal(source.split(x).length-1,1,`unique P11444 gate expected: ${x}`);
for(const marker of [
  'function p11444HasMixedFlightTimeRaw(',
  '// R4: A supposed source note must contain NO clock or clock-like value,',
  'function p11444QualifiedCellReadings(',
  'function p11444ResolveOneSourceCell(',
  'function p11444VerifiedSourceBoundRouteProof(',
  'async function p11444ReconcileSourceCells(',
  "p54MeasureAsync('p11444_dual_source_cell_review'",
  "if (p11444HasMixedFlightTimeRaw(p11444RawFlightTimeCell))",
  "['company','destination','flightTime'].includes(field)",
  'p11444TrustedRouteProofObjects.has(proof)',
  'sourceTruthCanvas === imageCanvas',
  'sourceTruthFullCellTextOcr(sourceTruthCanvas, imageCanvas',
  'p11444ReconcileSourceCells(preparedRides, result.imageSourceCanvas || null, result.imageCanvas'
]) once(marker);
assert(source.includes('const P11442_ORIGINAL_SHA256'), 'preserve P11442 safe source gate');
assert(source.includes('function p11443ExactOriginalCompanyCellProof'), 'preserve P11443 Get-E source proof');
assert(source.includes("p54MeasureSync('company_conflict_post_consensus'"), 'preserve existing Get-E veto pipeline');
assert(source.includes('p11442VerifiedSourceBoundRouteProof(ride, field, originalCell, sourceRaw, finalValue)'), 'preserve G4 proof');
assert(!source.includes('Marriott Seestern DUS'), 'named hotel must never be hardcoded in runtime');
const order=["p54MeasureSync('company_conflict_post_consensus'", "p54MeasureAsync('p11442_exact_original_source_bound_review'", "p54MeasureAsync('p11444_dual_source_cell_review'", "p54MeasureSync('zero_silent_error_gate'"];
let n=-1;
for(const x of order){const i=source.indexOf(x); assert(i>n,`incorrect order: ${x}`);n=i;}
console.log('P11444 source-integration safety gate: PASS');
