"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { useLenis } from "@/lib/SmoothScroll";

/**
 * On route changes: snap scroll to the top (or to the URL hash target) and
 * re-measure ScrollTrigger against the new page height. `force: true`
 * overrides an in-flight Lenis animation — without it, navigating mid-scroll
 * lands the new route partway down (lenis#319). Skips the very first mount so
 * it never clobbers the browser's initial position or a direct hash load, and
 * falls back to native scrolling when Lenis is disabled (reduced motion).
 */
export function ScrollReset() {
  const lenis = useLenis();
  const pathname = usePathname();
  const lastPathname = useRef(pathname);

  useEffect(() => {
    if (lastPathname.current === pathname) return;
    lastPathname.current = pathname;

    const hash = window.location.hash;
    const target = hash ? document.getElementById(hash.slice(1)) : null;

    if (lenis) {
      if (target) lenis.scrollTo(target, { immediate: true, force: true });
      else lenis.scrollTo(0, { immediate: true, force: true });
    } else if (target) {
      target.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
    ScrollTrigger.refresh();
  }, [pathname, lenis]);

  return null;
}
