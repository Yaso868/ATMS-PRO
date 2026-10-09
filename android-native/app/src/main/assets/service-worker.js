// CORE-007D8A1F1D8P11422 · 09.10.2026: Separate vehicle/person preview and no false duplicate warning for different vehicle/person bookings.
// CORE-007D8A1F1D8P11418 · 09.10.2026: Datepicker fallback, heading-before-filename, manual-priority and conflict auto-import gate.
// CORE-007D8A1F1D8P11416 · 08.10.2026: Confirmed blank driver cells remain unassigned, recover names from exact same-cell OCR, ambiguous driver evidence fails closed.
// CORE-007D8A1F1D8P11415 · 08.10.2026: Strict headerless boundary-time admission uses the already audited edge-only clock parser; ambiguous core fields remain fail-closed.
// CORE-007D8A1F1D8P11414 · 08.10.2026: Preserve headerless rejection diagnostics and never display unmeasured counts as zero. Fail-closed unchanged.
// CORE-007D8A1F1D8P11414 · 08.10.2026: headerless flight admission-gate source tracing; diagnostic-only with unchanged fail-closed decisions and synchronized cache generation.
// CORE-007D8A1F1D8P11411 · 08.10.2026 bounded company cell-tail source replay.
// CORE-007D8A1F1D8P1148 · 08.10.2026: immutable primary OCR provenance, synchronized asset cache for the protected P114.8 conflict gate.
// CORE-007D8A1F1D8P1147 · 08.10.2026: guarded already-correct primary company reconciliation; cache and offline runtime aligned.
// CORE-007D8A1F1D8P1146 · 08.10.2026: post-consensus company conflict reconciliation; runtime shell/cache generation aligned to P1146 so the repaired pipeline state cannot be shadowed by stale P1145 assets.
// CORE-007D8A1F1D8P1145 · 08.10.2026: deterministic company-boundary classification; runtime shell/cache generation aligned to P1145 so the new fail-closed company conflict semantics cannot be shadowed by stale P1144 assets.
// CORE-007D8A1F1D8P1144 · 08.10.2026: runtime asset alignment; index, PWA bootstrap, service worker cache and OCR/import asset queries share one P1144 generation while OCR semantics remain unchanged from P1143.
// CORE-007D8A1F1D8P1143 · 07.10.2026: cache refresh for realstate source-truth normalization; full-cell company candidates normalize isolated table rules before consensus and internal delimiter loss remains gated by strong primary plus repeated peers.
// CORE-007D8A1F1D8P1142 · 07.10.2026: cache refresh for company boundary source-truth veto; two agreeing source views may reject only isolated table-rule glyph noise or exactly one missing internal company delimiter while semantic conflicts remain fail-closed.
// CORE-007D8A1F1D8P1141 · 07.10.2026: cache refresh for primary source-truth veto; two agreeing bounded source views may reject only proven secondary edge truncation/table-rule noise while semantic conflicts remain fail-closed.
// CORE-007D8A1F1D8P1140 · 07.10.2026: cache refresh for bounded edge-expanded source-truth recovery; hyphenated company right-edge loss and single-token flight-location edge clipping require two agreeing source views and semantic conflicts stay fail-closed.
// CORE-007D8A1F1D8P1139 · 07.10.2026: cache refresh for source-truth full-cell edge consensus; silent company/location edge loss requires two agreeing full-cell modes and remains fail-closed on semantic conflict.
// CORE-007D8A1F1D8P1138 · 07.10.2026: cache refresh for bounded text-edge integrity adjudication after P113.7 mirror-schema recovery; strong primary evidence may veto only narrowly proven edge degradation and semantic conflicts remain fail-closed.
// CORE-007D8A1F1D8P1137 · 07.10.2026: cache refresh for mirror-schema integrity, row-aligned middle-time geometry, bounded OCR edge adjudication, and cancellation row-color corroboration; fail-closed remains mandatory.
// CORE-007D8A1F1D8P1136 · 07.10.2026: cache refresh for row-aligned time geometry recovery and time-only raw-word replay; fail-closed remains mandatory.
// CORE-007D8A1F1D8P1135 · 07.10.2026: cache refresh for header/time geometry recovery; only strong repeated raw clock evidence between Preis and Von may restore a missing primary ride-time anchor.
// CORE-007D8A1F1D8P1134 · 07.10.2026: cache refresh for bounded edge-glyph adjudication; exact-cell evidence remains fail-closed on competing batch/core evidence.
// CORE-007D8A1F1D8P11331 · 07.10.2026: cache refresh for P113.3.1 runtime-scope repair and mandatory executable plan-import runtime gate; GPT-Vision OCR semantics unchanged.
// CORE-007D8A1F1D8P1133 · 07.10.2026: cache refresh for GPT-Vision exact-cell/content-region replay and bounded consensus diagnostics; OCR integrity assets only.
// CORE-007D8A1F1D8P1132 · 07.10.2026: cache refresh for ChatGPT-like exact-cell evidence/multi-view consensus; OCR integrity assets only.
// CORE-007D8A1F1D8P1131 · 07.10.2026: cache refresh for Golden-Error follow-up; OCR integrity assets only.
// CORE-007D8A1F1D8P1121 · 06.10.2026: cache refresh for P112 Realgerät-Render-Fix; no data or LIVE semantics changed.
// CORE-007D8A1F1D8P112 · 06.10.2026: cache refresh for Driver-Cockpit extension; existing fail-closed LIVE/ETA semantics unchanged.
// CORE-007D8A1F1D8P111 · 06.10.2026: cache refresh for production Live-Cockpit target promotion; OCR/flight/import semantics unchanged.
// CORE-007D8A1F1D8P110 · 06.10.2026: cache refresh for Golden Error Pack bundled OCR/boundary fixes; production semantics remain fail-closed.
// CORE-007D8A1F1D8P1094 · 06.10.2026: cache refresh for the proven OCR image-pipeline transport fix; recognition/import semantics unchanged.
const CACHE_NAME = "atms-pro-pwa-2026-10-09-p11422-safe-flight-preview";
// CORE-006E · 09.09.2026:
// Lokale JS-Dateien werden online bewusst ohne HTTP-/Browser-Zwischencache geladen.
// Dadurch greifen neue ATMS-Patches sofort, auch wenn index.html noch ältere ?v=-Werte
// verwendet. Die erfolgreiche Antwort wird weiterhin im PWA-Cache gespeichert,
// sodass der Offline-Fallback erhalten bleibt.
//
// CORE-004E · 05.09.2026:
// Asset-Fehler erhalten nie mehr index.html als JS/CSS-Ersatz. Offline-Fallback auf
// index.html gilt ausschließlich für Navigation.
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/main.css",
  "./js/app.js?v=P1121",
  "./js/flight-engine.js?v=CORE-004C",
  "./js/ocr-integrity-core.js?v=P11422",
  "./js/plan-import.js?v=P11422",
  "./js/pwa.js?v=P11422",
  "./js/firebase-ai.js?v=CORE-004D",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith((async () => {
    try {
      const url = new URL(event.request.url);
      const localJs = url.origin === self.location.origin && /\/js\/[^/]+\.js$/.test(url.pathname);

      // CORE-006E: Bei lokalem JS Browser-/HTTP-Cache umgehen.
      // Der Service-Worker-Cache bleibt ausschließlich als Offline-Fallback bestehen.
      const networkRequest = localJs
        ? new Request(event.request, { cache: "no-store" })
        : event.request;

      const response = await fetch(networkRequest);

      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      }

      return response;
    } catch (_) {
      const cached = await caches.match(event.request);
      if (cached) return cached;

      // Kompatibilitäts-Fallback: Falls index.html noch die alte Query-Version
      // anfordert, kann offline die vorab gecachte CORE-006D-Datei verwendet werden.
      try {
        const url = new URL(event.request.url);
        if (url.origin === self.location.origin && /\/js\/plan-import\.js$/.test(url.pathname)) {
          const freshPlanImport = await caches.match("./js/plan-import.js?v=P11422");
          if (freshPlanImport) return freshPlanImport;
        }
      } catch (_) {}

      if (event.request.mode === "navigate") {
        return (await caches.match("./index.html")) || Response.error();
      }
      return Response.error();
    }
  })());
});
