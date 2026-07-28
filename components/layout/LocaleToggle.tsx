'use client';

import { useTransition } from 'react';
import { Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { usePathname, useRouter } from '@/i18n/routing';
import { routing } from '@/i18n/routing';
import { cn } from '@/lib/utils';

/**
 * English ⇄ नेपाली switch.
 *
 * next-intl's `usePathname` returns the path with the locale prefix already
 * stripped, so pushing it back with a different `locale` lands the user on the
 * SAME page in the other language rather than dumping them on the homepage.
 *
 * The swap is a server round-trip (messages are server-side), hence
 * `useTransition` — it keeps the old page interactive and lets us dim the
 * control instead of freezing the UI.
 */
export function LocaleToggle({ className }: { className?: string }) {
  const t = useTranslations('locale');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Two locales, so this is a straight swap rather than a dropdown.
  const nextLocale = routing.locales.find((l) => l !== locale) ?? locale;

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(() => {
          router.replace(pathname, { locale: nextLocale });
        })
      }
      // The accessible name must CONTAIN the visible text (WCAG 2.5.3, "Label
      // in Name), otherwise a speech-input user saying the visible word
      // "नेपाली" cannot activate the control.
      aria-label={`${t('switch')}: ${t(nextLocale)}`}
      className={cn(
        'hover:bg-surface-muted inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors disabled:opacity-60 dark:hover:bg-white/10',
        className,
      )}
    >
      <Globe className="size-4 shrink-0" aria-hidden="true" />
      {/* Label shows the language you would switch TO, which is the
          convention users expect from a two-language switch. */}
      <span>{t(nextLocale)}</span>
    </button>
  );
}
