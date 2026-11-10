import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Shell";
import { partners, type PartnerCard } from "@/content";
import "./partners.css";

/** Same Google favicon helper the dashboard uses, kept here so that copy stays out of the public bundle. */
const logoUrl = (domain: string) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

function PartnerMark({ partner }: { partner: PartnerCard }) {
  const [broken, setBroken] = useState(false);
  const src = logoUrl(partner.domain);
  return (
    <span className="partner-mark" aria-hidden="true">
      {src && !broken ? (
        <img
          src={src}
          alt=""
          width={128}
          height={128}
          loading="lazy"
          decoding="async"
          onError={() => setBroken(true)}
        />
      ) : (
        <span>{partner.name.charAt(0).toUpperCase()}</span>
      )}
    </span>
  );
}

export function Partners() {
  return (
    <section
      className="section partners-section"
      id="partners"
      aria-labelledby="partners-heading"
    >
      <div className="wrap">
        <Reveal className="section-head">
          <p className="eyebrow">{partners.eyebrow}</p>
          <h2 id="partners-heading">
            <span className="heading-highlight">{partners.heading}</span>
          </h2>
        </Reveal>
        <div className="partners">
          {partners.items.map((partner, i) => (
            <Reveal className="partner" key={partner.name} delay={i * 0.04}>
              <a
                className="partner-link"
                href={partner.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <PartnerMark partner={partner} />
                <h3 className="partner-name">{partner.name}</h3>
                <p className="partner-body">{partner.body}</p>
                <span className="partner-cta">
                  {partners.cta}
                  <ArrowUpRight size={14} aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
