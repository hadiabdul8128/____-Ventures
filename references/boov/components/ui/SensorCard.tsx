type SensorCardProps = {
  abbreviation: string;
  name: string;
  description: string;
  captures?: string;
  projectRole?: string;
};

export function SensorCard({
  abbreviation,
  name,
  description,
  captures,
  projectRole,
}: SensorCardProps) {
  return (
    <article className="group rounded-lg border border-white/12 bg-white/[0.035] p-6 transition hover:border-accent/60 hover:shadow-lift-dark">
      <h3 className="font-serif text-3xl text-white">{abbreviation}</h3>
      <p className="mt-2 font-semibold text-white/86">{name}</p>
      <p className="mt-3 text-sm leading-6 text-white/62">{description}</p>
      {captures || projectRole ? (
        <dl className="mt-5 space-y-4 border-t border-white/10 pt-5">
          {captures ? (
            <div>
              <dt className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-accent">
                Captures
              </dt>
              <dd className="mt-2 text-sm leading-6 text-white/72">{captures}</dd>
            </div>
          ) : null}
          {projectRole ? (
            <div>
              <dt className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-accent">
                Project role
              </dt>
              <dd className="mt-2 text-sm leading-6 text-white/72">{projectRole}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </article>
  );
}
