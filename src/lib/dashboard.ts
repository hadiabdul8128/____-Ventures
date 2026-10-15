import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { MESSAGES, isNetworkError, sanitizeFileName } from "@/lib/applications";
import { cohort, type CohortContent, type Deal, type Progress } from "@/dashboard/content";

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

export async function fetchDeals(): Promise<Deal[] | null> {
  const supabase = getCohortClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("deals")
    .select("id, name, url, domain, category, blurb, sort, offer, value_amount, value_confidence")
    .order("sort", { ascending: true });
  if (error || !data) return null;
  return data as Deal[];
}

export async function fetchProgress(email: string): Promise<Progress | null> {
  const supabase = getCohortClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("cohort_progress")
    .select(PROGRESS_COLUMNS)
    .eq("email", email.toLowerCase())
    .maybeSingle();
  return (data as Progress | null) ?? null;
}

const PROOF_BUCKET = "rho-proofs";
const PROOF_MAX_BYTES = 10 * 1024 * 1024;
const PROOF_TYPES = /\.(pdf|png|jpe?g|webp|heic)$/i;
const PROGRESS_COLUMNS =
  "email, rho_path, rho_done_at, rho_status, proof_path, submitted_at, reviewed_at, reviewed_by, review_note";

export function validateProof(file: File | null): "fileMissing" | "fileType" | "fileSize" | null {
  if (!file || !file.size) return "fileMissing";
  if (!PROOF_TYPES.test(file.name)) return "fileType";
  if (file.size > PROOF_MAX_BYTES) return "fileSize";
  return null;
}

/**
 * Step 1: upload proof of incorporating or banking through Rho. The row goes
 * to 'pending'; only an admin approval (RLS-enforced) unlocks the deals.
 */
export async function submitRhoProof(
  email: string,
  path: "incorporation" | "banking",
  file: File,
): Promise<Result<Progress>> {
  const supabase = getCohortClient();
  if (!supabase) return { ok: false, message: MESSAGES.notConfigured };
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return { ok: false, message: "your session expired. sign in again." };
  try {
    const objectPath = `${uid}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
    const up = await supabase.storage.from(PROOF_BUCKET).upload(objectPath, file, {
      contentType: file.type || undefined,
      upsert: false,
    });
    if (up.error) return fail(up.error);
    const row = {
      email: email.toLowerCase(),
      rho_path: path,
      rho_status: "pending" as const,
      proof_path: objectPath,
      submitted_at: new Date().toISOString(),
      reviewed_at: null,
      reviewed_by: null,
      review_note: null,
    };
    const { data, error } = await supabase
      .from("cohort_progress")
      .upsert(row, { onConflict: "email" })
      .select(PROGRESS_COLUMNS)
      .single();
    if (error || !data) return fail(error);
    return { ok: true, data: data as Progress };
  } catch (error) {
    return fail(error);
  }
}

/** Admins: a short-lived link to view an uploaded proof. */
export async function proofLink(objectPath: string): Promise<string | null> {
  const supabase = getCohortClient();
  if (!supabase) return null;
  const { data } = await supabase.storage.from(PROOF_BUCKET).createSignedUrl(objectPath, 600);
  return data?.signedUrl ?? null;
}

/** Admins: approve or reject a founder's proof. */
export async function reviewProof(
  email: string,
  decision: "approved" | "rejected",
  reviewer: string,
  note: string,
): Promise<Result> {
  const supabase = getCohortClient();
  if (!supabase) return { ok: false, message: MESSAGES.notConfigured };
  const { error } = await supabase
    .from("cohort_progress")
    .update({
      rho_status: decision,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewer.toLowerCase(),
      review_note: note.trim() || null,
    })
    .eq("email", email.toLowerCase());
  return error ? fail(error) : { ok: true, data: true };
}

export async function submitDealRequest(input: {
  email: string;
  companies: string;
  note: string;
  source: "form" | "chat";
}): Promise<Result> {
  const supabase = getCohortClient();
  if (!supabase) return { ok: false, message: MESSAGES.notConfigured };
  try {
    const { error } = await supabase.from("deal_requests").insert({
      email: input.email.toLowerCase(),
      companies: input.companies.trim().slice(0, 500),
      note: input.note.trim().slice(0, 2000) || null,
      source: input.source,
    });
    return error ? fail(error) : { ok: true, data: true };
  } catch (error) {
    return fail(error);
  }
}

export type DealRequest = {
  id: string;
  created_at: string;
  companies: string;
  status: string;
};

/** The founder's own requests, newest first (RLS limits it to their rows). */
export async function fetchMyRequests(email: string): Promise<DealRequest[] | null> {
  const supabase = getCohortClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("deal_requests")
    .select("id, created_at, companies, status")
    .eq("email", email.toLowerCase())
    .order("created_at", { ascending: false })
    .limit(10);
  if (error || !data) return null;
  return data as DealRequest[];
}

export type AssistantTurn = { role: "user" | "assistant"; content: string };

export type AssistantReply = {
  reply: string;
  dealIds: number[];
  show: "rho" | "request" | "logos" | "special" | null;
  request: { companies: string; note: string } | null;
};

/**
 * Claude-backed answers from /api/cohort-chat. Returns null when the
 * assistant isn't configured (no API key) or fails, so the chat can fall back
 * to its built-in answers.
 */
export async function askAssistant(turns: AssistantTurn[]): Promise<AssistantReply | null> {
  const supabase = getCohortClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return null;
  try {
    const res = await fetch("/api/cohort-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ messages: turns.slice(-12) }),
    });
    if (!res.ok) return null;
    return (await res.json()) as AssistantReply;
  } catch {
    return null;
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

/** Admins only (RLS): everyone's Rho step, keyed by email. */
export async function fetchAllProgress(): Promise<Map<string, Progress>> {
  const supabase = getCohortClient();
  const out = new Map<string, Progress>();
  if (!supabase) return out;
  const { data } = await supabase.from("cohort_progress").select(PROGRESS_COLUMNS);
  for (const row of (data ?? []) as Progress[]) out.set(row.email, row);
  return out;
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
