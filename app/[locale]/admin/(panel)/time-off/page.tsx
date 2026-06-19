import { setRequestLocale, getTranslations } from "next-intl/server";
import { getAdminClient } from "@/lib/supabase/admin";
import TimeOffManager, {
  type TimeOffEntry,
} from "@/components/admin/TimeOffManager";

export const dynamic = "force-dynamic";

async function loadTimeOff(): Promise<TimeOffEntry[]> {
  const supabase = getAdminClient();
  if (!supabase) return [];
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("time_off")
    .select("*")
    .gte("date", today)
    .order("date", { ascending: true });
  return (data ?? []) as TimeOffEntry[];
}

export default async function TimeOffPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Admin.timeOff");
  const entries = await loadTimeOff();

  return (
    <div>
      <h1 className="text-3xl text-ink">{t("title")}</h1>
      <p className="mt-2 mb-6 text-muted">{t("subtitle")}</p>
      <TimeOffManager entries={entries} />
    </div>
  );
}
