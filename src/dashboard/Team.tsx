import { useEffect, useState, type FormEvent } from "react";
import { Check, Copy, KeyRound, Trash2 } from "lucide-react";
import { fetchMembers, inviteMember, removeMember, type Member } from "@/lib/dashboard";

/**
 * Admin only (the API and RLS enforce that too; hiding the tab is just UI).
 * Adding someone returns a one-time set-password link to send them yourself.
 */
export function Team({ me }: { me: Member }) {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [link, setLink] = useState<{ email: string; url: string } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [copied, setCopied] = useState(false);

  const load = () => fetchMembers().then(setMembers);
  useEffect(() => {
    load();
  }, []);

  const invite = async (input: Parameters<typeof inviteMember>[0]) => {
    setBusy(input.email);
    setError("");
    setCopied(false);
    const result = await inviteMember(input);
    setBusy("");
    if (!result.ok) return setError(result.message);
    setLink({ email: input.email.toLowerCase(), url: result.data });
    load();
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const get = (k: string) => String(data.get(k) ?? "").trim();
    await invite({
      email: get("email"),
      name: get("name"),
      company: get("company"),
      role: get("role") === "admin" ? "admin" : "founder",
    });
    form.reset();
  };

  const remove = async (m: Member) => {
    if (m.email === me.email) return;
    setBusy(m.email);
    const result = await removeMember(m.email);
    setBusy("");
    if (!result.ok) return setError(result.message);
    load();
  };

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="cd-stack">
      <section className="cd-card">
        <h2 className="cd-card-title">add a founder</h2>
        <p className="cd-muted">
          they get a one-time link to set their password. nothing is emailed, so copy the link and send it to them. it
          works once and expires after 24 hours.
        </p>
        <form className="apply-form cd-form" onSubmit={onSubmit}>
          <div className="two">
            <label>
              name
              <input name="name" autoComplete="off" />
            </label>
            <label>
              email
              <input name="email" type="email" autoComplete="off" required />
            </label>
          </div>
          <div className="two">
            <label>
              company
              <input name="company" autoComplete="off" />
            </label>
            <label>
              role
              <select name="role" defaultValue="founder">
                <option value="founder">founder</option>
                <option value="admin">admin</option>
              </select>
            </label>
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn--solid" disabled={Boolean(busy)}>
            {busy ? "adding…" : "add and get link"}
          </button>
        </form>

        {link && (
          <div className="cd-invite" role="status">
            <p className="cd-label">set-password link for {link.email}</p>
            <div className="cd-invite-row">
              <input readOnly value={link.url} onFocus={(e) => e.currentTarget.select()} aria-label="invite link" />
              <button type="button" className="btn btn--ghost btn--sm" onClick={copy}>
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "copied" : "copy"}
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="cd-card">
        <div className="cd-card-head">
          <h2 className="cd-card-title">cohort 01 · {members?.length ?? 0} people</h2>
        </div>
        <div className="cd-table-wrap">
          <table className="cd-table">
            <thead>
              <tr>
                <th>name</th>
                <th>email</th>
                <th>company</th>
                <th>role</th>
                <th aria-label="actions" />
              </tr>
            </thead>
            <tbody>
              {(members ?? []).map((m) => (
                <tr key={m.email}>
                  <td>{m.name || "-"}</td>
                  <td>{m.email}</td>
                  <td>{m.company || "-"}</td>
                  <td>
                    <span className="cd-pill">{m.role}</span>
                  </td>
                  <td className="cd-row-actions">
                    <button
                      type="button"
                      className="cd-icon-btn"
                      title="new set-password link"
                      aria-label={`new set-password link for ${m.email}`}
                      disabled={Boolean(busy)}
                      onClick={() =>
                        invite({ email: m.email, name: m.name ?? "", company: m.company ?? "", role: m.role })
                      }
                    >
                      <KeyRound size={15} />
                    </button>
                    {m.email !== me.email && (
                      <button
                        type="button"
                        className="cd-icon-btn"
                        title="remove from cohort"
                        aria-label={`remove ${m.email}`}
                        disabled={Boolean(busy)}
                        onClick={() => remove(m)}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
