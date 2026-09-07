import type { BracketSeries, BracketTeam } from "@/lib/queries";
import { TeamCrest } from "./TeamCrest";

function TeamLine({
  team,
  wins,
  isWinner,
}: {
  team: BracketTeam;
  wins: number;
  isWinner: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-2 px-3 py-2 ${
        isWinner ? "bg-ink text-paper" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-2">
        {team ? (
          <>
            <TeamCrest color={team.primaryColor} logoUrl={team.logoUrl} className="h-4 w-3.5 flex-shrink-0" />
            <span className="truncate text-sm font-bold">
              {team.seed ? `(${team.seed}) ` : ""}
              {team.name}
            </span>
          </>
        ) : (
          <span className="text-sm font-bold opacity-40">TBD</span>
        )}
      </div>
      <span className="flex-shrink-0 text-sm font-extrabold">{team ? wins : ""}</span>
    </div>
  );
}

export function BracketSeriesCard({ series }: { series: BracketSeries }) {
  return (
    <div className="border-[3px] border-ink bg-white">
      <TeamLine team={series.teamA} wins={series.teamAWins} isWinner={series.winnerId === series.teamA?.id} />
      <div className="border-t border-ink/15" />
      <TeamLine team={series.teamB} wins={series.teamBWins} isWinner={series.winnerId === series.teamB?.id} />
      <div className="border-t border-ink/15 px-3 py-1 text-[10px] font-bold tracking-wide opacity-50">
        BEST OF {series.bestOf}
      </div>
    </div>
  );
}
