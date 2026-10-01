import clsx from "clsx";

type PullQuoteProps = {
  children: React.ReactNode;
  dark?: boolean;
};

export function PullQuote({ children, dark = false }: PullQuoteProps) {
  return (
    <aside
      className={clsx(
        "my-10 border-l-2 border-accent pl-6 font-serif text-2xl font-medium leading-snug",
        dark ? "text-white" : "text-ink",
      )}
    >
      {children}
    </aside>
  );
}
