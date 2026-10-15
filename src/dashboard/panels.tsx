import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Check, Lock } from "lucide-react";
import { cohort, type CohortContent } from "@/dashboard/content";
import type { VcUnlock } from "@/lib/dashboard";

const DAY = 24 * 60 * 60 * 1000;

function useNow(tickMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), tickMs);
    return () => window.clearInterval(id);
  }, [tickMs]);
  return now;
}

export function useCountdown() {
  const now = useNow();
  const target = useMemo(() => new Date(cohort.demoDayIso).getTime(), []);
  const left = Math.max(target - now, 0);
  return {
    days: Math.floor(left / DAY),
    hours: Math.floor((left % DAY) / 3_600_000),
    minutes: Math.floor((left % 3_600_000) / 60_000),
    seconds: Math.floor((left % 60_000) / 1000),
  };
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a className="btn btn--ghost btn--sm" href={href} target="_blank" rel="noopener sponsored">
      {children} <ArrowUpRight size={14} />
    </a>
  );
}

// ------------------------------------------------------------- investors --

export function Investors({ content, vcs }: { content: CohortContent; vcs: VcUnlock[] | null }) {
  const slots: VcUnlock[] =
    vcs && vcs.length
      ? vcs
      : Array.from({ length: content.vcSlots }, (_, i) => ({
          id: `slot-${i}`,
          firm: null,
          position: i + 1,
          status: "locked" as const,
          note: null,
        }));
  return (
    <div className="cd-stack">
      <p className="cd-muted cd-lede">
        {slots.length} firms. we unlock one when we think you're ready and the intro will land. no deadline, no checklist.
      </p>
      <ul className="cd-vcs">
        {slots.map((slot) => {
          const open = slot.status !== "locked";
          return (
            <li key={slot.id} className="cd-card cd-vc" data-status={slot.status}>
              <span className="cd-label">{String(slot.position).padStart(2, "0")}</span>
              <span className="cd-vc-name">{open ? (slot.firm ?? "unlocked") : "locked"}</span>
              <span className="cd-vc-status">
                {open ? <Check size={14} /> : <Lock size={13} />}
                {slot.status.replace("_", " ")}
              </span>
              {open && slot.note && <p className="cd-muted">{slot.note}</p>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ------------------------------------------------------------- check-ins --

export function CheckIns({ content }: { content: CohortContent }) {
  const { weekly, booking } = content.checkins;
  return (
    <div className="cd-grid-2">
      {[
        { slot: weekly, title: weekly.when ?? "", cta: "join the call" },
        { slot: booking, title: "any time this week", cta: "book a slot" },
      ].map(({ slot, title, cta }) => (
        <section className="cd-card" key={slot.label}>
          <p className="cd-label">{slot.label}</p>
          <h2 className="cd-card-title">{title}</h2>
          <p className="cd-muted">{slot.note}</p>
          {slot.href ? (
            <ExternalLink href={slot.href}>{cta}</ExternalLink>
          ) : (
            <p className="cd-hint">link coming soon.</p>
          )}
        </section>
      ))}
    </div>
  );
}
