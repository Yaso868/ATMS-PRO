/* ATMS H14: H13 review + transient local OCR suggestions and blocked matrix. NEVER PERSISTS OR IMPORTS. */
(function (global) {
  'use strict';
  const labels = Object.freeze([
    'Preis','Uhrzeit','Von','Nach','Kunde (Name)','Firma','Uhrzeit (zweite)',
    'Flugnummer','Fahrzeug (Wg)','Personen (Pers)','Flugzeit','Flugort (Ort)','Fahrer (letzte Spalte)'
  ]);
  let epoch = 0;
  let memory = null;
  let activeRoot = null;
  let activeWorker = null;
  const MAX_ROWS = 100;
  const MAX_TEXT = 300;
  const cleanOcrText = value => typeof value === 'string' ? value.replace(/\s+/g,' ').trim().slice(0,MAX_TEXT) : '';
  function validateRows(issue) {
    const rows = issue?.reviewRows;
    if (!Array.isArray(rows) || rows.length < 1 || rows.length > MAX_ROWS ||
      !rows.every(row => Array.isArray(row) && row.length === 13 &&
        row.every(v => typeof v === 'string' && v.length <= MAX_TEXT))) return null;
    return rows;
  }
  const safeInt = (v) => Number.isSafeInteger(v) && v >= 0;
  function validate(issue) {
    if (!issue || issue.version !== 'H12_LOCAL_REVIEW_BLOCK' ||
      issue.requiresExplicitReview !== true || issue.mayImport !== false ||
      issue.verifiedCellValues !== 0 || !safeInt(issue.boundedMissing) ||
      !safeInt(issue.openTailMissing) || issue.openTailMissing !== 1 ||
      issue.boundedMissing !== 0) return null;
    const g = issue.reviewGeometry;
    if (!g || g.pixelGeometryOnly !== true || g.fullyBounded !== false ||
      g.verifiedTextCells !== 0 || !safeInt(g.sourceWidth) || !safeInt(g.sourceHeight) ||
      g.sourceWidth < 500 || g.sourceWidth > 2200 ||
      g.sourceHeight < 110 || g.sourceHeight > 3600 ||
      !safeInt(g.top) || !safeInt(g.bottom) || g.bottom !== g.sourceHeight ||
      g.top <= 0 || g.top >= g.bottom - 10 || g.bottom - g.top > 80 ||
      !Array.isArray(g.boundaries) || g.boundaries.length !== 14 ||
      !g.boundaries.every(safeInt) || g.boundaries[0] > 2 ||
      g.sourceWidth - g.boundaries[13] > 2 ||
      g.boundaries.some((v,i) => i > 0 && v - g.boundaries[i-1] <= 34)) return null;
    return g;
  }
  function el(tag, parent, text, attrs) {
    const node = document.createElement(tag);
    if (text !== undefined && text !== null) node.textContent = String(text);
    for (const [key,val] of Object.entries(attrs || {})) node.setAttribute(key,String(val));
    if (parent) parent.appendChild(node);
    return node;
  }
  function clear() {
    epoch++;
    if (activeRoot) { activeRoot.replaceChildren(); activeRoot.hidden = true; }
    activeRoot = null;
    memory = null;
    const worker = activeWorker;
    activeWorker = null;
    if (worker) Promise.resolve().then(() => worker.terminate()).catch(() => {});
  }
  function makeSummary(root) {
    const confirmed=memory.cells.filter(c=>c.confirmed).length;
    const summary = root.querySelector('[data-h13-summary]');
    if (summary) summary.textContent = `${confirmed}/13 Zellen manuell geprüft. ${13-confirmed} offen. IMPORT IMMER GESPERRT.`;
  }
  function drawCrop(canvas, image, x0, x1, y0, y1, scale=2) {
    const w=Math.max(1, x1-x0),h=Math.max(1,y1-y0);
    canvas.width = w*scale; canvas.height = h*scale;
    const ctx=canvas.getContext('2d');
    if (!ctx) throw new Error('canvas_unavailable');
    ctx.imageSmoothingEnabled=false;
    ctx.drawImage(image,x0,y0,w,h,0,0,canvas.width,canvas.height);
  }
  function showReviewDraftSummary(root,draft,dateContext) {
    if (!draft || draft.mayImport !== false || draft.canPersist !== false) return null;
    const section=el('section',root,null,{'data-h15-structured-drafts':''});
    const heading=el('h4',section,'Strukturierte Prüfentwürfe – NICHT importierbar');
    const unresolved = draft.rows.slice(0,-1).reduce((n,row)=>n+row.cells.filter(c=>c.syntax==='syntax_unresolved').length,0);
    const summary=el('p',section,`${draft.sourceOcrRows} ${draft.sourcePixelReviewOnly?'physische Zeilen mit OCR-Wortboxbelegen':'OCR-Zeilen'} (inhaltlich ungeprüft) + 1 offene Randzeile. `+
      `${unresolved} Rohzellen ohne eindeutiges Format, nur Syntaxhinweis – keine fachliche Bestätigung. `+
      `Keine dieser Zeilen ist eine bestätigte Fahrt. Import und Speichern gesperrt.`,
      {'data-h15-summary':''});
    if (draft.sourcePixelReviewOnly===true) {
      el('p',section,'13 Pixelspalten aus originalen OCR-Wortboxen. Nicht eindeutig zuordenbare Wörter sind ausgeschlossen; keine Textzelle und keine Fahrt sind verifiziert.');
    }
    const details=el('details',section);
    el('summary',details,'Feldgebundene Entwürfe ansehen');
    const wrap=el('div',details);wrap.style.cssText='overflow-x:auto;max-width:100%';
    const table=el('table',wrap);table.style.cssText='font-size:12px;border-collapse:collapse;white-space:nowrap';
    const head=el('tr',el('thead',table));
    el('th',head,'OCR-Nummer / Status');
    labels.forEach(label=>el('th',head,label));
    const body=el('tbody',table);
    const cellOverlays=[],statusHeadings=[];
    const coreSummary=el('p',section,'Fachlicher Prüfstatus noch nicht berechnet – Import gesperrt.',
      {'data-h22-core-review-summary':'','aria-live':'polite'});
    const jointSummary=el('p',section,'Gemeinsame Zell-/Bildband-/Datumsprüfung noch offen – Import gesperrt.',
      {'data-h25-evidence-summary':'','aria-live':'polite'});
    draft.rows.forEach((row,i)=>{
      const overlayRow=[];cellOverlays.push(overlayRow);
      const tr=el('tr',body,null,{'data-h15-row':String(i)});
      statusHeadings.push(el('th',tr,row.sourceRowNumber===null?'Bildrand · ungeprüft':`${draft.sourcePixelReviewOnly?'Pixelband':'OCR'} ${row.sourceRowNumber} · ungeprüft${row.candidatePhysicalBandIndex===null?'':' · Rasterkandidat '+(row.candidatePhysicalBandIndex+1)+' (nur Geometrie)'}${row.sourceRowGeometryIssue?' · OCR-Zeilengrenze unklar (Prüfung erforderlich)':''}`));
      row.cells.forEach(cell=>{
        const td=el('td',tr,cell.raw ?? '–');
        const marker=el('span',td,'',{'data-h21-local-cell-review':''});
        overlayRow.push(marker);
        if(cell.syntax==='syntax_unresolved')td.setAttribute('title','OCR-Rohformat ungeklärt – nicht bestätigt');
        if(cell.borderWordWarningCount>0) {
          el('span',td,` ⚠ ${cell.borderWordWarningCount} nicht eindeutig lokalisierte Wortbox(en) berühren diesen Zellbereich – Bild prüfen.`);
          td.setAttribute('data-h20-border-warning',String(cell.borderWordWarningCount));
        }
        td.style.cssText='border:1px solid #526a80;padding:4px;max-width:200px;overflow:hidden;text-overflow:ellipsis';
      });
    });
    const tail=el('p',section,'Offene Randzeile: 0/13 Zellen manuell geprüft; keine fachliche Fahrtfreigabe.',
      {'data-h15-tail-status':''});
    const refreshStatus=nextDraft=>{
      const report=global.ATMSH15Drafts?.reviewStatus?.(nextDraft,dateContext);
      if(!report||report.mayImport!==false||report.canPersist!==false||
         report.rows?.length!==statusHeadings.length){
        coreSummary.textContent='Fachlicher Prüfstatus nicht belastbar. Import gesperrt.';
        return;
      }
      coreSummary.textContent=`Kernfelder manuell offen: ${report.corePending}/${report.coreTotal}; `+
        `${report.manuallyReviewedCells} Einzelzellen geprüft, ${report.verifiedRides} Fahrten bestätigt. `+
        'OCR-Syntax ist kein Beweis. Fahrtidentität, Datum, Flugprüfung und Import gesperrt. '+
        (report.planDateReview.status==='manual_selection_unverified'
          ? `Plantag ${report.planDateReview.selectedDate} manuell gewählt, Bildbezug nicht geprüft.`
          :report.planDateReview.status==='source_conflict'
          ? 'ACHTUNG: Datumskonflikt – erneut anhand Originalbild prüfen.'
          : 'Plantag aus der Originalbildquelle nicht bestätigt.')+
        (report.planDateReview.headerOcrCandidate===true
          ? ` Bildkopf-OCR-Hinweis ${report.planDateReview.headerOcrDate} (Original-Wortposition, NICHT unabhängig verifiziert).`
          : '');
      // H25 is a read-only, source-bound evidence overview, not a validator
      // whose result can ever trigger an import or a persistence action.
      const joint=global.ATMSH15Drafts?.integratedEvidenceReview?.(nextDraft,dateContext);
      if(!joint||joint.mayImport!==false||joint.canPersist!==false||
         joint.verifiedRides!==0||joint.rows?.length!==report.rows.length){
        jointSummary.textContent='Fachliche Gesamtquellenprüfung nicht belastbar. Import gesperrt.';
      }else{
        jointSummary.textContent=`Gesamtquellenprüfung: ${joint.counts.originalBands}/${joint.sourceOcrRows} beobachtete Bildbänder (keine Fahrtidentität), `+
          `${joint.counts.manualUnverified} manuell geprüfte, NICHT fachlich verifizierte Zellwerte, `+
          `${joint.counts.ocrSyntaxOnly} OCR-Zellen nur formal plausibel, `+
          `${joint.counts.ocrUnresolved} OCR-Zellen ungeklärt, `+
          `${joint.counts.borderWarnings} Zellbereiche mit Grenzwort-Hinweisen. `+
          `Datum: ${joint.dateReview.status}; keine unabhängig bestätigten Fahrten oder Flüge. Import gesperrt.`;
      }
      report.rows.forEach((info,i)=>{
        statusHeadings[i].setAttribute('data-h22-row-status',info.status);
        const source=i===report.sourceOcrRows?'Bildrand · ungeprüft':
          `${nextDraft.sourcePixelReviewOnly?'Pixelband':'OCR'} ${i+1}`;
        statusHeadings[i].textContent=`${source} · Kernprüfung ${info.coreReviewed}/${info.coreTotal} `+
          `· ${info.manuallyReviewedCells}/13 manuell geprüft · `+
          (i===report.sourceOcrRows?'Bildrand offen':'Fahrtidentität ungeprüft')+
          (info.originalPixelBand?` · Pixelband y=${info.originalPixelBand.y0}–${info.originalPixelBand.y1} (nur Bildregion)`:'')+
          (nextDraft.rows[i]?.candidatePhysicalBandIndex===null?'':
            ` · Rasterkandidat ${nextDraft.rows[i].candidatePhysicalBandIndex+1} (nur Geometrie)`)+
          (nextDraft.rows[i]?.sourceRowGeometryIssue?' · OCR-Zeilengrenze unklar (Prüfung erforderlich)':'')+
          (joint?.rows?.[i]?.checkHints?.length?` · Fachhinweise ${joint.rows[i].checkHints.length} (nur Prüfhinweise)`:'')+
          ' · Import gesperrt';
      });
    };
    refreshStatus(draft);
    return {summary,tail,cellOverlays,refreshStatus};
  }
  function showBlockedMatrix(root,issue) {
    const rows=validateRows(issue);
    const section=el('section',root);
    section.setAttribute('data-h14-blocked-preview','');
    el('h4',section,'Gesperrte OCR-Zeilenvorschau – keine freigegebenen Fahrten');
    if (!rows) {
      el('p',section,'Keine sicher zuordenbare OCR-Rohmatrix für diese Bildprüfung verfügbar.');
      return;
    }
    const h19=issue?.reviewPixelFallback;
    if(h19?.version==='H19_PIXEL_WORD_REVIEW_ONLY'&&h19?.mayImport===false) {
      el('p',section,`${rows.length} physische Rasterbänder mit originalen, zellweise nur geometrisch zugeordneten OCR-Wortboxen; der ursprüngliche Parser erkannte lediglich ${h19.sourceMatrixColumns} Spalten. ${h19.excludedWords} Wörter nicht eindeutig zuordenbar. KEINE bestätigten OCR-Zellen oder Fahrten. Import gesperrt.`);
    } else {
    el('p',section,`${rows.length} vorhandene OCR-Matrixzeilen. Zusätzlich eine geometrisch sichtbare, nicht erkannte Randzeile. Rohwerte können fehlerhaft sein. Import gesperrt.`);
    }
    const details=el('details',section);
    el('summary',details,'Erkannte OCR-Zeilen ansehen (nicht bestätigt)');
    const wrap=el('div',details);
    wrap.style.cssText='max-width:100%;overflow-x:auto';
    const table=el('table',wrap);
    table.style.cssText='font-size:12px;border-collapse:collapse;white-space:nowrap;background:#162a39;color:white';
    const head=el('thead',table),hrow=el('tr',head);
    el('th',hrow,'OCR-Zeile');
    labels.forEach(label=>el('th',hrow,label));
    const body=el('tbody',table);
    rows.forEach((row,index)=>{
      const tr=el('tr',body);el('th',tr,String(index+1));
      row.forEach(v=>{const td=el('td',tr,v || '–');td.style.cssText='border:1px solid #526a80;padding:4px;max-width:250px;overflow:hidden;text-overflow:ellipsis';});
    });
    const missing=el('p',section,'Zusätzliche offene Randzeile: nicht in der OCR-Rohmatrix enthalten – unten zellweise prüfen.');
    missing.setAttribute('data-h14-missing-row','');
  }
  async function show({root,file,issue,dateContext}) {
    clear();
    activeRoot=root || null;
    if (!root) return false;
    root.hidden = false;
    root.style.cssText='border:2px solid #d97706;border-radius:12px;padding:14px;margin:14px 0;background:#162a39;color:#fff';
    const sourceGap=issue?.reviewMissingBands?.version==='H26_ORIGINAL_SOURCE_BAND_AUDIT_ONLY' &&
      issue?.reviewMissingBands?.mayImport===false;
    el('h3',root,sourceGap?'Originalbild: OCR-Zeilenherkunft unklar – kein Import':
      'Originalbild: fehlende letzte Tabellenzeile – nur lokale Prüfung');
    el('p',root,sourceGap?
      'Synthetische oder nicht zugeordnete Original-Zeilenbelege sind ungeklärt. Nur numerische Prüfhinweise, keine Fahrtbearbeitung und kein Import.':
      'Die Analyse hat eine zusätzliche, offene Bildrandzeile erkannt. Der vollständige Fahrtenimport bleibt blockiert. Hier bestätigte Zellen werden nur im Arbeitsspeicher gehalten, nicht als Fahrt gespeichert.');
    const summary=el('p',root,'Prüfbereich noch nicht bereit.',{'role':'status','aria-live':'polite','data-h13-summary':''});
    // H26: bounded or synthetic source gaps cannot enter the editable 14+1
    // tail form. Show ONLY numeric image provenance in this same blocked panel.
    const missing=issue?.reviewMissingBands;
    if(missing?.version==='H26_ORIGINAL_SOURCE_BAND_AUDIT_ONLY' &&
       missing.mayImport===false && missing.canPersist===false &&
       Array.isArray(missing.flags) && missing.flags.length<=101 &&
       missing.flags.every(v=>Number.isSafeInteger(v.bandIndex) && v.bandIndex>=1 &&
         Number.isSafeInteger(v.y0) && Number.isSafeInteger(v.y1) && v.y1>v.y0 &&
         Number.isSafeInteger(v.wordCenterCount) && v.wordCenterCount>=0 &&
         typeof v.reason==='string')) {
      const detail=el('details',root,null,{'data-h26-source-band-audit':''});
      el('summary',detail,'Original-Zeilenherkunft – nur numerische Prüfhinweise');
      el('p',detail,`${missing.observedBoundedBands} vollständig begrenzte Pixelbänder, `+
        `${missing.sourceMatrixRows} OCR-Matrixzeilen, `+
        `${missing.syntheticSourceRows} synthetische Quellzeilen, `+
        `${missing.missingBoundedBandsWithWordCenters} Bänder mit Wortboxen ohne Matrixzeile. `+
        'Keine bestätigte Fahrt, kein Import.');
      for(const b of missing.flags.filter(b=>b.reason!=='geometry_candidate_only'))
        el('p',detail,`Band ${b.bandIndex}, y=${b.y0}–${b.y1}, `+
          `${b.wordCenterCount} Wortmitten, Herkunft: ${b.reason} (NICHT verifiziert).`);
    }
    // H27: the H26-only source-cell view is READ ONLY. No edit controls, no
    // automatic ride construction, and it never passes the H12 tail-form gate.
    const focus=issue?.reviewSourceCells;
    if(sourceGap && focus?.version==='H27_BLOCKED_SOURCE_CELLS_ONLY' &&
       focus.mayImport===false && focus.canPersist===false && focus.complete===false &&
       focus.verifiedRides===0 && focus.verifiedCells===0 &&
       Array.isArray(focus.targets) && focus.targets.length>0 && focus.targets.length<=100 &&
       Number.isSafeInteger(focus.sourceWidth) && Number.isSafeInteger(focus.sourceHeight) &&
       focus.targets.every(t=>Number.isSafeInteger(t.bandIndex)&&t.bandIndex>=1&&
         Number.isSafeInteger(t.y0)&&Number.isSafeInteger(t.y1)&&t.y1>t.y0&&
         Array.isArray(t.cells)&&t.cells.length===13&&
         t.cells.every((c,i)=>c.column===i+1&&c.verified===false&&
           c.manualReviewed===false&&typeof c.originalOcrCandidate==='string'))){
      const panel=el('details',root,null,{'data-h27-source-cells':''});
      el('summary',panel,'Gezielte Originalzellen der unklaren Bildbänder ansehen (NICHT bestätigt)');
      el('p',panel,`${focus.targets.length} problematische Originalbänder, jeweils 13 physische Zellen. `+
        'Enthaltene OCR-Wortboxen sind nur Lesehinweise. Fehlende Zellen bleiben leer. Keine Fahrtbearbeitung.');
      const selector=el('select',panel,null,{'data-h27-target-selector':'','aria-label':'Problematisches Bildband auswählen'});
      const selectedCell=el('select',panel,null,{'data-h27-cell-selector':'','aria-label':'Originalbildspalte auswählen'});
      focus.targets.forEach((t,i)=>el('option',selector,`Band ${t.bandIndex}, y=${t.y0}–${t.y1} (${t.reason})`,{'value':i}));
      labels.forEach((name,i)=>el('option',selectedCell,name,{'value':i}));
      const crop=el('canvas',panel,null,{'data-h27-original-crop':'','aria-label':'Originalzelle, keine Fahrtenfreigabe'});
      crop.style.cssText='display:block;max-width:420px;width:100%;height:auto;background:white;margin:10px 0';
      const status=el('p',panel,'Ausgeschnittene Bildzelle nur zur Einsicht; kein OCR-Wert bestätigt.',{'data-h27-cell-status':''});
      const current=epoch;
      if(file && /^image\/(jpeg|png|webp)$/.test(file.type||'') &&
         Number.isSafeInteger(file.size) && file.size>0 && file.size<=16000000){
        let url=null;
        try {
          url=URL.createObjectURL(file);
          const source=new Image(); source.src=url;
          await source.decode();
          if(current===epoch && root===activeRoot &&
             source.naturalWidth===focus.sourceWidth && source.naturalHeight===focus.sourceHeight){
            const refresh=()=>{
              if(current!==epoch || root!==activeRoot)return;
              const t=focus.targets[Number(selector.value)],c=t?.cells?.[Number(selectedCell.value)];
              if(!t||!c)return;
              drawCrop(crop,source,c.x0,c.x1,t.y0,t.y1,2);
              status.textContent=`Band ${t.bandIndex}, ${labels[c.column-1]}: `+
                `${c.originalOcrCandidate||'(kein sicher abgegrenztes OCR-Wort)'} `+
                '· geometrischer OCR-Rohhinweis, NICHT fachlich bestätigt. Kein Import.';
            };
            // H28: H15 source-cell-only transient draft. This does NOT create
            // rides or enter the H12 editable tail/ride path. The original
            // OCR wordbox text remains immutable, even when manually corrected.
            const draftsApi=global.ATMSH15Drafts;
            let sourceDraft=draftsApi?.createSourceCellDraft?.(focus,file)||null;
            if(sourceDraft && draftsApi?.sourceCellReviewStatus?.(sourceDraft)){
              const human=el('section',panel,null,{'data-h28-manual-source-review':''});
              el('p',human,'Nur manuelle Sichtprüfung dieser Originalzelle. Keine automatische Textübernahme. Ohne eindeutige OCR-Wortbox bleibt der OCR-Rohwert FEHLEND; eine manuelle Eingabe ersetzt ihn nicht. Keine Fahrtidentität, kein Import.');
              const manualInput=el('input',human,null,{'type':'text','maxlength':'160',
                'data-h28-manual-value':'','aria-label':'Manuelle Abschrift nur dieser Bildzelle'});
              manualInput.style.cssText='display:block;width:100%;max-width:420px;margin:7px 0';
              const driverLabel=el('label',human,null,{'data-h28-empty-driver-label':''});
              const emptyDriver=el('input',driverLabel,null,{'type':'checkbox','data-h28-empty-driver':''});
              el('span',driverLabel,' Fahrerzelle ausdrücklich leer (nicht automatisch erraten)');
              const confirm=el('button',human,'Diese Einzelzelle manuell geprüft',
                {'type':'button','data-h28-confirm':'','aria-label':'Manuelle Einzelzellentscheidung bestätigen'});
              const revoke=el('button',human,'Zellbestätigung widerrufen',
                {'type':'button','data-h28-revoke':''});
              const reviewStatus=el('p',human,'Noch keine manuelle Zellprüfung.',
                {'role':'status','aria-live':'polite','data-h28-status':''});
              // H29: show exactly why H28's manual cells still cannot become a
              // structured ride; never expose an import or ride-approval action.
              const rideGate=el('p',human,'Fahrt-Herkunft nicht bestätigt.',
                {'role':'status','data-h29-source-ride-gate':''});
              // H30: reuse H21's TWO strictly local per-cell reread modes here.
              // This is a SECONDARY OCR CANDIDATE, not H27 original full-image OCR,
              // not a manual decision and never an H15 ride identity proof.
              const reread=el('button',human,'Nur diese Originalzelle lokal nachlesen (eng)',
                {'type':'button','data-h30-reread-source-cell':''});
              const proposals=el('p',human,'Keine neue OCR-Nachlesung ausgeführt.',
                {'data-h30-reread-proposals':''});
              const secondaryEvidence=el('p',human,'Sekundärbeleg: keine Nachlesung – kein unabhängiger Nachweis.',{'data-h31-secondary-source-status':''});
              const rereadStatus=el('p',human,'Zusätzliche OCR-Vorschläge dürfen nicht automatisch übernommen werden. IMPORT GESPERRT.',
                {'role':'status','aria-live':'polite','data-h30-reread-status':''});
              // H32: existing panel shows provenance of all 13 cells of the
              // selected original band. No OCR is copied to manual fields.
              const bandOverview=el('section',human,null,{'data-h32-band-evidence':''});
              const bandSummary=el('p',bandOverview,'13-Zellen-Herkunft noch nicht prüfbar.',
                {'role':'status','data-h32-band-summary':''});
              const bandCells=el('ol',bandOverview,null,{'data-h32-band-cells':''});
              // H34: the original JPEG and decoded pixels, not the WhatsApp
              // filename alone, anchor the selected physical row to a photo.
              // This remains a table-region identity, NEVER a ride identity.
              const bandFingerprint=el('p',human,'Bildband-Fingerabdruck noch nicht geprüft; keine Fahrtidentität.',
                {'data-h34-pixel-band-identity':''});
              // H35: a cell decision is PHOTO+PIXEL-BAND+DATE-CONTEXT bound
              // only after an actual H34 proof for the selected original photo.
              // Old H28 human-only decisions remain UNBOUND without WebCrypto;
              // they can never be reused as source-bound ride evidence.
              const h35SourceDaySnapshot=JSON.stringify(dateContext??null);
              const photoBandProofs=new Map();
              const boundDecisionState=el('p',human,
                'H35: keine foto-/band-/plantaggebundene Entscheidung. KEIN Import.',
                {'role':'status','data-h35-decision-binding':''});
              let sourcePixelData=null;let identityGeneration=0;
              const candidateCache=new Map();let cellGeneration=0;
              const active=()=>current===epoch&&root===activeRoot&&
                JSON.stringify(dateContext??null)===h35SourceDaySnapshot;
              const chosen=()=>{
                const target=focus.targets[Number(selector.value)];
                const ci=Number(selectedCell.value);
                if(!target||!Number.isSafeInteger(ci)||ci<0||ci>=13)return null;
                return {target,ci};
              };
              const renderManual=()=>{
                if(!active())return;
                const choice=chosen();if(!choice)return;
                const row=sourceDraft.rows.find(r=>r.bandIndex===choice.target.bandIndex);
                const cell=row?.cells[choice.ci];if(!cell)return;
                manualInput.value=cell.confirmed&&cell.explicitEmptyDriver?'':cell.value;
                emptyDriver.checked=cell.confirmed&&cell.explicitEmptyDriver;
                driverLabel.hidden=choice.ci!==12;
                const earlier=candidateCache.get(`${choice.target.bandIndex}:${choice.ci}`)||[];
                proposals.textContent=earlier.length?
                  `Sekundäre, UNVERIFIZIERTE eng-OCR-Nachlese: ${earlier.join(' | ')}${earlier.length>1?' (Widerspruch)':''}. Roh-OCR unverändert.`:
                  'Keine zusätzliche Nachlese für diese Zelle. Roh-OCR unverändert.';
                const secondary=draftsApi.secondarySourceCellAudit?.(sourceDraft,
                  choice.target.bandIndex,choice.ci,earlier);
                secondaryEvidence.textContent=secondary?
                  `Sekundärbeleg (dasselbe Bild, NICHT unabhängig): ${secondary.plausibleSyntaxCandidates} syntaktisch plausible von ${secondary.uniqueSecondaryCandidates} verschiedenen OCR-Kandidaten; `+
                  `${secondary.secondaryConflict?'OCR-Widerspruch; ':''}`+
                  `${secondary.fullImageOriginalPresent?'Vollbild-Rohwert separat erhalten':'KEIN sicherer Vollbild-Rohwert'}; `+
                  `${secondary.exactMatchOriginalUnverified?'identischer Rohtext (KEINE Verifikation); ':''}`+
                  `${secondary.exactMatchManualUnverified?'identisch zur manuellen Eingabe (KEINE Verifikation); ':''}`+
                  '0 bestätigte Zellen/Fahrten. IMPORT GESPERRT.':
                  'Sekundärbeleg nicht sicher prüfbar – KEIN Import.';
                // Each OCR source remains separate. This matrix is a
                // source-check, never a 13/13 verified-ride count.
                const secAll=Array.from({length:13},(_,i)=>
                  candidateCache.get(`${choice.target.bandIndex}:${i}`)||[]);
                const all=draftsApi.sourceBandEvidenceReview?.(sourceDraft,dateContext,
                  choice.target.bandIndex,secAll);
                bandCells.replaceChildren();
                if(all?.cells?.length===13&&all.verifiedRides===0&&
                   all.mayImport===false&&all.structuredRideDraft===null){
                  bandSummary.textContent=`Band ${all.sourceBandIndex}, 13/13 Herkunftszellen aufgelistet: `+
                    `${all.totals.fullImageBoundedCells} Vollbild-Rohzellen, `+
                    `${all.totals.secondaryCandidateCells} mit zusätzlichem OCR-Vorschlag, `+
                    `${all.totals.manuallyReviewedUnverifiedCells} manuell geprüft (NICHT verifiziert). `+
                    `${all.totals.unprovenCoreFields} Kernfelder ohne vollständige Herkunft. `+
                    'Plantag/Zeilenidentität NICHT verifiziert. 0 Fahrten. IMPORT GESPERRT.';
                  for(const cellAudit of all.cells){
                    el('li',bandCells,`${labels[cellAudit.column-1]}: `+
                      `${cellAudit.fullImageOriginalPresent?'Vollbild-Rohhinweis':'Vollbild-Quelle fehlt'}; `+
                      `${cellAudit.secondaryCropPresent?'Sekundär-OCR-Kandidat (gleiches Foto)':'keine Zellnachlesung'}; `+
                      `${cellAudit.manualReviewedUnverified?'manuelle Prüfung, NICHT verifiziert':'manuelle Prüfung offen'}; `+
                      `${cellAudit.missingProof.length} offene Teilbelege. Keine Fahrtfreigabe.`);
                  }
                }else bandSummary.textContent='Gesamte Zellherkunft nicht valide – KEIN Import.';
                // H33: evaluate manual core fields against real same-band
                // source gaps. No text is copied to a ride or persisted.
                const preflight=draftsApi.sourceRideSemanticPreflight?.(
                  sourceDraft,dateContext,choice.target.bandIndex,secAll);
                if(preflight?.version==='H33_SOURCE_RIDE_SEMANTIC_PREFLIGHT_BLOCKED'&&
                   preflight.verifiedRides===0&&preflight.structuredRideDraft===null&&
                   preflight.mayImport===false){
                  const misses=preflight.requiredFields.filter(f=>f.missingEvidence.length);
                  bandSummary.textContent+=' Fachprüfung: '+
                    `${preflight.totals.manualReviewedCore}/6 manuelle Kernfelder, `+
                    `${preflight.totals.fullImageBoundedCore}/6 Vollbild-Rohbelege, `+
                    `${misses.length}/6 Kernfelder mit offenen Belegen; `+
                    `Plantag und Fahrtidentität unbestätigt. `+
                    '0 strukturierte Fahrten – KEIN Import.';
                }
                const report=draftsApi.sourceCellReviewStatus(sourceDraft);
                reviewStatus.textContent=`Band ${choice.target.bandIndex}, ${labels[choice.ci]}: `+
                  `${cell.raw===null?'KEIN eindeutig begrenzter OCR-Rohwert':'OCR-Rohwert unverändert vorhanden'}; `+
                  `${cell.confirmed?'manuell geprüft (NICHT verifiziert)':'manuell noch offen'}; `+
                  `${report?.manualReviewedUnverified??0} manuell geprüfte Zellen insgesamt, `+
                  '0 bestätigte Fahrten. IMPORT GESPERRT.';
                // H35 bound review recomputes the complete 13-cell decision
                // snapshot for this exact physical band. A stale receipt from
                // another band/file/day/cell value will not validate.
                const currentPhotoProof=photoBandProofs.get(choice.target.bandIndex)||null;
                const boundReceipt=draftsApi.sourceDecisionPhotoBinding?.(sourceDraft,
                  choice.target.bandIndex,currentPhotoProof,dateContext);
                const boundReview=boundReceipt&&draftsApi.sourceBoundDecisionReview?.(
                  sourceDraft,boundReceipt,currentPhotoProof,dateContext,secAll);
                boundDecisionState.textContent=boundReview?.version===
                  'H35_SOURCE_BOUND_DECISION_REVIEW_BLOCKED'&&
                  boundReview.structuredRideDraft===null&&boundReview.mayImport===false?
                  `H35: ${boundReview.currentManualReviewedCells}/13 Entscheidungen an dieses `+
                  `Originalfoto, Pixelband ${boundReview.bandIndex} und diesen unverifizierten `+
                  'Plantagkontext gebunden. KEINE Fahrt- oder Importfreigabe.':
                  'H35: keine kryptografisch an Foto, Band UND Plantag gebundene Entscheidung; '+
                  'manuelle Prüfung nur flüchtig/unverifiziert, KEIN Import.';
                const gate=draftsApi.sourceRideBridgeReview?.(sourceDraft,dateContext);
                const bandGate=gate?.rows?.find(r=>r.bandIndex===choice.target.bandIndex);
                rideGate.textContent=bandGate?
                  `Fahrt-Verknüpfung GESPERRT: ${bandGate.manualReviewedCore}/6 Kernfelder manuell geprüft, `+
                  `${bandGate.originalBoundedCore}/6 mit eindeutig begrenzter OCR-Wortbox; `+
                  `${bandGate.missingEvidence.length} ausstehende Herkunfts-/Fachbelege. `+
                  `Plantag: ${gate.dateStatus}; physische Fahrtidentität NICHT belegt. `+
                  '0 strukturierte Fahrten, KEIN Import.':
                  'Keine sichere Fahrt-Herkunftskontrolle. KEIN Import.';
              };
              const checkPhysicalBand=async()=>{
                const generation=++identityGeneration;
                const choice=chosen();
                if(!choice||!active())return;
                bandFingerprint.textContent='Originalbildband wird lokal geprüft – keine Fahrtfreigabe.';
                const model=draftsApi?.sourcePhysicalBandFingerprint;
                if(typeof model!=='function'||!file?.arrayBuffer||!global.crypto?.subtle){
                  bandFingerprint.textContent='Originalbild-Fingerabdruck nicht verfügbar; kein Nachweis, Import gesperrt.';
                  return;
                }
                try{
                  if(!sourcePixelData){
                    const tmp=document.createElement('canvas');
                    tmp.width=source.naturalWidth;tmp.height=source.naturalHeight;
                    const ctx=tmp.getContext('2d',{willReadFrequently:true});
                    if(!ctx)throw Error('no_canvas');
                    ctx.drawImage(source,0,0);
                    sourcePixelData=ctx.getImageData(0,0,tmp.width,tmp.height);
                  }
                  const proof=await model(sourceDraft,choice.target.bandIndex,file,sourcePixelData);
                  if(generation!==identityGeneration||!active()||
                     chosen()?.target.bandIndex!==choice.target.bandIndex)return;
                  if(proof?.physicalTableRegionObserved===true&&proof?.mayImport===false&&
                     proof?.verifiedRides===0){
                    photoBandProofs.set(choice.target.bandIndex,proof);
                  }else photoBandProofs.delete(choice.target.bandIndex);
                  renderManual();
                  bandFingerprint.textContent=proof?.physicalTableRegionObserved===true&&
                    proof?.verifiedRides===0&&proof?.mayImport===false?
                    `Originalbild-Band ${proof.bandIndex}, y=${proof.pixelBand.y0}–${proof.pixelBand.y1}: `+
                    `Foto-SHA-256 ${proof.originalFileSha256.slice(0,12)}…, `+
                    `Pixelband-SHA-256 ${proof.decodedPixelBandSha256.slice(0,12)}…. `+
                    'Physische Bildregion gebunden; Fahrt/Plantag NICHT verifiziert, Import gesperrt.':
                    'Originalbildband nicht beweisbar; Fahrt bleibt gesperrt.';
                }catch(_error){
                  if(generation===identityGeneration&&active())
                    bandFingerprint.textContent='Bildband-Fingerabdruck fehlgeschlagen; Import gesperrt.';
                }
              };
              const update=(approve)=>{
                if(!active())return;
                const choice=chosen();if(!choice)return;
                const driver=choice.ci===12&&emptyDriver.checked;
                const value=driver?'':manualInput.value;
                const candidate=draftsApi.updateSourceCellDraft?.(sourceDraft,choice.target.bandIndex,
                  choice.ci,value,approve,driver);
                if(!candidate){
                  reviewStatus.textContent='Zellinhalt syntaktisch nicht zulässig oder Quellbezug ungültig. NICHT geprüft. IMPORT GESPERRT.';
                  return;
                }
                sourceDraft=candidate;
                renderManual();
              };
              // Existing user confirmations are revoked whenever a value changes;
              // simply navigating to another cell does not affect other cells.
              manualInput.addEventListener('input',()=>update(false));
              emptyDriver.addEventListener('change',()=>{
                const requested=emptyDriver.checked;
                update(false);
                // Pending explicit-empty choice must survive the confirmation
                // revocation, but is not a confirmed value until button click.
                emptyDriver.checked=requested;
              });
              confirm.addEventListener('click',()=>update(true));
              revoke.addEventListener('click',()=>update(false));
              const changeCell=()=>{
                cellGeneration++;
                rereadStatus.textContent='Andere Zelle gewählt – vorherige OCR-Nachlesung nicht für diese Zelle gültig.';
                renderManual();
                if(chosen()?.target.bandIndex!==undefined)void checkPhysicalBand();
              };
              selector.addEventListener('change',changeCell);
              selectedCell.addEventListener('change',changeCell);
              reread.addEventListener('click',async()=>{
                if(!active()||activeWorker)return;
                if(global.ATMS_OFFLINE_TESSERACT_QA?.ready!==true ||
                   typeof global.Tesseract?.createWorker!=='function'){
                  rereadStatus.textContent='Lokaler Offline-OCR-Worker nicht nachgewiesen – keine Nachlesung. IMPORT GESPERRT.';
                  return;
                }
                const choice=chosen();if(!choice)return;
                const generation=cellGeneration;
                const target=choice.target,ci=choice.ci;
                // Draw a FRESH snapshot from the selected original image cell,
                // not from a possibly switched on-screen canvas.
                const imageCell=document.createElement('canvas');
                try{drawCrop(imageCell,source,target.cells[ci].x0,target.cells[ci].x1,target.y0,target.y1,2);}
                catch(_){rereadStatus.textContent='Original-Zellausschnitt nicht verfügbar. Kein Import.';return;}
                reread.disabled=true;let worker=null;
                const unchanged=()=>active()&&generation===cellGeneration;
                try{
                  worker=await global.Tesseract.createWorker('eng');
                  if(!unchanged())return;
                  activeWorker=worker;
                  const next=[];
                  for(const mode of ['7','13']){
                    if(!unchanged())return;
                    await worker.setParameters({tessedit_pageseg_mode:mode});
                    if(!unchanged())return;
                    const result=await worker.recognize(imageCell);
                    if(!unchanged())return;
                    const value=cleanOcrText(result?.data?.text);
                    if(value&&!next.includes(value))next.push(value);
                  }
                  candidateCache.set(`${target.bandIndex}:${ci}`,next);
                  renderManual();
                  rereadStatus.textContent='Zwei lokale Zell-OCR-Aufrufe abgeschlossen – nur zusätzliche unbestätigte Kandidaten. Kein Import.';
                }catch(_){
                  if(unchanged())rereadStatus.textContent='Zellnachlesung nicht vollständig ausführbar. Keine Übernahme, kein Import.';
                }finally{
                  if(activeWorker===worker)activeWorker=null;
                  if(worker)try{await worker.terminate();}catch(_){}
                  if(active())reread.disabled=false;
                }
              });
              renderManual();
              void checkPhysicalBand();
            }
            selector.addEventListener('change',refresh);selectedCell.addEventListener('change',refresh);
            refresh();
          }else status.textContent='Originalbildquelle nicht passend. Keine Zellansicht und kein Import.';
        } catch(_) {status.textContent='Originalbild nicht lesbar. Kein Import.';}
        finally {if(url)URL.revokeObjectURL(url);}
      }
    }
    const g=validate(issue);
    if (!g || !file || !/^image\/(jpeg|png|webp)$/.test(file.type || '') || typeof file.size !== 'number' || file.size > 16000000) {
      summary.textContent='Zeilen- oder Bildbeleg nicht ausreichend. Keine Zellbestätigung möglich. IMPORT GESPERRT.';
      return false;
    }
    const current=epoch;
    let url;
    try {
      url=URL.createObjectURL(file);
      const img = new Image(); img.src=url; await img.decode();
      if (current!==epoch || root!==activeRoot) return false;
      if (img.naturalWidth !== g.sourceWidth || img.naturalHeight !== g.sourceHeight) {
        summary.textContent='Originalbildabmessung und Rasterbeleg stimmen nicht überein. IMPORT GESPERRT.';
        return false;
      }
      // Require a trusted user action for every cell: never prefill an OCR guess.
      memory={cells:labels.map(()=>({value:'',confirmed:false,emptyDriver:false,candidates:[]})),
        mayImport:false,openTailStillUnbounded:true};
      // H15: immutable field-bound drafts, never state.rides and never localStorage.
      let drafts=global.ATMSH15Drafts?.create?.(issue,file) || null;
      const draftView=showReviewDraftSummary(root,drafts,dateContext);
      // H21: keep the SAME H20 original-image inspector, now with a bounded
      // targeted local OCR reread and isolated per-cell review decisions.
      // The 15th open-tail cell editor remains separate and equally blocked.
      if(drafts?.sourceBorderWordReviewOnly===true &&
         issue.reviewPixelFallback?.reviewBands?.length===drafts.sourceOcrRows){
        const panel=el('section',root,null,{'data-h20-original-cell-inspector':''});
        el('h4',panel,'Originalzellen der 14 Rasterzeilen gezielt prüfen');
        el('p',panel,'Nur einzelne Bildzellen nachlesen. OCR-Vorschläge sind keine Verifikation; manuelle Entscheidungen gelten nur für genau diese Zelle und erlauben keinen Import.');
        const flagged=[];
        drafts.rows.slice(0,-1).forEach((row,ri)=>row.cells.forEach((cell,ci)=>{
          if(cell.borderWordWarningCount>0)flagged.push([ri,ci]);
        }));
        const jump=el('button',panel,`Nächste markierte Zellgrenze prüfen (${flagged.length} Bereiche)`,
          {'type':'button','data-h21-next-flagged':''});
        if(!flagged.length)jump.disabled=true;
        const rowSel=el('select',panel,null,{'aria-label':'Physisches Rasterband auswählen'});
        const colSel=el('select',panel,null,{'aria-label':'Tabellenspalte auswählen'});
        issue.reviewPixelFallback.reviewBands.forEach((_,i)=>
          el('option',rowSel,'Bildband '+(i+1),{'value':i}));
        labels.forEach((lab,i)=>el('option',colSel,lab,{'value':i}));
        const crop=el('canvas',panel,null,{'aria-label':'Ausgeschnittene Original-Bildzelle','data-h20-selected-crop':''});
        crop.style.cssText='display:block;width:100%;max-width:440px;height:auto;background:white;margin:10px 0';
        const status=el('p',panel,'',{'data-h20-inspection-status':'','aria-live':'polite'});
        const sourceText=el('p',panel,'',{'data-h21-original-raw':''});
        const suggested=el('p',panel,'Noch keine gezielte lokale OCR ausgeführt.',{'data-h21-selected-suggestions':''});
        const input=el('input',panel,null,{'type':'text','maxlength':'160','autocomplete':'off',
          'aria-label':'Ausgewählten Rasterzellenwert manuell prüfen','data-h21-selected-input':''});
        input.style.cssText='background:white;color:#111;padding:9px;box-sizing:border-box;max-width:100%;width:390px';
        const blankLabel=el('label',panel,null,{'data-h21-empty-driver-container':''});
        const blank=el('input',blankLabel,null,{'type':'checkbox','data-h21-blank-driver':''});
        el('span',blankLabel,' Diese Fahrerzelle im Originalbild nach Prüfung tatsächlich leer');
        const decision=el('button',panel,'Diese einzelne Zelle manuell prüfen',{'type':'button','data-h21-confirm-cell':''});
        const reviewStatus=el('p',panel,'',{'data-h21-review-status':'','aria-live':'polite'});
        const reread=el('button',panel,'Nur ausgewählte Bildzelle lokal nachlesen (eng)',
          {'type':'button','data-h21-reread-selected':''});
        const ocrStatus=el('p',panel,'OCR nicht ausgeführt. Import gesperrt.',
          {'data-h21-reread-status':'','aria-live':'polite'});
        const cache=new Map();let selectionEpoch=0;
        const selected=()=>[Number(rowSel.value),Number(colSel.value)];
        const goodIndex=(ri,ci)=>Number.isInteger(ri)&&ri>=0&&ri<drafts.sourceOcrRows&&
          Number.isInteger(ci)&&ci>=0&&ci<13;
        const showSelected=()=>{
          selectionEpoch++;
          const [ri,ci]=selected();
          if(!goodIndex(ri,ci))return;
          const band=issue.reviewPixelFallback.reviewBands[ri],cell=drafts.rows[ri].cells[ci];
          drawCrop(crop,img,g.boundaries[ci],g.boundaries[ci+1],band.y0,band.y1,2);
          status.textContent=`Rasterband ${ri+1}, ${labels[ci]}: `+
            `${cell.borderWordWarningCount} mehrdeutige Wortbox-Berührungen. `+
            'Originalbild und OCR-Rohwert getrennt prüfen. Import dauerhaft gesperrt.';
          sourceText.textContent=`Unveränderter OCR-Rohhinweis: ${cell.raw || '(leer/kein Wortbeleg)'} `+
            '(kein verifizierter Zellwert).';
          input.value=cell.value===null?'':cell.explicitEmptyDriver?'':cell.value;
          blankLabel.hidden=ci!==12;
          blank.checked=cell.explicitEmptyDriver===true;
          input.disabled=blank.checked;
          reviewStatus.textContent=cell.confirmed?'Einzelzelle nur manuell geprüft – KEINE Fahrtfreigabe.':'Einzelzelle ungeprüft.';
          const suggestions=cache.get(`${ri}:${ci}`)||[];
          suggested.textContent=suggestions.length
            ? `Ungeprüfte OCR-Beobachtungen: ${suggestions.join(' | ')}${suggestions.length>1?' (Widerspruch)':''}`
            : 'Noch keine gezielte lokale OCR für diese Zelle.';
          ocrStatus.textContent='Nur ausgewählte Zelle; keine automatische Übernahme. Import gesperrt.';
        };
        const updateSelected=(confirm)=>{
          const [ri,ci]=selected();
          if(!goodIndex(ri,ci)||current!==epoch)return false;
          const value=input.value,emptyDriver=ci===12&&blank.checked===true;
          const next=global.ATMSH15Drafts?.updatePixelCell?.(drafts,ri,ci,value,confirm,emptyDriver);
          if(!next||next.mayImport!==false||next.canPersist!==false||next.complete!==false)return false;
          drafts=next;
          draftView?.refreshStatus?.(drafts);
          const cell=drafts.rows[ri].cells[ci];
          const marker=draftView?.cellOverlays?.[ri]?.[ci];
          if(marker) marker.textContent=cell.confirmed
            ? ` | Nur manuell geprüft: ${cell.value} (keine Fahrtfreigabe)`
            : cell.value?` | Ungesicherte Korrektur: ${cell.value}`:'';
          return true;
        };
        rowSel.addEventListener('change',showSelected);
        colSel.addEventListener('change',showSelected);
        jump.addEventListener('click',()=>{
          if(current!==epoch||!flagged.length)return;
          const [ri,ci]=selected();
          const index=flagged.findIndex(([r,c])=>r===ri&&c===ci);
          const following=index<0?flagged[0]:flagged[(index+1)%flagged.length];
          rowSel.value=String(following[0]);colSel.value=String(following[1]);
          showSelected();
        });
        blank.addEventListener('change',()=>{
          const checked=blank.checked;
          input.value='';input.disabled=checked;
          updateSelected(false);
          blank.checked=checked; // Confirmation is a separate explicit click.
          reviewStatus.textContent='Geändert – erneute Einzelzellprüfung erforderlich.';
        });
        input.addEventListener('input',()=>{
          updateSelected(false);
          reviewStatus.textContent='Änderung – vorherige Zellbestätigung widerrufen.';
        });
        decision.addEventListener('click',()=>{
          if(!updateSelected(true)){
            reviewStatus.textContent='Ungültiger Zellwert oder ungültige Originalbildbindung – NICHT bestätigt.';
          }else reviewStatus.textContent='Nur diese Bildzelle manuell geprüft. Keine Fahrt-/Importfreigabe.';
        });
        reread.addEventListener('click',async()=>{
          if(current!==epoch||activeWorker)return;
          if(global.ATMS_OFFLINE_TESSERACT_QA?.ready!==true ||
             typeof global.Tesseract?.createWorker!=='function'){
            ocrStatus.textContent='Originaler lokaler OCR-Worker nicht verfügbar; keine OCR-Freigabe.';
            return;
          }
          const [ri,ci]=selected();
          if(!goodIndex(ri,ci))return;
          const token=selectionEpoch;
          // Snapshot so a changed selector cannot send a different cell to OCR.
          const sourceCanvas=document.createElement('canvas');
          sourceCanvas.width=crop.width;sourceCanvas.height=crop.height;
          const context=sourceCanvas.getContext('2d');
          if(!context){ocrStatus.textContent='Zellausschnitt nicht verfügbar.';return;}
          context.drawImage(crop,0,0);
          reread.disabled=true;let worker=null;
          try{
            worker=await global.Tesseract.createWorker('eng');
            if(current!==epoch||token!==selectionEpoch)return;
            activeWorker=worker;
            const values=[];
            for(const mode of ['7','13']){
              if(current!==epoch||token!==selectionEpoch)return;
              await worker.setParameters({tessedit_pageseg_mode:mode});
              const result=await worker.recognize(sourceCanvas);
              if(current!==epoch||token!==selectionEpoch)return;
              const value=cleanOcrText(result?.data?.text);
              if(value&&!values.includes(value))values.push(value);
            }
            cache.set(`${ri}:${ci}`,values);
            suggested.textContent=values.length
              ? `Ungeprüfte eng-OCR-Vorschläge: ${values.join(' | ')}${values.length>1?' (Widerspruch)':''}`
              : 'Keine sicher lesbaren OCR-Vorschläge für diese Bildzelle.';
            ocrStatus.textContent='Nur zwei gezielte lokale OCR-Aufrufe; keine automatische Zellbestätigung.';
          }catch(_){
            if(current===epoch&&token===selectionEpoch)
              ocrStatus.textContent='Lokale Zell-OCR nicht vollständig ausführbar. Import gesperrt.';
          }finally{
            if(activeWorker===worker)activeWorker=null;
            if(worker)try{await worker.terminate();}catch(_){}
            if(current===epoch)reread.disabled=false;
          }
        });
        showSelected();
      }
      const updateDraft=(index,value,confirmed,emptyDriver=false)=>{
        if (!drafts) return false;
        const next=global.ATMSH15Drafts?.updateTail?.(drafts,index,value,confirmed,emptyDriver);
        if (!next || next.mayImport!==false || next.canPersist!==false) return false;
        drafts=next;
        draftView?.refreshStatus?.(drafts);
        const count=drafts.rows[drafts.rows.length-1].cells.filter(c=>c.confirmed).length;
        if (draftView?.tail) draftView.tail.textContent=`Offene Randzeile: ${count}/13 Zellen manuell geprüft; `+
           'Import dauerhaft gesperrt; keine fachliche Fahrtfreigabe.';
        return true;
      };
      showBlockedMatrix(root,issue);
      const strip=el('div',root);
      const rowLabel=el('p',strip,'Originalzeile, Ausschnitt aus dem gewählten Bild (nicht interpoliert):');
      const rowCanvas=el('canvas',strip,null,{'aria-label':'Originalbild-Zeile'});
      rowCanvas.style.cssText='width:100%;height:auto;max-height:190px;background:white;border-radius:4px';
      drawCrop(rowCanvas,img,0,g.sourceWidth,g.top,g.bottom,1);
      const cells=el('div',root);
      cells.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(185px,1fr));gap:10px';
      const cellCanvases=[];
      const candidateAreas=[];
      labels.forEach((label,index)=>{
        const item=el('section',cells);item.style.cssText='padding:9px;border:1px solid #526a80;border-radius:9px;min-width:0';
        const title=el('label',item,`${index+1}. ${label}`);
        title.style.cssText='display:block;font-weight:700;margin-bottom:5px';
        const crop=el('canvas',item,null,{'aria-label':`Bildzelle ${index+1}`});
        crop.style.cssText='width:100%;height:48px;background:white;object-fit:contain';
        drawCrop(crop,img,g.boundaries[index],g.boundaries[index+1],g.top,g.bottom,2);
        cellCanvases.push(crop);
        const suggestions=el('p',item,'OCR noch nicht geprüft',{'data-h14-suggestion':String(index)});
        suggestions.style.cssText='font-size:12px;white-space:pre-wrap;overflow-wrap:anywhere';
        candidateAreas.push(suggestions);
        const input=el('input',item,null,{'type':'text','maxlength':'160','aria-label':`${label} manuell eingeben`,'autocomplete':'off'});
        input.style.cssText='box-sizing:border-box;width:100%;padding:10px;margin:6px 0;background:white;color:#111';
        const btn=el('button',item,'Diesen Zellwert bestätigen',{'type':'button'});
        btn.style.cssText='width:100%;padding:8px;min-height:44px;color:#111';
        const status=el('p',item,'Offen');status.style.fontSize='12px';
        let blank=null;
        if (index===12) {
          const wrap=el('label',item);
          blank=el('input',wrap,null,{'type':'checkbox'});
          el('span',wrap,' Fahrerzelle nach Bildprüfung tatsächlich leer');
          blank.addEventListener('change',()=>{
            input.disabled=blank.checked;input.value='';memory.cells[index]={value:'',confirmed:false,emptyDriver:false};
            updateDraft(index,'',false,false);
            status.textContent='Offen';makeSummary(root);
          });
        }
        input.addEventListener('input',()=>{
          memory.cells[index]={value:'',confirmed:false,emptyDriver:false};
          updateDraft(index,input.value,false,false);
          status.textContent='Geändert – erneut prüfen';makeSummary(root);
        });
        btn.addEventListener('click',()=>{
          if (!memory || current!==epoch) return;
          const value=input.value.trim();const emptyDriver=index===12 && blank?.checked===true;
          if (!value && !emptyDriver) { status.textContent='Wert fehlt – keine Bestätigung'; return; }
          if (!updateDraft(index,value,true,emptyDriver)) {
            status.textContent='Zellwert formal ungültig oder Prüfmodell nicht verfügbar – nicht bestätigt.';
            memory.cells[index]={value:'',confirmed:false,emptyDriver:false};
            makeSummary(root);
            return;
          }
          memory.cells[index]={value:emptyDriver?'Nicht zugewiesen':value,confirmed:true,emptyDriver};
          status.textContent='Nur manuell geprüft – keine Importfreigabe';makeSummary(root);
        });
      });
      // H14: voluntary, transient local OCR. Never auto-fill or confirm a cell.
      // Worker is created only through the app's secured offline Tesseract adapter.
      const run=el('button',root,'Lokale OCR-Vorschläge für die 13 Bildzellen lesen',{'type':'button','data-h14-ocr-run':''});
      const ocrStatus=el('p',root,'OCR-Vorschläge sind ungeprüfte Beobachtungen aus demselben Foto.',{'role':'status','data-h14-ocr-status':''});
      run.addEventListener('click',async()=>{
        if (current!==epoch || !memory || activeWorker) return;
        if (global.ATMS_OFFLINE_TESSERACT_QA?.ready !== true ||
            typeof global.Tesseract?.createWorker !== 'function') {
          ocrStatus.textContent='Lokaler OCR-Worker nicht verfügbar. Import bleibt gesperrt.';
          return;
        }
        run.disabled=true;
        let worker=null;
        try {
          worker=await global.Tesseract.createWorker('eng+deu');
          if (current!==epoch) return;
          activeWorker=worker;
          for (const mode of ['7','13']) {
            await worker.setParameters({tessedit_pageseg_mode:mode});
            for(let i=0;i<cellCanvases.length;i++) {
              if (current!==epoch) return;
              ocrStatus.textContent=`Lokale OCR: Ansicht ${mode==='7'?1:2}/2, Zelle ${i+1}/13. Import gesperrt.`;
              const result=await worker.recognize(cellCanvases[i]);
              if(current!==epoch) return;
              const value=cleanOcrText(result?.data?.text);
              if(value && !memory.cells[i].candidates.includes(value))
                memory.cells[i].candidates.push(value);
              const list=memory.cells[i].candidates;
              candidateAreas[i].textContent=list.length
                ? `Ungeprüfte OCR-Vorschläge: ${list.join(' | ')}${list.length>1?' (Widerspruch)':''}`
                : 'OCR: kein zuverlässig lesbarer Vorschlag';
            }
          }
          ocrStatus.textContent='26 lokale OCR-Zellläufe abgeschlossen. OCR-Vorschläge müssen einzeln geprüft werden. Import gesperrt.';
        } catch (_) {
          if(current===epoch) ocrStatus.textContent='Lokale OCR nicht vollständig ausführbar. Nur tatsächlich gelesene Vorschläge; Import gesperrt.';
        } finally {
          if (activeWorker===worker) activeWorker=null;
          if(worker) try { await worker.terminate(); } catch (_) {}
          if(current===epoch) run.disabled=false;
        }
      });
      el('p',root,'Auch wenn alle 13 Zellen manuell geprüft wurden, bleibt diese lokal rekonstruierte Zeile nicht importierbar. Flugangaben bleiben unabhängig prüfpflichtig.');
      el('button',root,'Alle lokalen Eingaben verwerfen',{'type':'button'}).addEventListener('click',()=>{
        if (current===epoch) clear();
      });
      makeSummary(root);
      return true;
    } catch (_) {
      if (current===epoch) summary.textContent='Originalbild kann nicht dargestellt werden. IMPORT GESPERRT.';
      return false;
    } finally { if (url) URL.revokeObjectURL(url); }
  }
  const api=Object.freeze({show,clear,validate,validateRows,debugStatus:()=>memory?Object.freeze({
    confirmed:memory.cells.filter(c=>c.confirmed).length, mayImport:false,openTailStillUnbounded:true,
    hasValues:memory.cells.some(c=>!!c.value)
  }):Object.freeze({confirmed:0,mayImport:false,openTailStillUnbounded:true,hasValues:false})});
  global.ATMSH13Review=api;
  if (typeof module==='object'&&module.exports) module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
