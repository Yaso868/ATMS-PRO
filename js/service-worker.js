const CACHE_NAME = "atms-pro-pwa-2026-09-06-core-004o-cache-bypass";
// CORE-004O · 06.09.2026: Browser-HTTP-Cache fuer lokale ATMS-Dateien bewusst umgehen.
// Hintergrund: trotz neuem PWA-Cache lieferte Chrome weiter eine alte plan-import.js-Version.
// Keine Fahrten-, Preis-, Zeit- oder Fluglogik wird hier geändert.
//
// Firebase AI Logic wird als eigenes lokales Modul geladen; die externen Firebase-CDN-Module
// werden online per ESM nachgeladen. Offline bleibt die ATMS-App nutzbar, nur die aktuelle Flugprüfung ist dann nicht verfügbar.
//
// Asset-Fehler erhalten nie mehr index.html als JS/CSS-Ersatz. Offline-Fallback auf
// index.html gilt ausschließlich für Navigation.
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/main.css",
  "./js/app.js?v=CORE-004O",
  "./js/flight-engine.js?v=CORE-004O",
  "./js/plan-import.js?v=CORE-004O",
  "./js/pwa.js?v=CORE-004O",
  "./js/firebase-ai.js?v=CORE-004O",
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
  event.respondWith((async()=>{
    try{
      const url=new URL(event.request.url);
      const sameOrigin=url.origin===self.location.origin;
      const request=sameOrigin ? new Request(event.request,{cache:"no-store"}) : event.request;
      const response=await fetch(request);
      if(response && response.ok){
        const copy=response.clone();
        caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));
      }
      return response;
    }catch(_){
      const cached=await caches.match(event.request);
      if(cached)return cached;
      if(event.request.mode==="navigate"){
        return (await caches.match("./index.html")) || Response.error();
      }
      return Response.error();
    }
  })());
});
