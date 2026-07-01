import { describe, it, expect } from "vitest";
import { salonLocalToUtc, utcToSalonMinutes } from "./datetime";

const TZ = "Europe/Stockholm";

describe("salonLocalToUtc", () => {
  it("converts local midnight to the correct UTC instant (summer, UTC+2)", () => {
    expect(salonLocalToUtc("2026-07-08", 0, TZ).toISOString()).toBe(
      "2026-07-07T22:00:00.000Z",
    );
  });

  it("rolls end-of-day (1440 min) into the NEXT calendar day, not 00:00 same day", () => {
    // Regression: "T24:00:00" used to parse as 00:00 of the same day, collapsing
    // the day's end bound onto its start and hiding all of the day's bookings.
    const dayStart = salonLocalToUtc("2026-07-08", 0, TZ).toISOString();
    const dayEnd = salonLocalToUtc("2026-07-08", 24 * 60, TZ).toISOString();
    expect(dayEnd).not.toBe(dayStart);
    expect(dayEnd).toBe("2026-07-08T22:00:00.000Z");
  });
});

describe("utcToSalonMinutes", () => {
  it("maps a UTC instant to local minutes since midnight (summer, UTC+2)", () => {
    expect(utcToSalonMinutes(new Date("2026-07-08T08:00:00Z"), TZ)).toBe(600); // 10:00
  });
});
