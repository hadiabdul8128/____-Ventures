"use client";

import styles from "./BoovCharacter.module.css";

export type BoovMode = "idle" | "walk" | "crawl";

const LAYERS = ["base", "legL", "legR", "armL", "armWave", "head"] as const;

/**
 * The Boov mascot rig, ported from the design artifact: one square sprite
 * (/boov.webp) sliced into body parts with clip-paths on stacked <img> layers,
 * each running its own continuous idle loop (bob, sway, squash, head tilt,
 * arm sway, leg flex). "walk" adds a free-running step shuffle, "crawl" adds
 * the same shuffle over a crouched, forward-tilted posture.
 *
 * The rig never translates itself across the screen - traverse belongs to the
 * scene, which is what keeps the loops seamless at any distance or duration.
 * Decorative by default (aria-hidden); interactive wrappers own semantics.
 */
export function BoovCharacter({
  size = 120,
  mode = "idle",
  wave = false,
  blush = false,
  className,
}: {
  size?: number;
  mode?: BoovMode;
  wave?: boolean;
  blush?: boolean;
  className?: string;
}) {
  return (
    <span
      className={[
        styles.rig,
        mode === "walk" ? styles.walk : "",
        mode === "crawl" ? styles.crawl : "",
        wave ? styles.waving : "",
        blush ? styles.blushing : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--boov-size": `${size}px` } as React.CSSProperties}
      aria-hidden="true"
    >
      <span className={styles.shadow} />
      <span className={styles.posture}>
        <span className={styles.bob}>
          <span className={styles.sway}>
            <span className={styles.squash}>
              <span className={styles.body}>
                {LAYERS.map((key) => (
                  <span key={key} className={styles[key]}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- clip-path rig; every layer is the same sprite */}
                    <img className={styles.part} src="/boov.webp" alt="" draggable={false} />
                  </span>
                ))}
              </span>
            </span>
          </span>
        </span>
      </span>
    </span>
  );
}
