import { setRequestLocale, getTranslations } from "next-intl/server";

// Placeholder for the booking flow — implemented in a later milestone
// (service → date → time → details → confirm).
export default async function BookPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Booking");

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="text-4xl text-ink">{t("title")}</h1>
      <p className="mt-4 text-muted">{t("selectServiceFirst")}</p>
    </div>
  );
}
