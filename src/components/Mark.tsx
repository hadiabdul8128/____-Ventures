import { MARK_B, MARK_SIZE, MARK_STROKE, MARK_V } from "./markPaths";

/** The Boston Square mark: a square, "B" top-left, "V" bottom-right. Outlined, font-independent. */
export function Mark({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const half = MARK_STROKE / 2;
  return (
    <svg
      viewBox={`0 0 ${MARK_SIZE} ${MARK_SIZE}`}
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
    >
      <rect
        x={half}
        y={half}
        width={MARK_SIZE - MARK_STROKE}
        height={MARK_SIZE - MARK_STROKE}
        fill="none"
        stroke="currentColor"
        strokeWidth={MARK_STROKE}
      />
      <path transform={MARK_B.transform} d={MARK_B.d} />
      <path transform={MARK_V.transform} d={MARK_V.d} />
    </svg>
  );
}
