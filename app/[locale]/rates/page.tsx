import type { Metadata } from 'next';
import { CalendarCheck } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Link, routing } from '@/i18n/routing';
import { buildPageMetadata } from '@/lib/metadata';
import { buildBreadcrumbSchema } from '@/lib/schema';
import { formatUpdatedAt, getAllRates, getRatesUpdatedAt } from '@/lib/rates';
import type { Locale } from '@/types';
import { Button } from '@/components/ui/button';
import { JsonLd } from '@/components/shared/JsonLd';
import { RatesExplorer } from '@/components/rates/RatesExplorer';
import { StickyRatesCta } from '@/components/rates/StickyRatesCta';

/** Pre-render /en/rates and /ne/rates at build time. */
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
  return buildPageMetadata(locale, 'rates', '/rates');
}

/**
 * Live scrap rates.
 *
 * The page is a server component: it reads the Zod-validated rates at build
 * time and hands the already-validated array to the client explorer, which
 * owns only the search/filter interaction. Changing a price means editing
 * `data/rates.json` and nothing else — no component knows a number.
 *
 * `pb-32 md:pb-0` reserves room for the mobile sticky CTA so the last row of
 * the table is never trapped underneath it.
 */
export default async function RatesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('rates');
  const tNav = await getTranslations('nav');
  const rates = getAllRates();

  return (
    <>
      {/* Breadcrumb trail. Google renders this in place of the raw URL in the
          result snippet, which is more clickable on a mobile SERP. */}
      <JsonLd
        data={buildBreadcrumbSchema(
          [
            { name: tNav('home'), path: '' },
            { name: tNav('rates'), path: '/rates' },
          ],
          locale as Locale,
        )}
      />

      <main className="container-page py-12 pb-32 sm:py-16 md:pb-16">
        <header className="mx-auto max-w-2xl text-center">
          <h1 className="text-primary-900 dark:text-primary-200 text-[length:var(--text-h1)] font-extrabold tracking-tight text-balance">
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed text-pretty">
            {t('subtitle')}
          </p>
          <p className="text-muted-foreground mt-3 text-sm">
            {t('updatedOn', {
              date: formatUpdatedAt(getRatesUpdatedAt(), locale),
            })}
          </p>
        </header>

        <div className="mt-10">
          <RatesExplorer rates={rates} />
        </div>

        {/* Repeated at the foot of the table, where a comparison shopper
            actually finishes reading. */}
        <p className="bg-accent-soft text-primary-900 mx-auto mt-12 max-w-3xl rounded-xl p-4 text-center text-sm text-pretty">
          {t('disclaimer')}
        </p>

        {/* The conversion step, placed where someone who has just found a good
            number is looking. Brand green (primary-800, white text = 8.74:1)
            rather than the gold accent, which on this site always means
            "call". */}
        <div className="mt-8 flex justify-center">
          <Button asChild variant="primary" size="lg">
            <Link href="/book">
              <CalendarCheck aria-hidden="true" />
              {t('requestPickup')}
            </Link>
          </Button>
        </div>
      </main>

      <StickyRatesCta />
    </>
  );
}
