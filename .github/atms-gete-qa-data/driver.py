#!/usr/bin/env python3
"""Fail-closed ATMS GET-E GitHub Actions verification. No APK, no GitHub writes, no user data."""
import base64, hashlib, importlib.util, io, json, os, pathlib, re, shutil, subprocess, sys, tempfile, zipfile
ROOT=pathlib.Path(__file__).resolve().parent
PIN='ebd7d978928f1150e31b9e3908aebcaae7fa2b22'
PARTS=['part-000.b64','part-001.b64','part-002.b64','part-003.b64','part-004.b64','part-005.b64']
BUNDLE_SHA256='aac6e0e44f94b0f204658d26a7b7a13b19e2e62f52550230be4dacec3d0d6b48'
R4_SHA256='ebd1cbd73b606cac745ec9e83ca9c34e9c1b0a4465304e88d19e2d2c0e7a14c0'
QA_OVERLAY_SHA256='4887c9aba5b893ae6b331ff74902407aa7d2e6ae19c21a14fa8ec88cc26be6b4'

def sha(b):return hashlib.sha256(b).hexdigest()
def blob(b):return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
def die(msg):raise RuntimeError(msg)
def cmd(*args,cwd=None,timeout=30):
 p=subprocess.run(args,cwd=cwd,capture_output=True,text=True,timeout=timeout)
 if p.returncode:die('Kommando fehlgeschlagen: '+ ' '.join(args[:3])+': '+(p.stdout+p.stderr)[-700:])
 return p.stdout.strip()
def check_zip(z):
 files=set()
 for e in z.infolist():
  p=pathlib.PurePosixPath(e.filename)
  if not e.filename or e.filename.startswith('/') or '\\' in e.filename or '..' in p.parts or e.filename in files:
   die('ZIP unzulässiger Pfad/Duplikat')
  files.add(e.filename)
 return files

def main():
 if os.environ.get('GITHUB_REPOSITORY')!='Yaso868/ATMS-PRO' or os.environ.get('GITHUB_REF')!='refs/heads/atms-price-p11429-test-only':
  die('nur isolierter Get-E Testbranch erlaubt')
 ws=pathlib.Path(os.environ['GITHUB_WORKSPACE']).resolve()
 if cmd('git','-C',str(ws),'rev-parse','HEAD') == PIN:die('QA self-trigger was not installed')
 cmd('git','-C',str(ws),'merge-base','--is-ancestor',PIN,'HEAD')
 diff=cmd('git','-C',str(ws),'diff','--name-only',PIN,'HEAD').splitlines()
 allowed={'.github/workflows/atms-gete-prebuild-only.yml'} | {'.github/atms-gete-qa-data/'+n for n in PARTS} | {'.github/atms-gete-qa-data/driver.py'}
 if set(diff)!=allowed:die('Unzulässige Änderung seit QA-Referenz: '+str(sorted(set(diff)^allowed)))
 if cmd('git','-C',str(ws),'status','--porcelain','--untracked-files=all'):
  die('GitHub checkout schmutzig')
 txt=''.join((ws/'.github/atms-gete-qa-data'/n).read_text() for n in PARTS)
 payload=base64.b64decode(txt,validate=True)
 if sha(payload)!=BUNDLE_SHA256:die('QA archiv SHA256 abweichend')
 with tempfile.TemporaryDirectory(prefix='atms-gete-ci-only-',dir=os.environ.get('RUNNER_TEMP')) as tmp:
  t=pathlib.Path(tmp)
  with zipfile.ZipFile(io.BytesIO(payload)) as z:
   files=check_zip(z)
   required={'R4_ORIGINAL.zip','QA_MINIMAL_OVERLAY.zip','frozen_manifest_strict.json','atms_gete_isolated_prebuild.py','prebuild_policy.json'}
   if files!=required:die('QA bundle hat zusätzliche/fehlende Dateien')
   for n in required:(t/n).write_bytes(z.read(n))
  if sha((t/'R4_ORIGINAL.zip').read_bytes())!=R4_SHA256:die('Original R4 SHA256 abweichend')
  if sha((t/'QA_MINIMAL_OVERLAY.zip').read_bytes())!=QA_OVERLAY_SHA256:die('QA Overlay SHA256 abweichend')
  source=t/'pristine-readonly-checkout'
  cmd('git','clone','--no-hardlinks','--quiet',str(ws),str(source),timeout=120)
  cmd('git','-C',str(source),'checkout','--detach',PIN,timeout=20)
  if cmd('git','-C',str(source),'status','--porcelain','--untracked-files=all'):die('original checkout nicht sauber')
  manifest=json.loads((t/'frozen_manifest_strict.json').read_text())
  if len(manifest)!=108:die('frozen file manifest muss 108 originale Quellen umfassen')
  r4=zipfile.ZipFile(t/'R4_ORIGINAL.zip'); qamini=zipfile.ZipFile(t/'QA_MINIMAL_OVERLAY.zip')
  check_zip(r4);qfiles=check_zip(qamini)
  if not all(x.startswith('android-native/') for x in qfiles):die('unerlaubte QA-Datei')
  qa=t/'QA_RECONSTRUCTED_LOCAL_ONLY.zip'
  with zipfile.ZipFile(qa,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as out:
   for m in manifest:
    rel=m['path']
    if not rel.startswith('android-native/') or '..' in pathlib.PurePosixPath(rel).parts:die('unsafe historical path')
    b=r4.read(rel) if m['source']=='r4' else (source/rel).read_bytes()
    if blob(b)!=m['blob']:die('frozen hist SHA mismatch '+rel)
    out.writestr('android-native/qa-frozen-p11449/'+rel,b)
   for n in sorted(qfiles):out.writestr(n,qamini.read(n))
  # Existing preBuild-only policy remains mandatory; runtime reconstructed QA ZIP is ephemeral.
  spec=importlib.util.spec_from_file_location('atms_only',t/'atms_gete_isolated_prebuild.py')
  # The original script anchors relative assets beside itself.
  (t/'ATMS_PRO_P11450_R4_GETE_CONSENSUS_GUARD_LOCAL_UNBUILT_2026-10-23.zip').write_bytes((t/'R4_ORIGINAL.zip').read_bytes())
  module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
  module.POLICY['qa_zip']='QA_RECONSTRUCTED_LOCAL_ONLY.zip'
  module.POLICY['qa_zip_sha256']=sha(qa.read_bytes())
  # All source preservation/SHA and task safety gates are delegated to the original verified local runner.
  def safe_online_execute(stage):
   env=os.environ.copy()
   for key in list(env):
    if key in {'GITHUB_TOKEN','GH_TOKEN','GITHUB_PAT','GITHUB_ACTIONS','GITHUB_REPOSITORY','GITHUB_REF'}:env.pop(key,None)
   env['GRADLE_USER_HOME']=str(stage.parent/'gradle-cache')
   env['GIT_TERMINAL_PROMPT']='0'
   gradle=['gradle','--no-daemon','--no-build-cache','--no-configuration-cache',':app:preBuild']
   dry=subprocess.run([*gradle,'--dry-run'],cwd=stage,capture_output=True,text=True,env=env,timeout=400)
   if dry.returncode:die('Gradle dry-run STOP: '+(dry.stdout+dry.stderr)[-1800:])
   tasks=module.reject_dangerous_tasks(dry.stdout)
   run=subprocess.run(gradle,cwd=stage,capture_output=True,text=True,env=env,timeout=1300)
   if run.returncode:die('Gradle preBuild STOP: '+(run.stdout+run.stderr)[-3500:])
   if list(stage.rglob('*.apk')):die('verbotene APK erzeugt')
   print('GETE P11450-R4 :app:preBuild PASS; dry-run tasks:',len(tasks))
   print('SAFE-GRADLE LOG TAIL:',(run.stdout+run.stderr)[-1000:])
   return {'gradle_preBuild':'PASS','gradle_tasks_in_dry_run':len(tasks),'apk_created':False}
  module.execute=safe_online_execute
  report=t/'final_report.json'
  sys.argv=['atms_gete_isolated_prebuild.py','--checkout',str(source),'--execute-prebuild','--report',str(report)]
  status=module.main()
  if status:die('Get-E Gradle runner FAIL-CLOSED')
  result=json.loads(report.read_text())
  if result.get('status')!='GRADLE_PREBUILD_PASS':die('preBuild konnte nicht bestätigt werden')
  dest=pathlib.Path(os.environ.get('RUNNER_TEMP',str(t)))/'atms-gete-prebuild-evidence.json'
  dest.write_text(json.dumps({'baseline_sha':PIN,'archive_sha':BUNDLE_SHA256,'result':result},indent=2))
  print('GET-E GRADLE PREBUILD VERIFIED without APK or GitHub writes')
if __name__=='__main__':
 try:main()
 except Exception as e:print('FAIL-CLOSED GET-E:',str(e),file=sys.stderr);sys.exit(2)