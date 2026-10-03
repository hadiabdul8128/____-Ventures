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
        <a className="btn btn--solid offer-cta" href={site.applyHref}>
          {offer.cta} <ArrowRight size={14} />
        </a>
      </div>
    </section>
  );
}
