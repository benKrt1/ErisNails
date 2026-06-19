import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { isDemoMode } from "@/lib/demo";
import AdminNav from "@/components/admin/AdminNav";

// Auth guard for the whole admin panel. Unauthenticated visitors are sent to
// the login page — except in demo mode, where the panel is open for preview.
export default async function AdminPanelLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const demo = isDemoMode();
  if (!demo) {
    const user = await getCurrentUser();
    if (!user) redirect(`/${locale}/admin/login`);
  }

  const t = await getTranslations("Admin");

  return (
    <div className="min-h-screen bg-cream">
      <AdminNav />
      {demo && (
        <div className="bg-clay/15 px-6 py-2 text-center text-sm text-clay-dark">
          {t("previewBanner")}
        </div>
      )}
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
