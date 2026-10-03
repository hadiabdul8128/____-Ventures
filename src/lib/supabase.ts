import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? "";

let client: SupabaseClient | null = null;

/** True when both public Supabase env vars are present at build time. */
export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}

/**
 * Lazily creates the browser client. Returns null when the env vars are
 * missing so callers can degrade gracefully instead of crashing at import.
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!client) {
    client = createClient(url, anonKey, {
      // The apply form is anonymous; no session is ever created.
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
