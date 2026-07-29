'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { CalendarCheck, Menu, Phone, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link, usePathname } from '@/i18n/routing';
import { isActivePath, navItems } from '@/lib/nav';
import { siteConfig, telHref } from '@/lib/site-config';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';
import { WhatsAppIcon } from '@/components/shared/BrandIcons';
import { LocaleToggle } from '@/components/layout/LocaleToggle';
import { Wordmark } from '@/components/shared/Wordmark';

/**
 * Hamburger menu for phones and tablets.
 *
 * Radix Dialog rather than a hand-rolled panel because it handles the parts
 * that are easy to get wrong: focus trapping, restoring focus to the trigger
 * on close, Escape, scroll locking, and aria-modal wiring.
 *
 * z-[60] puts the sheet above FloatingActions (z-50) so the Call/WhatsApp
 * buttons cannot overlap an open menu.
 *
 * BREAKPOINT: `lg:hidden`, not `md:hidden`. The header's desktop nav used to
 * appear at `md`, which meant that at exactly 768px the bar had to hold the
 * logo, five nav links, both toggles AND the Call button — 855px of content in
 * a 768px viewport, so every page scrolled sideways at tablet width. The
 * trigger and `Header`'s `lg:block` nav are two halves of one switch and must
 * stay on the same breakpoint.
 */
export function MobileNav() {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const tBooking = useTranslations('booking');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label={t('openMenu')}
          className="hover:bg-surface-muted inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors lg:hidden dark:hover:bg-white/10"
        >
          <Menu className="size-6" aria-hidden="true" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="animate-overlay-in fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" />

        <Dialog.Content className="bg-background animate-sheet-in fixed inset-y-0 right-0 z-[60] flex w-[85%] max-w-sm flex-col shadow-xl focus:outline-none">
          {/* Radix requires an accessible title; it is visually hidden because
              the panel's purpose is obvious sighted, but a screen reader still
              needs it announced. */}
          <Dialog.Title className="sr-only">
            {t('mainNavigation')}
          </Dialog.Title>

          <div className="flex h-16 items-center justify-between border-b px-4">
            <Wordmark className="font-extrabold" />
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label={t('closeMenu')}
                className="hover:bg-surface-muted inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors dark:hover:bg-white/10"
              >
                <X className="size-6" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          <nav
            aria-label={t('mainNavigation')}
            className="flex-1 overflow-y-auto p-4"
          >
            <ul className="flex flex-col gap-1">
              {navItems.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex min-h-12 items-center rounded-lg px-4 py-2 text-base font-medium transition-colors',
                        active
                          ? // primary-900 in dark, NOT primary-950 — the latter
                            // is the dark background colour, so the highlight
                            // would be invisible.
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

          {/* The header's LocaleToggle is hidden below `sm`, so without this a
              phone user would have no way to switch language at all. */}
          <div className="border-t px-4 py-3">
            <LocaleToggle className="w-full justify-center" />
          </div>

          {/* Both conversions repeated at the foot of the menu, so a user who
              opened it to navigate can convert without closing it first. */}
          <div className="pb-safe flex flex-col gap-2 border-t p-4">
            {/* Booking first: below `xl` the header has no Book button, so the
                sheet is the primary way into /book on phones and tablets. */}
            <Link
              href="/book"
              onClick={() => setOpen(false)}
              className="bg-primary-800 hover:bg-primary-900 flex min-h-12 items-center justify-center gap-2 rounded-full px-3 py-2 text-center leading-tight font-semibold text-white transition-colors"
            >
              <CalendarCheck className="size-5 shrink-0" aria-hidden="true" />
              {tBooking('cta')}
            </Link>
            <a
              href={telHref}
              className="bg-accent hover:bg-accent-hover flex min-h-12 items-center justify-center gap-2 rounded-full px-3 py-2 text-center leading-tight font-semibold text-neutral-950 transition-colors"
            >
              <Phone className="size-5" aria-hidden="true" />
              {tCommon('callNow')}
            </a>
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-whatsapp hover:bg-whatsapp-hover flex min-h-12 items-center justify-center gap-2 rounded-full px-3 py-2 text-center leading-tight font-semibold text-neutral-950 transition-colors"
            >
              <WhatsAppIcon className="size-5" aria-hidden="true" />
              {tCommon('whatsappUs')}
            </a>
            <p className="text-muted-foreground pt-1 text-center text-xs">
              {siteConfig.phoneDisplay}
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
