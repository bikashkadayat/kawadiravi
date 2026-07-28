import { MapPin, Phone } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';

import { siteConfig, telHref } from '@/lib/site-config';
import { Button } from '@/components/ui/button';
import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { SectionHeading } from '@/components/shared/SectionHeading';

/**
 * Service-area list.
 *
 * Doubles as local SEO surface: these are the place names people actually
 * search alongside "kawadi", so rendering them as real text (not an image or a
 * map embed) is what makes the page findable for "kawadi in Bhaktapur".
 */
export async function CoverageArea() {
  const t = await getTranslations('home.coverage');
  const tCommon = await getTranslations('common');
  const locale = await getLocale();

  return (
    <AnimatedSection className="container-page py-16 sm:py-20">
      <SectionHeading title={t('title')} subtitle={t('subtitle')} />

      <ul className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-3">
        {siteConfig.coverage.map((area) => (
          <li
            key={area.nameEn}
            className="bg-surface hover:border-primary-400 flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors"
          >
            <MapPin
              className="text-primary-700 dark:text-primary-300 size-4 shrink-0"
              aria-hidden="true"
            />
            {locale === 'ne' ? area.nameNe : area.nameEn}
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-col items-center gap-4">
        <p className="text-muted-foreground max-w-lg text-center text-pretty">
          {t('note')}
        </p>
        <Button asChild variant="call" size="md">
          <a href={telHref}>
            <Phone aria-hidden="true" />
            {tCommon('callNow')}
          </a>
        </Button>
      </div>
    </AnimatedSection>
  );
}
