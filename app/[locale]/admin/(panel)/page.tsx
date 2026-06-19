import { setRequestLocale, getTranslations, getLocale } from "next-intl/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { demoUpcomingBookings } from "@/lib/demo";
import BookingsList, {
  type AdminBooking,
} from "@/components/admin/BookingsList";

export const dynamic = "force-dynamic";

async function loadUpcoming(locale: string): Promise<AdminBooking[]> {
  const supabase = getAdminClient();
  if (!supabase) return demoUpcomingBookings(locale);

  const { data } = await supabase
    .from("bookings")
    .select("*, services(name_en, name_sv)")
    .eq("status", "confirmed")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true });

  return (data ?? []).map((b) => {
    const svc = b.services as { name_en: string; name_sv: string } | null;
    return {
      id: b.id,
      customer_name: b.customer_name,
      customer_phone: b.customer_phone,
      customer_email: b.customer_email,
      starts_at: b.starts_at,
      notes: b.notes,
      serviceName: svc ? (locale === "sv" ? svc.name_sv : svc.name_en) : "—",
    };
  });
}

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Admin.dashboard");
  const activeLocale = await getLocale();
  const bookings = await loadUpcoming(activeLocale);

  return (
    <div>
      <h1 className="mb-6 text-3xl text-ink">{t("title")}</h1>
      <BookingsList bookings={bookings} />
    </div>
  );
}
