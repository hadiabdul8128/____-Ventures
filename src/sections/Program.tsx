import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/Shell";
import { offer, site, tracks } from "@/content";

export function Offer() {
  return (
    <section
      className="section offer-section"
      id="offer"
      aria-labelledby="offer-heading"
    >
      <div className="wrap">
        <Reveal className="section-head">
          <p className="eyebrow">{offer.eyebrow}</p>
          <h2 id="offer-heading">
            <span className="heading-highlight">{offer.heading}</span>
          </h2>
        </Reveal>
        <div className="offer-facts">
          {offer.items.map((item, i) => (
            <Reveal className="fact" key={item.value} delay={i * 0.04}>
              {item.iso ? (
                <time className="fact-value" data-kind={item.kind} dateTime={item.iso}>
                  {item.value}
                </time>
              ) : (
                <span className="fact-value" data-kind={item.kind}>
                  {item.value}
                </span>
              )}
              <h3 className="fact-label">{item.label}</h3>
              {item.note && <p className="fact-note">{item.note}</p>}
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

export function Tracks() {
  return (
    <section
      className="section tracks-section"
      id="tracks"
      aria-labelledby="tracks-heading"
    >
      <div className="wrap">
        <Reveal className="section-head">
          <p className="eyebrow">{tracks.eyebrow}</p>
          <h2 id="tracks-heading">
            <span className="heading-highlight">{tracks.heading}</span>
          </h2>
        </Reveal>
        <div className="tracks">
          {tracks.items.map((track, i) => (
            <Reveal
              className={track.cta ? "track" : "track is-soon"}
              key={track.number}
              delay={i * 0.06}
            >
              <span className="track-number">track {track.number}</span>
              <h3 className="track-name">{track.name}</h3>
              {track.body && <p className="track-body">{track.body}</p>}
              {track.cta ? (
                <LiquidButton asChild size="sm" className="btn track-cta">
                  <a href={track.cta.href}>
                    {track.cta.label} <ArrowRight size={14} />
                  </a>
                </LiquidButton>
              ) : (
                <p className="track-status">{track.status}</p>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
