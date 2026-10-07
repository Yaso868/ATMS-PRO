ATMS PRO · CORE-007D8A1F1D8P1135
HEADER / TIME GEOMETRY RECOVERY
Datum: 07.10.2026

SOURCE OF TRUTH / PATCHBASIS
- GitHub branch: main
- vor Patch auf Realgerät/GitHub verifiziert: e4f6933
- Commit: Apply validated ATMS patch: ATMS_PRO_CORE-P1134_REAL_DEVICE_PASS
- Checks: 3/3 erfolgreich
- P113.4 bleibt unverändert geschützt.

GOLDEN ERROR
- Datei: IMG-20261007-WA0014.jpg
- Plantag: 07.10.2026
- 13 sichtbare Tabellenzeilen, davon 1 Storno -> 12 aktive Fahrten erwartet.
- Sichtbares Layout: Preis | Uhrzeit | Von | Nach | Name | Firma | Uhrzeit | Flug ang. | Flug ausg. | Wg | Pers | Uhrzeit | Ort | Wg
- Realgerät P113.4: Analyseabbruch mit "Pflichtspalten nicht erkannt: time."
- Kein Technik/Diagnose-Bereich, weil der Fehler vor dem normalen Ride-/Diagnosepfad auftritt.

BEWIESENER KONSTRUKTIONSFEHLER
Die bestehende P107.2-Recovery inferRideTimeColumnFromMatrix() arbeitet erst NACH
Erzeugung der Tabellenmatrix. Sie kann nur eine bereits vorhandene Matrixspalte direkt
links von pickup validieren. Wenn die primäre Uhrzeit bereits beim Header-/Rasteraufbau
keinen eigenen verwertbaren Slot mehr hat, ist P107.2 zu spät und bleibt fail-closed.

P113.5 – GENERISCHE REPARATUR
Neue reine Core-Funktion:
- inferRideTimeAnchorFromRawLines(lines, headerIndex, headerAnchors)

Die Recovery läuft VOR Schemawahl / completeAtmsImageAnchors() / Matrixbildung.
Sie darf genau einen fehlenden primären Fahrtzeit-Header wiederherstellen, nur wenn:
1. Preis- und Von-Anker vorhanden und geometrisch geordnet sind.
2. Zwischen Preis und Von noch kein Uhrzeit-Anker existiert.
3. Im inneren Preis->Von-Korridor mindestens 3 Datenzeilen einen gültigen Clock-Token liefern.
4. Die stärkste X-Position mindestens 60 % der nutzbaren Zeilen abdeckt.
5. Kein zweiter stabiler Clock-Cluster (>=2 Zeilen) im selben Korridor konkurriert.
6. Die konkrete Uhrzeit selbst wird NICHT geraten oder verändert; nur der Header-Anker wird aus wiederholter Geometrie rekonstruiert.

FAIL-CLOSED BLEIBT ERHALTEN
- <3 Evidenzzeilen -> keine Recovery
- <60 % Abdeckung -> keine Recovery
- konkurrierende stabile Zeitgeometrie -> keine Recovery
- Preis/Von fehlen -> keine Recovery
- primärer Uhrzeit-Header bereits vorhanden -> keine zusätzliche Recovery

KEINE PRODUKTIONS-HARDCODES
- kein Dateiname
- keine konkrete Fahrtzeit
- kein Fahrer
- kein Flug
- kein Hotel / Ort

DIAGNOSE
imageWordsToMatrix() persistiert bei erfolgreicher Rekonstruktion:
- imageMeta.rideTimeAnchorRecovery
- recoveredFromRawData=true am rekonstruierten Header-Anker

GOLDEN REGRESSION PACK
Neu:
- source-images/IMG-20261007-WA0014.jpg (byte-identische Testquelle aus dem bestätigten Fall)
- GE-20261007-WA0014-HEADER-TIME-P1135
- p1135.realDeviceProofPending=true bis zum erneuten Realgerät-Test

REGRESSIONSSCHUTZ
- P113.4 Edge-Glyph / 9MB bleibt im kompletten Selftest enthalten.
- P113.3.1 Runtime-Smoke bleibt aktiv.
- P113.3 Golden-Image-Replay bleibt PASS.
- bestehende P107.2 Matrix-Recovery bleibt unverändert als nachgelagerter Fallback erhalten.
- 13-/14-Spalten-Schemawahl wird nicht pauschal erweitert; nur der fehlende primäre Anchor wird vor der bestehenden Schemawahl ergänzt.

LOKALE RELEASE-GATES
PASS:
- node --check app/src/main/assets/js/ocr-integrity-core.js
- node --check app/src/main/assets/js/plan-import.js
- node --check app/src/main/assets/service-worker.js
- node --check tools/ocr-regression-selftest.js
- node tools/ocr-regression-selftest.js
- node tools/plan-import-runtime-smoke-p11331.js
- python3 tools/golden-image-replay-p1133.py
- WA0014 developer replay: bei gezielt entferntem ersten Uhrzeit-Header liefert die echte Bild-OCR-Geometrie 13/13 stabile Zeitzeilen im Preis->Von-Korridor und rekonstruiert den Header-Anker; bei vorhandenem Header bleibt die Recovery inaktiv.

REALGERÄT-GATE (NOCH OFFEN)
Nach grünem GitHub-Build dieselbe Datei IMG-20261007-WA0014.jpg erneut analysieren.
Erwartung:
- kein "Pflichtspalten nicht erkannt: time"
- 13 sichtbare Quellzeilen korrekt strukturiert
- Storno bleibt Storno / nicht aktive Fahrt
- 12 aktive Fahrten
- erste Uhrzeit = time
- letzte Uhrzeit vor Ort = flightTime
- keine nachgelagerte Spaltenverschiebung
- P113.4-Referenz bei Bedarf weiterhin 33/33 und Zeile 26=9MB

Keine produktive Übernahme, bis dieser Realgerät-Beweistest bestätigt ist.
