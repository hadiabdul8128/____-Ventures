import clsx from "clsx";

type PillProps = {
  children: React.ReactNode;
  tone?: "dark" | "light";
};

export function Pill({ children, tone = "dark" }: PillProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium",
        tone === "dark"
          ? "border-white/18 text-white/82"
          : "border-rule bg-white text-ink-soft",
      )}
    >
      {children}
    </span>
  );
}
