import { useMemo, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Clock, Lock, Mail, Search, Upload, X } from "lucide-react";
import {
  formatValue,
  logoUrl,
  requestForm,
  specialCredits,
  totalValue,
  unlockCopy,
  type Deal,
  type Progress,
  type RhoContent,
} from "@/dashboard/content";
import { submitDealRequest, submitRhoProof, validateProof, type Member } from "@/lib/dashboard";

/** Unlocked only once an admin has approved the proof (the DB sets rho_done_at then). */
export const isUnlocked = (p: Progress | null) => p?.rho_status === "approved" && Boolean(p.rho_done_at);

export function Logo({ deal, size = 36 }: { deal: Pick<Deal, "name" | "domain">; size?: number }) {
  const [broken, setBroken] = useState(false);
  const src = logoUrl(deal.domain);
  return (
    <span className="cd-logo" style={{ width: size, height: size }} aria-hidden="true">
      {src && !broken ? (
        <img src={src} alt="" width={size} height={size} loading="lazy" onError={() => setBroken(true)} />
      ) : (
        <span>{deal.name.charAt(0).toUpperCase()}</span>
      )}
    </span>
  );
}

/** Hover / focus card: the deal name and its value. */
function WorthTip({ deal, locked }: { deal: Deal; locked: boolean }) {
  const worth = formatValue(deal);
  return (
    <span className="cd-tip" role="tooltip">
      <span className="cd-tip-name">{deal.name}</span>
      {worth ? (
        <span className="cd-tip-worth">
          {worth}
        </span>
      ) : (
        <span className="cd-tip-worth cd-tip-worth--none">no fixed dollar value</span>
      )}
      {locked && (
        <span className="cd-tip-lock">
          <Lock size={11} /> unlocks after step 1
        </span>
      )}
    </span>
  );
}

// ------------------------------------------------------------------- rho --

export function RhoStep({
  rho,
  me,
  progress,
  onProgress,
  compact = false,
}: {
  rho: RhoContent;
  me: Member;
  progress: Progress | null;
  onProgress: (p: Progress) => void;
  compact?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [replacing, setReplacing] = useState(false);
  const done = isUnlocked(progress);
  const status = progress?.rho_status ?? "none";
  const showForm = !done && (status === "none" || status === "rejected" || replacing);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    const path = data.get("path") === "banking" ? "banking" : "incorporation";
    const file = data.get("proof") instanceof File ? (data.get("proof") as File) : null;
    const problem = validateProof(file);
    if (problem) return setError(unlockCopy[problem]);
    setBusy(true);
    setError("");
    const result = await submitRhoProof(me.email, path, file as File);
    setBusy(false);
    if (!result.ok) return setError(result.message);
    setReplacing(false);
    onProgress(result.data);
  };

  return (
    <section className={`cd-rho${compact ? " cd-rho--compact" : ""}`} data-done={done || undefined}>
      <div className="cd-rho-head">
        <span className="cd-rho-step">{done ? <Check size={14} /> : "1"}</span>
        <p className="cd-label">
          step 1 · {done ? "verified" : status === "pending" ? "under review" : "unlocks every deal"}
        </p>
      </div>
      <div className="cd-rho-body">
        <div className="cd-rho-mark" aria-hidden="true">
          <Logo deal={{ name: "Rho", domain: "rho.co" }} size={compact ? 44 : 64} />
        </div>
        <div className="cd-rho-copy">
          <h2 className="cd-rho-title">{rho.headline}</h2>
          <p className="cd-rho-fee">
            <s>{rho.fee} setup fee</s> <strong>waived for you</strong>
          </p>
          <p className="cd-muted">{rho.body}</p>
        </div>
      </div>

      {done ? (
        <p className="cd-success">
          <Check size={16} /> verified: you {progress?.rho_path === "banking" ? "bank" : "incorporated"} through Rho. every
          deal is unlocked.
        </p>
      ) : (
        <>
          <div className="cd-rho-actions">
            <a className="btn btn--solid" href={rho.href} target="_blank" rel="noopener">
              {rho.cta} <ArrowUpRight size={14} />
            </a>
          </div>

          {status === "pending" && !replacing && (
            <div className="cd-rho-status" data-status="pending">
              <Clock size={16} aria-hidden="true" />
              <p>{unlockCopy.pending}</p>
              <button type="button" className="cd-link" onClick={() => setReplacing(true)}>
                {unlockCopy.replace}
              </button>
            </div>
          )}

          {status === "rejected" && (
            <div className="cd-rho-status" data-status="rejected">
              <X size={16} aria-hidden="true" />
              <p>
                {unlockCopy.rejected}
                {progress?.review_note ? ` note from us: ${progress.review_note}` : ""}
              </p>
            </div>
          )}

          {showForm && (
            <form className="apply-form cd-proof" onSubmit={onSubmit} noValidate>
              <p className="cd-proof-heading">{unlockCopy.proofHeading}</p>
              <p className="cd-muted">{unlockCopy.proofBody}</p>
              <fieldset className="cd-proof-paths">
                <legend>{unlockCopy.pathLabel}</legend>
                <label>
                  <input type="radio" name="path" value="incorporation" defaultChecked /> {unlockCopy.incorporation}
                </label>
                <label>
                  <input type="radio" name="path" value="banking" /> {unlockCopy.banking}
                </label>
              </fieldset>
              <label>
                {unlockCopy.fileLabel}
                <input type="file" name="proof" accept=".pdf,.png,.jpg,.jpeg,.webp,.heic,application/pdf,image/*" required />
              </label>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <button type="submit" className="btn btn--ghost btn--sm" disabled={busy}>
                <Upload size={14} /> {busy ? unlockCopy.sending : unlockCopy.submit}
              </button>
            </form>
          )}
        </>
      )}
    </section>
  );
}

// ------------------------------------------------------- special credits --

export function SpecialCredits({ compact = false }: { compact?: boolean }) {
  const subject = encodeURIComponent("Special credit request: Boston Square Ventures cohort 01");
  const body = encodeURIComponent(
    "Hi,\n\nI'm in Boston Square Ventures cohort 01 and would like to request extra credits.\n\nWhich credits (Azure / Supabase / AWS / OpenAI):\nWhat I'm building:\nWhat I'll use them for:\n\nThanks!",
  );
  const all = specialCredits.contacts.map((c) => c.email).join(",");
  return (
    <section className={`cd-special${compact ? " cd-special--compact" : ""}`}>
      <div className="cd-special-head">
        <p className="cd-label">special request</p>
        <h2 className="cd-card-title">{specialCredits.heading}</h2>
        <p className="cd-muted">{specialCredits.body}</p>
      </div>
      <div className="cd-special-items">
        {specialCredits.items.map((item) => (
          <div className="cd-special-item" key={item.name}>
            <Logo deal={{ name: item.name, domain: item.domain }} size={36} />
            <span>
              <strong>{item.amount}</strong>
              <small>extra in {item.name}</small>
            </span>
          </div>
        ))}
      </div>
      <div className="cd-special-contacts">
        {specialCredits.contacts.map((c) => (
          <a key={c.email} className="cd-special-contact" href={`mailto:${c.email}?subject=${subject}&body=${body}`}>
            <Mail size={14} aria-hidden="true" />
            <span>
              <strong>{c.name}</strong>
              <small>{c.email}</small>
            </span>
          </a>
        ))}
        <a className="btn btn--solid btn--sm" href={`mailto:${all}?subject=${subject}&body=${body}`}>
          email us both <ArrowUpRight size={14} />
        </a>
      </div>
    </section>
  );
}

// ------------------------------------------------------------- logo wall --

export function LogoWall({ deals, locked }: { deals: Deal[]; locked: boolean }) {
  return (
    <div className="cd-wall" data-locked={locked || undefined}>
      {deals.map((d) => (
        <span className="cd-wall-item cd-has-tip" key={d.id} tabIndex={0} aria-label={`${d.name}: ${formatValue(d) ?? d.offer ?? ""}`}>
          <Logo deal={d} size={28} />
          <WorthTip deal={d} locked={locked} />
        </span>
      ))}
    </div>
  );
}

// ----------------------------------------------------------------- cards --

export function DealCard({ deal, locked }: { deal: Deal; locked: boolean }) {
  const worth = formatValue(deal);
  const body = (
    <>
      <Logo deal={deal} />
      <span className="cd-deal-text">
        <strong>{deal.name}</strong>
        <small>{deal.offer || deal.blurb}</small>
      </span>
      {worth && <span className="cd-deal-worth">{worth.replace(" est.", "")}</span>}
      {locked ? <Lock size={14} className="cd-deal-icon" /> : <ArrowUpRight size={15} className="cd-deal-icon" />}
      <WorthTip deal={deal} locked={locked} />
    </>
  );
  return locked ? (
    <div className="cd-deal cd-has-tip" data-locked tabIndex={0} aria-label={`${deal.name}, ${unlockCopy.locked}`}>
      {body}
    </div>
  ) : (
    <a className="cd-deal cd-has-tip" href={deal.url} target="_blank" rel="noopener">
      {body}
    </a>
  );
}

export function DealGrid({ deals, locked }: { deals: Deal[]; locked: boolean }) {
  return (
    <div className="cd-deals">
      {deals.map((d) => (
        <DealCard key={d.id} deal={d} locked={locked} />
      ))}
    </div>
  );
}

export function categoriesOf(deals: Deal[]) {
  const counts = new Map<string, number>();
  for (const d of deals) counts.set(d.category, (counts.get(d.category) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

/** The full deals tab: Rho first, then every deal, searchable. */
export function DealsPanel({
  deals,
  rho,
  me,
  progress,
  onProgress,
  initialCategory = null,
}: {
  deals: Deal[];
  rho: RhoContent;
  me: Member;
  progress: Progress | null;
  onProgress: (p: Progress) => void;
  initialCategory?: string | null;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(initialCategory);
  const locked = !isUnlocked(progress);
  const cats = useMemo(() => categoriesOf(deals), [deals]);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return deals.filter(
      (d) =>
        (!category || d.category === category) &&
        (!q || `${d.name} ${d.blurb ?? ""} ${d.category}`.toLowerCase().includes(q)),
    );
  }, [deals, query, category]);

  return (
    <div className="cd-stack">
      <RhoStep rho={rho} me={me} progress={progress} onProgress={onProgress} />
      <SpecialCredits compact />
      <div className="cd-deals-head">
        <h2 className="cd-card-title">
          {deals.length} deals · {totalValue(deals)} in value{" "}
          {locked ? <span className="cd-pill">{unlockCopy.locked}</span> : null}
        </h2>
        <label className="cd-search">
          <Search size={15} aria-hidden="true" />
          <input
            type="search"
            placeholder="search deals"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="search deals"
          />
        </label>
      </div>
      <div className="cd-filters" role="toolbar" aria-label="categories">
        <button type="button" className="cd-filter" aria-pressed={!category} onClick={() => setCategory(null)}>
          all <span>{deals.length}</span>
        </button>
        {cats.map(([c, n]) => (
          <button
            type="button"
            key={c}
            className="cd-filter"
            aria-pressed={category === c}
            onClick={() => setCategory(category === c ? null : c)}
          >
            {c} <span>{n}</span>
          </button>
        ))}
      </div>
      {shown.length ? (
        <DealGrid deals={shown} locked={locked} />
      ) : (
        <p className="cd-empty">nothing matches. try the request tab and we'll go find it.</p>
      )}
    </div>
  );
}

// --------------------------------------------------------------- request --

export function RequestForm({
  me,
  initial,
  source = "form",
}: {
  me: Member;
  initial?: { companies: string; note: string };
  source?: "form" | "chat";
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "done">("idle");
  const [message, setMessage] = useState(requestForm.error);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    const data = new FormData(event.currentTarget);
    const companies = String(data.get("companies") ?? "").trim();
    if (!companies) {
      setMessage(requestForm.error);
      return setStatus("error");
    }
    setStatus("sending");
    const result = await submitDealRequest({
      email: me.email,
      companies,
      note: String(data.get("note") ?? ""),
      source,
    });
    if (!result.ok) {
      setMessage(result.message);
      return setStatus("error");
    }
    setStatus("done");
  };

  if (status === "done")
    return (
      <p className="cd-success">
        <Check size={16} /> {requestForm.success}
      </p>
    );

  return (
    <form className="apply-form cd-form" onSubmit={onSubmit} noValidate>
      <label>
        {requestForm.fields.companies}
        <input name="companies" defaultValue={initial?.companies} placeholder={requestForm.fields.companiesHint} required />
      </label>
      <label>
        {requestForm.fields.note}
        <textarea name="note" defaultValue={initial?.note} />
      </label>
      {status === "error" && (
        <p className="form-error" role="alert">
          {message}
        </p>
      )}
      <button type="submit" className="btn btn--solid" disabled={status === "sending"}>
        {status === "sending" ? requestForm.sending : requestForm.submit}
      </button>
    </form>
  );
}
