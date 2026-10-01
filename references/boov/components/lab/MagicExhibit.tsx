"use client";

import { AnimatedList } from "@/components/ui/animated-list";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { LabSection } from "./LabSection";
import styles from "./MagicExhibit.module.css";

const VARIANTS = [
  { variant: "circle", label: "VT-A / CIRCLE" },
  { variant: "hexagon", label: "VT-B / HEXAGON" },
  { variant: "star", label: "VT-C / STAR" },
] as const;

const FEED = [
  "Card issued - member #0042",
  "Groceries · $18.40 approved",
  "Transit reload · $2.75",
  "Pharmacy · $6.10 approved",
];

/**
 * EXP-04 - Magic UI instruments on the bench: three AnimatedThemeToggler
 * variants (each one flips html.dark through a differently-shaped view
 * transition) beside a mini AnimatedList feed in a bordered column.
 */
export function MagicExhibit() {
  return (
    <LabSection
      id="exp-04"
      index="04"
      tool="MAGIC UI / VIEW TRANSITIONS"
      title="Theme, transitioned"
      readout={
        <>
          <span>vt: circle | hexagon | star</span>
          <span>list delay: 1400ms</span>
        </>
      }
    >
      <div className={styles.grid}>
        <div className={styles.togglers}>
          {VARIANTS.map((v) => (
            <div key={v.variant} className={styles.cell}>
              {/* Distinct names - three otherwise-identical "toggle theme"
                  buttons are indistinguishable in a screen-reader rotor. */}
              <AnimatedThemeToggler
                variant={v.variant}
                className={styles.toggler}
                aria-label={`Toggle theme - ${v.variant} wipe`}
              />
              <span className={styles.cellLabel}>{v.label}</span>
            </div>
          ))}
          <p className={styles.togglersNote} aria-hidden="true">
            EACH TOGGLE CUTS THE THEME THROUGH A SHAPED VIEW TRANSITION
          </p>
        </div>

        <div className={styles.listCol}>
          <p className={styles.listLabel}>Live feed - animated list</p>
          <AnimatedList className={styles.list} delay={1400}>
            {FEED.map((item) => (
              <div key={item} className={styles.listItem}>
                <span className={styles.listDot} aria-hidden="true" />
                {item}
              </div>
            ))}
          </AnimatedList>
        </div>
      </div>
    </LabSection>
  );
}
