import { setRequestLocale, getTranslations } from "next-intl/server";
import { getActiveServices } from "@/lib/services";
import { servicesByCategory, type Service } from "@/lib/types";
import ServiceRow from "@/components/ServiceRow";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Services");
  const services = await getActiveServices();
  const { nails, brows } = servicesByCategory(services);

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="text-4xl text-ink">{t("title")}</h1>
      <p className="mt-3 max-w-md text-muted">{t("subtitle")}</p>

      {services.length === 0 ? (
        <p className="mt-12 text-muted">{t("empty")}</p>
      ) : (
        <div className="mt-14 space-y-16">
          <CategorySection id="nails" title={t("nailsTitle")} services={nails} />
          <CategorySection id="brows" title={t("browsTitle")} services={brows} />
        </div>
      )}
    </div>
  );
}

function CategorySection({
  id,
  title,
  services,
}: {
  id: string;
  title: string;
  services: Service[];
}) {
  if (services.length === 0) return null;
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-2xl text-ink">{title}</h2>
      <div className="mt-6">
        {services.map((service) => (
          <ServiceRow key={service.id} service={service} />
        ))}
      </div>
    </section>
  );
}
