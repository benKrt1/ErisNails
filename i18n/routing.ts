import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // The two locales the salon serves.
  locales: ["en", "sv"],
  defaultLocale: "sv",
  // Always prefix the locale so URLs are explicit (/sv, /en).
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
