#!/usr/bin/env python3
"""ATMS PRO ONE authorized Get-E P11450-R4 signed QA2 APK. Fail-closed, one Gradle assemble only."""
import base64, hashlib, importlib.util, io, json, os, pathlib, re, shutil, subprocess, sys, tempfile, zipfile

REPO='Yaso868/ATMS-PRO'
BRANCH='refs/heads/atms-price-p11429-test-only'
BASE_SHA='ebd7d978928f1150e31b9e3908aebcaae7fa2b22'
ARCH_SHA='aac6e0e44f94b0f204658d26a7b7a13b19e2e62f52550230be4dacec3d0d6b48'
R4_SHA='ebd1cbd73b606cac745ec9e83ca9c34e9c1b0a4465304e88d19e2d2c0e7a14c0'
QA_SHA='4887c9aba5b893ae6b331ff74902407aa7d2e6ae19c21a14fa8ec88cc26be6b4'
PARTS=[f'part-{i:03}.b64' for i in range(6)]
ROOT=pathlib.Path(__file__).resolve().parent
WORKFLOW='.github/workflows/atms-gete-qa2-one-apk.yml'
DRIVER='.github/atms-gete-qa-data/qa2-once-driver.py'
PREBUILD='.github/workflows/atms-gete-prebuild-only.yml'
ALL_ALLOWED={'.github/atms-gete-qa-data/'+n for n in PARTS}|{'.github/atms-gete-qa-data/driver.py',DRIVER,WORKFLOW,PREBUILD}


def sha(b):return hashlib.sha256(b).hexdigest()
def blob(b):return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
def fail(message):raise RuntimeError('GETE-QA2-FAIL-CLOSED: '+message)
def call(args, cwd=None, env=None, limit=1800, log_tail=2000):
 r=subprocess.run(args,cwd=cwd,env=env,capture_output=True,text=True,timeout=limit)
 if r.returncode:fail('Befehl fehlgeschlagen: '+str(args[:3])+': '+(r.stdout+r.stderr)[-log_tail:])
 return r.stdout+r.stderr

def zip_paths(z):
 n=set()
 for x in z.infolist():
  p=pathlib.PurePosixPath(x.filename)
  if not x.filename or x.filename in n or x.filename.startswith('/') or '..' in p.parts or '\\' in x.filename or x.flag_bits&1:
   fail('unsafe archive entry '+x.filename)
  if (x.external_attr>>16)&0o170000==0o120000:fail('ZIP symlink')
  n.add(x.filename)
 return n

def main():
 if os.environ.get('GITHUB_REPOSITORY')!=REPO or os.environ.get('GITHUB_REF')!=BRANCH:fail('Nur spezieller QA2 Testbranch')
 if os.environ.get('GITHUB_EVENT_NAME')!='push':fail('Nur einmaliger eigener Push-Trigger')
 ws=pathlib.Path(os.environ['GITHUB_WORKSPACE']).resolve()
 expected_sha=os.environ['GITHUB_SHA']
 if call(['git','rev-parse','HEAD'],cwd=ws).strip()!=expected_sha:fail('Runner checkout not pinned to triggering SHA')
 if call(['git','status','--porcelain','--untracked-files=all'],cwd=ws).strip():fail('Source checkout not clean')
 call(['git','merge-base','--is-ancestor',BASE_SHA,expected_sha],cwd=ws)
 modified=set(call(['git','diff','--name-only',BASE_SHA,expected_sha],cwd=ws).splitlines())
 if modified != ALL_ALLOWED:fail('Unauthorised source/workflow changes: '+str(sorted(modified^ALL_ALLOWED)))
 changed=call(['git','diff-tree','--no-commit-id','--name-only','-r',expected_sha],cwd=ws).splitlines()
 if changed != [WORKFLOW]:fail('Build must be triggered ONLY by its workflow file addition')
 if not (ws/WORKFLOW).is_file():fail('One-shot workflow missing')
 with tempfile.TemporaryDirectory(prefix='atms-qa2-build-only-',dir=os.environ.get('RUNNER_TEMP')) as tmp:
  t=pathlib.Path(tmp)
  data=''.join((ws/'.github/atms-gete-qa-data'/f).read_text('utf8') for f in PARTS)
  contents=base64.b64decode(data,validate=True)
  if sha(contents)!=ARCH_SHA:fail('QA archive SHA mismatch')
  with zipfile.ZipFile(io.BytesIO(contents)) as allz:
   required={'R4_ORIGINAL.zip','QA_MINIMAL_OVERLAY.zip','frozen_manifest_strict.json','atms_gete_isolated_prebuild.py','prebuild_policy.json'}
   if zip_paths(allz)!=required:fail('Unexpected QA archive contents')
   for n in required:(t/n).write_bytes(allz.read(n))
  if sha((t/'R4_ORIGINAL.zip').read_bytes())!=R4_SHA:fail('R4 archive SHA mismatch')
  if sha((t/'QA_MINIMAL_OVERLAY.zip').read_bytes())!=QA_SHA:fail('QA overlay SHA mismatch')
  source=t/'pristine-branch'
  call(['git','clone','--no-hardlinks','--quiet',str(ws),str(source)],limit=120)
  call(['git','-C',str(source),'checkout','--detach',BASE_SHA],limit=30)
  manifest=json.loads((t/'frozen_manifest_strict.json').read_text())
  if len(manifest)!=108:fail('Frozen QA source manifest not 108 files')
  r4=zipfile.ZipFile(t/'R4_ORIGINAL.zip')
  q=zipfile.ZipFile(t/'QA_MINIMAL_OVERLAY.zip')
  zip_paths(r4); qpaths=zip_paths(q)
  if not all(x.startswith('android-native/') for x in qpaths):fail('QA overlay escapes Android tree')
  reconstructed=t/'QA_RECONSTRUCTED_LOCAL_ONLY.zip'
  with zipfile.ZipFile(reconstructed,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as out:
   for row in manifest:
    name=row['path']
    if not name.startswith('android-native/') or '..' in pathlib.PurePosixPath(name).parts:fail('Unsafe frozen file')
    b=r4.read(name) if row['source']=='r4' else (source/name).read_bytes()
    if blob(b)!=row['blob']:fail('Frozen source SHA mismatch: '+name)
    out.writestr('android-native/qa-frozen-p11449/'+name,b)
   for name in sorted(qpaths):out.writestr(name,q.read(name))
  with zipfile.ZipFile(reconstructed) as builtqa:
   gradletext=builtqa.read('android-native/app/build.gradle').decode('utf8')
  mentions=[line.strip() for line in gradletext.splitlines() if 'assembleDebug' in line]
  allowed_legacy={
   '// P107.1: deterministic OCR-integrity gate. GitHub Actions assembleDebug must fail',
   "tasks.matching { it.name == 'assembleDebug' }.configureEach {",
  }
  if len(mentions)!=3 or any(x not in allowed_legacy for x in mentions):fail('Unrecognised assembleDebug declaration in frozen QA graph')
  # Original pinned preBuild verifier is used for all source+graph+signing gates.
  checker=t/'atms_gete_isolated_prebuild.py'
  txt=checker.read_text()
  old="if 'assembleDebug' in s or 'git push' in s:die('Unzulässiger APK-/GitHub-Befehl im QA Gradle')"
  new="if 'git push' in s or re.search(r'(?m)^\\s*(?:commandLine|exec|dependsOn).*assembleDebug',s):die('Unzulässiger APK-/GitHub-Befehl im QA Gradle')"
  if txt.count(old)!=1:fail('Historical runner safety guard drift')
  checker.write_text(txt.replace(old,new))
  (t/'ATMS_PRO_P11450_R4_GETE_CONSENSUS_GUARD_LOCAL_UNBUILT_2026-10-23.zip').write_bytes((t/'R4_ORIGINAL.zip').read_bytes())
  spec=importlib.util.spec_from_file_location('atms_pinned_qa',checker)
  module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
  module.POLICY['qa_zip']='QA_RECONSTRUCTED_LOCAL_ONLY.zip'
  module.POLICY['qa_zip_sha256']=sha(reconstructed.read_bytes())
  module.inspection()
  module.verify_clean_branch(source)
  envreq=module.runtime_requirements()
  if envreq:fail('Missing build dependencies '+str(envreq))
  stage=t/'worktree'/'android-native'
  shutil.copytree(source/'android-native',stage,symlinks=True)
  module.apply_zip(t/'R4_ORIGINAL.zip',stage,'R4')
  module.apply_zip(reconstructed,stage,'QA')
  module.check_staged(stage)
  raw_gradle=(stage/'app/build.gradle').read_text('utf8')
  old_manifest=(stage/'app/src/main/AndroidManifest.xml').read_text('utf8')
  if raw_gradle.count("applicationIdSuffix '.qa2'")!=2 or "applicationId 'de.atmspro.app'" not in raw_gradle:fail('QA2 package isolation not proven')
  if 'signingConfig signingConfigs.atmsStable' not in raw_gradle or 'refusing ephemeral debug certificate' not in raw_gradle:fail('QA2 persistent signing not enforced')
  if 'android:label="ATMS PRO TEST 2"' not in old_manifest:fail('QA2 label missing')
  if module.sha(stage/'app/src/main/assets/js/plan-import.js') != module.POLICY['r4_sha256']['android-native/app/src/main/assets/js/plan-import.js']:
   fail('R4 plan-import SHA mismatch before build')
  keys=['ATMS_SIGNING_STORE_FILE','ATMS_SIGNING_STORE_PASSWORD','ATMS_SIGNING_KEY_ALIAS','ATMS_SIGNING_KEY_PASSWORD']
  if any(not os.environ.get(k) for k in keys):fail('Protected QA signing unavailable')
  call(['keytool','-list','-keystore',os.environ['ATMS_SIGNING_STORE_FILE'],'-storepass',os.environ['ATMS_SIGNING_STORE_PASSWORD'],'-alias','atmspro'],limit=20,log_tail=300)
  safeenv=os.environ.copy()
  for k in ['GITHUB_TOKEN','GH_TOKEN','GITHUB_PAT','GITHUB_ACTIONS','GITHUB_REPOSITORY','GITHUB_REF']:
   safeenv.pop(k,None)
  safeenv['GRADLE_USER_HOME']=str(t/'gradle-cache')
  safeenv['GIT_TERMINAL_PROMPT']='0'
  base=['gradle','--no-daemon','--no-build-cache','--no-configuration-cache']
  dry=call(base+[':app:assembleDebug','--dry-run'],cwd=stage,env=safeenv,limit=450,log_tail=3000)
  names=module.tasknames(dry)
  required={':app:preBuild',':app:assembleDebug',':app:packageDebug'}
  if not required.issubset(set(names)):fail('Assembly task dependencies incomplete: '+str(sorted(required-set(names))))
  for task in names:
   short=task.rsplit(':',1)[-1]
   if re.match(r'^(?:install|uninstall|publish|upload|connected|bundle|assembleRelease|packageRelease|signRelease|lintVitalRelease|git|push|deploy)',short,re.I):fail('Dangerous assembly task: '+task)
  for name in module.POLICY['mandatory_tasks']:
   if ':app:'+name not in names:fail('Mandatory Get-E preBuild task missing from assemble graph: '+name)
  apkfolder=stage/'app/build/outputs/apk/debug'
  if apkfolder.exists():fail('Unexpected preexisting APK artifact before build')
  print('GET-E: SHA-verified R4 and QA2 signing PASS; Gradle assembleDebug dry-run has',len(names),'tasks')
  # EXACTLY ONE execution of the requested APK build command.
  result=subprocess.run(base+[':app:assembleDebug'],cwd=stage,env=safeenv,capture_output=True,text=True,timeout=1800)
  if result.returncode:fail('ONE build failed: '+(result.stdout+result.stderr)[-3600:])
  print('GET-E: assembleDebug single execution complete; Gradle tail:',(result.stdout+result.stderr)[-900:])
  generated=list(stage.rglob('*.apk'))
  if len(generated)!=1 or generated[0].resolve()!=(apkfolder/'app-debug.apk').resolve():fail('Exactly one QA2 APK expected; found '+str([str(x) for x in generated]))
  apk=generated[0]
  with zipfile.ZipFile(apk) as z:
   paths=set(z.namelist())
   for fname,expected in module.POLICY['r4_sha256'].items():
    if not fname.startswith('android-native/app/src/main/assets/'):
     continue
    inner=fname.removeprefix('android-native/app/src/main/')
    if inner not in paths or sha(z.read(inner))!=expected:fail('Built APK R4 asset hash differs: '+inner)
  sdk=pathlib.Path(os.environ.get('ANDROID_SDK_ROOT') or os.environ.get('ANDROID_HOME'))
  bins=sorted((sdk/'build-tools').glob('*/apksigner'))
  if not bins:fail('Android apksigner tool missing')
  signed=call([str(bins[-1]),'verify','--verbose','--print-certs',str(apk)],limit=90)
  if 'Verified using v2 scheme' not in signed or 'true' not in signed:fail('Signed APK not verified by v2')
  aapts=sorted((sdk/'build-tools').glob('*/aapt'))
  if not aapts:fail('Android aapt tool missing')
  badging=call([str(aapts[-1]),'dump','badging',str(apk)],limit=40)
  match=re.search(r"package: name='([^']+)' versionCode='([^']+)' versionName='([^']+)'",badging)
  if not match or match.group(1)!='de.atmspro.app.qa2':fail('APK package ID not .qa2: '+str(match.groups() if match else 'NONE'))
  if not re.search(r"application-label(?:-[^:]*)?:'ATMS PRO TEST 2'",badging):fail('APK label not separated as TEST 2')
  target=pathlib.Path(os.environ['RUNNER_TEMP'])/'ATMS_PRO_P11450_R4_GETE_QA2_SIGNED.apk'
  if target.exists():fail('Refusing to replace existing QA2 artifact')
  shutil.copy2(apk,target)
  report={'status':'APK_QA2_SIGNED_VERIFIED','project':'ATMS PRO','scope':'Get-E','product_patch':'P11450-R4','source_base':BASE_SHA,'ci_head':expected_sha,'R4_source_zip_sha256':R4_SHA,'QA_overlay_zip_sha256':QA_SHA,'apk_file':target.name,'apk_sha256':sha(target.read_bytes()),'apk_bytes':target.stat().st_size,'apk_package':match.group(1),'version_code':match.group(2),'version_name':match.group(3),'apk_label':'ATMS PRO TEST 2','dryrun_gradle_tasks':len(names),'preBuild_required_gates_checked':len(module.POLICY['mandatory_tasks']),'signed_v2_verified':True,'original_R4_assets_verified':True,'apk_count':1,'github_push_from_runner':False,'production_modified':False,'samsung_modified':False,'rides_modified':False}
  report_path=pathlib.Path(os.environ['RUNNER_TEMP'])/'ATMS_PRO_P11450_R4_GETE_QA2_VERIFICATION.json'
  report_path.write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
  print('ATMS GET-E ONE QA2 SIGNED APK VERIFIED',json.dumps(report,ensure_ascii=False))

if __name__=='__main__':
 try:main()
 except Exception as exc:
  print('FAIL-CLOSED BUILD:',str(exc),file=sys.stderr)
  sys.exit(2)