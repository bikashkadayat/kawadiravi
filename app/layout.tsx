import type { ReactNode } from 'react';

/**
 * Root layout.
 *
 * Deliberately renders nothing but its children: the real <html>/<body> live in
 * `app/[locale]/layout.tsx` so they can carry the correct `lang` attribute for
 * the active locale. This is the standard next-intl App Router arrangement.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
