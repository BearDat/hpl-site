import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TeamCrest } from "@/components/TeamCrest";
import { getCurrentSeason, getTeamsWithRecords } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const season = await getCurrentSeason();
  const teams = season ? await getTeamsWithRecords(season.id) : [];

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1 px-14 py-10">
        <h1 className="mb-1 font-display text-2xl">TEAMS</h1>
        <p className="mb-8 text-sm opacity-60">{season ? season.name : "No current season set."}</p>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/teams/${team.shortCode}`}
              className="flex flex-col items-center gap-3 border-[3px] border-ink bg-surface p-6 text-center hover:bg-ink/5"
            >
              <TeamCrest color={team.primaryColor} logoUrl={team.logoUrl} className="h-14 w-12" />
              <div className="font-display text-base leading-tight">{team.name}</div>
              <div className="text-xs font-bold opacity-55">
                {team.wins}-{team.losses} &middot; {team.division}
              </div>
            </Link>
          ))}
          {teams.length === 0 && <p className="text-sm opacity-60">No teams yet.</p>}
        </div>
      </main>
      <Footer />
    </div>
  );
}
