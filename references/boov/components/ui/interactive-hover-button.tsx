import * as React from "react";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

export interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Convenience alias for the button label, matching the older MagicUI API
   * (`<InteractiveHoverButton text="Get started" />`). `children` wins if both
   * are supplied.
   */
  text?: string;
}

/**
 * MagicUI `interactive-hover-button`, hand-vendored for Tailwind 3.4.
 *
 * Registry source used shadcn semantic tokens (`bg-background`, `bg-primary`,
 * `text-primary-foreground`) which do not exist in this repo's tailwind config.
 * They are mapped to the Boov CSS custom properties instead, so the button
 * follows the light/dark theme with no config or globals changes:
 *   background  -> var(--bone-2)      label -> var(--ink-warm)
 *   border      -> var(--tech-line)   dot   -> var(--accent-deep)
 *   dot label   -> var(--bone)        (flips with the theme, so it always
 *                                      contrasts the --accent-deep fill)
 */
export function InteractiveHoverButton({
  children,
  text,
  className,
  ...props
}: InteractiveHoverButtonProps) {
  const label = children ?? text;

  return (
    <button
      className={cn(
        "group relative w-auto cursor-pointer overflow-hidden rounded-full border p-2 px-6 text-center font-semibold",
        "border-[var(--tech-line)] bg-[var(--bone-2)] text-[var(--ink-warm)]",
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        <div className="h-2 w-2 rounded-full bg-[var(--accent-deep)] transition-all duration-300 group-hover:scale-[100.8]"></div>
        <span className="inline-block transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
          {label}
        </span>
      </div>
      <div className="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-[var(--bone)] opacity-0 transition-all duration-300 group-hover:-translate-x-5 group-hover:opacity-100">
        <span>{label}</span>
        <ArrowRight className="size-4" aria-hidden="true" />
      </div>
    </button>
  );
}

export default InteractiveHoverButton;
