import type { Metadata } from 'next';
import { CalendarCheck, Clock, HandCoins, Truck } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { routing } from '@/i18n/routing';
import { buildPageMetadata } from '@/lib/metadata';
import { buildBreadcrumbSchema, buildServiceSchema } from '@/lib/schema';
import { siteConfig, telHref } from '@/lib/site-config';
import type { Locale } from '@/types';
import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { JsonLd } from '@/components/shared/JsonLd';
import { BookingForm } from '@/components/booking/BookingForm';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata(locale, 'book', '/book');
}

/**
 * Booking page.
 *
 * The form is the whole point of the page, so it sits directly under the H1
 * with only a short reassurance strip beside it — no marketing preamble to
 * scroll past. The phone number stays visible throughout for anyone who would
 * rather just call, which on this audience is a large share of visitors.
 */
export default async function BookPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('booking');
  const tNav = await getTranslations('nav');

  const assurances = [
    { icon: Truck, key: 'assureFree' },
    { icon: HandCoins, key: 'assureCash' },
    { icon: Clock, key: 'assureSameDay' },
    { icon: CalendarCheck, key: 'assureConfirm' },
  ] as const;

  return (
    <main data-booking-page className="pb-16">
      <JsonLd
        data={buildBreadcrumbSchema(
          [
            { name: tNav('home'), path: '' },
            { name: t('navLabel'), path: '/book' },
          ],
          locale as Locale,
        )}
      />
      {/* The pickup service itself, so this page can stand alone as the
          bookable entity in structured data. */}
      <JsonLd data={buildServiceSchema(locale as Locale)} />

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

      <AnimatedSection className="container-page">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          {/* Form */}
          <div className="bg-surface rounded-2xl border p-5 sm:p-8">
            <BookingForm />
          </div>

          {/* Reassurance rail. Second in the DOM so a phone reads the form
              first — this is supporting material, not a prerequisite. */}
          <aside className="space-y-6 lg:pb-44">
            <ul className="space-y-4">
              {assurances.map(({ icon: Icon, key }) => (
                <li key={key} className="flex items-start gap-3">
                  <span className="bg-primary-50 dark:bg-primary-900 flex size-10 shrink-0 items-center justify-center rounded-full">
                    <Icon
                      className="text-primary-800 dark:text-primary-200 size-5"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="text-sm leading-relaxed">{t(key)}</span>
                </li>
              ))}
            </ul>

            <div className="bg-surface-muted rounded-2xl p-5">
              <p className="text-sm font-semibold">{t('preferCall')}</p>
              <a
                href={telHref}
                className="text-primary-900 dark:text-primary-200 mt-1.5 flex min-h-11 items-center text-lg font-bold"
              >
                {siteConfig.phoneDisplay}
              </a>
              <p className="text-muted-foreground text-sm">{t('hoursNote')}</p>
            </div>
          </aside>
        </div>
      </AnimatedSection>
    </main>
  );
}
