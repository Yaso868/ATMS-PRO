#!/usr/bin/env python3
"""Verify APK v2 signing certificate from the persistent protected keystore.
No secret contents are printed or put into a source ZIP; fail closed on any mismatch.
"""
from pathlib import Path
import hashlib,os,struct,subprocess,sys,zipfile,re

def read_u32(b,o):return struct.unpack_from('<I',b,o)[0]
def read_u64(b,o):return struct.unpack_from('<Q',b,o)[0]
def len_blob(b,o):
 n=read_u32(b,o);assert n>0 and o+4+n<=len(b), 'Invalid APK v2 length';return b[o+4:o+4+n],o+4+n

def signer_cert(apk):
 b=apk.read_bytes();eo=b.rfind(b'PK\x05\x06');assert eo>=0,'No ZIP EOCD'
 cd=read_u32(b,eo+16);assert b[cd-16:cd]==b'APK Sig Block 42', 'APK signing block missing'
 size=read_u64(b,cd-24);start=cd-size-8;assert start>=0 and read_u64(b,start)==size,'Broken signing block'
 pos=start+8
 while pos<cd-24:
  sz=read_u64(b,pos);assert sz>=4,'invalid signing pair'
  ident=read_u32(b,pos+8);payload=b[pos+12:pos+8+sz];pos+=8+sz
  if ident==0x7109871a:
   signers,_=len_blob(payload,0)
   signer,_=len_blob(signers,0)
   signed_data,_=len_blob(signer,0)
   _digests,off=len_blob(signed_data,0)
   certificates,off=len_blob(signed_data,off)
   cert,_=len_blob(certificates,0)
   return cert
 raise AssertionError('APK signature scheme v2 missing')

def verify(apk):
 assert apk.is_file(),'Missing APK'
 gradle=Path(__file__).resolve().parents[1]/'app/build.gradle'
 source=gradle.read_text()
 assert source.count("applicationIdSuffix '.qa2'")==2,'QA2 identity not enforced'
 assert 'signingConfig signingConfigs.atmsStable' in source,'Stable signing missing'
 # These credentials are already passed by GitHub workflow from protected secrets.
 keys=['ATMS_SIGNING_STORE_FILE','ATMS_SIGNING_STORE_PASSWORD','ATMS_SIGNING_KEY_ALIAS']
 env={k:os.environ.get(k) for k in keys}
 assert all(env.values()),'Persistent GitHub signer not provided; refuse ephemeral debug signing'
 keystore=Path(env['ATMS_SIGNING_STORE_FILE']);assert keystore.is_file(),'Signing keystore missing'
 k=subprocess.run(['keytool','-exportcert','-keystore',str(keystore),'-storepass',env['ATMS_SIGNING_STORE_PASSWORD'],'-alias',env['ATMS_SIGNING_KEY_ALIAS']],capture_output=True)
 assert k.returncode==0 and k.stdout,'Keystore certificate cannot be exported'
 actual=hashlib.sha256(signer_cert(apk)).hexdigest()
 expected=hashlib.sha256(k.stdout).hexdigest()
 assert actual==expected,'APK signed by wrong or randomly regenerated certificate'
 with zipfile.ZipFile(apk) as z:
  binary=z.read('AndroidManifest.xml')
  # The compiled manifest string pool exposes the final package ID in UTF-8 or UTF-16.
  assert (b'de.atmspro.app.qa2' in binary or 'de.atmspro.app.qa2'.encode('utf-16le') in binary), 'QA2 package name missing from compiled Android manifest'
 print('P11438 APK TEST2 PASS: separate package de.atmspro.app.qa2, certificate exactly matches protected persistent signer (SHA256 '+actual+')')

if __name__=='__main__':
 assert len(sys.argv)==2,'usage: verify-qa2-signed-apk-p11438.py <apk>'
 try:verify(Path(sys.argv[1]))
 except Exception as e:
  print('P11438 APK TEST2 FAIL:',str(e),file=sys.stderr);raise SystemExit(1)
