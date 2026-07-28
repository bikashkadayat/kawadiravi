'use client';

import { useLocale, useTranslations } from 'next-intl';

import { formatRateRange } from '@/lib/rates';
import { resolveIcon } from '@/lib/icons';
import type { Rate } from '@/types';

/**
 * One category's rates as a real <table>.
 *
 * A semantic table (not a grid of divs) so screen readers announce
 * "Item, Rate" per cell and the data can be copied or read in a sane order.
 *
 * Responsive without duplicating the DOM: the Unit column is dropped below
 * `sm` and the unit is shown under the item name instead. Rendering two
 * separate mobile/desktop trees would double the markup and make the same
 * content appear twice to assistive tech.
 */
export function RatesTable({ items }: { items: Rate[] }) {
  const t = useTranslations('rates');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b text-sm">
            <th scope="col" className="text-muted-foreground py-3 pr-4 font-semibold">
              {t('item')}
            </th>
            <th
              scope="col"
              className="text-muted-foreground hidden py-3 pr-4 font-semibold sm:table-cell"
            >
              {t('unit')}
            </th>
            <th
              scope="col"
              className="text-muted-foreground py-3 text-right font-semibold"
            >
              {t('rate')} ({tCommon('currency')})
            </th>
          </tr>
        </thead>

        <tbody>
          {items.map((rate) => {
            const Icon = resolveIcon(rate.icon);
            const name = locale === 'ne' ? rate.nameNe : rate.nameEn;
            const note = locale === 'ne' ? rate.noteNe : rate.noteEn;
            const unitLabel =
              rate.unit === 'kg' ? tCommon('perKg') : tCommon('perPiece');

            return (
              <tr
                key={rate.id}
                className="hover:bg-surface-muted border-b transition-colors last:border-0"
              >
                <th scope="row" className="py-4 pr-4 font-normal">
                  <div className="flex items-start gap-3">
                    <span className="bg-primary-50 text-primary-800 dark:bg-primary-900 dark:text-primary-100 mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>

                    <span className="min-w-0">
                      <span className="block font-semibold">{name}</span>

                      {/* Unit moves here when the Unit column is hidden. */}
                      <span className="text-muted-foreground block text-sm sm:hidden">
                        {unitLabel}
                      </span>

                      {note && (
                        <span className="text-muted-foreground mt-0.5 block text-sm text-pretty">
                          {note}
                        </span>
                      )}
                    </span>
                  </div>
                </th>

                <td className="text-muted-foreground hidden py-4 pr-4 align-top text-sm sm:table-cell">
                  {unitLabel}
                </td>

                <td className="text-primary-800 dark:text-primary-300 py-4 text-right align-top font-bold whitespace-nowrap">
                  {formatRateRange(rate)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
