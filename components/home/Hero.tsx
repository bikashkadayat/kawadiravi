import Image from 'next/image';
import { BadgeCheck, Banknote, CalendarCheck, Calculator, Phone, Scale, Truck } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/routing';
import { getAllRates } from '@/lib/rates';
import { siteConfig, telHref } from '@/lib/site-config';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { Button } from '@/components/ui/button';
import { WhatsAppIcon } from '@/components/shared/BrandIcons';

/**
 * Above-the-fold hero: the promise, the two conversions, and the trust signals
 * that make tapping them feel safe.
 *
 * The counts are derived from real data rather than hard-coded copy, so they
 * cannot drift: edit data/rates.json or the coverage list and the hero updates
 * itself.
 */
export async function Hero() {
  const t = await getTranslations('home.hero');
  const tCommon = await getTranslations('common');
  const tBooking = await getTranslations('booking');
  const tCalc = await getTranslations('calculator');

  const trustPoints = [
    { icon: Scale, label: t('trustWeighing') },
    { icon: Truck, label: t('trustPickup') },
    { icon: Banknote, label: t('trustCash') },
    { icon: BadgeCheck, label: t('trustRates') },
  ];

  return (
    <section className="from-primary-50 dark:from-primary-950 relative overflow-hidden bg-gradient-to-b to-transparent">
      <div className="container-page grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div>
          <p className="bg-accent-soft text-primary-900 ring-accent/40 inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold ring-1">
            {t('badge')}
          </p>

          <h1 className="text-primary-900 dark:text-primary-100 mt-5 text-[length:var(--text-display)] leading-[1.1] font-extrabold tracking-tight text-balance">
            {t('title')}
          </h1>

          <p className="text-muted-foreground mt-5 max-w-xl text-lg leading-relaxed text-pretty">
            {t('subtitle')}
          </p>

          {/* The two conversions, repeated here because a visitor who is
              already convinced should never have to scroll to act. */}
          <div className="mt-8 flex flex-wrap gap-3">
            {/* Booking leads: it is the only CTA that captures the date, the
                address and what is being sold in one go, so it saves the shop
                a round of questions that Call and WhatsApp both require. */}
            <Button asChild variant="primary" size="lg">
              <Link href="/book">
                <CalendarCheck aria-hidden="true" />
                {tBooking('cta')}
              </Link>
            </Button>
            <Button asChild variant="call" size="lg">
              <a href={telHref}>
                <Phone aria-hidden="true" />
                {tCommon('callNow')}
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
            {/* Replaces the old "View Rates" button rather than joining it.
                Five CTAs in one hero is noise, and this one is strictly more
                useful: it answers "what is MY pile worth?" and the rate list
                is one tap away inside it — plus still in the nav. */}
            <Button asChild variant="outline" size="lg">
              <Link href="/calculator">
                <Calculator aria-hidden="true" />
                {tCalc('homeTitle')}
              </Link>
            </Button>
          </div>

          <ul className="mt-9 grid grid-cols-2 gap-x-6 gap-y-3 sm:max-w-lg">
            {trustPoints.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2.5 text-sm font-medium">
                <Icon
                  className="text-primary-700 dark:text-primary-300 size-5 shrink-0"
                  aria-hidden="true"
                />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Brand mark + live figures. The mark carries a real alt rather than
            alt="": it is the LCP image and the only image on the homepage, so
            it is what Google Images has to work with. */}
        <div className="flex flex-col items-center gap-8">
          <Image
            src="/logo-mark.png"
            alt={t('logoAlt')}
            width={340}
            height={340}
            priority
            sizes="(min-width: 1024px) 340px, 60vw"
            className="w-56 max-w-full drop-shadow-xl sm:w-72 lg:w-[340px]"
          />

          <dl className="grid w-full max-w-sm grid-cols-2 gap-4">
            <div className="bg-surface rounded-xl border p-4 text-center">
              <dt className="text-primary-800 dark:text-primary-300 text-2xl font-extrabold">
                {getAllRates().length}
              </dt>
              <dd className="text-muted-foreground mt-1 text-sm">
                {t('itemsPriced')}
              </dd>
            </div>
            <div className="bg-surface rounded-xl border p-4 text-center">
              <dt className="text-primary-800 dark:text-primary-300 text-2xl font-extrabold">
                {siteConfig.coverage.length}
              </dt>
              <dd className="text-muted-foreground mt-1 text-sm">
                {t('areasCovered')}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
