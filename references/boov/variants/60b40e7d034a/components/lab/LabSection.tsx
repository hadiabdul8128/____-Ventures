import type { ReactNode } from "react";
import styles from "./LabSection.module.css";

type Props = {
  /** Two-digit experiment index, e.g. "01" → renders "EXP-01". */
  index: string;
  /** Uppercase tool attribution, e.g. "REACT SPRING / USE-GESTURE". */
  tool: string;
  /** Space Grotesk exhibit title. */
  title: string;
  /** Right-aligned live readout slot — instrumentation, provided by the exhibit. */
  readout?: ReactNode;
  children: ReactNode;
  id?: string;
};

/**
 * Shared exhibit frame for The Lab: dashed border with corner ticks, a header
 * row (monospace index + tool label + title), and a live readout slot on the
 * right. Pure layout — exhibits fill the readout and body.
 */
export function LabSection({ index, tool, title, readout, children, id }: Props) {
  return (
    <section id={id} className={styles.exhibit} aria-label={`Experiment ${index}: ${title}`}>
      <span className={`${styles.tick} ${styles.tickTL}`} aria-hidden="true" />
      <span className={`${styles.tick} ${styles.tickTR}`} aria-hidden="true" />
      <span className={`${styles.tick} ${styles.tickBL}`} aria-hidden="true" />
      <span className={`${styles.tick} ${styles.tickBR}`} aria-hidden="true" />

      <header className={styles.head}>
        <div className={styles.meta}>
          <p className={styles.metaRow}>
            <span className={styles.index}>EXP-{index}</span>
            <span className={styles.tool}>{tool}</span>
          </p>
          <h2 className={styles.title}>{title}</h2>
        </div>
        {readout ? (
          <div className={styles.readout} aria-hidden="true">
            {readout}
          </div>
        ) : null}
      </header>

      <div className={styles.body}>{children}</div>
    </section>
  );
}
