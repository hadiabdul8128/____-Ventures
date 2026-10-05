import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, ArrowUp, ArrowUpRight, Menu, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { footer, nav, site, type SocialKind } from "@/content";
import { useRoute } from "@/lib/router";
import { Mark } from "./Mark";
import { HyperText } from "./ui/hyper-text";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Wordmark({
  onNavigate,
  animate = false,
}: {
  onNavigate?: () => void;
  animate?: boolean;
}) {
  return (
    <a
      href="/"
      className="wordmark"
      onClick={onNavigate}
      aria-label={`${site.name} home`}
    >
      <Mark size={30} className="wordmark-mark" />
      {animate ? (
        <span
          className="wordmark-text wordmark-text--animated"
          aria-hidden="true"
        >
          <span className="wordmark-sizing">{site.name}</span>
          <HyperText
            as="span"
            className="wordmark-hyper"
            delay={1000}
            duration={1400}
            animateOnHover={false}
          >
            {site.name}
          </HyperText>
        </span>
      ) : (
        <span className="wordmark-text">{site.wordmark.join(" ")}</span>
      )}
    </a>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  // Off the landing page the in-page anchors need a path in front of them.
  const onLanding = useRoute() === "/";
  const sectionHref = (href: string) => (onLanding ? href : `/${href}`);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onResize = () => window.innerWidth > 820 && close();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <>
      <header className="site-header">
        <div className="wrap">
          <Wordmark onNavigate={close} animate />
          <nav className="desktop-nav" aria-label="Primary">
            {nav.map((link) => (
              <a key={link.href} href={sectionHref(link.href)}>
                {link.label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <LiquidButton asChild size="sm" className="btn">
              <a href={site.applyHref}>
                apply to cohort 01 <ArrowRight size={14} />
              </a>
            </LiquidButton>
            <LiquidButton
              size="icon"
              type="button"
              className="menu-button"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </LiquidButton>
          </div>
        </div>
      </header>
      <nav
        id="mobile-nav"
        className="mobile-nav"
        data-open={open}
        aria-label="Mobile"
      >
        {nav.map((link) => (
          <a key={link.href} href={sectionHref(link.href)} onClick={close}>
            {link.label}
            <ArrowUpRight size={22} />
          </a>
        ))}
        <LiquidButton asChild className="btn">
          <a href={site.applyHref} onClick={close}>
            apply to cohort 01 <ArrowRight size={14} />
          </a>
        </LiquidButton>
      </nav>
    </>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-row">
          <Wordmark />
          <span className="footer-tagline">{site.tagline}</span>
          <a className="text-link" href="#top">
            {footer.backToTop} <ArrowUp size={14} />
          </a>
        </div>
        <div className="footer-meta">
          <span>{footer.copyright}</span>
          <span>{footer.disclaimer}</span>
        </div>
      </div>
    </footer>
  );
}

export function SocialGlyph({ kind }: { kind: SocialKind }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": true,
  } as const;
  switch (kind) {
    case "linkedin":
      return (
        <svg {...common}>
          <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg
          {...common}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...common}>
          <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.6c.27 0 .53.05.77.13V9.78a5.73 5.73 0 0 0-.77-.05 5.68 5.68 0 1 0 5.68 5.67V9.07a7.35 7.35 0 0 0 4.3 1.38V7.36a4.3 4.3 0 0 1-3.24-1.54Z" />
        </svg>
      );
    case "github":
      return (
        <svg {...common}>
          <path d="M12 .5a12 12 0 0 0-3.79 23.38c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.21.7.82.58A12 12 0 0 0 12 .5Z" />
        </svg>
      );
    case "web":
      return (
        <svg
          {...common}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
  }
}
