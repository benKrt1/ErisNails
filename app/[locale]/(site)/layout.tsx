import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Chrome (header + footer) for all public-facing pages.
export default async function SiteLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
