import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Reveal } from "@/components/Shell";
import { ResumeField } from "@/components/ResumeField";
import { preFounder } from "@/content";
import { emailOk, submitPreFounder, validateResume } from "@/lib/applications";

type Status = "idle" | "sending" | "error" | "done";
type Missing = Record<"firstName" | "lastName" | "email" | "school", boolean>;

const NO_MISSING: Missing = {
  firstName: false,
  lastName: false,
  email: false,
  school: false,
};

function readText(form: HTMLFormElement) {
  const data = new FormData(form);
  const get = (key: string) => String(data.get(key) ?? "").trim();
  return {
    firstName: get("firstName"),
    lastName: get("lastName"),
    email: get("email"),
    school: get("school"),
    level: get("level"),
    gradYear: get("gradYear"),
    major: get("major"),
    linkedin: get("linkedin"),
  };
}

export function PreFounderApply() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState(preFounder.error);
  const [missing, setMissing] = useState<Missing>(NO_MISSING);
  const [resume, setResume] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
    };
    setMissing(invalid);
    if (Object.values(invalid).some(Boolean)) {
      setErrorMessage(preFounder.error);
      setStatus("error");
      return;
    }
    if (!resume) {
      setResumeError(preFounder.resumeMissing);
      setErrorMessage(preFounder.resumeMissing);
      setStatus("error");
      return;
    }
    setStatus("sending");
    const result = await submitPreFounder({ ...text, resume });
    if (!result.ok) {
      setErrorMessage(result.message || preFounder.error);
      setStatus("error");
      return;
    }
    setStatus("done");
  };

  const reset = () => {
    setMissing(NO_MISSING);
    setErrorMessage(preFounder.error);
    setResume(null);
    setResumeError(null);
    setStatus("idle");
  };

  const invalidProps = (key: keyof Missing) =>
    status === "error" && missing[key]
      ? { "aria-invalid": true as const, "aria-describedby": "apply-error" }
      : {};

  const sending = status === "sending";
  const f = preFounder.fields;

  return (
    <section
      className="apply section"
      id="apply"
      aria-labelledby="apply-heading"
    >
      <div className="wrap apply-grid">
        <Reveal className="apply-copy">
          <p className="eyebrow">{preFounder.eyebrow}</p>
          <h2 id="apply-heading">{preFounder.heading}</h2>
          <p className="lede">{preFounder.body}</p>
        </Reveal>
        <Reveal delay={0.1}>
          {status === "done" ? (
            <div className="form-success" role="status">
              <Check size={28} />
              <h3>{preFounder.success}</h3>
              <p className="form-note">{preFounder.note}</p>
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
                  {f.level}
                  <select name="level" defaultValue={preFounder.levels[1]}>
                    {preFounder.levels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="two">
                <label>
                  {f.gradYear}
                  <input
                    name="gradYear"
                    inputMode="numeric"
                    placeholder="2030"
                  />
                </label>
                <label>
                  {f.major}
                  <input name="major" placeholder="computer science" />
                </label>
              </div>
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
                hint={preFounder.resumeHint}
                required
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
                {sending ? preFounder.sending : preFounder.submit}
                {!sending && <ArrowRight size={14} />}
              </LiquidButton>
              <p className="form-note">{preFounder.note}</p>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
