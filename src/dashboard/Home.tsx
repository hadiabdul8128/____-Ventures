import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUpRight, Check, Sparkles } from "lucide-react";
import {
  cohort,
  formatValue,
  type CohortContent,
  type Deal,
  type Progress,
  type SectionId,
} from "@/dashboard/content";
import { fetchMyRequests, type DealRequest, type Member, type VcUnlock } from "@/lib/dashboard";
import { Logo, SpecialCredits, isUnlocked } from "@/dashboard/Deals";
import Padlock from "@/components/ui/padlock";
import { AnimatePresence, motion } from "motion/react";
import { useCountdown } from "@/dashboard/panels";

const usdShort = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `$${Math.round(n / 1000)}K` : `$${n}`;

/** Counts up to `target` once, so the big numbers land with a bit of motion. */
function useCountUp(target: number, ms = 1400) {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(reduced ? target : 0);
  useEffect(() => {
    if (reduced) return setValue(target);
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - start) / ms, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, reduced]);
  return value;
}

// ------------------------------------------------------------------ hero --

function DealReveal({ total }: { total: number }) {
  const shown = useCountUp(total, 900);
  return (
    <h2 className="cd-hero-value">
      {usdShort(shown)}
      <small>deals waiting for you</small>
    </h2>
  );
}

export function Hero({ deals }: { deals: Deal[] }) {
  const [revealed, setRevealed] = useState(false);
  const reduced = useReducedMotion();
  const total = deals.reduce((sum, deal) => sum + (deal.value_amount ?? 0), 0);
  return (
    <section className="cd-hero cd-hero--reveal" aria-label="Your deals">
      <div className="cd-hero-grid" aria-hidden="true" />
      <AnimatePresence mode="wait" initial={false}>
        {revealed ? (
          <motion.div key="value" className="cd-reveal-content" role="status"
            initial={{ opacity: 0, y: reduced ? 0 : 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.3 }}>
            <DealReveal total={total} />
          </motion.div>
        ) : (
          <motion.div key="lock" className="cd-reveal-content"
            exit={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
            transition={{ duration: reduced ? 0 : 0.2 }}>
            <div className="cd-reveal-lock" onClick={() => setRevealed(true)} aria-hidden="true">
              <Padlock theme="dark" tabIndex={-1} intensity={0.8} />
            </div>
            <button type="button" className="btn btn--solid" onClick={() => setRevealed(true)}>
              unlock <ArrowRight size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ----------------------------------------------------------------- stats --

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="cd-stat cd-stat--glow">
      <p className="cd-label">{label}</p>
      <p className="cd-stat-value">{value}</p>
      <p className="cd-muted">{note}</p>
    </div>
  );
}

// ------------------------------------------------------------- top deals --

function TopDeals({ deals, locked, go }: { deals: Deal[]; locked: boolean; go: (id: SectionId) => void }) {
  const top = [...deals].sort((a, b) => (b.value_amount ?? 0) - (a.value_amount ?? 0)).slice(0, 6);
  return (
    <section className="cd-card">
      <div className="cd-card-head">
        <p className="cd-label">biggest deals</p>
        <button type="button" className="cd-link" onClick={() => go("deals")}>
          all {deals.length} <ArrowRight size={14} />
        </button>
      </div>
      <ol className="cd-top-deals">
        {top.map((d, i) => {
          const inner = (
            <>
              <span className="cd-rank">{i + 1}</span>
              <Logo deal={d} size={34} />
              <span className="cd-deal-text">
                <strong>{d.name}</strong>
                <small>{d.offer}</small>
              </span>
              <span className="cd-top-value">{formatValue(d)?.replace(" est.", "")}</span>
            </>
          );
          return (
            <li key={d.id}>
              {locked ? (
                <div className="cd-top-row" data-locked>
                  {inner}
                </div>
              ) : (
                <a className="cd-top-row" href={d.url} target="_blank" rel="noopener">
                  {inner}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

// --------------------------------------------------------------- journey --

function Journey({ progress, go }: { progress: Progress | null; go: (id: SectionId) => void }) {
  const unlocked = isUnlocked(progress);
  const demo = new Date(cohort.demoDayIso).getTime() < Date.now();
  const steps = [
    { title: "join cohort 01", note: "you're in.", done: true },
    {
      title: "incorporate or bank through Rho",
      note: unlocked ? `done (${progress?.rho_path}).` : "$2,000 setup fee waived. unlocks every deal.",
      done: unlocked,
      action: unlocked ? undefined : { label: "do it", to: "deals" as SectionId },
    },
    {
      title: "claim the deals you need",
      note: unlocked ? "start with credits: AWS, Aiven, Statsig." : "opens after step 1.",
      done: false,
      action: unlocked ? { label: "browse", to: "deals" as SectionId } : undefined,
    },
    { title: "demo day 01", note: `${cohort.demoDayLabel}.`, done: demo },
  ];
  const current = steps.findIndex((s) => !s.done);
  return (
    <section className="cd-card">
      <p className="cd-label">your path</p>
      <ol className="cd-journey">
        {steps.map((s, i) => (
          <li key={s.title} data-state={s.done ? "done" : i === current ? "now" : "ahead"}>
            <span className="cd-journey-dot">{s.done ? <Check size={13} /> : i + 1}</span>
            <div>
              <strong>{s.title}</strong>
              <p className="cd-muted">{s.note}</p>
            </div>
            {s.action && (
              <button type="button" className="cd-link" onClick={() => s.action && go(s.action.to)}>
                {s.action.label} <ArrowRight size={13} />
              </button>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

// ------------------------------------------------------------ categories --

function CategoryBars({ deals, onPick }: { deals: Deal[]; onPick: (category: string) => void }) {
  const rows = useMemo(() => {
    const m = new Map<string, { value: number; count: number }>();
    for (const d of deals) {
      const r = m.get(d.category) ?? { value: 0, count: 0 };
      r.value += d.value_amount ?? 0;
      r.count += 1;
      m.set(d.category, r);
    }
    return [...m.entries()].sort((a, b) => b[1].value - a[1].value);
  }, [deals]);
  const max = rows[0]?.[1].value || 1;
  return (
    <section className="cd-card">
      <p className="cd-label">value by category</p>
      <ul className="cd-bars">
        {rows.map(([cat, r]) => (
          <li key={cat}>
            <button type="button" onClick={() => onPick(cat)}>
              <span className="cd-bars-name">{cat}</span>
              <span className="cd-bars-track">
                <span style={{ width: `${Math.max((r.value / max) * 100, 2)}%` }} />
              </span>
              <span className="cd-bars-value">
                {usdShort(r.value)} <small>· {r.count}</small>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

// --------------------------------------------------------------- marquee --

function LogoMarquee({ deals }: { deals: Deal[] }) {
  const seen = new Set<string>();
  const unique = deals.filter((d) => d.domain && !seen.has(d.domain) && seen.add(d.domain));
  const half = Math.ceil(unique.length / 2);
  const rows = [unique.slice(0, half), unique.slice(half)];
  return (
    <section className="cd-marquee" aria-label={`${unique.length} partner companies`}>
      {rows.map((row, r) => (
        <div className="cd-marquee-row" data-reverse={r === 1 || undefined} key={r}>
          {[...row, ...row].map((d, i) => (
            <span className="cd-marquee-item" key={`${d.id}-${i}`} aria-hidden={i >= row.length || undefined}>
              <Logo deal={d} size={22} />
              {d.name}
            </span>
          ))}
        </div>
      ))}
    </section>
  );
}

// ------------------------------------------------------------------- ask --

function Ask({ onAsk }: { onAsk: (q: string) => void }) {
  const suggestions = ["what are the biggest credits?", "I need payroll", "cloud and AI credits", "how do I unlock?"];
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem("ask") as HTMLInputElement;
    if (input.value.trim()) onAsk(input.value.trim());
  };
  return (
    <section className="cd-card cd-ask">
      <p className="cd-label">
        <Sparkles size={12} /> ask the assistant
      </p>
      <form onSubmit={onSubmit} className="cd-ask-form">
        <input name="ask" placeholder="what do you need for your company?" autoComplete="off" aria-label="ask the assistant" />
        <button type="submit" className="cd-send" aria-label="ask">
          <ArrowRight size={18} />
        </button>
      </form>
      <div className="cd-chips">
        {suggestions.map((s) => (
          <button key={s} type="button" className="cd-chip-btn" onClick={() => onAsk(s)}>
            {s}
          </button>
        ))}
      </div>
    </section>
  );
}

// ------------------------------------------------------------ bottom row --

function Pulse({
  content,
  vcs,
  requests,
  go,
}: {
  content: CohortContent;
  vcs: VcUnlock[] | null;
  requests: DealRequest[] | null;
  go: (id: SectionId) => void;
}) {
  const slots = vcs?.length || content.vcSlots;
  const open = (vcs ?? []).filter((v) => v.status !== "locked").length;
  const weekly = content.checkins.weekly;
  return (
    <div className="cd-grid-3">
      <section className="cd-card">
        <div className="cd-card-head">
          <p className="cd-label">next check-in</p>
          <button type="button" className="cd-link" onClick={() => go("checkins")}>
            details <ArrowRight size={13} />
          </button>
        </div>
        <p className="cd-card-title">{weekly.when}</p>
        <p className="cd-muted">{weekly.note}</p>
        {weekly.href ? (
          <a className="btn btn--ghost btn--sm" href={weekly.href} target="_blank" rel="noopener">
            join <ArrowUpRight size={13} />
          </a>
        ) : (
          <p className="cd-hint">link coming soon.</p>
        )}
      </section>
      <section className="cd-card">
        <div className="cd-card-head">
          <p className="cd-label">investor intros</p>
          <button type="button" className="cd-link" onClick={() => go("investors")}>
            board <ArrowRight size={13} />
          </button>
        </div>
        <p className="cd-card-title">
          {open} <span className="cd-muted">/ {slots} unlocked</span>
        </p>
        <div className="cd-pips" aria-hidden="true">
          {Array.from({ length: slots }, (_, i) => (
            <span key={i} data-on={i < open || undefined} />
          ))}
        </div>
        <p className="cd-hint">we unlock a firm when the intro will land.</p>
      </section>
      <section className="cd-card">
        <div className="cd-card-head">
          <p className="cd-label">your requests</p>
          <button type="button" className="cd-link" onClick={() => go("request")}>
            new <ArrowRight size={13} />
          </button>
        </div>
        {requests && requests.length ? (
          <ul className="cd-requests">
            {requests.slice(0, 4).map((r) => (
              <li key={r.id}>
                <span>{r.companies}</span>
                <span className="cd-pill">{r.status}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="cd-muted">nothing yet. missing a tool? ask and we'll go find a deal.</p>
        )}
      </section>
    </div>
  );
}

// ------------------------------------------------------------------ page --

export function Home({
  me,
  content,
  deals,
  progress,
  vcs,
  go,
  onAsk,
  onPickCategory,
}: {
  me: Member;
  content: CohortContent;
  deals: Deal[];
  progress: Progress | null;
  vcs: VcUnlock[] | null;
  go: (id: SectionId) => void;
  onAsk: (q: string) => void;
  onPickCategory: (category: string) => void;
}) {
  const [requests, setRequests] = useState<DealRequest[] | null>(null);
  const { days } = useCountdown();
  const locked = !isUnlocked(progress);
  const credits = deals.filter((d) => d.value_confidence === "high").reduce((s, d) => s + (d.value_amount ?? 0), 0);

  useEffect(() => {
    fetchMyRequests(me.email).then(setRequests);
  }, [me.email]);

  return (
    <div className="cd-stack cd-home">
      <Hero deals={deals} />
      <div className="cd-stats">
        <Stat label="partner deals" value={String(deals.length)} note={locked ? "locked until step 1" : "all unlocked"} />
        <Stat label="stated credits" value={usdShort(credits)} note="dollar amounts written into the offers" />
        <Stat label="setup fee waived" value="$2,000" note="incorporate or bank through Rho" />
        <Stat label="demo day 01" value={`${days}d`} note={cohort.demoDayLabel} />
      </div>
      <LogoMarquee deals={deals} />
      <SpecialCredits />
      <div className="cd-grid-2 cd-grid-2--wide">
        <TopDeals deals={deals} locked={locked} go={go} />
        <Journey progress={progress} go={go} />
      </div>
      <div className="cd-grid-2 cd-grid-2--wide">
        <CategoryBars deals={deals} onPick={onPickCategory} />
        <Ask onAsk={onAsk} />
      </div>
      <Pulse content={content} vcs={vcs} requests={requests} go={go} />
    </div>
  );
}
