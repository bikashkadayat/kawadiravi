import type { MetadataRoute } from 'next';

import { siteConfig } from '@/lib/site-config';

/**
 * Required by `output: "export"`: metadata routes are route handlers under the
 * hood, and Next refuses to export one unless it is explicitly declared static.
 * Nothing here reads a request, so forcing static is accurate, not a workaround.
 */
export const dynamic = 'force-static';


/**
 * PWA manifest.
 *
 * `start_url: '/en'` rather than '/' avoids the installed app opening on a
 * redirect — the middleware would bounce '/' to '/en' on every launch.
 *
 * Two icon entries per size with different `purpose` values: `any` ships the
 * transparent mark, which sits correctly on whatever the surface behind it is,
 * while the `maskable` variant adds the full-bleed white plate Android needs to
 * crop it into a squircle without clipping the recycling arrowheads.
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
    // primary-600, the logo's arrow green. Must stay in step with the
    // themeColor in app/[locale]/layout.tsx.
    theme_color: '#087e2f',
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
