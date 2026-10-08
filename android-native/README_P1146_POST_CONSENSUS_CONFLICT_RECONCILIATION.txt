ATMS PRO · CORE-007D8A1F1D8P1146
P114.6 · POST-CONSENSUS CONFLICT RECONCILIATION
Date: 08.10.2026
Source-of-truth base: GitHub main cleanup commit fbcf6f7 (parent 92dffc3)

Purpose
- Repair the real pipeline-order failure confirmed on WA0001 after P114.5.
- Text-integrity OCR may flag a company conflict before repeated-text consistency later establishes the final company value.
- Immediately after repeated-text consistency, clear only a conflict that has become provably stale.

Allowed reconciliation
- Extreme table-rule boundary glyph noise around a repeated hyphenated short company code.
- Exactly one lost internal delimiter only when the existing repeated-text stage itself recorded from/to consensus with >=3 evidence.
- At least two same-plan peers must still match the final primary company value.

Fail-closed protections
- Semantic alternatives remain conflicts.
- Non-hyphenated company names do not use this reconciler.
- Internal table-rule glyphs remain conflicts.
- Too few peers / too little recorded consensus remain conflicts.
- Two exact cell views supporting the secondary delimiter-less value keep the conflict open.
- No plan filename, source row, company value, flight, place or customer is hardcoded in production logic.

Runtime
- Visible core, index asset queries, PWA registration, service-worker cache/shell and fallback are aligned to P1146.

Validation gates
- P114.6 post-consensus conflict reconciliation self-test with real pipeline ordering
- P114.6 runtime asset alignment self-test
- P114.5 deterministic company-boundary self-test
- P114.3, P114.2, P114.1, P114.0, P113.9, P113.8, P113.7, P113.6 gates
- P113.3.1 runtime smoke
- full OCR Golden Regression Pack including P113.4 / 9MB
