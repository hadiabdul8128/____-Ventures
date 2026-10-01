"use client";

import { useReducedMotion } from "framer-motion";
import styles from "./Marquee.module.css";

type Props = {
  text: string;
  /** seconds per loop */
  speed?: number;
  reverse?: boolean;
  className?: string;
  separator?: string;
};

/**
 * Infinite horizontal marquee. Pure CSS transform loop (no layout animation);
 * pauses on hover and under reduced motion.
 */
export function Marquee({ text, speed = 26, reverse = false, className = "", separator = "-" }: Props) {
  const prefersReducedMotion = useReducedMotion();
  const item = (
    <span className={styles.item}>
      {text}
      <span className={styles.sep} aria-hidden="true">
        {separator}
      </span>
    </span>
  );

  return (
    <div className={`${styles.root} ${className}`} aria-label={text}>
      <div
        className={styles.track}
        style={{
          animationDuration: `${speed}s`,
          animationDirection: reverse ? "reverse" : "normal",
          animationPlayState: prefersReducedMotion ? "paused" : undefined,
        }}
        aria-hidden="true"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <span key={i} className={styles.group}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
