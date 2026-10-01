"use client";

import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { MorphingText } from "@/components/ui/morphing-text";
import styles from "./BoovExperience.module.css";

const EDGE_LAYERS = Array.from({ length: 17 }, (_, index) => index - 8);

// The opening line holds long enough to read, then melts into the wordmark and
// stays there. The newline is rendered via white-space: pre on .heroMorph —
// stacking it keeps the widest line close to the width of "BOOV", so the morph
// runs at near full hero scale instead of shrinking to fit one long line.
const HERO_WORDS = ["Tap Into\nChange", "BOOV"];
const HERO_ENTRANCE_SECONDS = 0.9;
const HERO_HOLD_SECONDS = 0.8;

function OrbitMark() {
  return (
    <svg
      className={styles.orbitMark}
      viewBox="0 0 40 40"
      aria-hidden="true"
    >
      <ellipse cx="20" cy="20" rx="16" ry="8.5" transform="rotate(-32 20 20)" />
      <circle className={styles.orbitCore} cx="20" cy="20" r="4.4" />
      <circle className={styles.orbitMoon} cx="31.5" cy="11.5" r="3.4" />
    </svg>
  );
}

function ContactlessMark() {
  return (
    <span className={styles.contactlessMark} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

function SupportMark() {
  return (
    <span className={styles.supportMark} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

function CardRibbon() {
  return (
    <svg
      className={styles.cardRibbon}
      viewBox="0 0 620 391"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="boov-ribbon" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#B8A7E8" stopOpacity="0.05" />
          <stop offset="0.5" stopColor="#B8A7E8" stopOpacity="0.2" />
          <stop offset="1" stopColor="#DDD4F7" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="boov-ribbon-glow" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#DDD4F7" stopOpacity="0" />
          <stop offset="0.55" stopColor="#DDD4F7" stopOpacity="0.5" />
          <stop offset="1" stopColor="#EFEAFB" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M -50 440 C 150 330 240 250 340 185 C 460 108 545 55 690 -55"
        fill="none"
        stroke="url(#boov-ribbon)"
        strokeWidth="150"
        strokeLinecap="round"
      />
      <path
        d="M -50 452 C 150 342 240 262 340 197 C 460 120 545 67 690 -43"
        fill="none"
        stroke="url(#boov-ribbon-glow)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Chip() {
  return (
    <span className={styles.chip} aria-hidden="true">
      <span />
    </span>
  );
}

function CardFront({ opacity }: { opacity: number }) {
  return (
    <div className={`${styles.cardFace} ${styles.cardFront}`} style={{ opacity }} aria-hidden="true">
      <div className={styles.cardGrain} />
      <CardRibbon />

      <div className={styles.frontBrand}>
        <OrbitMark />
        <span>boov</span>
      </div>

      <ContactlessMark />
      <Chip />

      <div className={styles.tapSupport}>
        <SupportMark />
        <span>tap to support</span>
      </div>

      <div className={styles.memberId}>
        <strong>BOOV MEMBER</strong>
        <span>BV &bull; 0427</span>
      </div>

      <div className={styles.essentialsLabel}>
        essentials
        <br />
        card
      </div>
      <div className={styles.cardSheen} />
    </div>
  );
}

function CardBack({ opacity }: { opacity: number }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- Keep the SVG as one 3D compositor texture. */}
      <img
        className={`${styles.cardFace} ${styles.cardBack}`}
        src="/boov-card-back.svg"
        alt=""
        draggable={false}
        style={{ opacity }}
        aria-hidden="true"
      />
    </>
  );
}

function MemberCard({
  frontOpacity,
  backOpacity,
}: {
  frontOpacity: number;
  backOpacity: number;
}) {
  return (
    <div className={styles.cardObject} role="img" aria-label="Boov Essentials member card rotating from its navy front to its lavender back">
      {EDGE_LAYERS.map((depth) => (
        <span
          className={styles.cardEdge}
          key={depth}
          style={{ transform: `translateZ(${depth}px)` }}
          aria-hidden="true"
        />
      ))}
      <CardFront opacity={frontOpacity} />
      <CardBack opacity={backOpacity} />
    </div>
  );
}

export function BoovExperience() {
  const cardSceneRef = useRef<HTMLElement>(null);
  const [showBack, setShowBack] = useState(false);
  const [wordmarkSettled, setWordmarkSettled] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: cardSceneRef,
    offset: ["start start", "end end"],
  });

  const cardY = useTransform(scrollYProgress, [0, 0.19, 0.82, 1], ["50vh", "0vh", "0vh", "-4vh"]);
  const cardScale = useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [0.7, 1, 1.04, 0.96]);
  const cardOpacity = useTransform(scrollYProgress, [0, 0.1, 0.18, 1], [0, 0.72, 1, 1]);
  const cardRotateX = useTransform(scrollYProgress, [0, 0.2, 0.58, 1], [24, -4, 3, -2]);
  const cardRotateY = useTransform(scrollYProgress, (progress) => {
    if (progress <= 0.2) return -28 + (progress / 0.2) * 14;
    if (progress < 0.5) return -14 + ((progress - 0.2) / 0.3) * 103;
    return -89 + ((progress - 0.5) / 0.5) * 95;
  });
  const titleOpacity = useTransform(scrollYProgress, [0, 0.13, 0.4, 0.78, 1], [0.12, 0.72, 0.3, 0.7, 0.28]);
  const spotlightOpacity = useTransform(scrollYProgress, [0, 0.16, 0.5, 1], [0.2, 0.8, 1, 0.72]);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const nextShowBack = progress >= 0.5;
    setShowBack((current) => (current === nextShowBack ? current : nextShowBack));
  });

  const cardMotion = prefersReducedMotion
    ? { opacity: 1, y: 0, scale: 1, rotateX: -3, rotateY: -12 }
    : {
        opacity: cardOpacity,
        y: cardY,
        scale: cardScale,
        rotateX: cardRotateX,
        rotateY: cardRotateY,
      };

  return (
    <main className={styles.experience}>
      <section className={styles.hero} aria-labelledby="boov-heading">
        <div className={styles.pastelWash} aria-hidden="true" />
        {prefersReducedMotion ? (
          <h1 id="boov-heading">BOOV</h1>
        ) : (
          <>
            <h1 id="boov-heading" className={styles.srOnly}>
              BOOV
            </h1>
            <div className={styles.heroMorphWrap} aria-hidden="true">
              <MorphingText
                texts={HERO_WORDS}
                entrance={HERO_ENTRANCE_SECONDS}
                hold={HERO_HOLD_SECONDS}
                loop={false}
                onComplete={() => setWordmarkSettled(true)}
                className={`${styles.heroMorph} ${wordmarkSettled ? styles.heroMorphSettled : ""}`}
              />
            </div>
          </>
        )}
        <p>THE FIRST-EVER TECHNOLOGY BUILT FOR THE UNHOUSED</p>
        <span className={styles.heroTransition} aria-hidden="true" />
      </section>

      <section id="tap-to-pay" ref={cardSceneRef} className={styles.cardScene} aria-labelledby="tap-heading">
        <div className={styles.stickyStage}>
          <motion.div className={styles.spotlightBeam} style={{ opacity: prefersReducedMotion ? 0.9 : spotlightOpacity }} aria-hidden="true" />
          <div className={styles.spotlightPool} aria-hidden="true" />
          <div className={styles.stageVignette} aria-hidden="true" />

          <motion.div className={styles.stageTitle} style={{ opacity: prefersReducedMotion ? 0.42 : titleOpacity }}>
            <p>BOOV ESSENTIALS</p>
            <h2 id="tap-heading">tap to pay</h2>
          </motion.div>

          <div className={styles.cardPerspective}>
            <motion.div className={styles.cardMotion} style={cardMotion}>
              <MemberCard
                frontOpacity={prefersReducedMotion || !showBack ? 1 : 0}
                backOpacity={!prefersReducedMotion && showBack ? 1 : 0}
              />
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
