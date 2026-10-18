'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync(__dirname+'/../app/src/main/assets/js/plan-import.js','utf8');
const point="document.addEventListener('DOMContentLoaded', init);";
assert.strictEqual(source.split(point).length,2);
const exposed=source.replace(point,"window.__PRICE_IMAGE_TEST__={recoverSuspiciousPricesTargeted, priceCandidatesFromOcrResult};\n  "+point);
let mode='fallback',calls=[],count=0,workers=0,parameterEvents=[],workerParameters={};
const canvas={width:1536,height:608};
function fakeCanvas(){
 const obj={width:0,height:0,getContext(){return {
  canvas:obj,drawImage(img,sx,sy,sw,sh,dx,dy,dw,dh){obj.region={sx,sy,sw,sh,scale:dw/sw};},
  set imageSmoothingEnabled(_) {},set imageSmoothingQuality(_) {}
 };}};return obj;
}
const document={currentScript:{src:'https://appassets.androidplatform.net/assets/js/plan-import.js'},getElementById(){return null},createElement(name){assert.equal(name,'canvas');return fakeCanvas()},addEventListener(){}};
const window={addEventListener(){}};
const Tesseract={async createWorker(){workers++;return {async setParameters(params){parameterEvents.push({...params});Object.assign(workerParameters,params);},async recognize(crop){assert.strictEqual(workerParameters.tessedit_char_whitelist,'0123456789,.€','price OCR must explicitly set the decimal-safe whitelist');assert.strictEqual(workerParameters.tessedit_pageseg_mode,'7','price OCR PSM must be 7');calls.push(crop.region);let raw='';
 const r=crop.region;
 if(mode==='baseline')raw='35,00 €';
 if(mode==='fallback')raw=(r.sy>=259 && r.sy+r.sh<=287)?'35,00 €':'';
 if(mode==='contradiction')raw=calls.length===1?'47,60 €':(r.sy>=259&&r.sy+r.sh<=287?'35,00 €':'');
 if(mode==='conflicting-interior')raw=(r.sy>=259&&r.sy+r.sh<=287)?(r.scale>2.5?'47,60 €':'35,00 €'):'';
 return {data:{text:raw,words:[]}};},async terminate(){}}}};
window.Tesseract=Tesseract;
const performance={now:()=>Date.now()};
const ctx=vm.createContext({window,document,console,URL:{},navigator:{},Tesseract,performance,Date,Intl,Promise,Map,Set,Number,Math,Error,setTimeout(){throw Error('unexpected timer')}});
vm.runInContext(exposed,ctx,{filename:'price_interior_app_source.js',timeout:5000});
const api=window.__PRICE_IMAGE_TEST__;
function row(price=0,extra={}){return {sourceRow:9,price,priceRequired:true,id:'r9',...extra}}
function geo(centers=[242,273,304]){return {boundaries:[5,100],rowMetaByMatrixIndex:{7:{cy:centers[0]},8:{cy:centers[1],y0:256,y1:288},9:{cy:centers[2]}}}}
async function run(m,price=0,meta=geo()){mode=m;calls=[];parameterEvents=[];const result=await api.recoverSuspiciousPricesTargeted([row(price)],canvas,meta,{price:0});assert.strictEqual(parameterEvents.length,calls.length*2,'each OCR read needs a set and a reset');assert.strictEqual(workerParameters.tessedit_char_whitelist,'','price whitelist must be cleared');assert.strictEqual(workerParameters.tessedit_pageseg_mode,'3','price PSM must be reset');return result[0];}
function check(cond,label){assert.ok(cond,label);console.log(`PASS ${++count} ${label}`)}
(async()=>{
 let r=await run('fallback');
 check(r.price===35,'missing price recovered from interior 35.00 agreement');
 check(r.priceRecoverySource==='targeted_price_cell_consensus_interior','interior-only provenance recorded');
 check(r.priceTargetedOcrAttempts.length===5&&r.priceTargetedOcrRawAttempts.length===5,'original three and two interior OCR attempts retained');
 check(calls.length===5,'only two extra reads after failed original 3');
 check(parameterEvents.filter(x=>x.tessedit_char_whitelist==='0123456789,.€'&&x.tessedit_pageseg_mode==='7').length===5,'all five reads set comma-safe OCR before recognition');
 check(calls.slice(3).every(x=>x.sy>257&&x.sy+x.sh<289),'interior OCR avoids neighbor row bands');
 r=await run('baseline');
 check(r.price===35&&r.priceRecoverySource==='targeted_price_cell_consensus','existing 3-crop consensus unchanged');
 check(calls.length===3,'no extra OCR reads when original works');
 r=await run('contradiction');
 check(r.price===0,'contradictory first-3 value vetoes auto recovery');
 check(calls.length===5,'conflicting evidence recorded without approval');
 r=await run('conflicting-interior');
 check(r.price===0,'conflicting interior OCR views vetoed');
 r=await run('fallback',35);
 check(r.price===35&&calls.length===0,'already valid price untouched; no new OCR');
 r=await run('fallback',0,geo([242,273,500]));
 check(r.price===0&&calls.length===3,'mismatched geometry cannot trigger fallback');
 r=await run('fallback',0,{boundaries:[5,100],rowMetaByMatrixIndex:{8:{cy:273,y0:256,y1:288}}});
 check(r.price===0&&calls.length===3,'missing neighboring rows cannot trigger fallback');
 check(api.priceCandidatesFromOcrResult({data:{text:'3500',words:[]}}).length===0,'no fabricated decimal from raw 3500');
 check(api.priceCandidatesFromOcrResult({data:{text:'35,00 €',words:[]}})[0]===35,'genuine decimal parses correctly');
 check(workers===1,'same serialized shared OCR worker reused');
 console.log(`RESULT ${count}/${count} NEW FOCUSED TESTS PASS; MOCKED OCR / NO ANDROID / NO STORAGE`);
})().catch(e=>{console.error(e.stack);process.exitCode=1});
