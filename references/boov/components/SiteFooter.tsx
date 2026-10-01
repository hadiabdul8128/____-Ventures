"use client";

import { FOOTER, NAV_LINKS } from "@/content/homepage";
import styles from "./SiteFooter.module.css";

function OrbitMark() {
  return (
    <svg className={styles.mark} viewBox="0 0 40 40" aria-hidden="true">
      <ellipse cx="20" cy="20" rx="16" ry="8.5" transform="rotate(-32 20 20)" />
      <circle className={styles.markCore} cx="20" cy="20" r="4.4" />
      <circle className={styles.markMoon} cx="31.5" cy="11.5" r="3.4" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandBlock}>
          <a href="#top" className={styles.brand} aria-label="Boov home">
            <OrbitMark />
            <span>{FOOTER.wordmark}</span>
          </a>
          <p className={styles.tagline}>{FOOTER.tagline}</p>
        </div>

        <nav className={styles.links} aria-label="Footer">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className={styles.link}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className={styles.contact}>
          <p className={styles.contactLabel}>{FOOTER.contactLabel}</p>
          <a href={`mailto:${FOOTER.contactEmail}`} className={styles.contactEmail}>
            {FOOTER.contactEmail}
          </a>
        </div>
      </div>

      <p className={styles.legal}>{FOOTER.legal}</p>
    </footer>
  );
}
