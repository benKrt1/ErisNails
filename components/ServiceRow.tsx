import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { serviceName, serviceDescription, type Service } from "@/lib/types";

// A single service line: name, description, duration + price, and a book link.
export default async function ServiceRow({ service }: { service: Service }) {
  const locale = await getLocale();
  const t = await getTranslations("Services");
  const name = serviceName(service, locale);
  const description = serviceDescription(service, locale);

  return (
    <div className="flex flex-col gap-3 border-b border-sand/70 py-7 sm:flex-row sm:items-start sm:justify-between">
      <div className="max-w-md">
        <h3 className="text-xl text-ink">{name}</h3>
        {description && (
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {description}
          </p>
        )}
        <p className="mt-2 text-xs uppercase tracking-wide text-muted/80">
          {t("minutes", { count: service.duration_minutes })}
        </p>
      </div>
      <div className="flex items-center gap-6 sm:flex-col sm:items-end sm:gap-2">
        <span className="text-lg text-ink">{service.price} kr</span>
        <Link
          href={`/book?service=${service.id}`}
          className="text-sm text-clay underline-offset-4 hover:underline"
        >
          {t("book")} →
        </Link>
      </div>
    </div>
  );
}
