'use strict';

// P113.3.1 production-runtime smoke gate.
// Executes REAL function bodies extracted from plan-import.js, rather than
// checking only syntax/source strings. This specifically guards the real-device
// ReferenceError class that escaped P113.3 (reviewItems block scope), while also
// exercising one complete analyze() control path end-to-end.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const planImportPath = path.join(root, 'app', 'src', 'main', 'assets', 'js', 'plan-import.js');
const source = fs.readFileSync(planImportPath, 'utf8');

function fail(message) {
  console.error(`P113.3.1 plan-import runtime smoke: FAIL – ${message}`);
  process.exit(1);
}

function extractNamedFunction(name) {
  const needle = `function ${name}(`;
  let start = source.indexOf(`async ${needle}`);
  if (start < 0) start = source.indexOf(needle);
  if (start < 0) fail(`function ${name} not found`);

  const open = source.indexOf('{', start);
  if (open < 0) fail(`function ${name} has no body`);

  let depth = 0;
  let quote = '';
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  let templateExprDepth = 0;

  for (let i = open; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1] || '';

    if (lineComment) {
      if (ch === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (ch === '*' && next === '/') { blockComment = false; i += 1; }
      continue;
    }
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (quote === '`' && ch === '$' && next === '{') {
        templateExprDepth += 1;
        i += 1;
        continue;
      }
      if (quote === '`' && templateExprDepth > 0) {
        if (ch === '{') templateExprDepth += 1;
        if (ch === '}') templateExprDepth -= 1;
        continue;
      }
      if (ch === quote) quote = '';
      continue;
    }
    if (ch === '/' && next === '/') { lineComment = true; i += 1; continue; }
    if (ch === '/' && next === '*') { blockComment = true; i += 1; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  fail(`function ${name} body could not be extracted`);
}

async function runTextIntegrityRuntimeSmoke() {
  const functionSource = extractNamedFunction('recoverTextIntegrityTargeted');
  const sandbox = {
    console,
    Map,
    Set,
    Number,
    Boolean,
    Array,
    Object,
    Math,
    String,
    RegExp,
    Promise,
    Tesseract: {},
    window: { Tesseract: {} },
    $: () => null,
    cellText: value => String(value ?? '').trim(),
    textIntegritySourceForRide: (ride, field) => String(ride?.[field] ?? '').trim(),
    textIntegrityCellCandidate: value => String(value ?? '').replace(/\s+/g, ' ').trim(),
    textIntegrityAlternativeIsSafe: () => false,
    textIntegritySuspiciousEdge: () => false,
    textIntegrityPotentialGlyphSplit: () => false,
    buildTextIntegrityCompositeBatchCanvas: () => null,
    p109SharedOcrWithWorker: async () => null,
    p109PerfWorkerSetParameters: async () => {},
    p109PerfWorkerRecognize: async () => ({ data: { text: '' } }),
    p109PerfRecognizeOneShot: async () => ({ data: { text: '' } }),
    textIntegrityCompositeCandidatesByField: () => new Map(),
    cropCanvasRegion: () => ({}),
    exactCellContentRegion: () => null,
    exactCellMultiViewOcr: async () => [],
    rawImageCellWords: () => [],
    // P113.9 adds a bounded source-truth full-cell evidence family. The runtime
    // smoke isolates recoverTextIntegrityTargeted(), so provide neutral stubs for
    // its surrounding lexical helpers; the dedicated P113.9 self-test executes
    // those real helper bodies separately.
    isHyphenatedCompanyEdgeProbe: () => false,
    isSingleTokenFlightLocationEdgeProbe: () => false,
    sourceTruthFullCellTextOcr: async () => [],
    sourceTruthFullCellConsensus: () => null,
    sourceTruthEdgeRecovery: () => null,
    sourceTruthExpandedEdgeTextOcr: async () => [],
    sourceTruthExpandedEdgeRecovery: () => null,
    strictTextEdgeExtension: () => null,
    strongPrimarySecondaryEdgeDegradation: () => null,
    textIntegrityDecision: () => ({ status: 'ok', candidate: '', evidence: {} }),
    textIntegrityEdgeAlternative: () => false,
    textIntegritySamePlanPeerCount: () => 0,
    textIntegrityEdgeConflictPromotion: () => ({ ok: false, mode: '' }),
    exactCellEvidenceSummary: () => [],
    normalizeFlightLocation: value => value,
    ocrIntegrityCore: {},
  };

  vm.createContext(sandbox);
  vm.runInContext(`${functionSource}\nthis.__recoverTextIntegrityTargeted = recoverTextIntegrityTargeted;`, sandbox, { filename: 'plan-import-runtime-smoke:text-integrity' });

  const rides = [{
    sourceRow: 2,
    customer: 'ACME',
    imageCellEvidence: {
      customer: { confidence: 99, cropQuality: { fullCellIncluded: true, neighborColumnIncluded: false } }
    }
  }];
  const imageMeta = {
    boundaries: [0, 100],
    rowMetaByMatrixIndex: {
      1: { y0: 10, y1: 20, cy: 15 }
    }
  };

  let result;
  try {
    result = await sandbox.__recoverTextIntegrityTargeted(rides, {}, imageMeta, { customer: 0 }, null);
  } catch (error) {
    fail(`text-integrity runtime threw ${error?.name || 'Error'}: ${error?.message || error}`);
  }
  if (!Array.isArray(result) || result.length !== 1) fail('text-integrity runtime returned invalid ride array');
  if (result[0].customer !== 'ACME') fail('text-integrity runtime mutated a clean control cell');
  if (!Array.isArray(result[0].customerTargetedOcrAttempts)) fail('text-integrity runtime did not finish post-review bookkeeping');
  if (result[0].imageCellEvidence?.customer?.reviewTrigger !== '') fail('clean control unexpectedly entered review');
}

async function runAnalyzeControlRuntimeSmoke() {
  const functionSource = extractNamedFunction('analyze');
  const resetDiagnosticSource = extractNamedFunction('resetPreviewFlightDiagnostic');
  const syncDiagnosticSource = extractNamedFunction('syncPreviewFlightCheckControl');
  const elements = new Map();
  const element = id => {
    if (!elements.has(id)) elements.set(id, {
      id,
      textContent: '',
      innerHTML: '',
      disabled: false,
      style: {},
      hidden: false,
      classList: { add() {}, remove() {} }
    });
    return elements.get(id);
  };

  const state = {
    file: { name: 'runtime-smoke.json', type: 'application/json' },
    files: [],
    analysisRunInProgress: false,
    autoPipelineInProgress: false,
    previewFlightRunId: 0,
    previewOnlyAnalysis: true,
    previewFlightCheckInProgress: false,
    pipelineGeneration: 0,
    ocrPerformanceDiagnostic: null,
    cancelledRows: [],
    ocrCellDiagnostics: [],
    ocrDiagnosticSelfCheck: null,
    rides: [],
    matrix: [],
    issues: [],
    meta: {}
  };
  state.files = [state.file];

  const sandbox = {
    console,
    performance: { now: (() => { let n = 0; return () => ++n; })() },
    window: { ATMSFlight: null, norm: value => value },
    state,
    $: id => element(id),
    currentPlanDate: () => '2026-10-07',
    resetTransientFlightDiagnosticsForAnalysis: () => {},
    isImageFile: () => false,
    readSelectedFiles: async () => ({
      kind: 'json',
      rows: [{
        time: '09:00', pickup: 'A', destination: 'B', customer: 'C', company: 'D',
        vehicle: 'Pkw', persons: 1, driver: 'Driver', price: 1
      }]
    }),
    detectPlanDateFromJsonRows: () => '2026-10-07',
    setDetectedPlanDate: () => {},
    cellText: value => String(value ?? '').trim(),
    assignRideDates: rides => rides,
    validate: () => [],
    writeCurrentAnalysisJsonPreview: () => {},
    render: () => {},
    maybeAutoImportCleanPlan: () => false,
    releaseAnalysisRunGuard: generation => {
      if (generation === state.pipelineGeneration) state.analysisRunInProgress = false;
    }
  };

  vm.createContext(sandbox);
  vm.runInContext(`${syncDiagnosticSource}\n${resetDiagnosticSource}\n${functionSource}\nthis.__analyze = analyze;`, sandbox, { filename: 'plan-import-runtime-smoke:analyze' });

  try {
    await sandbox.__analyze();
  } catch (error) {
    fail(`analyze() control path threw ${error?.name || 'Error'}: ${error?.message || error}`);
  }
  if (state.rides.length !== 1) fail('analyze() control path did not reach a complete staged result');
  if (state.analysisRunInProgress) fail('analyze() control path did not release runtime guard');
  if (/^Fehler:/i.test(element('importStatus').textContent)) fail(`analyze() control path reported ${element('importStatus').textContent}`);
}

(async () => {
  await runTextIntegrityRuntimeSmoke();
  await runAnalyzeControlRuntimeSmoke();
  console.log('P113.3.1 plan-import runtime smoke: PASS');
})().catch(error => fail(error?.stack || error?.message || String(error)));
