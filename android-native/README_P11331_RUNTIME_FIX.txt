ATMS PRO – CORE-007D8A1F1D8P11331
P113.3.1 RUNTIME FIX · MASTER-RULE GATE
07.10.2026

BASIS
GitHub main HEAD vor Patch: dc705ee8656dedb1f7ecde5570ffc19dedb43217

REALGERAET-BEFUND P113.3
Planliste IMG-20261007-WA0001.jpg konnte nach Installation nicht analysiert werden.
Sichtbarer Fehler: reviewItems is not defined

ROOT CAUSE
recoverTextIntegrityTargeted() deklarierte `const reviewItems = []` innerhalb eines
try-Blocks, verwendete reviewItems aber nach dem finally erneut beim Anhängen der
Cell-Evidence. Syntax/Build blieben grün; der Fehler trat erst beim ausgeführten
Runtime-Pfad auf.

MINIMALER PRODUKTIONSFIX
- reviewItems wird einmal im Funktionsscope vor `try` angelegt.
- Keine OCR-, Konsens-, Mapping-, Flight-, Fahrer-, Datums- oder Persistenzregel
  wird für diesen Fix fachlich verändert.
- P113.3 GPT-Vision Cell Replay bleibt unverändert aktiv.

NEUES VERBINDLICHES RUNTIME-GATE
`tools/plan-import-runtime-smoke-p11331.js` führt reale Funktionskörper aus
`plan-import.js` aus:
1. recoverTextIntegrityTargeted() mit sauberer Bildzell-/Provenance-Kontrolle bis
   hinter die Review-/finally-Grenze. Genau dieser Test reproduzierte vor dem Fix
   den realen ReferenceError und muss danach PASS sein.
2. analyze() wird über einen vollständigen kontrollierten JSON-Analysepfad bis zum
   gestagten Ergebnis ausgeführt. Runtime-Exceptions werden als FAIL gewertet.

`app/build.gradle` hängt dieses Gate an `preBuild`. Damit darf GitHub Actions keine
APK mehr paketieren, wenn der Runtime-Smoke fehlschlägt.

GOLDEN REGRESSION
Der P113.3-Realgerätecrash ist als eigener Runtime-Golden-Fall dokumentiert.
Vorherige Golden-Fälle und Positive Controls bleiben erhalten.

MASTER-REGEL
Build PASS / Syntax PASS / Source-String-Selftest allein reichen nicht.
Runtime muss ausgeführt werden. CORRECT OR FAIL CLOSED.
