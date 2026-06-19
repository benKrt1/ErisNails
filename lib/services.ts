import "server-only";
import { getAdminClient } from "./supabase/admin";
import type { Service } from "./types";

// Active services, ordered for display. Returns [] when Supabase isn't
// configured yet so pages can still render their empty state.
export async function getActiveServices(): Promise<Service[]> {
  const supabase = getAdminClient();
  if (!supabase) return [];

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
  if (!supabase) return null;

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
