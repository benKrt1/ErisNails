import { getLocale, getTranslations } from "next-intl/server";
import { TESTIMONIALS } from "@/lib/testimonials";
import Reveal from "./Reveal";

// Social proof. Static for now (lib/testimonials.ts) — replace with real reviews.
export default async function Testimonials() {
  const locale = await getLocale();
  const t = await getTranslations("Testimonials");
  const sv = locale === "sv";

  return (
    <section className="bg-sand/40">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          {t("eyebrow")}
        </p>
        <h2 className="mt-3 text-3xl text-ink">{t("title")}</h2>

        <Reveal className="mt-10 grid gap-5 sm:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <figure
              key={item.author}
              className="flex h-full flex-col rounded-3xl bg-cream-soft p-7 shadow-soft"
            >
              <blockquote className="flex-1 font-display text-xl leading-snug text-ink">
                &ldquo;{sv ? item.quote_sv : item.quote_en}&rdquo;
              </blockquote>
              <figcaption className="mt-6 text-sm text-muted">
                <span className="text-ink">{item.author}</span>
                {" · "}
                {sv ? item.service_sv : item.service_en}
              </figcaption>
            </figure>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
