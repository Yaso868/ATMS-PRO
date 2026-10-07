#!/usr/bin/env node
'use strict';

// P113.6 executable integration gate.
// Loads the REAL plan-import.js into a browser-like VM sandbox and executes the
// real imageWordsToMatrix() + mapping probe with deterministic OCR-word geometry.
// No production function is copied into this test, and no historical ride value is
// used as a production rule.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const root = path.join(__dirname, '..');
const core = require(path.join(root, 'app', 'src', 'main', 'assets', 'js', 'ocr-integrity-core.js'));
const planImportPath = path.join(root, 'app', 'src', 'main', 'assets', 'js', 'plan-import.js');
let source = fs.readFileSync(planImportPath, 'utf8');

function fail(message) {
  console.error(`P113.6 header/time integration self-test: FAIL – ${message}`);
  process.exit(1);
}

const endMarker = "  document.addEventListener('DOMContentLoaded', init);\n})();";
if (!source.includes(endMarker)) fail('plan-import test hook marker not found');
source = source.replace(
  endMarker,
  "  window.__P1136IntegrationTest=Object.freeze({imageWordsToMatrix,p1136TimeOnlyMappingProbe});\n})();"
);

const sandbox = {
  console,
  window: {
    ATMSOcrIntegrityCore: core,
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {},
    location: { href: 'https://atms.test/index.html' }
  },
  document: {
    currentScript: { src: 'https://atms.test/js/plan-import.js' },
    addEventListener() {},
    getElementById() { return null; },
    createElement() { return { getContext() { return null; }, style: {}, addEventListener() {} }; },
    body: { appendChild() {} }
  },
  location: { href: 'https://atms.test/index.html' },
  performance: { now: () => 0 },
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  Map,
  Set,
  WeakMap,
  Promise,
  Array,
  Object,
  Number,
  String,
  Boolean,
  Math,
  Date,
  RegExp,
  JSON,
  Intl,
  URL,
  Blob,
  FileReader: function FileReader() {},
  TextEncoder,
  TextDecoder,
  navigator: {},
  localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
  sessionStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
  CustomEvent: function CustomEvent() {},
  Image: function Image() {},
  File: function File() {}
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
try {
  vm.runInContext(source, sandbox, { filename: 'plan-import-p1136-integration.js' });
} catch (error) {
  fail(`plan-import load failed: ${error?.stack || error}`);
}

const api = sandbox.window.__P1136IntegrationTest;
if (!api) fail('integration test API not exposed');

function word(text, cx, cy, confidence = 96, width = 70, height = 18) {
  return {
    text,
    confidence,
    bbox: {
      x0: cx - width / 2,
      x1: cx + width / 2,
      y0: cy - height / 2,
      y1: cy + height / 2
    }
  };
}

function makePlan({ price = true, removeFirstTime = false, removePriceHeader = false } = {}) {
  const out = [];
  const headerY = 80;
  const columns = price
    ? [
        ['Preis', 100], ['Uhrzeit', 250], ['Von', 560], ['Nach', 900], ['Name', 1200], ['Firma', 1450],
        ['Uhrzeit', 1650], ['Flugang.', 1850], ['Flugausg.', 2050], ['Wg', 2250], ['Pers', 2400],
        ['Uhrzeit', 2550], ['Ort', 2800], ['Wg', 3100]
      ]
    : [
        ['Uhrzeit', 180], ['Von', 500], ['Nach', 850], ['Name', 1180], ['Firma', 1450], ['Uhrzeit', 1650],
        ['Flugang.', 1850], ['Flugausg.', 2050], ['Wg', 2250], ['Pers', 2400], ['Uhrzeit', 2550],
        ['Ort', 2800], ['Wg', 3100]
      ];

  columns.forEach(([label, x], index) => {
    const primaryTimeIndex = price ? 1 : 0;
    if (removeFirstTime && label === 'Uhrzeit' && index === primaryTimeIndex) return;
    if (removePriceHeader && label === 'Preis') return;
    out.push(word(label, x, headerY));
  });

  for (let i = 0; i < 8; i += 1) {
    const y = 145 + i * 55;
    const cells = [];
    if (price) cells.push([`${40 + i},50`, 100]);
    cells.push(
      [`${String(8 + i).padStart(2, '0')}:15`, price ? 250 : 180],
      ['Hotel', price ? 560 : 500],
      ['Airport', price ? 900 : 850],
      ['Client', price ? 1200 : 1180],
      ['Company', 1450],
      [`${String(8 + i).padStart(2, '0')}:15`, 1650],
      ['EW1234', 1850],
      ['Pkw', 2250],
      ['2', 2400],
      ['09:30', 2550],
      ['Wien', 2800],
      ['Driver', 3100]
    );
    cells.forEach(([text, x]) => out.push(word(text, x, y)));
  }
  return out;
}

function run(words, options = {}) {
  const matrix = api.imageWordsToMatrix(words, 3200, options);
  const probe = api.p1136TimeOnlyMappingProbe(matrix);
  return { matrix, probe, meta: matrix._atmsImageMeta || {} };
}

function assertPrice14(result, label) {
  assert.deepStrictEqual(Array.from(result.probe.missing || []), [], `${label}: required mapping missing`);
  assert.deepStrictEqual(Array.from(result.probe.ambiguities || []), [], `${label}: mapping must remain unambiguous`);
  assert.strictEqual(result.matrix[0].length, 14, `${label}: must retain 14 columns`);
  assert.strictEqual(result.probe.mapping.time, 1, `${label}: ride time must remain column 1`);
  assert.strictEqual(result.probe.mapping.pickup, 2, `${label}: pickup must remain column 2`);
  assert.strictEqual(result.probe.mapping.destination, 3, `${label}: destination must remain column 3`);
  assert.strictEqual(result.probe.mapping.timeMirror, 6, `${label}: mirror time must remain column 6`);
  assert.strictEqual(result.probe.mapping.flightTime, 11, `${label}: flight time must remain column 11`);
}

const normalPrice = run(makePlan({ price: true }));
assertPrice14(normalPrice, '14-column control');
assert.strictEqual(normalPrice.meta.rideTimeRowGeometryDiagnostic?.accepted, false, 'control must not invoke P113.6 recovery');

const firstTimeMissing = run(makePlan({ price: true, removeFirstTime: true }));
assertPrice14(firstTimeMissing, 'first time header missing');

const priceAndTimeMissing = run(makePlan({ price: true, removeFirstTime: true, removePriceHeader: true }));
assertPrice14(priceAndTimeMissing, 'Preis + first time header missing');
assert.strictEqual(priceAndTimeMissing.meta.rideTimeRowGeometryDiagnostic?.accepted, true, 'P113.6 must recover strong row-aligned Preis/time geometry');
assert.strictEqual(priceAndTimeMissing.meta.rideTimeRowGeometryDiagnostic?.recoverPriceHeader, true, 'missing Preis header must be explicitly data-derived');

const forcedReplay = run(makePlan({ price: true }), { forceRowAlignedRideTime: true });
assertPrice14(forcedReplay, 'forced time-only replay');
assert.strictEqual(forcedReplay.meta.p1136ForcedRowAlignedReplay, true, 'forced replay flag must be auditable');
assert.strictEqual(forcedReplay.meta.rideTimeRowGeometryDiagnostic?.accepted, true, 'forced replay must use strong row-aligned evidence');

const noPrice = run(makePlan({ price: false }));
assert.deepStrictEqual(Array.from(noPrice.probe.missing || []), [], '13-column no-price control must remain mapped');
assert.strictEqual(noPrice.matrix[0].length, 13, '13-column no-price layout must remain 13 columns');
assert.strictEqual(noPrice.probe.mapping.time, 0, 'no-price ride time must remain first column');
assert.strictEqual(noPrice.meta.rideTimeRowGeometryDiagnostic?.accepted, false, 'P113.6 must not alter a valid no-price control');

const noPriceFirstHeaderMissing = run(makePlan({ price: false, removeFirstTime: true }));
assert.strictEqual(noPriceFirstHeaderMissing.meta.rideTimeRowGeometryDiagnostic?.accepted, false, 'P113.6 must not manufacture price evidence in a no-price layout');
assert.strictEqual(noPriceFirstHeaderMissing.meta.rideTimeRowGeometryDiagnostic?.reason, 'insufficient_price_rows', 'no-price protection must fail closed for P113.6');

console.log('P113.6 header/time integration self-test: PASS');
