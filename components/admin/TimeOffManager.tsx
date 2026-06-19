"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { addTimeOff, deleteTimeOff } from "@/app/[locale]/admin/actions";

export type TimeOffEntry = {
  id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
};

export default function TimeOffManager({
  entries,
}: {
  entries: TimeOffEntry[];
}) {
  const t = useTranslations("Admin.timeOff");
  const locale = useLocale();
  const [pending, startTransition] = useTransition();

  const [date, setDate] = useState("");
  const [wholeDay, setWholeDay] = useState(true);
  const [start, setStart] = useState("10:00");
  const [end, setEnd] = useState("18:00");
  const [reason, setReason] = useState("");

  function add() {
    if (!date) return;
    startTransition(async () => {
      await addTimeOff(
        {
          date,
          start_time: wholeDay ? null : start,
          end_time: wholeDay ? null : end,
          reason: reason.trim() || null,
        },
        locale,
      );
      setDate("");
      setReason("");
    });
  }

  function label(e: TimeOffEntry) {
    const span =
      e.start_time && e.end_time
        ? `${e.start_time.slice(0, 5)}–${e.end_time.slice(0, 5)}`
        : t("wholeDay");
    return `${e.date} · ${span}${e.reason ? ` · ${e.reason}` : ""}`;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-sand bg-cream-soft p-5">
        <label className="flex flex-col gap-1 text-sm text-muted">
          {t("date")}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded border border-sand bg-cream px-2 py-1"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={wholeDay}
            onChange={(e) => setWholeDay(e.target.checked)}
          />
          {t("wholeDay")}
        </label>
        {!wholeDay && (
          <div className="flex items-end gap-2 text-sm text-muted">
            <label className="flex flex-col gap-1">
              {t("from")}
              <input
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="rounded border border-sand bg-cream px-2 py-1"
              />
            </label>
            <label className="flex flex-col gap-1">
              {t("to")}
              <input
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="rounded border border-sand bg-cream px-2 py-1"
              />
            </label>
          </div>
        )}
        <label className="flex flex-1 flex-col gap-1 text-sm text-muted">
          {t("reason")}
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="rounded border border-sand bg-cream px-2 py-1"
          />
        </label>
        <button
          type="button"
          onClick={add}
          disabled={pending || !date}
          className="rounded-full bg-clay px-5 py-2 text-sm text-cream-soft transition-colors hover:bg-clay-dark disabled:opacity-40"
        >
          {t("add")}
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="text-muted">{t("empty")}</p>
      ) : (
        <ul className="space-y-2">
          {entries.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between rounded-xl border border-sand bg-cream-soft px-4 py-3"
            >
              <span className="text-ink">{label(e)}</span>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(() => deleteTimeOff(e.id, locale))
                }
                className="text-sm text-muted hover:text-clay-dark"
              >
                {t("remove")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
