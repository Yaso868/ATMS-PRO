#!/usr/bin/env node
'use strict';
// Local/browser-independent behavioral replay. NO inference from company names,
// no storage, network, GitHub, import or Android access.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const src=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/js/plan-import.js'),'utf8');
const names=['cropCompanySourceEvidenceGrayscale','sourceTruthFullCellTextOcr','sourceTruthAdaptiveCompanyTailOcr',
  'textIntegrityCellCandidate','sourceTruthCellCandidate','sourceTruthFullCellConsensus','adaptiveCompanyTailConsensus',
  'isHyphenatedCompanyEdgeProbe','singleInternalCompanyDelimiterLoss','groundedCompanySourceOpposition'];
const snippets=names.map(n=>{
  const re=new RegExp('  (?:async )?function '+n+'\\('); const m=re.exec(src);
  assert(m,'missing function '+n);const end=src.indexOf('\n  }\n',m.index);
  assert(end>m.index,'missing end '+n);return src.slice(m.index,end+5);
});
const channels={cropColors:[],readFailures:false,callParams:[],received:[]};
const source={width:600,height:500};let currentField='company';
const env={console,Map,Set,Number,String,Math,Boolean,Array,Object,JSON,Intl,
  window:{Tesseract:{}},cellText:x=>String(x??'').trim(),normalizeTime:()=>false,flightLocationNote:()=>false,looksLikeTime:()=>false,
  cropCanvasRegion(_source,l,t,r,b,scale){
    assert.equal(scale,1,'unchanged geometry/scale');
    const original=Uint8ClampedArray.from([17,101,238,211, 20,100,60,212]);
    let data=Uint8ClampedArray.from(original);
    const c={width:2,height:1,coords:[l,t,r,b],getContext(){return{
      getImageData(){if(channels.readFailures)throw Error('no pixel access');return{data}},
      putImageData(image){data=image.data;}
    }},get pixels(){return data}};
    channels.cropColors.push(c);return c;
  },
  rawImageCellWords(_im,_row,next){return next===6?[{x0:300}]:[]},
  p109PerfWorkerSetParameters:async(_w,_label,p,m)=>channels.callParams.push({psm:p.tessedit_pageseg_mode,mode:m.mode}),
  p109PerfWorkerRecognize:async(_w,_label,crop,m)=>{
    const px=crop.pixels;
    const isGray=px[0]===px[1]&&px[1]===px[2]&&px[4]===px[5]&&px[5]===px[6];
    channels.received.push({mode:m.mode,isGray,alpha:[] .concat(px[3],px[7])});
    return {data:{text:currentField==='company'?(isGray?'Get-E':'GetE'):'Prag'}};
  },
  p109PerfRecognizeOneShot:async()=>{throw Error('only mocked worker')}
};vm.createContext(env);vm.runInContext(snippets.join('\n')+'\nthis.TEST={'+names.join(',')+'};',env);
const T=env.TEST;const desc={left:0,right:80,column:5,cellWidth:80},row={y0:10,y1:44},meta={boundaries:Array.from({length:9},(_,i)=>i*80)};
let n=0;const check=(desc,fn)=>{fn();console.log('PASS',++n,desc)};
(async()=>{
  currentField='company';
  const full=await T.sourceTruthFullCellTextOcr(source,source,desc,row,16,'company',{recognize(){},setParameters(){}});
  check('two PSM full-cell modes unchanged',()=>assert.deepEqual(Array.from(full,x=>x.mode),['source-truth-full-cell-psm6','source-truth-full-cell-psm7']));
  check('full-cell company pixels grayscale and alpha preserved',()=>{assert.equal(channels.received.length,2);assert(channels.received.every(x=>x.isGray&&x.alpha[0]===211&&x.alpha[1]===212));});
  check('full-cell outputs only direct worker words, no string rewriting',()=>assert.deepEqual(Array.from(full,x=>x.candidate),['Get-E','Get-E']));
  check('company full-cell provenance still intact',()=>assert(full.every(x=>x.scope==='source_truth_full_cell'&&x.cropQuality.targetCellGeometryConfirmed===true&&x.sourceRow===16&&x.sourceColumn===5)));
  check('source crop input remains RGB independent of grayscale output',()=>assert(channels.cropColors.every(c=>c.pixels[3]===211&&c.pixels[7]===212)));
  const prior=channels.received.length;currentField='flightLocation';
  const flight=await T.sourceTruthFullCellTextOcr(source,source,desc,row,16,'flightLocation',{recognize(){},setParameters(){}});
  check('flightLocation/other fields original color crop retained',()=>assert(channels.received.slice(prior).every(x=>!x.isGray)));
  check('flight candidate unaffected',()=>assert(flight.every(x=>x.candidate==='Prag')));
  currentField='company';const prev=channels.received.length;
  const adapt=await T.sourceTruthAdaptiveCompanyTailOcr(source,source,desc,row,16,{recognize(){},setParameters(){}},meta,{});
  check('adaptive crop both PSMs grayscale without neighbor bleed',()=>assert(channels.received.slice(prev).length===2&&channels.received.slice(prev).every(x=>x.isGray)));
  check('adaptive proof retains sourceRow/sourceColumn/geometry',()=>assert(adapt.every(x=>x.sourceRow===16&&x.sourceColumn===5&&x.cropQuality.neighborColumnIncluded===false&&x.cropQuality.neighboringWordsChecked===1)));
  check('two trusted families agree only on actual OCR output',()=>{
    assert.equal(T.sourceTruthFullCellConsensus(full).candidate,'Get-E');assert.equal(T.adaptiveCompanyTailConsensus(adapt,16,5).candidate,'Get-E');
  });
  check('matching direct OCR pixels are not an opposition',()=>assert.equal(T.groundedCompanySourceOpposition([...full,...adapt],'Get-E'),false));
  check('different exact source cells remain an opposition',()=>assert.equal(T.groundedCompanySourceOpposition(full.map(x=>({...x,candidate:'GetZ'})),'Get-E'),true));
  check('unverified different company is not rewritten',()=>assert.equal(T.sourceTruthCellCandidate('GetE','company'),'GetE'));
  check('leading equals from real Samsung trace preserved',()=>assert.equal(T.sourceTruthCellCandidate('= GetE','company'),'= GetE'));
  check('text-delimiter loss only detected, not normalized',()=>assert.equal(T.singleInternalCompanyDelimiterLoss('Get-E','GetE'),true));
  const before=channels.received.length;const skipped=await T.sourceTruthAdaptiveCompanyTailOcr(source,source,desc,row,16,{recognize(){},setParameters(){}},{boundaries:[0,1,2,3,4,5,6]},{});
  check('neighbor word missing retains no OCR and no proof',()=>assert.equal(skipped.length,0));
  check('no extra OCR on missing neighbor',()=>assert.equal(channels.received.length,before));
  channels.readFailures=true;const f=await T.sourceTruthFullCellTextOcr(source,source,desc,row,16,'company',{recognize(){},setParameters(){}});channels.readFailures=false;
  check('pixel read failure: unchanged original color / still blocks',()=>{assert(f.every(x=>x.candidate==='GetE'));assert.equal(T.groundedCompanySourceOpposition(f,'Get-E'),true)});
  check('worker PSM choices unmodified',()=>assert(channels.callParams.every(x=>['6','7'].includes(x.psm))));
  check('no generic rewrite getE to Get-E introduced',()=>assert(!src.includes("replace('GetE','Get-E')")&&!src.includes("replace(/GetE/g,'Get-E')")));
  console.log(`P11435 COMPANY PIXEL SAFETY: ${n}/${n} PASS (mock worker and pixel conversion; real photo OCR separately tested)`);
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
