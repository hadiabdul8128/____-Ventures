/**
 * Founder dashboard content.
 *
 * Separate from the marketing `src/content.ts` so the public site and the
 * cohort-only surface can be edited without stepping on each other.
 *
 * [PLACEHOLDER] markers are things Soneesh and Hadi still need to supply.
 */

export const cohort = {
  name: "cohort 01",
  /** Kickoff and demo day, mirroring the public site. */
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

export const curriculum: { note: string[]; weeks: Week[] } = {
  note: [
    "lectures: once a week, 30 minutes, recorded.",
    "homework: once a week. part-timers and full-timers welcome.",
  ],
  // [PLACEHOLDER] draft, carried over from the original four-week program and
  // stretched to five working weeks plus demo day. Replace with the real plan.
  weeks: [
    {
      number: "01",
      startIso: "2026-10-15",
      theme: "problem",
      lecture: "who hurts, how much, and how you'd prove it.",
      homework: "ten real conversations with people who have the problem.",
    },
    {
      number: "02",
      startIso: "2026-10-22",
      theme: "product",
      lecture: "the smallest thing that could possibly work.",
      homework: "ship a v0. ugly is fine. imaginary is not.",
    },
    {
      number: "03",
      startIso: "2026-10-29",
      theme: "distribution",
      lecture: "getting strangers to use it without begging friends.",
      homework: "first ten users you don't know.",
    },
    {
      number: "04",
      startIso: "2026-11-05",
      theme: "traction",
      lecture: "retention, and the numbers that actually matter.",
      homework: "a number that moved, and why you think it moved.",
    },
    {
      number: "05",
      startIso: "2026-11-12",
      theme: "story",
      lecture: "the pitch, the numbers, and the ask.",
      homework: "four minutes, rehearsed out loud, in front of someone.",
    },
    {
      number: "06",
      startIso: "2026-11-19",
      theme: "demo day",
      lecture: "run of show, order, and who is in the room.",
      homework: "demo day. four minutes. the network is watching.",
    },
  ],
};

export const checkins = {
  weekly: {
    label: "weekly check-in",
    when: "Wednesdays, 7:00pm ET",
    note: "the whole cohort, 45 minutes.",
    // [PLACEHOLDER] paste the recurring Google Meet / Zoom link here.
    href: "",
  },
  booking: {
    label: "book extra time",
    note: "any time during the week, with both of us.",
    // [PLACEHOLDER] a Cal.com or Calendly link with Soneesh + Hadi on the
    // same event. Until this is set the dashboard shows it as pending.
    href: "",
  },
};

/**
 * Unlocks are manual: Soneesh and Hadi decide when a founder is ready for a
 * given firm, flip the row in Supabase, and the founder sees it here. There is
 * no deadline and no automatic criteria.
 */
export const vcBoard = {
  /** [PLACEHOLDER] the 15 firm names are not decided yet. */
  slots: 15,
  lockedLabel: "locked",
  lockedNote: "unlocked when we think you're ready",
};

export type ComputeGroup = { title: string; items: string[] };

/**
 * Names only, no amounts. Most of these are partner or student programmes with
 * their own eligibility and their own application, so the heading says
 * "through our network" rather than implying Boston Square grants them.
 */
export const compute: { note: string; groups: ComputeGroup[] } = {
  note: "available through our network. several have their own application and eligibility. ask us and we'll point you at the right one.",
  groups: [
    {
      title: "cloud & infrastructure",
      items: ["AWS", "Google Cloud", "Supabase", "Blaxel"],
    },
    {
      title: "ai & developer tools",
      items: [
        "Devin",
        "Browser Use",
        "Sarvam AI",
        "Firecrawl",
        "Langfuse",
        "Greptile",
        "Respan",
        "Roboflow",
        "Gumloop",
        "AgentMail",
        "Corsair",
      ],
    },
    {
      title: "voice & video",
      items: ["Deepgram", "Bolna AI", "Tavus", "sync."],
    },
    {
      title: "other",
      items: ["Razorpay", "Coinbase / Base", "écentic"],
    },
  ],
};

export const computeForm = {
  heading: "what compute do you need?",
  body: "tell us what you're trying to run and we'll go get it.",
  fields: {
    founder: "your name",
    email: "email",
    need: "what do you need, and what are you building with it?",
    tools: "anything from the list above? (optional)",
  },
  submit: "send request",
  sending: "sending…",
  success: "got it. we'll come back to you.",
  error: "please tell us your name, a valid email, and what you need.",
};
