import type { ReactNode } from "react";
import { Mark } from "@/components/Mark";

/** Centered card used by every sign-in screen (cohort 01, waitlist, chooser). */
export function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <main id="main" className="cd-auth">
      <div className="cd-auth-card">
        <a
          href="/"
          className="cd-auth-brand"
          aria-label="Boston Square Ventures home"
        >
          <Mark size={28} />
          <span>Boston Square Ventures</span>
        </a>
        {children}
      </div>
    </main>
  );
}
