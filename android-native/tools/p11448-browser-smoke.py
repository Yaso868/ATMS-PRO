#!/usr/bin/env python3
"""Offline Chromium smoke for actual P11448 UI and exact-source canvas rendering.
No import/storage/GitHub or user images. Browser mock only, NOT Samsung E2E.
"""
from pathlib import Path
import asyncio
from playwright.async_api import async_playwright
root=Path(__file__).resolve().parents[1]
html=(root/'app/src/main/assets/index.html').read_text()
source=(root/'app/src/main/assets/js/plan-import.js').read_text()
start=source.index('  // P11448 LOCAL ONLY.')
end=source.index('  function ap01ConflictEvidenceList(ride) {',start)
production=source[start:end]
modal_start=html.index('<div id="ap01RideEditor"')
modal_end=html.index('<button id="previewOnlyPlanBtn"',modal_start)
body=html[modal_start:modal_end]
async def main():
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        context=await browser.new_context(offline=True,viewport={'width':390,'height':840})
        page=await context.new_page()
        await page.set_content('<!DOCTYPE html><html lang="de"><body style="margin:0;background:#101827;color:white">'+body+'</body></html>')
        result=await page.evaluate("""(prod)=>{
          const $=(id)=>document.getElementById(id);
          const AP01_KEYS=['company','destination','date','time','pickup'];
          const file={name:'plan.jpg',arrayBuffer:async()=>new Uint8Array([1,2,3]).buffer};
          const ride={id:'r2',sourceRow:2,sourceFile:'plan.jpg',sourceImageOcr:true,
            planDate:'2026-10-23',date:'2026-10-23',time:'06:40',pickup:'DUS Airport',
            company:'Get-E',destination:'Marriott Seesten DUS',companyOcrConflict:true,
            imageCellEvidence:{company:{sourceRow:2,sourceColumn:5,
              cellBounds:{left:100,top:10,right:200,bottom:45},
              primarySourceEvidence:{rawOcr:'Get-E'},cropQuality:{fullCellIncluded:true}}},
            importIntegrityStatus:'ok',importIntegrityConflicts:[]};
          const state={rides:[ride],file,files:[file],mapping:{company:5},pipelineGeneration:1,
            previewOnlyAnalysis:false,analysisRunInProgress:false,autoPipelineInProgress:false,
            ap01EditorOpenId:'r2',ap01ReviewConfirmed:false};
          const sourceCanvas=document.createElement('canvas');sourceCanvas.width=250;sourceCanvas.height=60;
          const c=sourceCanvas.getContext('2d');c.fillStyle='#55aaee';c.fillRect(100,10,100,35);
          c.fillStyle='#000';c.font='bold 18px Arial';c.fillText('Get-E',108,32);
          const meta={width:250,height:60,boundaries:[0,0,0,0,0,100,200],rowMetaByMatrixIndex:{1:{y0:10,y1:45}}};
          const cellText=v=>String(v??'').trim();
          const isImageFile=f=>/\\.jpg$/i.test(f.name);
          const ap01RideById=id=>state.rides.find(r=>r.id===id);
          const classifyRide=()=> 'arrival';
          const validate=()=>[];
          const writeCurrentAnalysisJsonPreview=()=>{};
          const ap01CloseEditor=()=>{state.ap01EditorOpenId=null;};
          const script=new Function('state','$','AP01_KEYS','cellText','isImageFile','ap01RideById','classifyRide','validate','writeCurrentAnalysisJsonPreview','ap01CloseEditor',
            prod+';return {setSource:x=>p11448Source=x,eligible:p11448Eligible,present:p11448PresentCell};');
          const h=script(state,$,AP01_KEYS,cellText,isImageFile,ap01RideById,classifyRide,validate,writeCurrentAnalysisJsonPreview,ap01CloseEditor);
          h.setSource({file,canvas:sourceCanvas,meta,generation:1});
          $('ap01EditorFields').innerHTML='<input class="ap01-field" data-field="company" value="Get-E" />';
          $('ap01RideEditor').hidden=false;
          const ok=h.present(ride,'company');
          const v=$('ap01OriginalCellCanvas');
          const pixels=v.getContext('2d').getImageData(3,3,1,1).data;
          const result={ok,width:v.width,height:v.height,pixels:Array.from(pixels),
            visible:!$('ap01OriginalCellReview').hidden,checked:$('ap01OriginalCellApproved').checked,
            label:$('ap01OriginalCellCaption').textContent,
            reviewButton:$('ap01OriginalCellConfirm').textContent};
          return result;
        }""",production)
        assert result['ok'] and result['visible'],result
        assert result['width'] > 0 and result['height'] > 0,result
        assert result['pixels'][3] > 0 and result['pixels'][0] > 40,result
        assert not result['checked'] and 'Originalzelle' in result['reviewButton'],result
        assert 'Zeile 2' in result['label'] and 'Firma' in result['label'],result
        await context.close()
        await browser.close()
        print('P11448 OFFLINE CHROMIUM UI: PASS; original source cell rendered, 390px mobile viewport, no automatic approval / no network')
asyncio.run(main())
