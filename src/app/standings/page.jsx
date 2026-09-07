import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TeamCrest } from "@/components/TeamCrest";
import { PlayoffBracket } from "@/components/PlayoffBracket";
import { getCurrentSeason, getStandings, getPlayoffBracket, hasPlayoffsStarted, } from "@/lib/queries";
export const dynamic = "force-dynamic";
const COLUMNS = ["W", "L", "PCT", "GB", "RF", "RA", "STRK", "L10", "HOME", "AWAY"];
function pct(wins, losses) {
    const total = wins + losses;
    if (total === 0)
        return ".000";
    return (wins / total).toFixed(3).replace(/^0/, "");
}
export default async function StandingsPage() {
    const season = await getCurrentSeason();
    if (!season) {
        return (<div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 px-14 py-10">
          <p className="text-sm opacity-60">No current season is set.</p>
        </main>
        <Footer />
      </div>);
    }
    const [divisions, playoffsStarted] = await Promise.all([
        getStandings(season.id),
        hasPlayoffsStarted(season.id),
    ]);
    const rounds = playoffsStarted ? await getPlayoffBracket(season.id) : [];
    return (<div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1 px-14 py-10">
        <h1 className="mb-1 font-display text-2xl">STANDINGS</h1>
        <p className="mb-8 text-sm opacity-60">{season.name}</p>

        {divisions.map((division) => (<div key={division.name} className="mb-10">
            <div className="mb-3 text-xs font-extrabold tracking-wide opacity-55">
              {division.name.toUpperCase()}
            </div>
            <div className="overflow-x-auto border-[3px] border-ink">
              <table className="w-full min-w-[820px] border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-ink bg-ink text-paper">
                    <th className="px-3 py-2 text-left text-[10px] font-extrabold tracking-wide">
                      TEAM
                    </th>
                    {COLUMNS.map((c) => (<th key={c} className="px-3 py-2 text-right text-[10px] font-extrabold tracking-wide">
                        {c}
                      </th>))}
                  </tr>
                </thead>
                <tbody>
                  {division.teams.map((team, i) => (<tr key={team.id} className={`${i === 0 ? "font-bold" : ""} ${i < division.teams.length - 1 ? "border-b border-ink/10" : ""}`}>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <TeamCrest color={team.primaryColor} logoUrl={team.logoUrl} className="h-4 w-3.5 flex-shrink-0"/>
                          <span className="truncate">{team.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">{team.wins}</td>
                      <td className="px-3 py-2 text-right">{team.losses}</td>
                      <td className="px-3 py-2 text-right">{pct(team.wins, team.losses)}</td>
                      <td className="px-3 py-2 text-right opacity-70">{team.gamesBack}</td>
                      <td className="px-3 py-2 text-right">{team.runsFor}</td>
                      <td className="px-3 py-2 text-right">{team.runsAgainst}</td>
                      <td className="px-3 py-2 text-right">{team.streak}</td>
                      <td className="px-3 py-2 text-right">{team.last10}</td>
                      <td className="px-3 py-2 text-right opacity-70">{team.homeRecord}</td>
                      <td className="px-3 py-2 text-right opacity-70">{team.awayRecord}</td>
                    </tr>))}
                </tbody>
              </table>
            </div>
          </div>))}

        {playoffsStarted && (<div className="mt-4">
            <h2 className="mb-6 font-display text-xl">PLAYOFF BRACKET</h2>
            <PlayoffBracket rounds={rounds}/>
          </div>)}
      </main>
      <Footer />
    </div>);
}
