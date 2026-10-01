const quickLinks = [
  ["About", "#about"],
  ["Research", "#research"],
  ["Abstract", "#abstract"],
  ["Presentation", "#presentation"],
  ["Article", "#article"],
  ["Resume", "#resume"],
  ["Recognition", "#achievements"],
] as const;

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-16 md:grid-cols-3 md:px-8">
        <div>
          <h2 className="font-serif text-2xl">Hadi Abdul</h2>
          <div className="mt-5 space-y-2 text-sm text-white/60">
            <a className="block hover:text-accent" href="mailto:hadiabdul@college.harvard.edu">
              hadiabdul@college.harvard.edu
            </a>
            <p>Durham, NC</p>
          </div>
        </div>
        <div>
          <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            Quick Links
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-2 text-sm text-white/60">
            {quickLinks.map(([label, href]) => (
              <a key={label} href={href} className="hover:text-accent">
                {label}
              </a>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            Credits
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/60">
            Designed and built by Hadi Abdul · Last updated May 2026
          </p>
        </div>
        <div className="md:col-span-3">
          <div className="flex items-center gap-3 border-t border-white/10 pt-6">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
            <p className="text-xs text-white/48">Comprehensive Research Portfolio: Final Draft</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
