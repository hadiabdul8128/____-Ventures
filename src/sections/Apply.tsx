import { useState, type FormEvent } from "react";
import { useReducedMotion } from "motion/react";
import { SquareField } from "@/components/SquareField";
import { ArrowRight, Check } from "lucide-react";
import { Reveal } from "@/components/Shell";
import { MetalCard } from "@/components/MetalCard";
import { apply, closing, site } from "@/content";

const STORAGE_KEY = "ventures-application";

type Application = {
  name: string;
  email: string;
  school: string;
  stage: string;
  building: string;
  link: string;
  savedAt: string;
};

function loadDraft(): Partial<Application> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<Application>) : {};
  } catch {
    return {};
  }
}

const emailOk = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export function Apply() {
  const [draft, setDraft] = useState<Partial<Application>>(() => loadDraft());
  const [status, setStatus] = useState<"idle" | "error" | "done">(
    draft.savedAt ? "done" : "idle",
  );
  const [name, setName] = useState(draft.name ?? "");
  const [missing, setMissing] = useState({
    name: false,
    email: false,
    building: false,
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const get = (key: string) => String(data.get(key) ?? "").trim();
    const record: Application = {
      name: get("name"),
      email: get("email"),
      school: get("school"),
      stage: get("stage"),
      building: get("building"),
      link: get("link"),
      savedAt: new Date().toISOString(),
    };
    const invalid = {
      name: !record.name,
      email: !emailOk(record.email),
      building: !record.building,
    };
    setMissing(invalid);
    if (invalid.name || invalid.email || invalid.building) {
      setStatus("error");
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {
      /* storage unavailable; still show confirmation so the flow is testable */
    }
    setStatus("done");
  };

  const reset = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
    setDraft({});
    setMissing({ name: false, email: false, building: false });
    setStatus("idle");
    setName("");
  };

  const invalidProps = (key: keyof typeof missing) =>
    status === "error" && missing[key]
      ? { "aria-invalid": true as const, "aria-describedby": "apply-error" }
      : {};

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
              <button type="button" className="text-link" onClick={reset}>
                start over <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <form className="apply-form" onSubmit={onSubmit} noValidate>
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
                  {...invalidProps("building")}
                />
              </label>
              <label>
                {apply.fields.link}
                <input
                  name="link"
                  type="url"
                  placeholder="https://"
                  defaultValue={draft.link}
                />
              </label>
              {status === "error" && (
                <p className="form-error" role="alert" id="apply-error">
                  {apply.error}
                </p>
              )}
              <button
                type="submit"
                className="btn btn--solid"
                style={{ justifySelf: "start" }}
              >
                {apply.submit} <ArrowRight size={14} />
              </button>
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
            <em>{closing.lines[1]}</em>
          </h2>
          <a className="btn btn--solid" href={site.applyHref}>
            {closing.cta} <ArrowRight size={14} />
          </a>
          {!reduced && (
            <p className="hero-hint">
              move your cursor, or tap. the square notices.
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
