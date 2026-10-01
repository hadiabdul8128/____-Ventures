type StatCardProps = {
  value: string;
  label: string;
};

export function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="border-t border-[#cfb67933] pt-5">
      <div className="font-mono text-4xl font-semibold leading-none text-[#cfb679] md:text-5xl">
        {value}
      </div>
      <p className="mt-3 max-w-52 text-sm leading-6 text-[#aaa99a]">{label}</p>
    </div>
  );
}
