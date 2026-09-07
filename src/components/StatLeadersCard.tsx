import Link from "next/link";

type StatLeader = {
  value: string;
  label: string;
  player: string;
  playerSlug: string;
  team: string;
};

export function StatLeadersCard({ leaders }: { leaders: StatLeader[] }) {
  return (
    <div className="flex flex-col border-[3px] border-ink p-[18px]">
      <div className="mb-2.5 text-[11px] font-extrabold tracking-wider opacity-55">
        STAT LEADERS
      </div>
      {leaders.map((stat, i) => (
        <div
          key={stat.label}
          className={`flex items-center gap-2.5 py-1.5 ${
            i < leaders.length - 1 ? "border-b border-ink/10" : ""
          }`}
        >
          <div className="w-[50px] flex-shrink-0 font-display text-[19px] text-accent">
            {stat.value}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11.5px] font-bold">{stat.label}</div>
            <div className="truncate text-[9.5px] opacity-55">
              <Link href={`/players/${stat.playerSlug}`} className="hover:text-accent">
                {stat.player}
              </Link>{" "}
              &middot; {stat.team}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
