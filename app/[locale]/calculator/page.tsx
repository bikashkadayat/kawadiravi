import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { routing } from '@/i18n/routing';
import { buildPageMetadata } from '@/lib/metadata';
import { buildBreadcrumbSchema } from '@/lib/schema';
import { getRatesUpdatedAt } from '@/lib/rates';
import type { Locale } from '@/types';
import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { JsonLd } from '@/components/shared/JsonLd';
import { ScrapCalculator } from '@/components/calculator/ScrapCalculator';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata(locale, 'calculator', '/calculator');
}

/**
 * Scrap value calculator page.
 *
 * Deliberately narrow (max-w-3xl): the calculator is a form, and a form that
 * spans 1280px puts the item picker and its quantity box a hand-span apart.
 */
export default async function CalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('calculator');
  const tRates = await getTranslations('rates');
  const tNav = await getTranslations('nav');

  return (
    <main className="pb-16">
      <JsonLd
        data={buildBreadcrumbSchema(
          [
            { name: tNav('home'), path: '' },
            { name: tNav('calculator'), path: '/calculator' },
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
          <p className="text-muted-foreground mt-3 text-sm">
            {tRates('updatedOn', { date: getRatesUpdatedAt() })}
          </p>
        </div>
      </header>

      <AnimatedSection className="container-page">
        <div className="bg-surface mx-auto max-w-3xl rounded-2xl border p-4 sm:p-8">
          <ScrapCalculator />
        </div>
      </AnimatedSection>
    </main>
  );
}
