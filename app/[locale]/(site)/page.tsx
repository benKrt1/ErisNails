import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getActiveServices } from "@/lib/services";
import { servicesByCategory, type Service } from "@/lib/types";
import ServiceRow from "@/components/ServiceRow";
import Hero from "@/components/site/Hero";
import Gallery from "@/components/site/Gallery";
import About from "@/components/site/About";
import Testimonials from "@/components/site/Testimonials";
import Reveal from "@/components/site/Reveal";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Home");
  const services = await getActiveServices();
  const { nails, brows } = servicesByCategory(services);

  return (
    <div>
      <Hero />

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

      {/* Services preview — nails & brows, equal billing */}
      <section className="mx-auto max-w-6xl px-6 pb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          {t("servicesEyebrow")}
        </p>
        <h2 className="mt-3 text-3xl text-ink">{t("servicesTitle")}</h2>
        <div className="mt-10 grid gap-x-14 gap-y-10 lg:grid-cols-2">
          <ServiceGroup title={t("nailsTitle")} services={nails.slice(0, 3)} />
          <ServiceGroup title={t("browsTitle")} services={brows.slice(0, 3)} />
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

      <Gallery />
      <About />
      <Testimonials />

      {/* Booking CTA */}
      <section className="mx-auto mt-20 max-w-6xl px-6">
        <Reveal>
          <div className="rounded-3xl bg-sand/50 px-8 py-14 text-center shadow-soft">
            <h2 className="text-3xl text-ink">{t("bookCtaTitle")}</h2>
            <p className="mt-3 text-muted">{t("bookCtaBody")}</p>
            <Link
              href="/book"
              className="mt-8 inline-block rounded-full bg-clay px-7 py-3 text-cream-soft transition-colors hover:bg-clay-dark"
            >
              {t("bookCtaButton")}
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

function ServiceGroup({
  title,
  services,
}: {
  title: string;
  services: Service[];
}) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-[0.2em] text-clay">{title}</h3>
      <div className="mt-2">
        {services.map((service) => (
          <ServiceRow key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
