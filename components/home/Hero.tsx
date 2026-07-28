import Image from 'next/image';
import { BadgeCheck, Banknote, Phone, Scale, Truck } from 'lucide-react';
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
  const tFloating = await getTranslations('floating');

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
            <Button asChild variant="outline" size="lg">
              <Link href="/rates">{tCommon('viewRates')}</Link>
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

        {/* Brand mark + live figures. Decorative image, so alt="". */}
        <div className="flex flex-col items-center gap-8">
          <Image
            src="/logo-mark.png"
            alt=""
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
