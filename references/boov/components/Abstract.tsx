import { Section } from "@/components/Section";

type AbstractSectionProps = {
  content: string;
};

const abstractPhases = ["Introduction", "Methods", "Results", "Conclusions"] as const;

export function AbstractSection({ content }: AbstractSectionProps) {
  return (
    <Section id="abstract" label="03 · Abstract" className="bg-paper">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="rounded-lg border border-rule bg-white p-6 shadow-lift">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-accent-deep">
              Research Abstract
            </p>
            <h2 className="mt-4 text-3xl">
              VitalWave: An Open-Source End-to-End Wearable Platform for Digital Health
            </h2>
            <p className="mt-5 text-sm leading-6 text-muted">
              Hadi Abdul, North Carolina School of Science and Mathematics; Jessilyn Dunn,
              Duke University
            </p>
            <span className="mt-6 inline-flex rounded-full border border-rule bg-paper px-3 py-1 font-mono text-xs font-semibold text-accent-deep">
              204 words
            </span>
            <div className="mt-6 grid gap-2 border-t border-rule pt-5 sm:grid-cols-2">
              {abstractPhases.map((phase, index) => (
                <div
                  key={phase}
                  className="flex items-center gap-2 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-muted"
                >
                  <span className="text-accent-deep">{String(index + 1).padStart(2, "0")}</span>
                  {phase}
                </div>
              ))}
            </div>
          </div>
        </div>
        <article className="lg:col-span-8">
          <p className="max-w-[65ch] text-xl leading-[1.75] text-ink-soft">{content}</p>
        </article>
      </div>
    </Section>
  );
}
