import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/routing';
import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { SectionHeading } from '@/components/shared/SectionHeading';

/** Shared styling for the three inline links, so they read as one set. */
const LINK_CLASS =
  'text-primary-800 dark:text-primary-300 font-semibold underline underline-offset-4 hover:no-underline';

/**
 * Keyword-bearing introduction, directly under the hero.
 *
 * The hero has to be short to convert, which left the homepage with almost no
 * indexable prose — and a page whose only body text is button labels has
 * nothing for Google to match "kawadi kathmandu" against. This section is that
 * body text. It is written for a human first (it explains what "kawadi" covers,
 * which genuinely helps a visitor who searched the English word) and the search
 * terms fall out of the explanation rather than being sprinkled in.
 *
 * It also carries the homepage's only descriptive internal links. Site-wide
 * navigation says "Rates" and "Services"; anchor text like "see today's kawadi
 * rates in Kathmandu" is what actually passes the phrase to the linked page.
 */
export async function Intro() {
  const t = await getTranslations('home.intro');

  /**
   * Tag handlers, not `{placeholder}` values.
   *
   * next-intl types rich values as `string | number | Date | RichTagsFunction`,
   * so a React element cannot be passed as a plain placeholder value — the only
   * way to wrap translated text in a component is a tag. That is the better
   * arrangement regardless: the anchor text now lives in the message file with
   * the sentence around it, so a translator can reorder the whole thing.
   */
  const tags = {
    rates: (chunks: ReactNode) => (
      <Link href="/rates" className={LINK_CLASS}>
        {chunks}
      </Link>
    ),
    services: (chunks: ReactNode) => (
      <Link href="/services" className={LINK_CLASS}>
        {chunks}
      </Link>
    ),
    contact: (chunks: ReactNode) => (
      <Link href="/contact" className={LINK_CLASS}>
        {chunks}
      </Link>
    ),
  };

  return (
    <AnimatedSection className="container-page py-14 sm:py-16">
      <SectionHeading title={t('title')} />

      <div className="mx-auto mt-6 max-w-3xl space-y-4">
        <p className="text-muted-foreground leading-relaxed text-pretty">
          {t('body1')}
        </p>
        <p className="text-muted-foreground leading-relaxed text-pretty">
          {t('body2')}
        </p>
        <p className="leading-relaxed text-pretty">{t.rich('linksLead', tags)}</p>
      </div>
    </AnimatedSection>
  );
}
