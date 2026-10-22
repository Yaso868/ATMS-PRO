#!/usr/bin/env python3
"""Mandatory post-assembleDebug check of final APK, not only source filenames."""
import hashlib
import gzip
import re
import sys
import zipfile
from pathlib import Path

def refuse(msg):
    raise SystemExit('FAIL P11437 APK OCR language payload: ' + msg)

def check(apk_file):
    apk = Path(apk_file)
    if not apk.is_file(): refuse(f'APK missing: {apk}')
    source = Path(__file__).resolve().parents[1] / 'app/src/main/assets/vendor/tessdata/4.0.0_best_int'
    with zipfile.ZipFile(apk) as zipf:
        bad = zipf.testzip()
        if bad: refuse(f'APK broken CRC: {bad}')
        names = set(zipf.namelist())
        wrapper = 'assets/js/atms-offline-tesseract.js'
        index = 'assets/index.html'
        for x in (wrapper,index,'assets/vendor/tesseract/5.1.1/tesseract.min.js','assets/vendor/tesseract/5.1.1/worker.min.js'):
            if x not in names: refuse(f'missing runtime file: {x}')
        js = zipf.read(wrapper).decode('utf-8')
        html = zipf.read(index).decode('utf-8')
        if not re.search(r'\bgzip\s*:\s*false\s*,',js): refuse('Tesseract gzip:false not configured in packaged wrapper')
        if not re.search(r'langPath:\s*prefix\s*\+\s*[\'\"]vendor/tessdata/4.0.0_best_int[\'\"]',js): refuse('unexpected language path')
        # P11437 introduced the safety gate; newer isolated test versions must
        # retain it. Match the packaged version to the real Gradle source rather
        # than hardcoding the old P11437 label (which rejects valid P11438).
        gradle_path = Path(__file__).resolve().parents[1] / 'app/build.gradle'
        gradle = gradle_path.read_text(encoding='utf-8')
        version_matches = re.findall(r"(?m)^\s*versionName\s+'[^']*p([0-9]+)-", gradle)
        if len(version_matches) != 1 or int(version_matches[0]) < 11437:
            refuse('Gradle OCR safety version missing or too old')
        expected = 'CORE-007D8A1F1D8P' + version_matches[0] + '</div>'
        if html.count(expected) != 1: refuse('wrong APK core version for Gradle versionName')
        if './js/atms-offline-tesseract.js?v=P11437' not in html: refuse('APK references stale OCR wrapper')
        for lang in ('eng','deu'):
            name = 'assets/vendor/tessdata/4.0.0_best_int/' + lang + '.traineddata'
            gz_name = name + '.gz'
            if name not in names: refuse('runtime 404: uncompressed path not found: ' + name)
            if gz_name in names: refuse('unexpected compressed language asset: ' + gz_name)
            if not (source/(lang + '.traineddata.gz')).is_file(): refuse('original traineddata.gz source missing: '+lang)
            expected = gzip.decompress((source/(lang+'.traineddata.gz')).read_bytes())
            actual = zipf.read(name)
            if expected != actual: refuse('APK language content mismatch: ' + lang)
            print(f'PASS {name}: {len(actual)} bytes sha256={hashlib.sha256(actual).hexdigest()}')
    print('P11437 APK OCR 404 PREVENTION PASS: actual packaged ENG/DEU paths, content, runtime wrapper and index verified')

if __name__ == '__main__':
    if len(sys.argv)!=2: refuse('usage: verify-apk-ocr-languages-p11437.py APK_PATH')
    check(sys.argv[1])
