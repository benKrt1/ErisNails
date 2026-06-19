"use server";

import { getAdminClient } from "@/lib/supabase/admin";
import { getServiceById } from "@/lib/services";
import { getAvailableSlots } from "@/lib/availability-data";
import { sendBookingEmails } from "@/lib/email";
import { serviceName } from "@/lib/types";

export type BookingInput = {
  serviceId: string;
  date: string; // YYYY-MM-DD (salon local)
  startsAt: string; // ISO UTC, must match an available slot
  name: string;
  phone: string;
  email: string;
  notes?: string;
  locale: string;
};

export type BookingResult =
  | {
      ok: true;
      confirmation: {
        bookingId: string;
        serviceName: string;
        startsAt: string;
        endsAt: string;
        name: string;
      };
    }
  | { ok: false; error: "invalid" | "unavailable" | "taken" | "server" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createBooking(
  input: BookingInput,
): Promise<BookingResult> {
  const name = input.name?.trim();
  const phone = input.phone?.trim();
  const email = input.email?.trim();

  if (!name || !phone || !email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "invalid" };
  }
  if (!input.serviceId || !/^\d{4}-\d{2}-\d{2}$/.test(input.date ?? "")) {
    return { ok: false, error: "invalid" };
  }

  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "server" };

  const service = await getServiceById(input.serviceId);
  if (!service) return { ok: false, error: "invalid" };

  // Re-validate the slot is still free (the DB constraint is the final guard).
  const slots = await getAvailableSlots(input.date, input.serviceId);
  const slot = slots.find((s) => s.startsAt === input.startsAt);
  if (!slot) return { ok: false, error: "unavailable" };

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      service_id: service.id,
      customer_name: name,
      customer_phone: phone,
      customer_email: email,
      starts_at: slot.startsAt,
      ends_at: slot.endsAt,
      notes: input.notes?.trim() || null,
      status: "confirmed",
    })
    .select("id")
    .single();

  if (error) {
    // 23P01 = exclusion_violation -> the slot was taken concurrently.
    if (error.code === "23P01") return { ok: false, error: "taken" };
    console.error("createBooking insert failed:", error.message);
    return { ok: false, error: "server" };
  }

  const localizedName = serviceName(service, input.locale);

  // Emails are best-effort; never fail the booking because of them.
  await sendBookingEmails({
    bookingId: data.id,
    customerName: name,
    customerEmail: email,
    customerPhone: phone,
    serviceName: localizedName,
    startsAt: slot.startsAt,
    endsAt: slot.endsAt,
    notes: input.notes,
  });

  return {
    ok: true,
    confirmation: {
      bookingId: data.id,
      serviceName: localizedName,
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      name,
    },
  };
}
