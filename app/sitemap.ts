import type { MetadataRoute } from 'next';

import { routing } from '@/i18n/routing';
import { siteConfig } from '@/lib/site-config';
import { getRatesUpdatedAt } from '@/lib/rates';

/**
 * Sitemap covering every route in both locales.
 *
 * Routes are listed once with their locale variants declared as `alternates`,
 * which is what tells Google the pages are translations of each other rather
 * than duplicate content competing for the same query.
 *
 * `/rates` carries the real `updatedAt` from data/rates.json, so editing a
 * price also signals a genuine content change — the other pages use the build
 * date, which is the honest answer for static marketing copy.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const buildDate = new Date();
  const ratesDate = new Date(getRatesUpdatedAt());

  const routes = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/rates', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/services', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/about', priority: 0.6, changeFrequency: 'yearly' as const },
    { path: '/contact', priority: 0.8, changeFrequency: 'monthly' as const },
  ];

  return routes.flatMap((route) =>
    routing.locales.map((locale) => ({
      url: `${base}/${locale}${route.path}`,
      lastModified: route.path === '/rates' ? ratesDate : buildDate,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((alt) => [alt, `${base}/${alt}${route.path}`]),
        ),
      },
    })),
  );
}
