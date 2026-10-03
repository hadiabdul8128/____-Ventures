import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/Shell";
import { offer, site } from "@/content";

export function Offer() {
  return (
    <section
      className="section offer-section"
      id="offer"
      aria-labelledby="offer-heading"
    >
      <div className="wrap">
        <Reveal className="section-head">
          <h2 id="offer-heading">{offer.heading}</h2>
        </Reveal>
        <div className="offer-facts">
          {offer.items.map((item, i) => (
            <Reveal className="fact" key={item.value} delay={i * 0.04}>
              <span className="fact-value" data-kind={item.kind}>
                {item.value}
              </span>
              <h3 className="fact-label">{item.label}</h3>
              {item.note && <p className="fact-note">{item.note}</p>}
            </Reveal>
          ))}
        </div>
        <div className="offer-dates">
          {offer.dates.map((entry, i) => (
            <Reveal className="key-date" key={entry.iso} delay={i * 0.06}>
              <p className="key-date-label">{entry.label}</p>
              <time className="key-date-value" dateTime={entry.iso}>
                {entry.date}
              </time>
              {entry.note && <p className="key-date-note">{entry.note}</p>}
            </Reveal>
          ))}
        </div>
        <LiquidButton asChild className="btn offer-cta">
          <a href={site.applyHref}>
            {offer.cta} <ArrowRight size={14} />
          </a>
        </LiquidButton>
      </div>
    </section>
  );
}
