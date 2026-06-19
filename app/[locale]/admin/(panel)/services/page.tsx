import { setRequestLocale, getTranslations } from "next-intl/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { DEMO_SERVICES } from "@/lib/demo";
import type { Service } from "@/lib/types";
import ServicesManager from "@/components/admin/ServicesManager";

export const dynamic = "force-dynamic";

async function loadAllServices(): Promise<Service[]> {
  const supabase = getAdminClient();
  if (!supabase) return DEMO_SERVICES;
  const { data } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data ?? []) as Service[];
}

export default async function AdminServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Admin.services");
  const services = await loadAllServices();

  return (
    <div>
      <h1 className="text-3xl text-ink">{t("title")}</h1>
      <p className="mt-2 mb-6 text-muted">{t("subtitle")}</p>
      <ServicesManager services={services} />
    </div>
  );
}
