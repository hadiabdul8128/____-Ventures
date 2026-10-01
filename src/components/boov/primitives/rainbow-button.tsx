import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";
import styles from "./primitives.module.css";
export type RainbowButtonVariant = "default" | "outline";
export type RainbowButtonSize = "default" | "sm" | "lg" | "icon";
export interface RainbowButtonVariantsOptions {
  variant?: RainbowButtonVariant | null;
  size?: RainbowButtonSize | null;
  className?: string;
}
export function rainbowButtonVariants({
  variant,
  size,
  className,
}: RainbowButtonVariantsOptions = {}) {
  return cn(
    styles.rainbow,
    variant === "outline" && styles.outline,
    size === "sm" && styles.small,
    size === "lg" && styles.large,
    size === "icon" && styles.icon,
    className,
  );
}
export interface RainbowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: RainbowButtonVariant | null;
  size?: RainbowButtonSize | null;
  asChild?: boolean;
  enabled?: boolean;
}
/** Boov's spectral edge, recolored into champagne, brass, and warm white. */
export const RainbowButton = forwardRef<HTMLButtonElement, RainbowButtonProps>(
  function RainbowButton(
    { variant, size, asChild = false, enabled = true, className, ...props },
    ref,
  ) {
    const Component = asChild ? Slot.Root : "button";
    return (
      <Component
        ref={ref}
        className={rainbowButtonVariants({ variant, size, className })}
        data-motion={enabled ? "on" : "off"}
        {...props}
      />
    );
  },
);
