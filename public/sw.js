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

// Bumped on every change to offline.html or the icon it embeds — the activate
// handler deletes every cache whose key is not this one, so without a bump an
// earlier visitor keeps being served the previously cached shell forever.
//   v1 → v2: rename and new phone number.
//   v2 → v3: new logo artwork, and offline.html's gold CTA colour.
const CACHE_VERSION = 'ktm-kawadi-v3';
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

  // Page navigations fall back to the offline page.
  if (request.mode === 'navigate') {
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
    return;
  }

  /*
   * Anything else: network first, but fall back to the cache IF we precached
   * it. Without this the offline page rendered with a broken image — the logo
   * was sitting in the cache, but only navigations were being intercepted, so
   * the <img> request went to the dead network and failed.
   *
   * Still no opportunistic caching of other responses: a stale cached rate is
   * worse than no page at all.
   */
  event.respondWith(
    fetch(request).catch(async () => {
      const cached = await caches.match(request);
      return cached ?? Response.error();
    }),
  );
});
