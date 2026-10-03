import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Lock } from "lucide-react";
import { Reveal } from "@/components/Shell";
import {
  checkins,
  cohort,
  compute,
  computeForm,
  curriculum,
  vcBoard,
} from "@/dashboard/content";
import {
  fetchVcUnlocks,
  submitComputeRequest,
  type VcUnlock,
} from "@/lib/dashboard";
import { emailOk } from "@/lib/applications";

const DAY = 24 * 60 * 60 * 1000;

function useNow(tickMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), tickMs);
    return () => window.clearInterval(id);
  }, [tickMs]);
  return now;
}

function Countdown() {
  const now = useNow();
  const target = useMemo(() => new Date(cohort.demoDayIso).getTime(), []);
  const start = useMemo(() => new Date(cohort.startIso).getTime(), []);

  const left = Math.max(target - now, 0);
  const days = Math.floor(left / DAY);
  const hours = Math.floor((left % DAY) / (60 * 60 * 1000));
  const minutes = Math.floor((left % (60 * 60 * 1000)) / 60000);
  const seconds = Math.floor((left % 60000) / 1000);

  const total = curriculum.weeks.length;
  const elapsed = Math.floor((now - start) / (7 * DAY));
  const week = Math.min(Math.max(elapsed + 1, 1), total);
  const started = now >= start;

  return (
    <div className="dash-countdown">
      <p className="key-date-label">demo day 01</p>
      <div className="dash-clock" aria-label={`${days} days until demo day`}>
        {[
          [days, "days"],
          [hours, "hrs"],
          [minutes, "min"],
          [seconds, "sec"],
        ].map(([value, unit]) => (
          <span className="dash-clock-unit" key={unit as string}>
            <span className="dash-clock-value">
              {String(value).padStart(2, "0")}
            </span>
            <span className="dash-clock-label">{unit as string}</span>
          </span>
        ))}
      </div>
      <p className="key-date-note">
        {cohort.demoDayLabel}, {cohort.demoDayTime}.{" "}
        {started
          ? `week ${week} of ${total}.`
          : `${cohort.name} starts October 15.`}{" "}
        then every {cohort.cadenceWeeks} weeks.
      </p>
    </div>
  );
}

function Curriculum() {
  const now = useNow(60_000);
  const currentIndex = curriculum.weeks.reduce((acc, wk, i) => {
    return now >= new Date(wk.startIso).getTime() ? i : acc;
  }, -1);

  return (
    <section className="dash-block" aria-labelledby="dash-curriculum">
      <h2 id="dash-curriculum">curriculum.</h2>
      <div className="dash-note">
        {curriculum.note.map((line) => {
          const [label, ...rest] = line.split(":");
          return (
            <p key={line}>
              <strong>{label}:</strong>
              {rest.join(":")}
            </p>
          );
        })}
      </div>
      <ol className="dash-weeks">
        {curriculum.weeks.map((wk, i) => (
          <li
            key={wk.number}
            className="dash-week"
            data-state={
              i === currentIndex ? "now" : i < currentIndex ? "done" : "ahead"
            }
          >
            <span className="dash-week-number">{wk.number}</span>
            <div className="dash-week-body">
              <h3>
                {wk.theme}
                {i === currentIndex && (
                  <span className="dash-pill">this week</span>
                )}
              </h3>
              <dl>
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
    </section>
  );
}

function VcBoard() {
  const [rows, setRows] = useState<VcUnlock[] | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchVcUnlocks().then((data) => {
      if (!alive) return;
      setRows(data);
      setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Until the table exists (or the names are decided) show empty slots so the
  // shape of the thing is visible.
  const slots: VcUnlock[] =
    rows && rows.length
      ? rows
      : Array.from({ length: vcBoard.slots }, (_, i) => ({
          id: `placeholder-${i}`,
          firm: null,
          position: i + 1,
          status: "locked" as const,
          note: null,
        }));

  return (
    <section className="dash-block" aria-labelledby="dash-vcs">
      <h2 id="dash-vcs">your investor list.</h2>
      <p className="dash-lede">
        {vcBoard.slots} firms. we unlock one when we think you're ready and the
        intro will land. no deadline, no checklist.
      </p>
      <ul className="dash-vcs">
        {slots.map((slot) => {
          const unlocked = slot.status !== "locked";
          return (
            <li
              key={slot.id}
              className="dash-vc"
              data-status={slot.status}
              aria-label={
                unlocked ? (slot.firm ?? "unlocked") : vcBoard.lockedLabel
              }
            >
              <span className="dash-vc-index">
                {String(slot.position).padStart(2, "0")}
              </span>
              <span className="dash-vc-name">
                {unlocked ? (slot.firm ?? "unlocked") : vcBoard.lockedLabel}
              </span>
              {unlocked ? (
                <Check size={14} aria-hidden="true" />
              ) : (
                <Lock size={13} aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ul>
      {loaded && !rows && (
        <p className="dash-hint">
          not reading live unlock state. run the dashboard migration and set
          the Supabase env vars to connect it.
        </p>
      )}
    </section>
  );
}

function CheckIns() {
  return (
    <section className="dash-block" aria-labelledby="dash-checkins">
      <h2 id="dash-checkins">check-ins.</h2>
      <div className="dash-two">
        <div className="dash-card">
          <p className="key-date-label">{checkins.weekly.label}</p>
          <p className="dash-card-value">{checkins.weekly.when}</p>
          <p className="key-date-note">{checkins.weekly.note}</p>
          {checkins.weekly.href ? (
            <a
              className="btn btn--ghost btn--sm"
              href={checkins.weekly.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              join the call <ArrowUpRight size={14} />
            </a>
          ) : (
            <p className="dash-hint">meeting link not set yet.</p>
          )}
        </div>
        <div className="dash-card">
          <p className="key-date-label">{checkins.booking.label}</p>
          <p className="dash-card-value">any time this week</p>
          <p className="key-date-note">{checkins.booking.note}</p>
          {checkins.booking.href ? (
            <a
              className="btn btn--ghost btn--sm"
              href={checkins.booking.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              book a slot <ArrowUpRight size={14} />
            </a>
          ) : (
            <p className="dash-hint">booking link not set yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function ComputeRequest() {
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "done">(
    "idle",
  );
  const [message, setMessage] = useState(computeForm.error);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    const data = new FormData(event.currentTarget);
    const get = (k: string) => String(data.get(k) ?? "").trim();
    const input = {
      founder: get("founder"),
      email: get("email"),
      need: get("need"),
      tools: get("tools"),
    };
    if (!input.founder || !emailOk(input.email) || !input.need) {
      setMessage(computeForm.error);
      setStatus("error");
      return;
    }
    setStatus("sending");
    const result = await submitComputeRequest(input);
    if (!result.ok) {
      setMessage(result.message || computeForm.error);
      setStatus("error");
      return;
    }
    setStatus("done");
  };

  return (
    <section className="dash-block" aria-labelledby="dash-compute">
      <h2 id="dash-compute">{computeForm.heading}</h2>
      <p className="dash-lede">{computeForm.body}</p>

      {status === "done" ? (
        <p className="dash-success">
          <Check size={16} /> {computeForm.success}
        </p>
      ) : (
        <form className="apply-form dash-form" onSubmit={onSubmit} noValidate>
          <div className="two">
            <label>
              {computeForm.fields.founder}
              <input name="founder" autoComplete="name" required />
            </label>
            <label>
              {computeForm.fields.email}
              <input name="email" type="email" autoComplete="email" required />
            </label>
          </div>
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
          <button
            type="submit"
            className="btn btn--solid"
            style={{ justifySelf: "start" }}
            disabled={status === "sending"}
          >
            {status === "sending" ? computeForm.sending : computeForm.submit}
          </button>
        </form>
      )}

      <div className="dash-compute-list">
        <p className="dash-hint">{compute.note}</p>
        {compute.groups.map((group) => (
          <div className="dash-compute-group" key={group.title}>
            <p className="key-date-label">{group.title}</p>
            <ul>
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Dashboard() {
  return (
    <main id="main" className="dash">
      <div className="wrap">
        <Reveal className="dash-head">
          <p className="eyebrow">{cohort.name} · founder dashboard</p>
          <Countdown />
        </Reveal>
        <Curriculum />
        <VcBoard />
        <CheckIns />
        <ComputeRequest />
      </div>
    </main>
  );
}
