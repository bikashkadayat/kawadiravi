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

/** Category keys. Order here is the order sections render on /rates. */
export const RATE_CATEGORIES = [
  'metals',
  'paper',
  'plastic',
  'battery',
  'ewaste',
] as const;

export type RateCategory = (typeof RATE_CATEGORIES)[number];
export type RateUnit = 'kg' | 'piece';

const RateItemSchema = z
  .object({
    id: z
      .string()
      .min(1)
      .regex(/^[a-z0-9-]+$/, 'id must be lowercase kebab-case'),
    category: z.enum(RATE_CATEGORIES),
    nameEn: z.string().min(1),
    nameNe: z.string().min(1),
    unit: z.enum(['kg', 'piece']),
    minRate: z.number().int().positive(),
    maxRate: z.number().int().positive(),
    noteEn: z.string().optional(),
    noteNe: z.string().optional(),
    icon: z.string().min(1),
    featured: z.boolean().optional().default(false),
  })
  .refine((item) => item.maxRate >= item.minRate, {
    message: 'maxRate must be greater than or equal to minRate',
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

/** "900 – 1,100" or just "900" when the range is a single value. */
export function formatRateRange(item: Rate): string {
  const min = item.minRate.toLocaleString('en-US');
  const max = item.maxRate.toLocaleString('en-US');
  return min === max ? min : `${min} – ${max}`;
}
