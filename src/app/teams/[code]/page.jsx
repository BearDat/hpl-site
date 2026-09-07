import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TeamCrest } from "@/components/TeamCrest";
import { getCurrentSeason, getTeamDetail } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function TeamDetailPage(props) {
  const { code } = await props.params;
  const season = await getCurrentSeason();
  const detail = await getTeamDetail(code, season?.id);
  if (!detail) notFound();

  const { team, players, games, record } = detail;

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1 px-14 py-10">
        <div className="mb-8 flex flex-wrap items-center gap-6 border-[3px] border-ink p-6" style={{ borderColor: team.primaryColor }}>
          <TeamCrest color={team.primaryColor} logoUrl={team.logoUrl} className="h-16 w-14 flex-shrink-0" />
          <div>
            <div className="font-display text-3xl">{team.name}</div>
            {record && (
              <div className="mt-1 text-sm font-bold uppercase tracking-wide opacity-60">
                {record.wins}-{record.losses} &middot; {record.division}
                {record.clinched && <span className="ml-2 text-accent">CLINCHED</span>}
                {record.eliminated && <span className="ml-2 opacity-60">ELIMINATED</span>}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div className="border-[3px] border-ink p-6">
            <div className="mb-4 text-xs font-extrabold tracking-wide opacity-55">ROSTER</div>
            {players.length === 0 ? (
              <p className="text-sm opacity-60">No players on this team yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2">
                {players.map((p) => (
                  <Link key={p.id} href={`/players/${p.slug}`} className="border-b border-ink/10 py-1.5 text-sm hover:text-accent">
                    {p.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="border-[3px] border-ink p-6">
            <div className="mb-4 text-xs font-extrabold tracking-wide opacity-55">RECENT &amp; UPCOMING GAMES</div>
            {games.length === 0 ? (
              <p className="text-sm opacity-60">No games scheduled yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {games.map((g) => {
                  const isHome = g.home.code === team.shortCode;
                  const opponent = isHome ? g.away : g.home;
                  return (
                    <div key={g.id} className="flex items-center justify-between border-b border-ink/10 pb-2 text-sm last:border-b-0">
                      <span>
                        {isHome ? "vs" : "@"} {opponent.name}
                      </span>
                      <span className="opacity-60">
                        {g.home.runs !== null && g.away.runs !== null
                          ? `${g.away.runs}-${g.home.runs}`
                          : g.statusLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
