ATMS PRO · CORE-007D8A1F1D8P1145
P114.5 · DETERMINISTIC COMPANY BOUNDARY CLASSIFICATION
Date: 08.10.2026
Source-of-truth base: GitHub main cleanup commit 10c16d2 (parent 3c08b79)

Purpose
- Resolve the WA0001 false-positive company conflicts that survived P114.1-P114.4.
- Preserve the correct primary value when secondary OCR adds only extreme table-rule glyphs around a repeated hyphenated short company code.
- Reuse an already-recorded repeated-text consensus only for exactly one lost internal company delimiter (e.g. Get-E vs GetE), with >=3 consensus evidence and repeated same-plan primaries.

Fail-closed protections
- Semantic alternatives (Get-A, Get E, GetX, Get--E) stay conflicts.
- Internal table-rule glyphs stay conflicts.
- Too few peers / too little recorded consensus stay conflicts.
- Two exact cell views supporting the secondary value keep the conflict open.
- No company/flight/place/file-specific production hardcodes.

Runtime
- Visible core, index asset queries, PWA registration, service-worker cache/shell and fallback are aligned to P1145.

Validation gates
- P114.5 deterministic company-boundary self-test
- P114.5 runtime asset alignment self-test
- P114.3, P114.2, P114.1, P114.0, P113.9, P113.8, P113.7, P113.6 gates
- P113.3.1 runtime smoke
- full OCR Golden Regression Pack including P113.4 / 9MB
