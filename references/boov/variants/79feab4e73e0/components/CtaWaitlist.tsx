"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { CTA_COPY } from "@/content/homepage";
import { BoovReserve } from "./boov/BoovReserve";
import styles from "./CtaWaitlist.module.css";

type HandoffPhase = "rest" | "approach" | "handoff" | "ready";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function CardFront() {
  return (
    <div className={`${styles.cardFace} ${styles.cardFront} boov-card-edge`} aria-hidden="true">
      <span className={styles.cardRibbon} />
      <div className={styles.cardTopline}>
        <span className={styles.cardWordmark}>boov</span>
        <span className={styles.contactless}>
          <i />
          <i />
          <i />
        </span>
      </div>
      <span className={styles.cardChip} />
      <div className={styles.cardBottomline}>
        <span>tap to support</span>
        <strong>BOOV MEMBER</strong>
        <span>essentials card</span>
      </div>
    </div>
  );
}

export function CtaWaitlist() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const [phase, setPhase] = useState<HandoffPhase>("rest");
  const [sectionActive, setSectionActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 640px)");
    const updateMobileState = () => setIsMobile(mobileQuery.matches);

    updateMobileState();
    mobileQuery.addEventListener("change", updateMobileState);
    return () => mobileQuery.removeEventListener("change", updateMobileState);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const cardX = useTransform(scrollYProgress, [0, 0.18, 0.42, 1], [-150, -150, 0, 0]);
  const cardY = useTransform(
    scrollYProgress,
    [0, 0.18, 0.42, 1],
    isMobile ? [30, 30, 8, 8] : [30, 30, -28, -28],
  );
  const cardScale = useTransform(scrollYProgress, [0, 0.18, 0.42, 1], [0.7, 0.7, 1, 1]);
  const flipStart = isMobile ? 0.38 : 0.42;
  const flipEnd = isMobile ? 0.64 : 0.72;
  const cardRotateY = useTransform(
    scrollYProgress,
    [0, flipStart, flipEnd, 1],
    [0, 0, 180, 180],
  );

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (prefersReducedMotion) {
      setPhase("ready");
      return;
    }

    const nextPhase: HandoffPhase = progress < 0.18
      ? "approach"
      : progress < flipEnd
        ? "handoff"
        : "ready";
    setPhase((current) => current === nextPhase ? current : nextPhase);
  });

  useEffect(() => {
    if (prefersReducedMotion) setPhase("ready");
  }, [prefersReducedMotion]);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const announceHandoff = (active: boolean) => {
      window.dispatchEvent(new CustomEvent("boov:handoff", { detail: { active } }));
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        const active = entry.isIntersecting;
        setSectionActive(active);
        announceHandoff(active);
      },
      { threshold: 0.3, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(stage);
    return () => {
      observer.disconnect();
      announceHandoff(false);
    };
  }, []);

  const validateEmail = () => {
    const valid = EMAIL_PATTERN.test(email.trim());
    setError(email.length > 0 && !valid);
    return valid;
  };

  // No backend yet: client-side validation + local success state only.
  // TODO: wire to a real updates endpoint before launch.
  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError(true);
      return;
    }
    setError(false);
    setSubmitted(true);
  };

  const formAvailable = phase === "ready";

  return (
    <section
      id="join"
      ref={sectionRef}
      className={styles.section}
      aria-label="Get Boov launch updates"
      data-active={sectionActive || undefined}
      data-celebrating={submitted || undefined}
    >
      <div className={styles.scrim} aria-hidden="true" />
      <div className={styles.ripples} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className={styles.inner}>
        <div className={styles.copy}>
          <h2 className={styles.headline} aria-label={CTA_COPY.headline}>
            <span aria-hidden="true">Help put the first</span>
            <span aria-hidden="true">Boov cards in motion.</span>
          </h2>
        </div>

        <div ref={stageRef} className={styles.handoffStage}>
          <motion.div
            className={styles.localBoov}
            aria-hidden="true"
            initial={false}
            animate={
              sectionActive
                ? { opacity: 1, x: 0, y: submitted ? -10 : 0, rotate: submitted ? -4 : 0 }
                : { opacity: 0, x: 220, y: 70, rotate: 8 }
            }
            transition={{ duration: prefersReducedMotion ? 0 : 1.05, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className={styles.boovSpeech}
              initial={false}
              animate={{ opacity: phase === "handoff" ? 1 : 0, y: phase === "handoff" ? 0 : 8 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
            >
              your turn.
            </motion.div>
            <motion.div
              className={styles.boovImageWrap}
              animate={
                submitted && !prefersReducedMotion
                  ? { y: [0, -18, -4, -14, 0], rotate: [0, -5, 6, -4, 0], scale: [1, 1.04, 1, 1.03, 1] }
                  : { y: 0, rotate: 0, scale: 1 }
              }
              transition={{ duration: 0.92, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                className={styles.boovImage}
                src="/boov-home-companion.png"
                alt=""
                width={360}
                height={360}
                sizes="(max-width: 720px) 132px, 210px"
              />
            </motion.div>
          </motion.div>

          <div className={styles.cardScene}>
            <motion.div
              className={styles.flipCardMotion}
              style={prefersReducedMotion
                ? { x: 0, y: 0, scale: 1, rotateY: 180 }
                : { x: cardX, y: cardY, scale: cardScale, rotateY: cardRotateY }}
            >
              <motion.div
                className={styles.flipCard}
                initial={false}
                animate={{ rotateY: submitted ? 720 : 0 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 1.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <CardFront />

                <div className={`${styles.cardFace} ${styles.cardBack} boov-card-edge`}>
                  <AnimatePresence mode="wait" initial={false}>
                    {submitted ? (
                      <motion.div
                        key="success"
                        className={styles.success}
                        role="status"
                        aria-live="polite"
                        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.94 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: prefersReducedMotion ? 0 : 0.35, delay: prefersReducedMotion ? 0 : 0.48 }}
                      >
                        <span className={styles.successMark}>
                          <Check aria-hidden="true" />
                        </span>
                        <div>
                          <strong>{CTA_COPY.successHeadline}</strong>
                          <p>{CTA_COPY.success}</p>
                        </div>
                        <span className={styles.launchStatus}>BOOV UPDATES · EARLY SUPPORTER</span>
                      </motion.div>
                    ) : (
                      <motion.form
                        key="form"
                        className={styles.form}
                        onSubmit={onSubmit}
                        noValidate
                        initial={false}
                        animate={{ opacity: formAvailable ? 1 : 0 }}
                        transition={{ duration: prefersReducedMotion ? 0 : 0.34 }}
                      >
                        <label htmlFor="updates-email" className={styles.label}>
                          {CTA_COPY.fieldLabel}
                        </label>
                        <div ref={fieldRef} className={`${styles.field} ${error ? styles.fieldError : ""}`}>
                          <input
                            id="updates-email"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            className={styles.input}
                            placeholder={CTA_COPY.placeholder}
                            value={email}
                            disabled={!formAvailable}
                            onBlur={validateEmail}
                            onChange={(event) => {
                              setEmail(event.target.value);
                              if (error) setError(false);
                            }}
                            aria-invalid={error}
                            aria-describedby={error ? "updates-email-error" : undefined}
                          />
                          {/* Boov is the submit control: once the handed-off
                              card settles ("ready"), he crawls across the field
                              to the slot - "touch me!" → "click me!" - and
                              clicking him reserves the spot. */}
                          <BoovReserve
                            armed={phase === "ready"}
                            originRef={fieldRef}
                            disabled={!formAvailable}
                            size={52}
                          />
                        </div>
                        <AnimatePresence initial={false}>
                          {error ? (
                            <motion.p
                              id="updates-email-error"
                              key="error"
                              className={styles.errorText}
                              role="alert"
                              initial={prefersReducedMotion ? false : { opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                            >
                              Enter a valid email address.
                            </motion.p>
                          ) : null}
                        </AnimatePresence>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
