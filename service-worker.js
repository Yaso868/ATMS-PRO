const CACHE_NAME = "atms-pro-pwa-2026-08-12-core-003d";
// CORE-003D · 12.08.2026:
// CORE-003D: OCR-Randzeichen an Flugnummern werden sicher normalisiert; Cache-Version
// erhöht, damit plan-import.js sofort neu geladen wird.
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/main.css",
  "./js/app.js?v=CORE-003D",
  "./js/flight-engine.js?v=CORE-003D",
  "./js/plan-import.js?v=CORE-003D",
  "./js/pwa.js?v=CORE-003D",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", event => {
  if(event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request).then(response => {
      const copy=response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request).then(cached => cached || caches.match("./index.html")))
  );
});
