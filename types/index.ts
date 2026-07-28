/**
 * Shared TypeScript types for KTM Kawadi.
 *
 * The rate types here are the *inferred* counterparts of the Zod schemas in
 * `lib/rates.ts`. Zod owns the runtime contract; this file re-exports the
 * static types so components can import them without pulling in the validator.
 */

import type { Rate, RateCategory, RatesFile, RateUnit } from '@/lib/rates';

export type { Rate, RateCategory, RatesFile, RateUnit };

/** The two supported locales. Kept in sync with `i18n/routing.ts`. */
export type Locale = 'en' | 'ne';

/** A social network we link to from the footer. */
export interface SocialLink {
  /** Machine key, also used to pick the icon. */
  key: 'facebook' | 'tiktok' | 'whatsapp' | 'instagram' | 'youtube';
  /** Human label, used for the aria-label. */
  label: string;
  /** Destination. A value of '#' means "not configured yet" and is hidden. */
  href: string;
}

/** One municipality / area we offer pickup in. */
export interface CoverageArea {
  nameEn: string;
  nameNe: string;
}

/** A single opening-hours entry, also fed into the LocalBusiness JSON-LD. */
export interface BusinessHours {
  /** Schema.org day names, e.g. ['Monday', 'Tuesday']. */
  days: string[];
  /** 24h "HH:MM". */
  opens: string;
  /** 24h "HH:MM". */
  closes: string;
}

/** Everything that must change when the owner's contact details change. */
export interface SiteConfig {
  name: string;
  shortName: string;
  domain: string;
  url: string;
  /** E.164 with '+', used verbatim in `tel:` links. */
  phoneTel: string;
  /** Pretty form for display only. */
  phoneDisplay: string;
  /** Digits only, no '+', used for `wa.me/<number>`. */
  whatsapp: string;
  /** Default prefilled WhatsApp message when no localized one is supplied. */
  whatsappMessage: string;
  email: string;
  addressEn: string;
  addressNe: string;
  /** Approximate coordinates for the LocalBusiness schema and the map embed. */
  geo: { lat: number; lng: number };
  hours: BusinessHours[];
  socials: SocialLink[];
  coverage: CoverageArea[];
  priceRange: string;
}

/** A customer testimonial. Sample data until real reviews are collected. */
export interface Testimonial {
  id: string;
  nameEn: string;
  nameNe: string;
  areaEn: string;
  areaNe: string;
  quoteEn: string;
  quoteNe: string;
  /** 1-5. */
  rating: number;
}

/** One FAQ entry. Renders into the accordion *and* the FAQPage JSON-LD. */
export interface FaqItem {
  id: string;
  questionEn: string;
  questionNe: string;
  answerEn: string;
  answerNe: string;
}
