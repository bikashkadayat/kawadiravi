import { cn } from '@/lib/utils';

/**
 * The "KTM Kawadi" wordmark, two-tone.
 *
 * WHY "KTM" IS A GOLD CHIP RATHER THAN GOLD TEXT
 *
 * The accent gold (#F4B113, sampled from the logo's tagline rule) on the light
 * header measures **1.79:1**. WCAG AA needs 4.5:1 for body text and 3:1 even
 * for large text, so gold lettering on a light background fails — and this is
 * the company's own name, the single most important string on the page. Any
 * gold dark enough to pass reads as brown, not gold.
 *
 * Putting the gold in the *background* of a chip and the text in near-black
 * gives 10.71:1, keeps the gold every bit as prominent, and looks identical in
 * light and dark themes. "Kawadi" then carries the brand green.
 *
 * If the plain-gold-text look is preferred despite the contrast cost, swap
 * the chip span for `text-accent` — it is a one-line change, isolated here.
 */
export function Wordmark({
  className,
  chipClassName,
  onDark = false,
}: {
  className?: string;
  /** Override chip sizing where the wordmark is larger (e.g. the footer). */
  chipClassName?: string;
  /**
   * Render for a permanently dark surface (the footer), regardless of theme.
   *
   * Without this the footer got the LIGHT-mode colour — `dark:` only responds
   * to the page theme, and the footer is dark in both. "Kawadi" was therefore
   * primary-900 on a near-black panel: 1.42:1, effectively invisible, on every
   * page. That predates the rebrand (it was green-on-green before) and is only
   * visible now because the audit measures rather than eyeballs.
   */
  onDark?: boolean;
}) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span
        className={cn(
          'bg-accent rounded-md px-1.5 py-0.5 leading-none text-neutral-950',
          chipClassName,
        )}
      >
        KTM
      </span>
      <span
        className={
          onDark ? 'text-primary-200' : 'text-primary-900 dark:text-primary-200'
        }
      >
        Kawadi
      </span>
    </span>
  );
}
