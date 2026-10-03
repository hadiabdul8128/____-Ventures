import { LiquidButton } from "@/components/ui/liquid-glass-button";
import type { ChangeEvent, RefObject } from "react";
import { Paperclip, X } from "lucide-react";
import { apply } from "@/content";
import { RESUME_ACCEPT, formatBytes } from "@/lib/applications";

type Props = {
  file: File | null;
  error: string | null;
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
};

/** Native file input (kept for keyboard/AT) with a styled trigger row. */
export function ResumeField({
  file,
  error,
  inputRef,
  onChange,
  onRemove,
}: Props) {
  return (
    <div className="file-field" data-invalid={Boolean(error)}>
      <label htmlFor="apply-resume">{apply.fields.resume}</label>
      <input
        ref={inputRef}
        id="apply-resume"
        name="resume"
        type="file"
        accept={RESUME_ACCEPT}
        onChange={onChange}
        aria-describedby={error ? "resume-error" : "resume-hint"}
        aria-invalid={error ? true : undefined}
      />
      <div className="file-row">
        <LiquidButton
          size="sm"
          type="button"
          className="file-trigger"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => inputRef.current?.click()}
        >
          <Paperclip size={14} />
          {file ? "replace" : "choose file"}
        </LiquidButton>
        <div className={file ? "file-name" : "file-name is-empty"}>
          {file ? (
            <>
              <span>{file.name}</span>
              <small>{formatBytes(file.size)}</small>
            </>
          ) : (
            <span>no file chosen</span>
          )}
        </div>
        {file && (
          <LiquidButton
            size="sm"
            type="button"
            className="file-remove"
            onClick={onRemove}
            aria-label={`remove ${file.name}`}
          >
            <X size={12} /> remove
          </LiquidButton>
        )}
      </div>
      {error ? (
        <p className="form-error" role="alert" id="resume-error">
          {error}
        </p>
      ) : (
        <p className="file-hint" id="resume-hint">
          {apply.resumeHint}
        </p>
      )}
    </div>
  );
}
