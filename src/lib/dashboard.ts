import { getSupabase } from "@/lib/supabase";
import { MESSAGES, emailOk, isNetworkError } from "@/lib/applications";

export type ComputeRequestInput = {
  founder: string;
  email: string;
  need: string;
  tools: string;
};

export type SubmitResult =
  | { ok: true; id: string }
  | { ok: false; message: string };

/**
 * One row per compute request. Mirrors the apply form: the anon role may
 * INSERT but never SELECT, so we mint the id here rather than asking
 * PostgREST to return the row (that read is what RLS rejects).
 */
export async function submitComputeRequest(
  input: ComputeRequestInput,
): Promise<SubmitResult> {
  const founder = input.founder.trim();
  const email = input.email.trim();
  const need = input.need.trim();
  if (!founder || !emailOk(email) || !need) {
    return { ok: false, message: "" };
  }

  const supabase = getSupabase();
  if (!supabase) return { ok: false, message: MESSAGES.notConfigured };

  try {
    const id = crypto.randomUUID();
    const { error } = await supabase.from("compute_requests").insert({
      id,
      founder,
      email,
      need,
      tools: input.tools.trim() || null,
      source: "dashboard",
    });
    if (error) {
      return {
        ok: false,
        message: isNetworkError(error) ? MESSAGES.network : MESSAGES.generic,
      };
    }
    return { ok: true, id };
  } catch (error) {
    return {
      ok: false,
      message: isNetworkError(error) ? MESSAGES.network : MESSAGES.generic,
    };
  }
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
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("vc_unlocks")
    .select("id, firm, position, status, note")
    .order("position", { ascending: true });
  if (error || !data) return null;
  return data as VcUnlock[];
}
