"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type RefObject } from "react";
import { gsap } from "@/lib/gsap";
import { BoovCharacter, type BoovMode } from "./BoovCharacter";
import styles from "./BoovReserve.module.css";

/**
 * The release form's submit control, played by Boov himself. When the section
 * scrolls into view he crawls in from the left edge of the screen up onto the
 * submit slot ("touch me!" while crawling), stands up when he arrives
 * ("click me!"), and clicking him submits the form. A real <button
 * type="submit"> the whole time — the pill caption "Reserve spot" is the
 * accessible name, so keyboard, AT, validation and the success flow are
 * exactly what a plain button would give.
 */
export function BoovReserve({ armRef }: { armRef: RefObject<HTMLElement | null> }) {
  const prefersReducedMotion = useReducedMotion();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const riderRef = useRef<HTMLSpanElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const [arrived, setArrived] = useState(false);
  const [armed, setArmed] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Reduced motion: no crawl — he's simply there.
  useEffect(() => {
    if (prefersReducedMotion) setArrived(true);
  }, [prefersReducedMotion]);

  // Arm the crawl the first time the section is properly on screen.
  useEffect(() => {
    if (prefersReducedMotion || armed) return;
    const section = armRef.current;
    if (!section) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setArmed(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(section);
    return () => io.disconnect();
  }, [armRef, armed, prefersReducedMotion]);

  useEffect(() => {
    if (!armed || prefersReducedMotion) return;
    const rider = riderRef.current;
    const button = buttonRef.current;
    if (!rider || !button) return;

    // From the left edge of the screen to the submit slot, measured at arm
    // time (the section is static by the time it is in view).
    const distance = button.getBoundingClientRect().left + 180;
    tweenRef.current = gsap.fromTo(
      rider,
      { x: -distance },
      {
        x: 0,
        duration: 2.4,
        ease: "power2.inOut",
        onComplete: () => setArrived(true),
      },
    );
    return () => {
      tweenRef.current?.kill();
    };
  }, [armed, prefersReducedMotion]);

  // Mid-crawl click still submits — snap him onto the slot first.
  const snapHome = () => {
    if (!arrived) {
      tweenRef.current?.progress(1);
      setArrived(true);
    }
  };

  const mode: BoovMode = arrived ? "idle" : armed ? "crawl" : "idle";
  const visible = armed || arrived;

  return (
    <button
      ref={buttonRef}
      type="submit"
      className={styles.button}
      onClick={snapHome}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-cursor
      data-cursor-label="Reserve"
    >
      <span className={styles.caption}>Reserve spot</span>
      <span
        ref={riderRef}
        className={`${styles.rider} ${visible ? styles.riderVisible : ""}`}
        aria-hidden="true"
      >
        <span className={styles.scaler}>
          <span className={`${styles.bubble} ${arrived ? styles.bubbleArrived : ""}`}>
            {arrived ? "click me!" : "touch me!"}
          </span>
          <BoovCharacter size={104} mode={mode} wave={arrived && hovered} />
        </span>
      </span>
    </button>
  );
}
