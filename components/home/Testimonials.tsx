import { Quote, Star } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';

import { testimonials } from '@/lib/testimonials';
import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { SectionHeading } from '@/components/shared/SectionHeading';

/**
 * Customer quotes.
 *
 * ⚠️ Currently backed by clearly-labelled PLACEHOLDER data in
 * lib/testimonials.ts — see the warning there. Swap in real, permission-granted
 * reviews before launch.
 *
 * The stars are marked aria-hidden and the rating is exposed as text instead,
 * so a screen reader hears "5 out of 5" once rather than five icon labels.
 */
export async function Testimonials() {
  const t = await getTranslations('home.testimonials');
  const locale = await getLocale();

  return (
    <AnimatedSection className="bg-surface-muted py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading title={t('title')} subtitle={t('subtitle')} />

        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <li
              key={item.id}
              className="bg-background flex flex-col rounded-2xl border p-6"
            >
              <Quote
                className="text-primary-300 dark:text-primary-700 size-8"
                aria-hidden="true"
              />

              <blockquote className="mt-3 flex-1 leading-relaxed text-pretty">
                {locale === 'ne' ? item.quoteNe : item.quoteEn}
              </blockquote>

              <div className="mt-5 flex items-center justify-between border-t pt-4">
                <div>
                  <p className="font-semibold">
                    {locale === 'ne' ? item.nameNe : item.nameEn}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {locale === 'ne' ? item.areaNe : item.areaEn}
                  </p>
                </div>

                {/* aria-label is prohibited on a generic <p>, so the rating is
                    exposed as visually-hidden text instead. A screen reader
                    hears "5 out of 5" once rather than five icon labels. */}
                <p className="flex items-center gap-0.5">
                  <span className="sr-only">{item.rating} out of 5</span>
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="fill-accent text-accent size-4"
                      aria-hidden="true"
                    />
                  ))}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AnimatedSection>
  );
}
