import { setRequestLocale, getTranslations } from "next-intl/server";
import { getActiveServices } from "@/lib/services";
import { servicesByCategory } from "@/lib/types";
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
  const allServices = [...nails, ...brows];

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="text-4xl text-ink">{t("title")}</h1>
      <p className="mt-3 max-w-md text-muted">{t("subtitle")}</p>

      {services.length === 0 ? (
        <p className="mt-12 text-muted">{t("empty")}</p>
      ) : (
        <div className="mt-14">
          {allServices.map((service) => (
            <ServiceRow key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
}
