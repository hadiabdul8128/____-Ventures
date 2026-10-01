"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_LINKS } from "@/content/homepage";
import { useMagnetic } from "@/lib/hooks/useMagnetic";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
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
  const pathname = usePathname();
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
    <header className={`${styles.nav} vt-nav ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="Boov home">
          <OrbitMark />
          <span>boov</span>
        </Link>

        <nav className={styles.links} aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={styles.link}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          {/* No static aria-label here — the toggler labels itself dynamically
              ("Switch to dark/light theme"). */}
          <AnimatedThemeToggler className={styles.theme} data-cursor data-cursor-label="Theme" />
          <a ref={ctaRef} href="/#join" className={styles.cta} data-cursor data-cursor-label="Join">
            Join waitlist
          </a>
        </div>
      </div>
    </header>
  );
}
