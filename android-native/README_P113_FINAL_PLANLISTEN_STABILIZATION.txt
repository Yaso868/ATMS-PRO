ATMS PRO – CORE-007D8A1F1D8P113
FINAL PLANLISTEN STABILIZATION
Date: 07.10.2026
Patch base (GitHub main): cc73597a9b146fb1d477aa22cdac3ee9ca3c9b19

Scope
-----
Plan-list / image OCR import only. No cockpit, live-dispatch, persistence, archive,
flight-source verification, messaging, or productive user-data logic is intentionally
changed by this patch.

Safety objective
----------------
CORRECT OR FAIL CLOSED. A structurally or semantically contradictory image import
must not be released as OK / ready for import.

General fixes
-------------
1. Repeated data geometry can restore a missing duplicate mirror-time header on
   short plans; two-row right-tail structural shifts are no longer excluded from
   detection.
2. Exact geometrical cell evidence is retained for critical fields before recovery.
3. Strict boundary-only clock cleanup handles table glyphs around otherwise complete
   clock tokens; embedded text is never guessed away.
4. Image OCR no longer invents company from customer/default fallback values.
5. Missing/invalid flight-time recovery uses only the exact mapped flight-time cell
   and requires two agreeing local reads.
6. Conflicting independent route/text OCR evidence either reaches strong consensus
   or becomes an import-blocking conflict instead of being silently discarded.
7. Short company-code correction is generic, current-plan-only, one-edit, unique,
   and requires at least three peer observations.
8. Missing-driver recovery first uses the shared column OCR, treats a geometrically
   empty driver cell as a valid empty state, and bounds the remaining targeted OCR
   work to tight shared-worker cell reads.
9. A final zero-silent-error gate compares final critical fields with exact mapped
   cell evidence and blocks structural/cross-field contradictions.

Golden Regression Pack
----------------------
Frozen pre-patch pack is stored under:
android-native/tools/fixtures/golden-regression/

It contains the byte-identical source images and the manifest that preserves the
confirmed error and control cases. Historical concrete values remain fixtures only;
no new test-specific flight, driver, route, filename, or row hardcodes were added to
production logic.

Local pre-upload checks
-----------------------
- node --check plan-import.js: PASS
- node --check ocr-integrity-core.js: PASS
- node --check ocr-regression-selftest.js: PASS
- node android-native/tools/ocr-regression-selftest.js: PASS
- Golden source-image SHA-256/byte-integrity: PASS (checked by P113 self-test)
- Patch-specific fixture-literal leak audit: PASS

Not yet claimed by this file
----------------------------
GitHub signed debug APK build and Android real-device acceptance are later gates and
must not be marked PASS until their actual results are observed.
