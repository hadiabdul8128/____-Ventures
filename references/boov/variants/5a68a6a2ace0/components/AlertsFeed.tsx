"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { AnimatedList } from "@/components/ui/animated-list";
import { ALERTS, type AlertItem } from "@/content/alerts";
import { useScrollReveal } from "@/lib/hooks/useScrollReveal";
import styles from "./AlertsFeed.module.css";

/** Interval between feed entries appearing, and the AnimatedList reveal delay. */
const FEED_DELAY_MS = 1400;
/** Pause after the last entry before the feed re-keys and restarts. */
const RESTART_BUFFER_MS = 2400;

function pad3(n: number) {
  return String(n).padStart(3, "0");
}

function AlertCard({ alert }: { alert: AlertItem }) {
  return (
    <article className={styles.card}>
      <span className={styles.glyph} aria-hidden="true">
        {alert.glyph}
      </span>
      <div className={styles.cardBody}>
        <p className={styles.cardTitle}>{alert.title}</p>
        <p className={styles.cardDesc}>{alert.description}</p>
        {alert.verified && (
          <p className={styles.verified}>
            <span className={styles.verifiedTick} aria-hidden="true" />
            Verified
          </p>
        )}
      </div>
      <div className={styles.cardMeta}>
        <span className={styles.amount}>{alert.amount}</span>
        <span className={styles.time}>{alert.time}</span>
      </div>
    </article>
  );
}

/**
 * "What members see on the street": left, editorial copy with a live monospace
 * feed-index readout; right, a phone drawn as a technical schematic containing
 * the looping AnimatedList ledger. Under prefers-reduced-motion the full list
 * renders statically and nothing cycles.
 */
export function AlertsFeed() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // `cycle` re-keys the AnimatedList so the feed restarts forever; `shown`
  // mirrors its reveal cadence to drive the FEED nnn / nnn readout. `paused`
  // is the WCAG 2.2.2 stop mechanism for the auto-updating feed — while set,
  // the timers are torn down and the list holds its current frame.
  const [cycle, setCycle] = useState(0);
  const [shown, setShown] = useState(1);
  const [paused, setPaused] = useState(false);

  useScrollReveal(sectionRef, { selector: `.${styles.reveal}`, stagger: 0.08, y: 18 });

  useEffect(() => {
    if (prefersReducedMotion || paused) return;
    const tick = window.setInterval(() => {
      setShown((n) => Math.min(n + 1, ALERTS.length));
    }, FEED_DELAY_MS);
    const restart = window.setTimeout(() => {
      setShown(1);
      setCycle((c) => c + 1);
    }, ALERTS.length * FEED_DELAY_MS + RESTART_BUFFER_MS);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(restart);
    };
  }, [cycle, paused, prefersReducedMotion]);

  const displayCount = prefersReducedMotion ? ALERTS.length : shown;
  const cycling = !prefersReducedMotion;

  // Resuming restarts the cycle from the top: AnimatedList unmounts while
  // held, so its internal reveal would restart at item 1 regardless — keep the
  // readout honest by restarting both together.
  const togglePaused = () => {
    if (paused) {
      setShown(1);
      setCycle((c) => c + 1);
    }
    setPaused((p) => !p);
  };

  return (
    <div ref={sectionRef} className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={`${styles.kicker} ${styles.reveal}`}>03 — What the card reports</p>

          {/* h2: this section is a chapter of the home story, whose h1 is the
              hero wordmark. */}
          <h2 id="alerts-heading" className={`${styles.headline} ${styles.reveal}`}>
            <span className={styles.headlineLine}>Every dollar</span>
            <span className={styles.headlineLine}>reports back.</span>
          </h2>

          <p className={`${styles.lead} ${styles.reveal}`}>
            The card doesn&rsquo;t just spend — it talks. No dashboards to request,
            no quarterly summaries: each entry below is what a member&rsquo;s device
            shows the moment money moves — allocated, spent, and checked against
            the merchant record.
          </p>

          <p className={`${styles.readout} ${styles.reveal}`} aria-live="off">
            <span
              className={`${styles.liveDot} ${paused ? styles.liveDotHeld : ""}`}
              aria-hidden="true"
            />
            FEED&nbsp;{pad3(displayCount)}&nbsp;/&nbsp;{pad3(ALERTS.length)}&nbsp;·&nbsp;
            {paused ? "HELD" : "LIVE"}
          </p>

          {cycling && (
            <button
              type="button"
              className={`${styles.pauseBtn} ${styles.reveal}`}
              onClick={togglePaused}
              aria-pressed={paused}
            >
              {paused ? "RESUME FEED" : "HOLD FEED"}
            </button>
          )}
        </div>

        <div className={`${styles.stage} ${styles.reveal}`}>
          <div className={styles.phoneWrap}>
            <span className={`${styles.tick} ${styles.tickTL}`} aria-hidden="true" />
            <span className={`${styles.tick} ${styles.tickTR}`} aria-hidden="true" />
            <span className={`${styles.tick} ${styles.tickBL}`} aria-hidden="true" />
            <span className={`${styles.tick} ${styles.tickBR}`} aria-hidden="true" />

            <div className={styles.phone}>
              <span className={styles.speaker} aria-hidden="true" />
              <div className={styles.screen}>
                <div className={styles.screenHead} aria-hidden="true">
                  <span>Boov · Feed</span>
                  <span>v2.0</span>
                </div>
                <div className={styles.listViewport}>
                  {prefersReducedMotion ? (
                    <div className={styles.staticList}>
                      {ALERTS.map((alert) => (
                        <AlertCard key={alert.key} alert={alert} />
                      ))}
                    </div>
                  ) : paused ? (
                    // AnimatedList runs its own internal timers, so a true hold
                    // swaps in a static snapshot of the entries revealed so far
                    // (newest first, matching the list's own order).
                    <div className={styles.staticList}>
                      {ALERTS.slice(0, shown)
                        .slice()
                        .reverse()
                        .map((alert) => (
                          <AlertCard key={alert.key} alert={alert} />
                        ))}
                    </div>
                  ) : (
                    <AnimatedList key={cycle} className={styles.list} delay={FEED_DELAY_MS}>
                      {ALERTS.map((alert) => (
                        <AlertCard key={alert.key} alert={alert} />
                      ))}
                    </AnimatedList>
                  )}
                </div>
              </div>
            </div>

            <div className={`${styles.callout} ${styles.calloutAntenna}`} aria-hidden="true">
              <span className={styles.calloutLine} />
              <span className={styles.calloutLabel}>Mesh antenna</span>
            </div>
            <div className={`${styles.callout} ${styles.calloutEink}`} aria-hidden="true">
              <span className={styles.calloutLabel}>E-ink 4.2</span>
              <span className={styles.calloutLine} />
            </div>
            <div className={`${styles.callout} ${styles.calloutFeed}`} aria-hidden="true">
              <span className={styles.calloutLine} />
              <span className={styles.calloutLabel}>Feed v2</span>
            </div>
          </div>

          <p className={styles.stageCaption} aria-hidden="true">
            FIG. 03 — MEMBER DEVICE · LEDGER FEED
          </p>
        </div>
      </div>
    </div>
  );
}
