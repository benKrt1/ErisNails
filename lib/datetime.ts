import { fromZonedTime, toZonedTime } from "date-fns-tz";

// All salon scheduling is expressed in this timezone. Working hours and
// time-off store wall-clock times; bookings store UTC instants.
export const SALON_TIMEZONE = process.env.SALON_TIMEZONE || "Europe/Stockholm";

/** "HH:MM" or "HH:MM:SS" -> minutes since local midnight. */
export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** minutes since midnight -> "HH:MM" (zero-padded). */
export function minutesToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * A wall-clock time (`dateStr` "YYYY-MM-DD" + `minutes` since midnight) in the
 * salon timezone, converted to the corresponding UTC instant.
 */
export function salonLocalToUtc(
  dateStr: string,
  minutes: number,
  timeZone: string = SALON_TIMEZONE,
): Date {
  const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mm = String(minutes % 60).padStart(2, "0");
  return fromZonedTime(`${dateStr}T${hh}:${mm}:00`, timeZone);
}

/** A UTC instant -> minutes since local midnight in the salon timezone. */
export function utcToSalonMinutes(
  instant: Date,
  timeZone: string = SALON_TIMEZONE,
): number {
  const local = toZonedTime(instant, timeZone);
  return local.getHours() * 60 + local.getMinutes();
}

/** The weekday (0=Sun..6=Sat) of a "YYYY-MM-DD" date in the salon timezone. */
export function salonWeekday(
  dateStr: string,
  timeZone: string = SALON_TIMEZONE,
): number {
  // Noon avoids any DST edge near midnight.
  const noonUtc = fromZonedTime(`${dateStr}T12:00:00`, timeZone);
  return toZonedTime(noonUtc, timeZone).getDay();
}
