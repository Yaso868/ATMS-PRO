#!/usr/bin/env node
'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const src=fs.readFileSync(process.argv[2],'utf8');
function fn(name){
 const prefixes=['function ','async function '];const positions=prefixes.map(pre=>src.indexOf('  '+pre+name+'(')).filter(p=>p>=0);
 assert.equal(positions.length,1,'unique '+name);const i=positions[0],j=src.indexOf('\n  }\n',i);assert(j>i);return src.slice(i,j+5);
}
const make=(fns,extras={})=>{const ctx={console,window:{Tesseract:{}}, ...extras};vm.createContext(ctx);vm.runInContext(fns.map(fn).join('\n')+'\nthis._test={'+fns.join(',')+'};',ctx);return ctx;};
let passed=0;
function pass(label){passed++;console.log('PASS '+passed+' '+label)};
(async()=>{
const priceFuncs=['priceCandidatesFromOcrResult','p11429RecognizePriceCell','recoverSuspiciousPricesTargeted'];
const validNumber = text => {
 const cleaned=String(text).replace(/\s/g,'').replace('€','').replace(/\.(?=\d{3}[.,])/g,'').replace(',','.');
 return +cleaned;
};
function mockPrice(responses,{first=true,quality=true,failed=false}={}){
 let i=0,callTrace=[];
 const c=make(priceFuncs,{
   cellText:x=>String(x??'').trim(), parseNumber:validNumber,
   pricePlausibility:v=>({suspicious:!Number.isFinite(Number(v))||Number(v)<=0||Number(v)>1000}),
   $:()=>null,
   cropCanvasRegion:(_im,a,b,c,d,scale)=>({coords:[a,b,c,d],scale}),
   p109SharedOcrWithWorker:async (_lang,callback)=>callback({setParameters:async()=>{}}),
   p109PerfWorkerSetParameters:async()=>{},
   p109PerfWorkerRecognize:async(_w,_stage,crop,meta)=>{
      const n=i++,raw=responses[n]||'';callTrace.push({mode:meta.mode,raw,coords:crop.coords});
      if(failed&&n===1)throw new Error('OCR failure');
      return {data:{text:raw,words:raw?[{text:raw,bbox:{x0:20,x1:100},confidence:65}]:[]}};
   }
 });
 const ride={sourceRow:2,price:3500,priceRequired:true,
    imageCellEvidence:{price:{cropQuality:{fullCellIncluded:quality,leftEdgeClipped:false,rightEdgeClipped:false,neighborColumnIncluded:false}}}};
 const cy=first?110:710,y0=first?74:686,y1=first?144:728;
 const rowMetaByMatrixIndex={1:{y0,y1,cy}};
 if(!first){rowMetaByMatrixIndex[0]={cy:645};rowMetaByMatrixIndex[2]={cy:773}};
 const imageMeta={boundaries:[0,197.25],rowMetaByMatrixIndex};
 return {run:async(initial)=>{ride.price=initial;const out=await c._test.recoverSuspiciousPricesTargeted([ride],{height:1212},imageMeta,{price:0});return out[0]},trace:callTrace};
}
const parser=make(['priceCandidatesFromOcrResult'],{
 parseNumber:validNumber,pricePlausibility:v=>({suspicious:!Number.isFinite(Number(v))||v<=0||v>1000})
})._test.priceCandidatesFromOcrResult;
assert.deepEqual([...parser({data:{text:'47.,60€'}})],[]);pass('malformed decimal NOT independently accepted');
assert.deepEqual([...parser({data:{text:'3500€'}})],[]);pass('naked integer never becomes price/100');
{
 const h=mockPrice(['35,00€','3500€','3500€','35,00€','35,00€']);const a=await h.run(3500);
 assert.equal(a.price,35);assert.equal(a.priceTargetedOcrDecision,'accepted_two_or_more_votes');assert.equal(a.priceTargetedOcrAttempts.length,5);assert.equal(a.priceInteriorOcrAttempted,true);pass('first physical row own-cell interior may resolve comma loss with 2 clean interior views');
}
{
 const h=mockPrice(['47,60€','47.,60€','47.,60€','47.,60€','47,60€'],{first:false});const a=await h.run(0);
 assert.equal(a.price,47.6);assert.equal(a.priceTargetedOcrInteriorDecision,'full_cell_plus_inner_cell_clean_decimal_consensus');pass('clean 1x + distinct in-cell 3x with same-digit OCR punctuation artifact');
}
{
 const h=mockPrice(['35,00€','3500€','3500€','3500€','3500€']);const a=await h.run(3500);
 assert.equal(a.price,3500);assert.equal(a.priceTargetedOcrDecision,'fewer_than_two_matching_votes');pass('isolated 35 without corroboration remains unaccepted');
}
{
 const h=mockPrice(['47,60€','48,60€','47.,60€','47.,60€','47,60€'],{first:false});const a=await h.run(0);
 assert.equal(a.price,0);assert.match(a.priceTargetedOcrDecision,/votes|conflict/);pass('true competing decimal candidates remain unresolved');
}
{
 const h=mockPrice(['47.,60€','47.,60€','47.,60€','47.,60€','47.,60€'],{first:false});const a=await h.run(0);
 assert.equal(a.price,0);pass('all OCR views malformed cannot hallucinate missing decimal');
}
{
 const h=mockPrice(['35,00€','3500€','3500€','35,00€','35,00€'],{first:true,quality:false});const a=await h.run(3500);
 assert.equal(a.price,3500);assert.equal(a.priceTargetedOcrInteriorDecision,'geometry_unavailable');pass('missing original cell provenance blocks first-row interior');
}
{
 const h=mockPrice(['35,00€','35,00€','35,00€'],{first:true,failed:true});const a=await h.run(3500);
 assert.equal(a.price,3500);assert.equal(a.priceTargetedOcrDecision,'ocr_execution_failed');pass('OCR worker exception does not auto-approve');
}
const rg=make(['routeOcrText','routeOcrBase','routeG4SemanticDecision'],{
 cellText:v=>String(v??'').trim(),
 routeOcrBase:v=>String(v??'').toLowerCase().replace(/[^a-z0-9]/g,''),
});
const dest=rg._test.routeG4SemanticDecision;
const weak={rawOcr:'DUSAipot',confidence:53.4,geometryConfidence:'high',verificationSource:'primary_full_image_cell_assignment',cropQuality:{fullCellIncluded:true,leftEdgeClipped:false,rightEdgeClipped:false,neighborColumnIncluded:false}};
const e={columnVotes:2,localCandidates:['DUS Airport','DUS Airport'],changedRawWordInCell:true,changedRawWordConfidence:45};
assert.equal(dest('DUSAipot','DUS Airport',weak,e).allow,true);pass('weak original route corrected only with four modes and in-cell weak word');
assert.equal(dest('DUSAipot','DUS Airport',{...weak,confidence:90},e).allow,false);pass('strong primary route not overwritten');
assert.equal(dest('DUSAipot','DUS Airport',weak,{...e,changedRawWordInCell:false}).allow,false);pass('no original word geometry -> fail closed');
assert.equal(dest('DUSAipot','DUS Airport',weak,{...e,localCandidates:['DUS Airport','DUS Terminal']}).allow,false);pass('nonunanimous local routes blocked');
assert.equal(dest('DUSAipot','DUS Airport',weak,{...e,changedRawWordConfidence:80}).allow,false);pass('higher-confidence changed word blocked');
assert.equal(dest('DUSAipot','DUS Airport',{...weak,cropQuality:{...weak.cropQuality,rightEdgeClipped:true}},e).allow,false);pass('clipped source route blocked');
assert(src.includes('blockingNonFlightIssues(validate(state.rides))'));pass('real import entrypoint checks unresolved blockers');
assert(src.includes('if (state.previewOnlyAnalysis)'));pass('read-only preview cannot import');
assert(src.includes('priceReviewStatus(ride).pending'));pass('price gate remains wired in importRides');
// Company field stays fail-closed when exact source cell OCR drops an internal separator.
const company=make(['groundedCompanySourceOpposition'],{
  cellText:v=>String(v??'').trim(),
  sourceTruthCellCandidate:(v)=>String(v??'').replace(/^[=|\s]+|[=|\s]+$/g,'')
})._test.groundedCompanySourceOpposition;
const exactCompanyAttempt={scope:'source_truth_full_cell',candidate:'= GetE',
 cropQuality:{fullCellIncluded:true,leftEdgeClipped:false,rightEdgeClipped:false,neighborColumnIncluded:false,targetCellGeometryConfirmed:true}};
assert.equal(company([exactCompanyAttempt],'Get-E'),true);pass('Get-E versus clean full-cell GetE stays a genuine blocker');
assert.equal(company([{...exactCompanyAttempt,cropQuality:{...exactCompanyAttempt.cropQuality,neighborColumnIncluded:true}}],'Get-E'),false);pass('neighbor-containing OCR is not an independent complete cell veto');
assert.equal(company([{...exactCompanyAttempt,candidate:'Get-E |'}],'Get-E'),false);pass('table-border glyph does not create semantic company conflict');
assert(src.includes('groundedCompanySourceOpposition(attempts,current)'));pass('independently opposed company sources still veto consensus');
console.log(`V126 RESULT ${passed}/${passed} tests pass; synthetic source-function replay only`);
})().catch(e=>{console.error(e.stack);process.exitCode=1});
