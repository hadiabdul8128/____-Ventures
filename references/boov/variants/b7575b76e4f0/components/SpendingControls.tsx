"use client";

import { useRef } from "react";
import { SPENDING_ALLOWED, SPENDING_BLOCKED } from "@/content/homepage";
import { useScrollReveal } from "@/lib/hooks/useScrollReveal";
import { AnimatedText } from "./AnimatedText";
import styles from "./SpendingControls.module.css";

export function SpendingControls() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, { selector: `.${styles.reveal}`, stagger: 0.06, y: 18 });

  return (
    <section id="controls" ref={sectionRef} className={styles.section} aria-label="Spending controls">
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={`${styles.kicker} ${styles.reveal}`}>02 — What the card locks to</p>
          <AnimatedText
            as="h2"
            text="Directed to the essentials — nothing else."
            className={styles.title}
            stagger={0.04}
          />
          <p className={`${styles.lead} ${styles.reveal}`}>
            Every balance is restricted at the merchant-category level. Support reaches the
            things that keep a day livable, and quietly declines everywhere it shouldn&rsquo;t.
          </p>
        </header>

        <div className={styles.columns}>
          <div className={styles.column}>
            <p className={`${styles.columnLabel} ${styles.reveal}`}>Where it works</p>
            <ul className={styles.list}>
              {SPENDING_ALLOWED.map((item) => (
                <li key={item.label} className={`${styles.row} ${styles.reveal}`}>
                  <span className={styles.rowMark} aria-hidden="true" />
                  <span className={styles.rowLabel}>{item.label}</span>
                  <span className={styles.rowNote}>{item.note}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={`${styles.column} ${styles.columnBlocked}`}>
            <p className={`${styles.columnLabel} ${styles.columnLabelMuted} ${styles.reveal}`}>
              Where it doesn&rsquo;t
            </p>
            <ul className={styles.list}>
              {SPENDING_BLOCKED.map((item) => (
                <li key={item.label} className={`${styles.row} ${styles.rowBlocked} ${styles.reveal}`}>
                  <span className={styles.rowMarkBlocked} aria-hidden="true" />
                  <span className={styles.rowLabel}>{item.label}</span>
                  <span className={styles.rowNote}>{item.note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
