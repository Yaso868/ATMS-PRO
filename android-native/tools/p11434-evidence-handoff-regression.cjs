#!/usr/bin/env node
'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const src=fs.readFileSync(process.argv[2]||'app/src/main/assets/js/plan-import.js','utf8');
function fn(name) {
  const found=['function ','async function '].map(p=>src.indexOf('  '+p+name+'(')).filter(x=>x>=0);
  assert.equal(found.length,1,'unique production function '+name);
  const end=src.indexOf('\n  }\n',found[0]);assert(end>found[0]);
  return src.slice(found[0],end+5);
}
const funcs=['routeOcrText','routeOcrBase','routeG4SemanticDecision','routeG4VerifiedFinalHandoff',
'isHyphenatedCompanyEdgeProbe','sourceTruthCellCandidate','sourceTruthFullCellConsensus',
'adaptiveCompanyTailConsensus','singleInternalCompanyDelimiterLoss','edgeTableGlyphNoise',
'sourceTruthExpandedCellConsensus','verifiedCompanySourceReconciliation',
'groundedCompanySourceOpposition','reconcileCompanyConflictAfterRepeatedConsistency'];
const ctx={console, cellText:v=>String(v??'').trim(),textIntegrityCellCandidate:v=>String(v??'').trim(),
 routeOcrDistance:(a,b)=>Math.abs(a.length-b.length)};
vm.createContext(ctx);
vm.runInContext(funcs.map(fn).join('\n')+'\nthis.TEST={'+funcs.join(',')+'};',ctx);
const T=ctx.TEST;
let n=0;function check(title,good){assert(good,title);n++;console.log('PASS '+n+' '+title)}
// Route: weak primary, but two distinct column and two local OCR strategies; all same cell.
const quality={fullCellIncluded:true,leftEdgeClipped:false,rightEdgeClipped:false,neighborColumnIncluded:false,targetCellGeometryConfirmed:true};
const cell={rawOcr:'DUSAipot',confidence:53.4,geometryConfidence:'high',verificationSource:'primary_full_image_cell_assignment',sourceRow:2,sourceColumn:7,cropQuality:quality};
const proof={sourceRow:2,sourceColumn:7,originalValue:'DUSAipot',approvedValue:'DUS Airport',columnVotes:2,localCandidates:['DUS Airport','DUS Airport'],changedRawWordInCell:true,changedRawWordConfidence:45};
const ride={sourceRow:2,destination:'DUS Airport',destinationG4SourceDecisionProof:proof};
const hand=(r=ride,c=cell,from='DUSAipot',to='DUS Airport')=>T.routeG4VerifiedFinalHandoff(r,'destination',c,from,to);
check('final G4 replays verified weak original four-view approval',hand()===true);
check('P11433 final gate previously lost corroboration',T.routeG4SemanticDecision('DUSAipot','DUS Airport',cell).allow===false);
check('missing proof remains blocked',hand({...ride,destinationG4SourceDecisionProof:null})===false);
check('different source row remains blocked',hand({...ride,sourceRow:3})===false);
check('different source column remains blocked',hand(ride,{...cell,sourceColumn:8})===false);
check('changed final route value remains blocked',hand(ride,cell,'DUSAipot','DUS Terminal')===false);
check('changed raw OCR remains blocked',hand(ride,{...cell,rawOcr:'DUS Terminal'})===false);
check('strong primary remains protected',hand(ride,{...cell,confidence:90})===false);
check('missing in-cell original word evidence remains blocked',hand({...ride,destinationG4SourceDecisionProof:{...proof,changedRawWordInCell:false}})===false);
check('clipped cell remains blocked',hand(ride,{...cell,cropQuality:{...quality,leftEdgeClipped:true}})===false);
check('one local OCR vote differs remains blocked',hand({...ride,destinationG4SourceDecisionProof:{...proof,localCandidates:['DUS Airport','DUS Terminal']}})===false);
check('non weak raw word confidence remains blocked',hand({...ride,destinationG4SourceDecisionProof:{...proof,changedRawWordConfidence:70}})===false);
check('different source text remains blocked',hand(ride,cell,'DUS Airport','DUS Airport')===false);
// No airport, hotel or flight-specific exemption.
const otherCell={...cell,rawOcr:'Seeslern'};
const otherProof={...proof,originalValue:'Seeslern',approvedValue:'Seestern',localCandidates:['Seestern','Seestern']};
check('generic place works with same narrow evidence',hand({...ride,destination:'Seestern',destinationG4SourceDecisionProof:otherProof},otherCell,'Seeslern','Seestern')===true);
// Firm: 1 original full-image primary + 2 qualified FULL + 2 ADAPTIVE OCR modes.
const makeAttempt=(scope,mode,val='Get-E',options={})=>({scope,mode,field:'company',candidate:val,sourceRow:16,sourceColumn:11,cropQuality:{...quality},...options});
const full=[makeAttempt('source_truth_full_cell','psm6'),makeAttempt('source_truth_full_cell','psm7')];
const adaptive=[makeAttempt('source_truth_adaptive_company','psm6'),makeAttempt('source_truth_adaptive_company','psm7')];
const birth={verificationSource:'primary_full_image_cell_assignment',rawOcr:'Get-E',confidence:87.2,sourceRow:16,sourceColumn:11,cropQuality:{...quality}};
const makeRide=(attempts=[...full,...adaptive],extras={})=>({sourceRow:16,company:'Get-E',companyOcrConflict:true,companyOcrConflictCandidate:'GetE',imageCellEvidence:{company:{sourceColumn:11,primarySourceEvidence:{...birth},verificationAttempts:attempts,manualCheckRequired:true}},...extras});
const run=ride=>T.reconcileCompanyConflictAfterRepeatedConsistency([ride])[0];
check('one grounded company row can resolve four-view delimiter loss without peer majority',run(makeRide()).companyOcrConflict===false);
check('qualified company proof records reason',run(makeRide()).companyOcrSecondaryEdgeNoiseEvidence.reason==='post_consensus_company_qualified_source_families');
check('without full-cell family conflict remains',run(makeRide(adaptive)).companyOcrConflict===true);
check('without adaptive family conflict remains',run(makeRide(full)).companyOcrConflict===true);
check('single full mode never supplies two source votes',run(makeRide([full[0],...adaptive])).companyOcrConflict===true);
check('single adaptive mode never supplies two source votes',run(makeRide([...full,adaptive[0]])).companyOcrConflict===true);
check('full-cell wrong row is excluded',run(makeRide([{...full[0],sourceRow:15},full[1],...adaptive])).companyOcrConflict===true);
check('full-cell wrong column is excluded',run(makeRide([{...full[0],sourceColumn:10},full[1],...adaptive])).companyOcrConflict===true);
check('neighbor-contaminated full-cell vote excluded',run(makeRide([{...full[0],cropQuality:{...quality,neighborColumnIncluded:true}},full[1],...adaptive])).companyOcrConflict===true);
check('unverified full-cell geometry excluded',run(makeRide([{...full[0],cropQuality:{...quality,targetCellGeometryConfirmed:false}},full[1],...adaptive])).companyOcrConflict===true);
check('primary weak glyph stays blocked',run(makeRide([...full,...adaptive],{imageCellEvidence:{company:{sourceColumn:11,primarySourceEvidence:{...birth,confidence:50},verificationAttempts:[...full,...adaptive]}}})).companyOcrConflict===true);
check('original company raw must match current',run(makeRide([...full,...adaptive],{imageCellEvidence:{company:{sourceColumn:11,primarySourceEvidence:{...birth,rawOcr:'GetG'},verificationAttempts:[...full,...adaptive]}}})).companyOcrConflict===true);
const opposing=makeAttempt('source_truth_full_cell','opposition','GetE');
check('one clean contradictory full-cell source vetoes',run(makeRide([...full,...adaptive,opposing])).companyOcrConflict===true);
const opposeCell=[makeAttempt('cell_view','modeA','GetE'),makeAttempt('cell_view','modeB','GetE')];
check('two contradictory exact-cell views veto',run(makeRide([...full,...adaptive,...opposeCell])).companyOcrConflict===true);
check('unqualified peer-free GetE conflict stays blocked',run(makeRide([])).companyOcrConflict===true);
check('arbitrary semantic change Get-E/GetZ stays blocked',run({...makeRide(),companyOcrConflictCandidate:'GetZ'}).companyOcrConflict===true);
// generic alternative hyphen token, not an exception list
const gener={...makeRide(),company:'AB-C',companyOcrConflictCandidate:'ABC',imageCellEvidence:{company:{sourceColumn:11,primarySourceEvidence:{...birth,rawOcr:'AB-C'},verificationAttempts:[...full,...adaptive].map(a=>({...a,candidate:'AB-C'})),manualCheckRequired:true}}};
check('same proof works for generic internal hyphen company',run(gener).companyOcrConflict===false);
check('original input company kept byte-for-byte',run(makeRide()).company==='Get-E');
check('existing price OCR function still present',src.includes('async function recoverSuspiciousPricesTargeted('));
check('strict price recovery vote gate still present',src.includes("priceTargetedOcrDecision = 'fewer_than_two_matching_votes'"));
check('price raw evidence is read-only diagnostic',src.includes("for (const field of ['price', 'company'])"));
check('G4 final gate actually calls provenance handoff',src.includes('if (routeG4VerifiedFinalHandoff(ride, field, originalCell, sourceRaw, finalValue)) return;'));
check('G4 provenance actually recorded at source gate',src.includes('ride[`${descriptor.field}G4SourceDecisionProof`] = {'));
check('import gate remains blocked on company OCR conflict',src.includes('companyOcrConflict')&&src.includes('ap01ImportBlockers()'));
check('preview-only import suppression retained',src.includes('if (state.previewOnlyAnalysis)'));
check('full-cell OCR producer binds physical company source column',src.includes("sourceColumn: Number(descriptor.column), field, viewRegion: 'full_cell'"));
check('price and company diagnostics labeled independently',src.includes("item.kind === 'price' ? 'Preis'")&&src.includes("item.kind === 'company' ? 'Firma'"));
console.log(`P11434 RESULT ${n}/${n} source-function / synthetic evidence tests PASS`);
