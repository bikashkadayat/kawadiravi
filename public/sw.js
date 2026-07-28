/**
 * Minimal service worker: offline fallback only.
 *
 * Deliberately NOT a full caching layer. Rates change and a stale cached price
 * is worse than no page at all — someone turning up expecting yesterday's rate
 * is exactly the trust problem this site exists to solve. So:
 *
 *   - Navigations go to the network first.
 *   - If the network fails, we serve /offline.html.
 *   - Everything else (JS, CSS, images) is left to the browser's HTTP cache,
 *     which already handles Next.js's content-hashed assets correctly.
 *
 * Bump CACHE_VERSION to force old clients to drop the previous shell.
 */

const CACHE_VERSION = 'kawadirabi-v1';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll([OFFLINE_URL, '/icons/icon-192.png']))
      // Activate immediately rather than waiting for every tab to close.
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only page navigations get the offline treatment.
  if (request.mode !== 'navigate') return;

  event.respondWith(
    fetch(request).catch(async () => {
      const cache = await caches.open(CACHE_VERSION);
      const cached = await cache.match(OFFLINE_URL);
      return (
        cached ??
        new Response('Offline', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' },
        })
      );
    }),
  );
});
