ATMS PRO · CORE-007D8A1F1D8P1142
P114.2 · COMPANY BOUNDARY SOURCE-TRUTH VETO
Date: 07.10.2026
Base: user-verified post-installer main HEAD e27e1c6 (P114.1), parent upload e554b6b, checks 3/3 green.

REAL-DEVICE INPUT
P114.1 passed IMG-20261007-WA0014.jpg on the real device: 12/12 active rides, one Storno excluded, 0 hints, 0 errors, Get-E/Amsterdam/Krakau correct, and no flight verification remained open.
The mandatory P113.4 regression image IMG-20261007-WA0001.jpg still produced 33/33 rides and preserved 9MB, but nine company rows were falsely blocked although the primary company remained Get-E. Secondary OCR variants were boundary-only forms (`| Get-E`, `| Get-E |`, `Get-E |`) plus one single internal delimiter loss (`GetE`).

PRODUCTION RULE
P114.2 never creates or replaces a company value. It only vetoes a weaker secondary company OCR conflict when two independent bounded source-truth views agree on the already-present primary value.
For a bounded hyphenated company probe, the secondary candidate may be ignored only when it differs by:
- isolated extreme-edge table-rule glyph noise, or
- exactly one missing internal delimiter from the set - _ / while every other character remains identical.
Semantic substitutions, whitespace replacements, more than one missing separator, weak evidence and disagreeing source views remain fail-closed.

LOCAL-FIRST GATES
- company-boundary-veto-selftest-p1142.js
- edge-primary-veto-selftest-p1141.js
- edge-source-truth-selftest-p1140.js
- text-edge-source-truth-selftest-p1139.js
- text-edge-integrity-selftest-p1138.js
- mirror-schema-integrity-selftest-p1137.js
- header-time-integration-selftest-p1136.js
- plan-import-runtime-smoke-p11331.js
- ocr-regression-selftest.js / complete Golden Regression Pack

No production hardcode for source image, row number, Get-E, Krakau, Amsterdam or 9MB.
Real-device proof remains pending.
