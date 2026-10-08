#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.join(__dirname,'..');
const core=require(path.join(root,'app/src/main/assets/js/ocr-integrity-core.js'));
const file=path.join(root,'app/src/main/assets/js/plan-import.js');
let source=fs.readFileSync(file,'utf8');
const close="  document.addEventListener('DOMContentLoaded', init);\n})();";
assert(source.includes(close),'production module closure not found');
source=source.replace(close,"  window.__P11414Test={recoverHeaderlessCellsTargeted,headerlessCoreRowCheck,headerlessInvalidCoreColumns};\n})();");
const data=JSON.parse(fs.readFileSync(path.join(root,'tools/fixtures/golden-regression/ATMS_GOLDEN_REGRESSION_PACK_62_FALL_2026-10-08.json'),'utf8'));
assert.equal(data.cases.length,62);
assert.equal(data.cases[61].id,'GE-20261008-WA0014-HEADERLESS-ADMISSION-REJECT-P11412');
const mkrow=(arrival='EW9569',departure='-')=>['€ 47,60','13:50','DUS Airport','Novotel DUS','Eurowings','WT',arrival,departure,'Pkw','1','14:20','Seville','Yannik'];
const invalid=(row,...fields)=>{const r=row.slice();fields.forEach(col=>r[col]='');return r;};
const columns=[0,90,175,445,750,880,1030,1140,1280,1360,1450,1550,1680,1800];
const failures=[0,1,2,3,4];
const measure=(x)=>typeof x==='number'&&Number.isFinite(x)?String(x):'nicht_erhoben';
let tests=0;
async function run(name,rows,validate,{tess=true,canvas=true,rowMeta=true}={}){
  const events=[];
  const mock={async recognize(){events.push(1);return {data:{text:'',words:[]}}}};
  const doc={currentScript:{src:'https://atms.test/js/plan-import.js'},addEventListener(){},getElementById(){return null;},createElement(){return {width:1,height:1,getContext(){return {drawImage(){},imageSmoothingEnabled:false,imageSmoothingQuality:'high'}}}},body:{appendChild(){}}};
  const w={Tesseract:tess?mock:null,ATMSOcrIntegrityCore:core,addEventListener(){},removeEventListener(){},dispatchEvent(){},location:{href:'https://atms.test/'}};
  const context={window:w,document:doc,Tesseract:tess?mock:null,location:{href:'https://atms.test/'},performance:{now:()=>0},console,setTimeout,clearTimeout,setInterval,clearInterval,Map,Set,WeakMap,Promise,Array,Object,Number,String,Boolean,Math,Date,RegExp,JSON,Intl,URL,Blob,FileReader:function(){},TextEncoder,TextDecoder,navigator:{},localStorage:{getItem(){return null;},setItem(){},removeItem(){}},sessionStorage:{getItem(){return null;},setItem(){},removeItem(){}},CustomEvent:function(){},Image:function(){},File:function(){}};
  context.globalThis=context;
  vm.createContext(context);vm.runInContext(source,context,{filename:'P11414-production.js'});
  const matrix=[Array(13).fill('Header'),...rows.map(r=>r.slice())];
  const rawBefore=JSON.stringify(matrix);
  const imageMeta={headerlessAtms:true,boundaries:columns,rowMetaByMatrixIndex:rowMeta?Object.fromEntries(rows.map((_,i)=>[i+1,{sourceRow:i+2,y0:8+i*50,y1:43+i*50}])):{},rawOcrWords:[]};
  matrix._atmsImageMeta=imageMeta;
  const returned=await w.__P11414Test.recoverHeaderlessCellsTargeted(matrix,canvas?{width:3200,height:520}:null,imageMeta);
  assert.strictEqual(returned._atmsImageMeta,imageMeta,'diagnostic provenance was dropped');
  assert.equal(JSON.stringify(returned),rawBefore,'OCR matrix silently changed');
  const recovery=imageMeta.headerlessCellRecovery;
  assert(recovery,'missing recovery');
  assert(imageMeta.headerlessFlightGateTrace,'missing trace');
  assert.equal(measure(recovery.totalInvalid),recovery.totalInvalid===null?'nicht_erhoben':String(recovery.totalInvalid));
  validate({recovery,trace:imageMeta.headerlessFlightGateTrace,events,w,returned});
  ++tests;console.log('PASS '+name);
}
const exact=(r,reason,n,scope,fieldRows)=>{
  assert.equal(r.accepted,false);assert.equal(r.reason,reason);assert.equal(r.totalInvalid,n);
  assert.equal(r.invalidCountScope,scope);assert.equal(r.recoveredCells,0);
  assert.equal(r.firstInvalidRow.matrixIndex,fieldRows);
};
(async()=>{
  await run('first core-overlimit row retains 5 measured invalid fields',[invalid(mkrow(),...failures)],({recovery:r,trace:t,events,w})=>{
    exact(r,'too_many_invalid_cells_in_row',5,'through_first_rejected_row',1);
    assert.equal(r.firstInvalidRow.count,5);assert.equal(r.firstInvalidRow.sourceRow,2);
    assert.equal(r.firstInvalidRow.cells[0].field,'price');assert.equal(r.firstInvalidRow.cells[0].raw,'');
    assert.equal(t.reason,'not_evaluated_preflight');assert.strictEqual(t.recognizedFlightRows,null);
    assert.strictEqual(t.conflictingFlightRows,null);assert.equal(events.length,0);
    assert.strictEqual(w.ATMSP11414HeaderlessRecoveryDiagnostic,r);
  });
  await run('second invalid row includes earlier measured invalid fields',[
    invalid(mkrow(),2,3),invalid(mkrow(),...failures)
  ],({recovery:r,trace:t,events})=>{
    exact(r,'too_many_invalid_cells_in_row',7,'through_first_rejected_row',2);
    assert.equal(r.firstInvalidRow.sourceRow,3);assert.equal(events.length,0);assert.equal(t.noMutation,true);
  });
  await run('global 13-invalid-cell threshold remains fail-closed',[
    invalid(mkrow(),0,1,2,3),invalid(mkrow(),0,1,2,3),invalid(mkrow(),0,1,2,3),invalid(mkrow(),0)
  ],({recovery:r,trace:t,events})=>{
    exact(r,'too_many_invalid_cells',13,'all_core_rows',1);
    assert.equal(r.firstInvalidRow.count,4);assert.equal(t.recognizedFlightRows,null);assert.equal(events.length,0);
  });
  await run('no Tesseract is explicitly not evaluated',[mkrow()],({recovery:r,trace:t,events})=>{
    assert.equal(r.reason,'tesseract_unavailable');assert.strictEqual(r.totalInvalid,null);
    assert.strictEqual(t.recognizedFlightRows,null);assert.strictEqual(t.conflictingFlightRows,null);
    assert.equal(measure(r.totalInvalid),'nicht_erhoben');assert.equal(events.length,0);
  },{tess:false});
  await run('missing image canvas is explicitly not evaluated',[mkrow()],({recovery:r,trace:t,events})=>{
    assert.equal(r.reason,'image_canvas_unavailable');assert.strictEqual(r.totalInvalid,null);
    assert.equal(t.stage,'before_ocr');assert.equal(events.length,0);
  },{canvas:false});
  await run('valid arrival still accepted',[mkrow('EW9569','-')],({recovery:r,trace:t,events})=>{
    assert.equal(r.accepted,true);assert.equal(r.totalInvalid,0);
    assert.equal(t.recognizedFlightRows,1);assert.equal(events.length,0);
  });
  await run('valid departure still accepted',[mkrow('-','EW9814')],({recovery:r,trace:t})=>{
    assert.equal(r.accepted,true);assert.equal(t.recognizedFlightRows,1);
  });
  await run('genuine double flight must still block',[mkrow('EW9569','EW9814')],({recovery:r,trace:t})=>{
    assert.equal(r.accepted,false);assert.equal(t.reason,'flight_columns_conflict');assert.equal(t.conflictingFlightRows,1);
  });
  await run('genuine no-flights still blocked',[mkrow('-','-')],({recovery:r,trace:t,events})=>{
    assert.equal(r.accepted,false);assert.equal(t.reason,'no_recognized_flight');assert(events.length>0);
  });
  await run('one unresolved core field still blocks',[
    invalid(mkrow(),3)
  ],({recovery:r,trace:t})=>{
    assert.equal(r.accepted,false);assert.equal(t.reason,'core_cells_unresolved');assert.equal(r.totalInvalid,1);
  },{rowMeta:false});
  assert(source.includes('UngültigeZellen=${totalInvalid}'));
  assert(source.includes('Messbereich=${cellText(recovery?.invalidCountScope)'));
  assert(source.includes('P11414: FlugGate=${cellText(trace.reason)'));
  assert(!source.includes('Number(recovery?.totalInvalid || 0)'));
  assert(!source.includes('Number(trace.recognizedFlightRows || 0)'));
  ++tests;console.log('PASS user-visible diagnostics have no fallback-zero formatting');
  console.log(`P114.14 HEADERLESS METADATA INTEGRITY: ${tests}/${tests} PASS; unchanged fail-closed and Golden 62`);
})().catch(e=>{console.error(e);process.exit(1)});
