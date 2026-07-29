import { Phone } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { telHref } from '@/lib/site-config';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { WhatsAppIcon } from '@/components/shared/BrandIcons';

/**
 * Mobile-only sticky bar for the rates page.
 *
 * Rationale: someone comparing prices needs to convert at the moment a number
 * looks good, without scrolling back to the top.
 *
 * `data-sticky-cta` is the hook that lets globals.css hide the floating
 * Call/WhatsApp buttons on this page at mobile widths — otherwise two
 * identical CTA clusters would stack in the same corner of a 390px screen.
 * Above `md` this bar is hidden and the floating buttons take over again.
 *
 * Ships no JavaScript, same as FloatingActions: these are plain links.
 *
 * `min-h-12` rather than `h-12`: at 320px the Nepali label
 * "अहिले फोन गर्नुहोस्" wraps to two lines, and a fixed height let the second
 * line spill out of the pill. A minimum height keeps the 48px touch target
 * while allowing the button to grow for the one label that needs it.
 */
export async function StickyRatesCta() {
  const t = await getTranslations('rates');
  const tCommon = await getTranslations('common');
  const tFloating = await getTranslations('floating');

  return (
    <div
      data-sticky-cta
      className="bg-background/95 pb-safe fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur md:hidden"
    >
      <div className="container-page py-3">
        <p className="text-muted-foreground mb-2 text-center text-xs font-medium">
          {t('stickyPrompt')}
        </p>
        <div className="flex gap-2">
          <a
            href={telHref}
            className="bg-accent hover:bg-accent-hover flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-center leading-tight font-semibold text-neutral-950 transition-colors"
          >
            <Phone className="size-5" aria-hidden="true" />
            {tCommon('callNow')}
          </a>
          <a
            href={buildWhatsAppUrl(tFloating('prefilledMessage'))}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-whatsapp hover:bg-whatsapp-hover flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-center leading-tight font-semibold text-neutral-950 transition-colors"
          >
            <WhatsAppIcon className="size-5" aria-hidden="true" />
            {tCommon('whatsapp')}
          </a>
        </div>
      </div>
    </div>
  );
}
