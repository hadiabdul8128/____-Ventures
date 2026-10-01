"use client";

/**
 * Shared, invisible SVG filter used for the gallery-image hover distortion.
 * A GSAP tween animates the feDisplacementMap's `scale` attribute on hover
 * (see Manifesto.tsx) - a refined alternative to scaling/rotating the <img>,
 * which reads as a generic AI-UI hover effect.
 */
export function DisplacementFilter() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      style={{ position: "absolute", pointerEvents: "none" }}
    >
      <defs>
        <filter id="boov-hover-distort" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.016"
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feDisplacementMap
            id="boov-hover-distort-map"
            in="SourceGraphic"
            in2="noise"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
