// Service Worker - immer frische Inhalte laden, nie veraltete Version zeigen
const SW_VERSION = 'v3';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
  );
  self.clients.claim();
});
self.addEventListener('fetch', (event) => {
  // Board-Daten (Cloudflare Worker) und alle nicht-GET-Anfragen komplett unangetastet lassen -
  // der Service Worker darf sie weder abfangen noch zwischenspeichern. Vorher konnten
  // Lade-Anfragen ("action":"load") mit einer veralteten Antwort beantwortet werden, sodass das
  // Board alte Werte anzeigte, obwohl in der Datenbank längst die richtigen standen.
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.hostname.endsWith('workers.dev')) {
    return; // nicht abfangen - Browser macht die Anfrage ganz normal selbst
  }
  event.respondWith(
    fetch(event.request, { cache: 'no-store' }).catch(() => caches.match(event.request))
  );
});
