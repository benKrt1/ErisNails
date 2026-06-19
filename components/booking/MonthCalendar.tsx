"use client";

import { useState } from "react";

// Lightweight month calendar. Emits a "YYYY-MM-DD" string on select and
// disables past days. Weeks start on Monday.
const WEEKDAY_LABELS: Record<string, string[]> = {
  en: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
  sv: ["Må", "Ti", "On", "To", "Fr", "Lö", "Sö"],
};

function ymd(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function MonthCalendar({
  selected,
  onSelect,
  locale,
}: {
  selected: string | null;
  onSelect: (date: string) => void;
  locale: string;
}) {
  const today = new Date();
  const todayStr = ymd(today.getFullYear(), today.getMonth(), today.getDate());

  const [view, setView] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth(),
  }));

  const firstOfMonth = new Date(view.year, view.month, 1);
  // Convert JS Sunday-start (0..6) to Monday-start offset.
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();

  const monthLabel = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(firstOfMonth);

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function changeMonth(delta: number) {
    setView((v) => {
      const m = v.month + delta;
      return {
        year: v.year + Math.floor(m / 12),
        month: ((m % 12) + 12) % 12,
      };
    });
  }

  const labels = WEEKDAY_LABELS[locale] ?? WEEKDAY_LABELS.en;

  return (
    <div className="rounded-2xl border border-sand bg-cream-soft p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          className="rounded-full px-2 py-1 text-muted hover:bg-sand/50"
          aria-label="Previous month"
        >
          ‹
        </button>
        <span className="text-sm font-medium capitalize text-ink">
          {monthLabel}
        </span>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          className="rounded-full px-2 py-1 text-muted hover:bg-sand/50"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted">
        {labels.map((l) => (
          <div key={l} className="py-1">
            {l}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} />;
          const dateStr = ymd(view.year, view.month, day);
          const isPast = dateStr < todayStr;
          const isSelected = dateStr === selected;
          return (
            <button
              key={dateStr}
              type="button"
              disabled={isPast}
              onClick={() => onSelect(dateStr)}
              className={[
                "aspect-square rounded-full text-sm transition-colors",
                isPast
                  ? "cursor-not-allowed text-muted/30"
                  : "text-ink hover:bg-sand/60",
                isSelected ? "bg-clay text-cream-soft hover:bg-clay" : "",
              ].join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
