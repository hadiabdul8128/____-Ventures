import { getSupabase } from "@/lib/supabase";
import { site } from "@/content";

export type ApplicationInput = {
  name: string;
  email: string;
  school: string;
  stage: string;
  building: string;
  achievement: string;
  linkedin: string;
  resume?: File | null;
};

export type SubmitResult =
  | { ok: true; id: string }
  | { ok: false; message: string };

export const RESUME_MAX_BYTES = 5 * 1024 * 1024;
export const RESUME_ACCEPT = ".pdf,.doc,.docx";

const RESUME_EXTENSIONS = /\.(pdf|doc|docx)$/i;
const RESUME_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export const WORD_LIMIT = 100;

/** Words, the way a person counts them: runs of non-whitespace. */
export const countWords = (value: string) =>
  value.trim().split(/\s+/).filter(Boolean).length;

export const MESSAGES = {
  notConfigured: `applications aren't wired up yet. email us instead at ${site.contactEmail}.`,
  network: "couldn't reach the server, try again.",
  resumeType: "resume must be a pdf or word document.",
  resumeSize: "resume must be 5 mb or smaller.",
  resumeUpload: "couldn't upload your resume. try again or leave it off.",
  generic: "something went wrong on our end. try again in a minute.",
  tooLong: `keep each answer to ${WORD_LIMIT} words or fewer.`,
} as const;

export const emailOk = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} b`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kb`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} mb`;
}

/** Returns a human message when the file is unacceptable, otherwise null. */
export function validateResume(file: File): string | null {
  const typeOk =
    RESUME_EXTENSIONS.test(file.name) ||
    (file.type !== "" && RESUME_MIME_TYPES.has(file.type));
  if (!typeOk) return MESSAGES.resumeType;
  if (file.size > RESUME_MAX_BYTES) return MESSAGES.resumeSize;
  return null;
}

/** Keeps the extension, strips path separators and anything exotic. */
export function sanitizeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "resume";
  const cleaned = base
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 120);
  return cleaned || "resume";
}

function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) return true; // fetch() failure
  const message =
    typeof error === "object" && error && "message" in error
      ? String((error as { message: unknown }).message)
      : "";
  return /fetch|network|timeout|ECONN/i.test(message);
}

/**
 * Validates, uploads the optional resume, and inserts the application row.
 * Never throws — every failure path resolves to `{ ok: false, message }`.
 */
export async function submitApplication(
  input: ApplicationInput,
): Promise<SubmitResult> {
  const name = input.name.trim();
  const email = input.email.trim();
  const building = input.building.trim();
  if (!name || !emailOk(email) || !building) {
    return { ok: false, message: "" };
  }
  if (
    countWords(building) > WORD_LIMIT ||
    countWords(input.achievement) > WORD_LIMIT
  ) {
    return { ok: false, message: MESSAGES.tooLong };
  }
  const resume = input.resume ?? null;
  if (resume) {
    const problem = validateResume(resume);
    if (problem) return { ok: false, message: problem };
  }

  const supabase = getSupabase();
  if (!supabase) return { ok: false, message: MESSAGES.notConfigured };

  try {
    let resumePath: string | null = null;
    if (resume) {
      const path = `${crypto.randomUUID()}/${sanitizeFileName(resume.name)}`;
      const { error } = await supabase.storage
        .from("resumes")
        .upload(path, resume, {
          upsert: false,
          contentType: resume.type || undefined,
        });
      if (error) {
        return {
          ok: false,
          message: isNetworkError(error)
            ? MESSAGES.network
            : MESSAGES.resumeUpload,
        };
      }
      resumePath = path;
    }

    // The anon role may INSERT but never SELECT, so we cannot ask PostgREST to
    // return the new row — that read is what RLS would reject. Mint the id here
    // instead and send it with the insert.
    const id = crypto.randomUUID();
    const { error } = await supabase
      .from("applications")
      .insert({
        id,
        name,
        email,
        school: input.school.trim() || null,
        stage: input.stage.trim() || null,
        building,
        achievement: input.achievement.trim() || null,
        linkedin: input.linkedin.trim() || null,
        resume_path: resumePath,
        user_agent:
          typeof navigator === "undefined"
            ? null
            : navigator.userAgent.slice(0, 512),
        source: "web",
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
