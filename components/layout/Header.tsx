'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link, usePathname } from '@/i18n/routing';
import { isActivePath, navItems } from '@/lib/nav';
import { telHref } from '@/lib/site-config';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LocaleToggle } from '@/components/layout/LocaleToggle';
import { MobileNav } from '@/components/layout/MobileNav';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

/**
 * Sticky site header.
 *
 * Client-side because it tracks both the active route (to mark the current nav
 * item) and scroll position (to raise a shadow once the page moves, which
 * separates the bar from content without a permanent border).
 */
export function Header() {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll(); // Run once: the page may load already scrolled.
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'bg-background/95 sticky top-0 z-40 backdrop-blur transition-shadow',
        scrolled ? 'shadow-md' : 'border-b',
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        {/* Logo + wordmark, always links home. */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/logo-mark.png"
            alt=""
            width={40}
            height={40}
            priority
            className="size-10 rounded-full"
          />
          <span className="text-primary-900 dark:text-primary-300 text-lg font-extrabold tracking-tight sm:text-xl">
            {tCommon('brand')}
          </span>
        </Link>

        {/* Desktop navigation. */}
        <nav aria-label={t('mainNavigation')} className="hidden md:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'inline-flex h-10 items-center rounded-full px-3 text-sm font-medium transition-colors',
                      active
                        ? // primary-900 in dark, NOT primary-950 — the latter is
                          // the dark background colour, so the highlight would
                          // be invisible against it.
                          'bg-primary-50 text-primary-900 dark:bg-primary-900 dark:text-white'
                        : 'hover:bg-surface-muted dark:hover:bg-white/5',
                    )}
                  >
                    {t(item.labelKey)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <LocaleToggle className="hidden sm:inline-flex" />
          <ThemeToggle />

          {/* Secondary CTA — rates are the main trust-builder before a call. */}
          <Button
            asChild
            variant="outline"
            size="sm"
            className="ml-1 hidden lg:inline-flex"
          >
            <Link href="/rates">{tCommon('viewRates')}</Link>
          </Button>

          {/* Primary CTA. Gold = call, same as the floating button. */}
          <Button asChild variant="call" size="sm" className="ml-1 hidden md:inline-flex">
            <a href={telHref}>
              <Phone aria-hidden="true" />
              {tCommon('callNow')}
            </a>
          </Button>

          <MobileNav />
        </div>
      </div>
    </header>
  );
}
