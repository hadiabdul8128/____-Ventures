import { memo, useId } from "react";

// A parametric torus, drawn as fine metal threads in local SVG.
const strands = Array.from({ length: 100 }, (_, index) => {
  const u = (index / 100) * Math.PI * 2;
  const points = Array.from({ length: 97 }, (_, step) => {
    const v = (step / 96) * Math.PI * 2;
    const radius = 192 + 79 * Math.cos(v);
    const x = radius * Math.cos(u),
      y = radius * Math.sin(u),
      z = 79 * Math.sin(v);
    const tiltedY = y * 0.57 - z * 0.82,
      tiltedZ = y * 0.82 + z * 0.57;
    const perspective = 920 / (920 - tiltedZ),
      turn = -0.58;
    const px = (x * Math.cos(turn) - tiltedY * Math.sin(turn)) * perspective;
    const py = (x * Math.sin(turn) + tiltedY * Math.cos(turn)) * perspective;
    return `${step === 0 ? "M" : "L"}${(350 + px).toFixed(2)},${(350 + py).toFixed(2)}`;
  });
  return {
    path: points.join(" ") + "Z",
    opacity: 0.3 + 0.66 * ((Math.sin(u + 0.7) + 1) / 2),
  };
});

export const GoldSculpture = memo(function GoldSculpture({
  small = false,
}: {
  small?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 700 700"
      fill="none"
      className={small ? "gold-sculpture small" : "gold-sculpture"}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`metal-${id}`}
          x1="120"
          y1="120"
          x2="570"
          y2="540"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#504025" />
          <stop offset=".23" stopColor="#d0a754" />
          <stop offset=".43" stopColor="#ffe6a7" />
          <stop offset=".58" stopColor="#96703a" />
          <stop offset=".75" stopColor="#dcb66b" />
          <stop offset="1" stopColor="#3a2e1c" />
        </linearGradient>
        <radialGradient id={`aura-${id}`}>
          <stop stopColor="#ab7a31" stopOpacity=".10" />
          <stop offset="1" stopColor="#ab7a31" stopOpacity="0" />
        </radialGradient>
        <filter id={`bloom-${id}`}>
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <circle cx="355" cy="350" r="340" fill={`url(#aura-${id})`} />
      <g className="sculpture-threads">
        <g opacity=".13" filter={`url(#bloom-${id})`}>
          {strands
            .filter((_, i) => i % 3 === 0)
            .map((strand, i) => (
              <path key={i} d={strand.path} stroke="#e3b95e" strokeWidth="2" />
            ))}
        </g>
        {strands.map((strand, i) => (
          <path
            key={i}
            d={strand.path}
            opacity={strand.opacity}
            stroke={`url(#metal-${id})`}
            strokeWidth={i % 6 === 0 ? 1.25 : 0.72}
          />
        ))}
      </g>
    </svg>
  );
});
