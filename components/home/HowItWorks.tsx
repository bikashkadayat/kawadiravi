import { Banknote, CalendarCheck, PhoneCall, Scale } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { SectionHeading } from '@/components/shared/SectionHeading';

/**
 * Three-step explainer.
 *
 * The point of this section is removing hesitation — a first-time seller does
 * not know whether they need to transport anything, whether payment is
 * immediate, or whether they will be haggled down on arrival.
 */
export async function HowItWorks() {
  const t = await getTranslations('home.howItWorks');
  const tBooking = await getTranslations('booking');

  const steps = [
    { icon: PhoneCall, title: t('step1Title'), body: t('step1Body') },
    { icon: Scale, title: t('step2Title'), body: t('step2Body') },
    { icon: Banknote, title: t('step3Title'), body: t('step3Body') },
  ];

  return (
    <AnimatedSection className="container-page py-16 sm:py-20">
      <SectionHeading title={t('title')} subtitle={t('subtitle')} />

      <ol className="mt-12 grid gap-8 md:grid-cols-3">
        {steps.map(({ icon: Icon, title, body }, index) => (
          <li key={title} className="relative flex flex-col items-center text-center">
            {/* Connector between steps on wide screens only; decorative. */}
            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className="bg-primary-200 dark:bg-primary-800 absolute top-8 left-[calc(50%+2.5rem)] hidden h-0.5 w-[calc(100%-5rem)] md:block"
              />
            )}

            <span className="bg-primary-800 relative flex size-16 items-center justify-center rounded-full text-white">
              <Icon className="size-7" aria-hidden="true" />
              <span className="bg-accent absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full text-sm font-bold text-neutral-950">
                {index + 1}
              </span>
            </span>

            <p className="text-primary-700 dark:text-primary-300 mt-5 text-xs font-bold tracking-widest uppercase">
              {t('stepLabel', { number: index + 1 })}
            </p>

            <h3 className="mt-2 text-xl font-bold">{title}</h3>

            <p className="text-muted-foreground mt-2 max-w-xs leading-relaxed text-pretty">
              {body}
            </p>
          </li>
        ))}
      </ol>

      {/* The natural next action once someone has read the three steps. */}
      <div className="mt-10 flex justify-center">
        <Button asChild variant="primary" size="lg">
          <Link href="/book">
            <CalendarCheck aria-hidden="true" />
            {tBooking('cta')}
          </Link>
        </Button>
      </div>
    </AnimatedSection>
  );
}
