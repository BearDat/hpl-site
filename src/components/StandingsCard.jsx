import Link from "next/link";
import { TeamCrest } from "./TeamCrest";
export function StandingsCard({ divisions }) {
    return (<div className="flex flex-col border-[3px] border-ink p-4">
      <div className="mb-0.5 flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-wider opacity-55">STANDINGS</span>
        <Link href="/standings" className="text-[10px] font-bold text-accent hover:underline">
          FULL &rarr;
        </Link>
      </div>
      {divisions.map((division) => (<div key={division.name}>
          <div className="mt-[7px] mb-[3px] text-[9.5px] font-extrabold tracking-wider opacity-45">
            {division.name.toUpperCase()}
          </div>
          {division.teams.map((team, i) => (<div key={team.id} className={`flex items-center gap-1.5 py-1 text-[11px] ${i === 0 ? "font-bold" : ""} ${i < division.teams.length - 1 ? "border-b border-ink/10" : ""}`}>
              <TeamCrest color={team.primaryColor} logoUrl={team.logoUrl} className="h-[13px] w-[11px]"/>
              <span className="min-w-0 flex-1 truncate">{team.name}</span>
              <span className="flex-shrink-0">
                {team.wins}&ndash;{team.losses}
              </span>
            </div>))}
        </div>))}
    </div>);
}
