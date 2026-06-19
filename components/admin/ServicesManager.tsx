"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  saveService,
  deleteService,
  type ServiceInput,
} from "@/app/[locale]/admin/actions";
import type { Service } from "@/lib/types";

const EMPTY: ServiceInput = {
  name_en: "",
  name_sv: "",
  description_en: "",
  description_sv: "",
  duration_minutes: 30,
  price: 0,
  is_active: true,
  sort_order: 0,
};

function ServiceForm({
  initial,
  onDelete,
}: {
  initial: ServiceInput;
  onDelete?: () => void;
}) {
  const t = useTranslations("Admin.services");
  const locale = useLocale();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<ServiceInput>(initial);

  function set<K extends keyof ServiceInput>(key: K, value: ServiceInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function save() {
    startTransition(() => saveService(form, locale));
  }

  const input =
    "rounded border border-sand bg-cream px-2 py-1 text-sm outline-none focus:border-clay";

  return (
    <div className="rounded-2xl border border-sand bg-cream-soft p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-muted">
          {t("nameEn")}
          <input
            className={input}
            value={form.name_en}
            onChange={(e) => set("name_en", e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          {t("nameSv")}
          <input
            className={input}
            value={form.name_sv}
            onChange={(e) => set("name_sv", e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          {t("descEn")}
          <input
            className={input}
            value={form.description_en ?? ""}
            onChange={(e) => set("description_en", e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          {t("descSv")}
          <input
            className={input}
            value={form.description_sv ?? ""}
            onChange={(e) => set("description_sv", e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          {t("duration")}
          <input
            type="number"
            min={5}
            step={5}
            className={input}
            value={form.duration_minutes}
            onChange={(e) =>
              set("duration_minutes", Number(e.target.value) || 0)
            }
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          {t("price")}
          <input
            type="number"
            min={0}
            className={input}
            value={form.price}
            onChange={(e) => set("price", Number(e.target.value) || 0)}
          />
        </label>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => set("is_active", e.target.checked)}
          />
          {t("active")}
        </label>
        <button
          type="button"
          onClick={save}
          disabled={pending || !form.name_en || !form.name_sv}
          className="rounded-full bg-clay px-5 py-2 text-sm text-cream-soft transition-colors hover:bg-clay-dark disabled:opacity-40"
        >
          {initial.id ? t("save") : t("add")}
        </button>
        {onDelete && (
          <button
            type="button"
            disabled={pending}
            onClick={onDelete}
            className="text-sm text-muted hover:text-clay-dark"
          >
            {t("remove")}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ServicesManager({
  services,
}: {
  services: Service[];
}) {
  const t = useTranslations("Admin.services");
  const locale = useLocale();
  const [, startTransition] = useTransition();

  return (
    <div className="space-y-5">
      {services.map((s) => (
        <ServiceForm
          key={s.id}
          initial={{
            id: s.id,
            name_en: s.name_en,
            name_sv: s.name_sv,
            description_en: s.description_en,
            description_sv: s.description_sv,
            duration_minutes: s.duration_minutes,
            price: s.price,
            is_active: s.is_active,
            sort_order: s.sort_order,
          }}
          onDelete={() =>
            startTransition(() => deleteService(s.id, locale))
          }
        />
      ))}

      <div>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted">
          {t("add")}
        </h2>
        <ServiceForm
          initial={{ ...EMPTY, sort_order: services.length + 1 }}
        />
      </div>
    </div>
  );
}
