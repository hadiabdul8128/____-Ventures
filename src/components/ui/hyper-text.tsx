import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type RefAttributes,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type DOMMotionComponents,
  type HTMLMotionProps,
  type MotionProps,
} from "motion/react";

import { cn } from "@/lib/utils";

type CharacterSet = string[] | readonly string[];

const motionElements = {
  article: motion.article,
  div: motion.div,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  h5: motion.h5,
  h6: motion.h6,
  li: motion.li,
  p: motion.p,
  section: motion.section,
  span: motion.span,
} as const;

type MotionElementType = Extract<
  keyof DOMMotionComponents,
  keyof typeof motionElements
>;
type HyperTextMotionComponent = ComponentType<
  Omit<HTMLMotionProps<"div">, "ref"> & RefAttributes<HTMLElement>
>;

interface HyperTextProps extends Omit<MotionProps, "children"> {
  /** The text content to be animated */
  children: string;
  /** Optional opening phrase that resolves into the final text. */
  initialText?: string;
  /** Optional className for styling */
  className?: string;
  /** Duration of the animation in milliseconds */
  duration?: number;
  /** Delay before animation starts in milliseconds */
  delay?: number;
  /** Component to render as - defaults to div */
  as?: MotionElementType;
  /** Whether to start animation when element comes into view */
  startOnView?: boolean;
  /** Whether to trigger animation on hover */
  animateOnHover?: boolean;
  /** Custom character set for scramble effect. Defaults to uppercase alphabet */
  characterSet?: CharacterSet;
}

const DEFAULT_CHARACTER_SET = Object.freeze(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
) as readonly string[];

const getRandomInt = (max: number): number => Math.floor(Math.random() * max);

export function HyperText({
  children,
  initialText,
  className,
  duration = 800,
  delay = 0,
  as: Component = "div",
  startOnView = false,
  animateOnHover = true,
  characterSet = DEFAULT_CHARACTER_SET,
  ...props
}: HyperTextProps) {
  const MotionComponent = motionElements[Component] as HyperTextMotionComponent;
  const reducedMotion = useReducedMotion();

  const [displayText, setDisplayText] = useState<string[]>(() =>
    (initialText ?? children).split(""),
  );
  const [phase, setPhase] = useState<"initial" | "scramble" | "settled">(
    "initial",
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const iterationCount = useRef(0);
  const elementRef = useRef<HTMLElement | null>(null);

  const handleAnimationTrigger = () => {
    if (
      animateOnHover &&
      !reducedMotion &&
      !isAnimating &&
      phase === "settled"
    ) {
      iterationCount.current = 0;
      setIsAnimating(true);
    }
  };

  // Handle animation start based on view or delay
  useEffect(() => {
    if (reducedMotion) {
      setIsAnimating(false);
      setDisplayText(children.split(""));
      setPhase("settled");
      return;
    }
    setDisplayText((initialText ?? children).split(""));
    setPhase("initial");
    let startTimeout: ReturnType<typeof setTimeout> | undefined;
    if (!startOnView) {
      startTimeout = setTimeout(() => {
        setIsAnimating(true);
      }, delay);
      return () => clearTimeout(startTimeout);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startTimeout = setTimeout(() => {
            setIsAnimating(true);
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "-30% 0px -30% 0px" },
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
      clearTimeout(startTimeout);
    };
  }, [children, initialText, delay, startOnView, reducedMotion]);

  // Handle scramble animation
  useEffect(() => {
    let animationFrameId: number | null = null;

    if (isAnimating && !reducedMotion) {
      setPhase("scramble");
      const maxIterations = children.length;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = duration <= 0 ? 1 : Math.min(elapsed / duration, 1);

        iterationCount.current = progress * maxIterations;

        setDisplayText(
          children
            .split("")
            .map((letter, index) =>
              letter === " "
                ? letter
                : index <= iterationCount.current
                  ? children[index]
                  : characterSet.length
                    ? characterSet[getRandomInt(characterSet.length)]
                    : letter,
            ),
        );

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
          setPhase("settled");
        }
      };

      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [children, duration, isAnimating, characterSet, reducedMotion]);

  return (
    <MotionComponent
      ref={elementRef}
      className={cn("overflow-hidden py-2 text-4xl font-bold", className)}
      onMouseEnter={handleAnimationTrigger}
      data-hyper-phase={reducedMotion ? "settled" : phase}
      {...props}
    >
      <AnimatePresence>
        {(reducedMotion ? children.split("") : displayText).map(
          (letter, index) => (
            <motion.span
              key={index}
              className={cn("font-mono", letter === " " ? "w-3" : "")}
            >
              {letter === " " ? "\u00a0" : letter}
            </motion.span>
          ),
        )}
      </AnimatePresence>
    </MotionComponent>
  );
}
