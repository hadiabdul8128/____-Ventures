"use client";

import { AnimatePresence, motion, useReducedMotion, type Transition } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { LabSection } from "./LabSection";
import styles from "./MotionExhibit.module.css";

const TILES = [
  {
    key: "essentials",
    num: "T-01",
    title: "Essentials only",
    note: "Category-locked",
    body: "Every balance is restricted at the merchant-category level — groceries, transit, pharmacy. Support lands where it keeps a day livable, and quietly declines everywhere else.",
  },
  {
    key: "instant",
    num: "T-02",
    title: "Issued in minutes",
    note: "No address needed",
    body: "A member card exists the moment someone does. No fixed address, no branch visit, no waiting on mail that has nowhere to arrive.",
  },
  {
    key: "ledger",
    num: "T-03",
    title: "Open ledger",
    note: "Every dollar visible",
    body: "Donors see the route their support takes — anonymized, aggregated, and audited in the open. Proof, not promises.",
  },
  {
    key: "dignity",
    num: "T-04",
    title: "Dignity by default",
    note: "Tap like anyone",
    body: "At the terminal it looks and pays like any other card. No scrip, no vouchers, no explaining yourself at the counter.",
  },
] as const;

type TileKey = (typeof TILES)[number]["key"];

const SPRING: Transition = { type: "spring", stiffness: 360, damping: 30 };
const INSTANT: Transition = { duration: 0 };

/**
 * EXP-03 — framer-motion gesture grid. Tiles lift on hover and press on tap
 * (spring transitions); tapping expands the tile into a detail card through a
 * shared layoutId element, with AnimatePresence handling the exit. The readout
 * mirrors the active layoutId. Reduced motion → instant transitions, no lift.
 *
 * Dialog semantics: opening moves focus to the close button, Escape closes,
 * and closing returns focus to the tile that opened it.
 */
export function MotionExhibit() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState<TileKey | null>(null);
  const transition = reduced ? INSTANT : SPRING;
  const activeTile = TILES.find((tile) => tile.key === active) ?? null;

  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);

  const open = (key: TileKey, opener: HTMLButtonElement) => {
    openerRef.current = opener;
    setActive(key);
  };

  const close = () => {
    setActive(null);
    openerRef.current?.focus();
  };

  useEffect(() => {
    if (!active) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <LabSection
      id="exp-03"
      index="03"
      tool="FRAMER MOTION / LAYOUT"
      title="Shared-element benefits"
      readout={
        <>
          <span>layoutId: {active ? `tile-${active}` : "none"}</span>
          <span>stiffness 360 / damping 30</span>
        </>
      }
    >
      <div className={styles.wrap}>
        <div className={styles.tiles}>
          {TILES.map((tile) => (
            <motion.button
              key={tile.key}
              type="button"
              layoutId={`tile-${tile.key}`}
              className={styles.tile}
              onClick={(event) => open(tile.key, event.currentTarget)}
              whileHover={reduced ? undefined : { y: -6 }}
              whileTap={reduced ? undefined : { scale: 0.97 }}
              transition={transition}
              aria-haspopup="dialog"
            >
              <span className={styles.tileNum}>{tile.num}</span>
              <span className={styles.tileTitle}>{tile.title}</span>
              <span className={styles.tileNote}>{tile.note}</span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {activeTile ? (
            <>
              <motion.div
                key="backdrop"
                className={styles.backdrop}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={reduced ? INSTANT : { duration: 0.2 }}
                onClick={close}
              />
              <motion.div
                key={`detail-${activeTile.key}`}
                layoutId={`tile-${activeTile.key}`}
                className={styles.detail}
                transition={transition}
                role="dialog"
                aria-modal="true"
                aria-label={activeTile.title}
              >
                <span className={styles.tileNum}>{activeTile.num}</span>
                <span className={styles.detailTitle}>{activeTile.title}</span>
                <p className={styles.detailBody}>{activeTile.body}</p>
                <button ref={closeRef} type="button" className={styles.close} onClick={close}>
                  CLOSE ×
                </button>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
      </div>
    </LabSection>
  );
}
