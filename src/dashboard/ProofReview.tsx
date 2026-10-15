import { useState } from "react";
import { Check, ExternalLink, X } from "lucide-react";
import type { Progress } from "@/dashboard/content";
import { proofLink, reviewProof, type Member } from "@/lib/dashboard";

const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "";

/**
 * Admins verify step 1 here. Approving is the only way a founder's deals
 * unlock: RLS stops founders from approving themselves, and the database
 * sets rho_done_at on approval.
 */
export function ProofReview({
  me,
  members,
  progress,
  onChange,
}: {
  me: Member;
  members: Member[];
  progress: Map<string, Progress>;
  onChange: () => void;
}) {
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const names = new Map(members.map((m) => [m.email, m]));
  const rows = [...progress.values()]
    .filter((p) => p.rho_status !== "none")
    .sort((a, b) => {
      const order = { pending: 0, rejected: 1, approved: 2, none: 3 };
      return order[a.rho_status] - order[b.rho_status] || (b.submitted_at ?? "").localeCompare(a.submitted_at ?? "");
    });
  const pending = rows.filter((r) => r.rho_status === "pending").length;

  const open = async (p: Progress) => {
    if (!p.proof_path) return;
    // Open the tab synchronously so popup blockers allow it, then point it at the signed URL.
    const tab = window.open("", "_blank");
    if (tab) tab.opener = null;
    const url = await proofLink(p.proof_path);
    if (url && tab) tab.location.href = url;
    else if (url) window.location.href = url;
    else {
      tab?.close();
      setError("couldn't open that file. try again.");
    }
  };

  const decide = async (p: Progress, decision: "approved" | "rejected") => {
    setBusy(p.email);
    setError("");
    const result = await reviewProof(p.email, decision, me.email, notes[p.email] ?? "");
    setBusy("");
    if (!result.ok) return setError(result.message);
    onChange();
  };

  return (
    <section className="cd-card">
      <div className="cd-card-head">
        <h2 className="cd-card-title">
          Rho proof review {pending > 0 && <span className="cd-pill cd-pill--alert">{pending} waiting</span>}
        </h2>
      </div>
      <p className="cd-muted">
        founders upload proof that they incorporated or bank through Rho. approve it to unlock their deals. reject it
        with a note and they'll see the note and can re-upload.
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {rows.length === 0 ? (
        <p className="cd-hint">no submissions yet.</p>
      ) : (
        <ul className="cd-proofs">
          {rows.map((p) => {
            const m = names.get(p.email);
            return (
              <li key={p.email} className="cd-proof-row" data-status={p.rho_status}>
                <div className="cd-proof-who">
                  <strong>{m?.name || p.email}</strong>
                  <small>
                    {m?.company ? `${m.company} · ` : ""}
                    {p.email}
                  </small>
                  <small>
                    {p.rho_path === "banking" ? "opened banking" : "incorporated"} · sent {when(p.submitted_at)}
                    {p.reviewed_at ? ` · ${p.rho_status} by ${p.reviewed_by} ${when(p.reviewed_at)}` : ""}
                  </small>
                  {p.review_note && <small>note: {p.review_note}</small>}
                </div>
                <span className="cd-pill">{p.rho_status}</span>
                <div className="cd-proof-actions">
                  {p.proof_path && (
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => open(p)}>
                      view proof <ExternalLink size={13} />
                    </button>
                  )}
                  {p.rho_status !== "approved" && (
                    <>
                      <input
                        className="cd-proof-note"
                        placeholder="note (optional)"
                        value={notes[p.email] ?? ""}
                        onChange={(e) => setNotes((n) => ({ ...n, [p.email]: e.target.value }))}
                        aria-label={`review note for ${p.email}`}
                      />
                      <button
                        type="button"
                        className="btn btn--solid btn--sm"
                        disabled={busy === p.email || p.rho_status === "rejected"}
                        onClick={() => decide(p, "approved")}
                      >
                        <Check size={13} /> approve
                      </button>
                      {p.rho_status === "pending" && (
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          disabled={busy === p.email}
                          onClick={() => decide(p, "rejected")}
                        >
                          <X size={13} /> reject
                        </button>
                      )}
                    </>
                  )}
                  {p.rho_status === "approved" && (
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      disabled={busy === p.email}
                      onClick={() => decide(p, "rejected")}
                    >
                      revoke
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
