// CORE-007D8A1F1D8P104_1 · 02.10.2026: ARCHIVE BROWSER READ-ONLY UI-ANCHOR-FIX – rendert die bereits verifiziert gelesene Archivansicht als robuste Unteransicht direkt im sichtbaren Backup-Bereich statt als frei an <body> angehängtes Overlay. Nur UI-Anker/Navigation; Integritätsprüfung, Archivdaten, aktive Fahrten, Storage V2, Erledigt-Status, Overrides und Archive bleiben unverändert.
// CORE-007D8A1F1D8P104 · 02.10.2026: ARCHIVE BROWSER READ-ONLY – ergänzt einen rein lesenden Archiv-Browser für verifizierte .atmsarchive-Dateien im persistenten ATMS-PRO-Archivordner. Vor Anzeige werden Datei-SHA-256, Byteanzahl, Archivformat, Payload-SHA-256, Archivdatum und Zähler gegen den lokalen Archivkatalog geprüft. Archivdaten werden nur angezeigt; aktive Fahrten, Storage V2, Erledigt-Status, Overrides und Archive werden niemals verändert.
// CORE-007D8A1F1D8P103 · 02.10.2026: CURRENT-PLAN SAFE CLEANUP – ergänzt die ausdrücklich bestätigte Bereinigungsstufe für „Nur aktuelle Planliste behalten“. Vor jeder Entfernung werden frisches ATMS-Backup, exakter Storage-V2-Abgleich und persistenter Archivordner verlangt; alle betroffenen Tage werden vorab als .atmsarchive geschrieben, nativ zurückgelesen und per SHA-256 bestätigt. Erst eine unveränderte Preflight-Freigabe darf ungeschützte Carryover-Fahrten aus aktivem Bestand, Erledigt-Status und Fahrten-Overrides entfernen; aktuelle und 📌-geschützte Fahrten bleiben erhalten. Bei Schreib-/Sync-Fehlern wird der aktive Bestand sofort zurückgerollt. Keine Änderung an OCR, Import/Dedupe, Bundles, PLAN/DISPO/LIVE oder FLIGHT-008.
// CORE-007D8A1F1D8P102.1 · 02.10.2026: CURRENT-PLAN PREVIEW UI ANCHOR FIX – mountet die bestehende rein nicht-destruktive P102-Vorschau sichtbar direkt auf der aktuellen Native-Seite „Planliste importieren“ und prüft den Mount bei jedem Öffnen erneut. Keine Änderung an 13/143-Erkennung, Behalten-Markierungen, Fahrtdaten, Import/OCR, Storage V2, PLAN/DISPO/LIVE oder FLIGHT-008.
// CORE-007D8A1F1D8P102 · 02.10.2026: CURRENT-PLAN KEEP PREVIEW – ergänzt eine ausschließlich nicht-destruktive Vorschau für „Nur aktuelle Planliste behalten“. Aktuelle Fahrten werden von P32/P99-Carryover-Fahrten getrennt gezählt; ältere Fahrten können einzeln mit 📌 Behalten geschützt werden. P102 löscht, archiviert oder verschiebt keine Fahrt. P101 Storage V2, P100, OCR, Import/Dedupe, Bundles, PLAN/DISPO/LIVE und FLIGHT-008 bleiben unverändert.
// STORAGE V2 PHASE 2B · 02.10.2026: Persistenter Android-Archivordner via Storage Access Framework. Einmal auswählen, Berechtigung dauerhaft halten, Tagesarchive kollisionsfrei direkt dort speichern und nativ byte-/SHA-256-genau zurücklesen. Phase 2A bleibt als Fallback erhalten; keine automatische Löschung aktiver Fahrten.
// CORE-007D8A1F1D8P100 · 02.10.2026: ADDRESS-CANDIDATE PC ROUNDTRIP – offene P98-Adressbuch-Kandidaten können in der Native-App als Excel/CSV exportiert, am PC ergänzt und sicher wieder importiert werden. Aktionen OFFEN/ÜBERNEHMEN/IGNORIEREN werden vor Anwendung zusammengefasst; nur neue kollisionsfreie Adressen werden additiv angelegt, bestehende Adressen niemals automatisch überschrieben oder gelöscht. Kandidaten-ID hält die Zuordnung stabil, der erkannte Originalname wird bei umbenanntem Kurzname als Alias bewahrt. P99.3/P99.2/P99.1/P99, Fahrtdaten, OCR, PLAN/DISPO/LIVE, FLIGHT-008, Bundles, Storage V2 und Persistenz bleiben unverändert.
// CORE-007D8A1F1D8P99.3 · 02.10.2026: PAST-RIDES DATE LABEL – zeigt ausschließlich im Bereich „Vergangene Fahrten“ das echte Fahrtdatum direkt auf jeder Fahrtenkarte, damit gleich aussehende historische Wiederholungen verschiedener Tage eindeutig unterscheidbar sind. Keine Änderung an Fahrtdaten, Dedupe, Import, Erledigt-Status, Bundles, Storage V2 oder FLIGHT-008.
// CORE-007D8A1F1D8P99.2 · 02.10.2026: LEGACY PARTNER/FIRMA IDENTITY FIX – korrigiert den engen P99.1-Legacy-Dedupe-Schlüssel für ältere Fahrten, bei denen derselbe sichtbare Partner historisch in partner/airline statt zusätzlich in customer gespeichert wurde. Partner/Kunde wird fachlich über partner -> airline -> customer/kunde normalisiert, Firma separat über company/firma. Alle übrigen P99.1-Fail-Closed-Guards bleiben unverändert; keine globale Dedupe-Regel.
// CORE-007D8A1F1D8P99.1 · 02.10.2026: LEGACY FLIGHT-METADATA DEDUPE – entfernt beim erneuten Import genau eine noch verbliebene Carryover-Altvariante derselben fachlich identischen Fahrt, wenn deren Flugmetadaten nachweisbar unvollständiger sind (z. B. Flugzeit irrtümlich = Fahrtzeit und Flugort fehlt). Frühzeit-/Folgetag-Korrekturen werden nur zwischen Plantag und bestätigtem Folgetag berücksichtigt; erledigte, Bundle- oder mehrdeutige Kandidaten bleiben fail-closed unangetastet. P99/P98, Storage V2 und FLIGHT-008 bleiben unverändert.
// CORE-007D8A1F1D8P99 · 02.10.2026: SOURCE-ROW REIMPORT + DATE-SAFE BUNDLES – ersetzt bei erneutem Import derselben Quellzeile sicher ältere OCR-/Datumsvarianten statt sie als Carryover zu behalten und verhindert implizite Bündel über verschiedene Fahrtage. P98-Import-Integrity, Adressbuch-Kandidaten, Storage V2 und FLIGHT-008 bleiben unverändert.
// CORE-007D8A1F1D8P98 · 01.10.2026: IMPORT-INTEGRITY + ADDRESS-CANDIDATES – verhindert implizite Bündel bei widersprüchlichem Fahrzeug/Preis, sammelt nach bestätigten Imports unbekannte Routenorte persistent als manuell prüfbare Adressbuch-Kandidaten und schützt diese zusätzlich in Safety/IndexedDB/Backup. Keine automatische Adressübernahme; Storage V2 und FLIGHT-008 bleiben unverändert.
// STORAGE V2 PHASE 2A + FINAL ICON · 01.10.2026: Nicht-destruktives Tagesarchiv mit SHA-256, nativer Write-Read-Verifikation und read-only Archivübersicht. localStorage bleibt Hauptspeicher; keine automatische Löschung/Archivierung/Umschaltung.
// STORAGE V2 PHASE 1 · 01.10.2026: Additiver IndexedDB-Paralleltest für Fahrten + Erledigt-Status. localStorage bleibt Source of Truth; keine automatische Löschung, Archivierung, Reparatur oder Umschaltung. Sichtbare Verifikation in Backup & Wiederherstellen.
// P95 BUNDLED UI 01.10.2026: Past rides default closed on fresh entry; driver color opens by tapping the color dot, redundant palette button removed.
// P95 UX CORRECTIONS 30.09.2026: Compact empty ride list before separate past-rides section; visual only.
// CORE-007D8A1F1D8P95-GATE7 · 30.09.2026: SETTINGS ABOUT SUBPAGE – verschiebt die bestehende „Über ATMS PRO“-Karte unverändert in eine eigene System-Unterseite mit Native-Mobile-Top-Bar und Android-Zurück/History. Versions-, Build-, Entwickler-, Status-, Aktualisierungs- und Datensicherungsanzeige bleiben unverändert. Keine Änderung an Daten-, Backup-, OCR-, FLIGHT-008-, PLAN/DISPO/LIVE- oder Routing-Logik.
// CORE-007D8A1F1D8P95-GATE6 · 30.09.2026: SETTINGS BACKUP & RESTORE SUBPAGE – verschiebt die bestehende, realgerätbestätigte Backup-/Restore-/Reset-Oberfläche in eine eigene kompakte Settings-Unterseite mit Native-Mobile-Top-Bar und Android-Zurück/History. Backup-Format, nativer Speichern-Dialog, Wiederherstellung, Reset-Sicherheitsabfragen und Persistenzlogik bleiben unverändert.
// CORE-007D8A1F1D8P95-GATE5 · 29.09.2026: SETTINGS IMPORT & EXPORT SUBPAGE – eigene kompakte Daten-Unterseite mit bestehendem Planlisten-Import, unverändertem Adress-Excel/CSV-Import/Export und neuem Fahrer-Excel/CSV-Export über den vorhandenen nativen Datei-Dialog. Native-Mobile-Navigation und Rückkehr aus der Planliste bleiben integriert. Keine Änderung an OCR, FLIGHT-008, PLAN/DISPO/LIVE, Routing oder Persistenz.
// CORE-007D8A1F1D8P95-GATE4 · 29.09.2026: SETTINGS DISPATCHER SUBPAGE – kompakte Disponenten-Unterseite mit Suche, Neu/Bearbeiten, Detailansicht, aktueller Disponent und zentraler Native-Mobile-Navigation auf bestehendem lokalen Disponenten-Datenspeicher. Keine Änderung an Adress-/Fahrer-, OCR-, FLIGHT-008-, PLAN/DISPO/LIVE- oder Routing-Logik.
// CORE-007D8A1F1D8P95-GATE3F4 · 29.09.2026: SETTINGS LIST SCROLL POSITION FIX – speichert beim Öffnen von Adress-/Fahrerdetails zusätzlich zum echten Android-WebView-Scrollwert den sichtbaren Listeneintrag als Anker samt Abstand zur festen Top-Bar und stellt beides bei Android-Zurück wieder her. Keine Änderung an Adress-/Fahrerdaten, History-Hierarchie, OCR, FLIGHT-008, PLAN/DISPO/LIVE, Routing oder Persistenz.
// CORE-007D8A1F1D8P95-GATE3F1 · 29.09.2026: NATIVE MOBILE SETTINGS NAVIGATION – zentrale mobile Top-Bar mit Android-Safe-Area, einklappbarer Kopfzeile, WebView-History für Android-System-Zurück/Geste und gemerkter Listen-Scrollposition für Adressen/Fahrer. Keine Änderung an Daten-, OCR-, FLIGHT-008-, PLAN/DISPO/LIVE- oder Routing-Logik.
// CORE-007D8A1F1D8P95-GATE3 · 29.09.2026: SETTINGS DRIVER SUBPAGE – echte kompakte Fahrer-Unterseite mit Suche, Alle/Aktiv/Inaktiv, Detailansicht und eigenem Editor auf bestehendem Fahrer-Datenspeicher. Keine Änderung an Adressdaten, OCR, FLIGHT-008, PLAN, DISPO, LIVE, Routing oder Fahrtenpersistenz.
// CORE-007D8A1F1D8P95-GATE2F1 · 29.09.2026: SETTINGS ADDRESS SUBPAGE NAV FIX – erzwingt die echte Adressen-Unterseite robust gegen die bestehende lange Settings-Seite; ersetzt ggf. ein altes Address-Panel und blendet während der Unterseite ausschließlich die Settings-Hauptblöcke aus. Keine Änderung an Adressdaten, Routing, OCR, FLIGHT-008, PLAN, DISPO, LIVE oder Persistenz.
// CORE-007D8A1F1D8P95-GATE1 · 29.09.2026: SETTINGS HUB – ergänzt in Einstellungen eine kompakte, gruppierte Startübersicht mit Direktzugriff auf die unverändert vorhandenen P94-Einstellungsbereiche. Keine Änderung an Adress-/Fahrer-/Disponenten-/Backup-Datenlogik, OCR, FLIGHT-008, PLAN, DISPO, LIVE, Routing oder Persistenz.
// CORE-007D8A1F1D8P93 · 29.09.2026: SIBLING-CONFIRMED ROUTE OCR NORMALIZATION – behebt den im P92-Realtest sichtbaren Rest-Duplikatfall, bei dem dieselbe Bündelfahrt nach einem Graustufen-Reimport einmal mit dem sicher wiederhergestellten Airportcode und einmal mit einem kompakten OCR-Symbolartefakt (z. B. zwei Buchstaben + ™) bestehen bleiben konnte. Eine solche kompakte Route wird ausschließlich dann normalisiert, wenn derselbe Plantag, dieselbe DISPO-Zeit, derselbe Flug, Fahrer und Partner/Firma in einer Geschwisterzeile exakt den daraus ableitbaren gültigen Drei-Buchstaben-Airportcode belegen. Keine Airport-/Hotel-/Flug-Hardcodes; ohne eindeutigen Geschwisterbeleg bleibt der Text unverändert. Die Normalisierung wird vor P73-Reimport-Matching sowohl auf Bestand als auch Neueingang angewendet, sodass bereits entstandene Carryover-Dubletten beim nächsten Import sicher zusammenfallen. P92 Missing-Route-Recovery, P77A Cleanup, P75/P75A Farben, FLIGHT-008, PLAN/DISPO/LIVE und Persistenz bleiben sonst unverändert.
// CORE-007D8A1F1D8P77A · 28.09.2026: COMPACT LEGACY-DEDUPE ROLLBACK HOTFIX – behebt den auf dem Realgerät belegten P77-Fail-Closed-Abbruch beim Schreiben des vollständigen 120-Fahrten-Rollback-Snapshots. Statt alle Fahrten nochmals in localStorage zu duplizieren, sichert P77A nur die tatsächlich zu entfernenden Altzeilen plus deren Done-Zustand und die geplanten Ersetzungen. Die Dedupe-Beweiskette selbst bleibt unverändert streng. Neuer v2-Migrationsschlüssel erzwingt genau einen frischen Lauf nach dem blockierten P77-Versuch. P76A Backup-Export, Restore, P73 Re-Import-Dedupe, OCR, FLIGHT-008, PLAN, DISPO, LIVE und übrige Persistenz bleiben unverändert.
// CORE-007D8A1F1D8P77 · 28.09.2026: LEGACY DEDUPE & CLEANUP PACK – führt genau einmal eine fail-closed Bereinigung historischer, durch überlappende Planversionen stehengebliebener Dubletten aus. Entfernt wird nur eine ältere Carryover-Fahrt, wenn zwei Nicht-Bundle-Fahrten in allen fachlich stabilen Merkmalen (Plantag, Flug, Richtung, Fahrer, Route, Firma/Kunde, Fahrzeug, Personen, Preis/Währung) identisch sind, aus unterschiedlichen Planquellen stammen und ausschließlich eine eng begrenzte Flugzeitkorrektur (≤15 Min.) ODER Planzeitkorrektur (≤45 Min.) vorliegt. Zusätzlich muss die neuere Planquelle den alten Zeitpunkt tatsächlich zeitlich überdecken. Gleiche Quelle/gleicher Plan, echte Bundles, Multi-Stop-Fahrten, parallele Fahrer und mehrdeutige Gruppen werden nicht angefasst. Vor jeder Änderung wird ein lokaler Rollback-Snapshot geschrieben; ohne Rollback kein Cleanup. P76A Backup-Export, P73 Re-Import-Dedupe, OCR, FLIGHT-008, PLAN/DISPO/LIVE und Persistenz bleiben sonst unverändert.
// CORE-007D8A1F1D8P76A · 28.09.2026: NATIVE BACKUP FILE EXPORT HOTFIX – „📤 Backup erstellen“ verwendet in der Android-App jetzt den bereits vorhandenen nativen Speichern-unter-Dialog statt des unbestätigten Browser-Downloads. Der sichtbare Sicherungszeitpunkt wird erst nach erfolgreich bestätigtem Dateischreiben aktualisiert; Abbruch/Fehler erzeugt keinen falschen „Letzte Sicherung“-Status. Web-Fallback sowie Backup-Inhalt, Wiederherstellung, Fahrten, OCR, FLIGHT-008, PLAN, DISPO, LIVE und Persistenz bleiben unverändert.
// CORE-007D8A1F1D8P75 · 27.09.2026: DRIVER PACK – übernimmt bei ausreichend eindeutigen Bild-/WhatsApp-Planlisten die erkannte Zeilenfarbe als persistente Fahrerfarbe, solange keine manuelle P74-Farbwahl Vorrang hat. Ergänzt in „Alle Fahrten“ eine Fahrer-Tagesübersicht mit echter Fahrtenanzahl nach bestehender Bündel-/Flugnummernlogik, Preis-Summe und Detailzeilen.
// P74 manuelle Farbauswahl bleibt erhalten; Farbkollisionen, P73 Dedupe, P72 Multi-Stop, P71 Scrollposition, P70 Google-Maps-Handoff sowie OCR/FLIGHT-008/PLAN/DISPO/LIVE bleiben sonst unverändert.
// CORE-007D8A1F1D8P74 · 27.09.2026: MANUAL DRIVER COLOR PICKER – In „Alle Fahrten“ kann jedem Fahrer seine feste Farbe manuell zugewiesen werden. Bei Farbkollision wird die bisherige Farbe des gewählten Fahrers mit dem betroffenen Fahrer getauscht, damit die Fahrerfarben eindeutig bleiben. Auswahl wird im bestehenden DRIVER_COLOR_KEY dauerhaft lokal gespeichert. P73 Dedupe, P72 Multi-Stop, P71 Scrollposition/Farbpersistenz, P70 Google-Maps-Handoff sowie OCR, FLIGHT-008, PLAN, DISPO und LIVE bleiben unverändert.
// CORE-007D8A1F1D8P73 · 27.09.2026: OVERLAPPING PLAN RE-IMPORT DEDUPE – Überlappende Planlisten desselben Plantags erkennen dieselbe reale Fahrt auch dann wieder, wenn sich nur die Listen-Flugzeit zwischen Planversionen geändert hat. Fahrer + DISPO-Zeit + Route + Flug bleiben stabiler Match; vorhandene Alt-Duplikate derselben stabilen Fahrt werden beim nächsten Import entfernt statt fälschlich als Bündelfahrt/Pax-Dopplung weitergeführt. Parallele Fahrten verschiedener Fahrer und echte Bündelfahrten mit unterschiedlichen Stopps bleiben getrennt. Bei geändertem Flugzeit-Tupel wird nur die stabile Ride-ID übernommen; strikte Flug-/LIVE-Verifikation wird nicht blind übertragen. P72 Multi-Stop-Routing, P71 Fahrerfarben/Scrollposition, P70 Google-Maps-Handoff, OCR, FLIGHT-008, PLAN, DISPO und LIVE bleiben sonst unverändert.
// CORE-007D8A1F1D8P72 · 27.09.2026: SAFE COMPOSITE MULTI-STOP ROUTING – Zusammengesetzte Planziele wie „NH Nord-Holiday Inn“ werden nur dann in mehrere Stopps zerlegt, wenn der Gesamtname nicht direkt auflösbar ist und jedes Teilziel exakt über das lokale Adressbuch bzw. einen bekannten Airport aufgelöst werden kann. Reihenfolge aus der Planliste bleibt unverändert; keine geratenen Adressen. P71 Fahrerfarben/Scrollposition, P70 Google-Maps-App-Handoff, CSV/Excel-Export, OCR, FLIGHT-008, PLAN, DISPO und LIVE bleiben unverändert.
// CORE-007D8A1F1D8P71 · 27.09.2026: FIXED DRIVER COLORS + RIDE LIST RETURN POSITION – Jeder Fahrer erhält eine lokal persistente, eindeutige Farbe (solange freie Farben vorhanden sind), die in Fahrtenkarten und Fahrerauswahl stabil bleibt. Beim Wechsel Fahrten → Cockpit → Fahrten wird die zuvor sichtbare Fahrt an derselben Bildschirmposition wiederhergestellt. P70 Google-Maps-Routing, CSV/Excel-Export, OCR, FLIGHT-008, PLAN, DISPO, LIVE, Adressbuch und Nachrichten bleiben unverändert.
// CORE-007D8A1F1D8P69 · 27.09.2026: NATIVE ADDRESS BOOK FILE EXPORT – CSV-/Excel-Adresslisten werden in der Android-App über einen nativen Speichern-unter-Dialog geschrieben und erst nach bestätigtem Schreibvorgang als exportiert gemeldet. Web-Fallback bleibt erhalten; Adressdaten, Import, Persistenz, OCR, FLIGHT-008, PLAN, DISPO, LIVE, Routing und Nachrichten bleiben unverändert.
// CORE-007D8A1F1D8P65 · 26.09.2026: NATIVE ADDRESS BOOK DURABLE PERSISTENCE – Schützt das lokale Orte-&-Adressen-Adressbuch zusätzlich im bestehenden Safety-Snapshot und im unabhängigen IndexedDB-Durable-Shadow. Fehlende Adressbuchdaten werden wie die bereits geschützten Flug-/Ride-Daten automatisch wiederhergestellt; absichtlicher kompletter ATMS-Reset löscht den Schutz weiterhin. Keine Änderung an OCR, FLIGHT-008, PLAN, DISPO, LIVE, Routing oder bestehenden Adressinhalten.
// CORE-007D8A1F1D8P52 · 25.09.2026: MANUAL-REVIEW VISIBILITY CONSISTENCY FIX – Offene Flugprüfungen werden auch bei Bündelfahrten ohne Flugort sowie im Cockpit sichtbar als „⚠ manuell prüfen“ dargestellt. Airport-Konflikte behalten ihre eigene Warnung. Keine Änderung an OCR, FLIGHT-008, PLAN, DISPO, LIVE, Bündelbildung oder Persistenz.
// CORE-007D8A1F1D8P50 · 25.09.2026: MANUAL-CHECK WITHOUT FLIGHT NUMBER FIX – Explizite Konflikt-/Manual-Check-Sicherheitsflags werden vor dem Vorhandensein einer Flugnummer ausgewertet. Dadurch bleibt eine OCR-Fahrt ohne erkannte Flugnummer bei flightNeedsManualCheck=true sichtbar „⚠ manuell prüfen“. Keine Änderung an OCR, PLAN, DISPO, LIVE oder FLIGHT-008-Verifikationsregeln.
// CORE-007D8A1F1D8P44 · 24.09.2026: NATIVE DUS ACTUAL ARRIVAL APPLY – Übernimmt bei DUS-Ankünften ausschließlich die vom P44-Gate freigegebene offizielle DUS-Actual-Zeit als operative LIVE-Landungszeit und berechnet daraus den bestehenden Arrival-Puffer. Voraussetzung bleibt die unabhängige FlightStats-Bestätigung von exakter Identität/Route + Status landed. Die Minute selbst gilt nicht als Zwei-Quellen-minutengenau bestätigt; FR24 bleibt manuelle Zusatzkontrolle. PLAN/DISPO und Abflug-Abholzeiten bleiben unverändert.
// CORE-007D8A1F1D8P40 · 24.09.2026: NATIVE LIVE STATUS AUTO-CONFIRM – ergänzt im Native-LIVE-Bereich eine registrierungsfreie Zwei-Quellen-Statusprüfung über die vorhandene DUS-/FlightStats-Bridge. Automatisch übernommen werden ausschließlich exakt übereinstimmende, im P39/P39F1-Realtest belegte Status departed/landed/cancelled; scheduled/on_time/delayed bleiben ohne eigene Zweitquellenzeit offen. Estimated/Actual/LIVE-Zeit bleiben leer, PLAN/DISPO unverändert und manuell bestätigte Landungen/Abflüge geschützt.
// CORE-007D8A1F1D8P36F22 · 24.09.2026: NATIVE AIRPORT-CONFLICT USER WARNING – Zeigt einen von der strikten Importprüfung gesetzten datumsspezifischen Airport-Konflikt sichtbar in Fahrtenkarte und Cockpit. Die Fremdroute bleibt reine Warn-/Diagnoseinformation und wird niemals als Flugort übernommen. Nur verified/high bleibt warnungsfrei.
// CORE-007D8A1F1D8P36F7 · 23.09.2026: NATIVE MANUAL CHECK SAFETY RESTORE – Stellt die FLIGHT-008-Sicherheitsanzeige wieder her: nur verified/high (mindestens zwei unabhaengige datumsspezifische Quellen) ist warnungsfrei. source_confirmed aus genau einer Quelle, unsichere/manuelle Pruefungen, Quellenkonflikte und Fluege ohne verifizierten Flugort zeigen sichtbar "⚠ manuell prüfen". Die Einquellen-Route darf weiterhin als source_confirmed angezeigt werden; PLAN/DISPO/LIVE, OCR, Airport-Bridge, Persistenz, GPS, Routing und Nachrichten bleiben unverändert.
// CORE-007D8A1F1D8P36F1 · 23.09.2026: NATIVE CLEAN-PLAN AUTO-IMPORT AUTH BRIDGE – Der echte Nutzer-Klick auf „Planliste analysieren“ autorisiert die bestehende asynchrone Morgen-Modus-/Auto-Flight-Pipeline sicher bis zur finalen Übernahme. Programmgesteuerte Klicks bleiben blockiert; die finale Freigabe erzeugt unmittelbar vor applyImportedRides() die bestehende kurzlebige CORE-006A-Importfreigabe. Keine Änderung an OCR, Flugmatching, PLAN/DISPO/LIVE, Persistenz oder Signing.
// CORE-007D8A1F1D8P33F1 · 22.09.2026: CLEAN START FLIGHT CACHE FIX – Clean-Start-Sicherheits-Snapshot verwendet die vorhandene getFlightCache()-API statt der nicht definierten readFlightCache-Referenz. P33-Historie, P32-Merge, P31-Flugsemantik sowie PLAN/DISPO/LIVE bleiben unverändert.
// CORE-007D8A1F1D8P33 · 22.09.2026: VISIBLE PLAN HISTORY & CLEAN START – sichtbare Planlisten-Historie, gezieltes Historien-Löschen und sicherer Neustart des Planbereichs; P32-Merge, P31-Flugsemantik, PLAN/DISPO/LIVE-Trennung und Grund-Einstellungen bleiben geschützt.
// CORE-007D8A1F1D8P32 · 22.09.2026: IMPORT SESSION HISTORY & CONSERVATIVE RIDE MERGE – Neue Planimporte erhalten eigene Sitzungen/Phasen; alte Gemini-/LIVE-Anzeige wird bei neuer Plananalyse getrennt; identische offene Fahrten behalten ihre stabile ID und bestätigte Metadaten; nicht sicher gematchte alte offene Fahrten werden nicht blind gelöscht, sondern als Carryover markiert. P31-Flugsemantik, PLAN/DISPO/LIVE-Trennung und Persistenz-Schutz bleiben erhalten.
// CORE-007D8A1F1D8P31 · 21.09.2026: SOURCE-CONFIRMED FLIGHT LOCATION
// Eine eindeutige datumsspezifische Einzelquelle darf bei leerem/konfliktfreiem Planort den Flugort als source_confirmed übernehmen; verified/high bleibt strikt Zwei-Quellen-pflichtig. PLAN/DISPO/LIVE/GPS/Nachrichten bleiben unverändert.
// CORE-007D8A1F1D8P30 · 21.09.2026: SINGLE PREPARED MESSAGE DELETE
// Einzelne echte vorbereitete Nachricht kann lokal sicher ausgeblendet werden; PLAN/DISPO/LIVE/GPS bleiben unverändert.
// CORE-007D8A1F1D8P29 · 21.09.2026: COCKPIT STALE LIVE PICKUP DISPLAY FIX
// Cockpit zeigt AKTUELLE ABHOLZEIT nur bei nutzbaren, frischen LIVE-Daten; sonst --:--. DISPO bleibt unverändert.
// CORE-007D8A1F1D8P28 · 21.09.2026: DEPARTURE DISPO LOCK + ARRIVAL NO-LIVE DISPLAY + DRIVER PROFILE LINK – Abflugverspätungen bleiben reine Fluginfo und verändern niemals die Abhol-/DISPO-Zeit; Ankunft ohne bestätigte LIVE-Abholzeit zeigt im Cockpit --:--; Live-Dispo verknüpft Fahrerprofile robuster mit importierten Fahrern. Bestehende Stable-Funktionen bleiben unverändert.
// CORE-007D8A1F1D8P27 · 17.09.2026: LIVE-DISPO PICKUP DELAY BASIS FIX – Fahrerwarnungen und Live-Dispo-Verspätungsbewertung verwenden jetzt ausschließlich die Differenz zwischen bestätigter LIVE-Abholzeit und DISPO-Zeit (Fallback PLAN), nicht mehr die reine Flugverspätung am Airport. Flugstatus, LIVE-Ankunft/Abflug, Arrival-Puffer, PLAN/DISPO/LIVE-Trennung, GPS, Routing, Nachrichten, Fahrer und Persistenz bleiben unverändert.
// CORE-007D8A1F1D8P26S · 17.09.2026: LIVE-DISPO VISUAL BALANCE PACK – Übernimmt den bestätigten Zielbild-Feinschliff konservativ: der obere Button wird eindeutig als Live-Dispo-spezifisch benannt, verbliebene Legacy-Einzelbedienelemente werden im eingeklappten Zielbild sicher ausgeblendet und die mobile Vertikalbalance wird leicht gestrafft. Maximale P26Q-Lesbarkeit, globale Bottom-Navigation sowie LIVE-/PLAN-/DISPO-, GPS-, Routing-, Nachrichten-, Fahrer- und Persistenzlogik bleiben unverändert.
// CORE-007D8A1F1D8P26R · 17.09.2026: LIVE-DISPO TRAILING SPACE CLEANUP – Entfernt im eingeklappten Live-Dispo-Zustand ausschließlich verbliebene Legacy-Nachlaufbereiche hinter dem Zielbild und hebt eine mögliche Mindesthöhe des Live-Views auf. Dadurch endet die Zielbild-Hauptansicht direkt nach der Warnkarte statt mit unnötigem Leerraum. Beim Öffnen von „⚙ Einstellungen“ werden markierte Legacy-Bereiche wiederhergestellt. Keine Änderung an LIVE-/PLAN-/DISPO-, GPS-, Routing-, Navigation-, Nachrichten-, Fahrer- oder Persistenzlogik.
// CORE-007D8A1F1D8P26Q · 17.09.2026: LIVE-DISPO MAX SAFE READABILITY – Hebt ausschließlich kleine/sekundäre Texte der mobilen Live-Dispo auf die größtmögliche noch stabile Lesbarkeitsstufe an. Große Überschriften, Hauptzahlen, Navigation sowie LIVE-/PLAN-/DISPO-/GPS-/Nachrichten-/Persistenzlogik bleiben unverändert.
// CORE-007D8A1F1D8P26P · 17.09.2026: LIVE-DISPO MOBILE COMPACT HEIGHT POLISH – Reduziert ausschließlich vertikale Abstände und Kartenhöhen der mobilen Live-Dispo, ohne die in P26K vergrößerte Schrift zurückzunehmen. Ziel: kompaktere Zielbild-Proportionen bei unveränderter Lesbarkeit. Keine Änderung an LIVE-/PLAN-/DISPO-, GPS-, Routing-, Nachrichten-, Fahrer-, Navigation- oder Persistenzlogik.
// CORE-007D8A1F1D8P26O · 17.09.2026: LIVE-DISPO BOTTOM-NAV EXACT BASELINE MATCH – Die Live-Dispo übernimmt für die globale untere Navigation exakt die bereits funktionierende Darstellung aus den übrigen Ansichten. Vor dem Wechsel in Live-Dispo werden die berechneten Layoutwerte der Bottom-Navigation gesichert und dort unverändert wiederverwendet; P26M/P26N-Sonderdarstellungen können dadurch Höhe, Position oder Einstellungen-Label nicht mehr sichtbar verändern. Reine UI-Darstellung; keine Änderung an Navigation-Funktion, LIVE-/PLAN-/DISPO-, GPS-, Routing-, Nachrichten-, Fahrer- oder Persistenzlogik.
// CORE-007D8A1F1D8P26N · 17.09.2026: LIVE-DISPO BOTTOM-NAV SETTINGS LABEL FIT – Korrigiert ausschließlich die Darstellung des globalen „⚙ Einstellungen“-Ziels in der 6er-Bottom-Navigation der Live-Dispo: Icon und Beschriftung werden auf schmalen Android-Ansichten wieder sauber untereinander und vollständig innerhalb ihrer Spalte dargestellt. Keine Änderung an Navigation, LIVE-/PLAN-/DISPO-, GPS-, Routing-, Nachrichten-, Fahrer- oder Persistenzlogik.
// CORE-007D8A1F1D8P26M · 17.09.2026: LIVE-DISPO 6ER-BOTTOM-NAV MOBILE FIT – Der in P26L wiederhergestellte globale „⚙ Einstellungen“-Eintrag bleibt in Live-Dispo sichtbar, die untere Navigation wird auf Mobilgeräten aber auf sechs gleich breite Spalten angepasst, damit der Einstellungen-Eintrag nicht rechts abgeschnitten wird. Reine Darstellung; keine Änderung an LIVE-/PLAN-/DISPO-, GPS-, Routing-, Nachrichten-, Fahrer- oder Persistenzlogik.
// CORE-007D8A1F1D8P26L · 17.09.2026: LIVE-DISPO GLOBAL SETTINGS NAV CONSISTENCY – Stellt das globale untere „⚙ Einstellungen“-Navigationsziel auch in der Live-Dispo wieder sichtbar her. Der obere „⚙ Einstellungen“-Button bleibt die Live-Dispo-spezifische Ein-/Ausblendung der technischen Live-Einstellungen; die untere Navigation bleibt damit appweit konsistent. Reine Darstellung; keine Änderung an LIVE-/PLAN-/DISPO-, GPS-, Routing-, Nachrichten-, Fahrer- oder Persistenzlogik; keine neuen Netzaufrufe.
// CORE-007D8A1F1D8P26K · 17.09.2026: LIVE-DISPO READABILITY + BOTTOM-SPACING POLISH – Vergrößert ausschließlich kleine/sekundäre Texte der Live-Dispo auf Android moderat bis zur sicheren Lesbarkeitsgrenze und reduziert den reservierten unteren Leerraum über der festen Navigation. Große Überschriften, Hauptzeiten und Warnschwellen-Zahl bleiben unverändert. Reine Darstellung; keine Änderung an LIVE-/PLAN-/DISPO-, GPS-, Routing-, Nachrichten-, Fahrer- oder Persistenzlogik; keine neuen Netzaufrufe.
// CORE-007D8A1F1D8P26J · 17.09.2026: LIVE-DISPO FINAL MOBILE POLISH – Letzte sichtbare Android-Abweichungen gegen das verbindliche Zielbild: Live-Verbindungs-Pill bleibt auch auf schmalen Mobilansichten sichtbar; im aktiven Zielbild-Demo wird „Demo beenden“ in den klar markierten Demo-Hinweis verschoben und überlagert keine Fahrten/Warnkarte mehr. Reine Darstellung; keine Änderung an LIVE-/PLAN-/DISPO-, GPS-, Routing-, Nachrichten-, Fahrer- oder Persistenzlogik; keine neuen Netzaufrufe.
// CORE-007D8A1F1D8P26I · 17.09.2026: LIVE-DISPO FINAL VISUAL MATCH – Letzter gebündelter Präzisionspass gegen das verbindliche Zielbild auf dem realen Android-Screenshot: kompakte ATMS-PRO-Kopfleiste, einzeiliger Fahrer-Fahrtenkontrolle-Kopf mit Einstellungen rechts, Demo-Steuerung aus dem Layoutfluss, aktiv wirkende Demo-Karten-Schaltfläche, feinere Karten-/Fahrer-Info-Darstellung, weniger Umbruch in Fahrtenzeilen und sicherer Abstand über der festen Navigation. Reine Darstellung; keine Änderung an LIVE-/PLAN-/DISPO-, GPS-, Routing-, Nachrichten-, Fahrer- oder Persistenzlogik; keine neuen Netzaufrufe.
// CORE-007D8A1F1D8P26H · 17.09.2026: LIVE-DISPO VISUAL PRECISION PASS – Gebündelter optischer Feinschliff gegen das verbindliche Zielbild: Fahrerkarte mit Avatar/ID-Hierarchie, kompakter Trackingstreifen, kartenähnliche Positionsdarstellung, ikonische Fahrer-Info, besser lesbare mobile Fahrtenzeilen und auf der Live-Dispo nur die fünf Zielbild-Navigationseinträge. Reine Darstellung; keine Änderung an LIVE-/PLAN-/DISPO-, GPS-, Routing-, Nachrichten-, Fahrer- oder Persistenzlogik; keine neuen Netzaufrufe.
// CORE-007D8A1F1D8P26G · 17.09.2026: LIVE-DISPO ZIELBILD-DEMO – Isolierter, rein visueller Demomodus für den Gesamtvergleich mit dem verbindlichen Zielbild. Zeigt klar markierte Beispieldaten für Tracking, Position, Fahrer-Info, vier Fahrten und Warnkarte ausschließlich im DOM; keine Fahrten, DONE, PLAN/DISPO/LIVE-, GPS-, Fahrer-, Nachrichten- oder Persistenzdaten werden geschrieben oder verändert; keine Netzaufrufe.
// CORE-007D8A1F1D8P26F · 17.09.2026: LIVE-DISPO TARGET UI FINISH PACK – Bündelt das visuelle Finish zum verbindlichen Zielbild: kompakte Zwei-Spalten-Mobile-Ansicht, dreigeteilter Trackingstreifen, tabellarische Fahrtenkontrolle auch auf Smartphones, Warnkarte nur bei bestätigter Überschreitung der persönlichen Warnschwelle und Legacy-/Diagnosebereiche standardmäßig hinter „⚙ Einstellungen“. Bestehende LIVE-/PLAN-/DISPO-, Warn-, Routing-, Nachrichten-, GPS-, Fahrer- und Persistenzlogik bleibt unverändert; keine neuen Netzaufrufe.
// CORE-007D8A1F1D8P26E · 17.09.2026: LIVE-DISPO TARGET UI BLOCK 5 – Ergänzt die Zielbild-Karte „Aktuelle Warnung“. Eine rote Warnung erscheint ausschließlich bei bestätigter LIVE-/ETA-Verspätung ab persönlicher Warnschwelle; unterhalb der Schwelle oder ohne bestätigte LIVE-Bewertung bleibt die Karte neutral. Details öffnen die konkrete Fahrt. Keine Änderung an LIVE-/PLAN-/DISPO-, Warn-, Routing-, Nachrichten-, GPS- oder Persistenzlogik.
// CORE-007D8A1F1D8P26D · 17.09.2026: LIVE-DISPO TARGET UI BLOCK 4 – Ergänzt die Zielbild-Fahrtenkontrolle „Nur Fahrten von …“ mit sicherer Darstellung von Fahrtzeit, Datum, Route, Flug, bestätigter LIVE-Prognose, Verspätungsbewertung und Status. Fehlt eine bestätigte LIVE-Zeit, bleibt Prognose/Verspätung neutral statt Werte zu erfinden. Die bisherige doppelte Legacy-Fahrtenfolge wird nur visuell ausgeblendet; LIVE-/PLAN-/DISPO-, Warn-, Routing-, Nachrichten-, GPS- und Persistenzlogik bleibt unverändert.
// CORE-007D8A1F1D8P26C · 17.09.2026: LIVE-DISPO TARGET UI BLOCK 3 – Ergänzt unter dem neuen Tracking-Kopf die Zielbild-Bereiche „Aktuelle Position“ und „Fahrer-Info“. Angezeigt werden ausschließlich vorhandene lokale GPS-/Schicht-/Fahrerdaten; fehlende Daten bleiben sichtbar als „–“/„nicht hinterlegt“. Keine erfundenen Fahrer-IDs/Schichtzeiten, keine Änderung an LIVE-/PLAN-/DISPO-, GPS-, Routing-, Nachrichten-, Fahrer- oder Persistenzlogik.
// CORE-007D8A1F1D8P26B · 17.09.2026: LIVE-DISPO TARGET UI BLOCK 2 – Räumt die doppelte Legacy-Bedienoberfläche unter dem neuen Fahrer-Fahrtenkontrolle-Kopf auf, übernimmt Zustimmung/Schichtsteuerung in den Zielbild-Trackingstreifen und zeigt alte GPS-Positionen nur noch bei tatsächlich aktiver, freigegebener Schicht als aktuell an. Bestehende LIVE-/PLAN-/DISPO-, GPS-, Routing-, Nachrichten-, Fahrer- und Persistenzlogik bleibt unverändert.
// CORE-007D8A1F1D8P26A · 17.09.2026: LIVE-DISPO TARGET UI BLOCK 1 – Die bestehende sichere Live-Disposition erhält den ersten Zielbild-UI-Block: Fahrer-Fahrtenkontrolle, Fahrer-Auswahl, persönliche Warnschwelle mit +/- und kompakte Tracking-Statuszeile. Bestehende LIVE-/PLAN-/DISPO-, Fahrer-, GPS-, Routing-, Nachrichten- und Persistenzlogik bleibt unverändert; die neuen Bedienelemente spiegeln ausschließlich vorhandene Einstellungen und Zustände.
// CORE-007D8A1F1D8P25T1 · 17.09.2026: NACHRICHTEN-SELBSTTEST – Isolierter Test der P25-Nachrichtenkette mit klar markierter Testfahrt. Der Test schreibt ausschließlich kurzzeitig in atms_messages_v1, prüft dabei, dass Fahrten/DONE/übrige lokale ATMS-Daten unverändert bleiben, und entfernt die Testnachricht nach erfolgreichem Kopieren automatisch. Kein Netzaufruf, kein WhatsApp, keine Änderung an PLAN/DISPO/LIVE/OCR/Flugprüfung.
// CORE-007D8A1F1D8P25 · 16.09.2026: NACHRICHTEN V1 – Der bisherige Nachrichten-Platzhalter wird durch eine lokale Nachrichtenansicht ersetzt. Wenn Live-Dispo wegen fehlendem sicher verfügbarem Ersatzfahrer „Dispo manuell informieren“ empfiehlt, wird eine passende Dispo-Nachricht mit Fahrt, Fahrer, Flug und Grund vorbereitet. Kopieren erfolgt bewusst manuell; kein automatischer Versand, keine Cloud, keine Änderung an PLAN/DISPO/LIVE-Berechnung, OCR, Flugprüfung oder Persistenz-Sicherheitslogik.
// CORE-007D8A1F1D8P20C · 15.09.2026: LIVE FRESHNESS & CURRENT SNAPSHOT SAFETY – Jede neue LIVE-Prüfung ist der aktuelle Snapshot. Unbestätigte/neue oder >15 Min. alte Web-LIVE-Daten steuern weder Kartenzeit noch Live-Dispo; frühere bestätigte Werte werden als Historie archiviert. Manuell bestätigte Landungen bleiben separat autoritativ. Abflüge verwenden departed/„Abgeflogen“ statt landed/„Gelandet“. PLAN/DISPO, P19/P20/P21/P21F1, OCR, Flugort-Cache und Bündelung bleiben unverändert.
// CORE-007D8A1F1D8P21 · 15.09.2026: MULTI-PLAN AIRPORT SOURCE LOCK + BADGES. Quell-Airport aus getrennt analysierten Planlisten wird als zusätzlicher Guard für Flugprüfung/Bündelung genutzt; widersprechende Airport-Signale werden nicht automatisch gemischt. DUS/CGN-Badge je Fahrt. Bestehende P19/P20/P20B LIVE-Logik bleibt unverändert.
// CORE-007D8A1F1D8P20B · 15.09.2026: LIVE UX & SAFETY PACK – verhindert Doppelübernahme leerer LIVE-JSONs, zeigt aktuellen Fahrtenbestand/letzte LIVE-Prüfung, blockiert LIVE-Prüfauftrag bei noch nicht übernommenem neuen Plan, unterscheidet in Live-Dispo bestätigten scheduled-Status ohne operative LIVE-Zeit von echten LIVE-Daten und lässt Diagnoseblöcke im Planimport standardmäßig eingeklappt. Keine Änderung an P19/P20-Flugmatching, FR24-Priorität, PLAN/DISPO/LIVE-Berechnung, OCR, Bündelung, Cache oder Persistenzlogik.
// CORE-007D8A1F1D8P20 · 15.09.2026: FLIGHTRADAR24 LIVE PRIORITY – Bei widersprüchlichen aktuellen LIVE-Quellen darf ein exakt zum Flug, airportEventDate, Airport und Richtung passender operativer Flightradar24-Datensatz den LIVE-Status/die LIVE-Zeit priorisieren. Erfordert weiterhin mindestens zwei dokumentierte Quellen; allgemeine/historische FR24-Flugplaene reichen nicht. PLAN, DISPO, P19-Ereignistag, OCR, Flugort-Cache und Routing bleiben unveraendert.
// CORE-007D8A1F1D8P19 · 15.09.2026: MIDNIGHT FLIGHT EVENT DATE CONTEXT. Fahrtdatum bleibt unverändert; wenn Fahrtzeit und Listen-Flugzeit eindeutig über Mitternacht springen, wird separat airportEventDate abgeleitet. Gemini-/LIVE-Prüfung, Ergebnis-Matching und Flug-Cache berücksichtigen diesen Ereignistag. Alte Cache-Einträge ohne airportEventDate bleiben nur für Same-Day-Fälle kompatibel. Keine Änderung an OCR, PLAN/DISPO/LIVE-Zeitberechnung, Route, Fahrer oder Fahrtdatum.
// CORE-007D8A1F1D8P2 · 13.09.2026: PLAN IMPORT FILE LISTENER CLEANUP – Der Legacy-Datei-Listener in app.js greift nicht mehr in den modernen Planlisten-Import ein. Bild/Excel/CSV werden nicht mehr als JSON-Text gelesen; der korrekte Status „Planliste analysieren“ aus plan-import.js bleibt sichtbar. JSON-Fallback bleibt nur bei fehlendem Planlisten-Modul erhalten. Keine Änderung an OCR, Flugprüfung, PLAN/DISPO/LIVE, Persistenz, Routing oder Fahrerlogik.
// CORE-007D7 · 12.09.2026: NON-FLIGHT LIST TIME LABEL – Die letzte Listen-Uhrzeit bleibt unverändert gespeichert. Mit Flugnummer heißt sie „Flugzeit Liste“, ohne Flugnummer neutral „Listenzeit“. Keine Änderung an OCR, PLAN/DISPO/LIVE, Flugprüfung, Persistenz oder Reihenfolge.
// CORE-007C · 12.09.2026: LIVE STATUS CONSISTENCY – Fahrtenkarte und Cockpit zeigen bei bestaetigtem scheduled-LIVE mit echter Estimated-/Actual-Zeit und 0 Minuten Abweichung konsistent „Pünktlich“. Reines scheduled ohne aktuelle Zeit bleibt „Keine Live-Daten“. Keine Änderung an PLAN/DISPO/LIVE-Berechnung, Flugprüfung, Persistenz, GPS, Routing oder Driver Availability Guard.
// CORE-006Y · 11.09.2026: DRIVER AVAILABILITY GUARD – Ersatzfahrer werden nur vorgeschlagen, wenn sie aktiv sind, Trackingfreigabe haben und nach aktueller Live-Dispo keine eigenen offenen Fahrten besitzen. Vor „Lösung übernehmen“ wird dieselbe Verfügbarkeitsprüfung erneut ausgeführt; bei Konflikt bleibt nur „Dispo manuell informieren“. PLAN/DISPO/LIVE, Fluglogik, GPS, Routing, Persistenz, Past-Ride-Guard und CORE-006W bleiben unverändert.
// CORE-006X · 11.09.2026: Live-Dispo blendet vergangene Fahrten nach frei einstellbarer Nachlaufzeit aus (Standard 120 Min.); Import und Einstellungen sind getrennte Ansichten; Mobile verhindert Seiten-Overflow. PLAN/DISPO/LIVE, Fluglogik, GPS, Routing, Persistenz und CORE-006W bleiben unverändert.
// CORE-007D8A1F1D8P20D · 15.09.2026: LIVE RELEVANCE & UI CLARITY. Standard-LIVE-Auftrag enthält nur aktuell relevante Fahrten gemäß Live-Dispo-Nachlauf; optional können alle Flüge des Plantags geprüft werden. Karten zeigen exakten Prüfzeitpunkt/Frische klarer; reine Listen-Airports werden als „Liste: IATA“ gekennzeichnet.
// CORE-007D8A1F1D8P20E · 15.09.2026: MANUAL DEPARTURE CONFIRMATION – Ergänzt eine sichere manuelle Bestätigung tatsächlicher Abflüge. Exakte Flugidentität wird vor Übernahme geprüft; PLAN/DISPO bleiben unverändert, kein Landepuffer, kein künstliches LIVE-Pickup. Manuelle Ankunft/Abflug-Bestätigungen bleiben gegenüber später unbestätigten Web-Snapshots autoritativ.
// CORE-006V · 11.09.2026: GPS-Refresh in Live-Disposition. Neue Watch-Positionen aktualisieren bei sichtbarer Live-Dispo sofort Route und „LETZTE AKTUALISIERUNG“, ohne eine andere Ansicht zu öffnen oder einen neuen GPS-Watch zu starten. Fluglogik, PLAN/DISPO/LIVE, Routing-Auflösung, Schicht-/Zustimmungslogik und Persistenz bleiben unverändert.
// CORE-006U2 · 11.09.2026: Live-Disposition unterscheidet fehlende Live-Daten von bestätigtem On-Time/Delay. Ohne bestätigte Live-Verzögerungsinformation keine Aussage „Pünktlich“ oder „Keine Verspätung erkannt“. Echte On-Time-/Delay-Daten bleiben unverändert auswertbar; PLAN/DISPO/LIVE-Import, Routing, GPS und Persistenz bleiben unverändert.
// CORE-006U1 · 11.09.2026: Altlast-Bereinigung für frühere künstliche scheduled-LIVE=DISPO-Werte. Bei einem neuen unbestätigten Live-Prüfergebnis wird nur ein eindeutig künstlicher Altwert entfernt (vorheriger liveFlightStatus=scheduled, keine Estimated/Actual-Zeit, LIVE exakt DISPO/PLAN, keine manuelle Bestätigung). Echte LIVE-Daten, manuelle Landungen, PLAN/DISPO und übrige Logik bleiben unverändert.
// CORE-006U · 11.09.2026: LIVE-FLIGHT scheduled/null gehärtet: scheduled erzeugt weder „Pünktlich“ noch eine künstliche LIVE-Abholzeit; delayMinutes=null bleibt beim Ableiten neutral. Bestehende fehlerhaft erzeugte scheduled-LIVE=DISPO-Werte werden beim erneuten Live-Import gezielt bereinigt. Keine Änderung an PLAN, DISPO, Arrival-Puffer, Bündeln, Routing oder Persistenz.
// CORE-006S3 · 11.09.2026: Mobile Adresssuche gehärtet: kurze Suchbegriffe (z. B. NH) werden auch während/bei Ende von Android-IME-Komposition zuverlässig aktualisiert; Trefferzähler direkt unter dem Suchfeld. Keine Änderung an Adressdaten, Import/Export, Routing oder Fahrtenlogik.
// CORE-006S2 · 10.09.2026: Excel-Adressimport liest XLSX-XML namespace-unabhängig (auch echte Excel-/Microsoft-365-Dateien mit Präfixen wie x:sheet/x:row). Keine Änderung an Adressdaten, Importmodi, Routing oder Fahrtenlogik.
// CORE-006S · 10.09.2026: Editierbare Orte-&-Adressen-Verwaltung mit sicherem Excel/CSV-Import/Export. Routen verwenden nur exakte Adressbuch-Treffer bzw. eindeutige Airport-Codes; keine Hotel-Filiale wird geraten. Bündelfahrten behalten die Planreihenfolge.
// CORE-006J · 09.09.2026: Zeitsemantik der Bild-Planliste verbindlich getrennt: erste Uhrzeit = DISPO, mittlere Uhrzeit = gespiegelte DISPO-Zeit, letzte Uhrzeit vor Ort = Flugzeit aus Liste. Flugzeit wird in Fahrtenkarte/Cockpit sichtbar; LIVE bleibt separates Abholzeitfeld mit Priorität LIVE > DISPO > PLAN.
// CORE-006I · 09.09.2026: Fahrtenansicht bewahrt die Reihenfolge der Planliste; keine automatische Umsortierung nach PLAN/DISPO/LIVE-Zeit.
// CORE-006A 09.09.2026: Explicit Plan Import Guard – Planimport nur nach echtem Nutzer-Klick; blockierte/importfremde Aufrufe werden protokolliert und bestehende Fahrten gesichert. Zusätzlich kann der letzte Zustand vor einem Planimport gezielt wiederhergestellt werden.
// CORE-005Z 09.09.2026: Multi-Airport Flight Context – Flugprüfung erkennt den tatsächlich beteiligten Flughafen (z. B. DUS oder CGN) aus Abholung/Ziel, ohne Flugnummer-Hardcoding; Gemini- und Live-Prüfauftrag werden airport-spezifisch.
// CORE-005Y 09.09.2026: Android JSON Input Guard – erkennt abgeschnittene Gemini-/Live-JSONs bereits beim Einfügen und meldet sie verständlich, ohne Flug-/Zeit-/Persistenzlogik zu ändern.
// CORE-005Q 08.09.2026: Flugpruef-Persistenz nach Neuimport: exakter Match Flugnummer+Datum+Richtung+Flugzeit; verifizierte Orte und manuelle Hinweise werden sofort wiederhergestellt.
// CORE-005P 08.09.2026: Globaler Arrival-Abholpuffer + manuell bestätigte Landungszeit im Live-Panel; PLAN/DISPO bleiben unverändert.
// CORE-005O 08.09.2026: Sichere OCR-Ortsnormalisierung für München-Fehllesungen; Originalwert bleibt intern erhalten.
// CORE-005N 08.09.2026: Live-Flugdaten-Fallback: aktueller Web-Prüfauftrag + sichere JSON-Übernahme, ohne PLAN/DISPO zu überschreiben.
// CORE-005M 08.09.2026: Dashboard-Hinweiszähler zählt echte manuelle/unsichere Flugprüfungen statt beliebiger flightStatus-Werte.
// CORE-005K 07.09.2026: Cockpit-Status ohne Live-Daten neutral; PÜNKTLICH nur bei bestätigtem On-Time-Status.
// CORE-005J 07.09.2026: Preis-fehlt nativ anzeigen; PWA rendert PLAN/DISPO/LIVE ohne nachträgliche DOM-Korrektur.
// CORE-004L 06.09.2026: Zeitlogik gehärtet. PLAN, DISPO und LIVE bleiben getrennt; Priorität LIVE > DISPO > PLAN.
// LIVE kann aus einer ausdrücklich gelieferten tatsächlichen Landezeit + 15 Min. Abholpuffer abgeleitet werden.
// CORE-004C HOTFIX 05.09.2026: Flugdaten-aendern-Button repariert; manuelle Korrekturen werden lokal pro Fahrt gespeichert.
// CORE-005V 08.09.2026: additive Persistenz-Sicherheitslage (Snapshot, Write-Read-Check, Recovery, Self-Test).
// CORE-005V1 08.09.2026: Persistenz-Panel bleibt nach dynamischem Import-UI-Render sichtbar (additiv, keine Importlogik geändert).
// CORE-005V2 08.09.2026: Persistenz-Panel im selben Import-Host direkt hinter Live-Flugdaten verankert; Mobile-Stack erweitert.
// CORE-005V3 08.09.2026: Persistenz-Panel wird direkt IN das sichtbare Live-Flugdaten-Panel gemountet; vorhandene Fehlplatzierung wird automatisch verschoben.
// CORE-005V4 08.09.2026: Kritische Safety-Schattenwerte werden bei normalen Snapshots niemals durch bloß fehlende localStorage-Keys verworfen; Startup/Import kann dadurch verlorene Flugdaten wiederherstellen.
const ATMS_LIVE_FRESHNESS_MINUTES=15;
const ATMS_MESSAGES_KEY='atms_messages_v1';
const ATMS_LIVE_LAST_CHECK_META='atms_live_last_check_meta_v1';
const P77_LEGACY_DEDUPE_MIGRATION_KEY='atms_p77a_legacy_dedupe_migration_v2';
const P77_LEGACY_DEDUPE_ROLLBACK_KEY='atms_p77a_legacy_dedupe_compact_rollback_v2';
const KEY='atms_beta_14_3_1_rides',DONE='atms_beta_14_3_1_done',DONE_OPEN='atms_beta_14_3_1_done_open',WA_SETTINGS='atms_beta_14_3_1_whatsapp',DISP_SETTINGS='atms_dispatchers_v1',DRIVER_SETTINGS='atms_driver_contacts_v1',BACKUP_META='atms_backup_meta_v1',LIVE_SETTINGS='atms_live_disposition_v1',LIVE_LOG='atms_live_disposition_log_v1',DRIVER_SESSION='atms_driver_session_v1',INFO_CHAT_SETTINGS='atms_info_chat_v1',FLIGHT_CACHE='atms_flight_cache_v1',FLIGHT_CACHE_BACKUP='atms_flight_cache_verified_v1',RIDE_OVERRIDE_KEY='atms_ride_overrides_v1',PLAN_IMPORT_HISTORY='atms_plan_import_history_v1',PLAN_IMPORT_CURRENT='atms_plan_import_current_v1',PLAN_KEEP_PINNED='atms_plan_keep_pinned_v1';const ADDRESS_BOOK='atms_address_book_v1',ADDRESS_CANDIDATES='atms_address_candidates_v1';const DRIVER_COLOR_KEY='atms_driver_color_map_v1',DRIVER_PLAN_COLOR_KEY='atms_driver_plan_color_map_v1',DRIVER_COLOR_MANUAL_KEY='atms_driver_color_manual_v1',DRIVER_COLOR_MANUAL_MIGRATION_KEY='atms_driver_color_manual_migrated_p75_v1';const PERSIST_SAFETY_KEY='ATMSPRO_PERSISTENCE_SAFETY_V1',PERSIST_AUDIT_KEY='ATMSPRO_PERSISTENCE_AUDIT_V1',PERSIST_SCHEMA=1;const PERSIST_DURABLE_DB='ATMSPRO_PERSISTENCE_DURABLE_V1',PERSIST_DURABLE_STORE='critical',PERSIST_DURABLE_RECORD='latest';let persistenceDurableShadow=null,persistenceDurableReady=false,persistenceDurableError='';let persistenceDurableSyncQueue=Promise.resolve();const STORAGE_V2_DB='ATMSPRO_STORAGE_V2_PHASE1',STORAGE_V2_STORE='snapshots',STORAGE_V2_RECORD='latest',STORAGE_V2_SCHEMA=1;let storageV2State={ready:false,available:false,status:'initializing',error:'',latest:null,lastCheckedAt:'',lastReason:''};let storageV2SyncQueue=Promise.resolve();const STORAGE_V2_ARCHIVE_CATALOG='atms_storage_v2_archive_catalog_v1',STORAGE_V2_ARCHIVE_SCHEMA=1;let storageV2ArchiveBusy=false,storageV2ArchiveReadBusy=false;const $=id=>document.getElementById(id);let liveGeoWatchId=null;let liveFreshnessTimer=null;let rides=[];let done=new Set(JSON.parse(localStorage.getItem(DONE)||'[]'));let doneOpen=localStorage.getItem(DONE_OPEN)==='1';let mode='rides',driverFilter='',active=null;let driverColorMap={},driverPlanColorMap={},driverColorManualMap={};let rideListReturnState=null;const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const PLAN_KEEP_CLEANUP_PREFLIGHT='atms_current_plan_cleanup_preflight_v1',PLAN_KEEP_CLEANUP_LAST='atms_current_plan_cleanup_last_v1';let p103CleanupBusy=false,p103CleanupStatusMessage='',p103CleanupStatusType='';

let atmsToastTimer=0;
function showToast(message,type=''){const el=document.getElementById('atmsToast');if(!el)return;clearTimeout(atmsToastTimer);el.textContent=message;el.className='atms-toast '+type+' show';atmsToastTimer=setTimeout(()=>{el.className='atms-toast';},2600)}
function runStartupSelfCheck(){const required=['search','plusBtn','rideList','fileInput','loadBtn','exportBackupBtn','importBackupBtn','resetDataBtn'];const missing=required.filter(id=>!document.getElementById(id));if(missing.length){throw new Error('Fehlende App-Elemente: '+missing.join(', '));}return true;}
function first(...v){for(const x of v)if(x!==undefined&&x!==null&&String(x).trim()!=='')return String(x).trim();return ''}function clean(t){return t.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'')}
// CORE-004L: Planzeit darf nie von einer später berechneten Zeit überschrieben werden.
// Deshalb haben explizite PLAN-Felder Vorrang; das historische Feld `time` bleibt nur Fallback für alte Daten.
function planTimeOf(r){return first(r.planTime,r.plan_abholzeit,r.planzeit,r.plan_zeit,r.abholzeitPlan,r.planPickupTime,r.plan_pickup_time,r.time,r.abholzeit)}
function dispoTimeOf(r){return first(r.dispoTime,r.dispo_time,r.dispoZeit,r.dispozeit,r.dispo_zeit,r.dispo_abholzeit,r.dispo_uhrzeit,r.timeMirror,r.time_mirror,r.dispositionTime,r.disposition_time,r.disponierte_abholzeit,r.pickupTimeDispo,r.pickup_time_dispo,r.uhrzeit2,r.uhrzeit_2,r.zweiteUhrzeit,r.secondColumnTime,r.zweite_uhrzeit,r.zweiteZeit,r.zweite_zeit,r.secondTime,r.second_time,r.secondPickupTime)}
function listedFlightTimeOf(r){return first(r.flightTime,r.flugzeit,r.flight_time,r.currentFlightTime,r.current_flight_time)}
function rawExplicitLiveTimeOf(r){return first(r?.liveTime,r?.live_time,r?.currentPickupTime,r?.current_pickup_time,r?.aktuelle_abholzeit,r?.aktuelleZeit,r?.aktuelle_zeit,r?.live_abholzeit,r?.flightradar_abholzeit,r?.verspaetete_abholzeit,r?.verspätete_abholzeit,r?.livePickupTime,r?.live_pickup_time,r?.currentTime,r?.current_time)}
function liveSnapshotTimestampOf(r){return first(r?.liveReportedCheckedAt,r?.live_reported_checked_at,r?.liveCheckedAt,r?.live_checked_at)}
function liveSnapshotFreshness(r){
  const manual=Boolean(r?.liveManualConfirmed);
  const timestamp=liveSnapshotTimestampOf(r);
  const parsed=timestamp?new Date(timestamp):null;
  const ageMinutes=parsed&&!Number.isNaN(parsed.getTime())?Math.max(0,(Date.now()-parsed.getTime())/60000):null;
  if(manual)return{usable:true,manual:true,stale:false,confirmed:true,ageMinutes,timestamp,reason:'manual'};
  const status=String(r?.liveFlightStatus||'').trim().toLowerCase();
  const hasSignal=Boolean(rawExplicitLiveTimeOf(r)||first(r?.liveFlightActualTime,r?.liveFlightEstimatedTime)||(!['','unknown'].includes(status)));
  const explicit=r?.liveCurrentConfirmed;
  const confirmed=explicit===true?true:explicit===false?false:hasSignal;
  if(!confirmed)return{usable:false,manual:false,stale:false,confirmed:false,ageMinutes,timestamp,reason:'unconfirmed'};
  const stale=ageMinutes===null||ageMinutes>ATMS_LIVE_FRESHNESS_MINUTES;
  return{usable:!stale,manual:false,stale,confirmed:true,ageMinutes,timestamp,reason:stale?'stale':'fresh'};
}
function explicitLiveTimeOf(r){return liveSnapshotFreshness(r).usable?rawExplicitLiveTimeOf(r):''}
function refreshVisibleLiveFreshness(){
  try{updateLiveFlightPanelContext()}catch(_){ }
  const listView=$('listView'),liveView=$('liveDispositionView'),cockpitView=$('cockpitView');
  if(listView&&!listView.classList.contains('hidden')){render();return}
  if(liveView&&!liveView.classList.contains('hidden')){renderLiveDisposition(false);return}
  if(cockpitView&&!cockpitView.classList.contains('hidden')&&active){openCockpit(active.id)}
}
function scheduleLiveFreshnessRefresh(){
  if(liveFreshnessTimer){clearTimeout(liveFreshnessTimer);liveFreshnessTimer=null}
  const waits=[];
  for(const r of (Array.isArray(rides)?rides:[])){
    const state=liveSnapshotFreshness(r);
    if(!state.usable||state.manual||state.ageMinutes===null)continue;
    const remaining=(ATMS_LIVE_FRESHNESS_MINUTES-state.ageMinutes)*60000;
    if(Number.isFinite(remaining))waits.push(Math.max(250,remaining+750));
  }
  if(!waits.length)return;
  liveFreshnessTimer=setTimeout(()=>{liveFreshnessTimer=null;refreshVisibleLiveFreshness();scheduleLiveFreshnessRefresh()},Math.min(...waits));
}
function actualLandingTimeOf(r){return first(r.actualLandingTime,r.actual_landing_time,r.landingTimeActual,r.landing_time_actual,r.landedAt,r.landed_at,r.actualArrivalTime,r.actual_arrival_time,r.flightActualArrival,r.flight_actual_arrival,r.realArrivalTime,r.real_arrival_time)}
function actualDepartureTimeOf(r){return first(r.actualDepartureTime,r.actual_departure_time,r.departureTimeActual,r.departure_time_actual,r.departedAt,r.departed_at,r.actualDeparture,r.actual_departure,r.flightActualDeparture,r.flight_actual_departure,r.realDepartureTime,r.real_departure_time)}
function globalArrivalBufferMinutes(){const raw=Number(getLiveSettings().arrivalPickupBufferMinutes??15);return Number.isFinite(raw)?Math.max(0,Math.min(120,Math.round(raw))):15}
function liveBufferMinutesOf(r){const raw=Number(r?.liveBufferOverrideMinutes??r?.live_buffer_override_minutes??r?.liveBufferMinutes??r?.live_buffer_minutes??r?.pickupBufferMinutes??r?.pickup_buffer_minutes??globalArrivalBufferMinutes());return Number.isFinite(raw)?Math.max(0,Math.min(120,Math.round(raw))):globalArrivalBufferMinutes()}
function arrivalBufferMinutesForRide(r){const override=r?.liveBufferOverrideMinutes??r?.live_buffer_override_minutes;const raw=override===undefined||override===null||String(override).trim()===''?globalArrivalBufferMinutes():Number(override);return Number.isFinite(Number(raw))?Math.max(0,Math.min(120,Math.round(Number(raw)))):globalArrivalBufferMinutes()}
function clockPlusMinutes(value,minutes){
  const raw=String(value||'').trim();if(!raw)return'';
  const m=raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if(m){const total=((Number(m[1])*60+Number(m[2])+Number(minutes))%(24*60)+(24*60))%(24*60);return String(Math.floor(total/60)).padStart(2,'0')+':'+String(total%60).padStart(2,'0')}
  const d=new Date(raw);if(Number.isNaN(d.getTime()))return'';d.setMinutes(d.getMinutes()+Number(minutes));
  try{return new Intl.DateTimeFormat('de-DE',{timeZone:'Europe/Berlin',hour:'2-digit',minute:'2-digit',hour12:false}).format(d)}catch(_){return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}
}
function derivedLiveTimeOf(r){const landing=actualLandingTimeOf(r);return landing?clockPlusMinutes(landing,arrivalBufferMinutesForRide(r)):''}
function liveTimeOf(r){
  // P28: Bei Abflugfahrten ist LIVE ausschließlich Fluginformation. Die Fahrer-Abholzeit bleibt DISPO/PLAN.
  try{if(flightDirectionForGemini(r)==='departure')return''}catch(_){}
  return first(explicitLiveTimeOf(r),derivedLiveTimeOf(r));
}
function normalizeStops(r){const raw=r.bundleStops||r.stops||r.destinations||r.ziele||r.bundle_ziele||[];if(!Array.isArray(raw))return[];return raw.map((s,i)=>{if(typeof s==='string')return{name:s,persons:0,order:i+1};return{name:first(s.name,s.destination,s.ziel,s.ort,s.hotel),persons:Number(s.persons||s.personen||0),order:Number(s.order||s.reihenfolge||i+1)}}).filter(s=>s.name)}
function isBundleRide(r){return Boolean(r.bundle||r.isBundle||r.bundelfahrt||r.is_bundelfahrt||r.bundleRide||normalizeStops(r).length>1)}
function normalizeFlightLocationOcr(value){const raw=String(value||'').trim();if(!raw)return'';const key=raw.toLowerCase().replace(/\s+/g,' ');if(['miinchen','mienchen','munchen','muenchen'].includes(key))return'München';return raw}
function norm(r,i){const plan=planTimeOf(r),dispo=dispoTimeOf(r),landing=actualLandingTimeOf(r),buffer=liveBufferMinutesOf(r),live=liveTimeOf(r),listedFlightTime=listedFlightTimeOf(r),rawFlightLocation=first(r.flightLocation,r.flugort,r.ort),normalizedFlightLocation=normalizeFlightLocationOcr(rawFlightLocation);return{...r,id:first(r.id,'ride-'+(i+1)),date:first(r.date,r.datum),time:plan,planTime:plan,dispoTime:dispo,timeMirror:first(r.timeMirror,r.time_mirror),flightTime:listedFlightTime,liveTime:live,actualLandingTime:landing,liveBufferMinutes:buffer,liveTimeDerivedFromLanding:Boolean(!explicitLiveTimeOf(r)&&landing&&live),driver:first(r.driver,r.fahrer),pickup:first(r.pickup,r.abholort,r.start),destination:first(r.destination,r.zielort,r.ziel),flightNumber:first(r.flightNumber,r.flugnummer).toUpperCase(),flightLocationRaw:first(r.flightLocationRaw,r.sourceFlightLocationRaw,rawFlightLocation),flightLocation:normalizedFlightLocation,iata:first(r.iata),airline:first(r.airline),partner:first(r.partner,r.airline),company:first(r.company,r.firma,'WT'),vehicle:first(r.vehicle,r.fahrzeug,'Pkw'),persons:Number(r.persons||r.personen||0),price:Number(r.price||r.preis||0),currency:first(r.currency,'EUR'),notes:first(r.notes,r.hinweis),flightStatus:first(r.flightStatus,r.flugstatus,r.liveStatus,r.live_status),delayMinutes:Number(r.delayMinutes??r.delay_minutes??r.verspaetungMinuten??r.verspätung_minuten??r.delay??0),landed:Boolean(r.landed||r.gelandet),isBundle:isBundleRide(r),bundleStops:normalizeStops(r)}}
function normKey(v){return String(v||'').trim().toLowerCase().replace(/\s+/g,' ')}

// CORE-005V – additive Persistenz-Sicherheitslage. Bewusst außerhalb des atms_-Präfixes,
// damit ein versehentliches Prefix-Cleanup den letzten Snapshot nicht mitlöscht.
// Der absichtliche "ATMS-Daten zurücksetzen"-Ablauf löscht diese Sicherheitsdaten explizit mit.
function persistAudit(event,detail={}){
  try{
    const list=JSON.parse(localStorage.getItem(PERSIST_AUDIT_KEY)||'[]');
    const next=Array.isArray(list)?list:[];
    next.unshift({at:new Date().toISOString(),event:String(event||''),...detail});
    localStorage.setItem(PERSIST_AUDIT_KEY,JSON.stringify(next.slice(0,120)));
  }catch(_){ }
}
function readPersistenceSafety(){
  try{
    const obj=JSON.parse(localStorage.getItem(PERSIST_SAFETY_KEY)||'null');
    return obj&&typeof obj==='object'&&obj.storage&&typeof obj.storage==='object'?obj:null;
  }catch(_){return null}
}
function writePersistenceSafety(storage,reason='snapshot'){
  const payload={schema:PERSIST_SCHEMA,updatedAt:new Date().toISOString(),reason:String(reason||''),storage:{...(storage||{})}};
  localStorage.setItem(PERSIST_SAFETY_KEY,JSON.stringify(payload));
  return payload;
}
function updatePersistenceSafetyKey(key,rawValue,reason='write'){
  try{
    const prev=readPersistenceSafety();
    const storage={...(prev?.storage||{})};
    if(rawValue===null||rawValue===undefined)delete storage[key];else storage[key]=String(rawValue);
    writePersistenceSafety(storage,reason);
  }catch(_){ }
}
// CORE-005V5: Zweite, unabhaengige Persistenzschicht in IndexedDB.
// Sie ist absichtlich getrennt von localStorage, damit ein unerwarteter Verlust
// des kompletten Safety-/Audit-Containers die letzte verifizierte Flugpruefung
// nicht mehr mitreissen kann. Fehlende aktuelle Werte loeschen den Durable-Shadow nie.
function openPersistenceDurableDb(){
  return new Promise((resolve,reject)=>{
    try{
      if(!('indexedDB' in window))return reject(new Error('IndexedDB nicht verfuegbar'));
      const req=indexedDB.open(PERSIST_DURABLE_DB,1);
      req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(PERSIST_DURABLE_STORE))db.createObjectStore(PERSIST_DURABLE_STORE)};
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error||new Error('IndexedDB konnte nicht geoeffnet werden'));
    }catch(e){reject(e)}
  });
}
async function readPersistenceDurableShadow(){
  const db=await openPersistenceDurableDb();
  try{
    return await new Promise((resolve,reject)=>{
      const tx=db.transaction(PERSIST_DURABLE_STORE,'readonly');
      const req=tx.objectStore(PERSIST_DURABLE_STORE).get(PERSIST_DURABLE_RECORD);
      req.onsuccess=()=>resolve(req.result&&typeof req.result==='object'?req.result:null);
      req.onerror=()=>reject(req.error||new Error('Durable-Shadow konnte nicht gelesen werden'));
    });
  }finally{try{db.close()}catch(_){}}
}
async function writePersistenceDurableShadow(storage,reason='sync'){
  const db=await openPersistenceDurableDb();
  const payload={schema:PERSIST_SCHEMA,updatedAt:new Date().toISOString(),reason:String(reason||''),storage:{...(storage||{})}};
  try{
    await new Promise((resolve,reject)=>{
      const tx=db.transaction(PERSIST_DURABLE_STORE,'readwrite');
      tx.oncomplete=()=>resolve();
      tx.onerror=()=>reject(tx.error||new Error('Durable-Shadow Schreibfehler'));
      tx.onabort=()=>reject(tx.error||new Error('Durable-Shadow Transaktion abgebrochen'));
      tx.objectStore(PERSIST_DURABLE_STORE).put(payload,PERSIST_DURABLE_RECORD);
    });
    persistenceDurableShadow=payload;
    persistenceDurableReady=true;
    persistenceDurableError='';
    persistAudit('durable_sync',{reason:String(reason||''),keys:Object.keys(payload.storage||{}).length});
    return payload;
  }finally{try{db.close()}catch(_){}}
}
function mergedCriticalShadowFromCurrent(){
  const storage={...(persistenceDurableShadow?.storage||{})};
  for(const key of [KEY,DONE,FLIGHT_CACHE,FLIGHT_CACHE_BACKUP,RIDE_OVERRIDE_KEY,ADDRESS_BOOK,ADDRESS_CANDIDATES,PLAN_KEEP_PINNED]){
    const raw=localStorage.getItem(key);
    if(typeof raw==='string'&&raw.length)storage[key]=raw;
  }
  return storage;
}
// P96/S1: IndexedDB-Schreibvorgaenge serialisieren und NICHT vor dem
// erfolgreichen transaction.oncomplete als dauerhaft gespeichert melden.
function syncPersistenceDurableShadow(reason='sync'){
  // Startup: Vor dem Lesen eines vorhandenen IndexedDB-Backups niemals
  // dessen letzte gute Fahrten mit einer noch leeren lokalen Sicht ueberschreiben.
  if(!persistenceDurableReady)return Promise.resolve(null);
  persistenceDurableSyncQueue=persistenceDurableSyncQueue.catch(()=>null).then(async()=>{
    const storage=mergedCriticalShadowFromCurrent();
    if(!Object.keys(storage).length)return null;
    return await writePersistenceDurableShadow(storage,reason);
  }).catch(e=>{
    persistenceDurableError=String(e?.message||e);
    persistAudit('durable_sync_failed',{reason:String(reason||''),message:persistenceDurableError});
    return null;
  });
  return persistenceDurableSyncQueue;
}
async function initPersistenceDurableShadow(){
  try{
    const saved=await readPersistenceDurableShadow();
    if(saved&&saved.storage&&typeof saved.storage==='object')persistenceDurableShadow=saved;
    persistenceDurableReady=true;
    persistenceDurableError='';
    const startupLocalRides=localStorage.getItem(KEY),startupDurableRides=persistenceDurableShadow?.storage?.[KEY];
    const startupRideConflict=startupLocalRides!==null&&typeof startupDurableRides==='string'&&startupLocalRides!==startupDurableRides;
    if(startupRideConflict)persistAudit('rides_startup_conflict',{localLength:startupLocalRides.length,durableLength:startupDurableRides.length});
    const result=restoreMissingCriticalPersistence('startup-durable');
    if(result.restored){
      if(result.keys.includes(KEY)){
        // WICHTIG: Nach der Wiederherstellung nicht mit einem zuvor leeren
        // JS-Arbeitsspeicher die gerade geretteten Fahrten ueberschreiben.
        try{const recovered=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(recovered))rides=recovered.map(norm)}catch(e){persistAudit('startup_rides_reload_failed',{message:String(e?.message||e)})}
      }
      if(result.keys.includes(DONE)){
        try{const recovered=JSON.parse(localStorage.getItem(DONE)||'[]');if(Array.isArray(recovered))done=new Set(recovered)}catch(_){ }
      }
      recoverVerifiedFlightCache();
      const restoredRides=applyFlightCacheToRides(applyRideOverrides(rides).rides);
      const correctedBorderTimes=p96RecoverPersistedBorderTimes(restoredRides.rides);
      rides=correctedBorderTimes.rides;
      if(correctedBorderTimes.changed)persistAudit('legacy_ocr_time_corrected',{count:correctedBorderTimes.changed,from:'durable-restore'});
      if(!startupRideConflict){
        if(!save({silent:true}))persistAudit('startup_recovery_save_failed',{restored:result.keys});
      }
      render();
    }
    // Bei divergierenden Kopien einen Snapshot NUR lokal schreiben. Kein
    // automatischer IndexedDB-Overwrite vor einer Benutzerentscheidung.
    capturePersistenceSafety('startup-durable-ready',!startupRideConflict);
    if(persistenceDurableShadow)persistAudit('durable_loaded',{keys:Object.keys(persistenceDurableShadow.storage||{}).length,restored:result.restored});
    // Migration alter Versionen: Nur initial seeden, wenn im Durable-Shadow
    // noch keine Fahrten stehen. Uneinigkeit niemals still ueberschreiben.
    const localRides=localStorage.getItem(KEY),indexedRides=persistenceDurableShadow?.storage?.[KEY];
    if(!startupRideConflict&&localRides!==null&&(!indexedRides||indexedRides===localRides))await syncPersistenceDurableShadow('startup-rides-seed');
    else if(localRides!==null&&indexedRides!==localRides){
      persistAudit('rides_startup_conflict',{localLength:localRides.length,durableLength:indexedRides?.length||0});
      showToast('ACHTUNG: Unterschiedliche Fahrtenspeicher erkannt. Bitte vor Import/Backup pruefen.','warn');
    }
  }catch(e){
    persistenceDurableReady=true;
    persistenceDurableError=String(e?.message||e);
    persistAudit('durable_load_failed',{message:persistenceDurableError});
  }
}
function clearPersistenceDurableShadow(){
  persistenceDurableShadow=null;
  persistenceDurableReady=false;
  persistenceDurableError='';
  try{
    const req=indexedDB.deleteDatabase(PERSIST_DURABLE_DB);
    req.onsuccess=req.onerror=req.onblocked=()=>{};
  }catch(_){ }
}

// STORAGE V2 PHASE 1: eigener, rein additiver IndexedDB-Spiegel fuer Fahrten + DONE.
// Wichtig: Diese Phase liest niemals automatisch zurueck in localStorage, loescht nichts
// und ersetzt keinen bestehenden Speicher. Abweichungen werden nur sichtbar gemeldet.
function storageV2Hash(value){
  const s=String(value??'');let h=2166136261>>>0;
  for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0}
  return h.toString(16).padStart(8,'0');
}
function storageV2LocalSnapshot(reason='local'){
  const ridesRaw=localStorage.getItem(KEY)??'[]',doneRaw=localStorage.getItem(DONE)??'[]';
  let rideList,doneList;
  try{rideList=JSON.parse(ridesRaw)}catch(e){throw new Error('Storage V2: Fahrten-JSON unlesbar')}
  try{doneList=JSON.parse(doneRaw)}catch(e){throw new Error('Storage V2: Erledigt-JSON unlesbar')}
  if(!Array.isArray(rideList)||!Array.isArray(doneList))throw new Error('Storage V2: Erwartete Listenstruktur fehlt');
  const rideIds=rideList.map(r=>String(r?.id||'').trim()).filter(Boolean).sort();
  const doneIds=doneList.map(x=>String(x||'').trim()).filter(Boolean).sort();
  return {
    schema:STORAGE_V2_SCHEMA,createdAt:new Date().toISOString(),reason:String(reason||''),
    ridesRaw,doneRaw,rideCount:rideList.length,doneCount:doneList.length,
    rideIdsHash:storageV2Hash(JSON.stringify(rideIds)),doneIdsHash:storageV2Hash(JSON.stringify(doneIds)),
    contentHash:storageV2Hash(ridesRaw+'\u241e'+doneRaw)
  };
}
function storageV2SnapshotsMatch(saved,current){
  return Boolean(saved&&current
    && saved.schema===STORAGE_V2_SCHEMA
    && saved.ridesRaw===current.ridesRaw
    && saved.doneRaw===current.doneRaw
    && Number(saved.rideCount)===Number(current.rideCount)
    && Number(saved.doneCount)===Number(current.doneCount)
    && saved.rideIdsHash===current.rideIdsHash
    && saved.doneIdsHash===current.doneIdsHash
    && saved.contentHash===current.contentHash);
}
function openStorageV2Db(){
  return new Promise((resolve,reject)=>{
    try{
      if(!('indexedDB' in window))return reject(new Error('IndexedDB nicht verfuegbar'));
      const req=indexedDB.open(STORAGE_V2_DB,1);
      req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORAGE_V2_STORE))db.createObjectStore(STORAGE_V2_STORE)};
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error||new Error('Storage V2 konnte nicht geoeffnet werden'));
    }catch(e){reject(e)}
  });
}
async function readStorageV2Latest(){
  const db=await openStorageV2Db();
  try{
    return await new Promise((resolve,reject)=>{
      const tx=db.transaction(STORAGE_V2_STORE,'readonly');
      const req=tx.objectStore(STORAGE_V2_STORE).get(STORAGE_V2_RECORD);
      req.onsuccess=()=>resolve(req.result&&typeof req.result==='object'?req.result:null);
      req.onerror=()=>reject(req.error||new Error('Storage V2 konnte nicht gelesen werden'));
    });
  }finally{try{db.close()}catch(_){}}
}
async function writeStorageV2Latest(snapshot){
  const db=await openStorageV2Db();
  try{
    await new Promise((resolve,reject)=>{
      const tx=db.transaction(STORAGE_V2_STORE,'readwrite');
      tx.oncomplete=()=>resolve();
      tx.onerror=()=>reject(tx.error||new Error('Storage V2 Schreibfehler'));
      tx.onabort=()=>reject(tx.error||new Error('Storage V2 Transaktion abgebrochen'));
      tx.objectStore(STORAGE_V2_STORE).put({...snapshot,storedAt:new Date().toISOString()},STORAGE_V2_RECORD);
    });
  }finally{try{db.close()}catch(_){}}
  return await readStorageV2Latest();
}
function storageV2SetState(status,detail={}){
  storageV2State={...storageV2State,...detail,status:String(status||'unknown'),lastCheckedAt:new Date().toISOString()};
  renderStorageV2StatusCard();
  return storageV2State;
}
function storageV2Diagnosis(){
  let local=null,error='';
  try{local=storageV2LocalSnapshot('diagnosis')}catch(e){error=String(e?.message||e)}
  const latest=storageV2State.latest;
  return {
    phase:'Storage V2 Phase 1 · Sicherheitsmodus',schema:STORAGE_V2_SCHEMA,
    sourceOfTruth:'localStorage',automaticDelete:false,automaticRestore:false,automaticArchive:false,
    status:storageV2State.status,ready:storageV2State.ready,available:storageV2State.available,
    error:storageV2State.error||error,lastCheckedAt:storageV2State.lastCheckedAt,lastReason:storageV2State.lastReason,
    local:local?{rideCount:local.rideCount,doneCount:local.doneCount,contentHash:local.contentHash,rideIdsHash:local.rideIdsHash,doneIdsHash:local.doneIdsHash}:null,
    storageV2:latest?{rideCount:latest.rideCount,doneCount:latest.doneCount,contentHash:latest.contentHash,rideIdsHash:latest.rideIdsHash,doneIdsHash:latest.doneIdsHash,storedAt:latest.storedAt||latest.createdAt||'',reason:latest.reason||''}:null,
    exactMatch:Boolean(local&&latest&&storageV2SnapshotsMatch(latest,local))
  };
}
async function checkStorageV2Phase1(reason='check',toast=false){
  try{
    const local=storageV2LocalSnapshot(reason),latest=await readStorageV2Latest(),match=storageV2SnapshotsMatch(latest,local);
    storageV2State.ready=true;storageV2State.available=true;storageV2State.latest=latest;storageV2State.error='';storageV2State.lastReason=String(reason||'');
    storageV2SetState(latest?(match?'synced':'mismatch'):'empty');
    persistAudit(match?'storage_v2_check_ok':'storage_v2_check_mismatch',{reason:String(reason||''),localRides:local.rideCount,v2Rides:latest?.rideCount??null,localDone:local.doneCount,v2Done:latest?.doneCount??null});
    if(toast)showToast(match?'Storage V2 ist synchron':latest?'Storage V2: Abweichung erkannt – nichts wurde automatisch geaendert':'Storage V2 ist noch leer',match?'ok':'warn');
    return {ok:match,local,latest};
  }catch(e){
    const msg=String(e?.message||e);storageV2State.ready=true;storageV2State.available=false;storageV2State.error=msg;storageV2State.lastReason=String(reason||'');storageV2SetState('error');persistAudit('storage_v2_check_failed',{reason:String(reason||''),message:msg});if(toast)showToast('Storage V2 Prüfung fehlgeschlagen: '+msg,'warn');return{ok:false,error:msg};
  }
}
function syncStorageV2Phase1(reason='sync'){
  storageV2SyncQueue=storageV2SyncQueue.catch(()=>null).then(async()=>{
    const local=storageV2LocalSnapshot(reason);
    const written=await writeStorageV2Latest(local);
    const match=storageV2SnapshotsMatch(written,local);
    storageV2State.ready=true;storageV2State.available=true;storageV2State.latest=written;storageV2State.error='';storageV2State.lastReason=String(reason||'');
    storageV2SetState(match?'synced':'mismatch');
    persistAudit(match?'storage_v2_sync_ok':'storage_v2_sync_verify_failed',{reason:String(reason||''),rideCount:local.rideCount,doneCount:local.doneCount,hash:local.contentHash});
    return{ok:match,local,latest:written};
  }).catch(e=>{
    const msg=String(e?.message||e);storageV2State.ready=true;storageV2State.available=false;storageV2State.error=msg;storageV2State.lastReason=String(reason||'');storageV2SetState('error');persistAudit('storage_v2_sync_failed',{reason:String(reason||''),message:msg});return{ok:false,error:msg};
  });
  return storageV2SyncQueue;
}
async function initStorageV2Phase1(){
  try{
    const local=storageV2LocalSnapshot('startup'),latest=await readStorageV2Latest();
    storageV2State.ready=true;storageV2State.available=true;storageV2State.latest=latest;storageV2State.error='';storageV2State.lastReason='startup';
    if(!latest){
      const seeded=await syncStorageV2Phase1('startup-initial-seed');
      if(!seeded?.ok)showToast('Storage V2 Sicherheitskopie konnte nicht bestaetigt werden. Bestehender Speicher bleibt unveraendert.','warn');
      return seeded;
    }
    const match=storageV2SnapshotsMatch(latest,local);storageV2SetState(match?'synced':'mismatch');
    persistAudit(match?'storage_v2_startup_ok':'storage_v2_startup_mismatch',{localRides:local.rideCount,v2Rides:latest.rideCount,localDone:local.doneCount,v2Done:latest.doneCount});
    if(!match)showToast('Storage V2: Abweichung erkannt. Keine automatische Reparatur oder Löschung.','warn');
    return{ok:match,local,latest};
  }catch(e){
    const msg=String(e?.message||e);storageV2State.ready=true;storageV2State.available=false;storageV2State.error=msg;storageV2State.lastReason='startup';storageV2SetState('error');persistAudit('storage_v2_startup_failed',{message:msg});return{ok:false,error:msg};
  }
}
function ensureStorageV2StatusCard(){
  const body=$('settingsBackupBody');if(!body)return false;
  let card=$('atmsStorageV2Card');
  if(!card){
    card=document.createElement('section');card.id='atmsStorageV2Card';
    card.style.cssText='margin:14px 0 0;padding:16px;border:1px solid rgba(74,191,255,.34);border-radius:18px;background:linear-gradient(180deg,rgba(8,48,68,.92),rgba(5,31,45,.96));box-sizing:border-box';
    card.innerHTML=`<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px"><div><div style="font-size:18px;font-weight:900;color:#fff">🗄️ Storage V2 · Sicherheitsmodus</div><div style="font-size:12px;opacity:.72;margin-top:3px">Phase 1 · Paralleltest ohne automatische Löschung</div></div><span id="atmsStorageV2Badge" style="padding:6px 9px;border-radius:999px;font-size:11px;font-weight:900;background:rgba(255,255,255,.10)">PRÜFUNG</span></div><p style="margin:12px 0;font-size:13px;line-height:1.45;opacity:.86">Der bisherige localStorage bleibt Hauptspeicher. Fahrten und Erledigt-Status werden zusätzlich in IndexedDB gespiegelt und danach exakt verglichen. Bei Abweichung wird nichts automatisch überschrieben.</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div style="padding:11px;border-radius:12px;background:rgba(0,0,0,.18)"><b id="atmsStorageV2RideCount" style="font-size:22px">–</b><div style="font-size:11px;opacity:.72">Fahrten · lokal / V2</div></div><div style="padding:11px;border-radius:12px;background:rgba(0,0,0,.18)"><b id="atmsStorageV2DoneCount" style="font-size:22px">–</b><div style="font-size:11px;opacity:.72">Erledigt · lokal / V2</div></div></div><div id="atmsStorageV2Detail" style="margin-top:10px;padding:10px;border-radius:11px;background:rgba(0,0,0,.16);font-size:12px;line-height:1.4">Initialisierung …</div><button type="button" id="atmsStorageV2CheckBtn" style="width:100%;margin-top:10px;padding:12px;border-radius:11px;border:1px solid rgba(255,255,255,.20);background:rgba(255,255,255,.08);color:#fff;font-weight:900">🔎 Synchronisierung prüfen</button>`;
    body.appendChild(card);
    $('atmsStorageV2CheckBtn')?.addEventListener('click',async e=>{const btn=e.currentTarget;btn.disabled=true;try{await checkStorageV2Phase1('manual-check',true)}finally{btn.disabled=false}});
  }
  renderStorageV2StatusCard();return true;
}
function renderStorageV2StatusCard(){
  const card=$('atmsStorageV2Card');if(!card)return;
  const d=storageV2Diagnosis(),badge=$('atmsStorageV2Badge'),ridesEl=$('atmsStorageV2RideCount'),doneEl=$('atmsStorageV2DoneCount'),detail=$('atmsStorageV2Detail');
  if(ridesEl)ridesEl.textContent=`${d.local?.rideCount??'–'} / ${d.storageV2?.rideCount??'–'}`;
  if(doneEl)doneEl.textContent=`${d.local?.doneCount??'–'} / ${d.storageV2?.doneCount??'–'}`;
  const status=d.status;
  if(badge){badge.textContent=status==='synced'?'SYNCHRON':status==='mismatch'?'ABWEICHUNG':status==='error'?'FEHLER':status==='empty'?'LEER':'PRÜFUNG';badge.style.background=status==='synced'?'rgba(33,196,111,.20)':status==='mismatch'||status==='error'?'rgba(255,94,94,.20)':'rgba(255,193,66,.18)';badge.style.color=status==='synced'?'#67f0a5':status==='mismatch'||status==='error'?'#ff9090':'#ffd36e'}
  if(detail){
    if(status==='synced')detail.textContent=`✓ Exakter Abgleich bestätigt${d.lastCheckedAt?' · '+new Date(d.lastCheckedAt).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}):''}. localStorage bleibt weiterhin Hauptspeicher.`;
    else if(status==='mismatch')detail.textContent='⚠ Unterschiedliche Stände erkannt. Sicherheitsmodus aktiv: Keine automatische Reparatur, Löschung oder Umschaltung.';
    else if(status==='error')detail.textContent='⚠ Storage V2 nicht bestätigt: '+(d.error||'unbekannter Fehler')+'. Bestehender localStorage bleibt unverändert.';
    else detail.textContent='Storage V2 wird geprüft. Es werden keine aktiven Daten gelöscht.';
  }
}

// STORAGE V2 PHASE 2A: bewusst manuelles, nicht-destruktives Tagesarchiv.
// Es wird niemals automatisch archiviert oder aus dem aktiven Bestand geloescht.
// Die externe .atmsarchive-Datei gilt erst nach nativer Write-Read-Pruefung als bestaetigt.
function storageV2ArchiveIsoDate(value){
  const s=String(value||'').trim();
  if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s;
  const m=s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  return m?`${m[3]}-${m[2]}-${m[1]}`:'';
}
function storageV2ArchiveRideDate(r){return storageV2ArchiveIsoDate(first(r?.date,r?.planDate,r?.datum))}
function storageV2ArchiveLocalData(){
  const ridesRaw=localStorage.getItem(KEY),doneRaw=localStorage.getItem(DONE);
  if(ridesRaw===null||doneRaw===null)throw new Error('Archivierung blockiert: Fahrten- oder Erledigt-Speicher fehlt.');
  let storedRides,storedDone;
  try{storedRides=JSON.parse(ridesRaw);storedDone=JSON.parse(doneRaw)}catch(_){throw new Error('Archivierung blockiert: Fahrten-/Status-Speicher ist unlesbar.');}
  if(!Array.isArray(storedRides)||!Array.isArray(storedDone))throw new Error('Archivierung blockiert: Erwartete Listenstruktur fehlt.');
  return{storedRides,storedDone,ridesRaw,doneRaw};
}
function storageV2ArchiveDates(){
  try{return[...new Set(storageV2ArchiveLocalData().storedRides.map(storageV2ArchiveRideDate).filter(Boolean))].sort()}
  catch(_){return[]}
}
function storageV2ArchiveCatalog(){
  try{const value=JSON.parse(localStorage.getItem(STORAGE_V2_ARCHIVE_CATALOG)||'[]');return Array.isArray(value)?value.filter(x=>x&&typeof x==='object'):[]}
  catch(_){return[]}
}
function storageV2ArchiveDateLabel(date){
  const iso=storageV2ArchiveIsoDate(date);if(!iso)return String(date||'–');
  const m=iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${m[3]}.${m[2]}.${m[1]}`:iso;
}
async function storageV2ArchiveSha256(text){
  if(!window.crypto?.subtle||typeof TextEncoder==='undefined')throw new Error('SHA-256 ist auf diesem Gerät nicht verfügbar. Archivierung bleibt unverändert blockiert.');
  const bytes=new TextEncoder().encode(String(text??''));
  const digest=await window.crypto.subtle.digest('SHA-256',bytes);
  return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
}
function storageV2ArchiveSourceForDate(date){
  const iso=storageV2ArchiveIsoDate(date);if(!iso)throw new Error('Bitte einen gültigen Archivtag auswählen.');
  const local=storageV2ArchiveLocalData(),dayRides=local.storedRides.filter(r=>storageV2ArchiveRideDate(r)===iso);
  if(!dayRides.length)throw new Error('Für diesen Tag sind keine Fahrten gespeichert.');
  const rideIds=dayRides.map(r=>String(r?.id||'').trim());
  if(rideIds.some(id=>!id))throw new Error('Archivierung blockiert: Mindestens eine Fahrt besitzt keine eindeutige ID.');
  if(new Set(rideIds).size!==rideIds.length)throw new Error('Archivierung blockiert: Doppelte Fahrt-IDs im Tagesbestand erkannt.');
  const dayIdSet=new Set(rideIds),doneIds=local.storedDone.map(x=>String(x||'').trim()).filter(id=>id&&dayIdSet.has(id));
  if(new Set(doneIds).size!==doneIds.length)throw new Error('Archivierung blockiert: Doppelte Erledigt-IDs im Tagesbestand erkannt.');
  const v2=storageV2Diagnosis();
  return{iso,dayRides,rideIds:rideIds.slice().sort(),doneIds:doneIds.slice().sort(),activeRideCount:local.storedRides.length,activeDoneCount:local.storedDone.length,storageV2:v2};
}
async function buildStorageV2DailyArchive(date){
  const source=storageV2ArchiveSourceForDate(date),createdAt=new Date().toISOString();
  const core={
    format:'ATMS_ARCHIVE',formatVersion:1,archiveSchema:STORAGE_V2_ARCHIVE_SCHEMA,app:'ATMS PRO',appVersion:'1.4.0',
    archiveDate:source.iso,createdAt,mode:'read-only',destructive:false,sourceOfTruth:'localStorage',
    rideCount:source.dayRides.length,doneCount:source.doneIds.length,rideIds:source.rideIds,doneIds:source.doneIds,rides:source.dayRides,
    sourceMeta:{activeRideCount:source.activeRideCount,activeDoneCount:source.activeDoneCount,rideStorageKey:KEY,doneStorageKey:DONE,storageV2Phase1:{status:source.storageV2.status,exactMatch:source.storageV2.exactMatch,localContentHash:source.storageV2.local?.contentHash||'',v2ContentHash:source.storageV2.storageV2?.contentHash||''}}
  };
  const payloadSha256=await storageV2ArchiveSha256(JSON.stringify(core));
  const archive={...core,integrity:{algorithm:'SHA-256',payloadSha256}};
  await verifyStorageV2ArchiveObject(archive);
  const text=JSON.stringify(archive,null,2),fileSha256=await storageV2ArchiveSha256(text);
  return{archive,text,fileSha256};
}
async function verifyStorageV2ArchiveObject(obj){
  if(!obj||obj.format!=='ATMS_ARCHIVE'||obj.formatVersion!==1||obj.archiveSchema!==STORAGE_V2_ARCHIVE_SCHEMA)throw new Error('Archivprüfung fehlgeschlagen: Format/Version ungültig.');
  if(!Array.isArray(obj.rides)||!Array.isArray(obj.rideIds)||!Array.isArray(obj.doneIds))throw new Error('Archivprüfung fehlgeschlagen: Listenstruktur fehlt.');
  if(Number(obj.rideCount)!==obj.rides.length||Number(obj.doneCount)!==obj.doneIds.length)throw new Error('Archivprüfung fehlgeschlagen: Anzahl stimmt nicht.');
  const ids=obj.rides.map(r=>String(r?.id||'').trim());
  if(ids.some(id=>!id)||new Set(ids).size!==ids.length)throw new Error('Archivprüfung fehlgeschlagen: Fahrt-IDs fehlen oder sind doppelt.');
  const sortedIds=ids.slice().sort(),declaredIds=obj.rideIds.map(String).slice().sort();
  if(JSON.stringify(sortedIds)!==JSON.stringify(declaredIds))throw new Error('Archivprüfung fehlgeschlagen: Fahrt-ID-Liste stimmt nicht.');
  const idSet=new Set(sortedIds),doneIds=obj.doneIds.map(String);
  if(doneIds.some(id=>!idSet.has(id))||new Set(doneIds).size!==doneIds.length)throw new Error('Archivprüfung fehlgeschlagen: Erledigt-IDs sind inkonsistent.');
  if(obj.integrity?.algorithm!=='SHA-256'||!/^[0-9a-f]{64}$/i.test(String(obj.integrity?.payloadSha256||'')))throw new Error('Archivprüfung fehlgeschlagen: Prüfsumme fehlt.');
  const {integrity,...core}=obj,actual=await storageV2ArchiveSha256(JSON.stringify(core));
  if(actual.toLowerCase()!==String(integrity.payloadSha256).toLowerCase())throw new Error('Archivprüfung fehlgeschlagen: SHA-256 stimmt nicht.');
  return true;
}
function storageV2ArchiveFolderState(){
  const bridge=window.ATMSNativeFileExport;
  if(!bridge||typeof bridge.getArchiveFolderState!=='function')return{supported:false,configured:false,persistedReadWrite:false,writable:false,folderName:''};
  try{return{supported:true,...(bridge.getArchiveFolderState()||{})}}catch(e){return{supported:true,configured:false,persistedReadWrite:false,writable:false,folderName:'',error:String(e?.message||e||'')}}
}
async function chooseStorageV2ArchiveFolder(){
  const bridge=window.ATMSNativeFileExport;
  if(!bridge||typeof bridge.chooseArchiveFolder!=='function')throw new Error('Native Archivordner-Auswahl ist in dieser App-Version nicht verfügbar.');
  const result=await bridge.chooseArchiveFolder();
  if(!result?.configured||!result?.persistedReadWrite)throw new Error('Die dauerhafte Lese-/Schreibfreigabe für den Archivordner wurde nicht bestätigt.');
  return result;
}
function storageV2ArchiveBase64Utf8(value){
  const raw=String(value||'');if(!raw)throw new Error('Archivdatei enthält keine lesbaren Daten.');
  const binary=atob(raw),bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
  return new TextDecoder('utf-8',{fatal:true}).decode(bytes);
}
async function readStorageV2ArchiveVerified(entry){
  const bridge=window.ATMSNativeFileExport,folder=storageV2ArchiveFolderState(),fileName=String(entry?.fileName||'').trim();
  if(!bridge||typeof bridge.readArchiveFile!=='function')throw new Error('Native Archiv-Lesefunktion ist in dieser App-Version nicht verfügbar.');
  if(!folder.supported||!folder.configured||!folder.persistedReadWrite)throw new Error('Der persistente Archivordner ist nicht sicher freigegeben.');
  if(!fileName||!/\.atmsarchive$/i.test(fileName))throw new Error('Archivdateiname ist ungültig.');
  const result=await bridge.readArchiveFile(fileName);
  if(!result||result.verifiedReadBack!==true)throw new Error('Archivdatei wurde nicht als nativ zurückgelesen bestätigt.');
  const expectedSha=String(entry?.fileSha256||'').toLowerCase(),actualSha=String(result.sha256||'').toLowerCase();
  if(!/^[0-9a-f]{64}$/.test(expectedSha)||actualSha!==expectedSha)throw new Error('Archivdatei-SHA-256 stimmt nicht mit dem verifizierten Archivkatalog überein.');
  if(Number(entry?.byteLength)>0&&Number(result.byteLength)!==Number(entry.byteLength))throw new Error('Archivdatei-Größe stimmt nicht mit dem verifizierten Archivkatalog überein.');
  const text=storageV2ArchiveBase64Utf8(result.base64Data),obj=JSON.parse(text);
  await verifyStorageV2ArchiveObject(obj);
  if(String(obj.archiveDate||'')!==String(entry?.archiveDate||''))throw new Error('Archivdatum stimmt nicht mit dem Archivkatalog überein.');
  if(Number(obj.rideCount)!==Number(entry?.rideCount)||Number(obj.doneCount)!==Number(entry?.doneCount))throw new Error('Archivzähler stimmen nicht mit dem Archivkatalog überein.');
  if(String(obj.integrity?.payloadSha256||'').toLowerCase()!==String(entry?.payloadSha256||'').toLowerCase())throw new Error('Archiv-Payload stimmt nicht mit dem Archivkatalog überein.');
  return{archive:obj,fileMeta:result};
}
let storageV2ArchiveViewerReturnScrollY=0;
function closeStorageV2ArchiveViewer(){
  const viewer=$('atmsArchiveViewer');if(viewer)viewer.remove();
  const host=$('settingsBackupBody');
  if(host){Array.from(host.children).forEach(el=>{if(el?.dataset?.atmsArchiveViewerHidden==='1'){el.style.display=el.dataset.atmsArchiveViewerPrevDisplay||'';delete el.dataset.atmsArchiveViewerHidden;delete el.dataset.atmsArchiveViewerPrevDisplay;}})}
  const y=Number(storageV2ArchiveViewerReturnScrollY)||0;storageV2ArchiveViewerReturnScrollY=0;
  requestAnimationFrame(()=>{try{window.scrollTo({top:y,left:0,behavior:'auto'})}catch(_){window.scrollTo(0,y)}});
}
function renderStorageV2ArchiveViewer(entry,archive,fileMeta){
  closeStorageV2ArchiveViewer();
  const doneIds=new Set((Array.isArray(archive?.doneIds)?archive.doneIds:[]).map(String));
  const cards=(Array.isArray(archive?.rides)?archive.rides:[]).map((raw,i)=>{
    const n=norm(raw,i),id=String(raw?.id||n.id||''),time=String(first(raw?.dispoTime,raw?.dispo_abholzeit,raw?.time,raw?.planTime,raw?.plan_abholzeit,raw?.zeit_abfahrt,n.time)||'–'),driver=String(first(raw?.driver,raw?.fahrer,n.driver)||'Offen');
    const pickup=String(first(raw?.pickup,raw?.abholort,raw?.start,raw?.von,n.pickup)||'Start nicht verfügbar'),destination=String(first(raw?.destination,raw?.zielort,raw?.ziel,raw?.nach,n.destination)||'Ziel nicht verfügbar');
    const flight=String(first(raw?.flightNumber,raw?.flugnummer,raw?.flugnummer_in,raw?.flugnummer_out,n.flightNumber)||'').replace(/^[-–]$/,'');
    const location=String(first(raw?.flightLocation,raw?.flugort,raw?.ort,raw?.ziel_zielort,n.flightLocation)||'');
    const vehicle=String(first(raw?.vehicle,raw?.fahrzeug,n.vehicle)||'–'),persons=Number(first(raw?.persons,raw?.personen,raw?.pax,n.persons)||0),done=doneIds.has(id);
    return `<article style="padding:11px;border-radius:12px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.09);margin-top:8px"><div style="display:flex;justify-content:space-between;gap:10px"><div><b style="font-size:17px">${esc(time)}</b> · ${esc(driver)}</div>${done?'<span style="font-size:10px;font-weight:900;color:#76efad">ERLEDIGT</span>':''}</div><div style="font-size:13px;font-weight:800;margin-top:5px">${esc(pickup)} → ${esc(destination)}</div><div style="font-size:11px;opacity:.76;margin-top:5px">${flight?`✈ ${esc(flight)}${location?' · '+esc(location):''} · `:''}🚘 ${esc(vehicle)} · 👤 ${persons||'–'} · ${esc(ridePriceLabel(n))}</div></article>`;
  }).join('');
  const host=$('settingsBackupBody');
  storageV2ArchiveViewerReturnScrollY=Number(window.scrollY||document.documentElement?.scrollTop||0)||0;
  const viewer=document.createElement('section');viewer.id='atmsArchiveViewer';viewer.style.cssText='display:block!important;visibility:visible!important;opacity:1!important;position:relative;z-index:2;width:100%;min-height:70vh;background:#071923;color:#fff;padding:0 0 18px;box-sizing:border-box';
  viewer.innerHTML=`<div style="position:sticky;top:0;z-index:3;background:#071923;border-bottom:1px solid rgba(255,255,255,.10);padding:8px 0 10px;display:flex;align-items:center;gap:10px"><button type="button" id="atmsArchiveViewerClose" style="width:42px;height:42px;border-radius:12px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);color:#fff;font-size:25px">‹</button><div><div style="font-size:18px;font-weight:900">🗃️ Archiv · ${esc(storageV2ArchiveDateLabel(archive.archiveDate))}</div><div style="font-size:11px;opacity:.7">READ-ONLY · ${Number(archive.rideCount)||0} Fahrten · ${Number(archive.doneCount)||0} erledigt</div></div></div><main style="padding:12px 0 4px"><div style="padding:11px;border-radius:12px;background:rgba(33,196,111,.08);border:1px solid rgba(103,240,165,.20);font-size:11px;line-height:1.5;color:#b8f7d0"><b>✓ Verifiziert gelesen</b><br>Datei-SHA-256 ${esc(String(fileMeta?.sha256||'').slice(0,16))}… · ${Number(fileMeta?.byteLength)||0} Byte<br>${esc(entry.fileName||'')} · ${esc(fileMeta?.folderName||entry.folderName||'ATMS PRO Archive')}<br><b>Keine Wiederherstellung:</b> Diese Ansicht verändert aktive Fahrten oder Archive nicht.</div>${cards||'<div style="padding:20px;text-align:center;opacity:.7">Keine Fahrten im Archiv.</div>'}</main>`;
  if(host){
    Array.from(host.children).forEach(el=>{el.dataset.atmsArchiveViewerHidden='1';el.dataset.atmsArchiveViewerPrevDisplay=el.style.display||'';el.style.display='none'});
    host.prepend(viewer);
  }else{
    viewer.style.cssText+='position:fixed;top:0;right:0;bottom:0;left:0;z-index:2147483000;overflow:auto;padding:12px 14px;background:#071923;';
    document.body.insertBefore(viewer,document.body.firstChild||null);
  }
  $('atmsArchiveViewerClose')?.addEventListener('click',closeStorageV2ArchiveViewer);
  requestAnimationFrame(()=>{try{viewer.scrollIntoView({block:'start',behavior:'auto'})}catch(_){viewer.scrollIntoView(true)}});
}
async function openStorageV2ArchiveViewerById(id){
  if(storageV2ArchiveReadBusy)return false;const entry=storageV2ArchiveCatalog().find(x=>String(x?.id||'')===String(id||''));if(!entry){showToast('Archivnachweis nicht gefunden','warn');return false}
  storageV2ArchiveReadBusy=true;renderStorageV2ArchiveCard();storageV2ArchiveSetStatus('Archivdatei wird nativ gelesen und erneut verifiziert …');
  try{const loaded=await readStorageV2ArchiveVerified(entry);renderStorageV2ArchiveViewer(entry,loaded.archive,loaded.fileMeta);storageV2ArchiveSetStatus('✓ Archivdatei verifiziert geöffnet · READ-ONLY','ok');persistAudit('storage_v2_p104_archive_opened',{archiveDate:entry.archiveDate,fileName:entry.fileName,fileSha256:entry.fileSha256,rideCount:entry.rideCount});return true}
  catch(e){const msg=String(e?.message||e||'Unbekannter Fehler');storageV2ArchiveSetStatus('⚠ Archiv konnte nicht sicher geöffnet werden: '+msg,'warn');persistAudit('storage_v2_p104_archive_open_failed',{fileName:entry.fileName,message:msg});showToast('Archiv konnte nicht sicher geöffnet werden','warn');return false}
  finally{storageV2ArchiveReadBusy=false;renderStorageV2ArchiveCard()}
}

async function saveStorageV2ArchiveVerified(text,fileName,expectedFileSha256){
  const bridge=window.ATMSNativeFileExport;
  if(!bridge||typeof bridge.saveBase64FileVerified!=='function')throw new Error('Native Dateiprüfung ist nicht verfügbar. Archivierung bleibt blockiert.');
  const blob=new Blob([text],{type:'application/octet-stream'}),payload=await blobToBase64Payload(blob);
  const folder=storageV2ArchiveFolderState();
  let result;
  if(folder.supported&&folder.configured){
    if(!folder.persistedReadWrite||!folder.writable)throw new Error('Die gespeicherte Archivordner-Berechtigung ist nicht mehr gültig. Bitte Archivordner erneut wählen.');
    if(typeof bridge.saveBase64FileToArchiveFolderVerified!=='function')throw new Error('Native Direktablage im Archivordner ist nicht verfügbar.');
    result=await bridge.saveBase64FileToArchiveFolderVerified(payload,fileName,'application/octet-stream');
  }else{
    result=await bridge.saveBase64FileVerified(payload,fileName,'application/octet-stream');
    result={...(result||{}),storageMode:'save-dialog',fileName};
  }
  if(!result||result.verifiedReadBack!==true)throw new Error('Archivdatei wurde nicht als zurückgelesen bestätigt.');
  const expectedBytes=new TextEncoder().encode(text).byteLength;
  if(Number(result.byteLength)!==expectedBytes)throw new Error(`Archivprüfung fehlgeschlagen: Dateigröße ${result.byteLength??'–'} statt ${expectedBytes} Byte.`);
  if(String(result.sha256||'').toLowerCase()!==String(expectedFileSha256||'').toLowerCase())throw new Error('Archivprüfung fehlgeschlagen: Datei-SHA-256 weicht nach dem Schreiben ab.');
  return result;
}
function rememberStorageV2Archive(archive,fileName,fileMeta,fileSha256){
  const actualFileName=String(fileMeta?.fileName||fileName||''),folderName=String(fileMeta?.folderName||''),storageMode=String(fileMeta?.storageMode||'save-dialog');
  const entry={id:`${archive.archiveDate}|${archive.integrity.payloadSha256}`,archiveDate:archive.archiveDate,createdAt:archive.createdAt,rideCount:archive.rideCount,doneCount:archive.doneCount,fileName:actualFileName,folderName,storageMode,payloadSha256:archive.integrity.payloadSha256,fileSha256:String(fileSha256||''),byteLength:Number(fileMeta?.byteLength)||0,verifiedReadBack:true,readOnly:true};
  const next=[entry,...storageV2ArchiveCatalog().filter(x=>String(x.id)!==entry.id)].slice(0,400);
  return safePersistentSetItem(STORAGE_V2_ARCHIVE_CATALOG,JSON.stringify(next),'storage-v2-phase2b-archive-catalog')?entry:null;
}
function storageV2ArchiveSetStatus(message,type=''){
  const el=$('atmsArchiveStatus');if(!el)return;el.textContent=message;el.style.color=type==='ok'?'#76efad':type==='warn'?'#ffd36e':'rgba(255,255,255,.82)';
}
function renderStorageV2ArchiveCard(){
  const card=$('atmsStorageV2ArchiveCard');if(!card)return;
  const dates=storageV2ArchiveDates(),select=$('atmsArchiveDateSelect'),count=$('atmsArchiveDayCount'),list=$('atmsArchiveList'),btn=$('atmsCreateArchiveBtn'),folderStatus=$('atmsArchiveFolderStatus'),folderBtn=$('atmsChooseArchiveFolderBtn');
  const folder=storageV2ArchiveFolderState();
  if(folderStatus){
    if(!folder.supported)folderStatus.innerHTML='<b>Archivordner:</b> Native Phase 2B noch nicht verfügbar. Phase-2A-Speicherdialog bleibt aktiv.';
    else if(folder.configured&&folder.persistedReadWrite)folderStatus.innerHTML=`<b>Archivordner:</b> ✓ ${esc(folder.folderName||'ausgewählt')} · dauerhafte Lese-/Schreibfreigabe bestätigt`;
    else if(folder.configured)folderStatus.innerHTML='<b>Archivordner:</b> ⚠ gespeicherte Freigabe nicht mehr gültig · bitte neu wählen';
    else folderStatus.innerHTML='<b>Archivordner:</b> Noch nicht gewählt. Bis dahin bleibt der bestätigte Phase-2A-Speicherdialog aktiv.';
  }
  if(folderBtn){folderBtn.disabled=storageV2ArchiveBusy||!folder.supported;folderBtn.textContent=folder.configured?'📁 Archivordner ändern':'📁 Archivordner wählen';}
  const previous=select?.value||'',selected=dates.includes(previous)?previous:(dates[0]||'');
  if(select){select.innerHTML=dates.length?dates.map(d=>`<option value="${esc(d)}" ${d===selected?'selected':''}>${esc(storageV2ArchiveDateLabel(d))}</option>`).join(''):'<option value="">Keine archivfähigen Tage</option>';select.disabled=!dates.length||storageV2ArchiveBusy;}
  let dayCount=0;if(selected){try{dayCount=storageV2ArchiveSourceForDate(selected).dayRides.length}catch(_){}}
  if(count)count.textContent=selected?`${dayCount} Fahrt${dayCount===1?'':'en'} · aktive Daten bleiben unverändert`:'Keine Tagesdaten verfügbar';
  if(btn){btn.disabled=!selected||storageV2ArchiveBusy;btn.textContent=storageV2ArchiveBusy?'Archiv wird geschrieben & geprüft …':'📦 Tagesarchiv erstellen & prüfen';}
  const catalog=storageV2ArchiveCatalog().slice().sort((a,b)=>String(b.archiveDate||'').localeCompare(String(a.archiveDate||''))||String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
  if(list)list.innerHTML=catalog.length?catalog.map(x=>{const readable=Boolean(folder.supported&&folder.configured&&folder.persistedReadWrite&&String(x.storageMode||'')==='persisted-folder'&&x.fileName);return `<div style="padding:10px 11px;border-radius:12px;background:rgba(0,0,0,.16);margin-top:8px"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b>${esc(storageV2ArchiveDateLabel(x.archiveDate))}</b><span style="font-size:10px;font-weight:900;color:#76efad">VERIFIZIERT</span></div><div style="font-size:12px;opacity:.78;margin-top:4px">${Number(x.rideCount)||0} Fahrten · ${Number(x.doneCount)||0} erledigt · read-only</div><div style="font-size:10px;opacity:.58;margin-top:4px;word-break:break-all">SHA-256 ${esc(String(x.fileSha256||'').slice(0,16))}… · ${esc(x.fileName||'')}${x.folderName?' · '+esc(x.folderName):''}</div>${readable?`<button type="button" data-atms-archive-open="${esc(String(x.id||''))}" ${storageV2ArchiveReadBusy?'disabled':''} style="width:100%;margin-top:8px;padding:9px;border-radius:9px;border:1px solid rgba(74,191,255,.34);background:rgba(74,191,255,.10);color:#c5edff;font-weight:900">👁 Archiv ansehen · READ-ONLY</button>`:`<div style="font-size:10px;opacity:.55;margin-top:7px">Direktansicht nur für Archive im bestätigten persistenten Archivordner.</div>`}</div>`}).join(''):'<div style="font-size:12px;opacity:.7;padding:8px 0">Noch kein verifiziertes Tagesarchiv in dieser App registriert.</div>';
}
function ensureStorageV2ArchiveCard(){
  const body=$('settingsBackupBody');if(!body)return false;
  let card=$('atmsStorageV2ArchiveCard');
  if(!card){
    card=document.createElement('section');card.id='atmsStorageV2ArchiveCard';card.style.cssText='margin:14px 0 0;padding:16px;border:1px solid rgba(215,178,82,.38);border-radius:18px;background:linear-gradient(180deg,rgba(34,43,54,.96),rgba(12,29,42,.98));box-sizing:border-box';
    card.innerHTML=`<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px"><div><div style="font-size:18px;font-weight:900;color:#fff">🗃️ Tagesarchiv</div><div style="font-size:12px;opacity:.72;margin-top:3px">Storage V2 Phase 2B · persistenter Archivordner · nicht-destruktiv</div></div><span style="padding:6px 9px;border-radius:999px;font-size:10px;font-weight:900;background:rgba(215,178,82,.16);color:#f2d37a">READ-ONLY</span></div><p style="margin:12px 0;font-size:13px;line-height:1.45;opacity:.86">Ein ausgewählter Tag wird als <b>.atmsarchive</b> geschrieben. Nach einmaliger Ordnerfreigabe speichert Android weitere Archive direkt dort und liest jede neue Datei sofort wieder zurück; Anzahl, IDs, Bytes und SHA-256 werden geprüft. Es wird nichts aus den aktiven Fahrten gelöscht.</p><div id="atmsArchiveFolderStatus" style="padding:10px 11px;border-radius:11px;background:rgba(0,0,0,.16);font-size:12px;line-height:1.4">Archivordner wird geprüft …</div><button type="button" id="atmsChooseArchiveFolderBtn" style="width:100%;margin-top:8px;padding:11px;border-radius:11px;border:1px solid rgba(74,191,255,.38);background:rgba(74,191,255,.11);color:#bfeaff;font-weight:900">📁 Archivordner wählen</button><label style="display:block;font-size:11px;font-weight:800;opacity:.7;margin:13px 0 5px">Archivtag</label><select id="atmsArchiveDateSelect" style="width:100%;min-height:44px;border-radius:11px;padding:0 10px;background:#102b3b;color:#fff;border:1px solid rgba(255,255,255,.18)"></select><div id="atmsArchiveDayCount" style="font-size:12px;opacity:.72;margin-top:7px">–</div><button type="button" id="atmsCreateArchiveBtn" style="width:100%;margin-top:11px;padding:12px;border-radius:11px;border:1px solid rgba(215,178,82,.45);background:rgba(215,178,82,.14);color:#f7e3a4;font-weight:900">📦 Tagesarchiv erstellen &amp; prüfen</button><div id="atmsArchiveStatus" style="margin-top:10px;padding:10px;border-radius:11px;background:rgba(0,0,0,.16);font-size:12px;line-height:1.4">Bereit. Keine automatische Archivierung oder Löschung aktiv.</div><div style="margin-top:13px;font-size:13px;font-weight:900">Archivübersicht · read-only</div><div id="atmsArchiveList"></div>`;
    body.appendChild(card);
    $('atmsArchiveDateSelect')?.addEventListener('change',()=>renderStorageV2ArchiveCard());
    $('atmsArchiveList')?.addEventListener('click',e=>{const btn=e.target.closest('[data-atms-archive-open]');if(btn)openStorageV2ArchiveViewerById(btn.dataset.atmsArchiveOpen)});
    $('atmsChooseArchiveFolderBtn')?.addEventListener('click',async()=>{
      if(storageV2ArchiveBusy)return;
      storageV2ArchiveBusy=true;renderStorageV2ArchiveCard();storageV2ArchiveSetStatus('Android-Ordnerauswahl öffnen …');
      try{
        const result=await chooseStorageV2ArchiveFolder();
        persistAudit('storage_v2_phase2b_archive_folder_selected',{folderName:String(result?.folderName||''),persistedReadWrite:Boolean(result?.persistedReadWrite)});
        storageV2ArchiveSetStatus(`✓ Archivordner freigegeben${result?.folderName?' · '+result.folderName:''}. Künftige Tagesarchive werden dort direkt gespeichert und nach dem Schreiben zurückgelesen.`,'ok');
        showToast('Archivordner gespeichert','ok');
      }catch(e){
        const message=String(e?.message||e||'Unbekannter Fehler');
        storageV2ArchiveSetStatus(/abgebrochen/i.test(message)?'Ordnerauswahl abgebrochen. Bisherige Einstellung bleibt unverändert.':'⚠ Archivordner nicht bestätigt: '+message,'warn');
        if(!/abgebrochen/i.test(message))showToast('Archivordner nicht bestätigt','warn');
      }finally{storageV2ArchiveBusy=false;renderStorageV2ArchiveCard();}
    });
    $('atmsCreateArchiveBtn')?.addEventListener('click',async()=>{
      if(storageV2ArchiveBusy)return;const date=$('atmsArchiveDateSelect')?.value||'';if(!date)return;
      storageV2ArchiveBusy=true;renderStorageV2ArchiveCard();storageV2ArchiveSetStatus('Archivdaten werden gesammelt und mit SHA-256 geprüft …');
      try{
        const built=await buildStorageV2DailyArchive(date),fileName=`ATMS_Archiv_${built.archive.archiveDate}.atmsarchive`,folderBefore=storageV2ArchiveFolderState();
        storageV2ArchiveSetStatus(folderBefore.configured&&folderBefore.persistedReadWrite?`Archiv wird direkt in „${folderBefore.folderName||'Archivordner'}“ geschrieben und danach bytegenau zurückgelesen …`:'Android-Speicherdialog: Datei speichern. Danach wird sie automatisch zurückgelesen und bytegenau geprüft …');
        const fileMeta=await saveStorageV2ArchiveVerified(built.text,fileName,built.fileSha256);
        const remembered=rememberStorageV2Archive(built.archive,fileMeta?.fileName||fileName,fileMeta,built.fileSha256);
        const auditName=fileMeta?.storageMode==='persisted-folder'?'storage_v2_phase2b_archive_verified':'storage_v2_phase2a_archive_verified';
        persistAudit(auditName,{archiveDate:built.archive.archiveDate,rideCount:built.archive.rideCount,doneCount:built.archive.doneCount,payloadSha256:built.archive.integrity.payloadSha256,fileSha256:built.fileSha256,byteLength:fileMeta.byteLength,fileName:String(fileMeta?.fileName||fileName),folderName:String(fileMeta?.folderName||''),storageMode:String(fileMeta?.storageMode||'save-dialog'),catalogSaved:Boolean(remembered)});
        storageV2ArchiveSetStatus(remembered?`✓ Archiv verifiziert: ${built.archive.rideCount} Fahrten · SHA-256 bestätigt · Datei zurückgelesen${fileMeta?.folderName?' · '+fileMeta.folderName:''}. Aktive Daten unverändert.`:`✓ Archivdatei verifiziert. Der lokale Archivkatalog konnte jedoch nicht gespeichert werden; aktive Daten sind unverändert.`,remembered?'ok':'warn');
        showToast(remembered?'Tagesarchiv verifiziert':'Archivdatei verifiziert · Katalog nicht gespeichert',remembered?'ok':'warn');
      }catch(e){
        const message=String(e?.message||e||'Unbekannter Fehler');
        storageV2ArchiveSetStatus(/abgebrochen/i.test(message)?'Archiv-Speichern abgebrochen. Aktive Daten unverändert.':'⚠ Archiv nicht bestätigt: '+message+' Aktive Daten unverändert.','warn');
        persistAudit('storage_v2_phase2a_archive_failed',{archiveDate:date,message});
        if(!/abgebrochen/i.test(message))showToast('Archivierung nicht bestätigt','warn');
      }finally{storageV2ArchiveBusy=false;renderStorageV2ArchiveCard();}
    });
  }
  renderStorageV2ArchiveCard();return true;
}
window.addEventListener('atms-native-file-export-ready',()=>{try{renderStorageV2ArchiveCard()}catch(_){}});
function capturePersistenceSafety(reason='snapshot',syncDurable=true){
  try{
    const previous=readPersistenceSafety();
    const storage={};
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);
      if(!k||!k.startsWith('atms_'))continue;
      const raw=localStorage.getItem(k);
      if(raw!==null)storage[k]=raw;
    }

    // CORE-005V4: Ein normaler Snapshot darf den letzten verifizierten Schutzwert
    // eines kritischen Bereichs NICHT verlieren, nur weil dieser Key im aktuellen
    // localStorage gerade fehlt. Genau das hatte zuvor einen guten Safety-Snapshot
    // beim nächsten Startup mit einem "leeren" Snapshot überschrieben.
    // Ein absichtlicher kompletter ATMS-Reset löscht PERSIST_SAFETY_KEY separat.
    const protectedCritical=[KEY,DONE,FLIGHT_CACHE,FLIGHT_CACHE_BACKUP,RIDE_OVERRIDE_KEY,ADDRESS_BOOK,ADDRESS_CANDIDATES,PLAN_KEEP_PINNED];
    const preserved=[];
    for(const key of protectedCritical){
      if(Object.prototype.hasOwnProperty.call(storage,key))continue;
      const oldRaw=previous?.storage?.[key];
      if(typeof oldRaw==='string'&&oldRaw.length){
        storage[key]=oldRaw;
        preserved.push(key);
      }
    }

    const payload=writePersistenceSafety(storage,reason);
    persistAudit('snapshot',{reason:String(reason||''),keys:Object.keys(storage).length,preservedCritical:preserved});
    if(syncDurable)void syncPersistenceDurableShadow('snapshot:'+reason);
    return payload;
  }catch(e){persistAudit('snapshot_failed',{reason:String(reason||''),message:String(e?.message||e)});return null}
}
function safePersistentSetItem(key,rawValue,reason='write'){
  const value=String(rawValue??'');
  const before=localStorage.getItem(key);
  // Vor dem kritischen Schreibvorgang den letzten bekannten guten Wert sichern.
  if(before!==null)updatePersistenceSafetyKey(key,before,'prewrite:'+reason);
  try{
    localStorage.setItem(key,value);
    const readBack=localStorage.getItem(key);
    if(readBack!==value)throw new Error('Write-Read-Check fehlgeschlagen');
    updatePersistenceSafetyKey(key,value,'verified-write:'+reason);
    if([FLIGHT_CACHE,FLIGHT_CACHE_BACKUP,RIDE_OVERRIDE_KEY,ADDRESS_BOOK,ADDRESS_CANDIDATES,PLAN_KEEP_PINNED].includes(key)){
      // Revisionssicher: keine unbestaetigten optimistischen Durable-Werte.
      void syncPersistenceDurableShadow('verified-write:'+reason);
    }
    persistAudit('write_ok',{key,reason:String(reason||''),length:value.length});
    return true;
  }catch(e){
    try{if(before===null)localStorage.removeItem(key);else localStorage.setItem(key,before);}catch(_){ }
    persistAudit('write_failed',{key,reason:String(reason||''),message:String(e?.message||e)});
    return false;
  }
}
function restoreMissingCriticalPersistence(reason='auto-recovery'){
  const snap=readPersistenceSafety();
  const critical=[FLIGHT_CACHE,FLIGHT_CACHE_BACKUP,RIDE_OVERRIDE_KEY,ADDRESS_BOOK,ADDRESS_CANDIDATES,PLAN_KEEP_PINNED,...(persistenceDurableReady?[KEY,DONE]:[])];
  const restored=[];
  for(const key of critical){
    if(localStorage.getItem(key)!==null)continue;
    const fromSnap=snap?.storage?.[key],fromDurable=persistenceDurableShadow?.storage?.[key];
    // Unterschiedliche Fahrten-/Erledigt-Kopien sind ein Konflikt, keine
    // automatische Aufforderung zur Datenueberschreibung.
    if([KEY,DONE].includes(key)&&typeof fromSnap==='string'&&typeof fromDurable==='string'&&fromSnap!==fromDurable){
      persistAudit('critical_restore_conflict',{key,reason:String(reason||''),safetyLength:fromSnap.length,durableLength:fromDurable.length});
      continue;
    }
    const raw=(typeof fromDurable==='string'?fromDurable:fromSnap);
    if(typeof raw!=='string'||!raw.length)continue;
    try{
      localStorage.setItem(key,raw);
      if(localStorage.getItem(key)===raw)restored.push(key);
    }catch(_){ }
  }
  if(restored.length)persistAudit('critical_recovery',{reason:String(reason||''),keys:restored});
  return {restored:restored.length,keys:restored};
}
function persistenceSelfTest(){
  const key='ATMSPRO_PERSISTENCE_SELFTEST_TMP';
  const token='ok-'+Date.now()+'-'+Math.random().toString(36).slice(2);
  try{
    localStorage.setItem(key,token);
    const ok=localStorage.getItem(key)===token;
    localStorage.removeItem(key);
    return {ok,storageWritable:ok,safetySnapshot:Boolean(readPersistenceSafety()),checkedAt:new Date().toISOString()};
  }catch(e){try{localStorage.removeItem(key)}catch(_){ }return {ok:false,storageWritable:false,safetySnapshot:Boolean(readPersistenceSafety()),checkedAt:new Date().toISOString(),error:String(e?.message||e)}}
}
function persistenceDiagnosis(){
  const snap=readPersistenceSafety();
  let audit=[];try{audit=JSON.parse(localStorage.getItem(PERSIST_AUDIT_KEY)||'[]');if(!Array.isArray(audit))audit=[]}catch(_){audit=[]}
  const inspect=key=>{
    const raw=localStorage.getItem(key),shadow=snap?.storage?.[key],durable=persistenceDurableShadow?.storage?.[key];
    let count=null,parseOk=true;
    if(raw!==null){try{const v=JSON.parse(raw);count=Array.isArray(v)?v.length:(v&&typeof v==='object'?Object.keys(v).length:null)}catch(_){parseOk=false}}
    return {key,present:raw!==null,rawLength:raw?.length||0,parseOk,count,shadowPresent:typeof shadow==='string',shadowLength:typeof shadow==='string'?shadow.length:0,durablePresent:typeof durable==='string',durableLength:typeof durable==='string'?durable.length:0};
  };
  return {
    diagnosis:'CORE-005V5 Durable Persistence Safety',generatedAt:new Date().toISOString(),schema:PERSIST_SCHEMA,
    selfTest:persistenceSelfTest(),
    rideStatus:{inMemory:Array.isArray(rides)?rides.length:null,persisted:(()=>{try{const raw=localStorage.getItem(KEY);return raw===null?null:JSON.parse(raw).length}catch(_){return null}})(),durable:persistenceDurableShadow?.storage?.[KEY]?( ()=>{try{return JSON.parse(persistenceDurableShadow.storage[KEY]).length}catch(_){return null}})():null},
    safetySnapshot:{present:Boolean(snap),updatedAt:snap?.updatedAt||'',reason:snap?.reason||'',keys:snap?.storage?Object.keys(snap.storage).length:0},
    durableShadow:{present:Boolean(persistenceDurableShadow),ready:persistenceDurableReady,error:persistenceDurableError,updatedAt:persistenceDurableShadow?.updatedAt||'',reason:persistenceDurableShadow?.reason||'',keys:persistenceDurableShadow?.storage?Object.keys(persistenceDurableShadow.storage).length:0},
    storageV2:storageV2Diagnosis(),
    critical:{rides:inspect(KEY),done:inspect(DONE),flightCache:inspect(FLIGHT_CACHE),verifiedFlightBackup:inspect(FLIGHT_CACHE_BACKUP),rideOverrides:inspect(RIDE_OVERRIDE_KEY),addressBook:inspect(ADDRESS_BOOK),addressCandidates:inspect(ADDRESS_CANDIDATES),planKeepPinned:inspect(PLAN_KEEP_PINNED)},
    recentAudit:audit.slice(0,30)
  };
}
function ensurePersistenceSafetyPanel(){
  const view=$('importView');if(!view)return false;
  const liveHost=$('liveFlightPanel');
  const existing=$('atmsPersistenceSafetyPanel');
  if(existing){
    // CORE-005V3: Wenn ein vorheriger Mount ausserhalb/unsichtbar gelandet ist,
    // wird dasselbe Panel ohne Neuanlage direkt in den sicher sichtbaren Live-Host verschoben.
    if(liveHost&&existing.parentElement!==liveHost)liveHost.appendChild(existing);
    return true;
  }
  const panel=document.createElement('section');panel.id='atmsPersistenceSafetyPanel';panel.style.cssText='margin:16px 0 0;padding:14px;border:1px solid rgba(255,255,255,.18);border-radius:14px;background:rgba(255,255,255,.04)';
  panel.innerHTML=`<div style="font-weight:800;margin-bottom:6px">🛡️ CORE-005V5 · Persistenz-Sicherheit</div><div style="font-size:13px;opacity:.82;margin-bottom:10px">Additive Schutzschicht: localStorage + unabhängiger IndexedDB-Durable-Shadow, Write-Read-Check, fehlende kritische Daten wiederherstellen und Diagnose. Keine Cloud.</div><button type="button" id="atmsPersistenceSelfTestBtn" style="width:100%;padding:12px;border-radius:10px;font-weight:800">🧪 Persistenz-Selbsttest</button><button type="button" id="atmsPersistenceCopyBtn" style="width:100%;padding:12px;border-radius:10px;font-weight:800;margin-top:8px">📋 Persistenz-Diagnose kopieren</button><button type="button" id="atmsPersistenceRecoverBtn" style="width:100%;padding:12px;border-radius:10px;font-weight:800;margin-top:8px">↩️ Fehlende geschützte Daten wiederherstellen</button><button type="button" id="atmsRestorePreviousImportBtn" style="width:100%;padding:12px;border-radius:10px;font-weight:800;margin-top:8px">↩️ Letzten Planimport rückgängig machen</button><pre id="atmsPersistenceOutput" style="white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;width:100%;max-width:100%;box-sizing:border-box;max-height:42vh;overflow:auto;margin:10px 0 0;padding:10px;border-radius:10px;background:rgba(0,0,0,.22);font-size:12px;line-height:1.4">Bereit.</pre>`;
  // CORE-005V3: Das Live-Flugdaten-Panel ist auf Mobil bereits nachweislich sichtbar.
  // Deshalb wird die Persistenz-Sicherheit als Kind dieses Panels gemountet.
  // Fallbacks bleiben nur fuer den unwahrscheinlichen Fall, dass Live noch nicht existiert.
  if(liveHost)liveHost.appendChild(panel);
  else{
    const gemini=$('geminiFlightPanel');
    if(gemini)gemini.appendChild(panel);
    else{
      const load=$('loadBtn');
      if(load?.parentElement)load.parentElement.appendChild(panel);
      else view.appendChild(panel);
    }
  }
  const paint=obj=>{const out=$('atmsPersistenceOutput');if(out)out.textContent=JSON.stringify(obj,null,2)};
  $('atmsPersistenceSelfTestBtn')?.addEventListener('click',()=>{const result=persistenceDiagnosis();paint(result);showToast(result.selfTest?.ok?'Persistenz-Selbsttest OK':'Persistenz-Selbsttest fehlgeschlagen',result.selfTest?.ok?'ok':'warn')});
  $('atmsPersistenceCopyBtn')?.addEventListener('click',async()=>{const text=JSON.stringify(persistenceDiagnosis(),null,2);paint(JSON.parse(text));try{await navigator.clipboard.writeText(text);showToast('Persistenz-Diagnose kopiert','ok')}catch(_){showToast('Diagnose wird angezeigt – bitte manuell kopieren','warn')}});
  $('atmsPersistenceRecoverBtn')?.addEventListener('click',()=>{if(!confirm('Nur aktuell FEHLENDE kritische Persistenzdaten aus dem letzten lokalen Sicherheits-Snapshot wiederherstellen? Vorhandene aktuelle Werte werden nicht überschrieben.'))return;const result=restoreMissingCriticalPersistence('manual');paint({recovery:result,diagnosis:persistenceDiagnosis()});showToast(result.restored?`${result.restored} Bereich(e) wiederhergestellt`:'Keine fehlenden geschützten Daten gefunden',result.restored?'ok':'warn')});
  $('atmsRestorePreviousImportBtn')?.addEventListener('click',restorePreviousPlanImport);
  return true;
}
function initPersistenceSafetyPanelObserver(){
  if(window.__atmsPersistenceSafetyPanelObserver)return;
  const attach=()=>{try{ensurePersistenceSafetyPanel()}catch(_){ }};
  attach();
  const observer=new MutationObserver(()=>{if(!$('atmsPersistenceSafetyPanel'))attach()});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  window.__atmsPersistenceSafetyPanelObserver=observer;
  window.addEventListener('focus',attach);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)attach()});
}


function getRideOverrides(){
  try{
    const list=JSON.parse(localStorage.getItem(RIDE_OVERRIDE_KEY)||'[]');
    return Array.isArray(list)?list:[];
  }catch(_){return[]}
}
function saveRideOverrides(list){
  return safePersistentSetItem(RIDE_OVERRIDE_KEY,JSON.stringify((Array.isArray(list)?list:[]).slice(0,500)),'ride-overrides');
}
function upsertRideOverride(rideId,patch){
  const id=String(rideId||'').trim();
  if(!id)return;
  let list=getRideOverrides();
  const existing=list.find(x=>String(x?.rideId||'')===id)||{rideId:id};
  const next={...existing,...patch,rideId:id,updatedAt:new Date().toISOString()};
  list=list.filter(x=>String(x?.rideId||'')!==id);
  list.unshift(next);
  saveRideOverrides(list);
}
function applyRideOverrides(source){
  const overrides=new Map(getRideOverrides().map(x=>[String(x?.rideId||''),x]));
  let changed=0;
  const out=(Array.isArray(source)?source:[]).map(r=>{
    const hit=overrides.get(String(r?.id||''));
    if(!hit)return r;
    let next={...r};
    if(Number.isFinite(Number(hit.price))&&Number(hit.price)>0&&Number(next.price)!==Number(hit.price)){
      next.price=Number(hit.price);
      next.priceConfirmedAt=hit.priceConfirmedAt||hit.updatedAt||'';
      changed++;
    }
    // CORE-004C HOTFIX 05.09.2026: manuelle Flugdaten-Korrekturen pro Fahrt dauerhaft anwenden.
    if(hit.manualFlightEdit===true){
      const no=String(hit.flightNumber??next.flightNumber??'').trim().toUpperCase().replace(/\s+/g,'');
      const loc=String(hit.flightLocation??next.flightLocation??'').trim();
      const iata=String(hit.iata??next.iata??'').trim().toUpperCase();
      if(String(next.flightNumber||'')!==no||String(next.flightLocation||'').trim()!==loc||String(next.iata||'').trim().toUpperCase()!==iata){
        next.flightNumber=no;
        next.flightLocation=loc;
        next.iata=iata;
        next.flightCheckConfidence='manual';
        next.flightNeedsManualCheck=Boolean(no);
        next.manualFlightEditAt=hit.manualFlightEditAt||hit.updatedAt||'';
        changed++;
      }
    }
    if(hit.flightVerified===true&&String(hit.flightLocation||'').trim()){
      const loc=String(hit.flightLocation||'').trim();
      const iata=String(hit.iata||'').trim().toUpperCase();
      if(String(next.flightLocation||'').trim()!==loc||String(next.iata||'').trim().toUpperCase()!==iata){
        next.flightLocation=loc;
        next.iata=iata;
        next.flightCheckConfidence='verified';
        next.flightNeedsManualCheck=false;
        next.flightCheckedAt=hit.flightCheckedAt||next.flightCheckedAt||'';
        changed++;
      }
    }
    return next;
  });
  return {rides:out,changed};
}
window.ATMSPersistPriceOverride=function(ride,price){
  const value=Number(price);
  if(!ride?.id||!Number.isFinite(value)||value<=0)return;
  upsertRideOverride(ride.id,{price:value,priceConfirmedAt:new Date().toISOString()});
};
window.ATMSApplyRideOverrides=function(source){
  return applyRideOverrides(source).rides;
};

// CORE-004C HOTFIX 05.09.2026: funktionierender Editor fuer Flugnummer, Flugort und IATA.
function normalizeManualFlightNumber(value){
  return String(value||'').trim().toUpperCase().replace(/\s+/g,'');
}
function ensureManualFlightEditor(){
  let sheet=document.getElementById('atmsManualFlightEditor');
  if(sheet)return sheet;
  sheet=document.createElement('div');
  sheet.id='atmsManualFlightEditor';
  sheet.style.cssText='display:none;position:fixed;inset:0;z-index:99998;background:rgba(0,10,16,.78);padding:18px;align-items:center;justify-content:center;';
  sheet.innerHTML=`<div style="width:min(520px,100%);background:#062331;border:1px solid #1e607d;border-radius:18px;padding:16px;box-shadow:0 20px 60px rgba(0,0,0,.45);color:#fff;font-family:system-ui,sans-serif">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px"><b style="font-size:20px">✎ Flugdaten ändern</b><span style="flex:1"></span><button id="atmsFlightEditClose" type="button" style="border:0;background:#123747;color:#fff;border-radius:10px;padding:8px 11px;font-size:18px">×</button></div>
    <label style="display:block;font-size:12px;color:#9fc0d0;margin:8px 0 4px">Flugnummer</label>
    <input id="atmsFlightEditNo" autocomplete="off" autocapitalize="characters" style="width:100%;box-sizing:border-box;border:1px solid #2b6077;border-radius:11px;background:#031923;color:#fff;padding:11px;font-size:18px" placeholder="z. B. EW9577">
    <label style="display:block;font-size:12px;color:#9fc0d0;margin:10px 0 4px">Flugort</label>
    <input id="atmsFlightEditPlace" autocomplete="off" style="width:100%;box-sizing:border-box;border:1px solid #2b6077;border-radius:11px;background:#031923;color:#fff;padding:11px;font-size:18px" placeholder="z. B. Palma">
    <label style="display:block;font-size:12px;color:#9fc0d0;margin:10px 0 4px">IATA (optional)</label>
    <input id="atmsFlightEditIata" autocomplete="off" autocapitalize="characters" maxlength="3" style="width:100%;box-sizing:border-box;border:1px solid #2b6077;border-radius:11px;background:#031923;color:#fff;padding:11px;font-size:18px" placeholder="z. B. PMI">
    <div style="font-size:11px;color:#90aeba;margin-top:10px">Manuelle Änderungen werden lokal für diese Fahrt gespeichert. Eine externe Flugprüfung bleibt davon getrennt.</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:15px"><button id="atmsFlightEditCancel" type="button" style="border:1px solid #2b6077;background:#123747;color:#fff;border-radius:12px;padding:12px;font-weight:800">Abbrechen</button><button id="atmsFlightEditSave" type="button" style="border:1px solid #22c96f;background:#087b42;color:#fff;border-radius:12px;padding:12px;font-weight:900">Speichern</button></div>
  </div>`;
  document.body.appendChild(sheet);
  const close=()=>{sheet.style.display='none'};
  sheet.querySelector('#atmsFlightEditClose').addEventListener('click',close);
  sheet.querySelector('#atmsFlightEditCancel').addEventListener('click',close);
  sheet.addEventListener('click',e=>{if(e.target===sheet)close()});
  sheet.querySelector('#atmsFlightEditSave').addEventListener('click',()=>{
    if(!active)return close();
    const no=normalizeManualFlightNumber(sheet.querySelector('#atmsFlightEditNo').value);
    const place=String(sheet.querySelector('#atmsFlightEditPlace').value||'').trim();
    const iata=String(sheet.querySelector('#atmsFlightEditIata').value||'').trim().toUpperCase();
    if(iata&&!/^[A-Z]{3}$/.test(iata)){alert('IATA muss aus genau 3 Buchstaben bestehen.');return}
    const ids=(active._bundleMemberIds||[active.id]).map(String);
    const editedAt=new Date().toISOString();
    rides=rides.map(r=>{
      if(!ids.includes(String(r.id)))return r;
      upsertRideOverride(r.id,{manualFlightEdit:true,flightNumber:no,flightLocation:place,iata,manualFlightEditAt:editedAt});
      return {...r,flightNumber:no,flightLocation:place,iata,flightCheckConfidence:'manual',flightNeedsManualCheck:Boolean(no),manualFlightEditAt:editedAt};
    });
    save();
    close();
    showToast('Flugdaten gespeichert','ok');
    openCockpit(active.id);
  });
  return sheet;
}
function openManualFlightEditor(){
  if(!active)return;
  const sheet=ensureManualFlightEditor();
  sheet.querySelector('#atmsFlightEditNo').value=active.flightNumber||'';
  sheet.querySelector('#atmsFlightEditPlace').value=active.flightLocation||'';
  sheet.querySelector('#atmsFlightEditIata').value=active.iata||'';
  sheet.style.display='flex';
  setTimeout(()=>sheet.querySelector('#atmsFlightEditNo').focus(),0);
}
function isAirport(v){return Boolean(flightAirportIataFromPlace(v))}
function directionOf(r){if(isAirport(r.pickup)&&!isAirport(r.destination))return'airport_to_hotels';if(!isAirport(r.pickup)&&isAirport(r.destination))return'hotels_to_airport';return'normal'}
function bundleGroupKey(r){const dir=directionOf(r);if(dir==='normal')return'';const rideDate=String(first(r?.date,r?.datum)||'').trim();return [rideDate,normKey(r.driver),planTimeOf(r),normKey(r.flightNumber),normKey(r.company||r.partner||r.airline),String(r?.sourcePlanAirportIata||'').toUpperCase(),dir].join('|')}
function implicitBundleRowsCompatible(a,b){
  if(a===b)return true;
  const av=normKey(a?.vehicle),bv=normKey(b?.vehicle);
  if(!av||!bv||av!==bv)return false;
  const ap=Number(a?.price),bp=Number(b?.price);
  if(!Number.isFinite(ap)||!Number.isFinite(bp)||ap<=0||bp<=0)return false;
  if(Math.abs(ap-bp)>0.009)return false;
  return true
}
function sameBundleGroup(a,b){const ka=bundleGroupKey(a),kb=bundleGroupKey(b);return Boolean(ka&&ka===kb&&implicitBundleRowsCompatible(a,b))}
function hotelLabel(name){const n=String(name||'').trim();if(/nh\s*nord/i.test(n))return 'NH Nord DUS';if(/holiday\s*inn/i.test(n))return 'Holiday Inn DUS';return n}
function knownBundleRepair(r){
  const flight=normKey(r.flightNumber),driver=normKey(r.driver),time=planTimeOf(r),dir=directionOf(r);
  if(driver==='yannik'&&dir==='hotels_to_airport'&&((flight==='ew9344'&&time==='17:05')||(flight==='ew9422'&&time==='16:05'))){
    const total=Number(r.persons)||0;
    const holiday=flight==='ew9344'?3:Math.max(1,total-2);
    const nh=Math.max(1,total-holiday);
    return [{name:'Holiday Inn DUS',persons:holiday,order:1,type:'pickup'},{name:'NH Nord DUS',persons:nh,order:2,type:'pickup'},{name:'DUS Airport',persons:total,order:3,type:'destination'}];
  }
  return null
}
function routeFromMembers(members,explicitStops){
  const firstRide=members[0],dir=directionOf(firstRide),total=members.reduce((a,x)=>a+(Number(x.persons)||0),0);
  const repaired=knownBundleRepair(firstRide);if(repaired)return repaired;
  if(explicitStops&&firstRide.bundleStops.length){
    const raw=[...firstRide.bundleStops].sort((a,b)=>a.order-b.order).map((s,i)=>({name:hotelLabel(s.name),persons:Number(s.persons)||0,order:i+1,type:s.type||''}));
    if(dir==='hotels_to_airport'){
      const hotels=raw.filter(s=>!isAirport(s.name));
      return [...hotels.map((s,i)=>({...s,order:i+1,type:'pickup'})),{name:firstRide.destination||'DUS Airport',persons:total||Number(firstRide.persons)||0,order:hotels.length+1,type:'destination'}]
    }
    if(dir==='airport_to_hotels'){
      const hotels=raw.filter(s=>!isAirport(s.name));
      return [{name:firstRide.pickup||'DUS Airport',persons:total||Number(firstRide.persons)||0,order:1,type:'start'},...hotels.map((s,i)=>({...s,order:i+2,type:'destination'}))]
    }
  }
  if(dir==='hotels_to_airport'){
    const hotels=[];members.forEach(x=>{if(x.pickup&&!hotels.some(z=>normKey(z.name)===normKey(x.pickup)))hotels.push({name:hotelLabel(x.pickup),persons:Number(x.persons)||0})});
    return [...hotels.map((s,i)=>({...s,order:i+1,type:'pickup'})),{name:firstRide.destination||'DUS Airport',persons:total,order:hotels.length+1,type:'destination'}]
  }
  if(dir==='airport_to_hotels'){
    const hotels=[];members.forEach(x=>{if(x.destination&&!hotels.some(z=>normKey(z.name)===normKey(x.destination)))hotels.push({name:hotelLabel(x.destination),persons:Number(x.persons)||0})});
    return [{name:firstRide.pickup||'DUS Airport',persons:total,order:1,type:'start'},...hotels.map((s,i)=>({...s,order:i+2,type:'destination'}))]
  }
  return []
}
function bundleBilling(members){
  const seenFlights=new Set();
  let totalPrice=0,invoiceCount=0;
  for(const ride of members){
    const flight=normKey(ride.flightNumber);
    const price=Number(ride.price)||0;
    if(flight){
      if(seenFlights.has(flight))continue;
      seenFlights.add(flight);
    }
    totalPrice+=price;
    invoiceCount++;
  }
  return{price:totalPrice||Number(members[0]?.price)||0,invoiceCount:Math.max(1,invoiceCount)}
}
function visualRides(source){
  const used=new Set(),out=[];
  for(const r of source){
    if(used.has(r.id))continue;
    const key=bundleGroupKey(r);
    const group=key?source.filter(x=>!used.has(x.id)&&sameBundleGroup(r,x)):[r];
    const explicitStops=Array.isArray(r.bundleStops)&&r.bundleStops.length>1;
    const repair=knownBundleRepair(r);
    if(group.length>1||explicitStops||repair){
      const members=group.length>1?group:[r];members.forEach(x=>used.add(x.id));
      const routeStops=routeFromMembers(members,explicitStops);
      const firstRide=members[0],dir=directionOf(firstRide),total=members.reduce((a,x)=>a+(Number(x.persons)||0),0)||Number(firstRide.persons)||0;
      const hotelStops=routeStops.filter(s=>!isAirport(s.name));
      const pickup=dir==='hotels_to_airport'?(hotelStops[0]?.name||firstRide.pickup):(routeStops[0]?.name||firstRide.pickup);
      const destination=dir==='hotels_to_airport'?(routeStops.at(-1)?.name||firstRide.destination):(hotelStops.at(-1)?.name||firstRide.destination);
      const billing=bundleBilling(members);
      out.push({...firstRide,id:'bundle::'+members.map(x=>x.id).join('::'),isBundle:true,bundleDirection:dir,routeStops,bundleStops:hotelStops,_bundleMemberIds:members.map(x=>x.id),pickup,destination,persons:total,price:billing.price,invoiceCount:billing.invoiceCount});
    }else{used.add(r.id);out.push({...r,routeStops:[]})}
  }
  return out
}
window.norm=norm;
// CORE-004L Integrationspunkte: Zeiten getrennt aktualisieren, ohne PLAN zu überschreiben.
function updateRideTimeField(rideId,patch){
  const id=String(rideId||'').trim();if(!id)return false;
  const idx=rides.findIndex(r=>String(r?.id||'')===id);if(idx<0)return false;
  const before=rides[idx];rides[idx]=norm({...rides[idx],...patch},idx);if(!save()){rides[idx]=before;return false}render();return true
}
window.ATMSSetDispoTime=function(rideId,time){return updateRideTimeField(rideId,{dispoTime:String(time||'').trim()})};
window.ATMSSetLiveTime=function(rideId,time){return updateRideTimeField(rideId,{liveTime:String(time||'').trim(),liveTimeDerivedFromLanding:false})};
window.ATMSSetActualLandingTime=function(rideId,landingTime,bufferMinutes){const patch={actualLandingTime:String(landingTime||'').trim(),liveTime:''};if(bufferMinutes!==undefined&&bufferMinutes!==null&&String(bufferMinutes).trim()!=='')patch.liveBufferOverrideMinutes=Math.max(0,Math.min(120,Math.round(Number(bufferMinutes)||0)));return updateRideTimeField(rideId,patch)};
window.ATMSSetActualDepartureTime=function(rideId,departureTime){return updateRideTimeField(rideId,{actualDepartureTime:String(departureTime||'').trim(),liveTime:''})};
window.ATMSTimeSnapshot=function(rideId){const r=rides.find(x=>String(x?.id||'')===String(rideId||''));if(!r)return null;return{planTime:planTimeOf(r),dispoTime:dispoTimeOf(r),timeMirror:first(r.timeMirror,r.time_mirror),flightTime:listedFlightTimeOf(r),actualLandingTime:actualLandingTimeOf(r),actualDepartureTime:actualDepartureTimeOf(r),liveTime:liveTimeOf(r),liveBufferMinutes:liveBufferMinutesOf(r),effectiveTime:effectiveTime(r),effectiveSource:effectiveSource(r)}};
function effectiveTime(r){return first(liveTimeOf(r),dispoTimeOf(r),planTimeOf(r))}function effectiveSource(r){if(liveTimeOf(r))return'live';if(dispoTimeOf(r))return'dispo';return'plan'}function parse(t){let p=JSON.parse(clean(t));if(p.rides)p=p.rides;if(!Array.isArray(p)||!p.length)throw Error('Keine Fahrten gefunden');return p.map(norm)}// P96/S1: konservative Altbestands-Migration fuer sicher erkannte Tabellenkanten
// in Bild-OCR-Zeiten. NIEMALS Flugzeit, LIVE, unabhaengig abweichende DISPO oder
// nicht eindeutig numerische Zeichen interpretieren.
function p96RecoverPersistedBorderTimes(source){
  let changed=0;
  const out=(Array.isArray(source)?source:[]).map(r=>{
    if(r?.sourceImageOcr!==true)return r;
    const raw=String(r.time||'').trim();
    const hit=raw.match(/^(?:[|¦│]\s*)+(\d{3,4})$/);
    if(!hit)return r;
    const padded=hit[1].padStart(4,'0'),h=Number(padded.slice(0,2)),m=Number(padded.slice(2));
    if(h>23||m>59)return r;
    const fixed=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    const originalFields=['time','planTime','dispoTime','dispo_time'];
    if(originalFields.some(k=>r[k]!=null&&String(r[k]).trim()&&! [raw,fixed].includes(String(r[k]).trim())))return r;
    const mirror=String(r.timeMirror||r.time_mirror||'').trim();
    if(mirror&&mirror!==raw&&mirror!==fixed)return r;
    const next={...r,time:fixed,planTime:fixed,dispoTime:fixed,p96TimeBorderOriginal:raw,p96TimeBorderCorrectedAt:new Date().toISOString()};
    if(Object.prototype.hasOwnProperty.call(r,'dispo_time'))next.dispo_time=fixed;
    if(mirror===raw)next.timeMirror=fixed;
    changed++;
    return next;
  });
  return {rides:out,changed};
}
function save(options={}){
  const corrected=applyRideOverrides(rides);
  rides=corrected.rides;
  const rideOk=safePersistentSetItem(KEY,JSON.stringify(rides),'rides');
  // Bei fehlgeschlagenen Fahrten niemals eine neue Erledigt-Liste als zusammenpassend speichern.
  if(!rideOk){
    persistAudit('rides_save_blocked',{reason:'local-storage-write-failed',inMemory:rides.length});
    if(!options.silent)showToast('SPEICHERFEHLER: Fahrten nicht gesichert! Bitte keine weiteren Aenderungen vornehmen.','warn');
    return false;
  }
  const doneOk=safePersistentSetItem(DONE,JSON.stringify([...done]),'done');
  if(!doneOk){
    persistAudit('rides_save_blocked',{reason:'done-storage-write-failed',inMemory:rides.length});
    if(!options.silent)showToast('SPEICHERFEHLER: Erledigt-Status nicht gesichert.','warn');
    return false;
  }
  if(!options.deferDurable){
    void syncPersistenceDurableShadow('rides-save');
    void syncStorageV2Phase1('rides-save');
  }
  return true;
}function money(v){return new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(v||0)}function ridePriceLabel(r){return r&&r.priceMissingFromSource&&!(Number(r.price)>0)?'Preis fehlt':money(r?.price)}
// CORE-007D8A1F1D8P71: Fahrerfarben sind personenbezogen statt kartenpositionsbezogen.
const DRIVER_COLOR_PALETTE=[
  {id:'green',hex:'#54e20f'},{id:'cyan',hex:'#19d8df'},{id:'red',hex:'#ff3155'},{id:'yellow',hex:'#ffbd17'},
  {id:'purple',hex:'#b45cff'},{id:'orange',hex:'#ff8a3d'},{id:'pink',hex:'#ff5fd1'},{id:'blue',hex:'#4f8cff'},
  {id:'mint',hex:'#33e6a6'},{id:'violet',hex:'#d56cff'},{id:'amber',hex:'#ffd166'},{id:'coral',hex:'#ff6b6b'}
];
const DRIVER_COLOR_UNASSIGNED={id:'unassigned',hex:'#91a8b7'};
driverColorMap=loadDriverColorMap();
driverPlanColorMap=loadDriverPlanColorMap();
driverColorManualMap=loadDriverColorManualMap();
function driverColorKey(name){return String(name||'').trim().toLocaleLowerCase('de-DE')}
function normalizeDriverHex(value){const m=String(value||'').trim().match(/^#?([0-9a-f]{6})$/i);return m?`#${m[1].toLowerCase()}`:''}
function driverRgb(hex){const h=normalizeDriverHex(hex);if(!h)return null;return{r:parseInt(h.slice(1,3),16),g:parseInt(h.slice(3,5),16),b:parseInt(h.slice(5,7),16)}}
function driverRgbDistance(a,b){const x=driverRgb(a),y=driverRgb(b);if(!x||!y)return Infinity;return Math.hypot(x.r-y.r,x.g-y.g,x.b-y.b)}
function driverHexFromRgb(r,g,b){const c=v=>Math.max(0,Math.min(255,Math.round(Number(v)||0))).toString(16).padStart(2,'0');return`#${c(r)}${c(g)}${c(b)}`}
function driverPlanHexUsable(hex){const rgb=driverRgb(hex);if(!rgb)return false;const max=Math.max(rgb.r,rgb.g,rgb.b),min=Math.min(rgb.r,rgb.g,rgb.b);return max-min>=32&&((rgb.r+rgb.g+rgb.b)/3)>=100}
function loadDriverColorMap(){
  try{
    const parsed=JSON.parse(localStorage.getItem(DRIVER_COLOR_KEY)||'{}');
    if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))return{};
    const valid=new Set(DRIVER_COLOR_PALETTE.map(x=>x.id));
    return Object.fromEntries(Object.entries(parsed).filter(([key,value])=>key&&valid.has(String(value))));
  }catch(_){return{}}
}
function loadDriverPlanColorMap(){
  try{const parsed=JSON.parse(localStorage.getItem(DRIVER_PLAN_COLOR_KEY)||'{}');if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))return{};return Object.fromEntries(Object.entries(parsed).map(([k,v])=>[k,normalizeDriverHex(v)]).filter(([k,v])=>k&&driverPlanHexUsable(v)))}catch(_){return{}}
}
function loadDriverColorManualMap(){
  try{const parsed=JSON.parse(localStorage.getItem(DRIVER_COLOR_MANUAL_KEY)||'{}');if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))return{};return Object.fromEntries(Object.entries(parsed).filter(([k,v])=>k&&v).map(([k])=>[k,true]))}catch(_){return{}}
}
function saveDriverColorMap(){try{localStorage.setItem(DRIVER_COLOR_KEY,JSON.stringify(driverColorMap))}catch(_){}}
function saveDriverPlanColorMap(){try{localStorage.setItem(DRIVER_PLAN_COLOR_KEY,JSON.stringify(driverPlanColorMap))}catch(_){}}
function saveDriverColorManualMap(){try{localStorage.setItem(DRIVER_COLOR_MANUAL_KEY,JSON.stringify(driverColorManualMap))}catch(_){}}
function migrateLegacyManualDriverColors(){
  try{if(localStorage.getItem(DRIVER_COLOR_MANUAL_MIGRATION_KEY)==='1')return}catch(_){}
  const keys=Object.keys(driverColorMap);
  for(let i=0;i<Math.min(keys.length,DRIVER_COLOR_PALETTE.length);i++){
    const key=keys[i],expected=DRIVER_COLOR_PALETTE[i]?.id;
    if(expected&&driverColorMap[key]&&driverColorMap[key]!==expected)driverColorManualMap[key]=true;
  }
  saveDriverColorManualMap();
  try{localStorage.setItem(DRIVER_COLOR_MANUAL_MIGRATION_KEY,'1')}catch(_){}
}
migrateLegacyManualDriverColors();
function ensureDriverColorAssignments(source=rides){
  let changed=false;
  const validIds=new Set(DRIVER_COLOR_PALETTE.map(x=>x.id));
  const used=new Set(Object.values(driverColorMap).filter(id=>validIds.has(id)));
  const names=[];
  for(const r of (Array.isArray(source)?source:[])){
    const name=String(r?.driver||'').trim(),key=driverColorKey(name);
    if(name&&key&&!names.some(x=>x.key===key))names.push({name,key});
  }
  for(const item of names){
    if(validIds.has(driverColorMap[item.key]))continue;
    let color=DRIVER_COLOR_PALETTE.find(x=>!used.has(x.id));
    if(!color){
      let hash=0;for(const ch of item.key)hash=((hash*31)+ch.codePointAt(0))>>>0;
      color=DRIVER_COLOR_PALETTE[hash%DRIVER_COLOR_PALETTE.length];
    }
    driverColorMap[item.key]=color.id;used.add(color.id);changed=true;
  }
  if(changed)saveDriverColorMap();
}
function driverPlanColorOf(name){const key=driverColorKey(name),hex=normalizeDriverHex(driverPlanColorMap[key]);return driverPlanHexUsable(hex)?hex:''}
function driverColorOf(name){
  const key=driverColorKey(name);if(!key)return DRIVER_COLOR_UNASSIGNED;
  ensureDriverColorAssignments([{driver:name}]);
  if(!driverColorManualMap[key]){const planHex=driverPlanColorOf(name);if(planHex)return{id:'plan',hex:planHex}}
  return DRIVER_COLOR_PALETTE.find(x=>x.id===driverColorMap[key])||DRIVER_COLOR_UNASSIGNED;
}
function setDriverColorManual(name,colorId){
  const key=driverColorKey(name);
  const target=DRIVER_COLOR_PALETTE.find(x=>x.id===String(colorId||''));
  if(!key||!target)return false;
  ensureDriverColorAssignments(rides);
  const previous=driverColorMap[key];
  if(previous===target.id){driverColorManualMap[key]=true;saveDriverColorManualMap();return true}
  const currentKeys=[...new Set(rides.map(r=>driverColorKey(r?.driver)).filter(Boolean))];
  const conflictKey=Object.keys(driverColorMap).find(k=>k!==key&&driverColorMap[k]===target.id);
  driverColorMap[key]=target.id;driverColorManualMap[key]=true;
  if(conflictKey){
    const fallback=DRIVER_COLOR_PALETTE.find(c=>c.id===previous)
      || DRIVER_COLOR_PALETTE.find(c=>!currentKeys.some(k=>k!==conflictKey&&driverColorMap[k]===c.id));
    if(fallback){driverColorMap[conflictKey]=fallback.id;driverColorManualMap[conflictKey]=true}
  }
  saveDriverColorMap();saveDriverColorManualMap();
  return true;
}
function useDriverPlanColor(name){
  const key=driverColorKey(name);if(!key||!driverPlanColorOf(name))return false;
  delete driverColorManualMap[key];saveDriverColorManualMap();return true;
}
function driverPlanColorConsensus(items){
  const usable=(Array.isArray(items)?items:[]).map(x=>({hex:normalizeDriverHex(x?.hex),confidence:Number(x?.confidence||0)})).filter(x=>driverPlanHexUsable(x.hex)&&x.confidence>=0.25);
  if(!usable.length)return'';
  const rgbs=usable.map(x=>driverRgb(x.hex)).filter(Boolean);if(!rgbs.length)return'';
  const avg={r:rgbs.reduce((a,x)=>a+x.r,0)/rgbs.length,g:rgbs.reduce((a,x)=>a+x.g,0)/rgbs.length,b:rgbs.reduce((a,x)=>a+x.b,0)/rgbs.length};
  const hex=driverHexFromRgb(avg.r,avg.g,avg.b);
  const spread=Math.max(...usable.map(x=>driverRgbDistance(x.hex,hex)));
  return spread<=58?hex:'';
}
function reassignAutomaticPaletteConflicts(){
  const reserved=[...Object.entries(driverPlanColorMap).filter(([k,h])=>!driverColorManualMap[k]&&driverPlanHexUsable(h)).map(([key,hex])=>({key,hex})),...Object.entries(driverColorManualMap).filter(([,v])=>v).map(([key])=>({key,hex:DRIVER_COLOR_PALETTE.find(c=>c.id===driverColorMap[key])?.hex||''})).filter(x=>x.hex)];
  const keys=Object.keys(driverColorMap);
  let changed=false;
  for(const key of keys){
    if(driverColorManualMap[key]||driverPlanColorMap[key])continue;
    const currentId=driverColorMap[key],current=DRIVER_COLOR_PALETTE.find(c=>c.id===currentId);if(!current)continue;
    if(!reserved.some(x=>x.key!==key&&driverRgbDistance(x.hex,current.hex)<42))continue;
    const used=new Set(keys.filter(k=>k!==key).map(k=>driverColorMap[k]).filter(Boolean));
    const candidate=DRIVER_COLOR_PALETTE.find(c=>!used.has(c.id)&&reserved.every(x=>driverRgbDistance(x.hex,c.hex)>=42));
    if(candidate){driverColorMap[key]=candidate.id;changed=true}
  }
  if(changed)saveDriverColorMap();
  return changed;
}
function applyImportedDriverPlanColors(source){
  const byDriver=new Map();
  for(const ride of (Array.isArray(source)?source:[])){
    const name=String(ride?.driver||'').trim(),key=driverColorKey(name),hex=normalizeDriverHex(ride?.sourcePlanColorHex);
    if(!key||!driverPlanHexUsable(hex))continue;
    if(!byDriver.has(key))byDriver.set(key,{name,items:[]});
    byDriver.get(key).items.push({hex,confidence:Number(ride?.sourcePlanColorConfidence||0)});
  }
  if(!byDriver.size)return{changed:0,skippedManual:0,skippedConflict:0};
  ensureDriverColorAssignments(source);
  let changed=0,skippedManual=0,skippedConflict=0;
  const reserved=[];
  const allKeys=[...new Set([...Object.keys(driverColorMap),...Object.keys(driverPlanColorMap),...byDriver.keys()])];
  allKeys.forEach(key=>{
    if(!driverColorManualMap[key])return;
    const id=driverColorMap[key],hex=DRIVER_COLOR_PALETTE.find(c=>c.id===id)?.hex;
    if(hex)reserved.push({key,hex});
  });
  for(const [key,entry] of byDriver){
    if(driverColorManualMap[key]){skippedManual++;continue}
    const hex=driverPlanColorConsensus(entry.items);if(!hex)continue;
    const conflict=reserved.find(x=>x.key!==key&&driverRgbDistance(x.hex,hex)<30)
      || [...byDriver.keys()].filter(k=>k!==key&&driverPlanColorMap[k]).map(k=>({key:k,hex:driverPlanColorMap[k]})).find(x=>driverRgbDistance(x.hex,hex)<24);
    if(conflict){skippedConflict++;continue}
    if(driverPlanColorMap[key]!==hex){driverPlanColorMap[key]=hex;changed++}
    reserved.push({key,hex});
  }
  if(changed)saveDriverPlanColorMap();
  reassignAutomaticPaletteConflicts();
  return{changed,skippedManual,skippedConflict};
}
function ensureDriverColorCss(){
  if(document.getElementById('atmsDriverColorStyles'))return;
  const style=document.createElement('style');style.id='atmsDriverColorStyles';
  style.textContent='.ride.atms-driver-color .stripe{background:var(--atms-driver-color)!important}.ride.atms-driver-color .price,.ride.atms-driver-color .time,.ride.atms-driver-color .driver-left,.ride.atms-driver-color .driver,.ride.atms-driver-color .time-single,.ride.atms-driver-color .time-stack .current-large{color:var(--atms-driver-color)!important}.driver-choice-item{display:grid;grid-template-columns:36px minmax(0,1fr) 44px;gap:8px;align-items:stretch;margin-bottom:7px}.driver-choice-item>.choice{margin:0!important;width:100%}.driver-color-dot-btn{border:0;background:transparent;min-height:42px;padding:0;display:flex;align-items:center;justify-content:center;border-radius:11px}.driver-color-dot-btn .dot{width:22px;height:22px;min-width:22px;margin:0;box-shadow:0 0 0 2px rgba(255,255,255,.16)}.driver-color-dot-btn:active,.driver-day-summary-btn:active{transform:scale(.97)}.driver-day-summary-btn{border:1px solid rgba(255,255,255,.18);border-radius:11px;background:rgba(255,255,255,.07);color:#fff;font-size:18px;min-height:42px;padding:0;display:flex;align-items:center;justify-content:center}.driver-color-palette{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:8px;padding:9px;border-radius:11px;background:rgba(7,20,31,.96);border:1px solid rgba(255,255,255,.14)}.driver-color-palette.hidden{display:none}.driver-color-swatch{width:34px;height:34px;border-radius:50%;border:2px solid rgba(255,255,255,.40);padding:0;box-shadow:0 0 0 1px rgba(0,0,0,.22)}.driver-color-swatch.selected{border-color:#fff;box-shadow:0 0 0 3px rgba(255,255,255,.22)}.driver-plan-swatch{width:auto;min-width:88px;padding:0 10px;border-radius:18px;color:#06121b;font-size:12px;font-weight:900}.driver-day-summary-overlay{position:fixed;inset:0;z-index:12000;background:rgba(0,0,0,.72);display:flex;align-items:flex-end;justify-content:center}.driver-day-summary-sheet{width:min(720px,100%);max-height:88vh;overflow:auto;background:#071b27;border:1px solid rgba(255,255,255,.15);border-radius:20px 20px 0 0;padding:18px 16px 28px;color:#fff}.driver-day-summary-head{display:flex;justify-content:space-between;gap:12px;align-items:center}.driver-day-summary-close{border:0;background:rgba(255,255,255,.1);color:#fff;border-radius:10px;font-size:20px;width:42px;height:42px}.driver-day-summary-controls{display:flex;gap:10px;align-items:center;margin:14px 0}.driver-day-summary-controls select{flex:1;background:#0d2b3b;color:#fff;border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:10px}.driver-day-summary-kpis{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}.driver-day-summary-kpi{background:rgba(255,255,255,.06);border-radius:12px;padding:12px}.driver-day-summary-kpi b{display:block;font-size:22px}.driver-day-summary-row{padding:12px 0;border-top:1px solid rgba(255,255,255,.12)}.driver-day-summary-row .top{display:flex;justify-content:space-between;gap:10px;font-weight:900}.driver-day-summary-row .meta{font-size:13px;opacity:.8;margin-top:3px}.driver-day-summary-row .route{font-size:14px;margin-top:5px}.driver-day-summary-bundle{display:inline-block;margin-left:6px;font-size:11px;color:#dba6ff}';
  document.head.appendChild(style);
}
function rideCardElementById(id){return [...document.querySelectorAll('#rideList [data-id]')].find(el=>String(el.dataset.id||'')===String(id||''))||null}
function rememberRideListPosition(rideId){
  const card=rideCardElementById(rideId);
  rideListReturnState={rideId:String(rideId||''),viewportTop:card?card.getBoundingClientRect().top:null,scrollY:window.scrollY||document.documentElement.scrollTop||0};
}
function restoreRideListPosition(){
  const state=rideListReturnState;rideListReturnState=null;if(!state)return;
  const apply=()=>{
    const card=rideCardElementById(state.rideId);
    if(card&&Number.isFinite(Number(state.viewportTop))){
      const delta=card.getBoundingClientRect().top-Number(state.viewportTop);
      if(Math.abs(delta)>0.5)window.scrollTo(0,Math.max(0,(window.scrollY||0)+delta));
    }else if(Number.isFinite(Number(state.scrollY))){window.scrollTo(0,Math.max(0,Number(state.scrollY)))}
  };
  requestAnimationFrame(()=>requestAnimationFrame(apply));
}
function matches(r){const q=$('search').value.toLowerCase().trim();return(!driverFilter||r.driver===driverFilter)&&(!q||[r.driver,r.pickup,r.destination,r.flightNumber,r.flightLocation,r.airline].join(' ').toLowerCase().includes(q))}
// CORE-007C: Karten-/Cockpit-Status folgt derselben konservativen LIVE-Semantik wie Live-Dispo.
// Ein bestätigter scheduled-Datensatz ist nur dann sichtbares LIVE-Signal, wenn zusätzlich
// eine Estimated-/Actual-Zeit vorliegt. Ist diese aktuelle Zeit identisch zur Planzeit,
// wird konsistent "Pünktlich" angezeigt. Reines scheduled ohne aktuelle Zeit bleibt neutral.
function flightStatusInfo(r){
  const freshness=liveSnapshotFreshness(r);
  if(freshness.stale)return{key:'stale',label:'Keine aktuellen Live-Daten'};
  const raw=first(r.flightStatus,r.flugstatus,r.liveStatus,r.live_status).toLowerCase();
  const delay=Number(r.delayMinutes??r.delay_minutes??r.verspaetungMinuten??r.verspätung_minuten??r.delay??0)||0;
  const liveRaw=String(r?.liveFlightStatus||'').trim().toLowerCase();
  const scheduled=strictClockOrNull(r?.liveFlightScheduledTime);
  const current=strictClockOrNull(first(r?.liveFlightActualTime,r?.liveFlightEstimatedTime));
  const measuredLiveDelay=scheduled&&current?minuteDeltaClock(scheduled,current):null;
  const scheduledHasCurrent=(liveRaw==='scheduled'||/scheduled|geplant/.test(raw))&&measuredLiveDelay!==null;
  if(!freshness.usable&&r?.liveCurrentConfirmed===false)return{key:'unknown',label:'Keine aktuellen Live-Daten'};
  if(/storniert|cancelled|canceled/.test(raw)||liveRaw==='cancelled')return{key:'cancelled',label:'Storniert'};
  if(/abgeflogen|departed/.test(raw)||liveRaw==='departed')return{key:'departed',label:'Abgeflogen'};
  if(r.landed||r.gelandet||/gelandet|landed|arrived/.test(raw)||liveRaw==='landed')return{key:'landed',label:'Gelandet'};
  if(delay>0||/verspät|delay|late/.test(raw)||(scheduledHasCurrent&&measuredLiveDelay>0))return{key:'delayed',label:(delay>0?delay:Math.max(0,Number(measuredLiveDelay)||0))>0?`+${delay>0?delay:Math.max(0,Number(measuredLiveDelay)||0)} Min.`:'Verspätet'};
  if(/pünkt|on.?time/.test(raw)||liveRaw==='on_time'||(scheduledHasCurrent&&measuredLiveDelay<=0))return{key:'on-time',label:'Pünktlich'};
  if(/scheduled|geplant/.test(raw)||liveRaw==='scheduled')return{key:'unknown',label:'Keine aktuellen Live-Daten'};
  return{key:'unknown',label:'Keine Live-Daten'};
}
function flightStatusMarkup(r){const x=flightStatusInfo(r);return `<span class="flight-status ${x.key}">${esc(x.label)}</span>`}
function timeMarkup(r){
  const plan=planTimeOf(r),dispo=dispoTimeOf(r),live=liveTimeOf(r);
  const base=first(dispo,plan);
  if(live&&base&&live!==base)return `<div class="time-stack"><div class="plan-small">${esc(base)}</div><div class="current-large">${esc(live)}</div></div>`;
  if(!live&&dispo&&plan&&dispo!==plan)return `<div class="time-stack"><div class="plan-small">${esc(plan)}</div><div class="current-large">${esc(dispo)}</div></div>`;
  return `<div class="time-single">${esc(first(live,dispo,plan,'--:--'))}</div>`
}
function hasFlightNumber(r){
  const value=String(r?.flightNumber||'').trim();
  return Boolean(value&&value!=='-'&&value!=='–');
}
// P36F7: Nur eine wirklich verifizierte Zwei-Quellen-Pruefung ist warnungsfrei.
// source_confirmed bleibt absichtlich sichtbar manuell pruefpflichtig; ein vorhandener
// Planort allein ist ebenfalls keine Verifikation. Alte explizite flightVerified=true-
// Datensaetze bleiben kompatibel, sofern ein Flugort vorhanden und kein Konflikt gesetzt ist.
// CORE-007D8A1F1D8P50 · 25.09.2026: MANUAL-CHECK WITHOUT FLIGHT NUMBER FIX
// Explizite Sicherheitskennzeichen haben Vorrang vor dem Vorhandensein einer Flugnummer.
// Fahrt ohne Flugnummer bleibt nur dann warnungsfrei, wenn weder Konflikt noch flightNeedsManualCheck gesetzt ist.
function flightNeedsManualReview(r){
  const conflict=Boolean(r?.flightConflict===true||r?.flightSourceConflict===true||r?.conflict===true);
  if(conflict)return true;
  if(r?.flightNeedsManualCheck===true)return true;
  if(!hasFlightNumber(r))return false;
  const location=String(r?.flightLocation||'').trim();
  const confidence=String(r?.flightCheckConfidence||r?.flightConfidence||'').trim().toLowerCase();
  const status=String(r?.flightVerificationStatus||'').trim().toLowerCase();
  const explicitlyVerified=Boolean(location)&&(
    r?.flightVerified===true ||
    confidence==='verified' ||
    (status==='verified'&&(confidence==='high'||confidence==='verified'))
  );
  return !explicitlyVerified;
}
function listedTimeLabel(r){return hasFlightNumber(r)?'Flugzeit Liste':'Listenzeit'}
function listedFlightTimeMarkup(r){
  const value=listedFlightTimeOf(r);
  return value?`<div class="flight-time-note" style="font-size:12px;font-weight:800;margin-top:4px;opacity:.88">🕒 ${listedTimeLabel(r)} ${esc(value)}</div>`:''
}
function liveAgeLabel(minutes){
  if(minutes===null||minutes===undefined||!Number.isFinite(Number(minutes)))return'';
  const m=Math.max(0,Math.round(Number(minutes)));
  if(m<1)return'gerade eben';
  if(m<60)return`vor ${m} Min.`;
  const h=Math.floor(m/60),rest=m%60;
  return rest?`vor ${h} Std. ${rest} Min.`:`vor ${h} Std.`;
}
function liveSnapshotClockLabel(value){
  const raw=String(value||'').trim();if(!raw)return'';
  const d=new Date(raw);if(Number.isNaN(d.getTime()))return'';
  try{return new Intl.DateTimeFormat('de-DE',{timeZone:'Europe/Berlin',hour:'2-digit',minute:'2-digit',hour12:false}).format(d)}catch(_){return d.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}
}
function liveFreshnessMarkup(r){
  if(!hasFlightNumber(r))return'';
  const state=liveSnapshotFreshness(r);
  const age=liveAgeLabel(state.ageMinutes);
  const clock=liveSnapshotClockLabel(state.timestamp);
  if(state.manual){
    const manualType=String(r?.liveManualType||'').trim().toLowerCase();
    const eventTime=strictClockOrNull(manualType==='departure'?first(actualDepartureTimeOf(r),r?.liveFlightActualTime):manualType==='arrival'?first(actualLandingTimeOf(r),r?.liveFlightActualTime):r?.liveFlightActualTime);
    const label=manualType==='departure'?'Abflug manuell bestätigt':manualType==='arrival'?'Landung manuell bestätigt':'Manuell bestätigt';
    return `<div style="font-size:11px;font-weight:800;margin-top:4px;color:#73e6a4">✋ ${esc(label)}${eventTime?` ${esc(eventTime)}`:''}${clock?` · erfasst ${esc(clock)}`:''}</div>`;
  }
  if(state.stale)return `<div style="font-size:11px;font-weight:800;margin-top:4px;color:#ffc14d">⚠ Letzte bestätigte LIVE-Info${clock?` ${esc(clock)}`:''}${age?` · ${esc(age)}`:''}</div>`;
  if(state.usable)return `<div style="font-size:11px;font-weight:800;margin-top:4px;opacity:.82">📡 LIVE geprüft${clock?` ${esc(clock)}`:''}${age?` · ${esc(age)}`:''}</div>`;
  if(state.timestamp)return `<div style="font-size:11px;font-weight:800;margin-top:4px;opacity:.72">📡 Letzte Netzprüfung${clock?` ${esc(clock)}`:''} · keine aktuelle LIVE-Bestätigung</div>`;
  return'';
}
function ridePartnerLabel(r){
  const left=String(r.partner||r.airline||r.customer||'').trim();
  const right=String(r.company||'').trim();
  if(left&&right&&left.toLowerCase()===right.toLowerCase())return left;
  return [left,right].filter(Boolean).join(' · ');
}
function rideAirportBadge(r){
  const source=String(r?.sourcePlanAirportIata||'').trim().toUpperCase();
  const actual=String(flightAirportForGemini(r)||'').trim().toUpperCase();
  if(actual){
    return `<span title="Flughafen dieser Fahrt" style="font-size:11px;font-weight:900;padding:2px 7px;border-radius:7px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.22);letter-spacing:.04em">${esc(actual)}</span>`;
  }
  if(source){
    return `<span title="Ursprungsliste; konkreter Flugairport dieser Fahrt ist nicht eindeutig" style="font-size:11px;font-weight:900;padding:2px 7px;border-radius:7px;background:rgba(255,176,32,.10);border:1px solid rgba(255,176,32,.32);color:#ffc14d;letter-spacing:.02em">Liste: ${esc(source)}</span>`;
  }
  return'';
}
function rideAirportStopName(r,routeStops){
  const airportStop=(Array.isArray(routeStops)?routeStops:[]).find(st=>isAirport(st?.name));
  if(airportStop?.name)return airportStop.name;
  const iata=String(r?.sourcePlanAirportIata||flightAirportForGemini(r)||'').trim().toUpperCase();
  return iata?`${iata} Airport`:'Airport';
}
function flightAirportConflictInfo(r){
  if(r?.flightAirportConflict!==true)return null;
  const airport=String(r?.flightAirportConflictAirportIata||'').trim().toUpperCase();
  const origin=String(r?.flightAirportConflictOriginIata||'').trim().toUpperCase();
  const destination=String(r?.flightAirportConflictDestinationIata||'').trim().toUpperCase();
  if(!/^[A-Z]{3}$/.test(airport)||!/^[A-Z]{3}$/.test(origin)||!/^[A-Z]{3}$/.test(destination))return null;
  return{airport,origin,destination,route:`${origin}→${destination}`};
}
function flightAirportConflictWarningMarkup(r){
  const info=flightAirportConflictInfo(r);if(!info)return'';
  return `<div style="margin-top:6px;padding:7px 9px;border-radius:9px;background:rgba(255,111,97,.10);border:1px solid rgba(255,111,97,.38);color:#ffb0a8;font-size:11px;font-weight:850;line-height:1.35">⚠ Flugroute ${esc(info.route)} passt nicht zum Fahrt-Airport ${esc(info.airport)} · manuell prüfen</div>`;
}
function syncCockpitFlightAirportConflict(r){
  const host=$('flightLoc')?.parentElement;if(!host)return;
  let box=$('flightAirportConflictWarning');
  if(!box){box=document.createElement('div');box.id='flightAirportConflictWarning';box.style.cssText='display:none;margin-top:8px;padding:9px 10px;border-radius:9px;background:rgba(255,111,97,.10);border:1px solid rgba(255,111,97,.38);color:#ffb0a8;font-size:12px;font-weight:850;line-height:1.4';host.appendChild(box)}
  const info=flightAirportConflictInfo(r);
  if(!info){box.style.display='none';box.textContent='';return}
  box.style.display='block';box.textContent=`⚠ Airport-Konflikt: Flugroute ${info.route} passt nicht zum Fahrt-Airport ${info.airport}. Flugort nicht automatisch übernommen – manuell prüfen.`;
}
// CORE-007D8A1F1D8P52: Cockpit zeigt denselben offenen Manual-Review-Status wie die Fahrtenkarte.
function syncCockpitManualFlightReview(r){
  const host=$('flightLoc')?.parentElement;if(!host)return;
  let box=$('flightManualReviewWarning');
  if(!box){box=document.createElement('div');box.id='flightManualReviewWarning';box.style.cssText='display:none;margin-top:8px;padding:7px 9px;border-radius:9px;background:rgba(255,176,32,.14);border:1px solid rgba(255,176,32,.38);color:#ffc14d;font-size:12px;font-weight:850;line-height:1.35';host.appendChild(box)}
  const show=flightNeedsManualReview(r)&&!flightAirportConflictInfo(r);
  if(!show){box.style.display='none';box.textContent='';return}
  box.style.display='block';box.textContent='⚠ manuell prüfen';
}
function rideCard(r,i,options){
  const showPastDate=options?.showPastDate===true;
  const rideDate=String(first(r?.date,r?.planDate,r?.datum)||'').trim();
  const pastDateMarkup=showPastDate&&/^\d{4}-\d{2}-\d{2}$/.test(rideDate)?`<div style="font-size:11px;font-weight:850;line-height:1.25;margin-top:3px;opacity:.92;white-space:nowrap">📅 ${esc(atmsFormatIsoDateDe(rideDate))}</div>`:'';
  const routeStops=Array.isArray(r.routeStops)?[...r.routeStops].sort((a,b)=>a.order-b.order):[];
  const airportStopName=rideAirportStopName(r,routeStops);
  const bundleRoute=r.isBundle?(r.bundleDirection==='airport_to_hotels'?`${airportStopName} → Divers (${Math.max(0,routeStops.length-1)} Ziele)`:`Divers (${Math.max(0,routeStops.length-1)} Abholungen) → ${airportStopName}`):`${r.pickup||'Start'} → ${r.destination||'Ziel'}`;
  const bundleFlightLabel=r.bundleDirection==='airport_to_hotels'?'Herkunft':'Zielort';
  const manualFlightCheck=flightNeedsManualReview(r);
  const airportConflict=flightAirportConflictInfo(r);
  const manualFlightBadge=manualFlightCheck?`<span style="font-size:11px;font-weight:800;padding:2px 7px;border-radius:7px;background:rgba(255,176,32,.14);border:1px solid rgba(255,176,32,.38);color:#ffc14d">${airportConflict?'⚠ Airport-Konflikt':'⚠ manuell prüfen'}</span>`:'';
  const airportConflictWarning=flightAirportConflictWarningMarkup(r);
  // CORE-007D8A1F1D8P52: Bündelfahrten zeigen Flugort-/Prüfstatus auch ohne vorhandenen Flugort.
  const bundleFlightLocationText=r.flightLocation?`✈ ${esc(r.flightLocation)}${r.iata?' ('+esc(r.iata)+')':''}`:'Flugort nicht verfügbar';
  const bundleFlightLocation=r.isBundle?`<div class="flightloc" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:5px 0 4px"><span>${bundleFlightLocationText}</span>${r.flightLocation?`<span style="font-size:12px;font-weight:800;padding:2px 7px;border-radius:7px;background:rgba(0,168,255,.15);border:1px solid rgba(0,168,255,.35);color:#16b8ff">${bundleFlightLabel}</span>`:''}${manualFlightBadge}</div>`:'';
  const stopRows=r.isBundle&&routeStops.length?`<div class="bundle-stops">${routeStops.map((st,idx)=>`<div class="bundle-stop-row"><span class="bundle-stop-dot" style="background:${isAirport(st.name)?'#00a8ff':'#b45cff'}"></span><span><b>${idx+1}. ${esc(st.name)}</b> <span class="bundle-stop-pax">· ${st.persons||'–'} Pers.${st.type==='destination'?' · Ziel':st.type==='start'?' · Start':st.type==='pickup'?` · ${idx+1}. Abholung`:''}</span></span></div>`).join('')}</div>`:`<div class="flightloc" style="display:flex;align-items:center;gap:7px;flex-wrap:wrap"><span>${esc(r.flightLocation||'Flugort nicht verfügbar')}${r.iata?' ('+esc(r.iata)+')':''}</span>${manualFlightBadge}</div>`;
  const driverColor=driverColorOf(r.driver);
  return `<article class="ride atms-driver-color ${r.isBundle?'bundle':''}" data-id="${esc(r.id)}" style="--atms-driver-color:${driverColor.hex}"><span class="stripe"></span><div class="left"><div class="price">${ridePriceLabel(r)}</div>${timeMarkup(r)}${pastDateMarkup}<div class="driver-left">${esc(r.driver||'Offen')}</div>${r.isBundle?'<div class="bundle-badge">BÜNDELFAHRT</div>':''}</div><div class="mid"><div class="route">${esc(bundleRoute)}</div><div class="partner">${esc(ridePartnerLabel(r))}</div><div class="meta" style="display:flex;align-items:center;gap:7px;flex-wrap:wrap"><span>✈ ${esc(r.flightNumber||'–')} ${flightStatusMarkup(r)} &nbsp; 🚘 ${esc(r.vehicle)} &nbsp; 👤 ${r.persons||'–'}</span>${rideAirportBadge(r)}</div>${bundleFlightLocation}${listedFlightTimeMarkup(r)}${liveFreshnessMarkup(r)}${stopRows}${airportConflictWarning}</div><div class="chev">›</div></article>`
}
// P95 bundled UI-only: maintain manual done list, and auto-collapse only truly past, non-done rides.
// A missing/assumed date or uncertain current arrival cannot silently disappear from the active list.
const ATMS_P95_PAST_OPEN='atms_p95_past_rides_open_v1';
let atmsPastOpen=false;
try{localStorage.removeItem(ATMS_P95_PAST_OPEN)}catch(_){ }
function atmsPastRideDecision(ride,now=new Date()){
  const source=ride?._bundleMemberIds?.length?ride._bundleMemberIds.map(id=>rides.find(r=>String(r.id)===String(id))).filter(Boolean):[ride];
  if(!source?.length)return false;
  const nowStamp=berlinDateTimeMinuteStamp(now);
  const today=berlinDate(now);
  const grace=45;
  for(const r of source){
    const date=String(first(r?.date,r?.datum)||'').trim();
    if(r?.dateAssumed===true||!/^\d{4}-\d{2}-\d{2}$/.test(date))return false;
    const disp=atmsClockMinutes(first(dispoTimeOf(r),planTimeOf(r)));
    if(disp===null)return false;
    let rideStamp=Math.floor(Date.UTC(Number(date.slice(0,4)),Number(date.slice(5,7))-1,Number(date.slice(8,10)),0,disp)/60000);
    if(!Number.isFinite(rideStamp))return false;
    // If official, later same-day LIVE pickup crosses midnight, place it on the next ride day.
    let dir='unknown';try{dir=flightDirectionForGemini(r)}catch(_){ }
    if(dir==='arrival'){
      const freshness=liveSnapshotFreshness(r);
      const arrivalActual=Boolean(first(actualLandingTimeOf(r),r?.liveFlightActualTime));
      const status=String(r?.liveFlightStatus||'').toLowerCase();
      const rawConfirmed=freshness.usable||arrivalActual;
      if(rawConfirmed){
        const live=atmsClockMinutes(liveTimeOf(r));
        if(live!==null){
          const candidate=rideStamp-disp+live+(live<disp-720?1440:0);
          rideStamp=Math.max(rideStamp,candidate);
        }
      }
      // A delay without a usable later pickup time must NOT disappear on the old DISPO clock.
      // Stale estimated times can change again; today's uncompleted pickup stays visible.
      if(date>=today && !arrivalActual &&
        ((['delayed','diverted','unknown_delay'].includes(status)&&atmsClockMinutes(liveTimeOf(r))===null)||
        (!freshness.usable&&freshness.confirmed)))return false;
    }
    if(nowStamp<=rideStamp+grace)return false;
  }
  return true;
}
function atmsPastListSignature(){
  const vr=visualRides(rides);
  return vr.map(r=>String(r.id)+':'+(atmsPastRideDecision(r)?'P':'A')).join('|');
}
let atmsPastLastSignature='';
function atmsPastClockTick(){
  if($('listView')?.classList.contains('hidden'))return;
  const signature=atmsPastListSignature();
  if(signature!==atmsPastLastSignature){const y=window.scrollY||0;render();requestAnimationFrame(()=>window.scrollTo(0,y));}
}
function render(options={}){const listWasHidden=Boolean($('listView')?.classList.contains('hidden'));if(listWasHidden)atmsPastOpen=false;showView('list');ensureDriverColorCss();ensureDriverColorAssignments(rides);const vr=visualRides(rides);const isDone=r=>r._bundleMemberIds?r._bundleMemberIds.every(id=>done.has(id)):done.has(r.id);
  // CORE-006I: Fahrtenansicht folgt der Reihenfolge der importierten Planliste.
  const open=vr.filter(r=>!isDone(r)&&matches(r)&&!atmsPastRideDecision(r));
  const past=vr.filter(r=>!isDone(r)&&matches(r)&&atmsPastRideDecision(r));
  const fin=vr.filter(r=>isDone(r)&&matches(r));
  atmsPastLastSignature=atmsPastListSignature();
$('summary').textContent=`${mode==='all'?open.length+fin.length+past.length:open.length} aktuell · ${past.length} vergangen · ${driverFilter||'Alle Fahrer'}`;

const stats=$('dashboardStats');

if(stats){
 const drivers=[...new Set(rides.map(r=>r.driver).filter(Boolean))];
 const flights=[...new Set(rides.map(r=>r.flightNumber).filter(Boolean))];
 const notices=rides.filter(flightNeedsManualReview).length;

 stats.innerHTML=`
 <div class="dashboard-stat">
 <b>${rides.length}</b>
 <span>Fahrten</span>
 </div>

 <div class="dashboard-stat">
 <b>${drivers.length}</b>
 <span>Fahrer</span>
 </div>

 <div class="dashboard-stat">
 <b>${flights.length}</b>
 <span>Flüge</span>
 </div>

 <div class="dashboard-stat">
 <b>${notices}</b>
 <span>Hinweise</span>
 </div>`;
}
let h=`<section class="donebar"><div class="donehead" id="doneHead"><b>✓ Erledigte Fahrten</b><span>${fin.length}</span><button id="toggleDone" class="doneToggle" aria-label="Erledigte Fahrten ein- oder ausklappen">${doneOpen?'⌃':'⌄'}</button></div><div id="doneWrap" class="donewrap ${doneOpen?'':'hidden'}">${fin.length?fin.map(rideCard).join(''):'<div class="done-empty">Noch keine erledigten Fahrten.</div>'}</div></section>`;if(mode==='all'){h+=open.length?open.map(rideCard).join(''):'<div class="empty atms-no-current-rides">Keine offenen Fahrten vorhanden.</div>'}else{h+=open.length?open.map(rideCard).join(''):'<div class="empty atms-no-current-rides">Keine aktuellen Fahrten vorhanden.</div>'}h+=`<section class="atms-pastbar"><div class="atms-pasthead" id="atmsPastHead" role="button" tabindex="0" aria-expanded="${atmsPastOpen?'true':'false'}"><b>◷ Vergangene Fahrten</b><span>${past.length}</span><button type="button" id="atmsTogglePast" aria-label="Vergangene Fahrten auf- oder zuklappen">${atmsPastOpen?'⌃':'⌄'}</button></div><div class="atms-pastwrap ${atmsPastOpen?'':'hidden'}">${past.length?past.map((r,i)=>rideCard(r,i,{showPastDate:true})).join(''):'<div class="done-empty">Keine vergangenen Fahrten.</div>'}</div></section>`;$('rideList').innerHTML=h;document.querySelectorAll('[data-id]').forEach(x=>x.onclick=()=>{rememberRideListPosition(x.dataset.id);openCockpit(x.dataset.id)});const t=$('toggleDone');if(t)t.onclick=e=>{e.stopPropagation();doneOpen=!doneOpen;localStorage.setItem(DONE_OPEN,doneOpen?'1':'0');render()};const dh=$('doneHead');if(dh)dh.onclick=e=>{if(e.target.closest('[data-id]'))return;if(e.target.id==='toggleDone')return;doneOpen=!doneOpen;localStorage.setItem(DONE_OPEN,doneOpen?'1':'0');render()};const pastToggle=$('atmsTogglePast'),pastHead=$('atmsPastHead');const togglePast=e=>{e?.stopPropagation();atmsPastOpen=!atmsPastOpen;render({restoreRidePosition:true})};if(pastToggle)pastToggle.onclick=togglePast;if(pastHead){pastHead.onclick=e=>{if(e.target.closest('button'))return;togglePast(e)};pastHead.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();togglePast(e)}}}if(options?.restoreRidePosition)restoreRideListPosition();}
function resetHorizontalViewport(viewId){
  try{document.documentElement.scrollLeft=0;document.body.scrollLeft=0;const view=$(viewId);if(view)view.scrollLeft=0;}catch(_){ }
}
// CORE-007D8A1F1D8P25 – Lokale Nachrichten-V1. Kein automatischer Versand.
function getPreparedMessages(){
  try{const list=JSON.parse(localStorage.getItem(ATMS_MESSAGES_KEY)||'[]');return Array.isArray(list)?list:[]}catch(_){return[]}
}
function savePreparedMessages(list){
  try{localStorage.setItem(ATMS_MESSAGES_KEY,JSON.stringify((Array.isArray(list)?list:[]).slice(0,40)));return true}catch(_){return false}
}
function manualDispoMessageText(driver,ride,delay,blockedCount=0){
  if(!ride)return'';
  const dispatcher=getCurrentDispatcher(),name=String(dispatcher?.name||'').trim(),lines=[];
  lines.push(name?`Hallo ${name},`:'Hallo,');
  lines.push('');
  lines.push('bitte folgende Fahrt manuell prüfen:');
  lines.push(`Zeit: ${effectiveTime(ride)||'–'} Uhr`);
  lines.push(`Fahrer: ${String(driver?.name||ride.driver||'Offen').trim()||'Offen'}`);
  if(ride.flightNumber)lines.push(`Flug: ${ride.flightNumber}${ride.flightLocation?` · ${ride.flightLocation}${ride.iata?` (${ride.iata})`:''}`:''}`);
  lines.push(`Route: ${ridePickupSummary(ride)||ride.pickup||'–'} → ${rideDestinationSummary(ride)||ride.destination||'–'}`);
  lines.push(`Grund: LIVE-Prognose +${Math.max(0,Number(delay)||0)} Min.`);
  lines.push('Aktuell ist kein anderer Fahrer anhand der offenen Fahrten und Freigaben sicher verfügbar.');
  if(blockedCount>0)lines.push(`${blockedCount} Fahrer mit Freigabe hat/haben bereits eigene offene Fahrt(en).`);
  lines.push('Bitte Disposition manuell entscheiden.');
  return lines.join('\n');
}
function prepareManualDispoMessage(driver,ride,delay,blockedCount=0){
  if(!ride)return null;
  const rideId=String(ride.id||'').trim(),key=`manual-dispo:${rideId}`,now=new Date().toISOString(),current=getPreparedMessages(),existing=current.find(x=>String(x?.key||'')===key);
  const draft={key,type:'manual_dispo',status:'prepared',rideId,rideTime:effectiveTime(ride)||'',driver:String(driver?.name||ride.driver||'').trim(),flightNumber:String(ride.flightNumber||'').trim(),flightLocation:String(ride.flightLocation||'').trim(),route:`${ridePickupSummary(ride)||ride.pickup||'–'} → ${rideDestinationSummary(ride)||ride.destination||'–'}`,reason:`LIVE-Prognose +${Math.max(0,Number(delay)||0)} Min. · kein sicher verfügbarer Ersatzfahrer`,delayMinutes:Math.max(0,Number(delay)||0),blockedDriverCount:Math.max(0,Number(blockedCount)||0),text:manualDispoMessageText(driver,ride,delay,blockedCount),createdAt:existing?.createdAt||now,updatedAt:now,copiedAt:existing?.copiedAt||''};
  savePreparedMessages([draft,...current.filter(x=>String(x?.key||'')!==key)]);
  return draft;
}
const ATMS_MESSAGES_SELFTEST_RIDE_ID='__atms_messages_selftest__';
const ATMS_MESSAGES_SELFTEST_KEY=`manual-dispo:${ATMS_MESSAGES_SELFTEST_RIDE_ID}`;
function messagesSelfTestProtectedSnapshot(){
  const data={};
  try{
    const keys=[];for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key&&key!==ATMS_MESSAGES_KEY)keys.push(key)}
    keys.sort().forEach(key=>{data[key]=localStorage.getItem(key)});
  }catch(_){ }
  return JSON.stringify(data);
}
function clearMessagesSelfTest(renderAfter=true,toastAfter=false){
  const before=getPreparedMessages(),after=before.filter(m=>!(m?.selfTest===true||String(m?.key||'')===ATMS_MESSAGES_SELFTEST_KEY));
  if(after.length!==before.length)savePreparedMessages(after);
  if(renderAfter)renderMessagesView();
  if(toastAfter)showToast('Selbsttest-Nachricht entfernt','ok');
  return before.length-after.length;
}
function runMessagesSelfTest(){
  clearMessagesSelfTest(false,false);
  const protectedBefore=messagesSelfTestProtectedSnapshot(),ridesBefore=JSON.stringify(rides),doneBefore=JSON.stringify([...done]);
  const testDriver={id:'atms-selftest-driver',name:'ATMS Selbsttest-Fahrer'};
  const testRide={id:ATMS_MESSAGES_SELFTEST_RIDE_ID,planTime:'12:34',dispoTime:'12:34',driver:testDriver.name,pickup:'ATMS Selbsttest-Hotel',destination:'DUS Airport',flightNumber:'ATMS-TEST',flightLocation:'Selbsttest',persons:1,vehicle:'Pkw'};
  const draft=prepareManualDispoMessage(testDriver,testRide,13,1);
  let messages=getPreparedMessages(),index=messages.findIndex(m=>String(m?.key||'')===ATMS_MESSAGES_SELFTEST_KEY);
  if(index>=0){messages[index]={...messages[index],selfTest:true,selfTestLabel:'P25 Nachrichten-Selbsttest',status:'prepared'};savePreparedMessages(messages)}
  const hit=getPreparedMessages().find(m=>String(m?.key||'')===ATMS_MESSAGES_SELFTEST_KEY);
  const contentOk=Boolean(draft&&hit&&hit.selfTest===true&&hit.driver===testDriver.name&&Number(hit.delayMinutes)===13&&String(hit.text||'').includes('ATMS Selbsttest-Fahrer')&&String(hit.text||'').includes('LIVE-Prognose +13 Min.')&&String(hit.route||'').includes('ATMS Selbsttest-Hotel'));
  const protectedOk=protectedBefore===messagesSelfTestProtectedSnapshot()&&ridesBefore===JSON.stringify(rides)&&doneBefore===JSON.stringify([...done]);
  renderMessagesView();
  const status=$('atmsMessagesSelfTestStatus');
  if(status)status.textContent=contentOk&&protectedOk?'✓ Selbsttest vorbereitet · echte Fahrten, DONE und übrige ATMS-Daten unverändert. Jetzt „📋 Testnachricht kopieren“ drücken.':'⚠ Selbsttest fehlgeschlagen · Testnachricht entfernen und nicht weiterverwenden.';
  showToast(contentOk&&protectedOk?'Nachrichten-Selbsttest bereit':'Nachrichten-Selbsttest fehlgeschlagen',contentOk&&protectedOk?'ok':'warn');
  return{ok:contentOk&&protectedOk,contentOk,protectedOk};
}
function ensureMessagesView(){
  let view=$('messagesView');if(view)return view;
  const host=$('listView')?.parentElement||document.body;
  view=document.createElement('section');view.id='messagesView';view.className='hidden';
  view.innerHTML=`<div id="atmsMessagesShell" style="box-sizing:border-box;width:100%;max-width:920px;margin:0 auto;padding:18px 16px 110px;color:inherit"><div style="display:flex;align-items:center;gap:10px;margin-bottom:6px"><div style="font-size:24px;font-weight:900">💬 Nachrichten</div><span id="atmsMessagesCount" style="margin-left:auto;font-size:12px;font-weight:900;padding:4px 9px;border-radius:999px;background:rgba(255,255,255,.10)">0</span></div><div style="font-size:13px;opacity:.78;line-height:1.45;margin-bottom:10px">Lokale vorbereitete Dispo-Hinweise. Kein automatischer Versand, keine Cloud.</div><button type="button" id="atmsMessagesSelfTestBtn" style="width:100%;padding:12px;border-radius:10px;font-weight:900;margin-bottom:7px">🧪 Nachrichten-Selbsttest</button><div id="atmsMessagesSelfTestStatus" style="font-size:12px;opacity:.78;line-height:1.45;margin-bottom:14px">Erzeugt nur eine klar markierte lokale Testnachricht. Fahrten sowie PLAN/DISPO/LIVE werden nicht verändert.</div><div id="atmsMessagesList"></div></div>`;
  host.appendChild(view);
  $('atmsMessagesSelfTestBtn')?.addEventListener('click',runMessagesSelfTest);
  return view;
}
function preparedMessageDateLabel(value){const d=new Date(value||'');if(Number.isNaN(d.getTime()))return'';return d.toLocaleString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}
async function copyPreparedMessage(key,textarea){
  const messages=getPreparedMessages(),hit=messages.find(x=>String(x?.key||'')===String(key||'')),text=String(textarea?.value??hit?.text??'').trim();
  if(!text){showToast('Keine Nachricht zum Kopieren','warn');return false}
  let copied=false;
  try{await navigator.clipboard.writeText(text);copied=true}catch(_){try{textarea?.focus();textarea?.select();copied=document.execCommand('copy')===true}catch(__){copied=false}}
  if(!copied){showToast('Kopieren nicht möglich','warn');return false}
  if(hit){hit.text=text;hit.copiedAt=new Date().toISOString();hit.updatedAt=hit.copiedAt;savePreparedMessages(messages)}
  if(hit?.selfTest===true){clearMessagesSelfTest(false,false);renderMessagesView();const status=$('atmsMessagesSelfTestStatus');if(status)status.textContent='✓ Testnachricht wurde kopiert und automatisch wieder entfernt. Echte Nachrichten bleiben unverändert.';showToast('Testnachricht kopiert und entfernt','ok');return true}
  showToast('Nachricht kopiert','ok');renderMessagesView();return true;
}
function dismissPreparedMessage(key){
  const messages=getPreparedMessages(),hit=messages.find(x=>String(x?.key||'')===String(key||''));
  if(!hit||hit.selfTest===true)return false;
  if(!confirm('Diese vorbereitete Nachricht löschen?'))return false;
  hit.status='dismissed';hit.dismissedAt=new Date().toISOString();hit.updatedAt=hit.dismissedAt;
  if(!savePreparedMessages(messages)){showToast('Nachricht konnte nicht gelöscht werden','warn');return false}
  showToast('Nachricht gelöscht','ok');renderMessagesView();return true;
}
function renderMessagesView(){
  ensureMessagesView();showView('messages');document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x.dataset.nav==='messages'));
  const list=$('atmsMessagesList'),count=$('atmsMessagesCount');if(!list)return;const messages=getPreparedMessages().filter(x=>x&&x.status!=='dismissed');if(count)count.textContent=String(messages.length);
  if(!messages.length){list.innerHTML='<div style="padding:18px;border:1px solid rgba(255,255,255,.14);border-radius:14px;background:rgba(255,255,255,.04);font-size:14px;opacity:.82">Keine vorbereitete Dispo-Nachricht. Wenn Live-Dispo „Dispo manuell informieren“ empfiehlt, erscheint der Entwurf hier automatisch.</div>';return}
  list.innerHTML=messages.map(m=>`<article data-message-key="${esc(m.key)}" style="padding:14px;margin-bottom:12px;border:1px solid ${m.selfTest?'rgba(76,201,240,.45)':'rgba(255,255,255,.16)'};border-radius:14px;background:${m.selfTest?'rgba(76,201,240,.07)':'rgba(255,255,255,.045)'}"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px"><b style="font-size:16px">Dispo manuell informieren</b><span style="font-size:11px;font-weight:900;padding:3px 7px;border-radius:7px;background:${m.selfTest?'rgba(76,201,240,.14)':'rgba(255,193,77,.14)'};border:1px solid ${m.selfTest?'rgba(76,201,240,.45)':'rgba(255,193,77,.35)'};color:${m.selfTest?'#7ddfff':'#ffc14d'}">${m.selfTest?'SELBSTTEST':'VORBEREITET'}</span></div>${m.selfTest?'<div style="font-size:12px;font-weight:800;color:#7ddfff;margin-bottom:8px">🧪 Nur Testdaten · keine echte Fahrt und keine echten LIVE-Daten.</div>':''}<div style="font-size:12px;line-height:1.55;opacity:.84;margin-bottom:9px"><b>Fahrt:</b> ${esc(m.rideTime||'–')} · ${esc(m.route||'–')}<br><b>Fahrer:</b> ${esc(m.driver||'Offen')}<br><b>Flug:</b> ${esc(m.flightNumber||'–')}${m.flightLocation?` · ${esc(m.flightLocation)}`:''}<br><b>Grund:</b> ${esc(m.reason||'Manuelle Dispo-Prüfung erforderlich')}${m.createdAt?`<br><b>Erstellt:</b> ${esc(preparedMessageDateLabel(m.createdAt))}`:''}${m.copiedAt?`<br><b>Status:</b> kopiert ${esc(preparedMessageDateLabel(m.copiedAt))}`:''}</div><textarea data-message-text style="width:100%;box-sizing:border-box;min-height:190px;resize:vertical;padding:11px;border-radius:10px;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.20);color:inherit;font:inherit;line-height:1.45">${esc(m.text||'')}</textarea><button type="button" data-copy-message style="width:100%;margin-top:9px;padding:12px;border-radius:10px;font-weight:900">${m.selfTest?'📋 Testnachricht kopieren':'📋 Nachricht kopieren'}</button>${m.selfTest?'<button type="button" data-clear-selftest style="width:100%;margin-top:7px;padding:11px;border-radius:10px;font-weight:800">🧹 Selbsttest entfernen</button>':'<button type="button" data-dismiss-message style="width:100%;margin-top:7px;padding:11px;border-radius:10px;font-weight:800">🗑 Nachricht löschen</button>'}</article>`).join('');
  list.querySelectorAll('[data-copy-message]').forEach(btn=>btn.addEventListener('click',()=>{const card=btn.closest('[data-message-key]');copyPreparedMessage(card?.dataset.messageKey||'',card?.querySelector('[data-message-text]'))}));
  list.querySelectorAll('[data-clear-selftest]').forEach(btn=>btn.addEventListener('click',()=>clearMessagesSelfTest(true,true)));
  list.querySelectorAll('[data-dismiss-message]').forEach(btn=>btn.addEventListener('click',()=>{const card=btn.closest('[data-message-key]');dismissPreparedMessage(card?.dataset.messageKey||'')}));
}
let atmsLiveBottomNavBaseline=null;
function captureLiveBottomNavBaseline(){
  if(atmsLiveBottomNavBaseline)return;
  const settings=document.querySelector('.nav[data-nav="settings"]'),host=settings?.parentElement;if(!host)return;
  const hostProps=['display','height','min-height','max-height','padding-top','padding-right','padding-bottom','padding-left','gap','column-gap','row-gap','align-items','justify-content','flex-direction','flex-wrap','grid-template-columns','box-sizing'];
  const navProps=['display','width','min-width','max-width','height','min-height','max-height','padding-top','padding-right','padding-bottom','padding-left','margin-top','margin-right','margin-bottom','margin-left','gap','align-items','justify-content','flex-direction','flex-basis','flex-grow','flex-shrink','font-size','line-height','white-space','text-align','overflow','box-sizing'];
  const take=(el,props)=>{const cs=getComputedStyle(el),o={};props.forEach(p=>o[p]=cs.getPropertyValue(p));return o};
  atmsLiveBottomNavBaseline={host,hostStyle:take(host,hostProps),items:[...host.querySelectorAll('.nav')].map(el=>({el,style:take(el,navProps),children:[...el.children].map(child=>({el:child,display:getComputedStyle(child).display,fontSize:getComputedStyle(child).fontSize,lineHeight:getComputedStyle(child).lineHeight}))}))};
}
function restoreLiveBottomNavBaseline(){
  const b=atmsLiveBottomNavBaseline;if(!b?.host?.isConnected)return;
  const apply=(el,obj)=>Object.entries(obj).forEach(([p,v])=>{if(v)el.style.setProperty(p,v,'important')});
  apply(b.host,b.hostStyle);
  b.items.forEach(item=>{if(!item.el?.isConnected)return;apply(item.el,item.style);item.children.forEach(c=>{if(!c.el?.isConnected)return;c.el.style.setProperty('display',c.display,'important');c.el.style.setProperty('font-size',c.fontSize,'important');c.el.style.setProperty('line-height',c.lineHeight,'important')})});
}
function updateSettingsHub(){
  const put=(id,value)=>{const el=$(id);if(el)el.textContent=String(value)};
  try{put('settingsAddressCount',getAddressBook().length)}catch(_){put('settingsAddressCount','–')}
  try{put('settingsDriverCount',getDriverContacts().length)}catch(_){put('settingsDriverCount','–')}
  try{put('settingsDispatcherCount',getDispatchers().length)}catch(_){put('settingsDispatcherCount','–')}
}
const ATMS_SETTINGS_HISTORY_KEY='atmsP95SettingsNav';
let atmsSettingsHistoryApplying=false,atmsSettingsRouteDepth=0,atmsSettingsLastScrollY=0;
const atmsSettingsListScroll={address:null,driver:null,dispatcher:null};
function atmsSettingsCurrentScroll(){
  const view=$('settingsView'),root=document.scrollingElement;
  return Math.max(Number(window.scrollY)||0,Number(root?.scrollTop)||0,Number(document.documentElement?.scrollTop)||0,Number(document.body?.scrollTop)||0,Number(view?.scrollTop)||0)
}
function atmsSettingsScrollMeta(kind){
  if(kind==='address')return{rows:'#addressBookList [data-address-id]',attr:'addressId',bar:'#atmsAddressBookPanel > .atms-mobile-topbar'};
  if(kind==='driver')return{rows:'#settingsDriverList [data-settings-driver-id]',attr:'settingsDriverId',bar:'#atmsDriverSettingsPanel > .atms-mobile-topbar'};
  if(kind==='dispatcher')return{rows:'#settingsDispatcherList [data-settings-dispatcher-id]',attr:'settingsDispatcherId',bar:'#atmsDispatcherSettingsPanel > .atms-mobile-topbar'};
  return null
}
function atmsSettingsVisibleAnchor(kind){
  const meta=atmsSettingsScrollMeta(kind);if(!meta)return null;
  const bar=document.querySelector(meta.bar),inset=Math.max(0,Number(bar?.getBoundingClientRect().bottom)||0),rows=[...document.querySelectorAll(meta.rows)];
  for(const row of rows){const rect=row.getBoundingClientRect();if(rect.bottom<=inset)continue;if(rect.top>window.innerHeight)break;const id=String(row.dataset?.[meta.attr]||'');if(id)return{id,offset:rect.top-inset}}
  return null
}
function atmsSettingsApplyRawScroll(y){
  const target=Math.max(0,Number(y)||0),view=$('settingsView'),root=document.scrollingElement;
  try{window.scrollTo({top:target,left:0,behavior:'auto'})}catch(_){try{window.scrollTo(0,target)}catch(__){ }}
  try{if(root)root.scrollTop=target}catch(_){ }
  try{if(document.documentElement)document.documentElement.scrollTop=target}catch(_){ }
  try{if(document.body)document.body.scrollTop=target}catch(_){ }
  try{if(view)view.scrollTop=target}catch(_){ }
}
function atmsSettingsSetScroll(value,kind=''){
  const snap=value&&typeof value==='object'?value:{y:Number(value)||0,anchorId:'',anchorOffset:0},y=Math.max(0,Number(snap.y)||0);
  requestAnimationFrame(()=>{atmsSettingsApplyRawScroll(y);requestAnimationFrame(()=>{
    const meta=atmsSettingsScrollMeta(kind);if(meta&&snap.anchorId){const row=[...document.querySelectorAll(meta.rows)].find(el=>String(el.dataset?.[meta.attr]||'')===String(snap.anchorId));if(row){const bar=document.querySelector(meta.bar),inset=Math.max(0,Number(bar?.getBoundingClientRect().bottom)||0),current=row.getBoundingClientRect().top-inset,delta=current-(Number(snap.anchorOffset)||0);if(Math.abs(delta)>1)atmsSettingsApplyRawScroll(atmsSettingsCurrentScroll()+delta)}}
    atmsSettingsLastScrollY=atmsSettingsCurrentScroll();atmsSettingsUpdateMobileHeader(true)
  })})
}
function atmsSettingsRememberScroll(kind){
  if(kind!=='address'&&kind!=='driver'&&kind!=='dispatcher')return;
  const anchor=atmsSettingsVisibleAnchor(kind);atmsSettingsListScroll[kind]={y:atmsSettingsCurrentScroll(),anchorId:anchor?.id||'',anchorOffset:Number(anchor?.offset)||0}
}
function atmsSettingsReadRoute(){try{return history.state?.[ATMS_SETTINGS_HISTORY_KEY]||null}catch(_){return null}}
function atmsSettingsHubRoute(){return{kind:'hub',level:'hub',id:'',depth:0}}
function atmsSettingsEnsureHubHistory(){
  if(atmsSettingsHistoryApplying)return;
  const current=atmsSettingsReadRoute();
  if(current?.kind==='hub'&&Number(current.depth)===0){atmsSettingsRouteDepth=0;return}
  try{history.replaceState({...history.state,[ATMS_SETTINGS_HISTORY_KEY]:atmsSettingsHubRoute()},'',location.href);atmsSettingsRouteDepth=0}catch(_){ }
}
function atmsSettingsPushRoute(kind,level='browse',id=''){
  if(atmsSettingsHistoryApplying)return;
  atmsSettingsEnsureHubHistory();
  const current=atmsSettingsReadRoute(),same=current&&current.kind===kind&&current.level===level&&String(current.id||'')===String(id||'');if(same){atmsSettingsRouteDepth=Number(current.depth)||0;return}
  const depth=(Number(current?.depth)||0)+1,route={kind,level,id:String(id||''),depth};
  try{history.pushState({...history.state,[ATMS_SETTINGS_HISTORY_KEY]:route},'',location.href);atmsSettingsRouteDepth=depth}catch(_){atmsSettingsRouteDepth=depth}
}
function atmsSettingsShowHub({replaceHistory=false}={}){
  closeSettingsAddressPage();closeSettingsDriverPage();closeSettingsDispatcherPage();closeSettingsTransferPage();closeSettingsBackupPage();closeSettingsAboutPage();showView('settings');updateSettingsHub();
  if(replaceHistory){try{history.replaceState({...history.state,[ATMS_SETTINGS_HISTORY_KEY]:atmsSettingsHubRoute()},'',location.href)}catch(_){ }}
  atmsSettingsRouteDepth=0;atmsSettingsSetScroll(0)
}
function atmsSettingsBack(){
  const route=atmsSettingsReadRoute();
  if(route&&Number(route.depth)>0){try{history.back();return true}catch(_){ }}
  atmsSettingsShowHub({replaceHistory:true});return true
}
function atmsSettingsReturnToBrowse(kind){
  const route=atmsSettingsReadRoute(),depth=Number(route?.depth)||0;
  if(route?.kind===kind&&depth>1){try{history.go(-(depth-1));return}catch(_){ }}
  if(kind==='address')showAddressBookBrowse({restoreScroll:true});else if(kind==='driver')showSettingsDriverBrowse({restoreScroll:true});else if(kind==='dispatcher')showSettingsDispatcherBrowse({restoreScroll:true});else if(kind==='transfer')showSettingsTransferBrowse();else if(kind==='backup')showSettingsBackupBrowse();else if(kind==='about')showSettingsAboutBrowse()
}
function atmsSettingsApplyHistoryRoute(route){
  atmsSettingsHistoryApplying=true;
  try{
    if(!route||route.kind==='hub'||Number(route.depth)===0){atmsSettingsRouteDepth=0;atmsSettingsShowHub();return}
    atmsSettingsRouteDepth=Number(route.depth)||0;
    if(route.kind==='address'){
      openSettingsAddressPage(route.level==='transfer'?'transfer':'browse',{history:false,restoreScroll:route.level==='browse'});
      if(route.level==='detail'&&route.id)showAddressBookDetail(route.id,{history:false});
      else if(route.level==='editor')showAddressBookEditor(route.id?'edit':'new',{history:false,id:route.id});
      return
    }
    if(route.kind==='driver'){
      openSettingsDriverPage('browse',{history:false,restoreScroll:route.level==='browse'});
      if(route.level==='detail'&&route.id)showSettingsDriverDetail(route.id,{history:false});
      else if(route.level==='editor')showSettingsDriverEditor(route.id?'edit':'new',route.id,{history:false});
      return
    }
    if(route.kind==='dispatcher'){
      openSettingsDispatcherPage('browse',{history:false,restoreScroll:route.level==='browse'});
      if(route.level==='detail'&&route.id)showSettingsDispatcherDetail(route.id,{history:false});
      else if(route.level==='editor')showSettingsDispatcherEditor(route.id?'edit':'new',route.id,{history:false});
      return
    }
    if(route.kind==='transfer'){
      if(route.level==='planimport'){showSettingsPlanImport({history:false});return}
      openSettingsTransferPage({history:false});
      return
    }
    if(route.kind==='backup'){
      openSettingsBackupPage({history:false});
      return
    }
    if(route.kind==='about'){
      openSettingsAboutPage({history:false});
      return
    }
    atmsSettingsShowHub()
  }finally{atmsSettingsHistoryApplying=false}
}
function atmsSettingsActivePanel(){
  const view=$('settingsView');if(!view||view.classList.contains('hidden'))return null;
  if(view.classList.contains('settings-address-open'))return $('atmsAddressBookPanel');
  if(view.classList.contains('settings-driver-open'))return $('atmsDriverSettingsPanel');
  if(view.classList.contains('settings-dispatcher-open'))return $('atmsDispatcherSettingsPanel');
  if(view.classList.contains('settings-transfer-open'))return $('atmsSettingsTransferPanel');
  if(view.classList.contains('settings-backup-open'))return $('atmsSettingsBackupPanel');
  if(view.classList.contains('settings-about-open'))return $('atmsSettingsAboutPanel');
  return null
}
function atmsSettingsUpdateMobileHeader(forceExpand=false){
  const panel=atmsSettingsActivePanel();if(!panel)return;
  const y=atmsSettingsCurrentScroll(),delta=y-atmsSettingsLastScrollY;
  if(forceExpand||y<64||delta<-8)panel.classList.remove('atms-mobile-nav-collapsed');
  else if(delta>8&&y>96)panel.classList.add('atms-mobile-nav-collapsed');
  atmsSettingsLastScrollY=y
}
function atmsSettingsFocusBrowse(kind){
  const panel=kind==='address'?$('atmsAddressBookPanel'):kind==='driver'?$('atmsDriverSettingsPanel'):$('atmsDispatcherSettingsPanel'),input=kind==='address'?$('addressBookSearch'):kind==='driver'?$('settingsDriverSearch'):$('settingsDispatcherSearch');
  panel?.classList.remove('atms-mobile-nav-collapsed');
  requestAnimationFrame(()=>{try{panel?.scrollIntoView({block:'start',behavior:'smooth'})}catch(_){ }setTimeout(()=>{try{input?.focus({preventScroll:true})}catch(__){input?.focus()}},180)})
}
function installSettingsMobileNavigation(){
  const view=$('settingsView');if(!view||view.dataset.atmsP95Gate3F1Nav==='1')return;
  view.dataset.atmsP95Gate3F1Nav='1';
  const onScroll=()=>atmsSettingsUpdateMobileHeader(false);window.addEventListener('scroll',onScroll,{passive:true});view.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('popstate',e=>{const route=e.state?.[ATMS_SETTINGS_HISTORY_KEY]||null;const view=$('settingsView');const active=Boolean(view&&!view.classList.contains('hidden'));if(route||(active&&['settings-address-open','settings-driver-open','settings-dispatcher-open','settings-transfer-open','settings-backup-open','settings-about-open'].some(c=>view.classList.contains(c))))atmsSettingsApplyHistoryRoute(route)});
}
function atmsSettingsOpenHubFromPrimaryNav(){
  const route=atmsSettingsReadRoute(),depth=Number(route?.depth)||0;
  atmsSettingsShowHub({replaceHistory:depth===0});
  if(depth>0){try{history.go(-depth)}catch(_){try{history.replaceState({...history.state,[ATMS_SETTINGS_HISTORY_KEY]:atmsSettingsHubRoute()},'',location.href)}catch(__){ }}}
  else atmsSettingsEnsureHubHistory()
}
function setSettingsAddressPageActive(active){
  const view=$('settingsView'),page=view?.querySelector('.settings-page');if(!view||!page)return;
  if(active){view.classList.remove('settings-driver-open','settings-dispatcher-open','settings-transfer-open','settings-backup-open','settings-about-open');$('atmsDriverSettingsPanel')?.classList.add('hidden');$('atmsDispatcherSettingsPanel')?.classList.add('hidden');$('atmsSettingsTransferPanel')?.classList.add('hidden');$('atmsSettingsBackupPanel')?.classList.add('hidden');$('atmsSettingsAboutPanel')?.classList.add('hidden')}
  view.classList.toggle('settings-address-open',Boolean(active));
  const hideWhenOpen=[page.querySelector(':scope > .cockHead'),$('settingsHub'),$('dispatcherSettingsCard'),$('driverSettingsCard'),$('backupCard'),$('infoCard')].filter(Boolean);
  hideWhenOpen.forEach(el=>{if(active)el.style.setProperty('display','none','important');else el.style.removeProperty('display')});
  const host=$('settingsToolsHost');if(host){if(active)host.style.setProperty('display','block','important');else host.style.removeProperty('display')}
}
function setSettingsDriverPageActive(active){
  const view=$('settingsView'),page=view?.querySelector('.settings-page');if(!view||!page)return;
  if(active){view.classList.remove('settings-address-open','settings-dispatcher-open','settings-transfer-open','settings-backup-open','settings-about-open');$('atmsAddressBookPanel')?.classList.add('hidden');$('atmsDispatcherSettingsPanel')?.classList.add('hidden');$('atmsSettingsTransferPanel')?.classList.add('hidden');$('atmsSettingsBackupPanel')?.classList.add('hidden');$('atmsSettingsAboutPanel')?.classList.add('hidden')}
  view.classList.toggle('settings-driver-open',Boolean(active));
  const hideWhenOpen=[page.querySelector(':scope > .cockHead'),$('settingsHub'),$('dispatcherSettingsCard'),$('driverSettingsCard'),$('backupCard'),$('infoCard')].filter(Boolean);
  hideWhenOpen.forEach(el=>{if(active)el.style.setProperty('display','none','important');else el.style.removeProperty('display')});
  const host=$('settingsToolsHost');if(host){if(active)host.style.setProperty('display','block','important');else host.style.removeProperty('display')}
}
function setSettingsDispatcherPageActive(active){
  const view=$('settingsView'),page=view?.querySelector('.settings-page');if(!view||!page)return;
  if(active){view.classList.remove('settings-address-open','settings-driver-open','settings-transfer-open','settings-backup-open','settings-about-open');$('atmsAddressBookPanel')?.classList.add('hidden');$('atmsDriverSettingsPanel')?.classList.add('hidden');$('atmsSettingsTransferPanel')?.classList.add('hidden');$('atmsSettingsBackupPanel')?.classList.add('hidden');$('atmsSettingsAboutPanel')?.classList.add('hidden')}
  view.classList.toggle('settings-dispatcher-open',Boolean(active));
  const hideWhenOpen=[page.querySelector(':scope > .cockHead'),$('settingsHub'),$('dispatcherSettingsCard'),$('driverSettingsCard'),$('backupCard'),$('infoCard')].filter(Boolean);
  hideWhenOpen.forEach(el=>{if(active)el.style.setProperty('display','none','important');else el.style.removeProperty('display')});
  const host=$('settingsToolsHost');if(host){if(active)host.style.setProperty('display','block','important');else host.style.removeProperty('display')}
}
function setSettingsTransferPageActive(active){
  const view=$('settingsView'),page=view?.querySelector('.settings-page');if(!view||!page)return;
  if(active){view.classList.remove('settings-address-open','settings-driver-open','settings-dispatcher-open','settings-backup-open','settings-about-open');$('atmsAddressBookPanel')?.classList.add('hidden');$('atmsDriverSettingsPanel')?.classList.add('hidden');$('atmsDispatcherSettingsPanel')?.classList.add('hidden');$('atmsSettingsBackupPanel')?.classList.add('hidden');$('atmsSettingsAboutPanel')?.classList.add('hidden')}
  view.classList.toggle('settings-transfer-open',Boolean(active));
  const hideWhenOpen=[page.querySelector(':scope > .cockHead'),$('settingsHub'),$('dispatcherSettingsCard'),$('driverSettingsCard'),$('backupCard'),$('infoCard')].filter(Boolean);
  hideWhenOpen.forEach(el=>{if(active)el.style.setProperty('display','none','important');else el.style.removeProperty('display')});
  const host=$('settingsToolsHost');if(host){if(active)host.style.setProperty('display','block','important');else host.style.removeProperty('display')}
}
function setSettingsBackupPageActive(active){
  const view=$('settingsView'),page=view?.querySelector('.settings-page');if(!view||!page)return;
  if(active){view.classList.remove('settings-address-open','settings-driver-open','settings-dispatcher-open','settings-transfer-open','settings-about-open');$('atmsAddressBookPanel')?.classList.add('hidden');$('atmsDriverSettingsPanel')?.classList.add('hidden');$('atmsDispatcherSettingsPanel')?.classList.add('hidden');$('atmsSettingsTransferPanel')?.classList.add('hidden');$('atmsSettingsAboutPanel')?.classList.add('hidden')}
  view.classList.toggle('settings-backup-open',Boolean(active));
  const hideWhenOpen=[page.querySelector(':scope > .cockHead'),$('settingsHub'),$('dispatcherSettingsCard'),$('driverSettingsCard'),$('infoCard')].filter(Boolean);
  hideWhenOpen.forEach(el=>{if(active)el.style.setProperty('display','none','important');else el.style.removeProperty('display')});
  const host=$('settingsToolsHost');if(host){if(active)host.style.setProperty('display','block','important');else host.style.removeProperty('display')}
}
function setSettingsAboutPageActive(active){
  const view=$('settingsView'),page=view?.querySelector('.settings-page');if(!view||!page)return;
  if(active){view.classList.remove('settings-address-open','settings-driver-open','settings-dispatcher-open','settings-transfer-open','settings-backup-open');$('atmsAddressBookPanel')?.classList.add('hidden');$('atmsDriverSettingsPanel')?.classList.add('hidden');$('atmsDispatcherSettingsPanel')?.classList.add('hidden');$('atmsSettingsTransferPanel')?.classList.add('hidden');$('atmsSettingsBackupPanel')?.classList.add('hidden')}
  view.classList.toggle('settings-about-open',Boolean(active));
  const hideWhenOpen=[page.querySelector(':scope > .cockHead'),$('settingsHub'),$('dispatcherSettingsCard'),$('driverSettingsCard'),$('backupCard')].filter(Boolean);
  hideWhenOpen.forEach(el=>{if(active)el.style.setProperty('display','none','important');else el.style.removeProperty('display')});
  const host=$('settingsToolsHost');if(host){if(active)host.style.setProperty('display','block','important');else host.style.removeProperty('display')}
}
function bindSettingsHubNavigation(){
  const hub=$('settingsHub');if(!hub||hub.dataset.atmsP95Gate2Nav==='1')return;
  hub.dataset.atmsP95Gate2Nav='1';
  hub.addEventListener('click',e=>{const btn=e.target.closest('[data-settings-jump]');if(!btn||!hub.contains(btn))return;e.preventDefault();jumpToSettingsSection(btn.dataset.settingsJump)});
}
function jumpToSettingsSection(section){
  const key=String(section||'').trim();
  if(key==='addresses'){closeSettingsDriverPage();closeSettingsDispatcherPage();closeSettingsTransferPage();closeSettingsBackupPage();closeSettingsAboutPage();openSettingsAddressPage('browse');return}
  if(key==='drivers'){closeSettingsAddressPage();closeSettingsDispatcherPage();closeSettingsTransferPage();closeSettingsBackupPage();closeSettingsAboutPage();openSettingsDriverPage('browse');return}
  if(key==='dispatchers'){closeSettingsAddressPage();closeSettingsDriverPage();closeSettingsTransferPage();closeSettingsBackupPage();closeSettingsAboutPage();openSettingsDispatcherPage('browse');return}
  if(key==='transfer'){closeSettingsAddressPage();closeSettingsDriverPage();closeSettingsDispatcherPage();closeSettingsBackupPage();closeSettingsAboutPage();openSettingsTransferPage();return}
  if(key==='backup'){closeSettingsAddressPage();closeSettingsDriverPage();closeSettingsDispatcherPage();closeSettingsTransferPage();closeSettingsAboutPage();openSettingsBackupPage();return}
  if(key==='about'){closeSettingsAddressPage();closeSettingsDriverPage();closeSettingsDispatcherPage();closeSettingsTransferPage();closeSettingsBackupPage();openSettingsAboutPage();return}
  closeSettingsAddressPage();closeSettingsDriverPage();closeSettingsDispatcherPage();closeSettingsTransferPage();closeSettingsBackupPage();closeSettingsAboutPage();
}
// P95: native Android Back works through browser history for main bottom navigation.
// P95 settings subpage route history stays authoritative while inside Settings.
const ATMS_P95_PRIMARY_KEY='atms_p95_primary_tab_v1';
const ATMS_P95_PRIMARY_DEPTH='atms_p95_primary_depth_v1';
const ATMS_P95_MODAL_KEY='atms_p95_modal_v1';
let atmsPrimaryTab='rides';
function atmsPrimaryEnsureState(){
  try{
    if(!history.state?.[ATMS_P95_PRIMARY_KEY])history.replaceState({...history.state,[ATMS_P95_PRIMARY_KEY]:atmsPrimaryTab,[ATMS_P95_PRIMARY_DEPTH]:Number(history.state?.[ATMS_P95_PRIMARY_DEPTH])||0},'',location.href);
  }catch(_){ }
}
function atmsPrimaryVisit(tab){
  atmsPrimaryEnsureState();
  const from=history.state?.[ATMS_P95_PRIMARY_KEY]||atmsPrimaryTab;
  if(from!==tab){
    const state={...history.state,[ATMS_P95_PRIMARY_KEY]:tab,[ATMS_P95_PRIMARY_DEPTH]:(Number(history.state?.[ATMS_P95_PRIMARY_DEPTH])||0)+1,[ATMS_P95_MODAL_KEY]:null,[ATMS_SETTINGS_HISTORY_KEY]:tab==='settings'?atmsSettingsHubRoute():null};
    try{history.pushState(state,'',location.href)}catch(_){ }
  }
  atmsPrimaryTab=tab;
}
function atmsPrimaryRestore(tab,route){
  atmsPrimaryTab=tab;
  const activate=n=>document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x.dataset.nav===n));
  if(tab==='settings'){
    activate('settings');
    if(route?.kind&&route.kind!=='hub')return; // Existing settings popstate listener restores this panel.
    atmsSettingsShowHub();return;
  }
  if(tab==='import'){showView('import');activate('import');return;}
  if(tab==='messages'){renderMessagesView();activate('messages');return;}
  if(tab==='live'){renderLiveDisposition();activate('live');return;}
  mode=tab==='all'?'all':'rides';activate(tab==='all'?'all':'rides');render({restoreRidePosition:true});
}
function atmsPrimaryOpenDriverDialogHistory(){
  atmsPrimaryEnsureState();
  if(history.state?.[ATMS_P95_MODAL_KEY]==='drivers')return;
  try{history.pushState({...history.state,[ATMS_P95_MODAL_KEY]:'drivers'},'',location.href)}catch(_){ }
}
function atmsPrimaryCloseDriverDialog({selected=false}={}){
  $('driverDialog')?.classList.add('hidden');
  if(history.state?.[ATMS_P95_MODAL_KEY]==='drivers'){
    if(selected){try{history.replaceState({...history.state,[ATMS_P95_MODAL_KEY]:null},'',location.href)}catch(_){ }}
    else{try{history.back()}catch(_){ }}
  }
}
function atmsPrimaryBack(){
  if($('atmsArchiveViewer')){closeStorageV2ArchiveViewer();return}
  if(!$('driverDialog')?.classList.contains('hidden')){atmsPrimaryCloseDriverDialog();return}
  if($('settingsView')&&!$('settingsView').classList.contains('hidden')&&atmsSettingsActivePanel()){
    atmsSettingsBack();return;
  }
  if(atmsPrimaryTab==='rides'&&(Number(history.state?.[ATMS_P95_PRIMARY_DEPTH])||0)===0&&!history.state?.[ATMS_SETTINGS_HISTORY_KEY]){
    // On root Fahrten Android's system Back may leave; the on-screen button doesn't
    // unexpectedly close the native app.
    showToast('Du bist bereits auf Fahrten.');return;
  }
  try{history.back()}catch(_){atmsPrimaryRestore('rides',null)}
}
function atmsInstallPrimaryBackNavigation(){
  atmsPrimaryEnsureState();
  // P97-2C: bridge Android native Back / edge gesture into the existing ATMS back navigation.
  if(!window.__ATMS_P97_NATIVE_BACK_BOUND){
    window.__ATMS_P97_NATIVE_BACK_BOUND=true;
    window.addEventListener('atms-native-back',atmsPrimaryBack);
  }
  window.addEventListener('popstate',e=>{
    const state=e.state||{};
    const dialog=$('driverDialog');
    if(!dialog?.classList.contains('hidden'))dialog.classList.add('hidden');
    if(state[ATMS_P95_MODAL_KEY]==='drivers'&&dialog){dialog.classList.remove('hidden');return}
    const tab=state[ATMS_P95_PRIMARY_KEY]||'rides';
    if(tab!==atmsPrimaryTab)atmsPrimaryRestore(tab,state[ATMS_SETTINGS_HISTORY_KEY]);
  });
}

function atmsInstallRidesHeader(){
  const top=$('atmsRidesTop')||document.querySelector('#listView > header.top'),search=$('search');if(!top||!search)return;
  // Build the new topbar around the existing input to preserve all original search listeners.
  if(!top.id)top.id='atmsRidesTop';top.classList.add('atms-rides-topbar');
  if(!$('ridesSearchToggle')){
    const bar=document.createElement('div');bar.className='atms-rides-bar';
    bar.innerHTML='<button id="ridesTopBack" class="atms-rides-icon" type="button" aria-label="Zurück" title="Zurück">‹</button><h1>🚘 Fahrten</h1><button id="ridesSearchToggle" class="atms-rides-icon" type="button" aria-label="Suche einblenden" aria-expanded="true" title="Fahrten suchen">⌕</button>';
    top.insertBefore(bar,top.firstChild);
    const panel=document.createElement('div');panel.id='ridesSearchPanel';panel.className='atms-rides-search-panel';
    panel.innerHTML='<label for="search" class="atms-rides-search-label">FAHRTEN DURCHSUCHEN</label><div class="atms-rides-search-input"><span aria-hidden="true">⌕</span></div>';
    top.insertBefore(panel,search);panel.querySelector('.atms-rides-search-input').appendChild(search);
  }
  const button=$('ridesSearchToggle');if(!button)return;
  $('ridesTopBack')?.addEventListener('click',atmsPrimaryBack);
  let expanded=true;
  const setExpanded=next=>{expanded=Boolean(next);top.classList.toggle('atms-rides-collapsed',!expanded);button.setAttribute('aria-expanded',String(expanded));button.setAttribute('aria-label',expanded?'Suche ausblenden':'Suche einblenden')};
  button.addEventListener('click',()=>{setExpanded(!expanded);if(expanded){try{search?.focus({preventScroll:true})}catch(_){search?.focus()}}});
  let previousScroll=0;
  window.addEventListener('scroll',()=>{
    if($('listView')?.classList.contains('hidden'))return;
    if(document.activeElement===search)return;
    const y=window.scrollY||document.documentElement.scrollTop||0;
    if(y<35)setExpanded(true);
    else if(y>135&&y>previousScroll+5)setExpanded(false);
    previousScroll=y;
  },{passive:true});
}
function showView(v){
  if(v==='live')captureLiveBottomNavBaseline();
  try{document.body?.classList.toggle('atms-live-target-active',v==='live')}catch(_){ }
  if(v==='live')restoreLiveBottomNavBaseline();
  ['listView','cockpitView','importView','settingsView','liveDispositionView','messagesView'].forEach(id=>{const el=$(id);if(el)el.classList.add('hidden')});
  if(v==='list')$('listView')?.classList.remove('hidden');
  if(v==='cockpit')$('cockpitView')?.classList.remove('hidden');
  if(v==='import'){$('importView')?.classList.remove('hidden');resetHorizontalViewport('importView');try{ensureP102CurrentPlanPreviewPanel()}catch(_){ }}
  if(v==='settings'){$('settingsView')?.classList.remove('hidden');resetHorizontalViewport('settingsView');try{updateSettingsHub()}catch(_){ }}
  if(v==='live')$('liveDispositionView')?.classList.remove('hidden');
  if(v==='messages'){ensureMessagesView();$('messagesView')?.classList.remove('hidden');resetHorizontalViewport('messagesView')}
}
function driverRideDate(r){return String(first(r?.date,r?.planDate,r?.datum)||'').trim()}
function driverSummaryRoute(r){
  if(r?.isBundle&&Array.isArray(r.routeStops)&&r.routeStops.length)return r.routeStops.slice().sort((a,b)=>a.order-b.order).map(x=>x.name).filter(Boolean).join(' → ');
  return `${String(r?.pickup||'–').trim()||'–'} → ${String(r?.destination||'–').trim()||'–'}`;
}
function driverSummaryFlightsForDay(name,date){
  const source=rides.filter(r=>driverColorKey(r?.driver)===driverColorKey(name)&&driverRideDate(r)===date);
  return visualRides(source).slice().sort((a,b)=>{
    const ta=String(planTimeOf(a)||'99:99'),tb=String(planTimeOf(b)||'99:99');
    return ta.localeCompare(tb)||String(a.flightNumber||'').localeCompare(String(b.flightNumber||''));
  });
}
function renderDriverDaySummary(name,date){
  const overlay=document.getElementById('driverDaySummaryOverlay');if(!overlay)return;
  const dates=[...new Set(rides.filter(r=>driverColorKey(r?.driver)===driverColorKey(name)).map(driverRideDate).filter(Boolean))].sort().reverse();
  const selected=dates.includes(date)?date:(dates[0]||'');
  const rows=selected?driverSummaryFlightsForDay(name,selected):[];
  const total=rows.reduce((sum,r)=>sum+(Number(r?.price)||0),0);
  const color=driverColorOf(name).hex;
  const list=rows.length?rows.map(r=>`<div class="driver-day-summary-row"><div class="top"><span>${esc(planTimeOf(r)||'--:--')} · ${esc(r.flightNumber||'ohne Flugnr.')}${r.isBundle?'<span class="driver-day-summary-bundle">BÜNDELFAHRT</span>':''}</span><span>${esc(money(Number(r.price)||0))}</span></div><div class="meta">${esc(ridePartnerLabel(r)||'–')} · ${esc(r.vehicle||'–')} · ${Number(r.persons)||0} Pers.</div><div class="route">${esc(driverSummaryRoute(r))}</div></div>`).join(''):'<div class="empty">Keine Fahrten für diesen Tag.</div>';
  overlay.innerHTML=`<div class="driver-day-summary-sheet"><div class="driver-day-summary-head"><div><div style="font-size:13px;opacity:.72">Fahrer-Tagesübersicht</div><h3 style="margin:2px 0 0;color:${esc(color)}">${esc(name)}</h3></div><button type="button" class="driver-day-summary-close" aria-label="Schließen">×</button></div><div class="driver-day-summary-controls"><label for="driverDaySummaryDate">Tag</label><select id="driverDaySummaryDate">${dates.map(d=>`<option value="${esc(d)}" ${d===selected?'selected':''}>${esc(d)}</option>`).join('')}</select></div><div class="driver-day-summary-kpis"><div class="driver-day-summary-kpi"><span>Fahrten</span><b>${rows.length}</b></div><div class="driver-day-summary-kpi"><span>Gesamtsumme</span><b>${esc(money(total))}</b></div></div><div>${list}</div></div>`;
  overlay.querySelector('.driver-day-summary-close')?.addEventListener('click',()=>overlay.remove());
  overlay.onclick=e=>{if(e.target===overlay)overlay.remove()};
  overlay.querySelector('#driverDaySummaryDate')?.addEventListener('change',e=>renderDriverDaySummary(name,e.target.value));
}
function openDriverDaySummary(name){
  ensureDriverColorCss();
  let overlay=document.getElementById('driverDaySummaryOverlay');
  if(!overlay){overlay=document.createElement('div');overlay.id='driverDaySummaryOverlay';overlay.className='driver-day-summary-overlay';document.body.appendChild(overlay)}
  const dates=[...new Set(rides.filter(r=>driverColorKey(r?.driver)===driverColorKey(name)).map(driverRideDate).filter(Boolean))].sort().reverse();
  renderDriverDaySummary(name,dates[0]||'');
}

function openDrivers(){
  const names=[...new Set(rides.map(r=>String(r.driver||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de'));
  const choices=[{label:'Alle Fahrten',value:''},...names.map(n=>({label:n,value:n}))];
  const box=$('driverChoices');
  const dialog=$('driverDialog');
  if(!box||!dialog){showAppError(new Error('Fahrerauswahl ist nicht verfügbar.'));return}
  box.className=choices.length>10?'ultra':choices.length>6?'dense':'';
  ensureDriverColorCss();
  ensureDriverColorAssignments(rides);
  const paletteHtml=(driver)=>{
    const current=driverColorOf(driver).id;
    const planHex=driverPlanColorOf(driver);
    const planButton=planHex?`<button type="button" class="driver-color-swatch driver-plan-swatch ${!driverColorManualMap[driverColorKey(driver)]?'selected':''}" data-driver-plan-color="1" title="Planfarbe verwenden" aria-label="Planfarbe verwenden" style="background:${planHex}">Plan</button>`:'';
    return planButton+DRIVER_COLOR_PALETTE.map(c=>`<button type="button" class="driver-color-swatch ${current===c.id?'selected':''}" data-driver-color-id="${esc(c.id)}" title="Farbe wählen" aria-label="Farbe ${esc(c.id)} wählen" style="background:${c.hex}"></button>`).join('');
  };
  box.innerHTML=choices.map((c,i)=>{
    if(i===0)return `<button type="button" class="choice ${driverFilter===c.value?'selected':''}" data-choice-index="${i}"><span class="dot" style="background:#00a8ff"></span>${esc(c.label)}<span class="grow"></span>${driverFilter===c.value?'✓':''}</button>`;
    const color=driverColorOf(c.value);
    return `<div class="driver-choice-item" data-driver-item-index="${i}">
      <button type="button" class="driver-color-dot-btn" data-driver-color-toggle="${i}" title="Farbe für ${esc(c.label)} auswählen" aria-label="Farbe für ${esc(c.label)} auswählen"><span class="dot" style="background:${color.hex}"></span></button>
      <button type="button" class="choice ${driverFilter===c.value?'selected':''}" data-choice-index="${i}">${esc(c.label)}<span class="grow"></span>${driverFilter===c.value?'✓':''}</button>
      <button type="button" class="driver-day-summary-btn" data-driver-summary="${i}" title="Tagesübersicht für ${esc(c.label)}" aria-label="Tagesübersicht für ${esc(c.label)}">📊</button>
      <div class="driver-color-palette hidden" data-driver-color-palette="${i}">${paletteHtml(c.value)}</div>
    </div>`;
  }).join('');
  box.onclick=e=>{
    const swatch=e.target.closest('[data-driver-color-id]');
    if(swatch){
      const palette=swatch.closest('[data-driver-color-palette]');
      const idx=Number(palette?.dataset.driverColorPalette);
      const c=choices[idx];
      if(c?.value&&setDriverColorManual(c.value,swatch.dataset.driverColorId)){
        render();
        openDrivers();
      }
      return;
    }
    const plan=e.target.closest('[data-driver-plan-color]');
    if(plan){
      const palette=plan.closest('[data-driver-color-palette]');
      const idx=Number(palette?.dataset.driverColorPalette);const c=choices[idx];
      if(c?.value&&useDriverPlanColor(c.value)){render();openDrivers()}return;
    }
    const summary=e.target.closest('[data-driver-summary]');
    if(summary){const c=choices[Number(summary.dataset.driverSummary)];if(c?.value)openDriverDaySummary(c.value);return;}
    const toggle=e.target.closest('[data-driver-color-toggle]');
    if(toggle){
      const idx=Number(toggle.dataset.driverColorToggle);
      const palette=box.querySelector(`[data-driver-color-palette="${idx}"]`);
      const willOpen=Boolean(palette?.classList.contains('hidden'));
      box.querySelectorAll('[data-driver-color-palette]').forEach(p=>p.classList.add('hidden'));
      if(palette&&willOpen)palette.classList.remove('hidden');
      return;
    }
    const b=e.target.closest('[data-choice-index]');if(!b)return;
    const c=choices[Number(b.dataset.choiceIndex)];if(!c)return;
    driverFilter=c.value;mode='all';atmsPrimaryCloseDriverDialog({selected:true});atmsPrimaryVisit('all');
    document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.nav==='all'));
    render();
  };
  dialog.classList.remove('hidden');atmsPrimaryOpenDriverDialogHistory();
}

function openCockpit(id){active=visualRides(rides).find(r=>r.id===id)||rides.find(r=>r.id===id);if(!active)return;showView('cockpit');const cockpitDispo=first(dispoTimeOf(active),planTimeOf(active))||'--:--';const cockpitDirection=hasFlightNumber(active)?flightDirectionForGemini(active):'unknown';const cockpitLive=liveTimeOf(active);const cockpitLiveUsable=liveSnapshotFreshness(active).usable;const cockpitCurrent=cockpitLiveUsable&&cockpitLive?(cockpitLive||'--:--'):'--:--';$('planTime').textContent=cockpitDispo;const leftTimeLabel=$('planTime')?.parentElement?.querySelector('.lbl');if(leftTimeLabel)leftTimeLabel.textContent='DISPO-ZEIT';$('planTime').classList.toggle('plan-replaced',Boolean(cockpitDispo&&cockpitCurrent&&cockpitDispo!=='--:--'&&cockpitCurrent!==cockpitDispo));$('currentTime').textContent=cockpitCurrent;const source=effectiveSource(active);$('currentTimeLabel').textContent=cockpitDirection==='arrival'?'LIVE-ABHOLZEIT':(source==='live'?'LIVE-ABHOLZEIT':'AKTUELLE ABHOLZEIT');$('driverA').textContent=$('driverB').textContent=active.driver||'Offen';$('overdue').textContent='';$('flightNum').textContent='✈ '+(active.flightNumber||'–');$('flightLoc').textContent=active.flightLocation?active.flightLocation+(active.iata?' ('+active.iata+')':''):'Flugort nicht verfügbar';syncCockpitFlightAirportConflict(active);syncCockpitManualFlightReview(active);const flightTimeHost=$('flightLoc')?.parentElement;let flightListTime=$('flightListTime');if(flightTimeHost&&!flightListTime){flightListTime=document.createElement('div');flightListTime.id='flightListTime';flightListTime.style.cssText='font-size:14px;font-weight:800;margin-top:6px;opacity:.9';flightTimeHost.insertBefore(flightListTime,$('cockFlightStatus')||null)}if(flightListTime){const listedTime=listedFlightTimeOf(active),label=listedTimeLabel(active);flightListTime.textContent=listedTime?`🕒 ${label} ${listedTime}`:`🕒 ${label} –`;}const fsi=flightStatusInfo(active);$('cockFlightStatus').className='flight-status cock-flight-status '+fsi.key;$('cockFlightStatus').textContent=fsi.label;$('partner').textContent=active.partner||active.airline||'–';$('company').textContent=active.company||'–';const routeStops=Array.isArray(active.routeStops)?[...active.routeStops].sort((a,b)=>a.order-b.order):[];const routeBox=$('routeBox');if(active.isBundle&&routeStops.length){const stopHtml=routeStops.map((st,i)=>`<div class="bundle-route-stop ${i===routeStops.length-1?'final':''}"><span class="bundle-route-marker" style="border-color:${isAirport(st.name)?'#00a8ff':'#b45cff'}"></span><div><div class="bundle-route-name">${i+1}. ${esc(st.name)}</div><div class="bundle-route-meta">${st.persons||'–'} Pers. · ${st.type==='destination'?'Ziel':st.type==='start'?'Start':st.type==='pickup'?`${i+1}. Abholung`:`${i+1}. Stopp`}</div></div></div>`).join('');routeBox.innerHTML=`<div style="grid-column:1/-1;width:100%"><div class="bundle-route-title">BÜNDELFAHRT · ${routeStops.length} STOPPS</div><div class="bundle-route-list">${stopHtml}</div></div>`}else{routeBox.innerHTML=`<div class="timeline"><div class="circle"></div><div class="dash"></div><div class="circle bluec"></div></div><div><div id="pickup" class="place">${esc(active.pickup||'–')}</div><div id="pickupMeta" class="small">${active.persons||'–'} Pers. · Abholung</div><div id="destination" class="place">${esc(active.destination||'–')}</div><div id="destMeta" class="small">${active.persons||'–'} Pers. · Ziel</div></div>`;}$('persons').textContent=active.persons||'–';$('vehicle').textContent=active.vehicle||'–';$('price').textContent=ridePriceLabel(active);$('price').title=active.isBundle?`${active.invoiceCount||1} Rechnung${(active.invoiceCount||1)===1?'':'en'}`:'';const activeDone=(active._bundleMemberIds||[active.id]).every(id=>done.has(id));$('doneBtn').textContent=activeDone?'Wieder öffnen':'Erledigt';const statusBadge=$('statusBadge');if(statusBadge){let badgeText='KEINE LIVE-DATEN';let badgeTone='neutral';if(activeDone){badgeText='ERLEDIGT';badgeTone='done'}else if(fsi.key==='on-time'){badgeText='PÜNKTLICH';badgeTone='ok'}else if(fsi.key==='delayed'){badgeText=String(fsi.label||'VERSPÄTET').toUpperCase();badgeTone='warn'}else if(fsi.key==='landed'){badgeText='GELANDET';badgeTone='landed'}else if(fsi.key==='departed'){badgeText='ABGEFLOGEN';badgeTone='landed'}else if(fsi.key==='stale'){badgeText='LIVE VERALTET';badgeTone='neutral'}else if(fsi.key==='cancelled'){badgeText='STORNIERT';badgeTone='warn'}statusBadge.textContent=badgeText;statusBadge.dataset.atmsTone=badgeTone;if(badgeTone==='neutral'){statusBadge.style.color='#aebfc9';statusBadge.style.borderColor='rgba(174,191,201,.45)';statusBadge.style.background='rgba(174,191,201,.08)'}else{statusBadge.style.removeProperty('color');statusBadge.style.removeProperty('border-color');statusBadge.style.removeProperty('background')}}renderDispatcherControls();renderDriverControls();const editFlightBtn=document.querySelector('#cockpitView .edit');if(editFlightBtn)editFlightBtn.onclick=openManualFlightEditor}

function fullMessagePlace(name){
  const raw=String(name||'').trim();
  if(!raw)return'';
  const n=normKey(raw);
  const hasNh=/nh\s*nord/i.test(raw);
  const hasHoliday=/holiday\s*inn/i.test(raw);
  if(hasNh&&hasHoliday)return'Holiday Inn DUS & NH Nord DUS';
  if(/marriott\s*seestern/i.test(raw)||n==='seestern dus'||n==='seestern düsseldorf'||n==='seestern duesseldorf')return'Marriott Seestern DUS';
  if(hasHoliday)return'Holiday Inn DUS';
  if(hasNh)return'NH Nord DUS';
  return raw;
}
function uniqueMessagePlaces(values){
  const out=[];
  for(const value of values){
    const normalized=fullMessagePlace(value);
    if(!normalized)continue;
    normalized.split(/\s*&\s*/).forEach(part=>{
      const place=part.trim();
      if(place&&!out.some(x=>normKey(x)===normKey(place)))out.push(place);
    });
  }
  return out;
}
function rideMessagePlaces(r,kind){
  if(!r)return[];
  const rs=Array.isArray(r.routeStops)?[...r.routeStops].sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0)):[];
  const direction=r.bundleDirection||directionOf(r);
  if(r.isBundle&&rs.length){
    const wanted=kind==='pickup'
      ? rs.filter(x=>x.type==='pickup'||(direction==='hotels_to_airport'&&!isAirport(x.name)))
      : rs.filter(x=>x.type==='destination'||(direction==='airport_to_hotels'&&!isAirport(x.name)));
    const places=uniqueMessagePlaces(wanted.map(x=>x.name));
    if(places.length)return places;
  }
  return uniqueMessagePlaces([kind==='pickup'?r.pickup:r.destination]);
}
function ridePickupSummary(r){return rideMessagePlaces(r,'pickup').join(' & ')}
function rideDestinationSummary(r){return rideMessagePlaces(r,'destination').join(' & ')}
function getInfoChatSettings(){
  try{
    const saved=JSON.parse(localStorage.getItem(INFO_CHAT_SETTINGS)||'{}');
    const type=saved.type==='single'?'single':'group';
    return {
      name:String(saved.name||'INFO / STATUS').trim()||'INFO / STATUS',
      type,
      phone:String(saved.phone||'').trim()
    };
  }catch{return{name:'INFO / STATUS',type:'group',phone:''}}
}
function saveInfoChatSettings(){
  const name=String($('infoChatName')?.value||'').trim()||'INFO / STATUS';
  const type=$('infoChatType')?.value==='single'?'single':'group';
  const phone=String($('infoChatPhone')?.value||'').trim();
  if(type==='single'&&!cleanPhone(phone)){
    alert('Bitte für den WhatsApp-Einzelchat eine Telefonnummer eingeben.');
    return;
  }
  localStorage.setItem(INFO_CHAT_SETTINGS,JSON.stringify({name,type,phone}));
  renderInfoChatSettings();
  showToast('Info-/Status-Chat gespeichert','ok');
  updateBackupUI();
}
function renderInfoChatSettings(){
  const settings=getInfoChatSettings();
  const name=$('infoChatName'),type=$('infoChatType'),phone=$('infoChatPhone');
  const status=$('infoChatStatus'),button=$('infoStatusBtn');
  if(name&&document.activeElement!==name)name.value=settings.name;
  if(type)type.value=settings.type;
  if(phone&&document.activeElement!==phone)phone.value=settings.phone;
  if(phone){
    phone.disabled=settings.type!=='single';
    phone.placeholder=settings.type==='single'?'z. B. +4915112345678':'Bei WhatsApp-Gruppen nicht erforderlich';
  }
  if(status){
    status.textContent=settings.type==='single'
      ? `Aktiver Einzelchat: ${settings.name}${settings.phone?' · '+settings.phone:''}`
      : `Aktiver Gruppenchat: ${settings.name} · Gruppe wird in WhatsApp ausgewählt`;
  }
  if(button)button.textContent=`📢 ${settings.name}`;
}
function getWhatsappSettings(){return {infoChat:getInfoChatSettings()}}
function getDispatchers(){let d=[];try{d=JSON.parse(localStorage.getItem(DISP_SETTINGS)||'[]')}catch{}if(!Array.isArray(d))d=[];const legacy=(()=>{try{return JSON.parse(localStorage.getItem(WA_SETTINGS)||'{}')}catch{return{}}})();if(!d.length&&legacy.phone)d=[{id:'disp-1',name:legacy.name||'Ewa',phone:legacy.phone}];return d.filter(x=>x&&x.name)}
function saveDispatchers(list,currentId){localStorage.setItem(DISP_SETTINGS,JSON.stringify(list));if(currentId!==undefined)localStorage.setItem(DISP_SETTINGS+'_current',currentId||'')}
function currentDispatcherId(){return localStorage.getItem(DISP_SETTINGS+'_current')||''}
function getCurrentDispatcher(){const list=getDispatchers();return list.find(x=>x.id===currentDispatcherId())||list[0]||null}
function setCurrentDispatcher(id){saveDispatchers(getDispatchers(),id);renderDispatcherControls()}
function saveWhatsappSettings(){saveInfoChatSettings()}
function addDispatcher(){const name=$('dispatcherName').value.trim(),phone=$('dispatcherPhone').value.trim();if(!name||!cleanPhone(phone)){alert('Bitte Name und Telefonnummer eingeben.');return}const list=getDispatchers();if(list.length>=20){alert('Es können maximal 20 Disponenten gespeichert werden.');return}const id='disp-'+Date.now();list.push({id,name,phone});saveDispatchers(list,currentDispatcherId()||id);$('dispatcherName').value='';$('dispatcherPhone').value='';renderDispatcherList();renderDispatcherControls();updateBackupUI()}
function deleteDispatcher(id){let list=getDispatchers().filter(x=>x.id!==id);const next=currentDispatcherId()===id?(list[0]?.id||''):currentDispatcherId();saveDispatchers(list,next);renderDispatcherList();renderDispatcherControls();updateBackupUI()}
function chooseDispatcher(id){setCurrentDispatcher(id);renderDispatcherList()}
function renderDispatcherList(){const box=$('dispatcherList');if(!box)return;const list=getDispatchers(),current=currentDispatcherId()||(list[0]?.id||'');box.innerHTML=list.length?list.map(d=>`<div class="dispatcher-item"><div><b>${esc(d.name)}</b><small>${esc(d.phone)}</small>${d.id===current?'<div class="current-chip">✓ Aktueller Disponent</div>':''}</div><div class="dispatcher-item-actions"><button class="mini" type="button" onclick="chooseDispatcher('${d.id}')">Aktiv</button><a class="mini" href="tel:${cleanPhone(d.phone)}">📞</a><button class="mini danger" type="button" onclick="deleteDispatcher('${d.id}')">✕</button></div></div>`).join(''):'<div class="setting-note">Noch kein Disponent gespeichert.</div>'}
function renderDispatcherControls(){const sel=$('cockpitDispatcherSelect'),list=getDispatchers();if(!sel)return;let current=currentDispatcherId();if(!current&&list[0]){current=list[0].id;saveDispatchers(list,current)}sel.innerHTML=list.length?list.map(d=>`<option value="${d.id}" ${d.id===current?'selected':''}>👤 ${esc(d.name)}</option>`).join(''):'<option value="">Kein Disponent</option>';const d=getCurrentDispatcher(),phone=d?cleanPhone(d.phone):'';$('cockpitDispatcherInfo').textContent=d?`${d.name} · ${d.phone}`:'Bitte zuerst in den Einstellungen einen Disponenten anlegen.';$('cockpitCallBtn').href=phone?'tel:'+phone:'#';$('cockpitCallBtn').classList.toggle('hidden',!phone);$('cockpitDispatcherMessageBtn').disabled=!phone}

function settingsDispatcherSyncAfterChange(){renderDispatcherList();renderDispatcherControls();updateBackupUI();updateSettingsHub();renderSettingsDispatcherList()}
function settingsDispatcherFieldRow(label,value,opts={}){if(!String(value||'').trim())return'';const v=String(value).trim();let content=esc(v);if(opts.tel)content=`<a href="tel:${esc(cleanPhone(v))}">${esc(v)}</a>`;else if(opts.mail)content=`<a href="mailto:${esc(v)}">${esc(v)}</a>`;return`<div class="driver-detail-row"><span>${esc(label)}</span><strong>${content}</strong></div>`}
function renderSettingsDispatcherList(){
  const host=$('settingsDispatcherList');if(!host)return;const all=getDispatchers(),q=normKey($('settingsDispatcherSearch')?.value||''),current=currentDispatcherId()||(all[0]?.id||'');
  let list=all.filter(d=>!q||[d.name,d.phone,d.email,d.note,'Disposition'].some(v=>normKey(v).includes(q)));
  list.sort((a,b)=>(Number(String(b.id)===String(current))-Number(String(a.id)===String(current)))||String(a.name||'').localeCompare(String(b.name||''),'de'));
  const count=$('settingsDispatcherPageCount');if(count)count.textContent=`${all.length} gespeicherte Disponenten`;
  const info=$('settingsDispatcherSearchInfo');if(info)info.textContent=q?`${list.length} Treffer von ${all.length}`:`${all.length} Disponenten verfügbar`;
  host.innerHTML=list.length?list.map(d=>`<button type="button" class="driver-compact-item" data-settings-dispatcher-id="${esc(d.id)}"><span class="driver-compact-main"><strong>${esc(d.name)}</strong><small>Disposition</small>${String(d.id)===String(current)?'<em class="active">Aktuell</em>':''}</span><span class="driver-compact-chevron">›</span></button>`).join(''):'<div class="setting-note driver-empty">Keine passenden Disponenten gefunden.</div>';
}
function resetSettingsDispatcherForm(){['settingsDispatcherEditId','settingsDispatcherName','settingsDispatcherPhone','settingsDispatcherEmail','settingsDispatcherNote'].forEach(id=>{const el=$(id);if(el)el.value=''})}
function showSettingsDispatcherBrowse(opts={}){const panel=$('atmsDispatcherSettingsPanel');if(!panel)return;['settingsDispatcherBrowseView','settingsDispatcherEditorView','settingsDispatcherDetailView'].forEach(id=>$(id)?.classList.add('hidden'));$('settingsDispatcherBrowseView')?.classList.remove('hidden');renderSettingsDispatcherList();panel.classList.remove('atms-mobile-nav-collapsed');if(opts.restoreScroll)atmsSettingsSetScroll(atmsSettingsListScroll.dispatcher,'dispatcher');else requestAnimationFrame(()=>panel.scrollIntoView({block:'start'}))}
function showSettingsDispatcherEditor(mode='new',id='',opts={}){
  const panel=$('atmsDispatcherSettingsPanel');if(!panel)return;if(opts.history!==false){atmsSettingsRememberScroll('dispatcher');atmsSettingsPushRoute('dispatcher','editor',mode==='edit'?id:'')}resetSettingsDispatcherForm();const d=mode==='edit'?getDispatchers().find(x=>String(x.id)===String(id)):null;
  if(d){$('settingsDispatcherEditId').value=d.id;$('settingsDispatcherName').value=d.name||'';$('settingsDispatcherPhone').value=d.phone||'';$('settingsDispatcherEmail').value=d.email||'';$('settingsDispatcherNote').value=d.note||''}
  const title=$('settingsDispatcherEditorTitle');if(title)title.textContent=d?'Disponent bearbeiten':'Neuer Disponent';['settingsDispatcherBrowseView','settingsDispatcherDetailView'].forEach(x=>$(x)?.classList.add('hidden'));$('settingsDispatcherEditorView')?.classList.remove('hidden');panel.classList.remove('atms-mobile-nav-collapsed');requestAnimationFrame(()=>{panel.scrollIntoView({block:'start'});setTimeout(()=>$('settingsDispatcherName')?.focus(),80)})
}
function showSettingsDispatcherDetail(id,opts={}){
  const list=getDispatchers(),d=list.find(x=>String(x.id)===String(id)),body=$('settingsDispatcherDetailBody');if(!d||!body)return;if(opts.history!==false){atmsSettingsRememberScroll('dispatcher');atmsSettingsPushRoute('dispatcher','detail',id)}body.dataset.dispatcherId=d.id;const current=String(currentDispatcherId()||(list[0]?.id||''))===String(d.id);
  body.innerHTML=`<div class="driver-detail-hero">${current?'<div class="driver-detail-status active">● Aktueller Disponent</div>':''}<h3>${esc(d.name)}</h3><p>Disposition</p></div>${settingsDispatcherFieldRow('Telefon / WhatsApp',d.phone,{tel:!!cleanPhone(d.phone)})}${settingsDispatcherFieldRow('E-Mail',d.email,{mail:!!String(d.email||'').trim()})}${settingsDispatcherFieldRow('Notiz',d.note)}${settingsDispatcherFieldRow('Rolle','Disposition')}`;
  const phone=cleanPhone(d.phone),call=$('settingsDispatcherCall'),wa=$('settingsDispatcherWhatsapp');if(call){call.classList.toggle('hidden',!phone);call.href=phone?'tel:'+phone:'#'}if(wa)wa.classList.toggle('hidden',!phone);
  const currentBtn=$('settingsDispatcherCurrent');if(currentBtn){currentBtn.classList.toggle('hidden',current);currentBtn.textContent='✓ Als aktuellen Disponenten wählen'}const title=$('settingsDispatcherDetailTitle');if(title)title.textContent=d.name;
  ['settingsDispatcherBrowseView','settingsDispatcherEditorView'].forEach(x=>$(x)?.classList.add('hidden'));$('settingsDispatcherDetailView')?.classList.remove('hidden');$('atmsDispatcherSettingsPanel')?.classList.remove('atms-mobile-nav-collapsed');requestAnimationFrame(()=>$('atmsDispatcherSettingsPanel')?.scrollIntoView({block:'start'}))
}
function saveSettingsDispatcherForm(){
  const editId=String($('settingsDispatcherEditId')?.value||'').trim(),name=String($('settingsDispatcherName')?.value||'').trim(),phone=String($('settingsDispatcherPhone')?.value||'').trim(),email=String($('settingsDispatcherEmail')?.value||'').trim(),note=String($('settingsDispatcherNote')?.value||'').trim();
  if(!name||!cleanPhone(phone)){showToast('Bitte Name und gültige Telefonnummer eingeben','warn');return}const list=getDispatchers();if(!editId&&list.length>=20){showToast('Es können maximal 20 Disponenten gespeichert werden','warn');return}
  if(editId){const d=list.find(x=>String(x.id)===editId);if(!d){showToast('Disponent nicht gefunden','warn');return}Object.assign(d,{name,phone,email,note})}else{const id='disp-'+Date.now();list.push({id,name,phone,email,note});saveDispatchers(list,currentDispatcherId()||id);settingsDispatcherSyncAfterChange();resetSettingsDispatcherForm();atmsSettingsReturnToBrowse('dispatcher');showToast('Disponent gespeichert','ok');return}
  saveDispatchers(list,currentDispatcherId());settingsDispatcherSyncAfterChange();resetSettingsDispatcherForm();atmsSettingsReturnToBrowse('dispatcher');showToast('Disponent aktualisiert','ok')
}
function chooseSettingsDispatcherCurrent(){const id=$('settingsDispatcherDetailBody')?.dataset.dispatcherId;if(!id)return;setCurrentDispatcher(id);settingsDispatcherSyncAfterChange();showSettingsDispatcherDetail(id,{history:false});showToast('Aktueller Disponent gesetzt','ok')}
function deleteSettingsDispatcher(){const id=$('settingsDispatcherDetailBody')?.dataset.dispatcherId,list=getDispatchers(),d=list.find(x=>String(x.id)===String(id));if(!d)return;if(!confirm(`Disponent „${d.name}“ wirklich löschen?`))return;const next=list.filter(x=>String(x.id)!==String(id)),current=String(currentDispatcherId())===String(id)?(next[0]?.id||''):currentDispatcherId();saveDispatchers(next,current);settingsDispatcherSyncAfterChange();atmsSettingsReturnToBrowse('dispatcher');showToast('Disponent gelöscht','ok')}
function ensureSettingsDispatcherPanel(){
  const view=$('settingsView'),host=$('settingsToolsHost');if(!view)return false;let panel=$('atmsDispatcherSettingsPanel');if(panel)return true;
  panel=document.createElement('section');panel.id='atmsDispatcherSettingsPanel';panel.dataset.atmsP95Gate4Panel='1';panel.className='settings-dispatcher-page hidden';
  panel.innerHTML=`<div class="settings-subpage-head atms-mobile-topbar"><button type="button" id="settingsDispatcherBackSettings" class="settings-back-btn" aria-label="Zurück zu Einstellungen">‹</button><div class="atms-mobile-title"><h2>👤 Disponenten</h2><small id="settingsDispatcherPageCount">0 gespeicherte Disponenten</small></div><div class="atms-mobile-head-actions"><button type="button" id="settingsDispatcherHeadSearch" class="atms-mobile-icon-btn" aria-label="Disponent suchen">⌕</button><button type="button" id="settingsDispatcherHeadAdd" class="atms-mobile-icon-btn" aria-label="Neuer Disponent">＋</button></div></div>
  <div id="settingsDispatcherBrowseView"><div class="driver-toolbar"><input id="settingsDispatcherSearch" class="setting-input" placeholder="Disponent suchen …" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false"><button type="button" id="settingsDispatcherNew" class="driver-new-btn">+ Neuer Disponent</button></div><div id="settingsDispatcherSearchInfo" class="driver-search-info">Disponentensuche bereit.</div><div id="settingsDispatcherList" class="driver-compact-list"></div></div>
  <div id="settingsDispatcherEditorView" class="hidden"><div class="address-inner-head atms-mobile-topbar atms-mobile-innerbar"><button type="button" id="settingsDispatcherEditorBack" class="settings-back-btn" aria-label="Zurück">‹</button><h3 id="settingsDispatcherEditorTitle">Neuer Disponent</h3></div><input id="settingsDispatcherEditId" type="hidden"><label class="setting-label" for="settingsDispatcherName">Name</label><input id="settingsDispatcherName" class="setting-input" placeholder="z. B. Lisa" autocomplete="off"><label class="setting-label" for="settingsDispatcherPhone">Telefon-/WhatsApp-Nummer</label><input id="settingsDispatcherPhone" class="setting-input" inputmode="tel" placeholder="z. B. +4915112345678"><label class="setting-label" for="settingsDispatcherEmail">E-Mail (optional)</label><input id="settingsDispatcherEmail" class="setting-input" inputmode="email" placeholder="z. B. dispo@firma.de"><label class="setting-label" for="settingsDispatcherNote">Notiz (optional)</label><textarea id="settingsDispatcherNote" class="setting-input driver-note-input" placeholder="z. B. Frühdienst / bevorzugt WhatsApp"></textarea><div class="driver-editor-actions"><button type="button" id="settingsDispatcherSave" class="act dark">Disponent speichern</button></div></div>
  <div id="settingsDispatcherDetailView" class="hidden"><div class="address-inner-head atms-mobile-topbar atms-mobile-innerbar"><button type="button" id="settingsDispatcherDetailBack" class="settings-back-btn" aria-label="Zurück">‹</button><h3 id="settingsDispatcherDetailTitle">Disponent</h3></div><div id="settingsDispatcherDetailBody" class="driver-detail-body"></div><div class="driver-detail-actions"><a id="settingsDispatcherCall" class="act dark hidden" href="#">📞 Anrufen</a><button type="button" id="settingsDispatcherWhatsapp" class="act dark hidden">💬 WhatsApp</button><button type="button" id="settingsDispatcherCurrent" class="act">✓ Als aktuellen Disponenten wählen</button><button type="button" id="settingsDispatcherEdit" class="act dark">✎ Bearbeiten</button><button type="button" id="settingsDispatcherDelete" class="act danger">🗑 Löschen</button></div></div>`;
  if(host)host.appendChild(panel);else view.appendChild(panel);
  $('settingsDispatcherBackSettings')?.addEventListener('click',atmsSettingsBack);$('settingsDispatcherNew')?.addEventListener('click',()=>showSettingsDispatcherEditor('new'));$('settingsDispatcherEditorBack')?.addEventListener('click',atmsSettingsBack);$('settingsDispatcherDetailBack')?.addEventListener('click',atmsSettingsBack);$('settingsDispatcherSave')?.addEventListener('click',saveSettingsDispatcherForm);$('settingsDispatcherHeadSearch')?.addEventListener('click',()=>atmsSettingsFocusBrowse('dispatcher'));$('settingsDispatcherHeadAdd')?.addEventListener('click',()=>showSettingsDispatcherEditor('new'));
  $('settingsDispatcherSearch')?.addEventListener('input',renderSettingsDispatcherList);$('settingsDispatcherList')?.addEventListener('click',e=>{const row=e.target.closest('[data-settings-dispatcher-id]');if(row)showSettingsDispatcherDetail(row.dataset.settingsDispatcherId)});$('settingsDispatcherCurrent')?.addEventListener('click',chooseSettingsDispatcherCurrent);$('settingsDispatcherEdit')?.addEventListener('click',()=>{const id=$('settingsDispatcherDetailBody')?.dataset.dispatcherId;if(id)showSettingsDispatcherEditor('edit',id)});$('settingsDispatcherDelete')?.addEventListener('click',deleteSettingsDispatcher);$('settingsDispatcherWhatsapp')?.addEventListener('click',()=>{const id=$('settingsDispatcherDetailBody')?.dataset.dispatcherId,d=getDispatchers().find(x=>String(x.id)===String(id));if(d)openPrivateWhatsapp(d.phone,d.name,'')});renderSettingsDispatcherList();return true
}
function openSettingsDispatcherPage(mode='browse',opts={}){showView('settings');ensureSettingsDispatcherPanel();closeSettingsAddressPage();closeSettingsDriverPage();closeSettingsTransferPage();const view=$('settingsView'),panel=$('atmsDispatcherSettingsPanel');if(!view||!panel)return;setSettingsDispatcherPageActive(true);panel.classList.remove('hidden');panel.classList.remove('atms-mobile-nav-collapsed');if(opts.history!==false)atmsSettingsPushRoute('dispatcher','browse');if(mode==='browse')showSettingsDispatcherBrowse({restoreScroll:!!opts.restoreScroll});if(!opts.restoreScroll)requestAnimationFrame(()=>{try{window.scrollTo(0,0)}catch(_){ }try{view.scrollTop=0}catch(_){ }panel.scrollIntoView({block:'start'})})}
function closeSettingsDispatcherPage(){const panel=$('atmsDispatcherSettingsPanel');setSettingsDispatcherPageActive(false);panel?.classList.add('hidden');['settingsDispatcherEditorView','settingsDispatcherDetailView'].forEach(id=>$(id)?.classList.add('hidden'));$('settingsDispatcherBrowseView')?.classList.remove('hidden');resetSettingsDispatcherForm();renderSettingsDispatcherList();requestAnimationFrame(()=>{try{window.scrollTo(0,0)}catch(_){ }})}

function loadWhatsappSettings(){renderInfoChatSettings();renderDispatcherList();renderDispatcherControls();renderDriverContactList();renderDriverControls();updateBackupUI()}
function cleanPhone(v){return String(v||'').replace(/[^0-9]/g,'')}
function getDriverContacts(){let d=[];try{d=JSON.parse(localStorage.getItem(DRIVER_SETTINGS)||'[]')}catch{}if(!Array.isArray(d))d=[];return d.filter(x=>x&&x.name).map(x=>({id:x.id||('driver-'+Date.now()+Math.random()),name:String(x.name||'').trim(),phone:String(x.phone||''),vehicle:String(x.vehicle||''),note:String(x.note||''),favorite:!!x.favorite,active:x.active!==false}))}
function saveDriverContacts(list){localStorage.setItem(DRIVER_SETTINGS,JSON.stringify(list))}
function resetDriverForm(){['driverContactName','driverContactPhone','driverContactVehicle','driverContactNote','driverContactEditId'].forEach(id=>{const e=$(id);if(e)e.value=''});if($('driverContactFavorite'))$('driverContactFavorite').checked=false;if($('driverContactActive'))$('driverContactActive').checked=true;if($('addDriverContact'))$('addDriverContact').textContent='+ Fahrer speichern'}
function addDriverContact(){const name=$('driverContactName').value.trim(),phone=$('driverContactPhone').value.trim(),vehicle=$('driverContactVehicle').value.trim(),note=$('driverContactNote').value.trim(),favorite=!!$('driverContactFavorite').checked,activeFlag=!!$('driverContactActive').checked,editId=$('driverContactEditId').value.trim();if(!name){alert('Bitte Fahrername eingeben.');return}if(phone&&!cleanPhone(phone)){alert('Bitte eine gültige Telefonnummer eingeben oder das Feld leer lassen.');return}const list=getDriverContacts();const duplicate=list.find(x=>normKey(x.name)===normKey(name)&&x.id!==editId);if(duplicate){alert('Dieser Fahrer ist bereits gespeichert.');return}if(editId){const d=list.find(x=>x.id===editId);if(d)Object.assign(d,{name,phone,vehicle,note,favorite,active:activeFlag})}else{list.push({id:'driver-'+Date.now(),name,phone,vehicle,note,favorite,active:activeFlag})}saveDriverContacts(list);resetDriverForm();renderDriverContactList();renderDriverControls();updateBackupUI();showToast(editId?'Fahrer aktualisiert':'Fahrer gespeichert','ok')}
function editDriverContact(id){const d=getDriverContacts().find(x=>x.id===id);if(!d)return;$('driverContactName').value=d.name;$('driverContactPhone').value=d.phone||'';$('driverContactVehicle').value=d.vehicle||'';$('driverContactNote').value=d.note||'';$('driverContactFavorite').checked=!!d.favorite;$('driverContactActive').checked=d.active!==false;$('driverContactEditId').value=d.id;$('addDriverContact').textContent='Änderungen speichern';$('driverContactName').scrollIntoView({behavior:'smooth',block:'center'})}
function deleteDriverContact(id){const d=getDriverContacts().find(x=>x.id===id);if(!d)return;if(rides.some(r=>normKey(r.driver)===normKey(d.name)&&!(r._bundleMemberIds||[r.id]).every(x=>done.has(x)))){alert(`Dieser Fahrer ist noch offenen Fahrten zugeordnet. Deaktiviere ihn stattdessen oder weise die Fahrten zuerst neu zu.`);return}if(!confirm(`Fahrer „${d.name}“ wirklich löschen?`))return;saveDriverContacts(getDriverContacts().filter(x=>x.id!==id));renderDriverContactList();renderDriverControls();updateBackupUI()}
function toggleDriverFavorite(id){const list=getDriverContacts(),d=list.find(x=>x.id===id);if(!d)return;d.favorite=!d.favorite;saveDriverContacts(list);renderDriverContactList();renderDriverControls()}
function toggleDriverActive(id){const list=getDriverContacts(),d=list.find(x=>x.id===id);if(!d)return;d.active=!d.active;saveDriverContacts(list);renderDriverContactList();renderDriverControls()}
function renderDriverContactList(){const box=$('driverContactList');if(!box)return;const q=normKey(($('driverContactSearch')&&$('driverContactSearch').value)||''),showInactive=!!($('driverShowInactive')&&$('driverShowInactive').checked);let list=getDriverContacts().filter(d=>(showInactive||d.active!==false)&&(!q||[d.name,d.phone,d.vehicle,d.note].some(v=>normKey(v).includes(q))));list.sort((a,b)=>(Number(b.favorite)-Number(a.favorite))||(Number(b.active)-Number(a.active))||a.name.localeCompare(b.name,'de'));box.innerHTML=list.length?list.map(d=>`<div class="dispatcher-item"><div><b>${d.favorite?'⭐ ':''}${esc(d.name)}</b><small>${esc(d.phone||'Keine Telefonnummer')}</small><div class="driver-item-meta">${d.vehicle?`<span class="driver-chip">🚐 ${esc(d.vehicle)}</span>`:''}<span class="driver-chip ${d.active?'active':'inactive'}">${d.active?'🟢 Aktiv':'🔴 Inaktiv'}</span>${d.favorite?'<span class="driver-chip fav">Favorit</span>':''}</div>${d.note?`<div class="driver-note">${esc(d.note)}</div>`:''}</div><div class="dispatcher-item-actions"><button class="mini" type="button" onclick="toggleDriverFavorite('${d.id}')">${d.favorite?'★':'☆'}</button><button class="mini" type="button" onclick="editDriverContact('${d.id}')">✎</button><button class="mini" type="button" onclick="toggleDriverActive('${d.id}')">${d.active?'Pause':'Aktiv'}</button>${cleanPhone(d.phone)?`<a class="mini" href="tel:${cleanPhone(d.phone)}">📞</a>`:''}<button class="mini danger" type="button" onclick="deleteDriverContact('${d.id}')">✕</button></div></div>`).join(''):'<div class="setting-note">Keine passenden Fahrer gefunden.</div>'}
let settingsDriverFilter='all';
function settingsDriverSyncAfterChange(){renderDriverContactList();renderDriverControls();updateBackupUI();updateSettingsHub();renderSettingsDriverList()}
function settingsDriverFieldRow(label,value,opts={}){if(!String(value||'').trim())return'';const v=String(value).trim(),content=opts.tel?`<a href="tel:${esc(cleanPhone(v))}">${esc(v)}</a>`:esc(v);return`<div class="driver-detail-row"><span>${esc(label)}</span><strong>${content}</strong></div>`}
function renderSettingsDriverList(){
  const host=$('settingsDriverList');if(!host)return;const all=getDriverContacts(),q=normKey($('settingsDriverSearch')?.value||''),filter=settingsDriverFilter;
  let list=all.filter(d=>(filter==='active'?d.active!==false:filter==='inactive'?d.active===false:true)&&(!q||[d.name,d.phone,d.vehicle,d.note].some(v=>normKey(v).includes(q))));
  list.sort((a,b)=>(Number(b.favorite)-Number(a.favorite))||(Number(b.active)-Number(a.active))||a.name.localeCompare(b.name,'de'));
  const count=$('settingsDriverPageCount');if(count)count.textContent=`${all.length} gespeicherte Fahrer`;
  const info=$('settingsDriverSearchInfo');if(info)info.textContent=q||filter!=='all'?`${list.length} Treffer von ${all.length}`:`${all.length} Fahrer verfügbar`;
  document.querySelectorAll('#atmsDriverSettingsPanel [data-driver-filter]').forEach(btn=>btn.classList.toggle('active',btn.dataset.driverFilter===filter));
  host.innerHTML=list.length?list.map(d=>`<button type="button" class="driver-compact-item" data-settings-driver-id="${esc(d.id)}"><span class="driver-compact-main"><strong>${d.favorite?'⭐ ':''}${esc(d.name)}</strong><small>${esc(d.vehicle||'Kein Standardfahrzeug')}</small><em class="${d.active!==false?'active':'inactive'}">${d.active!==false?'Aktiv':'Inaktiv'}</em></span><span class="driver-compact-chevron">›</span></button>`).join(''):'<div class="setting-note driver-empty">Keine passenden Fahrer gefunden.</div>';
}
function resetSettingsDriverForm(){['settingsDriverEditId','settingsDriverName','settingsDriverPhone','settingsDriverVehicle','settingsDriverNote'].forEach(id=>{const el=$(id);if(el)el.value=''});if($('settingsDriverFavorite'))$('settingsDriverFavorite').checked=false;if($('settingsDriverActive'))$('settingsDriverActive').checked=true}
function showSettingsDriverBrowse(opts={}){const panel=$('atmsDriverSettingsPanel');if(!panel)return;['settingsDriverBrowseView','settingsDriverEditorView','settingsDriverDetailView'].forEach(id=>$(id)?.classList.add('hidden'));$('settingsDriverBrowseView')?.classList.remove('hidden');renderSettingsDriverList();panel.classList.remove('atms-mobile-nav-collapsed');if(opts.restoreScroll)atmsSettingsSetScroll(atmsSettingsListScroll.driver,'driver');else requestAnimationFrame(()=>panel.scrollIntoView({block:'start'}))}
function showSettingsDriverEditor(mode='new',id='',opts={}){
  const panel=$('atmsDriverSettingsPanel');if(!panel)return;if(opts.history!==false){atmsSettingsRememberScroll('driver');atmsSettingsPushRoute('driver','editor',mode==='edit'?id:'')}resetSettingsDriverForm();const d=mode==='edit'?getDriverContacts().find(x=>String(x.id)===String(id)):null;
  if(d){$('settingsDriverEditId').value=d.id;$('settingsDriverName').value=d.name;$('settingsDriverPhone').value=d.phone||'';$('settingsDriverVehicle').value=d.vehicle||'';$('settingsDriverNote').value=d.note||'';$('settingsDriverFavorite').checked=!!d.favorite;$('settingsDriverActive').checked=d.active!==false}
  const title=$('settingsDriverEditorTitle');if(title)title.textContent=d?'Fahrer bearbeiten':'Neuer Fahrer';['settingsDriverBrowseView','settingsDriverDetailView'].forEach(x=>$(x)?.classList.add('hidden'));$('settingsDriverEditorView')?.classList.remove('hidden');panel.classList.remove('atms-mobile-nav-collapsed');requestAnimationFrame(()=>{panel.scrollIntoView({block:'start'});setTimeout(()=>$('settingsDriverName')?.focus(),80)})
}
function showSettingsDriverDetail(id,opts={}){
  const d=getDriverContacts().find(x=>String(x.id)===String(id)),body=$('settingsDriverDetailBody');if(!d||!body)return;if(opts.history!==false){atmsSettingsRememberScroll('driver');atmsSettingsPushRoute('driver','detail',id)}body.dataset.driverId=d.id;
  body.innerHTML=`<div class="driver-detail-hero"><div class="driver-detail-status ${d.active!==false?'active':'inactive'}">${d.active!==false?'● Aktiv':'● Inaktiv'}</div><h3>${d.favorite?'⭐ ':''}${esc(d.name)}</h3><p>${esc(d.vehicle||'Kein Standardfahrzeug')}</p></div>${settingsDriverFieldRow('Telefon / WhatsApp',d.phone,{tel:!!cleanPhone(d.phone)})}${settingsDriverFieldRow('Standardfahrzeug',d.vehicle)}${settingsDriverFieldRow('Notiz',d.note)}${settingsDriverFieldRow('Favorit',d.favorite?'Ja':'Nein')}`;
  const call=$('settingsDriverCall');if(call){const phone=cleanPhone(d.phone);call.classList.toggle('hidden',!phone);call.href=phone?'tel:'+phone:'#'}
  const fav=$('settingsDriverFavoriteToggle');if(fav)fav.textContent=d.favorite?'★ Favorit entfernen':'☆ Als Favorit markieren';const state=$('settingsDriverActiveToggle');if(state)state.textContent=d.active!==false?'⏸ Deaktivieren':'▶ Aktivieren';const title=$('settingsDriverDetailTitle');if(title)title.textContent=d.name;
  ['settingsDriverBrowseView','settingsDriverEditorView'].forEach(x=>$(x)?.classList.add('hidden'));$('settingsDriverDetailView')?.classList.remove('hidden');$('atmsDriverSettingsPanel')?.classList.remove('atms-mobile-nav-collapsed');requestAnimationFrame(()=>$('atmsDriverSettingsPanel')?.scrollIntoView({block:'start'}))
}
function saveSettingsDriverForm(){
  const editId=String($('settingsDriverEditId')?.value||'').trim(),name=String($('settingsDriverName')?.value||'').trim(),phone=String($('settingsDriverPhone')?.value||'').trim(),vehicle=String($('settingsDriverVehicle')?.value||'').trim(),note=String($('settingsDriverNote')?.value||'').trim(),favorite=!!$('settingsDriverFavorite')?.checked,activeFlag=$('settingsDriverActive')?.checked!==false;
  if(!name){showToast('Bitte Fahrername eingeben','warn');return}if(phone&&!cleanPhone(phone)){showToast('Bitte gültige Telefonnummer eingeben oder Feld leer lassen','warn');return}
  const list=getDriverContacts(),duplicate=list.find(x=>normKey(x.name)===normKey(name)&&String(x.id)!==editId);if(duplicate){showToast('Dieser Fahrer ist bereits gespeichert','warn');return}
  if(editId){const d=list.find(x=>String(x.id)===editId);if(!d){showToast('Fahrer nicht gefunden','warn');return}Object.assign(d,{name,phone,vehicle,note,favorite,active:activeFlag})}else list.push({id:'driver-'+Date.now(),name,phone,vehicle,note,favorite,active:activeFlag});
  saveDriverContacts(list);settingsDriverSyncAfterChange();resetSettingsDriverForm();atmsSettingsReturnToBrowse('driver');showToast(editId?'Fahrer aktualisiert':'Fahrer gespeichert','ok')
}
function toggleSettingsDriverFavorite(){const id=$('settingsDriverDetailBody')?.dataset.driverId,list=getDriverContacts(),d=list.find(x=>String(x.id)===String(id));if(!d)return;d.favorite=!d.favorite;saveDriverContacts(list);settingsDriverSyncAfterChange();showSettingsDriverDetail(id)}
function toggleSettingsDriverActive(){const id=$('settingsDriverDetailBody')?.dataset.driverId,list=getDriverContacts(),d=list.find(x=>String(x.id)===String(id));if(!d)return;d.active=!d.active;saveDriverContacts(list);settingsDriverSyncAfterChange();showSettingsDriverDetail(id)}
function deleteSettingsDriver(){
  const id=$('settingsDriverDetailBody')?.dataset.driverId,d=getDriverContacts().find(x=>String(x.id)===String(id));if(!d)return;
  if(rides.some(r=>normKey(r.driver)===normKey(d.name)&&!(r._bundleMemberIds||[r.id]).every(x=>done.has(x)))){alert('Dieser Fahrer ist noch offenen Fahrten zugeordnet. Deaktiviere ihn stattdessen oder weise die Fahrten zuerst neu zu.');return}
  if(!confirm(`Fahrer „${d.name}“ wirklich löschen?`))return;saveDriverContacts(getDriverContacts().filter(x=>String(x.id)!==String(id)));settingsDriverSyncAfterChange();atmsSettingsReturnToBrowse('driver');showToast('Fahrer gelöscht','ok')
}
function ensureSettingsDriverPanel(){
  const view=$('settingsView'),host=$('settingsToolsHost');if(!view)return false;let panel=$('atmsDriverSettingsPanel');if(panel)return true;
  panel=document.createElement('section');panel.id='atmsDriverSettingsPanel';panel.dataset.atmsP95Gate3Panel='1';panel.className='settings-driver-page hidden';
  panel.innerHTML=`<div class="settings-subpage-head atms-mobile-topbar"><button type="button" id="settingsDriverBackSettings" class="settings-back-btn" aria-label="Zurück zu Einstellungen">‹</button><div class="atms-mobile-title"><h2>🚗 Fahrer</h2><small id="settingsDriverPageCount">0 gespeicherte Fahrer</small></div><div class="atms-mobile-head-actions"><button type="button" id="settingsDriverHeadSearch" class="atms-mobile-icon-btn" aria-label="Fahrer suchen">⌕</button><button type="button" id="settingsDriverHeadAdd" class="atms-mobile-icon-btn" aria-label="Neuer Fahrer">＋</button></div></div>
  <div id="settingsDriverBrowseView"><div class="driver-toolbar"><input id="settingsDriverSearch" class="setting-input" placeholder="Fahrer suchen …" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false"><button type="button" id="settingsDriverNew" class="driver-new-btn">+ Neuer Fahrer</button></div><div class="driver-filter-tabs"><button type="button" data-driver-filter="all" class="active">Alle</button><button type="button" data-driver-filter="active">Aktiv</button><button type="button" data-driver-filter="inactive">Inaktiv</button></div><div id="settingsDriverSearchInfo" class="driver-search-info">Fahrersuche bereit.</div><div id="settingsDriverList" class="driver-compact-list"></div></div>
  <div id="settingsDriverEditorView" class="hidden"><div class="address-inner-head atms-mobile-topbar atms-mobile-innerbar"><button type="button" id="settingsDriverEditorBack" class="settings-back-btn" aria-label="Zurück">‹</button><h3 id="settingsDriverEditorTitle">Neuer Fahrer</h3></div><input id="settingsDriverEditId" type="hidden"><label class="setting-label" for="settingsDriverName">Fahrername</label><input id="settingsDriverName" class="setting-input" placeholder="z. B. Schimmi" autocomplete="off"><label class="setting-label" for="settingsDriverPhone">Telefon-/WhatsApp-Nummer</label><input id="settingsDriverPhone" class="setting-input" inputmode="tel" placeholder="z. B. +4915112345678"><label class="setting-label" for="settingsDriverVehicle">Standardfahrzeug (optional)</label><input id="settingsDriverVehicle" class="setting-input" placeholder="z. B. Van"><div class="driver-editor-checks"><label class="driver-check"><input id="settingsDriverFavorite" type="checkbox"> ⭐ Favorit</label><label class="driver-check"><input id="settingsDriverActive" type="checkbox" checked> 🟢 Aktiv</label></div><label class="setting-label" for="settingsDriverNote">Notiz (optional)</label><textarea id="settingsDriverNote" class="setting-input driver-note-input" placeholder="z. B. Bevorzugt Anruf statt WhatsApp"></textarea><div class="driver-editor-actions"><button type="button" id="settingsDriverSave" class="act dark">Fahrer speichern</button></div></div>
  <div id="settingsDriverDetailView" class="hidden"><div class="address-inner-head atms-mobile-topbar atms-mobile-innerbar"><button type="button" id="settingsDriverDetailBack" class="settings-back-btn" aria-label="Zurück">‹</button><h3 id="settingsDriverDetailTitle">Fahrerdetails</h3></div><div id="settingsDriverDetailBody" class="driver-detail-body"></div><div class="driver-detail-actions"><a id="settingsDriverCall" class="act dark hidden" href="#">📞 Anrufen</a><button type="button" id="settingsDriverFavoriteToggle" class="act">☆ Als Favorit markieren</button><button type="button" id="settingsDriverActiveToggle" class="act">⏸ Deaktivieren</button><button type="button" id="settingsDriverEdit" class="act dark">✎ Bearbeiten</button><button type="button" id="settingsDriverDelete" class="act danger">🗑 Löschen</button></div></div>`;
  if(host)host.appendChild(panel);else view.appendChild(panel);
  $('settingsDriverBackSettings')?.addEventListener('click',atmsSettingsBack);$('settingsDriverNew')?.addEventListener('click',()=>showSettingsDriverEditor('new'));$('settingsDriverEditorBack')?.addEventListener('click',atmsSettingsBack);$('settingsDriverDetailBack')?.addEventListener('click',atmsSettingsBack);$('settingsDriverSave')?.addEventListener('click',saveSettingsDriverForm);$('settingsDriverHeadSearch')?.addEventListener('click',()=>atmsSettingsFocusBrowse('driver'));$('settingsDriverHeadAdd')?.addEventListener('click',()=>showSettingsDriverEditor('new'));
  $('settingsDriverSearch')?.addEventListener('input',renderSettingsDriverList);panel.querySelector('.driver-filter-tabs')?.addEventListener('click',e=>{const btn=e.target.closest('[data-driver-filter]');if(!btn)return;settingsDriverFilter=btn.dataset.driverFilter||'all';renderSettingsDriverList()});$('settingsDriverList')?.addEventListener('click',e=>{const row=e.target.closest('[data-settings-driver-id]');if(row)showSettingsDriverDetail(row.dataset.settingsDriverId)});
  $('settingsDriverFavoriteToggle')?.addEventListener('click',toggleSettingsDriverFavorite);$('settingsDriverActiveToggle')?.addEventListener('click',toggleSettingsDriverActive);$('settingsDriverEdit')?.addEventListener('click',()=>{const id=$('settingsDriverDetailBody')?.dataset.driverId;if(id)showSettingsDriverEditor('edit',id)});$('settingsDriverDelete')?.addEventListener('click',deleteSettingsDriver);renderSettingsDriverList();return true
}
function openSettingsDriverPage(mode='browse',opts={}){showView('settings');ensureSettingsDriverPanel();closeSettingsAddressPage();closeSettingsTransferPage();const view=$('settingsView'),panel=$('atmsDriverSettingsPanel');if(!view||!panel)return;setSettingsDriverPageActive(true);panel.classList.remove('hidden');panel.classList.remove('atms-mobile-nav-collapsed');if(opts.history!==false)atmsSettingsPushRoute('driver','browse');if(mode==='browse')showSettingsDriverBrowse({restoreScroll:!!opts.restoreScroll});if(!opts.restoreScroll)requestAnimationFrame(()=>{try{window.scrollTo(0,0)}catch(_){ }try{view.scrollTop=0}catch(_){ }panel.scrollIntoView({block:'start'})})}
function closeSettingsDriverPage(){const panel=$('atmsDriverSettingsPanel');setSettingsDriverPageActive(false);panel?.classList.add('hidden');['settingsDriverEditorView','settingsDriverDetailView'].forEach(id=>$(id)?.classList.add('hidden'));$('settingsDriverBrowseView')?.classList.remove('hidden');resetSettingsDriverForm();settingsDriverFilter='all';renderSettingsDriverList();requestAnimationFrame(()=>{try{window.scrollTo(0,0)}catch(_){ }})}
function availableDrivers(){const byName=new Map();getDriverContacts().filter(d=>d.active!==false).forEach(d=>byName.set(normKey(d.name),{...d}));rides.forEach(r=>{const name=String(r.driver||'').trim();if(!name)return;const k=normKey(name);if(!byName.has(k))byName.set(k,{id:'ride-driver-'+k,name,phone:first(r.driverPhone,r.fahrerTelefon,r.fahrer_telefon,r.phone,r.telefon,r.tel),vehicle:r.vehicle||'',favorite:false,active:true})});return [...byName.values()].sort((a,b)=>(Number(b.favorite)-Number(a.favorite))||a.name.localeCompare(b.name,'de'))}
function selectedDriverContact(){const sel=$('cockpitDriverSelect');const list=availableDrivers();return list.find(x=>x.id===(sel&&sel.value))||list.find(x=>active&&normKey(x.name)===normKey(active.driver))||list[0]||null}
function renderDriverControls(){const sel=$('cockpitDriverSelect');if(!sel)return;const list=availableDrivers();const preferred=list.find(x=>active&&normKey(x.name)===normKey(active.driver));const current=preferred||(sel.value&&list.find(x=>x.id===sel.value))||list[0];sel.innerHTML=list.length?list.map(d=>`<option value="${d.id}" ${current&&d.id===current.id?'selected':''}>👤 ${esc(d.name)}</option>`).join(''):'<option value="">Kein Fahrer</option>';if(current)sel.value=current.id;const d=selectedDriverContact(),phone=cleanPhone(d&&d.phone);$('cockpitDriverInfo').textContent=d?[d.name,d.phone||'Telefonnummer fehlt',d.vehicle||'',d.note||''].filter(Boolean).join(' · '):'Bitte Fahrer in den Einstellungen anlegen.';$('cockpitDriverCallBtn').href=phone?'tel:'+phone:'#';$('cockpitDriverCallBtn').classList.toggle('hidden',!phone);$('cockpitDriverMessageBtn').disabled=!phone}
function privateRideMessage(r,targetLabel){
  if(!r)return'';
  const lines=[];
  lines.push(`Hallo${targetLabel?', '+targetLabel:''},`);
  lines.push('');
  lines.push(`Zeit: ${effectiveTime(r)||'–'} Uhr`);
  if(r.driver)lines.push(`Fahrer: ${r.driver}`);
  if(r.flightNumber)lines.push(`Flug: ${r.flightNumber}`);
  if(r.flightLocation)lines.push(`Flugort: ${r.flightLocation}${r.iata?` (${r.iata})`:''}`);
  lines.push(`Abholung: ${ridePickupSummary(r)||'–'}`);
  lines.push(`Ziel: ${rideDestinationSummary(r)||'–'}`);
  if(r.persons)lines.push(`Personen: ${r.persons}`);
  if(r.vehicle)lines.push(`Fahrzeug: ${r.vehicle}`);
  return lines.join('\n');
}
function openPrivateWhatsapp(phone,label,text=''){
  const p=cleanPhone(phone);
  if(!p){alert(`Für ${label||'diesen Kontakt'} ist keine Telefonnummer gespeichert.`);return}
  const encoded=encodeURIComponent(text||'');
  const mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const url=mobile
    ? `whatsapp://send?phone=${p}${encoded?`&text=${encoded}`:''}`
    : `https://api.whatsapp.com/send?phone=${p}${encoded?`&text=${encoded}`:''}`;
  window.location.href=url;
}
function openDispatcherMessage(){
  const d=getCurrentDispatcher();
  const text=infoStatusMessage(active);
  if(!text){alert('Für diese Fahrt konnte kein Dispo-Text erstellt werden.');return}
  openPrivateWhatsapp(d&&d.phone,d&&d.name||'den Disponenten',text);
}
function openDriverMessage(){
  const d=selectedDriverContact();
  openPrivateWhatsapp(d&&d.phone,d&&d.name||'den Fahrer',privateRideMessage(active,d&&d.name||''));
}
function infoStatusMessage(r){
  if(!r)return'';
  const direction=r.bundleDirection||directionOf(r);
  if(direction==='hotels_to_airport')return ridePickupSummary(r);
  if(direction==='airport_to_hotels')return rideDestinationSummary(r);
  return ridePickupSummary(r)||rideDestinationSummary(r);
}
function openInfoStatus(){
  if(!active)return;
  const text=infoStatusMessage(active);
  if(!text){alert('Für diese Fahrt konnte kein Info-/Status-Text erstellt werden.');return}
  const settings=getInfoChatSettings();
  if(settings.type==='single'){
    openPrivateWhatsapp(settings.phone,settings.name,text);
    return;
  }
  const encoded=encodeURIComponent(text);
  const mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  window.location.href=mobile?`whatsapp://send?text=${encoded}`:`https://api.whatsapp.com/send?text=${encoded}`;
}
function whatsappMessage(r){return infoStatusMessage(r)}
function openWhatsapp(){openInfoStatus()}
// CORE-004L BACKUP HOTFIX 06.09.2026: alle lokalen ATMS-Bereiche sicher in das Backup übernehmen.
function atmsStorageSnapshot(){
  const snapshot={};
  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i);
    if(key&&key.startsWith('atms_')) snapshot[key]=localStorage.getItem(key)??'';
  }
  return snapshot;
}
function backupPayload(){
  return {
    format:'ATMS_BACKUP',
    formatVersion:1,
    app:'ATMS PRO',
    appVersion:'14.6.8 CR-004.3',
    createdAt:new Date().toISOString(),
    storage:atmsStorageSnapshot()
  };
}
function downloadTextFile(text,name,type){
  const blob=new Blob([text],{type:type||'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function browserDownloadBlob(blob,name){
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function blobToBase64Payload(blob){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>{const value=String(reader.result||''),comma=value.indexOf(',');if(comma<0){reject(new Error('Exportdaten konnten nicht vorbereitet werden.'));return}resolve(value.slice(comma+1))};
    reader.onerror=()=>reject(reader.error||new Error('Exportdaten konnten nicht gelesen werden.'));
    reader.readAsDataURL(blob);
  });
}
async function saveExportBlob(blob,name,type){
  const bridge=window.ATMSNativeFileExport;
  if(bridge&&typeof bridge.saveBase64File==='function'){
    const payload=await blobToBase64Payload(blob);
    await bridge.saveBase64File(payload,name,type||blob.type||'application/octet-stream');
    return 'native';
  }
  browserDownloadBlob(blob,name);
  return 'browser';
}
function backupFileName(){
  const d=new Date(),p=n=>String(n).padStart(2,'0');
  return `ATMS_Backup_${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}.atms`;
}
function setBackupStatus(message,type){
  const el=$('backupStatus');if(el){el.textContent=message;el.className='backup-status '+(type||'');}
}
function updateBackupUI(){
  const ds=getDispatchers().length;
  let rc=0;try{rc=JSON.parse(localStorage.getItem(KEY)||'[]').length||0}catch{}
  const dc=$('backupDispatcherCount'),rr=$('backupRideCount');if(dc)dc.textContent=ds;if(rr)rr.textContent=rc;
  let meta={};try{meta=JSON.parse(localStorage.getItem(BACKUP_META)||'{}')}catch{}
  const info=$('infoBackupStatus');
  if(meta.createdAt){
    const dt=new Date(meta.createdAt);const text='Letzte Sicherung: '+dt.toLocaleDateString('de-DE')+' · '+dt.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});
    setBackupStatus(text,'ok');if(info){info.textContent=dt.toLocaleDateString('de-DE')+' · '+dt.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});info.classList.remove('warn');info.classList.add('status');}
  }else{setBackupStatus('Noch keine Sicherung erstellt.','warn');if(info){info.textContent='Noch keine Sicherung';info.classList.add('warn');info.classList.remove('status');}}
}
async function exportAtmsBackup(){
  try{
    // P96/S1: Eine defekte Sicherung mit 0 Fahrten bei vorhandenen 140 Fahrten
    // darf nicht als erfolgreich exportiert werden.
    const ridesRaw=localStorage.getItem(KEY);
    if(ridesRaw===null)throw Error('Fahrten-Speicher fehlt. Backup blockiert, damit keine unvollstaendige Sicherung entsteht.');
    let storedRides,storedDone;
    try{storedRides=JSON.parse(ridesRaw);storedDone=JSON.parse(localStorage.getItem(DONE)||'[]')}catch(_){throw Error('Fahrten-/Status-Speicher ungueltig. Backup blockiert.');}
    if(!Array.isArray(storedRides)||!Array.isArray(storedDone)||storedRides.length!==rides.length)
      throw Error(`Fahrten-Speicher nicht synchron: App ${rides.length}, gespeichert ${Array.isArray(storedRides)?storedRides.length:'ungueltig'}. Backup blockiert.`);
    if(storedDone.length!==done.size||!storedDone.every(id=>done.has(id)))
      throw Error('Erledigt-Status noch nicht vollstaendig gespeichert. Backup blockiert.');
    const payload=backupPayload();
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/octet-stream'});
    await saveExportBlob(blob,backupFileName(),'application/octet-stream');
    localStorage.setItem(BACKUP_META,JSON.stringify({createdAt:payload.createdAt,appVersion:payload.appVersion}));
    updateBackupUI();
  }catch(e){
    const message=String(e?.message||e||'Unbekannter Fehler');
    if(/abgebrochen/i.test(message)){
      setBackupStatus('Backup-Speichern abgebrochen.','warn');
      return;
    }
    setBackupStatus('Backup konnte nicht erstellt werden: '+message,'warn');
  }
}
function chooseBackupFile(){const input=$('backupFileInput');if(input){input.value='';input.click();}}
async function importAtmsBackup(file){
  try{
    const obj=JSON.parse(await file.text());
    if(!obj||obj.format!=='ATMS_BACKUP'||obj.formatVersion!==1||!obj.storage||typeof obj.storage!=='object')
      throw Error('Keine gueltige ATMS-Backup-Datei (Version 1).');
    // P96/S1: Ein Snapshot ohne Fahrten-Key ist KEIN vollstaendiges Backup.
    const rideRaw=obj.storage[KEY],doneRaw=obj.storage[DONE];
    if(typeof rideRaw!=='string'||typeof doneRaw!=='string')
      throw Error('Backup unvollstaendig: Fahrten oder Erledigt-Status fehlen. Wiederherstellung abgebrochen.');
    let incomingRides,incomingDone;
    try{incomingRides=JSON.parse(rideRaw);incomingDone=JSON.parse(doneRaw)}catch(_){throw Error('Backup enthaelt ungueltige Fahrten-/Statusdaten.');}
    if(!Array.isArray(incomingRides)||!Array.isArray(incomingDone)||new Set(incomingRides.map(r=>String(r?.id||''))).size!==incomingRides.length)
      throw Error('Backup-Fahrten sind fehlerhaft oder enthalten doppelte IDs.');
    const keys=Object.keys(obj.storage).filter(k=>k.startsWith('atms_'));
    const existingCount=(()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]').length}catch(_){return 0}})();
    const countWarning=incomingRides.length<existingCount
      ? `\n\nACHTUNG: Dieses Backup enthaelt nur ${incomingRides.length} Fahrten; aktuell sind ${existingCount} Fahrten gespeichert. Du wuerdest einen aelteren Bestand wiederherstellen.` : '';
    if(!confirm(`Backup vom ${obj.createdAt?new Date(obj.createdAt).toLocaleString('de-DE'):'unbekannten Datum'} wiederherstellen?\n\n${incomingRides.length} Fahrten, ${keys.length} Bereiche.${countWarning}`))return;
    const durableBefore=await syncPersistenceDurableShadow('before-backup-restore');
    if(!durableBefore)throw Error('Wiederherstellung blockiert: Aktueller Bestand konnte nicht in IndexedDB gesichert werden.');
    const before={};for(const key of keys)before[key]=localStorage.getItem(key);
    const touched=[];
    try{
      for(const key of keys){
        const value=String(obj.storage[key]??'');
        localStorage.setItem(key,value);
        touched.push(key);
        if(localStorage.getItem(key)!==value)throw Error('Backup-Wiederherstellung: Schreibpruefung bei '+key+' fehlgeschlagen.');
      }
      // Nur wenn ALLE lokalen Bereiche verifiziert sind, den Durable-Shadow umstellen.
      const durableAfter=await syncPersistenceDurableShadow('after-backup-restore-verified');
      if(!durableAfter)throw Error('IndexedDB-Bestaetigung der Wiederherstellung fehlgeschlagen.');
      // Storage V2 bleibt in Phase 1 rein additiv: Fehler blockieren keine bestaetigte Wiederherstellung.
      void syncStorageV2Phase1('after-backup-restore-verified');
    }catch(writeError){
      let rollbackOk=true;
      for(const key of touched.reverse()){
        try{
          if(before[key]===null)localStorage.removeItem(key);else localStorage.setItem(key,before[key]);
          if(localStorage.getItem(key)!==before[key])rollbackOk=false;
        }catch(_){rollbackOk=false}
      }
      // Bei fehlgeschlagenem Rollback den letzten verifizierten IndexedDB-Stand
      // NICHT durch einen moeglichen Teilbestand ueberschreiben.
      if(rollbackOk)await syncPersistenceDurableShadow('failed-backup-restore-rollback');
      persistAudit('backup_restore_failed',{rollbackOk,message:String(writeError?.message||writeError)});
      throw Error(rollbackOk
        ? 'Wiederherstellung abgebrochen; alter Stand wieder eingesetzt. '+String(writeError?.message||writeError)
        : 'KRITISCH: Wiederherstellung unvollstaendig, automatisches Zuruecksetzen gescheitert. App NICHT neu starten. Externes Backup aufbewahren.');
    }
    try{localStorage.setItem(BACKUP_META,JSON.stringify({createdAt:new Date().toISOString(),restoredFrom:obj.createdAt||'',appVersion:obj.appVersion||''}))}catch(_){ }
    alert('Backup vollstaendig wiederhergestellt und in beiden Speichern bestaetigt. ATMS wird neu geladen.');
    location.reload();
  }catch(e){setBackupStatus('Wiederherstellung fehlgeschlagen: '+e.message,'warn');alert(e.message||'Backup konnte nicht importiert werden.');}
}
function resetAtmsData(){
  if(!confirm('Wirklich alle lokal gespeicherten ATMS-Daten löschen?\n\nDisponenten, Fahrten, Erledigt-Status und Einstellungen werden entfernt.'))return;
  if(!confirm('Letzte Sicherheitsabfrage: Daten endgültig zurücksetzen?'))return;
  const keys=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('atms_'))keys.push(k)}keys.forEach(k=>localStorage.removeItem(k));
  localStorage.removeItem(PERSIST_SAFETY_KEY);localStorage.removeItem(PERSIST_AUDIT_KEY);clearPersistenceDurableShadow();
  alert('ATMS-Daten wurden zurückgesetzt.');location.reload();
}


/* FLIGHT-001 – Gemini-Flugprüfung (halbautomatisch, ohne API) */
function flightAirportIataFromPlace(value){
  const raw=String(value||'').trim();
  if(!raw)return'';
  const upper=raw.toUpperCase();
  const n=normKey(raw);

  // Explizite, ausgeschriebene Flughafennamen bleiben sicher erkennbar.
  if(n.includes('flughafen düsseldorf')||n.includes('flughafen duesseldorf')||n.includes('düsseldorf airport')||n.includes('duesseldorf airport'))return'DUS';
  if(n.includes('flughafen köln')||n.includes('flughafen koeln')||n.includes('cologne bonn airport')||n.includes('köln/bonn')||n.includes('koeln/bonn'))return'CGN';

  // Ein reiner IATA-Code ist eindeutig.
  const exact=upper.match(/^([A-Z]{3})$/);
  if(exact)return exact[1];

  // Generisch: Drei-Buchstaben-IATA nur dann übernehmen, wenn der Text
  // eindeutig einen Flughafenbereich bezeichnet. Dadurch wird z. B.
  // "CGN Vorfeld" erkannt, aber "NH Nord DUS" NICHT als Flughafen.
  if(/\b(?:AIRPORT|FLUGHAFEN|VORFELD|AIRSIDE)\b/i.test(raw)){
    const tokens=upper.match(/\b[A-Z]{3}\b/g)||[];
    if(tokens.length===1)return tokens[0];
  }
  return'';
}
function flightAirportContext(r){
  const pickupIata=flightAirportIataFromPlace(r?.pickup||r?.abholort||'');
  const destinationIata=flightAirportIataFromPlace(r?.destination||r?.zielort||r?.ziel||'');
  const sourceLock=String(r?.sourcePlanAirportIata||'').trim().toUpperCase();
  // P21: Quell-Airport darf niemals still mit einem widersprechenden Routen-Airport vermischt werden.
  if(sourceLock&&((pickupIata&&pickupIata!==sourceLock)||(destinationIata&&destinationIata!==sourceLock)))return{airportIata:'',direction:'unknown',sourceConflict:true};
  if(pickupIata&&!destinationIata)return{airportIata:pickupIata,direction:'arrival',sourcePlanAirportIata:sourceLock};
  if(!pickupIata&&destinationIata)return{airportIata:destinationIata,direction:'departure',sourcePlanAirportIata:sourceLock};
  return{airportIata:'',direction:'unknown',sourcePlanAirportIata:sourceLock};
}
function flightDirectionForGemini(r){return flightAirportContext(r).direction}
function flightAirportForGemini(r){return flightAirportContext(r).airportIata}

/* FLIGHT-CACHE-001 – geprüfte Gemini-Flugorte dauerhaft für exakt dieselbe Planfahrt sichern */
function flightCacheNumber(value){
  let v=String(value||'').trim().toUpperCase().replace(/\s+/g,'');
  if(/^0S\d{1,4}[A-Z]?$/.test(v))v='OS'+v.slice(2);
  return v;
}
function berlinDate(value=new Date()){
  try{
    return new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));
  }catch(_){
    const d=new Date(value),p=n=>String(n).padStart(2,'0');
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
  }
}
function shiftAtmsIsoDate(value,days=0){
  const m=String(value||'').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!m)return String(value||'').trim();
  const d=new Date(Date.UTC(Number(m[1]),Number(m[2])-1,Number(m[3])));
  d.setUTCDate(d.getUTCDate()+Number(days||0));
  return d.toISOString().slice(0,10);
}
function atmsClockMinutes(value){
  const m=String(value||'').trim().match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  return m?Number(m[1])*60+Number(m[2]):null;
}
function flightAirportEventDateContext(r){
  const rideDate=String(r?.date||'').trim();
  const rideClock=first(dispoTimeOf(r),planTimeOf(r));
  const flightClock=first(r?.flightTime,r?.flugzeit,r?.flight_time);
  const rideMinutes=atmsClockMinutes(rideClock);
  const flightMinutes=atmsClockMinutes(flightClock);
  let dateShift=0;
  if(/^\d{4}-\d{2}-\d{2}$/.test(rideDate)&&rideMinutes!==null&&flightMinutes!==null){
    const rawDelta=flightMinutes-rideMinutes;
    if(rawDelta < -720)dateShift=1;
    else if(rawDelta > 720)dateShift=-1;
  }
  const airportEventDate=rideDate?shiftAtmsIsoDate(rideDate,dateShift):'';
  return {rideDate,airportEventDate,dateShift,derived:dateShift!==0,rideClock,flightClock};
}
window.ATMSAirportEventDateContextForRide=flightAirportEventDateContext;
function flightRideFingerprint(r){
  const parts=[
    r?.sourceFile||'',
    Number(r?.sourceRow||0)||'',
    planTimeOf(r)||'',
    r?.pickup||'',
    r?.destination||'',
    flightCacheNumber(r?.flightNumber||r?.arrivalFlight||r?.departureFlight),
    flightDirectionForGemini(r),
    r?.flightTime||'',
    r?.driver||'',
    Number(r?.persons||0)||''
  ];
  return parts.map(v=>normKey(v)).join('|');
}
function getFlightCache(){
  try{
    const list=JSON.parse(localStorage.getItem(FLIGHT_CACHE)||'[]');
    return Array.isArray(list)?list:[];
  }catch(_){return[]}
}
function getVerifiedFlightCacheBackup(){
  try{
    const list=JSON.parse(localStorage.getItem(FLIGHT_CACHE_BACKUP)||'[]');
    return Array.isArray(list)?list:[];
  }catch(_){return[]}
}
function flightCacheEntryTuple(x){
  return {
    flight:flightCacheNumber(x?.flightNumber),
    date:String(x?.date||'').trim(),
    airportEventDate:String(x?.airportEventDate||x?.date||'').trim(),
    direction:String(x?.direction||'unknown').trim().toLowerCase(),
    flightTime:String(x?.flightTime||'').trim()
  };
}
function flightCacheTupleKey(x){
  const t=flightCacheEntryTuple(x);
  return [t.flight,t.date,t.airportEventDate,t.direction,t.flightTime].join('|');
}
function isVerifiedFlightCacheEntry(x){
  return x?.verified===true&&Boolean(String(x?.flightLocation||'').trim());
}
function saveVerifiedFlightCacheBackup(list){
  const verified=(Array.isArray(list)?list:[]).filter(isVerifiedFlightCacheEntry);
  const byTuple=new Map();
  verified
    .slice()
    .sort((a,b)=>new Date(b?.checkedAt||0)-new Date(a?.checkedAt||0))
    .forEach(entry=>{const key=flightCacheTupleKey(entry);if(key&&!byTuple.has(key))byTuple.set(key,entry)});
  safePersistentSetItem(FLIGHT_CACHE_BACKUP,JSON.stringify(Array.from(byTuple.values()).slice(0,400)),'verified-flight-backup');
}
function saveFlightCache(list){
  const safe=(Array.isArray(list)?list:[]).slice(0,400);
  safePersistentSetItem(FLIGHT_CACHE,JSON.stringify(safe),'flight-cache');
  const merged=[...getVerifiedFlightCacheBackup(),...safe.filter(isVerifiedFlightCacheEntry)];
  saveVerifiedFlightCacheBackup(merged);
}
function recoverVerifiedFlightCache(){
  const backup=getVerifiedFlightCacheBackup();
  if(!backup.length)return 0;
  let cache=getFlightCache(),changed=0;
  for(const entry of backup){
    if(!isVerifiedFlightCacheEntry(entry))continue;
    const key=flightCacheTupleKey(entry);
    const already=cache.some(x=>flightCacheTupleKey(x)===key&&isVerifiedFlightCacheEntry(x));
    if(!already){cache.unshift(entry);changed++;}
  }
  if(changed){
    safePersistentSetItem(FLIGHT_CACHE,JSON.stringify(cache.slice(0,400)),'flight-cache-recovery');
  }
  return changed;
}
function upsertFlightCache(entries){
  if(!Array.isArray(entries)||!entries.length)return;
  let cache=getFlightCache();
  for(const entry of entries){
    const fp=String(entry.fingerprint||'');
    const rideId=String(entry.rideId||'');
    const incomingTuple=flightCacheTupleKey(entry);
    const incomingVerified=isVerifiedFlightCacheEntry(entry);

    // CORE-005T: Ein unsicherer/leerer Treffer darf einen bereits verifizierten
    // Eintrag desselben konkreten Fluges niemals verdrängen. Außerdem werden
    // gleiche rideId/fingerprint-Werte nur innerhalb desselben Datum/Richtung/Zeit-Tupels ersetzt.
    const protectedVerified=cache.some(x=>{
      if(!isVerifiedFlightCacheEntry(x)||flightCacheTupleKey(x)!==incomingTuple)return false;
      const sameFingerprint=fp&&String(x.fingerprint||'')===fp;
      const sameRide=rideId&&String(x.rideId||'')===rideId;
      return sameFingerprint||sameRide;
    });
    if(!incomingVerified&&protectedVerified)continue;

    cache=cache.filter(x=>{
      if(flightCacheTupleKey(x)!==incomingTuple)return true;
      const sameFingerprint=fp&&String(x.fingerprint||'')===fp;
      const sameRide=rideId&&String(x.rideId||'')===rideId;
      return !(sameFingerprint||sameRide);
    });
    cache.unshift(entry);
  }
  saveFlightCache(cache);
}
function flightCacheMatchTuple(r){
  const flight=flightCacheNumber(r?.flightNumber||r?.arrivalFlight||r?.departureFlight);
  const date=String(r?.date||'').trim();
  const eventContext=flightAirportEventDateContext(r);
  const airportEventDate=String(eventContext.airportEventDate||date).trim();
  const direction=String(flightDirectionForGemini(r)||'unknown').trim().toLowerCase();
  const airportIata=String(flightAirportForGemini(r)||'').trim().toUpperCase();
  const flightTime=String(first(r?.flightTime,r?.flugzeit,r?.flight_time)||'').trim();
  return {flight,date,airportEventDate,airportEventDateDerived:Boolean(eventContext.derived),direction,airportIata,flightTime};
}
function findFlightCacheForRide(r){
  const key=flightCacheMatchTuple(r);
  // CORE-005Q: Ohne konkreten Plantag wird bewusst KEIN persistenter Treffer angewendet.
  // Dadurch kann niemals eine Pruefung eines anderen Tages in einen neuen Import rutschen.
  if(!key.flight||!key.date)return null;
  const candidates=getFlightCache().filter(x=>{
    if(!x)return false;
    const cacheFlight=flightCacheNumber(x.flightNumber);
    const cacheDate=String(x.date||'').trim();
    const cacheAirportEventDate=String(x.airportEventDate||cacheDate).trim();
    const cacheDirection=String(x.direction||'unknown').trim().toLowerCase();
    const cacheAirportIata=String(x.airportIata||'').trim().toUpperCase();
    const cacheFlightTime=String(x.flightTime||'').trim();

    // Bestehende ältere DUS-Cache-Einträge haben noch kein airportIata.
    // Diese bleiben für DUS kompatibel, dürfen aber niemals auf CGN oder
    // einen anderen Flughafen übertragen werden.
    if(cacheAirportIata&&key.airportIata&&cacheAirportIata!==key.airportIata)return false;
    if(!cacheAirportIata&&key.airportIata&&key.airportIata!=='DUS')return false;
    if(cacheAirportIata&&!key.airportIata)return false;

    return cacheFlight===key.flight
      && cacheDate===key.date
      && cacheAirportEventDate===key.airportEventDate
      && cacheDirection===key.direction
      && cacheFlightTime===key.flightTime;
  });
  candidates.sort((a,b)=>new Date(b.checkedAt||0)-new Date(a.checkedAt||0));
  return candidates[0]||null;
}
function applyFlightCacheToRides(source){
  let changed=0,verifiedRestored=0,manualRestored=0;
  const out=(Array.isArray(source)?source:[]).map(r=>{
    const hit=findFlightCacheForRide(r);
    if(!hit)return r;
    const verified=hit.verified===true && Boolean(String(hit.flightLocation||'').trim());
    const sourceConfirmed=hit.sourceConfirmed===true && !verified && Boolean(String(hit.flightLocation||'').trim());
    const accepted=verified||sourceConfirmed;
    const nextLocation=String(hit.flightLocation||'').trim();
    const nextIata=String(hit.iata||'').trim().toUpperCase();
    const next={...r};
    let rowChanged=false;

    if(accepted){
      if(String(next.flightLocation||'').trim()!==nextLocation){next.flightLocation=nextLocation;rowChanged=true;}
      if(String(next.iata||'').trim().toUpperCase()!==nextIata){next.iata=nextIata;rowChanged=true;}
      const restoredConfidence=verified?'verified':'source_confirmed';
      const restoredNeedsManual=Boolean(!verified||hit.conflict);
      if(next.flightCheckConfidence!==restoredConfidence){next.flightCheckConfidence=restoredConfidence;rowChanged=true;}
      if(next.flightNeedsManualCheck!==restoredNeedsManual){next.flightNeedsManualCheck=restoredNeedsManual;rowChanged=true;}
      if(Boolean(next.flightConflict)!==Boolean(hit.conflict)){next.flightConflict=Boolean(hit.conflict);rowChanged=true;}
      if(verified&&!hit.conflict)verifiedRestored++;else manualRestored++;
    }else{
      // Unsichere Pruefungen duerfen den vorhandenen Planort niemals loeschen oder ersetzen.
      // Der manuelle Hinweis wird aber sofort wiederhergestellt, damit der Zaehler nach Neuimport stimmt.
      if(next.flightCheckConfidence!=='uncertain'){next.flightCheckConfidence='uncertain';rowChanged=true;}
      if(next.flightNeedsManualCheck!==true){next.flightNeedsManualCheck=true;rowChanged=true;}
      if(Boolean(next.flightConflict)!==Boolean(hit.conflict)){next.flightConflict=Boolean(hit.conflict);rowChanged=true;}
      manualRestored++;
    }

    const checkedAt=String(hit.checkedAt||'');
    if(checkedAt&&String(next.flightCheckedAt||'')!==checkedAt){next.flightCheckedAt=checkedAt;rowChanged=true;}
    const sourceNote=String(hit.sourceNote||'').trim();
    if(sourceNote&&String(next.flightCheckSourceNote||'')!==sourceNote){next.flightCheckSourceNote=sourceNote;rowChanged=true;}
    if(rowChanged)changed++;
    return rowChanged?next:r;
  });
  return {rides:out,changed,verifiedRestored,manualRestored};
}
function flightCheckItems(source=rides){
  const map=new Map();
  for(const r of source){
    const flight=flightCacheNumber(r.flightNumber||r.arrivalFlight||r.departureFlight);
    if(!flight)continue;
    const rawDate=String(r.date||'').trim();
    const date=rawDate||berlinDate();
    const dateAssumed=!rawDate;
    const direction=flightDirectionForGemini(r);
    const airportIata=flightAirportForGemini(r);
    const flightTime=first(r.flightTime,r.flugzeit,r.flight_time);
    const eventContext=flightAirportEventDateContext({...r,date});
    const airportEventDate=String(eventContext.airportEventDate||date).trim();
    const locationFromPlan=first(r.locationFromPlan,r.flightLocation,r.flugort,r.ort);
    const key=[flight,date,airportEventDate,airportIata,direction,flightTime].join('|');
    if(!map.has(key))map.set(key,{
      flightNumber:flight,
      date,
      airportEventDate,
      airportEventDateDerived:Boolean(eventContext.derived),
      dateAssumed,
      flightTime:flightTime||null,
      direction,
      airportIata:airportIata||null,
      locationFromPlan
    });
  }
  return [...map.values()];
}
function buildGeminiFlightPrompt(){
  const items=flightCheckItems();
  if(!items.length)throw new Error('Keine Flugnummern in der aktuellen Planliste gefunden.');
  return `ATMS PRO – FLIGHT-008 MULTI-AIRPORT strikte aktuelle Flugprüfung

Prüfe JEDE unten aufgeführte Flugnummer für den angegebenen Flughafen-Ereignistag (airportEventDate) anhand aktueller, DATUMSSPEZIFISCHER Webdaten. Prüfe jeden Eintrag bei diesem Auftrag neu. Eine Flugnummer darf niemals allein aufgrund einer bekannten, früheren oder typischen Route einem Ort zugeordnet werden.

VERBINDLICHE VERIFIKATIONSREGELN:
1. airportIata ist der für DIESE Fahrt relevante Flughafen. Verwende exakt diesen Flughafen und ersetze ihn nicht durch DUS oder einen anderen Airport.
2. direction=arrival: Gesucht ist der HERKUNFTSORT des konkreten Fluges NACH airportIata.
3. direction=departure: Gesucht ist der ZIELORT des konkreten Fluges AB airportIata.
4. date ist das ATMS-Fahrtdatum und muss unverändert zurückgegeben werden. Für die datumsspezifische Webprüfung ist airportEventDate maßgeblich. Verwende airportEventDate EXAKT als lokalen Kalendertag des relevanten Flughafenereignisses. Wenn airportEventDate von date abweicht, darf NICHT mit date statt airportEventDate geprüft werden.
5. Wenn airportIata fehlt/null oder direction=unknown ist: status="needs_manual_check". Nicht raten.
6. Allgemeine Flugpläne, typische Routen, historische Routenzuordnungen oder gespeicherte Flugnummer→Ort-Zuordnungen reichen NICHT.
7. status="verified" UND confidence="high" sind NUR erlaubt, wenn mindestens ZWEI voneinander unabhängige, datumsspezifische Quellen dieselbe konkrete Route bestätigen.
8. Mindestens eine der zwei Quellen soll nach Möglichkeit die offizielle Quelle des betroffenen Flughafens oder der Airline sein. Die zweite Quelle soll unabhängig davon sein.
9. Wenn genau EINE geeignete datumsspezifische Quelle die konkrete Route eindeutig bestätigt, gib status="needs_manual_check" und confidence="medium" zurück. relevantLocation und der relevante IATA-Code müssen trotzdem vollständig gesetzt werden. NIEMALS verified/high. ATMS kann diesen Sonderfall intern als quellenbestätigt behandeln, sofern kein Konflikt mit einem vorhandenen Planort besteht.
10. Wenn die Einzelquelle die konkrete Route NICHT eindeutig bestätigt, keine geeignete datumsspezifische Quelle gefunden wird, Quellen widersprechen oder die Verbindung über airportIata nicht sicher bestätigt werden kann: status="needs_manual_check" und confidence="low". NICHT raten.
11. flightTime ist ein zusätzliches Unterscheidungsmerkmal. Wenn mehrere passende Flüge existieren und die Zuordnung ohne flightTime nicht eindeutig ist: status="needs_manual_check".
12. locationFromPlan ist ausschließlich ein Vergleichswert und KEINE Quelle. Prüfe auch vorhandene Planorte vollständig neu.
13. Weicht ein sicher verifiziertes Ergebnis von locationFromPlan ab, setze conflict=true.
14. Erfinde keine Orte, IATA-Codes, Quellen, URLs oder Prüfzeiten.
15. sources MUSS ein JSON-Array sein. Jede Quelle muss mindestens "name" und "url" enthalten. Nur tatsächlich für diesen Flug, airportEventDate und airportIata verwendete Quellen eintragen.
16. Bei verified/high müssen mindestens zwei unterschiedliche sources-Einträge vorhanden sein.
17. sourceNote soll die Prüfung kurz zusammenfassen, darf aber sources nicht ersetzen.
18. checkedAt muss der tatsächliche Zeitpunkt dieser Webprüfung in ISO-8601-UTC sein. ATMS speichert zusätzlich selbst seinen Übernahmezeitpunkt.
19. Verwende EXAKT die unten definierten Feldnamen.
20. Antworte ausschließlich mit EINEM gültigen JSON-Objekt gemäß dem Schema. Kein Markdown, keine Erklärung vor oder nach dem JSON.

VERBINDLICHES JSON-SCHEMA:
{
  "checkedAt": "ISO-8601",
  "flights": [
    {
      "flightNumber": "EW0000",
      "date": "YYYY-MM-DD",
      "airportEventDate": "YYYY-MM-DD",
      "airportEventDateDerived": false,
      "dateAssumed": false,
      "flightTime": null,
      "direction": "arrival|departure|unknown",
      "airportIata": "DUS|CGN|anderer IATA-Code|null",
      "originCity": "",
      "originIata": "",
      "destinationCity": "",
      "destinationIata": "",
      "relevantLocation": "",
      "status": "verified|needs_manual_check",
      "confidence": "high|medium|low",
      "conflict": false,
      "sources": [
        {
          "name": "Quelle 1",
          "url": "https://..."
        },
        {
          "name": "Quelle 2",
          "url": "https://..."
        }
      ],
      "sourceNote": ""
    }
  ]
}

WICHTIG:
- date, airportEventDate und airportEventDateDerived aus dem Prüfeintrag unverändert zurückgeben.
- airportIata aus dem Prüfeintrag unverändert zurückgeben.
- Bei status="verified" + confidence="high": sources.length MUSS mindestens 2 sein.
- Bei genau 1 eindeutigen datumsspezifischen Quelle: status="needs_manual_check" + confidence="medium" und Route/IATA vollständig zurückgeben.
- Bei keiner eindeutigen Quelle oder Widerspruch: status="needs_manual_check" + confidence="low".
- Gib alle Prüfeinträge in derselben Reihenfolge zurück.

Zu prüfen:
${JSON.stringify(items,null,2)}`;
}
async function copyGeminiFlightPrompt(){
  try{
    const text=buildGeminiFlightPrompt();
    await navigator.clipboard.writeText(text);
    showToast('Gemini-Flugprüfung kopiert','ok');
    const status=$('geminiFlightStatus');if(status)status.textContent=`${flightCheckItems().length} Flugprüfung(en) kopiert. Jetzt in Gemini einfügen.`;
  }catch(e){
    const text=(()=>{try{return buildGeminiFlightPrompt()}catch{return''}})();
    const box=$('geminiFlightPromptFallback');if(box){box.value=text;box.classList.remove('hidden');box.select();}
    showToast('Prompt anzeigen und manuell kopieren','warn');
  }
}
/* CORE-005Y – Android JSON Input Guard */
function inspectAtmsJsonInput(text){
  const raw=clean(String(text||'')).trim();
  if(!raw)return{state:'empty',text:''};
  if(!raw.startsWith('{'))return{state:'invalid',text:raw,reason:'JSON muss mit { beginnen.'};

  const stack=[];
  let inString=false,escaped=false;

  for(let i=0;i<raw.length;i++){
    const ch=raw[i];

    if(inString){
      if(escaped){escaped=false;continue}
      if(ch==='\\'){escaped=true;continue}
      if(ch==='"'){inString=false}
      continue;
    }

    if(ch==='"'){inString=true;continue}
    if(ch==='{'||ch==='['){stack.push(ch);continue}
    if(ch==='}'||ch===']'){
      const expected=ch==='}'?'{':'[';
      const opened=stack.pop();
      if(opened!==expected)return{state:'invalid',text:raw,reason:'JSON-Klammern passen nicht zusammen.'};
    }
  }

  if(inString||escaped||stack.length||!raw.endsWith('}')){
    return{state:'incomplete',text:raw,reason:'JSON endet unvollständig.'};
  }

  try{
    JSON.parse(raw);
    return{state:'complete',text:raw};
  }catch(e){
    const message=String(e?.message||e);
    if(/unexpected end|unterminated string|end of json|unterminated/i.test(message)){
      return{state:'incomplete',text:raw,reason:message};
    }
    return{state:'invalid',text:raw,reason:message};
  }
}
function parseAtmsJsonObject(text,label){
  const result=inspectAtmsJsonInput(text);
  if(result.state==='empty')throw new Error(`${label}: Kein JSON eingefügt.`);
  if(result.state==='incomplete')throw new Error(`${label}: JSON ist unvollständig oder beim Kopieren abgeschnitten. Bitte vollständig neu kopieren.`);
  if(result.state==='invalid')throw new Error(`${label}: JSON ist ungültig${result.reason?` (${result.reason})`:''}.`);
  return JSON.parse(result.text);
}
function installJsonInputGuard(inputId,statusId,label){
  const input=$(inputId),status=$(statusId);
  if(!input||!status||input.dataset.atmsJsonGuard==='1')return;
  input.dataset.atmsJsonGuard='1';
  input.addEventListener('input',()=>{
    const result=inspectAtmsJsonInput(input.value);
    if(result.state==='empty'){
      status.textContent=`Noch kein ${label} eingefügt.`;
      return;
    }
    if(result.state==='incomplete'){
      status.textContent=`⚠ ${label} unvollständig/abgeschnitten – bitte vollständig neu kopieren.`;
      return;
    }
    if(result.state==='invalid'){
      status.textContent=`⚠ ${label} syntaktisch ungültig – bitte JSON prüfen.`;
      return;
    }
    status.textContent=`✓ ${label} vollständig erkannt. Bereit zur Übernahme.`;
  });
}

function parseGeminiFlightResult(text){
  const obj=parseAtmsJsonObject(text,'Gemini-JSON');
  if(!obj || Array.isArray(obj) || typeof obj!=='object'){
    throw new Error('FLIGHT-007 erwartet ein JSON-Objekt mit dem Feld "flights".');
  }
  if(!Array.isArray(obj.flights) || !obj.flights.length){
    throw new Error('FLIGHT-007: Feld "flights" fehlt oder enthält keine Flüge.');
  }

  const requiredFields=[
    'flightNumber','date','airportEventDate','airportEventDateDerived','dateAssumed','flightTime','direction','airportIata',
    'originCity','originIata','destinationCity','destinationIata',
    'relevantLocation','status','confidence','conflict','sources','sourceNote'
  ];

  return obj.flights.map((x,index)=>{
    if(!x || typeof x!=='object' || Array.isArray(x)){
      throw new Error(`FLIGHT-007: Flug ${index+1} ist kein gültiges Objekt.`);
    }

    const missing=requiredFields.filter(key=>!(key in x));
    if(missing.length){
      throw new Error(`FLIGHT-007: Flug ${index+1} verwendet nicht das verbindliche Schema. Fehlend: ${missing.join(', ')}.`);
    }

    if(!Array.isArray(x.sources)){
      throw new Error(`FLIGHT-007: sources bei Flug ${index+1} muss ein Array sein.`);
    }

    const flightNumber=String(x.flightNumber||'').trim().toUpperCase();
    if(!flightNumber){
      throw new Error(`FLIGHT-007: flightNumber bei Flug ${index+1} fehlt.`);
    }

    const direction=String(x.direction||'unknown').trim().toLowerCase();
    const airportIata=String(x.airportIata||'').trim().toUpperCase();
    if(airportIata&&!/^[A-Z]{3}$/.test(airportIata)){
      throw new Error(`FLIGHT-008: airportIata bei Flug ${index+1} ist ungültig.`);
    }
    const location=String(x.relevantLocation||'').trim();
    const iata=String(
      x.iata ||
      (direction==='arrival'?x.originIata:'') ||
      (direction==='departure'?x.destinationIata:'') ||
      ''
    ).trim().toUpperCase();

    const status=String(x.status||'').trim().toLowerCase();
    const confidence=String(x.confidence||'').trim().toLowerCase();

    const normalizedSources=x.sources.map(source=>{
      if(typeof source==='string'){
        return {name:source.trim(),url:source.trim()};
      }
      return {
        name:String(source?.name||'').trim(),
        url:String(source?.url||'').trim()
      };
    }).filter(source=>source.name && source.url);

    const uniqueSourceKeys=new Set(
      normalizedSources.map(source=>String(source.url||source.name).trim().toLowerCase())
    );
    const sourceCount=uniqueSourceKeys.size;

    const claimedVerified=status==='verified' && confidence==='high' && Boolean(location);
    const verified=claimedVerified && sourceCount>=2;
    // P31: Genau eine eindeutige datumsspezifische Quelle darf einen zuvor leeren/
    // konfliktfreien Flugort liefern, ohne die strikte verified/high-Stufe vorzutäuschen.
    // Ein Plan-Konflikt, low confidence, fehlende Route/IATA oder unklare Richtung bleibt manuell.
    const sourceConfirmed=!verified
      && status==='needs_manual_check'
      && confidence==='medium'
      && sourceCount===1
      && Boolean(location)
      && /^[A-Z]{3}$/.test(iata)
      && (direction==='arrival'||direction==='departure')
      && /^[A-Z]{3}$/.test(airportIata)
      && !Boolean(x.conflict);

    return {
      flightNumber,
      date:String(x.date||'').trim(),
      airportEventDate:String(x.airportEventDate||x.date||'').trim(),
      airportEventDateDerived:Boolean(x.airportEventDateDerived),
      dateAssumed:Boolean(x.dateAssumed),
      flightTime:String(x.flightTime||'').trim(),
      direction,
      airportIata,
      flightLocation:location,
      iata,
      confidence:verified?'verified':(sourceConfirmed?'source_confirmed':'uncertain'),
      status:verified?'verified':'needs_manual_check',
      sourceConfirmed:Boolean(sourceConfirmed),
      conflict:Boolean(x.conflict),
      sources:normalizedSources,
      sourceCount,
      sourceNote:String(x.sourceNote||'').trim(),
      geminiReportedCheckedAt:String(obj.checkedAt||''),
      verificationDowngraded:Boolean(claimedVerified && sourceCount<2)
    };
  }).filter(x=>x.flightNumber);
}
function applyGeminiFlightResult(){
  try{
    capturePersistenceSafety('before-gemini-flight-apply');
    const box=$('geminiFlightResult');
    const checked=parseGeminiFlightResult(box?.value||'');
    // ATMS setzt den tatsächlichen lokalen Übernahme-/Prüfzeitpunkt selbst.
    // Ein von Gemini gelieferter checkedAt-Wert wird nicht als verlässlicher Zeitstempel gespeichert.
    const atmsCheckedAt=new Date().toISOString();
    let updated=0,uncertain=0,downgraded=0;
    const cacheEntries=[];
    rides=rides.map(r=>{
      if(!r.flightNumber)return r;
      const flight=flightCacheNumber(r.flightNumber);
      const date=String(r.date||'').trim();
      const eventContext=flightAirportEventDateContext(r);
      const airportEventDate=String(eventContext.airportEventDate||date).trim();
      const direction=flightDirectionForGemini(r);
      const airportIata=flightAirportForGemini(r);
      const flightTime=String(r.flightTime||'').trim();

      // FLIGHT-007 + DAY-002:
      // Bei gemischten Plantagen niemals nur anhand der Flugnummer zurückfallen.
      // Datum und Richtung müssen zum konkreten Ride passen.
      const candidates=checked.filter(x=>{
        if(flightCacheNumber(x.flightNumber)!==flight)return false;

        const checkedDate=String(x.date||'').trim();
        if(date){
          if(!checkedDate || checkedDate!==date)return false;
        }else if(checkedDate){
          return false;
        }

        const checkedAirportEventDate=String(x.airportEventDate||checkedDate).trim();
        if(airportEventDate){
          if(!checkedAirportEventDate || checkedAirportEventDate!==airportEventDate)return false;
        }else if(checkedAirportEventDate){
          return false;
        }

        const checkedDirection=String(x.direction||'unknown').trim().toLowerCase();
        if(direction!=='unknown'){
          if(checkedDirection==='unknown' || checkedDirection!==direction)return false;
        }else if(checkedDirection!=='unknown'){
          return false;
        }

        const checkedAirportIata=String(x.airportIata||'').trim().toUpperCase();
        if(airportIata){
          if(!checkedAirportIata || checkedAirportIata!==airportIata)return false;
        }else if(checkedAirportIata){
          return false;
        }

        return true;
      });

      let hit=null;

      // Wenn ATMS eine Flugzeit kennt, muss sie bei mehreren Treffern exakt passen.
      if(flightTime){
        const exactTime=candidates.filter(x=>String(x.flightTime||'').trim()===flightTime);
        if(exactTime.length===1)hit=exactTime[0];
        else if(exactTime.length>1)hit=null;
        else if(candidates.length===1 && !String(candidates[0].flightTime||'').trim())hit=candidates[0];
      }else{
        // Ohne Flugzeit nur übernehmen, wenn Flugnummer+Datum+Richtung genau EINEN Treffer liefern.
        if(candidates.length===1)hit=candidates[0];
      }

      // Keine unsichere Ersatzsuche über andere Daten/Plantagen.
      if(!hit)return r;

      const verified=hit.confidence==='verified'&&hit.flightLocation&&hit.flightLocation!=='Flugort prüfen';
      const sourceConfirmed=hit.confidence==='source_confirmed'&&hit.sourceConfirmed===true&&hit.flightLocation&&hit.flightLocation!=='Flugort prüfen';
      const accepted=Boolean(verified||sourceConfirmed);
      const checkedAt=atmsCheckedAt;
      updated++;if(!accepted)uncertain++;if(hit.verificationDowngraded)downgraded++;

      cacheEntries.push({
        rideId:String(r.id||''),
        fingerprint:flightRideFingerprint(r),
        flightNumber:flight,
        direction,
        airportIata:airportIata||String(hit.airportIata||'').trim().toUpperCase(),
        date:date||String(hit.date||'').trim(),
        airportEventDate:airportEventDate||String(hit.airportEventDate||hit.date||'').trim(),
        airportEventDateDerived:Boolean(eventContext.derived),
        flightTime:flightTime||String(hit.flightTime||'').trim(),
        flightLocation:accepted?hit.flightLocation:'',
        iata:accepted?hit.iata:'',
        verified:Boolean(verified),
        sourceConfirmed:Boolean(sourceConfirmed),
        conflict:Boolean(hit.conflict),
        sourceNote:String(hit.sourceNote||'').trim(),
        sourceCount:Number(hit.sourceCount||0)||0,
        checkedAt,
        sourceFile:String(r.sourceFile||''),
        sourceRow:Number(r.sourceRow||0)||0
      });

      if(verified){
        upsertRideOverride(r.id,{
          flightVerified:true,
          flightLocation:hit.flightLocation,
          iata:hit.iata||'',
          flightNeedsManualCheck:false,
          flightCheckedAt:checkedAt
        });
      }

      return {
        ...r,
        date:date || String(hit.date||'').trim(),
        // FLIGHT-007B: Ein unsicheres Ergebnis darf vorhandene Daten niemals verschlechtern.
        // Bestehenden Plan-/Prüfort und IATA bei needs_manual_check unverändert behalten.
        flightLocation:accepted?hit.flightLocation:r.flightLocation,
        iata:accepted?hit.iata:(r.iata||''),
        flightCheckConfidence:verified?'verified':(sourceConfirmed?'source_confirmed':'uncertain'),
        flightNeedsManualCheck:Boolean(!verified||hit.conflict),
        flightConflict:Boolean(hit.conflict),
        flightCheckSourceNote:String(hit.sourceNote||'').trim(),
        flightCheckedAt:checkedAt
      };
    });
    upsertFlightCache(cacheEntries);
    save();
    capturePersistenceSafety('after-gemini-flight-apply');
    syncPersistenceDurableShadow('after-gemini-flight-apply');
    try{window.dispatchEvent(new CustomEvent('atms:gemini-flight-result',{detail:{checked}}));}catch(_){}
    if(box)box.value='';
    const status=$('geminiFlightStatus');if(status)status.textContent=`${updated} Fahrt(en) geprüft${uncertain?` · ${uncertain} unsicher → vorhandener Flugort bleibt · manuell prüfen`:''}${downgraded?` · ${downgraded} wegen <2 Quellen heruntergestuft`:''}.`;
    showToast(`${updated} Flugdaten übernommen`,'ok');
    render();
  }catch(e){const status=$('geminiFlightStatus');if(status)status.textContent='Fehler: '+e.message;showToast('Gemini-Ergebnis ungültig','warn');}
}
// CORE-005Q2 – Import/Gemini auf Smartphones immer einspaltig und vollständig erreichbar.
function ensureMobileImportLayoutFix(){
  const load=$('loadBtn'),view=$('importView');
  const host=$('importToolsHost')||load?.parentElement||view;
  if(!host)return;
  host.classList.add('atms-import-mobile-stack');
  if($('atmsMobileImportLayoutFix'))return;
  const style=document.createElement('style');
  style.id='atmsMobileImportLayoutFix';
  style.textContent=`
    @media (max-width: 900px){
      .atms-import-mobile-stack{
        grid-template-columns:minmax(0,1fr)!important;
        grid-auto-columns:minmax(0,1fr)!important;
        width:100%!important;
        max-width:100%!important;
        min-width:0!important;
      }
      .atms-import-mobile-stack > *{
        max-width:100%!important;
        min-width:0!important;
        box-sizing:border-box!important;
      }
      .atms-import-mobile-stack > #loadBtn,
      .atms-import-mobile-stack > #geminiFlightPanel,
      .atms-import-mobile-stack > #liveFlightPanel,
      .atms-import-mobile-stack > #atmsPersistenceSafetyPanel{
        grid-column:1 / -1!important;
        width:100%!important;
        max-width:100%!important;
        min-width:0!important;
        box-sizing:border-box!important;
      }
      #geminiFlightPanel textarea,
      #liveFlightPanel textarea,
      #geminiFlightPanel input,
      #liveFlightPanel input,
      #geminiFlightPanel button,
      #liveFlightPanel button,
      #atmsPersistenceSafetyPanel button,
      #atmsPersistenceSafetyPanel pre{
        max-width:100%!important;
        box-sizing:border-box!important;
      }
    }
  `;
  document.head.appendChild(style);
}
function ensureGeminiFlightPanel(){
  ensureMobileImportLayoutFix();
  if($('geminiFlightPanel'))return;
  const load=$('loadBtn'),view=$('importView'),host=$('importToolsHost');if(!load||!view)return;
  const panel=document.createElement('section');panel.id='geminiFlightPanel';panel.style.cssText='margin:16px 0;padding:14px;border:1px solid rgba(255,255,255,.16);border-radius:14px;background:rgba(255,255,255,.04)';
  panel.innerHTML=`<div style="font-weight:800;margin-bottom:6px">🤖 Gemini-Flugprüfung</div><div style="font-size:13px;opacity:.8;margin-bottom:10px">Prüft Flugnummer + Datum neu. Keine feste Flugnummer→Ort-Zuordnung.</div><button type="button" id="copyGeminiFlightBtn" style="width:100%;padding:12px;border-radius:10px;font-weight:800">🤖 Gemini-Prüfauftrag kopieren</button><textarea id="geminiFlightPromptFallback" class="hidden" style="width:100%;min-height:120px;margin-top:10px" readonly></textarea><textarea id="geminiFlightResult" placeholder="Gemini-JSON hier einfügen" style="width:100%;min-height:120px;margin-top:10px"></textarea><button type="button" id="applyGeminiFlightBtn" style="width:100%;padding:12px;border-radius:10px;font-weight:800;margin-top:8px">✓ Geprüfte Flugorte übernehmen</button><div id="geminiFlightStatus" style="font-size:12px;opacity:.8;margin-top:8px">Noch keine Flugprüfung durchgeführt.</div>`;
  if(host)host.appendChild(panel);else load.parentElement?.insertBefore(panel,load.nextSibling);
  $('copyGeminiFlightBtn')?.addEventListener('click',copyGeminiFlightPrompt);
  $('applyGeminiFlightBtn')?.addEventListener('click',applyGeminiFlightResult);
  installJsonInputGuard('geminiFlightResult','geminiFlightStatus','Gemini-JSON');
}


// CORE-005N – Live-Flugdaten werden getrennt von PLAN/DISPO gespeichert.
function atmsFormatIsoDateDe(value){
  const raw=String(value||'').trim();
  const m=raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m?`${m[3]}.${m[2]}.${m[1]}`:raw;
}
function atmsFormatDateTimeDe(value){
  if(!value)return'–';
  const d=new Date(value);if(Number.isNaN(d.getTime()))return String(value);
  return `${d.toLocaleDateString('de-DE')} · ${d.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}`;
}
function livePromptRideIsDone(r){
  const id=String(r?.id||'').trim();
  return Boolean(id&&done.has(id));
}
function liveFlightRelevantRides(source=rides,now=new Date()){
  const list=Array.isArray(source)?source:[];
  const settings=getLiveSettings();
  return list.filter(r=>hasFlightNumber(r)&&!livePromptRideIsDone(r)&&!isPastLiveDispositionRide(r,settings,now));
}
function liveFlightInventoryMeta(source=rides){
  const list=Array.isArray(source)?source:[];
  const dates=[...new Set(list.map(r=>String(r?.date||'').trim()).filter(Boolean))].sort();
  const allItems=liveFlightCheckItems(list);
  const relevantItems=liveFlightCheckItems(liveFlightRelevantRides(list));
  return{rideCount:list.length,flightCount:allItems.length,relevantFlightCount:relevantItems.length,relevantRideCount:liveFlightRelevantRides(list).length,dates};
}
function liveFlightLastCheckMeta(){
  try{return JSON.parse(localStorage.getItem(ATMS_LIVE_LAST_CHECK_META)||'{}')||{}}catch{return{}}
}
function updateLiveFlightPanelContext(){
  const inventory=$('liveFlightContextStatus');
  const meta=liveFlightInventoryMeta();
  if(inventory){
    const dateText=meta.dates.length===1?atmsFormatIsoDateDe(meta.dates[0]):meta.dates.length?meta.dates.map(atmsFormatIsoDateDe).join(' · '):'–';
    inventory.textContent=`Aktueller Fahrtenbestand: ${meta.rideCount} Fahrt(en) · ${meta.flightCount} Flüge · ${meta.relevantFlightCount} aktuell relevant · Plantag ${dateText}`;
  }
  const scope=$('liveFlightScopeHint');
  const includeAll=Boolean($('liveFlightIncludeAll')?.checked);
  if(scope){
    const grace=livePastRideGraceMinutes();
    scope.textContent=includeAll?`Prüfumfang: alle ${meta.flightCount} Flüge des Plantags.`:`Standard: ${meta.relevantFlightCount} aktuell relevante Flüge · vergangene Fahrten werden nach ${grace} Min. Nachlauf nicht mehr automatisch geprüft.`;
  }
  const label=$('liveFlightIncludeAllLabel');
  if(label)label.textContent=`Alle Flüge des Plantags einbeziehen (${meta.flightCount})`;
  const last=$('liveFlightLastCheck');
  if(last){
    const check=liveFlightLastCheckMeta();
    if(!check.importedAt){last.textContent='Letzte LIVE-Prüfung: –';}
    else{
      const checked=check.reportedCheckedAt?atmsFormatDateTimeDe(check.reportedCheckedAt):'–';
      const parsed=check.reportedCheckedAt?new Date(check.reportedCheckedAt):null;
      const age=parsed&&!Number.isNaN(parsed.getTime())?Math.max(0,(Date.now()-parsed.getTime())/60000):null;
      const confirmed=Number(check.confirmedRides||0);
      const freshness=age===null?'Zeitpunkt unbekannt':age>ATMS_LIVE_FRESHNESS_MINUTES?`⚠ Prüfung nicht mehr aktuell · ${liveAgeLabel(age)}`:`${confirmed} aktuell bestätigt · ${liveAgeLabel(age)}`;
      last.textContent=`Letzte Netzprüfung: ${checked} · ${freshness} · übernommen ${atmsFormatDateTimeDe(check.importedAt)}`;
    }
  }
}
function updateLiveApplyButtonState(){
  const box=$('liveFlightResult'),button=$('applyLiveFlightBtn');if(!box||!button)return;
  const state=inspectAtmsJsonInput(box.value);
  button.disabled=state.state!=='complete';
  button.setAttribute('aria-disabled',button.disabled?'true':'false');
}
function liveFlightPendingPlanMeta(){
  const meta=window.ATMSPlanImportLiveGuardMeta;
  return meta&&meta.pending?meta:null;
}
function liveFlightCheckItems(source=rides){
  const map=new Map();
  for(const r of (Array.isArray(source)?source:[])){
    const flight=flightCacheNumber(r.flightNumber||r.arrivalFlight||r.departureFlight);
    if(!flight)continue;
    const date=String(r.date||'').trim()||berlinDate();
    const eventContext=flightAirportEventDateContext({...r,date});
    const airportEventDate=String(eventContext.airportEventDate||date).trim();
    const direction=flightDirectionForGemini(r);
    const airportIata=flightAirportForGemini(r);
    const key=[flight,date,airportEventDate,airportIata,direction].join('|');
    if(!map.has(key))map.set(key,{flightNumber:flight,date,airportEventDate,airportEventDateDerived:Boolean(eventContext.derived),direction,airportIata:airportIata||null,flightLocation:String(r.flightLocation||'').trim()||null,planPickupTime:planTimeOf(r)||null,flightTime:first(r.flightTime,r.flugzeit,r.flight_time)||null});
  }
  return [...map.values()];
}

function nativeLiveStatusIdentityMatch(ride,hit){
  const flight=flightCacheNumber(ride?.flightNumber||ride?.arrivalFlight||ride?.departureFlight);if(!flight)return false;
  const date=String(ride?.date||'').trim();
  const eventContext=flightAirportEventDateContext(ride||{});
  const airportEventDate=String(eventContext.airportEventDate||date).trim();
  const direction=flightDirectionForGemini(ride);
  const airportIata=String(flightAirportForGemini(ride)||'').trim().toUpperCase();
  return flightCacheNumber(hit?.flightNumber)===flight
    &&(!date||String(hit?.date||'').trim()===date)
    &&String(hit?.airportEventDate||hit?.date||'').trim()===airportEventDate
    &&String(hit?.direction||'').trim().toLowerCase()===direction
    &&String(hit?.airportIata||'').trim().toUpperCase()===airportIata;
}
function nativeLiveStatusRawLabel(status){
  const value=String(status||'').trim().toLowerCase();
  if(value==='departed')return'departed';
  if(value==='landed')return'landed';
  if(value==='delayed')return'delayed';
  if(value==='cancelled')return'cancelled';
  if(value==='on_time')return'on-time';
  if(value==='scheduled')return'scheduled';
  return'unknown';
}
async function runNativeLiveStatusCheck(){
  const button=$('nativeLiveStatusBtn'),statusBox=$('nativeLiveStatusStatus');
  try{
    const pending=liveFlightPendingPlanMeta();
    if(pending){
      if(statusBox)statusBox.textContent=`⚠ Neue Planliste mit ${Number(pending.rideCount||0)} Fahrt(en) noch nicht übernommen. Bitte zuerst „Geprüfte Fahrten übernehmen“.`;
      showToast('Neue Planliste zuerst übernehmen','warn');return;
    }
    const includeAll=Boolean($('liveFlightIncludeAll')?.checked);
    const source=includeAll?rides:liveFlightRelevantRides();
    const items=liveFlightCheckItems(source);
    if(!items.length){
      if(!includeAll&&liveFlightCheckItems().length)throw new Error('Keine aktuell relevanten Flüge. Für den historischen Test „Alle Flüge des Plantags einbeziehen“ aktivieren.');
      throw new Error('Keine Flüge im aktuellen Fahrtenbestand gefunden.');
    }
    if(typeof window.ATMSNativeLiveStatusCheck!=='function')throw new Error('Native LIVE-Statusprüfung ist noch nicht verfügbar. Import-Modul bitte vollständig laden.');
    if(button){button.disabled=true;button.setAttribute('aria-busy','true')}
    if(statusBox)statusBox.textContent=`Native Zwei-Quellen-LIVE-Prüfung läuft · ${items.length} Flug/Flüge …`;
    const result=await window.ATMSNativeLiveStatusCheck(items);
    const hits=Array.isArray(result?.flights)?result.flights:[];
    const reportedCheckedAt=String(result?.checkedAt||'').trim();
    const fresh=liveReportedCheckIsFresh(reportedCheckedAt);
    const importedAt=new Date().toISOString();
    let updated=0,uncertain=0,manualPreserved=0,exactTimePreserved=0,archived=0,operationalArrivalTimes=0;
    rides=rides.map(r=>{
      const candidates=hits.filter(hit=>nativeLiveStatusIdentityMatch(r,hit));
      if(candidates.length!==1)return r;
      const hit=candidates[0];
      if(r.liveManualConfirmed){manualPreserved++;return r;}
      const existingTimedSnapshot=Boolean(rawExplicitLiveTimeOf(r)||first(r?.liveFlightActualTime,r?.liveFlightEstimatedTime));
      if(existingTimedSnapshot&&liveSnapshotFreshness(r).usable){
        exactTimePreserved++;
        return norm({...r,
          liveLastNativeStatusCheckedAt:importedAt,
          liveLastNativeStatusReportedCheckedAt:reportedCheckedAt,
          liveLastNativeStatusConfirmed:Boolean(hit?.confirmed===true&&hit?.statusConfirmed===true&&fresh),
          liveLastNativeStatus:String(hit?.status||hit?.observedOfficialStatus||'unknown'),
          liveLastNativeStatusSourceNote:String(hit?.sourceNote||''),
          liveLastNativeStatusSources:Array.isArray(hit?.sources)?hit.sources:[]
        },0);
      }
      const confirmed=Boolean(hit?.confirmed===true&&hit?.statusConfirmed===true&&hit?.timeConfirmed!==true&&fresh);
      if(!confirmed){uncertain++;return norm({...r,
        liveLastNativeStatusCheckedAt:importedAt,
        liveLastNativeStatusReportedCheckedAt:reportedCheckedAt,
        liveLastNativeStatusConfirmed:false,
        liveLastNativeStatus:String(hit?.observedOfficialStatus||hit?.status||'unknown'),
        liveLastNativeStatusSourceNote:String(hit?.sourceNote||''),
        liveLastNativeStatusSources:Array.isArray(hit?.sources)?hit.sources:[]
      },0);}
      const airportIata=String(hit?.airportIata||flightAirportForGemini(r)||'').trim().toUpperCase();
      const eventContext=flightAirportEventDateContext(r);
      const airportEventDate=String(hit?.airportEventDate||eventContext.airportEventDate||r?.date||'').trim();
      const status=String(hit?.status||'unknown').trim().toLowerCase();
      const direction=flightDirectionForGemini(r);
      const acceptedOfficialActual=strictClockOrNull(first(hit?.officialActualTime,hit?.observedOfficialActualTime));
      const useOfficialArrivalActual=Boolean(
        direction==='arrival'
        && airportIata==='DUS'
        && status==='landed'
        && hit?.officialActualOperationallyAccepted===true
        && hit?.timeMinuteDualSourceConfirmed!==true
        && acceptedOfficialActual
      );
      const history=liveHistoryPatchFromRide(r,importedAt,useOfficialArrivalActual?'superseded_by_native_official_arrival_actual':'superseded_by_native_status_only');
      if(Object.keys(history).length)archived++;
      const nextLive=useOfficialArrivalActual?clockPlusMinutes(acceptedOfficialActual,arrivalBufferMinutesForRide(r)):'';
      if(useOfficialArrivalActual&&nextLive)operationalArrivalTimes++;
      updated++;
      return norm({...r,...history,
        liveTime:nextLive,live_time:nextLive,
        flightStatus:nativeLiveStatusRawLabel(status),
        delayMinutes:null,
        landed:status==='landed',
        liveFlightStatus:status,
        liveFlightAirportIata:airportIata,
        liveFlightAirportEventDate:airportEventDate,
        liveFlightScheduledTime:'',
        liveFlightEstimatedTime:'',
        liveFlightActualTime:useOfficialArrivalActual?acceptedOfficialActual:'',
        liveCheckedAt:importedAt,
        liveReportedCheckedAt:reportedCheckedAt,
        liveCurrentConfirmed:true,
        liveCurrentSource:useOfficialArrivalActual?'native_official_airport_actual':'native_status',
        liveSourceNote:String(hit?.sourceNote||'Native Zwei-Quellen-Status bestätigt; exakte LIVE-Zeit nicht als Zwei-Quellen-Minute bestätigt.'),
        liveSources:Array.isArray(hit?.sources)?hit.sources:[],
        liveSourceConflict:false,
        liveResolutionMode:useOfficialArrivalActual?'native_arrival_official_actual_dual_status':'native_status_consensus',
        livePrioritySourceUrl:'',
        liveNativeStatusOnly:!useOfficialArrivalActual,
        liveNativeTimeConfirmed:false,
        liveNativeOfficialActualAccepted:useOfficialArrivalActual,
        liveNativeMinuteDualSourceConfirmed:false
      },0);
    });
    save();render();scheduleLiveFreshnessRefresh();
    try{localStorage.setItem(ATMS_LIVE_LAST_CHECK_META,JSON.stringify({reportedCheckedAt,importedAt,confirmedRides:updated,currentLiveTimes:operationalArrivalTimes,uncertainRides:uncertain,archivedRides:archived,manualPreserved,nativeStatusOnly:operationalArrivalTimes===0,nativeOfficialArrivalActualTimes:operationalArrivalTimes,freshnessMinutes:ATMS_LIVE_FRESHNESS_MINUTES}))}catch(_){ }
    updateLiveFlightPanelContext();
    if(statusBox){
      const parts=[`${updated} Fahrt(en) mit Zwei-Quellen-Status aktualisiert`,`${operationalArrivalTimes} DUS-Actual-Ankunftszeit(en) operativ übernommen`];
      if(uncertain)parts.push(`${uncertain} nicht sicher bestätigt`);
      if(manualPreserved)parts.push(`${manualPreserved} manuell bestätigt beibehalten`);
      if(exactTimePreserved)parts.push(`${exactTimePreserved} bereits bestätigte aktuelle LIVE-Zeit nicht überschrieben`);
      statusBox.textContent=parts.join(' · ')+'.';
    }
    showToast(`${updated} Native LIVE-Status bestätigt · ${operationalArrivalTimes} DUS-Ankunftszeit(en) übernommen`,'ok');
  }catch(e){
    if(statusBox)statusBox.textContent='Fehler: '+String(e?.message||e||'Unbekannter Fehler');
    showToast('Native LIVE-Statusprüfung nicht abgeschlossen','warn');
  }finally{
    if(button){button.disabled=false;button.removeAttribute('aria-busy')}
  }
}

function buildLiveFlightPrompt(includeAll=false){
  const source=includeAll?rides:liveFlightRelevantRides();
  const items=liveFlightCheckItems(source);
  if(!items.length){
    if(!includeAll&&liveFlightCheckItems().length)throw new Error('Keine aktuell relevanten Flüge. Für eine historische Vollprüfung „Alle Flüge des Plantags einbeziehen“ aktivieren.');
    throw new Error('Keine Flüge in den aktuell gespeicherten Fahrten gefunden.');
  }
  const scopeNote=includeAll?'Prüfumfang: ALLE Flüge des Plantags.':'Prüfumfang: nur aktuell relevante, noch nicht erledigte Fahrten gemäß Live-Dispo-Nachlauf.';
  return `ATMS PRO – LIVE-FLIGHT-002 MULTI-AIRPORT strikte aktuelle Live-Flugprüfung

${scopeNote}

Prüfe JEDE unten aufgeführte Flugnummer für den angegebenen Flughafen-Ereignistag (airportEventDate) anhand AKTUELLER öffentlicher Webdaten. Keine historischen/typischen Routen als Live-Status verwenden.

VERBINDLICHE REGELN:
1. airportIata ist der für die konkrete Fahrt relevante Flughafen. Verwende exakt diesen Airport.
2. direction=departure: airportIata ist der Abflugairport. Relevant sind aktueller Status und die aktuelle Abflugzeit an airportIata.
3. direction=arrival: airportIata ist der Zielairport. Relevant sind aktueller Status und die aktuelle Ankunftszeit an airportIata.
4. date ist das ATMS-Fahrtdatum und muss unverändert zurückgegeben werden. Für den tatsächlichen Status am relevanten Airport ist airportEventDate EXAKT zu verwenden. Wenn airportEventDate von date abweicht, keine Live-Daten des Fahrtdatums anstelle des Ereignistags übernehmen.
5. confirmed=true erfordert weiterhin mindestens ZWEI voneinander unabhängige, aktuelle/datumsspezifische Quellen. Mindestens eine Quelle soll nach Möglichkeit der betroffene Airport, die Airline oder ein etablierter Live-Tracker sein.
6. Wenn airportIata fehlt/null oder direction=unknown ist: confirmed=false, status=unknown. Nicht raten.
7. Wenn der Flug noch nicht gestartet ist und keine belastbare Schätzung existiert, Status scheduled/on_time ist erlaubt, aber Zeiten nur aus tatsächlich angezeigten aktuellen Daten übernehmen. Ist ein Ankunftsflug tatsächlich angekommen, verwende status=landed. Ist ein Abflug tatsächlich gestartet, verwende status=departed. Ein Abflug darf niemals allein wegen seiner tatsächlichen Abflugzeit status=landed erhalten.
8. Stimmen die geeigneten aktuellen Quellen überein: sourceConflict=false und resolutionMode="consensus".
9. Widersprechen sich geeignete aktuelle Quellen bei operativem Status oder aktueller Zeit, darf Flightradar24 PRIORITÄT erhalten, aber nur wenn die verwendete FR24-Seite den EXAKTEN Flug mit airportEventDate, airportIata und Richtung eindeutig identifiziert und einen aktuellen operativen Status bzw. eine aktuelle Estimated-/Actual-Zeit für dieses Flughafenereignis zeigt. Dann: sourceConflict=true, resolutionMode="flightradar24_priority", prioritySourceUrl=exakte verwendete Flightradar24-URL. status und Zeiten müssen in diesem Modus ausschließlich aus dieser FR24-Quelle stammen.
10. Ein allgemeiner/historischer Flightradar24-Flugplan, eine typische Route oder eine Seite ohne eindeutigen Bezug zu airportEventDate + airportIata reicht NICHT für die Priorität.
11. Wenn ein Quellenkonflikt nicht nach Regel 9 sicher durch FR24 aufgelöst werden kann oder weniger als 2 geeignete Quellen vorliegen: confirmed=false, status=unknown, resolutionMode="unconfirmed". Nicht raten.
12. airportScheduledTime, airportEstimatedTime und airportActualTime immer als lokale Zeit des betroffenen Airports HH:MM zurückgeben oder null. Der globale ATMS-Abholpuffer wird erst lokal in der App addiert und darf nicht in diese Zeiten eingerechnet werden.
13. delayMinutes ist die aktuelle Abweichung am Ereignis des betroffenen Airports in ganzen Minuten; wenn nicht belastbar bestimmbar, null.
14. sources enthält nur tatsächlich verwendete Quellen mit name und url. Keine URLs erfinden. Bei flightradar24_priority muss die prioritySourceUrl zusätzlich als identischer sources-Eintrag vorhanden sein.
15. checkedAt ist der tatsächliche Web-Prüfzeitpunkt in ISO-8601.
16. Diese Prüfung muss JETZT neu erfolgen. Frühere Antworten, gespeicherte LIVE-Werte oder ältere Snapshots nicht wiederverwenden. ATMS behandelt Web-LIVE-Prüfungen nach 15 Minuten als veraltet.
17. airportIata aus dem Prüfeintrag unverändert zurückgeben.
18. Antworte ausschließlich mit EINEM gültigen JSON-Objekt. Kein Markdown.

JSON-SCHEMA:
{
  "checkedAt":"ISO-8601",
  "flights":[{
    "flightNumber":"EW0000",
    "date":"YYYY-MM-DD",
    "airportEventDate":"YYYY-MM-DD",
    "airportEventDateDerived":false,
    "direction":"arrival|departure|unknown",
    "airportIata":"DUS|CGN|anderer IATA-Code|null",
    "status":"scheduled|on_time|delayed|departed|landed|cancelled|unknown",
    "airportScheduledTime":"HH:MM|null",
    "airportEstimatedTime":"HH:MM|null",
    "airportActualTime":"HH:MM|null",
    "delayMinutes":null,
    "confirmed":false,
    "sourceConflict":false,
    "resolutionMode":"consensus|flightradar24_priority|unconfirmed",
    "prioritySourceUrl":null,
    "sources":[{"name":"","url":""}],
    "sourceNote":""
  }]
}

Zu prüfen:
${JSON.stringify(items,null,2)}`;
}
async function copyLiveFlightPrompt(){
  try{
    const pending=liveFlightPendingPlanMeta();
    if(pending){
      const status=$('liveFlightImportStatus');
      if(status)status.textContent=`⚠ Neue Planliste mit ${Number(pending.rideCount||0)} Fahrt(en) noch nicht übernommen. Bitte zuerst „Geprüfte Fahrten übernehmen“. LIVE-Prüfung wurde nicht aus dem alten Fahrtenbestand kopiert.`;
      showToast('Neue Planliste zuerst übernehmen','warn');
      return;
    }
    updateLiveFlightPanelContext();
    const includeAll=Boolean($('liveFlightIncludeAll')?.checked);
    const source=includeAll?rides:liveFlightRelevantRides();
    const items=liveFlightCheckItems(source);
    const text=buildLiveFlightPrompt(includeAll);
    await navigator.clipboard.writeText(text);
    const status=$('liveFlightImportStatus');if(status)status.textContent=`${items.length} Live-Flugprüfung(en) kopiert · ${includeAll?'alle Flüge des Plantags':'nur aktuell relevante Flüge'}. Ergebnis danach unten einfügen.`;
    showToast('Live-Flugprüfauftrag kopiert','ok');
  }catch(e){
    const includeAll=Boolean($('liveFlightIncludeAll')?.checked);
    const text=(()=>{try{return buildLiveFlightPrompt(includeAll)}catch{return''}})();
    const box=$('liveFlightPromptFallback');if(box&&text){box.value=text;box.classList.remove('hidden');box.select();}
    const status=$('liveFlightImportStatus');if(status)status.textContent=String(e?.message||'Prompt konnte nicht kopiert werden.');
    showToast(String(e?.message||'Live-Prüfauftrag nicht verfügbar'),'warn');
  }
}
function strictClockOrNull(value){
  if(value===null||value===undefined||value==='')return null;
  const v=String(value).trim();
  return /^([01]?\d|2[0-3]):[0-5]\d$/.test(v)?v:null;
}
function minuteDeltaClock(from,to){
  const a=strictClockOrNull(from),b=strictClockOrNull(to);if(!a||!b)return null;
  const [ah,am]=a.split(':').map(Number),[bh,bm]=b.split(':').map(Number);
  let d=bh*60+bm-(ah*60+am);if(d<-720)d+=1440;if(d>720)d-=1440;return d;
}
function isFlightradar24Url(value){
  const raw=String(value||'').trim();if(!raw)return false;
  try{const host=new URL(raw,window.location.href).hostname.toLowerCase();return host==='flightradar24.com'||host.endsWith('.flightradar24.com');}catch{return false}
}
function parseLiveFlightResult(text){
  const obj=parseAtmsJsonObject(text,'Live-Flug-JSON');
  if(!obj||Array.isArray(obj)||typeof obj!=='object'||!Array.isArray(obj.flights)||!obj.flights.length)throw new Error('LIVE-FLIGHT-001 erwartet ein JSON-Objekt mit dem Feld "flights".');
  return obj.flights.map((x,index)=>{
    if(!x||typeof x!=='object'||Array.isArray(x))throw new Error(`Live-Flug ${index+1} ist ungültig.`);
    const flightNumber=flightCacheNumber(x.flightNumber);if(!flightNumber)throw new Error(`flightNumber bei Live-Flug ${index+1} fehlt.`);
    const date=String(x.date||'').trim();
    const airportEventDate=String(x.airportEventDate||date).trim();
    const airportEventDateDerived=Boolean(x.airportEventDateDerived);
    const direction=String(x.direction||'unknown').trim().toLowerCase();
    const airportIata=String(x.airportIata||'').trim().toUpperCase();
    if(airportIata&&!/^[A-Z]{3}$/.test(airportIata))throw new Error(`airportIata bei Live-Flug ${index+1} ist ungültig.`);
    const allowedStatus=new Set(['scheduled','on_time','delayed','departed','landed','cancelled','unknown']);
    const rawStatus=String(x.status||'unknown').trim().toLowerCase();
    let status=allowedStatus.has(rawStatus)?rawStatus:'unknown';
    // P20C compatibility guard: Ein Abflug mit altem/fehlerhaftem status=landed wird semantisch als departed behandelt.
    if(direction==='departure'&&status==='landed')status='departed';
    const sources=Array.isArray(x.sources)?x.sources.map(src=>({name:String(src?.name||'').trim(),url:String(src?.url||'').trim()})).filter(src=>src.name&&src.url):[];
    const uniqueSources=new Set(sources.map(src=>src.url.toLowerCase())).size;
    const sourceConflict=Boolean(x.sourceConflict);
    const allowedResolutionModes=new Set(['consensus','flightradar24_priority','unconfirmed']);
    const requestedResolution=String(x.resolutionMode||'consensus').trim().toLowerCase();
    const resolutionMode=allowedResolutionModes.has(requestedResolution)?requestedResolution:'unconfirmed';
    const prioritySourceUrl=String(x.prioritySourceUrl||'').trim();
    const priorityMatchesSource=Boolean(prioritySourceUrl)&&sources.some(src=>src.url.toLowerCase()===prioritySourceUrl.toLowerCase());
    const fr24PriorityValid=sourceConflict&&resolutionMode==='flightradar24_priority'&&priorityMatchesSource&&isFlightradar24Url(prioritySourceUrl);
    const consensusValid=!sourceConflict&&resolutionMode==='consensus';
    const confirmed=Boolean(x.confirmed)&&uniqueSources>=2&&status!=='unknown'&&(consensusValid||fr24PriorityValid);
    const scheduled=strictClockOrNull(x.airportScheduledTime??x.dusScheduledTime);
    const estimated=strictClockOrNull(x.airportEstimatedTime??x.dusEstimatedTime);
    const actual=strictClockOrNull(x.airportActualTime??x.dusActualTime);
    let delay=x.delayMinutes===null||x.delayMinutes===undefined||x.delayMinutes===''?null:Number(x.delayMinutes);
    if(!Number.isFinite(delay))delay=null;
    if(delay===null){const current=actual||estimated;if(scheduled&&current)delay=minuteDeltaClock(scheduled,current);}
    return {flightNumber,date,airportEventDate,airportEventDateDerived,direction,airportIata,status,airportScheduledTime:scheduled,airportEstimatedTime:estimated,airportActualTime:actual,delayMinutes:delay,confirmed,sourceConflict,resolutionMode,prioritySourceUrl:fr24PriorityValid?prioritySourceUrl:'',sources,sourceNote:String(x.sourceNote||'').trim(),reportedCheckedAt:String(obj.checkedAt||'').trim()};
  });
}
function livePickupFromCheck(ride,hit){
  if(!ride||!hit||!hit.confirmed)return'';
  if(hit.status==='cancelled')return'';
  if(hit.direction==='arrival'){
    const arrival=hit.airportActualTime||hit.airportEstimatedTime;
    return arrival?clockPlusMinutes(arrival,arrivalBufferMinutesForRide(ride)):'';
  }
  if(hit.direction==='departure'){
    // P28: Eine Abflugverspätung verschiebt niemals die Fahrer-Abholzeit.
    // Status, Estimated/Actual und delayMinutes bleiben als reine Fluginformation am Datensatz erhalten.
    return'';
  }
  return'';
}
function liveReportedCheckIsFresh(value){
  const raw=String(value||'').trim();if(!raw)return false;
  const d=new Date(raw);if(Number.isNaN(d.getTime()))return false;
  return Math.max(0,(Date.now()-d.getTime())/60000)<=ATMS_LIVE_FRESHNESS_MINUTES;
}
function hasCurrentWebLiveSnapshot(r){
  if(!r||r.liveManualConfirmed)return false;
  const status=String(r.liveFlightStatus||'').trim().toLowerCase();
  return Boolean(rawExplicitLiveTimeOf(r)||first(r.liveFlightActualTime,r.liveFlightEstimatedTime)||(!['','unknown'].includes(status))||r.liveCurrentConfirmed===true);
}
function liveHistoryPatchFromRide(r,archivedAt,reason){
  if(!hasCurrentWebLiveSnapshot(r))return{};
  return{
    liveHistoryTime:rawExplicitLiveTimeOf(r),
    liveHistoryFlightStatus:String(r.liveFlightStatus||r.flightStatus||'').trim(),
    liveHistoryDelayMinutes:r.delayMinutes===null||r.delayMinutes===undefined?null:Number(r.delayMinutes),
    liveHistoryScheduledTime:first(r.liveFlightScheduledTime),
    liveHistoryEstimatedTime:first(r.liveFlightEstimatedTime),
    liveHistoryActualTime:first(r.liveFlightActualTime),
    liveHistoryReportedCheckedAt:first(r.liveReportedCheckedAt,r.liveCheckedAt),
    liveHistoryImportedAt:first(r.liveCheckedAt),
    liveHistoryArchivedAt:String(archivedAt||new Date().toISOString()),
    liveHistoryReason:String(reason||'superseded'),
    liveHistorySourceNote:String(r.liveSourceNote||''),
    liveHistorySources:Array.isArray(r.liveSources)?r.liveSources:[],
    liveHistorySourceConflict:Boolean(r.liveSourceConflict),
    liveHistoryResolutionMode:String(r.liveResolutionMode||''),
    liveHistoryPrioritySourceUrl:String(r.livePrioritySourceUrl||'')
  };
}
function applyLiveFlightResult(){
  try{
    const box=$('liveFlightResult');
    const checked=parseLiveFlightResult(box?.value||'');
    const importedAt=new Date().toISOString();
    let updated=0,uncertain=0,archived=0,stalePayload=0,manualPreserved=0,currentLiveTimes=0;
    rides=rides.map(r=>{
      const flight=flightCacheNumber(r.flightNumber);if(!flight)return r;
      const date=String(r.date||'').trim();
      const eventContext=flightAirportEventDateContext(r);
      const airportEventDate=String(eventContext.airportEventDate||date).trim();
      const direction=flightDirectionForGemini(r);
      const airportIata=flightAirportForGemini(r);
      const candidates=checked.filter(x=>flightCacheNumber(x.flightNumber)===flight&&(!date||x.date===date)&&String(x.airportEventDate||x.date||'').trim()===airportEventDate&&x.direction===direction&&String(x.airportIata||'').trim().toUpperCase()===String(airportIata||'').trim().toUpperCase());
      if(candidates.length!==1)return r;
      const hit=candidates[0];
      const payloadFresh=liveReportedCheckIsFresh(hit.reportedCheckedAt);

      // Manuell bestätigte tatsächliche Landungen sind eine separate, explizite Disponentenentscheidung.
      // Eine spätere Webprüfung darf sie nicht still entwerten oder überschreiben.
      if(r.liveManualConfirmed){
        manualPreserved++;
        return norm({...r,
          liveLastWebCheckedAt:importedAt,
          liveLastWebReportedCheckedAt:hit.reportedCheckedAt||'',
          liveLastWebConfirmed:Boolean(hit.confirmed&&payloadFresh),
          liveLastWebStatus:hit.status||'unknown',
          liveLastWebSourceNote:hit.sourceNote||'',
          liveLastWebSources:hit.sources||[]
        },0);
      }

      const currentConfirmed=Boolean(hit.confirmed&&payloadFresh);
      if(!currentConfirmed){
        uncertain++;
        if(hit.confirmed&&!payloadFresh)stalePayload++;
        const history=liveHistoryPatchFromRide(r,importedAt,hit.confirmed&&!payloadFresh?'stale_new_snapshot':'new_unconfirmed_snapshot');
        if(Object.keys(history).length)archived++;
        return norm({...r,...history,
          liveTime:'',
          live_time:'',
          flightStatus:'unknown',
          delayMinutes:null,
          landed:false,
          liveFlightStatus:'unknown',
          liveFlightAirportIata:airportIata||'',
          liveFlightAirportEventDate:airportEventDate||'',
          liveFlightScheduledTime:'',
          liveFlightEstimatedTime:'',
          liveFlightActualTime:'',
          liveCheckedAt:importedAt,
          liveReportedCheckedAt:hit.reportedCheckedAt||'',
          liveCurrentConfirmed:false,
          liveCurrentSource:'web',
          liveSourceNote:hit.sourceNote||'',
          liveSources:hit.sources||[],
          liveSourceConflict:Boolean(hit.sourceConflict),
          liveResolutionMode:hit.resolutionMode||'unconfirmed',
          livePrioritySourceUrl:hit.prioritySourceUrl||''
        },0);
      }

      const history=liveHistoryPatchFromRide(r,importedAt,'superseded_by_new_confirmed_snapshot');
      if(Object.keys(history).length)archived++;
      const nextLive=livePickupFromCheck(r,hit);
      if(nextLive)currentLiveTimes++;
      const rawStatus=hit.status==='departed'?'departed':hit.status==='landed'?'landed':hit.status==='delayed'?'delayed':hit.status==='cancelled'?'cancelled':hit.status==='on_time'?'on-time':hit.status==='scheduled'?'scheduled':'unknown';
      updated++;
      return norm({...r,...history,
        liveTime:nextLive,
        live_time:nextLive,
        flightStatus:rawStatus,
        delayMinutes:hit.delayMinutes===null?null:(Number.isFinite(Number(hit.delayMinutes))?Number(hit.delayMinutes):null),
        landed:hit.status==='landed',
        liveFlightStatus:hit.status,
        liveFlightAirportIata:airportIata||'',
        liveFlightAirportEventDate:airportEventDate||'',
        liveFlightScheduledTime:hit.airportScheduledTime||'',
        liveFlightEstimatedTime:hit.airportEstimatedTime||'',
        liveFlightActualTime:hit.airportActualTime||'',
        liveCheckedAt:importedAt,
        liveReportedCheckedAt:hit.reportedCheckedAt||'',
        liveCurrentConfirmed:true,
        liveCurrentSource:'web',
        liveSourceNote:hit.sourceNote,
        liveSources:hit.sources,
        liveSourceConflict:Boolean(hit.sourceConflict),
        liveResolutionMode:hit.resolutionMode||'',
        livePrioritySourceUrl:hit.prioritySourceUrl||''
      },0);
    });
    save();render();scheduleLiveFreshnessRefresh();
    const reportedCheckedAt=checked.find(x=>String(x?.reportedCheckedAt||'').trim())?.reportedCheckedAt||'';
    try{localStorage.setItem(ATMS_LIVE_LAST_CHECK_META,JSON.stringify({reportedCheckedAt,importedAt,confirmedRides:updated,currentLiveTimes,uncertainRides:uncertain,archivedRides:archived,stalePayloadRides:stalePayload,manualPreserved,freshnessMinutes:ATMS_LIVE_FRESHNESS_MINUTES}))}catch(_){}
    if(box)box.value='';
    updateLiveApplyButtonState();
    updateLiveFlightPanelContext();
    const parts=[`${updated} Fahrt(en) mit bestätigten Live-Flugdaten aktualisiert`,`${currentLiveTimes} mit aktueller LIVE-Zeit`];
    if(uncertain)parts.push(`${uncertain} unsicher`);
    if(archived)parts.push(`${archived} alte LIVE-Werte archiviert`);
    if(stalePayload)parts.push(`${stalePayload} veraltete Prüfergebnisse nicht als aktuell übernommen`);
    if(manualPreserved)parts.push(`${manualPreserved} manuell bestätigt beibehalten`);
    const status=$('liveFlightImportStatus');if(status)status.textContent=`${parts.join(' · ')}. Neue Prüfung: zuerst „📡 Live-Prüfauftrag kopieren“.`;
    showToast(`${updated} aktuelle Live-Flugstatus übernommen · ${currentLiveTimes} mit LIVE-Zeit`,'ok');
  }catch(e){const status=$('liveFlightImportStatus');if(status)status.textContent='Fehler: '+e.message;showToast('Live-Flugergebnis ungültig','warn');}
}
function renderArrivalBufferSetting(){
  const input=$('liveArrivalBuffer');if(input&&document.activeElement!==input)input.value=String(globalArrivalBufferMinutes());
  const note=$('liveArrivalBufferNote');if(note)note.textContent=`Gilt global für alle Ankunftsflüge: bestätigte Landungszeit + ${globalArrivalBufferMinutes()} Min. = LIVE-Abholzeit.`;
}
function saveArrivalBufferSetting(){
  const input=$('liveArrivalBuffer');const raw=Number(input?.value);
  if(!Number.isFinite(raw)||raw<0||raw>120){showToast('Puffer bitte zwischen 0 und 120 Minuten eingeben','warn');return}
  const buffer=Math.round(raw),s=getLiveSettings();s.arrivalPickupBufferMinutes=buffer;saveLiveSettings(s);
  let recalculated=0;
  rides=rides.map(r=>{
    if(flightDirectionForGemini(r)!=='arrival'||String(r.liveFlightStatus||'').toLowerCase()==='cancelled')return r;
    const freshness=liveSnapshotFreshness(r);
    if(!freshness.usable&&!r.liveManualConfirmed)return r;
    const arrival=first(r.liveFlightActualTime,r.liveFlightEstimatedTime,actualLandingTimeOf(r));
    if(!arrival)return r;
    const live=clockPlusMinutes(arrival,buffer);if(!live)return r;
    recalculated++;
    return norm({...r,liveTime:live,live_time:live},0);
  });
  if(recalculated){save();render();}
  renderArrivalBufferSetting();
  const status=$('liveArrivalBufferNote');if(status)status.textContent=`Gilt global für alle Ankunftsflüge: bestätigte Landungszeit + ${buffer} Min. = LIVE-Abholzeit.${recalculated?` ${recalculated} vorhandene LIVE-Fahrt(en) neu berechnet.`:''}`;
  showToast(`Arrival-Puffer: ${buffer} Min. gespeichert`,'ok');
}
function manualFlightIdentityForRide(r,direction){
  const date=String(r?.date||'').trim();
  const event=flightAirportEventDateContext(r);
  const airportEventDate=String(event?.airportEventDate||date).trim();
  const airportIata=String(flightAirportForGemini(r)||'').trim().toUpperCase();
  const flightTime=String(listedFlightTimeOf(r)||'').trim();
  return{date,airportEventDate,direction:String(direction||'').trim(),airportIata,flightTime,key:[date,airportEventDate,String(direction||'').trim(),airportIata,flightTime].join('|')};
}
function exactManualFlightMatches(flight,direction){
  const number=flightCacheNumber(flight);
  const candidates=rides.filter(r=>flightCacheNumber(r.flightNumber)===number&&flightDirectionForGemini(r)===direction);
  if(!candidates.length)throw new Error(`${number} wurde in den gespeicherten ${direction==='arrival'?'Ankunfts':'Abflugs'}fahrten nicht gefunden.`);
  const groups=new Map();
  for(const r of candidates){
    const identity=manualFlightIdentityForRide(r,direction);
    if(!identity.date||!identity.airportEventDate||!identity.airportIata)throw new Error(`${number}: Datum oder Flughafen ist für die manuelle Bestätigung nicht eindeutig. Keine automatische Zuordnung.`);
    if(!groups.has(identity.key))groups.set(identity.key,{identity,rides:[]});
    groups.get(identity.key).rides.push(r);
  }
  if(groups.size!==1){
    const labels=[...groups.values()].map(g=>`${g.identity.airportIata} · ${g.identity.airportEventDate}${g.identity.flightTime?` · Flugzeit ${g.identity.flightTime}`:''}`);
    throw new Error(`${number} ist in mehreren Flugidentitäten vorhanden (${labels.join(' / ')}). Manuelle Übernahme aus Sicherheitsgründen blockiert.`);
  }
  return [...groups.values()][0];
}
function applyManualArrivalLanding(){
  try{
    const flight=flightCacheNumber($('manualArrivalFlight')?.value||'');
    const actual=strictClockOrNull($('manualArrivalTime')?.value||'');
    if(!flight)throw new Error('Bitte eine Flugnummer eingeben.');
    if(!actual)throw new Error('Bitte die bestätigte Landungszeit als HH:MM eingeben.');
    const group=exactManualFlightMatches(flight,'arrival');
    const ids=new Set(group.rides.map(r=>String(r.id)));
    const buffer=globalArrivalBufferMinutes();
    const live=clockPlusMinutes(actual,buffer);
    const checkedAt=new Date().toISOString();
    let updated=0;
    rides=rides.map(r=>{
      if(!ids.has(String(r.id)))return r;
      updated++;
      const history=liveHistoryPatchFromRide(r,checkedAt,'manual_arrival_confirmation');
      return norm({...r,...history,
        actualLandingTime:actual,
        actualDepartureTime:'',
        liveTime:live,
        live_time:live,
        flightStatus:'landed',
        delayMinutes:null,
        landed:true,
        liveFlightStatus:'landed',
        liveFlightScheduledTime:'',
        liveFlightEstimatedTime:'',
        liveFlightActualTime:actual,
        liveFlightAirportIata:group.identity.airportIata,
        liveFlightAirportEventDate:group.identity.airportEventDate,
        liveCheckedAt:checkedAt,
        liveReportedCheckedAt:checkedAt,
        liveCurrentConfirmed:true,
        liveCurrentSource:'manual',
        liveManualConfirmed:true,
        liveManualType:'arrival',
        liveSourceNote:'Landungszeit manuell vom Disponenten bestätigt.',
        liveSources:[]
      },0);
    });
    save();render();scheduleLiveFreshnessRefresh();
    const status=$('manualArrivalStatus');if(status)status.textContent=`${updated} Fahrt(en) aktualisiert · Landung ${actual} + ${buffer} Min. = LIVE ${live}.`;
    showToast(`${flight}: Landung ${actual} · LIVE ${live}`,'ok');
  }catch(e){const status=$('manualArrivalStatus');if(status)status.textContent='Fehler: '+e.message;showToast('Manuelle Landungszeit nicht übernommen','warn')}
}
function applyManualDeparture(){
  try{
    const flight=flightCacheNumber($('manualDepartureFlight')?.value||'');
    const actual=strictClockOrNull($('manualDepartureTime')?.value||'');
    if(!flight)throw new Error('Bitte eine Flugnummer eingeben.');
    if(!actual)throw new Error('Bitte die bestätigte Abflugzeit als HH:MM eingeben.');
    const group=exactManualFlightMatches(flight,'departure');
    const ids=new Set(group.rides.map(r=>String(r.id)));
    const checkedAt=new Date().toISOString();
    let updated=0;
    rides=rides.map(r=>{
      if(!ids.has(String(r.id)))return r;
      updated++;
      const history=liveHistoryPatchFromRide(r,checkedAt,'manual_departure_confirmation');
      return norm({...r,...history,
        actualLandingTime:'',
        actualDepartureTime:actual,
        liveTime:'',
        live_time:'',
        flightStatus:'departed',
        delayMinutes:null,
        landed:false,
        liveFlightStatus:'departed',
        liveFlightScheduledTime:'',
        liveFlightEstimatedTime:'',
        liveFlightActualTime:actual,
        liveFlightAirportIata:group.identity.airportIata,
        liveFlightAirportEventDate:group.identity.airportEventDate,
        liveCheckedAt:checkedAt,
        liveReportedCheckedAt:checkedAt,
        liveCurrentConfirmed:true,
        liveCurrentSource:'manual',
        liveManualConfirmed:true,
        liveManualType:'departure',
        liveSourceNote:'Abflugzeit manuell vom Disponenten bestätigt.',
        liveSources:[]
      },0);
    });
    save();render();scheduleLiveFreshnessRefresh();
    const status=$('manualDepartureStatus');if(status)status.textContent=`${updated} Fahrt(en) aktualisiert · Abflug ${actual} manuell bestätigt. PLAN/DISPO bleiben unverändert.`;
    showToast(`${flight}: Abflug ${actual} bestätigt`,'ok');
  }catch(e){const status=$('manualDepartureStatus');if(status)status.textContent='Fehler: '+e.message;showToast('Manuelle Abflugzeit nicht übernommen','warn')}
}

function ensureLiveFlightPanel(){
  ensureMobileImportLayoutFix();
  if($('liveFlightPanel'))return;
  const view=$('importView'),host=$('importToolsHost');if(!view)return;
  const panel=document.createElement('section');panel.id='liveFlightPanel';panel.style.cssText='margin:16px 0;padding:14px;border:1px solid rgba(52,199,255,.32);border-radius:14px;background:rgba(10,80,110,.10)';
  panel.innerHTML=`<div style="font-weight:800;margin-bottom:6px">📡 Live-Flugdaten</div><div style="font-size:13px;opacity:.82;margin-bottom:8px">Aktuellen Status prüfen, ohne PLAN oder DISPO zu überschreiben. LIVE bleibt ein eigenes Zeitfeld.</div><div id="liveFlightContextStatus" style="font-size:12px;font-weight:800;line-height:1.45;margin-bottom:3px">Aktueller Fahrtenbestand wird ermittelt …</div><div id="liveFlightLastCheck" style="font-size:12px;opacity:.78;line-height:1.45;margin-bottom:3px">Letzte LIVE-Prüfung: –</div><div style="font-size:11px;opacity:.7;line-height:1.4;margin-bottom:10px">Web-LIVE gilt 15 Min. als aktuell. Danach wird es nicht mehr für LIVE-Zeit oder Live-Dispo verwendet. Manuell bestätigte Landungen und Abflüge bleiben erhalten.</div><div style="padding:10px;border:1px solid rgba(255,255,255,.14);border-radius:10px;margin-bottom:10px"><div style="font-weight:800;margin-bottom:6px">⏱ Standard-Abholpuffer nach Landung</div><div style="display:flex;gap:8px;align-items:center"><input id="liveArrivalBuffer" type="number" min="0" max="120" step="1" inputmode="numeric" style="width:90px;padding:10px;border-radius:9px"><span>Minuten</span><button type="button" id="saveLiveArrivalBufferBtn" style="margin-left:auto;padding:10px 12px;border-radius:9px;font-weight:800">Speichern</button></div><div id="liveArrivalBufferNote" style="font-size:12px;opacity:.8;margin-top:6px"></div></div><div id="liveFlightScopeHint" style="font-size:12px;opacity:.78;line-height:1.45;margin:0 0 7px">Prüfumfang wird ermittelt …</div><label style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:750;margin:0 0 9px"><input id="liveFlightIncludeAll" type="checkbox"><span id="liveFlightIncludeAllLabel">Alle Flüge des Plantags einbeziehen</span></label><button type="button" id="nativeLiveStatusBtn" style="width:100%;padding:12px;border-radius:10px;font-weight:850">📡 Native LIVE automatisch prüfen</button><div id="nativeLiveStatusStatus" style="font-size:12px;opacity:.82;line-height:1.45;margin-top:8px">Noch keine Native Zwei-Quellen-LIVE-Prüfung durchgeführt.</div><div style="height:1px;background:rgba(255,255,255,.12);margin:14px 0"></div><div style="font-size:11px;opacity:.72;line-height:1.4;margin-bottom:8px">Fallback für vollständige Web-LIVE-Prüfung inklusive Zeitfeldern:</div><button type="button" id="copyLiveFlightBtn" style="width:100%;padding:12px;border-radius:10px;font-weight:800">📡 Live-Prüfauftrag kopieren</button><textarea id="liveFlightPromptFallback" class="hidden" style="width:100%;min-height:120px;margin-top:10px" readonly></textarea><textarea id="liveFlightResult" placeholder="Live-Flug-JSON hier einfügen" style="width:100%;min-height:120px;margin-top:10px"></textarea><button type="button" id="applyLiveFlightBtn" disabled aria-disabled="true" style="width:100%;padding:12px;border-radius:10px;font-weight:800;margin-top:8px">✓ Live-Flugdaten übernehmen</button><div id="liveFlightImportStatus" style="font-size:12px;opacity:.8;margin-top:8px">Noch keine Live-Flugprüfung durchgeführt.</div><div style="height:1px;background:rgba(255,255,255,.12);margin:14px 0"></div><div style="font-weight:800;margin-bottom:6px">✋ Manuell bestätigte Landung</div><div style="font-size:12px;opacity:.8;margin-bottom:8px">Für eine vom Disponenten z. B. in Flightradar24 eindeutig bestätigte Landungszeit. Nutzt den globalen Puffer oben.</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><input id="manualArrivalFlight" placeholder="Flugnr. z. B. EW9841" autocomplete="off" style="padding:10px;border-radius:9px;min-width:0"><input id="manualArrivalTime" type="time" step="60" style="padding:10px;border-radius:9px;min-width:0"></div><button type="button" id="applyManualArrivalBtn" style="width:100%;padding:12px;border-radius:10px;font-weight:800;margin-top:8px">✓ Bestätigte Landung übernehmen</button><div id="manualArrivalStatus" style="font-size:12px;opacity:.8;margin-top:8px">Noch keine manuelle Landungszeit übernommen.</div><div style="height:1px;background:rgba(255,255,255,.12);margin:14px 0"></div><div style="font-weight:800;margin-bottom:6px">✋ Manuell bestätigter Abflug</div><div style="font-size:12px;opacity:.8;margin-bottom:8px">Für einen vom Disponenten z. B. in Flightradar24 eindeutig bestätigten tatsächlichen Abflug. Ändert PLAN/DISPO nicht und verwendet keinen Landepuffer.</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><input id="manualDepartureFlight" placeholder="Flugnr. z. B. EW9752" autocomplete="off" style="padding:10px;border-radius:9px;min-width:0"><input id="manualDepartureTime" type="time" step="60" style="padding:10px;border-radius:9px;min-width:0"></div><button type="button" id="applyManualDepartureBtn" style="width:100%;padding:12px;border-radius:10px;font-weight:800;margin-top:8px">✓ Bestätigten Abflug übernehmen</button><div id="manualDepartureStatus" style="font-size:12px;opacity:.8;margin-top:8px">Noch keine manuelle Abflugzeit übernommen.</div>`;
  const anchor=$('geminiFlightPanel');
  if(anchor&&anchor.parentElement===host)anchor.insertAdjacentElement('afterend',panel);else if(host)host.appendChild(panel);else if(anchor)anchor.insertAdjacentElement('afterend',panel);else view.appendChild(panel);
  $('nativeLiveStatusBtn')?.addEventListener('click',runNativeLiveStatusCheck);
  $('copyLiveFlightBtn')?.addEventListener('click',copyLiveFlightPrompt);
  $('liveFlightIncludeAll')?.addEventListener('change',updateLiveFlightPanelContext);
  $('applyLiveFlightBtn')?.addEventListener('click',applyLiveFlightResult);
  installJsonInputGuard('liveFlightResult','liveFlightImportStatus','Live-Flug-JSON');
  $('liveFlightResult')?.addEventListener('input',updateLiveApplyButtonState);
  window.addEventListener('atms:plan-import-live-guard',updateLiveFlightPanelContext);
  $('saveLiveArrivalBufferBtn')?.addEventListener('click',saveArrivalBufferSetting);
  $('applyManualArrivalBtn')?.addEventListener('click',applyManualArrivalLanding);
  $('applyManualDepartureBtn')?.addEventListener('click',applyManualDeparture);
  updateLiveApplyButtonState();
  updateLiveFlightPanelContext();
  renderArrivalBufferSetting();
}

/* CORE-006A – Planimport nur nach explizitem, echtem Nutzer-Klick */
let atmsPlanImportAuthorization={armed:false,source:'',at:0};
// P36F1: separate langlebigere Freigabe ausschließlich für die vom echten Analyse-Klick
// gestartete asynchrone Clean-Plan-/Auto-Flight-Pipeline. Die eigentliche Schreibfreigabe
// bleibt weiterhin CORE-006A-kurzlebig (5 s) und wird erst direkt vor applyImportedRides() erzeugt.
let atmsCleanPlanAutoImportAuthorization={armed:false,source:'',at:0,phase:''};
const ATMS_CLEAN_PLAN_AUTO_IMPORT_MAX_AGE_MS=15*60*1000;

function armPlanImportAuthorization(source){
  atmsPlanImportAuthorization={
    armed:true,
    source:String(source||''),
    at:Date.now()
  };
  persistAudit('plan_import_authorized',{source:String(source||'')});
}
function consumePlanImportAuthorization(){
  const auth=atmsPlanImportAuthorization;
  atmsPlanImportAuthorization={armed:false,source:'',at:0};
  const age=Date.now()-Number(auth?.at||0);
  return {
    ok:Boolean(auth?.armed)&&age>=0&&age<=5000,
    source:String(auth?.source||''),
    ageMs:Number.isFinite(age)?age:null
  };
}
function armCleanPlanAutoImportAuthorization(source){
  atmsCleanPlanAutoImportAuthorization={
    armed:true,
    source:String(source||''),
    at:Date.now(),
    phase:'analysis'
  };
  persistAudit('clean_plan_auto_import_authorized',{source:String(source||'')});
}
function clearCleanPlanAutoImportAuthorization(){
  atmsCleanPlanAutoImportAuthorization={armed:false,source:'',at:0,phase:''};
}
function authorizeCleanPlanAutoImport(){
  const auth=atmsCleanPlanAutoImportAuthorization;
  const age=Date.now()-Number(auth?.at||0);
  const ok=Boolean(auth?.armed)
    && auth?.source==='analyzePlanBtn'
    && auth?.phase==='analysis'
    && age>=0
    && age<=ATMS_CLEAN_PLAN_AUTO_IMPORT_MAX_AGE_MS;
  if(!ok){
    if(age<0||age>ATMS_CLEAN_PLAN_AUTO_IMPORT_MAX_AGE_MS)clearCleanPlanAutoImportAuthorization();
    persistAudit('clean_plan_auto_import_gate_blocked',{source:String(auth?.source||''),phase:String(auth?.phase||''),ageMs:Number.isFinite(age)?age:null});
    return{ok:false,source:String(auth?.source||''),ageMs:Number.isFinite(age)?age:null};
  }
  atmsCleanPlanAutoImportAuthorization={...auth,phase:'pipeline'};
  persistAudit('clean_plan_auto_import_pipeline_started',{source:auth.source,ageMs:age});
  return{ok:true,source:auth.source,ageMs:age};
}
function authorizeFinalCleanPlanAutoImport(){
  const auth=atmsCleanPlanAutoImportAuthorization;
  const age=Date.now()-Number(auth?.at||0);
  const ok=Boolean(auth?.armed)
    && auth?.source==='analyzePlanBtn'
    && auth?.phase==='pipeline'
    && age>=0
    && age<=ATMS_CLEAN_PLAN_AUTO_IMPORT_MAX_AGE_MS;
  clearCleanPlanAutoImportAuthorization();
  if(!ok){
    persistAudit('clean_plan_auto_import_final_blocked',{source:String(auth?.source||''),phase:String(auth?.phase||''),ageMs:Number.isFinite(age)?age:null});
    return{ok:false,source:String(auth?.source||''),ageMs:Number.isFinite(age)?age:null};
  }
  // Unmittelbar vor dem bestehenden applyImportedRides()-Guard eine normale,
  // nur 5 Sekunden gültige CORE-006A-Freigabe erzeugen. So wird die Sicherheit
  // nicht gelockert, obwohl Flug-/OCR-Prüfungen asynchron länger dauern dürfen.
  armPlanImportAuthorization('clean-plan-auto');
  persistAudit('clean_plan_auto_import_final_authorized',{source:auth.source,ageMs:age});
  return{ok:true,source:auth.source,ageMs:age};
}
window.ATMSAuthorizeCleanPlanAutoImport=authorizeCleanPlanAutoImport;
window.ATMSAuthorizeFinalCleanPlanAutoImport=authorizeFinalCleanPlanAutoImport;

function installPlanImportTrustedClickGuard(){
  if(window.__atmsPlanImportTrustedClickGuard)return;
  document.addEventListener('click',event=>{
    const target=event.target instanceof Element?event.target:event.target?.parentElement;
    const button=target?.closest?.('#analyzePlanBtn,#importPlanBtn,#loadBtn');
    if(!button)return;

    // Programmgesteuerte .click()-Aufrufe sind nicht vertrauenswürdig und dürfen
    // weder Analyse-Automatik noch plan-import.js/Legacy-JSON-Import autorisieren.
    if(event.isTrusted!==true){
      event.preventDefault();
      event.stopImmediatePropagation();
      persistAudit('plan_import_untrusted_click_blocked',{source:button.id||''});
      try{showToast('Automatischer Planimport aus Sicherheitsgründen blockiert','warn')}catch(_){}
      return;
    }
    if(button.id==='analyzePlanBtn'){
      armCleanPlanAutoImportAuthorization(button.id);
      return;
    }
    armPlanImportAuthorization(button.id||'');
  },true);
  window.__atmsPlanImportTrustedClickGuard=true;
}
installPlanImportTrustedClickGuard();

function restoreCurrentRidesAfterBlockedImport(){
  try{
    safePersistentSetItem(KEY,JSON.stringify(Array.isArray(rides)?rides:[]),'blocked-plan-import-rides');
    safePersistentSetItem(DONE,JSON.stringify([...done]),'blocked-plan-import-done');
    capturePersistenceSafety('blocked-plan-import');
    syncPersistenceDurableShadow('blocked-plan-import');
  }catch(_){}
}
function readPlanImportHistory(){try{const x=JSON.parse(localStorage.getItem(PLAN_IMPORT_HISTORY)||'[]');return Array.isArray(x)?x:[]}catch(_){return[]}}
function savePlanImportHistory(list,reason='plan-import-history'){const next=Array.isArray(list)?list.slice(-40):[];return safePersistentSetItem(PLAN_IMPORT_HISTORY,JSON.stringify(next),reason)}
function currentPlanImportSession(){try{return JSON.parse(localStorage.getItem(PLAN_IMPORT_CURRENT)||'null')}catch(_){return null}}
function planImportSessionId(){return `plan-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}
function planImportNorm(v){return String(v??'').trim().toLowerCase().replace(/\s+/g,' ')}
// P93: Ein sehr enges OCR-Symbolartefakt darf nur durch eine gleichzeitige Geschwisterzeile
// derselben Fahrtengruppe bestätigt werden. Beispielklasse: zwei Buchstaben + ™, wobei die
// exakt passende Geschwisterzeile den daraus abgeleiteten Drei-Buchstaben-IATA-Code trägt.
// Ohne Geschwisterbeleg bleibt der Routentext unangetastet.
function p93CompactAirportArtifactCandidate(value){
  const raw=String(value??'').trim().toUpperCase().replace(/\s+/g,'');
  const match=raw.match(/^([A-Z]{2})™$/u);
  if(!match)return'';
  const candidate=`${match[1]}M`;
  return flightAirportIataFromPlace(candidate)===candidate?candidate:'';
}
function p93SiblingRouteGroupKey(r){
  return [
    String(first(r?.date,r?.datum)||'').trim()||berlinDate(),
    String(planTimeOf(r)||'').trim(),
    flightCacheNumber(r?.flightNumber||''),
    planImportNorm(r?.driver||r?.fahrer),
    planImportNorm(r?.company||r?.firma||r?.partner||r?.airline)
  ].join('|');
}
function p93NormalizeSiblingRouteArtifacts(source){
  const list=(Array.isArray(source)?source:[]).map(r=>({...r}));
  if(list.length<2)return list;
  const groups=new Map();
  list.forEach((r,index)=>{const key=p93SiblingRouteGroupKey(r);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(index)});
  for(const indexes of groups.values()){
    if(indexes.length<2)continue;
    for(const index of indexes){
      const ride=list[index];
      for(const field of ['pickup','destination']){
        const candidate=p93CompactAirportArtifactCandidate(ride?.[field]);
        if(!candidate)continue;
        const confirmed=indexes.some(otherIndex=>{
          if(otherIndex===index)return false;
          const peer=list[otherIndex];
          return flightAirportIataFromPlace(peer?.[field])===candidate;
        });
        if(!confirmed)continue;
        ride[field]=candidate;
        const trace=Array.isArray(ride._p93RouteOcrNormalized)?ride._p93RouteOcrNormalized.slice():[];
        trace.push({field,from:String(source?.[index]?.[field]??''),to:candidate,reason:'sibling_confirmed_airport_ocr_artifact'});
        ride._p93RouteOcrNormalized=trace;
      }
    }
  }
  return list;
}
function planImportRideIdentity(r){
  const date=String(first(r?.date,r?.datum)||'').trim()||berlinDate();
  const flight=flightCacheNumber(r?.flightNumber||'');
  const dir=flight?String(flightDirectionForGemini(r)||'unknown'):'';
  const airport=flight?String(flightAirportForGemini(r)||'').toUpperCase():'';
  const pickup=planImportNorm(r?.pickup),destination=planImportNorm(r?.destination);
  const flightTime=flight?String(listedFlightTimeOf(r)||'').trim():'';
  const rideTime=String(planTimeOf(r)||'').trim();
  return flight
    ? ['flight',date,flight,dir,airport,pickup,destination,flightTime||rideTime].join('|')
    : ['ride',date,rideTime,pickup,destination].join('|');
}
// P73: stabile reale Fahrt auch dann wiedererkennen, wenn sich in einer späteren
// überlappenden Planversion nur die Listen-Flugzeit korrigiert hat. Fahrer + DISPO-Zeit
// + Route bleiben dabei zwingend Bestandteil der Identität, damit parallele Fahrzeuge
// desselben Fluges (z. B. Yaser/Leon) nicht miteinander verschmolzen werden.
function planImportStableRideIdentity(r){
  const date=String(first(r?.date,r?.datum)||'').trim()||berlinDate();
  const flight=flightCacheNumber(r?.flightNumber||'');
  const dir=flight?String(flightDirectionForGemini(r)||'unknown'):'';
  const airport=flight?String(flightAirportForGemini(r)||'').toUpperCase():'';
  const pickup=planImportNorm(r?.pickup),destination=planImportNorm(r?.destination);
  const rideTime=String(planTimeOf(r)||'').trim();
  const driver=planImportNorm(r?.driver||r?.fahrer);
  return flight
    ? ['stable-flight',date,flight,dir,airport,rideTime,pickup,destination,driver].join('|')
    : ['stable-ride',date,rideTime,pickup,destination,driver].join('|');
}
// P99: dieselbe Bild-/Planquellzeile darf nach einer sicheren OCR-/Datums-Korrektur
// nicht als neue Fahrt neben der alten Variante stehen bleiben. Datei + Quellzeile +
// Plantag sind hier die staerkste Herkunftsidentitaet; die eigentlichen Fahrtdaten bleiben
// absichtlich ausserhalb, weil Zeit, Fahrt-Datum, Route, Flug/Firma usw. durch eine spaetere
// sichere OCR-/Importkorrektur gerade geaendert werden koennen. Ohne expliziten Plantag gilt
// die Regel nicht (fail closed fuer Alt-/Fremdimporte).
function planImportSourceRowIdentity(r){
  const sourceFile=planImportNorm(r?.sourceFile);
  const sourceRow=Number(r?.sourceRow||0)||0;
  const planDate=String(r?.planDate||r?.plan_date||'').trim();
  if(!sourceFile||sourceRow<=0||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(planDate))return'';
  return ['source-row',sourceFile,sourceRow,planDate].join('|');
}
// P99.1: extrem enger Fallback nur fuer bereits als fehlend markierte Carryover-Altvarianten.
// Die fachliche Kernidentitaet ignoriert bewusst Datum/Flugmetadaten; die separaten Guards unten
// erlauben aber nur gleichen Tag oder die konkrete Plantag->Folgetag-Korrektur einer Fruehfahrt.
function planImportLegacyFlightCoreIdentity(r){
  const flight=flightCacheNumber(r?.flightNumber||'');
  if(!flight)return'';
  const direction=String(first(r?.flightDirection,flightDirectionForGemini(r))||'unknown').trim().toLowerCase();
  // P99.2: Aeltere Importe haben den sichtbaren Partner teils nur in `partner`/`airline`
  // gespeichert, waehrend neuere Importe denselben Wert zusaetzlich in `customer` tragen.
  // Fuer diesen extrem engen Legacy-Fallback wird deshalb die fachliche Partner/Kundenrolle
  // einmal kanonisch normalisiert; `company/firma` bleibt bewusst ein separates Pflichtmerkmal.
  const partnerCustomer=planImportNorm(first(r?.partner,r?.airline,r?.customer,r?.kunde));
  const company=planImportNorm(first(r?.company,r?.firma));
  return [
    'legacy-flight-core',flight,direction,String(planTimeOf(r)||'').trim(),
    planImportNorm(r?.driver||r?.fahrer),
    planImportNorm(r?.pickup||r?.abholort),
    planImportNorm(r?.destination||r?.zielort||r?.ziel),
    partnerCustomer,
    company,
    planImportNorm(r?.vehicle||r?.fahrzeug),
    String(Number(r?.persons||r?.personen||0)),
    String(Number(r?.price||r?.preis||0).toFixed(2)),
    planImportNorm(r?.currency||'EUR')
  ].join('|');
}
function planImportIsoDatePlusOne(date){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(date||'')))return'';
  const d=new Date(`${date}T00:00:00Z`);if(Number.isNaN(d.getTime()))return'';
  d.setUTCDate(d.getUTCDate()+1);return d.toISOString().slice(0,10);
}
function planImportLegacyDateCompatible(oldRide,newRide){
  const oldDate=String(first(oldRide?.date,oldRide?.datum)||'').trim();
  const newDate=String(first(newRide?.date,newRide?.datum)||'').trim();
  if(!oldDate||!newDate)return false;
  if(oldDate===newDate)return true;
  const planDate=String(newRide?.planDate||newRide?.plan_date||'').trim();
  const rideMinute=p77LegacyMinutes(planTimeOf(newRide));
  if(!planDate||rideMinute===null||rideMinute>=360)return false;
  return oldDate===planDate&&newDate===planImportIsoDatePlusOne(planDate);
}
function planImportResolvedFlightPlace(r){
  const location=planImportNorm(r?.flightLocation||r?.flugort);
  const iata=String(r?.iata||'').trim().toUpperCase();
  return Boolean((location&&!/nicht verfuegbar|nicht verfügbar|unknown|unbekannt/.test(location))||/^[A-Z]{3}$/.test(iata));
}
function planImportLegacyFlightMetadataInferior(oldRide,newRide){
  if(planImportResolvedFlightPlace(oldRide)||!planImportResolvedFlightPlace(newRide))return false;
  const oldPlan=String(planTimeOf(oldRide)||'').trim();
  const oldFlight=String(listedFlightTimeOf(oldRide)||'').trim();
  const newPlan=String(planTimeOf(newRide)||'').trim();
  const newFlight=String(listedFlightTimeOf(newRide)||'').trim();
  if(!newFlight||newFlight===newPlan)return false;
  // Altvariante ist nur beweisbar schlechter, wenn ihre Listen-Flugzeit fehlt oder exakt
  // auf die Fahrtzeit kollabiert ist; abweichende echte Flugzeiten werden nie automatisch entfernt.
  return !oldFlight||oldFlight===oldPlan;
}
// P77 – one-time Legacy-Dedupe mit fail-closed Beweiskette.
// Die Migration ist absichtlich enger als P73: sie bereinigt nur bereits vorhandene
// Altstände und verändert die normale Import-Matchinglogik nicht.
function p77LegacyMinutes(value){
  const m=String(value||'').trim().match(/^(\d{1,2}):(\d{2})$/);
  if(!m)return null;
  const h=Number(m[1]),min=Number(m[2]);
  return h>=0&&h<24&&min>=0&&min<60?h*60+min:null;
}
function p77LegacyMinuteDistance(a,b){
  if(a===null||b===null)return null;
  const d=Math.abs(a-b);return Math.min(d,1440-d);
}
function p77LegacyImportStamp(r){
  const m=String(r?.id||'').match(/^import-(\d+)-/);
  return m?Number(m[1]):0;
}
function p77LegacyIsBundle(r){
  return Boolean(isBundleRide(r)||(Array.isArray(r?.bundleStops)&&r.bundleStops.length>1));
}
function p77LegacyRevisionKey(r){
  const flight=flightCacheNumber(r?.flightNumber||'');
  if(!flight)return'';
  const date=String(first(r?.date,r?.datum)||'').trim();
  const direction=String(first(r?.flightDirection,flightDirectionForGemini(r))||'').trim().toLowerCase();
  const parts=[
    date,flight,direction,
    planImportNorm(r?.driver||r?.fahrer),
    planImportNorm(r?.pickup||r?.abholort),
    planImportNorm(r?.destination||r?.zielort||r?.ziel),
    planImportNorm(r?.company||r?.firma||r?.partner),
    planImportNorm(r?.customer||r?.kunde),
    planImportNorm(r?.vehicle||r?.fahrzeug),
    String(Number(r?.persons||r?.personen||0)),
    String(Number(r?.price||r?.preis||0).toFixed(2)),
    planImportNorm(r?.currency||'EUR')
  ];
  return parts.join('|');
}
function p77LegacySourceCoverage(current,date,sourceFile){
  const times=(current||[])
    .filter(r=>String(first(r?.date,r?.datum)||'').trim()===date&&String(r?.sourceFile||'').trim()===sourceFile)
    .map(r=>p77LegacyMinutes(planTimeOf(r)))
    .filter(v=>v!==null);
  if(times.length<2)return null;
  return{min:Math.min(...times),max:Math.max(...times),count:times.length};
}
function p77RunLegacyDedupeMigration(current){
  const input=Array.isArray(current)?current:[];
  let previous=null;
  try{previous=JSON.parse(localStorage.getItem(P77_LEGACY_DEDUPE_MIGRATION_KEY)||'null')}catch(_){ }
  if(previous?.completed)return{rides:input,changed:false,removed:[],status:previous};

  const buckets=new Map();
  input.forEach(r=>{
    const key=p77LegacyRevisionKey(r);if(!key)return;
    if(!buckets.has(key))buckets.set(key,[]);
    buckets.get(key).push(r);
  });
  const removals=[];
  for(const group of buckets.values()){
    // Mehrdeutige Gruppen sowie Einzelfahrten bleiben immer unangetastet.
    if(group.length!==2)continue;
    const [a,b]=group;
    if(group.some(r=>p77LegacyIsBundle(r)))continue;
    if(group.some(r=>r?._planCarryover!==true||r?._planMissingFromLatest!==true))continue;
    const sourceA=String(a?.sourceFile||'').trim(),sourceB=String(b?.sourceFile||'').trim();
    if(!sourceA||!sourceB||sourceA===sourceB)continue;
    const stampA=p77LegacyImportStamp(a),stampB=p77LegacyImportStamp(b);
    if(!stampA||!stampB||stampA===stampB)continue;
    const newer=stampA>stampB?a:b,older=stampA>stampB?b:a;

    const newerPlan=String(planTimeOf(newer)||'').trim(),olderPlan=String(planTimeOf(older)||'').trim();
    const newerFlight=String(listedFlightTimeOf(newer)||'').trim(),olderFlight=String(listedFlightTimeOf(older)||'').trim();
    const planSame=newerPlan===olderPlan,flightSame=newerFlight===olderFlight;
    const planDelta=p77LegacyMinuteDistance(p77LegacyMinutes(newerPlan),p77LegacyMinutes(olderPlan));
    const flightDelta=p77LegacyMinuteDistance(p77LegacyMinutes(newerFlight),p77LegacyMinutes(olderFlight));
    const safeFlightCorrection=planSame&&!flightSame&&flightDelta!==null&&flightDelta>0&&flightDelta<=15;
    const safePlanCorrection=flightSame&&!planSame&&planDelta!==null&&planDelta>0&&planDelta<=45;
    // Wenn beide Zeitachsen gleichzeitig wechseln oder keine enge Korrektur beweisbar ist: nichts tun.
    if(!(safeFlightCorrection||safePlanCorrection))continue;

    const date=String(first(newer?.date,newer?.datum)||'').trim();
    const coverage=p77LegacySourceCoverage(input,date,String(newer?.sourceFile||'').trim());
    const oldPlanMinute=p77LegacyMinutes(olderPlan);
    if(!coverage||oldPlanMinute===null||oldPlanMinute<coverage.min||oldPlanMinute>coverage.max)continue;

    removals.push({
      oldId:String(older.id),keepId:String(newer.id),
      flightNumber:String(newer.flightNumber||''),date,
      oldPlanTime:olderPlan,newPlanTime:newerPlan,
      oldFlightTime:olderFlight,newFlightTime:newerFlight,
      oldSource:sourceA===String(older?.sourceFile||'').trim()?sourceA:sourceB,
      newSource:String(newer?.sourceFile||'').trim(),
      reason:safeFlightCorrection?'flight_time_revision':'plan_time_revision'
    });
  }

  // Unerwartet viele Treffer bedeuten eine zu breite Regel: fail closed, keine Datenänderung.
  if(removals.length>10){
    persistAudit('p77a_legacy_dedupe_blocked',{reason:'too-many-candidates',candidateCount:removals.length});
    return{rides:input,changed:false,removed:[],blocked:true};
  }

  if(!removals.length){
    const status={completed:true,completedAt:new Date().toISOString(),removedCount:0,removed:[]};
    try{localStorage.setItem(P77_LEGACY_DEDUPE_MIGRATION_KEY,JSON.stringify(status))}catch(_){ }
    persistAudit('p77a_legacy_dedupe_completed',{removedCount:0});
    return{rides:input,changed:false,removed:[],status};
  }

  // Rollback ist Pflicht. P77A sichert bewusst nur die tatsächlich betroffenen Altzeilen
  // statt die komplette Fahrtenliste ein zweites Mal in localStorage zu duplizieren.
  // Dadurch bleibt der Fail-Closed-Schutz erhalten, ohne den lokalen Speicher unnötig zu belasten.
  const removeIds=new Set(removals.map(x=>x.oldId));
  const removedRides=input.filter(r=>removeIds.has(String(r?.id||'')));
  const doneState=removals.map(item=>({
    oldId:item.oldId,keepId:item.keepId,
    oldWasDone:done.has(item.oldId),keepWasDone:done.has(item.keepId)
  }));
  const rollback={
    savedAt:new Date().toISOString(),reason:'P77A compact pre-migration rollback',
    baseRideCount:input.length,removedRides,doneState,plannedRemovals:removals
  };
  try{
    localStorage.setItem(P77_LEGACY_DEDUPE_ROLLBACK_KEY,JSON.stringify(rollback));
    const verify=JSON.parse(localStorage.getItem(P77_LEGACY_DEDUPE_ROLLBACK_KEY)||'null');
    if(!verify||!Array.isArray(verify.removedRides)||verify.removedRides.length!==removals.length||Number(verify.baseRideCount)!==input.length)throw Error('compact rollback verification failed');
  }catch(error){
    persistAudit('p77a_legacy_dedupe_blocked',{reason:'rollback-failed',message:String(error?.message||error)});
    return{rides:input,changed:false,removed:[],blocked:true};
  }

  removals.forEach(item=>{
    if(done.has(item.oldId))done.add(item.keepId);
    done.delete(item.oldId);
  });
  const next=input.filter(r=>!removeIds.has(String(r.id)));
  const status={completed:true,completedAt:new Date().toISOString(),removedCount:removals.length,removed:removals};
  try{localStorage.setItem(P77_LEGACY_DEDUPE_MIGRATION_KEY,JSON.stringify(status))}catch(_){ }
  persistAudit('p77a_legacy_dedupe_completed',{removedCount:removals.length,removed:removals.map(x=>({oldId:x.oldId,keepId:x.keepId,flightNumber:x.flightNumber,reason:x.reason}))});
  return{rides:next,changed:true,removed:removals,status};
}
function p77LegacyDedupeStatus(){try{return JSON.parse(localStorage.getItem(P77_LEGACY_DEDUPE_MIGRATION_KEY)||'null')}catch(_){return null}}
function p77LegacyDedupeRollback(){try{return JSON.parse(localStorage.getItem(P77_LEGACY_DEDUPE_ROLLBACK_KEY)||'null')}catch(_){return null}}

function planImportPreserveMetadata(oldRide,newRide){
  const preserve=['id','flightLocation','iata','flightVerified','flightVerificationStatus','flightConfidence','flightSources','flightSourceNote','flightSourceConflict','flightResolutionMode','flightPrioritySourceUrl','flightCheckedAt','liveTime','actualLandingTime','actualDepartureTime','flightStatus','liveCheckedAt','liveSources','liveSourceNote','liveSourceConflict','liveResolutionMode','livePrioritySourceUrl','liveManualConfirmed','liveBufferOverrideMinutes'];
  const out={...newRide};
  preserve.forEach(k=>{if((out[k]===undefined||out[k]===null||out[k]==='')&&oldRide?.[k]!==undefined)out[k]=oldRide[k]});
  out.id=oldRide?.id??newRide?.id;
  out._planCarryover=false;out._planMissingFromLatest=false;
  return out;
}
function planImportPreserveStableId(oldRide,newRide){
  const out={...newRide,id:oldRide?.id??newRide?.id};
  out._planCarryover=false;out._planMissingFromLatest=false;
  return out;
}
function mergePlanImportByIdentity(current,incoming){
  const exactBuckets=new Map(),stableBuckets=new Map(),sourceRowBuckets=new Map(),legacyCoreBuckets=new Map();
  (current||[]).forEach(r=>{
    const exact=planImportRideIdentity(r),stable=planImportStableRideIdentity(r),sourceRow=planImportSourceRowIdentity(r),legacyCore=planImportLegacyFlightCoreIdentity(r);
    if(!exactBuckets.has(exact))exactBuckets.set(exact,[]);exactBuckets.get(exact).push(r);
    if(!stableBuckets.has(stable))stableBuckets.set(stable,[]);stableBuckets.get(stable).push(r);
    if(sourceRow){if(!sourceRowBuckets.has(sourceRow))sourceRowBuckets.set(sourceRow,[]);sourceRowBuckets.get(sourceRow).push(r)}
    if(legacyCore){if(!legacyCoreBuckets.has(legacyCore))legacyCoreBuckets.set(legacyCore,[]);legacyCoreBuckets.get(legacyCore).push(r)}
  });
  const used=new Set(),merged=[];let matched=0,deduped=0;
  (incoming||[]).forEach(r=>{
    const exact=planImportRideIdentity(r),stable=planImportStableRideIdentity(r),sourceRow=planImportSourceRowIdentity(r);
    const sourceCandidates=sourceRow?(sourceRowBuckets.get(sourceRow)||[]).filter(x=>!used.has(String(x.id))):[];
    if(sourceCandidates.length){
      const preferred=sourceCandidates.find(x=>planImportRideIdentity(x)===exact&&!x?._planCarryover&&!x?._planMissingFromLatest)
        || sourceCandidates.find(x=>planImportRideIdentity(x)===exact)
        || sourceCandidates.find(x=>!x?._planCarryover&&!x?._planMissingFromLatest)
        || sourceCandidates[0];
      sourceCandidates.forEach(x=>used.add(String(x.id)));
      deduped+=Math.max(0,sourceCandidates.length-1);
      const sameExact=planImportRideIdentity(preferred)===exact;
      merged.push(sameExact?planImportPreserveMetadata(preferred,r):planImportPreserveStableId(preferred,r));
      matched++;
      return;
    }
    const exactCandidates=(exactBuckets.get(exact)||[]).filter(x=>!used.has(String(x.id)));
    if(exactCandidates.length===1){
      const preferred=exactCandidates[0];
      const sameStable=(stableBuckets.get(stable)||[]).filter(x=>!used.has(String(x.id)));
      if(sameStable.some(x=>String(x.id)===String(preferred.id))){
        sameStable.forEach(x=>used.add(String(x.id)));
        deduped+=Math.max(0,sameStable.length-1);
      }else used.add(String(preferred.id));
      merged.push(planImportPreserveMetadata(preferred,r));
      matched++;
      return;
    }
    const stableCandidates=(stableBuckets.get(stable)||[]).filter(x=>!used.has(String(x.id)));
    if(stableCandidates.length){
      const incomingFlightTime=String(listedFlightTimeOf(r)||'').trim();
      const preferred=stableCandidates.find(x=>String(listedFlightTimeOf(x)||'').trim()===incomingFlightTime)
        || stableCandidates.find(x=>!x?._planCarryover&&!x?._planMissingFromLatest)
        || stableCandidates[0];
      // Alle weiteren Alt-Duplikate derselben stabilen realen Fahrt gelten als durch
      // diese aktuelle Planzeile ersetzt und dürfen nicht erneut als Carryover auftauchen.
      stableCandidates.forEach(x=>used.add(String(x.id)));
      deduped+=Math.max(0,stableCandidates.length-1);
      const sameExact=planImportRideIdentity(preferred)===exact;
      merged.push(sameExact?planImportPreserveMetadata(preferred,r):planImportPreserveStableId(preferred,r));
      matched++;
      return;
    }
    merged.push(r);
  });
  // P99.1: Nach dem normalen P73/P99-Matching duerfen exakt EINDEUTIGE alte Carryover-Reste
  // derselben Fahrt verschwinden, wenn nur ihre Flugmetadaten klar schlechter sind. Wir entfernen
  // nie erledigte Fahrten, Bundles oder mehrdeutige Gruppen und nur bei sicherer Datumsrelation.
  (incoming||[]).forEach(r=>{
    const core=planImportLegacyFlightCoreIdentity(r);if(!core)return;
    const candidates=(legacyCoreBuckets.get(core)||[]).filter(oldRide=>{
      const id=String(oldRide?.id||'');
      return id&&!used.has(id)&&!done.has(id)
        && oldRide?._planCarryover===true&&oldRide?._planMissingFromLatest===true
        && !p77LegacyIsBundle(oldRide)
        && planImportLegacyDateCompatible(oldRide,r)
        && planImportLegacyFlightMetadataInferior(oldRide,r);
    });
    if(candidates.length!==1)return; // fail closed bei 0 oder Mehrdeutigkeit
    used.add(String(candidates[0].id));
    deduped++;
  });
  const carry=(current||[]).filter(r=>!used.has(String(r.id))&&!done.has(r.id)).map(r=>({...r,_planCarryover:true,_planMissingFromLatest:true}));
  return{rides:[...merged,...carry],matched,carryover:carry.length,deduped,incomingCount:(incoming||[]).length};
}
function beginPlanImportSession(incoming,mergeInfo){
  const now=new Date().toISOString(),id=planImportSessionId();
  const session={id,createdAt:now,plantag:String((incoming||[]).map(r=>String(r?.date||'').trim()).find(Boolean)||berlinDate()),incomingCount:Number(mergeInfo?.incomingCount||incoming?.length||0),activeRideCount:rides.length,matchedCount:Number(mergeInfo?.matched||0),carryoverCount:Number(mergeInfo?.carryover||0),phases:{plan:true,ocr:true,imported:true,flightChecked:false,liveChecked:false}};
  // P96/S1: nur Planversions-Metadaten. Vollstaendige Fahrten bleiben in
  // KEY/IndexedDB und im exportierbaren Backup; keine N-fache Datenduplizierung.
  const history=readPlanImportHistory();history.push({...session});
  session.historySaved=savePlanImportHistory(history);
  session.currentSaved=safePersistentSetItem(PLAN_IMPORT_CURRENT,JSON.stringify(session),'plan-import-current');
  if(!session.historySaved||!session.currentSaved)persistAudit('plan_history_partial',{historySaved:session.historySaved,currentSaved:session.currentSaved});
  return session;
}
function resetCurrentImportCheckDisplay(){
  try{localStorage.removeItem('atms_flight_check_last_status_v1')}catch(_){ }
  const flight=$('flightCheckStatus');if(flight)flight.textContent='Flugprüfung für diese Planliste noch nicht durchgeführt.';const geminiStatus=$('geminiFlightStatus');if(geminiStatus)geminiStatus.textContent='Flugprüfung für diese Planliste noch nicht durchgeführt.';
  const persistent=$('atmsPersistentFlightCheckStatus');if(persistent){persistent.textContent='';persistent.style.display='none'}
  const live=$('liveFlightImportStatus');if(live)live.textContent='Noch keine Live-Flugprüfung für diese Planliste durchgeführt.';
  const liveBox=$('liveFlightResult');if(liveBox)liveBox.value='';
  const geminiBox=$('geminiFlightResult');if(geminiBox)geminiBox.value='';
}
window.ATMSPlanImportHistory=()=>readPlanImportHistory();
window.ATMSCurrentPlanImportSession=()=>currentPlanImportSession();
window.addEventListener('atms:plan-import-live-guard',resetCurrentImportCheckDisplay);


// CORE-007D8A1F1D8P33 · 22.09.2026: VISIBLE PLAN HISTORY & CLEAN START
const PLAN_RESET_BACKUP='atms_plan_reset_backup_v1';
function planHistoryPhaseText(session){
  const p=session?.phases||{};
  const phases=[];
  if(p.plan)phases.push('Planliste');
  if(p.ocr)phases.push('OCR');
  if(p.imported)phases.push('übernommen');
  if(p.flightChecked)phases.push('Flugorte geprüft');
  if(p.liveChecked)phases.push('LIVE geprüft');
  return phases.length?phases.join(' → '):'Import gespeichert';
}
function planHistoryDateText(value){
  const d=new Date(value||'');
  return Number.isNaN(d.getTime())?'–':d.toLocaleString('de-DE',{dateStyle:'short',timeStyle:'short'});
}
function deletePlanHistorySession(sessionId){
  const id=String(sessionId||'');
  const history=readPlanImportHistory();
  const target=history.find(x=>String(x?.id||'')===id);
  if(!target)return false;
  const when=planHistoryDateText(target.createdAt);
  if(!confirm(`Diese frühere Planliste aus der Historie löschen?\n\nImport: ${when}\nFahrten im Import: ${Number(target.incomingCount||0)}\n\nDer aktuelle Fahrtenbestand wird dadurch NICHT verändert.`))return false;
  if(!savePlanImportHistory(history.filter(x=>String(x?.id||'')!==id),'plan-history-delete-one')){
    showToast('Planliste konnte nicht geloescht werden: Speicherfehler','warn');return false;
  }
  const current=currentPlanImportSession();
  if(String(current?.id||'')===id)localStorage.removeItem(PLAN_IMPORT_CURRENT);
  renderPlanImportHistoryPanel();
  capturePersistenceSafety('plan-history-delete-one');
  showToast('Planliste aus Historie gelöscht','ok');
  return true;
}
function deleteEarlierPlanHistory(){
  const current=currentPlanImportSession();
  const history=readPlanImportHistory();
  const keep=current?history.filter(x=>String(x?.id||'')===String(current.id||'')):[];
  const removeCount=history.length-keep.length;
  if(removeCount<=0){showToast('Keine früheren Planlisten vorhanden','warn');return false}
  if(!confirm(`${removeCount} frühere Planliste(n) aus der Historie löschen?\n\nDie aktuelle Planliste und der aktuelle Fahrtenbestand bleiben erhalten.`))return false;
  if(!savePlanImportHistory(keep,'plan-history-delete-earlier')){
    showToast('Fruehere Planlisten konnten nicht geloescht werden: Speicherfehler','warn');return false;
  }
  renderPlanImportHistoryPanel();
  capturePersistenceSafety('plan-history-delete-earlier');
  showToast(`${removeCount} frühere Planliste(n) gelöscht`,'ok');
  return true;
}
function startPlanDataFreshFromNow(){
  const history=readPlanImportHistory();
  const backup={savedAt:new Date().toISOString(),rides:Array.isArray(rides)?rides:[],done:[...done],history,current:currentPlanImportSession(),rideOverrides:getRideOverrides(),flightCache:getFlightCache()};
  const count=Array.isArray(rides)?rides.length:0;
  if(!confirm(`ATMS-Planbereich ab jetzt neu beginnen?\n\nGelöscht werden:\n• ${count} aktuelle/alte Fahrten\n• frühere Planlisten-Historie\n• planbezogene Flug-/LIVE-Prüfdaten und Fahrtenkorrekturen\n\nERHALTEN bleiben Fahrer, Disponenten, Einstellungen, Adressbuch und Standard-Abholpuffer.\n\nVorher wird lokal ein Sicherheits-Snapshot angelegt.`))return false;
  if(!safePersistentSetItem(PLAN_RESET_BACKUP,JSON.stringify(backup),'plan-clean-start-backup')){
    showToast('Neustart abgebrochen: Der bisherige Fahrtenbestand konnte nicht lokal gesichert werden.','warn');
    return false;
  }
  rides=[];done.clear();
  [KEY,DONE,DONE_OPEN,PLAN_IMPORT_HISTORY,PLAN_IMPORT_CURRENT,PLAN_KEEP_PINNED,PLAN_KEEP_CLEANUP_PREFLIGHT,PLAN_KEEP_CLEANUP_LAST,RIDE_OVERRIDE_KEY,FLIGHT_CACHE,FLIGHT_CACHE_BACKUP,LIVE_LOG,'atms_import_previous_v1','atms_import_recovery_current_v1','atms_flight_check_last_status_v1'].forEach(k=>{try{localStorage.removeItem(k)}catch(_){}});
  // P102: Ein bewusster kompletter Plan-Neustart setzt auch alle Behalten-Markierungen explizit leer,
  // damit Safety/Durable-Shadow keine veralteten Pins wiederherstellen können.
  safePersistentSetItem(PLAN_KEEP_PINNED,'[]','plan-clean-start-p102-pins');
  save();
  resetCurrentImportCheckDisplay();
  capturePersistenceSafety('plan-clean-start');
  syncPersistenceDurableShadow('plan-clean-start');
  renderPlanImportHistoryPanel();
  updateLiveFlightPanelContext?.();
  showToast('Planbereich neu gestartet – bereit für neue Listen','ok');
  return true;
}
function renderPlanImportHistoryPanel(){
  const host=$('planImportHistoryList');if(!host)return;
  const history=readPlanImportHistory().slice().reverse();
  const current=currentPlanImportSession();
  if(!history.length){host.innerHTML='<div style="font-size:12px;opacity:.76">Noch keine gespeicherten Planlisten.</div>';renderP102CurrentPlanPreview();return}
  host.innerHTML=history.map(s=>{
    const isCurrent=String(s?.id||'')===String(current?.id||'');
    const plantag=esc(String(s?.plantag||'–'));
    const when=esc(planHistoryDateText(s?.createdAt));
    const phases=esc(planHistoryPhaseText(s));
    const incoming=Number(s?.incomingCount||0),matched=Number(s?.matchedCount||0),carry=Number(s?.carryoverCount||0);
    return `<div style="padding:10px;border:1px solid rgba(255,255,255,.13);border-radius:10px;margin-top:8px"><div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start"><div><div style="font-weight:800">${isCurrent?'● Aktuelle Planliste':'Frühere Planliste'} · ${plantag}</div><div style="font-size:11px;opacity:.72;margin-top:2px">Import ${when} · ${incoming} Fahrt(en)</div></div>${isCurrent?'':`<button type="button" data-plan-history-delete="${esc(String(s.id||''))}" style="padding:7px 9px;border-radius:8px">🗑 Löschen</button>`}</div><div style="font-size:11px;opacity:.8;margin-top:7px">${phases}</div><div style="font-size:11px;opacity:.65;margin-top:3px">Wiedererkannt: ${matched} · übernommen/weitergeführt: ${carry}</div></div>`;
  }).join('');
  host.querySelectorAll('[data-plan-history-delete]').forEach(btn=>btn.addEventListener('click',()=>deletePlanHistorySession(btn.dataset.planHistoryDelete)));
  renderP102CurrentPlanPreview();
}
// P102 · Nur aktuelle Planliste behalten: reine Vorschau + explizites "Behalten".
// WICHTIG: Dieser Block entfernt, archiviert oder verschiebt keine Fahrt.
function p102IsOlderCarryoverRide(r){return Boolean(r?._planCarryover===true&&r?._planMissingFromLatest===true)}
function p102PinnedRideIds(){
  try{
    const raw=JSON.parse(localStorage.getItem(PLAN_KEEP_PINNED)||'[]');
    return new Set((Array.isArray(raw)?raw:[]).map(x=>String(x||'').trim()).filter(Boolean));
  }catch(_){return new Set()}
}
function p102SavePinnedRideIds(ids){
  const list=[...ids].map(String).filter(Boolean).sort();
  return safePersistentSetItem(PLAN_KEEP_PINNED,JSON.stringify(list),'p102-plan-keep-pinned');
}
function p102CurrentPlanPreview(){
  const all=Array.isArray(rides)?rides:[];
  const current=all.filter(r=>!p102IsOlderCarryoverRide(r));
  const older=all.filter(p102IsOlderCarryoverRide);
  const pins=p102PinnedRideIds();
  const pinned=older.filter(r=>pins.has(String(r?.id||'')));
  const removalCandidates=older.filter(r=>!pins.has(String(r?.id||'')));
  const session=currentPlanImportSession();
  const expected=Number(session?.incomingCount||0);
  const aligned=Boolean(session&&expected>0&&current.length===expected);
  return{all,current,older,pinned,removalCandidates,pins,session,expected,aligned};
}
function p102RideDateLabel(value){
  const s=String(value||'').trim();
  const m=s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m?`${m[3]}.${m[2]}.${m[1]}`:(s||'Ohne Datum');
}
function p102RideTime(r){return String(first(r?.planTime,r?.pickupTime,r?.time,r?.zeit_abfahrt,r?.plan_abholzeit)||'').trim()||'–'}
function p102RideRoute(r){return `${String(first(r?.pickup,r?.abholort,r?.von)||'Start nicht verfügbar')} → ${String(first(r?.destination,r?.zielort,r?.ziel,r?.nach)||'Ziel nicht verfügbar')}`}
function p102RideSortKey(r){return `${String(first(r?.date,r?.datum)||'9999-99-99')}|${p102RideTime(r)}|${String(r?.id||'')}`}
function p102TogglePinnedRide(id){
  const rideId=String(id||'').trim();if(!rideId)return false;
  const ride=(Array.isArray(rides)?rides:[]).find(r=>String(r?.id||'')===rideId);
  if(!ride||!p102IsOlderCarryoverRide(ride)){showToast('Behalten ist nur für ältere Carryover-Fahrten verfügbar','warn');return false}
  const pins=p102PinnedRideIds(),willPin=!pins.has(rideId);
  if(willPin)pins.add(rideId);else pins.delete(rideId);
  if(!p102SavePinnedRideIds(pins)){showToast('Behalten-Status konnte nicht sicher gespeichert werden','warn');return false}
  capturePersistenceSafety('p102-plan-keep-pinned');
  persistAudit('p102_plan_keep_toggle',{rideId,pinned:willPin});
  renderP102CurrentPlanPreview();
  showToast(willPin?'Fahrt für spätere Bereinigung geschützt':'Behalten-Schutz aufgehoben','ok');
  return true;
}
// P103 · sichere, zweistufige Bereinigung. Die Vorschau bleibt P102; erst ein vollständig
// verifizierter Preflight kann die ausdrücklich bestätigte Entfernung freischalten.
function p103ReadJsonStorage(key,fallback=null){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v??fallback}catch(_){return fallback}}
function p103ReadPreflight(){const v=p103ReadJsonStorage(PLAN_KEEP_CLEANUP_PREFLIGHT,null);return v&&typeof v==='object'?v:null}
function p103BackupGate(session){
  const meta=p103ReadJsonStorage(BACKUP_META,{})||{},backupMs=Date.parse(String(meta.createdAt||'')),sessionMs=Date.parse(String(session?.createdAt||''));
  const ageMs=Number.isFinite(backupMs)?Date.now()-backupMs:Infinity;
  const ok=Number.isFinite(backupMs)&&(!Number.isFinite(sessionMs)||backupMs>=sessionMs)&&ageMs>=0&&ageMs<=24*60*60*1000;
  return{ok,createdAt:String(meta.createdAt||''),backupMs,sessionMs,ageMs};
}
function p103RemovalIds(p){return p.removalCandidates.map(r=>String(r?.id||'').trim()).filter(Boolean).sort()}
function p103RemovalDates(p){
  const dates=[],bad=[];
  for(const r of p.removalCandidates){const d=storageV2ArchiveRideDate(r);if(!d)bad.push(String(r?.id||'unbekannt'));else dates.push(d)}
  return{dates:[...new Set(dates)].sort(),bad};
}
function p103SameStringArray(a,b){const x=(Array.isArray(a)?a:[]).map(String).slice().sort(),y=(Array.isArray(b)?b:[]).map(String).slice().sort();return JSON.stringify(x)===JSON.stringify(y)}
function p103CatalogProofsOk(manifest){
  const proofs=Array.isArray(manifest?.archives)?manifest.archives:[],catalog=storageV2ArchiveCatalog();
  return proofs.length>0&&proofs.every(p=>catalog.some(x=>x?.verifiedReadBack===true&&String(x.payloadSha256||'')===String(p.payloadSha256||'')&&String(x.fileSha256||'')===String(p.fileSha256||'')));
}
function p103PreflightMatchesCurrent(manifest,p){
  if(!manifest||manifest.schema!==1||String(manifest.sessionId||'')!==String(p.session?.id||''))return false;
  if(!p.aligned||!p.removalCandidates.length)return false;
  if(!p103SameStringArray(manifest.removalIds,p103RemovalIds(p)))return false;
  const d=p103RemovalDates(p);if(d.bad.length||!p103SameStringArray(manifest.dates,d.dates))return false;
  if(!p103CatalogProofsOk(manifest))return false;
  return true;
}
function p103BackupLabel(gate){if(!gate?.createdAt)return'keine bestätigte Sicherung';const d=new Date(gate.createdAt);return Number.isNaN(d.getTime())?'ungültiger Sicherungszeitpunkt':d.toLocaleString('de-DE',{dateStyle:'short',timeStyle:'short'})}
function p103SetCleanupStatus(message,type=''){p103CleanupStatusMessage=String(message||'');p103CleanupStatusType=String(type||'');try{renderP102CurrentPlanPreview()}catch(_){}}
function p103CleanupHtml(p){
  if(!p?.session)return'';
  const backup=p103BackupGate(p.session),folder=storageV2ArchiveFolderState(),v2=storageV2Diagnosis(),dates=p103RemovalDates(p),manifest=p103ReadPreflight(),ready=p103PreflightMatchesCurrent(manifest,p);
  const backupText=backup.ok?`✓ Backup ${esc(p103BackupLabel(backup))}`:`⚠ Frisches Backup nach aktuellem Import fehlt`;
  const folderText=folder.supported&&folder.configured&&folder.persistedReadWrite&&folder.writable?`✓ Archivordner ${esc(folder.folderName||'ausgewählt')}`:'⚠ Persistenter Archivordner nicht bestätigt';
  const v2Text=v2.exactMatch?'✓ Storage V2 exakt synchron':'⚠ Storage V2 muss vor Bereinigung exakt synchron sein';
  const dateText=dates.bad.length?`⚠ ${dates.bad.length} Fahrt(en) ohne archivfähiges Datum`:`${dates.dates.length} betroffene Archivtage`;
  const canPreflight=p.aligned&&p.removalCandidates.length>0&&backup.ok&&!dates.bad.length&&folder.supported&&folder.configured&&folder.persistedReadWrite&&folder.writable;
  const statusColor=p103CleanupStatusType==='ok'?'#76efad':p103CleanupStatusType==='warn'?'#ffd36e':'rgba(255,255,255,.82)';
  if(!p.removalCandidates.length){
    const msg=p.pinned.length?`Keine ungeschützten älteren Fahrten mehr. ${p.pinned.length} ältere Fahrt(en) bleiben durch 📌 Behalten geschützt.`:'✓ Aktiver Fahrtenbestand enthält keine bereinigbaren älteren Carryover-Fahrten mehr.';
    return`<div style="margin-top:12px;padding:11px;border:1px solid rgba(103,240,165,.25);border-radius:12px;background:rgba(33,196,111,.07);font-size:12px;line-height:1.45;color:#9af6bf"><b>P103 Bereinigung:</b> ${msg}</div>`;
  }
  return`<div style="margin-top:12px;padding:12px;border:1px solid rgba(255,120,120,.25);border-radius:12px;background:rgba(80,20,20,.12)"><div style="font-size:13px;font-weight:900">🛡 P103 · sichere Bereinigungsstufe</div><div style="font-size:11px;line-height:1.5;opacity:.82;margin-top:6px">Vor der Entfernung werden alle betroffenen Tage im persistenten Archivordner geschrieben, zurückgelesen und per SHA-256 bestätigt. Erst danach wird die zweite Bestätigung freigeschaltet.</div><div style="font-size:11px;line-height:1.55;margin-top:8px"><div style="color:${backup.ok?'#76efad':'#ffd36e'}">${backupText}</div><div style="color:${v2.exactMatch?'#76efad':'#ffd36e'}">${v2Text}</div><div style="color:${folder.supported&&folder.configured&&folder.persistedReadWrite&&folder.writable?'#76efad':'#ffd36e'}">${folderText}</div><div>${esc(dateText)} · ${p.removalCandidates.length} Fahrt(en) vorgesehen</div></div>${ready?`<div style="margin-top:9px;padding:9px;border-radius:10px;background:rgba(33,196,111,.10);color:#9af6bf;font-size:11px;line-height:1.45"><b>✓ Preflight verifiziert</b> · ${manifest.archives.length} Archivdatei(en) zurückgelesen · Kandidatenstand unverändert.</div><button type="button" data-p103-apply="1" ${p103CleanupBusy?'disabled':''} style="width:100%;margin-top:9px;padding:11px;border-radius:10px;border:1px solid rgba(255,94,94,.55);background:rgba(255,94,94,.16);color:#ffd0d0;font-weight:900">🧹 ${p.removalCandidates.length} ältere Fahrt(en) aus aktivem Bestand entfernen</button>`:`<button type="button" data-p103-preflight="1" ${(!canPreflight||p103CleanupBusy)?'disabled':''} style="width:100%;margin-top:9px;padding:11px;border-radius:10px;border:1px solid rgba(215,178,82,.45);background:rgba(215,178,82,.14);color:#f7e3a4;font-weight:900">${p103CleanupBusy?'Sicherheitsprüfung läuft …':`🛡 Sicherheitsprüfung & ${dates.dates.length} Vor-Archive erstellen`}</button>`}${p103CleanupStatusMessage?`<div style="margin-top:8px;padding:8px;border-radius:9px;background:rgba(0,0,0,.16);font-size:11px;line-height:1.45;color:${statusColor}">${esc(p103CleanupStatusMessage)}</div>`:''}</div>`;
}
async function p103ArchiveRemovalCandidates(p){
  const folder=storageV2ArchiveFolderState();
  if(!folder.supported||!folder.configured||!folder.persistedReadWrite||!folder.writable)throw new Error('Persistenter Archivordner ist nicht sicher freigegeben.');
  const dateInfo=p103RemovalDates(p);if(dateInfo.bad.length)throw new Error('Mindestens eine zu bereinigende Fahrt besitzt kein archivfähiges Datum.');
  const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
  const proofs=[];
  for(let i=0;i<dateInfo.dates.length;i++){
    const date=dateInfo.dates[i],candidateIds=p.removalCandidates.filter(r=>storageV2ArchiveRideDate(r)===date).map(r=>String(r?.id||'').trim()).filter(Boolean);
    p103SetCleanupStatus(`Archiv ${i+1}/${dateInfo.dates.length}: ${storageV2ArchiveDateLabel(date)} wird geschrieben und zurückgelesen …`);
    const built=await buildStorageV2DailyArchive(date),archivedIds=new Set(built.archive.rideIds.map(String));
    if(candidateIds.some(id=>!archivedIds.has(id)))throw new Error(`Archiv ${date}: Nicht alle Bereinigungskandidaten sind enthalten.`);
    const fileName=`ATMS_Archiv_${date}_vor_Bereinigung_${stamp}.atmsarchive`;
    const fileMeta=await saveStorageV2ArchiveVerified(built.text,fileName,built.fileSha256);
    const remembered=rememberStorageV2Archive(built.archive,fileMeta?.fileName||fileName,fileMeta,built.fileSha256);
    if(!remembered)throw new Error(`Archiv ${date} wurde verifiziert, aber der lokale Archivnachweis konnte nicht gespeichert werden.`);
    proofs.push({archiveDate:date,candidateCount:candidateIds.length,rideCount:built.archive.rideCount,doneCount:built.archive.doneCount,fileName:String(fileMeta?.fileName||fileName),folderName:String(fileMeta?.folderName||folder.folderName||''),payloadSha256:built.archive.integrity.payloadSha256,fileSha256:built.fileSha256,byteLength:Number(fileMeta?.byteLength)||0,verifiedReadBack:true});
  }
  return proofs;
}
async function p103RunPreflight(){
  if(p103CleanupBusy)return false;
  const p=p102CurrentPlanPreview(),backup=p103BackupGate(p.session),folder=storageV2ArchiveFolderState(),dates=p103RemovalDates(p);
  if(!p.session||!p.aligned){showToast('Bereinigung blockiert: aktuelle Planliste nicht eindeutig abgegrenzt','warn');return false}
  if(!p.removalCandidates.length){showToast('Keine älteren ungeschützten Fahrten zu bereinigen','warn');return false}
  const ids=p103RemovalIds(p);if(ids.length!==p.removalCandidates.length||new Set(ids).size!==ids.length){showToast('Bereinigung blockiert: Fahrt-IDs fehlen oder sind doppelt','warn');return false}
  if(!backup.ok){showToast('Bereinigung blockiert: Bitte zuerst ein frisches ATMS-Backup erstellen','warn');return false}
  if(dates.bad.length){showToast('Bereinigung blockiert: Fahrt ohne archivfähiges Datum','warn');return false}
  if(!folder.supported||!folder.configured||!folder.persistedReadWrite||!folder.writable){showToast('Bereinigung blockiert: Archivordner bitte erneut bestätigen','warn');return false}
  if(!confirm(`Sicherheitsprüfung für „Nur aktuelle Planliste behalten“ starten?\n\nAktuelle Planliste: ${p.current.length}\n📌 Behalten: ${p.pinned.length}\nZur späteren Entfernung: ${p.removalCandidates.length}\nBetroffene Archivtage: ${dates.dates.length}\n\nJetzt werden nur verifizierte Vor-Archive erstellt. Noch wird KEINE Fahrt entfernt.`))return false;
  p103CleanupBusy=true;storageV2ArchiveBusy=true;p103SetCleanupStatus('Storage V2 wird vor der Archivierung exakt geprüft …');
  try{
    const sync=await checkStorageV2Phase1('p103-preflight-before-archive',false);if(!sync?.ok)throw new Error('Storage V2 ist nicht exakt synchron.');
    const ridesRawBefore=localStorage.getItem(KEY)||'',doneRawBefore=localStorage.getItem(DONE)||'';
    const ridesSha=await storageV2ArchiveSha256(ridesRawBefore),doneSha=await storageV2ArchiveSha256(doneRawBefore);
    const proofs=await p103ArchiveRemovalCandidates(p);
    const now=p102CurrentPlanPreview();
    if(!p103SameStringArray(ids,p103RemovalIds(now)))throw new Error('Fahrtenbestand hat sich während der Sicherheitsprüfung geändert.');
    const currentRidesSha=await storageV2ArchiveSha256(localStorage.getItem(KEY)||''),currentDoneSha=await storageV2ArchiveSha256(localStorage.getItem(DONE)||'');
    if(currentRidesSha!==ridesSha||currentDoneSha!==doneSha)throw new Error('Fahrten-/Erledigt-Speicher hat sich während der Sicherheitsprüfung geändert.');
    const manifest={schema:1,createdAt:new Date().toISOString(),sessionId:String(p.session?.id||''),plantag:String(p.session?.plantag||''),currentCount:p.current.length,pinnedIds:p.pinned.map(r=>String(r?.id||'')).sort(),removalIds:ids,dates:dates.dates,ridesRawSha256:ridesSha,doneRawSha256:doneSha,backupCreatedAt:backup.createdAt,folderName:String(folder.folderName||''),archives:proofs};
    if(!safePersistentSetItem(PLAN_KEEP_CLEANUP_PREFLIGHT,JSON.stringify(manifest),'p103-cleanup-preflight'))throw new Error('Preflight-Nachweis konnte nicht sicher gespeichert werden.');
    capturePersistenceSafety('p103-cleanup-preflight');
    persistAudit('p103_cleanup_preflight_ok',{sessionId:manifest.sessionId,currentCount:manifest.currentCount,removalCount:ids.length,pinnedCount:manifest.pinnedIds.length,dates:dates.dates,archives:proofs.map(x=>({date:x.archiveDate,fileSha256:x.fileSha256,fileName:x.fileName}))});
    p103CleanupStatusMessage=`✓ Sicherheitsprüfung abgeschlossen: ${proofs.length} Archivdatei(en) verifiziert. Zweite Bestätigung ist jetzt freigeschaltet.`;p103CleanupStatusType='ok';
    showToast('P103 Sicherheitsprüfung bestanden','ok');return true;
  }catch(e){
    try{localStorage.removeItem(PLAN_KEEP_CLEANUP_PREFLIGHT)}catch(_){}
    const msg=String(e?.message||e||'Unbekannter Fehler');persistAudit('p103_cleanup_preflight_failed',{message:msg});p103CleanupStatusMessage='⚠ Sicherheitsprüfung abgebrochen: '+msg;p103CleanupStatusType='warn';showToast('Bereinigung bleibt blockiert','warn');return false;
  }finally{p103CleanupBusy=false;storageV2ArchiveBusy=false;renderP102CurrentPlanPreview();try{renderStorageV2ArchiveCard()}catch(_){}}
}
async function p103ApplyCleanup(){
  if(p103CleanupBusy)return false;
  const p=p102CurrentPlanPreview(),manifest=p103ReadPreflight(),backup=p103BackupGate(p.session);
  if(!p103PreflightMatchesCurrent(manifest,p)){showToast('Bereinigung blockiert: Sicherheitsprüfung ist nicht mehr aktuell','warn');return false}
  if(!backup.ok||String(backup.createdAt||'')!==String(manifest.backupCreatedAt||'')){showToast('Bereinigung blockiert: Backup-Nachweis hat sich geändert','warn');return false}
  const ridesSha=await storageV2ArchiveSha256(localStorage.getItem(KEY)||''),doneSha=await storageV2ArchiveSha256(localStorage.getItem(DONE)||'');
  if(ridesSha!==String(manifest.ridesRawSha256||'')||doneSha!==String(manifest.doneRawSha256||'')){showToast('Bereinigung blockiert: Fahrtenbestand wurde seit dem Preflight verändert','warn');return false}
  const v2=await checkStorageV2Phase1('p103-before-delete',false);if(!v2?.ok){showToast('Bereinigung blockiert: Storage V2 ist nicht exakt synchron','warn');return false}
  const folder=storageV2ArchiveFolderState();if(!folder.configured||!folder.persistedReadWrite||!folder.writable){showToast('Bereinigung blockiert: Archivordner-Freigabe ist nicht mehr gültig','warn');return false}
  const keepCount=p.current.length+p.pinned.length,removeCount=p.removalCandidates.length;
  if(!confirm(`JETZT ältere Fahrten aus dem aktiven Bestand entfernen?\n\nBEHALTEN:\n• ${p.current.length} Fahrt(en) der aktuellen Planliste\n• ${p.pinned.length} Fahrt(en) mit 📌 Behalten\n\nENTFERNEN:\n• ${removeCount} ältere Carryover-Fahrt(en)\n\nSICHERHEIT:\n• Backup: ${p103BackupLabel(backup)}\n• ${manifest.archives.length} Vor-Archiv(e) verifiziert\n• Archivordner: ${folder.folderName||'bestätigt'}\n\nArchive und Backup bleiben erhalten. Die Entfernung betrifft nur den aktiven Fahrtenbestand.`))return false;
  p103CleanupBusy=true;p103SetCleanupStatus('Bereinigung wird transaktionsartig durchgeführt …');
  const before={rides:JSON.parse(JSON.stringify(rides)),done:new Set(done),overrides:getRideOverrides(),pins:p102PinnedRideIds(),previousImport:localStorage.getItem('atms_import_previous_v1'),recoveryCurrent:localStorage.getItem('atms_import_recovery_current_v1')};
  const removeIds=new Set(p103RemovalIds(p));
  try{
    const nextRides=rides.filter(r=>!removeIds.has(String(r?.id||''))),nextDone=new Set([...done].filter(id=>!removeIds.has(String(id)))),nextOverrides=getRideOverrides().filter(x=>!removeIds.has(String(x?.rideId||''))),nextPins=new Set([...p102PinnedRideIds()].filter(id=>!removeIds.has(String(id))));
    if(nextRides.length!==keepCount)throw new Error(`Sicherheitsabbruch: Erwartet ${keepCount} verbleibende Fahrten, berechnet ${nextRides.length}.`);
    rides=nextRides;done=nextDone;
    if(!save({silent:true,deferDurable:true}))throw new Error('Aktiver Fahrtenbestand konnte nicht vollständig gespeichert werden.');
    if(!saveRideOverrides(nextOverrides))throw new Error('Fahrtenkorrekturen konnten nicht sicher bereinigt werden.');
    if(!p102SavePinnedRideIds(nextPins))throw new Error('Behalten-Markierungen konnten nicht sicher gespeichert werden.');
    const durable=await syncPersistenceDurableShadow('p103-current-plan-cleanup');if(!durable||durable.storage?.[KEY]!==localStorage.getItem(KEY)||durable.storage?.[DONE]!==localStorage.getItem(DONE))throw new Error('Durable Shadow konnte den neuen Bestand nicht exakt bestätigen.');
    const s2=await syncStorageV2Phase1('p103-current-plan-cleanup');if(!s2?.ok)throw new Error('Storage V2 konnte den neuen Bestand nicht exakt bestätigen.');
    let stored=[];try{stored=JSON.parse(localStorage.getItem(KEY)||'[]')}catch(_){throw new Error('Gespeicherter Fahrtenbestand ist nach Bereinigung unlesbar.')}
    if(!Array.isArray(stored)||stored.length!==keepCount||stored.some(r=>removeIds.has(String(r?.id||''))))throw new Error('Write-Read-Prüfung des bereinigten Fahrtenbestands fehlgeschlagen.');
    try{localStorage.removeItem('atms_import_previous_v1');localStorage.removeItem('atms_import_recovery_current_v1')}catch(_){}
    const report={schema:1,completedAt:new Date().toISOString(),sessionId:String(p.session?.id||''),plantag:String(p.session?.plantag||''),beforeCount:p.all.length,currentKept:p.current.length,pinnedKept:p.pinned.length,removedCount:removeCount,afterCount:keepCount,backupCreatedAt:backup.createdAt,folderName:String(folder.folderName||''),archives:manifest.archives.map(x=>({archiveDate:x.archiveDate,fileName:x.fileName,fileSha256:x.fileSha256,payloadSha256:x.payloadSha256}))};
    safePersistentSetItem(PLAN_KEEP_CLEANUP_LAST,JSON.stringify(report),'p103-cleanup-result');
    try{localStorage.removeItem(PLAN_KEEP_CLEANUP_PREFLIGHT)}catch(_){}
    capturePersistenceSafety('p103-current-plan-cleanup');
    if(active&&removeIds.has(String(active?.id||'')))active=null;
    persistAudit('p103_cleanup_success',{beforeCount:p.all.length,currentKept:p.current.length,pinnedKept:p.pinned.length,removedCount:removeCount,afterCount:keepCount,archiveCount:manifest.archives.length});
    p103CleanupStatusMessage=`✓ Bereinigung bestätigt: ${removeCount} ältere Fahrt(en) entfernt · ${keepCount} aktiv geblieben. Archive und Backup bleiben erhalten.`;p103CleanupStatusType='ok';
    render();updateBackupUI();renderP102CurrentPlanPreview();showToast(`${removeCount} ältere Fahrten sicher entfernt`,'ok');return true;
  }catch(e){
    const msg=String(e?.message||e||'Unbekannter Fehler');let rollbackOk=false;
    try{
      rides=before.rides;done=before.done;
      const r1=save({silent:true,deferDurable:true}),r2=saveRideOverrides(before.overrides),r3=p102SavePinnedRideIds(before.pins);
      if(before.previousImport===null)localStorage.removeItem('atms_import_previous_v1');else localStorage.setItem('atms_import_previous_v1',before.previousImport);
      if(before.recoveryCurrent===null)localStorage.removeItem('atms_import_recovery_current_v1');else localStorage.setItem('atms_import_recovery_current_v1',before.recoveryCurrent);
      capturePersistenceSafety('p103-cleanup-rollback',false);
      const d=await syncPersistenceDurableShadow('p103-cleanup-rollback'),s2=await syncStorageV2Phase1('p103-cleanup-rollback');
      rollbackOk=Boolean(r1&&r2&&r3&&d&&s2?.ok&&localStorage.getItem(KEY)===JSON.stringify(rides));
    }catch(_){rollbackOk=false}
    persistAudit('p103_cleanup_failed',{message:msg,rollbackOk});
    p103CleanupStatusMessage=`⚠ Bereinigung fehlgeschlagen: ${msg}${rollbackOk?' · vorheriger aktiver Bestand wurde wiederhergestellt.':' · ROLLBACK NICHT BESTÄTIGT – bitte Backup verwenden.'}`;p103CleanupStatusType='warn';
    showToast(rollbackOk?'Bereinigung abgebrochen · Bestand wiederhergestellt':'KRITISCH: Rollback nicht bestätigt','warn');
    render();updateBackupUI();return false;
  }finally{p103CleanupBusy=false;renderP102CurrentPlanPreview()}
}
function renderP102CurrentPlanPreview(){
  const host=$('p102CurrentPlanPreview');if(!host)return false;
  const p=p102CurrentPlanPreview(),session=p.session;
  if(!session){
    host.innerHTML='<div style="font-size:12px;opacity:.78;line-height:1.45">Noch keine bestätigte aktuelle Planliste vorhanden. P102 löscht nichts.</div>';
    return true;
  }
  const plantag=esc(String(session?.plantag||'–'));
  const imported=esc(planHistoryDateText(session?.createdAt));
  const matchNote=p.aligned
    ?'<span style="color:#67f0a5;font-weight:800">✓ Aktuelle Planliste eindeutig abgegrenzt</span>'
    :`<span style="color:#ffd36e;font-weight:800">⚠ Zählabgleich offen: letzter Import ${p.expected||'–'} · aktuell erkannt ${p.current.length}</span>`;
  const groups=new Map();
  p.older.slice().sort((a,b)=>{
    const da=String(first(a?.date,a?.datum)||''),db=String(first(b?.date,b?.datum)||'');
    if(da!==db)return db.localeCompare(da,'de');
    return p102RideSortKey(a).localeCompare(p102RideSortKey(b),'de');
  }).forEach(r=>{
    const d=String(first(r?.date,r?.datum)||'').trim()||'Ohne Datum';
    if(!groups.has(d))groups.set(d,[]);groups.get(d).push(r);
  });
  const groupHtml=[...groups.entries()].map(([date,list])=>{
    const pinnedCount=list.filter(r=>p.pins.has(String(r?.id||''))).length;
    const rows=list.map(r=>{
      const id=String(r?.id||''),isPinned=p.pins.has(id);
      const flight=String(r?.flightNumber||'').trim(),driver=String(first(r?.driver,r?.fahrer)||'').trim();
      return `<div style="padding:9px 0;border-top:1px solid rgba(255,255,255,.08);display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center"><div style="min-width:0"><div style="font-size:12px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(p102RideTime(r))} · ${esc(p102RideRoute(r))}</div><div style="font-size:11px;opacity:.7;margin-top:2px">${flight?esc(flight):'ohne Flug'}${driver?' · '+esc(driver):''} · ID ${esc(id)}</div></div><button type="button" data-p102-pin="${esc(id)}" style="padding:8px 9px;border-radius:9px;font-weight:800;white-space:nowrap;${isPinned?'border:1px solid rgba(103,240,165,.55);color:#9af6bf;background:rgba(33,196,111,.12)':''}">${isPinned?'📌 Behalten ✓':'📌 Behalten'}</button></div>`;
    }).join('');
    return `<details style="margin-top:8px;border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:0 10px"><summary style="cursor:pointer;padding:10px 0;font-size:12px;font-weight:800">${esc(p102RideDateLabel(date))} · ${list.length} ältere Fahrt(en)${pinnedCount?' · '+pinnedCount+' behalten':''}</summary>${rows}</details>`;
  }).join('');
  const p103Html=p103CleanupHtml(p);
  host.innerHTML=`<div style="font-size:12px;line-height:1.45;margin-bottom:9px">Letzter bestätigter Import: <b>${plantag}</b> · ${imported}<br>${matchNote}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:7px"><div style="padding:9px;border-radius:10px;background:rgba(33,196,111,.10)"><b style="font-size:20px">${p.current.length}</b><div style="font-size:10px;opacity:.72">aktuelle Planliste</div></div><div style="padding:9px;border-radius:10px;background:rgba(255,193,66,.10)"><b style="font-size:20px">${p.older.length}</b><div style="font-size:10px;opacity:.72">ältere Carryover</div></div><div style="padding:9px;border-radius:10px;background:rgba(74,191,255,.10)"><b style="font-size:20px">${p.pinned.length}</b><div style="font-size:10px;opacity:.72">📌 behalten</div></div><div style="padding:9px;border-radius:10px;background:rgba(255,94,94,.08)"><b style="font-size:20px">${p.removalCandidates.length}</b><div style="font-size:10px;opacity:.72">später bereinigbar</div></div></div><div style="margin-top:10px;padding:9px;border-radius:10px;background:rgba(255,255,255,.045);font-size:11px;line-height:1.45"><b>P102 Vorschau:</b> „📌 Behalten“ schützt ältere Fahrten. P103 darf nur nach verifiziertem Backup-/Storage-/Archiv-Preflight entfernen.</div>${p103Html}${p.older.length?`<div style="margin-top:10px;font-size:12px;font-weight:800">Ältere Fahrten prüfen</div>${groupHtml}`:'<div style="margin-top:10px;font-size:12px;color:#67f0a5;font-weight:800">✓ Keine älteren Carryover-Fahrten erkannt.</div>'}`;
  host.querySelectorAll('[data-p102-pin]').forEach(btn=>btn.addEventListener('click',()=>p102TogglePinnedRide(btn.dataset.p102Pin)));
  host.querySelector('[data-p103-preflight]')?.addEventListener('click',()=>void p103RunPreflight());
  host.querySelector('[data-p103-apply]')?.addEventListener('click',()=>void p103ApplyCleanup());
  return true;
}
function ensureP102CurrentPlanPreviewPanel(){
  // P102.1: Die sichtbare Native-Seite ist #importView > main.import.
  // Frühere P102-Versionen hingen die Karte indirekt an das alte History-/Tool-Layout,
  // das auf der aktuellen mobilen Importseite nicht zuverlässig sichtbar ist.
  const view=$('importView');if(!view)return false;
  const main=view.querySelector('main.import')||view;
  const legacy=main.querySelector('.legacy-json');
  let panel=$('p102CurrentPlanPreviewPanel');
  if(!panel){
    panel=document.createElement('section');panel.id='p102CurrentPlanPreviewPanel';panel.className='card';
    panel.style.cssText='margin:0 0 18px;padding:18px;border:1px solid rgba(215,178,82,.38);border-radius:22px;background:linear-gradient(180deg,rgba(65,52,18,.28),rgba(24,31,37,.96))';
    panel.innerHTML='<div style="font-weight:900;font-size:18px;margin-bottom:4px">🧹 Nur aktuelle Planliste behalten · Vorschau</div><div style="font-size:11px;opacity:.72;line-height:1.4;margin-bottom:9px">P103 · Vorschau + archivgesicherte Bereinigungsstufe</div><div id="p102CurrentPlanPreview"></div>';
  }
  // Immer direkt zwischen Haupt-Planimport und erweitertem JSON-Import positionieren.
  // Dadurch ist die Vorschau unabhängig von alten Gemini/LIVE/History-Containern sichtbar.
  if(legacy){
    if(panel.parentElement!==main||panel.nextElementSibling!==legacy)main.insertBefore(panel,legacy);
  }else if(panel.parentElement!==main)main.appendChild(panel);
  renderP102CurrentPlanPreview();return true;
}
window.ATMSP102CurrentPlanPreview=()=>p102CurrentPlanPreview();

function ensurePlanImportHistoryPanel(){
  if($('planImportHistoryPanel')){renderPlanImportHistoryPanel();ensureP102CurrentPlanPreviewPanel();return}
  const view=$('importView'),live=$('liveFlightPanel'),gemini=$('geminiFlightPanel');if(!view)return;
  const panel=document.createElement('section');panel.id='planImportHistoryPanel';panel.style.cssText='margin:16px 0;padding:14px;border:1px solid rgba(255,255,255,.16);border-radius:14px;background:rgba(255,255,255,.035)';
  panel.innerHTML=`<div style="font-weight:800;margin-bottom:4px">📚 Frühere Planlisten</div><div style="font-size:12px;opacity:.78;line-height:1.45">Jeder bestätigte Import wird als eigene Planversion gespeichert. Einzelnes Löschen entfernt nur den Historieneintrag – nicht den aktuellen Fahrtenbestand.</div><div id="planImportHistoryList" style="margin-top:8px"></div><div style="display:grid;grid-template-columns:1fr;gap:8px;margin-top:10px"><button type="button" id="deleteEarlierPlanHistoryBtn" style="padding:11px;border-radius:9px;font-weight:800">🗑 Alle früheren Planlisten löschen</button><button type="button" id="startPlanFreshBtn" style="padding:11px;border-radius:9px;font-weight:800">🧹 Ab jetzt mit neuen Planlisten starten</button></div><div style="font-size:11px;opacity:.7;line-height:1.4;margin-top:7px">„Ab jetzt …“ leert nur den Plan-/Fahrtenbereich. Fahrer, Disponenten, Einstellungen, Adressbuch und Standard-Abholpuffer bleiben erhalten.</div>`;
  if(live)live.insertAdjacentElement('afterend',panel);else if(gemini)gemini.insertAdjacentElement('afterend',panel);else view.appendChild(panel);
  $('deleteEarlierPlanHistoryBtn')?.addEventListener('click',deleteEarlierPlanHistory);
  $('startPlanFreshBtn')?.addEventListener('click',startPlanDataFreshFromNow);
  renderPlanImportHistoryPanel();
  ensureP102CurrentPlanPreviewPanel();
}
window.ATMSRenderPlanImportHistory=renderPlanImportHistoryPanel;

function readPreviousPlanImportSnapshot(){
  try{
    const raw=JSON.parse(localStorage.getItem('atms_import_previous_v1')||'null');
    if(!raw||!Array.isArray(raw.rides)||!raw.rides.length)return null;
    return raw;
  }catch(_){return null}
}
function restorePreviousPlanImport(){
  const previous=readPreviousPlanImportSnapshot();
  if(!previous){
    showToast('Kein vorheriger Planimport-Zustand gefunden','warn');
    return false;
  }
  const stamp=previous.savedAt?new Date(previous.savedAt).toLocaleString('de-DE'):'unbekannter Zeitpunkt';
  if(!confirm(`Letzten Zustand VOR dem Planimport wiederherstellen?

Gespeichert: ${stamp}
Fahrten: ${previous.rides.length}

Der aktuelle Zustand wird vorher zusätzlich lokal gesichert.`))return false;

  try{
    localStorage.setItem('atms_import_recovery_current_v1',JSON.stringify({
      savedAt:new Date().toISOString(),
      rides:Array.isArray(rides)?rides:[],
      done:[...done]
    }));
  }catch(_){}

  rides=previous.rides.map((r,i)=>norm(r,i));
  done=new Set([...done].filter(id=>rides.some(r=>String(r.id)===String(id))));
  save();
  capturePersistenceSafety('manual-restore-previous-plan-import');
  syncPersistenceDurableShadow('manual-restore-previous-plan-import');
  persistAudit('previous_plan_import_restored',{
    snapshotSavedAt:String(previous.savedAt||''),
    rides:rides.length
  });
  render();
  updateBackupUI();
  showToast(`${rides.length} Fahrten aus Zustand vor letztem Planimport wiederhergestellt`,'ok');
  return true;
}

function importChoice(newRides){
  if(!Array.isArray(newRides)||!newRides.length)throw Error('Keine Fahrten gefunden');
  if(!rides.length)return 'replace';
  const replace=confirm(`Neue Planliste mit ${newRides.length} Fahrten erkannt.

OK = aktuelle Fahrten ERSETZEN (empfohlen)
Abbrechen = weitere Auswahl`);
  if(replace)return 'replace';
  const merge=confirm(`Möchtest du die neue Planliste mit den vorhandenen ${rides.length} Fahrten ZUSAMMENFÜHREN?

OK = zusammenführen
Abbrechen = Import abbrechen`);
  return merge?'merge':'cancel';
}
function mergeImportedRides(current,incoming){
  const map=new Map();
  current.forEach(r=>map.set(String(r.id),r));
  incoming.forEach(r=>map.set(String(r.id),r));
  return [...map.values()];
}
async function applyImportedRides(newRides){
  if(!Array.isArray(newRides)||!newRides.length) throw Error('Keine Fahrten gefunden');

  const importAuthorization=consumePlanImportAuthorization();
  if(!importAuthorization.ok){
    const stack=String(new Error('blocked-plan-import').stack||'').split('\n').slice(1,6).join(' | ');
    persistAudit('plan_import_blocked',{
      reason:'missing-trusted-user-click',
      incomingCount:newRides.length,
      source:importAuthorization.source,
      ageMs:importAuthorization.ageMs,
      stack
    });
    restoreCurrentRidesAfterBlockedImport();
    throw Error('Sicherheitsblock: Planimport wurde nicht durch „Geprüfte Fahrten übernehmen“ oder „JSON laden“ gestartet.');
  }
  persistAudit('plan_import_started',{
    source:importAuthorization.source,
    incomingCount:newRides.length
  });
  const beforeRides=rides.map(r=>({...r}));
  const beforeDone=new Set(done);
  // Nur bei nachweislich erfolgreich geschriebener VORHER-Version beginnen.
  let persistedBefore=[];
  try{persistedBefore=JSON.parse(localStorage.getItem(KEY)||'[]')}catch(_){ }
  if(!Array.isArray(persistedBefore)||persistedBefore.length!==beforeRides.length)
    throw Error('Import blockiert: Der vorherige Fahrtenbestand ist nicht vollstaendig im lokalen Speicher. Bitte Sicherung pruefen.');
  const durableBefore=await syncPersistenceDurableShadow('before-plan-import-verified');
  if(!durableBefore)throw Error('Import blockiert: Die bestehende Fahrten-Sicherung in IndexedDB konnte nicht bestaetigt werden.');

  // CORE-005V: vor Import Snapshot; falls ein fremder Importpfad kritische atms_-Keys entfernt hat,
  // nur fehlende kritische Daten aus dem Snapshot zurückholen. Vorhandene Werte bleiben unberührt.
  restoreMissingCriticalPersistence('before-plan-import');
  syncPersistenceDurableShadow('before-plan-import');
  capturePersistenceSafety('before-plan-import');

  try{
    localStorage.setItem('atms_import_previous_v1',JSON.stringify({
      savedAt:new Date().toISOString(),
      rides
    }));
  }catch(_){}

  // CORE-005Q1: Ein Plan ohne eigenes Datum bekommt beim Import einmalig den
  // konkreten Plantag (Europe/Berlin). Dadurch kann der Flug-Cache sicher mit
  // Flugnummer + Plantag + Richtung + Flugzeit matchen, ohne morgen versehentlich
  // die heutige Pruefung auf einen neuen Plan anzuwenden. Ein im Plan vorhandenes
  // Datum bleibt unveraendert.
  const importedAt=new Date().toISOString();
  const assumedPlantDay=berlinDate();
  const normalizedIncomingBase=newRides.map(r=>{
    const explicitDate=String(first(r?.date,r?.datum)||'').trim();
    if(explicitDate)return r;
    return {...r,date:assumedPlantDay,dateAssumed:true,planDateAssumed:true,planImportedAt:importedAt};
  });
  // P93: Nur durch eine gleichzeitige Geschwisterzeile bestätigte kompakte Airport-OCR-Artefakte
  // werden vor dem Re-Import-Matching normalisiert. Bestand und Neueingang durchlaufen dieselbe
  // enge Regel, damit bereits entstandene Carryover-Dubletten beim nächsten Import zusammenfallen.
  const normalizedIncoming=p93NormalizeSiblingRouteArtifacts(normalizedIncomingBase);
  const normalizedCurrent=p93NormalizeSiblingRouteArtifacts(rides);
  // P75: Fahrerfarben aus farbigen Bild-/WhatsApp-Planlisten nur als UI-Metadaten übernehmen.
  // Manuell in P74 gewählte/gesperrte Farben haben Vorrang; Fahrtdaten bleiben unverändert.
  applyImportedDriverPlanColors(normalizedIncoming);
  // P32: gleiche reale, noch offene Fahrt aus einer neuen Planversion behält ihre stabile ID
  // und bereits bestätigte Flug-/LIVE-Metadaten. Nicht sicher gematchte offene Alt-Fahrten
  // werden nicht blind gelöscht, sondern als Carryover markiert.
  const planMerge=mergePlanImportByIdentity(normalizedCurrent,normalizedIncoming);
  rides=planMerge.rides;
  const corrected=applyRideOverrides(rides);
  rides=corrected.rides;
  // CORE-005Q: Flugpruefungen des EXAKT gleichen konkreten Fluges werden direkt
  // beim Neuimport wieder angewendet. Match: Flugnummer + Datum + Richtung + Flugzeit.
  // Andere Plantage oder nur aehnliche Flugnummern werden niemals uebernommen.
  const restored=applyFlightCacheToRides(rides);
  rides=restored.rides;
  done=new Set([...done].filter(id=>rides.some(r=>r.id===id)));
  const stored=save({deferDurable:true,silent:true});
  if(!stored){
    rides=beforeRides;done=beforeDone;
    if(!save({silent:true}))persistAudit('plan_import_rollback_failed',{phase:'local-write'});
    throw Error('Import abgebrochen: Neue Fahrten konnten nicht dauerhaft gespeichert werden. Alter Bestand bleibt erhalten.');
  }
  const durableAfter=await syncPersistenceDurableShadow('after-plan-import-verified');
  if(!durableAfter){
    rides=beforeRides;done=beforeDone;
    if(!save({silent:true}))persistAudit('plan_import_rollback_failed',{phase:'durable-write'});
    throw Error('Import abgebrochen: IndexedDB-Sicherung fehlgeschlagen. Vorheriger Bestand wurde erneut gespeichert; bitte Backup pruefen.');
  }
  // Storage V2 ist noch kein Freigabe-Gate: nur paralleles Spiegeln + Verifikation.
  void syncStorageV2Phase1('after-plan-import-verified');
  capturePersistenceSafety('after-plan-import');
  let addressCandidateResult={changed:false,added:0,open:0};
  try{addressCandidateResult=collectAddressBookCandidates(normalizedIncoming,'address-candidates-plan-import')}
  catch(e){persistAudit('address_candidates_collect_failed',{phase:'plan-import',message:String(e?.message||e)})}
  const importSession=beginPlanImportSession(normalizedIncoming,planMerge);
  renderPlanImportHistoryPanel();
  resetCurrentImportCheckDisplay();
  updateLiveFlightPanelContext();

  return {
    cancelled:false,
    mode:'merge',
    count:rides.length,
    importSessionId:importSession.id,
    historySaved:Boolean(importSession.historySaved&&importSession.currentSaved),
    matchedRides:planMerge.matched,
    carryoverRides:planMerge.carryover,
    restoredFlightChecks:restored.changed,
    restoredVerifiedFlights:restored.verifiedRestored,
    restoredManualChecks:restored.manualRestored,
    newAddressCandidates:addressCandidateResult.added,
    openAddressCandidates:addressCandidateResult.open
  };
}



/* DEV 14.5.2 – Live-Disposition Logik */
let liveExpanded=false,liveSuggested=null,liveEtaRunId=0,liveEtaResults=new Map();
function getLiveSettings(){try{return Object.assign({driverId:'',consentByDriver:{},warnThreshold:7,mode:'standard',lastGeo:null,mapboxToken:'',stopBufferMinutes:5,arrivalPickupBufferMinutes:15,pastRideGraceMinutes:120},JSON.parse(localStorage.getItem(LIVE_SETTINGS)||'{}'))}catch{return{driverId:'',consentByDriver:{},warnThreshold:7,mode:'standard',lastGeo:null,mapboxToken:'',stopBufferMinutes:5,arrivalPickupBufferMinutes:15,pastRideGraceMinutes:120}}}
function saveLiveSettings(s){localStorage.setItem(LIVE_SETTINGS,JSON.stringify(s))}
function renderNavigationSettings(){
  const s=getLiveSettings(),token=$('mapboxToken'),buffer=$('liveStopBuffer'),status=$('navigationStatus'),api=$('liveApiStatus');
  if(token&&document.activeElement!==token)token.value=s.mapboxToken||'';
  if(buffer&&document.activeElement!==buffer)buffer.value=Number(s.stopBufferMinutes||5);
  if(status)status.textContent=s.mapboxToken?'Mapbox-Token lokal gespeichert. Live-ETA kann getestet werden.':'Noch kein Mapbox-Token gespeichert.';
  if(api)api.textContent=s.mapboxToken?'Mapbox bereit':'Lokal / keine API';
}
function saveNavigationSettings(){
  const token=String($('mapboxToken')?.value||'').trim(),buffer=Math.max(0,Math.min(30,Number($('liveStopBuffer')?.value)||0));
  const s=getLiveSettings();s.mapboxToken=token;s.stopBufferMinutes=buffer;saveLiveSettings(s);renderNavigationSettings();showToast(token?'Navigationseinstellungen gespeichert':'Token entfernt','ok');
}
async function testNavigationApi(){
  const status=$('navigationStatus'),btn=$('testNavigationApiBtn');
  const token=String($('mapboxToken')?.value||getLiveSettings().mapboxToken||'').trim();
  if(!token){if(status)status.textContent='Bitte zuerst einen Mapbox-Token eintragen.';return}
  if(btn){btn.disabled=true;btn.textContent='API wird getestet …'}
  try{
    const p=await mapboxGeocode('DUS Airport',token,null);
    if(!p)throw new Error('DUS Airport konnte nicht gefunden werden.');
    if(status)status.textContent='✓ Mapbox-Verbindung funktioniert. DUS Airport wurde erkannt.';
    showToast('Mapbox-Verbindung funktioniert','ok');
  }catch(e){if(status)status.textContent='Mapbox-Test fehlgeschlagen: '+e.message;showToast('Mapbox-Test fehlgeschlagen','warn')}
  finally{if(btn){btn.disabled=false;btn.textContent='Verbindung testen'}}
}
function getDriverSession(){try{return Object.assign({active:false,driverId:'',driverName:'',startedAt:null,lastPositionAt:null},JSON.parse(localStorage.getItem(DRIVER_SESSION)||'{}'))}catch{return{active:false,driverId:'',driverName:'',startedAt:null,lastPositionAt:null}}}
function saveDriverSession(s){localStorage.setItem(DRIVER_SESSION,JSON.stringify(s))}
function stopLiveGeoWatch(){if(liveGeoWatchId!==null&&navigator.geolocation){navigator.geolocation.clearWatch(liveGeoWatchId);liveGeoWatchId=null}}
function updateSessionPosition(pos){
  const session=getDriverSession();if(!session.active)return;
  const settings=getLiveSettings();
  settings.lastGeo={driverId:session.driverId,driverName:session.driverName,lat:pos.coords.latitude,lng:pos.coords.longitude,accuracy:pos.coords.accuracy,time:new Date().toISOString()};
  saveLiveSettings(settings);
  session.lastPositionAt=settings.lastGeo.time;
  saveDriverSession(session);
  // CORE-006V: Eine neue GPS-Position soll die sichtbare Live-Disposition sofort
  // aktualisieren (Route + letzte Aktualisierung), darf den Nutzer aber niemals
  // aus einer anderen Ansicht zurück in Live-Dispo ziehen.
  const liveView=$('liveDispositionView');
  if(liveView&&!liveView.classList.contains('hidden'))renderLiveDisposition(false);
  else renderDriverSessionCard();
}
function startLiveGeoWatch(){stopLiveGeoWatch();const session=getDriverSession(),settings=getLiveSettings();if(!session.active||!navigator.geolocation||!settings.consentByDriver?.[session.driverId])return;liveGeoWatchId=navigator.geolocation.watchPosition(updateSessionPosition,err=>{addLiveEvent(`GPS-Aktualisierung für ${session.driverName} nicht möglich: ${err.message||'unbekannter Fehler'}.`,'warn');renderDriverSessionCard()}, {enableHighAccuracy:true,maximumAge:15000,timeout:20000})}
function renderDriverSessionCard(){const box=$('liveSessionDriver');if(!box)return;const session=getDriverSession(),settings=getLiveSettings(),drivers=liveDriverList();const selected=drivers.find(x=>x.id===settings.driverId);if(session.active){box.innerHTML=`<span style="color:#39df78">● Aktiv:</span> ${esc(session.driverName)} ist diesem Handy zugeordnet.`;$('liveShiftStatus').textContent='Aktiv';$('liveShiftStatus').className='session-status on';$('liveShiftStarted').textContent=session.startedAt?new Date(session.startedAt).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}):'–';const consent=!!settings.consentByDriver?.[session.driverId],geo=settings.lastGeo&&settings.lastGeo.driverId===session.driverId?settings.lastGeo:null;$('liveGpsStatus').textContent=consent?(geo?'Aktiv':'Bereit'):'Zustimmung fehlt';$('liveGpsStatus').className='session-status '+(consent?'on':'warn');$('liveShiftLastPosition').textContent=geo?`${new Date(geo.time).toLocaleTimeString('de-DE')} · ±${Math.round(geo.accuracy||0)} m`:'–';$('liveShiftToggleBtn').textContent='■ Schicht beenden';$('liveShiftToggleBtn').className='live-action stop';}else{box.textContent=selected?`Ausgewählt: ${selected.name}. Beim Schichtstart wird dieses Handy diesem Fahrer zugeordnet.`:'Bitte Fahrer auswählen.';$('liveShiftStatus').textContent='Nicht gestartet';$('liveShiftStatus').className='session-status off';$('liveGpsStatus').textContent='Nicht aktiv';$('liveGpsStatus').className='session-status off';$('liveShiftStarted').textContent='–';$('liveShiftLastPosition').textContent='–';$('liveShiftToggleBtn').textContent='▶ Schicht starten';$('liveShiftToggleBtn').className='live-action primary';}}
function toggleDriverShift(){const session=getDriverSession(),settings=getLiveSettings(),driver=liveDriverList().find(x=>x.id===settings.driverId);if(session.active){if(!confirm(`Schicht von ${session.driverName} beenden?`))return;stopLiveGeoWatch();addLiveEvent(`Schicht beendet: ${session.driverName}. GPS-Übertragung dieses Handys wurde gestoppt.`,'ok');saveDriverSession({active:false,driverId:'',driverName:'',startedAt:null,lastPositionAt:null});showToast('Schicht beendet','ok');renderLiveDisposition();return}if(!driver){showToast('Bitte Fahrer auswählen','warn');return}if(!settings.consentByDriver?.[driver.id]){showToast('Bitte zuerst Zustimmung aktivieren','warn');return}saveDriverSession({active:true,driverId:driver.id,driverName:driver.name,startedAt:new Date().toISOString(),lastPositionAt:null});addLiveEvent(`Schicht gestartet: ${driver.name} wurde diesem Handy zugeordnet. GPS-Aktualisierung wird gestartet.`,'ok');showToast(`${driver.name}: Schicht gestartet`,'ok');startLiveGeoWatch();renderLiveDisposition()}

function getLiveLog(){try{const x=JSON.parse(localStorage.getItem(LIVE_LOG)||'[]');return Array.isArray(x)?x:[]}catch{return[]}}
function addLiveEvent(message,type='info'){const list=getLiveLog();list.unshift({at:new Date().toISOString(),message,type});localStorage.setItem(LIVE_LOG,JSON.stringify(list.slice(0,60)));renderLiveLog()}
function renderLiveLog(){const box=$('liveEventLog');if(!box)return;const list=getLiveLog();box.innerHTML=list.length?list.map(x=>`<div class="live-log-item"><b>${new Date(x.at).toLocaleString('de-DE')}</b><br>${esc(x.message)}</div>`).join(''):'<div class="live-empty">Noch keine Ereignisse protokolliert.</div>'}
function driverProfileMatchKey(v){return normKey(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim()}
function liveDriverList(){
  // P28: Gespeicherte Fahrerprofile sind führend; importierte Fahrernamen werden robust darauf gemappt.
  const contacts=getDriverContacts().filter(x=>x.active!==false).map(x=>({...x}));
  const byKey=new Map(contacts.map(c=>[driverProfileMatchKey(c.name),c]));
  rides.forEach(r=>{
    const name=String(r.driver||'').trim();if(!name)return;
    const key=driverProfileMatchKey(name),hit=byKey.get(key);
    if(hit){
      if(!hit.vehicle&&r.vehicle)hit.vehicle=String(r.vehicle).trim();
      if(!hit.phone)hit.phone=first(r.driverPhone,r.fahrerTelefon,r.fahrer_telefon,r.phone,r.telefon,r.tel);
      return;
    }
    const fallback={id:'ride-'+key,name,phone:first(r.driverPhone,r.fahrerTelefon,r.fahrer_telefon,r.phone,r.telefon,r.tel),vehicle:String(r.vehicle||'').trim(),active:true,fromRide:true};
    contacts.push(fallback);byKey.set(key,fallback);
  });
  return contacts;
}
function minutesOf(t){const m=String(t||'').match(/(\d{1,2}):(\d{2})/);return m?(+m[1]*60 + +m[2]):99999}
function berlinDateTimeMinuteStamp(value=new Date()){
  try{
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(value));
    const get=type=>Number(parts.find(p=>p.type===type)?.value||0);
    return Math.floor(Date.UTC(get('year'),get('month')-1,get('day'),get('hour'),get('minute'))/60000);
  }catch(_){const d=new Date(value);return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate(),d.getHours(),d.getMinutes())/60000)}
}
function rideDateTimeMinuteStamp(r){
  const date=String(first(r?.date,r?.datum)||'').trim(),time=effectiveTime(r),dm=date.match(/^(\d{4})-(\d{2})-(\d{2})$/),tm=String(time||'').match(/^(\d{1,2}):(\d{2})/);
  if(!dm||!tm)return null;
  const stamp=Math.floor(Date.UTC(Number(dm[1]),Number(dm[2])-1,Number(dm[3]),Number(tm[1]),Number(tm[2]))/60000);
  return Number.isFinite(stamp)?stamp:null;
}
function livePastRideGraceMinutes(settings=getLiveSettings()){
  const raw=Number(settings?.pastRideGraceMinutes??120);
  return Number.isFinite(raw)?Math.max(0,Math.min(1440,Math.round(raw))):120;
}
function isPastLiveDispositionRide(r,settings=getLiveSettings(),now=new Date()){
  const rideStamp=rideDateTimeMinuteStamp(r);if(rideStamp===null)return false;
  return berlinDateTimeMinuteStamp(now)>(rideStamp+livePastRideGraceMinutes(settings));
}
function ridesForLiveDriver(name){const settings=getLiveSettings();return visualRides(rides).filter(r=>normKey(r.driver)===normKey(name)&&!(r._bundleMemberIds||[r.id]).every(id=>done.has(id))&&!isPastLiveDispositionRide(r,settings)).sort((a,b)=>minutesOf(effectiveTime(a))-minutesOf(effectiveTime(b)))}
// CORE-006Y: Konservativer Verfügbarkeits-Guard. Ein Ersatzfahrer gilt nur dann als
// sicher verfügbar, wenn er aktiv + freigegeben ist und nach derselben Live-Dispo-
// Zeitlogik keine eigene offene Fahrt mehr hat. Wir erfinden bewusst keine
// Fahrtdauern/Transferzeiten; existiert eine offene Fahrt, bleibt die Dispo manuell.
function liveHandoverAvailability(target,settings=getLiveSettings()){
  if(!target||target.active===false)return{available:false,reason:'Ersatzfahrer ist nicht aktiv.',openRides:[]};
  if(!settings.consentByDriver?.[target.id])return{available:false,reason:'Trackingfreigabe fehlt.',openRides:[]};
  const openRides=ridesForLiveDriver(target.name);
  if(openRides.length){
    const firstRide=openRides[0],time=effectiveTime(firstRide)||'–',label=firstRide.flightNumber||firstRide.id||'Fahrt';
    return{available:false,reason:`Eigene offene Fahrt vorhanden: ${label} um ${time}.`,openRides};
  }
  return{available:true,reason:'Keine eigene offene Fahrt in der aktuellen Live-Disposition.',openRides:[]};
}
// CORE-007D8A1F1D8P27: Die Fahrerwarnung bewertet die tatsächliche Abholverschiebung.
// Airport-delayMinutes bleibt reine Flugereignis-Information und darf die Fahrt nicht direkt als verspätet markieren.
function livePickupDelayDeltaForRide(r){
  if(!liveSnapshotFreshness(r).usable)return null;
  const baseline=strictClockOrNull(first(dispoTimeOf(r),planTimeOf(r)));
  const livePickup=strictClockOrNull(liveTimeOf(r));
  return baseline&&livePickup?minuteDeltaClock(baseline,livePickup):null;
}
function delayForRide(r){
  const delta=livePickupDelayDeltaForRide(r);
  return delta===null?0:Math.max(0,Number(delta)||0);
}
// CORE-006U2 + P27: Für die Live-Disposition ist ausschließlich die bestätigte
// LIVE-Abholzeit gegen DISPO (Fallback PLAN) die Verspätungsbasis. scheduled/unknown
// ohne nutzbare LIVE-Abholzeit bleiben neutral und dürfen keine Fahrerwarnung erzeugen.
function liveDispositionAssessment(r,threshold=7){
  const freshness=liveSnapshotFreshness(r);
  if(!freshness.usable){
    if(freshness.stale)return{hasLive:false,hasDelayAssessment:false,delay:null,label:`LIVE-Daten veraltet${liveAgeLabel(freshness.ageMinutes)?` · ${liveAgeLabel(freshness.ageMinutes)}`:''}`,className:''};
    return{hasLive:false,hasDelayAssessment:false,delay:null,label:'Keine aktuell bestätigte LIVE-Zeit',className:''};
  }
  const status=String(r?.liveFlightStatus||'').trim().toLowerCase();
  if(status==='cancelled')return{hasLive:true,hasDelayAssessment:false,delay:null,label:'Storniert',className:'bad'};
  const pickupDelta=livePickupDelayDeltaForRide(r);
  if(pickupDelta!==null){
    const delay=Math.max(0,Number(pickupDelta)||0);
    const prefix=status==='landed'?'Gelandet · ':status==='departed'?'Abgeflogen · ':'';
    const label=pickupDelta>0
      ? `${prefix}LIVE-Abholzeit +${delay} Min.`
      : pickupDelta<0
        ? `${prefix}LIVE-Abholzeit ${Math.abs(pickupDelta)} Min. früher`
        : `${prefix}LIVE-Abholzeit pünktlich`;
    return{hasLive:true,hasDelayAssessment:true,delay,pickupDelta,label,className:delay>=threshold?'bad':delay>0?'warn':'good'};
  }
  if(status==='departed')return{hasLive:true,hasDelayAssessment:false,delay:null,label:'Abgeflogen · keine bestätigte LIVE-Abholzeit',className:''};
  if(status==='landed')return{hasLive:true,hasDelayAssessment:false,delay:null,label:'Gelandet · keine bestätigte LIVE-Abholzeit',className:''};
  if(status==='delayed')return{hasLive:true,hasDelayAssessment:false,delay:null,label:'Flug verspätet · keine bestätigte LIVE-Abholzeit',className:''};
  if(status==='on_time')return{hasLive:true,hasDelayAssessment:false,delay:null,label:'Flug pünktlich · keine bestätigte LIVE-Abholzeit',className:''};
  if(status==='scheduled')return{hasLive:false,hasDelayAssessment:false,delay:null,label:'Flug bestätigt · noch keine operative LIVE-Zeit',className:''};
  return{hasLive:false,hasDelayAssessment:false,delay:null,label:'Keine aktuell bestätigte LIVE-Zeit',className:''};
}
function liveStatusClass(d,threshold){return d>=threshold?'bad':d>0?'warn':'good'}
function liveRouteMode(){return getLiveSettings().mode==='route'}
function setLiveMode(mode){const s=getLiveSettings();s.mode=mode==='route'?'route':'standard';saveLiveSettings(s);renderLiveDisposition()}
function routeStatusLabel(delay,threshold){if(delay>=threshold)return['Verspätet','bad'];if(delay>0)return['Gefährdet','warn'];return['Pünktlich','good']}
function minutesUntilEffectiveTime(r){
  const t=effectiveTime(r),m=String(t||'').match(/(\d{1,2}):(\d{2})/);if(!m)return null;
  const now=new Date(),target=new Date(now);target.setHours(Number(m[1]),Number(m[2]),0,0);
  let diff=Math.round((target-now)/60000);
  if(diff < -720)diff+=1440;
  return diff;
}
function livePickupClockLabel(r){
  const diff=minutesUntilEffectiveTime(r);if(diff===null)return'Zeit nicht verfügbar';
  if(diff>0)return`noch ${diff} Min. bis Abholzeit`;
  if(diff===0)return'Abholzeit jetzt';
  return`${Math.abs(diff)} Min. nach Abholzeit`;
}
function geoAgeLabel(geo){
  if(!geo||!geo.time)return'kein GPS-Stand';
  const age=Math.max(0,Math.round((Date.now()-new Date(geo.time).getTime())/60000));
  return age<1?'GPS gerade aktualisiert':`GPS vor ${age} Min.`;
}
function routePointsForRide(r){
  if(!r)return[];
  const raw=r.isBundle&&Array.isArray(r.routeStops)&&r.routeStops.length
    ? [...r.routeStops].sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0)).map(x=>x.name)
    : [r.pickup,r.destination];
  const out=[];
  raw.forEach(value=>{const name=String(value||'').trim();if(name&&!out.some(x=>normKey(x)===normKey(name)))out.push(name)});
  return out;
}
function googleMapsRouteUrl(r,geo){
  const route=routeAddressResolution(r);
  if(!route.points.length)return{url:'',missing:[]};
  if(route.missing.length)return{url:'',missing:route.missing};
  const values=route.resolved.map(x=>x.value),hasGeo=geo&&Number.isFinite(Number(geo.lat))&&Number.isFinite(Number(geo.lng)),origin=hasGeo?`${Number(geo.lat)},${Number(geo.lng)}`:values[0],destination=values.at(-1),waypoints=(hasGeo?values.slice(0,-1):values.slice(1,-1)).filter(Boolean),params=new URLSearchParams({api:'1',origin,destination,travelmode:'driving'});
  if(waypoints.length)params.set('waypoints',waypoints.join('|'));
  return{url:`https://www.google.com/maps/dir/?${params.toString()}`,missing:[]};
}
function openGoogleMapsRoute(r,geo=null){const result=googleMapsRouteUrl(r,geo);if(result.missing?.length){showMissingRouteAddresses(result.missing);return false}if(!result.url){showToast('Keine vollständige Route verfügbar','warn');return false}window.open(result.url,'_blank');return true}
function routeLabelForRide(r){const route=routeAddressResolution(r),points=route.points.length?route.points:routePointsForRide(r);return points.length?points.join(' → '):'Keine Route verfügbar'}
// CORE-006S – Lokales, editierbares Orts-/Adressbuch.
function normalizeAddressAlias(value){return normKey(String(value||'').replace(/[.,;:]+$/g,''))}
function normalizeAddressBookEntry(raw,index=0){
  const name=String(raw?.name??raw?.shortName??raw?.kurzname??raw?.planName??'').trim();
  const address=String(raw?.address??raw?.adresse??'').trim();
  let aliases=raw?.aliases??raw?.aliase??raw?.alias??[];
  if(typeof aliases==='string')aliases=aliases.split(/\r?\n|\|/g);
  if(!Array.isArray(aliases))aliases=[];
  aliases=[...new Set(aliases.map(x=>String(x||'').trim()).filter(Boolean).filter(x=>normalizeAddressAlias(x)!==normalizeAddressAlias(name)))];
  return {id:String(raw?.id||`addr-${Date.now()}-${index}-${Math.random().toString(36).slice(2,8)}`),name,address,aliases,note:String(raw?.note??raw?.notiz??'').trim(),createdAt:String(raw?.createdAt||new Date().toISOString()),updatedAt:String(raw?.updatedAt||raw?.createdAt||new Date().toISOString())};
}
function getAddressBook(){try{const raw=JSON.parse(localStorage.getItem(ADDRESS_BOOK)||'[]');return(Array.isArray(raw)?raw:[]).map(normalizeAddressBookEntry).filter(x=>x.name&&x.address)}catch(_){return[]}}
function saveAddressBook(list,reason='address-book'){const clean=(Array.isArray(list)?list:[]).map(normalizeAddressBookEntry).filter(x=>x.name&&x.address).slice(0,3000);const ok=safePersistentSetItem(ADDRESS_BOOK,JSON.stringify(clean),reason);if(ok){capturePersistenceSafety(reason);try{updateBackupUI()}catch(_){ }try{updateSettingsHub()}catch(_){ }}return ok}
function addressBookTerms(entry){return[entry?.name,...(Array.isArray(entry?.aliases)?entry.aliases:[])].map(normalizeAddressAlias).filter(Boolean)}
function findAddressBookEntry(place){const key=normalizeAddressAlias(place);if(!key)return null;const hits=getAddressBook().filter(entry=>addressBookTerms(entry).includes(key));return hits.length===1?hits[0]:null}
function normalizeAddressCandidate(raw,index=0){
  const name=String(raw?.name||'').trim(),key=normalizeAddressAlias(name);
  const seenPickup=Array.isArray(raw?.seenPickup)?[...new Set(raw.seenPickup.map(x=>String(x||'')).filter(Boolean))].slice(-1000):[];
  const seenDestination=Array.isArray(raw?.seenDestination)?[...new Set(raw.seenDestination.map(x=>String(x||'')).filter(Boolean))].slice(-1000):[];
  return{id:String(raw?.id||`addr-cand-${Date.now()}-${index}-${Math.random().toString(36).slice(2,8)}`),name,key,pickupCount:Math.max(Number(raw?.pickupCount)||seenPickup.length,seenPickup.length),destinationCount:Math.max(Number(raw?.destinationCount)||seenDestination.length,seenDestination.length),seenPickup,seenDestination,firstSeenAt:String(raw?.firstSeenAt||new Date().toISOString()),lastSeenAt:String(raw?.lastSeenAt||raw?.firstSeenAt||new Date().toISOString()),lastPlanDate:String(raw?.lastPlanDate||''),ignored:Boolean(raw?.ignored)}
}
function getAddressCandidates(){try{const raw=JSON.parse(localStorage.getItem(ADDRESS_CANDIDATES)||'[]');return(Array.isArray(raw)?raw:[]).map(normalizeAddressCandidate).filter(x=>x.name&&x.key)}catch(_){return[]}}
function saveAddressCandidates(list,reason='address-candidates'){
  const clean=(Array.isArray(list)?list:[]).map(normalizeAddressCandidate).filter(x=>x.name&&x.key).slice(0,3000);
  const ok=safePersistentSetItem(ADDRESS_CANDIDATES,JSON.stringify(clean),reason);
  if(ok)capturePersistenceSafety(reason);
  return ok
}
function addressCandidateFingerprint(ride){
  return [ride?.date||ride?.planDate||'',planTimeOf(ride),normKey(ride?.flightNumber),normKey(ride?.driver),normKey(ride?.pickup),normKey(ride?.destination),normKey(ride?.vehicle),Number(ride?.persons)||0,Number(ride?.price)||0].join('|')
}
function addressCandidateRouteHasUnresolvedOcrConflict(ride,field){
  if(!field)return false;
  if(ride?.[`${field}NeedsManualCheck`])return true;
  const current=normalizeAddressAlias(ride?.[field]),attempts=Array.isArray(ride?.[`${field}TargetedOcrAttempts`])?ride[`${field}TargetedOcrAttempts`]:[];
  const candidates=attempts.map(item=>normalizeAddressAlias(item?.candidate)).filter(Boolean);
  if(candidates.length<2)return false;
  const counts=new Map();candidates.forEach(value=>counts.set(value,(counts.get(value)||0)+1));
  const winner=[...counts.entries()].sort((a,b)=>b[1]-a[1])[0];
  return Boolean(winner&&winner[1]>=2&&winner[0]!==current&&!ride?.[`${field}RecoveredFromTargetedOcr`])
}
function addressCandidateRoutePoints(ride){
  const points=[];
  const add=(name,role,field='')=>{const value=String(name||'').trim();if(value)points.push({name:value,role,field})};
  add(ride?.pickup,'pickup','pickup');add(ride?.destination,'destination','destination');
  if(Array.isArray(ride?.bundleStops))ride.bundleStops.forEach(stop=>add(stop?.name,String(stop?.type||'').toLowerCase()==='pickup'?'pickup':'destination'));
  const seen=new Set();
  return points.filter(point=>{const key=`${point.role}|${normalizeAddressAlias(point.name)}`;if(!normalizeAddressAlias(point.name)||seen.has(key))return false;seen.add(key);return true})
}
function collectAddressBookCandidates(source,reason='address-candidates-import'){
  const incoming=Array.isArray(source)?source:[],list=getAddressCandidates(),byKey=new Map(list.map(entry=>[entry.key,entry]));
  let changed=false,added=0;
  for(const ride of incoming){
    const baseFingerprint=addressCandidateFingerprint(ride);
    for(const point of addressCandidateRoutePoints(ride)){
      const key=normalizeAddressAlias(point.name);
      if(!key||addressCandidateRouteHasUnresolvedOcrConflict(ride,point.field)||findAddressBookEntry(point.name))continue;
      // Eingebaute Airport-Ziele sind bereits vollständig navigierbar und benötigen
      // keinen zusätzlichen Adressbuch-Eintrag. Echte zusammengesetzte Routen, deren
      // Einzelstopps bereits auflösbar sind, werden ebenfalls nicht als „fehlend“ gesammelt.
      if(flightAirportIataFromPlace(point.name))continue;
      try{if(compositeRoutePointResolution(point.name))continue}catch(_){}
      let entry=byKey.get(key);
      if(!entry){
        entry=normalizeAddressCandidate({name:point.name,firstSeenAt:new Date().toISOString(),lastSeenAt:new Date().toISOString(),lastPlanDate:String(ride?.planDate||ride?.date||'')},list.length);
        list.push(entry);byKey.set(key,entry);added++;changed=true;
      }
      const seenKey=point.role==='pickup'?'seenPickup':'seenDestination';
      const countKey=point.role==='pickup'?'pickupCount':'destinationCount';
      const fingerprint=`${point.role}|${baseFingerprint}`;
      if(!entry[seenKey].includes(fingerprint)){
        entry[seenKey].push(fingerprint);if(entry[seenKey].length>1000)entry[seenKey]=entry[seenKey].slice(-1000);
        entry[countKey]=Math.max(Number(entry[countKey])||0,entry[seenKey].length);
        entry.lastSeenAt=new Date().toISOString();entry.lastPlanDate=String(ride?.planDate||ride?.date||entry.lastPlanDate||'');
        changed=true;
      }
    }
  }
  if(changed)saveAddressCandidates(list,reason);
  return{changed,added,open:getAddressCandidates().filter(entry=>!entry.ignored&&!findAddressBookEntry(entry.name)).length}
}
function visibleAddressCandidates(query=''){
  const q=normKey(query);
  return getAddressCandidates().filter(entry=>!entry.ignored&&!findAddressBookEntry(entry.name)&&(!q||normKey(entry.name).includes(q))).sort((a,b)=>(Number(b.pickupCount||0)+Number(b.destinationCount||0))-(Number(a.pickupCount||0)+Number(a.destinationCount||0))||String(a.name).localeCompare(String(b.name),'de'))
}
function renderAddressCandidates(query=''){
  const host=$('addressCandidateList'),card=$('addressCandidateCard'),count=$('addressCandidateCount');if(!host||!card)return;
  const allOpen=visibleAddressCandidates(''),visible=visibleAddressCandidates(query);
  card.classList.toggle('hidden',allOpen.length===0);
  if(count)count.textContent=`${allOpen.length} offen`;
  host.innerHTML=visible.length?visible.map(entry=>{
    const roles=[entry.pickupCount?`Abholung ${entry.pickupCount}×`:'',entry.destinationCount?`Ziel ${entry.destinationCount}×`:'' ].filter(Boolean).join(' · ');
    const date=entry.lastPlanDate?` · zuletzt ${entry.lastPlanDate.split('-').reverse().join('.')}`:'';
    return`<div class="setting-card" data-address-candidate-id="${esc(entry.id)}"><div class="address-compact-main"><strong>${esc(entry.name)}</strong><small>${esc(roles+date)}</small><em>Noch nicht im Adressbuch</em></div><div class="address-editor-actions"><button type="button" class="act dark" data-address-candidate-add="${esc(entry.id)}">+ Ins Adressbuch</button><button type="button" class="act" data-address-candidate-ignore="${esc(entry.id)}">Ignorieren</button></div></div>`
  }).join(''):'<div class="setting-note address-empty">Keine passenden Kandidaten zur Suche.</div>';
}
function openAddressCandidateEditor(id){
  const entry=getAddressCandidates().find(x=>String(x.id)===String(id));if(!entry)return;
  resetAddressBookForm();const name=$('addressBookName');if(name)name.value=entry.name;showAddressBookEditor('new')
}
function ignoreAddressCandidate(id){
  const list=getAddressCandidates(),entry=list.find(x=>String(x.id)===String(id));if(!entry)return;
  entry.ignored=true;entry.lastSeenAt=new Date().toISOString();
  if(saveAddressCandidates(list,'address-candidate-ignore')){renderAddressBook();showToast('Adressbuch-Kandidat ignoriert','ok')}
}
function addressBookHasCollision(candidate,excludeId=''){const wanted=new Set(addressBookTerms(candidate));if(!wanted.size)return null;return getAddressBook().find(entry=>String(entry.id)!==String(excludeId)&&addressBookTerms(entry).some(term=>wanted.has(term)))||null}
function resetAddressBookForm(){for(const id of['addressBookEditId','addressBookName','addressBookAddress','addressBookAliases','addressBookNote']){const el=$(id);if(el)el.value=''}const saveBtn=$('addressBookSaveBtn'),cancelBtn=$('addressBookCancelEditBtn');if(saveBtn)saveBtn.textContent='+ Adresse speichern';if(cancelBtn)cancelBtn.classList.add('hidden')}
function addressBookDisplayMeta(entry){
  const note=String(entry?.note||'').trim(),parts={};
  note.split(/\s*\|\|\s*/).forEach(piece=>{const m=piece.match(/^([^:]{2,32}):\s*(.+)$/);if(m)parts[normKey(m[1])]=m[2].trim()});
  let category=parts.kategorie||parts.category||'';
  if(!category){const probe=normKey(`${entry?.name||''} ${entry?.address||''}`);if(/flughafen|airport/.test(probe))category='Flughafen';else if(/hotel/.test(probe))category='Hotel';else if(/taxi/.test(probe))category='Taxistand';else category='Adresse'}
  return{category,phone:parts.telefon||parts.phone||'',website:parts.website||parts.webseite||'',hints:parts.hinweise||parts.hinweis||'',maps:parts['google maps']||parts.maps||'',sources:parts.quellen||parts.quelle||'',rawNote:note};
}
function addressBookFieldRow(label,value,opts={}){if(!String(value||'').trim())return'';const v=String(value).trim();const content=opts.link?`<a href="${esc(v)}" target="_blank" rel="noopener noreferrer">${esc(v)}</a>`:esc(v);return`<div class="address-detail-row"><span>${esc(label)}</span><strong>${content}</strong></div>`}
function renderAddressBook(){
  const host=$('addressBookList'),status=$('addressBookStatus'),searchInfo=$('addressBookSearchInfo');if(!host)return;
  const rawQuery=String($('addressBookSearch')?.value||''),q=normKey(rawQuery),all=getAddressBook();
  const visible=all.filter(e=>!q||[e.name,e.address,...e.aliases,e.note].some(v=>normKey(v).includes(q)));
  const count=$('addressBookPageCount');if(count)count.textContent=`${all.length} gespeicherte Adresse${all.length===1?'':'n'}`;
  if(searchInfo){searchInfo.textContent=q?`${visible.length} Treffer von ${all.length}`:`${all.length} Adresse(n) verfügbar`;searchInfo.style.color=q&&visible.length===0?'#ffc14d':''}
  if(status)status.textContent=q?`${visible.length} Treffer von ${all.length} Adresse(n)`:`${all.length} Adresse(n) gespeichert · lokal auf diesem Gerät`;
  host.innerHTML=visible.length?visible.map(e=>{const meta=addressBookDisplayMeta(e);return`<button type="button" class="address-compact-item" data-address-id="${esc(e.id)}"><span class="address-compact-main"><strong>${esc(e.name)}</strong><small>${esc(e.address)}</small><em>${esc(meta.category)}</em></span><span class="address-compact-chevron">›</span></button>`}).join(''):'<div class="setting-note address-empty">Noch keine passenden Orte & Adressen gespeichert.</div>';
  renderAddressCandidates(rawQuery);
}
function showAddressBookBrowse(opts={}){const panel=$('atmsAddressBookPanel');if(!panel)return;['addressBookBrowseView','addressBookEditorView','addressBookDetailView','addressBookTransferView'].forEach(id=>$(id)?.classList.add('hidden'));$('addressBookBrowseView')?.classList.remove('hidden');renderAddressBook();panel.classList.remove('atms-mobile-nav-collapsed');if(opts.restoreScroll)atmsSettingsSetScroll(atmsSettingsListScroll.address,'address');else requestAnimationFrame(()=>panel.scrollIntoView({block:'start'}))}
function showAddressBookEditor(mode='new',opts={}){const panel=$('atmsAddressBookPanel');if(!panel)return;const id=String(opts.id||$('addressBookEditId')?.value||'');if(opts.history!==false){atmsSettingsRememberScroll('address');atmsSettingsPushRoute('address','editor',mode==='edit'?id:'')}['addressBookBrowseView','addressBookDetailView','addressBookTransferView'].forEach(id=>$(id)?.classList.add('hidden'));$('addressBookEditorView')?.classList.remove('hidden');const title=$('addressBookEditorTitle');if(title)title.textContent=mode==='edit'?'Adresse bearbeiten':'Neue Adresse';panel.classList.remove('atms-mobile-nav-collapsed');requestAnimationFrame(()=>{panel.scrollIntoView({block:'start'});setTimeout(()=>$('addressBookName')?.focus(),80)})}
function showAddressBookDetail(id,opts={}){const e=getAddressBook().find(x=>String(x.id)===String(id));if(!e)return;if(opts.history!==false){atmsSettingsRememberScroll('address');atmsSettingsPushRoute('address','detail',id)}const meta=addressBookDisplayMeta(e),body=$('addressBookDetailBody');if(!body)return;body.dataset.addressId=e.id;body.innerHTML=`<div class="address-detail-hero"><div class="address-detail-type">${esc(meta.category)}</div><h3>${esc(e.name)}</h3><p>${esc(e.address)}</p></div>${addressBookFieldRow('Aliase',e.aliases.join(' · '))}${addressBookFieldRow('Telefon',meta.phone)}${addressBookFieldRow('Website',meta.website,{link:/^https?:/i.test(meta.website)})}${addressBookFieldRow('Google Maps',meta.maps,{link:/^https?:/i.test(meta.maps)})}${addressBookFieldRow('Hinweise',meta.hints)}${addressBookFieldRow('Quellen',meta.sources)}${meta.rawNote&&!Object.keys(meta).some(k=>k!=='rawNote'&&k!=='category'&&meta[k])?addressBookFieldRow('Notiz',meta.rawNote):''}`;const title=$('addressBookDetailTitle');if(title)title.textContent=e.name;['addressBookBrowseView','addressBookEditorView','addressBookTransferView'].forEach(id=>$(id)?.classList.add('hidden'));$('addressBookDetailView')?.classList.remove('hidden');$('atmsAddressBookPanel')?.classList.remove('atms-mobile-nav-collapsed');requestAnimationFrame(()=>$('atmsAddressBookPanel')?.scrollIntoView({block:'start'}))}
function openSettingsAddressPage(mode='browse',opts={}){
  showView('settings');closeSettingsDriverPage();ensureAddressBookPanel();const view=$('settingsView'),panel=$('atmsAddressBookPanel');if(!view||!panel)return;setSettingsAddressPageActive(true);panel.classList.remove('hidden');panel.classList.remove('atms-mobile-nav-collapsed');
  if(opts.history!==false)atmsSettingsPushRoute('address',mode==='transfer'?'transfer':'browse');
  if(mode==='transfer'){['addressBookBrowseView','addressBookEditorView','addressBookDetailView'].forEach(id=>$(id)?.classList.add('hidden'));$('addressBookTransferView')?.classList.remove('hidden')}else showAddressBookBrowse({restoreScroll:!!opts.restoreScroll});
  if(!opts.restoreScroll)requestAnimationFrame(()=>{try{window.scrollTo(0,0)}catch(_){ }try{view.scrollTop=0}catch(_){ }panel.scrollIntoView({block:'start'})});
}
function closeSettingsAddressPage(){const panel=$('atmsAddressBookPanel');setSettingsAddressPageActive(false);panel?.classList.add('hidden');['addressBookEditorView','addressBookDetailView','addressBookTransferView'].forEach(id=>$(id)?.classList.add('hidden'));$('addressBookBrowseView')?.classList.remove('hidden');resetAddressBookForm();}
function installAddressBookSearchEvents(){
  const input=$('addressBookSearch');if(!input||input.dataset.atmsSearchS3==='1')return;
  input.dataset.atmsSearchS3='1';
  let pollTimer=0,lastValue=String(input.value||'');
  const refresh=()=>{lastValue=String(input.value||'');renderAddressBook()};
  const refreshSoon=()=>{refresh();setTimeout(refresh,0);setTimeout(refresh,80)};
  ['input','keyup','change','search','compositionend'].forEach(type=>input.addEventListener(type,refreshSoon));
  ['paste','cut','compositionupdate'].forEach(type=>input.addEventListener(type,()=>setTimeout(refreshSoon,0)));
  input.addEventListener('focus',()=>{clearInterval(pollTimer);lastValue=String(input.value||'');pollTimer=setInterval(()=>{const current=String(input.value||'');if(current!==lastValue){lastValue=current;renderAddressBook()}},120)});
  input.addEventListener('blur',()=>{clearInterval(pollTimer);pollTimer=0;refreshSoon()});
}
function saveAddressBookForm(){
  const editId=String($('addressBookEditId')?.value||'').trim(),name=String($('addressBookName')?.value||'').trim(),address=String($('addressBookAddress')?.value||'').trim(),aliases=String($('addressBookAliases')?.value||'').split(/\r?\n|\|/g).map(x=>x.trim()).filter(Boolean),note=String($('addressBookNote')?.value||'').trim();
  if(!name){showToast('Bitte Kurzname / Planname eingeben','warn');return}if(!address){showToast('Bitte vollständige Adresse eingeben','warn');return}
  const list=getAddressBook(),old=list.find(x=>String(x.id)===editId),candidate=normalizeAddressBookEntry({...old,id:editId||undefined,name,address,aliases,note,createdAt:old?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()});
  const collision=addressBookHasCollision(candidate,editId);if(collision){alert(`Kurzname oder Alias ist bereits „${collision.name}“ zugeordnet. Bitte einen eindeutigen Namen/Alias verwenden.`);return}
  const next=editId?list.map(x=>String(x.id)===editId?candidate:x):[candidate,...list];if(!saveAddressBook(next,'address-book-edit')){showToast('Adresse konnte nicht gespeichert werden','warn');return}resetAddressBookForm();atmsSettingsReturnToBrowse('address');renderAddressBook();updateSettingsHub();showToast(editId?'Adresse geändert':'Adresse gespeichert','ok');
}
function editAddressBookEntry(id){const e=getAddressBook().find(x=>String(x.id)===String(id));if(!e)return;$('addressBookEditId').value=e.id;$('addressBookName').value=e.name;$('addressBookAddress').value=e.address;$('addressBookAliases').value=e.aliases.join('\n');$('addressBookNote').value=e.note||'';$('addressBookSaveBtn').textContent='Änderungen speichern';$('addressBookCancelEditBtn')?.classList.remove('hidden');showAddressBookEditor('edit',{id:e.id})}
function deleteAddressBookEntry(id){const e=getAddressBook().find(x=>String(x.id)===String(id));if(!e)return;if(!confirm(`Ort „${e.name}“ wirklich aus Orte & Adressen löschen?`))return;saveAddressBook(getAddressBook().filter(x=>String(x.id)!==String(id)),'address-book-delete');resetAddressBookForm();atmsSettingsReturnToBrowse('address');updateSettingsHub();showToast('Adresse gelöscht','ok')}
function addressBookImportMode(count){const current=getAddressBook();if(!current.length)return'replace';if(confirm(`${count} Adresse(n) wurden erkannt.\n\nOK = Bestehende Adressen BEHALTEN & Import ERGÄNZEN\nAbbrechen = weitere Auswahl`))return'merge';return confirm(`Bestehende ${current.length} Adresse(n) durch die Importdatei ERSETZEN?\n\nOK = bestehende Adressen ersetzen\nAbbrechen = Import ohne Änderung abbrechen`)?'replace':'cancel'}
function validateImportedAddressEntries(rows){const out=[],seen=new Set();for(let i=0;i<rows.length;i++){const e=normalizeAddressBookEntry(rows[i],i);if(!e.name&&!e.address)continue;if(!e.name||!e.address)throw new Error(`Zeile ${i+2}: Kurzname und Adresse sind erforderlich.`);const terms=addressBookTerms(e);if(terms.some(t=>seen.has(t)))throw new Error(`Zeile ${i+2}: Kurzname/Alias kommt in der Importdatei doppelt vor.`);terms.forEach(t=>seen.add(t));out.push(e)}if(!out.length)throw new Error('Keine gültigen Adressen in der Datei gefunden.');return out}
function csvDetectDelimiter(text){const line=String(text||'').split(/\r?\n/).find(x=>x.trim())||'';return(line.match(/;/g)||[]).length>=(line.match(/,/g)||[]).length?';':','}
function parseDelimitedRows(text){const src=String(text||'').replace(/^\uFEFF/,''),d=csvDetectDelimiter(src),rows=[];let row=[],cell='',quoted=false;for(let i=0;i<src.length;i++){const ch=src[i];if(quoted){if(ch==='"'&&src[i+1]==='"'){cell+='"';i++;continue}if(ch==='"'){quoted=false;continue}cell+=ch;continue}if(ch==='"'){quoted=true;continue}if(ch===d){row.push(cell);cell='';continue}if(ch==='\n'){row.push(cell.replace(/\r$/,''));rows.push(row);row=[];cell='';continue}cell+=ch}if(cell.length||row.length){row.push(cell.replace(/\r$/,''));rows.push(row)}return rows.filter(r=>r.some(c=>String(c||'').trim()))}
function addressRowsFromMatrix(matrix){if(!Array.isArray(matrix)||!matrix.length)throw new Error('Datei enthält keine Tabellenzeilen.');const headers=matrix[0].map(v=>normKey(v).replace(/[ _-]+/g,'')),pick=names=>{for(const n of names){const i=headers.indexOf(n);if(i>=0)return i}return-1},nameI=pick(['kurzname','planname','name','ort']),addressI=pick(['adresse','address','vollständigeadresse','vollstaendigeadresse']),aliasI=pick(['aliase','alias','aliases']),noteI=pick(['notiz','note','hinweis']);if(nameI<0||addressI<0)throw new Error('Benötigte Spalten fehlen. Erwartet: „Kurzname“ und „Adresse“.');return matrix.slice(1).map(row=>({name:String(row[nameI]??'').trim(),address:String(row[addressI]??'').trim(),aliases:String(aliasI>=0?row[aliasI]??'':'').split(/\r?\n|\|/g).map(x=>x.trim()).filter(Boolean),note:String(noteI>=0?row[noteI]??'':'').trim()}))}
function xmlEscape(value){return String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;')}
function xlsxColumnName(index){let n=index+1,out='';while(n){n--;out=String.fromCharCode(65+n%26)+out;n=Math.floor(n/26)}return out}
function loadAddressBookJsZip(){if(window.JSZip)return Promise.resolve(window.JSZip);if(window.__atmsJsZipPromise)return window.__atmsJsZipPromise;window.__atmsJsZipPromise=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL('js/jszip.min.js',document.baseURI).href;script.async=true;script.onload=()=>window.JSZip?resolve(window.JSZip):reject(new Error('Excel-Modul wurde nicht geladen.'));script.onerror=()=>reject(new Error('Excel-Modul js/jszip.min.js fehlt. Bitte CORE-006S vollständig installieren.'));document.head.appendChild(script)});return window.__atmsJsZipPromise}
function xmlLocalElements(root,name){
  if(!root)return[];
  try{const byNs=[...root.getElementsByTagNameNS('*',name)];if(byNs.length)return byNs}catch(_){}
  const direct=[...root.getElementsByTagName(name)];if(direct.length)return direct;
  return [...root.getElementsByTagName('*')].filter(el=>String(el.localName||el.nodeName||'').split(':').at(-1)===name);
}
async function parseAddressBookXlsx(file){
  const JSZip=await loadAddressBookJsZip(),zip=await JSZip.loadAsync(await file.arrayBuffer()),wbFile=zip.file('xl/workbook.xml'),relsFile=zip.file('xl/_rels/workbook.xml.rels');if(!wbFile||!relsFile)throw new Error('Excel-Datei enthält keine lesbare Arbeitsmappe.');
  const parser=new DOMParser(),wb=parser.parseFromString(await wbFile.async('text'),'application/xml'),sheet=xmlLocalElements(wb,'sheet')[0];if(!sheet)throw new Error('Excel-Datei enthält kein Arbeitsblatt.');const relId=sheet.getAttribute('r:id')||sheet.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id');
  const rels=parser.parseFromString(await relsFile.async('text'),'application/xml');let target='';for(const rel of xmlLocalElements(rels,'Relationship'))if(rel.getAttribute('Id')===relId){target=rel.getAttribute('Target')||'';break}if(!target)target='worksheets/sheet1.xml';target=target.replace(/^\/?xl\//,'').replace(/^\//,'');const sheetFile=zip.file('xl/'+target.replace(/^\.\//,''));if(!sheetFile)throw new Error('Erstes Excel-Arbeitsblatt konnte nicht gelesen werden.');
  let shared=[];const sharedFile=zip.file('xl/sharedStrings.xml');if(sharedFile){const doc=parser.parseFromString(await sharedFile.async('text'),'application/xml');shared=xmlLocalElements(doc,'si').map(si=>xmlLocalElements(si,'t').map(t=>t.textContent||'').join(''))}
  const doc=parser.parseFromString(await sheetFile.async('text'),'application/xml'),matrix=[];for(const rowEl of xmlLocalElements(doc,'row')){const row=[];for(const c of xmlLocalElements(rowEl,'c')){const ref=c.getAttribute('r')||'',letters=(ref.match(/[A-Z]+/i)||['A'])[0].toUpperCase();let idx=0;for(const ch of letters)idx=idx*26+(ch.charCodeAt(0)-64);idx=Math.max(0,idx-1);const type=c.getAttribute('t')||'';let value='';if(type==='inlineStr')value=xmlLocalElements(c,'t').map(t=>t.textContent||'').join('');else{const v=xmlLocalElements(c,'v')[0]?.textContent||'';value=type==='s'?String(shared[Number(v)]??''):v}row[idx]=value}matrix.push(row)}return addressRowsFromMatrix(matrix)
}
async function parseAddressBookFile(file){const n=String(file?.name||'').toLowerCase();if(n.endsWith('.xlsx'))return validateImportedAddressEntries(await parseAddressBookXlsx(file));if(n.endsWith('.csv')||n.endsWith('.txt'))return validateImportedAddressEntries(addressRowsFromMatrix(parseDelimitedRows(await file.text())));throw new Error('Bitte eine Excel-Datei (.xlsx) oder CSV-Datei (.csv) auswählen.')}
function mergeAddressBookImported(imported){const current=getAddressBook(),next=[...current],owner=new Map();let added=0,unchanged=0,conflicts=0;current.forEach(e=>addressBookTerms(e).forEach(t=>{if(!owner.has(t))owner.set(t,e)}));for(const e of imported){const collision=addressBookTerms(e).map(t=>owner.get(t)).find(Boolean);if(collision){if(normalizeAddressAlias(collision.name)===normalizeAddressAlias(e.name)&&normKey(collision.address)===normKey(e.address))unchanged++;else conflicts++;continue}const fresh=normalizeAddressBookEntry({...e,id:undefined,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});next.push(fresh);addressBookTerms(fresh).forEach(t=>owner.set(t,fresh));added++}return{list:next,added,unchanged,conflicts}}
async function importAddressBookFile(file){try{const imported=await parseAddressBookFile(file),mode=addressBookImportMode(imported.length);if(mode==='cancel'){showToast('Adressimport abgebrochen','warn');return}capturePersistenceSafety('before-address-book-import');try{localStorage.setItem('atms_address_book_previous_import_v1',JSON.stringify({savedAt:new Date().toISOString(),addresses:getAddressBook()}))}catch(_){ }if(mode==='replace'){const now=new Date().toISOString(),fresh=imported.map((e,i)=>normalizeAddressBookEntry({...e,id:`addr-${Date.now()}-${i}`,createdAt:now,updatedAt:now},i));saveAddressBook(fresh,'address-book-import-replace');renderAddressBook();const status=$('addressBookStatus');if(status)status.textContent=`${fresh.length} Adresse(n) gespeichert · bestehende Adressen wurden ersetzt.`;showToast(`${fresh.length} Adressen importiert · bestehende ersetzt`,'ok');return}const m=mergeAddressBookImported(imported);saveAddressBook(m.list,'address-book-import-merge');renderAddressBook();const msg=`${m.added} neu · ${m.unchanged} unverändert${m.conflicts?` · ${m.conflicts} Konflikt(e) nicht überschrieben`:''}`;const status=$('addressBookStatus');if(status)status.textContent=msg;showToast(msg,m.conflicts?'warn':'ok')}catch(e){const status=$('addressBookStatus');if(status)status.textContent='Importfehler: '+e.message;showToast('Adressimport fehlgeschlagen','warn')}}
function addressBookExportRows(){return[['Kurzname','Adresse','Aliase','Notiz'],...getAddressBook().map(e=>[e.name,e.address,e.aliases.join(' | '),e.note||''])]}
function csvCell(v){v=String(v??'');return/[;"\r\n]/.test(v)?`"${v.replace(/"/g,'""')}"`:v}
async function exportAddressBookCsv(){try{const rows=addressBookExportRows(),empty=rows.length<=1,text='\uFEFF'+rows.map(r=>r.map(csvCell).join(';')).join('\r\n'),d=new Date(),p=n=>String(n).padStart(2,'0'),name=`ATMS_Adressen_${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}.csv`,blob=new Blob([text],{type:'text/csv;charset=utf-8'});const mode=await saveExportBlob(blob,name,'text/csv');const status=$('addressBookStatus');if(status)status.textContent=mode==='native'?(empty?'CSV-Adressvorlage als Datei gespeichert.':`${rows.length-1} Adresse(n) als CSV-Datei gespeichert.`):(empty?'CSV-Adressvorlage: Download gestartet.':'CSV-Adressliste: Download gestartet.');showToast(empty?'CSV-Adressvorlage exportiert':'CSV-Adressliste exportiert','ok')}catch(e){const message=String(e?.message||e||'');const status=$('addressBookStatus');if(/abgebrochen/i.test(message)){if(status)status.textContent='CSV-Export abgebrochen.';showToast('CSV-Export abgebrochen','warn')}else{if(status)status.textContent='CSV-Exportfehler: '+message;showToast('CSV-Export fehlgeschlagen','warn')}}}
async function exportAddressBookXlsx(){try{const rows=addressBookExportRows(),empty=rows.length<=1,JSZip=await loadAddressBookJsZip(),zip=new JSZip(),sheetRows=rows.map((r,ri)=>`<row r="${ri+1}">${r.map((v,ci)=>`<c r="${xlsxColumnName(ci)}${ri+1}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(v)}</t></is></c>`).join('')}</row>`).join('');zip.file('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>');zip.file('_rels/.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');zip.file('xl/workbook.xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="ATMS Adressen" sheetId="1" r:id="rId1"/></sheets></workbook>');zip.file('xl/_rels/workbook.xml.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>');zip.file('xl/worksheets/sheet1.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`);const xlsxMime='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',blob=await zip.generateAsync({type:'blob',compression:'DEFLATE',mimeType:xlsxMime}),d=new Date(),p=n=>String(n).padStart(2,'0'),name=`ATMS_Adressen_${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}.xlsx`;const mode=await saveExportBlob(blob,name,xlsxMime);const status=$('addressBookStatus');if(status)status.textContent=mode==='native'?(empty?'Excel-Adressvorlage als Datei gespeichert.':`${rows.length-1} Adresse(n) als Excel-Datei gespeichert.`):(empty?'Excel-Adressvorlage: Download gestartet.':'Excel-Adressliste: Download gestartet.');showToast(empty?'Excel-Adressvorlage exportiert':'Excel-Adressliste exportiert','ok')}catch(e){const message=String(e?.message||e||'');const status=$('addressBookStatus');if(/abgebrochen/i.test(message)){if(status)status.textContent='Excel-Export abgebrochen.';showToast('Excel-Export abgebrochen','warn')}else{if(status)status.textContent='Excel-Exportfehler: '+message;showToast('Excel-Export fehlgeschlagen','warn')}}}
function ensureAddressBookPanel(){
  const view=$('settingsView'),host=$('settingsToolsHost');if(!view)return false;let panel=$('atmsAddressBookPanel');
  if(panel&&panel.dataset.atmsP95Gate2Panel!=='1'){panel.remove();panel=null}
  if(panel){if(host&&panel.parentElement!==host)host.appendChild(panel);renderAddressBook();return true}
  panel=document.createElement('section');panel.id='atmsAddressBookPanel';panel.dataset.atmsP95Gate2Panel='1';panel.className='settings-address-page hidden';
  panel.innerHTML=`<div class="settings-subpage-head atms-mobile-topbar"><button type="button" id="addressBookBackSettings" class="settings-back-btn" aria-label="Zurück zu Einstellungen">‹</button><div class="atms-mobile-title"><h2>📍 Adressen</h2><small id="addressBookPageCount">0 gespeicherte Adressen</small></div><div class="atms-mobile-head-actions"><button type="button" id="addressBookHeadSearch" class="atms-mobile-icon-btn" aria-label="Adresse suchen">⌕</button><button type="button" id="addressBookHeadAdd" class="atms-mobile-icon-btn" aria-label="Neue Adresse">＋</button></div></div>
  <div id="addressBookBrowseView"><div class="address-toolbar"><input id="addressBookSearch" class="setting-input" placeholder="Adresse suchen …" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" enterkeyhint="search"><button type="button" id="addressBookNewBtn" class="address-new-btn">+ Neue Adresse</button></div><div id="addressBookSearchInfo" class="address-search-info">Adresssuche bereit.</div><section id="addressCandidateCard" class="setting-card hidden"><div class="address-search-info"><strong>📥 Adressbuch-Kandidaten</strong> · <span id="addressCandidateCount">0 offen</span><br><small>Unbekannte Routenorte aus bestätigten Planimporten. Erst nach deiner Prüfung ins Adressbuch übernehmen.</small></div><div id="addressCandidateList" class="address-compact-list"></div></section><div id="addressBookList" class="address-compact-list"></div></div>
  <div id="addressBookEditorView" class="hidden"><div class="address-inner-head atms-mobile-topbar atms-mobile-innerbar"><button type="button" id="addressBookEditorBack" class="settings-back-btn" aria-label="Zurück">‹</button><h3 id="addressBookEditorTitle">Neue Adresse</h3></div><input id="addressBookEditId" type="hidden"><label class="setting-label" for="addressBookName">Kurzname / Planname</label><input id="addressBookName" class="setting-input" placeholder="z. B. Holiday Inn Toulouseallee" autocomplete="off"><label class="setting-label" for="addressBookAddress">Vollständige Adresse</label><input id="addressBookAddress" class="setting-input" placeholder="Straße Hausnummer, PLZ Ort" autocomplete="street-address"><label class="setting-label" for="addressBookAliases">Aliase (optional · je Zeile oder mit | trennen)</label><textarea id="addressBookAliases" class="setting-input address-aliases" placeholder="z. B. Holiday Inn DUS"></textarea><label class="setting-label" for="addressBookNote">Notiz (optional)</label><textarea id="addressBookNote" class="setting-input address-note-input" placeholder="z. B. Haupteingang / Buszufahrt"></textarea><div class="address-editor-actions"><button type="button" id="addressBookSaveBtn" class="act dark">+ Adresse speichern</button><button type="button" id="addressBookCancelEditBtn" class="act hidden">Bearbeiten abbrechen</button></div></div>
  <div id="addressBookDetailView" class="hidden"><div class="address-inner-head atms-mobile-topbar atms-mobile-innerbar"><button type="button" id="addressBookDetailBack" class="settings-back-btn" aria-label="Zurück">‹</button><h3 id="addressBookDetailTitle">Adressdetails</h3></div><div id="addressBookDetailBody" class="address-detail-body"></div><div class="address-detail-actions"><button type="button" id="addressBookDetailEdit" class="act dark">✎ Bearbeiten</button><button type="button" id="addressBookDetailDelete" class="act danger">🗑 Löschen</button></div></div>
  <div id="addressBookTransferView" class="hidden"><div class="address-inner-head atms-mobile-topbar atms-mobile-innerbar"><button type="button" id="addressBookTransferBack" class="settings-back-btn" aria-label="Zurück">‹</button><h3>📥 Import &amp; Export</h3></div><p class="setting-note">Gate 2: Die bestehenden Adress-Datenwerkzeuge bleiben unverändert verfügbar. Die endgültige Import-&amp;-Export-Seite folgt in ihrem eigenen Gate.</p><div class="address-transfer-actions"><button type="button" id="addressBookImportBtn" class="act dark">📥 Excel/CSV importieren</button><input id="addressBookImportInput" type="file" accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" class="hidden"><button type="button" id="addressBookExportXlsxBtn" class="act">📤 Excel exportieren</button><button type="button" id="addressBookExportCsvBtn" class="act">📤 CSV exportieren</button></div><div id="addressBookStatus" class="address-transfer-status"></div></div>`;
  if(host)host.appendChild(panel);else view.appendChild(panel);
  $('addressBookBackSettings')?.addEventListener('click',atmsSettingsBack);
  $('addressBookNewBtn')?.addEventListener('click',()=>{resetAddressBookForm();showAddressBookEditor('new')});
  $('addressBookEditorBack')?.addEventListener('click',()=>{resetAddressBookForm();atmsSettingsBack()});
  $('addressBookDetailBack')?.addEventListener('click',atmsSettingsBack);
  $('addressBookTransferBack')?.addEventListener('click',atmsSettingsBack);
  $('addressBookHeadSearch')?.addEventListener('click',()=>atmsSettingsFocusBrowse('address'));$('addressBookHeadAdd')?.addEventListener('click',()=>{resetAddressBookForm();showAddressBookEditor('new')});
  $('addressBookSaveBtn')?.addEventListener('click',saveAddressBookForm);
  $('addressBookCancelEditBtn')?.addEventListener('click',()=>{resetAddressBookForm();atmsSettingsBack()});
  installAddressBookSearchEvents();
  $('addressBookList')?.addEventListener('click',e=>{const row=e.target.closest('[data-address-id]');if(row)showAddressBookDetail(row.dataset.addressId)});
  $('addressCandidateList')?.addEventListener('click',e=>{
    const add=e.target.closest('[data-address-candidate-add]');if(add){openAddressCandidateEditor(add.dataset.addressCandidateAdd);return}
    const ignore=e.target.closest('[data-address-candidate-ignore]');if(ignore)ignoreAddressCandidate(ignore.dataset.addressCandidateIgnore)
  });
  $('addressBookDetailEdit')?.addEventListener('click',()=>{const id=$('addressBookDetailBody')?.dataset.addressId;if(id)editAddressBookEntry(id)});
  $('addressBookDetailDelete')?.addEventListener('click',()=>{const id=$('addressBookDetailBody')?.dataset.addressId;if(id)deleteAddressBookEntry(id)});
  $('addressBookImportBtn')?.addEventListener('click',()=>{const input=$('addressBookImportInput');if(input){input.value='';input.click()}});
  $('addressBookImportInput')?.addEventListener('change',e=>{const file=e.target.files?.[0];if(file)importAddressBookFile(file)});
  $('addressBookExportXlsxBtn')?.addEventListener('click',exportAddressBookXlsx);$('addressBookExportCsvBtn')?.addEventListener('click',exportAddressBookCsv);
  renderAddressBook();return true
}
// P100: Offene Adressbuch-Kandidaten als editierbare PC-Tabelle exportieren und fail-closed wieder einlesen.
function addressCandidateTransferRows(){
  const header=['Aktion','Erkannter Name','Kurzname / Planname','Typ','Vollständige Adresse','Alias 1','Alias 2','Telefon','Website','Google Maps','Hinweise','Quellen','Abholung Anzahl','Ziel Anzahl','Letzter Plantag','Kandidaten-ID (nicht ändern)'];
  const rows=visibleAddressCandidates('').map(entry=>['OFFEN',entry.name,entry.name,'','','','','','','','', '',Number(entry.pickupCount)||0,Number(entry.destinationCount)||0,entry.lastPlanDate||'',entry.id]);
  return[header,...rows]
}
function addressCandidateTransferAction(value){
  const key=normKey(value).replace(/\s+/g,'');
  if(!key||key==='offen'||key==='open')return'open';
  if(['übernehmen','uebernehmen','ubernehmen','importieren','hinzufügen','hinzufuegen','add','ja'].includes(key))return'take';
  if(['ignorieren','ignore','nein'].includes(key))return'ignore';
  return'invalid'
}
function addressCandidateTransferHeaderKey(value){return normKey(value).replace(/[\s_()\/.-]+/g,'').replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss')}
function addressCandidateRowsFromMatrix(matrix){
  if(!Array.isArray(matrix)||!matrix.length)throw new Error('Kandidaten-Datei enthält keine Tabellenzeilen.');
  const headers=matrix[0].map(addressCandidateTransferHeaderKey),pick=names=>{for(const name of names){const i=headers.indexOf(addressCandidateTransferHeaderKey(name));if(i>=0)return i}return-1};
  const actionI=pick(['Aktion']),recognizedI=pick(['Erkannter Name','ErkannterName']),shortI=pick(['Kurzname / Planname','Kurzname','Planname']),typeI=pick(['Typ','Kategorie']),addressI=pick(['Vollständige Adresse','Vollstaendige Adresse','Adresse']),alias1I=pick(['Alias 1','Alias1']),alias2I=pick(['Alias 2','Alias2']),phoneI=pick(['Telefon','Phone']),websiteI=pick(['Website','Webseite']),mapsI=pick(['Google Maps','Maps']),hintsI=pick(['Hinweise','Hinweis','Notiz']),sourcesI=pick(['Quellen','Quelle']),idI=pick(['Kandidaten-ID (nicht ändern)','Kandidaten-ID (nicht aendern)','Kandidaten-ID','KandidatenID']);
  if(actionI<0||recognizedI<0||idI<0)throw new Error('Benötigte Spalten fehlen. Erwartet: „Aktion“, „Erkannter Name“ und „Kandidaten-ID (nicht ändern)“.');
  return matrix.slice(1).map((row,index)=>({row:index+2,action:String(row[actionI]??'').trim(),recognizedName:String(row[recognizedI]??'').trim(),shortName:String(shortI>=0?row[shortI]??'':'').trim(),type:String(typeI>=0?row[typeI]??'':'').trim(),address:String(addressI>=0?row[addressI]??'':'').trim(),alias1:String(alias1I>=0?row[alias1I]??'':'').trim(),alias2:String(alias2I>=0?row[alias2I]??'':'').trim(),phone:String(phoneI>=0?row[phoneI]??'':'').trim(),website:String(websiteI>=0?row[websiteI]??'':'').trim(),maps:String(mapsI>=0?row[mapsI]??'':'').trim(),hints:String(hintsI>=0?row[hintsI]??'':'').trim(),sources:String(sourcesI>=0?row[sourcesI]??'':'').trim(),candidateId:String(row[idI]??'').trim()})).filter(row=>[row.action,row.recognizedName,row.shortName,row.type,row.address,row.alias1,row.alias2,row.phone,row.website,row.maps,row.hints,row.sources,row.candidateId].some(v=>String(v||'').trim()))
}
async function addressCandidateReadXlsxMatrix(file){
  const JSZip=await loadAddressBookJsZip(),zip=await JSZip.loadAsync(await file.arrayBuffer()),wbFile=zip.file('xl/workbook.xml'),relsFile=zip.file('xl/_rels/workbook.xml.rels');if(!wbFile||!relsFile)throw new Error('Excel-Datei enthält keine lesbare Arbeitsmappe.');
  const parser=new DOMParser(),wb=parser.parseFromString(await wbFile.async('text'),'application/xml'),sheet=xmlLocalElements(wb,'sheet')[0];if(!sheet)throw new Error('Excel-Datei enthält kein Arbeitsblatt.');const relId=sheet.getAttribute('r:id')||sheet.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id');
  const rels=parser.parseFromString(await relsFile.async('text'),'application/xml');let target='';for(const rel of xmlLocalElements(rels,'Relationship'))if(rel.getAttribute('Id')===relId){target=rel.getAttribute('Target')||'';break}if(!target)target='worksheets/sheet1.xml';target=target.replace(/^\/?xl\//,'').replace(/^\//,'');const sheetFile=zip.file('xl/'+target.replace(/^\.\//,''));if(!sheetFile)throw new Error('Erstes Excel-Arbeitsblatt konnte nicht gelesen werden.');
  let shared=[];const sharedFile=zip.file('xl/sharedStrings.xml');if(sharedFile){const doc=parser.parseFromString(await sharedFile.async('text'),'application/xml');shared=xmlLocalElements(doc,'si').map(si=>xmlLocalElements(si,'t').map(t=>t.textContent||'').join(''))}
  const doc=parser.parseFromString(await sheetFile.async('text'),'application/xml'),matrix=[];for(const rowEl of xmlLocalElements(doc,'row')){const row=[];for(const c of xmlLocalElements(rowEl,'c')){const ref=c.getAttribute('r')||'',letters=(ref.match(/[A-Z]+/i)||['A'])[0].toUpperCase();let idx=0;for(const ch of letters)idx=idx*26+(ch.charCodeAt(0)-64);idx=Math.max(0,idx-1);const cellType=c.getAttribute('t')||'';let value='';if(cellType==='inlineStr')value=xmlLocalElements(c,'t').map(t=>t.textContent||'').join('');else{const v=xmlLocalElements(c,'v')[0]?.textContent||'';value=cellType==='s'?String(shared[Number(v)]??''):v}row[idx]=value}matrix.push(row)}return matrix
}
async function parseAddressCandidateTransferFile(file){
  const n=String(file?.name||'').toLowerCase();
  if(n.endsWith('.xlsx'))return addressCandidateRowsFromMatrix(await addressCandidateReadXlsxMatrix(file));
  if(n.endsWith('.csv')||n.endsWith('.txt'))return addressCandidateRowsFromMatrix(parseDelimitedRows(await file.text()));
  throw new Error('Bitte eine Kandidaten-Excel-Datei (.xlsx) oder CSV-Datei (.csv) auswählen.')
}
function addressCandidateImportNote(row){
  const parts=[],add=(label,value)=>{const v=String(value||'').trim();if(v)parts.push(`${label}: ${v}`)};
  add('Kategorie',row.type);add('Telefon',row.phone);add('Website',row.website);add('Google Maps',row.maps);add('Hinweise',row.hints);add('Quellen',row.sources);return parts.join(' || ')
}
function planAddressCandidateTransferImport(rows){
  const book=getAddressBook(),candidates=getAddressCandidates(),candidateById=new Map(candidates.map(x=>[String(x.id),x])),candidateByName=new Map();
  candidates.forEach(x=>{const key=normalizeAddressAlias(x.name);if(!candidateByName.has(key))candidateByName.set(key,[]);candidateByName.get(key).push(x)});
  const owner=new Map();book.forEach(entry=>addressBookTerms(entry).forEach(term=>{if(!owner.has(term))owner.set(term,entry)}));
  const additions=[],ignoreIds=new Set(),stats={rows:0,newAddresses:0,ignored:0,existing:0,conflicts:0,missingAddress:0,open:0,invalidAction:0,unmatchedCandidate:0};
  for(const row of (Array.isArray(rows)?rows:[])){
    stats.rows++;const action=addressCandidateTransferAction(row.action);if(action==='open'){stats.open++;continue}if(action==='invalid'){stats.invalidAction++;continue}
    let candidate=candidateById.get(String(row.candidateId||''));if(!candidate){const hits=candidateByName.get(normalizeAddressAlias(row.recognizedName))||[];if(hits.length===1)candidate=hits[0]}
    if(!candidate){stats.unmatchedCandidate++;continue}
    if(action==='ignore'){ignoreIds.add(String(candidate.id));stats.ignored++;continue}
    if(findAddressBookEntry(candidate.name)){stats.existing++;continue}
    const name=String(row.shortName||row.recognizedName||candidate.name||'').trim(),address=String(row.address||'').trim();
    if(!name||!address){stats.missingAddress++;continue}
    const aliases=[row.alias1,row.alias2];if(normalizeAddressAlias(candidate.name)!==normalizeAddressAlias(name))aliases.push(candidate.name);
    const proposed=normalizeAddressBookEntry({name,address,aliases,note:addressCandidateImportNote(row),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
    const collision=addressBookTerms(proposed).map(term=>owner.get(term)).find(Boolean);
    if(collision){if(normalizeAddressAlias(collision.name)===normalizeAddressAlias(proposed.name)&&normKey(collision.address)===normKey(proposed.address))stats.existing++;else stats.conflicts++;continue}
    additions.push({candidateId:String(candidate.id),entry:proposed});addressBookTerms(proposed).forEach(term=>owner.set(term,proposed));stats.newAddresses++;
  }
  return{book,candidates,additions,ignoreIds,stats}
}
function addressCandidateImportSummary(plan){const s=plan.stats;return `Kandidaten-Datei geprüft:\n\n${s.newAddresses} neue Adresse(n) übernehmen\n${s.ignored} Kandidat(en) ignorieren\n${s.existing} bereits vorhanden\n${s.conflicts} Konflikt(e) – bleiben unverändert\n${s.missingAddress} ohne vollständige Adresse – bleiben offen\n${s.invalidAction} ungültige Aktion(en) – bleiben offen\n${s.unmatchedCandidate} nicht zuordenbar – bleiben offen\n${s.open} OFFEN – keine Änderung\n\nBestehende Adressen werden NICHT überschrieben oder gelöscht.\n\nNur die sicheren Änderungen jetzt anwenden?`}
async function importAddressCandidateTransferFile(file){
  try{
    setSettingsTransferStatus('Kandidaten-Datei wird geprüft …');const rows=await parseAddressCandidateTransferFile(file),plan=planAddressCandidateTransferImport(rows),changes=plan.additions.length+plan.ignoreIds.size;
    if(!changes){const s=plan.stats,msg=`Keine sicheren Änderungen: ${s.existing} vorhanden · ${s.conflicts} Konflikt(e) · ${s.missingAddress} ohne Adresse · ${s.open} offen.`;setSettingsTransferStatus(msg,s.conflicts||s.missingAddress?'warn':'ok');showToast('Kandidaten-Datei geprüft · keine Änderung',s.conflicts||s.missingAddress?'warn':'ok');return}
    if(!confirm(addressCandidateImportSummary(plan))){setSettingsTransferStatus('Kandidaten-Import abgebrochen. Keine Daten geändert.','warn');showToast('Kandidaten-Import abgebrochen','warn');return}
    capturePersistenceSafety('before-address-candidate-file-import');const beforeBook=plan.book,beforeCandidates=plan.candidates;
    const nextBook=[...plan.additions.map(x=>x.entry),...beforeBook];if(plan.additions.length&&!saveAddressBook(nextBook,'address-candidate-file-import'))throw new Error('Neue Adressen konnten nicht sicher gespeichert werden.');
    if(plan.ignoreIds.size){const now=new Date().toISOString(),nextCandidates=beforeCandidates.map(entry=>plan.ignoreIds.has(String(entry.id))?{...entry,ignored:true,lastSeenAt:now}:entry);if(!saveAddressCandidates(nextCandidates,'address-candidate-file-import-ignore')){if(plan.additions.length)saveAddressBook(beforeBook,'address-candidate-file-import-rollback');throw new Error('Kandidatenstatus konnte nicht sicher gespeichert werden. Adressänderungen wurden zurückgerollt.')}}
    renderAddressBook();renderSettingsTransferInfo();updateSettingsHub();capturePersistenceSafety('after-address-candidate-file-import');const s=plan.stats,msg=`✓ ${s.newAddresses} neue Adresse(n) · ${s.ignored} ignoriert${s.conflicts?` · ${s.conflicts} Konflikt(e) unverändert`:''}${s.missingAddress?` · ${s.missingAddress} ohne Adresse offen`:''}`;setSettingsTransferStatus(msg,s.conflicts||s.missingAddress?'warn':'ok');showToast('Adressbuch-Kandidaten übernommen','ok')
  }catch(e){const m=String(e?.message||e||'');setSettingsTransferStatus(/abgebrochen/i.test(m)?'Kandidaten-Import abgebrochen.':'Kandidaten-Import fehlgeschlagen: '+m,'warn');showToast(/abgebrochen/i.test(m)?'Kandidaten-Import abgebrochen':'Kandidaten-Import fehlgeschlagen','warn')}
}
async function exportAddressCandidatesCsv(){
  try{const rows=addressCandidateTransferRows(),count=rows.length-1,text='\uFEFF'+rows.map(r=>r.map(csvCell).join(';')).join('\r\n'),name=`ATMS_Adresskandidaten_${settingsTransferDateStamp()}.csv`,blob=new Blob([text],{type:'text/csv;charset=utf-8'});setSettingsTransferStatus('Kandidaten-CSV wird vorbereitet …');const mode=await saveExportBlob(blob,name,'text/csv');setSettingsTransferStatus(mode==='native'?`${count} offene Kandidat(en) als CSV-Datei gespeichert.`:`${count} offene Kandidat(en): CSV-Download gestartet.`,'ok');showToast('Adresskandidaten-CSV exportiert','ok')}catch(e){const m=String(e?.message||e||'');setSettingsTransferStatus(/abgebrochen/i.test(m)?'Kandidaten-CSV-Export abgebrochen.':'Kandidaten-CSV-Export fehlgeschlagen: '+m,'warn');showToast(/abgebrochen/i.test(m)?'CSV-Export abgebrochen':'CSV-Export fehlgeschlagen','warn')}
}
async function exportAddressCandidatesXlsx(){
  try{const rows=addressCandidateTransferRows(),count=rows.length-1,JSZip=await loadAddressBookJsZip(),zip=new JSZip(),sheetRows=rows.map((r,ri)=>`<row r="${ri+1}">${r.map((v,ci)=>`<c r="${xlsxColumnName(ci)}${ri+1}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(v)}</t></is></c>`).join('')}</row>`).join('');zip.file('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>');zip.file('_rels/.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');zip.file('xl/workbook.xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="ATMS Kandidaten" sheetId="1" r:id="rId1"/></sheets></workbook>');zip.file('xl/_rels/workbook.xml.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>');zip.file('xl/worksheets/sheet1.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`);const mime='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',blob=await zip.generateAsync({type:'blob',compression:'DEFLATE',mimeType:mime}),name=`ATMS_Adresskandidaten_${settingsTransferDateStamp()}.xlsx`;setSettingsTransferStatus('Kandidaten-Excel wird vorbereitet …');const mode=await saveExportBlob(blob,name,mime);setSettingsTransferStatus(mode==='native'?`${count} offene Kandidat(en) als Excel-Datei gespeichert.`:`${count} offene Kandidat(en): Excel-Download gestartet.`,'ok');showToast('Adresskandidaten-Excel exportiert','ok')}catch(e){const m=String(e?.message||e||'');setSettingsTransferStatus(/abgebrochen/i.test(m)?'Kandidaten-Excel-Export abgebrochen.':'Kandidaten-Excel-Export fehlgeschlagen: '+m,'warn');showToast(/abgebrochen/i.test(m)?'Excel-Export abgebrochen':'Excel-Export fehlgeschlagen','warn')}
}
function settingsTransferDateStamp(){const d=new Date(),p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`}
function driverExportRows(){return [['Name','Telefon','Fahrzeug','Aktiv','Favorit','Notiz'],...getDriverContacts().map(d=>[d.name||'',d.phone||'',d.vehicle||'',d.active!==false?'Ja':'Nein',d.favorite?'Ja':'Nein',d.note||''])]}
function setSettingsTransferStatus(message,type=''){const el=$('settingsTransferStatus');if(el){el.textContent=String(message||'');el.className='settings-transfer-status '+String(type||'')}}
function renderSettingsTransferInfo(){const a=$('settingsTransferAddressCount'),c=$('settingsTransferCandidateCount'),d=$('settingsTransferDriverCount');if(a)a.textContent=String(getAddressBook().length);if(c)c.textContent=String(visibleAddressCandidates('').length);if(d)d.textContent=String(getDriverContacts().length)}
async function exportDriversCsv(){try{const rows=driverExportRows(),empty=rows.length<=1,text='\uFEFF'+rows.map(r=>r.map(csvCell).join(';')).join('\r\n'),name=`ATMS_Fahrer_${settingsTransferDateStamp()}.csv`,blob=new Blob([text],{type:'text/csv;charset=utf-8'});setSettingsTransferStatus('Fahrer-CSV wird vorbereitet …');const mode=await saveExportBlob(blob,name,'text/csv');setSettingsTransferStatus(mode==='native'?(empty?'CSV-Fahrervorlage gespeichert.':`${rows.length-1} Fahrer als CSV-Datei gespeichert.`):(empty?'CSV-Fahrervorlage: Download gestartet.':'Fahrer-CSV: Download gestartet.'),'ok');showToast(empty?'CSV-Fahrervorlage exportiert':'Fahrer-CSV exportiert','ok')}catch(e){const m=String(e?.message||e||'');setSettingsTransferStatus(/abgebrochen/i.test(m)?'Fahrer-CSV-Export abgebrochen.':'Fahrer-CSV-Export fehlgeschlagen: '+m,'warn');showToast(/abgebrochen/i.test(m)?'CSV-Export abgebrochen':'CSV-Export fehlgeschlagen','warn')}}
async function exportDriversXlsx(){try{const rows=driverExportRows(),empty=rows.length<=1,JSZip=await loadAddressBookJsZip(),zip=new JSZip(),sheetRows=rows.map((r,ri)=>`<row r="${ri+1}">${r.map((v,ci)=>`<c r="${xlsxColumnName(ci)}${ri+1}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(v)}</t></is></c>`).join('')}</row>`).join('');zip.file('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>');zip.file('_rels/.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');zip.file('xl/workbook.xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="ATMS Fahrer" sheetId="1" r:id="rId1"/></sheets></workbook>');zip.file('xl/_rels/workbook.xml.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>');zip.file('xl/worksheets/sheet1.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`);const mime='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',blob=await zip.generateAsync({type:'blob',compression:'DEFLATE',mimeType:mime}),name=`ATMS_Fahrer_${settingsTransferDateStamp()}.xlsx`;setSettingsTransferStatus('Fahrer-Excel wird vorbereitet …');const mode=await saveExportBlob(blob,name,mime);setSettingsTransferStatus(mode==='native'?(empty?'Excel-Fahrervorlage gespeichert.':`${rows.length-1} Fahrer als Excel-Datei gespeichert.`):(empty?'Excel-Fahrervorlage: Download gestartet.':'Fahrer-Excel: Download gestartet.'),'ok');showToast(empty?'Excel-Fahrervorlage exportiert':'Fahrer-Excel exportiert','ok')}catch(e){const m=String(e?.message||e||'');setSettingsTransferStatus(/abgebrochen/i.test(m)?'Fahrer-Excel-Export abgebrochen.':'Fahrer-Excel-Export fehlgeschlagen: '+m,'warn');showToast(/abgebrochen/i.test(m)?'Excel-Export abgebrochen':'Excel-Export fehlgeschlagen','warn')}}
async function settingsTransferImportAddresses(file){if(!file)return;setSettingsTransferStatus('Adressdatei wird geprüft …');await importAddressBookFile(file);renderSettingsTransferInfo();const legacy=String($('addressBookStatus')?.textContent||'').trim();if(/fehler|abgebrochen/i.test(legacy))setSettingsTransferStatus(legacy,'warn');else setSettingsTransferStatus(legacy||`Adressbestand: ${getAddressBook().length} gespeichert.`,'ok')}
async function settingsTransferRunAddressExport(type){setSettingsTransferStatus(type==='xlsx'?'Adress-Excel wird vorbereitet …':'Adress-CSV wird vorbereitet …');if(type==='xlsx')await exportAddressBookXlsx();else await exportAddressBookCsv();const legacy=String($('addressBookStatus')?.textContent||'').trim();if(/fehler|abgebrochen/i.test(legacy))setSettingsTransferStatus(legacy,'warn');else setSettingsTransferStatus(legacy||`Adressbestand: ${getAddressBook().length} gespeichert.`,'ok')}
function showSettingsTransferBrowse(){const panel=$('atmsSettingsTransferPanel');if(!panel)return;renderSettingsTransferInfo();panel.classList.remove('atms-mobile-nav-collapsed');setSettingsTransferStatus('Bereit für Import & Export.');requestAnimationFrame(()=>{try{window.scrollTo(0,0)}catch(_){ }try{$('settingsView').scrollTop=0}catch(_){ }})}
function showSettingsPlanImport(opts={}){if(opts.history!==false)atmsSettingsPushRoute('transfer','planimport');document.querySelectorAll('.nav').forEach(x=>x.classList.remove('active'));showView('import');const back=$('importBack');if(back)back.setAttribute('aria-label','Zurück zu Import & Export')}
function atmsPlanImportBack(){const route=atmsSettingsReadRoute();if(route?.kind==='transfer'&&route.level==='planimport'&&Number(route.depth)>1){try{history.back();return}catch(_){ }}render()}
function ensureSettingsTransferPanel(){
  const view=$('settingsView'),host=$('settingsToolsHost');if(!view)return false;let panel=$('atmsSettingsTransferPanel');if(panel)return true;
  panel=document.createElement('section');panel.id='atmsSettingsTransferPanel';panel.dataset.atmsP95Gate5Panel='1';panel.className='settings-transfer-page hidden';
  panel.innerHTML=`<div class="settings-subpage-head atms-mobile-topbar"><button type="button" id="settingsTransferBackSettings" class="settings-back-btn" aria-label="Zurück zu Einstellungen">‹</button><div class="atms-mobile-title"><h2>📥 Import &amp; Export</h2><small>Daten schnell austauschen</small></div></div>
  <div id="settingsTransferBrowseView" class="settings-transfer-body">
    <section class="settings-transfer-card"><div class="settings-transfer-card-head"><span class="settings-transfer-icon">📋</span><div><h3>Planliste</h3><p>Bild/WhatsApp, Excel, CSV oder ATMS-JSON mit der bestehenden Planlistenanalyse importieren.</p></div></div><button type="button" id="settingsTransferPlanImport" class="settings-transfer-primary">📋 Planliste importieren</button></section>
    <section class="settings-transfer-card"><div class="settings-transfer-card-head"><span class="settings-transfer-icon">📍</span><div><h3>Adressen</h3><p><strong id="settingsTransferAddressCount">0</strong> gespeicherte Adressen · bestehende Konfliktprüfung bleibt aktiv.</p></div></div><input id="settingsTransferAddressInput" type="file" accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" class="hidden"><div class="settings-transfer-actions"><button type="button" id="settingsTransferAddressImport" class="act dark">📥 Excel/CSV importieren</button><button type="button" id="settingsTransferAddressXlsx" class="act">📤 Excel exportieren</button><button type="button" id="settingsTransferAddressCsv" class="act">📤 CSV exportieren</button></div></section>
    <section class="settings-transfer-card"><div class="settings-transfer-card-head"><span class="settings-transfer-icon">📥</span><div><h3>Adressbuch-Kandidaten</h3><p><strong id="settingsTransferCandidateCount">0</strong> offene Kandidaten · am PC ergänzen und mit Aktion OFFEN / ÜBERNEHMEN / IGNORIEREN zurückgeben. Bestehende Adressen werden nie automatisch überschrieben.</p></div></div><input id="settingsTransferCandidateInput" type="file" accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" class="hidden"><div class="settings-transfer-actions"><button type="button" id="settingsTransferCandidateImport" class="act dark">📥 Bearbeitete Datei einlesen</button><button type="button" id="settingsTransferCandidateXlsx" class="act">📤 Excel exportieren</button><button type="button" id="settingsTransferCandidateCsv" class="act">📤 CSV exportieren</button></div></section>
    <section class="settings-transfer-card"><div class="settings-transfer-card-head"><span class="settings-transfer-icon">🚗</span><div><h3>Fahrer</h3><p><strong id="settingsTransferDriverCount">0</strong> gespeicherte Fahrer · Name, Telefon, Fahrzeug, Status, Favorit und Notiz.</p></div></div><div class="settings-transfer-actions two"><button type="button" id="settingsTransferDriverXlsx" class="act">📤 Excel exportieren</button><button type="button" id="settingsTransferDriverCsv" class="act">📤 CSV exportieren</button></div></section>
    <div id="settingsTransferStatus" class="settings-transfer-status">Bereit für Import &amp; Export.</div>
  </div>`;
  if(host)host.appendChild(panel);else view.appendChild(panel);
  $('settingsTransferBackSettings')?.addEventListener('click',atmsSettingsBack);
  $('settingsTransferPlanImport')?.addEventListener('click',()=>showSettingsPlanImport());
  $('settingsTransferAddressImport')?.addEventListener('click',()=>{const input=$('settingsTransferAddressInput');if(input){input.value='';input.click()}});
  $('settingsTransferAddressInput')?.addEventListener('change',e=>{const file=e.target.files?.[0];if(file)settingsTransferImportAddresses(file)});
  $('settingsTransferAddressXlsx')?.addEventListener('click',()=>settingsTransferRunAddressExport('xlsx'));
  $('settingsTransferAddressCsv')?.addEventListener('click',()=>settingsTransferRunAddressExport('csv'));
  $('settingsTransferCandidateImport')?.addEventListener('click',()=>{const input=$('settingsTransferCandidateInput');if(input){input.value='';input.click()}});
  $('settingsTransferCandidateInput')?.addEventListener('change',e=>{const file=e.target.files?.[0];if(file)importAddressCandidateTransferFile(file)});
  $('settingsTransferCandidateXlsx')?.addEventListener('click',exportAddressCandidatesXlsx);
  $('settingsTransferCandidateCsv')?.addEventListener('click',exportAddressCandidatesCsv);
  $('settingsTransferDriverXlsx')?.addEventListener('click',exportDriversXlsx);
  $('settingsTransferDriverCsv')?.addEventListener('click',exportDriversCsv);
  renderSettingsTransferInfo();return true
}
function openSettingsTransferPage(opts={}){showView('settings');ensureSettingsTransferPanel();closeSettingsAddressPage();closeSettingsDriverPage();closeSettingsDispatcherPage();closeSettingsBackupPage();const view=$('settingsView'),panel=$('atmsSettingsTransferPanel');if(!view||!panel)return;setSettingsTransferPageActive(true);panel.classList.remove('hidden');panel.classList.remove('atms-mobile-nav-collapsed');if(opts.history!==false)atmsSettingsPushRoute('transfer','browse');showSettingsTransferBrowse();requestAnimationFrame(()=>panel.scrollIntoView({block:'start'}))}
function closeSettingsTransferPage(){const panel=$('atmsSettingsTransferPanel');setSettingsTransferPageActive(false);panel?.classList.add('hidden');requestAnimationFrame(()=>{try{window.scrollTo(0,0)}catch(_){ }})}

// CORE-007D8A1F1D8P95-GATE6: bestehende Backup-Engine unverändert in eine eigene Settings-Unterseite verschieben.
function showSettingsBackupBrowse(){
  const panel=$('atmsSettingsBackupPanel');if(!panel)return;
  panel.classList.remove('atms-mobile-nav-collapsed');
  const legacy=$('backupCard');if(legacy)legacy.style.removeProperty('display');
  updateBackupUI();ensureStorageV2StatusCard();renderStorageV2StatusCard();ensureStorageV2ArchiveCard();renderStorageV2ArchiveCard();
  requestAnimationFrame(()=>{try{window.scrollTo(0,0)}catch(_){ }try{$('settingsView').scrollTop=0}catch(_){ }})
}
function ensureSettingsBackupPanel(){
  const view=$('settingsView'),host=$('settingsToolsHost'),legacy=$('backupCard');if(!view||!legacy)return false;
  let panel=$('atmsSettingsBackupPanel');if(panel)return true;
  panel=document.createElement('section');panel.id='atmsSettingsBackupPanel';panel.dataset.atmsP95Gate6Panel='1';panel.className='settings-backup-page hidden';
  panel.innerHTML=`<div class="settings-subpage-head atms-mobile-topbar"><button type="button" id="settingsBackupBackSettings" class="settings-back-btn" aria-label="Zurück zu Einstellungen">‹</button><div class="atms-mobile-title"><h2>💾 Backup &amp; Wiederherstellen</h2><small>ATMS-Daten sicher verwalten</small></div></div><div id="settingsBackupBody" class="settings-backup-body"></div>`;
  if(host)host.appendChild(panel);else view.appendChild(panel);
  $('settingsBackupBody')?.appendChild(legacy);
  legacy.classList.add('settings-backup-card');legacy.style.removeProperty('display');
  $('settingsBackupBackSettings')?.addEventListener('click',atmsSettingsBack);
  updateBackupUI();ensureStorageV2StatusCard();ensureStorageV2ArchiveCard();return true
}
function openSettingsBackupPage(opts={}){
  showView('settings');if(!ensureSettingsBackupPanel())return;
  closeSettingsAddressPage();closeSettingsDriverPage();closeSettingsDispatcherPage();closeSettingsTransferPage();
  const view=$('settingsView'),panel=$('atmsSettingsBackupPanel');if(!view||!panel)return;
  setSettingsBackupPageActive(true);panel.classList.remove('hidden');panel.classList.remove('atms-mobile-nav-collapsed');$('backupCard')?.style.removeProperty('display');
  if(opts.history!==false)atmsSettingsPushRoute('backup','browse');showSettingsBackupBrowse();requestAnimationFrame(()=>panel.scrollIntoView({block:'start'}))
}
function closeSettingsBackupPage(){
  const panel=$('atmsSettingsBackupPanel');setSettingsBackupPageActive(false);panel?.classList.add('hidden');requestAnimationFrame(()=>{try{window.scrollTo(0,0)}catch(_){ }})
}
// CORE-007D8A1F1D8P95-GATE7: bestehende Über-ATMS-PRO-Karte unverändert in eine eigene System-Unterseite verschieben.
function showSettingsAboutBrowse(){
  const panel=$('atmsSettingsAboutPanel');if(!panel)return;
  panel.classList.remove('atms-mobile-nav-collapsed');
  const legacy=$('infoCard');if(legacy)legacy.style.removeProperty('display');
  requestAnimationFrame(()=>{try{window.scrollTo(0,0)}catch(_){ }try{$('settingsView').scrollTop=0}catch(_){ }})
}
function ensureSettingsAboutPanel(){
  const view=$('settingsView'),host=$('settingsToolsHost'),legacy=$('infoCard');if(!view||!legacy)return false;
  let panel=$('atmsSettingsAboutPanel');if(panel)return true;
  panel=document.createElement('section');panel.id='atmsSettingsAboutPanel';panel.dataset.atmsP95Gate7Panel='1';panel.className='settings-about-page hidden';
  panel.innerHTML=`<div class="settings-subpage-head atms-mobile-topbar"><button type="button" id="settingsAboutBackSettings" class="settings-back-btn" aria-label="Zurück zu Einstellungen">‹</button><div class="atms-mobile-title"><h2>ℹ️ Über ATMS PRO</h2><small>Version, Build und Systeminformationen</small></div></div><div id="settingsAboutBody" class="settings-about-body"></div>`;
  if(host)host.appendChild(panel);else view.appendChild(panel);
  $('settingsAboutBody')?.appendChild(legacy);
  legacy.classList.add('settings-about-card');legacy.style.removeProperty('display');
  $('settingsAboutBackSettings')?.addEventListener('click',atmsSettingsBack);
  return true
}
function openSettingsAboutPage(opts={}){
  showView('settings');if(!ensureSettingsAboutPanel())return;
  closeSettingsAddressPage();closeSettingsDriverPage();closeSettingsDispatcherPage();closeSettingsTransferPage();closeSettingsBackupPage();
  const view=$('settingsView'),panel=$('atmsSettingsAboutPanel');if(!view||!panel)return;
  setSettingsAboutPageActive(true);panel.classList.remove('hidden');panel.classList.remove('atms-mobile-nav-collapsed');$('infoCard')?.style.removeProperty('display');
  if(opts.history!==false)atmsSettingsPushRoute('about','browse');showSettingsAboutBrowse();requestAnimationFrame(()=>panel.scrollIntoView({block:'start'}))
}
function closeSettingsAboutPage(){
  const panel=$('atmsSettingsAboutPanel');setSettingsAboutPageActive(false);panel?.classList.add('hidden');requestAnimationFrame(()=>{try{window.scrollTo(0,0)}catch(_){ }})
}
function navigationResolvedPoint(name){const raw=String(name||'').trim();if(!raw)return{ok:false,name:raw,value:''};const entry=findAddressBookEntry(raw);if(entry)return{ok:true,name:raw,value:entry.address,entry};const iata=flightAirportIataFromPlace(raw);if(iata==='DUS')return{ok:true,name:raw,value:'Düsseldorf Airport (DUS), Düsseldorf, Germany',airportIata:iata};if(iata==='CGN')return{ok:true,name:raw,value:'Cologne Bonn Airport (CGN), Köln, Germany',airportIata:iata};if(iata)return{ok:true,name:raw,value:`${iata} Airport`,airportIata:iata};return{ok:false,name:raw,value:''}}
function compositeRoutePointResolution(name){
  const raw=String(name||'').trim();if(!raw)return null;
  // Ein exakter gespeicherter Kurzname/Alias hat immer Vorrang vor einer Zerlegung.
  if(navigationResolvedPoint(raw).ok)return null;
  const splitters=[/\s*→\s*/u,/\s*\+\s*/u,/\s+&\s+/u,/\s+und\s+/iu,/\s*\/\s*/u,/\s*-\s*/u];
  for(const splitter of splitters){
    const parts=raw.split(splitter).map(x=>String(x||'').trim()).filter(Boolean);
    if(parts.length<2)continue;
    const resolved=parts.map(navigationResolvedPoint);
    if(resolved.every(x=>x.ok))return{parts,resolved};
  }
  return null;
}
function routeAddressResolution(r){
  const sourcePoints=routePointsForRide(r),points=[],resolved=[],missing=[];
  const push=(name,item)=>{const clean=String(name||'').trim();if(!clean)return;const last=points.at(-1);if(last&&normKey(last)===normKey(clean))return;points.push(clean);resolved.push(item)};
  for(const point of sourcePoints){
    const direct=navigationResolvedPoint(point);
    if(direct.ok){push(point,direct);continue}
    const composite=compositeRoutePointResolution(point);
    if(composite){composite.parts.forEach((name,i)=>push(name,composite.resolved[i]));continue}
    push(point,direct);missing.push(point);
  }
  return{points,resolved,missing,sourcePoints};
}
function showMissingRouteAddresses(missing){const unique=[...new Set((missing||[]).map(x=>String(x||'').trim()).filter(Boolean))];if(unique.length)alert(`Für folgende Orte fehlt eine eindeutige Adresse in „Orte & Adressen“:\n\n${unique.map(x=>'• '+x).join('\n')}\n\nBitte die Adresse einmal unter Einstellungen → Adressen hinterlegen. ATMS öffnet bewusst keine geratenen Hotel-Adressen.`)}
function navigationSearchQuery(name){
  const resolved=navigationResolvedPoint(name);
  return resolved.ok?resolved.value:'';
}
async function mapboxGeocode(name,token,proximity){
  const q=navigationSearchQuery(name);if(!q)return null;
  const params=new URLSearchParams({q,access_token:token,limit:'1',autocomplete:'false',language:'de',country:'de'});
  if(proximity&&Number.isFinite(Number(proximity.lng))&&Number.isFinite(Number(proximity.lat)))params.set('proximity',`${Number(proximity.lng)},${Number(proximity.lat)}`);
  const res=await fetch(`https://api.mapbox.com/search/geocode/v6/forward?${params.toString()}`);
  if(!res.ok){let msg=`Geocoding HTTP ${res.status}`;try{const j=await res.json();if(j?.message)msg=j.message}catch{}throw new Error(msg)}
  const data=await res.json(),feature=data?.features?.[0],coords=feature?.geometry?.coordinates;
  if(!Array.isArray(coords)||coords.length<2)return null;
  return{lng:Number(coords[0]),lat:Number(coords[1]),label:feature.properties?.full_address||feature.properties?.name||name,source:name};
}
async function mapboxDirections(coords,token){
  if(!Array.isArray(coords)||coords.length<2)throw new Error('Zu wenige Koordinaten für die Route.');
  const coordinateText=coords.map(p=>`${Number(p.lng)},${Number(p.lat)}`).join(';');
  const params=new URLSearchParams({access_token:token,overview:'false',steps:'false'});
  const res=await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${coordinateText}?${params.toString()}`);
  if(!res.ok){let msg=`Routing HTTP ${res.status}`;try{const j=await res.json();if(j?.message)msg=j.message}catch{}throw new Error(msg)}
  const data=await res.json(),route=data?.routes?.[0];if(!route)throw new Error(data?.message||'Keine Route gefunden.');return route;
}
function targetDateForRide(r,reference){
  const t=effectiveTime(r),m=String(t||'').match(/(\d{1,2}):(\d{2})/);if(!m)return null;
  const ref=new Date(reference||Date.now()),target=new Date(ref);target.setHours(Number(m[1]),Number(m[2]),0,0);
  if(target.getTime()<ref.getTime()-12*3600000)target.setDate(target.getDate()+1);
  return target;
}
function clockOf(value){return new Date(value).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}
function durationLabel(seconds){const min=Math.max(0,Math.round(Number(seconds||0)/60));return min<60?`${min} Min.`:`${Math.floor(min/60)} Std. ${min%60} Min.`}
function distanceLabel(meters){const km=Number(meters||0)/1000;return km<10?`${km.toFixed(1)} km`:`${Math.round(km)} km`}
function etaAssessment(lateMinutes,marginMinutes,threshold){
  if(lateMinutes>threshold)return{key:'bad',label:`VERSPÄTUNG +${lateMinutes} MIN.`};
  if(lateMinutes>0)return{key:'warn',label:`KNAPP · +${lateMinutes} MIN.`};
  if(marginMinutes<=threshold)return{key:'warn',label:`KNAPP · ${Math.max(0,marginMinutes)} MIN. PUFFER`};
  return{key:'good',label:`MACHBAR · ${marginMinutes} MIN. PUFFER`};
}
async function calculateLiveEta(driver,drides){
  const s=getLiveSettings(),token=String(s.mapboxToken||'').trim(),geo=s.lastGeo&&s.lastGeo.driverId===driver.id?s.lastGeo:null;
  if(!token)throw new Error('Mapbox-Token fehlt. In Einstellungen → Navigation eintragen.');
  if(!geo)throw new Error('Aktueller Handy-Standort fehlt. Zuerst Standort dieses Handys verwenden.');
  const threshold=Math.max(1,Number(s.warnThreshold||7)),buffer=Math.max(0,Number(s.stopBufferMinutes||5));
  const runId=++liveEtaRunId,results=[];let cursor=new Date(),origin={lng:Number(geo.lng),lat:Number(geo.lat)},proximity={lng:Number(geo.lng),lat:Number(geo.lat)};
  for(const ride of drides.slice(0,4)){
    if(runId!==liveEtaRunId)return null;
    const names=routePointsForRide(ride);if(!names.length)continue;
    const points=[];
    for(const name of names){const p=await mapboxGeocode(name,token,proximity);if(!p)throw new Error(`Ort nicht gefunden: ${name}`);points.push(p)}
    const route=await mapboxDirections([origin,...points],token),legs=Array.isArray(route.legs)?route.legs:[];
    if(!legs.length)throw new Error(`Keine Fahrzeit für ${ride.pickup||ride.id} erhalten.`);
    const scheduled=targetDateForRide(ride,cursor),toPickupSeconds=Number(legs[0]?.duration||0),arrivalPickup=new Date(cursor.getTime()+toPickupSeconds*1000);
    const lateMinutes=scheduled?Math.max(0,Math.ceil((arrivalPickup-scheduled)/60000)):0;
    const marginMinutes=scheduled?Math.floor((scheduled-arrivalPickup)/60000):0;
    const assessment=etaAssessment(lateMinutes,marginMinutes,threshold);
    let finishBase=scheduled&&arrivalPickup<scheduled?new Date(scheduled):arrivalPickup;
    let finishMs=finishBase.getTime();
    const pickupAndIntermediateStops=Math.max(0,points.length-1);
    if(pickupAndIntermediateStops>0)finishMs+=buffer*60000;
    for(let i=1;i<legs.length;i++){
      finishMs+=Number(legs[i]?.duration||0)*1000;
      if(i<legs.length-1)finishMs+=buffer*60000;
    }
    const finish=new Date(finishMs);
    const result={rideId:String(ride.id),pickup:ride.pickup,destination:ride.destination,scheduled:scheduled?.toISOString()||'',arrivalPickup:arrivalPickup.toISOString(),finish:finish.toISOString(),lateMinutes,marginMinutes,assessment,duration:Number(route.duration||0),distance:Number(route.distance||0),points:names};
    results.push(result);liveEtaResults.set(String(ride.id),result);cursor=finish;origin=points.at(-1);proximity=origin;
  }
  return results;
}
function renderLiveEtaResults(results){
  const box=$('liveEtaState');if(!box)return;
  if(!results||!results.length){box.innerHTML='<b>Live-ETA:</b> Keine berechenbaren Fahrten.';return}
  box.innerHTML=results.map((x,i)=>`<div class="route-step ${x.assessment.key==='bad'?'warn':x.assessment.key==='warn'?'warn':'ok'}"><span class="step-icon">${i+1}</span><div><b>${esc(i===0?'Aktuelle Fahrt':'Folgefahrt')} · ${esc(x.pickup||'Abholung')}</b><small>ETA Abholung ${esc(clockOf(x.arrivalPickup))}${x.scheduled?` · geplant ${esc(clockOf(x.scheduled))}`:''} · Ziel ca. ${esc(clockOf(x.finish))} · ${esc(distanceLabel(x.distance))} / ${esc(durationLabel(x.duration))}</small></div><em>${esc(x.assessment.label)}</em></div>`).join('');
  const first=results[0];
  if(first){const d=$('liveDelayContent');if(d)d.innerHTML=`<div class="delay-number">${first.lateMinutes?`+${first.lateMinutes} Minuten`:`${Math.max(0,first.marginMinutes)} Min. Puffer`}</div><b>${esc(first.pickup||'Abholung')} → ${esc(first.destination||'Ziel')}</b><div class="live-meta">Mapbox Live-ETA · Abholung ca. ${esc(clockOf(first.arrivalPickup))} · Fahrtende ca. ${esc(clockOf(first.finish))}</div>`;}
}
async function refreshLiveEta(){
  const box=$('liveEtaState'),btn=$('liveEtaRefreshBtn'),s=getLiveSettings(),driver=liveDriverList().find(x=>x.id===s.driverId);
  if(!driver){if(box)box.innerHTML='<b>Live-ETA:</b> Bitte Fahrer auswählen.';return}
  const drides=ridesForLiveDriver(driver.name);if(!drides.length){if(box)box.innerHTML='<b>Live-ETA:</b> Keine offenen Fahrten.';return}
  if(btn){btn.disabled=true;btn.textContent='⏳ Live-ETA wird berechnet …'}if(box)box.innerHTML='<b>Live-ETA:</b> Orte und aktuelle Fahrzeiten werden geprüft …';
  try{const results=await calculateLiveEta(driver,drides);if(results){renderLiveDisposition(false);renderLiveEtaResults(results)}}
  catch(e){if(box)box.innerHTML=`<b>Live-ETA nicht verfügbar:</b> ${esc(e.message)}`;showToast('Live-ETA konnte nicht berechnet werden','warn')}
  finally{if(btn){btn.disabled=false;btn.textContent='🚦 Live-ETA aktualisieren'}}
}
function renderRouteCheck(driver,drides,threshold){
  const card=$('liveRouteCheckCard'),standard=$('liveModeStandard'),route=$('liveModeRoute');if(!card)return;
  const on=liveRouteMode();card.classList.toggle('route-hidden',!on);standard?.classList.toggle('active',!on);route?.classList.toggle('active',on);if(!on)return;
  const s=getLiveSettings(),geo=(s.lastGeo&&s.lastGeo.driverId===driver.id)?s.lastGeo:null,notice=$('livePhoneDriverNotice');
  if(notice)notice.innerHTML=`<b>Zuordnung:</b> Die GPS-Position dieses Handys wird ausschließlich für die Fahrten von <b>${esc(driver.name)}</b> verwendet. Bitte stelle sicher, dass ${esc(driver.name)} dieses Gerät verwendet.`;
  const chain=[];
  chain.push(`<div class="route-step ${geo?'ok':'pending'}"><span class="step-icon">${geo?'✓':'1'}</span><div><b>Standort dieses Handys</b><small>${geo?`${Number(geo.lat).toFixed(5)}, ${Number(geo.lng).toFixed(5)} · Genauigkeit ${Math.round(geo.accuracy||0)} m`:'Tippe auf „Standort dieses Handys verwenden“'}</small></div><em>${geo?'ermittelt':'offen'}</em></div>`);
  drides.slice(0,6).forEach((r,i)=>{
    const eta=liveEtaResults.get(String(r.id));
    if(eta){
      const cls=eta.assessment.key==='good'?'ok':'warn';
      chain.push(`<div class="route-step ${cls}"><span class="step-icon">${i+2}</span><div><b>${i===0?'GPS → Abholort → Ziel':'Vorheriges Ziel → Abholort → Ziel'}</b><small>${esc(r.pickup||'Abholort fehlt')} → ${esc(r.destination||'Ziel fehlt')} · ETA ${esc(clockOf(eta.arrivalPickup))} · Ziel ca. ${esc(clockOf(eta.finish))}</small></div><em>${esc(eta.assessment.label)}</em></div>`);
      return;
    }
    const delay=delayForRide(r),[label,cls]=routeStatusLabel(delay,threshold),hasPrediction=delay!==0||Boolean(r.delay||r.delayMinutes||r.delayText);
    chain.push(`<div class="route-step ${hasPrediction?(cls==='bad'||cls==='warn'?'warn':'ok'):'pending'}"><span class="step-icon">${i+2}</span><div><b>${i===0?'Position → Abholort → Ziel':'Vorheriges Ziel → Abholort → Ziel'}</b><small>${esc(r.pickup||'Abholort fehlt')} → ${esc(r.destination||'Ziel fehlt')} · ${esc(livePickupClockLabel(r))}</small></div><em>${hasPrediction?(delay?`+${delay} Min. · ${label}`:label):(i===0?'ZEITCHECK':'PLANPRÜFUNG')}</em></div>`);
  });
  $('liveRouteChain').innerHTML=chain.join('');
  const etaValues=drides.map(r=>liveEtaResults.get(String(r.id))).filter(Boolean),late=etaValues.length?etaValues.filter(x=>x.assessment.key==='bad').length:drides.filter(r=>delayForRide(r)>=threshold).length,risk=etaValues.length?etaValues.filter(x=>x.assessment.key==='warn').length:drides.filter(r=>delayForRide(r)>0&&delayForRide(r)<threshold).length,onTime=etaValues.length?etaValues.filter(x=>x.assessment.key==='good').length:drides.filter(r=>delayForRide(r)<=0).length;
  $('liveRouteSummary').innerHTML=`<div><small>MACHBAR</small><b style="color:#59ef8b">${onTime}</b></div><div><small>KNAPP</small><b style="color:#ffc95a">${risk}</b></div><div><small>VERSPÄTET</small><b style="color:#ff7189">${late}</b></div>`;
  $('liveGeoState').innerHTML=geo?`<b>Standort dieses Handys verwendet:</b> ${Number(geo.lat).toFixed(5)}, ${Number(geo.lng).toFixed(5)} · ${esc(driver.name)} zugeordnet · ${esc(geoAgeLabel(geo))} · zuletzt ${new Date(geo.time).toLocaleTimeString('de-DE')}`:`<b>Standort dieses Handys:</b> noch nicht ermittelt. Tippe auf den Button und erlaube den Standortzugriff. Die Position wird danach ${esc(driver.name)} zugeordnet.`;
  drides.filter(r=>delayForRide(r)>=threshold).forEach(r=>ensureLiveDelayEvent(driver,r,threshold));
}
function ensureLiveDelayEvent(driver,ride,threshold){const key=`ATMS_LIVE_WARN_${driver.id}_${ride.id}`;const delay=delayForRide(ride);let prior=null;try{prior=JSON.parse(localStorage.getItem(key)||'null')}catch{}if(prior&&prior.delay===delay)return;addLiveEvent(`Automatische Verspätungswarnung: ${driver.name}, Fahrt ${ride.id}, ${ride.pickup||'Abholung'} → ${ride.destination||'Ziel'}, Prognose +${delay} Min., Warnschwelle ${threshold} Min. Nachricht für Info-Chat und Dispo erstellt.`,'warn');localStorage.setItem(key,JSON.stringify({delay,time:new Date().toISOString()}))}
function requestLivePosition(){
  const state=$('liveGeoState'),btn=$('liveGetPositionBtn');
  const fail=(msg,detail='')=>{if(state)state.innerHTML=`<b>Standort konnte nicht verwendet werden.</b><br>${esc(msg)}${detail?`<br><small>${esc(detail)}</small>`:''}`;showToast(msg,'warn');if(btn){btn.disabled=false;btn.textContent='📍 Standortfreigabe erneut anfordern'}};
  if(!navigator.geolocation){fail('Dieses Gerät oder dieser Browser unterstützt keine Standortermittlung.');return}
  if(['file:','content:'].includes(location.protocol)){fail('Die App wurde direkt aus dem Download- oder Dateibereich geöffnet. In diesem Modus blockiert Chrome den GPS-Zugriff.','Aktuelle Adresse: '+location.protocol+'//…  · Öffne ATMS PRO über eine HTTPS-Adresse. Eine Änderung der Chrome-App-Berechtigung allein reicht hier nicht aus.');return}
  if(!window.isSecureContext && location.hostname!=='localhost'){fail('Standortzugriff ist nur über eine sichere HTTPS-Verbindung möglich.');return}
  const s0=getLiveSettings(),driver=liveDriverList().find(x=>x.id===s0.driverId);
  if(!driver){fail('Bitte zuerst einen Fahrer auswählen.');return}
  if(btn){btn.disabled=true;btn.textContent='Standortfreigabe wird angefordert …'}
  if(state)state.innerHTML=`<b>Standortfreigabe wird angefordert.</b><br>Bitte bestätige die Standortabfrage von Android/iPhone für ${esc(driver.name)}.`;
  const options={enableHighAccuracy:true,timeout:20000,maximumAge:0};
  navigator.geolocation.getCurrentPosition(pos=>{
    const s=getLiveSettings();
    s.lastGeo={driverId:driver.id,driverName:driver.name,lat:pos.coords.latitude,lng:pos.coords.longitude,accuracy:pos.coords.accuracy,time:new Date().toISOString()};
    saveLiveSettings(s);
    addLiveEvent(`Standort dieses Handys wurde ${driver.name} für die Routenprüfung zugeordnet (Genauigkeit ca. ${Math.round(pos.coords.accuracy)} m).`,'ok');
    if(btn){btn.disabled=false;btn.textContent='🔄 Standort dieses Handys aktualisieren'}
    renderLiveDisposition();
  },err=>{
    let msg='Position konnte nicht ermittelt werden.';
    let detail='Bitte GPS einschalten und erneut versuchen.';
    if(err.code===1){msg='Chrome hat den Standortzugriff blockiert.';detail=location.protocol==='https:'?'Erlaube den Standort für diese Website über das Schloss-/Website-Symbol in Chrome und lade die Seite neu.':'ATMS PRO muss über HTTPS geöffnet werden; direkt geöffnete Download-Dateien (content:// oder file://) können keinen GPS-Zugriff erhalten.'}
    else if(err.code===2){msg='Der Standort ist momentan nicht verfügbar.';detail='Aktiviere GPS/Standortdienste und prüfe die Internetverbindung.'}
    else if(err.code===3){msg='Die Standortermittlung hat zu lange gedauert.';detail='Gehe möglichst ins Freie oder versuche es erneut.'}
    fail(msg,detail);
  },options)
}

// CORE-007D8A1F1D8P26A – Zielbild-UI Block 1. Nur Darstellung/Bedienoberflaeche; keine LIVE-Entscheidungslogik.
function atmsLiveTargetRelativeTime(value){
  const raw=String(value||'').trim();if(!raw)return'–';const d=new Date(raw);if(Number.isNaN(d.getTime()))return'–';
  const sec=Math.max(0,Math.round((Date.now()-d.getTime())/1000));
  if(sec<60)return`vor ${sec} Sek.`;const min=Math.floor(sec/60);if(min<60)return`vor ${min} Min.`;const h=Math.floor(min/60);return`vor ${h} Std.`;
}
function ensureLiveDispositionTargetBlock(){
  const view=$('liveDispositionView');if(!view)return null;
  let shell=$('atmsLiveTargetTop');
  if(!shell){
    shell=document.createElement('section');shell.id='atmsLiveTargetTop';
    shell.innerHTML=`<div class="atms-live-target-head"><div><div class="atms-live-target-title">Fahrer-Fahrtenkontrolle</div><div class="atms-live-target-sub">Fahrten überwachen, Verspätungen erkennen und reagieren</div></div><button type="button" id="atmsLiveTargetSettingsBtn" class="atms-live-target-settings">⚙ Einstellungen</button></div><div class="atms-live-target-grid"><div class="atms-live-target-card atms-live-target-driver-card-select"><div class="atms-live-target-label">Fahrer auswählen</div><div class="atms-live-target-driver-select-shell"><div class="atms-live-target-avatar" aria-hidden="true">👤</div><div class="atms-live-target-driver-select-stack"><select id="atmsLiveTargetDriverSelect" aria-label="Fahrer auswählen"></select><div id="atmsLiveTargetDriverMeta" class="atms-live-target-meta">–</div></div></div></div><div class="atms-live-target-card"><div class="atms-live-target-label">Warnschwelle <span>(persönlich)</span></div><div class="atms-live-target-threshold"><button type="button" id="atmsLiveThresholdMinus" aria-label="Warnschwelle verringern">−</button><b id="atmsLiveTargetThreshold">7</b><span>Minuten</span><button type="button" id="atmsLiveThresholdPlus" aria-label="Warnschwelle erhöhen">＋</button></div><div id="atmsLiveTargetThresholdNote" class="atms-live-target-meta">Warnung ab 7 Minuten Verspätung</div></div></div><div id="atmsLiveTargetTrackingStrip" class="atms-live-target-tracking"><div class="atms-live-target-tracking-state"><b id="atmsLiveTargetTrackingState">Zustimmung offen</b><div class="atms-live-target-tracking-actions"><button type="button" id="atmsLiveTargetTrackingAction" class="atms-live-target-mini-action">Zustimmung erteilen</button><button type="button" id="atmsLiveTargetConsentRevoke" class="atms-live-target-mini-action secondary" hidden>Freigabe beenden</button></div></div><div><span>Letzte Position</span><b id="atmsLiveTargetLastPosition">–</b></div><div><span>Genauigkeit</span><b id="atmsLiveTargetAccuracy">–</b></div></div>`;
    view.insertBefore(shell,view.firstChild);
    const style=document.createElement('style');style.id='atmsLiveTargetP26AStyle';style.textContent=`
      #atmsLiveTargetTop{box-sizing:border-box;width:100%;margin:0 0 14px;padding:2px 0 0}
      .atms-live-target-head{display:flex;align-items:center;gap:12px;margin:0 0 12px}.atms-live-target-head>div:first-child{min-width:0;flex:1}
      .atms-live-target-title{font-size:clamp(26px,5vw,38px);font-weight:950;line-height:1.05;letter-spacing:-.02em}.atms-live-target-sub{margin-top:4px;font-size:14px;opacity:.72;line-height:1.35}
      .atms-live-target-settings{flex:0 0 auto;padding:10px 13px;border-radius:11px;border:1px solid rgba(46,168,255,.55);background:rgba(14,79,116,.22);color:inherit;font-weight:850}
      .atms-live-target-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.92fr);gap:12px}.atms-live-target-card{min-width:0;padding:14px;border:1px solid rgba(46,168,255,.32);border-radius:14px;background:rgba(7,42,63,.28)}
      .atms-live-target-label{font-size:14px;font-weight:900;margin-bottom:9px}.atms-live-target-label span{font-weight:650;opacity:.78}
      #atmsLiveTargetDriverSelect{width:100%;box-sizing:border-box;padding:12px 13px;border-radius:11px;border:1px solid rgba(255,255,255,.22);background:rgba(0,20,32,.58);color:inherit;font-size:17px;font-weight:850}
      .atms-live-target-meta{font-size:12px;opacity:.72;line-height:1.35;margin-top:7px}
      .atms-live-target-threshold{display:grid;grid-template-columns:52px 1fr auto 52px;gap:9px;align-items:center}.atms-live-target-threshold button{height:52px;border-radius:11px;border:1px solid rgba(46,168,255,.36);background:rgba(13,66,96,.42);color:inherit;font-size:28px;font-weight:800}.atms-live-target-threshold b{font-size:42px;text-align:center;line-height:1}.atms-live-target-threshold span{font-size:14px;font-weight:800;opacity:.78}
      .atms-live-target-tracking{margin-top:12px;display:grid;grid-template-columns:1.35fr 1fr .8fr;gap:0;border:1px solid rgba(46,168,255,.30);border-radius:14px;background:rgba(7,42,63,.28);overflow:hidden}.atms-live-target-tracking>div{min-width:0;padding:13px 15px;display:flex;flex-direction:column;justify-content:center}.atms-live-target-tracking>div+div{border-left:1px solid rgba(255,255,255,.14)}.atms-live-target-tracking span{font-size:11px;opacity:.62;margin-bottom:3px}.atms-live-target-tracking b{font-size:15px;overflow-wrap:anywhere}.atms-live-target-tracking.is-active>div:first-child b{color:#39df78}.atms-live-target-tracking.is-wait>div:first-child b{color:#ffc14d}.atms-live-target-tracking-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:7px}.atms-live-target-mini-action{border:1px solid rgba(46,168,255,.45);background:rgba(12,83,119,.35);color:inherit;border-radius:9px;padding:7px 9px;font-size:11px;font-weight:900}.atms-live-target-mini-action.secondary{border-color:rgba(255,255,255,.22);background:rgba(255,255,255,.05);opacity:.88}
      @media(max-width:720px){.atms-live-target-head{align-items:flex-start}.atms-live-target-title{font-size:29px}.atms-live-target-settings{padding:9px 10px;font-size:12px}.atms-live-target-grid{grid-template-columns:1fr}.atms-live-target-tracking{grid-template-columns:1fr 1fr}.atms-live-target-tracking>div:first-child{grid-column:1/-1;border-bottom:1px solid rgba(255,255,255,.14)}.atms-live-target-tracking>div:nth-child(2){border-left:0}.atms-live-target-threshold{grid-template-columns:50px 1fr auto 50px}}
    `;document.head.appendChild(style);
    $('atmsLiveTargetSettingsBtn')?.addEventListener('click',()=>{showView('settings');document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x.dataset.nav==='settings'))});
    $('atmsLiveTargetDriverSelect')?.addEventListener('change',e=>{const legacy=$('liveDriverSelect');if(legacy){legacy.value=e.target.value;legacy.dispatchEvent(new Event('change',{bubbles:true}));return}const s=getLiveSettings();s.driverId=e.target.value;saveLiveSettings(s);renderLiveDisposition()});
    const adjust=delta=>{const s=getLiveSettings(),next=Math.max(1,Math.min(60,Number(s.warnThreshold||7)+delta));s.warnThreshold=next;saveLiveSettings(s);const legacy=$('liveWarnThreshold');if(legacy)legacy.value=String(next);renderLiveDisposition()};
    $('atmsLiveThresholdMinus')?.addEventListener('click',()=>adjust(-1));$('atmsLiveThresholdPlus')?.addEventListener('click',()=>adjust(1));
    $('atmsLiveTargetTrackingAction')?.addEventListener('click',()=>{
      const s=getLiveSettings(),driver=liveDriverList().find(x=>x.id===s.driverId),session=getDriverSession();if(!driver){showToast('Bitte Fahrer auswählen','warn');return}
      const consent=!!s.consentByDriver?.[driver.id];
      if(!consent){if(!s.consentByDriver)s.consentByDriver={};s.consentByDriver[driver.id]=true;saveLiveSettings(s);addLiveEvent(`Trackingfreigabe erteilt für ${driver.name}.`);renderLiveDisposition();return}
      if(session.active&&session.driverId!==driver.id){showToast(`Schicht von ${session.driverName} zuerst beenden`,'warn');return}
      toggleDriverShift();
    });
    $('atmsLiveTargetConsentRevoke')?.addEventListener('click',()=>{const s=getLiveSettings(),driver=liveDriverList().find(x=>x.id===s.driverId),session=getDriverSession();if(!driver)return;if(session.active&&session.driverId===driver.id){showToast('Bitte zuerst die Schicht beenden','warn');return}if(!s.consentByDriver)s.consentByDriver={};s.consentByDriver[driver.id]=false;saveLiveSettings(s);addLiveEvent(`Trackingfreigabe beendet für ${driver.name}.`);renderLiveDisposition()});
    const candidates=[...view.querySelectorAll('h1,h2,h3,p,div,span')];
    const oldTitle=candidates.find(el=>el.children.length===0&&el.textContent.trim()==='Live-Disposition');if(oldTitle)oldTitle.style.display='none';
    const oldSub=candidates.find(el=>el.children.length===0&&el.textContent.trim()==='Fahrtenfolge, Tracking und Verspätungsprüfung');if(oldSub)oldSub.style.display='none';
  }
  return shell;
}
function atmsLiveHideLegacyBlock(anchorId,requiredText=''){
  const view=$('liveDispositionView'),anchor=$(anchorId);if(!view||!anchor)return false;
  const selectors=['section','article','.live-card','.card','.panel','.settings-card','.tracking-card','.live-section'];
  let node=anchor;
  while(node&&node!==view){
    if(selectors.some(sel=>{try{return node.matches?.(sel)}catch(_){return false}})){
      const text=String(node.textContent||'');
      if(!requiredText||text.includes(requiredText)){node.style.display='none';node.dataset.atmsP26bHidden='1';return true}
    }
    node=node.parentElement;
  }
  return false;
}
function applyLiveDispositionTargetCleanup(){
  const view=$('liveDispositionView');if(!view)return;
  // P26B: Die Funktionen bleiben im DOM und ihre Listener bleiben aktiv; nur die doppelte Legacy-Darstellung wird ausgeblendet.
  atmsLiveHideLegacyBlock('liveDriverSelect','Fahrer & Tracking');
  atmsLiveHideLegacyBlock('liveSessionDriver','Dieses Handy & Schicht');
  atmsLiveHideLegacyBlock('liveTimeline','Fahrtenfolge');
  const modeEls=[$('liveSystemPill'),$('liveModeStandard'),$('liveModeRoute')].filter(Boolean);modeEls.forEach(el=>{el.style.display='none';el.setAttribute('aria-hidden','true')});
}
function ensureLiveDispositionTargetPositionInfo(){
  const view=$('liveDispositionView'),top=$('atmsLiveTargetTop');if(!view||!top)return null;
  let shell=$('atmsLiveTargetPositionInfo');
  if(!shell){
    shell=document.createElement('section');shell.id='atmsLiveTargetPositionInfo';shell.className='atms-live-target-position-grid';
    shell.innerHTML=`<div class="atms-live-target-position-card"><div class="atms-live-target-position-head"><b>Aktuelle Position</b><button type="button" id="atmsLiveTargetOpenPositionBtn" disabled>🗺 In Maps öffnen</button></div><div id="atmsLiveTargetPositionBody" class="atms-live-target-position-body"><b>Keine aktuelle Position</b><span>Tracking ist nicht aktiv.</span></div></div><div class="atms-live-target-driver-card"><div class="atms-live-target-position-head"><b>Fahrer-Info</b></div><div class="atms-live-target-driver-rows"><div><span>Fahrer</span><b id="atmsLiveTargetInfoDriver">–</b></div><div><span>Fahrer-ID</span><b id="atmsLiveTargetInfoId">–</b></div><div><span>Fahrzeug</span><b id="atmsLiveTargetInfoVehicle">–</b></div><div><span>Schicht</span><b id="atmsLiveTargetInfoShift">Nicht gestartet</b></div><div><span>GPS</span><b id="atmsLiveTargetInfoConnection">Nicht aktiv</b></div></div></div>`;
    top.insertAdjacentElement('afterend',shell);
    if(!$('atmsLiveTargetP26CStyle')){const style=document.createElement('style');style.id='atmsLiveTargetP26CStyle';style.textContent=`
      #atmsLiveTargetPositionInfo{box-sizing:border-box;width:100%;margin:0 0 14px}
      .atms-live-target-position-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(280px,.85fr);gap:12px}
      .atms-live-target-position-card,.atms-live-target-driver-card{min-width:0;border:1px solid rgba(46,168,255,.30);border-radius:14px;background:rgba(7,42,63,.28);overflow:hidden}
      .atms-live-target-position-head{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.10)}.atms-live-target-position-head>b{font-size:15px;font-weight:950;flex:1}.atms-live-target-position-head button{padding:8px 10px;border-radius:9px;border:1px solid rgba(46,168,255,.45);background:rgba(12,83,119,.35);color:inherit;font-size:11px;font-weight:900}.atms-live-target-position-head button:disabled{opacity:.38}
      .atms-live-target-position-body{min-height:150px;padding:18px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:linear-gradient(135deg,rgba(0,22,35,.72),rgba(10,55,77,.36));position:relative;overflow:hidden}.atms-live-target-position-body::before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(83,179,225,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(83,179,225,.07) 1px,transparent 1px);background-size:24px 24px;pointer-events:none}.atms-live-target-position-body>*{position:relative}.atms-live-target-position-body b{font-size:17px}.atms-live-target-position-body span{font-size:12px;opacity:.72;margin-top:5px;line-height:1.4}.atms-live-target-position-body.is-live b{color:#45e386}.atms-live-target-position-body .atms-live-target-geo-dot{width:18px;height:18px;border-radius:50%;background:#2ea8ff;border:4px solid rgba(255,255,255,.88);box-shadow:0 0 0 8px rgba(46,168,255,.18);margin:0 0 12px}
      .atms-live-target-driver-rows{padding:8px 14px 12px}.atms-live-target-driver-rows>div{display:grid;grid-template-columns:100px minmax(0,1fr);gap:10px;align-items:center;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.09)}.atms-live-target-driver-rows>div:last-child{border-bottom:0}.atms-live-target-driver-rows span{font-size:12px;opacity:.64}.atms-live-target-driver-rows b{font-size:13px;overflow-wrap:anywhere}.atms-live-target-driver-rows b.is-live{color:#45e386}.atms-live-target-driver-rows b.is-wait{color:#ffc14d}
      @media(max-width:720px){.atms-live-target-position-grid{grid-template-columns:1fr}.atms-live-target-position-body{min-height:125px}.atms-live-target-driver-rows>div{grid-template-columns:90px minmax(0,1fr)}}
    `;document.head.appendChild(style)}
    $('atmsLiveTargetOpenPositionBtn')?.addEventListener('click',()=>{const s=getLiveSettings(),driver=liveDriverList().find(x=>x.id===s.driverId),session=getDriverSession(),consent=Boolean(driver&&s.consentByDriver?.[driver.id]),geo=driver&&consent&&session.active&&session.driverId===driver.id&&s.lastGeo&&s.lastGeo.driverId===driver.id?s.lastGeo:null;if(!geo){showToast('Keine aktuelle Position verfügbar','warn');return}const lat=Number(geo.lat),lng=Number(geo.lng);if(!Number.isFinite(lat)||!Number.isFinite(lng)){showToast('GPS-Position ungültig','warn');return}window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lat+','+lng)}`,'_blank')});
  }
  return shell;
}
function renderLiveDispositionTargetPositionInfo(driver,settings,consent){
  const shell=ensureLiveDispositionTargetPositionInfo();if(!shell)return;
  const session=getDriverSession(),sessionMatches=Boolean(driver&&session.active&&session.driverId===driver.id),active=Boolean(sessionMatches&&consent),geo=active&&settings?.lastGeo&&settings.lastGeo.driverId===driver.id?settings.lastGeo:null;
  const body=$('atmsLiveTargetPositionBody'),open=$('atmsLiveTargetOpenPositionBtn');
  if(body){const lat=geo?Number(geo.lat):NaN,lng=geo?Number(geo.lng):NaN,coords=Number.isFinite(lat)&&Number.isFinite(lng)?`${lat.toFixed(5)}, ${lng.toFixed(5)}`:'';body.className='atms-live-target-position-body '+(geo?'is-live':'');body.innerHTML=geo?`<div class="atms-live-target-map-road r1"></div><div class="atms-live-target-map-road r2"></div><div class="atms-live-target-map-road r3"></div><div class="atms-live-target-geo-dot"></div><div class="atms-live-target-map-caption"><b>${esc(atmsLiveTargetRelativeTime(geo.time))}</b>${Number.isFinite(Number(geo.accuracy))?`<span>Genauigkeit ${Math.round(Number(geo.accuracy))} m</span>`:''}${coords?`<small>${esc(coords)}</small>`:''}</div>`:`<b>Keine aktuelle Position</b><span>${!consent?'Zustimmung ist noch offen.':!sessionMatches?'Schicht ist nicht gestartet.':'GPS-Position wird noch ermittelt.'}</span>`}
  if(open)open.disabled=!geo;
  const driverName=$('atmsLiveTargetInfoDriver');if(driverName)driverName.textContent=driver?.name||'–';
  const infoId=$('atmsLiveTargetInfoId');if(infoId)infoId.textContent=String(driver?.staffId||driver?.driverId||driver?.employeeId||'').trim()||'–';
  const vehicle=$('atmsLiveTargetInfoVehicle');if(vehicle)vehicle.textContent=driver?.vehicle||'Nicht hinterlegt';
  const shift=$('atmsLiveTargetInfoShift');if(shift)shift.textContent=sessionMatches?`Aktiv seit ${session.startedAt?new Date(session.startedAt).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}):'–'}`:'Nicht gestartet';
  const connection=$('atmsLiveTargetInfoConnection');if(connection){connection.textContent=geo?'GPS aktiv':active?'GPS wartet':consent?'Bereit':'Nicht aktiv';connection.className=geo?'is-live':active||consent?'is-wait':''}
}

function ensureLiveDispositionTargetRideControl(){
  const view=$('liveDispositionView'),position=$('atmsLiveTargetPositionInfo');if(!view||!position)return null;
  let shell=$('atmsLiveTargetRideControl');
  if(!shell){
    shell=document.createElement('section');shell.id='atmsLiveTargetRideControl';
    shell.innerHTML=`<div class="atms-live-target-rides-head"><b id="atmsLiveTargetRidesTitle">Fahrtenkontrolle</b><button type="button" id="atmsLiveTargetRidesRefresh">↻ Aktualisieren</button></div><div id="atmsLiveTargetRidesList" class="atms-live-target-rides-list"><div class="atms-live-target-rides-empty">Keine offenen Fahrten für diesen Fahrer.</div></div><button type="button" id="atmsLiveTargetRidesMore" class="atms-live-target-rides-more" hidden>Weitere Fahrten anzeigen</button>`;
    position.insertAdjacentElement('afterend',shell);
    if(!$('atmsLiveTargetP26DStyle')){const style=document.createElement('style');style.id='atmsLiveTargetP26DStyle';style.textContent=`
      #atmsLiveTargetRideControl{box-sizing:border-box;width:100%;margin:0 0 14px;border:1px solid rgba(46,168,255,.30);border-radius:14px;background:rgba(7,42,63,.28);overflow:hidden}
      .atms-live-target-rides-head{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.11)}.atms-live-target-rides-head>b{font-size:16px;font-weight:950;flex:1;min-width:0}.atms-live-target-rides-head button,.atms-live-target-rides-more{border:1px solid rgba(46,168,255,.45);background:rgba(12,83,119,.35);color:inherit;border-radius:9px;padding:8px 10px;font-size:11px;font-weight:900}
      .atms-live-target-rides-list{width:100%}.atms-live-target-rides-empty{padding:18px 14px;font-size:13px;opacity:.76}
      .atms-live-target-ride-row{display:grid;grid-template-columns:38px 88px minmax(170px,1.25fr) minmax(88px,.72fr) minmax(82px,.65fr) minmax(110px,.85fr) 28px;gap:8px;align-items:center;padding:11px 10px;border-bottom:1px solid rgba(255,255,255,.09);position:relative}.atms-live-target-ride-row:last-child{border-bottom:0}.atms-live-target-ride-row::before{content:"";position:absolute;left:0;top:0;bottom:0;width:5px;background:#7392a3}.atms-live-target-ride-row.good::before{background:#45e386}.atms-live-target-ride-row.warn::before{background:#ffc14d}.atms-live-target-ride-row.bad::before{background:#ff5573}.atms-live-target-ride-index{font-size:20px;font-weight:950;text-align:center}.atms-live-target-ride-time b{display:block;font-size:17px}.atms-live-target-ride-time span,.atms-live-target-ride-route span,.atms-live-target-ride-metric span{display:block;font-size:10px;opacity:.62;margin-top:2px}.atms-live-target-ride-route b{display:block;font-size:13px;line-height:1.3;overflow-wrap:anywhere}.atms-live-target-ride-route span{font-size:11px}.atms-live-target-ride-metric b{display:block;font-size:14px;overflow-wrap:anywhere}.atms-live-target-ride-metric.good b{color:#45e386}.atms-live-target-ride-metric.warn b{color:#ffc14d}.atms-live-target-ride-metric.bad b{color:#ff7189}.atms-live-target-ride-status{display:inline-flex;justify-content:center;align-items:center;min-height:30px;padding:5px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.18);font-size:11px;font-weight:950;text-align:center}.atms-live-target-ride-status.good{color:#45e386;border-color:rgba(69,227,134,.45);background:rgba(69,227,134,.08)}.atms-live-target-ride-status.warn{color:#ffc14d;border-color:rgba(255,193,77,.45);background:rgba(255,193,77,.08)}.atms-live-target-ride-status.bad{color:#ff7189;border-color:rgba(255,113,137,.48);background:rgba(255,113,137,.08)}.atms-live-target-ride-open{border:0;background:transparent;color:inherit;font-size:24px;opacity:.82;padding:4px}.atms-live-target-rides-more{margin:10px 12px 12px;width:calc(100% - 24px)}
      @media(max-width:760px){.atms-live-target-ride-row{grid-template-columns:30px 72px minmax(0,1fr) 24px;gap:7px;padding:11px 8px}.atms-live-target-ride-index{font-size:18px}.atms-live-target-ride-time b{font-size:16px}.atms-live-target-ride-route{min-width:0}.atms-live-target-ride-route b{font-size:12px}.atms-live-target-ride-metric{grid-column:3;display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:3px}.atms-live-target-ride-metric span{margin:0}.atms-live-target-ride-metric b{font-size:12px;text-align:right}.atms-live-target-ride-status{grid-column:3;justify-self:start;margin-top:3px}.atms-live-target-ride-open{grid-column:4;grid-row:1 / span 3}.atms-live-target-rides-head>b{font-size:14px}}
    `;document.head.appendChild(style)}
    $('atmsLiveTargetRidesRefresh')?.addEventListener('click',()=>renderLiveDisposition(false));
    $('atmsLiveTargetRidesMore')?.addEventListener('click',()=>{liveExpanded=!liveExpanded;renderLiveDisposition(false)});
  }
  return shell;
}
function atmsLiveTargetRideStatus(ride,state,threshold){
  if(!state?.hasDelayAssessment){
    const raw=String(ride?.liveFlightStatus||'').trim().toLowerCase();
    if(raw==='cancelled')return{label:'Storniert',tone:'bad'};
    if(raw==='landed')return{label:'Gelandet',tone:''};
    if(raw==='departed')return{label:'Abgeflogen',tone:''};
    return{label:'Keine LIVE-Daten',tone:''};
  }
  const delay=Math.max(0,Number(state.delay)||0);
  if(delay>=threshold)return{label:'⚠ Verspätet',tone:'bad'};
  if(delay>0)return{label:'⚠ Gefährdet',tone:'warn'};
  return{label:'✓ Pünktlich',tone:'good'};
}
function renderLiveDispositionTargetRideControl(driver,drides,threshold){
  const shell=ensureLiveDispositionTargetRideControl();if(!shell)return;
  const title=$('atmsLiveTargetRidesTitle'),list=$('atmsLiveTargetRidesList'),more=$('atmsLiveTargetRidesMore');if(title)title.textContent=`Fahrtenkontrolle – Nur Fahrten von ${driver?.name||'–'}`;if(!list)return;
  const source=Array.isArray(drides)?drides:[],limit=liveExpanded?source.length:4,shown=source.slice(0,limit);
  if(!shown.length){list.innerHTML='<div class="atms-live-target-rides-empty">Keine offenen Fahrten für diesen Fahrer.</div>';if(more)more.hidden=true;return}
  list.innerHTML=shown.map((r,i)=>{
    const state=liveDispositionAssessment(r,threshold),status=atmsLiveTargetRideStatus(r,state,threshold),tone=status.tone||'',prediction=state?.hasLive?liveTimeOf(r):'',delay=state?.hasDelayAssessment?Math.max(0,Number(state.delay)||0):null,date=String(r?.date||'').trim(),dateLabel=date?atmsFormatIsoDateDe(date):'–',flight=String(r?.flightNumber||'').trim()||'–',route=`${r?.pickup||'Start nicht verfügbar'} → ${r?.destination||'Ziel nicht verfügbar'}`;
    const delayLabel=delay===null?'–':delay>0?`+${delay} Min.`:'0 Min.';
    return `<div class="atms-live-target-ride-row ${tone}" data-target-ride-id="${esc(r.id)}"><div class="atms-live-target-ride-index">${i+1}</div><div class="atms-live-target-ride-time"><b>${esc(effectiveTime(r)||'–')}</b><span>${esc(dateLabel)}</span></div><div class="atms-live-target-ride-route"><b>${esc(route)}</b><span>${esc(flight)}</span></div><div class="atms-live-target-ride-metric ${tone}"><span>Prognose</span><b>${esc(prediction||'–')}</b></div><div class="atms-live-target-ride-metric ${tone}"><span>Verspätung</span><b>${esc(delayLabel)}</b></div><div class="atms-live-target-ride-status ${tone}">${esc(status.label)}</div><button type="button" class="atms-live-target-ride-open" aria-label="Fahrt öffnen" data-target-open-ride="${esc(r.id)}">›</button></div>`;
  }).join('');
  list.querySelectorAll('[data-target-open-ride]').forEach(btn=>btn.addEventListener('click',()=>openCockpit(btn.dataset.targetOpenRide)));
  if(more){more.hidden=source.length<=4;more.textContent=liveExpanded?'Weniger Fahrten anzeigen':'Weitere Fahrten anzeigen'}
}

// CORE-007D8A1F1D8P26E – Zielbild-UI Block 5. Reine Darstellung aus bereits vorhandener LIVE-/ETA-Bewertung.
function ensureLiveDispositionTargetWarning(){
  const ridesBlock=$('atmsLiveTargetRideControl');if(!ridesBlock)return null;
  let shell=$('atmsLiveTargetWarning');
  if(!shell){
    shell=document.createElement('section');shell.id='atmsLiveTargetWarning';shell.className='atms-live-target-warning neutral';
    shell.innerHTML=`<div class="atms-live-target-warning-main"><div class="atms-live-target-warning-title"><span id="atmsLiveTargetWarningIcon">✓</span><b id="atmsLiveTargetWarningTitle">Keine aktuelle Warnung</b></div><div id="atmsLiveTargetWarningText" class="atms-live-target-warning-text">Keine bestätigte Verspätung über der persönlichen Warnschwelle.</div><button type="button" id="atmsLiveTargetWarningDetails" class="atms-live-target-warning-details" hidden>Details anzeigen ›</button></div><div class="atms-live-target-warning-facts"><div><span>Nächste Fahrt</span><b id="atmsLiveTargetWarningRide">–</b></div><div><span id="atmsLiveTargetWarningPredictionLabel">LIVE-Prognose</span><b id="atmsLiveTargetWarningPrediction">–</b></div><div><span>Erwartete Verspätung</span><b id="atmsLiveTargetWarningDelay">–</b></div><div><span>Warnschwelle (persönlich)</span><b id="atmsLiveTargetWarningThreshold">7 Minuten</b></div></div>`;
    ridesBlock.insertAdjacentElement('afterend',shell);
    if(!$('atmsLiveTargetP26EStyle')){const style=document.createElement('style');style.id='atmsLiveTargetP26EStyle';style.textContent=`
      #atmsLiveTargetWarning{box-sizing:border-box;width:100%;margin:0 0 14px;display:grid;grid-template-columns:minmax(0,1.08fr) minmax(280px,.92fr);border:1px solid rgba(255,255,255,.16);border-radius:14px;background:rgba(7,42,63,.28);overflow:hidden}
      #atmsLiveTargetWarning.alert{border-color:rgba(255,73,96,.72);background:linear-gradient(135deg,rgba(95,12,31,.62),rgba(55,8,20,.44))}#atmsLiveTargetWarning.watch{border-color:rgba(255,193,77,.52);background:linear-gradient(135deg,rgba(91,61,6,.34),rgba(57,37,3,.22))}
      .atms-live-target-warning-main{padding:16px 18px}.atms-live-target-warning-title{display:flex;align-items:center;gap:10px}.atms-live-target-warning-title span{font-size:24px;line-height:1}.atms-live-target-warning-title b{font-size:19px;font-weight:950}.atms-live-target-warning-text{font-size:13px;line-height:1.45;opacity:.84;margin:9px 0 12px}.atms-live-target-warning-details{border:1px solid rgba(255,255,255,.30);background:rgba(255,255,255,.06);color:inherit;border-radius:10px;padding:9px 13px;font-size:12px;font-weight:900}
      #atmsLiveTargetWarning.alert .atms-live-target-warning-title,#atmsLiveTargetWarning.alert #atmsLiveTargetWarningDelay{color:#ff6579}#atmsLiveTargetWarning.watch .atms-live-target-warning-title,#atmsLiveTargetWarning.watch #atmsLiveTargetWarningDelay{color:#ffc14d}
      .atms-live-target-warning-facts{padding:12px 16px;border-left:1px solid rgba(255,255,255,.14);display:flex;flex-direction:column;justify-content:center}.atms-live-target-warning-facts>div{display:grid;grid-template-columns:145px minmax(0,1fr);gap:10px;padding:6px 0}.atms-live-target-warning-facts span{font-size:11px;opacity:.62}.atms-live-target-warning-facts b{font-size:12px;overflow-wrap:anywhere}
      @media(max-width:720px){#atmsLiveTargetWarning{grid-template-columns:1fr}.atms-live-target-warning-facts{border-left:0;border-top:1px solid rgba(255,255,255,.14)}.atms-live-target-warning-facts>div{grid-template-columns:132px minmax(0,1fr)}}
    `;document.head.appendChild(style)}
    $('atmsLiveTargetWarningDetails')?.addEventListener('click',()=>{const id=String($('atmsLiveTargetWarningDetails')?.dataset.rideId||'').trim();if(id)openCockpit(id)});
  }
  return shell;
}
function renderLiveDispositionTargetWarning(driver,drides,threshold){
  const shell=ensureLiveDispositionTargetWarning();if(!shell)return;
  const source=Array.isArray(drides)?drides:[],assessed=source.map(ride=>({ride,state:liveDispositionAssessment(ride,threshold)})).filter(x=>x.state.hasDelayAssessment),over=assessed.find(x=>Number(x.state.delay)>=threshold),picked=over||null;
  const title=$('atmsLiveTargetWarningTitle'),icon=$('atmsLiveTargetWarningIcon'),text=$('atmsLiveTargetWarningText'),rideEl=$('atmsLiveTargetWarningRide'),prediction=$('atmsLiveTargetWarningPrediction'),predictionLabel=$('atmsLiveTargetWarningPredictionLabel'),delayEl=$('atmsLiveTargetWarningDelay'),thresholdEl=$('atmsLiveTargetWarningThreshold'),details=$('atmsLiveTargetWarningDetails');
  if(thresholdEl)thresholdEl.textContent=`${threshold} Minuten`;
  if(!picked){shell.hidden=true;shell.className='atms-live-target-warning neutral';if(details){details.hidden=true;details.dataset.rideId=''}return}shell.hidden=false;
  const ride=picked.ride,state=picked.state,delay=Math.max(0,Number(state.delay)||0),isAlert=delay>=threshold,eta=liveEtaResults.get(String(ride.id)),etaClock=eta?.arrivalPickup?clockOf(eta.arrivalPickup):'',liveClock=state.hasLive?liveTimeOf(ride):'';
  shell.className='atms-live-target-warning '+(isAlert?'alert':'watch');if(icon)icon.textContent=isAlert?'⚠':'!';if(title)title.textContent=isAlert?'Aktuelle Warnung':'LIVE-Hinweis';if(text)text.textContent=isAlert?'Die nächste betroffene Fahrt überschreitet nach bestätigten LIVE-Daten die persönliche Warnschwelle.':'Eine bestätigte Verspätung liegt vor, bleibt aber noch unter der persönlichen Warnschwelle.';
  if(rideEl)rideEl.textContent=`${ride.pickup||'Start'} → ${ride.destination||'Ziel'}`;if(prediction){prediction.textContent=etaClock||liveClock||'–'}if(predictionLabel)predictionLabel.textContent=etaClock?'Prognostizierte Ankunft':'LIVE-Prognose';if(delayEl)delayEl.textContent=delay>0?`+${delay} Minuten`:'0 Minuten';if(details){details.hidden=false;details.dataset.rideId=String(ride.id||'')}
}


// CORE-007D8A1F1D8P26G – isolierter Zielbild-Demomodus. Nur DOM-Darstellung, keinerlei Datenpersistenz.
function ensureLiveDispositionTargetDemo(){
  const view=$('liveDispositionView'),head=$('atmsLiveTargetTop')?.querySelector('.atms-live-target-head');if(!view||!head)return null;
  let btn=$('atmsLiveTargetDemoBtn');
  if(!btn){
    btn=document.createElement('button');btn.type='button';btn.id='atmsLiveTargetDemoBtn';btn.className='atms-live-target-demo-btn';btn.textContent='🧪 Zielbild-Demo';
    const settings=$('atmsLiveTargetSettingsBtn');head.insertBefore(btn,settings||null);
    btn.addEventListener('click',toggleLiveDispositionTargetDemo);
  }
  if(!$('atmsLiveTargetP26GStyle')){
    const style=document.createElement('style');style.id='atmsLiveTargetP26GStyle';style.textContent=`
      .atms-live-target-demo-btn{flex:0 0 auto;padding:10px 12px;border-radius:11px;border:1px solid rgba(255,193,77,.55);background:rgba(90,62,8,.24);color:inherit;font-weight:900}
      #atmsLiveTargetDemoBanner{display:none;box-sizing:border-box;width:100%;margin:-5px 0 10px;padding:8px 11px;border:1px solid rgba(255,193,77,.46);border-radius:10px;background:rgba(255,193,77,.08);color:#ffd36c;font-size:11px;font-weight:850;line-height:1.35}
      #liveDispositionView[data-atms-p26g-demo="1"] #atmsLiveTargetDemoBanner{display:block}
      #liveDispositionView[data-atms-p26g-demo="1"] .atms-live-target-tracking-actions{display:none!important}
      #liveDispositionView[data-atms-p26g-demo="1"] #atmsLiveTargetPositionBody{background:
        radial-gradient(circle at 50% 58%,rgba(46,168,255,.65) 0 7px,rgba(255,255,255,.94) 8px 11px,rgba(46,168,255,.20) 12px 20px,transparent 21px),
        linear-gradient(28deg,transparent 0 42%,rgba(74,121,148,.24) 43% 46%,transparent 47% 100%),
        linear-gradient(118deg,transparent 0 36%,rgba(74,121,148,.18) 37% 40%,transparent 41% 100%),
        repeating-linear-gradient(0deg,rgba(83,179,225,.07) 0 1px,transparent 1px 24px),
        repeating-linear-gradient(90deg,rgba(83,179,225,.07) 0 1px,transparent 1px 24px),
        linear-gradient(135deg,rgba(3,31,48,.95),rgba(8,63,80,.72))!important}
      #liveDispositionView[data-atms-p26g-demo="1"] #atmsLiveTargetPositionBody::before{display:none}
      #liveDispositionView[data-atms-p26g-demo="1"] #atmsLiveTargetPositionBody .atms-live-target-demo-map-label{position:absolute;font-size:9px;opacity:.74;font-weight:800}
      #liveDispositionView[data-atms-p26g-demo="1"] #atmsLiveTargetPositionBody .l1{left:8%;top:17%}#liveDispositionView[data-atms-p26g-demo="1"] #atmsLiveTargetPositionBody .l2{right:8%;top:23%}#liveDispositionView[data-atms-p26g-demo="1"] #atmsLiveTargetPositionBody .l3{right:16%;bottom:14%}
      #liveDispositionView[data-atms-p26g-demo="1"] .atms-live-target-demo-warning-sent{display:block;margin-top:2px;font-size:7px!important;color:#ffc14d;opacity:1!important;font-weight:850}
      @media(max-width:720px){.atms-live-target-demo-btn{padding:8px 8px;font-size:10px}.atms-live-target-head{flex-wrap:wrap}.atms-live-target-head>div:first-child{flex:1 1 60%}}
    `;document.head.appendChild(style);
  }
  let banner=$('atmsLiveTargetDemoBanner');if(!banner){banner=document.createElement('div');banner.id='atmsLiveTargetDemoBanner';banner.textContent='🧪 ZIELBILD-DEMO · Nur Darstellung mit Beispieldaten. Echte ATMS-Daten werden nicht verändert.';$('atmsLiveTargetTop')?.insertAdjacentElement('afterend',banner)}
  positionLiveDispositionTargetDemoButton();
  return btn;
}
function positionLiveDispositionTargetDemoButton(){
  const view=$('liveDispositionView'),btn=$('atmsLiveTargetDemoBtn'),banner=$('atmsLiveTargetDemoBanner'),head=$('atmsLiveTargetTop')?.querySelector('.atms-live-target-head'),settings=$('atmsLiveTargetSettingsBtn');
  if(!view||!btn||!head)return;
  if(view.dataset.atmsP26gDemo==='1'&&banner){if(btn.parentElement!==banner)banner.appendChild(btn);return}
  if(btn.parentElement!==head)head.insertBefore(btn,settings||null);
}
function clearLiveDispositionTargetDemoState(){
  const select=$('atmsLiveTargetDriverSelect');if(select)select.disabled=false;
  ['atmsLiveThresholdMinus','atmsLiveThresholdPlus','atmsLiveTargetRidesRefresh','atmsLiveTargetRidesMore'].forEach(id=>{const el=$(id);if(el)el.disabled=false});
  const open=$('atmsLiveTargetOpenPositionBtn');if(open)open.disabled=true;
}
function toggleLiveDispositionTargetDemo(){
  const view=$('liveDispositionView');if(!view)return;
  const turningOn=view.dataset.atmsP26gDemo!=='1';view.dataset.atmsP26gDemo=turningOn?'1':'0';
  positionLiveDispositionTargetDemoButton();
  const btn=$('atmsLiveTargetDemoBtn');if(btn)btn.textContent=turningOn?'✕ Demo beenden':'🧪 Zielbild-Demo';
  if(turningOn){applyLiveDispositionTargetDemo();showToast('Zielbild-Demo aktiv · echte Daten unverändert','ok');return}
  clearLiveDispositionTargetDemoState();renderLiveDisposition(false);showToast('Zielbild-Demo beendet','ok');
}
function applyLiveDispositionTargetDemo(){
  const view=$('liveDispositionView');if(!view||view.dataset.atmsP26gDemo!=='1')return;
  ensureLiveDispositionTargetDemo();
  positionLiveDispositionTargetDemoButton();
  const btn=$('atmsLiveTargetDemoBtn');if(btn)btn.textContent='✕ Demo beenden';
  const select=$('atmsLiveTargetDriverSelect');if(select){select.innerHTML='<option value="__demo__">Ghasem</option>';select.value='__demo__';select.disabled=true}
  const meta=$('atmsLiveTargetDriverMeta');if(meta)meta.textContent='F-105';
  const threshold=$('atmsLiveTargetThreshold');if(threshold)threshold.textContent='7';const note=$('atmsLiveTargetThresholdNote');if(note)note.textContent='Warnung ab 7 Minuten Verspätung';
  ['atmsLiveThresholdMinus','atmsLiveThresholdPlus'].forEach(id=>{const el=$(id);if(el)el.disabled=true});
  const strip=$('atmsLiveTargetTrackingStrip');if(strip)strip.className='atms-live-target-tracking is-active';
  const state=$('atmsLiveTargetTrackingState');if(state)state.textContent='● Tracking aktiv';const last=$('atmsLiveTargetLastPosition');if(last)last.textContent='vor 18 Sek.';const acc=$('atmsLiveTargetAccuracy');if(acc)acc.textContent='12 m';
  const body=$('atmsLiveTargetPositionBody');if(body){body.className='atms-live-target-position-body is-live';body.innerHTML='<span class="atms-live-target-demo-map-label l1">Seestern</span><span class="atms-live-target-demo-map-label l2">Niederkasseler Lohweg</span><span class="atms-live-target-demo-map-label l3">Löricker Str.</span><div class="atms-live-target-geo-dot"></div><b style="position:absolute;left:10px;bottom:9px;font-size:9px;opacity:.70">Karten-Vorschau · Demo</b>'}
  const open=$('atmsLiveTargetOpenPositionBtn');if(open){open.disabled=true;open.textContent='🗺 In Maps öffnen'}
  const driver=$('atmsLiveTargetInfoDriver');if(driver)driver.textContent='Ghasem';const id=$('atmsLiveTargetInfoId');if(id)id.textContent='F-105';const vehicle=$('atmsLiveTargetInfoVehicle');if(vehicle)vehicle.textContent='K-AT 458';const shift=$('atmsLiveTargetInfoShift');if(shift)shift.textContent='13:00 – 22:00 Uhr';const gps=$('atmsLiveTargetInfoConnection');if(gps){gps.textContent='● Sehr gut';gps.className='is-live'}
  const title=$('atmsLiveTargetRidesTitle');if(title)title.textContent='Fahrtenkontrolle – Nur Fahrten von Ghasem';const refresh=$('atmsLiveTargetRidesRefresh');if(refresh)refresh.disabled=true;const more=$('atmsLiveTargetRidesMore');if(more)more.hidden=true;
  const list=$('atmsLiveTargetRidesList');if(list)list.innerHTML=[
    ['good','13:15','05.08.2026','Marriott Seestern DUS → DUS Airport','EW9504','13:15','0 Min.','✓ Pünktlich',''],
    ['warn','14:10','05.08.2026','DUS Airport → Köln Messe','–','14:19','+9 Min.','⚠ Verspätet','⚠ Warnung gesendet 13:42'],
    ['bad','15:20','05.08.2026','Köln Messe → Bonn HBF','–','15:31','+11 Min.','⚠ Verspätet','⚠ Warnung gesendet 13:42'],
    ['good','16:30','05.08.2026','Bonn HBF → Koblenz HBF','–','16:28','-2 Min.','✓ Pünktlich','']
  ].map((r,i)=>`<div class="atms-live-target-ride-row ${r[0]}"><div class="atms-live-target-ride-index">${i+1}</div><div class="atms-live-target-ride-time"><b>${r[1]}</b><span>${r[2]}</span></div><div class="atms-live-target-ride-route"><b>${r[3]}</b><span>${r[4]}</span></div><div class="atms-live-target-ride-metric ${r[0]}"><span>Prognose</span><b>${r[5]}</b></div><div class="atms-live-target-ride-metric ${r[0]}"><span>Verspätung</span><b>${r[6]}</b>${r[8]?`<span class="atms-live-target-demo-warning-sent">${r[8]}</span>`:''}</div><div class="atms-live-target-ride-status ${r[0]}">${r[7]}</div><button type="button" class="atms-live-target-ride-open" disabled>›</button></div>`).join('');
  const warning=$('atmsLiveTargetWarning');if(warning){warning.hidden=false;warning.className='atms-live-target-warning alert'}
  const icon=$('atmsLiveTargetWarningIcon');if(icon)icon.textContent='⚠';const wt=$('atmsLiveTargetWarningTitle');if(wt)wt.textContent='Aktuelle Warnung';const txt=$('atmsLiveTargetWarningText');if(txt)txt.textContent='Die nächste Fahrt kann voraussichtlich nicht pünktlich erreicht werden.';const wr=$('atmsLiveTargetWarningRide');if(wr)wr.textContent='DUS Airport → Köln Messe';const pl=$('atmsLiveTargetWarningPredictionLabel');if(pl)pl.textContent='Prognostizierte Ankunft';const pred=$('atmsLiveTargetWarningPrediction');if(pred)pred.textContent='14:19 Uhr';const del=$('atmsLiveTargetWarningDelay');if(del)del.textContent='+9 Minuten';const th=$('atmsLiveTargetWarningThreshold');if(th)th.textContent='7 Minuten';const details=$('atmsLiveTargetWarningDetails');if(details){details.hidden=false;details.dataset.rideId='';details.textContent='Details anzeigen ›';details.disabled=true}
  renderLiveDispositionTargetAppBar();
}

// CORE-007D8A1F1D8P26F – gebündeltes Zielbild-Finish. Legacy-Funktionen bleiben vorhanden und werden nur standardmäßig eingeklappt.
function atmsLiveTargetLegacyCard(anchorId){
  const view=$('liveDispositionView'),anchor=$(anchorId);if(!view||!anchor)return null;
  let node=anchor;
  while(node&&node!==view){
    if(node.id&&/^atmsLiveTarget/.test(node.id))return null;
    try{if(node.matches('section,article,.live-card,.card,.panel,.settings-card,.tracking-card,.live-section'))return node}catch(_){ }
    node=node.parentElement;
  }
  return anchor.parentElement&&anchor.parentElement!==view?anchor.parentElement:null;
}
function atmsLiveTargetAdvancedCards(){
  const ids=['liveDelayContent','liveSolutionContent','liveMap','liveWarnThreshold','liveEventLog','liveRouteCheckCard','liveEtaState'];
  const out=[];
  ids.forEach(id=>{const card=atmsLiveTargetLegacyCard(id);if(card&&!out.includes(card))out.push(card)});
  return out;
}
function applyLiveDispositionTargetFinishCleanup(){
  const view=$('liveDispositionView');if(!view)return;
  const open=view.dataset.atmsP26fAdvanced==='1';
  atmsLiveTargetAdvancedCards().forEach(card=>{card.dataset.atmsP26fAdvanced='1';card.style.display=open?'':'none'});
  // P26R: Wenn die technischen Live-Einstellungen eingeklappt sind, dürfen keine
  // Legacy-Nachlaufbereiche hinter dem neuen Zielbild weiter Platz belegen. Beim
  // erneuten Öffnen wird exakt der vorherige Inline-display-Wert wiederhergestellt.
  const warning=$('atmsLiveTargetWarning');
  let node=warning?.nextElementSibling||null;
  while(node){
    const next=node.nextElementSibling;
    if(!/^atmsLiveTarget/.test(String(node.id||''))){
      if(!open){
        if(node.dataset.atmsP26rTrailing!=='1'){
          node.dataset.atmsP26rTrailing='1';
          node.dataset.atmsP26rDisplay=node.style.display||'';
        }
        node.style.display='none';
      }else if(node.dataset.atmsP26rTrailing==='1'){
        node.style.display=node.dataset.atmsP26rDisplay||'';
      }
    }
    node=next;
  }
  const btn=$('atmsLiveTargetSettingsBtn');if(btn)btn.textContent=open?'✕ Live-Dispo schließen':'⚙ Live-Dispo';
  const orphanIds=['liveMoreRidesBtn','liveOpenMapBtn','liveApplySolutionBtn','liveEtaRefreshBtn','liveRefreshBtn'];
  orphanIds.forEach(id=>{const el=$(id);if(!el)return;if(!open){if(el.dataset.atmsP26sOrphan!=='1'){el.dataset.atmsP26sOrphan='1';el.dataset.atmsP26sDisplay=el.style.display||''}el.style.display='none'}else if(el.dataset.atmsP26sOrphan==='1'){el.style.display=el.dataset.atmsP26sDisplay||''}});
}
function toggleLiveDispositionTargetAdvanced(){
  const view=$('liveDispositionView');if(!view)return;
  view.dataset.atmsP26fAdvanced=view.dataset.atmsP26fAdvanced==='1'?'0':'1';
  applyLiveDispositionTargetFinishCleanup();
  if(view.dataset.atmsP26fAdvanced==='1'){
    const first=atmsLiveTargetAdvancedCards()[0];if(first)first.scrollIntoView({behavior:'smooth',block:'start'});
  }else{$('atmsLiveTargetTop')?.scrollIntoView({behavior:'smooth',block:'start'})}
}
// CORE-007D8A1F1D8P26I – Zielbild-Kopfleiste + finaler visueller Android-Abgleich. Nur Darstellung.
function ensureLiveDispositionTargetAppBar(){
  const view=$('liveDispositionView'),top=$('atmsLiveTargetTop');if(!view||!top)return null;
  let bar=$('atmsLiveTargetAppBar');
  if(!bar){
    bar=document.createElement('div');bar.id='atmsLiveTargetAppBar';bar.className='atms-live-target-appbar';
    bar.innerHTML=`<div class="atms-live-target-brand"><span class="atms-live-target-menu" aria-hidden="true">☰</span><b>ATMS <em>PRO</em></b></div><div class="atms-live-target-appbar-right"><span id="atmsLiveTargetConnection" class="atms-live-target-connection">● Lokal aktiv</span><button type="button" id="atmsLiveTargetBell" class="atms-live-target-bell" aria-label="Nachrichten öffnen">🔔<span id="atmsLiveTargetBellBadge" hidden>0</span></button></div>`;
    top.insertAdjacentElement('beforebegin',bar);
    $('atmsLiveTargetBell')?.addEventListener('click',renderMessagesView);
  }
  return bar;
}
function renderLiveDispositionTargetAppBar(){
  const view=$('liveDispositionView'),bar=ensureLiveDispositionTargetAppBar();if(!view||!bar)return;
  const demo=view.dataset.atmsP26gDemo==='1',session=getDriverSession(),connection=$('atmsLiveTargetConnection');
  if(connection){connection.textContent=demo?'● Live verbunden':session?.active?'● Tracking aktiv':'● Lokal aktiv';connection.className='atms-live-target-connection '+(demo||session?.active?'is-live':'')}
  const badge=$('atmsLiveTargetBellBadge');if(badge){const count=demo?3:getPreparedMessages().filter(x=>x&&x.status!=='dismissed').length;badge.textContent=String(count);badge.hidden=count<1}
}
function ensureLiveDispositionTargetFinish(){
  const view=$('liveDispositionView'),top=$('atmsLiveTargetTop');if(!view||!top)return;
  if(!$('atmsLiveTargetP26FStyle')){
    const style=document.createElement('style');style.id='atmsLiveTargetP26FStyle';style.textContent=`
      #liveDispositionView{box-sizing:border-box;max-width:980px;margin-left:auto;margin-right:auto}
      #atmsLiveTargetTop,#atmsLiveTargetPositionInfo,#atmsLiveTargetRideControl,#atmsLiveTargetWarning{scroll-margin-top:16px}
      .atms-live-target-position-body .atms-live-target-coords{position:relative;margin-top:8px;font-size:10px;opacity:.55;letter-spacing:.03em}
      #atmsLiveTargetWarning[hidden]{display:none!important}
      [data-atms-p26f-advanced="1"]{scroll-margin-top:18px}
      @media(max-width:720px) and (min-width:370px){
        .atms-live-target-head{margin-bottom:9px!important}.atms-live-target-title{font-size:27px!important}.atms-live-target-sub{font-size:12px!important}.atms-live-target-settings{padding:8px 9px!important;font-size:11px!important}
        .atms-live-target-grid{grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:8px!important}.atms-live-target-card{padding:10px!important;border-radius:12px!important}.atms-live-target-label{font-size:12px!important;margin-bottom:7px!important}#atmsLiveTargetDriverSelect{padding:10px 8px!important;font-size:14px!important}.atms-live-target-meta{font-size:10px!important;margin-top:5px!important}
        .atms-live-target-threshold{grid-template-columns:38px minmax(32px,1fr) auto 38px!important;gap:4px!important}.atms-live-target-threshold button{height:42px!important;font-size:22px!important}.atms-live-target-threshold b{font-size:30px!important}.atms-live-target-threshold span{font-size:10px!important}
        .atms-live-target-tracking{grid-template-columns:minmax(0,1.35fr) minmax(0,.9fr) minmax(0,.72fr)!important;margin-top:8px!important}.atms-live-target-tracking>div{padding:10px 8px!important}.atms-live-target-tracking>div:first-child{grid-column:auto!important;border-bottom:0!important}.atms-live-target-tracking>div:nth-child(2){border-left:1px solid rgba(255,255,255,.14)!important}.atms-live-target-tracking span{font-size:9px!important}.atms-live-target-tracking b{font-size:11px!important}.atms-live-target-tracking-actions{gap:4px!important;margin-top:5px!important}.atms-live-target-mini-action{padding:5px 6px!important;font-size:9px!important}
        .atms-live-target-position-grid{grid-template-columns:minmax(0,1.12fr) minmax(0,.88fr)!important;gap:8px!important}.atms-live-target-position-head{padding:9px 9px!important}.atms-live-target-position-head>b{font-size:12px!important}.atms-live-target-position-head button{padding:6px 7px!important;font-size:9px!important}.atms-live-target-position-body{min-height:128px!important;padding:12px!important}.atms-live-target-position-body b{font-size:13px!important}.atms-live-target-position-body span{font-size:10px!important}.atms-live-target-driver-rows{padding:5px 9px 8px!important}.atms-live-target-driver-rows>div{grid-template-columns:62px minmax(0,1fr)!important;gap:5px!important;padding:6px 0!important}.atms-live-target-driver-rows span{font-size:9px!important}.atms-live-target-driver-rows b{font-size:10px!important}
        .atms-live-target-rides-head{padding:9px 9px!important}.atms-live-target-rides-head>b{font-size:12px!important}.atms-live-target-rides-head button{padding:6px 7px!important;font-size:9px!important}
        .atms-live-target-ride-row{grid-template-columns:24px 50px minmax(86px,1fr) 46px 50px 64px 18px!important;gap:4px!important;padding:9px 5px!important}.atms-live-target-ride-index{font-size:15px!important}.atms-live-target-ride-time b{font-size:13px!important}.atms-live-target-ride-time span,.atms-live-target-ride-route span,.atms-live-target-ride-metric span{font-size:8px!important}.atms-live-target-ride-route b{font-size:9px!important;line-height:1.2!important}.atms-live-target-ride-metric{grid-column:auto!important;display:block!important;margin-top:0!important}.atms-live-target-ride-metric b{font-size:9px!important;text-align:left!important}.atms-live-target-ride-status{grid-column:auto!important;justify-self:stretch!important;margin-top:0!important;min-height:24px!important;padding:3px 3px!important;font-size:8px!important}.atms-live-target-ride-open{grid-column:auto!important;grid-row:auto!important;font-size:18px!important;padding:0!important}
        #atmsLiveTargetWarning{grid-template-columns:minmax(0,1.08fr) minmax(0,.92fr)!important}.atms-live-target-warning-main{padding:12px!important}.atms-live-target-warning-title b{font-size:14px!important}.atms-live-target-warning-text{font-size:10px!important;margin:6px 0 8px!important}.atms-live-target-warning-details{padding:6px 8px!important;font-size:9px!important}.atms-live-target-warning-facts{border-left:1px solid rgba(255,255,255,.14)!important;border-top:0!important;padding:8px 9px!important}.atms-live-target-warning-facts>div{grid-template-columns:88px minmax(0,1fr)!important;gap:5px!important;padding:4px 0!important}.atms-live-target-warning-facts span{font-size:8px!important}.atms-live-target-warning-facts b{font-size:9px!important}
      }
      @media(max-width:369px){
        .atms-live-target-grid,.atms-live-target-position-grid{grid-template-columns:1fr!important}
        .atms-live-target-tracking{grid-template-columns:1fr 1fr!important}.atms-live-target-tracking>div:first-child{grid-column:1/-1!important;border-bottom:1px solid rgba(255,255,255,.14)!important}.atms-live-target-tracking>div:nth-child(2){border-left:0!important}
      }
    `;document.head.appendChild(style);
  }
  if(!$('atmsLiveTargetP26HStyle')){
    const p26h=document.createElement('style');p26h.id='atmsLiveTargetP26HStyle';p26h.textContent=`
      body.atms-live-target-active .nav[data-nav="settings"]{display:flex!important}
      #atmsLiveTargetTop{margin-bottom:10px!important}.atms-live-target-head{margin-bottom:10px!important}
      .atms-live-target-driver-select-shell{display:grid;grid-template-columns:46px minmax(0,1fr);gap:10px;align-items:center;padding:3px 0}.atms-live-target-avatar{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:linear-gradient(145deg,#d9ecf8,#7194aa);color:#0a3147;font-size:23px;border:2px solid rgba(255,255,255,.45);box-shadow:0 4px 18px rgba(0,0,0,.22)}.atms-live-target-driver-select-stack{min-width:0}#atmsLiveTargetDriverSelect{border:0!important;background:transparent!important;padding:0 24px 0 0!important;min-height:26px;font-size:18px!important}.atms-live-target-driver-select-stack .atms-live-target-meta{margin-top:2px!important;font-size:11px!important}
      .atms-live-target-tracking>div{position:relative;padding-left:42px!important}.atms-live-target-tracking>div::before{position:absolute;left:13px;top:50%;transform:translateY(-50%);font-size:22px;font-weight:900;opacity:.92}.atms-live-target-tracking>div:nth-child(1)::before{content:"◉";color:#3fe37d}.atms-live-target-tracking>div:nth-child(2)::before{content:"◷";color:#d8eaf3}.atms-live-target-tracking>div:nth-child(3)::before{content:"⊙";color:#3fe37d}.atms-live-target-tracking.is-wait>div:nth-child(1)::before,.atms-live-target-tracking:not(.is-active):not(.is-wait)>div:nth-child(1)::before{color:#ffc14d}
      .atms-live-target-position-body.is-live{background:linear-gradient(145deg,#12384c,#071f2c)!important;justify-content:flex-end!important;align-items:stretch!important;text-align:left!important}.atms-live-target-position-body.is-live::before{background-image:linear-gradient(28deg,transparent 42%,rgba(119,160,181,.22) 43%,rgba(119,160,181,.22) 47%,transparent 48%),linear-gradient(128deg,transparent 45%,rgba(119,160,181,.17) 46%,rgba(119,160,181,.17) 50%,transparent 51%),radial-gradient(circle at 28% 36%,rgba(50,113,144,.42),transparent 24%)!important;background-size:auto!important}.atms-live-target-map-road{position:absolute;height:5px;background:rgba(163,190,205,.24);border-radius:999px;transform-origin:left center}.atms-live-target-map-road.r1{width:78%;left:-6%;top:42%;transform:rotate(-17deg)}.atms-live-target-map-road.r2{width:62%;left:42%;top:17%;transform:rotate(64deg)}.atms-live-target-map-road.r3{width:70%;left:11%;top:78%;transform:rotate(10deg)}.atms-live-target-position-body.is-live .atms-live-target-geo-dot{position:absolute;left:47%;top:47%;transform:translate(-50%,-50%);margin:0!important;z-index:2}.atms-live-target-map-caption{position:relative;z-index:3;display:flex;gap:7px;align-items:baseline;flex-wrap:wrap;padding:7px 8px;border-radius:8px;background:rgba(0,16,24,.72);backdrop-filter:blur(2px);width:max-content;max-width:100%}.atms-live-target-map-caption b{font-size:11px!important;color:#fff!important}.atms-live-target-map-caption span,.atms-live-target-map-caption small{font-size:9px!important;margin:0!important;opacity:.78}
      .atms-live-target-driver-rows>div{grid-template-columns:24px 72px minmax(0,1fr)!important}.atms-live-target-driver-rows>div::before{font-size:15px;opacity:.9;text-align:center}.atms-live-target-driver-rows>div:nth-child(1)::before{content:"♙"}.atms-live-target-driver-rows>div:nth-child(2)::before{content:"▣"}.atms-live-target-driver-rows>div:nth-child(3)::before{content:"▰"}.atms-live-target-driver-rows>div:nth-child(4)::before{content:"◷"}.atms-live-target-driver-rows>div:nth-child(5)::before{content:"▮▮▮";font-size:9px;color:#45e386}
      .atms-live-target-ride-status{border-radius:9px!important}.atms-live-target-rides-head{background:rgba(3,25,37,.26)}#atmsLiveTargetWarning.alert{box-shadow:inset 0 0 32px rgba(255,55,83,.06)}
      #liveDispositionView[data-atms-p26g-demo="1"] #atmsLiveTargetTrackingAction,#liveDispositionView[data-atms-p26g-demo="1"] #atmsLiveTargetConsentRevoke{display:none!important}#liveDispositionView[data-atms-p26g-demo="1"] #atmsLiveTargetPositionBody .atms-live-target-geo-dot{display:block!important;position:absolute!important;left:47%!important;top:54%!important;transform:translate(-50%,-50%)!important;margin:0!important}
      @media(max-width:720px) and (min-width:370px){
        #liveDispositionView{padding-left:8px!important;padding-right:8px!important}.atms-live-target-title{font-size:25px!important}.atms-live-target-sub{font-size:11px!important}.atms-live-target-avatar{width:38px;height:38px;font-size:20px}.atms-live-target-driver-select-shell{grid-template-columns:40px minmax(0,1fr);gap:8px}.atms-live-target-card{padding:9px!important}#atmsLiveTargetDriverSelect{font-size:15px!important}.atms-live-target-threshold b{font-size:28px!important}
        .atms-live-target-tracking>div{padding:9px 6px 9px 32px!important}.atms-live-target-tracking>div::before{left:9px;font-size:18px}.atms-live-target-tracking b{font-size:10px!important}.atms-live-target-tracking span{font-size:8px!important}
        .atms-live-target-position-body{min-height:118px!important}.atms-live-target-driver-rows>div{grid-template-columns:18px 54px minmax(0,1fr)!important;padding:5px 0!important}.atms-live-target-driver-rows span{font-size:8px!important}.atms-live-target-driver-rows b{font-size:9.5px!important}
        .atms-live-target-ride-row{grid-template-columns:20px 46px minmax(90px,1fr) 40px 46px 60px 14px!important;gap:3px!important;padding:8px 4px!important}.atms-live-target-ride-index{font-size:14px!important}.atms-live-target-ride-time b{font-size:12px!important}.atms-live-target-ride-time span,.atms-live-target-ride-route span,.atms-live-target-ride-metric span{font-size:7.5px!important}.atms-live-target-ride-route b{font-size:8.5px!important}.atms-live-target-ride-metric b{font-size:8.5px!important}.atms-live-target-ride-status{font-size:7.5px!important;min-height:22px!important}.atms-live-target-ride-open{font-size:16px!important}
        .atms-live-target-warning-main{padding:10px!important}.atms-live-target-warning-title span{font-size:18px!important}.atms-live-target-warning-title b{font-size:13px!important}.atms-live-target-warning-text{font-size:9px!important}.atms-live-target-warning-facts{padding:7px 8px!important}.atms-live-target-warning-facts>div{grid-template-columns:78px minmax(0,1fr)!important}.atms-live-target-warning-facts span{font-size:7.5px!important}.atms-live-target-warning-facts b{font-size:8.5px!important}
      }
    `;document.head.appendChild(p26h);
  }
  if(!$('atmsLiveTargetP26IStyle')){
    const p26i=document.createElement('style');p26i.id='atmsLiveTargetP26IStyle';p26i.textContent=`
      .atms-live-target-appbar{box-sizing:border-box;width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 11px;margin:0 0 12px;border-bottom:1px solid rgba(46,168,255,.18);background:linear-gradient(180deg,rgba(2,24,36,.92),rgba(2,24,36,.50));border-radius:12px 12px 0 0}.atms-live-target-brand{display:flex;align-items:center;gap:10px;min-width:0}.atms-live-target-menu{font-size:20px;line-height:1;opacity:.96}.atms-live-target-brand b{font-size:21px;white-space:nowrap;letter-spacing:.01em}.atms-live-target-brand em{font-style:normal;color:#ffc928}.atms-live-target-appbar-right{display:flex;align-items:center;gap:8px}.atms-live-target-connection{white-space:nowrap;padding:6px 9px;border:1px solid rgba(91,183,230,.36);border-radius:999px;background:rgba(8,68,96,.25);font-size:10px;font-weight:900;opacity:.84}.atms-live-target-connection.is-live{color:#3fe37d;opacity:1}.atms-live-target-bell{position:relative;border:0;background:transparent;color:inherit;font-size:18px;padding:4px}.atms-live-target-bell span{position:absolute;right:-2px;top:-3px;min-width:15px;height:15px;padding:0 3px;border-radius:999px;background:#ef3857;color:#fff;font-size:8px;line-height:15px;font-weight:950;text-align:center}
      #liveDispositionView{padding-bottom:112px!important}.atms-live-target-head{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;align-items:start!important;column-gap:10px!important;row-gap:4px!important;flex-wrap:initial!important}.atms-live-target-head>div:first-child{grid-column:1!important;grid-row:1!important;min-width:0!important}.atms-live-target-settings{grid-column:2!important;grid-row:1!important;align-self:start!important;white-space:nowrap!important}.atms-live-target-title{white-space:nowrap!important}.atms-live-target-sub{max-width:100%!important}.atms-live-target-demo-btn{position:fixed!important;right:10px!important;bottom:82px!important;z-index:12000!important;padding:6px 8px!important;border-radius:9px!important;font-size:8px!important;line-height:1.1!important;box-shadow:0 6px 18px rgba(0,0,0,.28);opacity:.82}.atms-live-target-demo-btn:hover,.atms-live-target-demo-btn:focus{opacity:1}
      #atmsLiveTargetDemoBanner{margin:0 0 8px!important;padding:5px 8px!important;border-radius:8px!important;font-size:8px!important;line-height:1.25!important}.atms-live-target-position-body.is-live>b{font-size:8px!important;opacity:.56!important;color:#c5d8e2!important}.atms-live-target-driver-rows>div:nth-child(5)::before{content:"▮▮▮"!important;letter-spacing:1px!important;font-size:7px!important}.atms-live-target-demo-warning-sent{font-size:6.4px!important;line-height:1.12!important}.atms-live-target-ride-status{white-space:nowrap}.atms-live-target-warning{margin-bottom:10px!important}
      #liveDispositionView[data-atms-p26g-demo="1"] #atmsLiveTargetOpenPositionBtn{opacity:1!important;color:#21aef3!important;border-color:rgba(33,174,243,.62)!important;background:rgba(8,91,132,.22)!important;filter:none!important}
      @media(max-width:720px) and (min-width:370px){
        .atms-live-target-appbar{padding:7px 8px!important;margin-bottom:9px!important}.atms-live-target-menu{font-size:17px!important}.atms-live-target-brand{gap:7px!important}.atms-live-target-brand b{font-size:18px!important}.atms-live-target-connection{font-size:8px!important;padding:5px 7px!important}.atms-live-target-bell{font-size:16px!important}
        .atms-live-target-title{font-size:20px!important;line-height:1.08!important;letter-spacing:-.025em!important}.atms-live-target-sub{font-size:9.5px!important;line-height:1.25!important;margin-top:3px!important}.atms-live-target-settings{padding:7px 8px!important;font-size:9.5px!important;border-radius:9px!important}
        .atms-live-target-position-head{min-height:36px!important}.atms-live-target-position-body{min-height:116px!important}.atms-live-target-driver-rows>div{grid-template-columns:17px 50px minmax(0,1fr)!important;gap:4px!important}.atms-live-target-driver-rows>div::before{font-size:12px!important}.atms-live-target-driver-rows>div:nth-child(5)::before{font-size:6px!important}
        .atms-live-target-ride-row{grid-template-columns:18px 42px minmax(78px,1fr) 37px 56px 59px 12px!important;gap:2px!important;padding:8px 4px!important}.atms-live-target-ride-route b{font-size:8px!important}.atms-live-target-ride-time b{font-size:11px!important}.atms-live-target-ride-time span,.atms-live-target-ride-route span,.atms-live-target-ride-metric span{font-size:6.8px!important}.atms-live-target-ride-metric b{font-size:8px!important}.atms-live-target-ride-status{font-size:6.8px!important;min-height:20px!important;padding:2px 2px!important}.atms-live-target-demo-warning-sent{font-size:5.8px!important}.atms-live-target-rides-head>b{font-size:11.5px!important}.atms-live-target-rides-head button{font-size:8px!important;padding:5px 6px!important}
      }
      @media(max-width:430px){.atms-live-target-connection{display:none}.atms-live-target-appbar{gap:6px}.atms-live-target-title{font-size:19px!important}.atms-live-target-settings{font-size:9px!important;padding:7px 7px!important}}
    `;document.head.appendChild(p26i);
  }
  if(!$('atmsLiveTargetP26JStyle')){
    const p26j=document.createElement('style');p26j.id='atmsLiveTargetP26JStyle';p26j.textContent=`
      #liveDispositionView[data-atms-p26g-demo="1"] #atmsLiveTargetDemoBanner{display:flex!important;align-items:center;justify-content:space-between;gap:8px;min-height:30px}
      #liveDispositionView[data-atms-p26g-demo="1"] #atmsLiveTargetDemoBanner .atms-live-target-demo-btn{position:static!important;right:auto!important;bottom:auto!important;z-index:auto!important;flex:0 0 auto!important;margin-left:auto!important;opacity:1!important;padding:5px 7px!important;font-size:7.5px!important;box-shadow:none!important;white-space:nowrap!important}
      @media(max-width:430px){
        .atms-live-target-connection{display:inline-flex!important;align-items:center!important;font-size:7px!important;padding:4px 5px!important;line-height:1!important}
        .atms-live-target-appbar-right{gap:3px!important;min-width:0!important}.atms-live-target-brand{gap:6px!important}.atms-live-target-brand b{font-size:16px!important}.atms-live-target-menu{font-size:15px!important}.atms-live-target-bell{font-size:15px!important;padding:3px!important}
        #liveDispositionView[data-atms-p26g-demo="1"] #atmsLiveTargetDemoBanner{font-size:7.2px!important;line-height:1.2!important;padding:5px 6px!important}
      }
    `;document.head.appendChild(p26j);
  }
  if(!$('atmsLiveTargetP26KStyle')){
    const p26k=document.createElement('style');p26k.id='atmsLiveTargetP26KStyle';p26k.textContent=`
      /* P26K: nur Lesbarkeit + kontrollierter Bottom-Abstand; Kernlogik bleibt unberührt. */
      #liveDispositionView{padding-bottom:78px!important}
      .atms-live-target-warning{margin-bottom:4px!important}
      @media(max-width:720px) and (min-width:370px){
        .atms-live-target-sub{font-size:10.2px!important}
        .atms-live-target-settings{font-size:10px!important}
        .atms-live-target-meta{font-size:10.6px!important}
        .atms-live-target-threshold span{font-size:10.6px!important}
        .atms-live-target-tracking span{font-size:8.7px!important}.atms-live-target-tracking b{font-size:10.7px!important}
        .atms-live-target-mini-action{font-size:9.6px!important}
        .atms-live-target-position-head>b{font-size:12.6px!important}.atms-live-target-position-head button{font-size:9.6px!important}
        .atms-live-target-position-body span{font-size:10.6px!important}
        .atms-live-target-driver-rows span{font-size:8.7px!important}.atms-live-target-driver-rows b{font-size:10.2px!important}
        .atms-live-target-rides-head>b{font-size:12.2px!important}.atms-live-target-rides-head button{font-size:8.6px!important}
        .atms-live-target-ride-time span,.atms-live-target-ride-route span,.atms-live-target-ride-metric span{font-size:7.4px!important}
        .atms-live-target-ride-route b{font-size:8.6px!important}.atms-live-target-ride-metric b{font-size:8.6px!important}
        .atms-live-target-ride-status{font-size:7.3px!important}.atms-live-target-demo-warning-sent{font-size:6.3px!important}
        .atms-live-target-warning-text{font-size:9.7px!important}.atms-live-target-warning-details{font-size:9.5px!important}
        .atms-live-target-warning-facts span{font-size:8.1px!important}.atms-live-target-warning-facts b{font-size:9.2px!important}
      }
      @media(max-width:430px){
        .atms-live-target-connection{font-size:7.5px!important}
        #liveDispositionView[data-atms-p26g-demo="1"] #atmsLiveTargetDemoBanner{font-size:7.8px!important}
        #liveDispositionView[data-atms-p26g-demo="1"] #atmsLiveTargetDemoBanner .atms-live-target-demo-btn{font-size:8px!important}
      }
    `;document.head.appendChild(p26k);
  }
  if(!$('atmsLiveTargetP26MStyle')){
    const p26m=document.createElement('style');p26m.id='atmsLiveTargetP26MStyle';p26m.textContent=`
      /* P26M: sechs globale Bottom-Nav-Ziele ohne horizontalen Überlauf in Live-Dispo. */
      body.atms-live-target-active .atms-live-six-nav{display:grid!important;grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:0!important;width:100%!important;max-width:100vw!important}
      body.atms-live-target-active .atms-live-six-nav>*{min-width:0!important;max-width:100%!important}
      body.atms-live-target-active .atms-live-six-nav .nav{width:auto!important;min-width:0!important;flex:initial!important;padding-left:2px!important;padding-right:2px!important;overflow:visible!important}
      body.atms-live-target-active .atms-live-six-nav .nav[data-nav="settings"]{display:flex!important}
      @media(max-width:430px){
        body.atms-live-target-active .atms-live-six-nav .nav{padding-left:1px!important;padding-right:1px!important}
      }
    `;document.head.appendChild(p26m);
  }
  if(!$('atmsLiveTargetP26NStyle')){
    const p26n=document.createElement('style');p26n.id='atmsLiveTargetP26NStyle';p26n.textContent=`
      /* P26N: globales Einstellungen-Ziel in Live-Dispo vollständig und vertikal zentriert darstellen. */
      body.atms-live-target-active .atms-live-six-nav .nav[data-nav="settings"]{
        display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;
        gap:2px!important;overflow:visible!important;white-space:normal!important;text-align:center!important;
        font-size:0!important;line-height:1!important
      }
      body.atms-live-target-active .atms-live-six-nav .nav[data-nav="settings"]>*{display:none!important}
      body.atms-live-target-active .atms-live-six-nav .nav[data-nav="settings"]::before{
        content:"⚙";display:block;font-size:23px!important;line-height:1!important;color:inherit
      }
      body.atms-live-target-active .atms-live-six-nav .nav[data-nav="settings"]::after{
        content:"Einstellungen";display:block;font-size:9px!important;line-height:1.05!important;white-space:nowrap!important;color:inherit
      }
      @media(min-width:431px){
        body.atms-live-target-active .atms-live-six-nav .nav[data-nav="settings"]::after{font-size:10px!important}
      }
    `;document.head.appendChild(p26n);
  }
  if(!$('atmsLiveTargetP26OStyle')){
    const p26o=document.createElement('style');p26o.id='atmsLiveTargetP26OStyle';p26o.textContent=`
      /* P26O: keine künstlichen Pseudo-Inhalte in der globalen Settings-Navigation; echte Baseline-Darstellung bleibt maßgeblich. */
      html body.atms-live-target-active .atms-live-six-nav .nav[data-nav="settings"]::before,
      html body.atms-live-target-active .atms-live-six-nav .nav[data-nav="settings"]::after{content:none!important;display:none!important}
    `;document.head.appendChild(p26o);
  }
  if(!$('atmsLiveTargetP26PStyle')){
    const p26p=document.createElement('style');p26p.id='atmsLiveTargetP26PStyle';p26p.textContent=`
      /* P26P: mobile Zielbild-Höhen kompakter; Schriftgrößen aus P26K bleiben unverändert. */
      @media(max-width:430px){
        #liveDispositionView{padding-bottom:66px!important}
        #atmsLiveTargetTop{margin-bottom:8px!important}
        #atmsLiveTargetPositionInfo,#atmsLiveTargetRideControl{margin-bottom:9px!important}
        #atmsLiveTargetWarning{margin-bottom:3px!important}
        #atmsLiveTargetDemoBanner{margin-bottom:6px!important}
        .atms-live-target-position-head{min-height:32px!important;padding:7px 9px!important}
        .atms-live-target-position-body{min-height:102px!important;padding:8px!important}
        .atms-live-target-driver-rows{padding:3px 9px 5px!important}
        .atms-live-target-driver-rows>div{padding:4px 0!important}
        .atms-live-target-rides-head{padding:7px 9px!important}
        .atms-live-target-ride-row{padding:6px 4px!important}
        .atms-live-target-warning-main{padding:8px 10px!important}
        .atms-live-target-warning-text{margin:4px 0 6px!important}
        .atms-live-target-warning-details{padding:5px 8px!important}
        .atms-live-target-warning-facts{padding:5px 8px!important}
        .atms-live-target-warning-facts>div{padding:2px 0!important}
      }
    `;document.head.appendChild(p26p);
  }

  if(!$('atmsLiveTargetP26QStyle')){
    const p26q=document.createElement('style');p26q.id='atmsLiveTargetP26QStyle';p26q.textContent=`
      /* P26Q: maximale sichere Lesbarkeit nur für kleine/sekundäre Live-Dispo-Texte. */
      @media(max-width:720px) and (min-width:370px){
        .atms-live-target-sub{font-size:11px!important}
        .atms-live-target-settings{font-size:10.2px!important}
        .atms-live-target-meta{font-size:11.2px!important}
        .atms-live-target-threshold span{font-size:11.2px!important}
        .atms-live-target-tracking span{font-size:9.4px!important}.atms-live-target-tracking b{font-size:11.4px!important}
        .atms-live-target-mini-action{font-size:10.2px!important}
        .atms-live-target-position-head>b{font-size:13px!important}.atms-live-target-position-head button{font-size:10.2px!important}
        .atms-live-target-position-body span{font-size:11.2px!important}
        .atms-live-target-driver-rows span{font-size:9.4px!important}.atms-live-target-driver-rows b{font-size:11px!important}
        .atms-live-target-rides-head>b{font-size:12.8px!important}.atms-live-target-rides-head button{font-size:9.2px!important}
        .atms-live-target-ride-time span,.atms-live-target-ride-route span,.atms-live-target-ride-metric span{font-size:8.1px!important}
        .atms-live-target-ride-route b{font-size:9.2px!important}.atms-live-target-ride-metric b{font-size:9.2px!important}
        .atms-live-target-ride-status{font-size:7.9px!important}.atms-live-target-demo-warning-sent{font-size:6.9px!important}
        .atms-live-target-warning-text{font-size:10.4px!important}.atms-live-target-warning-details{font-size:10.2px!important}
        .atms-live-target-warning-facts span{font-size:8.7px!important}.atms-live-target-warning-facts b{font-size:9.9px!important}
      }
      @media(max-width:430px){
        .atms-live-target-connection{font-size:8px!important}
        #liveDispositionView[data-atms-p26g-demo="1"] #atmsLiveTargetDemoBanner{font-size:8.3px!important}
        #liveDispositionView[data-atms-p26g-demo="1"] #atmsLiveTargetDemoBanner .atms-live-target-demo-btn{font-size:8.5px!important}
      }
    `;document.head.appendChild(p26q);
  }
  if(!$('atmsLiveTargetP26RStyle')){
    const p26r=document.createElement('style');p26r.id='atmsLiveTargetP26RStyle';p26r.textContent=`
      /* P26R: Zielbild-Hauptansicht endet nach der Warnkarte; keine künstliche View-Mindesthöhe. */
      body.atms-live-target-active #liveDispositionView{min-height:0!important;height:auto!important}
      @media(max-width:430px){body.atms-live-target-active #liveDispositionView{padding-bottom:12px!important}}
    `;document.head.appendChild(p26r);
  }
  if(!$('atmsLiveTargetP26SStyle')){
    const p26s=document.createElement('style');p26s.id='atmsLiveTargetP26SStyle';p26s.textContent=`
      /* P26S: bestätigter visueller Balance-Pass; P26Q-Schrift bleibt unverändert. */
      @media(max-width:430px){
        body.atms-live-target-active #liveDispositionView{padding-bottom:4px!important}
        body.atms-live-target-active #atmsLiveTargetTop{margin-bottom:6px!important}
        body.atms-live-target-active #atmsLiveTargetPositionInfo{margin-bottom:8px!important}
        body.atms-live-target-active #atmsLiveTargetRideControl{margin-bottom:8px!important}
        body.atms-live-target-active #atmsLiveTargetWarning{margin-bottom:0!important}
        body.atms-live-target-active .atms-live-target-settings{min-width:86px!important;text-align:center!important}
      }
    `;document.head.appendChild(p26s);
  }
  restoreLiveBottomNavBaseline();
  const settingsNav=document.querySelector('.nav[data-nav="settings"]');
  if(settingsNav?.parentElement)settingsNav.parentElement.classList.add('atms-live-six-nav');
  restoreLiveBottomNavBaseline();
  positionLiveDispositionTargetDemoButton();
  const old=$('atmsLiveTargetSettingsBtn');
  if(old&&old.dataset.atmsP26fBound!=='1'){
    const fresh=old.cloneNode(true);fresh.dataset.atmsP26fBound='1';old.replaceWith(fresh);fresh.addEventListener('click',toggleLiveDispositionTargetAdvanced);
  }
  applyLiveDispositionTargetFinishCleanup();
  ensureLiveDispositionTargetDemo();
  applyLiveDispositionTargetDemo();
  renderLiveDispositionTargetAppBar();
}

function renderLiveDispositionTargetBlock(driver,settings,consent){
  const shell=ensureLiveDispositionTargetBlock();if(!shell)return;applyLiveDispositionTargetCleanup();
  const select=$('atmsLiveTargetDriverSelect'),drivers=liveDriverList();
  if(select){select.innerHTML=drivers.map(d=>`<option value="${esc(d.id)}" ${driver&&d.id===driver.id?'selected':''}>${d.favorite?'⭐ ':''}${esc(d.name)}${d.vehicle?' · '+esc(d.vehicle):''}</option>`).join('');if(driver)select.value=driver.id}
  const meta=$('atmsLiveTargetDriverMeta');if(meta){const driverId=String(driver?.staffId||driver?.driverId||driver?.employeeId||'').trim();meta.textContent=driver?(driverId||driver.vehicle||'Fahrzeug nicht hinterlegt'):'Kein Fahrer verfügbar'};
  const threshold=Math.max(1,Math.min(60,Number(settings?.warnThreshold||7)));const value=$('atmsLiveTargetThreshold'),note=$('atmsLiveTargetThresholdNote');if(value)value.textContent=String(threshold);if(note)note.textContent=`Warnung ab ${threshold} Minuten Verspätung`;
  const session=getDriverSession(),sessionMatches=Boolean(driver&&session.active&&session.driverId===driver.id),active=Boolean(sessionMatches&&consent),geo=active&&settings?.lastGeo&&settings.lastGeo.driverId===driver.id?settings.lastGeo:null;let state='● Zustimmung offen';
  if(active)state=geo?'● Tracking aktiv':'● Tracking gestartet · Position ausstehend';else if(consent)state='● Tracking freigegeben · Schicht nicht gestartet';
  const stateEl=$('atmsLiveTargetTrackingState');if(stateEl)stateEl.textContent=state;const strip=$('atmsLiveTargetTrackingStrip');if(strip)strip.className='atms-live-target-tracking '+(active?'is-active':consent?'is-wait':'');
  const last=$('atmsLiveTargetLastPosition');if(last)last.textContent=geo?atmsLiveTargetRelativeTime(geo.time):'–';const accuracy=$('atmsLiveTargetAccuracy');if(accuracy)accuracy.textContent=geo&&Number.isFinite(Number(geo.accuracy))?`${Math.round(Number(geo.accuracy))} m`:'–';
  const action=$('atmsLiveTargetTrackingAction'),revoke=$('atmsLiveTargetConsentRevoke');if(action){action.textContent=!consent?'✓ Zustimmung erteilen':active?'■ Schicht beenden':'▶ Schicht starten';action.disabled=!driver}
  if(revoke)revoke.hidden=!consent||sessionMatches;
}

function renderLiveDisposition(resetEta=true){showView('live');document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x.dataset.nav==='live'));const s=getLiveSettings(),drivers=liveDriverList(),sel=$('liveDriverSelect');if(!drivers.length){sel.innerHTML='<option value="">Keine Fahrer vorhanden</option>';renderLiveEmpty();return}if(!s.driverId||!drivers.some(d=>d.id===s.driverId))s.driverId=drivers[0].id;sel.innerHTML=drivers.map(d=>`<option value="${esc(d.id)}" ${d.id===s.driverId?'selected':''}>${d.favorite?'⭐ ':''}${esc(d.name)}${d.vehicle?' · '+esc(d.vehicle):''}</option>`).join('');sel.value=s.driverId;saveLiveSettings(s);renderNavigationSettings();const d=drivers.find(x=>x.id===s.driverId),consent=!!s.consentByDriver?.[s.driverId];renderLiveDispositionTargetBlock(d,s,consent);renderLiveDispositionTargetPositionInfo(d,s,consent);$('liveTrackingConsent').checked=consent;$('liveWarnThreshold').value=s.warnThreshold||7;const pastGrace=$('livePastRideGrace');if(pastGrace&&document.activeElement!==pastGrace)pastGrace.value=livePastRideGraceMinutes(s);$('liveTrackingState').textContent=consent?'Tracking freigegeben':'Zustimmung ausstehend';$('liveTrackingState').className='tracking-state '+(consent?'active':'wait');$('liveTrackingMeta').textContent=consent?'Zustimmung gespeichert. Die Position kann auf diesem Handy für die Routenprüfung ermittelt werden.':'Tracking wird erst nach eindeutiger Zustimmung aktiviert.';const tracked=drivers.filter(x=>s.consentByDriver?.[x.id]);$('liveSingleDriverNotice').textContent=tracked.length<=1?`Hinweis: Aktuell ist nur ${d.name} für Live-Disposition mit Freigabestatus erfasst. Ersatzfahrer werden zusätzlich gegen eigene offene Fahrten geprüft.`:`${tracked.length} Fahrer mit Freigabestatus erfasst. Ersatzfahrer werden zusätzlich gegen eigene offene Fahrten geprüft.`;const drides=ridesForLiveDriver(d.name),limit=liveExpanded?drides.length:4,threshold=Number(s.warnThreshold||7);renderLiveDispositionTargetRideControl(d,drides,threshold);$('liveTimeline').innerHTML=drides.length?drides.slice(0,limit).map((r,i)=>{const state=liveDispositionAssessment(r,threshold),cls=state.className||'';return `<div class="timeline-item ${cls}"><div class="timeline-top"><div><div class="timeline-time">${esc(effectiveTime(r)||'–')}</div><div class="timeline-route">${esc(r.pickup||'Start nicht verfügbar')} → ${esc(r.destination||'Ziel nicht verfügbar')}</div></div><span class="timeline-status">${i===0?'AKTUELL':i===1?'NÄCHSTE':i===2?'ÜBERNÄCHSTE':'GEPLANT'}</span></div><div class="timeline-sub">${esc(state.label)} · ${esc(r.flightNumber||r.id)}</div></div>`}).join(''):'<div class="live-empty">Keine offenen Fahrten für diesen Fahrer.</div>';$('liveMoreRidesBtn').style.display=drides.length>4?'block':'none';$('liveMoreRidesBtn').textContent=liveExpanded?'Weniger Fahrten anzeigen':'Weitere Fahrten anzeigen';const assessedRides=drides.map(r=>({ride:r,state:liveDispositionAssessment(r,threshold)})).filter(x=>x.state.hasDelayAssessment);const critical=(assessedRides.find(x=>Number(x.state.delay)>=threshold)||assessedRides.find(x=>Number(x.state.delay)>0))?.ride||null;renderLiveDispositionTargetWarning(d,drides,threshold);renderLiveDelayAndSolution(d,critical,drivers,drides,threshold,consent);renderRouteCheck(d,drides,threshold);renderDriverSessionCard();const routeRide=drides[0]||critical;const routeGeo=s.lastGeo&&s.lastGeo.driverId===d.id?s.lastGeo:null;const routeLabel=routeRide?routeLabelForRide(routeRide):'';$('liveMap').innerHTML=routeRide?`<b>${routeGeo?'Standort dieses Handys':esc(routePointsForRide(routeRide)[0]||routeRide.pickup||'Start')}</b><span>↓ Route mit allen Stopps</span><b>${esc(routeLabel)}</b><small>${routeGeo?'GPS-Standort → Abholort/Stopps → Ziel':'Ohne GPS startet die Route am ersten Abholort'} · Google Maps berechnet Navigation und Verkehr</small>`:'<span>Keine Route verfügbar</span>';$('liveOpenMapBtn').disabled=!routeRide;$('liveOpenMapBtn').dataset.rideId=routeRide?.id||'';$('liveLastUpdate').textContent=new Date().toLocaleTimeString('de-DE');$('liveSystemPill').textContent=consent?'● LIVE-BEREIT':'● ZUSTIMMUNG OFFEN';if(resetEta){const eta=$('liveEtaState');if(eta)eta.innerHTML=s.mapboxToken?(routeGeo?'<b>Live-ETA bereit.</b> Tippe auf „Live-ETA aktualisieren“.':'<b>Live-ETA wartet auf GPS.</b> Standort dieses Handys zuerst ermitteln.'):'<b>Live-ETA nicht eingerichtet.</b> Mapbox-Token unter Einstellungen → Navigation speichern.';}renderLiveLog();ensureLiveDispositionTargetFinish()}
function renderLiveEmpty(){$('liveTimeline').innerHTML='<div class="live-empty">Bitte zuerst Fahrer oder Fahrten anlegen.</div>';$('liveDelayContent').innerHTML='<div class="live-empty">Keine Prüfung möglich.</div>';$('liveSolutionContent').innerHTML='<div class="live-empty">Keine Lösung verfügbar.</div>';$('liveApplySolutionBtn').disabled=true;renderLiveLog()}
function renderLiveDelayAndSolution(driver,critical,drivers,drides,threshold,consent){liveSuggested=null;if(!critical){const assessed=(Array.isArray(drides)?drides:[]).map(r=>liveDispositionAssessment(r,threshold)).filter(x=>x.hasDelayAssessment);if(!assessed.length){$('liveDelayContent').innerHTML='<div class="tracking-state wait">Keine bestätigte LIVE-Zeit für Verspätungsprüfung</div><div class="live-meta">DISPO bleibt unverändert. Für die offenen Fahrten liegen keine bestätigten Estimated-/Actual-Zeiten oder belastbaren LIVE-Verzögerungsdaten vor.</div>';$('liveSolutionContent').innerHTML='<div class="live-empty">Keine automatische Umplanung: ohne bestätigte LIVE-Zeit ist keine LIVE-basierte Änderung ableitbar.</div>';$('liveApplySolutionBtn').disabled=true;return}const withoutLive=Math.max(0,(Array.isArray(drides)?drides.length:0)-assessed.length);$('liveDelayContent').innerHTML=`<div class="tracking-state active">Keine Verspätung erkannt</div><div class="live-meta">${assessed.length} Fahrt(en) mit bestätigten Live-Daten liegen unter der Warnschwelle${withoutLive?` · ${withoutLive} ohne bestätigte Verzögerungsbewertung`:''}.</div>`;$('liveSolutionContent').innerHTML='<div class="live-empty">Aktuell ist keine LIVE-basierte Umplanung erforderlich.</div>';$('liveApplySolutionBtn').disabled=true;return}const delay=liveDispositionAssessment(critical,threshold).delay??delayForRide(critical);$('liveDelayContent').innerHTML=`<div class="delay-number">+${delay} Minuten</div><b>${esc(critical.pickup)} → ${esc(critical.destination)}</b><div class="live-meta">Warnschwelle: ${threshold} Min. · Betroffene Fahrt: ${esc(critical.id)}</div>`;const settings=getLiveSettings(),candidateChecks=drivers.filter(x=>x.id!==driver.id).map(x=>({driver:x,availability:liveHandoverAvailability(x,settings)})),alternatives=candidateChecks.filter(x=>x.availability.available);if(!alternatives.length){const blocked=candidateChecks.filter(x=>x.driver?.active!==false&&settings.consentByDriver?.[x.driver.id]&&x.availability.openRides.length).length;prepareManualDispoMessage(driver,critical,delay,blocked);$('liveSolutionContent').innerHTML=`<div class="solution-title">Dispo manuell informieren</div><div class="solution-details">Kein anderer Fahrer ist anhand der aktuellen offenen Fahrten sicher frei.${blocked?` ${blocked} Fahrer mit Freigabe hat/haben bereits eigene offene Fahrt(en).`:''} Es wird kein Ersatzfahrer simuliert.<br><b>Eine Nachricht wurde unter „💬 Nachrichten“ vorbereitet.</b></div><button type="button" id="liveOpenPreparedMessageBtn" class="live-action" style="width:100%;margin-top:10px">💬 Nachricht öffnen</button>`;$('liveOpenPreparedMessageBtn')?.addEventListener('click',renderMessagesView);$('liveApplySolutionBtn').disabled=true;return}const alt=alternatives[0].driver;liveSuggested={rideId:critical.id,fromDriver:driver.name,toDriver:alt.name,toId:alt.id,delay,availabilityCheckedAt:new Date().toISOString()};$('liveSolutionContent').innerHTML=`<span class="solution-badge">BESTE VERFÜGBARE LÖSUNG</span><div class="solution-title">Fahrt an ${esc(alt.name)} anfragen</div><div class="solution-details">${esc(alt.name)} hat aktuell keine eigene offene Fahrt in der Live-Disposition.<br>Vor Ausführung werden Freigabe und Verfügbarkeit erneut geprüft.</div>`;$('liveApplySolutionBtn').disabled=!consent}
function applyLiveSolution(){if(!liveSuggested)return;const s=getLiveSettings(),drivers=liveDriverList(),target=drivers.find(x=>x.id===liveSuggested.toId),original=rides.find(r=>String(r.id)===String(liveSuggested.rideId));if(!original){showToast('Fahrt nicht gefunden','error');renderLiveDisposition();return}if(normKey(original.driver)!==normKey(liveSuggested.fromDriver)){addLiveEvent('Übergabe abgebrochen: Die betroffene Fahrt wurde inzwischen bereits anders zugeordnet.','warn');showToast('Fahrt inzwischen geändert','warn');renderLiveDisposition();return}const availability=liveHandoverAvailability(target,s);if(!availability.available){addLiveEvent(`Übergabe abgebrochen: ${target?.name||'Ersatzfahrer'} ist nicht sicher verfügbar. ${availability.reason}`,'warn');showToast('Ersatzfahrer nicht sicher frei','warn');renderLiveDisposition();return}if(!confirm(`Fahrt ${liveSuggested.rideId} an ${target.name} zur Übernahme zuweisen?`))return;original.driver=target.name;save();addLiveEvent(`Übergabe erfolgreich: Fahrt ${liveSuggested.rideId} von ${liveSuggested.fromDriver} an ${target.name}. Prognostizierte Verspätung: +${liveSuggested.delay} Min.`,'ok');showToast('Fahrt neu zugeordnet','ok');renderLiveDisposition()}
function initLiveDisposition(){bindClick('liveEtaRefreshBtn',refreshLiveEta);bindClick('liveShiftToggleBtn',toggleDriverShift);bindClick('liveModeStandard',()=>setLiveMode('standard'));bindClick('liveModeRoute',()=>setLiveMode('route'));bindClick('liveGetPositionBtn',requestLivePosition);const sel=$('liveDriverSelect');if(sel)sel.addEventListener('change',e=>{const activeSession=getDriverSession();if(activeSession.active&&e.target.value!==activeSession.driverId){showToast(`Schicht von ${activeSession.driverName} zuerst beenden`,'warn');e.target.value=activeSession.driverId;return}const s=getLiveSettings();s.driverId=e.target.value;saveLiveSettings(s);const d=liveDriverList().find(x=>x.id===s.driverId);addLiveEvent(`Fahrer für die Routenprüfung ausgewählt: ${d?.name||'unbekannt'}. Standort dieses Handys muss für diesen Fahrer bestätigt werden.`);const btn=$('liveGetPositionBtn');if(btn)btn.textContent='📍 Standort dieses Handys verwenden';renderLiveDisposition()});const consent=$('liveTrackingConsent');if(consent)consent.addEventListener('change',e=>{const s=getLiveSettings();if(!s.consentByDriver)s.consentByDriver={};s.consentByDriver[s.driverId]=e.target.checked;saveLiveSettings(s);addLiveEvent(`${e.target.checked?'Trackingfreigabe erteilt':'Trackingfreigabe beendet'} für ${liveDriverList().find(x=>x.id===s.driverId)?.name||'Fahrer'}.`);renderLiveDisposition()});bindClick('liveRefreshBtn',renderLiveDisposition);bindClick('liveMoreRidesBtn',()=>{liveExpanded=!liveExpanded;renderLiveDisposition()});bindClick('liveApplySolutionBtn',applyLiveSolution);const th=$('liveWarnThreshold');if(th)th.addEventListener('change',e=>{const s=getLiveSettings();s.warnThreshold=Math.max(1,Math.min(60,Number(e.target.value)||7));saveLiveSettings(s);renderLiveDisposition()});const pastGrace=$('livePastRideGrace');if(pastGrace)pastGrace.addEventListener('change',e=>{const s=getLiveSettings();s.pastRideGraceMinutes=Math.max(0,Math.min(1440,Math.round(Number(e.target.value)||0)));saveLiveSettings(s);showToast(`Vergangene Fahrten: ${s.pastRideGraceMinutes} Min. Nachlauf gespeichert`,'ok');renderLiveDisposition()});bindClick('liveOpenMapBtn',()=>{const id=$('liveOpenMapBtn').dataset.rideId,r=visualRides(rides).find(x=>String(x.id)===String(id));if(!r)return;const settings=getLiveSettings(),driver=liveDriverList().find(x=>x.id===settings.driverId),geo=settings.lastGeo&&driver&&settings.lastGeo.driverId===driver.id?settings.lastGeo:null,result=googleMapsRouteUrl(r,geo);if(result.missing?.length){showMissingRouteAddresses(result.missing);return}if(!result.url){showToast('Keine vollständige Route verfügbar','warn');return}window.open(result.url,'_blank')})}

function safeEl(id){return document.getElementById(id)}
function bindClick(id,handler){const el=safeEl(id);if(el)el.addEventListener('click',handler)}
function showAppError(error){
  console.error('ATMS Startfehler:',error);
  const box=safeEl('appError');
  if(box){box.hidden=false;box.textContent='ATMS-Fehler: '+(error&&error.message?error.message:String(error));}
}

// CORE-004M · 06.09.2026: Ergebnis der automatischen Flugprüfung dauerhaft sichtbar halten.
// Die bestehende kurze Toast-Meldung bleibt unverändert. Zusätzlich merkt ATMS das letzte
// aussagekräftige Ergebnis/den letzten technischen Fehler und zeigt ihn direkt unter dem
// Flugprüf-Status an, auch wenn plan-import.js danach den normalen Flugzähler neu rendert.
function initPersistentFlightCheckStatus(){
  const STORAGE_KEY='atms_flight_check_last_status_v1';
  const isImportant=text=>/fehlgeschlagen|fehler|nicht bereit|offline|benötigt internet|technisch|ki-anfrage|aktuell geprüft|automatisch übernommen|manuell prüfen/i.test(String(text||''));
  const paint=(box,text,at='')=>{
    if(!box||!text)return;
    const isError=/fehlgeschlagen|fehler|nicht bereit|offline|technisch|ki-anfrage/i.test(text);
    box.style.display='block';
    box.style.marginTop='10px';
    box.style.padding='10px 12px';
    box.style.borderRadius='10px';
    box.style.border=`1px solid ${isError?'rgba(255,113,137,.65)':'rgba(89,239,139,.5)'}`;
    box.style.background=isError?'rgba(95,20,36,.35)':'rgba(20,85,48,.28)';
    box.style.color=isError?'#ffd5dd':'#c9ffda';
    box.style.fontSize='12px';
    box.style.lineHeight='1.45';
    box.style.whiteSpace='pre-wrap';
    box.textContent=`Letztes Ergebnis${at?` · ${at}`:''}: ${text}`;
  };
  const attach=()=>{
    const source=document.getElementById('flightCheckStatus');
    if(!source||source.dataset.atmsPersistentWatched==='1')return false;
    source.dataset.atmsPersistentWatched='1';
    let box=document.getElementById('atmsPersistentFlightCheckStatus');
    if(!box){
      box=document.createElement('div');
      box.id='atmsPersistentFlightCheckStatus';
      box.style.display='none';
      source.insertAdjacentElement('afterend',box);
    }
    try{
      const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      if(saved?.text)paint(box,String(saved.text),String(saved.at||''));
    }catch(_){ }
    const remember=()=>{
      const value=String(source.textContent||'').trim();
      if(!value||!isImportant(value))return;
      const at=new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
      try{localStorage.setItem(STORAGE_KEY,JSON.stringify({text:value,at,createdAt:new Date().toISOString()}));}catch(_){ }
      paint(box,value,at);
    };
    new MutationObserver(remember).observe(source,{childList:true,subtree:true,characterData:true});
    remember();
    return true;
  };
  if(attach())return;
  const rootObserver=new MutationObserver(()=>{if(attach())rootObserver.disconnect()});
  rootObserver.observe(document.documentElement,{childList:true,subtree:true});
}

function initApp(){
  try{
    // CORE-005T 08.09.2026: verifizierte Flight-Cache-Eintraege redundant schuetzen und ggf. wiederherstellen.
    restoreMissingCriticalPersistence('startup');
    recoverVerifiedFlightCache();
    capturePersistenceSafety('startup');
    initPersistenceDurableShadow();
    initPersistentFlightCheckStatus();
    bindSettingsHubNavigation();
    installSettingsMobileNavigation();
    atmsInstallPrimaryBackNavigation();
    atmsInstallRidesHeader();
    setInterval(atmsPastClockTick,60000);
    bindClick('driverBtn',openDrivers);
    bindClick('cockpitDispatcherMessageBtn',openDispatcherMessage);
    bindClick('cockpitDriverMessageBtn',openDriverMessage);
    bindClick('infoStatusBtn',openInfoStatus);
    bindClick('addDriverContact',addDriverContact);
    const driverSearch=safeEl('driverContactSearch');if(driverSearch)driverSearch.addEventListener('input',renderDriverContactList);
    const showInactive=safeEl('driverShowInactive');if(showInactive)showInactive.addEventListener('change',renderDriverContactList);
    const dispatcherSelect=safeEl('cockpitDispatcherSelect');
    if(dispatcherSelect)dispatcherSelect.addEventListener('change',e=>setCurrentDispatcher(e.target.value));
    bindClick('saveInfoChatBtn',saveInfoChatSettings);bindClick('saveNavigationSettingsBtn',saveNavigationSettings);bindClick('testNavigationApiBtn',testNavigationApi);
    const infoChatType=$('infoChatType');
    if(infoChatType)infoChatType.addEventListener('change',renderInfoChatSettings);
    bindClick('addDispatcher',addDispatcher);
    bindClick('exportBackupBtn',exportAtmsBackup);
    bindClick('importBackupBtn',chooseBackupFile);
    bindClick('resetDataBtn',resetAtmsData);
    const backupInput=safeEl('backupFileInput');if(backupInput)backupInput.addEventListener('change',e=>{const f=e.target.files&&e.target.files[0];if(f)importAtmsBackup(f)});
    bindClick('closeDrivers',()=>atmsPrimaryCloseDriverDialog());
    const driverDialog=safeEl('driverDialog');
    if(driverDialog)driverDialog.addEventListener('click',e=>{if(e.target===driverDialog)atmsPrimaryCloseDriverDialog()});
    const driverSheet=safeEl('driverSheet');if(driverSheet)driverSheet.addEventListener('click',e=>e.stopPropagation());
    bindClick('backBtn',()=>render({restoreRidePosition:true}));
    bindClick('importBack',atmsPlanImportBack);
    bindClick('settingsBack',render);
    bindClick('plusBtn',()=>{atmsPrimaryVisit('import');document.querySelectorAll('.nav').forEach(x=>x.classList.remove('active'));showView('import');const back=$('importBack');if(back)back.setAttribute('aria-label','Zurück')});
    const search=safeEl('search');if(search)search.addEventListener('input',render);
    bindClick('mapBtn',()=>{if(active)openGoogleMapsRoute(active,null)});
    bindClick('doneBtn',()=>{if(!active)return;const ids=active._bundleMemberIds||[active.id];const allDone=ids.every(id=>done.has(id));ids.forEach(id=>allDone?done.delete(id):done.add(id));if(!save()){ids.forEach(id=>allDone?done.add(id):done.delete(id));return}openCockpit(active.id)});
    // CORE-007D8A1F1D8P2: Der moderne Planlisten-Import (plan-import.js) besitzt den
    // fileInput vollständig. Der alte JSON-Fallback darf dessen Auswahlstatus nicht mehr
    // überschreiben und darf Bild-/Excel-/CSV-Dateien nicht mehr als Text einlesen.
    const fileInput=safeEl('fileInput');
    if(fileInput)fileInput.addEventListener('change',async e=>{
      const f=e.target.files&&e.target.files[0];if(!f)return;
      if(typeof window.ATMSPlanImportHasStagedRides==='function')return;
      const name=String(f.name||'').toLowerCase();
      if(!name.endsWith('.json')){
        const status=safeEl('importStatus');
        if(status)status.textContent='Planlisten-Analysemodul nicht verfügbar. Bitte ATMS PRO vollständig neu laden.';
        return;
      }
      const jsonInput=safeEl('jsonInput');
      if(jsonInput)jsonInput.value=await f.text();
      const status=safeEl('importStatus');
      if(status)status.textContent='ATMS-JSON geladen. Jetzt „JSON laden“ tippen.';
    });
    bindClick('loadBtn',async()=>{try{const incoming=parse(safeEl('jsonInput').value);const result=await applyImportedRides(incoming);if(result.cancelled){safeEl('importStatus').textContent='Import abgebrochen. Die aktuelle Planliste bleibt erhalten.';return}safeEl('importStatus').textContent=!result.historySaved?`Fahrten gesichert (${result.count}), aber Planlistenhistorie nicht vollstaendig gespeichert. Bitte Backup erstellen.`:result.mode==='merge'?`Planlisten zusammengeführt: ${result.count} Fahrten.`:`Planliste ersetzt: ${result.count} Fahrten geladen.`;showToast(!result.historySaved?'Fahrten gesichert, Historie nicht gespeichert':result.mode==='merge'?`${result.count} Fahrten zusammengeführt`:`${result.count} Fahrten importiert`,result.historySaved?'ok':'warn');mode='rides';render()}catch(e){safeEl('importStatus').textContent='Fehler: '+e.message;showToast('Import wurde nicht als erfolgreich bestaetigt','warn')}});
    bindClick('clearBtn',()=>{safeEl('jsonInput').value='';rides=[];done.clear();save();safeEl('importStatus').textContent='Liste geleert.'});
    document.querySelectorAll('[data-nav]').forEach(b=>b.addEventListener('click',()=>{const n=b.dataset.nav;if(n!=='all')atmsPrimaryVisit(n);if(n==='settings'){document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x===b));atmsSettingsOpenHubFromPrimaryNav();safeEl('cockpitDispatcherSelect')?.addEventListener('change',e=>setCurrentDispatcher(e.target.value));
    safeEl('cockpitDriverSelect')?.addEventListener('change',renderDriverControls);
    try{loadWhatsappSettings();renderNavigationSettings();ensureAddressBookPanel();renderAddressBook();updateBackupUI()}catch(e){showAppError(e)}}else if(n==='messages'){renderMessagesView()}else if(n==='live'){renderLiveDisposition()}else if(n==='all'){openDrivers()}else{mode='rides';document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x===b));render({restoreRidePosition:true})}}));

    ensureMobileImportLayoutFix();
    ensureGeminiFlightPanel();
    ensureAddressBookPanel();
    ensureSettingsDriverPanel();
    ensureSettingsTransferPanel();
    ensureLiveFlightPanel();
    ensurePlanImportHistoryPanel();
    ensurePersistenceSafetyPanel();
    initPersistenceSafetyPanelObserver();
    try{
      rides=JSON.parse(localStorage.getItem(KEY)||'[]').map(norm);
      const p77LegacyCleanup=p77RunLegacyDedupeMigration(rides);
      rides=p77LegacyCleanup.rides;
      const overrideRestore=applyRideOverrides(rides);
      rides=overrideRestore.rides;
      const restored=applyFlightCacheToRides(rides);
      const correctedBorderTimes=p96RecoverPersistedBorderTimes(restored.rides);
      rides=correctedBorderTimes.rides;
      if(p77LegacyCleanup.changed||overrideRestore.changed||restored.changed||correctedBorderTimes.changed){
        if(!save())persistAudit('startup_ride_migration_unsaved',{p96:correctedBorderTimes.changed});
        else if(correctedBorderTimes.changed)persistAudit('legacy_ocr_time_corrected',{count:correctedBorderTimes.changed,from:'startup'});
      }
    }catch(e){rides=[]}
    try{collectAddressBookCandidates(rides,'address-candidates-startup-backfill')}
    catch(e){persistAudit('address_candidates_collect_failed',{phase:'startup-backfill',message:String(e?.message||e)})}
    // Phase 1 erst nach dem bestehenden lokalen Startup/Migrationspfad starten.
    void initStorageV2Phase1();
    scheduleLiveFreshnessRefresh();
    initLiveDisposition();
    if(getDriverSession().active)startLiveGeoWatch();
    try{loadWhatsappSettings();renderNavigationSettings();updateBackupUI()}catch(e){console.warn('Einstellungen konnten nicht geladen werden',e)}
    updateLiveFlightPanelContext();
    if(rides.length){const ji=safeEl('jsonInput');if(ji)ji.value=JSON.stringify({rides},null,2);render()}else{showView('import')}
  }catch(error){showAppError(error);try{showView('import')}catch(_){} }
}
window.addEventListener('error',e=>showAppError(e.error||e.message));
window.addEventListener('unhandledrejection',e=>showAppError(e.reason));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initApp);else initApp();

window.ATMSAddressBook={get:getAddressBook,render:renderAddressBook,find:findAddressBookEntry,candidates:getAddressCandidates,collectCandidates:collectAddressBookCandidates};
window.ATMSPersistenceDiagnosis=persistenceDiagnosis;window.ATMSStorageV2Diagnosis=storageV2Diagnosis;window.ATMSStorageV2Check=checkStorageV2Phase1;window.ATMSPersistenceSnapshot=capturePersistenceSafety;window.ATMSRestorePreviousPlanImport=restorePreviousPlanImport;window.ATMSP77LegacyDedupeStatus=p77LegacyDedupeStatus;window.ATMSP77LegacyDedupeRollback=p77LegacyDedupeRollback;window.applyImportedRides=applyImportedRides;window.showToast=showToast;window.render=render;

window.buildGeminiFlightPrompt=buildGeminiFlightPrompt;window.copyGeminiFlightPrompt=copyGeminiFlightPrompt;window.applyGeminiFlightResult=applyGeminiFlightResult;
window.buildLiveFlightPrompt=buildLiveFlightPrompt;window.copyLiveFlightPrompt=copyLiveFlightPrompt;window.applyLiveFlightResult=applyLiveFlightResult;
