ATMS PRO – CORE-007D8A1F1D8P1134
EDGE-GLYPH ADJUDICATION · 07.10.2026

BASIS
- Frisch vom Nutzer aus GitHub main heruntergeladene ATMS-PRO-main.zip
- Basis-Marker: CORE-007D8A1F1D8P11331
- SHA-256 Basis-ZIP: 57fe3ea7e81abb0c2cc1403d0d665c8b4e60ad3eaa209a76818ed695560977ee
- Das GitHub-Branch-Archiv selbst enthält keinen verifizierbaren Commit-SHA; deshalb wird kein HEAD geraten.

REALGERAET-BEFUND VOR P113.4
Planliste IMG-20261007-WA0001.jpg · Zeile 26:
- Soll laut Original: 9MB
- Primärwert: IMB
- unabhängige Text-Nach-OCR: 9MB
- Exact Cell: full-original-psm7=leer, full-original-psm10=IMB, content-original-psm7=MB, content-original-psm10=MB, content-grayscale-psm10=leer, processed-psm8=SMB
- stabiler Kern: MB
- Randzustände: I / fehlend / S
- P113.3.1 blieb korrekt fail-closed; Import war blockiert.

P113.4 REGEL
Eine automatische Kurzcode-Auflösung ist nur zulässig, wenn ALLE Bedingungen erfüllt sind:
1. Original und unabhängiger Batch-Kandidat unterscheiden sich an genau EINEM Randzeichen (links oder rechts).
2. Der restliche Codekern ist vollständig invariant.
3. Es gibt genau einen nichtleeren unabhängigen Batch-Kandidaten; konkurrierende Batchwerte blockieren.
4. Mindestens 3 kompatible nichtleere Exact-Cell-Views bestätigen denselben Kern.
5. Diese Views stammen aus mindestens 2 Evidenzfamilien.
6. Es existieren mindestens 2 unterschiedliche Randzustände.
7. Mindestens eine Exact-Cell-View enthält den Kern mit vollständig fehlendem Randzeichen.
8. Jede nichtleere Exact-Cell-View muss zum selben Kern passen; konkurrierende Kerne blockieren.
9. Zellqualitäts-Gates bleiben aktiv: keine abgeschnittene Zielzelle, keine Nachbarspalte.
10. Keine konkrete Flugort-/Datei-/Zeilenregel in Produktionscode.

ERGEBNISLOGIK
- Bei vollständigem Gate: correctionSource=edge_glyph_adjudication; Cell-Evidence speichert Randseite, Kern, View-/Familien-/Randzustandszahlen.
- Bei irgendeiner Konkurrenz oder zu wenig Evidenz: unverändert CORRECT OR FAIL CLOSED.

REGRESSION
Der Golden-Fall GE-20261007-WA0001-R26 enthält nur die erwartete P113.4-Zielregel; realDeviceProofPending bleibt true bis zum Realgerät-Test.

RELEASE-GATE
- JavaScript-Syntaxprüfung
- deterministic OCR regression self-test
- P113.3.1 runtime smoke bleibt verpflichtend über preBuild
- GitHub validate-install-build muss grün sein
- danach Realgerät mit derselben Original-Planliste; noch keine produktive Übernahme
