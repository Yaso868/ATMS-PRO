'use strict';
// P11446: mandatory regression for the ACTUAL Android preprocessing scale.
// Screenshot values, passengers, hotel, driver and flight cells are intentionally
// excluded: this generated fixture contains only background colours and lines.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const js=fs.readFileSync(path.resolve(__dirname,'../app/src/main/assets/js/plan-import.js'),'utf8');
const from=js.indexOf('  // P11445 physical source row fencing:');
const to=js.indexOf('  async function recoverSyntheticImageRowsTargeted(',from);
assert(from>=0&&to>from,'real app code must expose physical source geometry');
const sandbox=vm.createContext({});
vm.runInContext(js.slice(from,to)+'\nthis.sourceGrid={p11445DetectPhysicalRowGrid,p11445FenceSyntheticRow}',sandbox);
const {p11445DetectPhysicalRowGrid:detect,p11445FenceSyntheticRow:fence}=sandbox.sourceGrid;
let positive=0,negative=0;
function yes(value,message){assert(value,message);positive++;}
function no(value,message){assert(value,message);negative++;}
const palette=[[140,240,65],[235,116,179],[93,226,233],[241,112,78],[195,151,236],[185,246,69]];
function image(width,height,pitch,first,greyEvery){
 const bytes=new Uint8ClampedArray(width*height*4);
 for(let y=0;y<height;y++){
   const ridx=Math.max(0,Math.floor((y-first)/pitch));
   const edge=Math.abs(((y-first)/pitch)-Math.round((y-first)/pitch))*pitch<0.55;
   const c=(greyEvery>0&&edge&&ridx%greyEvery===0)?[129,129,129]:palette[ridx%palette.length];
   for(let x=0,k=(y*width)*4;x<width;x++,k+=4){bytes[k]=c[0];bytes[k+1]=c[1];bytes[k+2]=c[2];bytes[k+3]=255;}
 }
 return {width,height,getContext(){return {getImageData(){return {data:bytes}}}}};
}
// 1536x605 original -> 3200x1260 Android-sized source and ~65px row pitch.
const width=3200,height=1260,pitch=64.65,first=76;
const meta={standardAtms:true,headerlessAtms:false,boundaries:Array.from({length:14},(_,i)=>14+i*(3170/13))};
const scaled=detect(image(width,height,pitch,first,3),meta);
yes(scaled.accepted,'full-size Android source grid recognized');
yes(scaled.period>=pitch*.86&&scaled.period<=pitch*1.14,'pitch measured in scaled source pixels, never fixed at 31');
no(scaled.period>=40,'regression must reject obsolete half-size 27-35px pitch');
// The two P11445 device errors ARE in the scaled source coordinates.
for(const [tag,y0,y1] of [['P5',346,395],['P10',669,719]]){
 const cy=(y0+y1)/2;
 const proof=fence({syntheticGap:true,y0,y1,cy},scaled,{cy:cy-64},{cy:cy+64});
 yes(proof.accepted,`${tag} corresponding row has a single physical source band`);
 yes(proof.sourceFenceTop<cy&&proof.sourceFenceBottom>cy,`${tag} center contained in source band`);
 yes(proof.sourceFenceBottom-proof.sourceFenceTop<=pitch*1.13,`${tag} crop cannot span two adjacent rides`);
 no(!fence({syntheticGap:true,y0,y1,cy},scaled,{cy},{cy:cy+64}).accepted,`${tag} same-cell neighbour veto`);
 no(!fence({syntheticGap:true,y0,y1,cy:cy+180},scaled,{cy:cy-64},{cy:cy+64}).accepted,`${tag} wrong center veto`);
}
no(!detect(image(width,height,pitch,first,0),{...meta,standardAtms:false}).accepted,'unproven ATMS schema veto');
no(!detect(image(width,height,pitch,first,0),{...meta,boundaries:[1,2]}).accepted,'unproven columns veto');
// Comparison protects the previous normal-sized source format as well.
const normal=detect(image(1536,605,31.02,36,2),{standardAtms:true,headerlessAtms:false,boundaries:Array.from({length:14},(_,i)=>7+i*(1520/13))});
yes(normal.accepted,'normal-scale row detection still works');
yes(normal.period>=26&&normal.period<=36,'normal-scale row pitch remains valid');
// A second real decoded canvas, if available locally, can be supplied without
// uploading any identifiable user pixels into source control.
if(process.env.ATMS_P11446_REAL_SCALED_RGBA){
 const raw=fs.readFileSync(process.env.ATMS_P11446_REAL_SCALED_RGBA);
 assert.equal(raw.length,width*height*4,'real pixels must have exact provenance size');
 const real=detect({width,height,getContext(){return {getImageData(){return {data:raw}}}}},meta);
 yes(real.accepted,'real 23 Oct source rows found at Android scale');
 for(const [tag,y0,y1] of [['P5',346,395],['P10',669,719]]){
  const cy=(y0+y1)/2;
  const proof=fence({syntheticGap:true,y0,y1,cy},real,{cy:cy-64},{cy:cy+64});
  yes(proof.accepted,`${tag} real source-pixel row proven`);
  yes(proof.sourceFenceBottom-proof.sourceFenceTop<80,`${tag} real source crop cannot include two rides`);
 }
 console.log('REAL ANDROID-SCALE SOURCE GRID',JSON.stringify({period:real.period,centers:real.ruleCenters}));
}
console.log(`P11446 scaled source-row regression: PASS ${positive} positives / ${negative} negatives; no private image fixture committed`);
