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

// P113.5: when the primary ride-time HEADER itself is missing, the matrix-level
// P107.2 fallback is too late. A raw OCR clock cluster between Preis and Von may
// restore exactly one header anchor only with repeated, stable, non-competing evidence.
const p1135HeaderAnchors=[
  {key:'preis',x:50},
  {key:'von',x:200},
  {key:'nach',x:320},
  {key:'uhrzeit',x:500},
  {key:'ort',x:580}
];
const p1135RawLines=[
  {words:[{text:'Preis',x0:30,x1:70},{text:'Von',x0:180,x1:220}]},
  {words:[{text:'47,60',x0:28,x1:72},{text:'15:35',x0:92,x1:128},{text:'Hotel',x0:170,x1:196}]},
  {words:[{text:'47,60',x0:28,x1:72},{text:'16:10',x0:93,x1:129},{text:'Airport',x0:168,x1:197}]},
  {words:[{text:'35,00',x0:28,x1:72},{text:'16:55',x0:91,x1:130},{text:'Hotel',x0:169,x1:197}]},
  {words:[{text:'35,00',x0:28,x1:72},{text:'not-a-time',x0:92,x1:130},{text:'Airport',x0:168,x1:197}]}
];
assert.deepStrictEqual(core.inferRideTimeAnchorFromRawLines(p1135RawLines,0,p1135HeaderAnchors),{
  x:110.5,valid:3,seen:4,coverage:0.75,reason:'validated_raw_clock_geometry_between_price_and_pickup'
});
assert.strictEqual(core.inferRideTimeAnchorFromRawLines(p1135RawLines.slice(0,3),0,p1135HeaderAnchors),null,'P113.5 fewer than three supporting rows must fail closed');
assert.strictEqual(core.inferRideTimeAnchorFromRawLines(p1135RawLines,0,[...p1135HeaderAnchors,{key:'uhrzeit',x:112}]),null,'P113.5 must not duplicate an already present ride-time header');
const p1135Competing=[
  p1135RawLines[0],
  {words:[{text:'15:35',x0:92,x1:128},{text:'18:05',x0:145,x1:177}]},
  {words:[{text:'16:10',x0:93,x1:129},{text:'18:20',x0:146,x1:178}]},
  {words:[{text:'16:55',x0:91,x1:130},{text:'18:45',x0:145,x1:177}]}
];
assert.strictEqual(core.inferRideTimeAnchorFromRawLines(p1135Competing,0,p1135HeaderAnchors),null,'P113.5 stable competing clock geometry must fail closed');

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
// P113.1 GOLDEN ERROR FOLLOW-UP: real-device failures from 07.10.2026 are
// locked as fixture evidence, while the production behavior is exercised with
// unrelated synthetic strings/codes so no customer/route/flight hardcode leaks.
assert(Number(p113Manifest.summary?.caseRecords||0)>=27,'P113.1 manifest must retain the extended Golden Error cases');
assert(Number(p113Manifest.summary?.newErrorRecords||0)>=19,'P113.1 manifest must retain all confirmed error records');
for(const requiredId of [
  'GE-20261007-WA0001-R7-P1131',
  'GE-20261007-WA0001-R12-P1131',
  'GE-20261007-WA0001-R13-P1131',
  'GE-20261007-WA0001-R17-P1131',
  'GE-20261007-WA0001-R29-P1131',
  'GE-20261007-WA0001-SUMMARY-P1131'
]) assert(p113Manifest.cases.some(item=>item.id===requiredId),`P113.1 missing Golden Error case: ${requiredId}`);
const p1131R26=p113Manifest.cases.find(item=>item.id==='GE-20261007-WA0001-R26');
assert.strictEqual(p1131R26?.expected?.flightLocation,'9MB','P113.1 must preserve the confirmed short location-code expectation');
assert.strictEqual(p1131R26?.p113RealDeviceActual?.flightLocation,'IMB','P113.1 must retain the real-device failed value as evidence');
const p1131R13=p113Manifest.cases.find(item=>item.id==='GE-20261007-WA0001-R13-P1131');
assert.strictEqual(p1131R13?.expected?.flightNumber,'EW9420','P113.1 must lock the confirmed source-row 13 flight value');
const p1131R29=p113Manifest.cases.find(item=>item.id==='GE-20261007-WA0001-R29-P1131');
assert.strictEqual(p1131R29?.expected?.pickup,'Marriott Seestern DUS','P113.1 must lock the confirmed full source-row 29 pickup');
const p1131Summary=p113Manifest.cases.find(item=>item.id==='GE-20261007-WA0001-SUMMARY-P1131');
assert.strictEqual(p1131Summary?.expected?.dateBatchCountedAsOcrError,false,'P113.1 date confirmation must be separate from OCR/data error count');
assert.strictEqual(p1131Summary?.expected?.dateConfirmationStillBlocksImport,true,'P113.1 date confirmation must remain blocking');

const clippedRoute=core.leftEdgeTextDegradation('Central Terminal West','ntral Terminal West');
assert(clippedRoute&&clippedRoute.commonLength>=8,'P113.1 must recognize a shorter high-overlap left-edge clipping');
assert.strictEqual(core.leftEdgeTextDegradation('Central Terminal West','Xentral Terminal West'),null,'P113.1 must not dismiss same-length first-token conflicts');
assert.strictEqual(core.leftEdgeTextDegradation('Hotel Alpha Center','Motel Alpha Center'),null,'P113.1 must keep genuinely different labels as conflicts');

const shortCodeConsensus=core.shortCodeImageConsensusPromotion('A1C','81C',[
  {candidate:'81C',scope:'batch',mode:'batch'},
  {candidate:'81C',scope:'local',mode:'psm7'},
  {candidate:'81C',scope:'local',mode:'psm8'}
]);
assert.deepStrictEqual(shortCodeConsensus,{candidate:'81C',batch:1,local:2,localModes:2});
assert.strictEqual(core.shortCodeImageConsensusPromotion('A1C','81C',[
  {candidate:'81C',scope:'batch',mode:'batch'},
  {candidate:'81C',scope:'local',mode:'psm7'},
  {candidate:'A1C',scope:'local',mode:'psm8'}
]),null,'P113.1 short-code promotion must fail closed when local evidence disagrees');

const strongPrimaryAlternative=[
  {crop:1,mode:'single-line',candidates:['ZX4821']},
  {crop:1,mode:'single-word',candidates:['ZX4821']},
  {crop:2,mode:'single-line',candidates:['ZX4821']},
  {crop:2,mode:'single-word',candidates:['ZX4821']}
];
assert.strictEqual(core.oneNumericEditAutoCorrectionAllowed('ZX4827','ZX4821',strongPrimaryAlternative,80,false),true,'P113.1 four unanimous targeted votes may overturn a strong one-digit primary');
assert.strictEqual(core.oneNumericEditAutoCorrectionAllowed('ZX4827','ZX4821',[
  {crop:1,mode:'single-line',candidates:['ZX4821']},
  {crop:2,mode:'single-line',candidates:['ZX4821']}
],80,false),false,'P113.1 two targeted votes alone must not mutate a strong valid flight number');

assert(planImportSource.includes('leftEdgeTextDegradation'),'P113.1 must guard secondary route OCR against left-edge clipping');
assert(planImportSource.includes("p54MeasureAsync('flight_column_integrity_ocr'"),'P113.1 must cross-check standard flight cells with independent column evidence');
assert(planImportSource.includes('shortCodeImageConsensusPromotion'),'P113.1 must require image consensus before replacing short alphanumeric codes');
assert(planImportSource.includes('oneNumericEditAutoCorrectionAllowed'),'P113.1 must protect strong valid flight primaries from weak one-digit mutation');
assert(planImportSource.includes('ocrSummaryActionableIssues'),'P113.1 must separate OCR/data summary issues from date confirmation');
assert(planImportSource.includes('dateBatchPending'),'P113.1 must keep the date confirmation blocking without counting it as an OCR/data error');

for(const fixtureLiteral of ['Central Terminal West','ntral Terminal West','Hotel Alpha Center','Motel Alpha Center','A1C','81C','ZX4827','ZX4821','EW9420','9MB','irriott Seestern DUS']){
  for(const source of productionFiles) assert(!source.includes(fixtureLiteral),`P113.1 TEST fixture leaked into production: ${fixtureLiteral}`);
}
// The app already contains a historical display canonicalization for this hotel, so the
// no-hardcode check is scoped to the OCR/parser modules modified by P113.1.
for(const source of productionFiles.slice(0,2)) assert(!source.includes('Marriott Seestern DUS'), 'P113.1 route fixture must not be hardcoded into OCR/parser production logic');
console.log('P113.1 Golden Error Follow-up deterministic regression self-test: PASS');

// P113.2 CHATGPT-LIKE CELL EVIDENCE: a changed short code may be promoted only
// when several views of the SAME confirmed cell converge with sufficient margin.
const p1132CropQuality={fullCellIncluded:true,leftEdgeClipped:false,rightEdgeClipped:false,neighborColumnIncluded:false};
const p1132Consensus=core.exactCellMultiViewConsensus('O7C',[
  {scope:'batch',mode:'batch',candidate:'Q7C'},
  {scope:'cell_view',mode:'original',candidate:'Q7C',viewRegion:'full_cell',transform:'original',cropQuality:p1132CropQuality},
  {scope:'cell_view',mode:'grayscale',candidate:'Q7C',viewRegion:'content_inside_cell',transform:'grayscale',cropQuality:p1132CropQuality},
  {scope:'cell_view',mode:'threshold',candidate:'Q7C',viewRegion:'content_inside_cell',transform:'threshold',cropQuality:p1132CropQuality},
  {scope:'cell_view',mode:'processed',candidate:'O7C',viewRegion:'full_cell',transform:'processed',cropQuality:p1132CropQuality}
],p1132CropQuality);
assert.deepStrictEqual(p1132Consensus,{candidate:'Q7C',exactViews:3,exactModes:3,evidenceFamilies:3,batch:1,originalExact:1,runnerExact:1,strength:'strong'});
assert.strictEqual(core.exactCellMultiViewConsensus('O7C',[
  {scope:'batch',mode:'batch',candidate:'Q7C'},
  {scope:'cell_view',mode:'original',candidate:'Q7C',viewRegion:'full_cell',transform:'original',cropQuality:p1132CropQuality},
  {scope:'cell_view',mode:'grayscale',candidate:'Q7C',viewRegion:'content_inside_cell',transform:'grayscale',cropQuality:p1132CropQuality},
  {scope:'cell_view',mode:'threshold',candidate:'O7C',viewRegion:'content_inside_cell',transform:'threshold',cropQuality:p1132CropQuality}
],p1132CropQuality),null,'P113.2 must fail closed when exact-cell views do not win by a safe margin');
assert.strictEqual(core.exactCellMultiViewConsensus('O7C',[
  {scope:'batch',mode:'batch',candidate:'Q7C'},
  {scope:'cell_view',mode:'original',candidate:'Q7C',viewRegion:'full_cell',transform:'original',cropQuality:{...p1132CropQuality,leftEdgeClipped:true}},
  {scope:'cell_view',mode:'grayscale',candidate:'Q7C',viewRegion:'content_inside_cell',transform:'grayscale',cropQuality:{...p1132CropQuality,leftEdgeClipped:true}},
  {scope:'cell_view',mode:'threshold',candidate:'Q7C',viewRegion:'content_inside_cell',transform:'threshold',cropQuality:{...p1132CropQuality,leftEdgeClipped:true}}
],{...p1132CropQuality,leftEdgeClipped:true}),null,'P113.2 clipped evidence must never auto-correct');
assert(planImportSource.includes('__atmsSourceTruthCanvas'),'P113.2 must preserve a source-truth canvas in the same coordinate system');
assert(planImportSource.includes('function imageCellEvidenceForRide('),'P113.2 must build per-field cell evidence');
assert(planImportSource.includes("verificationSource: 'primary_full_image_cell_assignment'"),'P113.2 cell evidence must retain provenance');
assert(planImportSource.includes('function exactCellMultiViewOcr('),'P113.2 must re-read only exact confirmed cells through bounded visual variants');
assert(planImportSource.includes("scope: 'cell_view'"),'P113.2 exact-cell views must be separately identifiable from batch/local OCR');
assert(planImportSource.includes('exactCellMultiViewConsensus'),'P113.2 must resolve exact-cell multi-view evidence generically');
assert(planImportSource.includes("'exact_cell_multi_view_consensus'"),'P113.2 must preserve the correction source instead of hiding normalization provenance');
assert(planImportSource.includes('manualCheckRequired'),'P113.2 unresolved cell evidence must stay fail-closed');
const p1132R26=p113Manifest.cases.find(item=>item.id==='GE-20261007-WA0001-R26');
assert.strictEqual(p1132R26?.p1131RealDeviceActual?.zeroSilentErrorGatePass,true,'P113.2 must retain the P113.1 fail-closed real-device proof');
assert.strictEqual(p1132R26?.p1131RealDeviceActual?.exactValuePass,false,'P113.2 must retain the unresolved exact-value proof before patching');
for(const fixtureLiteral of ['O7C','Q7C']){
  for(const source of productionFiles) assert(!source.includes(fixtureLiteral),`P113.2 TEST fixture leaked into production: ${fixtureLiteral}`);
}
console.log('P113.2 ChatGPT-like Cell Evidence deterministic regression self-test: PASS');

// P113.3 GPT-VISION CELL REPLAY: exact-cell correction can be proven by diverse
// views of the same confirmed target cell even without depending on one particular
// composite-batch path. Content views remain inside the target cell.
const p1133Consensus=core.exactCellMultiViewConsensus('A7D',[
  {scope:'cell_view',mode:'full-line',candidate:'B7D',viewRegion:'full_cell',transform:'original',cropQuality:p1132CropQuality},
  {scope:'cell_view',mode:'content-line',candidate:'B7D',viewRegion:'content_inside_cell',transform:'original',cropQuality:p1132CropQuality},
  {scope:'cell_view',mode:'content-gray',candidate:'B7D',viewRegion:'content_inside_cell',transform:'grayscale',cropQuality:p1132CropQuality},
  {scope:'cell_view',mode:'processed',candidate:'A7D',viewRegion:'full_cell',transform:'processed',cropQuality:p1132CropQuality}
],p1132CropQuality);
assert.deepStrictEqual(p1133Consensus,{candidate:'B7D',exactViews:3,exactModes:3,evidenceFamilies:3,batch:0,originalExact:1,runnerExact:1,strength:'strong'});
assert.strictEqual(core.exactCellMultiViewConsensus('A7D',[
  {scope:'cell_view',mode:'m1',candidate:'B7D',viewRegion:'full_cell',transform:'original',cropQuality:p1132CropQuality},
  {scope:'cell_view',mode:'m2',candidate:'B7D',viewRegion:'full_cell',transform:'original',cropQuality:p1132CropQuality},
  {scope:'cell_view',mode:'m3',candidate:'B7D',viewRegion:'full_cell',transform:'original',cropQuality:p1132CropQuality}
],p1132CropQuality),null,'P113.3 must not treat repeated identical view-family votes as independent evidence');
assert(planImportSource.includes('function exactCellContentRegion('),'P113.3 must derive a tight character region only inside the confirmed target cell');
assert(planImportSource.includes("viewRegion: 'content_inside_cell'"),'P113.3 must distinguish content-region views from full-cell views');
assert(planImportSource.includes('primaryConfidence < 65'),'P113.3 low-confidence short codes must enter bounded exact-cell review without waiting for one specific batch path');
assert(planImportSource.includes("p109SharedOcrWithWorker('eng'"),'P113.3 alphanumeric exact-cell review must reuse the ENG shared OCR session');
assert(planImportSource.includes("scale: 1, psm: '7'"),'P113.3 must avoid the proven destructive 5x/6x re-enlargement for source-truth full-cell views');
assert(planImportSource.includes('exactCellEvidenceSummary'),'P113.3 unresolved real-device conflicts must expose exact-cell view evidence for diagnosis');
assert(fs.existsSync(path.join(__dirname,'golden-image-replay-p1133.py')),'P113.3 real-source image replay tool must be shipped with the regression pack');
assert.strictEqual(p1132R26?.p1132RealDeviceActual?.zeroSilentErrorGatePass,true,'P113.3 must retain the P113.2 real-device fail-closed proof');
assert.strictEqual(p1132R26?.p1132RealDeviceActual?.exactValuePass,false,'P113.3 must retain why the exact-cell replay patch is still required');
for(const fixtureLiteral of ['A7D','B7D']){
  for(const source of productionFiles) assert(!source.includes(fixtureLiteral),`P113.3 TEST fixture leaked into production: ${fixtureLiteral}`);
}
console.log('P113.3 GPT-Vision Cell Replay deterministic regression self-test: PASS');



// P113.3.1 RUNTIME FIX: the real-device ReferenceError escaped syntax/source
// checks because reviewItems was block-scoped inside try but consumed after
// finally. The declaration must live in recoverTextIntegrityTargeted() function
// scope and an executable runtime gate must be wired into preBuild.
const p11331RecoveryStart=planImportSource.indexOf('async function recoverTextIntegrityTargeted(');
const p11331RecoveryEnd=planImportSource.indexOf('// CORE-005R:',p11331RecoveryStart);
assert(p11331RecoveryStart>=0 && p11331RecoveryEnd>p11331RecoveryStart,'P113.3.1 text-integrity function must be present');
const p11331RecoverySource=planImportSource.slice(p11331RecoveryStart,p11331RecoveryEnd);
const p11331ReviewDecl=p11331RecoverySource.indexOf('const reviewItems = [];');
const p11331Try=p11331RecoverySource.indexOf('try {');
assert(p11331ReviewDecl>=0,'P113.3.1 reviewItems collection must be declared');
assert(p11331Try>=0 && p11331ReviewDecl<p11331Try,'P113.3.1 reviewItems must be function-scoped before the OCR try-block');
assert.strictEqual((p11331RecoverySource.match(/const reviewItems = \[\];/g)||[]).length,1,'P113.3.1 reviewItems must have exactly one declaration');
const p11331RuntimeSmoke=path.join(__dirname,'plan-import-runtime-smoke-p11331.js');
assert(fs.existsSync(p11331RuntimeSmoke),'P113.3.1 executable plan-import runtime smoke must ship');
const p11331BuildGradle=fs.readFileSync(path.join(__dirname,'../app/build.gradle'),'utf8');
assert(p11331BuildGradle.includes("tasks.register('planImportRuntimeSmoke', Exec)"),'P113.3.1 Gradle must register runtime smoke gate');
assert(p11331BuildGradle.includes("dependsOn tasks.named('planImportRuntimeSmoke')"),'P113.3.1 APK preBuild must depend on runtime smoke gate');
const p11331RuntimeCase=p113Manifest.cases.find(item=>item.id==='GE-20261007-WA0001-RUNTIME-P1133-REVIEWITEMS');
assert.strictEqual(p11331RuntimeCase?.previousActual?.error,'reviewItems is not defined','P113.3.1 must retain the confirmed real-device runtime regression');
assert.strictEqual(p11331RuntimeCase?.expected?.apkBuildBlockedWhenRuntimeSmokeFails,true,'P113.3.1 runtime failure must block APK packaging');
console.log('P113.3.1 runtime-scope/build-gate deterministic regression self-test: PASS');
// P113.4 EDGE-GLYPH ADJUDICATION: a unique independent batch answer may resolve
// one unstable edge glyph only when every non-empty exact-cell view preserves
// the same remaining core, the evidence spans multiple view families/states,
// and at least one view loses the edge glyph completely.
const p1134Quality={fullCellIncluded:true,leftEdgeClipped:false,rightEdgeClipped:false,neighborColumnIncluded:false,targetCellGeometryConfirmed:true};
const p1134Attempts=[
  {scope:'batch',mode:'batch',candidate:'N4Q'},
  {scope:'cell_view',mode:'full-original',candidate:'M4Q',viewRegion:'full_cell',transform:'original',cropQuality:p1134Quality},
  {scope:'cell_view',mode:'content-original-7',candidate:'4Q',viewRegion:'content_inside_cell',transform:'original',cropQuality:p1134Quality},
  {scope:'cell_view',mode:'content-original-10',candidate:'4Q',viewRegion:'content_inside_cell',transform:'original',cropQuality:p1134Quality},
  {scope:'cell_view',mode:'processed-8',candidate:'S4Q',viewRegion:'full_cell',transform:'original',cropQuality:p1134Quality}
];
assert.deepStrictEqual(core.edgeGlyphAdjudication('M4Q',p1134Attempts,p1134Quality),{
  candidate:'N4Q',edge:'left',core:'4Q',compatibleViews:4,evidenceFamilies:3,edgeStates:3,missingEdgeViews:2,batch:1,strength:'edge_glyph_adjudicated'
});
assert.strictEqual(core.edgeGlyphAdjudication('M4Q',p1134Attempts.concat([{scope:'batch',mode:'batch2',candidate:'P4Q'}]),p1134Quality),null,'P113.4 competing batch candidates must fail closed');
assert.strictEqual(core.edgeGlyphAdjudication('M4Q',p1134Attempts.map(x=>x.candidate==='4Q'?{...x,candidate:'M4Q'}:x),p1134Quality),null,'P113.4 requires at least one missing-edge exact-cell view');
assert.strictEqual(core.edgeGlyphAdjudication('M4Q',p1134Attempts.concat([{scope:'cell_view',mode:'competing-core',candidate:'M5Q',viewRegion:'full_cell',transform:'grayscale',cropQuality:p1134Quality}]),p1134Quality),null,'P113.4 competing exact-cell core evidence must fail closed');
assert.strictEqual(core.edgeGlyphAdjudication('M4Q',p1134Attempts.slice(0,3),p1134Quality),null,'P113.4 fewer than three compatible exact-cell views must fail closed');
assert(planImportSource.includes("ocrIntegrityCore?.edgeGlyphAdjudication"),'P113.4 plan import must consume the bounded core adjudicator');
assert(planImportSource.includes("'edge_glyph_adjudication'"),'P113.4 correction source must be auditable');
assert(planImportSource.includes('promotedFromEdgeGlyphAdjudication'),'P113.4 evidence details must be persisted for diagnosis');
const p1134Case=p113Manifest.cases.find(item=>item.id==='GE-20261007-WA0001-R26');
assert.strictEqual(p1134Case?.p1134Target?.realDeviceProofPending,false,'P113.4 Realgeraet proof must be closed after confirmed device PASS');
assert.strictEqual(p1134Case?.p1134RealDeviceActual?.flightLocation,'9MB','P113.4 Realgeraet result must lock the confirmed edge-glyph value');
assert.strictEqual(p1134Case?.p1134RealDeviceActual?.errors,0,'P113.4 Realgeraet result must retain 0 OCR/data errors');
assert.strictEqual(p1134Case?.p1134RealDeviceActual?.importBlockedByOcr,false,'P113.4 Realgeraet result must confirm the OCR blockade is removed');
assert.strictEqual(p1134Case?.p1134RealDeviceActual?.dateConfirmationPending,true,'P113.4 must keep the separate date confirmation gate explicit');
assert.strictEqual(p1134Case?.p1134Target?.requires?.rejectCompetingBatchOrCoreEvidence,true,'P113.4 Golden target must retain fail-closed competition gate');
for(const fixtureLiteral of ['M4Q','N4Q','S4Q','P4Q','M5Q']){
  for(const source of productionFiles) assert(!source.includes(fixtureLiteral),`P113.4 TEST fixture leaked into production: ${fixtureLiteral}`);
}
console.log('P113.4 edge-glyph adjudication deterministic regression self-test: PASS');

// P113.5 HEADER/TIME GEOMETRY RECOVERY: keep the historical attempt and the
// confirmed real-device FAIL in the Golden pack. P113.6 is the follow-up gate.
assert(planImportSource.includes('inferRideTimeAnchorFromRawLines(lines, header.index, header.anchors)'),'P113.5 plan import must inspect raw header/data geometry before matrix completion');
assert(planImportSource.includes('rideTimeAnchorRecovery'),'P113.5 recovery evidence must remain diagnosable in image metadata');
assert(planImportSource.includes('recoveredFromRawData: true'),'P113.5 recovered primary time header must be explicitly marked synthetic/raw-data-derived');
const p1135Case=p113Manifest.cases.find(item=>item.id==='GE-20261007-WA0014-HEADER-TIME-P1135');
assert(p1135Case,'P113.5 confirmed WA0014 header/time Golden Error case must exist');
assert.strictEqual(p1135Case?.previousActual?.error,'Pflichtspalten nicht erkannt: time.','P113.5 must retain the exact confirmed pre-patch failure');
assert.strictEqual(p1135Case?.expected?.activeRides,12,'P113.5 WA0014 target must keep 12 active rides after one Storno');
assert.strictEqual(p1135Case?.p1135Target?.realDeviceProofPending,false,'P113.5 real-device proof is closed as confirmed FAIL');
assert.strictEqual(p1135Case?.p1135RealDeviceActual?.result,'FAIL','P113.5 manifest must retain the confirmed real-device FAIL');
assert.strictEqual(p1135Case?.p1135RealDeviceActual?.error,'Pflichtspalten nicht erkannt: time.','P113.5 real-device failure text must remain locked');
assert.strictEqual(p113Manifest?.p1135?.baseHead,'e4f6933','P113.5 manifest must record the verified pre-patch main HEAD');
for(const fixtureLiteral of ['15:35','16:10','16:55','18:05','18:20','18:45']){
  for(const source of productionFiles) assert(!source.includes(fixtureLiteral),`P113.5 TEST fixture leaked into production: ${fixtureLiteral}`);
}
console.log('P113.5 header/time geometry recovery deterministic regression self-test: PASS');


// P113.6 ROW-ALIGNED TIME GEOMETRY: do not count arbitrary OCR line groups.
// Pair recurring decimal-price words with clock words on the same physical Y rows.
// The helper is pure/raw-word based, can recover a missing Preis header only with
// recurring price evidence, and stays fail-closed on weak or competing geometry.
function p1136Word(text,cx,cy,w=52,h=18){
  return {text,bbox:{x0:cx-w/2,x1:cx+w/2,y0:cy-h/2,y1:cy+h/2}};
}
function p1136Rows(options={}){
  const out=[];
  const n=Number(options.n||8);
  for(let i=0;i<n;i++){
    const y=160+i*52;
    if(!options.noPrice) out.push(p1136Word(`${40+i},50`,100+((i%3)-1)*Number(options.priceJitter||0),y,52));
    if(!Array.isArray(options.dropTimes)||!options.dropTimes.includes(i)) {
      out.push(p1136Word(`${String(8+i).padStart(2,'0')}:15`,250+((i%3)-1)*Number(options.timeJitter||0),y+(i%2?4:-3),58));
    }
    if(options.competingTime&&i<3) out.push(p1136Word(`${String(12+i).padStart(2,'0')}:45`,360,y,58));
    out.push(p1136Word('Pickup',560,y,72));
  }
  return out;
}
const p1136BaseAnchors=[
  {key:'preis',x:92},{key:'von',x:560},{key:'nach',x:950},{key:'name',x:1320},{key:'firma',x:1550},
  {key:'uhrzeit',x:1720},{key:'flugang',x:1900},{key:'flugausg',x:2110},{key:'wg',x:2280},{key:'pers',x:2410},
  {key:'uhrzeit',x:2550},{key:'ort',x:2820},{key:'wg',x:3090}
];
const p1136Recovered=core.inferRideTimeLeftGeometryFromRawWords(p1136Rows(),p1136BaseAnchors,3200);
assert.strictEqual(p1136Recovered?.accepted,true,'P113.6 must recover a missing primary ride-time anchor from row-aligned price/time evidence');
assert.strictEqual(p1136Recovered?.matchedRows,8,'P113.6 must count physical matched rows, not generic OCR line groups');
assert.strictEqual(p1136Recovered?.recoverPriceHeader,false,'P113.6 must preserve an existing Preis header');
const p1136MissingPrice=core.inferRideTimeLeftGeometryFromRawWords(p1136Rows(),p1136BaseAnchors.filter(anchor=>anchor.key!=='preis'),3200);
assert.strictEqual(p1136MissingPrice?.accepted,true,'P113.6 may recover the Preis anchor only from recurring row-aligned price evidence');
assert.strictEqual(p1136MissingPrice?.recoverPriceHeader,true,'P113.6 must mark a data-derived Preis header explicitly');
const p1136PrimaryPresent=core.inferRideTimeLeftGeometryFromRawWords(p1136Rows(),[...p1136BaseAnchors,{key:'uhrzeit',x:250}],3200);
assert.strictEqual(p1136PrimaryPresent?.reason,'primary_time_header_present','P113.6 normal pre-matrix path must stay inactive when the primary header is already present');
const p1136ForcedReplay=core.inferRideTimeLeftGeometryFromRawWords(p1136Rows(),[...p1136BaseAnchors,{key:'uhrzeit',x:250}],3200,{allowExistingPrimaryHeader:true});
assert.strictEqual(p1136ForcedReplay?.accepted,true,'P113.6 time-only replay may override an observed primary header after downstream mapping proved time is missing');
assert.strictEqual(core.inferRideTimeLeftGeometryFromRawWords(p1136Rows({dropTimes:[0,1,2,3,4,5]}),p1136BaseAnchors,3200)?.accepted,false,'P113.6 fewer than three matched time rows must fail closed');
assert.strictEqual(core.inferRideTimeLeftGeometryFromRawWords(p1136Rows({noPrice:true}),p1136BaseAnchors.filter(anchor=>anchor.key!=='preis'),3200)?.accepted,false,'P113.6 no-price layouts must not manufacture a Preis/time pair');
assert.strictEqual(core.inferRideTimeLeftGeometryFromRawWords(p1136Rows({competingTime:true}),p1136BaseAnchors,3200)?.reason,'competing_time_cluster','P113.6 repeated competing time geometry must fail closed');
assert.strictEqual(core.inferRideTimeLeftGeometryFromRawWords(p1136Rows({timeJitter:12,priceJitter:7}),p1136BaseAnchors,3200)?.accepted,true,'P113.6 must tolerate bounded OCR X jitter across physical rows');
assert(planImportSource.includes("p1136_time_only_matrix_replay"),'P113.6 must include a no-new-OCR matrix replay for an actual time-only mapping failure');
assert(planImportSource.includes("forceRowAlignedRideTime: true"),'P113.6 replay must explicitly force row-aligned recovery after the time-only failure is proven');
assert(planImportSource.includes("rideTimeRowGeometryDiagnostic"),'P113.6 row-geometry evidence must remain diagnosable');
assert(planImportSource.includes("P113.6 Diagnose"),'P113.6 must expose a compact reason before a repeated required-time abort');
assert.strictEqual(p1135Case?.p1136Target?.baseHead,'920d5f7','P113.6 Golden target must record the user-verified P113.5 final main HEAD');
assert.strictEqual(p1135Case?.p1136Target?.realDeviceProofPending,false,'P113.6 Golden target must record that the real-device proof was executed');
assert.strictEqual(p1135Case?.p1136RealDeviceActual?.result,'PARTIAL_PASS_OVERALL_FAIL','P113.6 Golden case must retain the confirmed partial-pass/overall-fail real-device result');
assert.strictEqual(p1135Case?.p1136RealDeviceActual?.timeMappingPresent,true,'P113.6 real device must retain proof that the original time-only blocker was solved');
assert.strictEqual(p113Manifest?.p1136?.baseHead,'920d5f7','P113.6 manifest must record the verified patch base HEAD');
assert.strictEqual(p113Manifest?.p1136?.noSecondOcrForReplay,true,'P113.6 time-only replay must reuse existing raw OCR words');
for(const fixtureLiteral of ['15:35','16:10','16:55','18:05','18:20','18:45']){
  for(const source of productionFiles) assert(!source.includes(fixtureLiteral),`P113.6 TEST fixture leaked into production: ${fixtureLiteral}`);
}
console.log('P113.6 row-aligned time geometry deterministic regression self-test: PASS');

// P113.7: P113.6 real-device diagnostics proved a second structural class: a
// 14-column price layout can collapse to 13 when the middle timeMirror header
// is degraded. The production candidate must carry the new deterministic gate
// and Golden records without hardcoding concrete source values.
const p1137SchemaCase=p113Manifest.cases.find(item=>item.id==='GE-20261007-WA0014-P1136-MIRROR-SCHEMA-COMPRESSION');
assert(p1137SchemaCase,'P113.7 manifest must retain the confirmed mirror-schema compression case');
assert.strictEqual(p1137SchemaCase?.expected?.physicalColumns,14,'P113.7 Golden case must lock the 14-column source schema');
assert.strictEqual(p1137SchemaCase?.expected?.timeMirror,6,'P113.7 Golden case must lock middle timeMirror at column 6');
assert.strictEqual(p113Manifest?.p1137?.hardcodingAllowed,false,'P113.7 production hardcoding remains forbidden');
assert.strictEqual(p113Manifest?.p1137?.realDeviceProofPending,false,'P113.7 manifest must record that the real-device proof was executed');
assert.strictEqual(p113Manifest?.p1137?.realDeviceResult,'STRUCTURAL_PASS_INTEGRITY_FAIL','P113.7 manifest must retain the confirmed structural-pass/integrity-fail result');
assert(planImportSource.includes('inferMirrorTimeEvidenceFromRawWords'),'P113.7 must derive mirror-schema evidence from raw-word geometry');
assert(planImportSource.includes('mirrorTimeRowGeometryDiagnostic'),'P113.7 mirror geometry evidence must remain diagnosable');
assert(planImportSource.includes('normalizeCompanyBoundaryOcrNoise'),'P113.7 must retain bounded company table-edge normalization');
assert(planImportSource.includes('primaryRouteRawEdgeRecovery'),'P113.7 must retain strong-primary route edge recovery');
assert(planImportSource.includes('routeSecondaryEdgeDecision'),'P113.7 must retain bounded secondary route edge adjudication');
assert(planImportSource.includes('cancellationRowColorSignal'),'P113.7 must retain independent row-color cancellation corroboration');
assert.strictEqual(Number(p113Manifest.summary?.caseRecords||0)>=40,true,'P113.7 manifest must retain all newly confirmed WA0014 Golden cases');
console.log('P113.7 mirror/schema Golden manifest deterministic regression self-test: PASS');


// P113.8: after P113.7 structural success, real-device evidence exposed bounded
// text-edge integrity failures. The new release gate must preserve these Golden
// cases and require the dedicated helper self-test before APK packaging.
const p1138CustomerCase=p113Manifest.cases.find(item=>item.id==='GE-20261007-WA0014-P1137-CUSTOMER-TERMINAL-PUNCT');
const p1138CompanyCase=p113Manifest.cases.find(item=>item.id==='GE-20261007-WA0014-R7-COMPANY-EDGE-TRUNCATION-P1137');
assert(p1138CustomerCase,'P113.8 manifest must retain repeated customer terminal-punctuation false conflicts');
assert(p1138CompanyCase,'P113.8 manifest must retain the hyphenated company edge-truncation overcorrection');
assert.strictEqual(p113Manifest?.p1138?.baseHead,'9430b5a','P113.8 manifest must record the freshly user-verified P113.7 post-installer main HEAD');
assert.strictEqual(p113Manifest?.p1138?.hardcodingAllowed,false,'P113.8 production hardcoding remains forbidden');
assert.strictEqual(p113Manifest?.p1138?.realDeviceProofPending,false,'P113.8 manifest must record that the real-device proof was executed');
assert.strictEqual(p113Manifest?.p1138?.realDeviceResult,'STRUCTURAL_PASS_SILENT_INTEGRITY_FAIL','P113.8 manifest must retain the confirmed silent-integrity failure');
assert(planImportSource.includes('strongPrimarySecondaryEdgeDegradation'),'P113.8 must retain bounded customer/company secondary edge adjudication');
assert(planImportSource.includes('strongPrimaryRouteSecondaryEdgeDegradation'),'P113.8 must retain strong-primary multi-token route edge preservation');
assert(planImportSource.includes('primarySingleTokenRawEdgeRecovery'),'P113.8 must retain bounded single-token raw edge recovery');
assert.strictEqual(Number(p113Manifest.summary?.caseRecords||0)>=44,true,'P113.8/P113.9 manifest must retain all newly confirmed Golden cases');
console.log('P113.8 text-edge Golden manifest deterministic regression self-test: PASS');




// P113.9: P113.8 reached a clean 0-error UI but still silently shortened a
// hyphenated company code and left-clipped a single-token flight location before
// automatic import. A separate source-truth full-cell family must now prove a
// bounded 1-2 glyph edge extension with two agreeing OCR modes.
const p1139CompanyCase=p113Manifest.cases.find(item=>item.id==='GE-20261007-WA0014-R12-COMPANY-SILENT-TRUNCATION-P1138');
const p1139ZeroGateCase=p113Manifest.cases.find(item=>item.id==='GE-20261007-WA0014-P1138-ZERO-SILENT-ERROR-GATE');
assert(p1139CompanyCase,'P113.9 manifest must retain the P113.8 silent company truncation case');
assert(p1139ZeroGateCase,'P113.9 manifest must retain the P113.8 zero-silent-error gate failure');
assert.strictEqual(p1139CompanyCase?.expected?.company,'Get-E','P113.9 Golden target must preserve the full source company code');
assert.strictEqual(p1139CompanyCase?.previousActual?.displayedCompany,'Get-','P113.9 Golden case must retain the confirmed P113.8 silent truncation');
assert.strictEqual(p1139ZeroGateCase?.previousActual?.automaticImportOccurred,true,'P113.9 must retain proof that P113.8 auto-imported despite silent mismatches');
assert.strictEqual(p113Manifest?.p1139?.baseHead,'476cb3a','P113.9 manifest must record the freshly user-verified P113.8 post-installer main HEAD');
assert.strictEqual(p113Manifest?.p1139?.hardcodingAllowed,false,'P113.9 production hardcoding remains forbidden');
assert.strictEqual(p113Manifest?.p1139?.realDeviceProofPending,false,'P113.9 manifest must record that the real-device proof was executed');
assert.strictEqual(p113Manifest?.p1139?.realDeviceResult,'FAIL_COMPANY_FALSE_CONFLICT_AND_SILENT_LOCATION_CLIP','P113.9 manifest must retain the confirmed real-device failure mode');
assert(planImportSource.includes('sourceTruthFullCellTextOcr'),'P113.9 must collect the bounded full source cell as a separate evidence family');
assert(planImportSource.includes('sourceTruthFullCellConsensus'),'P113.9 must require source-truth full-cell consensus');
assert(planImportSource.includes('strictTextEdgeExtension'),'P113.9 must limit recovery to strict edge-only extension');
assert(planImportSource.includes('source_truth_full_cell_edge_consensus'),'P113.9 flight-location correction source must stay diagnosable');
assert(planImportSource.includes('sourceTruthCellCandidate'),'P113.9 full-cell source truth must normalize only table-edge geometry noise before consensus');
for(const fixtureLiteral of ['IMG-20261007-WA0014.jpg','GE-20261007-WA0014-R12-COMPANY-SILENT-TRUNCATION-P1138']){
  for(const source of productionFiles) assert(!source.includes(fixtureLiteral),`P113.9 TEST/source identifier leaked into production: ${fixtureLiteral}`);
}
console.log('P113.9 source-truth full-cell edge integrity deterministic regression self-test: PASS');

// P114.0: P113.9 safely preserved the hyphenated company primary but still
// blocked on a clipped secondary candidate, while the single-token flight
// location remained silently left-clipped. Two-mode source-truth evidence now
// removes only those bounded edge-loss failures without relaxing semantic gates.
const p1140CompanyCase=p113Manifest.cases.find(item=>item.id==='GE-20261007-WA0014-R12-COMPANY-FALSE-CONFLICT-P1139');
const p1140LocationCase=p113Manifest.cases.find(item=>item.id==='GE-20261007-WA0014-R14-FLIGHTLOCATION-SILENT-LEFTCLIP-P1139');
assert(p1140CompanyCase,'P114.0 manifest must retain the P113.9 company false-conflict case');
assert(p1140LocationCase,'P114.0 manifest must retain the P113.9 silent flight-location clip case');
assert.strictEqual(p113Manifest?.p1140?.baseHead,'d977e3e','P114.0 manifest must record the freshly user-verified P113.9 post-installer main HEAD');
assert.strictEqual(p113Manifest?.p1140?.hardcodingAllowed,false,'P114.0 production hardcoding remains forbidden');
assert.strictEqual(p113Manifest?.p1140?.realDeviceProofPending,false,'P114.0 manifest must record that the real-device proof was executed');
assert.strictEqual(p113Manifest?.p1140?.realDeviceResult,'VALUES_CORRECT_FALSE_POSITIVE_BLOCKING_FAIL','P114.0 manifest must retain the confirmed false-positive blocking failure');
assert(planImportSource.includes('sourceTruthExpandedEdgeTextOcr'),'P114.0 must collect bounded edge-expanded source-truth views');
assert(planImportSource.includes('sourceTruthExpandedEdgeRecovery'),'P114.0 must require two-mode expanded-edge consensus');
assert(planImportSource.includes('source_truth_primary_company_edge_veto'),'P114.0 company preservation must remain diagnosable');
assert(planImportSource.includes('source_truth_expanded_cell_edge_consensus'),'P114.0 flight-location edge recovery must remain diagnosable');
for(const fixtureLiteral of ['IMG-20261007-WA0014.jpg','GE-20261007-WA0014-R12-COMPANY-FALSE-CONFLICT-P1139','GE-20261007-WA0014-R14-FLIGHTLOCATION-SILENT-LEFTCLIP-P1139']){
  for(const source of productionFiles) assert(!source.includes(fixtureLiteral),`P114.0 TEST/source identifier leaked into production: ${fixtureLiteral}`);
}
console.log('P114.0 edge source-truth integrity deterministic regression self-test: PASS');

// P114.1: P114.0 restored the correct primary values but still blocked four
// rows on weaker secondary OCR edge artifacts. The new gate may only veto those
// secondary conflicts when two independent source-truth views confirm the current
// primary value; it never invents/replaces semantic content.
const p1141Krakau5=p113Manifest.cases.find(item=>item.id==='GE-20261007-WA0014-R5-FLIGHTLOCATION-TABLE-EDGE-P1140');
const p1141Krakau6=p113Manifest.cases.find(item=>item.id==='GE-20261007-WA0014-R6-FLIGHTLOCATION-TABLE-EDGE-P1140');
const p1141Company=p113Manifest.cases.find(item=>item.id==='GE-20261007-WA0014-R12-COMPANY-FALSE-CONFLICT-P1140');
const p1141Location=p113Manifest.cases.find(item=>item.id==='GE-20261007-WA0014-R14-FLIGHTLOCATION-FALSE-CONFLICT-P1140');
assert(p1141Krakau5&&p1141Krakau6&&p1141Company&&p1141Location,'P114.1 manifest must retain all four confirmed P114.0 false-positive blocks');
assert.strictEqual(p113Manifest?.p1141?.baseHead,'82cf700','P114.1 manifest must record the freshly user-verified P114.0 post-installer main HEAD');
assert.strictEqual(p113Manifest?.p1141?.hardcodingAllowed,false,'P114.1 production hardcoding remains forbidden');
assert.strictEqual(p113Manifest?.p1141?.realDeviceProofPending,false,'P114.1 manifest must record that the real-device proof was executed');
assert.strictEqual(p113Manifest?.p1141?.realDeviceResult,'WA0014_PASS_WA0001_COMPANY_BOUNDARY_FALSE_POSITIVE_FAIL','P114.1 manifest must retain the confirmed WA0001 boundary regression');
assert(planImportSource.includes('sourceTruthPrimaryEdgeVeto'),'P114.1 must retain primary source-truth veto logic');
assert(planImportSource.includes('sourceTruthExpandedCellConsensus'),'P114.1 must require expanded source-truth consensus');
assert(planImportSource.includes('source_truth_primary_table_edge_veto'),'P114.1 table-edge veto must remain diagnosable');
assert(planImportSource.includes('source_truth_primary_edge_truncation_veto'),'P114.1 truncation veto must remain diagnosable');
for(const fixtureLiteral of ['GE-20261007-WA0014-R5-FLIGHTLOCATION-TABLE-EDGE-P1140','GE-20261007-WA0014-R12-COMPANY-FALSE-CONFLICT-P1140','GE-20261007-WA0014-R14-FLIGHTLOCATION-FALSE-CONFLICT-P1140']){
  for(const source of productionFiles) assert(!source.includes(fixtureLiteral),`P114.1 TEST/source identifier leaked into production: ${fixtureLiteral}`);
}
console.log('P114.1 primary source-truth edge veto deterministic regression self-test: PASS');

// P114.2: P114.1 passed WA0014 but the mandatory WA0001 regression exposed
// nine false company conflicts: eight table-rule edge artifacts and one exact
// loss of the single internal company delimiter. Two agreeing source-truth views
// may veto only these boundary-only degradations; semantic alternatives stay closed.
const p1142Ids=[12,13,14,17,25,28,29,31,32].map(row=>`GE-20261007-WA0001-R${row}-COMPANY-${row===17?'INTERNAL-DELIMITER-LOSS':'TABLE-EDGE'}-P1141`);
const p1142Cases=p1142Ids.map(id=>p113Manifest.cases.find(item=>item.id===id));
assert(p1142Cases.every(Boolean),'P114.2 manifest must retain all nine confirmed P114.1 WA0001 company boundary blocks');
assert.strictEqual(p113Manifest?.p1142?.baseHead,'e27e1c6','P114.2 manifest must record the freshly user-verified P114.1 post-installer main HEAD');
assert.strictEqual(p113Manifest?.p1142?.hardcodingAllowed,false,'P114.2 production hardcoding remains forbidden');
assert.strictEqual(p113Manifest?.p1142?.realDeviceProofPending,true,'P114.2 must not pre-claim real-device success');
assert.strictEqual(p113Manifest?.p1141?.realDeviceActual?.wa0001?.edgeGlyphGoldenValue,'9MB','P114.2 must retain the P113.4 9MB real-device regression proof');
assert.strictEqual(Number(p113Manifest.summary?.caseRecords||0)>=59,true,'P114.2 manifest must include all nine new Golden error records');
assert(planImportSource.includes('singleInternalCompanyDelimiterLoss'),'P114.2 must retain exact one-internal-delimiter loss detection');
assert(planImportSource.includes('source_truth_primary_internal_delimiter_loss_veto'),'P114.2 delimiter-loss veto must remain diagnosable');
assert(planImportSource.includes('source_truth_primary_table_edge_veto'),'P114.2 company table-edge veto must remain diagnosable');
for(const fixtureLiteral of ['IMG-20261007-WA0001.jpg','GE-20261007-WA0001-R17-COMPANY-INTERNAL-DELIMITER-LOSS-P1141']){
  for(const source of productionFiles) assert(!source.includes(fixtureLiteral),`P114.2 TEST/source identifier leaked into production: ${fixtureLiteral}`);
}
console.log('P114.2 company boundary source-truth deterministic regression self-test: PASS');

