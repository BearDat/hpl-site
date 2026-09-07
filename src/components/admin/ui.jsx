export function Panel({ title, children, }) {
    return (<div className="mb-8 border-[3px] border-ink bg-white p-6">
      <h2 className="mb-4 font-display text-lg">{title}</h2>
      {children}
    </div>);
}
export const inputClass = "w-full border border-ink/30 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none";
export const labelClass = "mb-1 block text-[11px] font-bold uppercase tracking-wide opacity-60";
export const buttonClass = "bg-ink px-4 py-2 text-xs font-bold uppercase tracking-wide text-paper hover:opacity-80";
export const buttonSecondaryClass = "border border-ink px-4 py-2 text-xs font-bold uppercase tracking-wide text-ink hover:bg-ink/5";
export function Field({ label, children, }) {
    return (<label className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </label>);
}
