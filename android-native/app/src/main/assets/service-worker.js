// CORE-007D8A1F1D8P1131 · 07.10.2026: cache refresh for Golden-Error follow-up; OCR integrity assets only.
// CORE-007D8A1F1D8P1121 · 06.10.2026: cache refresh for P112 Realgerät-Render-Fix; no data or LIVE semantics changed.
// CORE-007D8A1F1D8P112 · 06.10.2026: cache refresh for Driver-Cockpit extension; existing fail-closed LIVE/ETA semantics unchanged.
// CORE-007D8A1F1D8P111 · 06.10.2026: cache refresh for production Live-Cockpit target promotion; OCR/flight/import semantics unchanged.
// CORE-007D8A1F1D8P110 · 06.10.2026: cache refresh for Golden Error Pack bundled OCR/boundary fixes; production semantics remain fail-closed.
// CORE-007D8A1F1D8P1094 · 06.10.2026: cache refresh for the proven OCR image-pipeline transport fix; recognition/import semantics unchanged.
const CACHE_NAME = "atms-pro-pwa-2026-10-07-p1131-golden-error-fix";
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
  "./js/ocr-integrity-core.js?v=P1131",
  "./js/plan-import.js?v=P1131",
  "./js/pwa.js?v=CORE-004C",
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
          const freshPlanImport = await caches.match("./js/plan-import.js?v=P1131");
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
