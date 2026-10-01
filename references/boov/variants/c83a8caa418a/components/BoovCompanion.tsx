"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import styles from "./BoovCompanion.module.css";

const GREETINGS = [
  "hi! i'm boov.",
  "glad you're here!",
  "tap in. change lives.",
  "we've got this!",
] as const;

declare global {
  interface Window {
    __boovLoaded?: boolean;
  }
}

export function BoovCompanion() {
  const prefersReducedMotion = useReducedMotion();
  const scrollProgress = useMotionValue(0);
  const tiltX = useSpring(useMotionValue(0), { stiffness: 260, damping: 24, mass: 0.7 });
  const tiltY = useSpring(useMotionValue(0), { stiffness: 260, damping: 24, mass: 0.7 });
  const dockScale = useTransform(scrollProgress, [0, 0.75, 1], [1, 0.84, 0.8]);
  const dockY = useTransform(scrollProgress, [0, 1], [0, 14]);
  const timeoutRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);
  const [reaction, setReaction] = useState(0);
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const reveal = () => setReady(true);

    if (window.__boovLoaded) reveal();
    window.addEventListener("boov:loaded", reveal);
    return () => window.removeEventListener("boov:loaded", reveal);
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const travel = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        scrollProgress.set(Math.min(1, window.scrollY / travel));
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [scrollProgress]);

  useEffect(
    () => () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  const greet = (advance = false) => {
    if (advance) setGreetingIndex((current) => (current + 1) % GREETINGS.length);
    setReaction((current) => current + 1);
    setSpeaking(true);

    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setSpeaking(false), 1550);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (prefersReducedMotion) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    tiltY.set(x * 12);
    tiltX.set(y * -9);
  };

  const resetTilt = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  return (
    <motion.aside
      className={styles.root}
      aria-label="Boov site companion"
      initial={prefersReducedMotion ? false : { opacity: 0, x: 110, y: 70, rotate: 12 }}
      animate={ready ? { opacity: 1, x: 0, y: 0, rotate: 0 } : { opacity: 0, x: 110, y: 70, rotate: 12 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.button
        className={styles.button}
        type="button"
        aria-label="Say hello to Boov"
        data-cursor
        data-cursor-label="Say hi"
        style={{ scale: prefersReducedMotion ? 0.82 : dockScale, y: prefersReducedMotion ? 0 : dockY }}
        onClick={() => greet(true)}
        onFocus={() => greet(false)}
        onPointerEnter={() => greet(false)}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetTilt}
      >
        <span className={styles.aura} aria-hidden="true" />
        <span className={styles.orbit} aria-hidden="true" />

        <motion.span
          className={styles.tiltStage}
          style={{ rotateX: tiltX, rotateY: tiltY }}
        >
          <motion.span
            key={reaction}
            className={styles.character}
            animate={
              reaction > 0 && !prefersReducedMotion
                ? {
                    y: [0, -9, 2, -6, 0],
                    rotate: [0, 6, -5, 4, 0],
                    scale: [1, 1.04, 0.99, 1.03, 1],
                  }
                : { y: 0, rotate: 0, scale: 1 }
            }
            transition={{ duration: 0.78, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              className={styles.image}
              src="/boov-home-companion.png"
              alt=""
              width={360}
              height={360}
              priority
              sizes="(max-width: 600px) 112px, 176px"
            />
          </motion.span>
        </motion.span>

        <AnimatePresence>
          {speaking ? (
            <motion.span
              className={styles.bubble}
              role="status"
              aria-live="polite"
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.78, x: 12, y: 8 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 6, y: 4 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.26, ease: [0.16, 1, 0.3, 1] }}
            >
              {GREETINGS[greetingIndex]}
            </motion.span>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {speaking && !prefersReducedMotion ? (
            <motion.span
              key={`laugh-${reaction}`}
              className={styles.laugh}
              aria-hidden="true"
              initial={{ opacity: 0, y: 8, rotate: -8 }}
              animate={{ opacity: [0, 1, 1, 0], y: [8, 0, -12, -22], rotate: [-8, 4, -4, 8] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            >
              ha!
            </motion.span>
          ) : null}
        </AnimatePresence>
      </motion.button>
    </motion.aside>
  );
}
