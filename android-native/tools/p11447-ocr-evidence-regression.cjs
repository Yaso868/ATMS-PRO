'use strict';
// P11447 LOCAL_ONLY: executable behavior regressions, no user image and no app writes.
// Requires Node 22 and TypeScript AST parser present in the tool environment.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.resolve(__dirname,'../app/src/main/assets/js/plan-import.js'),'utf8');
// Production functions in this IIFE are indented by exactly two spaces;
// their closing braces are on distinct "  }" lines. No npm dependency.
const functions = new Map();
function extractProductionFunction(name) {
  const identifiers = ["  function " + name + "(", "  async function " + name + "("];
  const starts = identifiers.map(x => source.indexOf(x)).filter(x=>x>=0);
  assert.equal(starts.length,1,`function definition ${name} unique`);
  const start=starts[0];
  const end=source.indexOf('\n  }',start);
  assert(end>start,`function body ${name} terminator`);
  const after=end+4;
  assert(['\n','\r',''].includes(source[after]||''),`function ${name} must close at IIFE scope`);
  return source.slice(start,after);
}
function sandbox(names, extra={}) {
 const body=names.map(extractProductionFunction).join('\n');
 const context=vm.createContext({
   cellText:v=>String(v??'').trim(),
   p11444Text:v=>String(v??'').normalize('NFC').replace(/\s+/gu,' ').trim(),
   performance:{now:()=>1},
   p109PerfWorkerRecord:()=>null,
   p109PerfWorkerSetParameters:(worker, phase, params)=>worker.setParameters(params),
   p109PerfWorkerRecognize:(worker, phase, canvas)=>worker.recognize(canvas),
   p109PerfRecognizeOneShot:async (phase, language, canvas, params)=>({data:{text:''}}),
   cropCanvasRegion:(canvas)=>canvas,
   exactCellEvidenceTransform:(canvas)=>canvas,
   sourceTruthCellCandidate:(t)=>String(t??'').trim(),
   textIntegrityCellCandidate:(t)=>String(t??'').trim(),
   cropCompanySourceEvidenceGrayscale:(canvas)=>canvas,
   window:{Tesseract:{}},
   ...extra
 });
 vm.runInContext(body+ '\nthis.testFunctions={' + names.join(',') + '};', context);
 return {ctx:context,...context.testFunctions};
}
let pos=0,neg=0;
function yes(x,msg){ assert.ok(x,msg);pos++ }
function no(x,msg){ assert.ok(!x,msg);neg++ }
(async()=>{
 const f=sandbox(['p11447TextCellOcrParameters','p11447ExactTextCellEligible']);
 for(const field of ['company','customer','flightLocation','pickup','destination']){
   yes(f.p11447TextCellOcrParameters(field,'7').tessedit_char_whitelist==='',`${field} unrestricted text`);
 }
 yes(f.p11447TextCellOcrParameters('arrivalFlight','8').tessedit_char_whitelist==='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789','flight retains limited chars');
 yes(f.p11447TextCellOcrParameters('persons','8').tessedit_char_whitelist==='0123456789','persons numeric strict');
 for(const sample of ['Get-E','Ab-c','Größe-5','A1-B2']) yes(f.p11447ExactTextCellEligible('company',sample),`mixed company ${sample} probed`);
 no(f.p11447ExactTextCellEligible('flightLocation','Get-E'),'hyphen eligibility is limited to company');
 no(f.p11447ExactTextCellEligible('company','A'.repeat(20)),'overlong source not promoted');
 no(f.p11447ExactTextCellEligible('company',''), 'empty source not promoted');
 // The setParameters call truly clears a sticky restriction on reused workers.
 const w=sandbox(['p109PerfWorkerSetParameters'], {p109PerfNewRecord:()=>null});
 const state={tessedit_char_whitelist:''}, changes=[];
 const worker={setParameters:async params=>{Object.assign(state,params);changes.push({...params})}};
 await w.p109PerfWorkerSetParameters(worker,'flight_column_integrity_ocr',{tessedit_char_whitelist:'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'});
 yes(state.tessedit_char_whitelist==='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789','flight whitelist deliberately set');
 await w.p109PerfWorkerSetParameters(worker,'text_integrity_ocr',{tessedit_pageseg_mode:'6'});
 yes(state.tessedit_char_whitelist==='','text clears sticky flight whitelist');
 await w.p109PerfWorkerSetParameters(worker,'price_targeted_ocr',{tessedit_pageseg_mode:'8',tessedit_char_whitelist:'0123456789,.€'});
 yes(state.tessedit_char_whitelist==='0123456789,.€','price restrict preserved');
 await w.p109PerfWorkerSetParameters(worker,'route_deu_column_ocr',{tessedit_pageseg_mode:'7'});
 yes(state.tessedit_char_whitelist==='','route clears numeric restriction');
 await w.p109PerfWorkerSetParameters(worker,'text_integrity_ocr',{tessedit_char_whitelist:'ABC'});
 yes(state.tessedit_char_whitelist==='ABC','explicit dedicated code whitelist preserved');
 let threw=false;try{ await w.p109PerfWorkerSetParameters({setParameters:async()=>{throw Error('ocr worker reset failed')}},'text_integrity_ocr',{}) }catch(e){threw=/reset failed/.test(e.message)}
 yes(threw,'failed worker parameter reset propagates instead of silently allowing OCR');
 // Real production exact-cell multi-view call, simulated worker encoding whitelist behavior.
 const e=sandbox(['p11447TextCellOcrParameters','exactCellMultiViewOcr']);
 const sourceCanvas={width:200,height:100}, processedCanvas={width:200,height:100};
 const calls=[];let params={tessedit_char_whitelist:'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'};
 const textWorker={
   setParameters:async p=>{params={...params,...p};calls.push({...p})},
   recognize:async()=>({data:{text:params.tessedit_char_whitelist?'GE':'Get-E'}})
 };
 const descriptor={left:15,right:60,column:4}, rowMeta={y0:10,y1:30};
 const exact=await e.exactCellMultiViewOcr(sourceCanvas,processedCanvas,descriptor,rowMeta,2,'company',textWorker,{left:18,right:58,top:12,bottom:28});
 yes(exact.length===6,'six exact same-cell OCR variants preserved');
 yes(exact.every(a=>a.candidate==='Get-E'),'all six company views may now read letters and hyphen');
 yes(calls.length===6 && calls.every(x=>x.tessedit_char_whitelist===''),'no uppercase-only whitelist in any company view');
 yes(exact.every(a=>a.sourceRow===2&&a.field==='company'&&a.cropQuality.neighborColumnIncluded===false),'no neighbor/cell identity loss');
 const disallowed=await e.exactCellMultiViewOcr(sourceCanvas,processedCanvas,{...descriptor,right:250},rowMeta,2,'company',textWorker);
 no(disallowed.length,'out-of-bounds exact source cell stays blocked');
 // Route: production-qualified original full-cell proof must be 2 modes, same
 // row/column, geometry clean, no trusted contradictory former OCR view.
 const r=sandbox(['p11444QualifiedCellReadings','p11444ResolveOneSourceCell'],{
   p11442RouteEditProof:(a,b)=>a!=='Marriott Seestern DUS'&&b==='Marriott Seestern DUS',
   p11444TrustedRouteProofObjects:new WeakSet(),
   timeToMinutes:()=>null, normalizeTime:v=>v,
   p11444SafeNote:()=>''
 });
 const q={fullCellIncluded:true,leftEdgeClipped:false,rightEdgeClipped:false,neighborColumnIncluded:false,targetCellGeometryConfirmed:true};
 const birth={verificationSource:'primary_full_image_cell_assignment',sourceRow:2,sourceColumn:5,rawOcr:'Marriott Seesten DUS'};
 const ride={sourceImageOcr:true,sourceRow:2,destination:'Marriott Seesten DUS',destinationOcrConflict:true,destinationOcrConflictCandidate:'Marriott Seestern DUS',imageCellEvidence:{destination:{sourceRow:2,sourceColumn:5,rawOcr:'Marriott Seesten DUS',primarySourceEvidence:birth,cropQuality:q,verificationAttempts:[],manualCheckRequired:true}}};
 const reads=['source-truth-full-cell-psm6','source-truth-full-cell-psm7'].map(mode=>({scope:'source_truth_full_cell',field:'destination',sourceRow:2,sourceColumn:5,mode,candidate:'Marriott Seestern DUS',cropQuality:q}));
 yes(Boolean(r.p11444QualifiedCellReadings(ride,'destination',reads)),'strict dual-source same-cell evidence qualifies');
 const blocked=r.p11444ResolveOneSourceCell(ride,'destination',reads);
 yes(blocked===ride && blocked.destinationOcrConflict,'pending manual evidence gate remains fail-closed');
 const verified={...ride,imageCellEvidence:{destination:{...ride.imageCellEvidence.destination,manualCheckRequired:false}}};
 const accepted=r.p11444ResolveOneSourceCell(verified,'destination',reads);
 yes(accepted.destination==='Marriott Seestern DUS' && accepted.destinationOcrConflict===false,'existing strict source-cell proof path still works with all gates met');
 no(Boolean(r.p11444QualifiedCellReadings({...verified,sourceRow:3},'destination',reads)),'wrong physical source row veto');
 no(Boolean(r.p11444QualifiedCellReadings(verified,'destination',[reads[0],{...reads[1],candidate:'Marriott Seesten DUS'}])),'independent OCR disagreement veto');
 no(Boolean(r.p11444QualifiedCellReadings(verified,'destination',[reads[0],{...reads[1],sourceColumn:6}])),'neighbor column substitution veto');
 no(Boolean(r.p11444QualifiedCellReadings(verified,'destination',[reads[0],{...reads[1],cropQuality:{...q,neighborColumnIncluded:true}}])),'dirty crop veto');
 no(Boolean(r.p11444QualifiedCellReadings({...verified,imageCellEvidence:{destination:{...verified.imageCellEvidence.destination,verificationAttempts:[{...reads[0],candidate:'Other Source'}]}}},'destination',reads)),'previous complete contradictory source veto');
 // P11447: the route review must use a real parameterized DEU worker,
 // never two Tesseract.js v5 one-shot calls with ignored PSM options.
 async function routeWorkerCase(options={}) {
   const active=[]; let created=0, terminated=0;
   const recognition=[];
   const mockWorker={
     ...(options.noParameters?{}:{setParameters:async params=>{active.push({...params})}}),
     recognize:async()=>({data:{text:options.disagree && active.at(-1)?.tessedit_pageseg_mode==='7'
       ? 'Marriott Seesten DUS' : 'Marriott Seestern DUS'}})
   };
   const local=sandbox([
     'p11447TextCellOcrParameters','sourceTruthFullCellTextOcr',
     'p11444QualifiedCellReadings','p11444ResolveOneSourceCell','p11444ReconcileSourceCells'
   ],{
     p11442RouteEditProof:(a,b)=>a==='Marriott Seesten DUS'&&b==='Marriott Seestern DUS',
     p11444TrustedRouteProofObjects:new WeakSet(),
     p109PerfCreateWorker:async()=>{created++;return mockWorker},
     p109PerfWorkerTerminate:async()=>{terminated++},
     p109PerfWorkerSetParameters:(worker,phase,params)=>worker.setParameters(params),
     p109PerfWorkerRecognize:(worker,phase,view)=>worker.recognize(view),
     timeToMinutes:()=>null, normalizeTime:()=>'',
     p11444SafeNote:()=>''
   });
   const source={width:200,height:100}, processed={width:200,height:100};
   const map={destination:5};
   const meta={width:200,height:100,boundaries:[0,10,20,30,40,55,130,170,200],
     rowMetaByMatrixIndex:[null,{y0:8,y1:25,cy:16}]};
   const input={...ride,imageCellEvidence:{destination:{...ride.imageCellEvidence.destination,
      manualCheckRequired:options.manual??false}},destinationOcrConflict:!options.noConflict};
   const rides = options.eighteen ? [input,...Array.from({length:17},(_,i)=>({
     ...input,sourceRow:i+3,destinationOcrConflict:false,company:i%2?'WT':'GetE',
     time:i<2?'08:15':`09:${String(i).padStart(2,'0')}`,
     vehicle:i===0?'Pkw':'Van',persons:i===0?1:7
   }))] : [input];
   const output=await local.p11444ReconcileSourceCells(rides,source,processed,meta,map);
   return {output,active,created,terminated,diagnostics:local.ctx.window.ATMSP11447RouteReviewDiagnostics};
 }
 const handled=await routeWorkerCase();
 yes(handled.output[0].destination==='Marriott Seestern DUS'&&!handled.output[0].destinationOcrConflict,'route source cell can be corrected only with configured worker and independent clean PSMs');
 yes(handled.created===1&&handled.terminated===1,'trusted route worker created and terminated exactly once');
 yes(handled.active.length===2&&handled.active.map(p=>p.tessedit_pageseg_mode).join(',')==='6,7','different PSM values explicitly applied to real worker');
 yes(handled.active.every(p=>p.tessedit_char_whitelist===''),'route text not truncated by inherited uppercase-only whitelist');
 no('destinationP11447ReviewDiagnostics' in handled.output[0],'route diagnostics not persisted with ride');
 const pending=await routeWorkerCase({manual:true});
 yes(pending.output[0].destinationOcrConflict,'unresolved manual-check gate still blocks route despite 2 clean reads');
 yes(pending.diagnostics.length===1&&pending.diagnostics[0].manualCheckRequired,'diagnostic identifies manual-check veto without changing source');
 const contradictory=await routeWorkerCase({disagree:true});
 no(contradictory.output[0].destination==='Marriott Seestern DUS','conflicting two-PSM source reads cannot repair route');
 const badWorker=await routeWorkerCase({noParameters:true});
 yes(badWorker.output[0].destinationOcrConflict,'worker without setParameters cannot certify independent source proof');
 yes(badWorker.created===1&&badWorker.terminated===1,'invalid worker is terminated without trust');
 const eighteen=await routeWorkerCase({eighteen:true});
 yes(eighteen.output.length===18,'all 18 independent source rows survive targeted route review');
 yes(eighteen.output[1].time===eighteen.output[2].time && eighteen.output[1].vehicle==='Pkw' && eighteen.output[2].vehicle==='Van',
   'true same-time distinct-vehicle trips remain separate');
 yes(eighteen.output.slice(1).every((ride,i)=>ride.sourceRow===i+3 && ride.destinationOcrConflict===false),
   'other 17 rows unchanged and not touched by unrelated source review');
 const noConflict=await routeWorkerCase({noConflict:true});
 yes(noConflict.created===0,'no needless extra OCR worker on already clean rows');
 // Stale same-string company conflict is NOT automatically accepted.
 const c=sandbox(['reconcileCompanyConflictAfterRepeatedConsistency'],{isHyphenatedCompanyEdgeProbe:()=>true});
 const unchanged=c.reconcileCompanyConflictAfterRepeatedConsistency([{company:'Get-E',companyOcrConflict:true,companyOcrConflictCandidate:'Get-E'}]);
 yes(unchanged[0].companyOcrConflict===true,'identical display candidate never silently clears source conflict');
 yes(source.includes('die angezeigte Nach-OCR ist identisch'),'UI explicitly explains same-string unresolved state');
 yes(source.includes('window.ATMSP11447RouteReviewDiagnostics.push('),'route veto diagnostics transient and available');
 no(source.includes('destinationP11447ReviewDiagnostics ='),'diagnostic source does not attach to ride or persistence');
 console.log(`P11447 LOCAL OCR EVIDENCE regression: PASS ${pos} positive / ${neg} negative tests; Samsung original image E2E NOT tested`);
})().catch(error=>{console.error(error);process.exitCode=1});
