import type { ButtonHTMLAttributes } from "react";
import { InteractiveHoverButton as VentureHoverButton } from "@/components/ui/interactive-hover-button";

export interface InteractiveHoverButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}
/** Keeps Boov's text alias while sharing the accessible venture button. */
export function InteractiveHoverButton({
  text,
  children,
  ...props
}: InteractiveHoverButtonProps) {
  return <VentureHoverButton {...props}>{children ?? text}</VentureHoverButton>;
}
export default InteractiveHoverButton;
