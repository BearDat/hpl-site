import Link from "next/link";

export function StatLeadersCard({ leaders }) {
  return (
    <div className="flex flex-col border-[3px] border-ink bg-surface p-[18px]">
      <div className="mb-2.5 text-[11px] font-extrabold tracking-wider opacity-55">STAT LEADERS</div>
      {leaders.map((cat, i) => (
        <div key={cat.key} className={`py-2 ${i < leaders.length - 1 ? "border-b border-ink/10" : ""}`}>
          <div className="mb-1.5 text-[10px] font-extrabold tracking-wider text-accent">{cat.label}</div>
          {cat.entries.map((stat, j) => (
            <div key={stat.playerSlug} className="flex items-center gap-2.5 py-0.5">
              <div className="w-[42px] flex-shrink-0 font-display text-[15px]" style={{ opacity: j === 0 ? 1 : 0.55 }}>
                {stat.value}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/players/${stat.playerSlug}`} className="block truncate text-[11.5px] font-bold hover:text-accent">
                  {stat.player}
                </Link>
              </div>
              <div className="flex-shrink-0 text-[9.5px] opacity-55">{stat.team}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
