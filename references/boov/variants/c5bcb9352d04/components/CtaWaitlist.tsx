"use client";

import { useState } from "react";
import { CTA_COPY } from "@/content/homepage";
import { useMagnetic } from "@/lib/hooks/useMagnetic";
import { AnimatedText } from "./AnimatedText";
import styles from "./CtaWaitlist.module.css";

export function CtaWaitlist() {
  const submitRef = useMagnetic<HTMLButtonElement>();

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

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
    <section id="join" className={styles.section} aria-label="Join the waitlist">
      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.inner}>
        <AnimatedText as="h2" text={CTA_COPY.headline} className={styles.headline} stagger={0.05} />

        {submitted ? (
          <p className={styles.success} role="status">
            {CTA_COPY.success}
          </p>
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
              <button
                ref={submitRef}
                type="submit"
                className={styles.submit}
                data-cursor
                data-cursor-label="Send"
              >
                {CTA_COPY.ctaLabel}
              </button>
            </div>
            {error && <p className={styles.errorText}>Enter a valid email address.</p>}
          </form>
        )}
      </div>
    </section>
  );
}
