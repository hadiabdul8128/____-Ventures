import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal, SocialGlyph } from "@/components/Shell";
import { founders, type Credential } from "@/content";

function CredentialPill({ credential }: { credential: Credential }) {
  const inner = (
    <>
      {credential.logo && (
        <img
          src={credential.logo.src}
          alt={credential.logo.name}
          width={credential.logo.width}
          height={credential.logo.height}
          data-tone={credential.logo.tone ?? "invert"}
          style={
            {
              "--logo-h": `${credential.logo.display}px`,
            } as React.CSSProperties
          }
        />
      )}
      <span>{credential.label}</span>
      {credential.href && <ArrowUpRight size={12} />}
    </>
  );
  return credential.href ? (
    <a
      className="press-link"
      href={credential.href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {inner}
    </a>
  ) : (
    <span className="press-link">{inner}</span>
  );
}

export function Founders() {
  return (
    <section
      className="section"
      id="founders"
      aria-labelledby="founders-heading"
    >
      <div className="wrap">
        <Reveal className="section-head">
          <p className="eyebrow">{founders.eyebrow}</p>
          <h2 id="founders-heading">
            <span className="heading-highlight">{founders.heading}</span>
          </h2>
          <p className="lede">{founders.body}</p>
        </Reveal>
        <div className="founders-grid">
          {founders.items.map((founder, i) => (
            <Reveal key={founder.name} delay={i * 0.1}>
              <article className="founder">
                <div className="founder-top">
                  <div className="founder-photo">
                    <img
                      src={founder.photo}
                      alt={founder.name}
                      width={208}
                      height={208}
                      loading="lazy"
                    />
                  </div>
                  <div className="founder-identity">
                    <span className="chip">{founder.role}</span>
                    <h3 className="founder-name">
                      {founder.name.split(" ").map((part) => (
                        <span key={part}>{part}</span>
                      ))}
                    </h3>
                    <p className="founder-school">{founder.school}</p>
                  </div>
                </div>
                {founder.bio ? (
                  <p className="founder-bio">{founder.bio}</p>
                ) : null}
                <div className="founder-socials">
                  {founder.socials.map((social) => (
                    <LiquidButton asChild size="icon" key={social.kind}>
                      <a
                        className="social-button"
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${founder.name} on ${social.label}`}
                        title={social.label}
                      >
                        <SocialGlyph kind={social.kind} />
                      </a>
                    </LiquidButton>
                  ))}
                </div>
                <div className="founder-credentials">
                  {founder.credentials.map((credential) => (
                    <CredentialPill
                      key={credential.label}
                      credential={credential}
                    />
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
