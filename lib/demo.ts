import type { Service, WorkingHour } from "./types";

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

export function demoServiceById(id: string): Service | null {
  return DEMO_SERVICES.find((s) => s.id === id) ?? null;
}
