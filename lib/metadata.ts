import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { routing } from '@/i18n/routing';
import { siteConfig } from '@/lib/site-config';

/**
 * Builds the full metadata block for one page, in one locale.
 *
 * This exists because of a real trap in Next's metadata merging: setting only
 * `title`/`description` on a child page does NOT update the `openGraph` object
 * inherited from the layout. The child would keep the layout's og:title and
 * og:url, so every inner page shared on WhatsApp or Facebook would preview as
 * the homepage. Every page therefore builds its own complete OG/Twitter block
 * here rather than relying on inheritance.
 *
 * @param locale    Active locale.
 * @param namespace Message namespace under `meta` (e.g. 'rates').
 * @param path      Locale-agnostic path, '' for the homepage.
 */
export async function buildPageMetadata(
  locale: string,
  namespace: 'home' | 'rates' | 'services' | 'about' | 'contact',
  path: string,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `meta.${namespace}` });

  const title = t('title');
  const description = t('description');
  const url = `/${locale}${path}`;
  const ogImage = `/images/og-${locale}.png`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((alt) => [alt, `/${alt}${path}`]),
        ),
        'x-default': `/${routing.defaultLocale}${path}`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      title,
      description,
      url,
      locale: locale === 'ne' ? 'ne_NP' : 'en_NP',
      images: [
        { url: ogImage, width: 1200, height: 630, alt: siteConfig.name },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}
