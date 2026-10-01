"use client";

import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";
import { CTA_COPY, PLACEHOLDER_IMAGES } from "@/content/homepage";
import { gsap } from "@/lib/gsap";
import { AnimatedText } from "./AnimatedText";
import { BoovCharacter } from "./boov/BoovCharacter";
import { BoovReserve } from "./boov/BoovReserve";
import styles from "./CtaWaitlist.module.css";

export function CtaWaitlist() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  // Parallax the background image only — copy and form never move.
  useGSAP(
    () => {
      if (prefersReducedMotion || !bgRef.current) return;
      gsap.to(bgRef.current, {
        yPercent: 12,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion] },
  );

  // No backend yet: client-side validation + local success state only.
  // TODO: wire to a real waitlist endpoint before launch.
  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!valid) {
      setError(true);
      return;
    }
    setError(false);
    setSubmitted(true);
  };

  return (
    <section id="join" ref={sectionRef} className={styles.section} aria-label="Join the waitlist">
      <div ref={bgRef} className={styles.bg} aria-hidden="true">
        <Image
          src={PLACEHOLDER_IMAGES.cta.src}
          alt=""
          fill
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.inner}>
        <p className={styles.kicker}>{CTA_COPY.kicker}</p>
        <AnimatedText as="h2" text={CTA_COPY.headline} className={styles.headline} stagger={0.05} />
        <p className={styles.lead}>{CTA_COPY.lead}</p>

        {submitted ? (
          <div className={styles.successWrap}>
            <BoovCharacter size={88} blush />
            <p className={styles.success} role="status">
              {CTA_COPY.success}
            </p>
          </div>
        ) : (
          <form className={styles.form} onSubmit={onSubmit} noValidate>
            <div className={styles.field}>
              <label htmlFor="waitlist-email" className={styles.srOnly}>
                Email address
              </label>
              <input
                id="waitlist-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                className={`${styles.input} ${error ? styles.inputError : ""}`}
                placeholder={CTA_COPY.placeholder}
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) setError(false);
                }}
                aria-invalid={error}
              />
              {/* Boov IS the submit control: he crawls in from the screen edge
                  ("touch me!"), stands on the slot ("click me!"), and clicking
                  him reserves the spot. */}
              <BoovReserve armRef={sectionRef} />
            </div>
            {error && <p className={styles.errorText}>Enter a valid email address.</p>}
          </form>
        )}
      </div>
    </section>
  );
}
