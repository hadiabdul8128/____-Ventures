"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./TechnicalOverlay.module.css";

type Section = { id: string; label: string };

// Route number = nav order (01 home … 04 lab); letters index sections within a
// route. Keeps the read-out honest on every page instead of silently sticking
// to the homepage table.
// Home reads as chapters of one story; the other routes keep their own tables.
const SECTION_MAP: Record<string, Section[]> = {
  "/": [
    { id: "top", label: "00 — INDEX" },
    { id: "tap-to-pay", label: "01 — THE CARD" },
    { id: "controls", label: "02 — LOCKS TO" },
    { id: "alerts", label: "03 — REPORTS" },
    { id: "join", label: "04 — RELEASE" },
  ],
  "/story": [
    { id: "mission", label: "A — MANIFESTO" },
    { id: "impact", label: "B — IMPACT" },
  ],
  "/play": [
    { id: "exp-01", label: "EXP-01 — SPRING" },
    { id: "exp-02", label: "EXP-02 — GSAP" },
    { id: "exp-03", label: "EXP-03 — MOTION" },
    { id: "exp-04", label: "EXP-04 — MAGIC UI" },
  ],
};

function sectionsForPath(pathname: string): Section[] {
  return (
    SECTION_MAP[pathname] ?? [
      { id: "top", label: `?? — ${pathname.replace("/", "").toUpperCase() || "INDEX"}` },
    ]
  );
}

/**
 * Blueprint framing layer (oryzo-style): a fixed dashed frame, corner ticks,
 * ruler marks, and live monospace read-outs (scroll %, active section, pointer
 * coordinates). Purely decorative — pointer-events: none — and hidden from AT.
 */
export function TechnicalOverlay() {
  const pctRef = useRef<HTMLSpanElement>(null);
  const coordRef = useRef<HTMLSpanElement>(null);
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
    const onMove = (e: MouseEvent) => {
      if (!coordRef.current) return;
      const x = String(Math.round((e.clientX / window.innerWidth) * 100)).padStart(3, "0");
      const y = String(Math.round((e.clientY / window.innerHeight) * 100)).padStart(3, "0");
      coordRef.current.textContent = `X${x} Y${y}`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMove);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMove);
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

      <span className={`${styles.label} ${styles.labelTL}`}>BOOV™</span>
      <span className={`${styles.label} ${styles.labelTR}`}>
        <span ref={coordRef}>X000 Y000</span>
      </span>
      <span className={`${styles.label} ${styles.labelBL}`}>{section}</span>
      <span className={`${styles.label} ${styles.labelBR}`}>
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
