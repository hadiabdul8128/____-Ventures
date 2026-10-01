import { useId, useRef, useState, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { useInView, useReducedMotion } from "motion/react";
import NeuralBackground from "./primitives/flow-field-background";
import KineticGrid from "./primitives/kinetic-grid";
import InteractiveGrid from "./primitives/interactive-grid";
import { AnimatedCircularProgressBar } from "./primitives/animated-circular-progress-bar";
import { AnimatedList } from "./primitives/animated-list";
import { TransitionPanel } from "./primitives/transition-panel";
import { ShimmerButton } from "./primitives/shimmer-button";
import styles from "./NetworkAtelier.module.css";

const chapters = ["Origins", "Conviction", "Connection"];
const origins = [
  {
    name: "Harvard",
    note: "Ideas with an independent point of view.",
    number: "I",
  },
  { name: "MIT", note: "Technical depth. Expansive ambition.", number: "II" },
  {
    name: "& beyond",
    note: "Exceptional founders, wherever they begin.",
    number: "III",
  },
];
const themes = [
  {
    name: "Deep tech",
    word: "INVENT",
    note: "From a new possibility to a new category.",
  },
  {
    name: "Intelligence",
    word: "THINK",
    note: "New ways to understand. New ways to build.",
  },
  {
    name: "Tomorrow",
    word: "CREATE",
    note: "The ideas that move the world forward.",
  },
];
const steps = [
  {
    title: "A shared ambition.",
    note: "First, the people. Then, what they see in the world.",
    line: "A conversation with the founder",
  },
  {
    title: "A considered fit.",
    note: "The right perspective brings an idea into focus.",
    line: "A thoughtful investor match",
  },
  {
    title: "A direct connection.",
    note: "An introduction. The beginning of what comes next.",
    line: "A personal introduction",
  },
];

/** Interactive network study adapted from Boov's grid, flow, and chapter primitives. */
export default function NetworkAtelier({ enabled }: { enabled: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.05 });
  const id = useId().replace(/:/g, "");
  const [chapter, setChapter] = useState(0);
  const [origin, setOrigin] = useState(0);
  const [theme, setTheme] = useState(0);
  const [step, setStep] = useState(0);
  const reducedMotion = useReducedMotion();
  const animate = enabled && !reducedMotion && inView;

  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % chapters.length;
    else if (event.key === "ArrowLeft")
      next = (index + chapters.length - 1) % chapters.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = chapters.length - 1;
    else return;
    event.preventDefault();
    setChapter(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  }

  return (
    <div
      ref={rootRef}
      className={styles.atelier}
      data-motion={animate ? "on" : "off"}
    >
      <div
        className={styles.tabs}
        role="tablist"
        aria-label="Explore the network"
      >
        {chapters.map((title, index) => (
          <button
            key={title}
            id={`${id}-tab-${index}`}
            type="button"
            role="tab"
            aria-selected={chapter === index}
            aria-controls={`${id}-panel`}
            tabIndex={chapter === index ? 0 : -1}
            onClick={() => setChapter(index)}
            onKeyDown={(event) => moveTab(event, index)}
          >
            <span>0{index + 1}</span>
            {title}
          </button>
        ))}
      </div>
      <div
        className={styles.panel}
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${chapter}`}
        tabIndex={0}
      >
        {chapter === 0 && (
          <div className={styles.origins}>
            <div className={styles.field}>
              <NeuralBackground
                active={animate}
                reducedMotion={!animate}
                particleCount={150}
                speed={0.3}
                color="#b89a5a"
              />
            </div>
            <div className={styles.constellation}>
              <svg
                className={styles.diagram}
                viewBox="0 0 500 340"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="250" cy="170" r="132" />
                <circle cx="250" cy="170" r="104" strokeDasharray="1 9" />
                <ellipse
                  cx="250"
                  cy="170"
                  rx="218"
                  ry="83"
                  transform="rotate(-20 250 170)"
                />
                <path d="M250 170L110 65M250 170L396 93M250 170L294 303" />
                <circle cx="250" cy="170" r="63" className={styles.innerDisc} />
              </svg>
              <div className={styles.centerMark} aria-hidden="true">
                {origins[origin].number}
              </div>
              {origins.map((item, index) => (
                <button
                  key={item.name}
                  type="button"
                  className={styles.origin}
                  data-position={index}
                  aria-pressed={origin === index}
                  onClick={() => setOrigin(index)}
                >
                  <span className={styles.pin} />
                  {item.name}
                </button>
              ))}
              <span className={styles.coordinate}>42° 22′ N / 71° 07′ W</span>
            </div>
            <div className={styles.caption} aria-live="polite">
              <span>{origins[origin].name}</span>
              <p>{origins[origin].note}</p>
            </div>
          </div>
        )}
        {chapter === 1 && (
          <div className={styles.conviction}>
            <KineticGrid
              enabled={animate}
              autoActivate={false}
              className={styles.kinetic}
            >
              <span className={styles.smallLabel}>
                A belief in what comes next
              </span>
              <InteractiveGrid
                key={themes[theme].word}
                text={themes[theme].word}
                active={animate}
                reducedMotion={!animate}
                dotSize={3}
                gap={3}
                baseColor="#d1b574"
                activeColor="#f4e5c1"
                localizedReveal
                className={styles.wordGrid}
              >
                <span>{themes[theme].word}</span>
              </InteractiveGrid>
              <span className={styles.gesture}>
                Move closer. See the possibility.
              </span>
            </KineticGrid>
            <div
              className={styles.themeChoices}
              aria-label="Areas of possibility"
            >
              {themes.map((item, index) => (
                <button
                  key={item.name}
                  type="button"
                  aria-pressed={theme === index}
                  onClick={() => setTheme(index)}
                >
                  {item.name}
                  <Plus size={12} aria-hidden="true" />
                </button>
              ))}
            </div>
            <p className={styles.themeNote} aria-live="polite">
              {themes[theme].note}
            </p>
          </div>
        )}
        {chapter === 2 && (
          <div className={styles.connection}>
            <div className={styles.progress}>
              <AnimatedCircularProgressBar
                value={((step + 1) / 3) * 100}
                gaugePrimaryColor="#cfb679"
                gaugeSecondaryColor="#29291f"
                className={styles.gauge}
              >
                <span>0{step + 1}</span>
              </AnimatedCircularProgressBar>
            </div>
            <TransitionPanel
              activeIndex={step}
              enabled={animate}
              className={styles.stepPanels}
              transition={{ duration: 0.4 }}
              variants={{
                enter: { opacity: 0, y: 10 },
                center: { opacity: 1, y: 0 },
                exit: { opacity: 0, y: -10 },
              }}
            >
              {steps.map((item) => (
                <div key={item.title}>
                  <h4>{item.title}</h4>
                  <p>{item.note}</p>
                </div>
              ))}
            </TransitionPanel>
            <AnimatedList
              key={step}
              enabled={animate}
              className={styles.stepList}
            >
              <div>
                <span>0{step + 1} / 03</span>
                {steps[step].line}
              </div>
            </AnimatedList>
            <div className={styles.stepControls}>
              <button
                type="button"
                onClick={() => setStep((value) => Math.max(0, value - 1))}
                disabled={step === 0}
                aria-label="Previous introduction step"
              >
                <ArrowLeft size={18} aria-hidden="true" />
              </button>
              <ShimmerButton
                enabled={animate}
                onClick={() => setStep((value) => (value + 1) % steps.length)}
              >
                {step === 2 ? "Begin again" : "Explore the next step"}
                <ArrowRight size={15} aria-hidden="true" />
              </ShimmerButton>
            </div>
          </div>
        )}
      </div>
      <div className={styles.footnote}>
        <span className={styles.rule} />
        <span>A network built around people.</span>
        <span>____</span>
      </div>
    </div>
  );
}

export { NetworkAtelier };
