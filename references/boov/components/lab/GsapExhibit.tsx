"use client";

import { useGSAP } from "@gsap/react";
import { Link } from "next-view-transitions";
import { useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { EASE_OUT, gsap } from "@/lib/gsap";
import { useMagnetic } from "@/lib/hooks/useMagnetic";
import { LabSection } from "./LabSection";
import styles from "./GsapExhibit.module.css";

const PHRASE = "Proof over pity.";

/**
 * EXP-02 - a pinned, scrubbed ScrollTrigger scene. The phrase's characters
 * stagger up out of a skew as the user scrolls through the pin; progress is
 * mirrored into the monospace readout via onUpdate → ref.textContent (no React
 * state per frame). Under prefers-reduced-motion the phrase renders static and
 * nothing pins.
 */
export function GsapExhibit() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  // Link forwards no ref; magnetic rides a wrapper span.
  const ctaRef = useMagnetic<HTMLSpanElement>(0.35);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const chars = gsap.utils.toArray<HTMLElement>(`.${styles.char}`, rootRef.current);
      if (!chars.length) return;

      gsap
        .timeline({
          scrollTrigger: {
            trigger: stageRef.current,
            start: "center center",
            end: "+=140%",
            pin: stageRef.current,
            scrub: 0.5,
            onUpdate: (self) => {
              if (readoutRef.current) {
                readoutRef.current.textContent = `t = ${self.progress.toFixed(2)}`;
              }
            },
          },
        })
        .fromTo(
          chars,
          { yPercent: 130, skewX: -14, autoAlpha: 0 },
          { yPercent: 0, skewX: 0, autoAlpha: 1, duration: 1, stagger: 0.045, ease: EASE_OUT },
        )
        // hold the finished frame for the tail of the scrub
        .to({}, { duration: 0.35 });
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  const words = PHRASE.split(" ");

  return (
    <LabSection
      id="exp-02"
      index="02"
      tool="GSAP / SCROLLTRIGGER"
      title="Scrub-pinned typography"
      readout={
        <>
          <span ref={readoutRef}>t = 0.00</span>
          <span>pin center / scrub 0.5</span>
        </>
      }
    >
      <div ref={rootRef} className={styles.wrap}>
        <div ref={stageRef} className={styles.stage}>
          <p className={styles.phrase}>
            <span className={styles.srOnly}>{PHRASE}</span>
            <span className={styles.phraseVisual} aria-hidden="true">
              {words.map((word, wi) => (
                <span key={wi} className={styles.word}>
                  {word.split("").map((ch, ci) => (
                    <span key={ci} className={styles.char}>
                      {ch}
                    </span>
                  ))}
                </span>
              ))}
            </span>
          </p>

          <p className={styles.annotation} aria-hidden="true">
            STAGGER 0.045/CHAR - SKEW -14° → 0° - EASE {EASE_OUT.toUpperCase()}
          </p>

          <span ref={ctaRef} style={{ display: "inline-flex", willChange: "transform" }}>
            <Link href="/#join" className={styles.cta}>
              Back the proof
            </Link>
          </span>
        </div>
      </div>
    </LabSection>
  );
}
