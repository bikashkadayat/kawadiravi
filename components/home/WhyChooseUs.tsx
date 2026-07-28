import { Banknote, Leaf, MapPin, Scale, Tags, Truck } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { SectionHeading } from '@/components/shared/SectionHeading';

/**
 * Six differentiators, each written against a specific worry a seller has:
 * being underpaid, being cheated on the scale, being charged for pickup,
 * being paid late, the waste being dumped, and not being able to reach anyone.
 */
export async function WhyChooseUs() {
  const t = await getTranslations('home.whyUs');

  const reasons = [
    { icon: Tags, title: t('fairTitle'), body: t('fairBody') },
    { icon: Scale, title: t('weighTitle'), body: t('weighBody') },
    { icon: Truck, title: t('freeTitle'), body: t('freeBody') },
    { icon: Banknote, title: t('cashTitle'), body: t('cashBody') },
    { icon: Leaf, title: t('greenTitle'), body: t('greenBody') },
    { icon: MapPin, title: t('localTitle'), body: t('localBody') },
  ];

  return (
    <AnimatedSection className="bg-surface-muted py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading title={t('title')} subtitle={t('subtitle')} />

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              className="bg-background rounded-2xl border p-6 transition-shadow hover:shadow-md"
            >
              <span className="bg-accent-soft text-primary-900 flex size-12 items-center justify-center rounded-xl">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="text-muted-foreground mt-2 leading-relaxed text-pretty">
                {body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </AnimatedSection>
  );
}
