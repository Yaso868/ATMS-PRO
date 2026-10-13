'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync(path.resolve(__dirname,'../app/src/main/assets/js/plan-import.js'),'utf8');
const html=fs.readFileSync(path.resolve(__dirname,'../app/src/main/assets/index.html'),'utf8');
assert(html.includes('id="ap01RideEditor"')&&html.includes('id="ap01ReviewConfirm"'));
const elements={};
function el(id){if(!elements[id])elements[id]={id,value:'',hidden:true,style:{},textContent:'',innerHTML:'',checked:false,disabled:false,dataset:{},classList:{add(){},remove(){}},addEventListener(){},querySelectorAll(){return []}};return elements[id]}
const fields=el('ap01EditorFields');
fields.querySelectorAll=()=>{
 const matches=[...fields.innerHTML.matchAll(/<input class="ap01-field" data-field="([^"]+)" type="[^"]+" value="([^"]*)"/g)];
 return matches.map((m)=>({dataset:{field:m[1]},value:m[2].replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&gt;','>')}));
};
const originalQuery=fields.querySelectorAll.bind(fields);
const window={addEventListener(){},showToast(){},applyImportedRides:async()=>{writes++;return {count:1,historySaved:true}}};
const document={currentScript:{src:'https://test.example/js/plan-import.js'},getElementById:id=>el(id),addEventListener(){}};
const ctx={window,document,location:{href:'https://test.example/'},Date,Intl,URL,Math,Number,Map,Set,Promise,console,performance:{now:()=>0}};
// Only replace render in this isolated logic test. A separate test executes the actual renderer for 85 rides.
const marker="  document.addEventListener('DOMContentLoaded', init);\n})();";
assert(src.includes(marker));
const compiled=src.replace(marker, "  render = function(){ window.__renderCalls=(window.__renderCalls||0)+1; };\n  document.addEventListener('DOMContentLoaded', init);\n})();");
vm.createContext(ctx);vm.runInContext(compiled,ctx,{timeout:12000});
const h=window.ATMSAP01Regression,s=h.readState();let checks=0,writes=0;
function check(name,fn){fn();checks++;console.log('PASS '+checks+' '+name)}
const original={id:'single-ride',sourceRow:17,sourceImageOcr:true,date:'2026-10-13',time:'07:20',driver:'Lana',pickup:'Marriott Seestern DUS',destination:'DUS Airport',flightNumber:'EW9752',arrivalFlight:'',departureFlight:'EW9752',flightDirection:'departure',flightLocation:'Wien',flightTime:'08:55',company:'Get-E',vehicle:'Pkw',persons:1,price:35.7,flightCheckConfidence:'verified',flightNeedsManualCheck:false,importIntegrityConflicts:[]};
s.rides=[original];
check('12 fields exist in preview editor',()=>{assert.equal(h.validateDraft({date:original.date,time:original.time,driver:original.driver,pickup:original.pickup,destination:original.destination,flightNumber:original.flightNumber,flightLocation:original.flightLocation,flightTime:original.flightTime,company:original.company,vehicle:original.vehicle,persons:original.persons,price:'35,70'}).ok,true);assert.equal([...src.slice(src.indexOf('const AP01_FIELDS'),src.indexOf('const AP01_KEYS')).matchAll(/\['(?:date|time|driver|pickup|destination|flightNumber|flightLocation|flightTime|company|vehicle|persons|price)', /g)].length,12)});
check('invalid calendar date and 24h time refused',()=>{const d=Object.fromEntries(['date','time','driver','pickup','destination','flightNumber','flightLocation','flightTime','company','vehicle','persons','price'].map(k=>[k,String(original[k]??'')]));d.date='2026-02-30';assert.equal(h.validateDraft(d).ok,false);d.date=original.date;d.time='24:13';assert.equal(h.validateDraft(d).ok,false)});
check('script/HTML value escaped in editor',()=>{original.driver='<svg onload=alert(1)>';assert(h.openEditor(original.id));assert(fields.innerHTML.includes('&lt;svg'));assert(!fields.innerHTML.includes('value="<svg'));original.driver='Lana';el('ap01EditorCancel')});
check('no automatic import and no import before consent',()=>{s.ap01EditorOpenId=null;s.ap01ReviewConfirmed=false;assert(h.importBlockers().length>0)});
check('cancel does not change staged ride',()=>{const prev=original.destination;assert(h.openEditor(original.id));assert.equal(original.destination,prev);s.ap01EditorOpenId=null;el('ap01RideEditor').hidden=true});
check('saves edited non-flight field, preserving original snapshot',()=>{assert(h.openEditor(original.id));fields.querySelectorAll=()=>originalQuery().map(f=>({...f,value:f.dataset.field==='vehicle'?'Van':f.value}));assert.equal(h.saveEditor(),true);fields.querySelectorAll=originalQuery;assert.equal(original.vehicle,'Van');assert.equal(original.ap01OriginalOcr.fields.vehicle,'Pkw');assert.equal(original.ap01EditAudit.length,1);assert.equal(original.ap01EditAudit[0].changes[0].from,'Pkw');assert.equal(original.ap01EditAudit[0].changes[0].to,'Van');assert.equal(original.flightCheckConfidence,'verified')});
check('manual flight-context edit forces fail-closed recheck and invalidates verification',()=>{assert(h.openEditor(original.id));fields.querySelectorAll=()=>originalQuery().map(f=>({...f,value:f.dataset.field==='flightNumber'?'EW9753':f.value}));assert.equal(h.saveEditor(),true);fields.querySelectorAll=originalQuery;assert.equal(original.flightNumber,'EW9753');assert.equal(original.departureFlight,'EW9753');assert.equal(original.flightCheckConfidence,'uncertain');assert.equal(original.ap01FlightRecheckRequired,true);s.ap01ReviewConfirmed=true;assert(h.importBlockers().length>0)});
check('conflict review records reason but never clears integrity conflict',()=>{const conflict={code:'GetE-OPPOSED',text:'Get-E vs GetE'};original.importIntegrityConflicts=[conflict];assert(h.openEditor(original.id));el('ap01ConflictReason').value='Originalzelle weiterhin nicht unabhängig belegt';assert.equal(h.recordConflictReview(),true);assert.deepEqual(original.importIntegrityConflicts,[conflict]);assert.equal(original.ap01ConflictReviews[0].decision,'review_documented_not_released');s.ap01EditorOpenId=null});
check('unsafe HTML and invalid integer person counts rejected',()=>{const d=Object.fromEntries(['date','time','driver','pickup','destination','flightNumber','flightLocation','flightTime','company','vehicle','persons','price'].map(k=>[k,String(original[k]??'')]));d.persons='1.3';assert.equal(h.validateDraft(d).ok,false);d.persons='1';d.pickup='<img src=x onerror=alert(1)>';assert.equal(h.validateDraft(d).ok,true);assert(src.includes('escapeHtml(v)'))});
(async()=>{
 s.ap01EditorOpenId=null;s.previewOnlyAnalysis=false;s.ap01ReviewConfirmed=false;
 assert.equal((await window.ATMSP11421PreviewRegression.importRides({auto:false})),false);
 assert.equal((await window.ATMSP11421PreviewRegression.importRides({auto:true})),false);
 assert.equal(writes,0);console.log('PASS '+(++checks)+' backend blocks automatic and unreviewed import before storage');
 console.log(`AP01 editor/conflict/guard ${checks}/${checks} PASS (isolated VM, mock persistence; no Android E2E)`);
})().catch(e=>{console.error(e);process.exit(1)});
