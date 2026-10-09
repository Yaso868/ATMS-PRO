#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const src=fs.readFileSync(path.join(root,'app/src/main/assets/js/plan-import.js'),'utf8');
assert(src.includes('driverIdentityGlyphSuspectP11420'),'new generic identity risk detector exists');
assert(src.includes('kind: \'driver_identity_ocr\''),'unresolved driver is a real error');
assert(src.includes('driver-ocr-review-btn'),'visible per-ride correction button exists');
assert(src.includes("blockingNonFlightIssues(validate(state.rides)).length"),'backend import path checks unresolved issues independently of button disabled state');
assert(!src.includes("driver === 'KölnBus'"),'no production name-specific hardcode');
// Run the actual production validator and name detection inside the intact IIFE.
function harness(replaceRender=false){
 let text=src;
 if(replaceRender){
  const a=text.indexOf('  function render() {'),b=text.indexOf('  function releaseAnalysisRunGuard(',a);
  assert(a>=0&&b>a,'production rendering function exists');
  text=text.slice(0,a)+'  function render() {}\n\n'+text.slice(b);
 }
 const window={addEventListener(){},showToast(){}}, document={currentScript:{src:'file:///android_asset/js/plan-import.js'},addEventListener(){}}, ctx={window,document,location:{href:'file:///android_asset/'},URL,Date,Intl,console,Set,Map};
 vm.runInNewContext(text,ctx,{timeout:2500});
 assert(window.ATMSP11420DriverRegression,'test hooks load from actual production code');
 return window.ATMSP11420DriverRegression;
}
const H=harness(true);
const base={date:'2026-10-09',time:'05:40',pickup:'Moxy CGN',destination:'CGN Vorfeld',vehicle:'Van',persons:6,flightNumber:'XC111',flightLocation:'',price:65.45,sourceImageOcr:true};
const fake=(id,driver,extra={})=>({...base,id,sourceRow:id,driver,...extra});
const errors=x=>Array.from(H.validate([x])).filter(e=>e.kind==='driver_identity_ocr'&&e.level==='error');
assert.equal(H.driverIdentityGlyphSuspectP11420('KoIinBus'),true,'internal capital OCR I must be suspicious');
assert.equal(H.driverNeedsTargetedRecovery('KoIinBus'),true,'suspicious plausible OCR must trigger local cell recheck');
assert.equal(errors(fake(6,'KoIinBus')).length,1,'staged Excel row 6 must be import-blocking');
assert.equal(errors(fake(6,'KoIinBus',{driverIdentityOcrAlternative:'KölnBus'})).length,1,'suggestion does not auto-resolve identity');
assert.equal(errors(fake(6,'KoIinBus',{driverManualOcrCorrection:{confirmed:true,to:'KoIinBus'}})).length,0,'explicit confirmation may accept precisely checked source');
assert.equal(errors(fake(6,'KölnBus')).length,0,'correct original spelling must not be falsely blocked');
assert.equal(errors(fake(6,'Lana')).length,0,'ordinary correct driver remains admissible');
assert.equal(H.driverNeedsTargetedRecovery('Lana'),false,'no extra OCR work for ordinary names');
const blank=fake(16,'',{driverBlankCellConfirmed:true});
assert(!Array.from(H.validate([blank])).some(i=>i.kind==='driver_ocr'&&i.level==='error'),'original confirmed blank remains importable as unassigned');
assert(Array.from(H.validate([fake(16,'')])).some(i=>i.kind==='driver_ocr'&&i.level==='error'),'unconfirmed blank remains blocked');
const ga=fake(31,'Ghasem',{time:'08:15',flightNumber:'',pickup:'Novotel DUS',destination:'Trainingscenter DUS',vehicle:'Pkw',persons:1});
const gb=fake(32,'Ghasem',{time:'08:15',flightNumber:'',pickup:'Novotel DUS',destination:'Trainingscenter DUS',vehicle:'Van',persons:7});
assert.equal(H.validate([ga,gb]).filter(i=>String(i.text||'').includes('doppelt')).length,0,'Pkw1 and Van7 are distinct original trips');
const state=H.readState();const x=fake(6,'KoIinBus',{driverIdentityOcrUnresolved:true});const sibling=fake(7,'Lana');state.rides=[x,sibling];
H.resolveDriverIdentityOcrIssue('6','KölnBus');
assert.equal(x.driver,'KölnBus','manual correction must set exact source driver');
assert.equal(x.driverManualOcrCorrection.confirmed,true,'manual confirmation recorded');
assert.equal(x.driverIdentityOcrUnresolved,false,'manual confirmation clears import block');
assert.equal(sibling.driver,'Lana','unrelated trip unchanged');
assert.equal(errors(x).length,0,'revalidate must clear resolved error');
const y=fake(8,'KoIinBus',{driverIdentityOcrUnresolved:true});state.rides=[y];
H.resolveDriverIdentityOcrIssue('8','');
assert.equal(y.driver,'KoIinBus','empty manual input must never overwrite primary driver');
assert.equal(errors(y).length,1,'invalid correction must not unblock');
console.log('P114.20 driver identity OCR regression: PASS (15 negative/positive checks, no data persistence)');
