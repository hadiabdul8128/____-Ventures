import { Reveal } from "@/components/Shell";
import { creatorProgram } from "@/creators/content";

export function CreatorProgram() {
  return (
    <main id="main" className="events-page creator-page">
      <section className="section" aria-labelledby="creator-heading">
        <div className="wrap">
          <Reveal className="section-head">
            <p className="eyebrow">{creatorProgram.eyebrow}</p>
            <h1 id="creator-heading" className="events-heading">
              <span className="heading-highlight">
                {creatorProgram.heading}
              </span>
            </h1>
            <p className="lede">{creatorProgram.body}</p>
          </Reveal>

          <Reveal className="creator-stats">
            {creatorProgram.stats.map((s) => (
              <div key={s.label} className="creator-stat">
                <p className="creator-stat-value">{s.value}</p>
                <p className="creator-stat-label">{s.label}</p>
              </div>
            ))}
          </Reveal>

          <div className="creator-sections">
            {creatorProgram.sections.map((section, i) => (
              <Reveal key={section.id} className="creator-row">
                <h2 id={`creator-${section.id}`} className="creator-label">
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {section.label}
                </h2>
                <ul className="creator-items">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>

          <p className="creator-fineprint">{creatorProgram.fineprint}</p>
        </div>
      </section>
    </main>
  );
}
