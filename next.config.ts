import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

/**
 * The plugin points next-intl at our per-request config so server components
 * can read messages without every page having to become a client component.
 */
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  /**
   * Static export for GitHub Pages: `next build` emits a plain ./out folder of
   * HTML/CSS/JS with no Node server.
   *
   * Consequences, all of which this project has been adjusted for:
   *  - Middleware cannot run, so `proxy.ts` was removed and `app/page.tsx`
   *    now performs the `/` → `/en` redirect statically.
   *  - No Image Optimization API (see `images.unoptimized` below).
   *  - No route handlers, ISR, `headers()` or `rewrites()`.
   */
  output: 'export',

  images: {
    // GitHub Pages serves static files only — there is no optimizer endpoint
    // to resolve /_next/image, so every <Image> must be emitted as-is.
    // This is why `formats: ['image/avif','image/webp']` was dropped: it only
    // applies to the optimizer, which no longer exists here.
    unoptimized: true,
  },

  /**
   * Emit every route as `<route>/index.html` instead of `<route>.html`.
   *
   * Without this, `/en` produced BOTH `out/en.html` and an `out/en/` directory
   * (holding rates/services/…) that had no `index.html` — so serving `/en`
   * depended on the host's extensionless-to-.html fallback, and a host that
   * prefers the directory would 404. With directory indexes there is exactly
   * one file per URL and no ambiguity on any static host.
   *
   * Canonicals stay slash-free (`/en/rates`); GitHub Pages resolves that
   * straight to `/en/rates/index.html`, so no redirect and no mismatch.
   */
  trailingSlash: true,

  // Fail the production build on type errors rather than shipping them.
  // Next 16 dropped the `eslint` config key along with `next lint`, so linting
  // is its own step (`npm run lint`) and CI runs it before `npm run build`.
  typescript: { ignoreBuildErrors: false },
};

export default withNextIntl(nextConfig);
