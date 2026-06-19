import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LocaleSwitcher from "./LocaleSwitcher";

// Public site header: salon wordmark, primary nav, locale switcher, CTA.
export default function Header() {
  const t = useTranslations("Nav");

  return (
    <header className="sticky top-0 z-30 border-b border-sand/60 bg-cream/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-display text-xl tracking-tight text-ink"
        >
          Botanica Nails
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          <Link href="/" className="hover:text-ink transition-colors">
            {t("home")}
          </Link>
          <Link href="/services" className="hover:text-ink transition-colors">
            {t("services")}
          </Link>
        </nav>

        <div className="flex items-center gap-5">
          <LocaleSwitcher />
          <Link
            href="/book"
            className="rounded-full bg-clay px-5 py-2 text-sm text-cream-soft transition-colors hover:bg-clay-dark"
          >
            {t("reserve")}
          </Link>
        </div>
      </div>
    </header>
  );
}
