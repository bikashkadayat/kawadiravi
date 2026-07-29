import type { ComponentType, SVGProps } from 'react';
import { Clock, Facebook, Instagram, Mail, MapPin, Phone, Youtube } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/routing';
import { navItems } from '@/lib/nav';
import { RATE_CATEGORIES } from '@/lib/rates';
import { activeSocials, siteConfig, telHref } from '@/lib/site-config';
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

export async function Footer() {
  const t = await getTranslations('footer');
  const tNav = await getTranslations('nav');
  const tRates = await getTranslations('rates');
  const tCommon = await getTranslations('common');
  const locale = await getLocale();

  /**
   * Socials with a placeholder '#' href are hidden rather than rendered as
   * dead links — a link that goes nowhere is worse for both users and SEO than
   * no link at all.
   *
   * WhatsApp is the exception: it needs no external URL because it is derived
   * from the phone number we already have, so it is always live.
   */
  const socials = [
    ...activeSocials(),
    ...(siteConfig.socials.some((s) => s.key === 'whatsapp')
      ? [
          {
            key: 'whatsapp' as const,
            label: 'WhatsApp',
            href: buildWhatsAppUrl(),
          },
        ]
      : []),
  ].filter(
    // De-duplicate in case a real WhatsApp URL is configured later.
    (s, i, arr) => arr.findIndex((x) => x.key === s.key) === i,
  );

  const year = new Date().getFullYear();
  const address = locale === 'ne' ? siteConfig.addressNe : siteConfig.addressEn;

  return (
    <footer className="bg-primary-950 mt-20 text-neutral-200">
      <div className="container-page py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand + blurb + socials */}
          <div>
            <Wordmark
              className="text-xl font-extrabold"
              chipClassName="px-2 py-1"
            />
            <p className="mt-3 text-sm leading-relaxed text-neutral-300">
              {t('about')}
            </p>

            {socials.length > 0 && (
              <>
                <p className="mt-6 text-sm font-semibold text-white">
                  {t('followUs')}
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {socials.map((social) => {
                    const Icon = socialIcons[social.key];
                    return (
                      <li key={social.key}>
                        <a
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={t('socialLabel', {
                            network: social.label,
                          })}
                          className="hover:bg-primary-800 inline-flex size-11 items-center justify-center rounded-full bg-white/10 transition-colors"
                        >
                          <Icon className="size-5" aria-hidden="true" />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>

          {/* Company / navigation */}
          <nav aria-labelledby="footer-company">
            <p id="footer-company" className="font-semibold text-white">
              {t('company')}
            </p>
            <ul className="mt-2 text-sm">
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
            <p className="font-semibold text-white">{t('servicesTitle')}</p>
            <ul className="mt-4 space-y-2.5 text-sm text-neutral-300">
              {RATE_CATEGORIES.map((category) => (
                <li key={category}>{tRates(`categories.${category}`)}</li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="font-semibold text-white">{t('contactTitle')}</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href={telHref}
                  className="flex min-h-11 items-center gap-2.5 text-neutral-300 transition-colors hover:text-white"
                >
                  <Phone className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>{siteConfig.phoneDisplay}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="flex min-h-11 items-center gap-2.5 break-all text-neutral-300 transition-colors hover:text-white"
                >
                  <Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>{siteConfig.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-neutral-300">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>{address}</span>
              </li>
              {siteConfig.hours.map((slot) => (
                <li
                  key={slot.days.join('-')}
                  className="flex items-start gap-2.5 text-neutral-300"
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
          <p className="font-semibold text-white">{t('coverage')}</p>
          <ul className="mt-3 flex flex-wrap gap-x-2 gap-y-2 text-sm text-neutral-300">
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

        {/* Legal strip. Bottom padding clears the floating buttons. */}
        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-8 pb-20 text-sm text-neutral-400 sm:flex-row sm:items-center sm:justify-between sm:pb-8">
          <p>
            © {year} {tCommon('brand')}. {t('rights')}
          </p>
          <p>{t('builtBy')}</p>
        </div>
      </div>
    </footer>
  );
}
