import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, X } from "lucide-react";
import type { FormEvent } from "react";

export type Audience = "founder" | "investor";
export function IntroductionDialog({
  audience,
  onClose,
}: {
  audience: Audience | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [role, setRole] = useState<Audience>("founder");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<Record<string, string>>({});
  const successRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (saved) successRef.current?.focus();
  }, [saved]);
  useEffect(() => {
    if (!audience) return;
    setRole(audience);
    setSaved(false);
    setError("");
    try {
      const stored = JSON.parse(
        localStorage.getItem("ventures-introduction") || "{}",
      );
      setDraft(stored && typeof stored === "object" ? stored : {});
    } catch {
      setDraft({});
    }
    ref.current?.showModal();
    return () => {
      ref.current?.close();
    };
  }, [audience]);
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      localStorage.setItem(
        "ventures-introduction",
        JSON.stringify({ ...data, role, savedAt: new Date().toISOString() }),
      );
      setSaved(true);
    } catch {
      setError(
        "Your browser could not save this draft. Please allow local storage and try again.",
      );
    }
  }
  return (
    <dialog
      ref={ref}
      className="intro-dialog"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="intro-title"
    >
      <button
        className="dialog-close icon-button"
        aria-label="Close introduction"
        onClick={onClose}
      >
        <X size={20} />
      </button>
      {saved ? (
        <div className="dialog-success" role="status">
          <span className="success-mark">
            <Check size={26} />
          </span>
          <p className="eyebrow">A FIRST CONNECTION</p>
          <h2 id="intro-title">
            Your next chapter.
            <br />
            <em>Starts here.</em>
          </h2>
          <p>
            Your introduction is saved on this device. This preview does not
            send applications yet.
          </p>
          <button ref={successRef} className="gold-button" onClick={onClose}>
            Back to exploring <ArrowUpRight size={16} />
          </button>
        </div>
      ) : (
        <>
          <p className="eyebrow">THE NEXT CONVERSATION</p>
          <h2 id="intro-title">
            Let’s make
            <br />
            <em>an introduction.</em>
          </h2>
          <div className="audience-options" role="group" aria-label="I am a">
            <button
              type="button"
              aria-pressed={role === "founder"}
              onClick={() => setRole("founder")}
            >
              A founder
            </button>
            <button
              type="button"
              aria-pressed={role === "investor"}
              onClick={() => setRole("investor")}
            >
              An investor
            </button>
          </div>
          <form key={draft.savedAt || "new"} onSubmit={save}>
            <div className="form-grid">
              <label>
                Your name
                <input
                  autoComplete="name"
                  name="name"
                  defaultValue={draft.name || ""}
                  required
                  maxLength={120}
                  placeholder="First and last name"
                />
              </label>
              <label>
                Email address
                <input
                  type="email"
                  autoComplete="email"
                  name="email"
                  defaultValue={draft.email || ""}
                  required
                  maxLength={254}
                  placeholder="you@company.com"
                />
              </label>
            </div>
            <label>
              {role === "founder"
                ? "Company or idea"
                : "Firm or investment focus"}
              <input
                name="organization"
                defaultValue={draft.organization || ""}
                required
                maxLength={160}
                placeholder={
                  role === "founder"
                    ? "What are you building?"
                    : "Where do you see possibility?"
                }
              />
            </label>
            <label>
              A little context <span className="optional">(optional)</span>
              <textarea
                name="context"
                defaultValue={draft.context || ""}
                rows={3}
                maxLength={2000}
                placeholder="The short version of your ambition."
              />
            </label>
            <p className="form-note">
              Private preview. Details are saved only in this browser.
            </p>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <button type="submit" className="gold-button">
              Save my introduction <ArrowUpRight size={16} />
            </button>
          </form>
        </>
      )}
    </dialog>
  );
}
