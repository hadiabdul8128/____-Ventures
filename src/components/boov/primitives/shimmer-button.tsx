import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
} from "react";
import { cn } from "@/lib/utils";
import styles from "./primitives.module.css";
export interface ShimmerButtonProps extends ComponentPropsWithoutRef<"button"> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  enabled?: boolean;
}
export const ShimmerButton = forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  function ShimmerButton(
    {
      shimmerColor = "#cfb679",
      shimmerSize = "1px",
      borderRadius = "1px",
      shimmerDuration = "6s",
      background = "#11120e",
      enabled = true,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(styles.shimmer, className)}
        data-motion={enabled ? "on" : "off"}
        style={
          {
            "--shimmer-color": shimmerColor,
            "--cut": shimmerSize,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--bg": background,
            ...style,
          } as CSSProperties
        }
        {...props}
      >
        {children}
      </button>
    );
  },
);
export default ShimmerButton;
