import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

/**
 * Locale routing configuration.
 *
 * `localePrefix: 'always'` gives every language its own crawlable URL
 * (`/en/rates`, `/ne/rates`). That is the whole point of choosing prefixed
 * routing over a client-side toggle: a Nepali-language query can only rank if
 * there is a distinct Nepali URL for Google to rank. See ARCHITECTURE.md §8.
 *
 * To make Nepali the landing language, change `defaultLocale` to 'ne'. That is
 * the only edit required.
 */
export const routing = defineRouting({
  locales: ['en', 'ne'],
  defaultLocale: 'en',
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];

/**
 * Locale-aware navigation primitives. Always import `Link` from here rather
 * than from `next/link`, otherwise the active locale is dropped from the href.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
