import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getActiveServices } from "@/lib/services";
import ServiceRow from "@/components/ServiceRow";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Home");
  const services = (await getActiveServices()).slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-forest" />
        <div className="relative mx-auto flex max-w-6xl flex-col justify-end px-6 pb-16 pt-40 sm:pt-56">
          <h1 className="max-w-xl text-5xl leading-tight text-cream-soft sm:text-6xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-4 max-w-md text-cream-soft/80">
            {t("heroSubtitle")}
          </p>
          <div className="mt-8">
            <Link
              href="/book"
              className="inline-block rounded-full bg-clay px-7 py-3 text-cream-soft transition-colors hover:bg-clay-dark"
            >
              {t("heroCta")}
            </Link>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          {t("philosophyEyebrow")}
        </p>
        <div className="mt-6 grid gap-8 sm:grid-cols-2">
          <h2 className="text-3xl text-ink">{t("philosophyTitle")}</h2>
          <p className="leading-relaxed text-muted">{t("philosophyBody")}</p>
        </div>
      </section>

      {/* Services preview */}
      <section className="mx-auto max-w-6xl px-6 pb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          {t("servicesEyebrow")}
        </p>
        <h2 className="mt-3 text-3xl text-ink">{t("servicesTitle")}</h2>
        <div className="mt-8">
          {services.map((service) => (
            <ServiceRow key={service.id} service={service} />
          ))}
        </div>
        <div className="mt-8">
          <Link
            href="/services"
            className="text-sm text-clay underline-offset-4 hover:underline"
          >
            {t("servicesCta")} →
          </Link>
        </div>
      </section>

      {/* Booking CTA */}
      <section className="mx-auto mt-20 max-w-6xl px-6">
        <div className="rounded-3xl bg-sand/50 px-8 py-14 text-center">
          <h2 className="text-3xl text-ink">{t("bookCtaTitle")}</h2>
          <p className="mt-3 text-muted">{t("bookCtaBody")}</p>
          <Link
            href="/book"
            className="mt-8 inline-block rounded-full bg-clay px-7 py-3 text-cream-soft transition-colors hover:bg-clay-dark"
          >
            {t("bookCtaButton")}
          </Link>
        </div>
      </section>
    </div>
  );
}
