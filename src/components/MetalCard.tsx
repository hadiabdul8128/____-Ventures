import { useRef, type PointerEvent } from "react";
import { useReducedMotion } from "motion/react";
import { Mark } from "./Mark";
import { site } from "@/content";

type Props = {
  /** Engraved on the card; falls back to a generic label while the form is empty. */
  name?: string;
  className?: string;
};

export function MetalCard({ name, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const setVars = (vars: Record<string, string>) => {
    const el = ref.current;
    if (!el) return;
    for (const [k, v] of Object.entries(vars)) el.style.setProperty(k, v);
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    // Touch has no hover: a scroll that starts on the card would otherwise
    // flick the tilt for a frame or two before pointercancel fires.
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    // Measure the untransformed scene, not the already-tilted card.
    const rect = (el.parentElement ?? el).getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setVars({
      "--mx": `${(px * 100).toFixed(2)}%`,
      "--my": `${(py * 100).toFixed(2)}%`,
      "--rx": reduced ? "0deg" : `${((0.5 - py) * 14).toFixed(2)}deg`,
      "--ry": reduced ? "0deg" : `${((px - 0.5) * 16).toFixed(2)}deg`,
      "--hover": "1",
    });
  };

  const onLeave = () =>
    setVars({
      "--rx": "0deg",
      "--ry": "0deg",
      "--hover": "0",
      "--mx": "50%",
      "--my": "40%",
    });

  const engraved = (name ?? "").trim().toUpperCase() || "FOUNDER";
  const fit = engraved.length > 24 ? "xs" : engraved.length > 16 ? "sm" : "md";

  return (
    <div className={`metal-card-scene ${className ?? ""}`}>
      <div
        ref={ref}
        className="metal-card"
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onPointerCancel={onLeave}
        role="img"
        aria-label={`${site.name} founder card, engraved ${engraved}`}
      >
        <div className="metal-card-edge" aria-hidden="true" />
        <div className="metal-card-brush" aria-hidden="true" />
        <div className="metal-card-sheen" aria-hidden="true" />
        <div className="metal-card-face">
          <div className="metal-card-top">
            <Mark size={42} className="metal-card-mark" />
            <span className="metal-card-brand">
              {site.wordmark.join(" ").toUpperCase()}
            </span>
          </div>
          <div className="metal-card-bottom" data-fit={fit}>
            <div>
              <span className="metal-card-name" data-fit={fit}>
                {engraved}
              </span>
              <span className="metal-card-line">FOUNDER · COHORT 01</span>
            </div>
            <span className="metal-card-tag">BOSTON · EST. {site.year}</span>
          </div>
        </div>
        <div className="metal-card-glare" aria-hidden="true" />
      </div>
      <div className="metal-card-shadow" aria-hidden="true" />
    </div>
  );
}
