import { setRequestLocale, getTranslations } from "next-intl/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { demoScheduleMap } from "@/lib/demo";
import ScheduleEditor from "@/components/admin/ScheduleEditor";

export const dynamic = "force-dynamic";

type Row = { is_active: boolean; start_time: string; end_time: string };

async function loadSchedule(): Promise<Record<number, Row>> {
  const supabase = getAdminClient();
  if (!supabase) return demoScheduleMap();
  const result: Record<number, Row> = {};

  const { data } = await supabase.from("working_hours").select("*");
  for (const w of data ?? []) {
    result[w.weekday] = {
      is_active: w.is_active,
      // DB returns "HH:MM:SS"; the <input type=time> wants "HH:MM".
      start_time: String(w.start_time).slice(0, 5),
      end_time: String(w.end_time).slice(0, 5),
    };
  }
  return result;
}

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Admin.schedule");
  const initial = await loadSchedule();

  return (
    <div>
      <h1 className="text-3xl text-ink">{t("title")}</h1>
      <p className="mt-2 mb-6 text-muted">{t("subtitle")}</p>
      <ScheduleEditor initial={initial} />
    </div>
  );
}
