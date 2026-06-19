import "server-only";
import { getAdminClient } from "./supabase/admin";
import { computeSlotsForDay, type Slot } from "./availability";
import { salonWeekday, salonLocalToUtc, SALON_TIMEZONE } from "./datetime";
import { demoServiceById, DEMO_WORKING_HOURS } from "./demo";
import type { WorkingHour, TimeOff, Booking, Service } from "./types";

/**
 * Load all inputs for a day from Supabase and compute bookable slots for a
 * given service. Falls back to a demo schedule when Supabase isn't configured.
 */
export async function getAvailableSlots(
  dateStr: string,
  serviceId: string,
): Promise<Slot[]> {
  const supabase = getAdminClient();

  // Demo mode: compute slots from the demo schedule (no bookings/time-off).
  if (!supabase) {
    const demoService = demoServiceById(serviceId);
    if (!demoService) return [];
    const weekday = salonWeekday(dateStr);
    return computeSlotsForDay({
      dateStr,
      durationMinutes: demoService.duration_minutes,
      workingHours: DEMO_WORKING_HOURS.filter((w) => w.weekday === weekday),
      timeOff: [],
      bookings: [],
      timeZone: SALON_TIMEZONE,
    });
  }

  const { data: service } = await supabase
    .from("services")
    .select("*")
    .eq("id", serviceId)
    .eq("is_active", true)
    .single<Service>();

  if (!service) return [];

  const weekday = salonWeekday(dateStr);

  // UTC bounds of the salon-local day, to fetch overlapping bookings.
  const dayStart = salonLocalToUtc(dateStr, 0).toISOString();
  const dayEnd = salonLocalToUtc(dateStr, 24 * 60).toISOString();

  const [workingRes, timeOffRes, bookingsRes] = await Promise.all([
    supabase.from("working_hours").select("*").eq("weekday", weekday),
    supabase.from("time_off").select("*").eq("date", dateStr),
    supabase
      .from("bookings")
      .select("*")
      .eq("status", "confirmed")
      .lt("starts_at", dayEnd)
      .gt("ends_at", dayStart),
  ]);

  return computeSlotsForDay({
    dateStr,
    durationMinutes: service.duration_minutes,
    workingHours: (workingRes.data ?? []) as WorkingHour[],
    timeOff: (timeOffRes.data ?? []) as TimeOff[],
    bookings: (bookingsRes.data ?? []) as Booking[],
    timeZone: SALON_TIMEZONE,
  });
}
