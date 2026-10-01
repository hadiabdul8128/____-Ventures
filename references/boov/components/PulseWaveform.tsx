const waveformPath =
  "M20 184 H120 L153 104 L198 256 L245 150 L282 184 H340 C358 184 367 166 380 154 C399 137 431 142 449 164 C466 185 461 219 438 239 L382 288 L326 239 C311 226 303 209 307 193";

export function PulseWaveform() {
  return (
    <svg
      viewBox="0 0 520 360"
      role="img"
      aria-label="Teal heart-pulse waveform illustration"
      className="w-full"
    >
      <path
        d={waveformPath}
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="pulse-path"
        d={waveformPath}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="153" cy="104" r="6" fill="var(--accent)" opacity="0.9" />
      <circle cx="245" cy="150" r="6" fill="var(--accent)" opacity="0.9" />
    </svg>
  );
}
