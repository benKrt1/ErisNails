import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Reveal from "./Reveal";

// Portfolio grid of nail & brow work. Swap the /images/gallery-*.svg
// placeholders for Eri's real photos (same paths, jpg/webp).
const IMAGES = [1, 2, 3, 4, 5, 6];

export default async function Gallery() {
  const t = await getTranslations("Gallery");

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">
        {t("eyebrow")}
      </p>
      <h2 className="mt-3 max-w-xl text-3xl text-ink">{t("title")}</h2>

      <Reveal className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {IMAGES.map((n) => (
          <div
            key={n}
            className="relative aspect-square overflow-hidden rounded-2xl shadow-soft"
          >
            <Image
              src={`/images/gallery-${n}.jpg`}
              alt={t("alt", { n })}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        ))}
      </Reveal>
    </section>
  );
}
