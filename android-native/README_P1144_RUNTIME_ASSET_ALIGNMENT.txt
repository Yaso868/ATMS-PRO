ATMS PRO · CORE-007D8A1F1D8P1144
P114.4 · RUNTIME ASSET ALIGNMENT
Date: 08.10.2026
Verified source-of-truth before patch: GitHub main commit ed3278d (P114.3 installer cleanup), parent 15cb129, checks 3/3.

PURPOSE
P114.3 real-device WA0001 still reproduced the exact P114.2 company conflict set even though the P114.3 OCR self-test passed. The delivered P114.3 index.html still requested plan-import.js?v=P1142 and ocr-integrity-core.js?v=P1142 while the P114.3 service worker pre-cached P1143 queries. This patch aligns the runtime/bootstrap generation before any further OCR semantic change.

CHANGES
- Visible core version -> P1144; Last update -> 08.10.2026.
- index.html requests ocr-integrity-core.js, plan-import.js and pwa.js with ?v=P1144.
- service-worker cache generation -> P1144.
- service-worker shell/fallback requests the same P1144 generation.
- pwa.js registers service-worker.js?v=P1144 with updateViaCache:'none' so an installed native WebView does not keep a stale service-worker script generation.
- P114.3 OCR/import semantics are intentionally unchanged.
- New build gate runtime-asset-alignment-selftest-p1144.js includes stale-version negative controls.

FAIL-CLOSED / REGRESSION INTENT
Any stale plan-import/OCR/PWA query, stale service-worker cache/fallback, or stale service-worker registration must fail the P114.4 self-test. Existing Golden OCR, P113.4 9MB, P114.3 real-state source-truth and runtime smoke gates remain mandatory.
