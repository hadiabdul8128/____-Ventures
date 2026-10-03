import { Reveal } from "@/components/Shell";

export function Offer() {
  return (
    <section
      className="section offer-section"
      id="offer"
      aria-labelledby="offer-heading"
    >
      <div className="wrap">
        <Reveal className="section-head">
          <h2 id="offer-heading">what we offer.</h2>
        </Reveal>
        <div className="offer-facts">
          <Reveal className="fact">
            <span className="fact-value">20k</span>
            <h3 className="fact-label">compute credits</h3>
          </Reveal>
          <Reveal className="fact" delay={0.05}>
            <span className="fact-value">01</span>
            <h3 className="fact-label">cohort</h3>
          </Reveal>
          <Reveal className="fact" delay={0.1}>
            <span className="fact-value">100%</span>
            <h3 className="fact-label">founder-run</h3>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
