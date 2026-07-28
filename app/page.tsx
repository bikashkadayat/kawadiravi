import { routing } from '@/i18n/routing';
import { siteConfig } from '@/lib/site-config';

const target = `/${routing.defaultLocale}`;

/**
 * Static `/` → `/en` redirect.
 *
 * This replaces what `proxy.ts` used to do. Static export runs no server, so
 * there is no middleware to issue a 307 — without this file, the site root
 * would simply 404 on GitHub Pages.
 *
 * Three redirect mechanisms, deliberately layered:
 *   1. <meta http-equiv="refresh"> — works with JavaScript disabled and is
 *      what crawlers follow.
 *   2. <link rel="canonical"> — tells search engines the real URL is /en, so
 *      this stub never competes with the homepage in the index.
 *   3. An inline script using `location.replace` — fires faster than the meta
 *      refresh and, unlike `location.href`, does not leave this page in the
 *      back-button history.
 *
 * The visible link is the no-JS, no-meta fallback.
 *
 * NOTE: locale auto-detection is lost with static export. The middleware used
 * to read Accept-Language and route a Nepali browser to /ne; everyone now
 * lands on /en and switches with the header toggle.
 */
export const metadata = {
  title: siteConfig.name,
  // Keep this stub out of search results — /en is the indexable homepage.
  robots: { index: false, follow: true },
  alternates: { canonical: `${siteConfig.url}${target}` },
};

export default function RootRedirect() {
  return (
    <html lang={routing.defaultLocale}>
      <head>
        <meta httpEquiv="refresh" content={`0; url=${target}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `location.replace(${JSON.stringify(target)})`,
          }}
        />
      </head>
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          background: '#08341a',
          color: '#ffffff',
        }}
      >
        <p>
          Redirecting to{' '}
          <a href={target} style={{ color: '#ffb918' }}>
            {siteConfig.name}
          </a>
          …
        </p>
      </body>
    </html>
  );
}
