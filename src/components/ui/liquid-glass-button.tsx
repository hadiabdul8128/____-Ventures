import { useId, type ComponentProps } from "react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

/** Monochrome adaptation of the supplied liquid-glass button. */
export function LiquidButton({
  asChild = false,
  children,
  className,
  size = "default",
  ...props
}: ComponentProps<"button"> & {
  asChild?: boolean;
  size?: "default" | "sm" | "icon";
}) {
  const id = `glass-${useId().replace(/:/g, "")}`;
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      className={cn("liquid-button", className)}
      data-size={size}
      {...props}
    >
      <span
        className="liquid-button-refraction"
        aria-hidden="true"
        style={{ backdropFilter: `blur(8px) url(#${id})` }}
      />
      <span className="liquid-button-edge" aria-hidden="true" />
      <Slot.Slottable>{children}</Slot.Slottable>
      <svg className="glass-filter" aria-hidden="true" focusable="false">
        <defs>
          <filter
            id={id}
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.05 0.05"
              numOctaves="1"
              seed="1"
              result="turbulence"
            />
            <feGaussianBlur
              in="turbulence"
              stdDeviation="2"
              result="blurredNoise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="blurredNoise"
              scale="30"
              xChannelSelector="R"
              yChannelSelector="B"
            />
          </filter>
        </defs>
      </svg>
    </Comp>
  );
}
