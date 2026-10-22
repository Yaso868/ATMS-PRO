'use strict';const a=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),cp=require('node:child_process'),path=require('node:path');const {h10HorizontalContrastGrid}=require('./h10_horizontal_contrast_grid');
const native=process.env.ATMS_H26_NATIVE; if(!native)throw Error('ATMS_H26_NATIVE_required');const bandAudit=require(path.join(native,'app/src/main/assets/js/h26-source-band-audit.js'));
const fakeGrid={accepted:true,pitch:31,bands:[{y0:50,y1:81,fullyBounded:true},{y0:81,y1:112,fullyBounded:true},{y0:112,y1:143,fullyBounded:true}],openTail:{y0:143,y1:173,fullyBounded:false}};
const fakeRows=[{cy:65,y0:60,y1:70},{cy:96,y0:91,y1:102,syntheticGap:true},{cy:127,y0:121,y1:133}];
const fakeWords=[{text:'A',bbox:{x0:1,x1:3,y0:60,y1:71}},{text:'B',bbox:{x0:1,x1:3,y0:91,y1:105}}];
const opts={grid:fakeGrid,rows:fakeRows,words:fakeWords,sourceWidth:1536,sourceHeight:173,ocrWidth:1536,ocrHeight:173};let checks=0;
function eq(x,y,m){a.deepEqual(x,y,m);checks++;}
let f=bandAudit.audit(opts);a(f);checks++;
eq(f.syntheticSourceRows,1);eq(f.flags[1].reason,'synthetic_matrix_row');eq(f.sourceWordboxes,2);eq(f.mayImport,false);eq(f.canPersist,false);eq(f.complete,false);eq(f.rideIdentityVerified,false);eq(f.verifiedRides,0);eq(f.flags[1].wordCenterCount,1);
eq(bandAudit.audit({...opts,sourceHeight:174}),null,'untrusted source size');
eq(bandAudit.audit({...opts,rows:[...fakeRows,{cy:158,y0:140,y1:170}]}).mayImport,false);
eq(bandAudit.audit({...opts,grid:{...fakeGrid,bands:[...fakeGrid.bands,{y0:143,y1:150,fullyBounded:true}]}}),null);
eq(bandAudit.audit({...opts,rows:[{...fakeRows[0],cy:NaN},...fakeRows.slice(1)]}),null);
eq(bandAudit.audit({...opts,words:[{bbox:{x0:0,x1:4,y0:20,y1:20}},fakeWords[1]]}).unlocatedWords,1);
const src=fs.readFileSync(`${native}/app/src/main/assets/js/plan-import.js`,'utf8');const stub={document:{currentScript:{src:'https://example.invalid/plan-import.js'},addEventListener(){}},location:{href:'https://example.invalid'},window:{addEventListener(){}},performance:{now:()=>0},URL};vm.createContext(stub);const target="document.addEventListener('DOMContentLoaded', init);";a(src.includes(target));vm.runInContext(src.replace(target,'window.__H26ReadMatrix=imageWordsToMatrix; '+target),stub,{timeout:14000});
const golden=process.env.ATMS_H26_ORIGINAL_TSV_DIR;
if(golden){
 for(const [stem,height,minWord,minSynthetic,missingExpected] of [['WA0000',1034,441,4,3],['WA0001',1097,581,2,0]]){
  const base=`IMG-20261007-${stem}`,tsv=fs.readFileSync(path.join(golden,stem.toLowerCase()+'.tsv'),'utf8');const rows=tsv.split(/\r?\n/).map(x=>x.split('\t',12)).filter(x=>x.length===12&&x[0]==='5'&&x[11].trim());const words=rows.map(v=>({text:v[11],confidence:+v[10],bbox:{x0:+v[6],y0:+v[7],x1:+v[6]+ +v[8],y1:+v[7]+ +v[9]}}));eq(words.length,minWord);
  const matrix=stub.window.__H26ReadMatrix(words,1536),meta=matrix._atmsImageMeta;const source=path.join(native,'tools/fixtures/golden-regression/source-images',base+'.jpg');const rgb=cp.execFileSync('python',['-c','from PIL import Image;import sys;sys.stdout.buffer.write(Image.open(sys.argv[1]).convert("RGB").tobytes())',source],{maxBuffer:9000000});
  const pitch=Array.from({length:Math.floor((height-67)/31)},(_,i)=>67+31*(i+.5));const grid=h10HorizontalContrastGrid({width:1536,height,channels:3,data:rgb},{headerCy:54.6,headerEnd:67,rowCenters:pitch});eq(grid.accepted,true);
  const rowmeta=Object.keys(meta.rowMetaByMatrixIndex).sort((a,b)=>+a-+b).map(i=>meta.rowMetaByMatrixIndex[i]);const original=bandAudit.audit({grid,rows:rowmeta,words,sourceWidth:1536,sourceHeight:height,ocrWidth:1536,ocrHeight:height});a(original,stem+' original audit');checks++;
  eq(original.syntheticSourceRows,minSynthetic);eq(original.missingBoundedBandsWithWordCenters,missingExpected);eq(original.sourceWordboxes,minWord);eq(original.rideIdentityVerified,false);eq(original.mayImport,false);eq(original.verifiedRides,0);
  a(!JSON.stringify(original).includes('text'));checks++;
  console.log(stem,'REAL ORIGINAL',JSON.stringify({wordboxes:original.sourceWordboxes,matrixRows:matrix.length-1,matrixColumns:matrix[0].length,boundedBands:original.observedBoundedBands,syntheticRows:original.syntheticSourceRows,unmatchedWordBands:original.flags.filter(x=>x.reason==='wordboxes_without_matrix_row').map(x=>x.bandIndex),unresolvedBands:original.unresolvedBoundedBands}));
 }
}
console.log('H26 BAND SOURCE SECURITY PASS',checks,'assertions',golden?'ORIGINAL TSV+PIXELS':'SYNTHETIC FIXTURES');
