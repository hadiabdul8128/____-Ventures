import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { MESSAGES, isNetworkError } from "@/lib/applications";
import { cohort, type CohortContent } from "@/dashboard/content";

const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? "";

let client: SupabaseClient | null = null;

/**
 * The dashboard's own client. Unlike the anonymous apply-form client it keeps a
 * session, and it reads the `#access_token` that set-password links land with.
 * A separate storage key keeps it from colliding with any other Supabase app
 * on this origin.
 */
export function getCohortClient(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  if (!client) {
    client = createClient(url, anonKey, {
      auth: {
        storageKey: "bsv-cohort-auth",
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "implicit",
      },
    });
  }
  return client;
}

export type Member = {
  email: string;
  name: string | null;
  company: string | null;
  role: "founder" | "admin";
  created_at: string;
};

export type Result<T = true> = { ok: true; data: T } | { ok: false; message: string };

function fail(error: unknown): { ok: false; message: string } {
  return {
    ok: false,
    message: isNetworkError(error) ? MESSAGES.network : MESSAGES.generic,
  };
}

/** The signed-in user's own row, or null when they are not on the list. */
export async function fetchMe(email: string): Promise<Member | null> {
  const supabase = getCohortClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("cohort_members")
    .select("email, name, company, role, created_at")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  return (data as Member | null) ?? null;
}

export async function fetchContent(): Promise<CohortContent | null> {
  const supabase = getCohortClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("cohort_content")
    .select("data")
    .eq("cohort", cohort.id)
    .maybeSingle();
  if (error || !data) return null;
  return data.data as CohortContent;
}

export type VcUnlock = {
  id: string;
  /** Null until Soneesh and Hadi decide which firm fills the slot. */
  firm: string | null;
  position: number;
  status: "locked" | "unlocked" | "intro_requested" | "intro_made";
  note: string | null;
};

/**
 * Read-only here. Unlocking is manual: flip `status` in the Supabase table and
 * the founder sees it on their next load.
 */
export async function fetchVcUnlocks(): Promise<VcUnlock[] | null> {
  const supabase = getCohortClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("vc_unlocks")
    .select("id, firm, position, status, note")
    .order("position", { ascending: true });
  if (error || !data) return null;
  return data as VcUnlock[];
}

export async function submitComputeRequest(input: {
  founder: string;
  email: string;
  need: string;
  tools: string;
}): Promise<Result<string>> {
  const supabase = getCohortClient();
  if (!supabase) return { ok: false, message: MESSAGES.notConfigured };
  try {
    // Mint the id here: members may INSERT but not SELECT their request back.
    const id = crypto.randomUUID();
    const { error } = await supabase.from("compute_requests").insert({
      id,
      founder: input.founder,
      email: input.email,
      need: input.need.trim(),
      tools: input.tools.trim() || null,
      source: "dashboard",
    });
    if (error) return fail(error);
    return { ok: true, data: id };
  } catch (error) {
    return fail(error);
  }
}

// ------------------------------------------------------------------ admin --

export async function fetchMembers(): Promise<Member[] | null> {
  const supabase = getCohortClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("cohort_members")
    .select("email, name, company, role, created_at")
    .order("created_at", { ascending: true });
  if (error || !data) return null;
  return data as Member[];
}

export async function removeMember(email: string): Promise<Result> {
  const supabase = getCohortClient();
  if (!supabase) return { ok: false, message: MESSAGES.notConfigured };
  const { error } = await supabase.from("cohort_members").delete().eq("email", email);
  return error ? fail(error) : { ok: true, data: true };
}

/**
 * Adds (or re-adds) a member and returns a one-time link that lets them set
 * their password. The link is shown to the admin to send; nothing is emailed.
 */
export async function inviteMember(input: {
  email: string;
  name: string;
  company: string;
  role: "founder" | "admin";
}): Promise<Result<string>> {
  const supabase = getCohortClient();
  if (!supabase) return { ok: false, message: MESSAGES.notConfigured };
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return { ok: false, message: "your session expired. sign in again." };
  try {
    const res = await fetch("/api/cohort-invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });
    const body = (await res.json().catch(() => ({}))) as {
      link?: string;
      error?: string;
    };
    if (!res.ok || !body.link) {
      return { ok: false, message: body.error || MESSAGES.generic };
    }
    return { ok: true, data: body.link };
  } catch (error) {
    return fail(error);
  }
}
