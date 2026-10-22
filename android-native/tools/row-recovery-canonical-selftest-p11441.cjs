#!/usr/bin/env node
'use strict';
// P11441 mandatory real-source regression; no actual OCR model/Android asserted.
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict');
const src=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/js/plan-import.js'),'utf8');
const portion=(a,b)=>{const start=src.indexOf(a),end=src.indexOf(b,start);assert(start>=0&&end>start,'missing real production source: '+a);return src.slice(start,end);};
const code=[
 portion('  function clockBoundaryNoiseInfo(value) {','  function normalizeTime(value) {'),
 portion('  function parseNumber(value) {','  function pricePlausibility(value) {'),
 portion('  function normalizeVehicleBoundaryOcrNoise(value) {','  function getVehicleValue(row, mapping, options = {}) {'),
 portion('  function headerlessTextLike(value, minLetters = 2) {','  function headerlessCoreRowCheck(row) {'),
 portion('  function syntheticRowHasRequiredCore(row, semantic) {','  // P75B: Fail-closed fallback')
].join('\n');
const semantic={price:0,rideTime:1,pickup:2,destination:3,customer:4,company:5,
 arrivalFlight:6,departureFlight:7,vehicle:8,persons:9,flightTime:10,flightLocation:11,driver:12};
let reading=[],index=0,checks=0;
const eq=(actual,expected,label)=>{checks++;assert.deepEqual(JSON.parse(JSON.stringify(actual)),expected,label);};
const yes=(cond,label)=>{checks++;assert(cond,label);};
const context={window:{},ocrIntegrityCore:null,$:()=>null,cellText:v=>String(v??'').trim(),
 imageSemanticColumns:()=>semantic,looksLikeTime:v=>/^\d{1,2}[:.]\d{2}$/.test(String(v)),
 cropCanvasRegion:(_canvas,x0,y0,x1,y1,scale)=>({scale}),
 Tesseract:{recognize:async crop=>{
  const row=reading[index++];
  if(row==='throw')throw Error('offline OCR failed');
  assert(Array.isArray(row),'missing mocked 1x/2x view');
  return {data:{words:row.map(([col,text])=>({text,confidence:99,
   bbox:{x0:(col*100+8)*crop.scale,x1:(col*100+88)*crop.scale}}))}};
 }}
};context.window.Tesseract=context.Tesseract;
const {canonical,recover,gate,core}=vm.runInNewContext(code+'\n;({canonical:canonicalSyntheticRecoveryCell,recover:recoverSyntheticImageRowsTargeted,gate:ensureSyntheticImageRowsComplete,core:syntheticRowHasRequiredCore})',context);
const v4=['47,60 €','12:45','DUS Airport','NH Nord-Holiday Inn','Eurowings','WT','EW9613','-','Van','6','12:40','Korfu','Elef'];
const v8=['35,00 €','13:15','DUS Airport','Marriott Seestern DUS','Avion','Get-E','EW9883','-','Pkw','1','14:10','Rom','Elef'];
const words=(row)=>row.flatMap((v,col)=>String(v).trim()?[[col,v]]:[]);
const copy=v=>JSON.parse(JSON.stringify(v));
const base=(indices)=>{
 const matrix=Array.from({length:23},(_,i)=>i===0?['Preis','Zeit','Von','Nach']:
 ['47,60 €',`${String(Math.floor(i/2)).padStart(2,'0')}:00`,`Von ${i}`,`Nach ${i}`,'Eurowings','WT','','','Pkw','1','','',`Fahrer ${i}`]);
 const meta={rowMetaByMatrixIndex:{},boundaries:Array.from({length:14},(_,i)=>i*100),semantic};
 for(const i of indices){matrix[i]=Array(13).fill('');meta.rowMetaByMatrixIndex[i]={syntheticGap:true,y0:i*65,y1:i*65+49};}
 matrix._atmsImageMeta=meta;return {matrix,meta};
};
async function run(indices,views){reading=views;index=0;const a=base(indices);const out=await recover(a.matrix,{},a.meta);yes(index===views.length,'all independent scale observations performed');return {...a,out};}
function reject(out,indices,kind){let error;try{gate(out)}catch(e){error=e;}
 yes(error&&error.message.includes('Kein Import'),'fail-closed: '+kind);
 eq(error.atmsRowIntegrityReview.mayImport,false,'never import: '+kind);
 eq(error.atmsRowIntegrityReview.noMutation,true,'no data mutation: '+kind);
 for(const i of indices){yes(error.message.includes(`Pruefposition ${i}`),'affected position visible: '+kind);
  eq(out[i].filter(Boolean).length,0,'no blocked ride recovery: '+kind);}
 return error;
}
(async()=>{
 // Narrow field-specific normalizations, no ungrounded fuzzy transformations.
 eq(canonical('| 12:45',semantic,1),'12:45','clock boundary glyph');
 eq(canonical('12:46',semantic,1),'12:46','different clock preserved');
 eq(canonical('12:45 nach',semantic,1),'12:45 nach','clock free-text NOT normalized');
 eq(canonical('35,00€',semantic,0),'35,00 €','price euro spacing');
 eq(canonical('3.500,00€',semantic,0),'3.500,00 €','thousands preserved');
 eq(canonical('3500,00€',semantic,0),'3500,00 €','no price magnitude rewrite');
 eq(canonical('35,00 € extra',semantic,0),'35,00 € extra','price trailing text preserved');
 eq(canonical('Get-E =',semantic,5),'Get-E','proved equal sign boundary');
 eq(canonical('Get-E ~~',semantic,5),'Get-E','proved tilde boundary');
 eq(canonical('Get-E',semantic,5),'Get-E','already correct firm');
 eq(canonical('GetE',semantic,5),'GetE','historical company distinction preserved');
 eq(canonical('Get-E ?',semantic,5),'Get-E ?','uncertain company not corrected');
 eq(canonical('WT =',semantic,5),'WT =','no company-wide tail stripping');
 eq(canonical('~',semantic,7),'','flight-placeholder tilde');
 eq(canonical('-',semantic,7),'','flight-placeholder dash');
 eq(canonical('EW9883',semantic,6),'EW9883','real arrival flight preserved');
 eq(canonical('~ EW9883',semantic,7),'~ EW9883','mixed flight not stripped');
 eq(canonical('  Elef  ',semantic,12),'Elef','driver content preserved');
 eq(canonical('Yannik',semantic,12),'Yannik','driver name untouched');
 eq(canonical('2HK nicht',semantic,10),'2HK nicht','notes field unmodified');
 for(const v of [v4,v8])yes(core(v,semantic),'baseline flight-direction/core valid');
 // Actual P11440 Samsung 4+8 disagreement, both 1x and 2x OCR across ONE image.
 const p4a=copy(v4),p4b=copy(v4);p4b[1]='| 12:45';
 const p8a=copy(v8),p8b=copy(v8);
 p8a[5]='Get-E =';p8b[5]='Get-E ~~';p8b[0]='35,00€';p8a[7]='~';p8b[7]='-';
 const got=await run([4,8],[words(p4a),words(p4b),words(p8a),words(p8b)]);
 eq(got.meta.rowMetaByMatrixIndex[4].syntheticGapRecovered,true,'P11440 position4 recovered');
 eq(got.meta.rowMetaByMatrixIndex[8].syntheticGapRecovered,true,'P11440 position8 recovered');
 const wanted4=copy(v4);wanted4[7]='';eq(got.out[4],wanted4,'position4 canonical output, not raw |');
 const wanted8=copy(v8);wanted8[7]='';eq(got.out[8],wanted8,'position8 price, firm, placeholder canonical');
 yes(gate(got.out)===got.out,'both positions pass synthetic gate');
 eq(got.meta.rowMetaByMatrixIndex[4].syntheticGapOcrReadback.disagreements[0].ocr2,'| 12:45','raw evidence still visible');
 eq(got.meta.rowMetaByMatrixIndex[8].syntheticGapOcrReadback.disagreements.length,3,'all three differences retained in diagnostics');
 eq(got.out.length,23,'full 22 physical positions remain');
 for(const i of Array.from({length:22},(_,k)=>k+1).filter(i=>i!==4&&i!==8)) {
  eq(got.out[i],got.matrix[i],'unrelated row preserved in original order '+i);
 }
 eq(got.out[8][1],'13:15','EW9883 pickup/dispatch 13:15');
 eq(got.out[8][10],'14:10','EW9883 separate flight time 14:10');
 eq(got.out[8][6],'EW9883','EW9883 stays incoming');
 eq(got.out[8][7],'','EW9883 outgoing remains empty');
 // All listed real mismatches, including price amount and flight direction, must be rejected.
 const scenarios=[
  ['different clock',1,'12:45','12:46',v4],
  ['false time prefix',1,'12:45','| 12:46',v4],
  ['extra time text',1,'12:45','12:45 und 12:46',v4],
  ['different price',0,'35,00 €','3500,00 €',v8],
  ['different cents',0,'35,00 €','35,70€',v8],
  ['wrong company',5,'Get-E =','WT',v8],
  ['Get-E / GetE distinction',5,'Get-E =','GetE',v8],
  ['unproven company tail',5,'Get-E =','Get-E ~~~',v8],
  ['different arrival',6,'EW9883','EW9888',v8],
  ['opposite flight conflict',7,'~','EW9888',v8],
  ['different route',3,'Marriott Seestern DUS','Marriot Seestern DUS',v8],
  ['different pickup',2,'DUS Airport','DUS Airporf',v8],
  ['different driver',12,'Elef','Elef1',v8],
  ['different passengers',9,'1','7',v8],
  ['different vehicle',8,'Pkw','Van',v8],
  ['different flight time',10,'14:10','14:20',v8],
  ['different flight place',11,'Rom','Roma',v8],
  ['customer difference',4,'Avion','Eurowings',v8],
 ];
 for(const [label,col,left,right,original] of scenarios){
  const a=copy(original),b=copy(original);a[col]=left;b[col]=right;
  // Empty opposite flight placeholder is benign only when no actual flight text exists.
  const c=await run([8],[words(a),words(b)]);
  reject(c.out,[8],label);
 }
 // If the only 1x/2x readings disagree on the time, no row may be fabricated.
 const noCore=copy(v8);noCore[2]='';
 const d=await run([8],[words(noCore),words(noCore)]);
 reject(d.out,[8],'missing required route');
 const noFlight=copy(v8);noFlight[7]='EW9510';
 const e=await run([8],[words(noFlight),words(noFlight)]);
 reject(e.out,[8],'both flight directions filled');
 const f=await run([8],['throw','throw']);
 reject(f.out,[8],'missing OCR engine');
 yes(src.includes("$('importStatus').textContent = `Fehler: ${error.message}`"),'diagnosis displayed as plain text');
 yes(!code.includes('localStorage.setItem')&&!code.includes('indexedDB.open'),'recovery has no persistence writes');
 console.log(`P11441 production-row core and canonical OCR gate: ${checks} assertions PASS (2 proven Samsung positions; 18 semantic conflicts; safety; 22 slots preserved; no import).`);
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
