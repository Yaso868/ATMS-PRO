import asyncio, json, pathlib, re, hashlib, os, shutil, sys
from playwright.async_api import async_playwright
from probe import PRELOAD, BASE

BASE=pathlib.Path(__file__).resolve().parents[2] / 'app/src/main/assets'

RIDE={'id':'ap01-new-1','date':'2026-10-13','planDate':'2026-10-13','sourceFile':'AP01_03_TEST.json','sourceRow':1,'time':'15:00','planTime':'15:00','driver':'Lana','pickup':'Hotel Test','destination':'DUS Airport','flightNumber':'','flightLocation':'','flightTime':'','company':'Get-E','vehicle':'Pkw','persons':2,'price':35}
OLD={'id':'old-protected','date':'2026-10-13','time':'09:00','planTime':'09:00','driver':'Elyes','pickup':'Bestand Start','destination':'Bestand Ziel','flightNumber':'','company':'WT','vehicle':'Pkw','persons':1,'price':25,'notes':'do not touch'}
# Deterministic synthetic PRIOR import from its own original JSON source. This
# is not a retrofit for real historical rides: they remain blocked without hash.
OLD['sourceFile']='AP01_OLD_SELECTED.json'
OLD['sourceRow']=1
OLD['planDate']='2026-10-13'
OLD['sourceFileSha256']=hashlib.sha256(json.dumps([{k:v for k,v in OLD.items() if k!='sourceFileSha256'}],sort_keys=True,separators=(',',':')).encode()).hexdigest()
OUT=[]
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,executable_path=(os.environ.get('ATMS_QA_CHROMIUM_PATH') or shutil.which('chromium') or shutil.which('chromium-browser') or None),args=['--no-sandbox','--disable-gpu'])
  ctx=await browser.new_context(service_workers='block',viewport={'width':1100,'height':850})
  await ctx.add_init_script(PRELOAD)
  intercepted=[]; errs=[]
  async def block(route):
   if route.request.url=='http://127.0.0.1/__atms_qa_secure_origin__':
    await route.fulfill(status=200,body='<html><head></head><body></body></html>',content_type='text/html')
   else:
    intercepted.append(route.request.url); await route.abort()
  await ctx.route('**/*',block)
  page=await ctx.new_page(); page.on('pageerror',lambda e:errs.append(str(e)))
  html=re.sub(r'<script\b[^>]*>.*?</script>','',(BASE/'index.html').read_text(),flags=re.I|re.S)
  await page.goto('about:blank'); await page.set_content(html,wait_until='domcontentloaded')
  # CI/browser sandbox disallows navigation to ANY secure URL, so WebCrypto is
  # absent on about:blank. Back SHA-256 digest with Python hashlib on the real
  # selected browser File bytes. Production WebCrypto guard remains untouched.
  await page.expose_function('__atmsQaRealSha256',lambda values:hashlib.sha256(bytes(values)).hexdigest())
  await page.evaluate('''() => {Object.defineProperty(window.crypto,'subtle',{configurable:true,value:{
    digest:async(algorithm,data)=>{
      if(String(algorithm).toUpperCase()!=='SHA-256')throw Error('QA SHA-256 only');
      const hex=await window.__atmsQaRealSha256(Array.from(new Uint8Array(data)));
      return Uint8Array.from(hex.match(/../g).map(pair=>parseInt(pair,16))).buffer;
    }
  }});}''')
  for fname in ['ocr-integrity-core.js','plan-import.js','app.js']:
   code=(BASE/'js'/fname).read_text()
   if fname=='plan-import.js':code=code.replace("document.currentScript?.src || new URL('./js/plan-import.js', location.href).href", "'https://atms.invalid/js/plan-import.js'")
   await page.add_script_tag(content=code)
  await page.evaluate("document.dispatchEvent(new Event('DOMContentLoaded'))")
  await page.wait_for_function('window.applyImportedRides && window.ATMSAP01Regression && persistenceDurableReady && window.ATMSStorageV2Diagnosis()?.ready',timeout=10000)
  # Each injected storage failure belongs to a separate, disposable QA page.
  # Never clear or bypass a real application's unresolved R7 safety latch.
  async def fresh_mock_page():
   nonlocal page
   await page.close()
   page=await ctx.new_page();page.on('pageerror',lambda e:errs.append(str(e)))
   await page.goto('about:blank');await page.set_content(html,wait_until='domcontentloaded')
   await page.expose_function('__atmsQaRealSha256',lambda values:hashlib.sha256(bytes(values)).hexdigest())
   await page.evaluate('''() => {Object.defineProperty(window.crypto,'subtle',{configurable:true,value:{
     digest:async(algorithm,data)=>{
       if(String(algorithm).toUpperCase()!=='SHA-256')throw Error('QA SHA-256 only');
       const hex=await window.__atmsQaRealSha256(Array.from(new Uint8Array(data)));
       return Uint8Array.from(hex.match(/../g).map(pair=>parseInt(pair,16))).buffer;
     }
   }});}''')
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
   # Real browser File bytes, not an invented precomputed SHA or provenance bypass.
   # The selected JSON is a synthetic QA fixture; Android image OCR remains separate.
   return await js('''p=>{const s=window.ATMSAP01Regression.readState();s.rides=p.incoming;s.ap01ReviewConfirmed=p.confirm;s.previewOnlyAnalysis=false;s.ap01EditorOpenId=null;
      const fileNames=[...new Set(s.rides.map(x=>x.sourceFile).filter(Boolean))];
      s.files=fileNames.map(name=>new File([JSON.stringify(s.rides.filter(x=>x.sourceFile===name))],name,{type:'application/json'}));
      s.file=s.files[0]||null;
      const b=document.getElementById('importPlanBtn'); b.disabled=false;
      return{staged:s.rides.length,confirmed:s.ap01ReviewConfirmed,buttonDisabled:b.disabled,
        selectedActualBytes:s.files.length,webCrypto:!!globalThis.crypto?.subtle?.digest};}''',{'incoming':incoming or [RIDE], 'confirm':confirm})
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
  # 3: A different SHA for the same selected source/row REQUIRES source review.
  # Cancel deliberately, never leave an unresolved modal/async import running.
  upd={**RIDE,'id':'ap01-new-REIMPORT','driver':'Dennis','vehicle':'Van'}
  await stage([upd]);await page.locator('#importPlanBtn').click(force=True,timeout=5000)
  sourceReview=page.get_by_role('button',name='Abbrechen – keine Änderung')
  try:
   await sourceReview.wait_for(state='visible',timeout=3000)
   await sourceReview.click(timeout=3000)
  except Exception:
   pass
  await page.wait_for_timeout(800)
  post2=await snap();matched=[r for r in post2['rides'] if r.get('sourceRow')==1 and r.get('sourceFile')=='AP01_03_TEST.json']
  rec('03 Geänderte Quelldatei erfordert Originalvergleich statt stiller Überschreibung',
      {'rows':len(post2['rides']),'matching':[(r.get('id'),r.get('driver')) for r in matched],
       'oldSafe':any(r['id']=='old-protected' for r in post2['rides']), 'status':post2['status']},
      len(matched)==1 and matched[0].get('driver')=='Lana' and len(post2['rides'])==2)
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
  await fresh_mock_page() # isolate from the forced durable preflight failure in #07
  # 8 later Storage V2 failure should not be silently success of V2
  await seed([OLD]);await stage([RIDE]);vbefore=await snap();await js("() => {window.__TEST.fail['ATMSPRO_STORAGE_V2_PHASE1']=true}")
  vpost=await clickImport();await page.wait_for_timeout(500);vpost=await snap()
  rec('08 Defekte Storage-V2-Sicherung stoppt Import ohne Datenverlust',{'count':len(vpost['rides']),'unchanged':vpost['rideRaw']==vbefore['rideRaw'],'storageV2Status':vpost['v2']['status'],'status':vpost['status']},len(vpost['rides'])==1 and vpost['rideRaw']==vbefore['rideRaw'] and vpost['v2']['status']=='error' and 'Importfehler' in vpost['status'])
  await js("() => {window.__TEST.fail['ATMSPRO_STORAGE_V2_PHASE1']=false}")
  await fresh_mock_page() # do not bypass R7 lock; restart an entirely new synthetic test page
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
  await fresh_mock_page() # independent storage fault, no inherited unresolved R7 phase
  # 12 forced localStorage failure, verify rollback
  await seed([OLD],['old-protected']);await stage([RIDE]);writeBefore=await snap();await js("() => {window.__TEST.fail.localStorageOnce='atms_beta_14_3_1_rides'}")
  writeAfter=await clickImport();
  rec('12 Fahrten-Schreibfehler führt nicht zu teilweiser Übernahme',{'same':writeAfter['rideRaw']==writeBefore['rideRaw'],'doneSame':writeAfter['doneRaw']==writeBefore['doneRaw'],'status':writeAfter['status']},writeAfter['rideRaw']==writeBefore['rideRaw'] and writeAfter['doneRaw']==writeBefore['doneRaw'] and 'Importfehler' in writeAfter['status'])
  await fresh_mock_page() # subsequent normal imports must not inherit injected faults
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
  await fresh_mock_page() # ensure completed-ride revision in #18 cannot leave an open review session
  # 19 Two genuinely different source rows at the same time are not duplicates.
  await seed([])
  parallelA={**RIDE,'id':'parallel-A','sourceFile':'AP01_PARALLEL_TEST.jpg','sourceRow':11,'driver':'Yannik'}
  parallelB={**RIDE,'id':'parallel-B','sourceFile':'AP01_PARALLEL_TEST.jpg','sourceRow':12,'driver':'Dennis'}
  await stage([parallelA,parallelB])
  # Replace the test's staged source with a REAL JPEG file's bytes; this is a
  # provenance/merge check, not a claim that the two text lines went through OCR.
  await js('''b64=>{const s=window.ATMSAP01Regression.readState();const raw=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
    s.file=new File([raw],'AP01_PARALLEL_TEST.jpg',{type:'image/jpeg'});s.files=[s.file];}''','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aksGnrZqlxIkxSSHcgnVZI3kR8KJtg2mz4o/ZuuNc8TeNNZsfFcmmSa4IGsoBZsyWDeZaNeqxSVGliuhYWyuimM483DEvlQDpbv9ojwHaW2hynU76d9ajvZbG1tNFvri5kFnKkV2DBHC0iNFJIqujqGB3cfK2JvH/wAT7zQPh2vjbwzaaL4h8PLpzarJdXmrS2ge38sSRtB5dtP5pdTwPl5KgZ3cYPwp/Z9/4VrqPhi9fWre+fRbbxFB5Nrpv2WJzquqQX52L5j+WsPkeWFy24MDlcYOlonwU/sv4YfDPwPPrP2vS/CMemx3Z+y7P7U+xQhYcjefKHnxwzEZf/V7OhJoA7/w7eX+o+H9Mu9V09NJ1Se1ilu7COfz1tpmQF4hJtXeFYld20ZxnAzitCiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//2Q==')
  parallel=await clickImport()
  rec('19 Parallele Fahrten unterschiedlicher Quellzeilen erhalten',
      {'count':len(parallel['rides']),'rows':[r.get('sourceRow') for r in parallel['rides']],'status':parallel['status']},
      len(parallel['rides'])==2 and sorted(r.get('sourceRow') for r in parallel['rides'])==[11,12])
  # 20 Time editor must preserve distinct PLAN, DISPO and LIVE axes.
  await seed([])
  tRide={**RIDE,'dispoTime':'14:50','liveTime':'15:10','flightNumber':'EW9752','flightTime':'15:20','flightLocation':'Wien'}
  await stage([tRide])
  t=await js('''() => {const api=window.ATMSAP01Regression,s=api.readState();api.openEditor(s.rides[0].id);document.querySelector('#ap01EditorFields [data-field="time"]').value='16:45';const saved=api.saveEditor();const ride=s.rides[0];return{saved,plan:ride.planTime,time:ride.time,dispo:ride.dispoTime,live:ride.liveTime,recheck:ride.ap01FlightRecheckRequired,confidence:ride.flightCheckConfidence,normalized:window.norm(ride,0).time}}''')
  rec('20 Uhrzeitkorrektur erhält DISPO/LIVE und entwertet Flugprüfung',t,
      t['saved'] and t['time']==t['plan']==t['normalized']=='16:45' and t['dispo']=='14:50' and t['live']=='15:10' and t['recheck'] and t['confidence']=='uncertain')
  await fresh_mock_page() # isolated adversarial direct API probe
  # 21 Even if an incoming caller bypasses preview-level checks, app.js
  # must reject duplicate source keys under a genuinely trusted import click.
  await seed([OLD]);await stage([RIDE]);before=await snap()
  await js('''async d=>{
    const original=window.applyImportedRides;window.__AP04_originalImport=original;
    const selected=window.ATMSP11436CurrentImportFiles()[0];
    const bytes=await selected.arrayBuffer();const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');
    const injected=d.map(r=>({...r,sourceFileSha256:hash}));
    window.applyImportedRides=()=>original(injected);
  }''',[dup1,dup2])
  after=await clickImport()
  await js('()=>{window.applyImportedRides=window.__AP04_originalImport;delete window.__AP04_originalImport}')
  rec('21 Direkte Import-API sperrt doppelte Quellzeile trotz gültigem Klick',
      {'same':before['rideRaw']==after['rideRaw'],'count':len(after['rides']),'status':after['status']},
      before['rideRaw']==after['rideRaw'] and len(after['rides'])==1 and 'doppelte Quellzeile' in after['status'])
  # 22: An unverified completed prior cannot be silently classified as a
  # new parallel trip merely because the driver differs. Protect both data and done.
  await seed([])
  completedSameCore={**RIDE,'id':'completed-parallel','driver':'Elyes','notes':'completed preserved'}
  completedSameCore.pop('sourceFile',None);completedSameCore.pop('sourceRow',None);completedSameCore.pop('planDate',None)
  await seed([completedSameCore],['completed-parallel'])
  newcomer={**RIDE,'id':'new-parallel','driver':'Yannik','sourceRow':99}
  await stage([newcomer]);parallelBlocked=await clickImport()
  old=next((r for r in parallelBlocked['rides'] if r['id']=='completed-parallel'),None)
  rec('22 Nicht belegte Parallelfahrt wird gesperrt; abgeschlossene Fahrt bleibt',
      {'count':len(parallelBlocked['rides']),'old':old.get('notes') if old else None,
       'new':next((r for r in parallelBlocked['rides'] if r['id']=='new-parallel'),None),
       'done':parallelBlocked['done'],'status':parallelBlocked['status']},
      len(parallelBlocked['rides'])==1 and old is not None and old.get('notes')=='completed preserved' and parallelBlocked['done']==['completed-parallel'] and 'Importfehler' in parallelBlocked['status'])
  summary={'date':'2026-10-13','scope':'AP-01.04 isolated modified plan-import.js and app.js, in-memory localStorage and indexedDB mocks; no productive storage','browser':'Chromium isolated about:blank full Android import HTML, full scripts loaded test-only relative URL override','passed':sum(x['pass'] for x in OUT),'failed':sum(not x['pass'] for x in OUT),'tests':OUT,'externalRequests':intercepted,'pageErrors':errs[:30],'notes':['No native Android and no external real flight provider','Verified Storage V2 async copy is not a gating condition.']}
  summary['gatePassed'] = (len(OUT) == 22 and summary['passed'] == 22 and summary['failed'] == 0 and not errs and not intercepted)
  output_path=os.environ.get('ATMS_QA_OUTPUT')
  if output_path: pathlib.Path(output_path).write_text(json.dumps(summary,ensure_ascii=False,indent=2))
  print('AP01 BROWSER GATE', 'PASS' if summary['gatePassed'] else 'FAIL', summary['passed'], '/', len(OUT), 'errors',errs[:8], 'requests',intercepted[:8])
  if not summary['gatePassed']: raise RuntimeError('AP-01.07 browser acceptance failed: no APK may be built')
  await browser.close()
asyncio.run(main())
