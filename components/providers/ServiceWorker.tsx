'use client';

import { useEffect } from 'react';

/**
 * Registers the offline-fallback service worker.
 *
 * Registration is deferred until after `load` so it never competes with the
 * first paint or the hero image for bandwidth — the SW only matters on a
 * *later* visit, so there is nothing to gain from racing it early.
 *
 * Skipped entirely in development: a stale SW is a notorious source of
 * "why is my change not showing" confusion during local work.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== 'production' ||
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator)
    ) {
      return;
    }

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // A failed registration must never break the page: the site works
        // perfectly well without an offline fallback.
      });
    };

    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register);
      return () => window.removeEventListener('load', register);
    }
  }, []);

  return null;
}
