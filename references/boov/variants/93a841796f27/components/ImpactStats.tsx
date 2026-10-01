"use client";

import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { IMPACT_STATS, LIVE_FEED_SAMPLE, type Stat } from "@/content/homepage";
import { gsap } from "@/lib/gsap";
import { useVelocitySkew } from "@/lib/hooks/useVelocitySkew";
import { AnimatedText } from "./AnimatedText";
import styles from "./ImpactStats.module.css";

function formatStat(value: number, stat: Stat) {
  const rounded = Math.round(value);
  const formatted =
    stat.format === "currency" || stat.format === "count"
      ? rounded.toLocaleString("en-US")
      : String(rounded);
  return `${stat.prefix ?? ""}${formatted}${stat.suffix ?? ""}`;
}

export function ImpactStats() {
  const sectionRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  useVelocitySkew(statsRef, 5);

  useGSAP(
    () => {
      const tiles = gsap.utils.toArray<HTMLElement>(`.${styles.value}`);
      tiles.forEach((tile) => {
        const stat = IMPACT_STATS.find((item) => item.id === tile.dataset.id);
        if (!stat) return;

        if (prefersReducedMotion) {
          tile.textContent = formatStat(stat.value, stat);
          return;
        }

        const counter = { v: 0 };
        tile.textContent = formatStat(0, stat);
        gsap.to(counter, {
          v: stat.value,
          duration: 1.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: tile,
            start: "top 88%",
            toggleActions: "play none none none",
          },
          onUpdate: () => {
            tile.textContent = formatStat(counter.v, stat);
          },
        });
      });
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion] },
  );

  const feedLoop = [...LIVE_FEED_SAMPLE, ...LIVE_FEED_SAMPLE];

  return (
    <section id="impact" ref={sectionRef} className={styles.section} aria-labelledby="impact-heading">
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.kicker}>Impact</p>
          <AnimatedText as="h2" text="Confidence you can watch move." className={styles.title} stagger={0.05} />
        </header>

        <div ref={statsRef} className={styles.stats}>
          {IMPACT_STATS.map((stat) => (
            <div key={stat.id} className={styles.tile}>
              <span className={styles.value} data-id={stat.id}>
                {formatStat(prefersReducedMotion ? stat.value : 0, stat)}
              </span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>

        <div className={styles.feed}>
          <div className={styles.feedHead}>
            <span className={styles.feedTitle}>Live activity</span>
            <span className={styles.feedCaption}>Illustrative feed — connects to live data at launch</span>
          </div>
          <div className={styles.feedViewport}>
            <ul
              className={`${styles.feedTrack} ${prefersReducedMotion ? styles.feedTrackStatic : ""}`}
            >
              {feedLoop.map((item, index) => (
                <li key={`${item.id}-${index}`} className={styles.feedRow} aria-hidden={index >= LIVE_FEED_SAMPLE.length}>
                  <span className={styles.feedDot} />
                  <span className={styles.feedCategory}>{item.category}</span>
                  <span className={styles.feedMerchant}>{item.merchant}</span>
                  <span className={styles.feedCard}>{item.cardIdMasked}</span>
                  <span className={styles.feedAmount}>{item.amountLabel}</span>
                  <span className={styles.feedTime}>{item.timeLabel}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
