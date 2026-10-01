import { Section } from "@/components/Section";

const honors = [
  {
    date: "2026",
    title: "Coca-Cola Scholar",
    rank: "150 / 100,000+ · $20,000",
    context: "National scholarship recognizing leadership, service, and academic achievement.",
  },
  {
    date: "2026",
    title: "USAMO Qualifier",
    rank: "Top 250 / 300,000",
    context: "Qualified for the USA Mathematical Olympiad through national competition.",
  },
  {
    date: "2025",
    title: "USAPhO Silver Medal",
    rank: "Top 90 / 6,000",
    context: "Recognized among top U.S. Physics Olympiad competitors.",
  },
  {
    date: "2025",
    title: "Diamond Challenge Grand Finalist",
    rank: "Top 60 / 3,400",
    context: "Advanced Lucent PFAS filtration system to global finals.",
  },
  {
    date: "2024",
    title: "TEDx Speaker",
    rank: "8.6k views",
    context: "\"Breaking Through Perceived Limits\" talk on achievement and self-expectation.",
  },
] as const;

export function Achievements() {
  return (
    <Section id="achievements" label="07 · Recognition" className="bg-ink text-white" dark>
      <div className="max-w-3xl">
        <h2 className="text-white">Recognition & Relevant Documents</h2>
        <p className="mt-4 text-lg text-white/66">
          Selected honors that contextualize the research portfolio and broader academic work.
        </p>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {honors.map((honor) => (
          <article
            key={honor.title}
            className="rounded-lg border border-white/12 bg-white/[0.035] p-5 transition hover:border-accent/60 hover:shadow-lift-dark"
          >
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              {honor.date}
            </p>
            <h3 className="mt-4 font-serif text-xl text-white">{honor.title}</h3>
            <p className="mt-3 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-white/72">
              {honor.rank}
            </p>
            <p className="mt-4 text-sm leading-6 text-white/62">{honor.context}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
