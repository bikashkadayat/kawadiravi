import { setRequestLocale } from 'next-intl/server';

import { Hero } from '@/components/home/Hero';
import { RatesPreview } from '@/components/home/RatesPreview';
import { WhatWeBuy } from '@/components/home/WhatWeBuy';
import { HowItWorks } from '@/components/home/HowItWorks';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { CoverageArea } from '@/components/home/CoverageArea';
import { Testimonials } from '@/components/home/Testimonials';
import { CtaBand } from '@/components/home/CtaBand';

/**
 * Homepage.
 *
 * Section order is the argument the page makes, in sequence: what we do (Hero)
 * → what it is worth (RatesPreview) → whether we take your thing (WhatWeBuy) →
 * what happens if you call (HowItWorks) → why us and not the cart on the
 * street (WhyChooseUs) → do you reach my area (CoverageArea) → do others trust
 * them (Testimonials) → act now (CtaBand).
 *
 * Every section is a server component; the page ships no JavaScript of its own.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    // The only page without its own <main>: every other page declares one, and
    // without it axe reported "no main landmark" plus 86 elements sitting
    // outside any landmark at all.
    <main>
      <Hero />
      <RatesPreview />
      <WhatWeBuy />
      <HowItWorks />
      <WhyChooseUs />
      <CoverageArea />
      <Testimonials />
      <CtaBand />
    </main>
  );
}
