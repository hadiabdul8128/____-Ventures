"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * MagicUI `animated-circular-progress-bar`, hand-vendored for Tailwind 3.4.19.
 *
 * Upstream v4-isms that were converted:
 *  - `delay-(--delay)` / `duration-(--transition-length)` (v4 CSS-var shorthand)
 *    -> folded into the `animate-acpb-fade-in` shorthand in tailwind.config.ts.
 *  - `animate-in fade-in` (tailwindcss-animate plugin, not installed here)
 *    -> `animate-acpb-fade-in`, backed by theme.extend.{keyframes,animation}.
 *  - `size-40` / `size-full` / `size-fit` are fine: 3.4 ships `size-*`.
 *
 * Deliberate divergence from upstream, for imperative (ref-driven) use:
 *  - Both arcs now derive from ONE root custom property, `--acpb-percent`.
 *    Upstream wrote a separate `--stroke-percent` literal into each circle's
 *    inline style, so every frame needed a React render. Here the primary arc
 *    reads `var(--acpb-percent)` and the secondary reads
 *    `max(0, 90 - var(--acpb-percent))`, so setting the single root variable
 *    redraws both arcs with zero React involvement.
 *  - Upstream unmounted the secondary arc via `currentPercent <= 90 && ...`.
 *    That is a React-structural dependency on `value`, which would defeat
 *    imperative driving, so it is replaced by a pure-CSS `clamp()` on opacity.
 */

const RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const PERCENT_TO_PX = CIRCUMFERENCE / 100;

/** `React.CSSProperties` widened to accept custom properties. */
type CSSVarProperties = React.CSSProperties &
  Record<`--${string}`, string | number>;

export interface AnimatedCircularProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Upper bound of the value range. Defaults to `100`. */
  max?: number;
  /** Lower bound of the value range. Defaults to `0`. */
  min?: number;
  /** Current value, in `[min, max]`. Mapped to 0–100 internally. */
  value: number;
  /** Stroke color of the filled arc. Any CSS color string. */
  gaugePrimaryColor: string;
  /** Stroke color of the unfilled track arc. Any CSS color string. */
  gaugeSecondaryColor: string;
  className?: string;
  /**
   * Ref to the centered numeric label. Provided so a scroll read-out can drive
   * `labelRef.current.textContent` directly instead of re-rendering.
   */
  labelRef?: React.Ref<HTMLSpanElement>;
  /** Render the centered numeric label. Defaults to `true`. */
  showValue?: boolean;
}

export const AnimatedCircularProgressBar = React.forwardRef<
  HTMLDivElement,
  AnimatedCircularProgressBarProps
>(function AnimatedCircularProgressBar(
  {
    max = 100,
    min = 0,
    value = 0,
    gaugePrimaryColor,
    gaugeSecondaryColor,
    className,
    style,
    labelRef,
    showValue = true,
    children,
    ...props
  },
  ref,
) {
  const range = max - min || 1;
  const currentPercent = Math.round(((value - min) / range) * 100);

  const rootStyle: CSSVarProperties = {
    "--circle-size": "100px",
    "--circumference": CIRCUMFERENCE,
    "--percent-to-px": `${PERCENT_TO_PX}px`,
    "--gap-percent": "5",
    "--offset-factor": "0",
    "--transition-length": "1s",
    "--transition-step": "200ms",
    "--delay": "0s",
    "--percent-to-deg": "3.6deg",
    // Single source of truth for both arcs. Set this on the DOM node to drive
    // the gauge imperatively; see the note at the top of this file.
    "--acpb-percent": currentPercent,
    transform: "translateZ(0)",
    ...(style as CSSVarProperties | undefined),
  };

  const trackStyle: CSSVarProperties = {
    stroke: gaugeSecondaryColor,
    "--stroke-percent": "max(0, 90 - var(--acpb-percent))",
    "--offset-factor-secondary": "calc(1 - var(--offset-factor))",
    // Replaces upstream's conditional unmount above 90%: the track fades out
    // over the last percent rather than being removed from the tree.
    opacity: "clamp(0, calc(90 - var(--acpb-percent)), 1)",
    strokeDasharray:
      "calc(var(--stroke-percent) * var(--percent-to-px)) var(--circumference)",
    transform:
      "rotate(calc(1turn - 90deg - (var(--gap-percent) * var(--percent-to-deg) * var(--offset-factor-secondary)))) scaleY(-1)",
    transformOrigin: "calc(var(--circle-size) / 2) calc(var(--circle-size) / 2)",
    transitionProperty: "stroke-dasharray, stroke, opacity, transform",
    transitionDuration: "var(--transition-length)",
    transitionTimingFunction: "ease",
    transitionDelay: "var(--delay)",
  };

  const arcStyle: CSSVarProperties = {
    stroke: gaugePrimaryColor,
    "--stroke-percent": "var(--acpb-percent)",
    strokeDasharray:
      "calc(var(--stroke-percent) * var(--percent-to-px)) var(--circumference)",
    transform:
      "rotate(calc(-90deg + var(--gap-percent) * var(--offset-factor) * var(--percent-to-deg)))",
    transformOrigin: "calc(var(--circle-size) / 2) calc(var(--circle-size) / 2)",
    transitionProperty: "stroke-dasharray, stroke, transform",
    transitionDuration: "var(--transition-length)",
    transitionTimingFunction: "ease",
    transitionDelay: "var(--delay)",
  };

  return (
    <div
      ref={ref}
      className={cn("relative size-40 text-2xl font-semibold", className)}
      style={rootStyle}
      {...props}
    >
      <svg
        fill="none"
        className="size-full"
        strokeWidth="2"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          strokeWidth="10"
          strokeDashoffset="0"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={trackStyle}
        />
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          strokeWidth="10"
          strokeDashoffset="0"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-100"
          style={arcStyle}
        />
      </svg>
      {showValue ? (
        <span
          ref={labelRef}
          data-current-value={currentPercent}
          className="animate-acpb-fade-in absolute inset-0 m-auto size-fit"
        >
          {children ?? currentPercent}
        </span>
      ) : (
        children
      )}
    </div>
  );
});

AnimatedCircularProgressBar.displayName = "AnimatedCircularProgressBar";

export default AnimatedCircularProgressBar;
