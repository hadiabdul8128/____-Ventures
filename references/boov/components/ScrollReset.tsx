"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { useLenis } from "@/lib/SmoothScroll";

/**
 * On route changes: snap scroll to the top (or to the URL hash target) and
 * re-measure ScrollTrigger against the new page height. A stale #alerts URL is
 * treated as a normal homepage entry so the story always begins at BOOV.
 */
export function ScrollReset() {
  const lenis = useLenis();
  const pathname = usePathname();
  const lastPathname = useRef(pathname);
  const initialLoad = useRef(true);

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    const startsHomepage = pathname === "/" && (hash === "" || hash === "#alerts");
    const pathnameChanged = lastPathname.current !== pathname;

    if (initialLoad.current) {
      initialLoad.current = false;
    } else if (!pathnameChanged && !startsHomepage) {
      return;
    }

    if (!startsHomepage && !pathnameChanged) return;
    lastPathname.current = pathname;

    if (hash === "#alerts") {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }

    const target = !startsHomepage && hash ? document.getElementById(hash.slice(1)) : null;

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
