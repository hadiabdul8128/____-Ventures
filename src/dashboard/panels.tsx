import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowRight, ArrowUpRight, Check, Lock } from "lucide-react";
import { cohort, computeForm, type CohortContent, type SectionId } from "@/dashboard/content";
import { submitComputeRequest, type Member, type VcUnlock } from "@/lib/dashboard";

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

function useWeekIndex(content: CohortContent) {
  const now = useNow(60_000);
  return content.curriculum.weeks.reduce(
    (acc, wk, i) => (now >= new Date(wk.startIso).getTime() ? i : acc),
    -1,
  );
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a className="btn btn--ghost btn--sm" href={href} target="_blank" rel="noopener sponsored">
      {children} <ArrowUpRight size={14} />
    </a>
  );
}

// -------------------------------------------------------------- overview --

export function Overview({
  me,
  content,
  vcs,
  go,
}: {
  me: Member;
  content: CohortContent;
  vcs: VcUnlock[] | null;
  go: (id: SectionId) => void;
}) {
  const { days, hours, minutes, seconds } = useCountdown();
  const weekIndex = useWeekIndex(content);
  const weeks = content.curriculum.weeks;
  const week = weeks[Math.max(weekIndex, 0)];
  const unlocked = (vcs ?? []).filter((v) => v.status !== "locked").length;
  const slots = vcs?.length || content.vcSlots;
  const first = (me.name || me.email).split(/[\s@]/)[0];
  const started = weekIndex >= 0;

  return (
    <div className="cd-stack">
      <p className="cd-greeting">
        welcome back, {first}. {started ? `week ${weekIndex + 1} of ${weeks.length}.` : "cohort 01 starts October 15."}
      </p>

      <div className="cd-stats">
        <div className="cd-stat">
          <p className="cd-label">demo day 01</p>
          <p className="cd-stat-value">
            {days}
            <small>d</small> {String(hours).padStart(2, "0")}
            <small>h</small> {String(minutes).padStart(2, "0")}
            <small>m</small> {String(seconds).padStart(2, "0")}
            <small>s</small>
          </p>
          <p className="cd-muted">{cohort.demoDayLabel}, {cohort.demoDayTime}</p>
        </div>
        <div className="cd-stat">
          <p className="cd-label">curriculum</p>
          <p className="cd-stat-value">
            {started ? weekIndex + 1 : 0}
            <small>/ {weeks.length}</small>
          </p>
          <div className="cd-bar" aria-hidden="true">
            <span style={{ width: `${((started ? weekIndex + 1 : 0) / weeks.length) * 100}%` }} />
          </div>
        </div>
        <div className="cd-stat">
          <p className="cd-label">investors unlocked</p>
          <p className="cd-stat-value">
            {unlocked}
            <small>/ {slots}</small>
          </p>
          <div className="cd-bar" aria-hidden="true">
            <span style={{ width: `${(unlocked / slots) * 100}%` }} />
          </div>
        </div>
        <div className="cd-stat">
          <p className="cd-label">perks available</p>
          <p className="cd-stat-value">{content.perks.partners[0]?.value ?? "-"}</p>
          <p className="cd-muted">{content.perks.partners[0]?.label}</p>
        </div>
      </div>

      <div className="cd-grid-2">
        <section className="cd-card">
          <div className="cd-card-head">
            <p className="cd-label">{started ? "this week" : "week 01 · up first"}</p>
            <button type="button" className="cd-link" onClick={() => go("curriculum")}>
              full curriculum <ArrowRight size={14} />
            </button>
          </div>
          <h2 className="cd-card-title">{week.theme}</h2>
          <dl className="cd-dl">
            <div>
              <dt>lecture</dt>
              <dd>{week.lecture}</dd>
            </div>
            <div>
              <dt>homework</dt>
              <dd>{week.homework}</dd>
            </div>
          </dl>
        </section>

        <section className="cd-card">
          <div className="cd-card-head">
            <p className="cd-label">{content.checkins.weekly.label}</p>
            <button type="button" className="cd-link" onClick={() => go("checkins")}>
              check-ins <ArrowRight size={14} />
            </button>
          </div>
          <h2 className="cd-card-title">{content.checkins.weekly.when}</h2>
          <p className="cd-muted">{content.checkins.weekly.note}</p>
          {content.checkins.weekly.href ? (
            <ExternalLink href={content.checkins.weekly.href}>join the call</ExternalLink>
          ) : (
            <p className="cd-hint">meeting link coming soon.</p>
          )}
        </section>
      </div>

      <section className="cd-card">
        <div className="cd-card-head">
          <p className="cd-label">compute, credits &amp; perks</p>
          <button type="button" className="cd-link" onClick={() => go("perks")}>
            all perks <ArrowRight size={14} />
          </button>
        </div>
        <ul className="cd-perk-rows">
          {content.perks.partners.map((p) => (
            <li key={p.name}>
              <span className="cd-perk-name">{p.name}</span>
              <span className="cd-muted">
                {p.value} · {p.label}
              </span>
              <ExternalLink href={p.href}>{p.cta}</ExternalLink>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

// ------------------------------------------------------------ curriculum --

export function Curriculum({ content }: { content: CohortContent }) {
  const current = useWeekIndex(content);
  return (
    <div className="cd-stack">
      <div className="cd-card cd-note">
        {content.curriculum.note.map((line) => {
          const [label, ...rest] = line.split(":");
          return (
            <p key={line}>
              <strong>{label}:</strong>
              {rest.join(":")}
            </p>
          );
        })}
      </div>
      <ol className="cd-weeks">
        {content.curriculum.weeks.map((wk, i) => (
          <li
            key={wk.number}
            className="cd-card cd-week"
            data-state={i === current ? "now" : i < current ? "done" : "ahead"}
          >
            <span className="cd-week-number">{i < current ? <Check size={16} /> : wk.number}</span>
            <div>
              <h2 className="cd-card-title">
                {wk.theme}
                {i === current && <span className="cd-pill">this week</span>}
              </h2>
              <p className="cd-label cd-week-date">
                week of {new Date(`${wk.startIso}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
              <dl className="cd-dl">
                <div>
                  <dt>lecture</dt>
                  <dd>{wk.lecture}</dd>
                </div>
                <div>
                  <dt>homework</dt>
                  <dd>{wk.homework}</dd>
                </div>
              </dl>
            </div>
          </li>
        ))}
      </ol>
    </div>
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

// ----------------------------------------------- compute, credits, perks --

export function Perks({ content, me }: { content: CohortContent; me: Member }) {
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "done">("idle");
  const [message, setMessage] = useState(computeForm.error);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    const data = new FormData(event.currentTarget);
    const need = String(data.get("need") ?? "").trim();
    if (!need) {
      setMessage(computeForm.error);
      return setStatus("error");
    }
    setStatus("sending");
    const result = await submitComputeRequest({
      founder: me.name || me.email,
      email: me.email,
      need,
      tools: String(data.get("tools") ?? ""),
    });
    if (!result.ok) {
      setMessage(result.message || computeForm.error);
      return setStatus("error");
    }
    setStatus("done");
  };

  return (
    <div className="cd-stack">
      <p className="cd-muted cd-lede">{content.perks.body}</p>
      <div className="cd-grid-2">
        {content.perks.partners.map((p) => (
          <section className="cd-card cd-partner" key={p.name}>
            <p className="cd-label">{p.name}</p>
            <p className="cd-stat-value">{p.value}</p>
            <p className="cd-partner-label">{p.label}</p>
            <p className="cd-muted">{p.body}</p>
            <ExternalLink href={p.href}>{p.cta}</ExternalLink>
          </section>
        ))}
      </div>

      <section className="cd-card">
        <h2 className="cd-card-title">{computeForm.heading}</h2>
        <p className="cd-muted">{computeForm.body}</p>
        {status === "done" ? (
          <p className="cd-success">
            <Check size={16} /> {computeForm.success}
          </p>
        ) : (
          <form className="apply-form cd-form" onSubmit={onSubmit} noValidate>
            <label>
              {computeForm.fields.need}
              <textarea name="need" required />
            </label>
            <label>
              {computeForm.fields.tools}
              <input name="tools" placeholder="AWS, Deepgram, …" />
            </label>
            {status === "error" && (
              <p className="form-error" role="alert">
                {message}
              </p>
            )}
            <button type="submit" className="btn btn--solid" disabled={status === "sending"}>
              {status === "sending" ? computeForm.sending : computeForm.submit}
            </button>
          </form>
        )}
      </section>

      <section className="cd-card">
        <p className="cd-label">through our network</p>
        <p className="cd-muted">{content.compute.note}</p>
        <div className="cd-groups">
          {content.compute.groups.map((group) => (
            <div key={group.title}>
              <p className="cd-label">{group.title}</p>
              <ul className="cd-tags">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
