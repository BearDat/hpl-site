import { prisma } from "@/lib/prisma";
import { getCurrentSeason } from "@/lib/queries";
import { createGame, cancelBulkScheduleImport, commitBulkScheduleImport } from "@/lib/actions/schedule";
import { Panel, Field, inputClass, buttonClass, buttonSecondaryClass } from "@/components/admin/ui";
import { BulkImportForm } from "@/components/admin/BulkImportForm";
import { GameRow } from "@/components/admin/GameRow";
export const dynamic = "force-dynamic";
function guessTeamId(name, teams) {
    const norm = (s) => s.trim().toLowerCase();
    const exact = teams.find((t) => norm(t.name) === norm(name));
    if (exact) return exact.id;
    const partial = teams.find((t) => norm(name).includes(norm(t.name)) || norm(t.name).includes(norm(name)));
    return partial?.id ?? "";
}
export default async function SchedulePage(props) {
    const searchParams = await props.searchParams;
    const importId = String(searchParams?.importId ?? "");
    const season = await getCurrentSeason();
    if (!season) {
        return (<Panel title="Schedule & Scores">
        <p className="text-sm">
          No current season is set. Create one in League Management first.
        </p>
      </Panel>);
    }
    const [teams, games, pendingImport] = await Promise.all([
        prisma.team.findMany({ orderBy: { name: "asc" } }),
        prisma.game.findMany({
            where: { seasonId: season.id },
            include: { homeTeam: true, awayTeam: true },
            orderBy: [{ round: "asc" }, { createdAt: "asc" }],
        }),
        importId
            ? prisma.pendingScheduleImport.findUnique({ where: { id: importId } })
            : Promise.resolve(null),
    ]);
    const rounds = new Map();
    for (const game of games) {
        if (!rounds.has(game.round))
            rounds.set(game.round, []);
        rounds.get(game.round).push(game);
    }
    const gameCountByName = new Map();
    if (pendingImport) {
        for (const round of pendingImport.data.rounds) {
            for (const game of round.games) {
                if (!game.homeTeamId)
                    gameCountByName.set(game.homeName, (gameCountByName.get(game.homeName) ?? 0) + 1);
                if (!game.awayTeamId)
                    gameCountByName.set(game.awayName, (gameCountByName.get(game.awayName) ?? 0) + 1);
            }
        }
    }
    return (<div>
      <h1 className="mb-6 font-display text-2xl">Schedule &amp; Scores</h1>
      <p className="mb-6 text-sm opacity-60">Managing games for {season.name}.</p>

      {pendingImport && (<Panel title="Confirm Schedule Import">
          <p className="mb-4 text-sm opacity-60">
            {pendingImport.data.unmatchedNames.length} team name(s) in that paste didn&apos;t
            match an existing team. Pick the correct team for each, or leave as &quot;Skip&quot;
            to drop every game that references it.
          </p>
          <form action={commitBulkScheduleImport} className="flex flex-col gap-4">
            <input type="hidden" name="importId" value={pendingImport.id}/>
            {pendingImport.data.unmatchedNames.map((name) => (<div key={name} className="flex flex-wrap items-center gap-3 border-b border-ink/10 pb-3 last:border-b-0">
                <span className="min-w-0 flex-1 font-bold">{name}</span>
                <span className="text-xs opacity-55">{gameCountByName.get(name) ?? 0} game(s)</span>
                <select name={`teamFor_${name}`} defaultValue={guessTeamId(name, teams)} className={`${inputClass} !w-56`}>
                  <option value="">Skip games with this name</option>
                  {teams.map((t) => (<option key={t.id} value={t.id}>
                      {t.name}
                    </option>))}
                </select>
              </div>))}
            <div className="flex gap-3">
              <button type="submit" className={buttonClass}>
                Import Games
              </button>
              <button type="submit" formAction={cancelBulkScheduleImport} className={buttonSecondaryClass}>
                Cancel
              </button>
            </div>
          </form>
        </Panel>)}

      <Panel title="Add a Game">
        <form action={createGame} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <input type="hidden" name="seasonId" value={season.id}/>
          <Field label="Round">
            <input name="round" required placeholder="R1" className={inputClass}/>
          </Field>
          <Field label="Time">
            <input name="scheduledTime" placeholder="7:05 PM EST" className={inputClass}/>
          </Field>
          <Field label="Location">
            <input name="locationCode" placeholder="LS1" className={inputClass}/>
          </Field>
          <div />
          <Field label="Away team">
            <select name="awayTeamId" required className={inputClass}>
              {teams.map((t) => (<option key={t.id} value={t.id}>
                  {t.name}
                </option>))}
            </select>
          </Field>
          <Field label="Home team">
            <select name="homeTeamId" required className={inputClass}>
              {teams.map((t) => (<option key={t.id} value={t.id}>
                  {t.name}
                </option>))}
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
        <BulkImportForm seasonId={season.id}/>
      </Panel>

      <Panel title="Games">
        {rounds.size === 0 ? (<p className="text-sm opacity-60">No games scheduled yet.</p>) : (Array.from(rounds.entries()).map(([round, roundGames]) => (<div key={round} className="mb-6 last:mb-0">
              <div className="mb-1 text-xs font-extrabold tracking-wide opacity-55">
                {round.toUpperCase()}
              </div>
              {roundGames.map((game) => (<GameRow key={game.id} game={game} teams={teams}/>))}
            </div>)))}
      </Panel>
    </div>);
}
