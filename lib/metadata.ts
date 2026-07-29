import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { routing } from '@/i18n/routing';
import { siteConfig } from '@/lib/site-config';
import type { Locale } from '@/types';

/** Page namespaces that have their own metadata block. */
export type MetaNamespace = 'home' | 'rates' | 'services' | 'about' | 'contact';

/**
 * Search keywords per page, per locale.
 *
 * These live here rather than in messages/*.json on purpose: they are not copy
 * a visitor ever reads, so mixing them into the translation files would invite
 * someone to "improve the wording" of a term that is deliberately spelled the
 * way people actually type it into Google ("kabadi" as well as "kawadi").
 *
 * `keywords` carries little direct ranking weight with Google today, but Bing
 * still reads it and it costs nothing. The real work for these terms is done by
 * the titles, the H1s and the JSON-LD.
 */
const KEYWORDS: Record<Locale, Record<MetaNamespace, string[]>> = {
  en: {
    home: [
      'kawadi',
      'ktm kawadi',
      'kathmandu kawadi',
      'kawadi kathmandu',
      'kabadi kathmandu',
      'scrap buyer kathmandu',
      'kawadi pickup nepal',
      'kabadi pickup nepal',
      'scrap pickup kathmandu',
      'sell scrap kathmandu',
      'recycling kathmandu',
    ],
    rates: [
      'kawadi rate kathmandu',
      'kawadi price nepal',
      'scrap rate kathmandu',
      'copper rate nepal',
      'brass rate nepal',
      'iron scrap rate kathmandu',
      'aluminium scrap rate nepal',
      'paper scrap rate kathmandu',
      'e-waste rate nepal',
    ],
    services: [
      'kawadi pickup kathmandu',
      'free scrap pickup kathmandu',
      'scrap collection kathmandu',
      'office scrap clearance kathmandu',
      'e-waste disposal kathmandu',
      'kabadi service nepal',
    ],
    about: [
      'ktm kawadi',
      'kawadi shop kathmandu',
      'trusted scrap buyer kathmandu',
      'recycling company nepal',
    ],
    contact: [
      'kawadi contact kathmandu',
      'book scrap pickup kathmandu',
      'kawadi phone number kathmandu',
      'scrap buyer near me kathmandu',
    ],
  },
  ne: {
    home: [
      'कवाडी',
      'काठमाडौं कवाडी',
      'कवाडी सेवा',
      'केटीएम कवाडी',
      'कवाडी पिकअप',
      'कवाडी खरिद',
      'स्क्र्याप काठमाडौं',
      'पुनःप्रयोग नेपाल',
    ],
    rates: [
      'कवाडी दर',
      'काठमाडौं कवाडी दर',
      'तामाको दर नेपाल',
      'फलामको दर काठमाडौं',
      'कागज कवाडी दर',
      'इ-वेस्ट दर नेपाल',
    ],
    services: [
      'कवाडी पिकअप सेवा',
      'निःशुल्क कवाडी संकलन',
      'काठमाडौं कवाडी सेवा',
      'कार्यालय कवाडी सरसफाइ',
      'इ-वेस्ट व्यवस्थापन काठमाडौं',
    ],
    about: ['केटीएम कवाडी', 'काठमाडौं कवाडी पसल', 'भरपर्दो कवाडी खरिदकर्ता'],
    contact: ['कवाडी सम्पर्क', 'कवाडी पिकअप बुक', 'कवाडी फोन नम्बर काठमाडौं'],
  },
};

/**
 * Facebook understands only a fixed list of `og:locale` values, and `en_NP`
 * — which this site used to emit — is not on it; an unknown locale is treated
 * as none at all. `en_US` is the correct wire value for the English pages. The
 * actual content language is still declared accurately by `<html lang>` and by
 * the hreflang alternates, which is what search engines read.
 */
export function ogLocale(locale: string): string {
  return locale === 'ne' ? 'ne_NP' : 'en_US';
}

/** Every locale except the active one, in `og:locale:alternate` form. */
export function ogAlternateLocales(locale: string): string[] {
  return routing.locales.filter((alt) => alt !== locale).map(ogLocale);
}

/** Keywords for one page in one locale. */
export function keywordsFor(
  locale: string,
  namespace: MetaNamespace,
): string[] {
  const table = KEYWORDS[locale as Locale] ?? KEYWORDS.en;
  return table[namespace];
}

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
  namespace: MetaNamespace,
  path: string,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `meta.${namespace}` });

  const title = t('title');
  const description = t('description');
  const url = `/${locale}${path}`;
  const ogImage = `/images/og-${locale}.png`;

  return {
    /**
     * `absolute` rather than a bare string: the locale layout declares the
     * template `%s · KTM Kawadi`, and these titles already end in "| KTM
     * Kawadi". Without `absolute` every inner page would name the brand twice
     * and push the useful words past the ~60 characters Google shows.
     */
    title: { absolute: title },
    description,
    keywords: keywordsFor(locale, namespace),
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
      locale: ogLocale(locale),
      // Tells Facebook the same page exists in the other language, which is
      // what makes it serve the right card to a Nepali-locale reader.
      alternateLocale: ogAlternateLocales(locale),
      // Describing the card in the page's own words beats repeating the brand
      // name — this alt is what a screen reader announces on a shared link.
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}
