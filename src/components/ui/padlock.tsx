import type { ComponentProps, CSSProperties } from "react";
import { Padlock as HairlinePadlock } from "@lucasmarkes/hairline/react";

/** Original MIT-licensed Hairline padlock by Lucas Marques. */
export default function Padlock({ style, ...props }: ComponentProps<typeof HairlinePadlock>) {
  const palette = {
    "--hairline-plate": "var(--bg)",
    "--hairline-hi": "var(--text)",
    "--hairline-edge": "var(--muted)",
    "--hairline-mid": "color-mix(in oklab, var(--muted) 55%, var(--bg))",
    "--hairline-lo": "var(--line)",
  } as CSSProperties;
  return <HairlinePadlock {...props} style={{ ...palette, ...style }} />;
}
