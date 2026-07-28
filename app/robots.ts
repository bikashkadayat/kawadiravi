import type { MetadataRoute } from 'next';

import { siteConfig } from '@/lib/site-config';

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
