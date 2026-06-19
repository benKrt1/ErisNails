import {
  parseTimeToMinutes,
  minutesToTime,
  salonLocalToUtc,
  utcToSalonMinutes,
  salonWeekday,
  SALON_TIMEZONE,
} from "./datetime";
import type { WorkingHour, TimeOff, Booking } from "./types";

/** A half-open interval [start, end) in minutes since local midnight. */
export type Interval = { start: number; end: number };

export const SLOT_STEP_MINUTES = 15;
export const MIN_LEAD_MINUTES = 60;

/**
 * Remove `blocks` from `base` intervals, returning the remaining free pieces.
 * Pure interval subtraction — the heart of availability.
 */
export function subtractIntervals(
  base: Interval[],
  blocks: Interval[],
): Interval[] {
  let result = [...base];

  for (const block of blocks) {
    const next: Interval[] = [];
    for (const iv of result) {
      // No overlap — keep as is.
      if (block.end <= iv.start || block.start >= iv.end) {
        next.push(iv);
        continue;
      }
      // Left remainder.
      if (block.start > iv.start) {
        next.push({ start: iv.start, end: block.start });
      }
      // Right remainder.
      if (block.end < iv.end) {
        next.push({ start: block.end, end: iv.end });
      }
    }
    result = next;
  }

  return result.filter((iv) => iv.end > iv.start);
}

/**
 * Compute free intervals (in local minutes) for one day, given the day's
 * working windows, time-off blocks, and existing busy intervals.
 */
export function computeFreeIntervals(params: {
  workingWindows: Interval[];
  blocks: Interval[];
}): Interval[] {
  const { workingWindows, blocks } = params;
  return subtractIntervals(workingWindows, blocks).sort(
    (a, b) => a.start - b.start,
  );
}

/**
 * Within free intervals, generate candidate slot starts (in local minutes)
 * that fit a service of `durationMinutes`, stepping by `stepMinutes`.
 */
export function generateSlotStarts(
  freeIntervals: Interval[],
  durationMinutes: number,
  stepMinutes: number = SLOT_STEP_MINUTES,
): number[] {
  const starts: number[] = [];
  for (const iv of freeIntervals) {
    // Align starts to the step grid.
    let s = Math.ceil(iv.start / stepMinutes) * stepMinutes;
    while (s + durationMinutes <= iv.end) {
      starts.push(s);
      s += stepMinutes;
    }
  }
  return starts;
}

export type Slot = {
  /** Local label, e.g. "10:30". */
  label: string;
  /** UTC instant ISO string for the slot start. */
  startsAt: string;
  /** UTC instant ISO string for the slot end. */
  endsAt: string;
};

/**
 * Pure end-to-end computation of bookable slots for a given day.
 * All inputs are already scoped to `dateStr`.
 */
export function computeSlotsForDay(params: {
  dateStr: string; // "YYYY-MM-DD"
  durationMinutes: number;
  workingHours: WorkingHour[]; // for the day's weekday
  timeOff: TimeOff[]; // entries on this date
  bookings: Booking[]; // confirmed bookings on this date
  now?: Date;
  timeZone?: string;
  stepMinutes?: number;
  minLeadMinutes?: number;
}): Slot[] {
  const {
    dateStr,
    durationMinutes,
    workingHours,
    timeOff,
    bookings,
    now = new Date(),
    timeZone = SALON_TIMEZONE,
    stepMinutes = SLOT_STEP_MINUTES,
    minLeadMinutes = MIN_LEAD_MINUTES,
  } = params;

  // Working windows for the day.
  const workingWindows: Interval[] = workingHours
    .filter((w) => w.is_active)
    .map((w) => ({
      start: parseTimeToMinutes(w.start_time),
      end: parseTimeToMinutes(w.end_time),
    }));

  if (workingWindows.length === 0) return [];

  // Blocks = time-off (whole-day or partial) + existing bookings.
  const blocks: Interval[] = [];

  for (const off of timeOff) {
    if (off.start_time === null || off.end_time === null) {
      // Whole day off — nothing is available.
      return [];
    }
    blocks.push({
      start: parseTimeToMinutes(off.start_time),
      end: parseTimeToMinutes(off.end_time),
    });
  }

  for (const b of bookings) {
    if (b.status !== "confirmed") continue;
    blocks.push({
      start: utcToSalonMinutes(new Date(b.starts_at), timeZone),
      end: utcToSalonMinutes(new Date(b.ends_at), timeZone),
    });
  }

  const free = computeFreeIntervals({ workingWindows, blocks });
  const starts = generateSlotStarts(free, durationMinutes, stepMinutes);

  const earliest = now.getTime() + minLeadMinutes * 60_000;

  const slots: Slot[] = [];
  for (const startMin of starts) {
    const startsAt = salonLocalToUtc(dateStr, startMin, timeZone);
    if (startsAt.getTime() < earliest) continue; // past / inside lead time
    const endsAt = salonLocalToUtc(dateStr, startMin + durationMinutes, timeZone);
    slots.push({
      label: minutesToTime(startMin),
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    });
  }

  return slots;
}

export { salonWeekday };
