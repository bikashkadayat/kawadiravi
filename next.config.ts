import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

/**
 * The plugin points next-intl at our per-request config so server components
 * can read messages without every page having to become a client component.
 */
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    // AVIF first, WebP fallback — real bytes saved for a mobile-heavy audience
    // on constrained Nepali mobile data.
    formats: ['image/avif', 'image/webp'],
  },
  // Fail the production build on type errors rather than shipping them.
  // Next 16 dropped the `eslint` config key along with `next lint`, so linting
  // is its own step (`npm run lint`) and CI runs it before `npm run build`.
  typescript: { ignoreBuildErrors: false },
};

export default withNextIntl(nextConfig);
