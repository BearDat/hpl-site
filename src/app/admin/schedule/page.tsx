import { prisma } from "@/lib/prisma";
import { getCurrentSeason } from "@/lib/queries";
import { createGame } from "@/lib/actions/schedule";
import { Panel, Field, inputClass, buttonClass } from "@/components/admin/ui";
import { BulkImportForm } from "@/components/admin/BulkImportForm";
import { GameRow } from "@/components/admin/GameRow";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const season = await getCurrentSeason();

  if (!season) {
    return (
      <Panel title="Schedule & Scores">
        <p className="text-sm">
          No current season is set. Create one in League Management first.
        </p>
      </Panel>
    );
  }

  const [teams, games] = await Promise.all([
    prisma.team.findMany({ orderBy: { name: "asc" } }),
    prisma.game.findMany({
      where: { seasonId: season.id },
      include: { homeTeam: true, awayTeam: true },
      orderBy: [{ round: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  const rounds = new Map<string, typeof games>();
  for (const game of games) {
    if (!rounds.has(game.round)) rounds.set(game.round, []);
    rounds.get(game.round)!.push(game);
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">Schedule &amp; Scores</h1>
      <p className="mb-6 text-sm opacity-60">Managing games for {season.name}.</p>

      <Panel title="Add a Game">
        <form action={createGame} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <input type="hidden" name="seasonId" value={season.id} />
          <Field label="Round">
            <input name="round" required placeholder="R1" className={inputClass} />
          </Field>
          <Field label="Time">
            <input name="scheduledTime" placeholder="7:05 PM EST" className={inputClass} />
          </Field>
          <Field label="Location">
            <input name="locationCode" placeholder="LS1" className={inputClass} />
          </Field>
          <div />
          <Field label="Away team">
            <select name="awayTeamId" required className={inputClass}>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Home team">
            <select name="homeTeamId" required className={inputClass}>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="col-span-2 flex items-end sm:col-span-2">
            <button type="submit" className={buttonClass}>
              Add Game
            </button>
          </div>
        </form>
      </Panel>

      <Panel title="Bulk Import from Text">
        <BulkImportForm seasonId={season.id} />
      </Panel>

      <Panel title="Games">
        {rounds.size === 0 ? (
          <p className="text-sm opacity-60">No games scheduled yet.</p>
        ) : (
          Array.from(rounds.entries()).map(([round, roundGames]) => (
            <div key={round} className="mb-6 last:mb-0">
              <div className="mb-1 text-xs font-extrabold tracking-wide opacity-55">
                {round.toUpperCase()}
              </div>
              {roundGames.map((game) => (
                <GameRow key={game.id} game={game} />
              ))}
            </div>
          ))
        )}
      </Panel>
    </div>
  );
}
