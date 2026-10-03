import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/** Edge-lit glass forms: pointer movement shifts the reflections, not the copy. */
export function LiquidGlass() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const surface = ref.current;
    const section = surface?.closest("section");
    if (!surface || !section || reduced) return;
    let frame = 0;
    const move = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        surface.style.setProperty("--glass-x", `${50 + x * 65}%`);
        surface.style.setProperty("--glass-y", `${50 + y * 65}%`);
        surface.style.setProperty("--glass-dx", `${x * 26}px`);
        surface.style.setProperty("--glass-dy", `${y * 20}px`);
      });
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      surface.removeAttribute("style");
    };
    section.addEventListener("pointermove", move, { passive: true });
    section.addEventListener("pointerleave", reset);
    section.addEventListener("pointerup", reset);
    return () => {
      cancelAnimationFrame(frame);
      section.removeEventListener("pointermove", move);
      section.removeEventListener("pointerleave", reset);
      section.removeEventListener("pointerup", reset);
    };
  }, [reduced]);
  return (
    <div className="liquid-scene" ref={ref} aria-hidden="true">
      <div className="liquid-halo" />
      <div className="liquid-form liquid-form--left">
        <i />
        <i />
        <i />
      </div>
      <div className="liquid-form liquid-form--right">
        <i />
        <i />
        <i />
      </div>
      <div className="liquid-vignette" />
    </div>
  );
}
