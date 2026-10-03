import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useReducedMotion } from "motion/react";
import { SquareField } from "@/components/SquareField";
import { ArrowRight, Check } from "lucide-react";
import { Reveal } from "@/components/Shell";
import { MetalCard } from "@/components/MetalCard";
import { ResumeField } from "@/components/ResumeField";
import { apply, closing, site } from "@/content";
import {
  countWords,
  emailOk,
  submitApplication,
  validateResume,
  WORD_LIMIT,
} from "@/lib/applications";

const STORAGE_KEY = "ventures-application";
const TEXT_FIELDS = [
  "name",
  "email",
  "school",
  "stage",
  "building",
  "achievement",
  "linkedin",
] as const;

type Draft = Partial<Record<(typeof TEXT_FIELDS)[number], string>>;
type Status = "idle" | "sending" | "error" | "done";

function loadDraft(): Draft {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Draft) : {};
  } catch {
    return {};
  }
}

function saveDraft(draft: Draft) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* storage unavailable */
  }
}

function clearDraft() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
}

function readText(form: HTMLFormElement): Required<Draft> {
  const data = new FormData(form);
  const get = (key: string) => String(data.get(key) ?? "").trim();
  return {
    name: get("name"),
    email: get("email"),
    school: get("school"),
    stage: get("stage"),
    building: get("building"),
    achievement: get("achievement"),
    linkedin: get("linkedin"),
  };
}

const NO_MISSING = { name: false, email: false, building: false };

export function Apply() {
  const [draft, setDraft] = useState<Draft>(() => loadDraft());
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState(apply.error);
  const [name, setName] = useState(draft.name ?? "");
  const [missing, setMissing] = useState(NO_MISSING);
  const [resume, setResume] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [counts, setCounts] = useState({
    building: countWords(draft.building ?? ""),
    achievement: countWords(draft.achievement ?? ""),
  });

  const overLimit = (key: "building" | "achievement") =>
    counts[key] > WORD_LIMIT;

  const onFormChange = (event: FormEvent<HTMLFormElement>) => {
    const text = readText(event.currentTarget);
    saveDraft(text);
    setCounts({
      building: countWords(text.building),
      achievement: countWords(text.achievement),
    });
  };

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
    const invalid = {
      name: !text.name,
      email: !emailOk(text.email),
      building: !text.building,
    };
    setMissing(invalid);
    if (invalid.name || invalid.email || invalid.building) {
      setErrorMessage(apply.error);
      setStatus("error");
      return;
    }
    if (
      countWords(text.building) > WORD_LIMIT ||
      countWords(text.achievement) > WORD_LIMIT
    ) {
      setErrorMessage(`keep each answer to ${WORD_LIMIT} words or fewer.`);
      setStatus("error");
      return;
    }
    setStatus("sending");
    const result = await submitApplication({ ...text, resume });
    if (!result.ok) {
      setErrorMessage(result.message || apply.error);
      setStatus("error");
      return;
    }
    clearDraft();
    setDraft({});
    setStatus("done");
  };

  const reset = () => {
    clearDraft();
    setDraft({});
    setMissing(NO_MISSING);
    setErrorMessage(apply.error);
    setResume(null);
    setResumeError(null);
    setStatus("idle");
    setName("");
  };

  const invalidProps = (key: keyof typeof missing) =>
    status === "error" && missing[key]
      ? { "aria-invalid": true as const, "aria-describedby": "apply-error" }
      : {};

  const sending = status === "sending";

  return (
    <section
      className="apply section"
      id="apply"
      aria-labelledby="apply-heading"
    >
      <div className="wrap apply-grid">
        <Reveal className="apply-copy">
          <p className="eyebrow">{apply.eyebrow}</p>
          <h2 id="apply-heading">{apply.heading}</h2>
          <p className="lede">{apply.body}</p>
          <MetalCard name={name} className="apply-card" />
          <p className="form-note apply-card-note">{apply.cardNote}</p>
        </Reveal>
        <Reveal delay={0.1}>
          {status === "done" ? (
            <div className="form-success" role="status">
              <Check size={28} />
              <h3>{apply.success}</h3>
              <p className="form-note">{apply.note}</p>
              <LiquidButton size="sm" type="button" onClick={reset}>
                start over <ArrowRight size={14} />
              </LiquidButton>
            </div>
          ) : (
            <form
              className="apply-form"
              onSubmit={onSubmit}
              onChange={onFormChange}
              noValidate
            >
              <div className="two">
                <label>
                  {apply.fields.name}
                  <input
                    name="name"
                    autoComplete="name"
                    defaultValue={draft.name}
                    onChange={(e) => setName(e.currentTarget.value)}
                    required
                    {...invalidProps("name")}
                  />
                </label>
                <label>
                  {apply.fields.email}
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    defaultValue={draft.email}
                    required
                    {...invalidProps("email")}
                  />
                </label>
              </div>
              <div className="two">
                <label>
                  {apply.fields.school}
                  <input
                    name="school"
                    placeholder="Harvard '30"
                    defaultValue={draft.school}
                  />
                </label>
                <label>
                  {apply.fields.stage}
                  <select
                    name="stage"
                    defaultValue={draft.stage ?? apply.stages[0]}
                  >
                    {apply.stages.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                {apply.fields.building}
                <textarea
                  name="building"
                  defaultValue={draft.building}
                  required
                  aria-describedby="building-count"
                  data-over={overLimit("building")}
                  {...invalidProps("building")}
                />
                <span
                  className="word-count"
                  id="building-count"
                  data-over={overLimit("building")}
                >
                  {counts.building} / {WORD_LIMIT} words
                </span>
              </label>
              <label>
                {apply.fields.achievement}
                <textarea
                  name="achievement"
                  defaultValue={draft.achievement}
                  aria-describedby="achievement-count"
                  data-over={overLimit("achievement")}
                />
                <span
                  className="word-count"
                  id="achievement-count"
                  data-over={overLimit("achievement")}
                >
                  {counts.achievement} / {WORD_LIMIT} words
                </span>
              </label>
              <label>
                {apply.fields.linkedin}
                <input
                  name="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/"
                  defaultValue={draft.linkedin}
                />
              </label>
              <ResumeField
                file={resume}
                error={resumeError}
                inputRef={fileRef}
                onChange={onResumeChange}
                onRemove={removeResume}
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
                {sending ? apply.sending : apply.submit}
                {!sending && <ArrowRight size={14} />}
              </LiquidButton>
              <p className="form-note">{apply.note}</p>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}

export function Closing() {
  const reduced = useReducedMotion();
  return (
    <section
      className="section closing-section"
      aria-labelledby="closing-heading"
    >
      <div className="closing-field" aria-hidden="true">
        {reduced ? (
          <div className="hero-bg-static" />
        ) : (
          <SquareField className="hero-canvas" />
        )}
      </div>
      <div className="wrap">
        <Reveal className="closing">
          <h2 id="closing-heading">
            {closing.lines[0]}
            {closing.lines[1] && <em>{closing.lines[1]}</em>}
          </h2>
          <LiquidButton asChild className="btn">
            <a href={site.applyHref}>
              {closing.cta} <ArrowRight size={14} />
            </a>
          </LiquidButton>
        </Reveal>
      </div>
    </section>
  );
}
