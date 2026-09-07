import { prisma } from "@/lib/prisma";
import { getCurrentSeason } from "@/lib/queries";
import {
  generateFirstRound,
  generateNextRound,
  createSeriesManually,
} from "@/lib/actions/playoffs";
import { Panel, Field, inputClass, buttonClass } from "@/components/admin/ui";
import { PlayoffSeriesCard } from "@/components/admin/PlayoffSeriesCard";

export const dynamic = "force-dynamic";

export default async function PlayoffsPage() {
  const season = await getCurrentSeason();

  if (!season) {
    return (
      <Panel title="Playoffs">
        <p className="text-sm">No current season is set. Create one in League Management first.</p>
      </Panel>
    );
  }

  const [teams, series] = await Promise.all([
    prisma.team.findMany({ orderBy: { name: "asc" } }),
    prisma.playoffSeries.findMany({
      where: { seasonId: season.id },
      orderBy: [{ round: "asc" }, { order: "asc" }],
      include: {
        teamA: true,
        teamB: true,
        winner: true,
        games: {
          include: { homeTeam: true, awayTeam: true },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
  ]);

  const rounds = new Map<number, typeof series>();
  for (const s of series) {
    if (!rounds.has(s.round)) rounds.set(s.round, []);
    rounds.get(s.round)!.push(s);
  }
  const roundNumbers = Array.from(rounds.keys()).sort((a, b) => a - b);
  const latestRound = roundNumbers.at(-1);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">Playoffs</h1>
      <p className="mb-6 text-sm opacity-60">
        Managing the bracket for {season.name} — top {season.playoffTeamCount} teams,
        series lengths {season.playoffSeriesLengths.join(", ")}, reseeding{" "}
        {season.playoffReseed ? "on" : "off"} (set in League Management).
      </p>

      <Panel title="Generate Bracket">
        <div className="flex flex-wrap items-center gap-3">
          <form action={generateFirstRound}>
            <input type="hidden" name="seasonId" value={season.id} />
            <button type="submit" className={buttonClass}>
              Generate Round 1 from Standings
            </button>
          </form>
          {latestRound !== undefined && (
            <form action={generateNextRound} className="flex items-center gap-2">
              <input type="hidden" name="seasonId" value={season.id} />
              <input type="hidden" name="fromRound" value={latestRound} />
              <button type="submit" className={buttonClass}>
                Generate Round {latestRound + 1} from Round {latestRound} Winners
              </button>
            </form>
          )}
        </div>
      </Panel>

      {roundNumbers.map((round) => (
        <Panel key={round} title={rounds.get(round)![0]?.roundName ?? `Round ${round}`}>
          {rounds.get(round)!.map((s) => (
            <PlayoffSeriesCard key={s.id} series={s} />
          ))}
        </Panel>
      ))}

      <Panel title="Create Series Manually">
        <form action={createSeriesManually} className="grid grid-cols-2 gap-4 sm:grid-cols-6">
          <input type="hidden" name="seasonId" value={season.id} />
          <Field label="Round #">
            <input type="number" name="round" required min={1} className={inputClass} />
          </Field>
          <Field label="Round name">
            <input name="roundName" placeholder="Semifinals" className={inputClass} />
          </Field>
          <Field label="Order">
            <input type="number" name="order" required defaultValue={0} className={inputClass} />
          </Field>
          <Field label="Best of">
            <input type="number" name="bestOf" required defaultValue={5} className={inputClass} />
          </Field>
          <Field label="Team A">
            <select name="teamAId" className={inputClass}>
              <option value="">TBD</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Team B">
            <select name="teamBId" className={inputClass}>
              <option value="">TBD</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="col-span-2 sm:col-span-6">
            <button type="submit" className={buttonClass}>
              Create Series
            </button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
