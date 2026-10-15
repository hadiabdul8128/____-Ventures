import { useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  CalendarClock,
  Gift,
  Landmark,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  SendHorizontal,
  Users,
} from "lucide-react";
import { Mark } from "@/components/Mark";
import {
  cohort,
  login,
  sections,
  requestForm,
  type CohortContent,
  type Deal,
  type Progress,
  type SectionId,
} from "@/dashboard/content";
import {
  fetchContent,
  fetchDeals,
  fetchMe,
  fetchProgress,
  fetchVcUnlocks,
  getCohortClient,
  type Member,
  type VcUnlock,
} from "@/lib/dashboard";
import { CheckIns, Investors, useCountdown } from "@/dashboard/panels";
import { Chat } from "@/dashboard/Chat";
import { Home } from "@/dashboard/Home";
import { DealsPanel, RequestForm, isUnlocked } from "@/dashboard/Deals";
import { Team } from "@/dashboard/Team";

// Read before the Supabase client consumes and clears the hash. Any emailed
// link (invite, recovery, or a first-time email sign-up) lands here as
// #access_token=…&type=…, and in this app those are only used to set a password.
const landing = typeof window === "undefined" ? "" : window.location.hash;
const arrivedToSetPassword = /type=(invite|recovery|signup|magiclink)/.test(landing);
const arrivedWithError = /error_code=|error=/.test(landing)
  ? "that link has expired or was already used. ask Soneesh or Hadi for a new one."
  : "";

const ICONS: Record<SectionId, typeof MessageSquare> = {
  home: LayoutDashboard,
  chat: MessageSquare,
  deals: Gift,
  request: SendHorizontal,
  investors: Landmark,
  checkins: CalendarClock,
  team: Users,
};

function sectionFromHash(): SectionId {
  const id = window.location.hash.replace("#", "");
  if (id === "team" || sections.some((s) => s.id === id)) return id as SectionId;
  return "home";
}

// ------------------------------------------------------------------ auth --

function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="cd-auth">
      <div className="cd-auth-card">
        <a href="/" className="cd-auth-brand" aria-label="Boston Square Ventures home">
          <Mark size={28} />
          <span>Boston Square Ventures</span>
        </a>
        {children}
      </div>
    </main>
  );
}

function Login({ notice }: { notice: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const supabase = getCohortClient();
    if (!supabase || status === "sending") return;
    const data = new FormData(event.currentTarget);
    setStatus("sending");
    const { error } = await supabase.auth.signInWithPassword({
      email: String(data.get("email") ?? "").trim(),
      password: String(data.get("password") ?? ""),
    });
    setStatus(error ? "error" : "idle");
  };

  return (
    <AuthFrame>
      <p className="eyebrow">{login.eyebrow}</p>
      <h1 className="cd-auth-heading">{login.heading}</h1>
      <p className="cd-muted">{login.body}</p>
      {notice && (
        <p className="form-error" role="alert">
          {notice}
        </p>
      )}
      <form className="apply-form cd-auth-form" onSubmit={onSubmit}>
        <label>
          {login.email}
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          {login.password}
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        {status === "error" && (
          <p className="form-error" role="alert">
            {login.error}
          </p>
        )}
        <button type="submit" className="btn btn--solid" disabled={status === "sending"}>
          {status === "sending" ? login.sending : login.submit}
        </button>
      </form>
      <p className="cd-hint">{login.forgot}</p>
    </AuthFrame>
  );
}

function SetPassword({ email, onDone }: { email: string; onDone: () => void }) {
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    if (password.length < 8) return setError(login.setShort);
    if (password !== String(data.get("confirm") ?? "")) return setError(login.setMismatch);
    const supabase = getCohortClient();
    if (!supabase) return;
    setSending(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setSending(false);
    if (err) return setError(err.message.toLowerCase());
    onDone();
  };

  return (
    <AuthFrame>
      <p className="eyebrow">{login.eyebrow}</p>
      <h1 className="cd-auth-heading">{login.setHeading}</h1>
      <p className="cd-muted">
        {login.setBody} you'll sign in as <strong>{email}</strong>.
      </p>
      <form className="apply-form cd-auth-form" onSubmit={onSubmit}>
        <input type="email" name="username" value={email} autoComplete="username" readOnly hidden />
        <label>
          new password
          <input name="password" type="password" autoComplete="new-password" required />
        </label>
        <label>
          confirm password
          <input name="confirm" type="password" autoComplete="new-password" required />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn--solid" disabled={sending}>
          {sending ? "saving…" : login.setSubmit}
        </button>
      </form>
    </AuthFrame>
  );
}

// ----------------------------------------------------------------- shell --

function Shell({ me, onSignOut }: { me: Member; onSignOut: () => void }) {
  const [section, setSection] = useState<SectionId>(sectionFromHash);
  const [content, setContent] = useState<CohortContent | null>(null);
  const [vcs, setVcs] = useState<VcUnlock[] | null>(null);
  const [deals, setDeals] = useState<Deal[] | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [question, setQuestion] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const { days } = useCountdown();

  useEffect(() => {
    let alive = true;
    Promise.all([fetchContent(), fetchVcUnlocks(), fetchDeals(), fetchProgress(me.email)]).then(
      ([c, v, d, p]) => {
        if (!alive) return;
        setContent(c);
        setVcs(v);
        setDeals(d ?? []);
        setProgress(p);
        setLoadError(!c || !c.rho);
      },
    );
    return () => {
      alive = false;
    };
  }, []);

  const go = (id: SectionId, keepCategory = false) => {
    if (!keepCategory) setCategory(null);
    setSection(id);
    window.history.replaceState(null, "", `#${id}`);
    window.scrollTo({ top: 0 });
  };

  const nav = me.role === "admin" ? [...sections, { id: "team" as const, label: "team" }] : sections;
  const current = nav.find((s) => s.id === section) ?? nav[0];
  const first = (me.name || me.email).split(/[\s@]/)[0];

  return (
    <div className="cd">
      <aside className="cd-side" aria-label="dashboard">
        <a href="/" className="cd-brand" aria-label="Boston Square Ventures home">
          <Mark size={26} />
          <span>
            Boston Square
            <small>{cohort.name}</small>
          </span>
        </a>
        <nav className="cd-nav">
          {nav.map((s) => {
            const Icon = ICONS[s.id];
            return (
              <button
                key={s.id}
                type="button"
                className="cd-nav-item"
                aria-current={s.id === section ? "page" : undefined}
                onClick={() => go(s.id)}
              >
                <Icon size={16} aria-hidden="true" />
                <span>{s.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="cd-user">
          <span className="cd-avatar" aria-hidden="true">
            {first.charAt(0).toUpperCase()}
          </span>
          <span className="cd-user-text">
            <strong>{me.name || first}</strong>
            <small>{me.company || me.role}</small>
          </span>
          <button type="button" className="cd-icon-btn" onClick={onSignOut} aria-label="sign out" title="sign out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main id="main" className="cd-main">
        <header className="cd-top">
          <h1>{current.label}</h1>
          <span className="cd-chip">
            <span className="cd-dot" data-locked={!isUnlocked(progress) || undefined} aria-hidden="true" />
            {isUnlocked(progress) ? `${deals?.length ?? 0} deals unlocked` : "step 1: Rho"} · {days} days to demo day
          </span>
        </header>

        {loadError ? (
          <p className="cd-empty">couldn't load the cohort content. refresh, or message Soneesh or Hadi.</p>
        ) : !content || !deals ? (
          <div className="cd-skeleton" aria-busy="true" aria-label="loading">
            <span />
            <span />
            <span />
          </div>
        ) : section === "chat" ? null : section === "home" ? (
          <Home
            me={me}
            content={content}
            deals={deals}
            progress={progress}
            vcs={vcs}
            go={go}
            onAsk={(q) => {
              setQuestion(q);
              go("chat");
            }}
            onPickCategory={(c) => {
              setCategory(c);
              go("deals", true);
            }}
          />
        ) : section === "deals" ? (
          <DealsPanel
            key={category ?? "all"}
            deals={deals}
            rho={content.rho}
            me={me}
            progress={progress}
            onProgress={setProgress}
            initialCategory={category}
          />
        ) : section === "request" ? (
          <div className="cd-stack">
            <section className="cd-card">
              <h2 className="cd-card-title">{requestForm.heading}</h2>
              <p className="cd-muted">{requestForm.body}</p>
              <RequestForm me={me} />
            </section>
          </div>
        ) : section === "investors" ? (
          <Investors content={content} vcs={vcs} />
        ) : section === "checkins" ? (
          <CheckIns content={content} />
        ) : section === "team" && me.role === "admin" ? (
          <Team me={me} />
        ) : null}

        {/* Kept mounted so the conversation survives switching tabs. */}
        {content && deals && !loadError && (
          <div hidden={section !== "chat"}>
            <Chat
              me={me}
              content={content}
              deals={deals}
              progress={progress}
              onProgress={setProgress}
              question={section === "chat" ? question : null}
              onQuestionHandled={() => setQuestion(null)}
            />
          </div>
        )}
      </main>
    </div>
  );
}

// ------------------------------------------------------------------ root --

type State =
  | { kind: "loading" }
  | { kind: "signed-out" }
  | { kind: "set-password"; email: string }
  | { kind: "not-member"; email: string }
  | { kind: "in"; me: Member };

export function Dashboard() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [needsPassword, setNeedsPassword] = useState(arrivedToSetPassword);

  useEffect(() => {
    const supabase = getCohortClient();
    if (!supabase) {
      setState({ kind: "signed-out" });
      return;
    }
    let alive = true;

    const resolve = async (session: Session | null) => {
      const email = session?.user.email;
      if (!email) return alive && setState({ kind: "signed-out" });
      if (needsPassword) return alive && setState({ kind: "set-password", email });
      const me = await fetchMe(email);
      if (!alive) return;
      setState(me ? { kind: "in", me } : { kind: "not-member", email });
    };

    supabase.auth.getSession().then(({ data }) => resolve(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") setNeedsPassword(true);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        // Defer: supabase-js warns against awaiting its own calls in here.
        setTimeout(() => resolve(session), 0);
      }
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [needsPassword]);

  const signOut = async () => {
    await getCohortClient()?.auth.signOut();
    window.history.replaceState(null, "", window.location.pathname);
    setState({ kind: "signed-out" });
  };

  if (state.kind === "loading") return <main id="main" className="cd-auth" aria-busy="true" />;
  if (state.kind === "signed-out") return <Login notice={arrivedWithError} />;
  if (state.kind === "set-password")
    return <SetPassword email={state.email} onDone={() => setNeedsPassword(false)} />;
  if (state.kind === "not-member")
    return (
      <AuthFrame>
        <h1 className="cd-auth-heading">not on the list.</h1>
        <p className="cd-muted">{login.notMember}</p>
        <p className="cd-muted">
          signed in as <strong>{state.email}</strong>.
        </p>
        <button type="button" className="btn btn--ghost" onClick={signOut}>
          sign out
        </button>
      </AuthFrame>
    );
  return <Shell me={state.me} onSignOut={signOut} />;
}
