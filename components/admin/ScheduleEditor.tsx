"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { saveWorkingHours } from "@/app/[locale]/admin/actions";

type Row = { is_active: boolean; start_time: string; end_time: string };

// Monday-first weekday order.
const ORDER = [1, 2, 3, 4, 5, 6, 0];

export default function ScheduleEditor({
  initial,
}: {
  initial: Record<number, Row>;
}) {
  const t = useTranslations("Admin.schedule");
  const tw = useTranslations("Admin.weekdays");
  const locale = useLocale();
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const [rows, setRows] = useState<Record<number, Row>>(() => {
    const base: Record<number, Row> = {};
    for (const wd of ORDER) {
      base[wd] = initial[wd] ?? {
        is_active: false,
        start_time: "10:00",
        end_time: "18:00",
      };
    }
    return base;
  });

  function update(wd: number, patch: Partial<Row>) {
    setRows((r) => ({ ...r, [wd]: { ...r[wd], ...patch } }));
    setSaved(false);
  }

  function save() {
    const payload = ORDER.map((wd) => ({
      weekday: wd,
      start_time: rows[wd].start_time,
      end_time: rows[wd].end_time,
      is_active: rows[wd].is_active,
    }));
    startTransition(async () => {
      await saveWorkingHours(payload, locale);
      setSaved(true);
    });
  }

  return (
    <div>
      <div className="space-y-2">
        {ORDER.map((wd) => {
          const row = rows[wd];
          return (
            <div
              key={wd}
              className="flex flex-wrap items-center gap-4 rounded-xl border border-sand bg-cream-soft px-4 py-3"
            >
              <label className="flex w-32 items-center gap-2">
                <input
                  type="checkbox"
                  checked={row.is_active}
                  onChange={(e) => update(wd, { is_active: e.target.checked })}
                />
                <span className="text-ink">{tw(String(wd))}</span>
              </label>
              {row.is_active ? (
                <div className="flex items-center gap-2 text-sm text-muted">
                  <span>{t("from")}</span>
                  <input
                    type="time"
                    value={row.start_time}
                    onChange={(e) => update(wd, { start_time: e.target.value })}
                    className="rounded border border-sand bg-cream px-2 py-1"
                  />
                  <span>{t("to")}</span>
                  <input
                    type="time"
                    value={row.end_time}
                    onChange={(e) => update(wd, { end_time: e.target.value })}
                    className="rounded border border-sand bg-cream px-2 py-1"
                  />
                </div>
              ) : (
                <span className="text-sm text-muted/70">{t("closed")}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded-full bg-clay px-6 py-2.5 text-cream-soft transition-colors hover:bg-clay-dark disabled:opacity-40"
        >
          {t("save")}
        </button>
        {saved && <span className="text-sm text-olive">{t("saved")}</span>}
      </div>
    </div>
  );
}
