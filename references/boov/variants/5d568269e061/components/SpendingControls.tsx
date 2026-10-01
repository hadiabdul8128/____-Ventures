"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
  type Variant,
} from "framer-motion";
import {
  Banknote,
  Check,
  Droplets,
  Nfc,
  ShieldCheck,
  ShoppingBasket,
  TrainFront,
  Wine,
  X,
  type LucideIcon,
} from "lucide-react";
import { TransitionPanel } from "@/components/motion-primitives/transition-panel";
import { BoovCharacter } from "@/components/boov/BoovCharacter";
import NeuralBackground from "@/components/ui/flow-field-background";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import styles from "./SpendingControls.module.css";

type Transaction = {
  id: "groceries" | "alcohol" | "transit" | "hygiene" | "cash";
  label: string;
  merchant: string;
  amount: string;
  category: string;
  rule: string;
  status: "approved" | "declined";
  decision: "ACCEPTED" | "DECLINED" | "NO";
  speech: string;
  Icon: LucideIcon;
};

type GuidePhase = "checking" | "result" | "travelling";

type TourState = {
  index: number;
  phase: GuidePhase;
  position: number;
  step: number;
  travelProgress: number;
};

const TRANSACTIONS: Transaction[] = [
  {
    id: "groceries",
    label: "Groceries",
    merchant: "9th Street Market",
    amount: "$18.40",
    category: "Grocery stores",
    rule: "Essential food merchant",
    status: "approved",
    decision: "ACCEPTED",
    speech: "Groceries are covered.",
    Icon: ShoppingBasket,
  },
  {
    id: "alcohol",
    label: "Alcohol",
    merchant: "Corner Wine & Spirits",
    amount: "$12.60",
    category: "Alcohol retailers",
    rule: "Blocked category: alcohol",
    status: "declined",
    decision: "DECLINED",
    speech: "Alcohol stays blocked.",
    Icon: Wine,
  },
  {
    id: "transit",
    label: "Transit",
    merchant: "City Transit",
    amount: "$2.50",
    category: "Public transit",
    rule: "Approved transportation",
    status: "approved",
    decision: "ACCEPTED",
    speech: "Bus fare is covered.",
    Icon: TrainFront,
  },
  {
    id: "hygiene",
    label: "Hygiene",
    merchant: "Neighborhood Market",
    amount: "$9.20",
    category: "Personal care",
    rule: "Essential hygiene",
    status: "approved",
    decision: "ACCEPTED",
    speech: "Hygiene is covered.",
    Icon: Droplets,
  },
  {
    id: "cash",
    label: "Cash withdrawal",
    merchant: "ATM withdrawal",
    amount: "$20.00",
    category: "Cash access",
    rule: "Cash withdrawal is unavailable",
    status: "declined",
    decision: "NO",
    speech: "Cash withdrawals stay locked.",
    Icon: Banknote,
  },
];

const ACCESSIBLE_STEPS = [
  "Tap received.",
  "Merchant recognized.",
  "Card rule checked.",
  "Purchase approved or declined.",
] as const;

const STATUS_VARIANTS: { enter: Variant; center: Variant; exit: Variant } = {
  enter: { opacity: 0, y: 10, filter: "blur(6px)" },
  center: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -7, filter: "blur(4px)" },
};

const MOBILE_STATUS_VARIANTS: { enter: Variant; center: Variant; exit: Variant } = {
  enter: { opacity: 0, y: 4 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -3 },
};

const TOUR_SEGMENT = 1 / TRANSACTIONS.length;
const TOUR_ARRIVAL_POINT = 0.5;

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const smoothstep = (value: number) => {
  const progress = clamp(value);
  return progress * progress * (3 - 2 * progress);
};

function getTourState(progress: number): TourState {
  const safeProgress = clamp(progress, 0, 0.999999);
  const index = Math.min(
    TRANSACTIONS.length - 1,
    Math.floor(safeProgress / TOUR_SEGMENT),
  );
  const localProgress = clamp(
    (safeProgress - index * TOUR_SEGMENT) / TOUR_SEGMENT,
  );
  const checkProgress = clamp(localProgress / TOUR_ARRIVAL_POINT);
  const hasArrived = localProgress >= TOUR_ARRIVAL_POINT;
  const travelProgress = index === 0 ? 1 : smoothstep(checkProgress);

  return {
    index,
    phase: hasArrived ? "result" : index === 0 ? "checking" : "travelling",
    position: index === 0 ? 0 : index - 1 + travelProgress,
    step: hasArrived ? 3 : Math.min(2, Math.floor(checkProgress * 3)),
    travelProgress,
  };
}

function CardMark() {
  return (
    <span className={styles.cardBrand}>
      <span className={styles.orbitMark} aria-hidden="true"><i /></span>
      boov
    </span>
  );
}

function MemberCard({
  activeStep,
  reducedMotion,
  simplifiedMotion,
  tiltX,
  tiltY,
}: {
  activeStep: number;
  reducedMotion: boolean;
  simplifiedMotion: boolean;
  tiltX: MotionValue<number>;
  tiltY: MotionValue<number>;
}) {
  const baseY = [8, 2, -3, 0][activeStep];
  const baseScale = [0.94, 0.97, 1, 1][activeStep];

  return (
    <motion.div
      className={`${styles.card} boov-card-edge`}
      layout
      layoutId="boov-authorization-card"
      role="img"
      aria-label="Navy Boov Essentials card"
      style={{
        rotateX: reducedMotion || simplifiedMotion ? 0 : tiltX,
        rotateY: reducedMotion || simplifiedMotion ? 0 : tiltY,
      }}
      animate={{
        rotate: [-7, -3, 0, 0][activeStep],
        y: reducedMotion || simplifiedMotion ? baseY : [baseY - 3, baseY + 4, baseY - 3],
        scale: baseScale,
      }}
      transition={{
        rotate: { duration: reducedMotion ? 0 : simplifiedMotion ? 0.26 : 0.48, ease: [0.22, 1, 0.36, 1] },
        scale: { duration: reducedMotion ? 0 : simplifiedMotion ? 0.26 : 0.48, ease: [0.22, 1, 0.36, 1] },
        y: reducedMotion
          ? { duration: 0 }
          : simplifiedMotion
            ? { duration: 0.26, ease: [0.22, 1, 0.36, 1] }
            : { duration: 4.2, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      <span className={styles.cardRibbon} aria-hidden="true" />
      <CardMark />
      <span className={styles.cardChip} aria-hidden="true"><i /></span>
      <span className={styles.cardDigits}>•••• 0427</span>
      <Nfc className={styles.cardContactless} aria-hidden="true" />
      <span className={styles.cardType}>essentials</span>
    </motion.div>
  );
}

export function SpendingControls() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = Boolean(useReducedMotion());
  const [activeStep, setActiveStep] = useState(prefersReducedMotion ? 3 : 0);
  const [transactionId, setTransactionId] = useState<Transaction["id"]>("groceries");
  const [announcement, setAnnouncement] = useState("");
  const [fieldActive, setFieldActive] = useState(false);
  const [guideIndex, setGuideIndex] = useState(0);
  const [guidePhase, setGuidePhase] = useState<GuidePhase>(
    prefersReducedMotion ? "result" : "checking",
  );
  const [arrived, setArrived] = useState(prefersReducedMotion);
  const [isMobile, setIsMobile] = useState(false);
  const [replayCount, setReplayCount] = useState(0);
  const lastAnnouncedIndex = useRef(-1);
  const pointerX = useSpring(useMotionValue(0), { stiffness: 180, damping: 24, mass: 0.45 });
  const pointerY = useSpring(useMotionValue(0), { stiffness: 180, damping: 24, mass: 0.45 });
  const tiltY = useTransform(pointerX, [-1, 1], [-6, 6]);
  const tiltX = useTransform(pointerY, [-1, 1], [5, -5]);
  const burstControls = useAnimationControls();
  const mascotControls = useAnimationControls();

  useEffect(() => {
    const mobileQuery = window.matchMedia(
      "(max-width: 900px), (hover: none), (pointer: coarse)",
    );
    const update = () => setIsMobile(mobileQuery.matches);
    update();
    mobileQuery.addEventListener("change", update);
    return () => mobileQuery.removeEventListener("change", update);
  }, []);

  const transaction = TRANSACTIONS[guideIndex] ?? TRANSACTIONS[0];
  const approved = transaction.status === "approved";
  const StatusIcon = approved ? Check : X;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 170,
    damping: 32,
    mass: 0.28,
    restDelta: 0.001,
  });

  // Boov's arrival. This window runs from "section top at the viewport bottom"
  // to "section pinned" — i.e. exactly the approach down from the card scene
  // above — so his crawl reads as continuous with the page you came from.
  const { scrollYProgress: approachProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start start"],
  });
  const smoothApproach = useSpring(approachProgress, {
    stiffness: 170,
    damping: 32,
    mass: 0.28,
    restDelta: 0.001,
  });
  const approachMotion = isMobile ? approachProgress : smoothApproach;

  // He sweeps in from the side and swings down into the slot. rotate(90deg)
  // maps the feet vector to the left, so he comes in on his side and unwinds
  // as he settles onto the tab row.
  const arrivalRotate = useTransform(approachMotion, [0, 0.52, 0.8, 1], [90, 90, 26, 0]);
  const arrivalX = useTransform(approachMotion, [0, 0.52, 0.82, 1], ["-42vw", "-40vw", "-19vw", "0vw"]);
  const arrivalY = useTransform(approachMotion, [0, 0.5, 0.8, 1], ["-64vh", "-13vh", "0vh", "0vh"]);
  const arrivalOpacity = useTransform(approachMotion, [0, 0.05, 1], [0, 1, 1]);
  const chapterProgress = isMobile ? scrollYProgress : smoothProgress;
  const fieldOpacity = useTransform(
    chapterProgress,
    [0, 0.08, 0.9, 1],
    [0.16, 1, 1, 0],
  );
  const guideLeft = useTransform(chapterProgress, (latest) => {
    const { position } = getTourState(latest);
    return `${((position + 0.5) / TRANSACTIONS.length) * 100}%`;
  });
  const guideRouteProgress = useTransform(chapterProgress, (latest) => {
    const { position } = getTourState(latest);
    return position / (TRANSACTIONS.length - 1);
  });
  const guideHop = useTransform(chapterProgress, (latest) => {
    const state = getTourState(latest);
    if (state.phase !== "travelling") return 0;
    return -14 * Math.sin(Math.PI * state.travelProgress)
      - 3 * Math.sin(Math.PI * state.travelProgress * 3);
  });
  const guideTilt = useTransform(chapterProgress, (latest) => {
    const state = getTourState(latest);
    if (state.phase !== "travelling") return 0;
    return 5 * Math.sin(Math.PI * state.travelProgress * 2);
  });

  useMotionValueEvent(chapterProgress, "change", (latest) => {
    if (prefersReducedMotion) return;
    const next = getTourState(latest);
    const nextTransaction = TRANSACTIONS[next.index];

    setActiveStep((current) => (current === next.step ? current : next.step));
    setGuideIndex((current) => (current === next.index ? current : next.index));
    setGuidePhase((current) => (current === next.phase ? current : next.phase));
    setTransactionId((current) => (
      current === nextTransaction.id ? current : nextTransaction.id
    ));
  });

  // Latch on landing: once he's on Groceries he stays there, so scrolling back
  // up never sends him climbing the wall again.
  //
  // The approach has to have actually been seen first. During hydration the
  // section is not laid out yet, so the offset maths briefly reports a
  // progress of 1 — latching on that alone froze him at the slot on every page
  // load and the crawl never ran. (Deep links straight to the section still
  // look right without the latch: every arrival transform converges to
  // identity at progress 1.)
  const seenApproach = useRef(false);
  useMotionValueEvent(approachMotion, "change", (latest) => {
    if (latest < 0.85) {
      seenApproach.current = true;
      return;
    }
    if (seenApproach.current && latest >= 0.995) setArrived(true);
  });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const root = document.documentElement;
    const chromeObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) root.dataset.controlsActive = "true";
        else delete root.dataset.controlsActive;
      },
      { rootMargin: "-46% 0px -46% 0px", threshold: 0 },
    );
    const fieldObserver = new IntersectionObserver(
      ([entry]) => setFieldActive(entry.isIntersecting),
      { rootMargin: "45% 0px", threshold: 0 },
    );

    chromeObserver.observe(section);
    fieldObserver.observe(section);
    return () => {
      chromeObserver.disconnect();
      fieldObserver.disconnect();
      delete root.dataset.controlsActive;
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setActiveStep(3);
      setArrived(true);
      setGuidePhase("result");
    }
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (guidePhase !== "result" || lastAnnouncedIndex.current === guideIndex) return;

    lastAnnouncedIndex.current = guideIndex;
    setAnnouncement(
      `${transaction.decision}. ${transaction.speech} ${transaction.merchant}, ${transaction.amount}.`,
    );
  }, [guideIndex, guidePhase, transaction]);

  const selectTransaction = (value: string) => {
    const next = TRANSACTIONS.find((item) => item.id === value);
    if (!next) return;
    const nextIndex = TRANSACTIONS.findIndex((item) => item.id === next.id);

    if (prefersReducedMotion) {
      setActiveStep(3);
      setGuidePhase("result");
      setGuideIndex(nextIndex);
      setTransactionId(next.id);
      setAnnouncement(`${next.decision}. ${next.speech} ${next.merchant}, ${next.amount}.`);
      return;
    }

    const section = sectionRef.current;
    if (!section) return;
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const scrollRange = Math.max(0, section.offsetHeight - window.innerHeight);
    const destinationProgress = (nextIndex + 0.62) * TOUR_SEGMENT;

    window.scrollTo({
      top: sectionTop + scrollRange * destinationProgress,
      behavior: "smooth",
    });
  };

  const replayGuidedPurchase = () => {
    if (!arrived || guidePhase !== "result") return;

    setReplayCount((current) => current + 1);
    setAnnouncement(
      `${transaction.decision}. ${transaction.speech} ${transaction.merchant}, ${transaction.amount}.`,
    );
    reactToBurst();
    if (!prefersReducedMotion) {
      void mascotControls.start({
        scale: [1, 1.08, 0.98, 1],
        transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
      });
    }
  };

  const updateCardTilt = (event: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || isMobile) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 2);
    pointerY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 2);
  };

  const resetCardTilt = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  const reactToBurst = () => {
    if (prefersReducedMotion || isMobile) return;
    void burstControls.start({
      scale: [1, 1.025, 1],
      transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
    });
  };

  const finalStatus = transaction.id === "cash"
    ? "NO · Cash withdrawal is unavailable."
    : transaction.status === "approved"
      ? `ACCEPTED · ${transaction.amount} at ${transaction.merchant}.`
      : "DECLINED · Alcohol is a blocked category.";
  const statuses = [
    "Tap received.",
    "Merchant recognized.",
    "Card rule checked.",
    finalStatus,
  ];
  const guidedDecisionVisible = guidePhase === "result";
  const visibleStep = activeStep;
  const guidePrompt = transaction.speech;
  const guidePosition = guideIndex === 0
    ? "start"
    : guideIndex === TRANSACTIONS.length - 1
      ? "end"
      : "middle";

  return (
    <section
      id="controls"
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="controls-heading"
    >
      <div
        className={styles.stickyStage}
        onPointerMove={updateCardTilt}
        onPointerLeave={resetCardTilt}
      >
        <motion.div className={styles.fieldLayer} style={{ opacity: prefersReducedMotion ? 0.72 : fieldOpacity }}>
          <NeuralBackground
            className={styles.flowField}
            color="#b8a7e8"
            trailOpacity={0.13}
            particleCount={isMobile ? 180 : 500}
            speed={0.72}
            active={fieldActive}
            reducedMotion={prefersReducedMotion || isMobile}
            onPointerBurst={reactToBurst}
          />
        </motion.div>
        <div className={styles.vignette} aria-hidden="true" />

        <div className={styles.sceneContent}>
          <header className={styles.copy}>
            <h2 id="controls-heading">Every tap, checked.</h2>
            <TransitionPanel
              activeIndex={visibleStep}
              className={styles.statusTransition}
              variants={prefersReducedMotion ? undefined : isMobile ? MOBILE_STATUS_VARIANTS : STATUS_VARIANTS}
              transition={{ duration: prefersReducedMotion ? 0 : isMobile ? 0.26 : 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              {statuses.map((status, index) => (
                <p key={`${index}-${status}`} data-status={index === 3 ? transaction.status : undefined}>
                  {index === 3 ? <StatusIcon aria-hidden="true" /> : <span aria-hidden="true">0{index + 1}</span>}
                  {status}
                </p>
              ))}
            </TransitionPanel>
          </header>

          <div className={styles.visual}>
            <AnimatePresence mode="wait">
              {guidedDecisionVisible ? (
                <motion.div
                  key={`${transaction.id}-${transaction.decision}-${replayCount}`}
                  className={styles.decisionFlash}
                  data-status={transaction.status}
                  initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.72, filter: "blur(12px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 1.08, filter: "blur(8px)" }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] }}
                  aria-hidden="true"
                >
                  {transaction.decision}
                </motion.div>
              ) : null}
            </AnimatePresence>

            <motion.div
              className={styles.terminal}
              animate={{ opacity: 1, scale: visibleStep === 0 ? 0.94 : 1 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.46, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden="true"
            >
              <Nfc />
              <span>Tap</span>
            </motion.div>

            <motion.span
              className={styles.connection}
              aria-hidden="true"
              initial={false}
              animate={{ opacity: visibleStep >= 1 ? 1 : 0, scaleX: visibleStep >= 1 ? 1 : 0.12 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.46, ease: [0.22, 1, 0.36, 1] }}
            ><i /></motion.span>

            <motion.div className={styles.cardInteraction} animate={burstControls}>
              <MemberCard
                activeStep={visibleStep}
                reducedMotion={prefersReducedMotion}
                simplifiedMotion={isMobile}
                tiltX={tiltX}
                tiltY={tiltY}
              />
            </motion.div>

            <AnimatePresence mode="wait" initial={false}>
              {visibleStep === 2 ? (
                <motion.div
                  key={`${transaction.id}-rule`}
                  className={styles.ruleLabel}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ShieldCheck aria-hidden="true" />
                  <span><small>Category</small>{transaction.category}</span>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <AnimatePresence mode="wait" initial={false}>
              {visibleStep === 3 ? (
                <motion.div
                  key={`${transaction.id}-result`}
                  className={styles.resultLabel}
                  data-status={transaction.status}
                  initial={prefersReducedMotion ? false : { opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <StatusIcon aria-hidden="true" />
                  <span><small>Transaction</small>{transaction.merchant}</span>
                  <strong>{transaction.amount}</strong>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className={styles.guideDock}>
            <motion.button
              type="button"
              className={styles.guideMascot}
              data-position={guidePosition}
              data-phase={guidePhase}
              aria-label={`Replay ${transaction.label} result`}
              data-arrived={arrived ? "true" : undefined}
              disabled={!arrived || guidePhase !== "result"}
              onClick={replayGuidedPurchase}
              style={{
                left: prefersReducedMotion
                  ? `${((guideIndex + 0.5) / TRANSACTIONS.length) * 100}%`
                  : guideLeft,
                y: prefersReducedMotion ? 0 : guideHop,
                rotate: prefersReducedMotion ? 0 : guideTilt,
              }}
              animate={mascotControls}
              whileHover={prefersReducedMotion || isMobile ? undefined : { scale: 1.045 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
            >
              {/* The button keeps its own left/bob/hop animation, so the
                  scroll-driven arrival rides an inner wrapper instead — two
                  transforms on one element would fight. */}
              <motion.span
                className={styles.guideArrival}
                style={
                  arrived
                    ? undefined
                    : { x: arrivalX, y: arrivalY, rotate: arrivalRotate, opacity: arrivalOpacity }
                }
              >
                <AnimatePresence initial={false} mode="wait">
                  {arrived && guidePhase === "result" ? (
                    <motion.span
                      key={`${transaction.id}-speech`}
                      className={styles.guideBubble}
                      initial={prefersReducedMotion ? false : { opacity: 0, filter: "blur(5px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      exit={prefersReducedMotion ? undefined : { opacity: 0, filter: "blur(4px)" }}
                      transition={{ duration: prefersReducedMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <span>{guidePrompt}</span>
                    </motion.span>
                  ) : null}
                </AnimatePresence>
                <BoovCharacter
                  className={styles.guideCharacter}
                  size={94}
                  mode={
                    prefersReducedMotion
                      ? "idle"
                      : !arrived || guidePhase === "travelling"
                        ? "crawl"
                        : "idle"
                  }
                  wave={arrived && guidePhase === "result"}
                />
              </motion.span>
            </motion.button>

            <div className={styles.travelTrack} aria-hidden="true">
              <motion.span
                className={styles.travelProgress}
                style={{
                  scaleX: prefersReducedMotion
                    ? guideIndex / (TRANSACTIONS.length - 1)
                    : guideRouteProgress,
                }}
              />
              {TRANSACTIONS.map((item, index) => (
                <i
                  key={item.id}
                  data-state={index === guideIndex ? "current" : index < guideIndex ? "complete" : "upcoming"}
                />
              ))}
            </div>

            <Tabs value={transactionId} onValueChange={selectTransaction}>
              <TabsList className={styles.tabsList} aria-label="Try another purchase">
                {TRANSACTIONS.map((item) => {
                  const Icon = item.Icon;
                  return (
                    <TabsTrigger className={styles.tabTrigger} value={item.id} key={item.id}>
                      <Icon aria-hidden="true" />
                      <span>{item.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <ol className={styles.srOnly} aria-label="How Boov authorizes a purchase">
        {ACCESSIBLE_STEPS.map((step, index) => (
          <li key={step} aria-current={index === visibleStep ? "step" : undefined}>{step}</li>
        ))}
      </ol>
      <p className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </section>
  );
}
