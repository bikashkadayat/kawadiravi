import { Phone, Truck } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { siteConfig, telHref } from '@/lib/site-config';

/**
 * Thin strip above the header: the free-pickup promise plus a tappable number.
 *
 * A server component — it has no state and no interactivity beyond a plain
 * link, so it ships zero JS. The phone number is hidden on the smallest
 * screens because the floating Call button already covers that case there, and
 * the bar would otherwise wrap onto two lines.
 */
export async function AnnouncementBar() {
  const t = await getTranslations('announcement');

  return (
    <div className="bg-primary-900 text-primary-50 text-sm">
      <div className="container-page flex h-10 items-center justify-center gap-4 sm:justify-between">
        <p className="flex items-center gap-2">
          <Truck className="size-4 shrink-0" aria-hidden="true" />
          <span>{t('freePickup')}</span>
        </p>

        <a
          href={telHref}
          className="hidden items-center gap-2 font-semibold underline-offset-4 hover:underline sm:flex"
        >
          <Phone className="size-4 shrink-0" aria-hidden="true" />
          <span>
            {t('callUs')}: {siteConfig.phoneDisplay}
          </span>
        </a>
      </div>
    </div>
  );
}
