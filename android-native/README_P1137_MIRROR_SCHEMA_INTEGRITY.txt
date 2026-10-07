ATMS PRO · CORE-007D8A1F1D8P1137
P113.7 · MIRROR SCHEMA INTEGRITY
Date: 07.10.2026

PURPOSE
-------
P113.6 fixed the original WA0014 required-column failure: the first ride-time
column was recognized on the real device. The real-device result nevertheless
proved a second, independent structural failure: a 14-column table could be
compressed to 13 columns when the middle Uhrzeit/timeMirror header was degraded.
The resulting one-column shift could prepend mirror-time tails to arrival-flight
cells and mis-map the right half of the table.

P113.7 keeps the P113.6 row-aligned primary-time recovery and adds a bounded,
raw-word mirror-time geometry proof. The mirror column is reconstructed only
when repeated physical data rows provide a stable clock cluster between the
pickup/route region and vehicle/person/flight-time region. A real 13-column
no-mirror layout remains unchanged.

ADDITIONAL INTEGRITY FIXES
--------------------------
1. Company boundary noise:
   A single terminal table-edge glyph may be removed from an image-OCR company
   value only when a separately mapped adjacent timeMirror is a valid clock.

2. Route primary raw-edge recovery:
   A clipped edge of a multi-word route may be restored only from the exact
   primary raw cell with strong OCR confidence and explicit edge-degradation
   evidence.

3. Secondary route OCR adjudication:
   A weak right-edge truncation or one extreme-edge glyph disagreement may be
   prevented from blocking a strong repeated primary route only with strong raw
   primary evidence, same-plan peer support, and no unanimous exact-cell support
   for the competing alternative. Semantic conflicts remain fail-closed.

4. Cancellation rows:
   The historical two-text-signal cancellation path remains. In addition, an
   exact cancellation marker in the driver column may be corroborated by the
   already sampled warm-red source-row color. Color alone never cancels a row.

SAFETY / FAIL-CLOSED
--------------------
- No source filename, hotel, flight number, route, company, driver, or concrete
  ride time is hardcoded in production logic.
- Weak row evidence is rejected.
- Competing stable mirror-time clusters are rejected.
- No-mirror layouts do not get a synthetic mirror column.
- A secondary route alternative confirmed by both exact-cell views is not
  suppressed.
- Single-word route edge changes are not promoted by the new raw-edge gate.
- Red row color alone never marks a ride cancelled.
- Existing P113.4 edge-glyph / 9MB behavior remains protected by regression.

REAL-DEVICE INPUT THAT MOTIVATED THIS PATCH
-------------------------------------------
P113.6 real-device diagnostic showed boundaries=14 (13 data columns) and mapping:
  time=1, pickup=2, destination=3, arrivalFlight=6, departureFlight=7,
  flightTime=10, driver=12
for a visible 14-column price layout with a middle Uhrzeit column. The original
required-time failure was gone, but the missing mirror column shifted all later
semantics. This patch targets that structural class, not one concrete plan list.

LOCAL GATES
-----------
- mirror-schema-integrity-selftest-p1137.js
- header-time-integration-selftest-p1136.js
- ocr-regression-selftest.js
- plan-import-runtime-smoke-p11331.js
- P113.3 golden image replay / P113.4 9MB regression where available

SOURCE-OF-TRUTH NOTE
--------------------
Fresh GitHub main verification immediately before the final production package:
- main HEAD: 49c7fa2
- parent: 1232898
- commit: Apply validated ATMS patch: ATMS_PRO_CORE-P1136_ROW_ALIGNED_TIME_GEOMETRY
- GitHub checks shown: 3/3

P113.7 is based on the validated P113.6 source state represented by that installer
completion. No HEAD SHA was guessed.
