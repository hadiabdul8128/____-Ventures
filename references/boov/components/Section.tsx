import clsx from "clsx";

type SectionProps = {
  id: string;
  label: string;
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  dark?: boolean;
};

export function Section({
  id,
  label,
  children,
  className,
  innerClassName,
  dark = false,
}: SectionProps) {
  return (
    <section
      id={id}
      className={clsx(
        "scroll-mt-24 border-t border-rule",
        dark && "dark-section",
        className,
      )}
    >
      <div
        className={clsx(
          "reveal-on-scroll mx-auto max-w-[1200px] px-5 py-24 md:px-8 md:py-32",
          innerClassName,
        )}
      >
        <p className="section-label mb-6">{label}</p>
        {children}
      </div>
    </section>
  );
}
