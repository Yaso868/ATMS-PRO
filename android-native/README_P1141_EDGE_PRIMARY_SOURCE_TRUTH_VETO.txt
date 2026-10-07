ATMS PRO · CORE-007D8A1F1D8P1141
P114.1 · EDGE PRIMARY SOURCE-TRUTH VETO
Date: 07.10.2026
Base: user-verified post-installer main HEAD 82cf700 (P114.0), parent upload aa32d28.

REAL-DEVICE INPUT
P114.0 restored the correct primary values on IMG-20261007-WA0014.jpg but still blocked four rows on weaker independent OCR:
- source rows 5 and 6: Krakau vs secondary `Krakau |`
- source row 12: Get-E vs secondary `Get-`
- source row 14: Amsterdam vs secondary `msterdam`
All four primary values were already correct; the remaining defect was false-positive blocking.

PRODUCTION RULE
P114.1 never creates a new semantic value. It can only veto a weaker secondary OCR conflict when two independent bounded source-truth cell views agree on the current primary value.
- company: current value must be a bounded hyphenated probe and secondary must be a strict 1-2 glyph edge truncation;
- flightLocation: secondary must be a strict 1-2 glyph edge truncation or differ only by an isolated extreme-edge table-rule glyph.
Any semantic/internal substitution, weak evidence, one-view evidence or disagreeing source views stays fail-closed.

LOCAL-FIRST GATES
- edge-primary-veto-selftest-p1141.js
- edge-source-truth-selftest-p1140.js
- text-edge-source-truth-selftest-p1139.js
- text-edge-integrity-selftest-p1138.js
- mirror-schema-integrity-selftest-p1137.js
- header-time-integration-selftest-p1136.js
- plan-import-runtime-smoke-p11331.js
- ocr-regression-selftest.js / complete Golden Regression Pack

No production hardcode for image name, row number, Krakau, Get-E or Amsterdam.
Real-device proof remains pending.
