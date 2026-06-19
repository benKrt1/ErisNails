import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service-role key. Bypasses RLS, so it
 * MUST never be imported into client components. Used for all data operations
 * (services, availability, bookings) that run on the server.
 *
 * Returns null when env vars are absent so the app can still render (e.g.
 * during initial scaffolding / preview before Supabase is configured).
 */
let cached: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient | null {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
