import type { Service, WorkingHour } from "./types";

/**
 * True when Supabase isn't configured. In this mode the app serves demo data
 * and the admin panel is open for preview (no auth, nothing persisted) so the
 * product can be shown before any backend setup.
 */
export function isDemoMode(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL;
}

/**
 * Demo data used ONLY when Supabase isn't configured, so the booking flow
 * (calendar, time slots, confirmation) can be previewed locally before any
 * backend setup. Once env vars are present, real data takes over everywhere.
 */
export const DEMO_SERVICES: Service[] = [
  {
    id: "demo-classic",
    name_en: "Classic Manicure",
    name_sv: "Klassisk Manikyr",
    description_en: "A gentle shaping, cuticle care, and polish.",
    description_sv: "Mjuk formning, nagelbandsvård och lack.",
    duration_minutes: 30,
    price: 350,
    is_active: true,
    sort_order: 1,
  },
  {
    id: "demo-gel",
    name_en: "Gel Manicure",
    name_sv: "Gelmanikyr",
    description_en: "Long-lasting gel colour with a careful finish.",
    description_sv: "Långhållbar gelfärg med omsorgsfull finish.",
    duration_minutes: 60,
    price: 550,
    is_active: true,
    sort_order: 2,
  },
  {
    id: "demo-pedicure",
    name_en: "Spa Pedicure",
    name_sv: "Spa-pedikyr",
    description_en: "A restorative soak, exfoliation, and polish.",
    description_sv: "Återställande fotbad, peeling och lack.",
    duration_minutes: 75,
    price: 650,
    is_active: true,
    sort_order: 3,
  },
];

// Tuesday–Saturday, 10:00–18:00 (Sat until 16:00).
export const DEMO_WORKING_HOURS: WorkingHour[] = [2, 3, 4, 5, 6].map((wd) => ({
  id: `demo-wh-${wd}`,
  weekday: wd,
  start_time: "10:00",
  end_time: wd === 6 ? "16:00" : "18:00",
  is_active: true,
}));

/** Demo schedule shaped for the admin schedule editor (keyed by weekday). */
export function demoScheduleMap(): Record<
  number,
  { is_active: boolean; start_time: string; end_time: string }
> {
  const map: Record<
    number,
    { is_active: boolean; start_time: string; end_time: string }
  > = {};
  for (const w of DEMO_WORKING_HOURS) {
    map[w.weekday] = {
      is_active: w.is_active,
      start_time: w.start_time,
      end_time: w.end_time,
    };
  }
  return map;
}

export function demoServiceById(id: string): Service | null {
  return DEMO_SERVICES.find((s) => s.id === id) ?? null;
}

type DemoBooking = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  starts_at: string;
  notes: string | null;
  serviceName: string;
};

/** A couple of sample upcoming bookings for the admin dashboard preview. */
export function demoUpcomingBookings(locale: string): DemoBooking[] {
  const name = (s: Service) => (locale === "sv" ? s.name_sv : s.name_en);
  const inDays = (days: number, hour: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };
  return [
    {
      id: "demo-b1",
      customer_name: "Anna Lind",
      customer_phone: "070-123 45 67",
      customer_email: "anna@example.com",
      starts_at: inDays(1, 11),
      notes: null,
      serviceName: name(DEMO_SERVICES[1]),
    },
    {
      id: "demo-b2",
      customer_name: "Maria Berg",
      customer_phone: "073-987 65 43",
      customer_email: "maria@example.com",
      starts_at: inDays(2, 14),
      notes: "Allergisk mot doft / fragrance-free, tack.",
      serviceName: name(DEMO_SERVICES[0]),
    },
  ];
}
