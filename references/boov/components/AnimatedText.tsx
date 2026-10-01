"use client";

import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "framer-motion";
import { createElement, useRef, type ElementType } from "react";
import { gsap } from "@/lib/gsap";
import styles from "./AnimatedText.module.css";

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  /** stagger per word, seconds */
  stagger?: number;
  start?: string;
  delay?: number;
};

/**
 * Kinetic text: each word sits in an overflow-hidden mask and rises into view
 * on scroll, staggered. Content is real text (readable/accessible by default);
 * the mask only affects the transform. Reduced motion → shown instantly.
 */
export function AnimatedText({
  text,
  as = "span",
  className = "",
  stagger = 0.05,
  start = "top 85%",
  delay = 0,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const words = text.split(" ");

  useGSAP(
    () => {
      const targets = gsap.utils.toArray<HTMLElement>(`.${styles.inner}`, ref.current);
      if (!targets.length) return;
      if (prefersReducedMotion) {
        gsap.set(targets, { yPercent: 0 });
        return;
      }
      gsap.fromTo(
        targets,
        { yPercent: 118 },
        {
          yPercent: 0,
          duration: 0.9,
          ease: "power4.out",
          stagger,
          delay,
          scrollTrigger: { trigger: ref.current, start, toggleActions: "play none none none" },
        },
      );
    },
    { scope: ref, dependencies: [prefersReducedMotion] },
  );

  return createElement(
    as,
    { ref, className: `${styles.text} ${className}` },
    words.map((word, i) => (
      <span key={i} className={styles.word}>
        <span className={styles.inner}>{word}</span>
        {i < words.length - 1 ? " " : ""}
      </span>
    )),
  );
}
