import { Download, Mail, MapPin } from "lucide-react";
import { Section } from "@/components/Section";

const education = [
  {
    school: "Harvard University",
    location: "Cambridge, MA",
    detail: "Incoming First-Year Student",
    bullets: [],
  },
  {
    school: "North Carolina School of Science and Mathematics",
    location: "Durham, NC",
    detail: "Aug 2024 – May 2026",
    bullets: [
      "Courses: Applications in Entrepreneurship, Mathematical Modeling, Biophysics, Organic Chemistry",
      "GPA: 4.92",
    ],
  },
] as const;

const experience = [
  {
    organization: "World Health Organization Innovation Hub - Eastern Mediterranean Region",
    role: "Research Intern · Supervisor: Dr. Ahmedali M.",
    dates: "Sept 2025 – Present",
    bullets: [
      "Currently mapping 80+ COVID-era digital health innovations across the Eastern Mediterranean, assessing scalability barriers including infrastructure, interoperability, and digital literacy gaps.",
      "Synthesizing input from 40+ regional experts to produce ranked research agendas across digital health, pandemic preparedness, and health systems strengthening.",
    ],
  },
  {
    organization: "Duke University - Big Ideas Lab (Dr. Jessilyn D., Dept. BME)",
    role: "Research Intern · PI: Dr. Jessilyn D.",
    dates: "Mar 2025 – Present",
    bullets: [
      "Developed VitalWave, an open-source wearable biosensing platform for digital biomarker discovery using high-frequency physiological data acquisition.",
      "Integrated near-infrared spectroscopy (NIRS) sensors for real-time biochemical composition sensing.",
      "Collaborated with Duke BME researchers on wearable health-data analysis pipelines.",
    ],
  },
  {
    organization: "University of Oxford - Systems Biology Group (Dr. Béla N.)",
    role: "Co-Founder, MemoryAssist · PI: Dr. Béla N. - U.S. Provisional Patent Application No. 63/755,185",
    dates: "Jun 2025 – Dec 2025",
    bullets: [
      "Co-Founded MemoryAssist, an AI-powered wearable to support Alzheimer's and dementia patients with real-time navigation, face recognition, and caregiver alerts.",
      "Piloted two units at Savoy Nursing Home, MA; recognized Congressional App Challenge Winner (CD 12, 2024).",
    ],
  },
  {
    organization: "Katrick, Scotland - Passive-Cooling Technology with Clinical Application",
    role: "Developer · Supervisor: Mr. Farshad Q.",
    dates: "Jun 2023 – Jan 2025",
    bullets: [
      "Assisted Katrick's vibration-powered passive cooling module: fixed a 12% thermal-limit overshoot by identifying a 0.3 mm interface causing >40% of thermal resistance.",
      "Contributed to Katrick + iomart's award-winning live deployment at Glasgow data centre, ~70% reduction in energy, ~100 tonnes of carbon emissions avoided - Digital City Awards: \"Best Use of Emerging Technology.\"",
    ],
  },
  {
    organization: "Lucent - PFAS Water Filtration System",
    role: "Co-Founder & Engineer",
    dates: "Sept 2024 – Mar 2025",
    bullets: [
      "Founded 3D-printable PFAS water filtration system with 8 filters deployed delivering ~600,000+ liters of clean water annually across partner sites including Daffodils Ladies Hostel in Koche, India and Africa Safe Water Foundation in Kenya - advanced to Diamond Challenge Grand Finals (Top 60 / 3,400 innovations).",
    ],
  },
] as const;

const activities = [
  "2026 Coca-Cola Scholar - Recognized among 150 of 100,000+ applicants nationwide for $20,000 scholarship (Feb 2026)",
  "USA Mathematical Olympiad (USAMO) Qualifier - Top 250 of 300,000 (Jan 2026)",
  "U.S. Physics Olympiad (USAPhO) Silver Medal - Top 90 of 6,000 (April 2025)",
  "Diamond Challenge Grand Finalist - Top 60 of 3,400 teams (Mar 2025)",
  "TEDx Speaker - \"Breaking Through Perceived Limits,\" 8.6k YouTube views (Oct 2024)",
] as const;

export function Resume() {
  return (
    <Section id="resume" label="06 · Resume" className="bg-white">
      <div className="grid gap-12 lg:grid-cols-12">
        <article className="lg:col-span-8">
          <h2>Resume</h2>

          <div className="mt-10">
            <h3 className="font-serif text-2xl">Education</h3>
            <div className="mt-5 space-y-6">
              {education.map((item) => (
                <div key={item.school} className="resume-entry border-t border-rule pt-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <p className="font-semibold text-ink">{item.school}, {item.location}</p>
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                      {item.detail}
                    </p>
                  </div>
                  {item.bullets ? (
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-ink-soft">
                      {item.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12">
            <h3 className="font-serif text-2xl">Relevant Experience</h3>
            <div className="mt-5 space-y-8">
              {experience.map((item) => (
                <div key={item.organization} className="resume-entry border-t border-rule pt-5">
                  <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-start">
                    <div>
                      <p className="font-semibold text-ink">{item.organization}</p>
                      <p className="mt-1 text-sm text-muted">{item.role}</p>
                    </div>
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.1em] text-muted md:text-right">
                      {item.dates}
                    </p>
                  </div>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-ink-soft">
                    {item.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12">
            <h3 className="font-serif text-2xl">Other Achievements & Activities</h3>
            <ul className="mt-5 list-disc space-y-3 border-t border-rule pt-5 pl-5 text-sm leading-6 text-ink-soft">
              {activities.map((activity) => (
                <li key={activity}>{activity}</li>
              ))}
            </ul>
          </div>
        </article>

        <aside className="lg:col-span-4">
          <div className="sticky top-28 rounded-lg border border-rule bg-paper p-6 shadow-lift">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-accent-deep">
              Resume PDF
            </p>
            <h3 className="mt-4 font-serif text-2xl">Hadi Abdul</h3>
            <p className="mt-2 text-sm text-muted">Last updated: May 2026</p>
            <a
              href="/assets/resume.pdf"
              target="_blank"
              rel="noopener"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-deep"
            >
              <Download aria-hidden size={16} />
              Download PDF
            </a>
            <div className="mt-6 space-y-3 border-t border-rule pt-5 text-sm text-ink-soft">
              <a className="flex items-center gap-2 hover:text-accent-deep" href="mailto:hadiabdul@college.harvard.edu">
                <Mail aria-hidden size={16} />
                hadiabdul@college.harvard.edu
              </a>
              <p className="flex items-center gap-2">
                <MapPin aria-hidden size={16} />
                Durham, NC
              </p>
            </div>
          </div>
        </aside>
      </div>
    </Section>
  );
}
