import { ArrowRight } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/routing';
import { formatRateRange, getFeaturedRates, getRatesUpdatedAt } from '@/lib/rates';
import { resolveIcon } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { SectionHeading } from '@/components/shared/SectionHeading';

/**
 * Homepage preview of the `featured` items in data/rates.json.
 *
 * Reads the same validated loader as /rates, so editing one number in the JSON
 * updates both places — the single-source-of-truth requirement from the brief.
 * The disclaimer is repeated here rather than only on /rates because many
 * visitors will never reach that page.
 */
export async function RatesPreview() {
  const t = await getTranslations('home.ratesPreview');
  const tRates = await getTranslations('rates');
  const tCommon = await getTranslations('common');
  const locale = await getLocale();

  // Six is enough to prove the range and breadth without becoming a table.
  const featured = getFeaturedRates(6);

  return (
    <AnimatedSection className="container-page py-16 sm:py-20">
      <SectionHeading title={t('title')} subtitle={t('subtitle')} />

      <p className="text-muted-foreground mt-4 text-center text-sm">
        {tRates('updatedOn', { date: getRatesUpdatedAt() })}
      </p>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((rate) => {
          const Icon = resolveIcon(rate.icon);
          return (
            <li
              key={rate.id}
              className="bg-surface hover:border-primary-300 flex items-center gap-4 rounded-xl border p-4 transition-colors"
            >
              <span className="bg-primary-50 text-primary-800 dark:bg-primary-900 dark:text-primary-100 flex size-12 shrink-0 items-center justify-center rounded-lg">
                <Icon className="size-6" aria-hidden="true" />
              </span>

              <div className="min-w-0 flex-1">
                {/* Clamped rather than truncated: two lines fit the longer
                    names ("Copper (Heavy / Utensils)") instead of hiding them
                    behind an ellipsis. */}
                <p className="line-clamp-2 font-semibold">
                  {locale === 'ne' ? rate.nameNe : rate.nameEn}
                </p>
                <p className="text-muted-foreground text-sm">
                  {rate.unit === 'kg'
                    ? tCommon('perKg')
                    : tCommon('perPiece')}
                </p>
              </div>

              <p className="text-primary-800 dark:text-primary-300 shrink-0 text-right font-bold">
                <span className="text-muted-foreground block text-xs font-normal">
                  {tCommon('currency')}
                </span>
                {formatRateRange(rate)}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="mt-10 flex flex-col items-center gap-4">
        <Button asChild variant="primary" size="lg">
          <Link href="/rates">
            {tCommon('seeAllRates')}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
        <p className="text-muted-foreground max-w-xl text-center text-sm text-pretty">
          {tRates('disclaimer')}
        </p>
      </div>
    </AnimatedSection>
  );
}
