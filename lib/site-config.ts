/**
 * ★ SINGLE SOURCE OF TRUTH for every contact detail on the site.
 *
 * Nothing else in the codebase may hard-code a phone number, WhatsApp number,
 * email address or social URL. When Bikash's details change, this file is the
 * only file that changes.
 *
 * PLACEHOLDERS — replace before launch:
 *   phone / phoneDisplay / whatsapp / email, and every social `href` still '#'.
 */

import type { SiteConfig } from '@/types';

export const siteConfig: SiteConfig = {
  name: 'KawadiRabi',
  shortName: 'KawadiRabi',
  domain: 'kawadirabi.bikashkadayat.com.np',
  url:
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kawadirabi.bikashkadayat.com.np',

  // --- Contact (PLACEHOLDER VALUES) ---------------------------------------
  /** E.164 with '+', used verbatim in `tel:` links. */
  phone: '+9779800000000',
  /** Display-only formatting; never used to build a link. */
  phoneDisplay: '+977 980-000-0000',
  /** Digits only, no '+' — this is what `wa.me/<number>` expects. */
  whatsapp: '9779800000000',
  email: 'info@kawadirabi.com.np',

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
export const telHref = `tel:${siteConfig.phone}`;

/** True when a social link has a real destination configured. */
export function isConfiguredSocial(href: string): boolean {
  return href.trim() !== '' && href.trim() !== '#';
}

/** Socials that actually point somewhere. */
export function activeSocials() {
  return siteConfig.socials.filter((s) => isConfiguredSocial(s.href));
}
