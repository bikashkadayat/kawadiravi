import type { MetadataRoute } from 'next';

import { siteConfig } from '@/lib/site-config';

/**
 * Required by `output: "export"`: metadata routes are route handlers under the
 * hood, and Next refuses to export one unless it is explicitly declared static.
 * Nothing here reads a request, so forcing static is accurate, not a workaround.
 */
export const dynamic = 'force-static';


/**
 * robots.txt.
 *
 * Everything is crawlable — this is a marketing site with no private area and
 * nothing worth hiding. `/api/` is disallowed pre-emptively so that adding an
 * endpoint later does not silently expose it to crawlers.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
