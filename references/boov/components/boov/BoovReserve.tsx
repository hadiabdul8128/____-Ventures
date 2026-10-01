"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type RefObject } from "react";
import { gsap } from "@/lib/gsap";
import { GooeyButton } from "@/components/ui/gooey-button";
import { BoovCharacter, type BoovMode } from "./BoovCharacter";
import styles from "./BoovReserve.module.css";

/**
 * The release form's submit control, played by Boov himself. Once armed he
 * crawls in from the left ("touch me!" while crawling), stands up on the
 * submit slot when he arrives ("click me!"), and clicking him submits. A real
 * <button type="submit"> the whole time - the pill caption "Stay updated" is
 * the accessible name, so keyboard, AT, validation and the success flow are
 * exactly what a plain button would give.
 *
 * Two arming styles: pass `armed` to drive it from scene state (e.g. the card
 * handoff's "ready" phase), or pass `armRef` to self-arm via
 * IntersectionObserver. `originRef` bounds the crawl to a container (he enters
 * from its left edge); without it he crawls in from the edge of the screen.
 */
export function BoovReserve({
  armRef,
  armed: armedProp,
  originRef,
  disabled = false,
  size = 104,
}: {
  armRef?: RefObject<HTMLElement | null>;
  armed?: boolean;
  originRef?: RefObject<HTMLElement | null>;
  disabled?: boolean;
  size?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const riderRef = useRef<HTMLSpanElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const [arrived, setArrived] = useState(false);
  const [ioArmed, setIoArmed] = useState(false);
  const [hovered, setHovered] = useState(false);

  const armed = armedProp !== undefined ? armedProp : ioArmed;

  // Reduced motion: no crawl - he's simply there.
  useEffect(() => {
    if (prefersReducedMotion) setArrived(true);
  }, [prefersReducedMotion]);

  // Self-arming fallback for scenes without their own choreography state.
  useEffect(() => {
    if (armedProp !== undefined || prefersReducedMotion || ioArmed) return;
    const section = armRef?.current;
    if (!section) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIoArmed(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(section);
    return () => io.disconnect();
  }, [armRef, armedProp, ioArmed, prefersReducedMotion]);

  useEffect(() => {
    if (!armed || arrived || prefersReducedMotion) return;
    const rider = riderRef.current;
    const button = buttonRef.current;
    if (!rider || !button) return;

    // Crawl start: the origin container's left edge when bounded, otherwise
    // the left edge of the screen. Measured at arm time.
    const buttonRect = button.getBoundingClientRect();
    const origin = originRef?.current?.getBoundingClientRect();
    const distance = origin
      ? Math.max(80, buttonRect.left - origin.left + size * 0.4)
      : buttonRect.left + 180;
    tweenRef.current = gsap.fromTo(
      rider,
      { x: -distance },
      {
        x: 0,
        duration: origin ? 1.7 : 2.4,
        ease: "power2.inOut",
        onComplete: () => setArrived(true),
      },
    );
    return () => {
      tweenRef.current?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armed, prefersReducedMotion]);

  // Mid-crawl click still submits - snap him onto the slot first.
  const snapHome = () => {
    if (!arrived) {
      tweenRef.current?.progress(1);
      setArrived(true);
    }
  };

  const mode: BoovMode = arrived ? "idle" : armed ? "crawl" : "idle";
  const visible = armed || arrived;

  return (
    <GooeyButton
      ref={buttonRef}
      type="submit"
      // The page's one terminal action. GooeyButton owns the fill, radius and
      // type, so the module class only carries what it does not.
      className={styles.button}
      onClick={snapHome}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={disabled}
      data-cursor
      data-cursor-label="Updates"
    >
      Stay updated
      <span
        ref={riderRef}
        className={`${styles.rider} ${visible ? styles.riderVisible : ""}`}
        style={{ marginLeft: `${-size / 2}px`, "--boov-btn-size": `${size}px` } as React.CSSProperties}
        aria-hidden="true"
      >
        <span className={styles.scaler}>
          <span className={`${styles.bubble} ${arrived ? styles.bubbleArrived : ""}`}>
            {arrived ? "click me!" : "touch me!"}
          </span>
          <BoovCharacter size={size} mode={mode} wave={arrived && hovered} />
        </span>
      </span>
    </GooeyButton>
  );
}
