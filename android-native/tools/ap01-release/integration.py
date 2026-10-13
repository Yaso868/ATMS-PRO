import asyncio, json, pathlib, re, hashlib, os, shutil, sys
from playwright.async_api import async_playwright
from probe import PRELOAD, BASE

BASE=pathlib.Path(__file__).resolve().parents[2] / 'app/src/main/assets'

RIDE={'id':'ap01-new-1','date':'2026-10-13','planDate':'2026-10-13','sourceFile':'AP01_03_TEST.json','sourceRow':1,'time':'15:00','planTime':'15:00','driver':'Lana','pickup':'Hotel Test','destination':'DUS Airport','flightNumber':'','flightLocation':'','flightTime':'','company':'Get-E','vehicle':'Pkw','persons':2,'price':35}
OLD={'id':'old-protected','date':'2026-10-13','time':'09:00','planTime':'09:00','driver':'Elyes','pickup':'Bestand Start','destination':'Bestand Ziel','flightNumber':'','company':'WT','vehicle':'Pkw','persons':1,'price':25,'notes':'do not touch'}
OUT=[]
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,executable_path=(os.environ.get('ATMS_QA_CHROMIUM_PATH') or shutil.which('chromium') or shutil.which('chromium-browser') or None),args=['--no-sandbox','--disable-gpu'])
  ctx=await browser.new_context(service_workers='block',viewport={'width':1100,'height':850})
  await ctx.add_init_script(PRELOAD)
  intercepted=[]; errs=[]
  async def block(route):intercepted.append(route.request.url); await route.abort()
  await ctx.route('**/*',block)
  page=await ctx.new_page(); page.on('pageerror',lambda e:errs.append(str(e)))
  html=re.sub(r'<script\b[^>]*>.*?</script>','',(BASE/'index.html').read_text(),flags=re.I|re.S)
  await page.goto('about:blank'); await page.set_content(html,wait_until='domcontentloaded')
  for fname in ['ocr-integrity-core.js','plan-import.js','app.js']:
   code=(BASE/'js'/fname).read_text()
   if fname=='plan-import.js':code=code.replace("document.currentScript?.src || new URL('./js/plan-import.js', location.href).href", "'https://atms.invalid/js/plan-import.js'")
   await page.add_script_tag(content=code)
  await page.evaluate("document.dispatchEvent(new Event('DOMContentLoaded'))")
  await page.wait_for_function('window.applyImportedRides && window.ATMSAP01Regression && persistenceDurableReady && window.ATMSStorageV2Diagnosis()?.ready',timeout=10000)
  async def js(s,arg=None):return await page.evaluate(s,arg) if arg is not None else await page.evaluate(s)
  def rec(name,detail,ok):OUT.append({'name':name,'pass':bool(ok),'detail':detail});print(('PASS' if ok else 'FAIL'),name,json.dumps(detail,ensure_ascii=False,default=str)[:600],flush=True)
  async def seed(old=None,done=None):
   return await js('''async p => {
     rides=(p.old||[]).map((r,i)=>window.norm(r,i));done=new Set(p.done||[]);
     const ok=save({silent:true}); const d=await syncPersistenceDurableShadow('ap01_03_test_seed');
     const v=await syncStorageV2Phase1('ap01_03_test_seed');
     const s=window.ATMSAP01Regression.readState();s.rides=[];s.ap01ReviewConfirmed=false;s.ap01EditorOpenId=null;s.previewOnlyAnalysis=false;
     return {ok,durable:!!d,v2:!!v.ok,rides:rides.length};
   }''',{'old':old or [],'done':done or []})
  async def stage(incoming=None,confirm=True):
   return await js('''p=>{const s=window.ATMSAP01Regression.readState();s.rides=p.incoming;s.ap01ReviewConfirmed=p.confirm;s.previewOnlyAnalysis=false;s.ap01EditorOpenId=null;
      const b=document.getElementById('importPlanBtn'); b.disabled=false;return{staged:s.rides.length,confirmed:s.ap01ReviewConfirmed,buttonDisabled:b.disabled};}''',{'incoming':incoming or [RIDE], 'confirm':confirm})
  async def snap():
   return await js('''() => ({rideRaw:window.__TEST.api.getItem(KEY),doneRaw:window.__TEST.api.getItem(DONE),rides:JSON.parse(window.__TEST.api.getItem(KEY)||'[]'),done:JSON.parse(window.__TEST.api.getItem(DONE)||'[]'),v2:window.ATMSStorageV2Diagnosis(),durable:window.__TEST.dump().db.ATMSPRO_PERSISTENCE_DURABLE_V1?.critical?.latest,history:JSON.parse(window.__TEST.api.getItem(PLAN_IMPORT_HISTORY)||'[]'),audit:JSON.parse(window.__TEST.api.getItem(PERSIST_AUDIT_KEY)||'[]'),status:document.getElementById('importStatus').textContent})''')
  async def clickImport():
   await page.locator('#importPlanBtn').click(force=True,timeout=5000)
   await page.wait_for_timeout(800)
   return await snap()
  # 1 Unauthorized direct API
  await seed([OLD]);before=await snap()
  unauthorized=await js('''async r=>{try{await window.applyImportedRides([r]);return{blocked:false}}catch(e){return{blocked:true,message:e.message}}}''',RIDE)
  after=await snap();rec('01 Unautorisierter Direktaufruf gesperrt',{'blocked':unauthorized,'unchanged':before['rideRaw']==after['rideRaw']},unauthorized['blocked'] and before['rideRaw']==after['rideRaw'])
  # 2 explicit UI import, editable fields preserving snapshot
  await seed([OLD],['old-protected']);incoming={**RIDE,'ap01OriginalOcr':{'vehicle':'Pkw'},'vehicle':'Van','ap01EditAudit':[{'at':'2026-10-13T09:55:00Z','changes':[{'field':'vehicle','from':'Pkw','to':'Van'}],'source':'manual_preview'}]}
  await stage([incoming]);pre=await snap();post=await clickImport()
  selected=[r for r in post['rides'] if r['id']=='ap01-new-1']; protected=[r for r in post['rides'] if r['id']=='old-protected']
  detail={'count':len(post['rides']),'new':len(selected),'vehicle':selected[0].get('vehicle') if selected else None,'original':selected[0].get('ap01OriginalOcr') if selected else None,'audit':selected[0].get('ap01EditAudit') if selected else None,'old':protected,'done':post['done'],'v2':post['v2']['exactMatch'],'history':len(post['history']),'status':post['status']}
  rec('02 Bestätigter UI-Import inklusive Korrektur, Bestand, Erledigt, Storage V2',detail,len(selected)==1 and selected[0].get('vehicle')=='Van' and len(selected[0].get('ap01EditAudit',[]))==1 and len(protected)==1 and protected[0]['notes']=='do not touch' and post['done']==['old-protected'] and post['v2']['exactMatch'] and len(post['history'])>0)
  # 3 same source row updated driver; no duplicate
  upd={**RIDE,'id':'ap01-new-REIMPORT','driver':'Dennis','vehicle':'Van'}
  await stage([upd]);post2=await clickImport();matched=[r for r in post2['rides'] if r.get('sourceRow')==1 and r.get('sourceFile')=='AP01_03_TEST.json']
  rec('03 Neue Planversion ersetzt gleiche Quellzeile statt Doppelung',{'rows':len(post2['rides']),'matching':[(r.get('id'),r.get('driver')) for r in matched],'oldSafe':any(r['id']=='old-protected' for r in post2['rides'])},len(matched)==1 and matched[0].get('driver')=='Dennis' and len(post2['rides'])==2)
  # 4 Abbruch vor Bestätigung
  await seed([OLD]);await stage([RIDE],confirm=False);cancelBefore=await snap();cancelPost=await clickImport()
  rec('04 Fehlende Vorschau-Bestätigung verhindert Übernahme',{'same':cancelBefore['rideRaw']==cancelPost['rideRaw'],'status':cancelPost['status']},cancelBefore['rideRaw']==cancelPost['rideRaw'])
  # 5 canceled editor editing (source changes only on save)
  await seed([OLD]);await stage([RIDE]);res=await js('''()=>{const r=window.ATMSAP01Regression;const s=r.readState();r.openEditor(s.rides[0].id);const node=document.querySelector('#ap01EditorFields [data-field="vehicle"]');node.value='Van';document.getElementById('ap01EditorCancel').click();const prompt=!document.getElementById('ap01DiscardConfirm').hidden;document.getElementById('ap01DiscardChanges').click();return{prompt,vehicle:s.rides[0].vehicle,open:s.ap01EditorOpenId,confirmed:s.ap01ReviewConfirmed}}''');rec('05 Editor-Abbrechen fragt nach und verwirft erst nach Bestätigung',res,res['prompt'] and res['vehicle']=='Pkw' and res['open'] is None and not res['confirmed'])
  # 6 synthetic duplicate incoming within same batch source row -- may be accepted -> risk
  await seed([]); dup1={**RIDE,'id':'duplicate-A'};dup2={**RIDE,'id':'duplicate-B','driver':'Yannik'};await stage([dup1,dup2]);d=await clickImport();same=[r for r in d['rides'] if r.get('sourceRow')==1]
  rec('06 Doppelung innerhalb desselben Eingangs erkannt/verhindert',{'count':len(d['rides']),'sameSource':len(same),'identities':[r['id'] for r in same],'status':d['status']},len(same)==0 and 'gesperrt' in d['status'])
  # 7 durable failure block import when preflight failed
  await seed([OLD]);await stage([RIDE]); await js("() => {window.__TEST.fail['ATMSPRO_PERSISTENCE_DURABLE_V1']=true}")
  fpre=await snap();fpost=await clickImport()
  rec('07 Fehlende Vorher-Durable-Sicherung sperrt ohne Bestandsverlust',{'same':fpre['rideRaw']==fpost['rideRaw'],'count':len(fpost['rides']),'status':fpost['status']},fpre['rideRaw']==fpost['rideRaw'] and len(fpost['rides'])==1)
  await js("() => {window.__TEST.fail['ATMSPRO_PERSISTENCE_DURABLE_V1']=false}")
  # 8 later Storage V2 failure should not be silently success of V2
  await seed([OLD]);await stage([RIDE]);await js("() => {window.__TEST.fail['ATMSPRO_STORAGE_V2_PHASE1']=true}")
  vpost=await clickImport();await page.wait_for_timeout(500);vpost=await snap()
  rec('08 Fehlender Storage-V2-Spiegelabgleich sichtbar',{'count':len(vpost['rides']),'storageV2Status':vpost['v2']['status'],'exactMatch':vpost['v2']['exactMatch'],'status':vpost['status']},len(vpost['rides'])==2 and vpost['v2']['status']=='error' and not vpost['v2']['exactMatch'])
  await js("() => {window.__TEST.fail['ATMSPRO_STORAGE_V2_PHASE1']=false}")
  # 9 Open flight check kept unverified, not silent approved
  await seed([]);f={**RIDE,'flightNumber':'EW9752','flightTime':'15:20','flightLocation':'Wien','flightNeedsManualCheck':True,'flightCheckConfidence':'unverified','flightStatus':'unverified'}
  await stage([f]);fpost=await clickImport();ride=fpost['rides'][0] if fpost['rides'] else {}
  rec('09 Offene Flugprüfung wird unverändert als offen gespeichert',{'stored':len(fpost['rides']),'needsManualCheck':ride.get('flightNeedsManualCheck'),'confidence':ride.get('flightCheckConfidence'),'status':fpost['status'],'v2':fpost['v2']['status']},len(fpost['rides'])==1 and ride.get('flightNeedsManualCheck')==True and ride.get('flightCheckConfidence')!='verified')
  # 10 new manual flight context must block
  await seed([OLD]);f={**RIDE,'flightNumber':'EW9752','flightLocation':'Wien','flightTime':'15:20','ap01FlightRecheckRequired':True};await stage([f]);before=await snap();after=await clickImport()
  rec('10 Manuell veränderter Flug ohne Neuprüfung bleibt gesperrt',{'unchanged':before['rideRaw']==after['rideRaw'],'status':after['status']},before['rideRaw']==after['rideRaw'])
  # 11 history partial write failure simulate? not necessary.
  # 11 failure specifically AFTER localStorage but BEFORE durable post-import confirm
  await seed([OLD]);await stage([RIDE]);await js("() => {window.__TEST.fail['ATMSPRO_PERSISTENCE_DURABLE_V1']='after'}")
  initial=await snap(); afterFail=await clickImport();await page.wait_for_timeout(400); afterFail=await snap()
  rec('11 Fehler der zweiten Durable-Sicherung löst Rollback aus',{'sameLocal':afterFail['rideRaw']==initial['rideRaw'],'count':len(afterFail['rides']),'v2':afterFail['v2']['status'],'error':afterFail['status'],'durableMatches':afterFail['durable']['storage']['atms_beta_14_3_1_rides']==afterFail['rideRaw']},afterFail['rideRaw']==initial['rideRaw'] and len(afterFail['rides'])==1 and 'Importfehler' in afterFail['status'] and afterFail['durable']['storage']['atms_beta_14_3_1_rides']==afterFail['rideRaw'])
  await js("() => {window.__TEST.fail['ATMSPRO_PERSISTENCE_DURABLE_V1']=false}")
  # 12 forced localStorage failure, verify rollback
  await seed([OLD],['old-protected']);await stage([RIDE]);writeBefore=await snap();await js("() => {window.__TEST.fail.localStorageOnce='atms_beta_14_3_1_rides'}")
  writeAfter=await clickImport();
  rec('12 Fahrten-Schreibfehler führt nicht zu teilweiser Übernahme',{'same':writeAfter['rideRaw']==writeBefore['rideRaw'],'doneSame':writeAfter['doneRaw']==writeBefore['doneRaw'],'status':writeAfter['status']},writeAfter['rideRaw']==writeBefore['rideRaw'] and writeAfter['doneRaw']==writeBefore['doneRaw'] and 'Importfehler' in writeAfter['status'])
  # 13 untouched non-completed inventory preserved as carryover
  await seed([OLD]);await stage([RIDE]);nonDone=await clickImport();oldR=[r for r in nonDone['rides'] if r.get('id')=='old-protected']
  rec('13 Offene Bestandsfahrt bleibt als Carryover vorhanden',{'count':len(nonDone['rides']),'oldRide':oldR},len(nonDone['rides'])==2 and len(oldR)==1 and oldR[0].get('_planCarryover') is True)
  # 14 direct call requires real click
  await seed([OLD]);await stage([RIDE]);authless=await js("async r=>{try{await window.applyImportedRides([r]);return 'unexpected_success'}catch(e){return e.message}}",RIDE)
  rec('14 App-Import verlangt zusätzlich zur Vorschau-Bestätigung einen vertrauenswürdigen Klick',{'result':authless},'Sicherheitsblock' in authless)
  # 15 Time edit: plan-import AP01 editor writes `time`, but app.js norm prioritizes old `planTime`.
  await seed([]);await stage([RIDE]);timeCase=await js("""() => {const e=window.ATMSAP01Regression,s=e.readState(); e.openEditor(s.rides[0].id); const node=document.querySelector('#ap01EditorFields [data-field=\"time\"]');node.value='16:45';const saved=e.saveEditor();const r=s.rides[0];const normalized=window.norm(r,0);return {saved,edited:r.time,oldPlanTime:r.planTime,normalizedTime:normalized.time,normalizedPlanTime:normalized.planTime,importBlockers:e.importBlockers()}}""")
  rec('15 Manuell geänderte Abholzeit bleibt nach app.js-Normierung erhalten',timeCase,timeCase['saved'] and timeCase['edited']=='16:45' and timeCase['normalizedTime']=='16:45')
  # 16 All 12 input fields persist if time and planTime are already consistent.
  await seed([]);raw={**RIDE,'date':'2026-10-14','planDate':'2026-10-14','time':'16:15','planTime':'16:15','driver':'Dennis','pickup':'Hotel West','destination':'DUS Airport','flightNumber':'EW9752','flightLocation':'Wien','flightTime':'16:40','company':'Get-E','vehicle':'Van','persons':3,'price':41.50}
  await stage([raw]);persist=await clickImport();got=persist['rides'][0] if persist['rides'] else {};fields=['date','time','driver','pickup','destination','flightNumber','flightLocation','flightTime','company','vehicle','persons','price'];diff={k:[raw.get(k),got.get(k)] for k in fields if got.get(k)!=raw.get(k)}
  rec('16 Zwölf bereits konsistente Felder durch app.js gespeichert',{'count':len(persist['rides']),'diff':diff,'v2':persist['v2']['exactMatch']},len(persist['rides'])==1 and not diff and persist['v2']['exactMatch'])
  # 17 independent OCR conflict blocks before app.js can write
  await seed([OLD]);problem={**RIDE,'companyOcrConflict':True,'companyOcrConflictCandidate':'GetE','importIntegrityStatus':'blocked'};await stage([problem]);before=await snap();after=await clickImport()
  rec('17 Ungelöster Get-E/GetE-OCR-Konflikt verhindert app.js-Übergabe',{'same':before['rideRaw']==after['rideRaw'],'status':after['status']},before['rideRaw']==after['rideRaw'])
  # 18 A completed ride matching the new source row must stay immutable.
  oldDone={**OLD,'sourceFile':'AP01_03_TEST.json','sourceRow':1,'planDate':'2026-10-13'}
  await seed([oldDone],['old-protected'])
  revision={**RIDE,'driver':'Dennis','pickup':'Changed pickup','price':88}
  await stage([revision]);doneReimport=await clickImport()
  retained=next((r for r in doneReimport['rides'] if r['id']=='old-protected'),None)
  rec('18 Erledigte gleiche Quellzeile bleibt unverändert und erledigt',
      {'rides':len(doneReimport['rides']),'id':retained.get('id') if retained else None,'driver':retained.get('driver') if retained else None,'notes':retained.get('notes') if retained else None,'done':doneReimport['done']},
      len(doneReimport['rides'])==1 and retained is not None and retained['driver']=='Elyes' and retained['notes']=='do not touch' and doneReimport['done']==['old-protected'])
  # 19 Two genuinely different source rows at the same time are not duplicates.
  await seed([])
  parallelA={**RIDE,'id':'parallel-A','sourceRow':11,'driver':'Yannik'}
  parallelB={**RIDE,'id':'parallel-B','sourceRow':12,'driver':'Dennis'}
  await stage([parallelA,parallelB]);parallel=await clickImport()
  rec('19 Parallele Fahrten unterschiedlicher Quellzeilen erhalten',
      {'count':len(parallel['rides']),'rows':[r.get('sourceRow') for r in parallel['rides']]},
      len(parallel['rides'])==2 and sorted(r.get('sourceRow') for r in parallel['rides'])==[11,12])
  # 20 Time editor must preserve distinct PLAN, DISPO and LIVE axes.
  await seed([])
  tRide={**RIDE,'dispoTime':'14:50','liveTime':'15:10','flightNumber':'EW9752','flightTime':'15:20','flightLocation':'Wien'}
  await stage([tRide])
  t=await js('''() => {const api=window.ATMSAP01Regression,s=api.readState();api.openEditor(s.rides[0].id);document.querySelector('#ap01EditorFields [data-field="time"]').value='16:45';const saved=api.saveEditor();const ride=s.rides[0];return{saved,plan:ride.planTime,time:ride.time,dispo:ride.dispoTime,live:ride.liveTime,recheck:ride.ap01FlightRecheckRequired,confidence:ride.flightCheckConfidence,normalized:window.norm(ride,0).time}}''')
  rec('20 Uhrzeitkorrektur erhält DISPO/LIVE und entwertet Flugprüfung',t,
      t['saved'] and t['time']==t['plan']==t['normalized']=='16:45' and t['dispo']=='14:50' and t['live']=='15:10' and t['recheck'] and t['confidence']=='uncertain')
  # 21 Even if an incoming caller bypasses preview-level checks, app.js
  # must reject duplicate source keys under a genuinely trusted import click.
  await seed([OLD]);await stage([RIDE]);before=await snap()
  await js('d=>{const original=window.applyImportedRides;window.__AP04_originalImport=original;window.applyImportedRides=(ignored)=>original(d)}',[dup1,dup2])
  after=await clickImport()
  await js('()=>{window.applyImportedRides=window.__AP04_originalImport;delete window.__AP04_originalImport}')
  rec('21 Direkte Import-API sperrt doppelte Quellzeile trotz gültigem Klick',
      {'same':before['rideRaw']==after['rideRaw'],'count':len(after['rides']),'status':after['status']},
      before['rideRaw']==after['rideRaw'] and len(after['rides'])==1 and 'doppelte Quellzeile' in after['status'])
  # 22 Same time/route but different driver: completed old ride is protected;
  # never swallow a genuinely distinct new parallel ride on the weak exact key.
  await seed([])
  completedSameCore={**RIDE,'id':'completed-parallel','driver':'Elyes','notes':'completed preserved'}
  completedSameCore.pop('sourceFile',None);completedSameCore.pop('sourceRow',None);completedSameCore.pop('planDate',None)
  await seed([completedSameCore],['completed-parallel'])
  newcomer={**RIDE,'id':'new-parallel','driver':'Yannik','sourceRow':99}
  await stage([newcomer]);both=await clickImport()
  oldR=next((r for r in both['rides'] if r['id']=='completed-parallel'),None)
  newR=next((r for r in both['rides'] if r['id']=='new-parallel'),None)
  rec('22 Abgeschlossene Parallelfahrt und neue Fahrerfahrt bleiben beide',
      {'count':len(both['rides']),'old':oldR.get('notes') if oldR else None,'new':newR.get('driver') if newR else None,'done':both['done']},
      len(both['rides'])==2 and oldR is not None and newR is not None and oldR['notes']=='completed preserved' and newR['driver']=='Yannik' and both['done']==['completed-parallel'])
  # Export summary
  summary={'date':'2026-10-13','scope':'AP-01.04 isolated modified plan-import.js and app.js, in-memory localStorage and indexedDB mocks; no productive storage','browser':'Chromium isolated about:blank full Android import HTML, full scripts loaded test-only relative URL override','passed':sum(x['pass'] for x in OUT),'failed':sum(not x['pass'] for x in OUT),'tests':OUT,'externalRequests':intercepted,'pageErrors':errs[:30],'notes':['No native Android and no external real flight provider','Verified Storage V2 async copy is not a gating condition.']}
  summary['gatePassed'] = (len(OUT) == 22 and summary['passed'] == 22 and summary['failed'] == 0 and not errs and not intercepted)
  output_path=os.environ.get('ATMS_QA_OUTPUT')
  if output_path: pathlib.Path(output_path).write_text(json.dumps(summary,ensure_ascii=False,indent=2))
  print('AP01 BROWSER GATE', 'PASS' if summary['gatePassed'] else 'FAIL', summary['passed'], '/', len(OUT), 'errors',errs[:8], 'requests',intercepted[:8])
  if not summary['gatePassed']: raise RuntimeError('AP-01.07 browser acceptance failed: no APK may be built')
  await browser.close()
asyncio.run(main())
