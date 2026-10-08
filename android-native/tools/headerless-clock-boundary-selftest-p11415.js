#!/usr/bin/env node
'use strict';
// Executes the unchanged production module with the new bounded clock predicate.
const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');
const root=path.join(__dirname,'..');
const core=require(path.join(root,'app/src/main/assets/js/ocr-integrity-core.js'));
const sourceFile=path.join(root,'app/src/main/assets/js/plan-import.js');
let source=fs.readFileSync(sourceFile,'utf8');
const close="  document.addEventListener('DOMContentLoaded', init);\n})();";
assert(source.includes(close),'Cannot extract production closure');
source=source.replace(close,"  window.__P11415Test={headerlessTimeLike,headerlessCoreRowCheck,recoverHeaderlessCellsTargeted,normalizeTime,clockBoundaryNoiseInfo};\n})();");
const mkrow=(time='13:50',arrival='EW9569',departure='-')=>['€ 47,60',time,'DUS Airport','Novotel DUS','Eurowings','WT',arrival,departure,'Pkw','1','14:20','Sevilla','Yannik'];
const doc={currentScript:{src:'https://atms.test/js/plan-import.js'},addEventListener(){},getElementById(){return null;},createElement(){return {width:1,height:1,getContext(){return {drawImage(){},imageSmoothingEnabled:false,imageSmoothingQuality:'high'}}}},body:{appendChild(){}}};
const events=[];
const mock={async recognize(){events.push('OCR');return {data:{text:'',words:[]}}}};
const w={Tesseract:mock,ATMSOcrIntegrityCore:core,addEventListener(){},removeEventListener(){},dispatchEvent(){},location:{href:'https://atms.test/'}};
const context={window:w,document:doc,Tesseract:mock,location:{href:'https://atms.test/'},performance:{now:()=>0},console,setTimeout,clearTimeout,setInterval,clearInterval,Map,Set,WeakMap,Promise,Array,Object,Number,String,Boolean,Math,Date,RegExp,JSON,Intl,URL,Blob,FileReader:function(){},TextEncoder,TextDecoder,navigator:{},localStorage:{getItem(){return null;},setItem(){},removeItem(){}},sessionStorage:{getItem(){return null;},setItem(){},removeItem(){}},CustomEvent:function(){},Image:function(){},File:function(){}};
context.globalThis=context;vm.createContext(context);vm.runInContext(source,context,{filename:'P11415-production-plan-import.js'});
const fn=w.__P11415Test;
const golden62=JSON.parse(fs.readFileSync(path.join(root,'tools/fixtures/golden-regression/ATMS_GOLDEN_REGRESSION_PACK_62_FALL_2026-10-08.json'),'utf8'));
assert.equal(golden62.cases.length,62);assert.equal(golden62.cases[61].id,'GE-20261008-WA0014-HEADERLESS-ADMISSION-REJECT-P11412');
let testCount=0;
function test(name,cb){cb();console.log('PASS',name);testCount++;}
const valid=['13:50','| 13:50','|| 13:50','¦ 14:15','│ 16:10','[ 23:59 ]','=','| 00:00','| 1350','| 14.15'];
// '=' alone intentionally not a time; remove from positive cases.
valid.splice(valid.indexOf('='),1);
for(const v of valid)test('positive bounded clock: '+JSON.stringify(v),()=>{
  assert.equal(fn.headerlessTimeLike(v),true);
  assert.equal(fn.headerlessCoreRowCheck(mkrow(v)).fields.time,true);
  assert.equal(fn.normalizeTime(v),fn.clockBoundaryNoiseInfo(v).value || v.replace(/\./g,':'));
});
const invalid=['','|','14:','| 24:00','| 13:60','| 99:99','| 65,45','| €35,70','| 13:50 Uhr','ETA | 13:50','| 13:50 14:15','| 13:50 extra','| 13:5X','13:50 |','| 13:5','|13:50 /14:20','13:50foo','13:50 14:15'];
for(const v of invalid)test('reject ambiguous/nonclock: '+JSON.stringify(v),()=>{
  assert.equal(fn.headerlessTimeLike(v),false);
  assert.equal(fn.headerlessCoreRowCheck(mkrow(v)).fields.time,false);
});
const columns=[0,90,175,445,750,880,1030,1140,1280,1360,1450,1550,1680,1800];
async function run(name,rows,assertion,{rowMeta=true}={}){
  const imageMeta={headerlessAtms:true,boundaries:columns,rowMetaByMatrixIndex:rowMeta?Object.fromEntries(rows.map((_,i)=>[i+1,{sourceRow:i+2,y0:8+i*45,y1:43+i*45}])):{},rawOcrWords:[]};
  const matrix=[Array(13).fill('Header'),...rows.map(r=>r.slice())];const before=JSON.stringify(matrix);
  matrix._atmsImageMeta=imageMeta;events.length=0;
  const out=await fn.recoverHeaderlessCellsTargeted(matrix,{width:3200,height:800},imageMeta);
  assert.equal(JSON.stringify(out),before, 'source row mutated');
  assert.strictEqual(out._atmsImageMeta,imageMeta);
  await assertion({recovery:imageMeta.headerlessCellRecovery,flight:imageMeta.headerlessFlightGateTrace,events,out});
  console.log('PASS',name);testCount++;
}
(async()=>{
  await run('17-row bordered-times remove false 16-cell threshold without inventing times',
    Array.from({length:17},(_,i)=>mkrow(i===16?'16:10':`| ${String(13+Math.floor(i/5)).padStart(2,'0')}:${String((i%5)*10).padStart(2,'0')}`,i===3?'-':'EW9569',i===3?'EW9814':'-')),
    ({recovery:r,flight:f,events:ev,out})=>{
      assert.equal(r.accepted,true);assert.equal(r.totalInvalid,0);assert.equal(f.recognizedFlightRows,17);
      assert.equal(f.conflictingFlightRows,0);assert.equal(ev.length,0);
      assert.equal(out[1][1],'| 13:00');
      assert.equal(fn.normalizeTime(out[1][1]),'13:00');
    });
  await run('genuine malformed clocks stay blocked above 12-cell threshold',
    Array.from({length:13},(_,i)=>mkrow(`| 25:${String(i).padStart(2,'0')}`)),
    ({recovery:r,flight:f,events:ev})=>{
      assert.equal(r.accepted,false);assert.equal(r.reason,'too_many_invalid_cells');
      assert.equal(r.totalInvalid,13);assert.equal(f.reason,'not_evaluated_preflight');assert.equal(ev.length,0);
    });
  await run('real dual flight column conflict remains hard blocked',
    [mkrow('| 13:50','EW9569','EW9814')],({recovery:r,flight:f})=>{
      assert.equal(r.accepted,false);assert.equal(r.totalInvalid,0);assert.equal(f.reason,'flight_columns_conflict');
    });
  await run('no valid recognized flight remains blocked',[mkrow('| 13:50','-','-')],
    ({recovery:r,flight:f})=>{assert.equal(r.accepted,false);assert.equal(f.reason,'no_recognized_flight')},
    {rowMeta:false});
  await run('missing route still invalid and not admitted',[(r=>{r[2]='';return r})(mkrow('| 13:50'))],
    ({recovery:r,flight:f})=>{assert.equal(r.accepted,false);assert.equal(r.totalInvalid,1);assert.equal(f.reason,'core_cells_unresolved');},
    {rowMeta:false});
  await run('true five-invalid-cells row remains blocked',[(r=>{[0,2,3,4,5].forEach(c=>r[c]='');return r})(mkrow('| 13:50'))],
    ({recovery:r,flight:f,events:ev})=>{assert.equal(r.accepted,false);assert.equal(r.reason,'too_many_invalid_cells_in_row');assert.equal(r.totalInvalid,5);assert.equal(ev.length,0);});
  console.log(`P114.15 HEADERLESS CLOCK BOUNDARY SELFTEST: ${testCount}/${testCount} PASS; 62-case fixture intact`);
})().catch(e=>{console.error(e);process.exit(1)});
