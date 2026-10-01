import Image from "next/image";
import { Section } from "@/components/Section";
import { PullQuote } from "@/components/ui/PullQuote";

type ReflectionProps = {
  content: string;
};

function parseSections(content: string) {
  return content
    .split(/\n## /)
    .map((part) => part.replace(/^## /, "").trim())
    .filter(Boolean)
    .map((part) => {
      const [heading, ...rest] = part.split(/\n\n/);
      return {
        heading: heading.trim(),
        paragraphs: rest.map((paragraph) => paragraph.trim()).filter(Boolean),
      };
    });
}

const facts = [
  ["Hometown", "Durham, NC"],
  ["School", "NCSSM"],
  ["Heading to", "Harvard University"],
  ["Focus", "Biomedical engineering, digital health, global health"],
] as const;

export function Reflection({ content }: ReflectionProps) {
  const sections = parseSections(content);

  return (
    <Section id="about" label="01 · Reflection" className="bg-paper">
      <div className="grid gap-12 lg:grid-cols-12">
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <p className="font-mono text-sm font-semibold uppercase tracking-[0.14em] text-accent-deep">
              About Hadi
            </p>
            <div className="mt-6 overflow-hidden rounded-lg border border-rule bg-white">
              <Image
                src="/assets/portrait.jpg"
                alt="Portrait of Hadi Abdul"
                width={971}
                height={1398}
                className="aspect-[4/5] w-full object-cover"
                priority={false}
              />
            </div>
            <dl className="mt-8 divide-y divide-rule border-y border-rule">
              {facts.map(([term, value]) => (
                <div key={term} className="grid grid-cols-[110px_1fr] gap-4 py-4">
                  <dt className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                    {term}
                  </dt>
                  <dd className="text-sm font-medium text-ink-soft">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
        <div className="lg:col-span-8">
          <h2>Reflection Essay</h2>
          <div className="reflection-prose mt-8 max-w-[65ch] text-lg leading-[1.72] text-ink-soft">
            {sections.map((section, sectionIndex) => (
              <div key={section.heading}>
                <h3 className="mt-10 font-serif text-2xl font-semibold text-ink first:mt-0">
                  {section.heading}
                </h3>
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p
                    key={`${section.heading}-${paragraphIndex}`}
                    className={sectionIndex === 0 && paragraphIndex === 0 ? "dropcap mt-5" : "mt-5"}
                  >
                    {paragraph}
                  </p>
                ))}
                {sectionIndex === 0 ? (
                  <PullQuote>
                    I am drawn to work that can move from a bench, a model, or a circuit
                    board to a person who can actually use it.
                  </PullQuote>
                ) : null}
              </div>
            ))}
          </div>
          <div className="video-wrap mt-16 rounded-lg border border-rule bg-white p-3 shadow-lift">
            <video
              controls
              preload="metadata"
              className="aspect-video w-full rounded-md bg-ink"
              aria-label="Video reflection"
            >
              <source src="/assets/reflection.mp4" type="video/mp4" />
            </video>
            <p className="mt-3 px-1 text-sm text-muted">
              Video reflection - also available as written essay above.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
