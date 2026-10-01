"use client";

import { useGSAP } from "@gsap/react";
import { motion, useMotionTemplate, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionStyle, type MotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FLOW_STEPS } from "@/content/homepage";
import { gsap } from "@/lib/gsap";
import styles from "./BoovExperience.module.css";

const EDGE_LAYERS = Array.from({ length: 17 }, (_, index) => index - 8);

// Scroll-progress boundaries mapped to the card animation's own keyframes:
// tap (settle in) → allocate (spin) → spend (front→back crossfade at 0.5) → verify (rest).
const STEP_BOUNDS = [0.19, 0.5, 0.82];

function stepIndexForProgress(progress: number) {
  if (progress < STEP_BOUNDS[0]) return 0;
  if (progress < STEP_BOUNDS[1]) return 1;
  if (progress < STEP_BOUNDS[2]) return 2;
  return 3;
}

function FlowRail({
  scrollYProgress,
  staticActive,
}: {
  scrollYProgress: MotionValue<number>;
  staticActive: boolean;
}) {
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const next = stepIndexForProgress(progress);
    setActive((current) => (current === next ? current : next));
  });

  return (
    <div className={styles.flowRailWrap}>
      <ol className={styles.flowRail} aria-label="How Boov works">
        {FLOW_STEPS.map((step, index) => {
          const isActive = staticActive || index === active;
          return (
            <li
              key={step.key}
              className={`${styles.flowStep} ${isActive ? styles.flowStepActive : ""}`}
            >
              <span className={styles.flowIndex}>{step.index}</span>
              <span className={styles.flowLabel}>{step.label}</span>
            </li>
          );
        })}
      </ol>
      <p className={styles.flowDesc}>
        {staticActive
          ? "Tap to give, allocate to a card, spend at approved merchants, verify every transaction."
          : FLOW_STEPS[active].description}
      </p>
    </div>
  );
}

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

function HeroIntro({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const heroRef = useRef<HTMLElement>(null);
  const wordRef = useRef<HTMLHeadingElement>(null);
  const letters = "BOOV".split("");

  // Kinetic entrance: letters rise out of a mask after the preloader lifts.
  useGSAP(
    () => {
      const targets = gsap.utils.toArray<HTMLElement>(`.${styles.heroLetterInner}`, heroRef.current);
      const extras = gsap.utils.toArray<HTMLElement>(
        [`.${styles.heroTagline}`, `.${styles.heroCue}`],
        heroRef.current,
      );
      if (!targets.length) return;
      if (prefersReducedMotion) {
        gsap.set([...targets, ...extras], { clearProps: "all" });
        return;
      }
      gsap.set(targets, { yPercent: 120 });
      gsap.set(extras, { opacity: 0, y: 20 });

      // Start after the preloader signals done, or after a fixed fallback delay
      // so the reveal is guaranteed even if the event is missed.
      const flag = (window as typeof window & { __boovLoaded?: boolean }).__boovLoaded;
      const delay = flag ? 0.1 : 3.4;
      const tl = gsap.timeline({ delay });
      tl.to(targets, { yPercent: 0, duration: 1.1, ease: "power4.out", stagger: 0.08 }).to(
        extras,
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.12 },
        "-=0.5",
      );
    },
    { scope: heroRef, dependencies: [prefersReducedMotion] },
  );

  // Mouse parallax on the wordmark.
  useEffect(() => {
    if (prefersReducedMotion) return;
    const word = wordRef.current;
    if (!word) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const xTo = gsap.quickTo(word, "x", { duration: 0.8, ease: "power3.out" });
    const yTo = gsap.quickTo(word, "y", { duration: 0.8, ease: "power3.out" });
    const rTo = gsap.quickTo(word, "rotationY", { duration: 0.8, ease: "power3.out" });
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX / window.innerWidth - 0.5;
      const dy = e.clientY / window.innerHeight - 0.5;
      xTo(dx * 40);
      yTo(dy * 24);
      rTo(dx * 10);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [prefersReducedMotion]);

  return (
    <section ref={heroRef} className={styles.hero} aria-labelledby="boov-heading">
      <div className={styles.pastelWash} aria-hidden="true" />
      <h1 id="boov-heading" className={styles.srOnly}>
        BOOV — The first-ever technology built for the unhoused
      </h1>
      <div ref={wordRef} className={styles.heroWord} aria-hidden="true">
        {letters.map((letter, i) => (
          <span key={i} className={styles.heroLetter}>
            <span className={styles.heroLetterInner}>{letter}</span>
          </span>
        ))}
      </div>
      <p className={styles.heroTagline}>THE FIRST-EVER TECHNOLOGY BUILT FOR THE UNHOUSED</p>
      <div className={styles.heroCue} aria-hidden="true">
        <span>Scroll</span>
        <i />
      </div>
      <span className={styles.heroTransition} aria-hidden="true" />
    </section>
  );
}

export function BoovExperience() {
  const cardSceneRef = useRef<HTMLElement>(null);
  const [showBack, setShowBack] = useState(false);
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

  // The stage starts dark and the spotlight builds the whole way down, rather
  // than peaking mid-scroll and fading out. The beam grows from its source
  // (transform-origin top) so it reads as light sweeping in, not a box scaling.
  const spotlightOpacity = useTransform(scrollYProgress, [0, 0.1, 0.4, 1], [0, 0.5, 0.85, 1]);
  const spotlightScaleY = useTransform(scrollYProgress, [0, 0.35, 1], [0.72, 0.95, 1.06]);
  const spotlightScaleX = useTransform(scrollYProgress, [0, 0.5, 1], [0.84, 1, 1.05]);
  // How far down the cone the light has travelled — this makes the beam arrive
  // rather than appear. Range retuned for the rebuilt stage geometry (the beam
  // now starts at top:-10%, so its head stops sit higher in the element).
  const beamRevealPct = useTransform(scrollYProgress, [0, 0.6], [40, 140], { clamp: true });
  // The pool only lands once the beam has nearly reached the floor.
  const poolOpacity = useTransform(scrollYProgress, [0, 0.3, 0.62, 1], [0, 0.12, 0.72, 1]);
  const poolScale = useTransform(scrollYProgress, [0, 0.62, 1], [0.62, 0.96, 1.08]);
  // Edges close in as the beam brightens. Floor raised from the pre-rebuild
  // 0.32: the stage is now translucent over the warm WebGL wash, and the scene
  // should open dark.
  const vignetteOpacity = useTransform(scrollYProgress, [0, 0.3, 1], [0.5, 0.75, 1]);

  // Built as motion templates rather than individual x/scale props: mixing
  // static numbers with motion values makes framer diff and tween them, which
  // lags the scroll instead of tracking it — and framer's own transform would
  // silently drop the CSS centring these elements rely on.
  const beamTransform = useMotionTemplate`translateX(-50%) scaleX(${spotlightScaleX}) scaleY(${spotlightScaleY})`;
  const poolTransform = useMotionTemplate`translate(-50%, -50%) rotateX(64deg) scale(${poolScale})`;
  const beamReveal = useMotionTemplate`${beamRevealPct}%`;

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
      <HeroIntro prefersReducedMotion={Boolean(prefersReducedMotion)} />

      <section id="tap-to-pay" ref={cardSceneRef} className={styles.cardScene} aria-labelledby="tap-heading">
        <div className={styles.stickyStage}>
          <motion.div
            className={styles.spotlightBeam}
            style={
              // Cast: MotionStyle has no index signature for CSS custom
              // properties, but framer applies them fine at runtime.
              (prefersReducedMotion
                ? { opacity: 0.9 }
                : {
                    opacity: spotlightOpacity,
                    transform: beamTransform,
                    transformOrigin: "50% 0%",
                    "--beam-reveal": beamReveal,
                  }) as MotionStyle
            }
            transition={{ duration: 0 }}
            aria-hidden="true"
          />
          <motion.div
            className={styles.spotlightPool}
            style={
              prefersReducedMotion
                ? { opacity: 0.85 }
                : { opacity: poolOpacity, transform: poolTransform }
            }
            transition={{ duration: 0 }}
            aria-hidden="true"
          />
          <motion.div
            className={styles.stageVignette}
            style={{ opacity: prefersReducedMotion ? 0.85 : vignetteOpacity }}
            transition={{ duration: 0 }}
            aria-hidden="true"
          />

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

          <FlowRail scrollYProgress={scrollYProgress} staticActive={Boolean(prefersReducedMotion)} />
        </div>
      </section>
    </main>
  );
}
