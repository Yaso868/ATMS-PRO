ATMS PRO – CORE-007D8A1F1D8P1133
GPT-VISION CELL REPLAY · VISUAL-FIRST SHORT-CODE EVIDENCE · 07.10.2026

ZWECK
P113.3 setzt den verbindlichen GPT-Vision-Prüfstandard technisch enger um: Originalbild -> bestätigte Tabellenzelle -> kontrollierte Zell-/Zeichenansichten -> Evidenzkonsens -> gesamte Fahrt -> CORRECT OR FAIL CLOSED.

FRISCHE PATCH-BASIS
- Vom Nutzer direkt vor der Implementierung neu aus GitHub main heruntergeladen: ATMS-PRO-main.zip
- Exakter GitHub-Archiv-HEAD: f4d326b50d1f4e13992e3fb6c78f98c2d5001588
- SHA-256 Basis-ZIP: dae86288d0a06049d1f0fce3f48ac067fcc5b8336fe2ff76f54e77302a05b02a
- Basis enthält CORE-007D8A1F1D8P1132 und das unveränderte Golden Regression Pack.

REALGERAET-BEWEIS VOR P113.3
IMG-20261007-WA0001.jpg unter P113.2:
- 33/33 Fahrten erkannt.
- 3 Hinweise, 1 Fehler.
- EW9420, OS161, Novotel Köln, Marriott Seestern DUS und Boundary-Zeiten blieben korrekt.
- Zeile 26 blieb sicher blockiert: Primär IMB, unabhängige Text-Nach-OCR 9MB.
- Zero-Silent-Error = PASS.
- Exakter Kurzcode = noch FAIL.

ROOT CAUSE P113.2
Der P113.2-Multi-View-Pfad vergrößerte die bereits auf OCR-Auflösung skalierte komplette Zelle erneut um 5x/6x. Ein Replay am unveränderten Golden-Originalbild zeigte: die native Zellansicht trägt den korrekten Kurzcode stabil, starke Re-Enlargement-Varianten können die Glyphen dagegen verschlechtern. Zusätzlich war die Kurzcode-Prüfung zu stark an einen bestimmten Batch-Vorpfad gekoppelt.

P113.3 ÄNDERUNGEN
1) Native OCR scale for exact-cell views
   - Full-cell source-truth views bleiben auf der bereits vorhandenen OCR-Auflösung (scale=1).
   - Keine erneute 5x/6x-Vergrößerung der kompletten Kurzcode-Zelle.

2) Content region inside the SAME confirmed cell
   - Aus dem Rohwort-Bounding-Box wird eine engere Zeichenregion abgeleitet.
   - Die Region wird strikt auf die bestätigten Zellgrenzen begrenzt.
   - Keine Nachbarspalte darf einbezogen werden.

3) Bounded visual diversity
   - Full cell / original / PSM7
   - Full cell / original / PSM10
   - Content region / original / PSM7
   - Content region / original / PSM10
   - Content region / grayscale / PSM10
   - Processed full cell / PSM8
   Alle Versuche bleiben innerhalb derselben Zielzelle.

4) ENG shared worker for short alphanumeric codes
   - Der bereits importweit verwendete ENG-Worker wird wiederverwendet.
   - Kein zusätzlicher ungebundener OCR-Loop.

5) Review trigger generalized
   - Ein Kurzcode kann die Zellprüfung starten bei einer unabhängigen sicheren Gegenlesung ODER niedriger Primär-Zellkonfidenz.
   - Kein konkreter Batch-Pfad ist Voraussetzung.

6) Evidence-family consensus
   - Mehrere identische Stimmen aus exakt derselben View-Familie zählen nicht als ausreichende unabhängige Evidenz.
   - Für automatische Korrektur müssen unterschiedliche Zellansichten/Transformationen zusammenpassen.
   - Sonst bleibt manualCheckRequired/fail-closed bestehen.

7) Visible unresolved evidence
   - Falls die Zellprüfung weiterhin keinen sicheren Gewinner hat, zeigt der bestehende OCR-Fehler zusätzlich die tatsächlichen Exact-Cell-View-Ergebnisse.
   - Dadurch ist der nächste Realgerät-Beweis nicht mehr blind.

GOLDEN IMAGE REPLAY
Neu: android-native/tools/golden-image-replay-p1133.py
- liest die echte Originaldatei aus dem Golden Pack,
- findet die Ort-Spalte aus Header + sichtbarem Tabellenraster,
- lokalisiert die Zielzeile aus der Fahrtzeit-Spalte,
- liest nur diese Bildzelle in mehreren begrenzten Ansichten,
- vergleicht gegen die TEST-ONLY Golden-Erwartung.

Lokaler Lauf auf dem unveränderten Original IMG-20261007-WA0001.jpg:
- abgeleitete Ort-Spalte: x=1263..1434
- abgeleitete Zielzeile: y=814..844
- full-original-psm7 = 9MB
- full-original-psm10 = 9MB
- full-gray-psm10 = 9MB
- Konsens = 9MB, 3 Stimmen
- PASS

Hinweis: Dieser lokale Replay nutzt das installierte Referenz-Tesseract und dient als echte Bild-/Geometrie-Gegenprobe. Der produktive Android-Pfad nutzt Tesseract.js; deshalb bleibt der anschließende Realgerät-Test mit dem Originalbild zwingender Release-Beweis.

KEIN HARDCODING
Keine Produktionsregel für 9MB, IMB, EW9420, OS161, Fahrer, Hotel, Dateiname oder Zeilennummer. Historische Werte stehen ausschließlich im Golden Pack / Testtool / README.

TESTS
- node --check app/src/main/assets/js/ocr-integrity-core.js
- node --check app/src/main/assets/js/plan-import.js
- node --check app/src/main/assets/service-worker.js
- node --check tools/ocr-regression-selftest.js
- node tools/ocr-regression-selftest.js
- python tools/golden-image-replay-p1133.py

RELEASE-GATE
GitHub validate-install-build muss grün sein. Danach Realgerät mit IMG-20261007-WA0001.jpg, keine produktive Übernahme:
- Zeile 26 soll 9MB nur bei tatsächlichem Exact-Cell-Konsens übernehmen.
- Bei unzureichendem Konsens weiter fail-closed.
- EW9420, OS161, Novotel Köln, Marriott Seestern DUS und Boundary-Zeiten dürfen nicht regressieren.
- Erst echter Wert + Kontrollen + kein Silent Loss = P113.3 PASS.
