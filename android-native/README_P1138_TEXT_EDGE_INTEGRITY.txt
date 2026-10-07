ATMS PRO · CORE-007D8A1F1D8P1138
P113.8 · TEXT-EDGE INTEGRITY
Date: 07.10.2026

PURPOSE
-------
P113.7 fixed the WA0014 structural 14-column compression on the real device:
time, timeMirror and flightTime were separated, the Storno row was excluded,
and mirror-time prefixes no longer contaminated flight numbers. The same run
then exposed four remaining text-integrity classes: repeated terminal-punctuation
secondary OCR against strong customer text, hyphenated company-code edge
truncation, later secondary route edge clipping, and a left-clipped single-token
flight location.

P113.8 addresses those classes with bounded evidence rules. It does not weaken
the general conflict gates and does not hardcode a filename, company, customer,
route, location, driver, flight number, or ride time.

PRODUCTION RULES
----------------
1. Customer/company secondary edge noise:
   A strong exact primary raw-cell value may veto a secondary alternative only
   when the disagreement is either one extreme-edge punctuation substitution or
   strict 1-2 character edge truncation of a delimiter-bearing short code. A
   same-plan primary peer is required. Two exact-cell views confirming the
   competing alternative cancel the veto.

2. Route edge preservation:
   Strong exact primary raw evidence may prevent later secondary OCR from
   replacing a complete multi-token route with a bounded left/right clipped
   variant. Semantic route changes remain fail-closed.

3. Single-token flight-location recovery:
   An already present clipped token may be restored only from a longer exact raw
   primary token with confidence >=80, exactly one OCR word, and only 1-2 missing
   edge characters. Internal substitutions and unrelated words are rejected.

REAL-DEVICE P113.7 RESULT
-------------------------
Version: CORE-007D8A1F1D8P1137
- 12 active rides detected
- 1 Storno row correctly excluded
- time / timeMirror / flightTime structurally separated
- flight numbers no longer mirror-time prefixed
- 8 OCR/data errors remained from repeated customer secondary punctuation noise
- one company value was over-corrected by edge truncation
- the previously known route/location left-edge clips remained visible
Result: STRUCTURAL PASS / INTEGRITY FAIL

LOCAL-FIRST GATES
-----------------
- text-edge-integrity-selftest-p1138.js
- mirror-schema-integrity-selftest-p1137.js
- header-time-integration-selftest-p1136.js
- ocr-regression-selftest.js
- plan-import-runtime-smoke-p11331.js
- P113.3 golden image replay / P113.4 9MB regression

SOURCE OF TRUTH
---------------
Fresh GitHub main verification immediately before P113.8 production packaging:
- main HEAD: 9430b5a
- parent: 4b87fde
- commit: Apply validated ATMS patch: ATMS_PRO_CORE-P1137_MIRROR_SCHEMA_INTEGRITY
- GitHub checks shown: 3/3

The local base is the previously verified P113.7 installer-overlay source tree
that produced this post-installer state; the freshly verified GitHub commit has
the exact expected installer completion lineage. No HEAD SHA was guessed.

REAL-DEVICE STATUS
------------------
P113.8 real-device proof pending. Import must remain blocked until the WA0014
replay confirms zero remaining OCR/data errors for these solved integrity cases.
