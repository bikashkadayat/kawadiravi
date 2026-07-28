'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ComponentProps } from 'react';

/**
 * next-themes wrapper.
 *
 * `attribute="class"` puts `.dark` on <html>, which is what the
 * `@custom-variant dark (&:is(.dark *))` rule in globals.css keys off. The
 * provider also injects a tiny blocking script that sets the class before
 * first paint, so there is no flash of the wrong theme — that is why
 * `suppressHydrationWarning` is set on <html> in the locale layout.
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
