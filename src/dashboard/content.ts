/**
 * Founder dashboard copy and types.
 *
 * The cohort's actual content (curriculum, check-in links, perks, compute
 * list) lives in Supabase `cohort_content` and is only readable by signed-in
 * cohort members, so it never ships in the public JS bundle. Only UI strings
 * and the public cohort dates live here.
 */

export const cohort = {
  id: "cohort-01",
  name: "cohort 01",
  startIso: "2026-10-15",
  demoDayIso: "2026-11-20T18:00:00-05:00",
  demoDayLabel: "Friday, November 20, 2026",
  demoDayTime: "evening",
  /** Demo days recur on this rhythm after the first one. */
  cadenceWeeks: 6,
};

export type Week = {
  number: string;
  /** Monday of that week, used to highlight where the cohort is now. */
  startIso: string;
  theme: string;
  lecture: string;
  homework: string;
};

export type CheckinSlot = { label: string; note: string; href: string; when?: string };

export type Partner = {
  name: string;
  value: string;
  label: string;
  body: string;
  href: string;
  cta: string;
};

export type ComputeGroup = { title: string; items: string[] };

/** Shape of `cohort_content.data`. */
export type CohortContent = {
  curriculum: { note: string[]; weeks: Week[] };
  checkins: { weekly: CheckinSlot; booking: CheckinSlot };
  perks: { heading: string; body: string; partners: Partner[] };
  compute: { note: string; groups: ComputeGroup[] };
  vcSlots: number;
};

export const sections = [
  { id: "overview", label: "overview" },
  { id: "curriculum", label: "curriculum" },
  { id: "investors", label: "investors" },
  { id: "checkins", label: "check-ins" },
  { id: "perks", label: "compute, credits & perks" },
] as const;

export type SectionId = (typeof sections)[number]["id"] | "team";

export const login = {
  eyebrow: "cohort 01 · founder dashboard",
  heading: "sign in.",
  body: "for founders in Boston Square Ventures cohort 01.",
  email: "email",
  password: "password",
  submit: "sign in",
  sending: "signing in…",
  error: "that email and password don't match.",
  forgot:
    "forgot your password or never set one? message Soneesh or Hadi and we'll send you a new link.",
  notMember:
    "you're signed in, but this email isn't on the cohort 01 list. if that's a mistake, message Soneesh or Hadi.",
  setHeading: "set your password.",
  setBody: "pick a password for your dashboard. at least 8 characters.",
  setSubmit: "save password",
  setShort: "use at least 8 characters.",
  setMismatch: "the two passwords don't match.",
};

export const computeForm = {
  heading: "what compute do you need?",
  body: "tell us what you're trying to run and we'll go get it.",
  fields: {
    need: "what do you need, and what are you building with it?",
    tools: "anything from the list below? (optional)",
  },
  submit: "send request",
  sending: "sending…",
  success: "got it. we'll come back to you.",
  error: "tell us what you need.",
};
