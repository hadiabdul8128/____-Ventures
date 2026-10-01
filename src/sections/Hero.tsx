import { ArrowDown, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { SquareField } from "@/components/SquareField";
import { Marquee } from "@/components/ui/marquee";
import { hero, receipts, site } from "@/content";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduced = useReducedMotion();
  const fade = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay, ease },
        };

  return (
    <section className="hero" id="top" aria-labelledby="hero-heading">
      <div className="hero-bg" aria-hidden="true">
        {reduced ? (
          <div className="hero-bg-static" />
        ) : (
          <SquareField className="hero-canvas" />
        )}
      </div>
      <div className="wrap hero-inner">
        <motion.p className="eyebrow" {...fade(0)}>
          {hero.eyebrow}
        </motion.p>
        <motion.h1 id="hero-heading" {...fade(0.1)}>
          <span>{hero.line}</span>
          <em>{hero.italic}</em>
        </motion.h1>
        <motion.p className="lede" {...fade(0.25)}>
          {hero.body}
        </motion.p>
        <motion.div className="hero-actions" {...fade(0.35)}>
          <a className="btn btn--solid" href={site.applyHref}>
            {hero.primary} <ArrowRight size={14} />
          </a>
          <a className="text-link" href="#founders">
            {hero.secondary} <ArrowDown size={14} />
          </a>
        </motion.div>
        {!reduced && (
          <motion.p className="hero-hint" {...fade(1.2)}>
            {hero.hint}
          </motion.p>
        )}
      </div>
    </section>
  );
}

export function Receipts() {
  return (
    <section className="receipts" aria-label="Where our founders have been">
      <p className="eyebrow">{receipts.label}</p>
      <ul className="sr-only">
        {receipts.items.map((logo) => (
          <li key={logo.name}>{logo.name}</li>
        ))}
      </ul>
      <Marquee className="receipts-marquee" repeat={4} aria-hidden="true">
        {receipts.items.map((logo) => (
          <span className="receipt" key={logo.name} title={logo.name}>
            <img
              src={logo.src}
              alt=""
              width={logo.width}
              height={logo.height}
              data-tone={logo.tone ?? "invert"}
              style={{ height: logo.marquee ?? 28 }}
              loading="lazy"
            />
            <i aria-hidden="true" />
          </span>
        ))}
      </Marquee>
    </section>
  );
}
