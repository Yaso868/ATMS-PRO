# ATMS PRO – verbindliche Entwicklungsregeln (08.10.2026)

**Lies zuerst die vollständige Datei `ATMS_PRO_MASTER_PROMPT_2026-10-08.md` in diesem Verzeichnis.**

Diese Regeln gelten für alle Änderungen im Android-Projekt. Der GitHub-`main`-Stand ist vor produktiven Änderungen frisch zu verifizieren. Ein beigefügtes Archiv ersetzt keinen Live-HEAD-Nachweis.

## Freigaben
- Ohne ausdrückliches **JETZT PATCHEN** keine produktive Änderung.
- Neue dauerhafte Regeln / Prozessfehler **erst nach expliziter Zustimmung** des Nutzers ins Regelregister übernehmen.
- Keine Planliste ohne Nutzerfreigabe importieren.

## Installer & Übergabe
- Genau **ein installer-kompatibles `ATMS_PRO_CORE-*.zip`** ins Repo-Root, niemals sieben Einzeldateien.
- Das gültige bestehende CI-Installer-Schema lautet: `android-native/**`, `README_*.txt` und `SHA256.txt`.
- Vor Übergabe: ZIP-Einträge, SHA256.txt, aktueller Quellstand, alle Golden-, Positiv-, Negativ-, Fail-Closed-, Runtime- und Cache-Tests prüfen.
- Download-Link, ZIP-Dateiname, SHA-256, GitHub-Repo-Root, Commit-Name und Commit-Beschreibung liefern. Alle vom Nutzer einzufügenden Werte in **separaten** Kopierblöcken.
- Android-Realgerät nur als finalen Beweistest.

## Sicherheit & Ehrlichkeit
- Keine OCR-/Flug-/Orts-/Firmen-Sonderfälle für konkrete Dateinamen oder Planzeilen in Produktionscode.
- Keine Freigabe bei konkurrierender starker Quellenevidenz; fail closed.
- Nie Test-, GitHub-HEAD- oder APK-Build-Erfolge behaupten, die nicht nachweisbar geprüft wurden.
- Bestehende P113.4/9MB- und EW9420-Regressionen bleiben geschützt.
