/**
 * Copy for /creator-venture-partner-program. Mirrors the program's term sheet;
 * keep the numbers here in sync with it.
 */

export type ProgramSection = {
  id: string;
  label: string;
  items: string[];
};

export const creatorProgram = {
  eyebrow: "creator venture partner program",
  heading: "creators, meet venture.",
  body: "Boston Square Ventures is bringing student creators into venture as Creator Venture Partners, with all the responsibilities of a BSV venture partner.",
  stats: [
    { value: "$5,000", label: "max budget per approved event" },
    { value: "$100", label: "per 50 cohort sign-ups" },
    { value: "$100", label: "per accepted company you refer" },
    { value: "$10K–$50K", label: "checks you can propose to the board" },
  ],
  sections: [
    {
      id: "role",
      label: "what you'll do",
      items: [
        "interview candidates for BSV cohorts.",
        "host events with Rho, BSV's banking partner.",
        "source and refer startups to BSV, with a goal of 10 companies every month.",
      ],
    },
    {
      id: "events",
      label: "events",
      items: [
        "BSV covers every event it approves, with budgets of up to $5,000 per event depending on size, location, venue, and similar factors.",
        "you earn a $50 stipend for each event with at least 15 attendees. that includes small dinners, pitch competitions, and networking events.",
        "you pick the schedule, whether that's weekly, biweekly, or whenever you want, up to 4 events per month.",
        "every event has to run on Luma, and you share the guest list with BSV.",
      ],
    },
    {
      id: "pay",
      label: "compensation",
      items: [
        "you earn $100 for every 50 sign-ups to any BSV cohort through your personal tracking link, and 100 sign-ups earns $250.",
        "you get a $100 bonus for each company you refer that's accepted into BSV and has at least $10,000 in its bank account.",
      ],
    },
    {
      id: "investing",
      label: "investing",
      items: [
        "you can bring any company straight to the BSV board and propose a $10K to $50K check into it.",
      ],
    },
    {
      id: "quality",
      label: "quality standard",
      items: [
        "referrals and sign-ups have to be within reason. companies must be real, with genuine founders.",
        "fake, joke, or duplicate submissions don't count toward your monthly target or your pay.",
      ],
    },
    {
      id: "tracking",
      label: "tracking",
      items: [
        "once you sign the term sheet, BSV gives you a unique magic link that tracks every sign-up made through it.",
      ],
    },
    {
      id: "term",
      label: "term",
      items: [
        "the program covers all BSV cohorts and runs through December 31, 2026.",
      ],
    },
  ] satisfies ProgramSection[],
  fineprint:
    "the term sheet is a non-binding summary of the proposed terms. final terms depend on the definitive documents.",
};
