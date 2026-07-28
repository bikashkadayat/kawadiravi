import type { Metadata } from 'next';
import Image from 'next/image';
import { Check, Eye, HandHeart, Leaf, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';

import { routing } from '@/i18n/routing';
import { buildPageMetadata } from '@/lib/metadata';
import { siteConfig, telHref } from '@/lib/site-config';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { Button } from '@/components/ui/button';
import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { WhatsAppIcon } from '@/components/shared/BrandIcons';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // Builds title + description + canonical + hreflang + OG + Twitter together,
  // so this page's share card is its own rather than the layout's.
  return buildPageMetadata(locale, 'about', '/about');
}

/**
 * About page.
 *
 * The story section names the actual problem (hidden scales, rates quoted from
 * memory) rather than making generic claims about quality. Naming the problem
 * is what makes the promise credible to someone who has been short-changed
 * before.
 */
export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('about');
  const tCommon = await getTranslations('common');
  const tFloating = await getTranslations('floating');
  const activeLocale = await getLocale();

  const values = [
    { icon: Eye, title: t('value1Title'), body: t('value1Body') },
    { icon: ShieldCheck, title: t('value2Title'), body: t('value2Body') },
    { icon: HandHeart, title: t('value3Title'), body: t('value3Body') },
    { icon: Leaf, title: t('value4Title'), body: t('value4Body') },
  ];

  const trustPoints = [t('trust1'), t('trust2'), t('trust3'), t('trust4')];

  return (
    <main className="pb-16">
      <header className="from-primary-50 dark:from-primary-950 bg-gradient-to-b to-transparent py-14 sm:py-20">
        <div className="container-page mx-auto max-w-2xl text-center">
          <h1 className="text-primary-900 dark:text-primary-200 text-[length:var(--text-h1)] font-extrabold tracking-tight text-balance">
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed text-pretty">
            {t('subtitle')}
          </p>
        </div>
      </header>

      {/* Story */}
      <AnimatedSection className="container-page py-14">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading title={t('storyTitle')} align="left" />
            <p className="text-muted-foreground mt-5 leading-relaxed text-pretty">
              {t('storyBody1')}
            </p>
            <p className="text-muted-foreground mt-4 leading-relaxed text-pretty">
              {t('storyBody2')}
            </p>
          </div>

          <div className="flex justify-center">
            <Image
              src="/logo-mark.png"
              alt=""
              width={320}
              height={320}
              sizes="(min-width: 1024px) 320px, 55vw"
              className="w-52 max-w-full drop-shadow-xl sm:w-64 lg:w-80"
            />
          </div>
        </div>
      </AnimatedSection>

      {/* Mission */}
      <AnimatedSection className="container-page py-6">
        <div className="bg-primary-900 rounded-3xl px-6 py-12 text-center sm:px-12">
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
            {t('missionTitle')}
          </h2>
          <p className="text-primary-100 mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-pretty">
            {t('missionBody')}
          </p>
        </div>
      </AnimatedSection>

      {/* Values */}
      <AnimatedSection className="container-page py-14">
        <SectionHeading title={t('valuesTitle')} />

        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {values.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              className="bg-surface rounded-2xl border p-6 transition-shadow hover:shadow-md"
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
      </AnimatedSection>

      {/* Coverage */}
      <AnimatedSection className="bg-surface-muted py-14">
        <div className="container-page">
          <SectionHeading title={t('trustTitle')} subtitle={t('trustSub')} />

          <ul className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
            {trustPoints.map((point) => (
              <li
                key={point}
                className="bg-background flex items-start gap-3 rounded-xl border p-4"
              >
                <Check
                  className="text-primary-700 dark:text-primary-300 mt-0.5 size-5 shrink-0"
                  aria-hidden="true"
                />
                <span className="leading-relaxed text-pretty">{point}</span>
              </li>
            ))}
          </ul>

          <ul className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-2.5">
            {siteConfig.coverage.map((area) => (
              <li
                key={area.nameEn}
                className="bg-background flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium"
              >
                <MapPin
                  className="text-primary-700 dark:text-primary-300 size-4 shrink-0"
                  aria-hidden="true"
                />
                {activeLocale === 'ne' ? area.nameNe : area.nameEn}
              </li>
            ))}
          </ul>
        </div>
      </AnimatedSection>

      {/* CTA */}
      <AnimatedSection className="container-page pt-14">
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild variant="call" size="lg">
            <a href={telHref}>
              <Phone aria-hidden="true" />
              {tCommon('callNow')}
            </a>
          </Button>
          <Button asChild variant="whatsapp" size="lg">
            <a
              href={buildWhatsAppUrl(tFloating('prefilledMessage'))}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon aria-hidden="true" />
              {tCommon('whatsappUs')}
            </a>
          </Button>
        </div>
      </AnimatedSection>
    </main>
  );
}
