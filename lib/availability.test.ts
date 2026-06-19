import { describe, it, expect } from "vitest";
import {
  subtractIntervals,
  generateSlotStarts,
  computeSlotsForDay,
} from "./availability";
import type { WorkingHour, TimeOff, Booking } from "./types";

const TZ = "Europe/Stockholm";

// A "now" far in the past so the lead-time filter never trims slots,
// except in the dedicated lead-time test.
const PAST = new Date("2000-01-01T00:00:00Z");

function workingHour(start: string, end: string): WorkingHour {
  return { id: "w", weekday: 2, start_time: start, end_time: end, is_active: true };
}

function booking(startsAt: string, endsAt: string): Booking {
  return {
    id: "b",
    service_id: "s",
    customer_name: "x",
    customer_phone: "x",
    customer_email: "x",
    starts_at: startsAt,
    ends_at: endsAt,
    status: "confirmed",
    notes: null,
    created_at: startsAt,
  };
}

describe("subtractIntervals", () => {
  it("splits an interval around a middle block", () => {
    expect(subtractIntervals([{ start: 0, end: 100 }], [{ start: 20, end: 40 }])).toEqual([
      { start: 0, end: 20 },
      { start: 40, end: 100 },
    ]);
  });

  it("keeps intervals that do not overlap", () => {
    expect(
      subtractIntervals([{ start: 0, end: 100 }], [{ start: 200, end: 300 }]),
    ).toEqual([{ start: 0, end: 100 }]);
  });

  it("removes a fully covered interval", () => {
    expect(
      subtractIntervals([{ start: 10, end: 50 }], [{ start: 0, end: 100 }]),
    ).toEqual([]);
  });
});

describe("generateSlotStarts", () => {
  it("steps within a window leaving room for the duration", () => {
    const starts = generateSlotStarts([{ start: 600, end: 720 }], 30, 15);
    expect(starts).toEqual([600, 615, 630, 645, 660, 675, 690]);
  });

  it("aligns starts to the step grid", () => {
    const starts = generateSlotStarts([{ start: 605, end: 700 }], 30, 15);
    expect(starts[0]).toBe(615); // ceil to next 15-min mark
  });
});

describe("computeSlotsForDay", () => {
  const dateStr = "2030-06-04"; // a Tuesday

  it("returns slots across working hours minus a booking", () => {
    // 10:00-12:00 working, booking 10:30-11:00, duration 30, step 15.
    const slots = computeSlotsForDay({
      dateStr,
      durationMinutes: 30,
      workingHours: [workingHour("10:00", "12:00")],
      timeOff: [],
      bookings: [booking(`${dateStr}T08:30:00Z`, `${dateStr}T09:00:00Z`)], // 10:30-11:00 local (UTC+2)
      now: PAST,
      timeZone: TZ,
      stepMinutes: 15,
    });
    expect(slots.map((s) => s.label)).toEqual(["10:00", "11:00", "11:15", "11:30"]);
  });

  it("returns nothing on a whole-day time off", () => {
    const off: TimeOff = {
      id: "o",
      date: dateStr,
      start_time: null,
      end_time: null,
      reason: "Closed",
    };
    const slots = computeSlotsForDay({
      dateStr,
      durationMinutes: 30,
      workingHours: [workingHour("10:00", "18:00")],
      timeOff: [off],
      bookings: [],
      now: PAST,
      timeZone: TZ,
    });
    expect(slots).toEqual([]);
  });

  it("subtracts a partial time-off block", () => {
    const off: TimeOff = {
      id: "o",
      date: dateStr,
      start_time: "10:00",
      end_time: "11:00",
      reason: "Lunch prep",
    };
    const slots = computeSlotsForDay({
      dateStr,
      durationMinutes: 60,
      workingHours: [workingHour("10:00", "13:00")],
      timeOff: [off],
      bookings: [],
      now: PAST,
      timeZone: TZ,
      stepMinutes: 30,
    });
    // Free 11:00-13:00 -> starts 11:00, 11:30, 12:00 (12:00+60=13:00).
    expect(slots.map((s) => s.label)).toEqual(["11:00", "11:30", "12:00"]);
  });

  it("returns no slots when no working hours that day", () => {
    const slots = computeSlotsForDay({
      dateStr,
      durationMinutes: 30,
      workingHours: [],
      timeOff: [],
      bookings: [],
      now: PAST,
      timeZone: TZ,
    });
    expect(slots).toEqual([]);
  });

  it("filters out slots inside the minimum lead time", () => {
    // now = 10:00 local (08:00Z) on the day; lead 60 min => first slot >= 11:00.
    const now = new Date(`${dateStr}T08:00:00Z`);
    const slots = computeSlotsForDay({
      dateStr,
      durationMinutes: 30,
      workingHours: [workingHour("10:00", "12:00")],
      timeOff: [],
      bookings: [],
      now,
      timeZone: TZ,
      stepMinutes: 30,
      minLeadMinutes: 60,
    });
    expect(slots.map((s) => s.label)).toEqual(["11:00", "11:30"]);
  });
});
