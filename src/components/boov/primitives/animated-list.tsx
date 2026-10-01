import {
  Children,
  useEffect,
  useMemo,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export function AnimatedListItem({
  children,
  enabled = true,
}: {
  children: ReactNode;
  enabled?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={enabled && !reducedMotion ? { opacity: 0, y: 14 } : false}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
export interface AnimatedListProps extends ComponentPropsWithoutRef<"div"> {
  delay?: number;
  enabled?: boolean;
}
export function AnimatedList({
  children,
  className,
  delay = 800,
  enabled = true,
  ...props
}: AnimatedListProps) {
  const reducedMotion = useReducedMotion();
  const items = useMemo(() => Children.toArray(children), [children]);
  const [count, setCount] = useState(1);
  const animate = enabled && !reducedMotion;
  useEffect(() => {
    if (!animate || count >= items.length) return;
    const timeout = window.setTimeout(
      () => setCount((value) => value + 1),
      delay,
    );
    return () => window.clearTimeout(timeout);
  }, [animate, count, delay, items.length]);
  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <AnimatePresence>
        {items.slice(0, animate ? count : items.length).map((child, index) => (
          <AnimatedListItem key={index} enabled={animate}>
            {child}
          </AnimatedListItem>
        ))}
      </AnimatePresence>
    </div>
  );
}
