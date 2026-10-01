"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { SmoothScroll } from "@/lib/SmoothScroll";
import { Cursor } from "./Cursor";
import { Preloader } from "./Preloader";
import { ScrollReset } from "./ScrollReset";
import { TechnicalOverlay } from "./TechnicalOverlay";

// WebGL background is client-only (R3F) and lazy so it never blocks first paint.
const FluidBackground = dynamic(() => import("./FluidBackground"), { ssr: false });

/**
 * Site chrome + interaction layer: preloader, custom cursor, reactive WebGL
 * background, and the Lenis smooth-scroll context wrapping all page content.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Preloader />
      <Cursor />
      <FluidBackground />
      <TechnicalOverlay />
      <SmoothScroll>
        <ScrollReset />
        <div className="page-content">{children}</div>
      </SmoothScroll>
    </>
  );
}
