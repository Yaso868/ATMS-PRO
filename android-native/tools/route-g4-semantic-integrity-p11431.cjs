#!/usr/bin/env node
'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),crypto=require('crypto');
const srcPath=process.argv[2];
if(!srcPath) throw Error('Usage: node route_guard_regression.cjs <plan-import.js>');
const src=fs.readFileSync(srcPath,'utf8');
function functionSource(name) {
 const list=['function ','async function '];
 const starts=list.map(prefix=>src.indexOf(`  ${prefix}${name}(`)).filter(x=>x>=0);
 assert.strictEqual(starts.length,1,`source function uniquely exists: ${name}`);
 const a=starts[0],b=src.indexOf('\n  }\n',a);
 assert(b>a,`source function complete: ${name}`);
 return src.slice(a,b+5);
}
const functions=[
 'routeOcrText','routeOcrBase','missingRouteCandidate','rawRouteEvidenceItemsForCell',
 'routeOcrDistance','routeHasLatinDiacritic','routeChangedDiacriticTokenIsSafe',
 'routeChangedTokenPrimaryConfidence','rawRouteEvidenceItemsForCell','strongPrimaryRouteSecondaryEdgeDegradation',
 'routeSecondaryEdgeDecision','routeG4SemanticDecision','provenOriginalInnAgainstSecondaryInr','recoverRouteDiacriticsTargeted','markZeroSilentErrorIntegrity'];
const realFunctions=functions.map(functionSource).join('\n\n');
let testCount=0;
const pref=()=>String(process.env.ATMS_TEST_TYPE||'').toUpperCase();
const tests=[
 {id:'P00',name:'Mimoun 20:00 Inn->Inr original protected with no false block',original:'NH Nord-Holiday Inn',secondary:'NH Nord-Holiday Inr',confidence:93.8,wordConfidence:96,expected:'NH Nord-Holiday Inn',conflict:false,ignored:true},
 {id:'N02',name:'internal letter first token DUS->XUS',original:'Marriott Seestern DUS',secondary:'Marriott Seestern XUS',confidence:94,wordConfidence:96,expected:'Marriott Seestern DUS',conflict:true},
 {id:'N03',name:'internal word Holiday->Horiday',original:'NH Nord-Holiday Inn',secondary:'NH Nord-Horiday Inn',confidence:95,wordConfidence:96,expected:'NH Nord-Holiday Inn',conflict:true},
 {id:'N04',name:'last word insertion Inn->Innn',original:'NH Nord-Holiday Inn',secondary:'NH Nord-Holiday Innn',confidence:95,wordConfidence:96,expected:'NH Nord-Holiday Inn',conflict:true},
 {id:'N05',name:'word confidence weak 42',original:'NH Nord-Holiday Inn',secondary:'NH Nord-Holiday Inr',confidence:94,wordConfidence:42,expected:'NH Nord-Holiday Inn',conflict:true},
 {id:'N06',name:'cell confidence weak 65',original:'NH Nord-Holiday Inn',secondary:'NH Nord-Holiday Inr',confidence:65,wordConfidence:96,expected:'NH Nord-Holiday Inn',conflict:true},
 {id:'N07',name:'missing changed-word geometry',original:'NH Nord-Holiday Inn',secondary:'NH Nord-Holiday Inr',confidence:94,wordConfidence:null,expected:'NH Nord-Holiday Inn',conflict:true},
 {id:'N08',name:'clipped original cell',original:'NH Nord-Holiday Inn',secondary:'NH Nord-Holiday Inr',confidence:94,wordConfidence:96,fullCellIncluded:false,expected:'NH Nord-Holiday Inn',conflict:true},
 {id:'N09',name:'original raw disagrees with current value and candidate',original:'NH Nord-Holiday Inn',secondary:'NH Nord-Holiday Inr',confidence:94,wordConfidence:96,rawPrimary:'NH Nord-Holiday ABC',expected:'NH Nord-Holiday Inn',conflict:true},
 {id:'N10a',name:'threshold cell confidence 84.99',original:'NH Nord-Holiday Inn',secondary:'NH Nord-Holiday Inr',confidence:84.99,wordConfidence:96,expected:'NH Nord-Holiday Inn',conflict:true},
 {id:'N10b',name:'threshold cell confidence 85.00 insufficient',original:'NH Nord-Holiday Inn',secondary:'NH Nord-Holiday Inr',confidence:85,wordConfidence:96,expected:'NH Nord-Holiday Inn',conflict:true,source:'strong_primary_terminal_glyph_vs_four_secondary_reads'},
 {id:'N11',name:'single-word named place',original:'Marriott',secondary:'Marriotr',confidence:94,wordConfidence:96,expected:'Marriott',conflict:true},
 {id:'P01',name:'Marriott right-edge truncation DU',original:'Marriott Seestern DUS',secondary:'Marriott Seestern DU',confidence:94,wordConfidence:90,expected:'Marriott Seestern DUS',conflict:false,edgeIgnored:true},
 {id:'P02',name:'matching original and secondary OCR',original:'NH Nord-Holiday Inn',secondary:'NH Nord-Holiday Inn',confidence:94,wordConfidence:96,expected:'NH Nord-Holiday Inn',conflict:false},
 {id:'P03',name:'independently strong geometric original supports second candidate',original:'Marriott Seestern XUS',secondary:'Marriott Seestern DUS',rawPrimary:'Marriott Seestern DUS',confidence:96,wordConfidence:96,expected:'Marriott Seestern DUS',conflict:false},
 {id:'P04',name:'safe diacritic Cafe->Café',original:'Cafe Zentrum',secondary:'Café Zentrum',confidence:93,wordConfidence:96,expected:'Café Zentrum',conflict:false},
 {id:'P05',name:'second strong Inn with secondary Inr no false block',original:'NH Nord-Holiday Inn',secondary:'NH Nord-Holiday Inr',confidence:94,wordConfidence:96,expected:'NH Nord-Holiday Inn',conflict:false,ignored:true},
 {id:'N12',name:'original Inn vs secondary Inm remains blocked',original:'NH Nord-Holiday Inn',secondary:'NH Nord-Holiday Inm',confidence:94,wordConfidence:96,expected:'NH Nord-Holiday Inn',conflict:true,source:'strong_primary_terminal_glyph_vs_four_secondary_reads'},
 {id:'N13',name:'original Inr against Inn never waived',original:'NH Nord-Holiday Inr',secondary:'NH Nord-Holiday Inn',confidence:94,wordConfidence:96,expected:'NH Nord-Holiday Inr',conflict:true,source:'strong_primary_terminal_glyph_vs_four_secondary_reads'},
 {id:'N14',name:'primary cell confidence 89.99 insufficient',original:'NH Nord-Holiday Inn',secondary:'NH Nord-Holiday Inr',confidence:89.99,wordConfidence:96,expected:'NH Nord-Holiday Inn',conflict:true,source:'strong_primary_terminal_glyph_vs_four_secondary_reads'},
 {id:'P14',name:'primary cell confidence 90.00 accepted',original:'NH Nord-Holiday Inn',secondary:'NH Nord-Holiday Inr',confidence:90,wordConfidence:96,expected:'NH Nord-Holiday Inn',conflict:false,ignored:true},
 {id:'N15',name:'word confidence 94.99 insufficient',original:'NH Nord-Holiday Inn',secondary:'NH Nord-Holiday Inr',confidence:94,wordConfidence:94.99,expected:'NH Nord-Holiday Inn',conflict:true,source:'strong_primary_terminal_glyph_vs_four_secondary_reads'},
 {id:'P15',name:'word confidence 95.00 accepted',original:'NH Nord-Holiday Inn',secondary:'NH Nord-Holiday Inr',confidence:94,wordConfidence:95,expected:'NH Nord-Holiday Inn',conflict:false,ignored:true},
 {id:'N16',name:'competing original image Inr word blocks suppression',original:'NH Nord-Holiday Inn',secondary:'NH Nord-Holiday Inr',confidence:94,wordConfidence:96,competingWord:'Inr',expected:'NH Nord-Holiday Inn',conflict:true,source:'strong_primary_terminal_glyph_vs_four_secondary_reads'},
 {id:'N17',name:'duplicate original Inn word is ambiguous',original:'NH Nord-Holiday Inn',secondary:'NH Nord-Holiday Inr',confidence:94,wordConfidence:96,competingWord:'Inn',expected:'NH Nord-Holiday Inn',conflict:true,source:'strong_primary_terminal_glyph_vs_four_secondary_reads'},
 {id:'N18',name:'word bounding box outside cell inner edge',original:'NH Nord-Holiday Inn',secondary:'NH Nord-Holiday Inr',confidence:94,wordConfidence:96,wordX1:1177.9,expected:'NH Nord-Holiday Inn',conflict:true,source:'strong_primary_terminal_glyph_vs_four_secondary_reads'},
 {id:'N19',name:'word bounding box spills above row',original:'NH Nord-Holiday Inn',secondary:'NH Nord-Holiday Inr',confidence:94,wordConfidence:96,wordY0:140,expected:'NH Nord-Holiday Inn',conflict:true,source:'strong_primary_terminal_glyph_vs_four_secondary_reads'},
 {id:'N20',name:'prior conflict remains blocking',original:'NH Nord-Holiday Inn',secondary:'NH Nord-Holiday Inr',confidence:94,wordConfidence:96,priorConflict:true,expected:'NH Nord-Holiday Inn',conflict:true,source:'strong_primary_terminal_glyph_vs_four_secondary_reads'},
 {id:'N21',name:'prior manual check remains blocking',original:'NH Nord-Holiday Inn',secondary:'NH Nord-Holiday Inr',confidence:94,wordConfidence:96,manualCheck:true,expected:'NH Nord-Holiday Inn',conflict:true,source:'strong_primary_terminal_glyph_vs_four_secondary_reads'},
 {id:'N22',name:'different place with Inn token must remain blocked',original:'NH Nord-Holiday Inn',secondary:'NH Nord-Horiday Inr',confidence:94,wordConfidence:96,expected:'NH Nord-Holiday Inn',conflict:true},
 {id:'P06',name:'different OCR votes do not silently replace',original:'NH Nord-Holiday Inn',secondary:'NH Nord-Holiday Inr',confidence:94,wordConfidence:96,secondaryColumn6:'NH Nord-Holiday Inn',expected:'NH Nord-Holiday Inn',conflict:false}
];
async function run(t) {
 const originals=t.original?.split(/\s+/)||[],last=originals[originals.length-1]||'';
 let localCalls=0;
 const secondary=t.secondary;
 const copy=(value)=>JSON.parse(JSON.stringify(value));
 const ctx={
 console,window:{Tesseract:{}},cellText:v=>String(v??'').trim(),looksLikeTime:()=>false,looksLikeFlight:()=>false,
 $:()=>null,cropCanvasRegion:()=>({}),
 imageMetaTag:'isolated historical & Samsung evidence OCR replay: synthetic OCR engine',
 ocrIntegrityCore:{
  leftEdgeTextDegradation:()=>null,
  rightEdgeTextDegradation:(primary,candidate)=>
   primary==='Marriott Seestern DUS'&&candidate==='Marriott Seestern DU'
   ? {commonLength:20,coverage:1} : null,
  edgeGlyphTextDegradation:()=>null
 },
 cellEvidenceRawValue:(e,k)=>e?.[k]?.rawOcr||'',
 provenRouteLeftClipAtMatrixBoundary:()=>null,
 provenStrongOnePeerLeftClip:()=>null,
 routeWordsBySourceRow:(result,top,scale,rows)=>new Map(rows.map(row=>[
  row.sourceRow,result?.mode?.field==='pickup' ? 'DUS Airport' : (result?.mode?.mode==='deu-column-psm6' && t.secondaryColumn6 ? t.secondaryColumn6 : secondary)])),
 p109SharedOcrRecognize:async(stage,lang,crop,options,params)=>({mode:{field:params.field,mode:params.mode}}),
 p109SharedOcrWithWorker:async(lang,callback)=>callback({setParameters:async()=>{}}),
 p109PerfWorkerSetParameters:async()=>{},
 p109PerfWorkerRecognize:async(worker,stage,crop,metadata)=>{localCalls++;return {data:{text:metadata.field==='destination'?secondary:'DUS Airport'}};},
 flightCandidatesFromRow:()=>[],normalizeVehicleBoundaryOcrNoise:()=>'',parseNumber:()=>null,uniqueClockCandidateFromCell:()=>'',
 normalizeTime:()=>'',timeToMinutes:()=>null,normalizeDriverCandidate:()=>'',cleanKey:v=>String(v??'').toLowerCase()
 };
 vm.createContext(ctx);
 vm.runInContext(realFunctions+'\nthis.__test= {recoverRouteDiacriticsTargeted,markZeroSilentErrorIntegrity};',ctx,{filename:'P11432_actual_route_functions',timeout:10000});
 const p={fullCellIncluded:t.fullCellIncluded??true,leftEdgeClipped:false,rightEdgeClipped:false,neighborColumnIncluded:false};
 const srcRaw=t.rawPrimary ?? t.original;
 const destinationEvidence={rawOcr:srcRaw,normalizedValue:srcRaw,verificationSource:'primary_full_image_cell_assignment',geometryConfidence:'high',confidence:t.confidence,wordCount:originals.length,manualCheckRequired:Boolean(t.manualCheck),cropQuality:p};
 const ride={sourceRow:2,pickup:'DUS Airport',destination:t.original,
 imageCellEvidence:{destination:destinationEvidence},...(t.priorConflict?{destinationOcrConflict:true}: {})};
 const imgMeta={boundaries:[0,779.25,1178.25],rowMetaByMatrixIndex:{1:{y0:141,y1:184,cy:162}},rawOcrWords:[]};
 if (t.wordConfidence!==null && last.length>=3) imgMeta.rawOcrWords.push({text:last,x0:1127,x1:t.wordX1??1174,y0:t.wordY0??149,y1:169,confidence:t.wordConfidence});
 if(t.competingWord) imgMeta.rawOcrWords.push({text:t.competingWord,x0:1127,x1:1174,y0:149,y1:169,confidence:96});
 const rides=await ctx.__test.recoverRouteDiacriticsTargeted([ride],{},imgMeta,{pickup:0,destination:1});
 const a=rides[0];
 assert.strictEqual(a.destination,t.expected,t.name);
 assert.strictEqual(Boolean(a.destinationOcrConflict),Boolean(t.conflict),t.name+': conflict gating');
 if(t.conflict){assert.strictEqual(a.destinationOcrConflictCandidate,secondary);assert.strictEqual(a.destinationOcrConflictEvidence?.reason,t.source||'semantic_change_without_matching_source_cell');
 assert.strictEqual(a.destinationRecoveredFromTargetedOcr,undefined);assert.strictEqual(a.destinationTargetedOcrAttempts.length,4);assert.strictEqual(localCalls,2);}
 if(t.ignored){
  assert.strictEqual(a.destinationOcrSecondaryTerminalGlyphNoiseIgnored,true,t.name+': ignored trace');
  assert.strictEqual(a.destinationOcrSecondaryTerminalGlyphNoiseEvidence.primaryWordConfidence,t.wordConfidence);
  assert.equal(a.destinationRecoveredFromTargetedOcr,undefined);assert.equal(a.destinationTargetedOcrAttempts.length,4);assert.equal(localCalls,2);
  const [checked]=ctx.__test.markZeroSilentErrorIntegrity([{...a,sourceImageOcr:true,price:35}]);
  assert.equal(checked.importIntegrityStatus,'ok',t.name+': final import-integrity gate must not falsely block');
  assert.equal(checked.destination,'NH Nord-Holiday Inn');assert.equal(checked.price,35,'price untouched by route correction');
 }
 if(t.edgeIgnored){assert.strictEqual(a.destinationOcrSecondaryRawEdgeNoiseIgnored,true);assert.strictEqual(a.destinationTargetedOcrAttempts.length,2);assert.strictEqual(localCalls,0);}
 assert.strictEqual(a.pickup,'DUS Airport',t.name+': independent pickup unchanged');
 testCount++;
 console.log('PASS '+testCount+' '+t.name);
}
(async()=>{
 for(const t of tests)await run(t);
 // Actual validated pipeline includes the existing error gate.
 assert(src.includes('if (!ride[`${field}OcrConflict`]) return;') && src.includes("kind: 'route_ocr'") && src.includes('blockingNonFlightIssues(validate(state.rides))'),
 'route conflict must flow through validation and pre-import blocking');
 testCount++;console.log('PASS '+testCount+' route-ocr validation + pre-import gate still wired');
 // Price and other OCR implementations are not modified by the surgical patch.
 assert(src.includes('recoverSuspiciousPricesTargeted('),'price OCR remains present');
 testCount++;console.log('PASS '+testCount+' existing price OCR entrypoint remains intact');
 console.log(`RESULT ${testCount}/${testCount} LOCAL SOURCE-CODE REPLAY TESTS PASS (${pref()}, no real Android OCR, no build)`);
})().catch(e=>{console.error('FAIL '+e.stack);process.exitCode=1});
