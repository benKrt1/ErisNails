import "server-only";
import { getAdminClient } from "./supabase/admin";
import { DEMO_SERVICES, demoServiceById } from "./demo";
import type { Service } from "./types";

// Active services, ordered for display. Falls back to demo data when Supabase
// isn't configured so the booking flow is previewable locally.
export async function getActiveServices(): Promise<Service[]> {
  const supabase = getAdminClient();
  if (!supabase) return DEMO_SERVICES;

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getActiveServices failed:", error.message);
    return [];
  }
  return (data ?? []) as Service[];
}

export async function getServiceById(id: string): Promise<Service | null> {
  const supabase = getAdminClient();
  if (!supabase) return demoServiceById(id);

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("getServiceById failed:", error.message);
    return null;
  }
  return data as Service;
}
