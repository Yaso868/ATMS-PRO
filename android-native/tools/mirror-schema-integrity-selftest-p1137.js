#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const root = path.join(__dirname, '..');
const core = require(path.join(root, 'app', 'src', 'main', 'assets', 'js', 'ocr-integrity-core.js'));
const planImportPath = path.join(root, 'app', 'src', 'main', 'assets', 'js', 'plan-import.js');
let source = fs.readFileSync(planImportPath, 'utf8');

function fail(message) {
  console.error(`P113.7 mirror/schema integrity self-test: FAIL – ${message}`);
  process.exit(1);
}

const endMarker = "  document.addEventListener('DOMContentLoaded', init);\n})();";
if (!source.includes(endMarker)) fail('plan-import test hook marker not found');
source = source.replace(
  endMarker,
  "  window.__P1137IntegrationTest=Object.freeze({imageWordsToMatrix,p1136TimeOnlyMappingProbe,normalizeCompanyBoundaryOcrNoise,primaryRouteRawEdgeRecovery,routeSecondaryEdgeDecision,cancellationRowColorSignal,detectCancelledPlanRow,makeRide});\n})();"
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
  vm.runInContext(source, sandbox, { filename: 'plan-import-p1137-integration.js' });
} catch (error) {
  fail(`plan-import load failed: ${error?.stack || error}`);
}

const api = sandbox.window.__P1137IntegrationTest;
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

function makePlan({ degradeHeader = false, omitMirrorData = false } = {}) {
  const out = [];
  const columns = [
    ['Preis', 100], ['Uhrzeit', 250], ['Von', 560], ['Nach', 900], ['Name', 1200], ['Firma', 1450],
    ['Uhrzeit', 1650], ['Flugang.', 1850], ['Flugausg.', 2050], ['Wg', 2250], ['Pers', 2400],
    ['Uhrzeit', 2550], ['Ort', 2800], ['Wg', 3100]
  ];
  columns.forEach(([label, x]) => {
    if (degradeHeader) {
      const keep = new Set(['Von', 'Nach', 'Name', 'Wg', 'Pers']);
      if (!keep.has(label)) return;
    }
    out.push(word(label, x, 80));
  });
  for (let i = 0; i < 8; i += 1) {
    const y = 145 + i * 55;
    const cells = [
      [`${40 + i},50`, 100],
      [`${String(8 + i).padStart(2, '0')}:15`, 250],
      ['Hotel', 560], ['Airport', 900], ['Client', 1200], ['Company', 1450],
      ...(!omitMirrorData ? [[`${String(8 + i).padStart(2, '0')}:15`, 1650]] : []),
      ['EW1234', 1850], ['Pkw', 2250], ['2', 2400], ['09:30', 2550], ['City', 2800], ['Driver', 3100]
    ];
    cells.forEach(([text, x]) => out.push(word(text, x, y)));
  }
  return out;
}

function run(words) {
  const matrix = api.imageWordsToMatrix(words, 3200, {});
  return { matrix, probe: api.p1136TimeOnlyMappingProbe(matrix), meta: matrix._atmsImageMeta || {} };
}

const degraded = run(makePlan({ degradeHeader: true }));
assert.strictEqual(degraded.matrix[0].length, 14, 'degraded mirror layout must be reconstructed to 14 columns');
assert.strictEqual(degraded.probe.mapping.time, 1, 'ride time column');
assert.strictEqual(degraded.probe.mapping.pickup, 2, 'pickup column');
assert.strictEqual(degraded.probe.mapping.destination, 3, 'destination column');
assert.strictEqual(degraded.probe.mapping.timeMirror, 6, 'middle mirror time column');
assert.strictEqual(degraded.probe.mapping.arrivalFlight, 7, 'arrival flight column after mirror restoration');
assert.strictEqual(degraded.probe.mapping.departureFlight, 8, 'departure flight column after mirror restoration');
assert.strictEqual(degraded.probe.mapping.flightTime, 11, 'listed flight time column');
assert.strictEqual(degraded.probe.mapping.driver, 13, 'driver column');
assert.strictEqual(degraded.meta.mirrorTimeRowGeometryDiagnostic?.accepted, true, 'mirror geometry diagnostic must prove acceptance');
assert.strictEqual(degraded.meta.mirrorTimeRowGeometryDiagnostic?.matchedRows, 8, 'all synthetic physical rows align');

const degradedNoMirror = run(makePlan({ degradeHeader: true, omitMirrorData: true }));
assert.strictEqual(degradedNoMirror.matrix[0].length, 13, 'degraded layout without mirror data must remain 13 columns');
assert.strictEqual(degradedNoMirror.probe.mapping.time, 1, 'no-mirror ride time remains column 1');
assert.strictEqual(degradedNoMirror.probe.mapping.timeMirror, undefined, 'no mirror column may be invented');
assert.notStrictEqual(degradedNoMirror.meta.mirrorTimeRowGeometryDiagnostic?.accepted, true, 'no-mirror evidence must fail closed');

const companyClean = api.normalizeCompanyBoundaryOcrNoise('Partner-X |', '15:45', true);
assert.deepStrictEqual(JSON.parse(JSON.stringify(companyClean)), { value: 'Partner-X', changed: true, raw: 'Partner-X |' }, 'single terminal table bar with valid adjacent mirror must be removed');
assert.strictEqual(api.normalizeCompanyBoundaryOcrNoise('Partner-X |', '', true).changed, false, 'without mirror-time evidence one bar must remain untouched');
assert.strictEqual(api.normalizeCompanyBoundaryOcrNoise('Partner-X |', '15:45', false).changed, false, 'structured imports must be untouched');

const routeRaw = api.primaryRouteRawEdgeRecovery('lpha Center West', 'Alpha Center West', { confidence: 94, wordCount: 3 });
assert.strictEqual(routeRaw?.candidate, 'Alpha Center West', 'strong exact raw cell may restore a clipped leading glyph');
assert.strictEqual(routeRaw?.edge, 'left', 'left-edge restoration must be explicit');
assert.strictEqual(api.primaryRouteRawEdgeRecovery('lpha Center West', 'Alpha Center West', { confidence: 60, wordCount: 3 }), null, 'weak raw confidence must fail closed');
assert.strictEqual(api.primaryRouteRawEdgeRecovery('lpha', 'Alpha', { confidence: 96, wordCount: 1 }), null, 'single-word raw route must not be promoted by this multi-word gate');

const rightEdge = api.routeSecondaryEdgeDecision('Central Plaza West', 'Central Plaza Wes', ['Central Plaza West', ''], 95, 1);
assert.strictEqual(rightEdge?.keepPrimary, true, 'weak right-edge secondary truncation must not block strong repeated primary');
assert.strictEqual(rightEdge?.reason, 'secondary_right_edge_degradation');
assert.strictEqual(api.routeSecondaryEdgeDecision('Central Plaza West', 'Central Plaza Wes', ['Central Plaza Wes', 'Central Plaza Wes'], 95, 1), null, 'two exact-cell confirmations of the alternative must remain actionable');

const glyphEdge = api.routeSecondaryEdgeDecision('North Garden Inn', 'North Garden Inr', ['North Garden Inn', ''], 96, 1);
assert.strictEqual(glyphEdge?.keepPrimary, true, 'one terminal secondary glyph conflict may be rejected only with strong primary+peer+cell evidence');
assert.strictEqual(glyphEdge?.reason, 'secondary_edge_glyph_degradation');
assert.strictEqual(api.routeSecondaryEdgeDecision('North Garden Inn', 'North Garden Inr', ['North Garden Inn', ''], 96, 0), null, 'without same-plan primary peer remain fail closed');
assert.strictEqual(api.routeSecondaryEdgeDecision('North Garden Inn', 'South Garden Inn', ['North Garden Inn', ''], 96, 2), null, 'semantic first-token conflict must not be suppressed');

const mapping = { driver: 0, flightTime: 1, timeMirror: 2, flightLocation: 3, notes: 4 };
const cancelledByColor = api.detectCancelledPlanRow(['Storno', '', '', '', ''], mapping, {
  sourceRow: 2,
  imageMeta: { rowColorByMatrixIndex: { 1: { hex: '#f7c0b7' } } }
});
assert.strictEqual(cancelledByColor?.marker, 'storno', 'exact cancellation driver + warm-red source row must exclude row');
assert.ok(cancelledByColor?.fields?.includes('rowColor'), 'color must be recorded as the independent second signal');
assert.strictEqual(api.detectCancelledPlanRow(['Storno', '', '', '', ''], mapping, { sourceRow: 2, imageMeta: {} }), null, 'text marker alone remains insufficient');
assert.strictEqual(api.detectCancelledPlanRow(['Driver', '', '', '', ''], mapping, { sourceRow: 2, imageMeta: { rowColorByMatrixIndex: { 1: { hex: '#f7c0b7' } } } }), null, 'red row alone never cancels');
const cancelledByText = api.detectCancelledPlanRow(['Storno', '', 'Storno', '', ''], mapping, { sourceRow: 2, imageMeta: {} });
assert.strictEqual(cancelledByText?.marker, 'storno', 'historical two-text-signal cancellation path remains valid');

console.log('P113.7 mirror/schema integrity self-test: PASS');
