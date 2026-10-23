#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const s=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/js/plan-import.js'),'utf8');
const a=s.indexOf('  function p11449BindOriginalImageHeight(');
const b=s.indexOf('  // ATMS Bildimport –',a);
assert(a>0&&b>a,'Production P11449 function not found');
const ctx={Number};vm.createContext(ctx);
vm.runInContext(s.slice(a,b)+'this.attach=p11449BindOriginalImageHeight;',ctx);
const attach=ctx.attach;
let positive=0,negative=0;
const pass=(ok,name)=>{assert(ok,name);positive++};
const reject=(ok,name)=>{assert(ok,name);negative++};
const create=(w=3200,h=1260)=>({width:w,height:h,__atmsSourceTruthCanvas:{width:w,height:h}});
const meta={width:3200,boundaries:[0,210,345,830,1290,1591,1779],rowMetaByMatrixIndex:{1:{y0:76,y1:140}}};
const original=JSON.parse(JSON.stringify(meta)),canvas=create();
const result=attach(meta,canvas);
pass(result===meta,'metadata identity maintained');
pass(result.height===canvas.__atmsSourceTruthCanvas.height,'actual original source HEIGHT attached');
pass(result.width===canvas.width,'observed WIDTH retained');
pass(JSON.stringify(result.boundaries)===JSON.stringify(original.boundaries),'cell boundaries unchanged');
pass(JSON.stringify(result.rowMetaByMatrixIndex)===JSON.stringify(original.rowMetaByMatrixIndex),'row mapping unchanged');
pass(s.includes('imageMeta: p11449BindOriginalImageHeight(matrix._atmsImageMeta || null, canvas)'), 'production readImagePlan returns verified meta');
pass(s.includes('Number(m.height) !== Number(source.height)'), 'original safety-height veto preserved');
pass(s.includes('c?.cropQuality?.neighborColumnIncluded === true'),'neighbor column veto preserved');
pass(s.includes('receipt.sourceRow !== s.row')&&s.includes('receipt.sourceColumn !== s.col'),'cell and row receipt veto preserved');
pass(s.includes('const hash=await p11448HashSelectedImage()'),'pre-import source sha hashing preserved');
pass(s.includes('preBuild.dependsOn')===false,'js source has no synthetic bypass');
for(const [k,bad] of [
 ['no original canvas',{width:3200,height:1260}],
 ['width mismatch',create(3300,1260)],
 ['height mismatch',{width:3200,height:1260,__atmsSourceTruthCanvas:{width:3200,height:1259}}],
 ['metadata width mismatch',{width:3000,height:1260,__atmsSourceTruthCanvas:{width:3200,height:1260}}],
 ['zero original height',{width:3200,height:1260,__atmsSourceTruthCanvas:{width:3200,height:0}}],
 ['fractional original height',{width:3200,height:1260,__atmsSourceTruthCanvas:{width:3200,height:1259.5}}]
]){let m={width:3200};attach(m,bad);reject(!Object.hasOwn(m,'height'),k+' must not fabricate metadata');}
{let m={width:3200};attach(m,{width:3200,height:1260,__atmsSourceTruthCanvas:{width:3200,height:1260}});pass(m.height===1260,'source can supply height only when validated');}
assert(s.includes('if (!ride || !P11448_FIELDS.includes(field)'),'only historical safe fields eligible');
assert(!/Get-E\s*=>\s*GetE/.test(s),'no company-specific bypass');
console.log(`P11449 HEIGHT from true source: ${positive} positive / ${negative} negative PASS; existing per-field security preserved`);
