/**
 * Copy for /login (the chooser) and /waitlist.
 *
 * Bluevine: our referral agreement requires Bluevine-approved marketing copy,
 * so the step names no bonus amount. Add one only once Bluevine confirms the
 * current offer in writing.
 */

export const chooser = {
  eyebrow: "log in",
  heading: "which are you?",
  options: [
    {
      label: "cohort 01",
      note: "founders in the fellowship's first cohort.",
      href: "/cohort-01",
    },
    {
      label: "waitlist",
      note: "applied and waiting on a spot? start here.",
      href: "/waitlist",
    },
  ],
};

export const waitlistAuth = {
  eyebrow: "waitlist · dashboard",
  signInHeading: "sign in.",
  body: "for founders on the Boston Square Ventures waitlist.",
  email: "email",
  password: "password",
  signIn: "sign in",
  sending: "one sec…",
  badLogin: "that email and password don't match.",
  cohortHint: "in cohort 01? sign in at",
};

export const waitlist = {
  eyebrow: "waitlist",
  heading: "get ready while you wait.",
  body: "want to be part of Boston Square Ventures? two steps set your company up the way our founders do: incorporate with Rho, then bank with Bluevine.",
  doneAll:
    "both steps done. you're set up like a BSV founder, and we'll be in touch about the next cohort.",
  markDone: "mark as done",
  undo: "undo",
  done: "done",
  saveError: "couldn't save that. refresh and try again.",
  steps: [
    {
      id: "rho",
      number: "step 1",
      title: "create your account with Rho",
      body: "incorporate your Delaware C corp through Rho. it's free through Boston Square Ventures. Rho files your certificate of incorporation, applies for your EIN, has an attorney review your formation documents, and covers your registered agent for the first year.",
      value: "$400",
      valueLabel: "free incorporation, a $400 value",
      valueNote: "Rho's list price for a Delaware C corp.",
      cta: "open Rho",
      href: "https://www.rho.co/product/incorporation",
    },
    {
      id: "bluevine",
      number: "step 2",
      title: "bank with Bluevine",
      body: "once you're incorporated, open your business checking account with Bluevine.",
      value: "",
      valueLabel: "sign-up bonus may apply",
      valueNote:
        "Bluevine sets the current offer and who qualifies. see their terms when you sign up.",
      cta: "open Bluevine",
      href: "https://www.bluevine.com/partner/bsv",
    },
  ] as const,
};

export type StepId = (typeof waitlist.steps)[number]["id"];
