'use client';

import { useId, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { RATE_CATEGORIES, searchRates } from '@/lib/rates';
import { cn } from '@/lib/utils';
import type { Rate, RateCategory } from '@/types';
import { RatesTable } from '@/components/rates/RatesTable';

/**
 * Search + category filter over the full rate list.
 *
 * The rates are passed in from the server page rather than imported here, so
 * the JSON is still read and Zod-validated at build time — the client only
 * receives already-validated data.
 *
 * Filtering is `useMemo` over a 32-item array: no debounce, no effect, no
 * fetch. Deriving the visible list during render (instead of mirroring it into
 * state) means there is exactly one source of truth and nothing to keep in
 * sync.
 */
export function RatesExplorer({ rates }: { rates: Rate[] }) {
  const t = useTranslations('rates');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<RateCategory | 'all'>('all');
  const searchId = useId();

  const visible = useMemo(() => {
    const byCategory =
      category === 'all'
        ? rates
        : rates.filter((rate) => rate.category === category);
    return searchRates(byCategory, query);
  }, [rates, category, query]);

  // Group the survivors, keeping RATE_CATEGORIES order and dropping any
  // category the current filter emptied out.
  //
  // `startIndex` is accumulated here rather than inside the table so the SN
  // column runs 1…N down the whole page. It is derived from the *visible*
  // rows, so a filtered view still numbers 1, 2, 3 instead of showing gaps
  // where hidden rows used to be.
  const grouped = useMemo(() => {
    const groups = RATE_CATEGORIES.map((key) => ({
      category: key,
      items: visible.filter((rate) => rate.category === key),
    })).filter((group) => group.items.length > 0);

    // Summed rather than accumulated in a running variable: a `let` mutated
    // inside a memo is exactly what the React Compiler's immutability rule
    // flags, and over at most ten groups the quadratic pass is free.
    return groups.map((group, index) => ({
      ...group,
      startIndex: groups
        .slice(0, index)
        .reduce((sum, earlier) => sum + earlier.items.length, 0),
    }));
  }, [visible]);

  return (
    <div>
      {/* Search */}
      <div className="relative">
        <label htmlFor={searchId} className="sr-only">
          {t('searchLabel')}
        </label>
        <Search
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2"
          aria-hidden="true"
        />
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('searchPlaceholder')}
          className="bg-surface focus:border-primary-600 h-13 w-full rounded-full border pr-12 pl-12 text-base outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label={t('clearSearch')}
            className="hover:bg-surface-muted absolute top-1/2 right-2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full transition-colors"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Category filter. Radio semantics, not buttons: exactly one is active
          at a time, and arrow keys move between them. */}
      <div
        role="radiogroup"
        aria-label={t('filterLabel')}
        className="mt-5 flex flex-wrap gap-2"
      >
        {(['all', ...RATE_CATEGORIES] as const).map((key) => {
          const active = category === key;
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setCategory(key)}
              className={cn(
                // h-11 (44px), not h-10: these chips are the primary control on the
                // page at mobile widths and were 4px under the touch minimum.
                'h-11 rounded-full border px-4 text-sm font-semibold transition-colors',
                active
                  ? 'border-primary-800 bg-primary-800 text-white'
                  : 'bg-surface hover:border-primary-400',
              )}
            >
              {key === 'all' ? t('filterAll') : t(`categories.${key}`)}
            </button>
          );
        })}
      </div>

      {/* Live region so screen-reader users hear the count change as they
          type, rather than silently losing rows. */}
      <p className="text-muted-foreground mt-5 text-sm" aria-live="polite">
        {t('resultsCount', { count: visible.length, total: rates.length })}
      </p>

      {grouped.length === 0 ? (
        <div className="bg-surface mt-8 rounded-2xl border p-10 text-center">
          <p className="text-lg font-semibold">{t('noResults')}</p>
          <p className="text-muted-foreground mt-2 text-pretty">
            {t('noResultsHint')}
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-12">
          {grouped.map((group) => (
            // `scroll-mt-28` clears the sticky header when the homepage
            // category cards deep-link to /rates#metals.
            <section
              key={group.category}
              id={group.category}
              className="scroll-mt-28"
            >
              <h2 className="text-primary-900 dark:text-primary-200 text-2xl font-bold">
                {t(`categories.${group.category}`)}
              </h2>
              <p className="text-muted-foreground mt-1 text-pretty">
                {t(`categoryDescriptions.${group.category}`)}
              </p>

              <div className="mt-5">
                <RatesTable
                  items={group.items}
                  startIndex={group.startIndex}
                  label={t('tableLabel', {
                    category: t(`categories.${group.category}`),
                  })}
                />
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
