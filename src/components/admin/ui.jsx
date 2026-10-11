export function Panel({ title, children, collapsible = false, defaultOpen = true, }) {
    if (!collapsible) {
        return (<div className="mb-5 border-2 border-ink bg-surface p-4">
      <h2 className="mb-3 font-display text-base">{title}</h2>
      {children}
    </div>);
    }
    return (<details className="group mb-5 border-2 border-ink bg-surface" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between p-4 font-display text-base">
        {title}
        <span className="text-sm opacity-45 transition-transform group-open:rotate-180">▾</span>
      </summary>
      <div className="px-4 pb-4">{children}</div>
    </details>);
}
export const inputClass = "w-full border border-ink/30 bg-surface px-2.5 py-1.5 text-sm focus:border-accent focus:outline-none";
export const labelClass = "mb-0.5 block text-[10px] font-bold uppercase tracking-wide opacity-60";
export const buttonClass = "bg-ink px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-paper hover:opacity-80";
export const buttonSecondaryClass = "border border-ink px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-ink hover:bg-ink/5";
export function Field({ label, children, }) {
    return (<label className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </label>);
}
