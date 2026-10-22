#!/usr/bin/env node
'use strict';
// Mandatory executable contract: no hidden online OCR, no .gz request in Android APK.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.join(__dirname,'..');
const file=path.join(root,'app/src/main/assets/js/atms-offline-tesseract.js');
const script=fs.readFileSync(file,'utf8');
function setup(source, custom={}){
  const calls=[];
  const T={
    createWorker:(...args)=>{calls.push(['createWorker',args]);return {}} ,
    recognize:(...args)=>{calls.push(['recognize',args]);return {}}
  };
  const win={location:{origin:'https://appassets.androidplatform.net'},Tesseract:T,...custom};
  vm.runInNewContext(source,{window:win}, {filename:'atms-offline-tesseract.js',timeout:2500});
  return {T,calls,win};
}
const {T,calls,win}=setup(script);
T.createWorker('eng');
T.createWorker('deu',undefined,{logger:()=>{}});
T.recognize('image','eng');
T.recognize('image','deu',{tessedit_pageseg_mode:'6'});
assert.equal(calls.length,4);
for(const [kind,args] of calls){
  const opts=kind==='createWorker'?args[2]:args[2];
  assert.strictEqual(opts.gzip,false,'no gzip download request allowed');
  assert.strictEqual(opts.langPath,'https://appassets.androidplatform.net/assets/vendor/tessdata/4.0.0_best_int');
  assert.strictEqual(opts.workerBlobURL,false);
  const language=args[kind==='createWorker'?0:1];
  assert.strictEqual(`${opts.langPath}/${language}.traineddata${opts.gzip?'.gz':''}`,
    `https://appassets.androidplatform.net/assets/vendor/tessdata/4.0.0_best_int/${language}.traineddata`);
}
assert.equal(calls[3][1][2].tessedit_pageseg_mode,'6','OCR parameters must remain unchanged');
assert.throws(()=>T.createWorker('eng',undefined,{gzip:true}),/ATMS_OFFLINE_OCR_CONFLICT_gzip/,'gzip override must fail closed');
assert.throws(()=>T.recognize('image','eng',{gzip:true}),/ATMS_OFFLINE_OCR_CONFLICT_gzip/);
assert.throws(()=>T.createWorker('eng',undefined,{langPath:'https://example.com/remote'}),/ATMS_OFFLINE_OCR_CONFLICT_langPath/);
assert.throws(()=>T.createWorker('eng',undefined,{workerBlobURL:true}),/ATMS_OFFLINE_OCR_CONFLICT_workerBlobURL/);
assert.strictEqual(win.ATMSR58OfflineQA.paths.gzip,false);
assert.throws(()=>setup(script,{location:{origin:'https://malicious.invalid'}}),/ATMS_OFFLINE_OCR_WRONG_ORIGIN/);
// Negative regression: the original P11436 wrapper must fail the gzip contract.
const baseline=script.replace('    gzip: false,\n','');
assert.notStrictEqual(baseline,script);
const old=setup(baseline); old.T.createWorker('eng');
assert.notStrictEqual(old.calls[0][1][2].gzip,false,'negative control: old wrapper must not pass');
assert(script.includes('gzip: false'),'verified source explicitly disables gzip');
console.log('P11437 OCR language request contract: PASS (ENG+DEU, workers+recognize, unsafe overrides blocked, original P11436 negative control)');
