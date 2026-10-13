import asyncio,json,pathlib,re,hashlib,os,shutil
from playwright.async_api import async_playwright
from probe import PRELOAD
BASE=pathlib.Path(__file__).resolve().parents[2] / 'app/src/main/assets'
RIDE={'id':'ap01-1','date':'2026-10-13','planDate':'2026-10-13','sourceFile':'AP01_05A_TEST.json','sourceRow':1,'time':'15:00','planTime':'15:00','driver':'Lana','pickup':'Hotel Test','destination':'DUS Airport','flightNumber':'','flightLocation':'','flightTime':'','company':'Get-E','vehicle':'Pkw','persons':2,'price':35}
async def main():
  checks=[];blocked=[];errors=[]
  async with async_playwright() as p:
    browser=await p.chromium.launch(headless=True,executable_path=(os.environ.get('ATMS_QA_CHROMIUM_PATH') or shutil.which('chromium') or shutil.which('chromium-browser') or None),args=['--no-sandbox','--disable-gpu'])
    ctx=await browser.new_context(service_workers='block',viewport={'width':420,'height':860});await ctx.add_init_script(PRELOAD)
    async def block(route): blocked.append(route.request.url);await route.abort()
    await ctx.route('**/*',block)
    page=await ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
    html=re.sub(r'<script\b[^>]*>.*?</script>','',(BASE/'index.html').read_text(),flags=re.I|re.S)
    await page.goto('about:blank');await page.set_content(html,wait_until='domcontentloaded')
    for file in ['ocr-integrity-core.js','plan-import.js','app.js']:
      src=(BASE/'js'/file).read_text()
      if file=='plan-import.js':src=src.replace("document.currentScript?.src || new URL('./js/plan-import.js', location.href).href", "'https://atms.invalid/js/plan-import.js'")
      await page.add_script_tag(content=src)
    await page.evaluate("document.dispatchEvent(new Event('DOMContentLoaded'))")
    await page.wait_for_function('window.ATMSAP01Regression && window.applyImportedRides && window.ATMSStorageV2Diagnosis()?.ready',timeout=15000)
    async def e(code,arg=None): return await page.evaluate(code,arg) if arg is not None else await page.evaluate(code)
    async def setup():
      return await e('''r=>{const s=ATMSAP01Regression.readState();s.rides=[JSON.parse(JSON.stringify(r))];s.ap01ReviewConfirmed=false;s.ap01EditorOpenId=null;s.previewOnlyAnalysis=true;atmsPrimaryVisit('import');showView('import');if(document.getElementById('ap01RideEditor'))document.getElementById('ap01RideEditor').hidden=true;return ATMSAP01Regression.openEditor('ap01-1')}''',RIDE)
    async def get():
      return await e('''()=>{const s=ATMSAP01Regression.readState();return{editor:!document.getElementById('ap01RideEditor').hidden,prompt:!document.getElementById('ap01DiscardConfirm').hidden,view:!document.getElementById('importView').classList.contains('hidden')?'import':'other',dirtyValue:document.querySelector('[data-field="vehicle"]')?.value,storedValue:s.rides[0].vehicle,openId:s.ap01EditorOpenId,confirmed:s.ap01ReviewConfirmed,audit:s.rides[0].ap01EditAudit?.length||0,err:document.getElementById('ap01EditorError').textContent,toast:document.body.innerText.slice(-400)}}''')
    async def change(v):await e('''v=>{document.querySelector('#ap01EditorFields [data-field="vehicle"]').value=v}''',v)
    async def native():await e("()=>window.dispatchEvent(new CustomEvent('atms-native-back'))")
    async def click(b):await page.locator('#'+b).click(force=True)
    def record(name,result,pass_):checks.append({'name':name,'ok':bool(pass_),'actual':result});print(('PASS' if pass_ else 'FAIL'),name,str(result)[:210],flush=True)
    await setup();await change('Van');await native();s=await get();record('01 Native Back mit ungespeichertem Wert zeigt Entscheidung ohne Hintergrundnavigation',s,s['editor'] and s['prompt'] and s['view']=='import' and s['storedValue']=='Pkw' and s['dirtyValue']=='Van')
    # Screenshot omitted for fail-closed headless build gate (no user-facing artifact generated).
    await native();s=await get();record('02 Zweite Randgeste schließt nur Rückfrage',s,s['editor'] and not s['prompt'] and s['view']=='import' and s['dirtyValue']=='Van')
    await native();await click('ap01KeepEditing');s=await get();record('03 Weiterbearbeiten erhält Eingabe und Importansicht',s,s['editor'] and not s['prompt'] and s['dirtyValue']=='Van')
    await native();await click('ap01DiscardChanges');s=await get();record('04 Verwerfen verwirft Entwurf ohne Speichereffekt',s,not s['editor'] and s['view']=='import' and s['storedValue']=='Pkw' and s['openId'] is None and not s['confirmed'])
    await setup();await change('Van');await click('ap01EditorCancel');s=await get();record('05 Abbrechen mit Änderungen fordert ausdrückliche Wahl',s,s['editor'] and s['prompt'] and s['storedValue']=='Pkw')
    await click('ap01SaveAndClose');s=await get();record('06 Speichern aus Rückfrage erhält geänderten Wert + Audit',s,not s['editor'] and s['view']=='import' and s['storedValue']=='Van' and s['audit']==1 and not s['confirmed'])
    await setup();await change('');await native();await click('ap01SaveAndClose');s=await get();record('07 Ungültige Eingabe wird nicht gespeichert / Dialog bleibt offen',s,s['editor'] and s['prompt'] and s['storedValue']=='Pkw' and bool(s['err']))
    await click('ap01KeepEditing');await change('Pkw');await native();s=await get();record('08 Zurück bei unverändertem Entwurf schließt direkt',s,not s['editor'] and not s['prompt'] and s['view']=='import')
    await setup();await change('Van');await page.keyboard.press('Escape');s=await get();record('09 Tastatur Escape nutzt denselben Sicherheitsweg',s,s['editor'] and s['prompt'] and s['view']=='import')
    await click('ap01DiscardChanges');await setup();await native();s=await get();record('10 Zurück ohne Änderung bleibt in der Importansicht',s,not s['editor'] and s['view']=='import')
    await setup();await change('Van');await e('''()=>{window.__OLD_BACK=window.ATMSAP01HandleBack;window.ATMSAP01HandleBack=null;}''');await native();s=await get();record('11 Fehlender Back-Handler navigiert nicht heimlich weiter',s,s['editor'] and s['view']=='import')
    await e('''()=>{window.ATMSAP01HandleBack=window.__OLD_BACK;delete window.__OLD_BACK;}''');await native();await click('ap01DiscardChanges')
    # Check no mutation of protected productive ride storage from the editor/back only.
    state=await e('''()=>({storedRides:window.__TEST.api.getItem('atms_beta_14_3_1_rides'),storedDone:window.__TEST.api.getItem('atms_beta_14_3_1_done')})''')
    record('12 Editor-Randgesten haben keine produktive Fahrt gespeichert',state,state['storedRides']=='[]' and state['storedDone']=='[]')
    record('13 Browser ohne Seitenfehler oder Netzwerkaufrufe',{'errors':errors[:5],'network':blocked[:5]},not errors and not blocked)
    # Android root-exit regression: while editor is open, even two system-Back events
    # may not trigger native exit or alter the base navigation state.
    await setup();await change('Van')
    root=await e('''()=>{window.__AP05A_exitCalls=0;window.ATMSNativeAppHost={exitApp:()=>{window.__AP05A_exitCalls++;}};atmsPrimaryRestore('rides',null);window.dispatchEvent(new CustomEvent('atms-native-back'));window.dispatchEvent(new CustomEvent('atms-native-back'));return {exits:window.__AP05A_exitCalls,editor:!document.getElementById('ap01RideEditor').hidden,question:!document.getElementById('ap01DiscardConfirm').hidden,ridesVisible:!document.getElementById('listView').classList.contains('hidden')}}''')
    record('14 Selbst bei Root-Ansicht verhindert offener Editor den App-Exit',root,root['exits']==0 and root['editor'] and root['ridesVisible'])
    await e("()=>{delete window.ATMSNativeAppHost;atmsPrimaryRestore('import',null)}")
    await native();await click('ap01DiscardChanges')
    # An unsaved OCR conflict rationale is also a draft and must never silently vanish.
    await e('''r=>{const s=ATMSAP01Regression.readState();s.rides=[{...r,companyOcrConflict:true,companyOcrConflictCandidate:'GetE'}]}''',RIDE)
    await e("()=>ATMSAP01Regression.openEditor('ap01-1')")
    await e("()=>{document.getElementById('ap01ConflictReason').value='Original im Bild lesbar, Quellen nicht bestätigt';}")
    await native();s=await get()
    record('15 Ungespeicherte OCR-Konfliktbegründung wird vor Verwerfen geschützt',s,s['editor'] and s['prompt'] and s['view']=='import')
    await click('ap01DiscardChanges')
    await browser.close()
  out={'date':'2026-10-13','scope':'AP-01.05A Android native-back event emulated in isolated Chromium; no actual Samsung','passed':sum(x['ok'] for x in checks),'failed':sum(not x['ok'] for x in checks),'checks':checks,'externalRequests':blocked,'pageErrors':errors}
  f=os.environ.get('ATMS_QA_NAV_OUTPUT')
  if f: pathlib.Path(f).write_text(json.dumps(out,ensure_ascii=False,indent=2))
  print('AP01 NAVIGATION GATE', 'PASS' if len(checks)==15 and not out['failed'] and not errors and not blocked else 'FAIL',out['passed'], '/',len(checks))
  if len(checks)!=15 or out['failed'] or errors or blocked:raise SystemExit(1)
asyncio.run(main())
