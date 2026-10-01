"use client";

import Image from "next/image";
import { Pause, Play } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";
import { ALERTS } from "@/content/alerts";
import KineticGrid from "@/components/ui/kinetic-grid";
import { VapourScrollText } from "@/components/ui/vapour-scroll-text";
import styles from "./HorizontalChapterTransition.module.css";

const FEED_DELAY_MS = 1600;
const INITIAL_VISIBLE_ALERTS = 2;
const MAX_VISIBLE_ALERTS = 5;

export function HorizontalChapterTransition() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [shownAlerts, setShownAlerts] = useState(INITIAL_VISIBLE_ALERTS);
  const [feedPaused, setFeedPaused] = useState(false);
  const [reportActive, setReportActive] = useState(false);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothPointerX = useSpring(pointerX, { stiffness: 120, damping: 22, mass: 0.5 });
  const smoothPointerY = useSpring(pointerY, { stiffness: 120, damping: 22, mass: 0.5 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const trackX = useTransform(scrollYProgress, [0, 0.08, 0.92, 1], ["0vw", "0vw", "-100vw", "-100vw"]);
  const cardX = useTransform(scrollYProgress, [0, 0.72], ["0vw", "-12vw"]);
  const cardRotate = useTransform(scrollYProgress, [0, 0.72], [-4, 8]);
  const cardScale = useTransform(scrollYProgress, [0, 0.72], [1, 0.9]);
  const phoneX = useTransform(scrollYProgress, [0.28, 0.92], ["18vw", "0vw"]);
  const phoneRotate = useTransform(scrollYProgress, [0.28, 0.92], [4, -2]);
  const seamOpacity = useTransform(scrollYProgress, [0, 0.12, 0.5, 0.88, 1], [0, 0.45, 1, 0.45, 0]);
  const progressScale = useTransform(scrollYProgress, [0, 1], [0.02, 1]);
  const artifactTiltX = useTransform(smoothPointerY, [-1, 1], [5, -5]);
  const artifactTiltY = useTransform(smoothPointerX, [-1, 1], [-7, 7]);
  const phoneTiltX = useTransform(smoothPointerY, [-1, 1], [3, -3]);
  const phoneTiltY = useTransform(smoothPointerX, [-1, 1], [-5, 5]);

  useEffect(
    () => scrollYProgress.on("change", (latest) => {
      setReportActive(latest >= 0.48 && latest <= 1);
    }),
    [scrollYProgress],
  );

  useEffect(() => {
    if (reportActive) setShownAlerts(INITIAL_VISIBLE_ALERTS);
  }, [reportActive]);

  useEffect(() => {
    if (
      prefersReducedMotion ||
      feedPaused ||
      !reportActive ||
      shownAlerts >= ALERTS.length
    ) return;

    const timer = window.setTimeout(() => {
      setShownAlerts((count) => Math.min(count + 1, ALERTS.length));
    }, FEED_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [feedPaused, prefersReducedMotion, reportActive, shownAlerts]);

  const visibleAlerts = prefersReducedMotion
    ? ALERTS.slice(0, MAX_VISIBLE_ALERTS)
    : ALERTS.slice(Math.max(0, shownAlerts - MAX_VISIBLE_ALERTS), shownAlerts);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 2);
    pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 2);
  };

  const handlePointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      data-reduced-motion={prefersReducedMotion ? "true" : "false"}
      aria-label="How Boov verifies purchases and reports activity"
    >
      <div
        className={styles.stickyStage}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <motion.div
          className={styles.track}
          style={{ x: prefersReducedMotion ? "-100vw" : trackX }}
        >
          <div className={`${styles.panel} ${styles.cardPanel}`}>
            <KineticGrid
              className={styles.kineticPanel}
              tone="neutral"
              autoActivate
              rippleOnPointerDown={false}
            >
              <div className={styles.panelGrid}>
                <div className={styles.copy}>
                  <p className={styles.eyebrow}>01 / VERIFIED</p>
                  <VapourScrollText
                    className={styles.display}
                    lines={["The card", "checks in."]}
                    progress={scrollYProgress}
                    range={[0.08, 0.58]}
                    mode="vaporize"
                    direction="left-to-right"
                  />
                  <div className={styles.signalLine}>
                    <span />
                    <p>tap · allocate · spend · verify</p>
                  </div>
                </div>

                <motion.div
                  className={styles.cardArtifact}
                  style={
                    prefersReducedMotion
                      ? { x: 0, rotate: -3, scale: 0.96 }
                      : { x: cardX, rotate: cardRotate, scale: cardScale }
                  }
                >
                  <motion.div
                    className={styles.cardSurface}
                    style={prefersReducedMotion ? undefined : { rotateX: artifactTiltX, rotateY: artifactTiltY }}
                  >
                    <Image
                      src="/boov-card-back.svg"
                      alt=""
                      fill
                      sizes="(max-width: 700px) 82vw, 48vw"
                      priority={false}
                    />
                  </motion.div>
                </motion.div>
              </div>
            </KineticGrid>
          </div>

          <div className={`${styles.panel} ${styles.reportPanel}`}>
            <KineticGrid
              className={styles.kineticPanel}
              tone="neutral"
              autoActivate
              rippleOnPointerDown={false}
            >
              <div className={styles.panelGrid}>
                <div className={styles.copy}>
                  <p className={styles.eyebrow}>02 / REPORTS</p>
                  <VapourScrollText
                    className={styles.display}
                    lines={["Every dollar", "reports back."]}
                    progress={scrollYProgress}
                    range={[0.34, 0.86]}
                    mode="materialize"
                    direction="left-to-right"
                  />
                  <div className={styles.signalLine}>
                    <span />
                    <p>activity · confirmed now</p>
                  </div>
                </div>

                <motion.div
                  className={styles.phonePreview}
                  style={
                    prefersReducedMotion
                      ? { x: 0, rotate: -1 }
                      : { x: phoneX, rotate: phoneRotate }
                  }
                >
                  <motion.div
                    className={styles.phoneSurface}
                    style={prefersReducedMotion ? undefined : { rotateX: phoneTiltX, rotateY: phoneTiltY }}
                  >
                    <div className={styles.phoneTopline}>
                      <span>9:41</span>
                      <i />
                    </div>
                    <div className={styles.phoneHeading}>
                      <small>Your impact</small>
                      <strong>Activity</strong>
                      <div className={styles.phoneActions}>
                        <span className={styles.phoneLive}><i /> Live</span>
                        {!prefersReducedMotion && (
                          <button
                            type="button"
                            className={styles.phonePause}
                            onClick={() => setFeedPaused((current) => !current)}
                            aria-label={feedPaused ? "Resume activity feed" : "Pause activity feed"}
                            aria-pressed={feedPaused}
                            title={feedPaused ? "Resume activity feed" : "Pause activity feed"}
                          >
                            {feedPaused ? <Play /> : <Pause />}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className={styles.previewList} aria-label="Illustrative donor activity">
                      <div className={styles.previewStack}>
                        <AnimatePresence initial={false} mode="popLayout">
                          {visibleAlerts.map((alert) => (
                            <motion.article
                              key={alert.key}
                              className={styles.previewAlert}
                              initial={prefersReducedMotion ? false : { opacity: 0, y: 14, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8, scale: 0.98 }}
                              transition={{ duration: prefersReducedMotion ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] }}
                            >
                              <Image src={alert.avatar} alt="" width={42} height={42} />
                              <div>
                                <p><strong>{alert.name}</strong> {alert.message}</p>
                                <small>{alert.detail}</small>
                                <span>{alert.badge}</span>
                              </div>
                              <b>{alert.amount}</b>
                            </motion.article>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                    <div className={styles.previewPulse} />
                  </motion.div>
                </motion.div>
              </div>
            </KineticGrid>
          </div>
        </motion.div>

        <motion.div className={styles.seamGlow} style={{ opacity: prefersReducedMotion ? 0 : seamOpacity }} />

        <div className={styles.progress}>
          <span>VERIFY</span>
          <div><motion.i style={{ scaleX: prefersReducedMotion ? 1 : progressScale }} /></div>
          <span>REPORTS</span>
        </div>
      </div>
    </section>
  );
}
