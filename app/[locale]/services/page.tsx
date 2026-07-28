import type { Metadata } from 'next';
import { Ban, Phone } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Link, routing } from '@/i18n/routing';
import { buildPageMetadata } from '@/lib/metadata';
import { categoryIcons } from '@/lib/icons';
import { getPopulatedCategories, getRatesByCategory } from '@/lib/rates';
import { faqs } from '@/lib/faqs';
import { buildFaqSchema } from '@/lib/schema';
import { telHref } from '@/lib/site-config';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import type { Locale } from '@/types';
import { Button } from '@/components/ui/button';
import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { FaqAccordion } from '@/components/shared/FaqAccordion';
import { JsonLd } from '@/components/shared/JsonLd';
import { WhatsAppIcon } from '@/components/shared/BrandIcons';

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
  return buildPageMetadata(locale, 'services', '/services');
}

/**
 * Services page.
 *
 * The "what we cannot accept" section is deliberately prominent rather than
 * buried: it stops someone calling about paint tins or gas cylinders, which
 * wastes their time and ours, and it is a safety matter for the collection team.
 */
export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('services');
  const tRates = await getTranslations('rates');
  const tCommon = await getTranslations('common');
  const tFloating = await getTranslations('floating');
  const tCta = await getTranslations('home.cta');

  const categories = getPopulatedCategories();

  const process = [
    { title: t('process1Title'), body: t('process1Body') },
    { title: t('process2Title'), body: t('process2Body') },
    { title: t('process3Title'), body: t('process3Body') },
    { title: t('process4Title'), body: t('process4Body') },
  ];

  const notAccepted = [
    t('notAccepted1'),
    t('notAccepted2'),
    t('notAccepted3'),
    t('notAccepted4'),
    t('notAccepted5'),
    t('notAccepted6'),
  ];

  return (
    <main className="pb-16">
      {/* FAQPage schema, built from the same array the accordion renders. */}
      <JsonLd data={buildFaqSchema(faqs, locale as Locale)} />

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

      {/* What we collect */}
      <AnimatedSection className="container-page py-14">
        <SectionHeading
          title={t('whatWeCollect')}
          subtitle={t('whatWeCollectSub')}
        />

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = categoryIcons[category];
            return (
              <li key={category}>
                <Link
                  href={`/rates#${category}`}
                  className="bg-surface hover:border-primary-400 group flex h-full flex-col rounded-2xl border p-6 transition-all hover:shadow-lg"
                >
                  <span className="bg-primary-50 text-primary-800 dark:bg-primary-900 dark:text-primary-100 flex size-14 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
                    <Icon className="size-7" aria-hidden="true" />
                  </span>
                  <h3 className="text-primary-900 dark:text-primary-200 mt-5 text-xl font-bold">
                    {tRates(`categories.${category}`)}
                  </h3>
                  <p className="text-muted-foreground mt-2 flex-1 leading-relaxed">
                    {tRates(`categoryDescriptions.${category}`)}
                  </p>
                  <p className="text-primary-700 dark:text-primary-300 mt-4 text-sm font-semibold group-hover:underline">
                    {getRatesByCategory(category).length} · {tCommon('viewRates')}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </AnimatedSection>

      {/* Pickup process */}
      <AnimatedSection className="bg-surface-muted py-14">
        <div className="container-page">
          <SectionHeading title={t('processTitle')} subtitle={t('processSub')} />

          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((step, index) => (
              <li
                key={step.title}
                className="bg-background rounded-2xl border p-6"
              >
                <span className="bg-primary-800 flex size-11 items-center justify-center rounded-full text-lg font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-lg font-bold text-balance">
                  {step.title}
                </h3>
                <p className="text-muted-foreground mt-2 leading-relaxed text-pretty">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </AnimatedSection>

      {/* What we cannot accept */}
      <AnimatedSection className="container-page py-14">
        <SectionHeading
          title={t('notAcceptedTitle')}
          subtitle={t('notAcceptedSub')}
        />

        <ul className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
          {notAccepted.map((label) => (
            <li
              key={label}
              className="border-destructive/25 bg-destructive/5 flex items-start gap-3 rounded-xl border p-4"
            >
              <Ban
                className="text-destructive mt-0.5 size-5 shrink-0"
                aria-hidden="true"
              />
              <span className="text-sm leading-relaxed text-pretty">
                {label}
              </span>
            </li>
          ))}
        </ul>

        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-center text-sm text-pretty">
          {t('notAcceptedNote')}
        </p>
      </AnimatedSection>

      {/* FAQ */}
      <AnimatedSection className="bg-surface-muted py-14">
        <div className="container-page">
          <SectionHeading title={t('faqTitle')} subtitle={t('faqSub')} />
          <div className="bg-background mx-auto mt-10 max-w-3xl rounded-2xl border px-6">
            <FaqAccordion items={faqs} />
          </div>
        </div>
      </AnimatedSection>

      {/* CTA */}
      <AnimatedSection className="container-page pt-14">
        <div className="bg-primary-900 rounded-3xl px-6 py-12 text-center sm:px-12">
          <h2 className="text-3xl font-extrabold text-balance text-white">
            {tCta('title')}
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="call" size="lg">
              <a href={telHref}>
                <Phone aria-hidden="true" />
                {tCommon('callNow')}
              </a>
            </Button>
            <Button asChild variant="whatsapp" size="lg">
              <a
                href={buildWhatsAppUrl(tFloating('prefilledMessage'))}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon aria-hidden="true" />
                {tCommon('whatsappUs')}
              </a>
            </Button>
          </div>
        </div>
      </AnimatedSection>
    </main>
  );
}
