import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

/**
 * Locale routing.
 *
 * Next 16 renamed the `middleware` file convention to `proxy` — same contract
 * (default export + `config`), new filename. next-intl still ships its handler
 * under `next-intl/middleware`, hence the import path below.
 *
 * With `localePrefix: 'always'`, this is what redirects `/` to `/en` and
 * resolves the active locale for every page request.
 */
export default createMiddleware(routing);

export const config = {
  /**
   * Run on every path except Next internals, the API surface, and anything
   * with a file extension (images, icons, manifest, sitemap, robots).
   */
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
