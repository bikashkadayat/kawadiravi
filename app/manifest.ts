import type { MetadataRoute } from 'next';

import { siteConfig } from '@/lib/site-config';

/**
 * PWA manifest.
 *
 * `start_url: '/en'` rather than '/' avoids the installed app opening on a
 * redirect — the middleware would bounce '/' to '/en' on every launch.
 *
 * Two icon entries per size with different `purpose` values: `any` keeps the
 * circular badge intact in contexts that show it as-is, while the `maskable`
 * variant has the brand-green bleed Android needs to crop it into a squircle
 * without clipping the arrowheads.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — Scrap Pickup & Best Rates in Kathmandu Valley`,
    short_name: siteConfig.shortName,
    description:
      'Sell your scrap for the best rate in Kathmandu Valley. Free pickup, honest weighing, cash on the spot.',
    start_url: '/en',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#106432',
    categories: ['business', 'utilities'],
    lang: 'en',
    dir: 'ltr',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-256.png',
        sizes: '256x256',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
