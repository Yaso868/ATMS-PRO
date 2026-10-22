const fs=require('fs');
const vm=require('vm');
const assert=require('assert');
const source=fs.readFileSync(__dirname+'/../app/src/main/assets/js/plan-import.js','utf8');
const start=source.indexOf('  function ensureSyntheticImageRowsComplete(matrix) {');
const end=source.indexOf('  async function recoverSyntheticImageRowsTargeted(',start);
assert(start>0 && end>start);
const script=`${source.slice(start,end)}\n ensureSyntheticImageRowsComplete;`;
const gate=vm.runInNewContext(script,{cellText:value=>String(value||'').trim(),Error,Object,Number});
function candidate(markers){const matrix=[['header'],...markers.map(() => Array(13).fill(''))];matrix._atmsImageMeta={rowMetaByMatrixIndex:Object.fromEntries(markers.map((m,i)=>[i+1,m]))};return matrix;}
const complete=candidate([{syntheticGap:true,syntheticGapRecovered:true},{syntheticGap:false}]);
assert.strictEqual(gate(complete),complete);
assert.strictEqual(complete._atmsImageMeta.syntheticRowRecoveryGate.accepted,true);
assert.strictEqual(complete._atmsImageMeta.syntheticRowRecoveryGate.unresolvedCount,0);
const skipped=candidate([{syntheticGap:true,syntheticGapRecovered:false,syntheticGapFailureReason:'no_complete_ocr_view',y0:100,y1:130}]);
let err; try{gate(skipped)}catch(e){err=e;}
assert(err,'Missing synthetic row must fail');
assert.match(err.message,/Pruefposition 1/);
assert.match(err.message,/kein(e)? vollstaendige sichere OCR-Nachlesung/);
assert.match(err.message,/Kein Import/);
assert.strictEqual(err.atmsRowIntegrityReview.mayImport,false);
assert.strictEqual(skipped._atmsImageMeta.syntheticRowRecoveryGate.unresolvedRows.length,1);
const both=candidate([{syntheticGap:false},{syntheticGap:true,syntheticGapRecovered:false,syntheticGapFailureReason:'conflicting_ocr_views',syntheticGapConflict:true},{syntheticGap:true,syntheticGapRecovered:false}]);
let err2;try{gate(both)}catch(e){err2=e;}
assert.match(err2.message,/Pruefposition 2 \(\+1 weitere\)/);
assert.strictEqual(err2.atmsRowIntegrityReview.unresolvedRows.length,2);
assert.strictEqual(err2.atmsRowIntegrityReview.unresolvedRows[0].conflict,true);
assert.strictEqual(err2.atmsRowIntegrityReview.noImportOnFailure,true);
console.log('P11439 local diagnostic tests: 12 assertions PASS; fail-closed and no import preserved');

// Explicitly fail if the user-facing diagnostic regresses to the opaque old message.
assert(!source.includes("throw new Error('Mindestens eine physische Tabellenzeile konnte nicht vollstaendig und sicher wiederhergestellt werden. Kein Import.')"));
