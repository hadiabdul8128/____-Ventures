"use client";

import { animated, useSpring } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { LabSection } from "./LabSection";
import styles from "./SpringExhibit.module.css";

const BOUND_X = 160;
const BOUND_Y = 110;
/** Distance a keyboard arrow press nudges the card. */
const KEY_STEP = 28;
const SPRING_CONFIG = { tension: 350, friction: 28 };
const COUNTER_TARGET = 48213;
/** How far (ms of travel) a release velocity projects the card. */
const PROJECTION = 90;

const fmt = (n: number) => `${n < 0 ? "-" : "+"}${Math.abs(n).toFixed(1).padStart(5, "0")}`;
const clampTo = (v: number, bound: number) => Math.min(bound, Math.max(-bound, v));

/**
 * EXP-01 - a lightweight Boov member card on a react-spring x/y spring, dragged
 * with use-gesture. Release projects the gesture velocity into the spring so the
 * card carries inertia, rubberbanded inside ±160px. The readout is written
 * frame-by-frame via refs (spring onChange → textContent), never React state.
 */
export function SpringExhibit() {
  const reduced = useReducedMotion();
  const posRef = useRef<HTMLSpanElement>(null);
  const velRef = useRef<HTMLSpanElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Bounds shrink with the stage so the card cannot be flung out of a narrow
  // phone viewport; the CSS bounds guide mirrors the same clamp (76% / 72%).
  const [bounds, setBounds] = useState({ x: BOUND_X, y: BOUND_Y });

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      setBounds({
        x: Math.min(BOUND_X, Math.round((rect.width * 0.76) / 2)),
        y: Math.min(BOUND_Y, Math.round((rect.height * 0.72) / 2)),
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const [{ x, y }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    config: SPRING_CONFIG,
    onChange: (result: { value: { x: number; y: number } }) => {
      if (posRef.current) {
        posRef.current.textContent = `x ${fmt(result.value.x)}  y ${fmt(result.value.y)}`;
      }
    },
  }));

  const bind = useDrag(
    ({ down, offset: [ox, oy], velocity: [vx, vy], direction: [dx, dy] }) => {
      if (velRef.current) {
        velRef.current.textContent = `vx ${vx.toFixed(2)}  vy ${vy.toFixed(2)}`;
      }
      if (down) {
        api.start({ x: ox, y: oy, immediate: true });
        return;
      }
      // Velocity-projected inertia: the release point plus where the fling was
      // headed, clamped back inside the bounds, seeded with the hand-off velocity.
      const px = clampTo(ox + vx * dx * PROJECTION, bounds.x);
      const py = clampTo(oy + vy * dy * PROJECTION, bounds.y);
      api.start({
        x: px,
        y: py,
        config: (key) => ({
          ...SPRING_CONFIG,
          velocity: key === "x" ? vx * dx : vy * dy,
        }),
      });
    },
    {
      enabled: !reduced,
      bounds: { left: -bounds.x, right: bounds.x, top: -bounds.y, bottom: bounds.y },
      rubberband: true,
      from: () => [x.get(), y.get()],
    },
  );

  // Keyboard equivalent of the drag: arrow keys nudge the card on the same
  // spring; Home recentres it.
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (reduced) return;
    if (event.key === "Home") {
      event.preventDefault();
      api.start({ x: 0, y: 0 });
      return;
    }
    const step = {
      ArrowLeft: [-KEY_STEP, 0],
      ArrowRight: [KEY_STEP, 0],
      ArrowUp: [0, -KEY_STEP],
      ArrowDown: [0, KEY_STEP],
    }[event.key as string];
    if (!step) return;
    event.preventDefault();
    api.start({
      x: clampTo(x.get() + step[0], bounds.x),
      y: clampTo(y.get() + step[1], bounds.y),
    });
  };

  // Spring counter - starts once, when scrolled into view.
  const counterBoxRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const [{ n }, counterApi] = useSpring(() => ({
    n: 0,
    config: { tension: 42, friction: 30, clamp: true },
  }));

  useEffect(() => {
    const el = counterBoxRef.current;
    if (!el || startedRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (startedRef.current) return;
        if (entries.some((entry) => entry.isIntersecting)) {
          startedRef.current = true;
          counterApi.start({ n: COUNTER_TARGET, immediate: reduced === true });
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [counterApi, reduced]);

  return (
    <LabSection
      id="exp-01"
      index="01"
      tool="REACT SPRING / USE-GESTURE"
      title="Inertia on a leash"
      readout={
        <>
          <span ref={posRef}>x +000.0  y +000.0</span>
          <span ref={velRef}>vx 0.00  vy 0.00</span>
          <span>tension 350 / friction 28</span>
        </>
      }
    >
      <div className={styles.grid}>
        <div ref={stageRef} className={styles.stage}>
          <span className={styles.boundsGuide} aria-hidden="true" />
          <span className={styles.crosshairX} aria-hidden="true" />
          <span className={styles.crosshairY} aria-hidden="true" />

          <animated.div
            {...bind()}
            className={`${styles.card} ${reduced ? styles.cardStatic : ""}`}
            style={reduced ? undefined : { x, y }}
            // A focusable button role so the exhibit works without a pointer:
            // arrows nudge, Home recentres. aria-label is valid here (it was
            // not on the bare div).
            role="button"
            tabIndex={reduced ? -1 : 0}
            onKeyDown={onKeyDown}
            aria-label="Boov member card - drag to fling, or use arrow keys; Home recentres"
          >
            <span className={styles.cardWordmark}>boov</span>
            <span className={styles.cardChip} aria-hidden="true" />
            <span className={styles.cardRow} aria-hidden="true">
              <span>MEMBER - 0042</span>
              <span>EST 2025</span>
            </span>
          </animated.div>

          <p className={styles.stageNote} aria-hidden="true">
            DRAG BOUNDS ±{BOUND_X}px - RUBBERBAND ON
          </p>
        </div>

        <div className={styles.side}>
          <p className={styles.sideCopy}>
            The member card rides a single x/y spring. While the pointer is down the spring
            follows immediately; on release, the gesture&rsquo;s exit velocity is handed to the
            spring, so the card keeps its momentum and settles - never snaps.
          </p>

          <div ref={counterBoxRef} className={styles.counter}>
            <p className={styles.counterLabel}>$ ROUTED TO ESSENTIALS</p>
            <p className={styles.counterValue}>
              <span aria-hidden="true">$</span>
              <animated.span>
                {n.to((v) => Math.floor(v).toLocaleString("en-US"))}
              </animated.span>
            </p>
            <p className={styles.counterNote}>same spring physics, counting</p>
          </div>
        </div>
      </div>
    </LabSection>
  );
}
