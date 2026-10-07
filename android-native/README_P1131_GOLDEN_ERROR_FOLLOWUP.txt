ATMS PRO – CORE-007D8A1F1D8P1131
GOLDEN ERROR FOLLOW-UP · 07.10.2026

ZWECK
Behebt die auf dem Realgerät mit IMG-20261007-WA0001.jpg bestätigten P113-Regressionsklassen, ohne planlisten-/flug-/hotel-spezifische Produktions-Hardcodes und ohne die bestehende fail-closed Sicherheitslogik abzuschalten.

PATCH-BASIS / NACHWEIS
- Basis ist der unmittelbar vor diesem Patch vom Nutzer neu aus GitHub-main heruntergeladene Branch-Export ATMS-PRO-main.zip.
- SHA-256 dieses Basis-Archivs: 0e1d7c2228a5a88c5e905f8ebab55224ac9ded563da60a42420e63c7ffc56ba0
- Der Export enthält bereits CORE-007D8A1F1D8P113 und den vollständigen P113 Golden Regression Pack.
- Nutzer-Screenshot des erfolgreichen P113-Workflows zeigte main / Kurz-SHA 73daa28. Ein GitHub-Branch-Export enthält keine .git-Metadaten; aus dem Kurz-SHA wird deshalb KEIN vollständiger Commit-SHA geraten.
- Historischer P113-Patch-Basis-SHA im vorhandenen P113-Manifest/README: cc73597a9b146fb1d477aa22cdac3ee9ca3c9b19.

SOURCE OF TRUTH
- android-native/tools/fixtures/golden-regression/source-images/IMG-20261007-WA0001.jpg
- SHA-256: f0b44c22cbd06afb0594920aed04e2c4eb6333c312054451af0988333526673d
- Byte-identisch zum im aktuellen Chat erneut bereitgestellten Originalbild.

ROOT CAUSE / FIXKLASSEN
1) Sekundäre Routen-OCR am linken Zellrand
   P113 behandelte eine links abgeschnittene unabhängige Nach-OCR als echten semantischen Widerspruch. P1131 erkennt nur den eng begrenzten Fall einer KUERZEREN Lesung mit sehr hohem mehrwortigem Suffix-Overlap als degradierte Rand-Evidenz. Gleich lange oder echte Inhaltsabweichungen bleiben harte Konflikte.

2) Stiller links abgeschnittener Primär-Routenwert
   Wiederholte Routen-Konsistenz darf einen eindeutigen links abgeschnittenen Einzelwert nur dann reparieren, wenn mindestens drei identische Vollwert-Belege existieren und mindestens zwei davon denselben Gegenpunkt der Route haben. Sonst bleibt der Fall offen/fail-closed.

3) Ein-Ziffer-Flugmutation
   Eine formal gültige, belastbare primäre Flugnummer darf nicht mehr von nur zwei schwachen lokalen Alternativ-Lesungen überschrieben werden. Bei moderater/hoher Primär-Konfidenz sind vier eindeutige Votes über zwei Crops erforderlich, sofern kein passender Kontext-Peer existiert. Zusätzlich prüft P1131 Standard-Flugspalten mit zwei unabhängigen Spalten-Lesungen; eine Korrektur erfolgt erst nach zwei weiteren übereinstimmenden exakten Zell-Lesungen. Unentschiedene Fälle blockieren.

4) Kurze alphanumerische Flugort-/Code-Zellen
   Bei einem 1-Zeichen-Konflikt in einer 2–5 Zeichen langen Flugort-Zelle darf der sichere Bildkandidat nur nach Batch-Evidenz plus zwei lokalen, unterschiedlich segmentierten exakten Wort-Lesungen übernommen werden. Widerspruch bleibt blockierend.

5) Fehlerzaehler vs. Datumsbestaetigung
   date_batch bleibt eine blockierende Pflichtentscheidung, wird aber nicht mehr als OCR-/Datenfehler in den Kopfzaehlern und Zeilenstatus mitgezaehlt. Import und Clean-Auto-Import bleiben bis zur Entscheidung gesperrt.

GOLDEN-ERROR-ERWEITERUNG
Die bestehende Manifestdatei wurde um die real bestaetigten P113-Faelle erweitert:
- Zeile 7: falscher Hardblock durch links abgeschnittene Sekundaer-Routen-OCR
- Zeile 12: dito
- Zeile 13: dito + EW9420 wurde zu EW8420
- Zeile 17: falscher Hardblock durch links abgeschnittene Sekundaer-Routen-OCR
- Zeile 26: vorhandener Sollwert 9MB um P113-Realgeraet-Ist IMB ergaenzt
- Zeile 29: rriott Seestern DUS ging faelschlich als OK durch
- Summary: Datumsbestaetigung getrennt vom OCR-/Datenfehlerzaehler, aber weiter blockierend

NICHT-FEHLER / ERHALTEN
- 1RA ohne Flugnummer bleibt als Ort erhalten und darf Hinweis bleiben.
- 9MB ohne Flugnummer bleibt als Ort erhalten und darf Hinweis bleiben.
- KoelnBus-Fahrerfarbenunsicherheit darf Hinweis bleiben.
- 22 Fahrten 01:35–05:45 bleiben in der einmaligen Folgetag-Bestaetigung.
- Fahrtzeit, nicht Flugzeit, bestimmt die Datumsentscheidung.
- FLIGHT-008, PLAN/DISPO/LIVE, Storage/Archiv und Persistenz werden nicht gelockert.

DETERMINISTISCHE REGRESSIONSTESTS
android-native/tools/ocr-regression-selftest.js prueft zusaetzlich:
- echte Left-Edge-Degradation vs. gleichlange semantische Konflikte
- Short-Code Batch + Dual-Local Consensus / fail-closed Gegenbeispiel
- Schutz starker Flugnummern gegen schwache Ein-Ziffer-Mutation
- neue Golden-Error-Manifestfaelle und Sollwerte
- statische Produktionsmarker fuer Flugspalten-Integritaet und Date-Batch-Separation
- Fixture-Leak-Guards gegen neue Test-Hardcodes in OCR/Parser

LOKALE PRUEFUNG VOR PAKETIERUNG
- node --check ocr-integrity-core.js: PASS
- node --check plan-import.js: PASS
- node --check service-worker.js: PASS
- node --check ocr-regression-selftest.js: PASS
- node android-native/tools/ocr-regression-selftest.js: PASS
  * P109.2 PASS
  * P110 PASS
  * P113 PASS
  * P113.1 PASS

BUILD / CI
Der bestehende Android-preBuild haengt vom Task ocrIntegrityRegression ab. Beim GitHub-Workflow muss daher vor dem APK-Paketieren der Node-Regressionstest erfolgreich laufen. Der eigentliche signierte Android-Build kann lokal in dieser Umgebung nicht ausgefuehrt werden, da kein Gradle-Runner/Signing-Secret vorhanden ist; dies bleibt bewusst dem bestehenden GitHub-Workflow vorbehalten.

REALGERAET-ABNAHME NACH GRUENEM BUILD
- About muss CORE-007D8A1F1D8P1131 anzeigen.
- IMG-20261007-WA0001.jpg erneut analysieren, NICHT automatisch produktiv uebernehmen.
- 33/33 und Reihenfolge bestaetigen.
- Zeile 13: EW9420.
- Zeile 26: 9MB.
- Zeile 29: voller Abholort.
- keine falschen Hardblocks durch abgeschnittene Sekundaer-OCR.
- OCR-/Datenfehlerzaehler konsistent; offene Datumsbestaetigung separat und weiter blockierend.
