/**
 * Typed loader + helpers for `data/rates.json`.
 *
 * The JSON is validated with Zod at *module load* time. Because every page that
 * shows rates is statically generated, that means a malformed edit fails
 * `npm run build` with a precise path (e.g. `items[7].maxRate`) instead of
 * shipping a broken row to production. This is the whole reason Zod is a
 * dependency — see docs/ARCHITECTURE.md §7.
 */

import { z } from 'zod';
import ratesData from '@/data/rates.json';

/**
 * Category keys. Order here is the order sections render on /rates, and
 * therefore the order the SN column counts in.
 *
 * The five original keys keep their names so the deep links the homepage and
 * services page emit (`/rates#metals`, `#paper`, …) survive the expansion.
 */
export const RATE_CATEGORIES = [
  'metals',
  'wires',
  'paper',
  'plastic',
  'glass',
  'battery',
  'appliances',
  'computers',
  'mobile',
  'ewaste',
] as const;

export type RateCategory = (typeof RATE_CATEGORIES)[number];

/**
 * How a price is quoted. `ah` is amp-hours: batteries are bought on capacity,
 * which is stamped on the label, so a customer can read their own rate off the
 * table without owning a scale.
 */
export const RATE_UNITS = ['kg', 'piece', 'ah'] as const;
export type RateUnit = (typeof RATE_UNITS)[number];

/**
 * Rates are NOT integers. Lead is quoted at Rs. 1–1.5 per piece, so `.int()`
 * here would reject the real price list.
 */
const AmountSchema = z.number().positive();

/** The secondary way an item may be quoted, e.g. "per piece OR per kg". */
const AltPricingSchema = z
  .object({
    unit: z.enum(RATE_UNITS),
    minRate: AmountSchema,
    maxRate: AmountSchema,
  })
  .refine((alt) => alt.maxRate >= alt.minRate, {
    message: 'maxRate must be greater than or equal to minRate',
    path: ['maxRate'],
  });

const RateItemSchema = z
  .object({
    id: z
      .string()
      .min(1)
      .regex(/^[a-z0-9-]+$/, 'id must be lowercase kebab-case'),
    category: z.enum(RATE_CATEGORIES),
    nameEn: z.string().min(1),
    nameNe: z.string().min(1),
    unit: z.enum(RATE_UNITS),
    minRate: AmountSchema,
    maxRate: AmountSchema,
    /**
     * True when only a floor price is published, so the table reads
     * "Starting from Rs. 700/pc" instead of quoting a range the shop has not
     * actually committed to. Such items carry minRate === maxRate.
     */
    startingFrom: z.boolean().optional().default(false),
    /** Optional second quote. The calculator always uses the primary one. */
    alt: AltPricingSchema.optional(),
    noteEn: z.string().optional(),
    noteNe: z.string().optional(),
    icon: z.string().min(1),
    featured: z.boolean().optional().default(false),
  })
  .refine((item) => item.maxRate >= item.minRate, {
    message: 'maxRate must be greater than or equal to minRate',
    path: ['maxRate'],
  })
  .refine((item) => !item.alt || item.alt.unit !== item.unit, {
    message: 'alt.unit must differ from unit — two quotes in the same unit is a typo',
    path: ['alt', 'unit'],
  })
  .refine((item) => !item.startingFrom || item.minRate === item.maxRate, {
    message:
      'a startingFrom item publishes one floor price, so minRate must equal maxRate',
    path: ['maxRate'],
  });

const RatesFileSchema = z
  .object({
    updatedAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'updatedAt must be an ISO date (YYYY-MM-DD)'),
    currency: z.string().min(1),
    items: z.array(RateItemSchema).min(1),
  })
  .superRefine((file, ctx) => {
    // Duplicate ids would silently collide as React keys and break the filter.
    const seen = new Set<string>();
    file.items.forEach((item, i) => {
      if (seen.has(item.id)) {
        ctx.addIssue({
          // String literal rather than `z.ZodIssueCode.custom` so this compiles
          // against both Zod 3 and Zod 4.
          code: 'custom',
          message: `Duplicate rate id "${item.id}"`,
          path: ['items', i, 'id'],
        });
      }
      seen.add(item.id);
    });
  });

export type Rate = z.infer<typeof RateItemSchema>;
export type RatesFile = z.infer<typeof RatesFileSchema>;

/**
 * Parse once at module load. `safeParse` + explicit throw gives a far more
 * readable build error than Zod's default stack.
 */
function loadRates(): RatesFile {
  const parsed = RatesFileSchema.safeParse(ratesData);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  • ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');

    throw new Error(
      `Invalid data/rates.json — the build was stopped so a broken rate cannot reach production:\n${details}`,
    );
  }

  return parsed.data;
}

const rates = loadRates();

/** The whole validated file. */
export function getRatesFile(): RatesFile {
  return rates;
}

/** Every rate item, in file order. */
export function getAllRates(): Rate[] {
  return rates.items;
}

/** ISO date the owner last touched the prices. */
export function getRatesUpdatedAt(): string {
  return rates.updatedAt;
}

/** Items flagged `featured: true`, for the homepage preview. */
export function getFeaturedRates(limit?: number): Rate[] {
  const featured = rates.items.filter((item) => item.featured);
  return typeof limit === 'number' ? featured.slice(0, limit) : featured;
}

/** Items of one category. */
export function getRatesByCategory(category: RateCategory): Rate[] {
  return rates.items.filter((item) => item.category === category);
}

/**
 * All categories that actually have items, in `RATE_CATEGORIES` order.
 * Deriving this from the data means deleting the last item of a category
 * removes its section automatically — no second place to edit.
 */
export function getPopulatedCategories(): RateCategory[] {
  return RATE_CATEGORIES.filter((category) =>
    rates.items.some((item) => item.category === category),
  );
}

/** Items grouped by category, ready to render as sections. */
export function getGroupedRates(): { category: RateCategory; items: Rate[] }[] {
  return getPopulatedCategories().map((category) => ({
    category,
    items: getRatesByCategory(category),
  }));
}

/**
 * Case-insensitive search across BOTH language names and the id, so a Nepali
 * speaker typing "तामा" and an English speaker typing "copper" both match.
 */
export function searchRates(items: Rate[], query: string): Rate[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;

  return items.filter(
    (item) =>
      item.nameEn.toLowerCase().includes(q) ||
      item.nameNe.includes(query.trim()) ||
      item.id.includes(q),
  );
}

/**
 * "800–1,000", "1–1.5", or just "900" when the range is a single value.
 *
 * `en-US` grouping on both locales, matching `formatNpr` in lib/calculator.ts —
 * see the note there for why the calculator and the rates table must not
 * disagree about how a number looks.
 *
 * Up to one decimal place, because Rs. 1–1.5/pc is a real quoted price and
 * rounding it to "1–2" would overstate what the shop pays.
 */
export function formatAmountRange(min: number, max: number): string {
  const format = (n: number) =>
    n.toLocaleString('en-US', { maximumFractionDigits: 1 });
  const lo = format(min);
  const hi = format(max);
  return lo === hi ? lo : `${lo}–${hi}`;
}

/** Convenience wrapper for an item's primary quote. */
export function formatRateRange(item: Rate): string {
  return formatAmountRange(item.minRate, item.maxRate);
}

/** One quoted price: a unit and the range it applies to. */
export interface RatePricing {
  unit: RateUnit;
  minRate: number;
  maxRate: number;
}

/**
 * Every way an item is quoted — the primary quote first, then `alt` if the
 * item has one. Returning a list (rather than the caller reaching for `.alt`)
 * means the table renders one row of markup per quote and adding a third
 * pricing method later touches only the schema.
 */
export function getRatePricings(item: Rate): RatePricing[] {
  const primary: RatePricing = {
    unit: item.unit,
    minRate: item.minRate,
    maxRate: item.maxRate,
  };
  return item.alt ? [primary, item.alt] : [primary];
}

/**
 * "August 2026" / "अगस्ट २०२६" from the ISO `updatedAt`.
 *
 * Month names are a literal table rather than `Intl.DateTimeFormat`: the `ne`
 * locale's output depends on which ICU data the build machine ships, and a
 * date that renders differently in CI than locally is worse than a table of
 * twelve strings. Parsed by hand for the same reason `new Date('2026-08-01')`
 * is timezone-sensitive and can slip to July in a negative-offset build.
 */
const MONTHS: Record<'en' | 'ne', readonly string[]> = {
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
  ne: [
    'जनवरी', 'फेब्रुअरी', 'मार्च', 'अप्रिल', 'मे', 'जुन',
    'जुलाई', 'अगस्ट', 'सेप्टेम्बर', 'अक्टोबर', 'नोभेम्बर', 'डिसेम्बर',
  ],
};

export function formatUpdatedAt(iso: string, locale: string): string {
  const [year, month] = iso.split('-');
  const names = locale === 'ne' ? MONTHS.ne : MONTHS.en;
  const name = names[Number(month) - 1];
  // Fall back to the raw ISO string rather than printing "undefined 2026" if
  // the date is ever malformed past Zod's regex.
  return name ? `${name} ${year}` : iso;
}
