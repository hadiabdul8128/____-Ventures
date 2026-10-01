import { ArrowDown, FileText } from "lucide-react";
import { PulseWaveform } from "@/components/PulseWaveform";
import { Pill } from "@/components/ui/Pill";

export function Hero() {
  return (
    <header className="relative overflow-hidden bg-ink text-white">
      <div className="hero-accent absolute inset-y-0 right-0 w-px bg-accent" aria-hidden />
      <div className="mx-auto grid min-h-[calc(100vh-72px)] max-w-[1200px] items-center gap-16 px-5 py-24 md:grid-cols-12 md:px-8">
        <div className="md:col-span-7">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Research Portfolio · 2025-2026
          </p>
          <h1 className="mt-6 text-white">Hadi Abdul</h1>
          <p className="mt-6 max-w-3xl font-serif text-2xl italic leading-snug text-white/70 md:text-3xl">
            Building open-source tools at the intersection of biomedical engineering, digital health,
            and global health systems.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Pill>NCSSM &apos;26</Pill>
            <Pill>Duke BIG IDEAs Lab</Pill>
            <Pill>Harvard &apos;30 Incoming</Pill>
          </div>
          <div className="hero-actions mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="#research"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white"
            >
              View Research
              <ArrowDown aria-hidden size={16} />
            </a>
            <a
              href="/assets/resume.pdf"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/18 px-5 py-3 text-sm font-semibold text-white transition hover:border-accent hover:text-accent"
            >
              Download Resume
              <FileText aria-hidden size={16} />
            </a>
          </div>
        </div>
        <div className="md:col-span-5">
          <PulseWaveform />
        </div>
      </div>
    </header>
  );
}
