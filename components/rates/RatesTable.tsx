'use client';

import { useLocale, useTranslations } from 'next-intl';

import { formatAmountRange, getRatePricings } from '@/lib/rates';
import { resolveIcon } from '@/lib/icons';
import type { Rate, RateUnit } from '@/types';

/**
 * One category's rates as a real <table>: SN / Item Name / Buying Price.
 *
 * A semantic table (not a grid of divs) so screen readers announce
 * "SN, Item Name, Buying Price" per cell and the data can be copied or read in
 * a sane order.
 *
 * The unit lives inside the price ("Rs. 35–40/kg") rather than in a column of
 * its own. That is what the printed rate board says, it keeps the table to
 * three columns on a 320px screen, and it is the only way to show an item that
 * is quoted two ways at once (per piece OR per kg) without inventing a second
 * unit column that is empty for 90% of rows.
 *
 * `startIndex` continues the serial number across category sections, so the
 * column counts 1…N down the whole page instead of restarting at every
 * heading.
 */
export function RatesTable({
  items,
  startIndex = 0,
  label,
}: {
  items: Rate[];
  /** Number of rows rendered by earlier tables on the page. */
  startIndex?: number;
  /** Accessible name for the table, e.g. "Metals buying rates". */
  label: string;
}) {
  const t = useTranslations('rates');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const unitSuffix: Record<RateUnit, string> = {
    kg: tCommon('unitKgShort'),
    piece: tCommon('unitPieceShort'),
    ah: tCommon('unitAhShort'),
  };

  return (
    /*
      tabIndex makes the scroll container focusable so a keyboard-only user can
      pan a table that overflows — a scrollable region with no focusable child
      is otherwise unreachable without a mouse (WCAG 2.1.1). role/aria-label
      give that focus stop a name instead of announcing an anonymous group.
    */
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className="focus-visible:outline-primary-600 overflow-x-auto rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">{label}</caption>

        <thead>
          <tr className="border-b text-sm">
            <th
              scope="col"
              className="text-muted-foreground w-12 py-3 pr-2 font-semibold sm:w-16 sm:pr-4"
            >
              {t('sn')}
            </th>
            <th scope="col" className="text-muted-foreground py-3 pr-4 font-semibold">
              {t('item')}
            </th>
            <th
              scope="col"
              className="text-muted-foreground py-3 text-right font-semibold"
            >
              {t('buyingPrice')}
            </th>
          </tr>
        </thead>

        <tbody>
          {items.map((rate, index) => {
            const Icon = resolveIcon(rate.icon);
            const name = locale === 'ne' ? rate.nameNe : rate.nameEn;
            const note = locale === 'ne' ? rate.noteNe : rate.noteEn;
            const pricings = getRatePricings(rate);

            return (
              <tr
                key={rate.id}
                className="hover:bg-surface-muted border-b transition-colors last:border-0"
              >
                <td className="text-muted-foreground py-4 pr-2 align-top text-sm tabular-nums sm:pr-4">
                  {startIndex + index + 1}
                </td>

                <th scope="row" className="py-4 pr-4 font-normal">
                  <div className="flex items-start gap-3">
                    <span className="bg-primary-50 text-primary-800 dark:bg-primary-900 dark:text-primary-100 mt-0.5 hidden size-9 shrink-0 items-center justify-center rounded-lg sm:flex">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>

                    <span className="min-w-0">
                      <span className="block font-semibold text-pretty">{name}</span>

                      {note && (
                        <span className="text-muted-foreground mt-0.5 block text-sm text-pretty">
                          {note}
                        </span>
                      )}
                    </span>
                  </div>
                </th>

                <td className="text-primary-800 dark:text-primary-300 py-4 text-right align-top font-bold">
                  {/* "Starting from" is its own line rather than a prefix on
                      the same one: inlined, the longest label + price
                      ("Starting from Rs. 10,000/pc") no longer fits the price
                      column at 320px without either wrapping mid-figure or
                      squeezing the item name to a word per line. */}
                  {rate.startingFrom && (
                    <span className="text-muted-foreground block text-xs font-normal">
                      {t('startingFrom')}
                    </span>
                  )}

                  {pricings.map((pricing, pricingIndex) => {
                    const price = `${tCommon('currencyShort')} ${formatAmountRange(
                      pricing.minRate,
                      pricing.maxRate,
                    )}${unitSuffix[pricing.unit]}`;

                    // First line is the headline price. A second line is the
                    // alternative quote, prefixed "or" so it never reads as a
                    // second charge.
                    return (
                      <span
                        key={pricing.unit}
                        className={
                          pricingIndex === 0
                            ? 'block whitespace-nowrap'
                            : 'text-muted-foreground mt-0.5 block text-sm font-semibold whitespace-nowrap'
                        }
                      >
                        {pricingIndex === 0 ? price : t('orPrice', { price })}
                      </span>
                    );
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
