/**
 * ★ SINGLE SOURCE OF TRUTH for every contact detail on the site.
 *
 * Nothing else in the codebase may hard-code a phone number, WhatsApp number,
 * email address or social URL. When Bikash's details change, this file is the
 * only file that changes.
 *
 * STILL PLACEHOLDER — replace before launch:
 *   email, and every social `href` still '#'.
 * The phone / WhatsApp numbers below are the real ones.
 */

import type { SiteConfig } from '@/types';

export const siteConfig: SiteConfig = {
  name: 'KTM Kawadi',
  shortName: 'KTM Kawadi',
  domain: 'ktmkawadi.bikashkadayat.com.np',
  url:
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ktmkawadi.bikashkadayat.com.np',

  // --- Contact -------------------------------------------------------------
  /** E.164 with '+', used verbatim in `tel:` links. */
  phoneTel: '+9779823525098',
  /** Display-only formatting; never used to build a link. */
  phoneDisplay: '9823525098',
  /** Digits only, no '+' — this is what `wa.me/<number>` expects. */
  whatsapp: '9779823525098',
  /**
   * Default prefilled WhatsApp text.
   *
   * NEPALI, deliberately. Surfaces that know the active locale pass the
   * translated `floating.prefilledMessage` instead, so this string is only
   * reached from non-localised contexts — and the overwhelming majority of
   * people who message this business write in Nepali, so Nepali is the safer
   * default than English.
   *
   * `buildWhatsAppUrl` runs this through encodeURIComponent, which is what
   * keeps the Devanagari intact across the wa.me hand-off.
   */
  whatsappMessage:
    'नमस्ते! मलाई मेरो पुराना सामान (कवाडी) बेच्नु छ। कृपया पिकअपको लागि सम्पर्क गर्नुहोस्।',
  email: 'info@ktmkawadi.bikashkadayat.com.np',

  addressEn: 'Kathmandu, Bagmati Province, Nepal',
  addressNe: 'काठमाडौं, बागमती प्रदेश, नेपाल',
  /** Kathmandu centre — refine once the yard address is confirmed. */
  geo: { lat: 27.7172, lng: 85.324 },

  hours: [
    {
      days: [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
      ],
      opens: '07:00',
      closes: '19:00',
    },
    { days: ['Saturday'], opens: '08:00', closes: '17:00' },
  ],

  /**
   * Socials with href '#' are treated as "not configured" and are hidden by
   * the Footer rather than rendered as dead links.
   */
  socials: [
    { key: 'facebook', label: 'Facebook', href: '#' },
    { key: 'tiktok', label: 'TikTok', href: '#' },
    { key: 'whatsapp', label: 'WhatsApp', href: '#' },
    { key: 'instagram', label: 'Instagram', href: '#' },
    { key: 'youtube', label: 'YouTube', href: '#' },
  ],

  coverage: [
    { nameEn: 'Kathmandu', nameNe: 'काठमाडौं' },
    { nameEn: 'Lalitpur', nameNe: 'ललितपुर' },
    { nameEn: 'Bhaktapur', nameNe: 'भक्तपुर' },
    { nameEn: 'Kirtipur', nameNe: 'कीर्तिपुर' },
    { nameEn: 'Madhyapur Thimi', nameNe: 'मध्यपुर थिमी' },
    { nameEn: 'Tokha', nameNe: 'टोखा' },
    { nameEn: 'Budhanilkantha', nameNe: 'बुढानीलकण्ठ' },
    { nameEn: 'Chandragiri', nameNe: 'चन्द्रागिरी' },
    { nameEn: 'Gokarneshwor', nameNe: 'गोकर्णेश्वर' },
    { nameEn: 'Suryabinayak', nameNe: 'सूर्यविनायक' },
    { nameEn: 'Godawari', nameNe: 'गोदावरी' },
    { nameEn: 'Mahalaxmi', nameNe: 'महालक्ष्मी' },
  ],

  /** Schema.org priceRange. '$' signals an inexpensive service. */
  priceRange: '$',
};

/** `tel:` href built from the single source of truth. */
export const telHref = `tel:${siteConfig.phoneTel}`;

/**
 * Absolute URL for a site path, with the trailing slash `next.config.ts`
 * actually serves.
 *
 * This exists because the site used to disagree with itself: `trailingSlash:
 * true` makes Next emit `<link rel="canonical" href=".../en/">`, while the
 * sitemap and the JSON-LD built their URLs by hand and emitted `.../en`. To
 * Google those are two URLs, and a sitemap that lists a URL the canonical tag
 * points away from is a self-inflicted crawl problem. Every absolute URL on
 * this site now comes from here.
 *
 * @param path Locale-prefixed path such as '/en' or '/en/rates'. '' yields the
 *             bare origin with a trailing slash.
 */
export function absoluteUrl(path = ''): string {
  const clean = path.replace(/\/+$/, '');
  return `${siteConfig.url}${clean}/`;
}

/** True when a social link has a real destination configured. */
export function isConfiguredSocial(href: string): boolean {
  return href.trim() !== '' && href.trim() !== '#';
}

/** Socials that actually point somewhere. */
export function activeSocials() {
  return siteConfig.socials.filter((s) => isConfiguredSocial(s.href));
}
