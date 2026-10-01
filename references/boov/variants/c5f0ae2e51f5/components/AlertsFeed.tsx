"use client";

import Image from "next/image";
import { Activity, BatteryFull, Bell, Heart, Home, Pause, Play, Wifi } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ALERTS, type AlertItem } from "@/content/alerts";
import { useScrollReveal } from "@/lib/hooks/useScrollReveal";
import styles from "./AlertsFeed.module.css";

const FEED_DELAY_MS = 1600;

function AlertCard({ alert }: { alert: AlertItem }) {
  return (
    <article className={styles.card} data-tone={alert.tone}>
      <div className={styles.avatarWrap} aria-hidden="true">
        <Image
          className={styles.avatar}
          src={alert.avatar}
          alt=""
          width={48}
          height={48}
          sizes="48px"
        />
        <span className={styles.avatarStatus} />
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardTopline}>
          <p className={styles.cardTitle}>
            <strong>{alert.name}</strong> {alert.message}
          </p>
          <time className={styles.time}>{alert.time}</time>
        </div>
        <p className={styles.cardDesc}>{alert.detail}</p>
        <div className={styles.cardFooter}>
          <span className={styles.badge}>{alert.badge}</span>
          <span className={styles.amount}>{alert.amount}</span>
        </div>
      </div>
    </article>
  );
}

export function AlertsFeed() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [shown, setShown] = useState(1);
  const [paused, setPaused] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useScrollReveal(sectionRef, { selector: `.${styles.reveal}`, stagger: 0.08, y: 18 });

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let wasInView = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextInView = entry.isIntersecting && entry.intersectionRatio >= 0.35;

        if (nextInView && !wasInView) {
          setShown(1);
        }

        wasInView = nextInView;
        setIsInView(nextInView);
      },
      { threshold: [0, 0.35] },
    );

    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || paused || !isInView || shown >= ALERTS.length) return;

    const tick = window.setTimeout(() => {
      setShown((count) => Math.min(count + 1, ALERTS.length));
    }, FEED_DELAY_MS);

    return () => window.clearTimeout(tick);
  }, [isInView, paused, prefersReducedMotion, shown]);

  const visibleAlerts = ALERTS.slice(0, isInView ? shown : 1).slice().reverse();

  const togglePaused = () => {
    setPaused((current) => !current);
  };

  return (
    <div ref={sectionRef} className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h2 id="alerts-heading" className={`${styles.headline} ${styles.reveal}`}>
            <span>Every dollar</span>
            <span>reports back.</span>
          </h2>
        </div>

        <div ref={stageRef} className={`${styles.stage} ${styles.reveal}`}>
          <div className={styles.phone}>
            <span className={styles.sideButton} aria-hidden="true" />
            <div className={styles.screen}>
              <div className={styles.statusBar} aria-hidden="true">
                <span>9:41</span>
                <div className={styles.statusIcons}>
                  <span className={styles.cellSignal}>
                    <i />
                    <i />
                    <i />
                    <i />
                  </span>
                  <Wifi />
                  <BatteryFull />
                </div>
              </div>

              <div className={styles.island} aria-hidden="true" />

              <header className={styles.appHeader}>
                <div>
                  <p className={styles.appEyebrow}>Your impact</p>
                  <h3>Activity</h3>
                </div>
                <div className={styles.headerActions}>
                  <span className={styles.bell} aria-hidden="true">
                    <Bell />
                    <i />
                  </span>
                  {!prefersReducedMotion && (
                    <button
                      type="button"
                      className={styles.pauseButton}
                      onClick={togglePaused}
                      aria-label={paused ? "Resume activity feed" : "Pause activity feed"}
                      aria-pressed={paused}
                      title={paused ? "Resume activity feed" : "Pause activity feed"}
                    >
                      {paused ? <Play /> : <Pause />}
                    </button>
                  )}
                </div>
              </header>

              <div className={styles.feedMeta}>
                <span>Today</span>
                <span className={styles.livePill}>
                  <i aria-hidden="true" /> Live updates
                </span>
              </div>

              <div className={styles.listViewport} aria-label="Illustrative donor activity">
                <div className={styles.list}>
                  <AnimatePresence initial={false}>
                    {visibleAlerts.map((alert) => (
                      <motion.div
                        key={alert.key}
                        layout
                        initial={prefersReducedMotion ? false : { opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <AlertCard alert={alert} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <div className={styles.tabBar} aria-hidden="true">
                <span>
                  <Home />
                  Home
                </span>
                <span className={styles.tabActive}>
                  <Activity />
                  Activity
                </span>
                <span>
                  <Heart />
                  Giving
                </span>
              </div>
            </div>
          </div>

          <p className={styles.demoNote}>
            Illustrative activity · Names and events are fictional
          </p>
        </div>
      </div>
    </div>
  );
}
