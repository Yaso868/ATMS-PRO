ATMS PRO · CORE-007D8A1F1D8P1139
P113.9 · SOURCE-TRUTH EDGE INTEGRITY
Date: 07.10.2026

PURPOSE
-------
P113.8 reached a clean 12/12, 0-hint, 0-error real-device result on WA0014,
but source comparison still found two silent text mismatches before the list was
automatically imported: a hyphenated company code was shortened at the right
edge and a single-token flight location remained clipped at the left edge.

P113.9 adds a separate source-truth full-cell evidence family for exactly these
bounded edge-loss classes. It does not hardcode a filename, company, location,
route, flight number, driver, or ride time.

PRODUCTION RULES
----------------
1. Source-truth full-cell evidence:
   The complete original target cell is OCR-read in two independent page-
   segmentation modes. A candidate is usable only when both modes agree.

2. Geometry gate:
   The source-truth crop must contain the complete target cell, must not include
   a neighboring column, and must not itself be clipped at the left or right
   edge. A literal vertical table rule at the extreme company-cell edge may be
   discarded as geometry noise; letters, digits and delimiters are preserved.

3. Company preservation:
   A longer delimiter-bearing company code may defeat a clipped secondary OCR
   only when the two source-truth full-cell modes support the current source
   value and the same plan provides independent peer support. Semantic changes
   remain unresolved/fail-closed.

4. Flight-location recovery:
   An existing single-token location may be replaced by the source-truth value
   only when the agreed candidate is a strict left/right extension of 1-2 glyphs.
   Internal substitutions, unrelated words, one-view evidence and ties are
   rejected.

5. Zero-silent-error policy:
   The source-truth family is narrow and additive. It does not relax any
   existing P113/P113.4/P113.6/P113.7/P113.8 conflict gates. Unresolved evidence
   remains blocking rather than silently green.

CONFIRMED P113.8 REAL-DEVICE RESULT
----------------------------------
Installed version: CORE-007D8A1F1D8P1138
- 12 active rides
- 1 Storno row excluded
- time / timeMirror / flightTime structurally correct
- 23 automatic corrections
- UI reported 0 hints / 0 OCR-data errors
- silent company right-edge truncation remained
- silent flight-location left-edge clipping remained
- automatic import occurred despite those two source-visible mismatches
Result: STRUCTURAL PASS / SILENT-INTEGRITY FAIL

LOCAL-FIRST GATES
-----------------
- text-edge-source-truth-selftest-p1139.js
- text-edge-integrity-selftest-p1138.js
- mirror-schema-integrity-selftest-p1137.js
- header-time-integration-selftest-p1136.js
- ocr-regression-selftest.js
- plan-import-runtime-smoke-p11331.js
- P113.3 golden image replay / P113.4 9MB regression
- real WA0014 full-cell crop proof for company and flight-location edge cases

SOURCE OF TRUTH
---------------
Fresh GitHub main verification immediately before P113.9 production packaging:
- main HEAD: 476cb3a
- parent: 2c4234a
- commit: Apply validated ATMS patch: ATMS_PRO_CORE-P1138_TEXT_EDGE_INTEGRITY
- GitHub checks shown: 3/3

The local application base is the previously validated P113.8 installer-overlay
source tree. The observed P113.8 installer completion changed exactly the patch
payload plus removal of the uploaded ZIP; the current GitHub main lineage above
was freshly verified and no SHA was guessed.

REAL-DEVICE STATUS
------------------
P113.9 real-device proof pending. WA0014 must not be imported again during the
proof run because P113.8 already auto-imported its 12 active rides.
