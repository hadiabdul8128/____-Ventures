import type { ReactNode } from "react";
import {
  AnimatePresence,
  useReducedMotion,
  motion,
  type MotionProps,
  type Transition,
  type Variant,
} from "motion/react";
import { cn } from "@/lib/utils";

export type TransitionPanelProps = {
  children: ReactNode[];
  enabled?: boolean;
  className?: string;
  transition?: Transition;
  activeIndex: number;
  variants?: { enter: Variant; center: Variant; exit: Variant };
} & MotionProps;

export function TransitionPanel({
  children,
  enabled = true,
  className,
  transition,
  variants,
  activeIndex,
  ...motionProps
}: TransitionPanelProps) {
  const reducedMotion = useReducedMotion();
  return (
    <div className={cn("relative", className)}>
      <AnimatePresence initial={false} mode="wait" custom={motionProps.custom}>
        <motion.div
          key={activeIndex}
          variants={enabled && !reducedMotion ? variants : undefined}
          transition={enabled && !reducedMotion ? transition : { duration: 0 }}
          initial="enter"
          animate="center"
          exit="exit"
          {...motionProps}
        >
          {children[activeIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
