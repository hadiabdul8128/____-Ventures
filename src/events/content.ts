/**
 * Copy for /events. Each event links out to its Luma page for registration.
 * Times are ISO strings; the page sorts events into upcoming and past by `end`.
 */

export type BsvEvent = {
  id: string;
  kicker: string;
  title: string;
  partner: string;
  start: string;
  end: string;
  dateLabel: string;
  dayLabel: string;
  timeLabel: string;
  location: string;
  locationNote: string;
  body: string;
  agenda: string[];
  hosts: string[];
  image: { src: string; alt: string };
  href: string;
  cta: string;
  ctaNote: string;
};

export const eventsPage = {
  eyebrow: "events",
  heading: "come build with us.",
  body: "pitch nights, office hours, and rooms full of student founders across Boston. here's what's coming up.",
  upcoming: "upcoming",
  past: "past",
  none: "nothing on the calendar right now. check back soon.",
  hostedBy: "hosted by",
};

export const events: BsvEvent[] = [
  {
    id: "afore-bsv-boston-founder-summit",
    kicker: "flagship · boston",
    title: "Boston Founder Summit",
    partner: "Boston Square Ventures × Afore Capital",
    start: "2026-11-03T23:00:00.000Z",
    end: "2026-11-04T02:00:00.000Z",
    dateLabel: "Nov 3",
    dayLabel: "Tuesday",
    timeLabel: "6–9 pm ET",
    location: "Boston, MA",
    locationNote: "exact venue shared with confirmed guests.",
    body: "about 100 founders from Harvard, MIT, and schools across Boston for one night. the main event is a live pitch competition judged by the Afore Capital team and Palash Soni, and the strongest pitches can earn direct investment.",
    agenda: [
      "live pitch competition",
      "a short talk from Afore",
      "office hours with investors",
      "open networking",
    ],
    hosts: ["Soneesh Kothagundla", "Hadi Abdul", "Nathan Yu"],
    image: {
      src: "/events/afore-bsv-summit.jpg",
      alt: "Boston Square Ventures × Afore Capital Boston Founder Summit, Nov 3, 6 to 9 pm.",
    },
    href: "https://luma.com/8c7a5rpq",
    cta: "request to join",
    ctaNote: "registration is approved by the hosts. pitch applications go to confirmed guests.",
  },
];
