import { Reveal } from "@/components/Shell";
import { philosophy } from "@/content";
import "./philosophy.css";

export function Philosophy() {
  return (
    <section className="section philosophy-section" id="philosophy" aria-labelledby="philosophy-heading">
      <div className="wrap">
        <Reveal className="section-head">
          <p className="eyebrow">{philosophy.eyebrow}</p>
          <h2 id="philosophy-heading"><span className="heading-highlight">{philosophy.heading}</span></h2>
        </Reveal>
        <div className="philosophy-principles">
          {philosophy.items.map((item, index) => (
            <Reveal key={item.heading}>
              <article className="philosophy-principle">
                <span className="philosophy-number" aria-hidden="true">0{index + 1}</span>
                <h3>{item.heading}</h3>
                <p>{item.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
