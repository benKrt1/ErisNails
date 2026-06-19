import "server-only";
import { Resend } from "resend";
import { buildIcs } from "./ics";
import { SALON_TIMEZONE } from "./datetime";

export type BookingEmailData = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceName: string;
  startsAt: string; // ISO UTC
  endsAt: string; // ISO UTC
  notes?: string | null;
  bookingId: string;
};

const resendKey = process.env.RESEND_API_KEY;
const resend = resendKey ? new Resend(resendKey) : null;

function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat("sv-SE", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: SALON_TIMEZONE,
  }).format(new Date(iso));
}

/**
 * Send the new-booking notification (to Eri) and confirmation (to customer).
 * No-ops gracefully if Resend isn't configured, so bookings still succeed.
 */
export async function sendBookingEmails(data: BookingEmailData): Promise<void> {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping booking emails.");
    return;
  }

  const from = process.env.EMAIL_FROM || "Botanica Nails <onboarding@resend.dev>";
  const salonInbox = process.env.SALON_NOTIFY_EMAIL;
  const when = formatWhen(data.startsAt);

  const ics = buildIcs({
    uid: `${data.bookingId}@botanica-nails`,
    title: `Botanica Nails — ${data.serviceName}`,
    description: `Booking for ${data.customerName}`,
    startsAt: data.startsAt,
    endsAt: data.endsAt,
  });
  const icsAttachment = {
    filename: "appointment.ics",
    content: Buffer.from(ics).toString("base64"),
  };

  const tasks: Promise<unknown>[] = [];

  // Notify Eri.
  if (salonInbox) {
    tasks.push(
      resend.emails.send({
        from,
        to: salonInbox,
        subject: `New booking — ${data.serviceName}, ${when}`,
        text: [
          `New booking:`,
          ``,
          `Service: ${data.serviceName}`,
          `When: ${when}`,
          `Name: ${data.customerName}`,
          `Phone: ${data.customerPhone}`,
          `Email: ${data.customerEmail}`,
          data.notes ? `Notes: ${data.notes}` : ``,
        ]
          .filter(Boolean)
          .join("\n"),
      }),
    );
  }

  // Confirm to the customer.
  tasks.push(
    resend.emails.send({
      from,
      to: data.customerEmail,
      subject: `Your booking is confirmed — ${when}`,
      text: [
        `Hi ${data.customerName},`,
        ``,
        `Your appointment at Botanica Nails is confirmed.`,
        ``,
        `Service: ${data.serviceName}`,
        `When: ${when}`,
        ``,
        `We look forward to seeing you.`,
      ].join("\n"),
      attachments: [icsAttachment],
    }),
  );

  const results = await Promise.allSettled(tasks);
  for (const r of results) {
    if (r.status === "rejected") {
      console.error("Booking email failed:", r.reason);
    }
  }
}
