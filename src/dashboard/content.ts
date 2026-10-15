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

/** "$5,000" when the offer states it, "~$1,200" when it's our estimate. */
export function formatValue(deal: Pick<Deal, "value_amount" | "value_confidence">) {
  if (!deal.value_amount) return null;
  return deal.value_confidence === "high" ? usd(deal.value_amount) : `~${usd(deal.value_amount)}`;
}

export function totalValue(deals: Deal[]) {
  const total = deals.reduce((sum, d) => sum + (d.value_amount ?? 0), 0);
  return total >= 1000 ? `$${Math.floor(total / 1000)}K+` : `$${total}`;
}

/** One row of `public.cohort_progress`; null until the founder starts. */
export type Progress = {
  email: string;
  rho_path: "incorporation" | "banking" | null;
  /** Set by the database only when an admin approves the proof. */
  rho_done_at: string | null;
  rho_status: "none" | "pending" | "approved" | "rejected";
  proof_path: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_note: string | null;
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

/** Extra credits on top of the listed deals, granted case by case. */
export const specialCredits = {
  heading: "extra credits on special request",
  body: "need more than the listed deals? cohort 01 founders can request extra credits on top. email either of us with what you're building and what you need.",
  items: [
    { name: "Azure", domain: "azure.microsoft.com", amount: "$50K" },
    { name: "Supabase", domain: "supabase.com", amount: "$20K" },
    { name: "AWS", domain: "aws.amazon.com", amount: "$20K" },
    { name: "OpenAI", domain: "openai.com", amount: "$5K" },
  ],
  contacts: [
    { name: "Soneesh Kothagundla", email: "soneeshkothagundla@gmail.com" },
    { name: "Hadi Abdul", email: "hadiabdul@college.harvard.edu" },
  ],
};

export const unlockCopy = {
  locked: "locked until step 1",
  proofHeading: "send us your proof",
  proofBody:
    "once you've incorporated or opened your account with Rho, upload proof: your certificate of incorporation or formation, or a Rho account confirmation or statement. we review it and unlock every deal, usually within a day.",
  pathLabel: "what did you do through Rho?",
  incorporation: "incorporated",
  banking: "opened banking",
  fileLabel: "proof (pdf or image, up to 10 mb)",
  submit: "submit for review",
  sending: "uploading…",
  replace: "replace proof",
  pending: "proof received. we're reviewing it and will unlock your deals soon, usually within a day.",
  rejected: "we couldn't verify that proof. upload a clearer document and we'll take another look.",
  fileType: "upload a pdf, png, jpg, webp, or heic file.",
  fileSize: "that file is over 10 mb.",
  fileMissing: "choose a file to upload.",
};
