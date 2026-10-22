/* ATMS PRO R58 – ISOLIERTE QA-KANDIDATUR; NICHT AUSLIEFERN. */
(function (root) {
  'use strict';
  const origin = 'https://appassets.androidplatform.net';
  const prefix = origin + '/assets/';
  const paths = Object.freeze({
    workerPath: prefix + 'vendor/tesseract/5.1.1/worker.min.js',
    corePath: prefix + 'vendor/tesseract-core/5.1.1',
    langPath: prefix + 'vendor/tessdata/4.0.0_best_int',
    gzip: false,
    workerBlobURL: false
  });
  function ensureEnvironment() {
    if (root.location?.origin !== origin) throw new Error('ATMS_OFFLINE_OCR_WRONG_ORIGIN');
    if (!root.Tesseract || typeof root.Tesseract.createWorker !== 'function' || typeof root.Tesseract.recognize !== 'function')
      throw new Error('ATMS_OFFLINE_OCR_LIBRARY_MISSING');
  }
  function guardedOptions(userOptions) {
    if (userOptions != null && (typeof userOptions !== 'object' || Array.isArray(userOptions)))
      throw new Error('ATMS_OFFLINE_OCR_INVALID_OPTIONS');
    const opts = userOptions || {};
    for (const [key, fixed] of Object.entries(paths)) {
      if (Object.prototype.hasOwnProperty.call(opts, key) && opts[key] !== fixed)
        throw new Error('ATMS_OFFLINE_OCR_CONFLICT_' + key);
    }
    return Object.assign({}, opts, paths);
  }
  ensureEnvironment();
  const T = root.Tesseract;
  if (T.__atmsR58OfflineConfigured) return;
  const originalCreateWorker = T.createWorker.bind(T);
  const originalRecognize = T.recognize.bind(T);
  T.createWorker = function (langs, oem, opts, config) {
    ensureEnvironment();
    return originalCreateWorker(langs, oem, guardedOptions(opts), config);
  };
  T.recognize = function (image, langs, opts) {
    ensureEnvironment();
    return originalRecognize(image, langs, guardedOptions(opts));
  };
  Object.defineProperty(T, '__atmsR58OfflineConfigured', {value:true, enumerable:false});
  root.ATMSR58OfflineQA = Object.freeze({ paths });
})(window);
