import Link from 'next/link';

/**
 * Global 404 — the fallback for paths that never reach a `[locale]` segment
 * (e.g. anything with a file extension, which `middleware.ts` skips).
 *
 * It renders its own <html>/<body> because the root layout deliberately does
 * not: the real document shell lives in `app/[locale]/layout.tsx` so it can
 * carry the correct `lang`. Without this file such a 404 would render as a
 * fragment with no document element at all.
 *
 * Copy is English-only on purpose — there is no locale to translate against at
 * this point. Locale-aware 404s are handled by `app/[locale]/not-found.tsx`.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-white text-neutral-900 antialiased">
        <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center px-4 text-center">
          <p className="text-sm font-semibold tracking-widest text-neutral-500 uppercase">
            404
          </p>
          <h1 className="mt-2 text-3xl font-extrabold">Page not found</h1>
          <p className="mt-3 text-neutral-600">
            The page you are looking for does not exist or has been moved.
          </p>
          <Link
            href="/en"
            className="mt-8 inline-flex h-11 items-center rounded-full bg-[#1e40af] px-6 font-semibold text-white transition hover:bg-[#1e3a8a]"
          >
            Go to homepage
          </Link>
        </main>
      </body>
    </html>
  );
}
