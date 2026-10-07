ATMS PRO · CORE-007D8A1F1D8P1140
P114.0 · EDGE SOURCE-TRUTH INTEGRITY
Date: 07.10.2026

PURPOSE
-------
P113.9 real-device testing on IMG-20261007-WA0014.jpg reduced the remaining
integrity failures but did not fully close them:
- the source company value stayed correctly displayed as Get-E, but a clipped
  independent OCR candidate Get- still caused a false blocking conflict;
- the source flight location Amsterdam still remained silently left-clipped as
  msterdam with row status OK.

P114.0 addresses the generic edge-evidence causes. It does not hardcode the
source filename, company, city, route, flight number, driver, ride time or any
other production value.

PRODUCTION RULES
----------------
1. Company source-truth veto without unrelated peer dependency:
   When two independent full-cell source-truth OCR modes agree exactly on the
   current hyphenated company value, a competing secondary value may be ignored
   only if it is a strict 1-2 glyph left/right edge truncation of that source
   value. Semantic substitutions remain blocking.

2. Bounded edge-expanded source-truth family:
   A synthetic/schema cell boundary can sit a few pixels inside the printed
   flight-location cell on Android. P114.0 adds a small bounded expansion of the
   original source cell and reads it in two independent OCR modes.

3. Strict flight-location promotion:
   The expanded candidate is usable only when both modes agree and it is exactly
   a 1-2 glyph edge extension of the current single-token location. Internal
   edits, unrelated locations, adjacent time text, one-view evidence and split
   votes are rejected.

4. Correct-or-fail-closed:
   Existing P113/P113.4/P113.6/P113.7/P113.8/P113.9 gates remain intact. New
   evidence is narrow and additive; unresolved evidence remains blocking rather
   than silently accepted.

CONFIRMED P113.9 REAL-DEVICE RESULT
----------------------------------
Installed version: CORE-007D8A1F1D8P1139
- 12 active rides
- 1 Storno row excluded
- 0 hints
- 1 OCR/data error
- 22 automatic corrections
- company primary Get-E preserved, but Get- secondary OCR still blocked import
- flight location still displayed msterdam with row status OK
Result: FAIL – company false conflict + silent location edge loss

LOCAL-FIRST GATES
-----------------
- edge-source-truth-selftest-p1140.js
- text-edge-source-truth-selftest-p1139.js
- text-edge-integrity-selftest-p1138.js
- mirror-schema-integrity-selftest-p1137.js
- header-time-integration-selftest-p1136.js
- ocr-regression-selftest.js
- plan-import-runtime-smoke-p11331.js
- P113.3 golden image replay / P113.4 9MB regression
- real WA0014 cell-crop evidence used only as test ground truth, never production hardcoding

SOURCE OF TRUTH
---------------
Fresh GitHub main verification immediately before P114.0 production packaging:
- main HEAD: d977e3e
- parent: ac962b6
- commit: Apply validated ATMS patch: ATMS_PRO_CORE-P1139_SOURCE_TRUTH_EDGE_INTEGRITY
- GitHub checks shown: 3/3

The local application base is the validated P113.9 installer-overlay source tree.
The installer completion preserves the applied source payload and removes the
uploaded patch ZIP; the current GitHub lineage above was freshly verified and no
SHA was guessed.

REAL-DEVICE STATUS
------------------
P114.0 real-device proof pending. Do not treat the patch as final until the
WA0014 result table confirms the company and flight-location source values with
no silent mismatch.
