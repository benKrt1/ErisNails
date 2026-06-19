"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { cancelBooking } from "@/app/[locale]/admin/actions";

export type AdminBooking = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  starts_at: string;
  notes: string | null;
  serviceName: string;
};

export default function BookingsList({ bookings }: { bookings: AdminBooking[] }) {
  const t = useTranslations("Admin.dashboard");
  const locale = useLocale();
  const [pending, startTransition] = useTransition();

  function when(iso: string) {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  }

  if (bookings.length === 0) {
    return <p className="text-muted">{t("empty")}</p>;
  }

  return (
    <ul className="space-y-3">
      {bookings.map((b) => (
        <li
          key={b.id}
          className="flex flex-col gap-3 rounded-2xl border border-sand bg-cream-soft p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-ink">
              {when(b.starts_at)} · {b.serviceName}
            </p>
            <p className="mt-1 text-sm text-muted">
              {b.customer_name} · {b.customer_phone} · {b.customer_email}
            </p>
            {b.notes && (
              <p className="mt-1 text-sm italic text-muted">{b.notes}</p>
            )}
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (confirm(t("cancelConfirm"))) {
                startTransition(() => cancelBooking(b.id, locale));
              }
            }}
            className="shrink-0 rounded-full border border-sand px-4 py-2 text-sm text-muted transition-colors hover:border-clay hover:text-clay-dark disabled:opacity-40"
          >
            {t("cancel")}
          </button>
        </li>
      ))}
    </ul>
  );
}
