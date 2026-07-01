// Shared domain types for the booking app.

export type ServiceCategory = "nails" | "brows";

export type Service = {
  id: string;
  name_en: string;
  name_sv: string;
  description_en: string | null;
  description_sv: string | null;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  sort_order: number;
  category: ServiceCategory;
};

export type WorkingHour = {
  id: string;
  weekday: number; // 0 = Sunday … 6 = Saturday
  start_time: string; // "HH:MM" (local salon time)
  end_time: string; // "HH:MM"
  is_active: boolean;
};

export type TimeOff = {
  id: string;
  date: string; // "YYYY-MM-DD"
  start_time: string | null; // null = whole-day off
  end_time: string | null;
  reason: string | null;
};

export type BookingStatus = "confirmed" | "cancelled";

export type Booking = {
  id: string;
  service_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  starts_at: string; // ISO timestamptz
  ends_at: string; // ISO timestamptz
  status: BookingStatus;
  notes: string | null;
  created_at: string;
};

/** Localized helpers — pick the right column for the active locale. */
export function serviceName(service: Service, locale: string): string {
  return locale === "sv" ? service.name_sv : service.name_en;
}

export function serviceDescription(
  service: Service,
  locale: string,
): string | null {
  return locale === "sv" ? service.description_sv : service.description_en;
}

/**
 * Split an ordered service list into its two categories, preserving order.
 * Single source of truth for the nails/brows grouping used across the home,
 * services, and booking pages.
 */
export function servicesByCategory(services: Service[]): {
  nails: Service[];
  brows: Service[];
} {
  return {
    nails: services.filter((s) => s.category === "nails"),
    brows: services.filter((s) => s.category === "brows"),
  };
}
