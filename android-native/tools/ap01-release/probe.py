import asyncio, json, hashlib, pathlib, re
from playwright.async_api import async_playwright
BASE=pathlib.Path(__file__).resolve().parents[2] / 'app/src/main/assets'
PRELOAD=r'''(() => {
 const L = new Map(); const D=new Map(); const log=[]; const idblog=[];
 const api={getItem:k=>L.has(String(k))?L.get(String(k)):null,setItem:(k,v)=>{if(window.__TEST?.fail?.localStorageOnce===String(k)){window.__TEST.fail.localStorageOnce=null;throw Error('forced_local_storage_write_failure')}L.set(String(k),String(v)); log.push({op:'set',key:String(k)});},removeItem:k=>{L.delete(String(k));log.push({op:'remove',key:String(k)});},clear:()=>{L.clear();log.push({op:'clear'})},key:i=>Array.from(L.keys())[i]||null,get length(){return L.size}};
 Object.defineProperty(window,'localStorage',{configurable:true,value:api});
 api.setItem('atms_beta_14_3_1_rides','[]');api.setItem('atms_beta_14_3_1_done','[]');
 const DB = new Map(); const fail={};
 const schedule=fn=>setTimeout(fn,0);
 const IDB={open(name,version){let entry=DB.get(name);const fresh=!entry; if(!entry){entry={stores:new Map()};DB.set(name,entry)};
   const db={objectStoreNames:{contains:s=>entry.stores.has(s)},createObjectStore:s=>{const v=new Map();entry.stores.set(s,v);return{};},transaction:(s,mode)=>{
     const tx={error:null,oncomplete:null,onerror:null,onabort:null,objectStore:sn=>({get:k=>{const req={result:null,error:null,onsuccess:null,onerror:null};schedule(()=>{req.result=structuredClone(entry.stores.get(sn)?.get(k));req.onsuccess?.({target:req})});return req},put:(v,k)=>{schedule(()=>{if(fail[name]&&mode==='readwrite'&&(fail[name]===true || (fail[name]==='after' && String(v?.reason).includes('after-plan-import')))){tx.error=new Error('forced_idb_failure');tx.onabort?.({target:tx});return;}entry.stores.get(sn).set(k,structuredClone(v));idblog.push({database:name,store:sn,key:k,op:'put'});tx.oncomplete?.({target:tx})});return {}}})};return tx;},close(){}};
   const req={result:db,error:null,onupgradeneeded:null,onsuccess:null,onerror:null};schedule(()=>{if(fresh)req.onupgradeneeded?.({target:req});schedule(()=>req.onsuccess?.({target:req}))});return req;
 }};
 Object.defineProperty(window,'indexedDB',{configurable:true,value:IDB});
 window.__TEST={L,D:DB,log,idblog,fail,api, dump:()=>({storage:Object.fromEntries(L), db:Object.fromEntries([...DB].map(([k,v])=>[k,Object.fromEntries([...v.stores].map(([sn,store])=>[sn,Object.fromEntries(store)]))])),log:[...log],idblog:[...idblog]})};
 window.__ATMS_AP01_REGRESSION__=true;
})();'''
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
  ctx=await browser.new_context(service_workers='block')
  await ctx.add_init_script(PRELOAD)
  seen=[]
  async def route_handler(route):
   from urllib.parse import urlparse,unquote
   uri=urlparse(route.request.url)
   if uri.hostname=='127.0.0.1':
    filepath=BASE/unquote(uri.path).lstrip('/')
    if uri.path in ('','/') :filepath=BASE/'index.html'
    if filepath.is_file() and filepath.resolve().is_relative_to(BASE.resolve()):
     mimetype='text/html' if filepath.suffix=='.html' else 'text/javascript' if filepath.suffix=='.js' else 'text/css' if filepath.suffix=='.css' else None
     await route.fulfill(status=200,body=filepath.read_bytes(),content_type=mimetype)
    else:await route.fulfill(status=404,body='NOT FOUND')
   else:
    seen.append(route.request.url)
    await route.abort()
  await ctx.route('**/*',route_handler)
  page=await ctx.new_page();errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
  html=(BASE/'index.html').read_text(); html=re.sub(r'<script\b[^>]*>.*?</script>', '', html, flags=re.I|re.S); await page.goto('about:blank'); await page.set_content(html,wait_until='domcontentloaded');
  for script in ['ocr-integrity-core.js','plan-import.js','app.js']:
   code=(BASE/'js'/script).read_text();
   if script=='plan-import.js':code=code.replace("document.currentScript?.src || new URL('./js/plan-import.js', location.href).href","'https://atms.invalid/js/plan-import.js'");
   await page.add_script_tag(content=code,type='text/javascript')
  await page.wait_for_timeout(4000)
  result=await page.evaluate('''() => ({url:location.href,app:typeof window.applyImportedRides,plan:typeof window.ATMSP11421PreviewRegression,ready:persistenceDurableReady,rides:rides.length,storage:window.__TEST.dump(),v2:window.ATMSStorageV2Diagnosis?.(),body:document.body.innerText.slice(0,1300)})''')
  print(json.dumps({'result':result,'errors':errs[:10],'blocked':seen[:15]},ensure_ascii=False,indent=2)[:11000]);await browser.close()
if __name__ == "__main__": asyncio.run(main())
