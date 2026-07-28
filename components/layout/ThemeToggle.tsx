'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

/**
 * Light/dark switch.
 *
 * BOTH icons are always rendered and CSS picks which one is visible, keyed off
 * the `.dark` class that next-themes puts on <html>. This deliberately avoids
 * the usual `mounted` state guard: the server cannot know the stored theme, so
 * choosing an icon during render would either mismatch on hydration or need a
 * setState-in-effect (which cascades a second render, and React's
 * `set-state-in-effect` lint rule rightly rejects).
 *
 * Because next-themes sets the class in a blocking script before first paint,
 * the correct icon is showing from the very first frame with no flash.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations('theme');
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label={t('toggle')}
      className={cn(
        'hover:bg-surface-muted inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors dark:hover:bg-white/10',
        className,
      )}
    >
      <Moon className="size-5 dark:hidden" aria-hidden="true" />
      <Sun className="hidden size-5 dark:block" aria-hidden="true" />
    </button>
  );
}
