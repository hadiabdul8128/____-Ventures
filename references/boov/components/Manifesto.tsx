"use client";

import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { MANIFESTO, PLACEHOLDER_IMAGES } from "@/content/homepage";
import { gsap } from "@/lib/gsap";
import { DisplacementFilter } from "./DisplacementFilter";
import { Marquee } from "./Marquee";
import styles from "./Manifesto.module.css";

export function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const figureRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // One-time clip-path wipe reveal on the image as it scrolls in.
  useGSAP(
    () => {
      const figure = figureRef.current;
      if (!figure) return;
      if (prefersReducedMotion) {
        gsap.set(figure, { clipPath: "inset(0 0% 0 0)" });
        return;
      }
      gsap.fromTo(
        figure,
        { clipPath: "inset(0 100% 0 0)" },
        {
          clipPath: "inset(0 0% 0 0)",
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: figure,
            start: "top 82%",
            toggleActions: "play none none none",
          },
        },
      );
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion] },
  );

  const rippleDistortion = () => {
    if (prefersReducedMotion) return;
    const map = document.getElementById("boov-hover-distort-map");
    if (!map) return;
    gsap
      .timeline()
      .to(map, { attr: { scale: 18 }, duration: 0.18, ease: "power2.out" })
      .to(map, { attr: { scale: 0 }, duration: 0.55, ease: "power3.out" });
  };

  return (
    <section id="mission" ref={sectionRef} className={styles.section} aria-labelledby="mission-heading">
      <DisplacementFilter />

      <Marquee className={styles.marquee} text="Not charity. Infrastructure." speed={30} separator="-" />

      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.kicker}>{MANIFESTO.kicker}</p>
          <h2 id="mission-heading" className={styles.headline}>
            {MANIFESTO.headline.split("\n").map((line, index) => (
              <span key={index} className={styles.headlineLine}>
                {line}
              </span>
            ))}
          </h2>
          <p className={styles.lead}>{MANIFESTO.lead}</p>

          <blockquote className={styles.pullQuote}>{MANIFESTO.pullQuote}</blockquote>

          <div className={styles.body}>
            {MANIFESTO.body.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        <figure
          ref={figureRef}
          className={styles.figure}
          onMouseEnter={rippleDistortion}
        >
          <Image
            className={styles.image}
            src={PLACEHOLDER_IMAGES.manifesto.src}
            alt={PLACEHOLDER_IMAGES.manifesto.alt}
            fill
            sizes="(max-width: 900px) 90vw, 40vw"
            style={{ objectFit: "cover" }}
          />
          <figcaption className={styles.caption}>Placeholder imagery - swap for real Boov photography.</figcaption>
        </figure>
      </div>
    </section>
  );
}
