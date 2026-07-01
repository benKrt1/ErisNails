import "server-only";
import { Resend } from "resend";
import nodemailer from "nodemailer";
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

const DISPLAY_NAME = "Atelier Eri";

// --- Transports -----------------------------------------------------------
// Two ways to send. Gmail SMTP takes priority when configured (delivers to any
// recipient, no verified domain needed); otherwise we fall back to Resend.
// Resend is kept intact on purpose so we can switch back once a domain is
// verified — just remove the GMAIL_* vars.

const gmailUser = process.env.GMAIL_USER;
const gmailPass = process.env.GMAIL_APP_PASSWORD;
const gmailTransport =
  gmailUser && gmailPass
    ? nodemailer.createTransport({
        service: "gmail",
        auth: { user: gmailUser, pass: gmailPass },
      })
    : null;

const resendKey = process.env.RESEND_API_KEY;
const resend = resendKey ? new Resend(resendKey) : null;

type OutgoingEmail = {
  to: string | string[];
  subject: string;
  text: string;
  ics?: string; // raw ICS content; attached as appointment.ics when present
};

/**
 * Sender address. Gmail SMTP requires the "from" to be the authenticated
 * account, so we use the Gmail address (with a friendly display name). For
 * Resend we honour EMAIL_FROM.
 */
function fromAddress(): string {
  if (gmailTransport) return `${DISPLAY_NAME} <${gmailUser}>`;
  return process.env.EMAIL_FROM || `${DISPLAY_NAME} <onboarding@resend.dev>`;
}

async function sendOne(msg: OutgoingEmail): Promise<void> {
  const from = fromAddress();
  const icsBase64 = msg.ics
    ? Buffer.from(msg.ics).toString("base64")
    : undefined;

  if (gmailTransport) {
    await gmailTransport.sendMail({
      from,
      to: msg.to,
      subject: msg.subject,
      text: msg.text,
      attachments: icsBase64
        ? [
            {
              filename: "appointment.ics",
              content: icsBase64,
              encoding: "base64",
            },
          ]
        : undefined,
    });
    return;
  }

  if (resend) {
    await resend.emails.send({
      from,
      to: msg.to,
      subject: msg.subject,
      text: msg.text,
      attachments: icsBase64
        ? [{ filename: "appointment.ics", content: icsBase64 }]
        : undefined,
    });
    return;
  }

  throw new Error("No email transport configured");
}

function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat("sv-SE", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: SALON_TIMEZONE,
  }).format(new Date(iso));
}

/**
 * Send the new-booking notification (to Eri) and confirmation (to customer).
 * No-ops gracefully if no transport is configured, so bookings still succeed.
 */
export async function sendBookingEmails(data: BookingEmailData): Promise<void> {
  if (!gmailTransport && !resend) {
    console.warn(
      "No email transport configured (GMAIL_* or RESEND_API_KEY) — skipping booking emails.",
    );
    return;
  }

  // SALON_NOTIFY_EMAIL may list several recipients, comma- or semicolon-
  // separated (e.g. "eri@x.com, owner@y.com").
  const salonInbox = (process.env.SALON_NOTIFY_EMAIL ?? "")
    .split(/[,;]/)
    .map((addr) => addr.trim())
    .filter(Boolean);
  const when = formatWhen(data.startsAt);

  const ics = buildIcs({
    uid: `${data.bookingId}@atelier-eri`,
    title: `Atelier Eri — ${data.serviceName}`,
    description: `Booking for ${data.customerName}`,
    startsAt: data.startsAt,
    endsAt: data.endsAt,
  });

  const messages: OutgoingEmail[] = [];

  // Notify Eri (one email to all salon recipients).
  if (salonInbox.length > 0) {
    messages.push({
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
    });
  }

  // Confirm to the customer.
  messages.push({
    to: data.customerEmail,
    subject: `Your booking is confirmed — ${when}`,
    text: [
      `Hi ${data.customerName},`,
      ``,
      `Your appointment at Atelier Eri is confirmed.`,
      ``,
      `Service: ${data.serviceName}`,
      `When: ${when}`,
      ``,
      `We look forward to seeing you.`,
    ].join("\n"),
    ics,
  });

  const results = await Promise.allSettled(messages.map(sendOne));
  for (const r of results) {
    if (r.status === "rejected") {
      console.error("Booking email failed:", r.reason);
    }
  }
}
