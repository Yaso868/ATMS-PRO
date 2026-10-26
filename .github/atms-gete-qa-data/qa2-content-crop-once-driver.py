#!/usr/bin/env python3
"""Isolated one-shot Get-E QA2 build. Exact existing local fix; fail closed; no GitHub push."""
import base64,hashlib,io,json,os,pathlib,re,subprocess,tempfile,zipfile

REPO_DIR=pathlib.Path(__file__).resolve().parent
OLD_DRIVER=REPO_DIR/'qa2-once-driver.py'
OLD_DRIVER_BLOB='e268f2eff2165f752a8e459b84ac6a4e0b7d0f89'
FIXTURE=REPO_DIR/'content-crop-fixture.b64'
FIXTURE_SHA256='43a04ccd49104864e5bbab609a5f15e3c6b84dbd9a1a9dcf8c421ebb54d51a46'
NEW_WORKFLOW='.github/workflows/atms-gete-qa2-content-crop-once.yml'
NEW_DRIVER='.github/atms-gete-qa-data/qa2-content-crop-once-driver.py'
FIXTURE_PATH='.github/atms-gete-qa-data/content-crop-fixture.b64'
NEW_APK='ATMS_PRO_P11450_R4_GETE_CONTENT_CROP_QA2_SIGNED.apk'
NEW_REPORT='ATMS_PRO_P11450_R4_GETE_CONTENT_CROP_QA2_VERIFICATION.json'
SIGNED_CERT='b54ac60fa9e4530530cfb65479b5b1e50d8d5ec261ecb6a05baa95d223d0b5ba'


def sha(b):return hashlib.sha256(b).hexdigest()
def blob(b):return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
def deny(reason):raise RuntimeError('GET-E CONTENT-CROP FAIL-CLOSED '+reason)
def must_replace(source,old,new):
    if source.count(old)!=1:deny('verified old build driver structure drift: '+old[:60])
    return source.replace(old,new,1)

def apply_proven_content_crop(stage,module,ws):
    b64=(ws/FIXTURE_PATH).read_text('ascii')
    packed=base64.b64decode(b64,validate=True)
    if sha(packed)!=FIXTURE_SHA256:deny('original local fix fixture SHA drift')
    with zipfile.ZipFile(io.BytesIO(packed)) as z:
        names=set(z.namelist())
        required={'patch_spec.json','gete_company_hyphen_crop_regression.cjs','GETE_ORIGINAL_PIXEL_PROOF_2026-10-26.json'}
        if names!=required:deny('unexpected QA source/proof files')
        patch=json.loads(z.read('patch_spec.json'))
        test=z.read('gete_company_hyphen_crop_regression.cjs')
        pixels=z.read('GETE_ORIGINAL_PIXEL_PROOF_2026-10-26.json')
    if sha(test)!='a24f2d1717933f98da0d7bb6df37fb6d33bd19c1ab5f8795b1a3e30fe8a9ab5f':deny('17-case regression altered')
    if sha(pixels)!='f3e10e755ce445c79479a6ea5e9a4b92f9d845998d946a14ca723d0f95697048':deny('pixel proof SHA altered')
    if patch['source']!='android-native/app/src/main/assets/js/plan-import.js':deny('modified unauthorized source')
    before='902eef9225ec317b9c6e512bb43617609eca8837bc52926263a95138514cf83b'
    after='b827b59b4361f5d16fb98bc1517760be6a4ebea19581b5c076733fcf0eacef29'
    if patch['baseline_sha256']!=before or patch['patched_sha256']!=after:deny('patch source SHA drift')
    if patch['source_image_sha256']!='053e07c2d851131a278cc5b5a0241ade55e8d4c04b95b7a1ce6b8984e567c83c':deny('wrong original image evidence')
    path=stage/'app/src/main/assets/js/plan-import.js'
    orig=path.read_bytes()
    if sha(orig)!=before:deny('original R4 source differs before change')
    a=patch['old_block'].encode('utf8');b=patch['new_block'].encode('utf8')
    if orig.count(a)!=1 or not a.startswith(b'  function exactCellContentRegion(') or not b.startswith(b'  function exactCellContentRegion('):
        deny('only exactCellContentRegion may change')
    patched=orig.replace(a,b,1)
    if sha(patched)!=after:deny('local verified patch output mismatches SHA')
    path.write_bytes(patched)
    # This one explicit source exception is recorded; all other R4 checks remain pinned.
    module.POLICY['r4_sha256'][patch['source']]=after
    with tempfile.TemporaryDirectory(prefix='gete-crop-qa-',dir=str(stage.parent)) as temp:
        t=pathlib.Path(temp)
        testpath=t/'gete_company_hyphen_crop_regression.cjs'
        testpath.write_bytes(test)
        (t/'GETE_ORIGINAL_PIXEL_PROOF_2026-10-26.json').write_bytes(pixels)
        checks=[
          (['node',str(testpath),str(path)],'17/17 PASS'),
          (['node',str(stage/'tools/p11450-r4-company-list-consensus-source-guard.cjs')],'16/16 PASS'),
          (['node',str(stage/'tools/p11450-gete-source-proof-regression.cjs')],'28/28 PASS'),
          (['node',str(stage/'tools/p11450-modern-legacy-contracts.cjs')],'28/28 PASS'),
        ]
        results=[]
        for args,expected in checks:
            run=subprocess.run(args,cwd=stage,capture_output=True,text=True,timeout=180)
            combined=run.stdout+run.stderr
            if run.returncode or expected not in combined:deny('mandatory positive/negative regression failed '+expected+': '+combined[-850:])
            results.append(expected)
    print('GET-E EXISTING CROP FIX exactly SHA verified; regression',', '.join(results))
    return {'sha_before':before,'sha_after':after,'pixel_image_sha256':patch['source_image_sha256'],'checks':results,'scope':'exactCellContentRegion ONLY','unresolved_0640':'fail-closed; no automatic GetE to Get-E conversion'}


def run_one_shot():
    prior=OLD_DRIVER.read_bytes()
    if blob(prior)!=OLD_DRIVER_BLOB:deny('prior successfully signed single-build driver drift')
    source=prior.decode('utf8')
    source=must_replace(source,"WORKFLOW='.github/workflows/atms-gete-qa2-one-apk.yml'",f"WORKFLOW='{NEW_WORKFLOW}'")
    mark="ALL_ALLOWED={'.github/atms-gete-qa-data/'+n for n in PARTS}|{'.github/atms-gete-qa-data/driver.py',DRIVER,WORKFLOW,PREBUILD}"
    source=must_replace(source,mark,mark+f"\nALL_ALLOWED|={{'.github/workflows/atms-gete-qa2-one-apk.yml','{NEW_DRIVER}','{FIXTURE_PATH}'}}")
    source=must_replace(source,'  module.check_staged(stage)\n','  module.check_staged(stage)\n  crop_result=apply_proven_content_crop(stage,module,ws)\n')
    source=must_replace(source,"target=pathlib.Path(os.environ['RUNNER_TEMP'])/'ATMS_PRO_P11450_R4_GETE_QA2_SIGNED.apk'",f"target=pathlib.Path(os.environ['RUNNER_TEMP'])/'{NEW_APK}'")
    source=must_replace(source,"report_path=pathlib.Path(os.environ['RUNNER_TEMP'])/'ATMS_PRO_P11450_R4_GETE_QA2_VERIFICATION.json'",f"report_path=pathlib.Path(os.environ['RUNNER_TEMP'])/'{NEW_REPORT}'")
    source=must_replace(source,"  report_path.write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\\n')", "  report.update({'product_patch':'P11450-R4 + Get-E exact content crop','local_verified_content_crop':crop_result,'original_R4_assets_verified':'all other R4 assets unchanged; plan-import patched and verified by SHA'})\n  report_path.write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\\n')")
    source=must_replace(source,"  if 'Verified using v2 scheme' not in signed or 'true' not in signed:fail('Signed APK not verified by v2')", "  if 'Verified using v2 scheme' not in signed or 'true' not in signed:fail('Signed APK not verified by v2')\n  if 'b54ac60fa9e4530530cfb65479b5b1e50d8d5ec261ecb6a05baa95d223d0b5ba' not in signed.lower():fail('Protected signing certificate SHA-256 differs from successful QA2')")
    # The exact prior driver still validates Git commit file delta, QA2 isolation, frozen hashes, all preBuild gates and executes ONE Gradle assembleDebug.
    env={'__name__':'__main__','__file__':str(OLD_DRIVER),'apply_proven_content_crop':apply_proven_content_crop}
    exec(compile(source,str(OLD_DRIVER)+':content-crop-pin','exec'),env)

if __name__=='__main__':run_one_shot()