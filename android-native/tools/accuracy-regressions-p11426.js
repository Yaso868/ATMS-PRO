#!/usr/bin/env node
'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert').strict,path=require('path');
const target=path.join(__dirname,'../app/src/main/assets/js/plan-import.js');
const s=fs.readFileSync(target,'utf8');
const terminator="  document.addEventListener('DOMContentLoaded', init);\n})();";
assert(s.includes(terminator));
const script=s.replace(terminator,"  window.__Accuracy = Object.freeze({makeRide,validate,provenStrongOnePeerLeftClip,provenRouteLeftClipAtMatrixBoundary,imagePriceHasLostSeparator,imageCellEvidenceForRide,groundedCompanySourceOpposition,normalizeTime,normalizeFlightNumber});\n})();");
const ctx={console,window:{addEventListener(){},location:{href:'https://atms.test/'}},document:{currentScript:{src:'https://atms.test/js/plan-import.js'},addEventListener(){},getElementById(){return null}},location:{href:'https://atms.test/'},Date,Intl,Math,Number,Map,Set,Promise,URL,performance:{now:()=>0}};
vm.createContext(ctx);vm.runInContext(script,ctx,{timeout:12000});const h=ctx.window.__Accuracy;
let count=0;function check(name,run){run();console.log('PASS',++count,name)}
const mapping={price:0,time:1,pickup:2,destination:3,customer:4,company:5,arrivalFlight:6,departureFlight:7,vehicle:8,persons:9,flightTime:10,flightLocation:11,driver:12};
function ride(update={}) {let row=['35,00 €','11:05','Holiday Inn DUS','DUS Airport','Eurowings','WT','-','EW9902','Pkw','3','','','Schimmi'];for (const [key,value] of Object.entries(update)) row[mapping[key]]=value;return h.makeRide(row,4,mapping,'stage-original.jpg',{imageOcr:true})}
check('Correct departure no fictional dash -> number normalization',()=>{const r=ride();assert.equal(r.flightNumber,'EW9902');assert.equal(r.flightNormalizedFromRaw,false);assert.equal(r.flightNumberRawOcr,'')});
check('Real glyph normalization preserved',()=>{const r=ride({departureFlight:'0S164'});assert.equal(r.flightNumber,'OS164');assert.equal(r.flightNormalizedFromRaw,true);assert.equal(r.flightNumberRawOcr,'0S164')});
check('Arrival unaffected and preserves own column',()=>{const r=ride({arrivalFlight:'EW9751',departureFlight:'-'});assert.equal(r.flightNumber,'EW9751');assert.equal(r.flightNormalizedFromRaw,false)});
check('Hotel no flight remains flightless',()=>{const r=ride({arrivalFlight:'-',departureFlight:'-',destination:'Holiday Inn'});assert.equal(r.flightNumber,'');assert.equal(r.flightNormalizedFromRaw,false)});
check('No fabricated flight correction visible in issues',()=>{const r=ride();const results=h.validate([r]);assert(!results.some(i=>String(i.text).includes('Flugnummer - →'))) });
check('Original question mark remembered',()=>{const r=ride({arrivalFlight:'EW9869',departureFlight:'-',flightTime:'13:30?'});assert.equal(r.flightTime,'13:30');assert.equal(r.flightTimeRawSource,'13:30?');assert.equal(r.flightTimeUncertain,true) });
check('Question mark produces user-visible warning',()=>{const r=ride({arrivalFlight:'EW9869',departureFlight:'-',flightTime:'13:30?'});assert(h.validate([r]).some(i=>i.kind==='flight_time_uncertain'&&i.level==='warning'&&i.text.includes('13:30?')))});
check('Uncertain clock never affects reliable clean clocks',()=>{const r=ride({arrivalFlight:'EW9869',departureFlight:'-',flightTime:'13:30'});assert.equal(r.flightTimeUncertain,false);assert(!h.validate([r]).some(i=>i.kind==='flight_time_uncertain'))});
check('Damaged decimal separator never becomes 3500',()=>{const r=ride({price:'35 00 €'});assert.equal(r.price,0);assert.equal(r.priceRawSource,'35 00 €');assert.equal(r.priceSeparatorUncertain,true)});
check('Unclear price requires review not 100x guess',()=>{const r=ride({price:'35 00 €'});assert(h.validate([r]).some(i=>i.kind==='price'&&i.text.includes('kein erkennbares Dezimalzeichen')))});
check('Good decimal input remains good',()=>{const r=ride({price:'35,00 €'});assert.equal(r.price,35);assert.equal(r.priceSeparatorUncertain,false)});
check('Legitimate 3500 explicitly formatted remains suspicious but is not changed',()=>{const r=ride({price:'3.500,00 €'});assert.equal(r.price,3500);assert.equal(r.priceSeparatorUncertain,false);assert(h.validate([r]).some(i=>i.kind==='price'))});
check('Price evidence field exists for geo-provenance',()=>{const meta={boundaries:[0,100,200,300,400,500,600,700,800,900,1000,1100,1200,1300],width:1300,safeHeaderDetected:true,rowMetaByMatrixIndex:{3:{y0:10,y1:50}},rawOcrWords:[]};const evidence=h.imageCellEvidenceForRide({sourceRow:4},meta,mapping);assert(evidence.price&&evidence.price.sourceColumn===0&&evidence.price.cellBounds.left===0)});
check('Image price raw OCR attempts captured in patched source',()=>{assert(s.includes('ride.priceTargetedOcrRawAttempts = rawAttempts'));assert(s.includes('second?.data?.words'))});
const original='Marriott Seestern DUS',candidate='Seestern DUS';const rowMeta={y0:758,y1:794};const orig={pickup:original,destination:'DUS Airport'};const peer={pickup:original,destination:'DUS Airport'};
const meta={rawOcrWords:[{text:'Marriott',x0:403,x1:530,y0:766,y1:786,confidence:93}]};
function clip(m=meta,rides=[orig,peer],value=candidate,locals=[]){return h.provenStrongOnePeerLeftClip(original,value,m,rowMeta,437.25,822.5,rides,orig,'pickup',locals)}
check('Source-boundary physically clipped with one exact-route peer',()=>{const r=clip();assert(r&&r.peers===1)});
check('Legacy older 2-peer threshold unchanged',()=>{assert.equal(h.provenRouteLeftClipAtMatrixBoundary(original,candidate,meta,rowMeta,437.25,822.5,[orig,peer],orig,'pickup'),null)});
check('No peer no false-positive unblocking',()=>{assert.equal(clip(meta,[orig]),null)});
check('Low primary confidence remains blocked',()=>{assert.equal(clip({rawOcrWords:[{...meta.rawOcrWords[0],confidence:91}]}),null)});
check('No geometric left spill remains blocked',()=>{assert.equal(clip({rawOcrWords:[{...meta.rawOcrWords[0],x0:440}]}),null)});
check('Truly different place remains blocked',()=>{assert.equal(clip(meta,[orig,peer],'Other Seestern DUS'),null)});
check('Competing local OCR remains blocked',()=>{assert.equal(clip(meta,[orig,peer],candidate,['Other Seestern DUS']),null)});
check('Bad opposing route endpoint blocks peer',()=>{assert.equal(clip(meta,[orig,{pickup:original,destination:'Holiday Inn'}]),null)});
check('Company full cell GetE counterevidence continues to veto',()=>{const a=[{scope:'source_truth_full_cell',candidate:'| GetE |',cropQuality:{fullCellIncluded:true,leftEdgeClipped:false,rightEdgeClipped:false,neighborColumnIncluded:false,targetCellGeometryConfirmed:true}}];assert(h.groundedCompanySourceOpposition(a,'Get-E'))});
check('Suspicious long-prefix flight is not silently changed',()=>{assert.equal(h.normalizeFlightNumber('EWO588'),'EWO588')});
console.log(`P11426 STAGED ACCURACY REGRESSIONS: ${count}/${count} PASS (archived code, not live GitHub or real Android OCR)`);

