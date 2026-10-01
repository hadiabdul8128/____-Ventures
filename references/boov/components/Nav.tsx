"use client";

import clsx from "clsx";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  ["About", "#about"],
  ["Research", "#research"],
  ["Abstract", "#abstract"],
  ["Presentation", "#presentation"],
  ["Article", "#article"],
  ["Reflection", "#about"],
  ["Resume", "#resume"],
] as const;

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={clsx(
        "site-nav sticky top-0 z-50 border-b border-white/10 transition",
        scrolled ? "bg-ink/88 shadow-lg shadow-ink/10 backdrop-blur" : "bg-ink",
      )}
      aria-label="Primary navigation"
    >
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-5 md:px-8">
        <a href="#" className="font-serif text-xl font-semibold text-white">
          Hadi Abdul
        </a>
        <div className="hidden items-center gap-7 md:flex">
          {links.map(([label, href]) => (
            <a
              key={`${label}-${href}`}
              href={href}
              className="text-sm font-medium text-white/72 transition hover:text-white"
            >
              {label}
            </a>
          ))}
        </div>
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/16 text-white md:hidden"
          type="button"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X aria-hidden size={20} /> : <Menu aria-hidden size={20} />}
        </button>
      </div>
      {open ? (
        <div className="mobile-sheet border-t border-white/10 bg-ink px-5 py-4 md:hidden">
          <div className="mx-auto grid max-w-[1200px] gap-1">
            {links.map(([label, href]) => (
              <a
                key={`mobile-${label}-${href}`}
                href={href}
                className="rounded-md px-2 py-3 text-sm font-medium text-white/78 hover:bg-white/6 hover:text-white"
                onClick={() => setOpen(false)}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </nav>
  );
}
