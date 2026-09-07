import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TeamCrest } from "@/components/TeamCrest";
import { getCurrentSeason, getAllScores } from "@/lib/queries";

export const dynamic = "force-dynamic";

function GameLine({ game }) {
  const awayWins = game.away.runs !== null && game.home.runs !== null && game.away.runs > game.home.runs;
  const homeWins = game.away.runs !== null && game.home.runs !== null && game.home.runs > game.away.runs;
  return (
    <div className="flex items-center justify-between gap-4 border-b border-ink/10 py-3 text-sm last:border-b-0">
      <div className="flex flex-1 flex-col gap-1.5">
        <div className={`flex items-center gap-2 ${awayWins ? "font-bold" : "opacity-70"}`}>
          <TeamCrest color={game.away.color} logoUrl={game.away.logoUrl} className="h-4 w-3.5 flex-shrink-0" />
          {game.away.name}
          {game.away.runs !== null && <span className="ml-auto">{game.away.runs}</span>}
        </div>
        <div className={`flex items-center gap-2 ${homeWins ? "font-bold" : "opacity-70"}`}>
          <TeamCrest color={game.home.color} logoUrl={game.home.logoUrl} className="h-4 w-3.5 flex-shrink-0" />
          {game.home.name}
          {game.home.runs !== null && <span className="ml-auto">{game.home.runs}</span>}
        </div>
      </div>
      <div className="w-24 flex-shrink-0 text-right text-xs font-extrabold tracking-wide opacity-55">
        {game.statusLabel}
      </div>
    </div>
  );
}

export default async function ScoresPage() {
  const season = await getCurrentSeason();
  const rounds = season ? await getAllScores(season.id) : [];

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1 px-14 py-10">
        <h1 className="mb-1 font-display text-2xl">SCORES</h1>
        <p className="mb-8 text-sm opacity-60">{season ? season.name : "No current season set."}</p>

        {rounds.length === 0 ? (
          <p className="text-sm opacity-60">No games scheduled yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {rounds.map((r) => (
              <div key={r.round} className="border-[3px] border-ink bg-surface p-5">
                <div className="mb-2 text-xs font-extrabold tracking-wide opacity-55">{r.round.toUpperCase()}</div>
                {r.games.map((g) => (
                  <GameLine key={g.id} game={g} />
                ))}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
