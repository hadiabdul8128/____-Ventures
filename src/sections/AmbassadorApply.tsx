import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Reveal } from "@/components/Shell";
import { ResumeField } from "@/components/ResumeField";
import { ambassador } from "@/content";
import {
  countWords,
  emailOk,
  submitAmbassador,
  validateResume,
  WORD_LIMIT,
} from "@/lib/applications";

type Status = "idle" | "sending" | "error" | "done";
type Missing = Record<
  "firstName" | "lastName" | "email" | "school" | "why",
  boolean
>;

const NO_MISSING: Missing = {
  firstName: false,
  lastName: false,
  email: false,
  school: false,
  why: false,
};

function readText(form: HTMLFormElement) {
  const data = new FormData(form);
  const get = (key: string) => String(data.get(key) ?? "").trim();
  return {
    firstName: get("firstName"),
    lastName: get("lastName"),
    email: get("email"),
    school: get("school"),
    gradYear: get("gradYear"),
    linkedin: get("linkedin"),
    why: get("why"),
  };
}

export function AmbassadorApply() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState(ambassador.error);
  const [missing, setMissing] = useState<Missing>(NO_MISSING);
  const [resume, setResume] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [whyCount, setWhyCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const overLimit = whyCount > WORD_LIMIT;

  const onResumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0] ?? null;
    if (!file) return;
    const problem = validateResume(file);
    if (problem) {
      event.currentTarget.value = "";
      setResume(null);
      setResumeError(problem);
      return;
    }
    setResume(file);
    setResumeError(null);
  };

  const removeResume = () => {
    if (fileRef.current) fileRef.current.value = "";
    setResume(null);
    setResumeError(null);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    const text = readText(event.currentTarget);
    const invalid: Missing = {
      firstName: !text.firstName,
      lastName: !text.lastName,
      email: !emailOk(text.email),
      school: !text.school,
      why: !text.why,
    };
    setMissing(invalid);
    if (Object.values(invalid).some(Boolean)) {
      setErrorMessage(ambassador.error);
      setStatus("error");
      return;
    }
    if (countWords(text.why) > WORD_LIMIT) {
      setErrorMessage(`keep your answer to ${WORD_LIMIT} words or fewer.`);
      setStatus("error");
      return;
    }
    setStatus("sending");
    const result = await submitAmbassador({ ...text, resume });
    if (!result.ok) {
      setErrorMessage(result.message || ambassador.error);
      setStatus("error");
      return;
    }
    setStatus("done");
  };

  const reset = () => {
    setMissing(NO_MISSING);
    setErrorMessage(ambassador.error);
    setResume(null);
    setResumeError(null);
    setWhyCount(0);
    setStatus("idle");
  };

  const invalidProps = (key: keyof Missing) =>
    status === "error" && missing[key]
      ? { "aria-invalid": true as const, "aria-describedby": "apply-error" }
      : {};

  const sending = status === "sending";
  const f = ambassador.fields;

  return (
    <section
      className="apply section"
      id="apply"
      aria-labelledby="apply-heading"
    >
      <div className="wrap apply-grid">
        <Reveal className="apply-copy">
          <p className="eyebrow">{ambassador.eyebrow}</p>
          <h2 id="apply-heading">{ambassador.heading}</h2>
          <p className="lede">{ambassador.body}</p>
        </Reveal>
        <Reveal delay={0.1}>
          {status === "done" ? (
            <div className="form-success" role="status">
              <Check size={28} />
              <h3>{ambassador.success}</h3>
              <p className="form-note">{ambassador.note}</p>
              <LiquidButton size="sm" type="button" onClick={reset}>
                start over <ArrowRight size={14} />
              </LiquidButton>
            </div>
          ) : (
            <form className="apply-form" onSubmit={onSubmit} noValidate>
              <div className="two">
                <label>
                  {f.firstName}
                  <input
                    name="firstName"
                    autoComplete="given-name"
                    required
                    {...invalidProps("firstName")}
                  />
                </label>
                <label>
                  {f.lastName}
                  <input
                    name="lastName"
                    autoComplete="family-name"
                    required
                    {...invalidProps("lastName")}
                  />
                </label>
              </div>
              <label>
                {f.email}
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  {...invalidProps("email")}
                />
              </label>
              <div className="two">
                <label>
                  {f.school}
                  <input
                    name="school"
                    placeholder="Harvard"
                    autoComplete="organization"
                    required
                    {...invalidProps("school")}
                  />
                </label>
                <label>
                  {f.gradYear}
                  <input
                    name="gradYear"
                    inputMode="numeric"
                    placeholder="2030"
                  />
                </label>
              </div>
              <label>
                {f.why}
                <textarea
                  name="why"
                  required
                  aria-describedby="why-count"
                  data-over={overLimit}
                  onChange={(e) =>
                    setWhyCount(countWords(e.currentTarget.value))
                  }
                  {...invalidProps("why")}
                />
                <span
                  className="word-count"
                  id="why-count"
                  data-over={overLimit}
                >
                  {whyCount} / {WORD_LIMIT} words
                </span>
              </label>
              <label>
                {f.linkedin}
                <input
                  name="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/"
                />
              </label>
              <ResumeField
                file={resume}
                error={resumeError}
                inputRef={fileRef}
                onChange={onResumeChange}
                onRemove={removeResume}
                label={f.resume}
                hint={ambassador.resumeHint}
              />
              {status === "error" && (
                <p className="form-error" role="alert" id="apply-error">
                  {errorMessage}
                </p>
              )}
              <LiquidButton
                type="submit"
                className="btn"
                style={{ justifySelf: "start" }}
                disabled={sending}
                aria-busy={sending}
              >
                {sending ? ambassador.sending : ambassador.submit}
                {!sending && <ArrowRight size={14} />}
              </LiquidButton>
              <p className="form-note">{ambassador.note}</p>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
