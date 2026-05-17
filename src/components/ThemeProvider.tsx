"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Thin wrapper so ThemeProvider can be used in the Server Component layout.
 * Forced to "dark" — ImagineX is a dark-only product.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
