/**
 * Scrap value calculator: arithmetic, formatting, and the WhatsApp summary.
 *
 * Pure functions only, no React — the component owns state and markup, this
 * owns the numbers. That split means the money maths can be reasoned about
 * (and corrected) without reading any JSX.
 *
 * Every rate comes from `getAllRates()`, i.e. the same Zod-validated
 * `data/rates.json` that /rates and the homepage preview read. Editing one
 * number in that file changes the calculator with no code change anywhere.
 *
 * Only an item's PRIMARY quote is used. Several items are also quoted a second
 * way (a motor is Rs. 300–500/pc or Rs. 40–50/kg); asking the seller to pick a
 * pricing method per row would double the width of every row to remove an
 * ambiguity that the shop resolves on site anyway.
 */

import { getAllRates, type Rate } from '@/lib/rates';
import { siteConfig } from '@/lib/site-config';

/** One line of the calculation. `qty` is kept as the raw string the user
 *  typed, so a half-typed "1." does not get rewritten under the cursor. */
export interface CalcRow {
  /** Stable key for React; unrelated to the rate id, since the same item may
   *  legitimately appear on two rows (e.g. two different grades of the same
   *  metal quoted separately by the seller). */
  key: string;
  itemId: string;
  qty: string;
}

export interface Money {
  min: number;
  max: number;
}

/**
 * Parse a quantity field.
 *
 * Anything unparseable is 0 rather than NaN — a NaN would propagate through
 * every sum and blank the entire total, so one mistyped character would make
 * the whole calculator look broken.
 */
export function parseQty(raw: string): number {
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

/** Estimated range for a single row. */
export function lineTotal(item: Rate | undefined, qty: number): Money {
  if (!item) return { min: 0, max: 0 };
  return { min: item.minRate * qty, max: item.maxRate * qty };
}

/** Sum of every row. Rows with no item selected or no quantity contribute 0. */
export function grandTotal(rows: CalcRow[], lookup: Map<string, Rate>): Money {
  return rows.reduce<Money>(
    (acc, row) => {
      const line = lineTotal(lookup.get(row.itemId), parseQty(row.qty));
      return { min: acc.min + line.min, max: acc.max + line.max };
    },
    { min: 0, max: 0 },
  );
}

/**
 * Money formatting.
 *
 * `en-US` grouping on BOTH locales, deliberately. `Intl.NumberFormat('ne-NP')`
 * renders Devanagari digits with lakh grouping (१२,३४,५६७), but every rate
 * already on this site goes through `formatRateRange`, which is hard-coded to
 * `en-US`. Using the "more correct" Nepali formatting here would make the
 * calculator disagree with the rates table printed directly above it on the
 * homepage, which reads as a bug rather than as localisation.
 *
 * Rounded to whole rupees: the inputs are the seller's own rough guess at a
 * weight, so decimal precision in the output would imply an accuracy that
 * does not exist.
 */
export function formatNpr(value: number): string {
  return Math.round(value).toLocaleString('en-US');
}

/** "रु. 4,500 – रु. 5,500", collapsing to one figure when min === max. */
export function formatMoneyRange(money: Money, currency: string): string {
  const min = formatNpr(money.min);
  const max = formatNpr(money.max);
  return min === max
    ? `${currency} ${min}`
    : `${currency} ${min} – ${currency} ${max}`;
}

/** Fast id → Rate lookup, built once per render rather than per row. */
export function buildRateLookup(): Map<string, Rate> {
  return new Map(getAllRates().map((rate) => [rate.id, rate]));
}

/**
 * Rows that actually contribute something — an item is chosen AND the
 * quantity is greater than zero. Used for both the total and the message, so
 * a half-filled row can never appear in one but not the other.
 */
export function activeRows(
  rows: CalcRow[],
  lookup: Map<string, Rate>,
): { item: Rate; qty: number }[] {
  return rows
    .map((row) => ({ item: lookup.get(row.itemId), qty: parseQty(row.qty) }))
    .filter((r): r is { item: Rate; qty: number } => !!r.item && r.qty > 0);
}

/** Nepali unit word. The rates file quotes items per kilo, per piece AND per
 *  amp-hour, so this cannot be a constant. */
const UNIT_NE: Record<Rate['unit'], string> = {
  kg: 'के.जी.',
  piece: 'गोटा',
  ah: 'एएच',
};

function unitNe(unit: Rate['unit']): string {
  return UNIT_NE[unit];
}

/**
 * Compose the WhatsApp summary.
 *
 * ALWAYS NEPALI, on both locales — the same rule as every other WhatsApp
 * message on this site. The customer reads the calculator in their own
 * language; the shop reads this, and the shop works in Nepali.
 *
 * The estimate is restated as a range and explicitly labelled an estimate, so
 * nobody arrives believing a single number was promised.
 */
export function buildCalculatorMessage(
  rows: CalcRow[],
  lookup: Map<string, Rate>,
): string {
  const active = activeRows(rows, lookup);
  const total = active.reduce<Money>(
    (acc, { item, qty }) => {
      const line = lineTotal(item, qty);
      return { min: acc.min + line.min, max: acc.max + line.max };
    },
    { min: 0, max: 0 },
  );

  const lines = active.map(
    ({ item, qty }) => `♻️ ${item.nameNe}: ${qty} ${unitNe(item.unit)}`,
  );

  return [
    `नमस्ते ${siteConfig.name}! 🙏 मैले अनुमानित मूल्य हेरें:`,
    ...lines,
    `💰 अनुमानित मूल्य: रु. ${formatNpr(total.min)} – रु. ${formatNpr(total.max)}`,
    'कृपया पिकअप मिलाइदिनुहोस्।',
  ].join('\n');
}
