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
    <article className="group rounded-lg border border-[#cfb67933] bg-[#10120e] p-6 transition hover:border-[#cfb679]/60">
      <h3 className="font-serif text-3xl text-[#eae6dc]">{abbreviation}</h3>
      <p className="mt-2 font-semibold text-[#d6d0c1]">{name}</p>
      <p className="mt-3 text-sm leading-6 text-[#a09f93]">{description}</p>
      {captures || projectRole ? (
        <dl className="mt-5 space-y-4 border-t border-[#cfb67922] pt-5">
          {captures ? (
            <div>
              <dt className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[#cfb679]">
                Captures
              </dt>
              <dd className="mt-2 text-sm leading-6 text-[#bdb7a7]">
                {captures}
              </dd>
            </div>
          ) : null}
          {projectRole ? (
            <div>
              <dt className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[#cfb679]">
                Project role
              </dt>
              <dd className="mt-2 text-sm leading-6 text-[#bdb7a7]">
                {projectRole}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </article>
  );
}
