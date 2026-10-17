import { ArrowRight } from "lucide-react";
import { AuthFrame } from "@/dashboard/AuthFrame";
import { chooser } from "@/waitlist/content";

/** /login: pick the cohort 01 dashboard or the waitlist dashboard. */
export function LoginChooser() {
  return (
    <AuthFrame>
      <p className="eyebrow">{chooser.eyebrow}</p>
      <h1 className="cd-auth-heading">{chooser.heading}</h1>
      <div className="wl-choices">
        {chooser.options.map((option) => (
          <a key={option.href} className="wl-choice" href={option.href}>
            <span>
              <strong>{option.label}</strong>
              <small>{option.note}</small>
            </span>
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        ))}
      </div>
    </AuthFrame>
  );
}
