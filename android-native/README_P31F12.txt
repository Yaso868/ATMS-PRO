ATMS PRO · P31F12 · Android Native Shell Foundation
=====================================================

Ziel dieses Schritts
--------------------
P31F12 baut den ersten echten Android-Native-Rahmen AUSSEN um ATMS.
Die vorhandene PWA/CGN-Logik wird nicht ersetzt.
Der Rahmen stellt den bereits in P31F11 bestätigten Vertrag
ATMS-FLIGHT-NATIVE-1 für DUS bereit.

Wichtig
-------
- Noch KEIN fertiges APK und noch NICHT die endgültige ATMS-Oberfläche.
- Die App lädt in P31F12 absichtlich nur assets/bridge-check.html.
- P31F13 übernimmt danach die aktuelle ATMS-Weboberfläche als lokale App-Assets.
- Dadurch kann GitHub später vollständig aus dem Laufzeitbetrieb verschwinden.

Sicherheitsregeln
-----------------
Der Native-Transport akzeptiert ausschließlich:
- HTTPS
- Host: www.dus.com
- Pfad: /api/sitecore/flightapi/SearchFlightsWithOutParams
- Methode: GET
- exakt definierte Query-Parameter
- Contract: ATMS-FLIGHT-NATIVE-1

Keine beliebigen URLs aus JavaScript werden ausgeführt.
CGN bleibt weiterhin direkt in der Webschicht abrufbar.

Dateien
-------
app/src/main/java/de/atmspro/app/MainActivity.java
app/src/main/java/de/atmspro/app/AtmsNativeFlightBridge.java
app/src/main/java/de/atmspro/app/DusRequestPolicy.java
app/src/main/assets/bridge-check.html

Nächster Entwicklungsschritt
----------------------------
P31F13: aktuelle ATMS-Webdateien lokal in die native App übernehmen,
Startseite auf ATMS umstellen und die P31F11-Bridge automatisch nutzen.
