// Minimal iCalendar (.ics) generation for "Add to calendar". Pure string
// building — safe to use on both server and client.

function toIcsUtc(iso: string): string {
  // 2030-06-04T08:00:00.000Z -> 20300604T080000Z
  return iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "").replace(/Z?$/, "Z");
}

function escapeText(text: string): string {
  return text.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
}

export function buildIcs(params: {
  uid: string;
  title: string;
  description?: string;
  location?: string;
  startsAt: string; // ISO UTC
  endsAt: string; // ISO UTC
}): string {
  const { uid, title, description, location, startsAt, endsAt } = params;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Botanica Nails//Booking//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toIcsUtc(new Date().toISOString())}`,
    `DTSTART:${toIcsUtc(startsAt)}`,
    `DTEND:${toIcsUtc(endsAt)}`,
    `SUMMARY:${escapeText(title)}`,
    description ? `DESCRIPTION:${escapeText(description)}` : "",
    location ? `LOCATION:${escapeText(location)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.filter(Boolean).join("\r\n");
}

/** Build a `data:` URL so the .ics can be downloaded without a server round-trip. */
export function icsDataUrl(ics: string): string {
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}
