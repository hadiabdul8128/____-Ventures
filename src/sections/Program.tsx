import { ArrowRight } from "lucide-react";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Reveal } from "@/components/Shell";
import { Mark } from "@/components/Mark";
import { facts, perks, program, site, track } from "@/content";

export function Track() {
  return (
    <section className="section" id="track" aria-labelledby="track-heading">
      <div className="wrap track-grid">
        <Reveal className="track-copy">
          <p className="eyebrow">{track.eyebrow}</p>
          <h2 id="track-heading">{track.heading}</h2>
          <p className="track-tagline">{track.tagline}</p>
          <p className="lede">{track.body}</p>
          <a className="btn btn--solid" href={site.applyHref}>
            {track.cta} <ArrowRight size={14} />
          </a>
        </Reveal>
        <Reveal className="track-card" delay={0.1}>
          <Mark size={44} className="track-mark" />
          <ul>
            {track.points.map((point) => (
              <li key={point.lead}>
                <strong>{point.lead}</strong>
                {point.rest}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

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

export function Program() {
  return (
    <section
      className="program section"
      id="program"
      aria-labelledby="program-heading"
    >
      <div className="wrap program-grid">
        <Reveal className="program-copy">
          <p className="eyebrow">{program.eyebrow}</p>
          <h2 id="program-heading">{program.heading}</h2>
          <p className="lede">{program.body}</p>
          <div className="program-note">
            {program.note.map((line) => {
              const [label, ...rest] = line.split(":");
              return (
                <p key={line}>
                  <strong>{label}:</strong>
                  {rest.join(":")}
                </p>
              );
            })}
          </div>
        </Reveal>
        <div className="weeks">
          {program.weeks.map((week, i) => (
            <Reveal key={week.number} className="week" delay={i * 0.06}>
              <span className="week-number" aria-hidden="true">
                {week.number}
              </span>
              <div>
                <h3>
                  <span
                    className="eyebrow"
                    style={{ display: "block", marginBottom: 8 }}
                  >
                    week {week.number}
                  </span>
                  {week.theme}
                </h3>
                <dl>
                  <div>
                    <dt>lecture</dt>
                    <dd>{week.lecture}</dd>
                  </div>
                  <div>
                    <dt>homework</dt>
                    <dd>{week.homework}</dd>
                  </div>
                </dl>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
