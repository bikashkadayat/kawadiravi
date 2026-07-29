import type { Metadata } from 'next';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';

import { routing } from '@/i18n/routing';
import { buildPageMetadata } from '@/lib/metadata';
import { buildBreadcrumbSchema } from '@/lib/schema';
import { siteConfig, telHref } from '@/lib/site-config';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import type { Locale } from '@/types';
import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { JsonLd } from '@/components/shared/JsonLd';
import { WhatsAppIcon } from '@/components/shared/BrandIcons';
import { ContactForm } from '@/components/contact/ContactForm';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // Builds title + description + canonical + hreflang + OG + Twitter together,
  // so this page's share card is its own rather than the layout's.
  return buildPageMetadata(locale, 'contact', '/contact');
}

/**
 * Contact page.
 *
 * Call and WhatsApp come first and the form second, because the form is the
 * slower path — it exists for people who prefer to write everything out, not
 * as the primary route. Both cards are plain links, so they work with no JS.
 */
export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('contact');
  const tNav = await getTranslations('nav');
  const activeLocale = await getLocale();

  const address =
    activeLocale === 'ne' ? siteConfig.addressNe : siteConfig.addressEn;

  return (
    <main className="pb-16">
      {/* No LocalBusiness block here: the locale layout emits it on every
          page, so repeating it would duplicate the same @id twice in one
          document. */}
      <JsonLd
        data={buildBreadcrumbSchema(
          [
            { name: tNav('home'), path: '' },
            { name: tNav('contact'), path: '/contact' },
          ],
          locale as Locale,
        )}
      />
      <header className="from-primary-50 dark:from-primary-950 bg-gradient-to-b to-transparent py-14 sm:py-20">
        <div className="container-page mx-auto max-w-2xl text-center">
          <h1 className="text-primary-900 dark:text-primary-200 text-[length:var(--text-h1)] font-extrabold tracking-tight text-balance">
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed text-pretty">
            {t('subtitle')}
          </p>
        </div>
      </header>

      {/* Primary contact routes */}
      <AnimatedSection className="container-page py-10">
        <ul className="grid gap-5 md:grid-cols-3">
          <li>
            <a
              href={telHref}
              className="bg-accent hover:bg-accent-hover flex h-full flex-col rounded-2xl p-6 text-neutral-950 transition-colors"
            >
              <Phone className="size-8" aria-hidden="true" />
              <p className="mt-4 text-lg font-bold">{t('callTitle')}</p>
              <p className="mt-1 flex-1 text-sm opacity-90">{t('callBody')}</p>
              <p className="mt-4 font-bold">{siteConfig.phoneDisplay}</p>
            </a>
          </li>

          <li>
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-whatsapp hover:bg-whatsapp-hover flex h-full flex-col rounded-2xl p-6 text-neutral-950 transition-colors"
            >
              <WhatsAppIcon className="size-8" aria-hidden="true" />
              <p className="mt-4 text-lg font-bold">{t('whatsappTitle')}</p>
              <p className="mt-1 flex-1 text-sm opacity-90">
                {t('whatsappBody')}
              </p>
              <p className="mt-4 font-bold">{siteConfig.phoneDisplay}</p>
            </a>
          </li>

          <li>
            <a
              href={`mailto:${siteConfig.email}`}
              className="bg-surface hover:border-primary-400 flex h-full flex-col rounded-2xl border p-6 transition-colors"
            >
              <Mail
                className="text-primary-800 dark:text-primary-300 size-8"
                aria-hidden="true"
              />
              <p className="mt-4 text-lg font-bold">{t('emailTitle')}</p>
              <p className="text-muted-foreground mt-1 flex-1 text-sm">
                {t('emailBody')}
              </p>
              <p className="mt-4 font-semibold break-all">{siteConfig.email}</p>
            </a>
          </li>
        </ul>
      </AnimatedSection>

      {/* Form + hours/address */}
      <AnimatedSection className="container-page py-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <SectionHeading
              title={t('formTitle')}
              subtitle={t('formSub')}
              align="left"
            />
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>

          <div className="space-y-6">
            {/* Hours */}
            <div className="bg-surface rounded-2xl border p-6">
              <h2 className="flex items-center gap-2.5 text-lg font-bold">
                <Clock
                  className="text-primary-800 dark:text-primary-300 size-5"
                  aria-hidden="true"
                />
                {t('hoursTitle')}
              </h2>
              <dl className="mt-4 space-y-2 text-sm">
                {siteConfig.hours.map((slot) => (
                  <div
                    key={slot.days.join('-')}
                    className="flex justify-between gap-4 border-b pb-2 last:border-0"
                  >
                    <dt className="text-muted-foreground">
                      {slot.days.length > 1
                        ? `${slot.days[0]}–${slot.days[slot.days.length - 1]}`
                        : slot.days[0]}
                    </dt>
                    <dd className="font-semibold">
                      {slot.opens}–{slot.closes}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="text-muted-foreground mt-4 text-sm text-pretty">
                {t('hoursNote')}
              </p>
            </div>

            {/* Address */}
            <div className="bg-surface rounded-2xl border p-6">
              <h2 className="flex items-center gap-2.5 text-lg font-bold">
                <MapPin
                  className="text-primary-800 dark:text-primary-300 size-5"
                  aria-hidden="true"
                />
                {t('coverageTitle')}
              </h2>
              <p className="text-muted-foreground mt-3">{address}</p>

              <ul className="mt-4 flex flex-wrap gap-2">
                {siteConfig.coverage.map((area) => (
                  <li
                    key={area.nameEn}
                    className="bg-background rounded-full border px-3 py-1 text-sm"
                  >
                    {activeLocale === 'ne' ? area.nameNe : area.nameEn}
                  </li>
                ))}
              </ul>

              <p className="text-muted-foreground mt-4 text-sm text-pretty">
                {t('coverageNote')}
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </main>
  );
}
