import { Phone } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { siteConfig, telHref } from '@/lib/site-config';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { Button } from '@/components/ui/button';
import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { WhatsAppIcon } from '@/components/shared/BrandIcons';

/**
 * Closing call to action.
 *
 * Sits immediately before the footer to catch the reader who scrolled the
 * whole page — by this point they have the rates, the process and the trust
 * signals, so this is the highest-intent moment on the page.
 */
export async function CtaBand() {
  const t = await getTranslations('home.cta');
  const tCommon = await getTranslations('common');

  return (
    // No bottom padding: this is always the last section, and the footer
    // supplies its own top margin. Adding both left a dead gap.
    <AnimatedSection className="container-page">
      <div className="bg-primary-900 relative overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-12">
        <h2 className="text-3xl font-extrabold tracking-tight text-balance text-white sm:text-4xl">
          {t('title')}
        </h2>

        <p className="text-primary-100 mx-auto mt-4 max-w-xl text-lg text-pretty">
          {t('subtitle')}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="call" size="lg">
            <a href={telHref}>
              <Phone aria-hidden="true" />
              {siteConfig.phoneDisplay}
            </a>
          </Button>
          <Button asChild variant="whatsapp" size="lg">
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon aria-hidden="true" />
              {tCommon('whatsappUs')}
            </a>
          </Button>
        </div>

        <p className="text-primary-200 mt-6 text-sm">{t('note')}</p>
      </div>
    </AnimatedSection>
  );
}
