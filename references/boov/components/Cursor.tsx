"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import styles from "./Cursor.module.css";

/**
 * Custom cursor: a small blend-mode dot that trails the pointer with easing,
 * expands over interactive elements, and can show a contextual label
 * (via data-cursor="text"). Never rendered on touch / reduced-motion.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");
    return () => document.documentElement.classList.remove("has-custom-cursor");
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3.out" });

    let visible = false;
    let hoverActive = false;
    const onMove = (e: MouseEvent) => {
      if (!visible) {
        visible = true;
        gsap.to([dot, ring], { opacity: 1, duration: 0.3 });
      }
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    const setHover = (active: boolean, text?: string) => {
      hoverActive = active;
      gsap.to(ring, {
        scale: active ? 1.9 : 1,
        duration: 0.35,
        ease: "power3.out",
      });
      ring.dataset.active = String(active);
      gsap.to(dot, { scale: active ? 1.35 : 1, duration: 0.35, ease: "power3.out" });
      if (text) {
        label.textContent = text;
        gsap.to(label, { opacity: 1, duration: 0.25 });
      } else {
        gsap.to(label, { opacity: 0, duration: 0.2 });
      }
    };

    const interactiveSelector = 'a, button, input, [data-cursor]';
    const onOver = (e: Event) => {
      const target = (e.target as HTMLElement)?.closest(interactiveSelector) as HTMLElement | null;
      if (!target) return;
      const label = target.getAttribute("data-cursor-label") ?? undefined;
      setHover(true, label);
    };
    const onOut = (e: Event) => {
      const target = (e.target as HTMLElement)?.closest(interactiveSelector);
      if (!target) return;
      setHover(false);
    };

    const onDown = () => {
      gsap.to(ring, { scale: hoverActive ? 1.55 : 0.86, duration: 0.16 });
      gsap.to(dot, { scale: hoverActive ? 1.15 : 0.86, duration: 0.16 });
    };
    const onUp = () => {
      gsap.to(ring, { scale: hoverActive ? 1.9 : 1, duration: 0.24, ease: "power3.out" });
      gsap.to(dot, { scale: hoverActive ? 1.35 : 1, duration: 0.24, ease: "power3.out" });
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className={styles.root} aria-hidden="true">
      <svg className={styles.filters} focusable="false">
        <defs>
          <filter
            id="boov-cursor-swap"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
            colorInterpolationFilters="sRGB"
          >
            <feColorMatrix
              type="matrix"
              values="-0.18943 -0.63724 -0.06433 0 1.24786
                      -0.22754 -0.76547 -0.07727 0 1.29773
                      -0.13283 -0.44685 -0.04511 0 1.17380
                       0        0        0       1 0"
            />
          </filter>
        </defs>
      </svg>
      <div ref={ringRef} className={styles.ring}>
        <span ref={labelRef} className={styles.label} />
      </div>
      <div ref={dotRef} className={styles.dot} />
    </div>
  );
}
