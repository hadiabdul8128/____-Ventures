import { useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { ArrowUpRight, Check, LogOut } from "lucide-react";
import { AuthFrame } from "@/dashboard/AuthFrame";
import { Mark } from "@/components/Mark";
import { getCohortClient } from "@/lib/dashboard";
import { waitlist, waitlistAuth, type StepId } from "@/waitlist/content";

type Row = {
  user_id: string;
  email: string;
  rho_done_at: string | null;
  bluevine_done_at: string | null;
};

const COLUMN: Record<StepId, "rho_done_at" | "bluevine_done_at"> = {
  rho: "rho_done_at",
  bluevine: "bluevine_done_at",
};

// ------------------------------------------------------------------ auth --

function Auth() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [status, setStatus] = useState<"idle" | "sending">("idle");
  const [message, setMessage] = useState<{
    kind: "error" | "info";
    text: string;
  } | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const supabase = getCohortClient();
    if (!supabase || status === "sending") return;
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    setMessage(null);

    if (mode === "up") {
      if (password.length < 8)
        return setMessage({ kind: "error", text: waitlistAuth.short });
      setStatus("sending");
      const { data: res, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/waitlist` },
      });
      setStatus("idle");
      if (error)
        return setMessage({ kind: "error", text: error.message.toLowerCase() });
      // With email confirmation on, there is no session until the link is clicked.
      if (!res.session)
        setMessage({ kind: "info", text: waitlistAuth.checkEmail });
      return;
    }

    setStatus("sending");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setStatus("idle");
    if (error) setMessage({ kind: "error", text: waitlistAuth.badLogin });
  };

  const sending = status === "sending";
  return (
    <AuthFrame>
      <p className="eyebrow">{waitlistAuth.eyebrow}</p>
      <h1 className="cd-auth-heading">
        {mode === "in"
          ? waitlistAuth.signInHeading
          : waitlistAuth.signUpHeading}
      </h1>
      <p className="cd-muted">{waitlistAuth.body}</p>
      <form className="apply-form cd-auth-form" onSubmit={onSubmit}>
        <label>
          {waitlistAuth.email}
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          {waitlistAuth.password}
          <input
            name="password"
            type="password"
            autoComplete={mode === "in" ? "current-password" : "new-password"}
            minLength={mode === "up" ? 8 : undefined}
            required
          />
        </label>
        {message && (
          <p
            className={message.kind === "error" ? "form-error" : "cd-muted"}
            role="alert"
          >
            {message.text}
          </p>
        )}
        <button type="submit" className="btn btn--solid" disabled={sending}>
          {sending
            ? waitlistAuth.sending
            : mode === "in"
              ? waitlistAuth.signIn
              : waitlistAuth.signUp}
        </button>
      </form>
      <button
        type="button"
        className="wl-switch"
        onClick={() => {
          setMode(mode === "in" ? "up" : "in");
          setMessage(null);
        }}
      >
        {mode === "in" ? waitlistAuth.toSignUp : waitlistAuth.toSignIn}
      </button>
      <p className="cd-hint">
        {waitlistAuth.cohortHint} <a href="/cohort-01">/cohort-01</a>.
      </p>
    </AuthFrame>
  );
}

// ------------------------------------------------------------- dashboard --

function Steps({ session }: { session: Session }) {
  const [row, setRow] = useState<Row | null>(null);
  const [error, setError] = useState("");
  const userId = session.user.id;
  const email = session.user.email ?? "";

  useEffect(() => {
    const supabase = getCohortClient();
    if (!supabase) return;
    let alive = true;
    (async () => {
      // Create the row on first visit; ignore the conflict on later ones.
      await supabase
        .from("waitlist_members")
        .upsert(
          { user_id: userId, email },
          { onConflict: "user_id", ignoreDuplicates: true },
        );
      const { data, error: err } = await supabase
        .from("waitlist_members")
        .select("user_id, email, rho_done_at, bluevine_done_at")
        .eq("user_id", userId)
        .maybeSingle();
      if (!alive) return;
      if (err || !data) setError(waitlist.saveError);
      else setRow(data as Row);
    })();
    return () => {
      alive = false;
    };
  }, [userId, email]);

  const toggle = async (id: StepId) => {
    const supabase = getCohortClient();
    if (!supabase || !row) return;
    const column = COLUMN[id];
    const value = row[column] ? null : new Date().toISOString();
    const previous = row;
    setRow({ ...row, [column]: value });
    const { error: err } = await supabase
      .from("waitlist_members")
      .update({ [column]: value })
      .eq("user_id", userId);
    if (err) {
      setRow(previous);
      setError(waitlist.saveError);
    }
  };

  const signOut = () => getCohortClient()?.auth.signOut();
  const allDone = Boolean(row?.rho_done_at && row?.bluevine_done_at);

  return (
    <main id="main" className="wl">
      <div className="wl-wrap">
        <header className="wl-top">
          <a
            href="/"
            className="cd-auth-brand"
            aria-label="Boston Square Ventures home"
          >
            <Mark size={26} />
            <span>Boston Square Ventures</span>
          </a>
          <span className="wl-user">
            <span className="wl-email">{email}</span>
            <button
              type="button"
              className="cd-icon-btn"
              onClick={signOut}
              aria-label="sign out"
              title="sign out"
            >
              <LogOut size={16} />
            </button>
          </span>
        </header>

        <p className="eyebrow">{waitlist.eyebrow}</p>
        <h1 className="wl-heading">{waitlist.heading}</h1>
        <p className="lede">{waitlist.body}</p>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {allDone && (
          <p className="wl-all-done" role="status">
            <Check size={16} /> {waitlist.doneAll}
          </p>
        )}

        <ol className="wl-steps">
          {waitlist.steps.map((step) => {
            const done = Boolean(row?.[COLUMN[step.id]]);
            return (
              <li
                className="wl-step"
                key={step.id}
                data-done={done || undefined}
              >
                <div className="wl-step-head">
                  <span className="track-number">{step.number}</span>
                  {done && (
                    <span className="wl-done-chip">
                      <Check size={12} /> {waitlist.done}
                    </span>
                  )}
                </div>
                <h2 className="wl-step-title">{step.title}</h2>
                <p className="wl-value">
                  {step.value && <strong>{step.value}</strong>}
                  <span>{step.valueLabel}</span>
                </p>
                <p className="wl-body">{step.body}</p>
                <p className="wl-note">{step.valueNote}</p>
                <div className="wl-actions">
                  <a
                    className="btn btn--solid"
                    href={step.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {step.cta} <ArrowUpRight size={14} />
                  </a>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => toggle(step.id)}
                    disabled={!row}
                    aria-pressed={done}
                  >
                    {done ? waitlist.undo : waitlist.markDone}
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </main>
  );
}

export function Waitlist() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    const supabase = getCohortClient();
    if (!supabase) {
      setSession(null);
      return;
    }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) =>
      setSession(next),
    );
    return () => data.subscription.unsubscribe();
  }, []);

  if (session === undefined) return null;
  return session ? <Steps session={session} /> : <Auth />;
}
