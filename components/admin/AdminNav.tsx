"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { signOut } from "@/app/[locale]/admin/actions";

const ITEMS = [
  { href: "/admin", key: "dashboard" },
  { href: "/admin/schedule", key: "schedule" },
  { href: "/admin/time-off", key: "timeOff" },
  { href: "/admin/services", key: "services" },
] as const;

export default function AdminNav() {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const renderLink = (item: (typeof ITEMS)[number]) => {
    const active =
      item.href === "/admin"
        ? pathname === "/admin"
        : pathname.startsWith(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={
          (active ? "text-ink" : "text-muted hover:text-ink") +
          " whitespace-nowrap"
        }
      >
        {t(`nav.${item.key}`)}
      </Link>
    );
  };

  return (
    <header className="border-b border-sand bg-cream-soft">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <span className="font-display text-lg text-ink">Atelier Eri · Admin</span>
          <nav className="hidden items-center gap-4 text-sm sm:flex">
            {ITEMS.map(renderLink)}
          </nav>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => signOut(locale))}
          className="text-sm text-muted hover:text-ink"
        >
          {t("signOut")}
        </button>
      </div>
      {/* Mobile-only nav: the desktop nav above is hidden below sm, so phones
          get a horizontally scrollable row of links here instead. */}
      <nav className="mx-auto flex max-w-5xl gap-4 overflow-x-auto px-6 pb-3 text-sm sm:hidden">
        {ITEMS.map(renderLink)}
      </nav>
    </header>
  );
}
