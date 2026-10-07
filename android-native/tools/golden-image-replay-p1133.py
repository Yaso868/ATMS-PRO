#!/usr/bin/env python3
"""P113.3 test-only source-image replay.

Reads a real Golden source image, derives the target column from its header/grid,
derives the target row from the left ride-time column, then OCRs only that exact
cell with bounded views. No production mapping or plan-specific correction rule
is used. Requires Pillow + local tesseract and is intentionally a developer/release
gate, not runtime app code.
"""
from __future__ import annotations
import csv, io, json, re, shutil, subprocess, sys, tempfile
from collections import Counter
from pathlib import Path
from PIL import Image, ImageEnhance, ImageOps

ROOT = Path(__file__).resolve().parent
MANIFEST = ROOT / 'fixtures' / 'golden-regression' / 'ATMS_GOLDEN_REGRESSION_PACK_FINAL_manifest.json'
SOURCE_DIR = ROOT / 'fixtures' / 'golden-regression' / 'source-images'
CASE_ID = sys.argv[1] if len(sys.argv) > 1 else 'GE-20261007-WA0001-R26'
FIELD_HEADERS = {'flightLocation': 'Ort'}

def fail(msg: str):
    raise SystemExit(f'P113.3 Golden image replay: FAIL – {msg}')

def tsv_words(image_path: Path):
    proc = subprocess.run(['tesseract', str(image_path), 'stdout', '--psm', '6', '-l', 'eng', 'tsv'], text=True, capture_output=True)
    if proc.returncode != 0:
        fail(proc.stderr.strip() or 'tesseract TSV failed')
    out=[]
    for row in csv.DictReader(io.StringIO(proc.stdout), delimiter='\t'):
        text=(row.get('text') or '').strip()
        if not text: continue
        try:
            left,top,width,height=[int(float(row[k])) for k in ('left','top','width','height')]
            conf=float(row.get('conf') or -1)
        except Exception: continue
        out.append({'text':text,'left':left,'top':top,'right':left+width,'bottom':top+height,'cx':left+width/2,'cy':top+height/2,'conf':conf})
    return out

def vertical_rules(img: Image.Image, header_top: int, header_bottom: int):
    pix=img.load(); w,h=img.size
    y0=max(0,header_top-10); y1=min(h,header_bottom+10)
    scores=[]
    for x in range(w):
        hits=0; total=0
        for y in range(y0,y1):
            r,g,b=pix[x,y]; total+=1
            if max(r,g,b)-min(r,g,b)<15 and (r+g+b)/3<180: hits+=1
        scores.append(hits/max(1,total))
    xs=[i for i,v in enumerate(scores) if v>=0.58]
    groups=[]
    for x in xs:
        if not groups or x-groups[-1][-1]>2: groups.append([x])
        else: groups[-1].append(x)
    return [round(sum(g)/len(g)) for g in groups]

def enclosing(rules, x):
    left=max((v for v in rules if v < x), default=None)
    right=min((v for v in rules if v > x), default=None)
    if left is None or right is None or right-left<10: fail(f'no grid cell around x={x}')
    return left,right

def ocr_candidate(img: Image.Image, psm: int):
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
        path=Path(f.name)
    try:
        img.save(path)
        proc=subprocess.run(['tesseract',str(path),'stdout','--psm',str(psm),'-l','eng','-c','tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'],text=True,capture_output=True)
        return re.sub(r'[^A-Z0-9]','',(proc.stdout or '').upper())
    finally:
        path.unlink(missing_ok=True)

def main():
    if not shutil.which('tesseract'): fail('tesseract executable not found')
    manifest=json.loads(MANIFEST.read_text())
    case=next((c for c in manifest.get('cases',[]) if c.get('id')==CASE_ID),None)
    if not case: fail(f'case not found: {CASE_ID}')
    expected=case.get('expected') or {}
    field=next((f for f in FIELD_HEADERS if expected.get(f)),None)
    if not field: fail('case has no supported image-replay field')
    source=SOURCE_DIR/case['source']
    if not source.exists(): fail(f'source image missing: {source.name}')
    img=Image.open(source).convert('RGB')
    words=tsv_words(source)
    header_text=FIELD_HEADERS[field].lower()
    header=next((w for w in words if w['text'].strip().lower()==header_text and w['top']<120),None)
    if not header: fail(f'header not found: {FIELD_HEADERS[field]}')
    rules=vertical_rules(img, header['top'], header['bottom'])
    left,right=enclosing(rules,header['cx'])

    first_time_headers=sorted([w for w in words if w['text'].strip().lower().startswith('uhrzeit') and w['top']<120], key=lambda w:w['left'])
    if first_time_headers:
        time_left,time_right=enclosing(rules,first_time_headers[0]['cx'])
    else:
        # Layout-neutral fallback: first narrow cell after price. Still derived from grid, not values.
        if len(rules)<3: fail('not enough grid rules for time column')
        time_left,time_right=rules[1],rules[2]
    time_words=[w for w in words if time_left <= w['cx'] <= time_right and re.fullmatch(r'\d{1,2}:\d{2}',w['text']) and w['top']>80]
    time_words=sorted(time_words,key=lambda w:w['cy'])
    expected_time=str(expected.get('time') or '').strip()
    matching=[w for w in time_words if w['text']==expected_time] if expected_time else []
    if len(matching)==1:
        target=matching[0]
    else:
        data_index=int(case['sourceRow'])-2
        if data_index<0 or data_index>=len(time_words): fail(f'row {case["sourceRow"]} unavailable; ride-time rows={len(time_words)}')
        target=time_words[data_index]
    center=target['cy']
    gaps=[b['cy']-a['cy'] for a,b in zip(time_words,time_words[1:]) if 12 <= b['cy']-a['cy'] <= 45]
    gap=sorted(gaps)[len(gaps)//2] if gaps else 30
    top=max(0,int(round(center-gap/2)))
    bottom=min(img.height,int(round(center+gap/2)))
    if bottom-top<10: fail('invalid derived row bounds')
    cell=img.crop((left+1,top+1,right-1,bottom-1))
    gray=ImageEnhance.Contrast(ImageOps.grayscale(cell)).enhance(1.35)
    views=[
        ('full-original-psm7',cell,7),
        ('full-original-psm10',cell,10),
        ('full-gray-psm10',gray,10),
    ]
    attempts=[(name,ocr_candidate(view,psm)) for name,view,psm in views]
    usable=[v for _,v in attempts if re.fullmatch(r'[A-Z0-9]{2,6}',v or '')]
    counts=Counter(usable)
    winner,votes=(counts.most_common(1)[0] if counts else ('',0))
    exp=re.sub(r'\s+','',str(expected[field]).upper())
    status='PASS' if winner==exp and votes>=2 else 'FAIL'
    report={
        'case':CASE_ID,'source':source.name,'field':field,'sourceRow':case['sourceRow'],
        'columnBounds':[left,right],'rowBounds':[top,bottom],
        'attempts':attempts,'winner':winner,'votes':votes,'expected':exp,'status':status
    }
    print(json.dumps(report,ensure_ascii=False,indent=2))
    if status!='PASS': fail(f'expected {exp}, got {winner or "∅"} ({votes} votes)')
    print('P113.3 Golden image replay: PASS')

if __name__=='__main__': main()
