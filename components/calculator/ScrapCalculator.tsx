'use client';

import { useId, useMemo, useState } from 'react';
import { CalendarCheck, Plus, Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Link } from '@/i18n/routing';
import {
  activeRows,
  buildCalculatorMessage,
  buildRateLookup,
  formatMoneyRange,
  formatNpr,
  grandTotal,
  lineTotal,
  parseQty,
  type CalcRow,
} from '@/lib/calculator';
import { getGroupedRates } from '@/lib/rates';
import { resolveIcon } from '@/lib/icons';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { WhatsAppIcon } from '@/components/shared/BrandIcons';

let uid = 0;
const newRow = (): CalcRow => ({ key: `row-${++uid}`, itemId: '', qty: '' });

/**
 * Interactive scrap value estimator.
 *
 * Reads `data/rates.json` through `getGroupedRates()` / `buildRateLookup()`,
 * so it is the same single source of truth as /rates — edit a number there and
 * this updates with no code change.
 *
 * NO FRAMER MOTION, despite it being in package.json. It is currently imported
 * by nothing (`AnimatedSection` documents why), so pulling it in here for one
 * number would be the sole reason the whole library entered the bundle. The
 * total instead re-runs a short CSS keyframe keyed on its own value, which the
 * global prefers-reduced-motion block already collapses to ~0s.
 */
export function ScrapCalculator({ compact = false }: { compact?: boolean }) {
  const t = useTranslations('calculator');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const isNe = locale === 'ne';

  const [rows, setRows] = useState<CalcRow[]>([newRow()]);

  // Built once: rebuilding a Map of every priced item on every keystroke of
  // every row is pure waste, and the underlying JSON cannot change at runtime.
  const lookup = useMemo(() => buildRateLookup(), []);
  const grouped = useMemo(() => getGroupedRates(), []);

  const total = grandTotal(rows, lookup);
  const filled = activeRows(rows, lookup);
  const currency = tCommon('currency');
  const headingId = useId();

  function update(key: string, patch: Partial<CalcRow>) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((rs) => [...rs, newRow()]);
  }

  function removeRow(key: string) {
    // Never drop to zero rows — an empty calculator with no way back looks
    // broken. Clearing the last row is the equivalent of removing it.
    setRows((rs) => (rs.length === 1 ? [newRow()] : rs.filter((r) => r.key !== key)));
  }

  const whatsappUrl = filled.length
    ? buildWhatsAppUrl(buildCalculatorMessage(rows, lookup))
    : '';

  return (
    <div className="space-y-5">
      <ul className="space-y-3" aria-labelledby={headingId}>
        <li className="sr-only" id={headingId}>
          {t('rowsLabel')}
        </li>

        {rows.map((row, index) => {
          const item = lookup.get(row.itemId);
          const qty = parseQty(row.qty);
          const line = lineTotal(item, qty);
          const Icon = item ? resolveIcon(item.icon) : null;
          /* Two forms on purpose. The field label has to stand alone above an
             empty box ("Weight (kg)"), but reading that same string back
             inline produced "5 Weight (kg) x NPR 900".

             Batteries are quoted per amp-hour, so the field asks for the AH
             printed on the label rather than a weight nobody has measured. */
          const unit = item?.unit ?? 'kg';
          const unitLabel = t(
            unit === 'piece' ? 'unitPiece' : unit === 'ah' ? 'unitAh' : 'unitKg',
          );
          const unitShort = t(
            unit === 'piece'
              ? 'unitPieceShort'
              : unit === 'ah'
                ? 'unitAhShort'
                : 'unitKgShort',
          );

          return (
            <li
              key={row.key}
              className="bg-background rounded-2xl border p-3 sm:p-4"
            >
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_9rem_auto] sm:items-end">
                {/* Item picker */}
                <div className="min-w-0">
                  <label
                    htmlFor={`${row.key}-item`}
                    className="text-sm font-semibold"
                  >
                    {t('item')} {index + 1}
                  </label>
                  <div className="mt-1.5 flex items-center gap-2">
                    {/* The icon lives beside the select, not inside it: a
                        native <option> cannot render an element, and swapping
                        in a custom combobox would cost far more accessibility
                        than the icon is worth. */}
                    <span
                      className="bg-surface-muted flex size-11 shrink-0 items-center justify-center rounded-xl"
                      aria-hidden="true"
                    >
                      {Icon ? (
                        <Icon className="text-primary-800 dark:text-primary-300 size-5" />
                      ) : (
                        <span className="text-muted-foreground text-lg">♻️</span>
                      )}
                    </span>
                    <select
                      id={`${row.key}-item`}
                      value={row.itemId}
                      onChange={(e) => update(row.key, { itemId: e.target.value })}
                      className="bg-background focus:border-primary-600 min-h-11 w-full min-w-0 rounded-xl border px-3 py-2 text-base outline-none"
                    >
                      <option value="">{t('itemPlaceholder')}</option>
                      {grouped.map((group) => (
                        <optgroup
                          key={group.category}
                          label={t(`categories.${group.category}`)}
                        >
                          {group.items.map((rate) => (
                            <option key={rate.id} value={rate.id}>
                              {isNe
                                ? `${rate.nameNe} — ${rate.nameEn}`
                                : `${rate.nameEn} — ${rate.nameNe}`}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>

                {/*
                  Quantity + remove share one line on a phone.

                  `sm:contents` dissolves this wrapper at `sm` so its two
                  children become direct children of the grid again and land in
                  columns 2 and 3. Without it the trash button got a full-width
                  row of its own on mobile, floating under the inputs with
                  nothing beside it.
                */}
                <div className="flex items-end gap-2 sm:contents">
                  <div className="min-w-0 flex-1">
                    <label
                      htmlFor={`${row.key}-qty`}
                      className="text-sm font-semibold"
                    >
                      {unitLabel}
                    </label>
                    <input
                      id={`${row.key}-qty`}
                      type="number"
                      min="0"
                      step="any"
                      inputMode="decimal"
                      value={row.qty}
                      onChange={(e) => update(row.key, { qty: e.target.value })}
                      placeholder="0"
                      className="bg-background focus:border-primary-600 mt-1.5 min-h-11 w-full rounded-xl border px-3 py-2 text-base outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeRow(row.key)}
                    aria-label={t('removeRow', { number: index + 1 })}
                    className="hover:bg-surface-muted text-muted-foreground inline-flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors hover:text-red-600 dark:hover:bg-white/5"
                  >
                    <Trash2 className="size-5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Per-row estimate. aria-live=off deliberately: with several
                  rows open, announcing each keystroke of each line would bury
                  the grand total, which is the number that matters. */}
              {item && qty > 0 && (
                <p className="text-muted-foreground mt-2.5 text-sm">
                  {qty} {unitShort} ×{' '}
                  <span className="font-medium">
                    {currency} {formatNpr(item.minRate)}
                    {item.minRate !== item.maxRate &&
                      ` – ${formatNpr(item.maxRate)}`}
                  </span>{' '}
                  ={' '}
                  <span className="text-foreground font-semibold">
                    {formatMoneyRange(line, currency)}
                  </span>
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <Button
        type="button"
        onClick={addRow}
        variant="outline"
        size="md"
        className="w-full"
      >
        <Plus aria-hidden="true" />
        {t('addRow')}
      </Button>

      {/* Grand total */}
      <div className="bg-primary-50 dark:bg-primary-950 border-primary-600 rounded-2xl border p-5 text-center">
        <p className="text-sm font-semibold">{t('totalLabel')}</p>
        <p
          /* Re-keying on the formatted value restarts the CSS keyframe every
             time the number actually changes, without a state machine. */
          key={`${total.min}-${total.max}`}
          className="text-primary-900 dark:text-primary-200 animate-total-pop mt-1 text-2xl font-extrabold sm:text-3xl"
          aria-live="polite"
          aria-atomic="true"
        >
          {formatMoneyRange(total, currency)}
        </p>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed text-pretty">
          {t('disclaimer')}
        </p>
      </div>

      {/* Convert the estimate into a lead. Disabled until something is
          actually entered, so the shop never receives an empty summary. */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {filled.length > 0 ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-whatsapp hover:bg-whatsapp-hover flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-center leading-tight font-semibold text-neutral-950 transition-colors"
          >
            <WhatsAppIcon className="size-5 shrink-0" aria-hidden="true" />
            {t('bookOnWhatsApp')}
          </a>
        ) : (
          <span
            aria-disabled="true"
            className="bg-surface-muted text-muted-foreground flex min-h-12 flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-full px-4 py-2 text-center leading-tight font-semibold"
          >
            <WhatsAppIcon className="size-5 shrink-0" aria-hidden="true" />
            {t('bookOnWhatsApp')}
          </span>
        )}

        <Button asChild variant="primary" size="md" className={cn('flex-1')}>
          <Link href="/book">
            <CalendarCheck aria-hidden="true" />
            {t('schedule')}
          </Link>
        </Button>
      </div>

      {!compact && (
        <p className="text-muted-foreground text-center text-sm">
          {t('ratesNote')}
        </p>
      )}
    </div>
  );
}
