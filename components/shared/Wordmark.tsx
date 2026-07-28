import { cn } from '@/lib/utils';

/**
 * The "KTM Kawadi" wordmark, two-tone.
 *
 * WHY "KTM" IS A GOLD CHIP RATHER THAN GOLD TEXT
 *
 * The brand gold (#FFB918) on a white header measures **1.72:1**. WCAG AA needs
 * 4.5:1 for body text and 3:1 even for large text, so gold lettering on a light
 * background fails by a wide margin — and this is the company's own name, the
 * single most important string on the page. Any gold dark enough to pass reads
 * as brown, not gold.
 *
 * Putting the gold in the *background* of a chip and the text in near-black
 * gives 11.5:1, keeps the gold every bit as prominent, and looks identical in
 * light and dark themes. "Kawadi" then carries the brand green.
 *
 * If the plain-gold-text look is preferred despite the contrast cost, swap the
 * chip span for `text-accent` — it is a one-line change, isolated here.
 */
export function Wordmark({
  className,
  chipClassName,
}: {
  className?: string;
  /** Override chip sizing where the wordmark is larger (e.g. the footer). */
  chipClassName?: string;
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
      <span className="text-primary-900 dark:text-primary-200">Kawadi</span>
    </span>
  );
}
