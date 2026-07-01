import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

// Full-bleed image hero with a soft dark overlay so the headline stays legible.
// Replace /images/hero.svg with Eri's real natural-light photo (jpg/webp).
export default async function Hero() {
  const t = await getTranslations("Home");

  return (
    <section className="relative min-h-[78vh] overflow-hidden">
      <Image
        src="/images/hero.svg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-forest/85 via-forest/45 to-forest/25" />
      <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-6 pb-20 pt-40">
        <p className="mb-4 text-xs uppercase tracking-[0.28em] text-cream-soft/70">
          {t("heroEyebrow")}
        </p>
        <h1 className="max-w-2xl text-5xl leading-[1.05] text-cream-soft sm:text-7xl">
          {t("heroTitle")}
        </h1>
        <p className="mt-5 max-w-md text-lg text-cream-soft/85">
          {t("heroSubtitle")}
        </p>
        <div className="mt-9">
          <Link
            href="/book"
            className="inline-block rounded-full bg-clay px-8 py-3.5 text-cream-soft shadow-soft transition-colors hover:bg-clay-dark"
          >
            {t("heroCta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
