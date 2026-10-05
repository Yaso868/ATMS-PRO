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
assert(planImportSource.includes('textIntegrityEdgeConflictCanPromote'), 'P109.1 must evaluate edge conflicts against image + current-plan evidence');
assert(planImportSource.includes('Number(evidence.batch || 0) >= 1 && Number(evidence.local || 0) >= 1'), 'P109.1 peer promotion must still require independent batch + local image evidence');
assert(planImportSource.includes('samePlanPeerCount'), 'P109.1 edge-punctuation correction must require current-plan peer evidence');
assert(planImportSource.includes('writeCurrentAnalysisJsonPreview'), 'P109.1 blocked analyses must refresh the staged JSON preview');
assert(planImportSource.includes('deu_composite_batch_plus_local_cell_plus_same_plan_consensus'), 'P109.1 correction source must identify composite image + peer evidence');
for(const forbidden of ['Schiitz','‘Avion']){
  for(const source of productionFiles) assert(!source.includes(forbidden),`P109.1 fixture leaked into production: ${forbidden}`);
}
console.log('P109.1 Text Cell Integrity Gate follow-up regression self-test: PASS');
