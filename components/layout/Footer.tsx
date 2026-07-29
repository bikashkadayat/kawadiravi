import type { ComponentType, SVGProps } from 'react';
import { Clock, Facebook, Instagram, Mail, MapPin, Phone, Youtube } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/routing';
import { navItems } from '@/lib/nav';
import { RATE_CATEGORIES } from '@/lib/rates';
import { siteConfig, telHref } from '@/lib/site-config';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { TikTokIcon, WhatsAppIcon } from '@/components/shared/BrandIcons';
import { Wordmark } from '@/components/shared/Wordmark';
import type { SocialLink } from '@/types';

/** Icon per social key. Keyed by the union in SocialLink, so a new network
 *  cannot be added to site-config without also giving it an icon here. */
const socialIcons: Record<
  SocialLink['key'],
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  facebook: Facebook,
  tiktok: TikTokIcon,
  whatsapp: WhatsAppIcon,
  instagram: Instagram,
  youtube: Youtube,
};

/**
 * Shared column-heading style.
 *
 * No `tracking-*` on purpose. Letter-spacing is applied to the whole string,
 * and on Devanagari that pushes apart the pieces of a conjunct — "कम्पनी"
 * visibly comes unglued. `uppercase` is safe because Devanagari is caseless,
 * so it is simply a no-op on the Nepali side.
 */
const HEADING_CLASS =
  'mb-3 text-sm font-semibold text-neutral-400 uppercase';

/** Icon-button style shared by every social link. size-11 = a 44px target. */
const SOCIAL_CLASS =
  'inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20';

/** Row style shared by the tappable contact lines (44px minimum target). */
const CONTACT_LINK_CLASS =
  'flex min-h-11 items-start gap-2.5 py-1 text-neutral-300 transition-colors hover:text-white';

export async function Footer() {
  const t = await getTranslations('footer');
  const tNav = await getTranslations('nav');
  const tRates = await getTranslations('rates');
  const tCommon = await getTranslations('common');
  const locale = await getLocale();

  /**
   * EVERY network in site-config gets an icon, in config order.
   *
   * This used to run through `activeSocials()`, which drops any href still set
   * to the '#' placeholder. Since every entry in site-config is currently '#',
   * that filter removed all five and the row rendered a lone WhatsApp button —
   * the "Follow us" heading over a single icon, which looked like a bug.
   *
   * Showing the full row is the explicit brief. The cost is real and worth
   * naming: until the '#' placeholders in `lib/site-config.ts` are replaced
   * with real profile URLs, those icons navigate nowhere. `isConfiguredSocial`
   * is still exported and still used by `lib/schema.ts`, so the JSON-LD
   * `sameAs` continues to list only genuinely reachable profiles — a dead link
   * in the footer is a UX wrinkle, but a dead link in structured data is a
   * trust signal to Google that would not survive contact with a crawler.
   *
   * WhatsApp is special-cased: it needs no configured URL because it is
   * derived from the phone number, and its prefilled text comes from
   * `siteConfig.whatsappMessage` like every other WhatsApp control.
   */
  const whatsappHref = buildWhatsAppUrl();
  const socials = siteConfig.socials.map((social) => ({
    ...social,
    href: social.key === 'whatsapp' ? whatsappHref : social.href,
  }));

  const year = new Date().getFullYear();
  const address = locale === 'ne' ? siteConfig.addressNe : siteConfig.addressEn;
  const city = locale === 'ne' ? 'काठमाडौं' : 'Kathmandu';

  return (
    <footer className="bg-primary-950 mt-20 text-neutral-200">
      <div className="container-page py-14">
        {/*
          `grid-cols-2` at the BASE size, not from `sm`.
          The old ladder started at one implicit column, so on a 430px phone
          "Company" and "What We Buy" — five short labels each — got a
          full-width row apiece with roughly two thirds of it empty. Pairing
          them fills that space and halves the footer's height on mobile.
          Brand and Contact span both columns because their content is prose
          and a full-width email; only the two link lists want to be narrow.
        */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {/* Brand + blurb + socials */}
          <div className="col-span-2 lg:col-span-1">
            <Wordmark
              className="text-xl font-extrabold"
              chipClassName="px-2 py-1"
            />
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-neutral-300">
              {t('about')}
            </p>

            <p className={`mt-6 ${HEADING_CLASS}`}>{t('followUs')}</p>
            <ul className="flex flex-wrap gap-3">
              {socials.map((social) => {
                const Icon = socialIcons[social.key];
                return (
                  <li key={social.key}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t('socialLabel', { network: social.label })}
                      className={SOCIAL_CLASS}
                    >
                      <Icon className="size-5" aria-hidden="true" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Company / navigation */}
          <nav aria-labelledby="footer-company">
            <p id="footer-company" className={HEADING_CLASS}>
              {t('company')}
            </p>
            <ul className="text-sm">
              {navItems.map((item) => (
                <li key={item.href}>
                  {/* min-h-11 = 44px touch target. The list gap dropped from
                      space-y-2.5 to nothing in exchange, so the column grows by
                      far less than 5x17px and the footer rhythm is preserved. */}
                  <Link
                    href={item.href}
                    className="flex min-h-11 items-center text-neutral-300 underline-offset-4 transition-colors hover:text-white hover:underline"
                  >
                    {tNav(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* What we buy — derived from the rate categories, so it can never
              drift out of sync with data/rates.json. */}
          <div>
            <p className={HEADING_CLASS}>{t('servicesTitle')}</p>
            {/* Same min-h-11 row height as the Company links next door. These
                are plain text and need no tap target, but without a matching
                rhythm the two columns sit at different line positions and the
                pair reads as misaligned on a phone. */}
            <ul className="text-sm text-neutral-300">
              {RATE_CATEGORIES.map((category) => (
                <li key={category} className="flex min-h-11 items-center">
                  {tRates(`categories.${category}`)}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 lg:col-span-1">
            <p className={HEADING_CLASS}>{t('contactTitle')}</p>
            <ul className="space-y-1 text-sm">
              <li>
                <a href={telHref} className={CONTACT_LINK_CLASS}>
                  <Phone className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>{siteConfig.phoneDisplay}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className={CONTACT_LINK_CLASS}
                >
                  <Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {/* overflow-wrap:anywhere, not break-words and not break-all.
                      break-words alone does nothing here — the address has no
                      spaces, so there is no break opportunity to take, and the
                      unbreakable token sets the grid column's min-content width
                      and pushes the page sideways at 320px. `anywhere` both
                      permits the mid-token break AND, unlike break-all, is
                      counted when the column's intrinsic width is computed, so
                      the column stops being sized by the longest word. */}
                  <span className="[overflow-wrap:anywhere]">
                    {siteConfig.email}
                  </span>
                </a>
              </li>
              <li className="flex items-start gap-2.5 py-2 text-neutral-300">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>{address}</span>
              </li>
              {siteConfig.hours.map((slot) => (
                <li
                  key={slot.days.join('-')}
                  className="flex items-start gap-2.5 py-1 text-neutral-300"
                >
                  <Clock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>
                    {slot.days.length > 1
                      ? `${slot.days[0]}–${slot.days[slot.days.length - 1]}`
                      : slot.days[0]}
                    : {slot.opens}–{slot.closes}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Coverage areas */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <p className={HEADING_CLASS}>{t('coverage')}</p>
          <ul className="flex flex-wrap gap-2 text-sm text-neutral-300">
            {siteConfig.coverage.map((area) => (
              <li
                key={area.nameEn}
                className="rounded-full bg-white/5 px-3 py-1"
              >
                {locale === 'ne' ? area.nameNe : area.nameEn}
              </li>
            ))}
          </ul>
        </div>

        {/*
          Legal strip.

          The bottom padding is the floating Call/WhatsApp stack, measured
          rather than guessed: `FloatingActions` is p-4 + h-14 + gap-3 + h-14
          + p-4 = 156px, rising to 172px once its padding goes to p-6 at `sm`.
          The previous `pb-20` reserved 80px, which is why the last rows still
          sat behind the buttons. env(safe-area-inset-bottom) is added on top
          so a notched iPhone clears its home indicator too.

          From `lg` the reservation switches from vertical to horizontal: the
          buttons are only ~220px wide and pinned right, so `lg:pr-64` walks
          the right-hand text out from under them and the footer stops
          carrying 170px of dead green space on desktop.
        */}
        <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-6 pb-[calc(9.75rem+env(safe-area-inset-bottom))] text-center text-sm text-neutral-400 sm:pb-[calc(11rem+env(safe-area-inset-bottom))] lg:flex-row lg:items-center lg:justify-between lg:pr-64 lg:pb-12 lg:text-left">
          <p>
            © {year} {tCommon('brand')} · {city} ♻️
          </p>
          <p>{t('rights')}</p>
        </div>
      </div>
    </footer>
  );
}
