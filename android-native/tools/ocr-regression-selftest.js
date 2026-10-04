#!/usr/bin/env node
'use strict';
const assert=require('assert');
const core=require('../app/src/main/assets/js/ocr-integrity-core.js');
// Historical fixtures are TEST-ONLY evidence. They are not production mappings/hardcodes.
assert(core.safeLongPrefixFlightAlternative('EWQ882','EW9882'));
assert(core.safeLongPrefixFlightAlternative('EWS5702','EW5702'));
assert(!core.safeLongPrefixFlightAlternative('EWS5702','EW5703'));
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
const fs=require('fs'),path=require('path');
const productionFiles=[
  '../app/src/main/assets/js/ocr-integrity-core.js',
  '../app/src/main/assets/js/plan-import.js',
  '../app/src/main/assets/js/app.js'
].map(p=>fs.readFileSync(path.join(__dirname,p),'utf8'));
for(const source of productionFiles){
  for(const fixtureLiteral of ['EWQ882','EWS5702','EW9882','EW5702','Daniel?','Avion ~~']){
    assert(!source.includes(fixtureLiteral),`TEST fixture leaked into production: ${fixtureLiteral}`);
  }
}
console.log('P107.1 OCR regression self-test: PASS');
