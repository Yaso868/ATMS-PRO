'use strict';
const a=require('node:assert/strict');const pix=require(process.env.ATMS_H19_NATIVE+'/app/src/main/assets/js/h19-pixel-review.js');
const drafts=require(process.env.ATMS_H19_NATIVE+'/app/src/main/assets/js/h15-ride-drafts.js');
const bounds=[0,96,166,406,616,767,860,930,1030,1102,1164,1264,1434,1535];
const grid={accepted:true,pitch:31,bands:Array.from({length:14},(_,i)=>({y0:68+31*i,y1:99+31*i,fullyBounded:true})),openTail:{y0:503,y1:534,fullyBounded:false}};
// Make original pixel bands contiguous, exactly matching WA0024 physical grid.
grid.bands[grid.bands.length-1].y1=503;
const col={accepted:true,header:{accepted:true},body:{accepted:true},boundaries:bounds};
const words=[{text:'12:30',bbox:{x0:110,y0:75,x1:150,y1:91}},
 {text:'OCR',bbox:{x0:200,y0:105,x1:235,y1:118}},
 {text:'CROSS',bbox:{x0:80,y0:75,x1:115,y1:90}},
 {text:'Y',bbox:{x0:200,y0:123,x1:232,y1:135}},
 {text:'TAIL',bbox:{x0:200,y0:507,x1:242,y1:523}},
 {text:'HEADER',bbox:{x0:200,y0:38,x1:244,y1:49}}];
const args={rowGrid:grid,columnGrid:col,words,sourceWidth:1536,sourceHeight:534,ocrWidth:1536,ocrHeight:534};
let n=0;
const ok=pix.build(args);a.ok(ok);n++;
a.equal(ok.reviewRows.length,14);n++;
a.equal(ok.reviewRows[0].length,13);n++;
a.equal(ok.reviewRows[0][1],'12:30');n++;
a.equal(ok.reviewRows[0][0],'');n++;
a.equal(ok.reviewRows[1][2],'OCR');n++;
a.equal(ok.reviewRows[1][2].includes('CROSS'),false);n++;
a.equal(ok.reviewRows[1][2].includes('Y'),false);n++;
a.equal(ok.excludedWords,4);n++;
a.equal(ok.mayImport,false);n++;
a.equal(ok.canPersist,false);n++;
a.equal(ok.complete,false);n++;
a.equal(ok.physicalMappingVerified,false);n++;
a.equal(ok.verifiedTextCells,0);n++;
a.equal(Object.isFrozen(ok.reviewRows[0]),true);n++;
a.equal(Object.isFrozen(ok.boundaries),true);n++;
const reject=(o,msg)=>{a.equal(pix.build({...args,...o}),null,msg);n++};
reject({rowGrid:{...grid,accepted:false}},'unaccepted pixel grid');
reject({columnGrid:{...col,accepted:false}},'unaccepted column evidence');
reject({columnGrid:{...col,boundaries:bounds.slice(1)}},'12 columns');
reject({columnGrid:{...col,boundaries:[...bounds.slice(0,2),96,...bounds.slice(3)]}},'crossed/repeated vertical rule');
reject({rowGrid:{...grid,openTail:null}},'no confirmed open tail');
reject({rowGrid:{...grid,openTail:{y0:503,y1:534,fullyBounded:true}}},'closed tail');
reject({rowGrid:{...grid,bands:grid.bands.slice(0,7).concat(grid.bands.slice(8))}},'noncontiguous raster');
reject({rowGrid:{...grid,bands:grid.bands.map((b,i)=>i===5?{...b,fullyBounded:false}:b)}},'broken physical band');
reject({words:[{text:'CROSS',bbox:{x0:80,y0:75,x1:115,y1:90}}]},'no unambiguous word');
reject({words:[]},'no OCR evidence');
reject({sourceWidth:1500},'source boundary conflict');
reject({ocrWidth:10},'unreasonable OCR dimensions');
reject({columnGrid:{...col,body:{accepted:false}}},'body unproven');
reject({rowGrid:{...grid,openTail:{y0:502,y1:534,fullyBounded:false}}},'tail top mismatch');
reject({sourceHeight:535},'source height conflict');
const issue={version:'H12_LOCAL_REVIEW_BLOCK',boundedMissing:0,openTailMissing:1,requiresExplicitReview:true,mayImport:false,verifiedCellValues:0,
 reviewGeometry:{sourceWidth:1536,sourceHeight:534,top:503,bottom:534,fullyBounded:false,pixelGeometryOnly:true,verifiedTextCells:0,boundaries:bounds},reviewRows:ok.reviewRows,
 reviewPixelFallback:{version:ok.version,sourceMatrixColumns:10,assignedWords:ok.assignedWords,excludedWords:ok.excludedWords,observedCells:ok.observedCells,physicalMappingVerified:false,mayImport:false,canPersist:false,verifiedTextCells:0}};
const source={name:'WA0024.jpg',size:233480,lastModified:100,type:'image/jpeg'};
let d=drafts.create(issue,source);a.ok(d);n++;a.equal(d.rows.length,15);n++;a.equal(d.sourcePixelReviewOnly,true);n++;
a.equal(d.rows[0].cells[1].raw,'12:30');n++;
a.equal(d.rows[0].cells[1].confirmed,false);n++;
a.equal(d.rows[14].status,'open_tail_blocked');n++;
a.equal(d.mayImport,false);n++;
a.equal(d.canPersist,false);n++;
a.equal(d.complete,false);n++;
a.equal(d.physicalMappingVerified,false);n++;
const edited=drafts.updateTail(d,1,'23:55',true);a.ok(edited);n++;a.equal(edited.rows[14].cells[1].confirmed,true);n++;a.equal(edited.mayImport,false);n++;a.equal(edited.complete,false);n++;
a.equal(d.rows[14].cells[1].confirmed,false);n++;
const forged={...issue,reviewPixelFallback:{...issue.reviewPixelFallback,mayImport:true}};a.equal(drafts.create(forged,source),null);n++;
const forgedCol={...issue,reviewPixelFallback:{...issue.reviewPixelFallback,sourceMatrixColumns:13}};a.equal(drafts.create(forgedCol,source),null);n++;
console.log('H19 FAIL-CLOSED ORIGINAL PIXEL CELL REVIEW PASS '+n+'/'+n);
