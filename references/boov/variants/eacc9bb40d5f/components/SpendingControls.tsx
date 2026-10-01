"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Banknote,
  BusFront,
  Check,
  LockKeyhole,
  Pill,
  Radio,
  ReceiptText,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
  WashingMachine,
  Wine,
  X,
  type LucideIcon,
} from "lucide-react";
import { useLenis } from "@/lib/SmoothScroll";
import styles from "./SpendingControls.module.css";

type ControlStep = {
  id: string;
  label: string;
  merchant: string;
  location: string;
  amount: string;
  rule: string;
  result: string;
  tone: "allow" | "block";
  Icon: LucideIcon;
};

const CONTROL_STEPS: ControlStep[] = [
  {
    id: "groceries",
    label: "Groceries",
    merchant: "9th Street Market",
    location: "Grocery · 0.3 mi",
    amount: "$18.40",
    rule: "Essential food merchant verified",
    result: "Approved",
    tone: "allow",
    Icon: ShoppingBasket,
  },
  {
    id: "pharmacy",
    label: "Pharmacy",
    merchant: "Community Pharmacy",
    location: "Health · Avenue A",
    amount: "$6.25",
    rule: "Prescription and care category verified",
    result: "Approved",
    tone: "allow",
    Icon: Pill,
  },
  {
    id: "transit",
    label: "Transit",
    merchant: "M14 Select Bus",
    location: "Transit · 8th Avenue",
    amount: "$2.90",
    rule: "Public transportation network verified",
    result: "Approved",
    tone: "allow",
    Icon: BusFront,
  },
  {
    id: "cash",
    label: "Cash withdrawal",
    merchant: "ATM · Bowery",
    location: "Cash access · 0.1 mi",
    amount: "$40.00",
    rule: "Cash conversion is outside the essentials rail",
    result: "Locked",
    tone: "block",
    Icon: Banknote,
  },
  {
    id: "liquor",
    label: "Liquor",
    merchant: "Bottle Shop",
    location: "Restricted retail · 1st Avenue",
    amount: "$12.00",
    rule: "Merchant category is restricted",
    result: "Declined",
    tone: "block",
    Icon: Wine,
  },
  {
    id: "hygiene",
    label: "Hygiene",
    merchant: "Wash & Fold",
    location: "Laundry · 11th Street",
    amount: "$8.75",
    rule: "Essential hygiene service verified",
    result: "Approved",
    tone: "allow",
    Icon: WashingMachine,
  },
];

export function SpendingControls() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const lenis = useLenis();
  const prefersReducedMotion = useReducedMotion();
  const active = CONTROL_STEPS[activeIndex];
  const ActiveIcon = active.Icon;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 34,
    mass: 0.24,
    restDelta: 0.0005,
  });

  useMotionValueEvent(smoothProgress, "change", (latest) => {
    if (prefersReducedMotion) return;
    const nextIndex = Math.min(
      CONTROL_STEPS.length - 1,
      Math.round(latest * (CONTROL_STEPS.length - 1)),
    );
    setActiveIndex((current) => (current === nextIndex ? current : nextIndex));
  });

  const progressScale = useTransform(smoothProgress, [0, 1], [0.02, 1]);
  const beamY = useTransform(smoothProgress, [0, 1], ["10%", "88%"]);
  const gridY = useTransform(smoothProgress, [0, 1], ["0px", "-72px"]);
  const cardRotate = useTransform(smoothProgress, [0, 0.24, 0.5, 0.76, 1], [-7, 5, -4, 6, -3]);
  const cardY = useTransform(smoothProgress, [0, 0.5, 1], [12, -8, 5]);

  const goToStep = (index: number) => {
    setActiveIndex(index);
    if (prefersReducedMotion || !sectionRef.current) return;

    const section = sectionRef.current;
    const range = Math.max(0, section.offsetHeight - window.innerHeight);
    const target = section.offsetTop + (index / (CONTROL_STEPS.length - 1)) * range;

    if (lenis) {
      lenis.scrollTo(target, { duration: 0.72, force: true });
    } else {
      window.scrollTo({ top: target, behavior: "smooth" });
    }
  };

  return (
    <section id="controls" ref={sectionRef} className={styles.section} aria-labelledby="controls-heading">
      <div className={styles.stickyStage}>
        <div className={styles.ambient} aria-hidden="true">
          <motion.div className={styles.ambientGrid} style={{ y: prefersReducedMotion ? 0 : gridY }} />
          <div className={styles.orbitOne} />
          <div className={styles.orbitTwo} />
        </div>

        <div className={styles.inner}>
          <header className={styles.head}>
            <div>
              <p className={styles.kicker}>03 — What the card locks to</p>
              <h2 id="controls-heading" className={styles.title}>
                It reads the purchase.
                <br />
                {" Then decides."}
              </h2>
            </div>
            <p className={styles.lead}>
              Every tap moves through a live essentials filter before a dollar can move.
            </p>
          </header>

          <div className={styles.console} data-tone={active.tone}>
            <div className={styles.consoleBar}>
              <span className={styles.consoleIdentity}>
                <Radio size={13} aria-hidden="true" />
                BOOV CONTROL LAYER
              </span>
              <span className={styles.liveState}>
                <span aria-hidden="true" /> Live authorization
              </span>
              <span className={styles.sequence}>
                {String(activeIndex + 1).padStart(2, "0")} / {String(CONTROL_STEPS.length).padStart(2, "0")}
              </span>
            </div>

            <div className={styles.consoleGrid}>
              <nav className={styles.stepRail} aria-label="Purchase categories">
                {CONTROL_STEPS.map((step, index) => {
                  const StepIcon = step.Icon;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      className={styles.stepButton}
                      data-active={index === activeIndex}
                      data-tone={step.tone}
                      aria-pressed={index === activeIndex}
                      onClick={() => goToStep(index)}
                    >
                      <span className={styles.stepIndex}>{String(index + 1).padStart(2, "0")}</span>
                      <StepIcon size={16} strokeWidth={1.8} aria-hidden="true" />
                      <span>{step.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className={styles.scanner} aria-hidden="true">
                <div className={styles.scannerAxis} />
                <div className={styles.scannerTarget}>
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <motion.div className={styles.scannerBeam} style={{ top: prefersReducedMotion ? "52%" : beamY }} />

                <motion.div
                  className={styles.miniCard}
                  style={{ rotate: prefersReducedMotion ? -3 : cardRotate, y: prefersReducedMotion ? 0 : cardY }}
                >
                  <div className={styles.cardTopline}>
                    <span className={styles.orbitMark}><i /></span>
                    <span>boov</span>
                    <Sparkles size={15} />
                  </div>
                  <div className={styles.cardChip} />
                  <div className={styles.cardNumber}>•••• 0427</div>
                  <div className={styles.cardBottom}>ESSENTIALS</div>
                </motion.div>

                <AnimatePresence initial={false}>
                  <motion.div
                    key={active.id}
                    className={styles.merchantPing}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 6, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4, scale: 1 }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                  >
                    <ActiveIcon size={17} aria-hidden="true" />
                    <span>{active.merchant}</span>
                    <strong>{active.amount}</strong>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className={styles.decision} aria-live="polite">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={active.id}
                    className={styles.decisionInner}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    <div className={styles.resultTopline}>
                      <span className={styles.resultIcon} data-tone={active.tone}>
                        {active.tone === "allow" ? <Check size={19} /> : <X size={19} />}
                      </span>
                      <span className={styles.resultLabel}>{active.result}</span>
                      <strong>{active.amount}</strong>
                    </div>

                    <div className={styles.merchantDetail}>
                      <span>{active.label}</span>
                      <h3>{active.merchant}</h3>
                      <p>{active.location}</p>
                    </div>

                    <div className={styles.trace}>
                      <div data-complete="true">
                        <span><Radio size={13} /></span>
                        <p><small>01 · Tap read</small>Card and merchant recognized</p>
                      </div>
                      <div data-complete="true">
                        <span><ShieldCheck size={13} /></span>
                        <p><small>02 · Rule match</small>{active.rule}</p>
                      </div>
                      <div data-complete={active.tone === "allow"} data-blocked={active.tone === "block"}>
                        <span>{active.tone === "allow" ? <ReceiptText size={13} /> : <LockKeyhole size={13} />}</span>
                        <p>
                          <small>03 · Final route</small>
                          {active.tone === "allow" ? "Payment released to merchant" : "Balance remains on the card"}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className={styles.routeMap}>
              <div className={styles.routeLabel}>
                <ShieldCheck size={15} aria-hidden="true" />
                <span><small>Open rail</small>Groceries · Pharmacy · Transit · Hygiene</span>
              </div>
              <div className={styles.routeTrack} aria-hidden="true">
                <motion.span style={{ scaleX: prefersReducedMotion ? 1 : progressScale }} />
                {CONTROL_STEPS.map((step, index) => (
                  <i key={step.id} data-passed={index <= activeIndex} data-tone={step.tone} />
                ))}
              </div>
              <div className={styles.routeLabelBlocked}>
                <LockKeyhole size={15} aria-hidden="true" />
                <span><small>Locked rail</small>Cash · Liquor · Gambling · Tobacco</span>
              </div>
            </div>
          </div>

          <div className={styles.chapterProgress} aria-hidden="true">
            <span>FILTER 03</span>
            <div><motion.i style={{ scaleX: prefersReducedMotion ? 1 : progressScale }} /></div>
            <span>{Math.round(((activeIndex + 1) / CONTROL_STEPS.length) * 100)}%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
