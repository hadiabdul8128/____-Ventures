"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * MagicUI Rainbow Button — hand-vendored for Tailwind 3.4.19.
 *
 * Adaptations from the upstream registry item (which targets Tailwind v4):
 *  - `cva` / `class-variance-authority` replaced with a local variant resolver
 *    so no new npm dependency is required. The exported `rainbowButtonVariants`
 *    keeps the same call signature: `rainbowButtonVariants({ variant, size, className })`.
 *  - `@radix-ui/react-slot` replaced with a `cloneElement` implementation of
 *    `asChild` (the installed Slot 1.3.0 ships React 19 types).
 *  - The `animate-rainbow` utility + `rainbow` keyframes come from
 *    tailwind.config.ts `theme.extend` instead of a v4 `@theme` block.
 *  - `--color-1..--color-5` are plain CSS custom properties in app/globals.css.
 *  - Arbitrary background-image values use the explicit `bg-[image:...]` hint,
 *    which v3's arbitrary-value type inference wants for multi-layer gradients.
 *  - shadcn tokens that do not exist in this repo (`text-primary-foreground`,
 *    `border-input`, `text-accent-foreground`, `border-destructive`) are mapped
 *    onto the Boov CSS custom properties.
 *
 * NOTE: every class string below is written out literally on purpose. Tailwind
 * scans source files as plain text, so these must never be built by string
 * interpolation or the utilities will not be generated.
 *
 * Animation speed is controlled by `--speed` (default 2s):
 *   <RainbowButton style={{ "--speed": "3s" } as React.CSSProperties} />
 */

export type RainbowButtonVariant = "default" | "outline";
export type RainbowButtonSize = "default" | "sm" | "lg" | "icon";

const rainbowButtonBase = cn(
  "relative cursor-pointer group transition-all animate-rainbow",
  "inline-flex items-center justify-center gap-2 shrink-0",
  "rounded-sm outline-none",
  "focus-visible:ring-[3px] focus-visible:ring-[color:var(--boov-lavender)]",
  "text-sm font-medium whitespace-nowrap",
  "disabled:pointer-events-none disabled:opacity-50",
  "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
);

const rainbowButtonVariantClasses: Record<RainbowButtonVariant, string> = {
  default: cn(
    "border-0 text-[color:var(--accent-contrast)]",
    "bg-[image:linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]",
    "bg-[length:200%]",
    "[background-clip:padding-box,border-box,border-box] [background-origin:border-box]",
    "[border:calc(0.125rem)_solid_transparent]",
    "before:absolute before:content-[''] before:bottom-[-20%] before:left-1/2 before:z-0",
    "before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow",
    "before:bg-[image:linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]",
    "before:bg-[length:200%] before:[filter:blur(0.75rem)]",
    "dark:bg-[image:linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]",
  ),
  outline: cn(
    "border border-[color:var(--tech-line)] border-b-transparent text-[color:var(--ink-warm)]",
    "bg-[image:linear-gradient(#ffffff,#ffffff),linear-gradient(#ffffff_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]",
    "bg-[length:200%]",
    "[background-clip:padding-box,border-box,border-box] [background-origin:border-box]",
    "before:absolute before:content-[''] before:bottom-[-20%] before:left-1/2 before:z-0",
    "before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow",
    "before:bg-[image:linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]",
    "before:bg-[length:200%] before:[filter:blur(0.75rem)]",
    "dark:bg-[image:linear-gradient(#0a0a0a,#0a0a0a),linear-gradient(#0a0a0a_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]",
  ),
};

const rainbowButtonSizeClasses: Record<RainbowButtonSize, string> = {
  default: "h-9 px-4 py-2",
  sm: "h-8 rounded-xl px-3 text-xs",
  lg: "h-11 rounded-xl px-8",
  icon: "size-9",
};

export interface RainbowButtonVariantsOptions {
  variant?: RainbowButtonVariant | null;
  size?: RainbowButtonSize | null;
  className?: string;
}

export function rainbowButtonVariants(
  options: RainbowButtonVariantsOptions = {},
): string {
  const { variant, size, className } = options;
  return cn(
    rainbowButtonBase,
    rainbowButtonVariantClasses[variant ?? "default"],
    rainbowButtonSizeClasses[size ?? "default"],
    className,
  );
}

export interface RainbowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: RainbowButtonVariant | null;
  size?: RainbowButtonSize | null;
  /** Render the single child element instead of a <button>, merging classes/props. */
  asChild?: boolean;
}

const RainbowButton = React.forwardRef<HTMLButtonElement, RainbowButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const classes = rainbowButtonVariants({ variant, size, className });

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<Record<string, unknown>>;
      const childProps = child.props as Record<string, unknown>;

      return React.cloneElement(child, {
        ...props,
        ...childProps,
        ref,
        "data-slot": "button",
        className: cn(classes, childProps.className as string | undefined),
      } as React.Attributes & Record<string, unknown>);
    }

    return (
      <button data-slot="button" className={classes} ref={ref} {...props}>
        {children}
      </button>
    );
  },
);

RainbowButton.displayName = "RainbowButton";

export { RainbowButton };
