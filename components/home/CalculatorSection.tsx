import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { ScrapCalculator } from '@/components/calculator/ScrapCalculator';

/**
 * Homepage calculator, placed immediately after the rates preview.
 *
 * That order is the point: the preview answers "what do you pay for copper?",
 * and this answers "so what is MY pile worth?" — the question the visitor
 * actually arrived with. Putting it any lower means most phone visitors never
 * see it.
 *
 * `compact` trims the trailing rates footnote, which would be redundant here:
 * the rates preview sitting directly above already carries the same caveat and
 * links to /rates.
 */
export async function CalculatorSection() {
  const t = await getTranslations('calculator');

  return (
    <AnimatedSection className="container-page py-16 sm:py-20">
      <SectionHeading title={t('homeTitle')} subtitle={t('homeSubtitle')} />

      <div className="bg-surface mx-auto mt-10 max-w-3xl rounded-2xl border p-4 sm:p-6">
        <ScrapCalculator compact />
      </div>

      <div className="mt-6 flex justify-center">
        <Button asChild variant="ghost" size="md">
          <Link href="/calculator">
            {t('openFull')}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </AnimatedSection>
  );
}
