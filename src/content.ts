/**
 * Boston Square Ventures site content.
 *
 * Every line of copy, link, and founder detail lives here so the site can be
 * edited without touching components. Anything not yet verified is marked
 * [PLACEHOLDER] in a comment next to it.
 */

export type NavLink = { label: string; href: string };

export type Point = { lead: string; rest?: string };

export type Fact = {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  note: string;
};

export type Perk = { title: string; body: string };

export type Week = {
  number: string;
  theme: string;
  lecture: string;
  homework: string;
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
  schoolLogo?: Logo;
  photo: string;
  bio: string;
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
    "Boston Square Ventures is a free, online, 4-week founder sprint for student founders from Harvard, MIT, and beyond — and the network that backs them after.",
  applyHref: "#apply",
  contactEmail: "hello@bostonsquareventures.com", // [PLACEHOLDER] set up this inbox
  year: new Date().getFullYear(),
};

export const nav: NavLink[] = [
  { label: "the track", href: "#track" },
  { label: "program", href: "#program" },
  { label: "founders", href: "#founders" },
  { label: "faq", href: "#faq" },
];

export const hero = {
  eyebrow: "boston square ventures · cohort 01 · online · free",
  line: "4 weeks. one track.",
  italic: "for founders who'd build anyway.",
  body: "a free, online founder sprint for student founders from Harvard, MIT, and beyond — plus the network that backs them when the four weeks end.",
  primary: "apply to cohort 01",
  secondary: "who are we, anyway?",
  hint: "move your cursor, or tap. the square notices.",
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
};

export const receipts = {
  label: "built by people who've been through",
  items: [
    logos.harvard,
    logos.mit,
    logos.yc,
    logos.mercor,
    logos.forbes,
    logos.cokeScholars,
    logos.duke,
  ],
};

export const track: {
  eyebrow: string;
  heading: string;
  tagline: string;
  body: string;
  points: Point[];
  cta: string;
} = {
  eyebrow: "the founder track",
  heading: "one track. no junior varsity.",
  tagline:
    "for the ones who are going to build this whether or not anyone says yes.",
  body: "four weeks of structure, a cohort that ships, and a network that keeps picking up the phone after demo day.",
  points: [
    {
      lead: "4 weeks, fully online.",
      rest: " one 30-minute lecture and one homework a week.",
    },
    { lead: "a small cohort", rest: " of student founders who actually ship." },
    { lead: "mentors", rest: " who've founded, operated, and invested." },
    {
      lead: "warm intros",
      rest: " to aligned angels and funds when you're ready — not before.",
    },
    { lead: "software credits", rest: " and tooling as we secure them." },
    { lead: "demo day", rest: " in front of the whole network." },
    { lead: "alumni for life", rest: " in the Boston Square network." },
    { lead: "costs nothing.", rest: " no tuition, no equity." },
  ],
  cta: "apply to the founder track",
};

export const facts: Fact[] = [
  { value: 4, label: "weeks", note: "start to demo day" },
  {
    value: 30,
    suffix: " min",
    label: "lectures",
    note: "once a week, recorded",
  },
  { value: 1, label: "homework", note: "per week. that's it" },
  { value: 0, prefix: "$", label: "cost", note: "no tuition, no equity" },
];

export const perks: { eyebrow: string; heading: string; items: Perk[] } = {
  eyebrow: "what's included?",
  heading: "the stuff you can't google your way into.",
  items: [
    {
      title: "mentorship",
      body: "founders, operators, and investors who've built real companies — on a call with you, not in a newsletter.",
    },
    {
      title: "peer network",
      body: "a small group of student founders from Harvard, MIT, and beyond who would be building regardless.",
    },
    {
      title: "startup resources",
      body: "templates, credits, and the unglamorous checklists that save you weeks.",
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
  weeks: Week[];
} = {
  eyebrow: "the program",
  heading: "weekly lectures and homework.",
  body: "nobody wakes up excited about lectures or homework. this is the version that's actually worth showing up for — short, specific, and graded by whether users show up.",
  note: [
    "lectures: once a week, 30 minutes, recorded.",
    "homework: once a week. part-timers and full-timers welcome.",
  ],
  weeks: [
    {
      number: "01",
      theme: "problem",
      lecture: "who hurts, how much, and how you'd prove it.",
      homework: "ten real conversations with people who have the problem.",
    },
    {
      number: "02",
      theme: "product",
      lecture: "the smallest thing that could possibly work.",
      homework: "ship a v0. ugly is fine. imaginary is not.",
    },
    {
      number: "03",
      theme: "distribution",
      lecture: "getting strangers to use it without begging friends.",
      homework: "first ten users you don't know.",
    },
    {
      number: "04",
      theme: "story",
      lecture: "the pitch, the numbers, and the ask.",
      homework: "demo day. four minutes. the network is watching.",
    },
  ],
};

export const founders: {
  eyebrow: string;
  heading: string;
  body: string;
  items: Founder[];
} = {
  eyebrow: "who are we, anyway?",
  heading: "two freshmen who got tired of waiting.",
  body: "we're students too. we've shipped things, been told no, and kept going. we built the program we wished existed in our first semester.",
  items: [
    {
      name: "Soneesh Kothagundla",
      role: "co-founder",
      school: "Harvard '30",
      schoolLogo: logos.harvard,
      photo: "/founders/soneesh.jpg",
      bio: "author, builder, and the kind of person who turns a flight delay into a movement. featured in Forbes for exactly that.",
      socials: [
        {
          kind: "linkedin",
          label: "LinkedIn",
          href: "https://www.linkedin.com/in/soneeshk",
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
          label: "Featured in Forbes",
          logo: logos.forbes,
          href: "https://www.forbes.com/sites/toddnordstrom/2026/03/04/seatbelt-sign-is-off-how-soneesh-kothagundla-turned-airplanes-into-a-life-saving-movement/",
        },
        {
          label: "#1 Amazon Bestselling Author, Fasten Your Seatbelt",
          logo: logos.amazon,
          href: "https://www.amazon.com/dp/B0G1SSKDZT",
        },
        { label: "Y Combinator Summer Fellow", logo: logos.yc },
      ],
    },
    {
      name: "Hadi Abdul",
      role: "co-founder",
      school: "Harvard '30",
      schoolLogo: logos.harvard,
      photo: "/founders/hadi.jpg",
      bio: "physicist by training, founder by habit. previously at Mercor; built VoiceWorks to reach 9,000+ non-verbal students before he could vote.",
      socials: [
        {
          kind: "github",
          label: "GitHub",
          href: "https://github.com/hadiabdul8128",
        },
        { kind: "web", label: "VoiceWorks", href: "https://voiceworks.coach/" },
        // [PLACEHOLDER] add LinkedIn once confirmed: { kind: "linkedin", label: "LinkedIn", href: "" }
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

export const cost = {
  heading: "costs? nothing.",
  body: "no tuition. no equity. no \u201cpay it forward\u201d clause. we're students — we remember what a $400 course felt like.",
  cta: "apply to cohort 01",
};

export const faq: { eyebrow: string; heading: string; items: Faq[] } = {
  eyebrow: "faq",
  heading: "the questions you'd dm us anyway.",
  items: [
    {
      q: "who can apply?",
      a: "students and recent grads, anywhere in the world. the network started in Boston — Harvard and MIT — but that's where it started, not a requirement.",
    },
    {
      q: "do i need a team or an idea?",
      a: "no. an idea helps. a team is nice. what we actually look for is someone who'd be building this with or without us.",
    },
    {
      q: "is it really online?",
      a: "yes. every lecture is recorded, live sessions are optional, and homework is async. if you have a laptop and a problem you can't stop thinking about, you're set.",
    },
    {
      q: "what does it cost?",
      a: "nothing. not tuition, not equity, not a percentage of anything, ever.",
    },
    {
      q: "do you invest?",
      a: "not yet. the founder track is about warm introductions to aligned investors and mentors, not a fund. we'll say so loudly if that changes.",
    },
    {
      q: "when does cohort 01 start?",
      a: "dates go to applicants first. apply, and you'll be the first to know.",
    },
  ],
};

export const apply = {
  eyebrow: "apply",
  heading: "founders, are you ready to build?",
  body: "two minutes. no essay. tell us what you're working on and where you are with it.",
  fields: {
    name: "name",
    email: "email",
    school: "school & year",
    stage: "where are you?",
    building: "what are you building, or what can't you stop thinking about?",
    link: "a link (optional)",
  },
  stages: [
    "just an idea",
    "building a v0",
    "launched, no users yet",
    "users, no revenue",
    "revenue",
  ],
  submit: "send application",
  cardNote:
    "every founder in cohort 01 gets one. type your name and watch it engrave.",
  note: "saved on this device for now. delivery is wired before launch — nothing leaves your browser yet.",
  success: "got it. we read every one.",
  error: "please fill in your name, email, and what you're building.",
};

export const closing = {
  lines: ["we're students. we've shipped.", "you already know if this is you."],
  cta: "apply to cohort 01",
};

export const footer = {
  disclaimer:
    "an independent network. not affiliated with or endorsed by Harvard University or MIT.",
  copyright: `\u00A9 ${site.year} Boston Square Ventures`,
  backToTop: "back to top",
};
