"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LABELS: Record<string, string> = { en: "EN", sv: "SV" };

// Switches locale while staying on the current page.
export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex items-center gap-1 text-xs tracking-wide">
      {routing.locales.map((loc, i) => (
        <span key={loc} className="flex items-center gap-1">
          {i > 0 && <span className="text-muted/40">/</span>}
          <button
            type="button"
            onClick={() => router.replace(pathname, { locale: loc })}
            aria-current={loc === locale ? "true" : undefined}
            className={
              loc === locale
                ? "text-ink font-medium"
                : "text-muted hover:text-ink transition-colors"
            }
          >
            {LABELS[loc] ?? loc.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}
