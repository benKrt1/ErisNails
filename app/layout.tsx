import type { ReactNode } from "react";

// The real <html>/<body> live in app/[locale]/layout.tsx (where the locale is
// known). This root layout only needs to pass children through.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
