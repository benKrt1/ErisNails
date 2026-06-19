import "server-only";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "./supabase/server";

/** Current authenticated admin user, or null. Safe when Supabase is unset. */
export async function getCurrentUser(): Promise<User | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    return data.user;
  } catch {
    return null;
  }
}
