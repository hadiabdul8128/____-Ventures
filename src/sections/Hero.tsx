import { ArrowDown, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { LiquidGlass } from "@/components/LiquidGlass";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
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
      <LiquidGlass />
      <div className="wrap hero-inner">
        <motion.h1 id="hero-heading" {...fade(0.1)}>
          <span className="heading-highlight">{hero.line}</span>
          <em>{hero.italic}</em>
        </motion.h1>
        <motion.p className="lede" {...fade(0.25)}>
          {hero.body}
        </motion.p>
        <motion.div className="hero-actions" {...fade(0.35)}>
          <LiquidButton asChild>
            <a href={site.applyHref}>
              <span>{hero.primary}</span> <ArrowRight size={14} />
            </a>
          </LiquidButton>
          <a className="text-link" href="#offer">
            {hero.secondary} <ArrowDown size={14} />
          </a>
        </motion.div>
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
      <div className="receipts-row" aria-hidden="true">
        {receipts.items.map((logo) => (
          <span className="receipt" key={logo.name} title={logo.name}>
            <img
              src={logo.src}
              alt=""
              width={logo.width}
              height={logo.height}
              data-tone="invert"
              style={{ height: logo.marquee ?? 28 }}
              loading="lazy"
            />
          </span>
        ))}
      </div>
    </section>
  );
}
