#!/usr/bin/env node
'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path'),cp=require('child_process');
const root=path.join(__dirname,'..');
const image=path.join(root,'tools/fixtures/golden-regression/source-images/IMG-20261007-WA0001.jpg');
assert(fs.existsSync(image),'Golden original image missing');
let source=fs.readFileSync(path.join(root,'app/src/main/assets/js/plan-import.js'),'utf8');
const tail="  document.addEventListener('DOMContentLoaded', init);\n})();";
source=source.replace(tail,"  window.__Replay={sourceTruthAdaptiveCompanyTailOcr,sourceTruthPrimaryEdgeVeto};\n})();");
const drawContext = (canvas)=>({drawImage(_source,sx,sy,sw,sh){canvas.srcRect=[sx,sy,sw,sh]}});
const dom={currentScript:{src:'https://atms.test/js/plan-import.js'},addEventListener(){},getElementById(){return null},createElement(type){const c={width:0,height:0,srcRect:null,getContext(){return drawContext(c)}};return c},body:{appendChild(){}}};
const ctx={window:{addEventListener(){},removeEventListener(){},dispatchEvent(){},Tesseract:{},ATMSOcrIntegrityCore:require(root+'/app/src/main/assets/js/ocr-integrity-core.js'),location:{href:'https://atms.test'}},document:dom,location:{href:'https://atms.test'},performance:{now:()=>0},console,setTimeout,clearTimeout,setInterval,clearInterval,Map,Set,WeakMap,Promise,Array,Object,Number,String,Boolean,Math,Date,RegExp,JSON,Intl,URL,Blob,TextEncoder,TextDecoder,FileReader:function(){},navigator:{},localStorage:{},sessionStorage:{}};
ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(source,ctx);
const api=ctx.window.__Replay;
const imgCanvas={width:1536,height:1097};
const descriptor={left:738,right:826,cellWidth:88,column:5,field:'company'};
const row={y0:531,y1:564};
const meta={boundaries:[0,91,159,390,593,738,826,924,1014,1067,1141,1207,1372,1536],rawOcrWords:[{text:'EW9760',x0:975,x1:1035,y0:541,y1:560}]};
const worker={psm:'6',async setParameters(p){this.psm=String(p.tessedit_pageseg_mode)},async recognize(crop){
 const r=crop.srcRect;assert(r);
 const code=String.raw`from PIL import Image
import subprocess,sys,tempfile,os
im=Image.open(sys.argv[1]);x,y,w,h=map(int,sys.argv[2:6]);c=im.crop((x,y,x+w,y+h));
with tempfile.NamedTemporaryFile(suffix='.png') as f:
 c.save(f.name);p=subprocess.run(['tesseract',f.name,'stdout','-l','deu','--psm',sys.argv[6]],capture_output=True,text=True)
 print(p.stdout.strip())`;
 const p=cp.spawnSync('python3',['-c',code,image,...r.map(String),this.psm],{encoding:'utf8',timeout:10000});
 if(p.status!==0)throw Error(p.stderr);
 return {data:{text:p.stdout.trim()}};
}};
(async()=>{
 const attempts=await api.sourceTruthAdaptiveCompanyTailOcr(imgCanvas,imgCanvas,descriptor,row,17,worker,meta);
 assert.equal(attempts.length,2,'OCR family must run two original-image crops');
 assert(attempts.every(a=>a.candidate==='Get-E'),JSON.stringify(attempts));
 const result=api.sourceTruthPrimaryEdgeVeto('Get-E','GetE','company',attempts,8,17,5);
 assert.equal(result?.reason,'source_truth_adaptive_company_tail_veto');
 console.log('REAL IMAGE ORIGINAL OCR ROW 17: '+attempts.map(a=>a.mode+'='+a.candidate).join(', '));
 console.log('PRODUCTION DECISION: '+result.reason);
 const intruded={...meta,rawOcrWords:[{text:'FLIGHT',x0:832,x1:875,y0:541,y1:555}]};
 const rejected=await api.sourceTruthAdaptiveCompanyTailOcr(imgCanvas,imgCanvas,descriptor,row,17,worker,intruded);
 assert.equal(rejected.length,0,'adjoining cell ink must block entire adaptive crop');
 console.log('FAIL CLOSED NEIGHBOR COLUMN: PASS');
})().catch(e=>{console.error(e);process.exitCode=1});
