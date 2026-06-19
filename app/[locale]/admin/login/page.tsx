import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isDemoMode } from "@/lib/demo";
import LoginForm from "@/components/admin/LoginForm";

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const demo = isDemoMode();

  // Already signed in? Go straight to the dashboard.
  if (!demo) {
    const user = await getCurrentUser();
    if (user) redirect(`/${locale}/admin`);
  }

  return (
    <div className="min-h-screen px-6">
      <LoginForm demo={demo} />
    </div>
  );
}
