import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { Inter, Mukta } from 'next/font/google';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { routing } from '@/i18n/routing';
import { siteConfig } from '@/lib/site-config';
import { keywordsFor, ogAlternateLocales, ogLocale } from '@/lib/metadata';
import { buildLocalBusinessSchema, buildWebSiteSchema } from '@/lib/schema';
import type { Locale } from '@/types';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Analytics } from '@/components/providers/Analytics';
import { ServiceWorker } from '@/components/providers/ServiceWorker';
import { JsonLd } from '@/components/shared/JsonLd';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FloatingActions } from '@/components/layout/FloatingActions';
import '../globals.css';

/**
 * Both fonts are self-hosted by next/font — no request to Google at runtime,
 * and no layout shift, which matters on slow mobile connections.
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

/**
 * `preload: false` is deliberate and measured.
 *
 * next/font emits a <link rel="preload"> for every declared font, and both
 * families are declared at module scope for BOTH locales. That meant the
 * English pages were preloading a 121 KB Devanagari file they never render —
 * on throttled mobile it competed with the hero text and pushed LCP to 3.6s.
 *
 * Without the preload the file is fetched only when `:lang(ne)` actually
 * applies it. Nepali pages show the swap fallback for a moment longer, which
 * is a far smaller cost than delaying first paint for every English visitor.
 */
const devanagari = Mukta({
  // `latin` as well as `devanagari`: Nepali copy is full of Latin digits and
  // names (rate ranges, "WhatsApp", "KTM"). Without the Latin subset those
  // glyphs fall back to Inter mid-sentence and the line looks mismatched.
  subsets: ['devanagari', 'latin'],
  /*
   * Mukta is NOT a variable font: every weight is a separate file, and with
   * two subsets that is 2 files per weight. Listing 400/500/600/700/800 meant
   * /ne downloaded 10 files (~390 KB) and measured CLS 0.226.
   *
   * Two weights is enough. CSS font matching resolves a requested weight to
   * the nearest DECLARED face — 500 → 400, and 600/800 → 700 — so the site's
   * font-medium / font-semibold / font-extrabold classes still get a real
   * drawn weight, not a synthesised one. That is the distinction that matters
   * for Devanagari, where faux bold smears the conjuncts.
   */
  weight: ['400', '700'],
  // Distinct from the `--font-devanagari` @theme token in globals.css. The old
  // setup used the same name for both, so the token resolved to itself.
  variable: '--font-mukta',
  display: 'swap',
  preload: false,
});

/** Pre-render both locales at build time. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.home' });

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: t('title'),
      template: `%s · ${siteConfig.name}`,
    },
    description: t('description'),
    keywords: keywordsFor(locale, 'home'),
    applicationName: siteConfig.name,
    category: 'business',
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: '/en',
        ne: '/ne',
        'x-default': '/en',
      },
    },
    icons: {
      icon: '/icons/icon-192.png',
      apple: '/icons/apple-icon.png',
    },
    manifest: '/manifest.webmanifest',
    /**
     * ── TODO (Bikash) ────────────────────────────────────────────────────
     * Google Search Console verification.
     *
     * 1. Go to https://search.google.com/search-console and add the property
     *    https://ktmkawadi.bikashkadayat.com.np
     * 2. Choose the "HTML tag" method. Google shows a tag like:
     *      <meta name="google-site-verification" content="AbC123…" />
     * 3. Copy ONLY the `content` value and put it in `.env.local` (local) and
     *    in the GitHub Actions repo secrets / workflow env (production) as:
     *      NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=AbC123…
     * 4. Rebuild and deploy, then press Verify.
     *
     * Until that variable is set this key is omitted entirely rather than
     * emitting an empty meta tag, which Google reports as a failed check.
     * ─────────────────────────────────────────────────────────────────────
     */
    verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : undefined,
    // Inherited by every page unless a page overrides it. Child pages only
    // set title/description, so they pick up these cards automatically.
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      title: t('title'),
      description: t('description'),
      url: `/${locale}`,
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
      images: [
        {
          url: `/images/og-${locale}.png`,
          width: 1200,
          height: 630,
          alt: t('title'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: [`/images/og-${locale}.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
  };
}

/** Brand green in the mobile browser chrome; matches the manifest. */
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#106432' },
    { media: '(prefers-color-scheme: dark)', color: '#08341a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Required for static rendering of a [locale] segment.
  setRequestLocale(locale);

  const t = await getTranslations('common');

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${inter.variable} ${devanagari.variable}`}
    >
      <body className="bg-background text-foreground flex min-h-dvh flex-col antialiased">
        <NextIntlClientProvider>
          <ThemeProvider>
            {/* Keyboard and screen-reader users can jump the whole header. */}
            <a
              href="#main"
              className="bg-accent focus:ring-primary-700 sr-only rounded-full px-4 py-2 font-semibold text-neutral-950 focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[70] focus:inline-flex focus:min-h-11 focus:items-center focus:ring-2"
            >
              {t('skipToContent')}
            </a>

            <AnnouncementBar />
            <Header />

            {/* flex-1 pins the footer to the bottom on short pages. */}
            <div id="main" className="flex-1">
              {children}
            </div>

            <Footer />
            <FloatingActions />

            {/* Sitewide structured data. The contact page adds its own, more
                detailed LocalBusiness block; both share an @id so search
                engines treat them as one entity rather than two businesses. */}
            <JsonLd data={buildWebSiteSchema(locale as Locale)} />
            <JsonLd data={buildLocalBusinessSchema(locale as Locale)} />

            <ServiceWorker />
            <Analytics />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
