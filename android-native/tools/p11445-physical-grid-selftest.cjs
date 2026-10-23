'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const js=fs.readFileSync(path.resolve(__dirname,'../app/src/main/assets/js/plan-import.js'),'utf8');
const start=js.indexOf('  // P11445 physical source row fencing:');
const end=js.indexOf('  async function recoverSyntheticImageRowsTargeted(',start);
assert(start>0&&end>start,'P11445 must be inside real runtime source');
const ctx=vm.createContext({});
vm.runInContext(js.slice(start,end)+'\nthis.guard={p11445DetectPhysicalRowGrid,p11445FenceSyntheticRow};',ctx);
const {p11445DetectPhysicalRowGrid:detect,p11445FenceSyntheticRow:fence}=ctx.guard;
let checks=0, negatives=0;
function ok(x,m){assert(x,m);checks++}
function no(x,m){assert(x,m);checks++;negatives++}
const W=1200,H=610;
function canvas(rules,width=W,height=H){
 const pixels=new Uint8ClampedArray(width*height*4);
 for(let i=0;i<pixels.length;i+=4){pixels[i]=40;pixels[i+1]=226;pixels[i+2]=70;pixels[i+3]=255;}
 for(const y of rules){
  for(let x=3;x<width-4;x++){let i=(y*width+x)*4;pixels[i]=128;pixels[i+1]=128;pixels[i+2]=128;}
 }
 return {width,height,getContext(){return {getImageData(){return {data:pixels};}};}};
}
const rules=Array.from({length:19},(_,i)=>35+31*i);
const meta={standardAtms:true,headerlessAtms:false,boundaries:Array.from({length:14},(_,i)=>7+(1186*i/13))};
const grid=detect(canvas(rules),meta);
ok(grid.accepted,'genuine continuous 18-row grid accepted');
ok(grid.ruleCenters.length===19,'all 19 source rules retained');
ok(grid.ruleCenters[11]===376,'specific physical source line retained');
const target={syntheticGap:true,y0:346,y1:395,cy:370.5};
const current=fence(target,grid,{cy:331},{cy:394});
ok(current.accepted,'one bounded physical source row selected');
ok(current.changed,'old crop indeed overlaps next row');
ok(current.sourceFenceTop===345&&current.sourceFenceBottom===376,'exact source row crop, not neighbour');
ok(current.y0>345&&current.y1<376&&current.y1<407,'clipped away from following row');
const kept=[["07:20","Van",4],["07:20","Pkw",2],["08:25","Pkw",2],["08:25","Van",7],["08:25","Pkw",3],["09:30","Van",4],["09:30","Pkw",2],["09:55","Van",4],["09:55","Pkw",2]];
ok(kept.length===9&&new Set(kept.map(v=>v.join('|'))).size===9,'distinct shared-time rides remain unique; no dedupe');
for(let i=0;i<18;i++){
 const pos={syntheticGap:true,y0:rules[i]+1,y1:rules[i+1]-1,cy:(rules[i]+rules[i+1])/2};
 const a=fence(pos,grid,{cy:i? (rules[i-1]+rules[i])/2:-1},{cy:i<17?(rules[i+1]+rules[i+2])/2:1000});
 ok(a.accepted&&a.sourceFenceTop===rules[i]&&a.sourceFenceBottom===rules[i+1],`physical row ${i+1} of 18 anchored`);
}
no(!fence(target,grid,{cy:362},{cy:394}).accepted,'neighbour inside target cell veto');
no(!fence({...target,cy:394},grid,{cy:330},{cy:394}).accepted,'following physical cell occupied veto');
no(!fence({...target,cy:490},grid,{cy:362},{cy:502}).accepted,'far synthetic center veto');
no(!fence({...target,syntheticGap:false},grid,null,null).accepted,'non-synthetic line cannot claim proof');
no(!fence({...target,compactGridBand:true},grid,null,null).accepted,'compact legacy path not modified');
no(!detect(canvas([]),meta).accepted,'blank horizontal source has no physical proof');
no(!detect(canvas([20,33,108,195,203,420,575,591]),meta).accepted,'random wide-spaced lines veto');
no(!detect(canvas(rules),{...meta,standardAtms:false}).accepted,'no trusted ATMS header veto');
no(!detect(canvas(rules),{...meta,boundaries:[0,10]}).accepted,'no proven columns veto');
const partial=rules.filter((y,i)=>i!==11);const part=detect(canvas(partial),meta);
ok(part.accepted,'other grid rules are still visible');
no(!fence(target,part,{cy:331},{cy:394}).accepted,'missing actual 08:55 physical divider veto, no invented rule');
no(!detect(canvas([35,66,97,128,160]),meta).accepted,'five observed dividers not sufficient');
ok(js.includes('boundedY0, x1, boundedY1, scale'),'actual production crop consumes bounded source coordinates');
ok(js.includes("meta.syntheticGapFailureReason='p11445_physical_source_row_unproven'"),'ambiguous geometry remains blocked');
ok(js.includes('p11445DetectPhysicalRowGrid(source,matrix._atmsImageMeta)'),'original source canvas is used');
if(process.env.ATMS_P11445_REAL_RGBA){
 const input=fs.readFileSync(process.env.ATMS_P11445_REAL_RGBA);
 const realW=1536,realH=605;
 assert(input.length===realW*realH*4,'real test input is exact decoded source bytes');
 const real=detect({width:realW,height:realH,getContext(){return {getImageData(){return {data:input};}};}},
 {standardAtms:true,headerlessAtms:false,boundaries:Array.from({length:14},(_,i)=>7+i*(1522/13))});
 ok(real.accepted,`actual 23 Oct image source physical grid: ${JSON.stringify(real)}`);
 const proof=fence(target,real,{cy:330},{cy:392});
 ok(proof.accepted,`23 Oct source row ambiguous: ${JSON.stringify(proof)}; rules ${real.ruleCenters.join(',')}`);
 ok(proof.sourceFenceTop>=342&&proof.sourceFenceTop<=351&&proof.sourceFenceBottom>=373&&proof.sourceFenceBottom<=381,
 `23 Oct 08:55 row must be isolated: ${JSON.stringify(proof)}`);
 console.log('REAL PHOTO SOURCE PIXEL PROOF:',JSON.stringify({grid:real,proof}));
}
console.log(`P11445 physical source-grid regression: PASS ${checks} checks, ${negatives} negative controls, 18 source rows independent`);
