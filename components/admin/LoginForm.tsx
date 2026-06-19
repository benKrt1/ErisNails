"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { signIn } from "@/app/[locale]/admin/actions";

export default function LoginForm({ demo = false }: { demo?: boolean }) {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(false);
    startTransition(async () => {
      const result = await signIn({ email, password, locale });
      if (result?.error) setError(true);
    });
  }

  return (
    <div className="mx-auto mt-24 max-w-sm rounded-2xl border border-sand bg-cream-soft p-8">
      <h1 className="text-2xl text-ink">{t("title")}</h1>
      <div className="mt-6 space-y-3">
        <input
          type="email"
          placeholder={t("email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-sand bg-cream px-3 py-2 text-sm outline-none focus:border-clay"
        />
        <input
          type="password"
          placeholder={t("password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="w-full rounded-lg border border-sand bg-cream px-3 py-2 text-sm outline-none focus:border-clay"
        />
        {error && <p className="text-sm text-clay-dark">{t("invalidLogin")}</p>}
        <button
          type="button"
          onClick={submit}
          disabled={pending || !email || !password}
          className="w-full rounded-full bg-clay px-6 py-3 text-cream-soft transition-colors hover:bg-clay-dark disabled:opacity-40"
        >
          {t("signIn")}
        </button>
      </div>

      {demo && (
        <div className="mt-6 border-t border-sand pt-5 text-center">
          <p className="text-sm text-muted">{t("previewLoginNote")}</p>
          <Link
            href="/admin"
            className="mt-3 inline-block rounded-full border border-clay px-6 py-2.5 text-sm text-clay-dark transition-colors hover:bg-clay/10"
          >
            {t("previewEnter")}
          </Link>
        </div>
      )}
    </div>
  );
}
