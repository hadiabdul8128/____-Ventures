"use client";

import { useGSAP } from "@gsap/react";
import { motion, useMotionTemplate, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionStyle, type MotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { MorphingText } from "@/components/ui/morphing-text";
import { FLOW_STEPS } from "@/content/homepage";
import { gsap } from "@/lib/gsap";
import { useLenis } from "@/lib/SmoothScroll";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import InteractiveGrid from "@/components/ui/interactive-grid";
import styles from "./BoovExperience.module.css";

const EDGE_LAYERS = Array.from({ length: 17 }, (_, index) => index - 8);
const HERO_WORDS = ["Tap To\nChange", "BOOV"];
const HERO_ENTRANCE_SECONDS = 0.53;
const HERO_HOLD_SECONDS = 0.43;
const HERO_SETTLE_MILLISECONDS = 360;

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
  onSelect,
  reducedMotion,
}: {
  scrollYProgress: MotionValue<number>;
  onSelect: (index: number) => void;
  reducedMotion: boolean;
}) {
  const [active, setActive] = useState(0);
  const [spin, setSpin] = useState({ index: -1, nonce: 0 });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const next = stepIndexForProgress(progress);
    setActive((current) => (current === next ? current : next));
  });

  const handleSelect = (index: number) => {
    setActive(index);
    setSpin((current) => ({ index, nonce: current.nonce + 1 }));
    onSelect(index);
  };

  return (
    <div className={styles.flowRailWrap}>
      <ol className={styles.flowRail} aria-label="How Boov works">
        {FLOW_STEPS.map((step, index) => {
          const isActive = index === active;
          return (
            <li
              key={step.key}
              className={`${styles.flowStep} ${isActive ? styles.flowStepActive : ""}`}
            >
              <motion.button
                type="button"
                className={styles.flowButton}
                onClick={() => handleSelect(index)}
                aria-current={isActive ? "step" : undefined}
                aria-label={`${step.index}. ${step.label}: ${step.description}`}
                data-cursor
                data-cursor-label={`Show ${step.label}`}
                whileTap={reducedMotion ? undefined : { scale: 0.95 }}
              >
                <motion.span
                  key={spin.index === index ? `${step.key}-${spin.nonce}` : step.key}
                  className={styles.flowIndex}
                  initial={spin.index === index && !reducedMotion ? { rotate: -360, scale: 0.72 } : false}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ duration: reducedMotion ? 0 : 0.62, ease: [0.16, 1, 0.3, 1] }}
                  aria-hidden="true"
                >
                  {step.index}
                </motion.span>
                <span className={styles.flowLabel}>{step.label}</span>
              </motion.button>
            </li>
          );
        })}
      </ol>
      <p className={styles.flowDesc}>
        {FLOW_STEPS[active].description}
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
    <div className={`${styles.cardFace} ${styles.cardFront} boov-card-edge`} style={{ opacity }} aria-hidden="true">
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
        // No rim here: this face is an <img>, and replaced elements do not
        // render ::after, so the class would silently do nothing.
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
  const wordRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const [introReady, setIntroReady] = useState(prefersReducedMotion);
  const [wordmarkSettled, setWordmarkSettled] = useState(prefersReducedMotion);
  const [introComplete, setIntroComplete] = useState(prefersReducedMotion);
  const [interactiveWord, setInteractiveWord] = useState(
    prefersReducedMotion ? "BOOV" : HERO_WORDS[0],
  );

  // The cue's job: hand the locked intro over to the story.
  const jumpToCard = () => {
    const target = document.getElementById("tap-to-pay");
    if (!target) return;
    if (lenis) lenis.scrollTo(target);
    else target.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (prefersReducedMotion) {
      setIntroReady(true);
      setWordmarkSettled(true);
      setIntroComplete(true);
      return;
    }

    const loadState = window as typeof window & { __boovLoaded?: boolean };
    if (loadState.__boovLoaded) {
      setIntroReady(true);
      return;
    }

    const reveal = () => setIntroReady(true);
    window.addEventListener("boov:loaded", reveal, { once: true });
    return () => window.removeEventListener("boov:loaded", reveal);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion || !wordmarkSettled) return;

    const timeout = window.setTimeout(() => {
      setIntroComplete(true);
      window.dispatchEvent(new Event("boov:intro-complete"));
    }, HERO_SETTLE_MILLISECONDS);

    return () => window.clearTimeout(timeout);
  }, [prefersReducedMotion, wordmarkSettled]);

  // Lock every native scroll path while the opening wordmark resolves. The
  // preloader controls body overflow, so the longer hero lock lives on html.
  useEffect(() => {
    if (prefersReducedMotion || introComplete) return;

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    const previousOverscroll = root.style.overscrollBehavior;
    const blockedKeys = new Set(["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "]);
    const preventScroll = (event: Event) => event.preventDefault();
    const preventScrollKey = (event: KeyboardEvent) => {
      if (blockedKeys.has(event.key)) event.preventDefault();
    };

    root.style.overflow = "hidden";
    root.style.overscrollBehavior = "none";
    window.scrollTo(0, 0);
    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });
    window.addEventListener("keydown", preventScrollKey);

    return () => {
      root.style.overflow = previousOverflow;
      root.style.overscrollBehavior = previousOverscroll;
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("keydown", preventScrollKey);
    };
  }, [introComplete, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion || introComplete || !lenis) return;

    lenis.scrollTo(0, { immediate: true, force: true });
    lenis.stop();
    return () => {
      lenis.scrollTo(0, { immediate: true, force: true });
      lenis.start();
    };
  }, [introComplete, lenis, prefersReducedMotion]);

  // Keep the supporting tagline hidden until the preloader hands off.
  useGSAP(
    () => {
      const tagline = heroRef.current?.querySelector<HTMLElement>(`.${styles.heroTagline}`);
      if (!tagline) return;
      if (prefersReducedMotion) {
        gsap.set(tagline, { clearProps: "all" });
        return;
      }
      gsap.set(tagline, { opacity: 0, y: 20 });
      if (!introReady) return;
      gsap.to(tagline, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: 0.35,
        ease: "power3.out",
      });
    },
    { scope: heroRef, dependencies: [introReady, prefersReducedMotion] },
  );

  // The scroll cue is the visual handoff from a locked intro to the page.
  useGSAP(
    () => {
      const cue = heroRef.current?.querySelector<HTMLElement>(`.${styles.heroCue}`);
      const line = cue?.querySelector<HTMLElement>("i");
      if (!cue) return;
      if (prefersReducedMotion) {
        gsap.set([cue, line], { clearProps: "all" });
        return;
      }

      gsap.set(cue, { opacity: 0, y: 14 });
      if (line) gsap.set(line, { opacity: 0, scaleY: 0, transformOrigin: "50% 0%" });
      if (!introComplete) return;

      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      timeline.to(cue, { opacity: 1, y: 0, duration: 0.55 });
      if (line) timeline.to(line, { opacity: 1, scaleY: 1, duration: 0.42 }, "-=0.3");
    },
    { scope: heroRef, dependencies: [introComplete, prefersReducedMotion] },
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
        Tap To Change. BOOV - The first-ever technology built for the unhoused
      </h1>
      <div ref={wordRef} className={styles.heroWord} aria-hidden="true">
        <InteractiveGrid
          className={styles.heroInteractiveWord}
          text={interactiveWord}
          dotSize={7}
          gap={10}
          baseColor="#b8a7e8"
          activeColor="#fff8f2"
          proximity={132}
          shockRadius={220}
          shockStrength={7}
          localizedReveal
          revealRadius={27}
          revealFeather={2}
          active={introReady && !prefersReducedMotion}
          reducedMotion={Boolean(prefersReducedMotion)}
        >
          {prefersReducedMotion ? (
            <span className={`${styles.heroMorph} ${styles.heroMorphSettled}`}>BOOV</span>
          ) : introReady ? (
            <MorphingText
              texts={HERO_WORDS}
              entrance={HERO_ENTRANCE_SECONDS}
              hold={HERO_HOLD_SECONDS}
              loop={false}
              onComplete={() => setWordmarkSettled(true)}
              onActiveTextChange={setInteractiveWord}
              className={`${styles.heroMorph} ${wordmarkSettled ? styles.heroMorphSettled : ""}`}
            />
          ) : null}
        </InteractiveGrid>
      </div>
      <p className={styles.heroTagline}>THE FIRST-EVER TECHNOLOGY BUILT FOR THE UNHOUSED</p>
      <div className={`${styles.heroCue} ${introComplete ? styles.heroCueReady : ""}`}>
        {/* Was decorative text; now a real control — the hover-reveal arrow
            reads as "onward" and gives the intro an actual way out. */}
        <InteractiveHoverButton
          className={styles.heroCueButton}
          onClick={jumpToCard}
          tabIndex={introComplete ? 0 : -1}
          data-cursor
          data-cursor-label="Begin"
        >
          See it work
        </InteractiveHoverButton>
        <i aria-hidden="true" />
      </div>
      <span className={styles.heroTransition} aria-hidden="true" />
    </section>
  );
}

export function BoovExperience() {
  const cardSceneRef = useRef<HTMLElement>(null);
  const [showBack, setShowBack] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const lenis = useLenis();
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
  // How far down the cone the light has travelled - this makes the beam arrive
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
  // lags the scroll instead of tracking it - and framer's own transform would
  // silently drop the CSS centring these elements rely on.
  const beamTransform = useMotionTemplate`translateX(-50%) scaleX(${spotlightScaleX}) scaleY(${spotlightScaleY})`;
  const poolTransform = useMotionTemplate`translate(-50%, -50%) rotateX(64deg) scale(${poolScale})`;
  const beamReveal = useMotionTemplate`${beamRevealPct}%`;

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const nextShowBack = progress >= 0.5;
    setShowBack((current) => (current === nextShowBack ? current : nextShowBack));
    document.documentElement.dataset.cardSceneActive = progress > 0.01 && progress < 0.99
      ? "true"
      : "false";
  });

  useEffect(
    () => () => {
      delete document.documentElement.dataset.cardSceneActive;
    },
    [],
  );

  const cardMotion = prefersReducedMotion
    ? { opacity: 1, y: 0, scale: 1, rotateX: -3, rotateY: -12 }
    : {
        opacity: cardOpacity,
        y: cardY,
        scale: cardScale,
        rotateX: cardRotateX,
        rotateY: cardRotateY,
      };

  const handleFlowSelect = (index: number) => {
    const section = cardSceneRef.current;
    if (!section) return;

    const stepTargets = [0.1, 0.34, 0.66, 0.91];
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const scrollDistance = Math.max(0, section.offsetHeight - window.innerHeight);
    const target = sectionTop + scrollDistance * stepTargets[index];

    if (prefersReducedMotion) {
      window.scrollTo({ top: target, behavior: "auto" });
      return;
    }

    if (lenis) {
      lenis.scrollTo(target, {
        duration: 1.05,
        easing: (value) => 1 - Math.pow(1 - value, 4),
      });
      return;
    }

    window.scrollTo({ top: target, behavior: "smooth" });
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

          <FlowRail
            scrollYProgress={scrollYProgress}
            onSelect={handleFlowSelect}
            reducedMotion={Boolean(prefersReducedMotion)}
          />
        </div>
      </section>
    </main>
  );
}
