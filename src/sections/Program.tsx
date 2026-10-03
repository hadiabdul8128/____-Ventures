import { NumberTicker } from "@/components/ui/number-ticker";
import { Reveal } from "@/components/Shell";
import { facts, perks } from "@/content";

export function Facts() {
  return (
    <section aria-label="Program at a glance">
      <div className="wrap">
        <div className="facts">
          {facts.map((fact, i) => (
            <div className="fact" key={fact.label}>
              <span className="fact-value">
                {fact.prefix && (
                  <span className="fact-affix">{fact.prefix}</span>
                )}
                <NumberTicker
                  value={fact.value}
                  delay={i * 0.1}
                  className="tracking-normal"
                />
                {fact.suffix && (
                  <span className="fact-affix">{fact.suffix}</span>
                )}
              </span>
              <span className="fact-label">{fact.label}</span>
              <span className="fact-note">{fact.note}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Perks() {
  return (
    <section className="section" aria-labelledby="perks-heading">
      <div className="wrap">
        <Reveal className="section-head">
          <p className="eyebrow">{perks.eyebrow}</p>
          <h2 id="perks-heading">{perks.heading}</h2>
        </Reveal>
        <div className="perks-list">
          {perks.items.map((perk, i) => (
            <Reveal key={perk.title} className="perk" delay={i * 0.05}>
              <h3>{perk.title}</h3>
              <p>{perk.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
