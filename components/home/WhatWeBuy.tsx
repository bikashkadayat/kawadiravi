import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/routing';
import { categoryIcons } from '@/lib/icons';
import { getPopulatedCategories, getRatesByCategory } from '@/lib/rates';
import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { SectionHeading } from '@/components/shared/SectionHeading';

/**
 * Category grid.
 *
 * Categories come from `getPopulatedCategories()`, so a category with no items
 * left in data/rates.json disappears automatically rather than linking to an
 * empty section. Each card deep-links to its anchor on /rates.
 */
export async function WhatWeBuy() {
  const t = await getTranslations('home.whatWeBuy');
  const tRates = await getTranslations('rates');

  const categories = getPopulatedCategories();

  return (
    <AnimatedSection className="bg-surface-muted py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading title={t('title')} subtitle={t('subtitle')} />

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = categoryIcons[category];
            const count = getRatesByCategory(category).length;

            return (
              <li key={category}>
                <Link
                  href={`/rates#${category}`}
                  className="bg-background hover:border-primary-400 group flex h-full flex-col rounded-2xl border p-6 transition-all hover:shadow-lg"
                >
                  <span className="bg-primary-50 text-primary-800 dark:bg-primary-900 dark:text-primary-100 flex size-14 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
                    <Icon className="size-7" aria-hidden="true" />
                  </span>

                  <h3 className="text-primary-900 dark:text-primary-200 mt-5 text-xl font-bold">
                    {tRates(`categories.${category}`)}
                  </h3>

                  <p className="text-muted-foreground mt-2 flex-1 text-sm leading-relaxed">
                    {tRates(`categoryDescriptions.${category}`)}
                  </p>

                  <p className="text-primary-700 dark:text-primary-300 mt-4 flex items-center gap-2 text-sm font-semibold">
                    <span>{t('itemCount', { count })}</span>
                    <span aria-hidden="true">·</span>
                    <span className="group-hover:underline">
                      {t('viewRates')}
                    </span>
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </AnimatedSection>
  );
}
