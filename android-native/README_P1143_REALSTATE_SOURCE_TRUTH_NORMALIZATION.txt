ATMS PRO · CORE-007D8A1F1D8P1143
P114.3 · REALSTATE SOURCE-TRUTH NORMALIZATION
Date: 07.10.2026
Base: user-verified post-installer main HEAD 5475536 (P114.2), parent upload 86206f9, checks 3/3 green.

REAL-DEVICE INPUT
P114.2 remained a real-device FAIL on IMG-20261007-WA0001.jpg. The image still produced 33/33 rides, preserved the P113.4 edge-glyph Golden value 9MB and retained the three known hints, but the same nine company rows were falsely blocked:
- rows 12, 13, 14, 25, 28, 29, 31, 32: secondary OCR retained isolated table-rule glyphs around Get-E
- row 17: secondary OCR lost the single internal delimiter, Get-E -> GetE
No import occurred because the nine OCR/data conflicts remained fail-closed.

ROOT CAUSE
P114.2 normalized the secondary conflict candidate, but sourceTruthFullCellConsensus() compared raw full-cell source-truth candidates without the same bounded field normalization. Android full-cell OCR can therefore return values such as `| Get-E |`, which are visually/structurally the same company value but fail exact consensus against primary `Get-E`.
For the delimiter-loss case, source-truth may itself read `GetE`; therefore source-truth cannot prove `Get-E`. That case requires a separate strong-primary gate.

PRODUCTION RULES
1. source_truth_full_cell candidates are normalized through the existing field-aware sourceTruthCellCandidate() before consensus. For company/flightLocation this strips only isolated extreme-edge table-rule glyphs; it does not alter semantic letters, digits or internal delimiters.
2. A company candidate with exactly one missing internal delimiter from - _ / may be ignored only when:
   - the current primary is a bounded hyphenated company probe,
   - the primary raw OCR exactly supports the current primary at confidence >= 80,
   - at least two additional same-plan primary peers exist,
   - the secondary differs only by removal of that one internal delimiter,
   - there are not two exact independent cell-view votes for the secondary candidate.
3. Semantic substitutions, whitespace replacements, more than one delimiter loss, weak primary evidence, insufficient peers, competing evidence and unrelated text changes remain fail-closed.
4. This patch never creates or replaces company text; it only suppresses a narrowly proven weaker secondary conflict.

LOCAL-FIRST GATES
- company-boundary-realstate-selftest-p1143.js
- company-boundary-veto-selftest-p1142.js
- edge-primary-veto-selftest-p1141.js
- edge-source-truth-selftest-p1140.js
- text-edge-source-truth-selftest-p1139.js
- text-edge-integrity-selftest-p1138.js
- mirror-schema-integrity-selftest-p1137.js
- header-time-integration-selftest-p1136.js
- plan-import-runtime-smoke-p11331.js
- ocr-regression-selftest.js / complete Golden Regression Pack

No production hardcode for source image, row number, Get-E, 9MB, Krakau or Amsterdam.
Real-device proof remains pending.
