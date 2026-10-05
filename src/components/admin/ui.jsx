export function Panel({ title, children, }) {
    return (<div className="mb-5 border-2 border-ink bg-surface p-4">
      <h2 className="mb-3 font-display text-base">{title}</h2>
      {children}
    </div>);
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
