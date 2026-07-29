import { CalendarCheck, Phone } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/routing';
import { telHref } from '@/lib/site-config';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { WhatsAppIcon } from '@/components/shared/BrandIcons';

/**
 * ★ The two conversions the whole site exists to produce, pinned to the corner
 * of every page at every breakpoint.
 *
 * THIS COMPONENT SHIPS NO JAVASCRIPT, ON PURPOSE. An earlier version used
 * Framer Motion, which server-renders the hidden start frame
 * (`opacity: 0`) and only reveals the buttons once the bundle has hydrated —
 * so a slow or failed JS load left the site with no way to convert at all.
 * The entrance is now a CSS keyframe (`.animate-float-in`) and the hover
 * effect a CSS transform, so the buttons are usable the moment HTML paints.
 *
 * Other deliberate choices:
 * - `fixed bottom-0 right-0` + `pb-safe` clears the iOS home indicator.
 * - `z-50` sits above page content but below the mobile nav sheet (z-60), so
 *   an open menu is never obscured.
 * - Real <a href> elements: they work without JS, support long-press and
 *   "open in new tab", and are keyboard reachable.
 * - Icon-only below `lg`, where thumb room is scarce; the aria-label carries
 *   the meaning for screen readers at every size.
 */
export async function FloatingActions() {
  const t = await getTranslations('floating');
  const tCommon = await getTranslations('common');
  const tBooking = await getTranslations('booking');

  return (
    // `floating-actions` is a styling hook, not a Tailwind class: globals.css
    // uses it to hide these buttons on pages that render their own sticky
    // bottom CTA at mobile widths (see the `[data-sticky-cta]` rule).
    <aside
      aria-label={t('label')}
      className="floating-actions pb-safe pointer-events-none fixed right-0 bottom-0 z-50 p-4 sm:p-6"
    >
      <div className="pointer-events-auto flex flex-col items-end gap-3">
        {/*
          Book — brand green with white text (5.85:1).

          Deliberately a DIFFERENT green from the WhatsApp button below it:
          primary-800 is a dark forest green against WhatsApp's #25D366, so the
          two never read as the same control at a glance. Colour meaning is
          load-bearing on this site (gold = call, #25D366 = WhatsApp), and this
          adds a third without borrowing either.

          Adding this button took the stack from ~148px to ~208px tall (216px
          from `sm`), which is why `Footer` reserves 14rem/15rem at the bottom.
          The two are coupled: change the button count here and the footer's
          padding must be re-measured, or its last rows go back under these.

          On /book the button hides itself — see the [data-booking-page] rule
          in globals.css — because it would link to the current page.
        */}
        <Link
          href="/book"
          data-floating-book
          aria-label={tBooking('cta')}
          className="bg-primary-800 hover:bg-primary-900 shadow-float animate-float-in flex h-14 items-center gap-2 rounded-full px-4 text-white transition-transform duration-200 [animation-delay:300ms] hover:scale-105 active:scale-95 sm:px-5"
        >
          <CalendarCheck className="size-7 shrink-0" aria-hidden="true" />
          <span className="hidden font-semibold lg:inline">
            {tBooking('cta')}
          </span>
        </Link>

        {/* WhatsApp — brand green with near-black text (9.96:1). */}
        <a
          href={buildWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('whatsappLabel')}
          className="bg-whatsapp hover:bg-whatsapp-hover shadow-float animate-float-in flex h-14 items-center gap-2 rounded-full px-4 text-neutral-950 transition-transform duration-200 [animation-delay:450ms] hover:scale-105 active:scale-95 sm:px-5"
        >
          <WhatsAppIcon className="size-7 shrink-0" aria-hidden="true" />
          <span className="hidden font-semibold lg:inline">
            {tCommon('whatsapp')}
          </span>
        </a>

        {/* Call — gold with near-black text (11.5:1). Gold always means call. */}
        <a
          href={telHref}
          aria-label={t('callLabel')}
          className="bg-accent hover:bg-accent-hover shadow-float animate-float-in flex h-14 items-center gap-2 rounded-full px-4 text-neutral-950 transition-transform duration-200 [animation-delay:600ms] hover:scale-105 active:scale-95 sm:px-5"
        >
          <Phone className="size-7 shrink-0" aria-hidden="true" />
          <span className="hidden font-semibold lg:inline">
            {tCommon('callNow')}
          </span>
        </a>
      </div>
    </aside>
  );
}
