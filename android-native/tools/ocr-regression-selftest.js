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
console.log('P107.4 OCR regression self-test: PASS');
