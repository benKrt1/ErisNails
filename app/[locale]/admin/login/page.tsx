import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "@/components/admin/LoginForm";

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Already signed in? Go straight to the dashboard.
  const user = await getCurrentUser();
  if (user) redirect(`/${locale}/admin`);

  return (
    <div className="min-h-screen px-6">
      <LoginForm />
    </div>
  );
}
