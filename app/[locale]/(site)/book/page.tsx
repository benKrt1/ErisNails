import { setRequestLocale, getTranslations } from "next-intl/server";
import { getActiveServices } from "@/lib/services";
import BookingFlow from "@/components/booking/BookingFlow";
import { createBooking } from "./actions";

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ service?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { service } = await searchParams;
  const t = await getTranslations("Booking");
  const services = await getActiveServices();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="mb-10 text-4xl text-ink">{t("title")}</h1>
      {services.length === 0 ? (
        <p className="text-muted">{t("selectServiceFirst")}</p>
      ) : (
        <BookingFlow
          services={services}
          initialServiceId={service}
          createBooking={createBooking}
        />
      )}
    </div>
  );
}
