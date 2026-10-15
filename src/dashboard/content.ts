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

export type RhoContent = {
  headline: string;
  fee: string;
  body: string;
  href: string;
  cta: string;
};

/** Shape of `cohort_content.data`. */
export type CohortContent = {
  rho: RhoContent;
  checkins: { weekly: CheckinSlot; booking: CheckinSlot };
  perks: { heading: string; body: string; partners: Partner[] };
  compute: { note: string; groups: ComputeGroup[] };
  vcSlots: number;
  /** Unused since the chat replaced it; kept in the row for reference. */
  curriculum?: { note: string[]; weeks: Week[] };
};

/** One row of `public.deals`. */
export type Deal = {
  id: number;
  name: string;
  url: string;
  domain: string | null;
  category: string;
  blurb: string | null;
  sort: number;
  /** The perk as Rho states it. */
  offer: string | null;
  /** Estimated USD value; null when the deal has no fixed value. */
  value_amount: number | null;
  /** high = the amount is stated in the offer; otherwise it's our estimate. */
  value_confidence: "high" | "medium" | "low" | null;
};

const usd = (n: number) =>
  n >= 10_000 ? `$${Math.round(n / 1000)}K` : `$${n.toLocaleString("en-US")}`;

/** "$5,000" when the offer states it, "~$1,200 est." when it's our estimate. */
export function formatValue(deal: Pick<Deal, "value_amount" | "value_confidence">) {
  if (!deal.value_amount) return null;
  return deal.value_confidence === "high" ? usd(deal.value_amount) : `~${usd(deal.value_amount)} est.`;
}

export function totalValue(deals: Deal[]) {
  const total = deals.reduce((sum, d) => sum + (d.value_amount ?? 0), 0);
  return total >= 1000 ? `$${Math.floor(total / 1000)}K+` : `$${total}`;
}

/** One row of `public.cohort_progress`; null until the founder starts. */
export type Progress = {
  email: string;
  rho_path: "incorporation" | "banking" | null;
  rho_done_at: string | null;
};

export const logoUrl = (domain: string | null) =>
  domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : "";

export const sections = [
  { id: "home", label: "dashboard" },
  { id: "chat", label: "assistant" },
  { id: "deals", label: "deals" },
  { id: "request", label: "request a deal" },
  { id: "investors", label: "investors" },
  { id: "checkins", label: "check-ins" },
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

export const requestForm = {
  heading: "request a deal.",
  body: "don't see a tool you need? tell us which ones and we'll go find you a deal.",
  fields: {
    companies: "which companies or tools?",
    companiesHint: "e.g. OpenAI, Figma, Mercury",
    note: "what are you using them for? (optional)",
  },
  submit: "send request",
  sending: "sending…",
  success: "got it. we'll go find those for you and follow up by email.",
  error: "tell us at least one company or tool.",
};

export const unlockCopy = {
  locked: "locked until step 1",
  doneIncorporation: "I incorporated through Rho",
  doneBanking: "I opened banking with Rho",
};
