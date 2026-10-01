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
          ? "border-[#cfb67933] text-[#d6d0c1]"
          : "border-[#292a23] bg-[#eee6d5] text-[#181a16]",
      )}
    >
      {children}
    </span>
  );
}
