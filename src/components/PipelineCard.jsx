import Link from "next/link";
function Movement({ movement }) {
    if (movement.direction === "flat") {
        return (<div className="w-7 flex-shrink-0 text-right text-xs font-extrabold opacity-40">
        —
      </div>);
    }
    if (movement.direction === "up" && movement.isNew) {
        return (<div className="w-7 flex-shrink-0 text-right text-[9px] font-extrabold tracking-wide text-[#5fbf8a]">
        NEW
      </div>);
    }
    const isUp = movement.direction === "up";
    return (<div className="w-7 flex-shrink-0 text-right text-xs font-extrabold" style={{ color: isUp ? "#5fbf8a" : "#c1391f" }}>
      {isUp ? "▲" : "▼"}
      {movement.value}
    </div>);
}
export function PipelineCard({ entries }) {
    return (<div className="flex flex-col bg-ink py-5 px-[22px] text-paper">
      <div className="mb-3.5 text-xs font-extrabold tracking-wider text-accent">
        PROSPECTS PIPELINE &middot; TOP {entries.length}
      </div>
      {entries.map((entry, i) => (<div key={entry.rank} className={`flex items-center gap-3.5 py-2.5 ${i < entries.length - 1 ? "border-b border-paper/15" : ""}`}>
          <div className="w-[18px] font-display text-base opacity-55">
            {entry.rank}
          </div>
          <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center text-[11px] font-extrabold" style={{ background: entry.color }}>
            {entry.initials}
          </div>
          <div className="min-w-0 flex-1">
            <Link href={`/players/${entry.slug}`} className="truncate block text-sm font-bold hover:text-accent">
              {entry.name}
            </Link>
            <div className="truncate text-xs opacity-60">{entry.team}</div>
          </div>
          <Movement movement={entry.movement}/>
        </div>))}
    </div>);
}
