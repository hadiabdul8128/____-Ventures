/**
 * Boston Square Ventures site content.
 *
 * Every line of copy, link, and founder detail lives here so the site can be
 * edited without touching components. Anything not yet verified is marked
 * [PLACEHOLDER] in a comment next to it.
 */

export type NavLink = { label: string; href: string };

export type Fact = {
  value: number;
  /** Count up from zero on reveal. Off renders the number as-is. */
  animate?: boolean;
  suffix?: string;
  prefix?: string;
  label: string;
  note: string;
};

export type Perk = { title: string; body: string };

export type Phase = {
  number: string;
  theme: string;
  focus: string;
  outcome: string;
};

export type SocialKind = "linkedin" | "instagram" | "tiktok" | "github" | "web";

export type Social = { kind: SocialKind; label: string; href: string };

export type Logo = {
  name: string;
  src: string;
  width: number;
  height: number;
  /** Rendered height in px inside a credential pill. */
  display: number;
  /** Rendered height in px inside the receipts marquee. */
  marquee?: number;
  /** Dark wordmarks are inverted to white; full-color marks are desaturated instead. */
  tone?: "invert" | "grayscale";
};

export type Credential = { label: string; logo?: Logo; href?: string };

export type Founder = {
  name: string;
  role: string;
  school: string;
  photo: string;
  bio?: string;
  socials: Social[];
  credentials: Credential[];
};

export type Faq = { q: string; a: string };

export const site = {
  name: "Boston Square Ventures",
  short: "BSV",
  wordmark: ["Boston", "Square", "Ventures"],
  tagline: "start at square one.",
  description:
    "From square one to your first raise. Capital, compute, and a founder network.",
  applyHref: "/apply",
  year: new Date().getFullYear(),
};

export const nav: NavLink[] = [
  { label: "who we are", href: "#top" },
  { label: "what we offer", href: "#offer" },
];

export const hero = {
  line: "from square one",
  italic: "to your first raise.",
  body: "We connect student founders with capital, compute, and a founder network.",
  primary: "apply to cohort 01",
  secondary: "what we offer",
};

export const logos = {
  harvard: {
    name: "Harvard University",
    src: "/logos/harvard.svg",
    width: 600,
    height: 165,
    display: 14,
    marquee: 30,
    tone: "invert",
  } satisfies Logo,
  mit: {
    name: "MIT",
    src: "/logos/mit.svg",
    width: 321,
    height: 166,
    display: 14,
    marquee: 26,
    tone: "invert",
  } satisfies Logo,
  yc: {
    name: "Y Combinator",
    src: "/logos/y-combinator.svg",
    width: 256,
    height: 256,
    display: 16,
    marquee: 30,
    tone: "grayscale",
  } satisfies Logo,
  ycFull: {
    name: "Y Combinator",
    src: "/logos/y-combinator-full.svg",
    width: 1346,
    height: 256,
    display: 16,
    marquee: 26,
  } satisfies Logo,
  mercor: {
    name: "Mercor",
    src: "/logos/mercor.svg",
    width: 22,
    height: 20,
    display: 14,
    marquee: 28,
    tone: "invert",
  } satisfies Logo,
  forbes: {
    name: "Forbes",
    src: "/logos/forbes.svg",
    width: 200,
    height: 54,
    display: 14,
    marquee: 26,
    tone: "invert",
  } satisfies Logo,
  cokeScholars: {
    name: "Coca-Cola Scholars Foundation",
    src: "/logos/coca-cola-scholars.svg",
    width: 649,
    height: 220,
    display: 18,
    marquee: 40,
    tone: "invert",
  } satisfies Logo,
  duke: {
    name: "Duke University",
    src: "/logos/duke.svg",
    width: 512,
    height: 512,
    display: 16,
    marquee: 34,
    tone: "invert",
  } satisfies Logo,
  amazon: {
    name: "Amazon",
    src: "/logos/amazon.svg",
    width: 603,
    height: 182,
    display: 14,
    marquee: 26,
    tone: "invert",
  } satisfies Logo,
  capsule: {
    name: "Capsule Space Labs",
    src: "/logos/capsule-space-labs.svg",
    width: 64,
    height: 64,
    display: 18,
    tone: "grayscale",
  } satisfies Logo,
};

export const receipts = {
  label: "built by people who've been through",
  items: [
    logos.harvard,
    logos.mit,
    logos.ycFull,
    logos.mercor,
    logos.forbes,
    logos.cokeScholars,
  ],
};

export type OfferItem = {
  value: string;
  label: string;
  note?: string;
  /** Set on date tiles so they render as <time datetime>. */
  iso?: string;
  /** Word values render smaller than numeric ones so they fit the column. */
  kind?: "word";
};

export const offer: {
  heading: string;
  cta: string;
  items: OfferItem[];
} = {
  heading: "what we offer.",
  cta: "apply to cohort 01",
  items: [
    {
      value: "October 15",
      iso: "2026-10-15",
      label: "cohort 01 starts",
      note: "applications are open now",
      kind: "word",
    },
    {
      value: "November 20",
      iso: "2026-11-20",
      label: "demo day 01",
      note: "the Friday night before Thanksgiving break, then every six weeks",
      kind: "word",
    },
    {
      value: "$100k",
      label: "compute credits",
      note: "Azure, AWS, Supabase, etc.",
    },
    { value: "01", label: "cohort", note: "small on purpose" },
    { value: "100%", label: "founder-run", note: "by students who ship" },
    {
      value: "top VCs",
      label: "connections",
      note: "warm intros for your first raise",
      kind: "word",
    },
    {
      value: "mentors",
      label: "who've done it",
      note: "founders, operators, and investors",
      kind: "word",
    },
    {
      value: "no clock",
      label: "open-ended",
      note: "we stay until you raise",
      kind: "word",
    },
    {
      value: "weekly",
      label: "check-ins",
      note: "what you shipped, what's blocking you",
      kind: "word",
    },
    {
      value: "the room",
      label: "pitch prep",
      note: "practice before the real one",
      kind: "word",
    },
    {
      value: "for life",
      label: "alumni",
      note: "in the Boston Square network",
      kind: "word",
    },
  ],
};

export const facts: Fact[] = [
  {
    value: 20,
    prefix: "$",
    suffix: "K",
    label: "compute credits",
    note: "Azure, AWS, Supabase, etc.",
    animate: false,
  },
  { value: 1, label: "cohort", note: "at a time. small on purpose" },
  {
    value: 100,
    suffix: "%",
    label: "founder-run",
    note: "by students who ship",
    animate: false,
  },
];

export const perks: { eyebrow: string; heading: string; items: Perk[] } = {
  eyebrow: "what's included?",
  heading: "what you get.",
  items: [
    {
      title: "mentorship",
      body: "founders, operators, and investors who've built real companies. on a call with you, not in a newsletter.",
    },
    {
      title: "peer network",
      body: "a small cohort of student founders from Harvard, MIT, and beyond.",
    },
    {
      title: "startup resources",
      body: "$20,000 in compute credits across Azure, AWS, Supabase, etc., plus the templates and checklists that save you weeks.",
    },
    {
      title: "opportunity accelerator",
      body: "intros to internships, investors, and rooms you don't get into by applying online.",
    },
  ],
};

export const program: {
  eyebrow: string;
  heading: string;
  body: string;
  note: string[];
  phases: Phase[];
} = {
  eyebrow: "how it works",
  heading: "square one to term sheet.",
  body: "there's no syllabus, because every company is standing on a different square. there is a sequence, though, and we move you through it as fast as you can ship.",
  note: [
    "pace: yours. we meet you where you are and push from there.",
    "exit: when you raise. that's the only graduation.",
  ],
  phases: [
    {
      number: "01",
      theme: "square one",
      focus: "the problem, the people who have it, and proof that it hurts.",
      outcome: "ten real conversations and a thesis you can defend.",
    },
    {
      number: "02",
      theme: "build",
      focus: "the smallest thing that could possibly work.",
      outcome: "a v0 in strangers' hands. ugly is fine. imaginary is not.",
    },
    {
      number: "03",
      theme: "traction",
      focus: "distribution, retention, and the numbers that actually matter.",
      outcome: "users you don't know, and a reason they stay.",
    },
    {
      number: "04",
      theme: "raise",
      focus: "the story, the deck, the ask, and who to ask.",
      outcome: "warm intros and a round you're ready to run.",
    },
  ],
};

export const founders: {
  eyebrow: string;
  heading: string;
  body: string;
  items: Founder[];
} = {
  eyebrow: "founders",
  heading: "built by founders.",
  body: "Harvard '30. Building Boston Square.",
  items: [
    {
      name: "Soneesh Kothagundla",
      role: "co-founder",
      school: "Harvard '30",
      photo: "/founders/soneesh.jpg",
      socials: [
        {
          kind: "linkedin",
          label: "LinkedIn",
          href: "https://www.linkedin.com/in/soneeshk",
        },
        {
          kind: "github",
          label: "GitHub",
          href: "https://github.com/soneeshkothagundla",
        },
        {
          kind: "instagram",
          label: "Instagram",
          href: "https://www.instagram.com/soneeshk/",
        },
        {
          kind: "tiktok",
          label: "TikTok",
          href: "https://www.tiktok.com/@soneeshkothagundla",
        }, // [PLACEHOLDER] confirm handle
      ],
      credentials: [
        {
          label: "Founder & CEO, Capsule Space Labs",
          logo: logos.capsule,
          href: "https://www.capsulelabs.space/",
        },
        { label: "Y Combinator Summer Fellow", logo: logos.yc },
        {
          label:
            "Published in the Journal of the American Medical Association at age 16 (impact factor: 55)",
        },
        {
          label: "Featured in Forbes",
          logo: logos.forbes,
          href: "https://www.forbes.com/sites/toddnordstrom/2026/03/04/seatbelt-sign-is-off-how-soneesh-kothagundla-turned-airplanes-into-a-life-saving-movement/",
        },
        {
          label: "2026 Emerging Innovator of the Year, Horn Entrepreneurship",
        },
      ],
    },
    {
      name: "Hadi Abdul",
      role: "co-founder",
      school: "Harvard '30",
      photo: "/founders/hadi.jpg",
      socials: [
        {
          kind: "linkedin",
          label: "LinkedIn",
          href: "https://www.linkedin.com/in/hadi-abdul-95618a31a/",
        },
        {
          kind: "github",
          label: "GitHub",
          href: "https://github.com/hadiabdul8128",
        },
        {
          kind: "instagram",
          label: "Instagram",
          href: "https://www.instagram.com/hadi.__.abdul/",
        },
        { kind: "web", label: "VoiceWorks", href: "https://voiceworks.coach/" },
      ],
      credentials: [
        {
          label: "Previously at Mercor",
          logo: logos.mercor,
          href: "https://mercor.com/",
        },
        {
          label: "2026 Coca-Cola Scholar",
          logo: logos.cokeScholars,
          href: "https://www.coca-colascholarsfoundation.org/about/2026-scholar-bios/",
        },
        { label: "Researcher, Duke BIG IDEAs Lab", logo: logos.duke },
        { label: "USAPhO Silver Medalist · USAMO Qualifier" },
        { label: "Founder of VoiceWorks", href: "https://voiceworks.coach/" },
      ],
    },
  ],
};

export const faq: { eyebrow: string; heading: string; items: Faq[] } = {
  eyebrow: "faq",
  heading: "the questions you'd dm us anyway.",
  items: [
    {
      q: "who can apply?",
      a: "students and recent grads, anywhere in the world. the network started in Boston, at Harvard and MIT. but that's where it started, not a requirement.",
    },
    {
      q: "do i need a team or an idea?",
      a: "no. an idea helps. a team is nice. what we actually look for is someone who'd be building this with or without us.",
    },
    {
      q: "how long is it?",
      a: "until you raise. there's no fixed end date. some founders will close in a few months, others will take longer. you're in until the round is done, and alumni after.",
    },
    {
      q: "do i have to be in boston?",
      a: "no. the network is rooted in boston: harvard, mit, the i-lab crowd. but the work happens wherever you are, and sessions are remote-friendly.",
    },
    {
      q: "do you invest?",
      a: "not yet. we get you in front of aligned investors and mentors; we're not a fund. we'll say so loudly if that changes.",
    },
    {
      q: "when does cohort 01 start?",
      a: "dates go to applicants first. apply, and you'll be the first to know.",
    },
  ],
};

export const apply = {
  eyebrow: "apply",
  heading: "join cohort 01.",
  body: "Tell us what you’re building.",
  deadline: {
    label: "applications close",
    value: "October 13 at 11:59 pm ET",
    iso: "2026-10-13T23:59-04:00",
  },
  fields: {
    name: "name",
    email: "email",
    school: "school & year",
    stage: "where are you?",
    building: "what are you building, or what can't you stop thinking about?",
    achievement: "what's your greatest achievement?",
    linkedin: "linkedin profile",
    resume: "upload resume",
  },
  resumeHint: "pdf or word, up to 5 mb. optional but it helps.",
  stages: [
    "just an idea",
    "building a v0",
    "launched, no users yet",
    "users, no revenue",
    "revenue",
  ],
  submit: "send application",
  cardNote: "Your cohort 01 founder card.",
  sending: "sending…",
  note: "we read every application ourselves. you'll hear back by email.",
  success: "got it. we read every one.",
  error: "please fill in your name, a valid email, and what you're building.",
};

export const closing = {
  lines: ["start at square one.", "build from here."],
  cta: "apply to cohort 01",
};

export const footer = {
  disclaimer:
    "an independent network. not affiliated with or endorsed by Harvard University or MIT.",
  copyright: `\u00A9 ${site.year} Boston Square Ventures`,
  backToTop: "back to top",
};
