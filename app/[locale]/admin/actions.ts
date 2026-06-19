"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth";

/** Guard for every mutating admin action. */
async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  const supabase = getAdminClient();
  if (!supabase) throw new Error("Supabase not configured");
  return supabase;
}

export async function signIn(input: {
  email: string;
  password: string;
  locale: string;
}): Promise<{ error: string } | void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
  if (error) return { error: "invalid" };
  redirect(`/${input.locale}/admin`);
}

export async function signOut(locale: string) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(`/${locale}/admin/login`);
}

export async function cancelBooking(id: string, locale: string) {
  const supabase = await requireUser();
  await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
  revalidatePath(`/${locale}/admin`);
}

export type WorkingHourInput = {
  weekday: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

export async function saveWorkingHours(
  rows: WorkingHourInput[],
  locale: string,
) {
  const supabase = await requireUser();
  // Replace the whole schedule: clear then insert active rows.
  await supabase.from("working_hours").delete().neq("weekday", -1);
  const toInsert = rows.filter((r) => r.is_active);
  if (toInsert.length > 0) {
    await supabase.from("working_hours").insert(toInsert);
  }
  revalidatePath(`/${locale}/admin/schedule`);
}

export async function addTimeOff(
  input: {
    date: string;
    start_time: string | null;
    end_time: string | null;
    reason: string | null;
  },
  locale: string,
) {
  const supabase = await requireUser();
  await supabase.from("time_off").insert(input);
  revalidatePath(`/${locale}/admin/time-off`);
}

export async function deleteTimeOff(id: string, locale: string) {
  const supabase = await requireUser();
  await supabase.from("time_off").delete().eq("id", id);
  revalidatePath(`/${locale}/admin/time-off`);
}

export type ServiceInput = {
  id?: string;
  name_en: string;
  name_sv: string;
  description_en: string | null;
  description_sv: string | null;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  sort_order: number;
};

export async function saveService(input: ServiceInput, locale: string) {
  const supabase = await requireUser();
  if (input.id) {
    await supabase.from("services").update(input).eq("id", input.id);
  } else {
    await supabase.from("services").insert(input);
  }
  revalidatePath(`/${locale}/admin/services`);
}

export async function deleteService(id: string, locale: string) {
  const supabase = await requireUser();
  await supabase.from("services").delete().eq("id", id);
  revalidatePath(`/${locale}/admin/services`);
}
