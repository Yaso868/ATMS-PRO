#!/usr/bin/env node
'use strict';
const assert=require('assert');
const core=require('../app/src/main/assets/js/ocr-integrity-core.js');
// Historical fixtures are TEST-ONLY evidence. They are not production mappings/hardcodes.
assert(core.safeLongPrefixFlightAlternative('EWQ882','EW9882'));
assert(core.safeLongPrefixFlightAlternative('EWS5702','EW5702'));
assert(!core.safeLongPrefixFlightAlternative('EWS5702','EW5703'));
assert(core.oneNumericEditFlightAlternative('EW8578','EW9578'));
assert(core.oneNumericEditFlightAlternative('EW8773','EW9773'));
assert(!core.oneNumericEditFlightAlternative('EW8578','EW9678'));
assert(!core.oneNumericEditFlightAlternative('EW8578','LH9578'));
const weakFlightAttempts=[
  {crop:1,mode:'single-line',candidates:['EW9773']},
  {crop:1,mode:'single-word',candidates:['EW9773']},
  {crop:2,mode:'single-line',candidates:['EW9773']},
  {crop:2,mode:'single-word',candidates:['EW8773']}
];
assert.deepStrictEqual(core.suggestOneNumericEditCorrection('EW8773',weakFlightAttempts),{candidate:'EW9773',votes:3,crops:2,changed:true});
const attempts=[
  {crop:1,mode:'default',candidates:['EW5702']},
  {crop:1,mode:'single-line',candidates:['EW5702']},
  {crop:1,mode:'single-word',candidates:['EW5702']},
  {crop:2,mode:'default',candidates:[]}
];
assert.deepStrictEqual(core.suggestLongPrefixCorrection('EWS5702',attempts).candidate,'EW5702');
assert.strictEqual(core.repeatedTextSignature('Avion ~~'),core.repeatedTextSignature('Avion'));
assert.strictEqual(core.parseEuropeanNumber('€6545'),6545);
assert.deepStrictEqual(core.pricePlausibility(6545),{suspicious:true,suggestion:65.45,missing:false});
assert.strictEqual(core.parseEuropeanNumber('597,62 €'),597.62);
assert.deepStrictEqual(core.pricePlausibility(597.62),{suspicious:false,suggestion:null,missing:false});
assert.deepStrictEqual(core.driverUncertaintyMarker('Daniel?'),{body:'Daniel',marker:'?',display:'Daniel?'});
const rides=[
  {flightDirection:'departure',flightLocation:'Rom',flightNumber:'EWQ882'},
  {flightDirection:'departure',flightLocation:'Rom',flightNumber:'EW9882'},
  {flightDirection:'departure',flightLocation:'Rom',flightNumber:'EW9882'},
  {flightDirection:'arrival',flightLocation:'Rom',flightNumber:'EW9882'}
];
assert.strictEqual(core.listConsensusPeerCount(rides,0,'EW9882'),2);

// P107.2: image OCR may omit the ride-time header; structural recovery is allowed
// only for the column directly left of pickup and only with repeated valid times.
const timeMatrix=[
  ['Preis','Spalte 2','Von','Nach','Name'],
  ['65,45','01:35','CGN Vorfeld','Adagio','Corendon'],
  ['65,45','02:50','Adagio','CGN Vorfeld','Corendon'],
  ['47,60','04:30','Holiday Inn DUS','DUS Airport','Eurowings'],
  ['47,60','not-a-time','NH Nord DUS','DUS Airport','Eurowings']
];
assert.deepStrictEqual(core.inferRideTimeColumnFromMatrix(timeMatrix,0,{pickup:2,destination:3}),{index:1,valid:3,seen:4,reason:'validated_time_column_left_of_pickup'});
assert.strictEqual(core.inferRideTimeColumnFromMatrix([['Spalte 1','Von','Nach'],['x','foo','bar'],['y','baz','qux']],0,{pickup:1,destination:2}),null);

// P107.4: same-time one-digit peers are only comparable inside the same flight
// context. Different known flight locations must never trigger each other.
assert.strictEqual(core.standardFlightPeerContextMatch(
  {flightDirection:'departure',flightTime:'04:30',flightLocation:'Split'},
  {flightDirection:'departure',flightTime:'04:30',flightLocation:'Teneriffa'}
),false);
assert.strictEqual(core.standardFlightPeerContextMatch(
  {flightDirection:'departure',flightTime:'07:05',flightLocation:''},
  {flightDirection:'departure',flightTime:'07:05',flightLocation:''}
),true);
const contextRides=[
  {flightDirection:'departure',flightTime:'04:30',flightLocation:'Split',flightNumber:'EW9958'},
  {flightDirection:'departure',flightTime:'04:30',flightLocation:'Teneriffa',flightNumber:'EW9558'},
  {flightDirection:'departure',flightTime:'07:05',flightLocation:'',flightNumber:'EW8578'},
  {flightDirection:'departure',flightTime:'07:05',flightLocation:'',flightNumber:'EW9578'}
];
assert.deepStrictEqual(core.oneNumericEditContextPeerIndices(contextRides,0),[]);
assert.deepStrictEqual(core.oneNumericEditContextPeerIndices(contextRides,2),[3]);
const confirmInitialAttempts=[
  {crop:1,mode:'single-line',candidates:['EW9958']},
  {crop:1,mode:'single-word',candidates:['EW9958']},
  {crop:2,mode:'single-line',candidates:['EW9958']},
  {crop:2,mode:'single-word',candidates:['EW9958']}
];
assert.deepStrictEqual(core.suggestOneNumericEditCorrection('EW9958',confirmInitialAttempts),{candidate:'EW9958',votes:4,crops:2,changed:false});

const fs=require('fs'),path=require('path');
const productionFiles=[
  '../app/src/main/assets/js/ocr-integrity-core.js',
  '../app/src/main/assets/js/plan-import.js',
  '../app/src/main/assets/js/app.js'
].map(p=>fs.readFileSync(path.join(__dirname,p),'utf8'));
for(const source of productionFiles){
  for(const fixtureLiteral of ['EWQ882','EWS5702','EW9882','EW5702','EW8578','EW9578','EW8773','EW9773','Daniel?','Avion ~~']){
    assert(!source.includes(fixtureLiteral),`TEST fixture leaked into production: ${fixtureLiteral}`);
  }
}
// P107.5: two independent tight crops with 3 OCR modes each can safely
// converge on a one-digit correction, while an exact initial consensus remains unchanged.
const tightCorrectionAttempts=[
  {crop:1,mode:'single-block',candidates:['EW9578']},
  {crop:1,mode:'single-line',candidates:['EW9578']},
  {crop:1,mode:'single-word',candidates:['EW9578']},
  {crop:2,mode:'single-block',candidates:['EW9578']},
  {crop:2,mode:'single-line',candidates:['EW9578']},
  {crop:2,mode:'single-word',candidates:['EW9578']}
];
assert.deepStrictEqual(core.suggestOneNumericEditCorrection('EW8578',tightCorrectionAttempts),{candidate:'EW9578',votes:6,crops:2,changed:true});
const planImportSource=productionFiles[1];
assert(planImportSource.includes('visibleActionableIssues'), 'P107.5 must prioritize visible blocking OCR issues');
assert(planImportSource.includes("name: 'single-block'"), 'P107.5 tight-cell OCR must include PSM 6 mode');
// P107.6: A changed one-digit candidate may converge with exactly one vote from
// each of two tight crops, but NEVER if the initial reading receives any targeted vote.
const twoCropOnlyCorrection=[
  {crop:1,mode:'single-line',candidates:['EW9773']},
  {crop:2,mode:'single-line',candidates:['EW9773']}
];
assert.deepStrictEqual(core.suggestOneNumericEditCorrection('EW8773',twoCropOnlyCorrection),{candidate:'EW9773',votes:2,crops:2,changed:true});
const mixedInitialAlternative=[
  {crop:1,mode:'single-line',candidates:['EW9773']},
  {crop:2,mode:'single-line',candidates:['EW9773']},
  {crop:2,mode:'single-word',candidates:['EW8773']}
];
assert.strictEqual(core.suggestOneNumericEditCorrection('EW8773',mixedInitialAlternative),null);
assert(planImportSource.includes('currentExactCount'), 'P107.6 must evaluate duplicate support against the current corrected list');
// P107.7: only positive competing evidence from two independent crops may create
// a new hard blocker. Inconclusive confirmation alone is not enough.
const conflictingMixedEvidence=[
  {crop:1,mode:'single-line',candidates:['EW9773']},
  {crop:1,mode:'single-word',candidates:['EW8773']},
  {crop:2,mode:'single-line',candidates:['EW9773']},
  {crop:2,mode:'single-word',candidates:['EW8773']}
];
assert.deepStrictEqual(core.oneNumericEditConflictEvidence('EW8773',conflictingMixedEvidence),{candidate:'EW9773',votes:2,crops:2});
const oneCropNoise=[
  {crop:1,mode:'single-line',candidates:['EW9773']},
  {crop:1,mode:'single-word',candidates:['EW9773']},
  {crop:2,mode:'single-line',candidates:['EW8773']}
];
assert.strictEqual(core.oneNumericEditConflictEvidence('EW8773',oneCropNoise),null);
assert(planImportSource.includes('recoveredMissingFlight'), 'P107.7 must selectively recheck unique missing-flight recoveries');
assert(planImportSource.includes('oneNumericEditConflictEvidence'), 'P107.7 hard blockers must require positive competing evidence');
assert(planImportSource.includes('flightLowConfidenceOcrInconclusive'), 'P107.7 inconclusive rechecks must remain non-blocking');
// P108.0 Import Quality Gate: production must use cell-level multiword route evidence,
// all-valid-time batch checking, fail-closed daytime conflicts, tight raw-word long-prefix
// crops, and clustered/current-plan-only driver colors. Concrete WA0029 values remain test-only.
assert(planImportSource.includes('rawCellSequence'), 'P108.0 must compose raw route words at cell level');
assert(planImportSource.includes('if (initialMinutes === null) return null;'), 'P108.0 time gate must cover all valid ride times');
assert(planImportSource.includes('timeSuspiciousHardBlock'), 'P108.0 daytime OCR conflicts must be able to block import');
assert(planImportSource.includes('longPrefixFullFlightProbeRegions'), 'P108.0 long-prefix recheck must use tight raw-word geometry');
assert(planImportSource.includes('CLUSTER_DISTANCE = 50'), 'P108.0 driver colors must cluster neighboring RGB buckets without lowering thresholds');
assert(planImportSource.includes("sourcePlanColorSource = 'driver_plan_consensus'"), 'P108.0 may recover weak driver color only from current-plan same-driver consensus');
for(const forbidden of ['EWS522','EW522','16:10','15:10']){
  for(const source of productionFiles) assert(!source.includes(forbidden),`P108.0 fixture leaked into production: ${forbidden}`);
}

// P109.0 Text Cell Integrity Gate: changed text may auto-correct only when a
// safe near-image alternative has strong independent column + local evidence.
assert(core.safeTextIntegrityAlternative('‘Avion','Avion'));
assert(core.safeTextIntegrityAlternative('Schiitz','Schütz'));
assert(core.safeTextIntegrityAlternative('Miinchen','München'));
assert.strictEqual(core.safeTextIntegrityAlternative('Avion','Eurowings'),false);
assert.strictEqual(core.textIntegrityPotentialGlyphSplit('Miinchen'),true);
assert.strictEqual(core.textIntegrityPotentialGlyphSplit('Hawaii'),false);
assert.deepStrictEqual(core.decideTextIntegrity('Schiitz',[
  {scope:'batch',candidate:'Schütz'},
  {scope:'batch',candidate:'Schütz'},
  {scope:'local',candidate:'Schütz'},
  {scope:'local',candidate:'Schütz'}
]),{status:'correct',candidate:'Schütz',evidence:{total:4,batch:2,local:2}});
assert.deepStrictEqual(core.decideTextIntegrity('‘Avion',[
  {scope:'batch',candidate:'Avion'},
  {scope:'batch',candidate:''},
  {scope:'local',candidate:'Avion'},
  {scope:'local',candidate:'Avion'}
]),{status:'correct',candidate:'Avion',evidence:{total:3,batch:1,local:2}});
assert.deepStrictEqual(core.decideTextIntegrity('Schiitz',[
  {scope:'batch',candidate:'Schütz'},
  {scope:'batch',candidate:'Schütz'},
  {scope:'local',candidate:'Schiitz'},
  {scope:'local',candidate:'Schiitz'}
]),{status:'conflict',candidate:'Schütz',evidence:{total:2,batch:2,local:0}});
assert.deepStrictEqual(core.decideTextIntegrity('Miinchen',[
  {scope:'local',candidate:'München'},
  {scope:'local',candidate:'München'}
]),{status:'conflict',candidate:'München',evidence:{total:2,batch:0,local:2}});
assert.strictEqual(core.decideTextIntegrity('Avion',[
  {scope:'batch',candidate:'Avion'},
  {scope:'local',candidate:'Avion'}
]).status,'ok');
assert(planImportSource.includes('recoverTextIntegrityTargeted'), 'P109.1 must run the generic text integrity OCR gate');
assert(planImportSource.includes('text_integrity_ocr'), 'P109.1 must expose text integrity performance timing');
assert(planImportSource.includes('OcrConflict'), 'P109.1 unresolved text OCR conflicts must remain import-blocking');
assert(planImportSource.includes('buildTextIntegrityCompositeBatchCanvas'), 'P109.1 must use one compact composite DEU batch canvas');
assert(planImportSource.includes('text-deu-composite-psm6'), 'P109.1 must log the composite batch evidence');
assert(planImportSource.includes('textIntegrityEdgeConflictPromotion'), 'P109.2 must evaluate edge conflicts against generic image + current-plan evidence');
assert(planImportSource.includes('samePlanPeerCount'), 'P109.2 edge-punctuation correction must require current-plan peer evidence');
assert(planImportSource.includes('writeCurrentAnalysisJsonPreview'), 'P109.2 blocked analyses must refresh the staged JSON preview');
assert(planImportSource.includes('deu_composite_batch_plus_local_cell_plus_same_plan_consensus'), 'P109.2 must retain the classic batch+local+peer correction path');
assert(planImportSource.includes('deu_dual_local_cell_plus_same_plan_edge_consensus'), 'P109.2 must identify the dual-local edge-consensus correction path');

// P109.2: A pure boundary-punctuation conflict may be promoted when two distinct
// local OCR modes unanimously show the same clean candidate and >=2 current-plan
// peers show that same candidate. A noisy third batch candidate is allowed, but a
// batch vote for the original or any competing local reading keeps fail-closed.
assert.deepStrictEqual(core.textIntegrityEdgeConflictPromotion('‘Alpha','Alpha',[
  {scope:'batch',mode:'text-deu-composite-psm6',candidate:'Alph'},
  {scope:'local',mode:'text-deu-cell-psm7',candidate:'Alpha'},
  {scope:'local',mode:'text-deu-cell-psm6',candidate:'Alpha'}
],3),{ok:true,mode:'dual_local_peers',candidateBatch:0,candidateLocal:2,localModes:2,localOther:0,originalBatch:0});
assert.strictEqual(core.textIntegrityEdgeConflictPromotion('‘Alpha','Alpha',[
  {scope:'batch',mode:'text-deu-composite-psm6',candidate:'‘Alpha'},
  {scope:'local',mode:'text-deu-cell-psm7',candidate:'Alpha'},
  {scope:'local',mode:'text-deu-cell-psm6',candidate:'Alpha'}
],3).ok,false);
assert.strictEqual(core.textIntegrityEdgeConflictPromotion('‘Alpha','Alpha',[
  {scope:'batch',mode:'text-deu-composite-psm6',candidate:'Alph'},
  {scope:'local',mode:'text-deu-cell-psm7',candidate:'Alpha'},
  {scope:'local',mode:'text-deu-cell-psm6',candidate:'Alfa'}
],3).ok,false);
assert.strictEqual(core.textIntegrityEdgeConflictPromotion('‘Alpha','Alpha',[
  {scope:'local',mode:'text-deu-cell-psm7',candidate:'Alpha'},
  {scope:'local',mode:'text-deu-cell-psm6',candidate:'Alpha'}
],1).ok,false);
for(const forbidden of ['Schiitz','‘Avion']){
  for(const source of productionFiles) assert(!source.includes(forbidden),`P109.2 fixture leaked into production: ${forbidden}`);
}
console.log('P109.2 Text Cell Integrity Gate edge-consensus regression self-test: PASS');

// P110 Golden Error Pack: confirmed 06.10.2026 production regressions stay test-only.
const goldenPath=path.join(__dirname,'fixtures','ATMS_GOLDEN_ERROR_PACK_2026-10-06_manifest.json');
const golden=JSON.parse(fs.readFileSync(goldenPath,'utf8'));
assert.strictEqual(golden.format,'ATMS_GOLDEN_ERROR_PACK');
assert.strictEqual(golden.plantag,'2026-10-06');
assert.strictEqual(golden.pack_rows.length,16);
assert(golden.pack_rows.some(row=>row.class==='boundary_destination_to_customer'));
assert(golden.pack_rows.some(row=>row.class==='flight_ocr_O_vs_0_prefix'));
assert(golden.pack_rows.some(row=>row.class==='cell_cleanup_vehicle'));
assert(golden.pack_rows.some(row=>row.class==='cell_cleanup_company'));
assert(golden.pack_rows.some(row=>row.class==='control_boundary'));

// A recovered route-boundary token may be removed from the neighboring customer only
// with >=2 exact same-plan customer peers. Historical values are fixtures, never mappings.
assert.deepStrictEqual(core.suggestNeighborCustomerAfterRouteBoundaryRecovery(
  'Inn Eurowings','Inn',['Eurowings','Eurowings','Avion','Eurowings']
),{customer:'Eurowings',recoveredToken:'Inn',customerPeerCount:3});
assert.deepStrictEqual(core.suggestNeighborCustomerAfterRouteBoundaryRecovery(
  'DUS Avion','DUS',['Avion','Avion','Eurowings']
),{customer:'Avion',recoveredToken:'DUS',customerPeerCount:2});
assert.strictEqual(core.suggestNeighborCustomerAfterRouteBoundaryRecovery(
  'Inn Eurowings','Inn',['Eurowings','Avion']
),null);
assert.strictEqual(core.suggestNeighborCustomerAfterRouteBoundaryRecovery(
  'Real Customer','Inn',['Customer','Customer','Customer']
),null);

// Mixed 3-char OCR prefix is not normalized blindly. It only becomes an eligible
// long-prefix alternative when local OCR independently proposes the shorter 2-char form.
assert.strictEqual(core.safeLongPrefixFlightAlternative('0OS165','OS165'),true);
assert.strictEqual(core.safeLongPrefixFlightAlternative('0OS165','OS166'),false);

assert(planImportSource.includes('strongShallowOverlap'), 'P110 must retain the high-confidence shallow route-boundary evidence gate');
assert(planImportSource.includes('overlapRatio >= 0.15'), 'P110 route-boundary recovery must include the proven shallow-overlap threshold');
assert(planImportSource.includes('recoverCustomerAfterRouteBoundarySpillover'), 'P110 must clean the neighboring customer only after proven route-boundary recovery');
assert(planImportSource.includes('normalizeVehicleBoundaryOcrNoise'), 'P110 must remove only explicit vehicle edge artifacts');
assert(planImportSource.includes("field === 'company' && /^[A-Za-z]{2,3}$/"), 'P110 short company-code consensus must remain case-only and scoped to company');
assert(planImportSource.includes('const preparedCrop = p1094PrepareSharedWorkerImage(crop);'), 'P110 low-confidence flight OCR must use the P109.4 PNG transport');
assert(planImportSource.includes("mixedMatch = flight.match(/^([0-9][A-Z]{2})"), 'P110 suspicious mixed flight prefix must be routed into local OCR review');

for(const fixtureLiteral of ['0OS165','OS165','Inn Eurowings','DUS Avion','US Avion']){
  for(const source of productionFiles) assert(!source.includes(fixtureLiteral),`P110 TEST fixture leaked into production: ${fixtureLiteral}`);
}
console.log('P110 Golden Error Pack deterministic regression self-test: PASS');


// P113 FINAL PLANLISTEN STABILIZATION: structure first, zero-silent-error,
// boundary-noise normalization and bounded recovery. Test values are generic and
// deliberately unrelated to productive plan-list examples.
const p113ManifestPath=path.join(__dirname,'fixtures','golden-regression','ATMS_GOLDEN_REGRESSION_PACK_FINAL_manifest.json');
assert(fs.existsSync(p113ManifestPath),'P113 frozen Golden Regression manifest must exist');
const p113Manifest=JSON.parse(fs.readFileSync(p113ManifestPath,'utf8'));
assert.strictEqual(p113Manifest.baseHead,'cc73597a9b146fb1d477aa22cdac3ee9ca3c9b19');
assert(Number(p113Manifest.summary?.newErrorRecords||0)>=13,'P113 manifest must retain all newly confirmed error cases');
assert(Number(p113Manifest.summary?.newControlRecords||0)>=7,'P113 manifest must retain positive controls');
const crypto=require('crypto');
const p113SourceDir=path.join(__dirname,'fixtures','golden-regression','source-images');
for(const sourceImage of (p113Manifest.sourceImages||[])){
  const sourcePath=path.join(p113SourceDir,sourceImage.file);
  assert(fs.existsSync(sourcePath),`P113 source image missing: ${sourceImage.file}`);
  const bytes=fs.readFileSync(sourcePath);
  assert.strictEqual(bytes.length,Number(sourceImage.bytes),`P113 source image byte-size changed: ${sourceImage.file}`);
  assert.strictEqual(crypto.createHash('sha256').update(bytes).digest('hex'),sourceImage.sha256,`P113 source image pixels/bytes changed: ${sourceImage.file}`);
}

assert.deepStrictEqual(core.parseClockTimeWithBoundaryNoise('[05:15'),{value:'05:15',changed:true,raw:'[05:15'});
assert.deepStrictEqual(core.parseClockTimeWithBoundaryNoise('|09:20'),{value:'09:20',changed:true,raw:'|09:20'});
assert.deepStrictEqual(core.parseClockTimeWithBoundaryNoise('|09:30'),{value:'09:30',changed:true,raw:'|09:30'});
assert.deepStrictEqual(core.parseClockTimeWithBoundaryNoise('09:30'),{value:'09:30',changed:false,raw:'09:30'});
assert.strictEqual(core.parseClockTimeWithBoundaryNoise('note09:20').value,'');
assert.strictEqual(core.parseClockTimeWithBoundaryNoise('09:20note').value,'');

assert.deepStrictEqual(core.suggestShortCodeConsensus('ABX',['AB','AB','AB','CD']),{candidate:'AB',evidenceCount:3});
assert.strictEqual(core.suggestShortCodeConsensus('ABC',['AB','AB','AB','ABD','ABD','ABD']),null,'P113 short-code correction must fail closed on a tie');
assert.strictEqual(core.suggestShortCodeConsensus('ALPHA',['ALPH','ALPH','ALPH']),null,'P113 short-code correction must stay narrowly scoped to short codes');

assert(planImportSource.includes('function hasMirrorDataEvidence('),'P113 must use repeated data geometry to recover a missing duplicate mirror-time header');
assert(planImportSource.includes('forceMirrorFromData'),'P113 must feed mirror-time data evidence into schema selection');
assert(planImportSource.includes('if (list.length < 2)'),'P113 right-tail shift detection must include two-row plans');
assert(planImportSource.includes("company = options.imageOcr ? companyCell"),'P113 image OCR must not synthesize company from customer/default values');
assert(!planImportSource.includes("options.imageOcr ? (companyCell || customer"),'P113 must not reintroduce customer-as-company image fallback');
assert(planImportSource.includes("p54MeasureSync('exact_cell_provenance_recovery'"),'P113 must collect exact-cell provenance before fallback OCR');
assert(planImportSource.includes("p54MeasureSync('zero_silent_error_gate'"),'P113 must run a global zero-silent-error gate before import release');
assert(planImportSource.includes("p54MeasureAsync('missing_flight_time_targeted_ocr'"),'P113 must recover missing flight-time only from its exact mapped cell');
assert(planImportSource.includes('driverBlankCellConfirmed'),'P113 must distinguish a truly blank driver cell from OCR uncertainty');
assert(planImportSource.includes("p109SharedOcrWithWorker('deu'"),'P113 bounded driver/text recovery must reuse the shared OCR worker');
assert(planImportSource.includes('importIntegrityConflicts'),'P113 validate must surface structural/cross-field integrity conflicts');
assert(planImportSource.includes('flightTimeOcrConflict'),'P113 ambiguous flight-time recovery must fail closed');
assert(planImportSource.includes('OcrConflictCandidate'),'P113 discarded conflicting secondary OCR evidence must remain visible to validation');

// New stabilization implementation must remain structural/generic. These synthetic
// sentinel values would indicate a test-specific branch if they ever appeared in production.
for(const fixtureLiteral of ['ABX','note09:20','P113_SENTINEL_DRIVER','P113_SENTINEL_ROUTE']){
  for(const source of productionFiles) assert(!source.includes(fixtureLiteral),`P113 TEST fixture leaked into production: ${fixtureLiteral}`);
}
console.log('P113 Final Planlisten Stabilization regression self-test: PASS');
