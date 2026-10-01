"use client";

import { useEffect, useState } from "react";
import { NAV_LINKS } from "@/content/homepage";
import { useMagnetic } from "@/lib/hooks/useMagnetic";
import styles from "./SiteNav.module.css";

function OrbitMark() {
  return (
    <svg className={styles.mark} viewBox="0 0 40 40" aria-hidden="true">
      <ellipse cx="20" cy="20" rx="16" ry="8.5" transform="rotate(-32 20 20)" />
      <circle className={styles.markCore} cx="20" cy="20" r="4.4" />
      <circle className={styles.markMoon} cx="31.5" cy="11.5" r="3.4" />
    </svg>
  );
}

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const ctaRef = useMagnetic<HTMLAnchorElement>();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>
        <a href="#top" className={styles.brand} aria-label="Boov home">
          <OrbitMark />
          <span>boov</span>
        </a>

        <nav className={styles.links} aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className={styles.link}>
              {link.label}
            </a>
          ))}
        </nav>

        <a ref={ctaRef} href="#join" className={styles.cta} data-cursor data-cursor-label="Join">
          Join waitlist
        </a>
      </div>
    </header>
  );
}
