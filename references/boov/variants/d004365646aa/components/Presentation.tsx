import Image from "next/image";
import { Download } from "lucide-react";
import { Section } from "@/components/Section";

const thumbnails = [
  {
    label: "Title",
    src: "/assets/slides/title.png",
    alt: "Title slide for the VitalWave presentation",
  },
  {
    label: "Problem",
    src: "/assets/slides/problem.png",
    alt: "Research problem slide for the VitalWave presentation",
  },
  {
    label: "System",
    src: "/assets/slides/system.png",
    alt: "System architecture slide for the VitalWave presentation",
  },
  {
    label: "Signals",
    src: "/assets/slides/signals.png",
    alt: "Signals collected by VitalWave slide",
  },
  {
    label: "Results",
    src: "/assets/slides/results.png",
    alt: "End-to-end performance results slide for VitalWave",
  },
  {
    label: "Discussion",
    src: "/assets/slides/discussion.png",
    alt: "Discussion slide for VitalWave",
  },
] as const;

export function Presentation() {
  return (
    <Section id="presentation" label="04 · Oral Presentation" className="bg-white">
      <div className="max-w-3xl">
        <h2>NCSSM Research Symposium — Slide Deck</h2>
        <p className="mt-4 text-lg text-muted">
          Final oral presentation for the Comprehensive Research Portfolio.
        </p>
      </div>
      <div className="mt-10 overflow-hidden rounded-lg border border-rule bg-paper shadow-lift">
        <iframe
          src="/assets/vitalwave-presentation.pdf"
          title="VitalWave final oral presentation PDF"
          loading="lazy"
          className="h-[600px] w-full"
        />
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <a
          href="/assets/vitalwave-presentation.pdf"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-2 rounded-md border border-rule bg-white px-4 py-2 text-sm font-semibold text-ink-soft transition hover:border-accent hover:text-accent-deep"
        >
          <Download aria-hidden size={16} />
          Download PDF (2.2 MB)
        </a>
        <p className="max-w-2xl text-sm text-muted">
          Structure: Title · Introduction · Methods · Results · Discussion · Conclusions ·
          Acknowledgements · References
        </p>
      </div>
      <div className="thumbnail-strip mt-8 flex gap-4 overflow-x-auto pb-3">
        {thumbnails.map((thumbnail) => (
          <div
            key={thumbnail.label}
            className="group min-w-64 overflow-hidden rounded-lg border border-rule bg-white shadow-sm transition hover:border-accent hover:shadow-lift"
          >
            <div className="relative aspect-video bg-paper">
              <Image
                src={thumbnail.src}
                alt={thumbnail.alt}
                fill
                sizes="(min-width: 1024px) 256px, 70vw"
                className="object-cover"
              />
            </div>
            <p className="border-t border-rule px-4 py-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              {thumbnail.label}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
