"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import styles from "./gooey-button.module.css";

/**
 * Gooey button — blobs rise out of the pill and merge back into it through an
 * SVG goo filter (blur + high-contrast alpha matrix).
 *
 * Adapted from the reference snippet with three additions it needed to be
 * usable here: typed props, a forwarded ref (the reserve CTA is driven
 * imperatively), and the filter carried inside the component so it can never
 * be rendered without the `<defs>` it depends on. The filter id is namespaced
 * rather than the generic "gooey" to avoid colliding with anything else on
 * the page.
 */
export interface GooeyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** How many blobs rise out of the pill. The CSS styles up to 5. */
  bubbleCount?: number;
}

export const GooeyButton = forwardRef<HTMLButtonElement, GooeyButtonProps>(
  ({ className, children, bubbleCount = 5, ...props }, ref) => (
    <button ref={ref} className={cn(styles.button, className)} {...props}>
      {/* Hidden, but the <defs> still resolve for the CSS filter reference. */}
      <svg xmlns="http://www.w3.org/2000/svg" className={styles.filter} aria-hidden="true" focusable="false">
        <defs>
          <filter id="boov-gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* The pill's fill lives in here alongside the blobs so the goo filter
          merges them — filtering the blobs alone would leave them detached. */}
      <span className={styles.bubbles} aria-hidden="true">
        <span className={styles.fill} />
        {Array.from({ length: bubbleCount }).map((_, index) => (
          <span key={index} className={styles.bubble} />
        ))}
      </span>

      <span className={styles.label}>{children}</span>
    </button>
  ),
);

GooeyButton.displayName = "GooeyButton";

export default GooeyButton;
