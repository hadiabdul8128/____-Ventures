type StatCardProps = {
  value: string;
  label: string;
};

export function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="border-t border-white/16 pt-5">
      <div className="font-mono text-4xl font-semibold leading-none text-accent md:text-5xl">
        {value}
      </div>
      <p className="mt-3 max-w-52 text-sm leading-6 text-white/70">{label}</p>
    </div>
  );
}
