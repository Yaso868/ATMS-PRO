ATMS PRO · CORE-007D8A1F1D8P1136
ROW-ALIGNED TIME GEOMETRY
Datum: 07.10.2026

SOURCE OF TRUTH / PATCHBASIS
- GitHub branch: main
- vor Patch vom Nutzer verifiziert: 920d5f7
- Commit: Apply validated ATMS patch: ATMS_PRO_CORE-P1135_HEADER_TIME_GEOMETRY_RECOVERY
- Parent: abac999
- Checks: 3/3 erfolgreich
- hochgeladene frische ATMS-PRO-main.zip als Arbeitsbasis verwendet
- Source-ZIP SHA-256: 86e8a3555a6812d7a57971b51fab3959077ce13ca86cfb9e8dd4d8c2bbfd94ec
- ZIP enthält keine .git-HEAD-Metadaten; 920d5f7 wird deshalb nicht aus der ZIP abgeleitet oder geraten.

BESTÄTIGTER REALGERÄT-FEHLER
- Datei: IMG-20261007-WA0014.jpg
- Plantag: 07.10.2026
- installierte Version im Screenshot bestätigt: CORE-007D8A1F1D8P1135
- Ergebnis P113.5: FAIL
- Fehler: "Pflichtspalten nicht erkannt: time."
- keine Fahrtenanalyse / keine normale Technik-Diagnose
- 13 sichtbare Zeilen, davon 1 Storno -> 12 aktive Fahrten erwartet

WARUM P113.5 NICHT AUSREICHT
P113.5 bewertet wiederholte Uhrzeiten innerhalb bereits gruppierter OCR-Zeilen zwischen
Preis und Von. Zwei realistische Android-Zustände bleiben dadurch unzureichend abgedeckt:
1. Eine physische Tabellenzeile kann in mehrere OCR-Zeilengruppen zerfallen. Dann kann
   die P113.5-Abdeckung künstlich unter 60 % fallen, obwohl Preis und Fahrtzeit auf
   denselben physischen Zeilen korrekt vorhanden sind.
2. Fehlt der Preis-Header selbst, darf P113.5 gar nicht starten, obwohl wiederkehrende
   Preiswerte + Fahrtzeiten die linke Tabellengeometrie eindeutig belegen können.
Zusätzlich kann eine später nachweisbare time-only-Mapping-Panne auftreten, obwohl ein
primaerer Uhrzeit-Header im Rohheader vorhanden war. Deshalb reicht ein rein frueher
Header-Fallback als einziger Schutz nicht aus.

P113.6 – GEWINNENDE STRATEGIE
Neue reine Core-Funktion:
- inferRideTimeLeftGeometryFromRawWords(words, headerAnchors, imageWidth, options)

Die Funktion arbeitet direkt auf den vorhandenen OCR-RAW-Wörtern und NICHT auf der
Anzahl gruppierter OCR-Zeilen. Sie:
- sucht wiederkehrende strikte Dezimal-Preiswörter links von Von,
- sucht wiederkehrende gültige Uhrzeiten links von Von,
- clustert beide X-Geometrien,
- paart Preis und Uhrzeit ueber dieselbe physische Y-Zeile,
- verlangt mindestens 3 gematchte physische Zeilen,
- verlangt >=60 % Preiszeilen-Abdeckung UND >=60 % Zeitzeilen-Abdeckung,
- lehnt konkurrierende stabile Uhrzeitcluster ab,
- lehnt bei fehlendem Preis-Header konkurrierende Preiscluster ab,
- stellt bei starker eindeutiger Evidenz nur die fehlende linke Preis/Uhrzeit-Geometrie her.

TIME-ONLY MATRIX REPLAY
Nach dem ersten realen Matrixaufbau wird die echte Mapping-Situation geprüft.
Nur wenn exakt folgender Fehlerzustand vorliegt:
- pickup vorhanden
- destination vorhanden
- time fehlt
führt P113.6 EINEN deterministischen zweiten Matrixaufbau aus den bereits vorhandenen
RAW-OCR-Wörtern aus.

Wichtig:
- KEIN zweiter Tesseract/OCR-Aufruf
- KEINE neue Bildanalyse
- KEIN Raten von Fahrtzeiten
- der Replay ist nur bei einem echten time-only-Mapping-Fail aktiv
- ein vorhandener primaerer Header darf in diesem Replay ersetzt werden, weil der
  vorausgehende Mapping-Fail bereits beweist, dass die erste Struktur ihn downstream
  nicht korrekt nutzbar gemacht hat
- Uebernahme des Replays nur, wenn time/pickup/destination danach vollständig vorhanden sind

NO-PRICE-SCHUTZ
P113.6 erzeugt keinen Preisanker ohne wiederkehrende Dezimalpreis-Evidenz.
13-Spalten-No-Price-Layouts bleiben auf dem bestehenden Schema-Pfad. Der neue
row-aligned Recovery-Pfad bleibt dort inaktiv/fail-closed.

DIAGNOSE
Neue Metadaten:
- rideTimeRowGeometryDiagnostic
- p1136ForcedRowAlignedReplay
- observedHeaderAnchors
- p1136TimeOnlyReplay

Falls trotz P113.6 erneut nur time fehlt, wird vor dem Pflichtspalten-Abbruch eine
kompakte Diagnose angehängt:
- Grund
- gematchte Paare
- Preiszeilen
- Zeitzeilen
Damit liefert ein weiterer Android-Fail unmittelbar verwertbare Evidenz statt einer
weiteren Blind-Patch-Runde.

LOCAL-FIRST SIMULATION
Durchgeführt vor Erstellung der produktiven Patch-ZIP:
- State-Space A-X + Negativ-/Fragmentierungsfälle: 28/28 PASS
- darunter:
  * alle drei Uhrzeit-Header vorhanden
  * erster Uhrzeit-Header fehlt
  * mittlerer / letzter Header fehlt
  * mehrere Header fehlen
  * Header dedupliziert / falsch benannt
  * X-Jitter
  * Preis-Header fehlt
  * no-price control
  * pickup-1 bereits Preis
  * konkurrierender Zeitcluster
  * nur 2 Uhrzeitwerte
  * verteilte instabile X-Geometrie
  * P113.5-Line-Fragmentation-Fall

ECHTES WA0014-BILD – LOKALER RAW-WORD REPLAY
- Source image SHA-256:
  2de840c03b08ed9f97c4e020e17d90877f6d08413267f62e938aa34ebf0ed3b0
- lokale Referenz-OCR auf dem preprocessierten Originalbild:
  * Preis+erster Uhrzeit-Header entfernt -> P113.6 Recovery akzeptiert
  * 13 Preiszeilen erkannt
  * 12 lokale Uhrzeitzeilen erkannt
  * 12 physisch gematchte Preis/Zeit-Zeilen
  * Preis-Coverage 0.923
  * Zeit-Coverage 1.000
  * 14-Spalten-Schema danach vollständig
  * time=1, pickup=2, destination=3, timeMirror=6, flightTime=11
- die lokale Referenz-OCR wird NICHT mit Android/Tesseract.js gleichgesetzt; Realgerät bleibt Abschlussbeweis.

MEHRERE LÖSUNGSVARIANTEN VERGLICHEN
Verworfen:
1. P113.5-Coverage pauschal von 60 % auf 50 % senken
   - löst fehlenden Preis-Header nicht
   - senkt Sicherheitsgrenze global
2. Preis-Header generell optional machen
   - Risiko für echte No-Price-Layouts
3. pickup-1 lockern
   - Risiko für Spaltenüberschreibung/-verschiebung
4. Headerless-Fallback erzwingen
   - falscher Pfad für das vorhandene 14-Spalten-Mirror-Layout

Gewählt:
- row-aligned raw-word price/time geometry
- plus ein einziger no-new-OCR time-only Matrix-Replay

NEUER BUILD-GATE
- tools/header-time-integration-selftest-p1136.js
- Gradle task: headerTimeIntegrationP1136
- app preBuild hängt jetzt zusätzlich von diesem Gate ab
- das Gate führt den REALEN imageWordsToMatrix()+Mapping-Pfad in einer VM aus und prüft:
  * 14-Spalten-Kontrolle
  * fehlender erster Uhrzeit-Header
  * fehlender Preis + fehlender erster Uhrzeit-Header
  * forced time-only replay
  * 13-Spalten-No-Price-Kontrolle
  * No-Price ohne ersten Header: P113.6 selbst bleibt inaktiv

REGRESSIONSSCHUTZ
Unverändert geschützt:
- P113.4 Edge-Glyph / 9MB
- P113.3.1 Runtime-Smoke
- P113.3 Golden Image Replay
- bestehende P107.2 Matrix-Recovery
- 13-/14-Spalten-Schema
- timeMirror / flightTime
- Storno
- Route/Flight/Text-Integrity-Logik
- Fail-closed-Prinzip

REALGERÄT-GATE (NOCH OFFEN)
Nach erfolgreichem GitHub-Build exakt IMG-20261007-WA0014.jpg erneut analysieren.
Erwartung:
- kein "Pflichtspalten nicht erkannt: time"
- 14-Spalten-Semantik stabil
- 13 sichtbare Quellzeilen strukturiert
- 1 Storno ausgeschlossen
- 12 aktive Fahrten
- erste Uhrzeit = time
- mittlere Uhrzeit bleibt timeMirror
- letzte Uhrzeit vor Ort = flightTime
- keine nachgelagerte Spaltenverschiebung

Keine produktive Übernahme der Fahrten vor diesem Realgerät-Beweistest.
