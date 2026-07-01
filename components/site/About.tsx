import Image from "next/image";
import { getTranslations } from "next-intl/server";

// "The person behind the studio" — trust is built on a face and a story.
// Swap /images/about.svg for Eri's real portrait.
export default async function About() {
  const t = await getTranslations("About");

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid items-center gap-10 sm:grid-cols-2 sm:gap-14">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-lift">
          <Image
            src="/images/about.svg"
            alt={t("alt")}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-3xl text-ink">{t("title")}</h2>
          <p className="mt-5 leading-relaxed text-muted">{t("body")}</p>
          <p className="mt-4 leading-relaxed text-muted">{t("body2")}</p>
          <p className="mt-6 font-display text-xl text-ink">{t("signature")}</p>
        </div>
      </div>
    </section>
  );
}
