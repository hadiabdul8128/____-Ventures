"use client";

import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import styles from "./Preloader.module.css";

/**
 * Branded intro: a counter races 0 → 100 while the brand mark draws in, then
 * the whole overlay wipes up to reveal the page. Locks scroll until done.
 * Under reduced motion it renders nothing (page shows immediately).
 */
export function Preloader() {
  const prefersReducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);

  useGSAP(
    () => {
      if (prefersReducedMotion) {
        (window as typeof window & { __boovLoaded?: boolean }).__boovLoaded = true;
        window.dispatchEvent(new Event("boov:loaded"));
        setDone(true);
        return;
      }
      document.body.style.overflow = "hidden";
      const counter = { v: 0 };
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = "";
          (window as typeof window & { __boovLoaded?: boolean }).__boovLoaded = true;
          window.dispatchEvent(new Event("boov:loaded"));
          setDone(true);
        },
      });

      tl.to(counter, {
        v: 100,
        duration: 2,
        ease: "power2.inOut",
        onUpdate: () => {
          if (countRef.current) countRef.current.textContent = String(Math.round(counter.v));
          if (barRef.current) barRef.current.style.transform = `scaleX(${counter.v / 100})`;
        },
      })
        .to(`.${styles.word} span`, { yPercent: -110, duration: 0.6, ease: "power3.in", stagger: 0.04 }, "+=0.15")
        .to(`.${styles.meta}`, { opacity: 0, duration: 0.3 }, "<")
        .to(rootRef.current, { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, "-=0.1");
    },
    { scope: rootRef, dependencies: [prefersReducedMotion] },
  );

  if (done) return null;

  return (
    <div ref={rootRef} className={styles.root} data-preloader aria-hidden="true">
      <div className={styles.center}>
        <div className={styles.word}>
          {"boov".split("").map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </div>
      </div>
      <div className={styles.meta}>
        <span className={styles.tagline}>Not charity. Infrastructure.</span>
        <span className={styles.counter}>
          <span ref={countRef}>0</span>
          <i>%</i>
        </span>
      </div>
      <span className={styles.bar}>
        <span ref={barRef} className={styles.barFill} />
      </span>
    </div>
  );
}
