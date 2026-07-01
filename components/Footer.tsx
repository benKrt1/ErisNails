import { useTranslations } from "next-intl";

// Calm forest-green footer matching the mockup.
export default function Footer() {
  const t = useTranslations("Common");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-forest text-cream-soft">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <p className="font-display text-2xl">{t("salon")}</p>
        <p className="mt-2 max-w-sm text-sm text-cream-soft/70">
          {t("tagline")}
        </p>
        <p className="mt-8 text-xs text-cream-soft/50">
          © {year} {t("salon")}
        </p>
      </div>
    </footer>
  );
}
