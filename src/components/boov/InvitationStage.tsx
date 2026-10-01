import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import {
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { BorderBeam } from "@/components/ui/border-beam";
import styles from "./InvitationStage.module.css";

const steps = ["Discover", "Connect", "Build"];
const layers = Array.from({ length: 7 }, (_, index) => index - 3);

/**
 * Adapted from BoovExperience's layered physical card and scroll spotlight,
 * with the spring pointer tilt from HorizontalChapterTransition.
 */
export function InvitationStage({
  enabled,
  onRequest,
}: {
  enabled: boolean;
  onRequest: () => void;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const id = useId().replace(/:/g, "");
  const reducedMotion = useReducedMotion();
  const moving = enabled && !reducedMotion;
  const visible = useInView(sectionRef, { margin: "120px" });
  const sceneActive = moving && visible;
  const [activeStep, setActiveStep] = useState(0);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, {
    stiffness: 110,
    damping: 24,
    mass: 0.7,
  });
  const springY = useSpring(pointerY, {
    stiffness: 110,
    damping: 24,
    mass: 0.7,
  });
  const tiltX = useTransform(springY, [-1, 1], [6, -6]);
  const tiltY = useTransform(springX, [-1, 1], [-9, 9]);
  const shineX = useTransform(springX, [-1, 1], [15, 85]);
  const shineY = useTransform(springY, [-1, 1], [15, 85]);
  const sheen = useMotionTemplate`radial-gradient(ellipse at ${shineX}% ${shineY}%, rgba(245,216,153,0.17), transparent 65%)`;
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const cardY = useTransform(scrollYProgress, [0, 0.5, 1], [76, 0, -48]);
  const cardRotateX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 1, -6]);
  const cardRotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-20, -9, 7]);
  const cardRotateZ = useTransform(scrollYProgress, [0, 0.5, 1], [-8, -5, 0]);
  const beamOpacity = useTransform(
    scrollYProgress,
    [0, 0.4, 1],
    [0.15, 0.8, 0.45],
  );
  const statementY = useTransform(scrollYProgress, [0, 0.45, 1], [22, 0, -12]);
  const progress = useTransform(scrollYProgress, [0.2, 0.8], [0, 1]);

  useMotionValueEvent(progress, "change", (value) => {
    if (!sceneActive) return;
    const next = Math.min(2, Math.floor(value * 3));
    setActiveStep((current) => (current === next ? current : next));
  });

  useEffect(() => {
    const releasePointer = () => {
      pointerX.set(0);
      pointerY.set(0);
      springX.jump(0);
      springY.jump(0);
    };
    if (!sceneActive) {
      releasePointer();
      return;
    }
    window.addEventListener("blur", releasePointer);
    return () => window.removeEventListener("blur", releasePointer);
  }, [sceneActive, pointerX, pointerY, springX, springY]);

  const resetPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  const handlePointer = (event: PointerEvent<HTMLDivElement>) => {
    if (!sceneActive || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 2);
    pointerY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 2);
  };

  return (
    <section
      id="invitation"
      ref={sectionRef}
      className={styles.section}
      data-motion={moving ? "on" : "off"}
      aria-labelledby="invitation-heading"
    >
      <div className={styles.stage}>
        <motion.div
          className={styles.light}
          style={{ opacity: sceneActive ? beamOpacity : 0.65 }}
          aria-hidden="true"
        />
        <div className={styles.topline}>
          <span>02 / The introduction</span>
          <span>Possibility, in good company.</span>
        </div>
        <div className={styles.composition}>
          <motion.div
            className={styles.copy}
            style={{ y: sceneActive ? statementY : 0 }}
          >
            <p className={styles.kicker}>A meeting of minds.</p>
            <h2 id="invitation-heading">
              An introduction.
              <em>
                A different
                <br />
                trajectory.
              </em>
            </h2>
            <p className={styles.description}>
              Ambitious founders. Thoughtful capital.
              <br />
              The beginning of something exceptional.
            </p>
            <button
              type="button"
              className={styles.request}
              onClick={onRequest}
            >
              Request an introduction
              <span aria-hidden="true">
                <ArrowUpRight size={19} strokeWidth={1.3} />
              </span>
            </button>
          </motion.div>

          <div
            className={styles.perspective}
            onPointerMove={sceneActive ? handlePointer : undefined}
            onPointerLeave={resetPointer}
            onPointerCancel={resetPointer}
            aria-hidden="true"
          >
            <div className={styles.halo} />
            <motion.div
              className={styles.cardMotion}
              style={
                sceneActive
                  ? {
                      y: cardY,
                      rotateX: cardRotateX,
                      rotateY: cardRotateY,
                      rotateZ: cardRotateZ,
                    }
                  : { rotateY: -9, rotateZ: -5 }
              }
            >
              <motion.div
                className={styles.cardObject}
                style={
                  sceneActive
                    ? { rotateX: tiltX, rotateY: tiltY }
                    : { rotateX: 0, rotateY: 0 }
                }
              >
                {layers.map((depth) => (
                  <span
                    key={depth}
                    className={styles.edge}
                    style={{ transform: `translateZ(${depth}px)` }}
                  />
                ))}
                <div className={styles.face}>
                  <div className={styles.frame} />
                  <div className={styles.cardHeader}>
                    <span className={styles.wordmark}>
                      <i />
                      <i />
                      <i />
                      <i />
                    </span>
                    <span>VENTURES</span>
                  </div>
                  <svg
                    className={styles.seal}
                    viewBox="0 0 240 240"
                    fill="none"
                  >
                    <defs>
                      <linearGradient
                        id={`${id}-foil`}
                        x1="12"
                        y1="20"
                        x2="215"
                        y2="230"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#8c6d35" />
                        <stop offset=".3" stopColor="#f4dea7" />
                        <stop offset=".52" stopColor="#b6985b" />
                        <stop offset=".75" stopColor="#e9cf90" />
                        <stop offset="1" stopColor="#806135" />
                      </linearGradient>
                    </defs>
                    <g stroke={`url(#${id}-foil)`}>
                      <circle
                        cx="120"
                        cy="120"
                        r="104"
                        strokeWidth=".6"
                        opacity=".6"
                      />
                      <circle
                        cx="120"
                        cy="120"
                        r="97"
                        strokeWidth=".5"
                        opacity=".35"
                      />
                      {Array.from({ length: 12 }, (_, index) => (
                        <ellipse
                          key={index}
                          cx="120"
                          cy="120"
                          rx="36"
                          ry="83"
                          transform={`rotate(${index * 15} 120 120)`}
                          strokeWidth=".7"
                          opacity=".72"
                        />
                      ))}
                    </g>
                    <circle cx="120" cy="120" r="7" fill={`url(#${id}-foil)`} />
                  </svg>
                  <div className={styles.cardTitle}>
                    <span>A private introduction</span>
                    <strong>To what comes next.</strong>
                  </div>
                  <div className={styles.cardFooter}>
                    <span>Cambridge & beyond</span>
                    <span>Founders · Capital · Possibility</span>
                  </div>
                  <motion.div
                    className={styles.sheen}
                    style={{ background: sceneActive ? sheen : undefined }}
                  />
                  {sceneActive && (
                    <BorderBeam
                      size={140}
                      duration={16}
                      colorFrom="#f0d89e"
                      colorTo="#8a6c3c"
                    />
                  )}
                </div>
              </motion.div>
            </motion.div>
            <span className={styles.artifactCaption}>
              Every next chapter begins somewhere.
            </span>
          </div>
        </div>

        <div className={styles.rail} aria-label="The journey">
          <ol>
            {steps.map((step, index) => (
              <li key={step} data-active={!moving || index <= activeStep}>
                <span>0{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <div className={styles.railTrack} aria-hidden="true">
            <motion.i style={{ scaleX: sceneActive ? progress : 1 }} />
          </div>
          <span className={styles.railNote}>
            Everything begins with people.
          </span>
        </div>
      </div>
    </section>
  );
}
