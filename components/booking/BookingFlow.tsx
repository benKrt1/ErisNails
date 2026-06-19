"use client";

import { useEffect, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { serviceName, type Service } from "@/lib/types";
import type { Slot } from "@/lib/availability";
import { buildIcs, icsDataUrl } from "@/lib/ics";
import type { BookingInput, BookingResult } from "@/app/[locale]/(site)/book/actions";
import MonthCalendar from "./MonthCalendar";

type CreateBooking = (input: BookingInput) => Promise<BookingResult>;

type Confirmation = Extract<BookingResult, { ok: true }>["confirmation"];

export default function BookingFlow({
  services,
  initialServiceId,
  createBooking,
}: {
  services: Service[];
  initialServiceId?: string;
  createBooking: CreateBooking;
}) {
  const locale = useLocale();
  const t = useTranslations("Booking");
  const tc = useTranslations("Confirmation");
  const tCommon = useTranslations("Common");

  const [serviceId, setServiceId] = useState(
    initialServiceId && services.some((s) => s.id === initialServiceId)
      ? initialServiceId
      : services[0]?.id ?? "",
  );
  const [date, setDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slot, setSlot] = useState<Slot | null>(null);

  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [pending, startTransition] = useTransition();

  const service = services.find((s) => s.id === serviceId) ?? null;

  // Fetch available slots whenever service or date changes.
  useEffect(() => {
    if (!serviceId || !date) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    setSlotsLoading(true);
    setSlot(null);
    fetch(`/api/availability?date=${date}&service=${serviceId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setSlots(data.slots ?? []);
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [serviceId, date]);

  function dateTimeLabel(iso: string): string {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "full",
      timeStyle: "short",
    }).format(new Date(iso));
  }

  function submit() {
    if (!service || !date || !slot) return;
    setError(null);
    startTransition(async () => {
      const result = await createBooking({
        serviceId: service.id,
        date,
        startsAt: slot.startsAt,
        name: form.name,
        phone: form.phone,
        email: form.email,
        notes: form.notes,
        locale,
      });
      if (result.ok) {
        setConfirmation(result.confirmation);
      } else if (result.error === "taken" || result.error === "unavailable") {
        setError(t("noSlots"));
        // Refresh slots so the taken time disappears.
        setSlot(null);
        if (date && serviceId) {
          const r = await fetch(`/api/availability?date=${date}&service=${serviceId}`);
          const d = await r.json();
          setSlots(d.slots ?? []);
        }
      } else {
        setError("error");
      }
    });
  }

  // ----- Confirmation view -----
  if (confirmation) {
    const ics = buildIcs({
      uid: `${confirmation.bookingId}@botanica-nails`,
      title: `Botanica Nails — ${confirmation.serviceName}`,
      startsAt: confirmation.startsAt,
      endsAt: confirmation.endsAt,
    });
    return (
      <div className="mx-auto max-w-xl rounded-3xl bg-cream-soft p-8 text-center">
        <h2 className="text-3xl text-ink">{tc("title")}</h2>
        <p className="mt-3 text-muted">
          {tc("thanks", { name: confirmation.name })}
        </p>
        <dl className="mt-8 space-y-2 text-left">
          <div className="flex justify-between border-b border-sand/70 pb-2">
            <dt className="text-muted">{tc("service")}</dt>
            <dd className="text-ink">{confirmation.serviceName}</dd>
          </div>
          <div className="flex justify-between border-b border-sand/70 pb-2">
            <dt className="text-muted">{tc("when")}</dt>
            <dd className="text-ink">{dateTimeLabel(confirmation.startsAt)}</dd>
          </div>
        </dl>
        <a
          href={icsDataUrl(ics)}
          download="botanica-appointment.ics"
          className="mt-8 inline-block rounded-full bg-clay px-6 py-3 text-cream-soft transition-colors hover:bg-clay-dark"
        >
          {tc("addToCalendar")}
        </a>
        <div className="mt-6 text-left text-sm text-muted">
          <p className="font-medium text-ink">{tc("tips")}</p>
          <ul className="mt-2 list-disc pl-5">
            <li>{tc("tip1")}</li>
            <li>{tc("tip2")}</li>
          </ul>
        </div>
        <div className="mt-8">
          <Link href="/" className="text-sm text-clay hover:underline">
            {tc("backHome")}
          </Link>
        </div>
      </div>
    );
  }

  // ----- Booking view (3 columns like the mockup) -----
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr_1fr]">
      {/* Column 1 — services */}
      <section className="rounded-2xl border border-sand bg-cream-soft p-5">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted">
          {t("stepService")}
        </h2>
        <div className="space-y-2">
          {services.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setServiceId(s.id)}
              className={[
                "flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-colors",
                s.id === serviceId ? "bg-sand/70" : "hover:bg-sand/40",
              ].join(" ")}
            >
              <span className="text-ink">{serviceName(s, locale)}</span>
              <span className="text-xs text-muted">
                {t("minutes", { count: s.duration_minutes })}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Column 2 — calendar + times */}
      <section className="space-y-5">
        <div>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted">
            {t("stepDate")}
          </h2>
          <MonthCalendar selected={date} onSelect={setDate} locale={locale} />
        </div>

        {date && (
          <div>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted">
              {t("stepTime")}
            </h2>
            {slotsLoading ? (
              <p className="text-sm text-muted">{t("loadingSlots")}</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-muted">{t("noSlots")}</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((s) => (
                  <button
                    key={s.startsAt}
                    type="button"
                    onClick={() => setSlot(s)}
                    className={[
                      "rounded-lg border px-2 py-2 text-sm transition-colors",
                      slot?.startsAt === s.startsAt
                        ? "border-clay bg-clay text-cream-soft"
                        : "border-sand text-ink hover:border-clay/60",
                    ].join(" ")}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Column 3 — summary + details */}
      <section className="rounded-2xl border border-sand bg-cream-soft p-5">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted">
          {t("summary")}
        </h2>

        {service && (
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">{t("stepService")}</dt>
              <dd className="text-ink">{serviceName(service, locale)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">{t("duration")}</dt>
              <dd className="text-ink">
                {t("minutes", { count: service.duration_minutes })}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">{t("price")}</dt>
              <dd className="text-ink">{service.price} kr</dd>
            </div>
            {slot && (
              <div className="flex justify-between border-t border-sand/70 pt-2">
                <dt className="text-muted">{t("stepTime")}</dt>
                <dd className="text-ink">{dateTimeLabel(slot.startsAt)}</dd>
              </div>
            )}
          </dl>
        )}

        <div className="mt-5 space-y-3">
          <input
            type="text"
            placeholder={t("name")}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-sand bg-cream px-3 py-2 text-sm outline-none focus:border-clay"
          />
          <input
            type="tel"
            placeholder={t("phone")}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded-lg border border-sand bg-cream px-3 py-2 text-sm outline-none focus:border-clay"
          />
          <input
            type="email"
            placeholder={t("email")}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg border border-sand bg-cream px-3 py-2 text-sm outline-none focus:border-clay"
          />
          <textarea
            placeholder={t("notes")}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-sand bg-cream px-3 py-2 text-sm outline-none focus:border-clay"
          />
        </div>

        {error && (
          <p className="mt-3 text-sm text-clay-dark">
            {error === "error" ? tCommon("error") : error}
          </p>
        )}

        <button
          type="button"
          disabled={
            !service ||
            !slot ||
            !form.name.trim() ||
            !form.phone.trim() ||
            !form.email.trim() ||
            pending
          }
          onClick={submit}
          className="mt-5 w-full rounded-full bg-clay px-6 py-3 text-cream-soft transition-colors hover:bg-clay-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? t("submitting") : t("confirm")}
        </button>
      </section>
    </div>
  );
}
