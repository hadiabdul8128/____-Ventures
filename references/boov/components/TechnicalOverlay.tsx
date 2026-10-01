"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";
import styles from "./TechnicalOverlay.module.css";

type Section = { id: string; label: string };

// Home reads as chapters of one continuous product story.
const SECTION_MAP: Record<string, Section[]> = {
  "/": [
    { id: "top", label: "00 - INDEX" },
    { id: "tap-to-pay", label: "01 - THE CARD" },
    { id: "alerts", label: "02 - REPORTS" },
    { id: "controls", label: "03 - LOCKS TO" },
    { id: "join", label: "04 - RELEASE" },
  ],
};

function sectionsForPath(pathname: string): Section[] {
  return (
    SECTION_MAP[pathname] ?? [
      { id: "top", label: `?? - ${pathname.replace("/", "").toUpperCase() || "INDEX"}` },
    ]
  );
}

/**
 * Blueprint framing layer (oryzo-style): a fixed dashed frame, corner ticks,
 * ruler marks, and live monospace read-outs (scroll % and active section).
 * Purely decorative - pointer-events: none - and hidden from AT.
 */
export function TechnicalOverlay() {
  const pctRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const sections = sectionsForPath(pathname);
  const [section, setSection] = useState(sections[0].label);

  useEffect(() => {
    const routeSections = sectionsForPath(pathname);
    setSection(routeSections[0].label);

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? Math.round((window.scrollY / max) * 100) : 0;
        if (pctRef.current) pctRef.current.textContent = String(pct).padStart(3, "0");
        // Both arcs read one root custom property, so the ring tracks scroll
        // by mutation — no React state, matching the read-out beside it.
        ringRef.current?.style.setProperty("--acpb-percent", String(pct));

        // active section = last one whose top has passed the viewport middle
        const mid = window.innerHeight * 0.5;
        let current = routeSections[0].label;
        for (const s of routeSections) {
          const el = document.getElementById(s.id);
          if (!el) continue;
          if (el.getBoundingClientRect().top <= mid) current = s.label;
        }
        setSection((prev) => (prev === current ? prev : current));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return (
    <div className={styles.root} aria-hidden="true">
      <div className={styles.frame} />

      <span className={`${styles.tick} ${styles.tl}`} />
      <span className={`${styles.tick} ${styles.tr}`} />
      <span className={`${styles.tick} ${styles.bl}`} />
      <span className={`${styles.tick} ${styles.br}`} />

      <span className={`${styles.label} ${styles.labelBL}`}>{section}</span>
      <span className={`${styles.label} ${styles.labelBR}`}>
        <AnimatedCircularProgressBar
          ref={ringRef}
          className={styles.scrollRing}
          value={0}
          showValue={false}
          gaugePrimaryColor="var(--boov-lavender, #b8a7e8)"
          gaugeSecondaryColor="var(--tech-line, rgba(91, 58, 140, 0.3))"
          // Inline: the component hardcodes size-40 and cn is clsx-only (no
          // class merging), but it spreads `style` last, so this always wins.
          style={{
            width: 16,
            height: 16,
            "--circle-size": "16px",
            "--transition-length": "0.18s",
          } as React.CSSProperties}
        />
        SCROLL&nbsp;<span ref={pctRef}>000</span>%
      </span>

      <div className={styles.ruler}>
        {Array.from({ length: 21 }).map((_, i) => (
          <span key={i} className={i % 5 === 0 ? styles.rulerMajor : styles.rulerMinor} />
        ))}
      </div>
    </div>
  );
}
