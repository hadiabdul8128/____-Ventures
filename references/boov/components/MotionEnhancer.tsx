"use client";

import { useEffect } from "react";

export function MotionEnhancer() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      return;
    }

    let cancelled = false;
    const observers: IntersectionObserver[] = [];

    async function runAnimations() {
      const { animate } = await import("framer-motion/dom");

      if (cancelled) {
        return;
      }

      document.documentElement.classList.add("motion-ready");

      document.querySelectorAll<HTMLElement>(".reveal-on-scroll").forEach((element) => {
        element.style.opacity = "0";
        element.style.transform = "translateY(8px)";

        const observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry?.isIntersecting) {
              return;
            }

            animate(
              element,
              { opacity: 1, transform: "translateY(0px)" },
              { duration: 0.5, ease: "easeOut" },
            );
            observer.disconnect();
          },
          { rootMargin: "0px 0px -80px 0px" },
        );

        observer.observe(element);
        observers.push(observer);
      });

      const pulse = document.querySelector<SVGPathElement>(".pulse-path");
      if (pulse) {
        const length = pulse.getTotalLength();
        pulse.style.strokeDasharray = String(length);
        pulse.style.strokeDashoffset = String(length);
        pulse.style.opacity = "0.35";
        animate(pulse, { strokeDashoffset: 0, opacity: 1 }, { duration: 1.4, ease: "easeOut" });
      }
    }

    runAnimations();

    return () => {
      cancelled = true;
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return null;
}
