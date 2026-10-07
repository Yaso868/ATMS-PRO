ATMS PRO – CORE-007D8A1F1D8P1132
CHATGPT-LIKE CELL EVIDENCE · VISUAL TABLE UNDERSTANDING · 07.10.2026

ZWECK
P113.2 erweitert die bestehende P113/P113.1-Stabilisierung um ein generisches Zell-Beweismodell. Ziel ist nicht aggressivere OCR, sondern: GEOMETRIE VOR TEXT · ZELLE VOR WORT · CORRECT OR FAIL CLOSED.

FRISCHE PATCH-BASIS
- Vom Nutzer unmittelbar vor der Implementierung neu aus GitHub main heruntergeladen: ATMS-PRO-main.zip
- GitHub-Archiv-Kommentar / exakter main HEAD: c44b77e629ebf316368e5c179688476ea4fd13f8
- SHA-256 Basis-ZIP: 3e3d36c5fb6edd997bb4276c1adbe47dab92713bf2c10d18a7a92f11207c3fde
- Basis enthält CORE-007D8A1F1D8P1131 und den eingefrorenen Golden Regression Pack.

REALGERAET-BEWEIS VOR P113.2
IMG-20261007-WA0001.jpg auf P113.1:
- 33/33 Fahrten erkannt.
- EW9420 korrekt.
- OS161 korrekt.
- Marriott Seestern DUS vollständig erhalten.
- Boundary-Zeiten 05:15 / 09:20 / 09:30 korrekt.
- Novotel Köln korrekt.
- Zeile 26: Primärwert Flugort IMB, unabhängige Text-Nach-OCR 9MB.
- P113.1 blockiert den Import korrekt (Zero-Silent-Error PASS), löst den exakten Wert aber noch nicht (Exact-Value FAIL).

P113.2 ARCHITEKTUR
1) Source-Truth-Canvas
   preprocessImage() hält neben der OCR-Vorverarbeitung eine pixelgetreue, gleich skalierte Farbbild-Referenz im identischen Koordinatensystem. Nachprüfungen müssen nicht aus einem größeren Nachbarbereich rekonstruieren.

2) Rich Cell Evidence
   imageCellEvidenceForRide() dokumentiert pro Feld:
   - field / sourceRow / sourceColumn
   - cellBounds
   - rawOcr / normalizedValue
   - confidence / wordCount
   - geometryConfidence
   - verificationSource
   - cropQuality
   - verificationAttempts
   - consensus / manualCheckRequired

3) ExactCellMultiViewOCR
   Nur bei einer bereits belegten sicheren Nah-Alternative in kurzen alphanumerischen Zellen wird DIESELBE bestätigte Zelle begrenzt nachgelesen:
   - Original-Farbzelle
   - Graustufe/erhöhter Kontrast
   - lokale Threshold-Variante
   - vorhandene OCR-Vorverarbeitung
   Keine Variante darf die Nachbarspalte einschließen.

4) Crop-Quality Gate
   Auto-Korrektur ist ausgeschlossen, wenn die Zelle nicht vollständig enthalten ist, links/rechts abgeschnitten ist oder eine Nachbarspalte enthält.

5) Exact-Cell Consensus
   exactCellMultiViewConsensus() darf nur kurze 2–6-stellige alphanumerische Werte mit genau einer Zeichenabweichung automatisch korrigieren. Mehrere unterschiedliche Zellansichten müssen mit ausreichendem Stimmenabstand gewinnen. Schwacher/gespaltener Konsens bleibt blockierend.

6) Provenance bleibt sichtbar
   Automatische Korrektur speichert verificationSource=exact_cell_multi_view_consensus. Rohwert und Normalisierung werden nicht zusammengeworfen.

7) Global Fail-Closed bleibt erhalten
   manualCheckRequired kann niemals still als grüne Zeile durchlaufen. Der bestehende Zero-Silent-Error-Gate bleibt die letzte Sperre.

KEIN HARDCODING
Keine Produktionsregel für 9MB, IMB, EW9420, OS161, Nimet, Hotels, konkrete Dateinamen oder Zeilennummern. Historische Werte bleiben ausschließlich im Golden Regression Pack / Testcode.

GOLDEN REGRESSION
Der bestehende Fall GE-20261007-WA0001-R26 bleibt erhalten und wurde um den realen P113.1-Beweis ergänzt:
- Fail-Closed = PASS
- exakter Wert = noch FAIL vor P113.2
Die Originalbilddatei bleibt byte-identisch.

DETERMINISTISCHE TESTS
ocr-regression-selftest.js prüft zusätzlich:
- starken Exact-Cell-Multi-View-Konsens
- Fail-Closed bei zu kleinem Stimmenabstand
- Ablehnung abgeschnittener Zellbeweise
- Source-Truth-Canvas / Rich Cell Evidence / Provenance-Marker
- kein Leak der synthetischen P113.2-Testcodes in Produktionsdateien

LOKALE PRÜFUNG
- node --check ocr-integrity-core.js
- node --check plan-import.js
- node --check service-worker.js
- node --check ocr-regression-selftest.js
- node android-native/tools/ocr-regression-selftest.js

RELEASE-GATE
Ein GitHub-/APK-Build ist erst nach dem bestehenden validate-install-build-Workflow bestätigt. Danach Realgerät-Test mit IMG-20261007-WA0001.jpg, ohne produktive Übernahme:
- Zeile 26 muss entweder belastbar als 9MB aufgelöst werden ODER weiterhin fail-closed bleiben.
- Keine andere zuvor korrekte Zeile darf regressieren.
- Erst exakter Wert + Golden Controls + Realgerät ergeben P113.2 PASS.
