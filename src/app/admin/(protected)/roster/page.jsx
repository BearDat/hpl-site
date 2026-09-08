import { prisma } from "@/lib/prisma";
import { getCurrentSeason } from "@/lib/queries";
import { createPlayer, signPlayer, releasePlayer, tradePlayers, mergePlayers, previewRosterImport, cancelRosterImport, commitRosterImport, } from "@/lib/actions/roster";
import { Panel, Field, inputClass, buttonClass, buttonSecondaryClass } from "@/components/admin/ui";
import { PlayerRow } from "@/components/admin/PlayerRow";
import { SeasonStatsForm } from "@/components/admin/SeasonStatsForm";
export const dynamic = "force-dynamic";
function findMatchingTeamId(csvName, teams) {
    const norm = (s) => s.trim().toLowerCase();
    const exact = teams.find((t) => norm(t.name) === norm(csvName));
    if (exact) return exact.id;
    const partial = teams.find((t) => norm(csvName).includes(norm(t.name)) || norm(t.name).includes(norm(csvName)));
    return partial?.id ?? "";
}
export default async function RosterPage(props) {
    const searchParams = await props.searchParams;
    const importId = String(searchParams?.importId ?? "");
    const season = await getCurrentSeason();
    const [teams, players, transactions, seasonStats, pendingImport] = await Promise.all([
        prisma.team.findMany({ orderBy: { name: "asc" } }),
        prisma.player.findMany({
            include: { team: true },
            orderBy: [{ team: { name: "asc" } }, { name: "asc" }],
        }),
        prisma.transaction.findMany({
            orderBy: { date: "desc" },
            take: 15,
            include: {
                assets: {
                    include: { player: true, fromTeam: true, toTeam: true },
                },
            },
        }),
        season
            ? prisma.playerSeasonStat.findMany({ where: { seasonId: season.id } })
            : Promise.resolve([]),
        importId
            ? prisma.pendingRosterImport.findUnique({ where: { id: importId } })
            : Promise.resolve(null),
    ]);
    const freeAgents = players.filter((p) => !p.teamId);
    const activePlayers = players.filter((p) => p.teamId);
    const regularStatByPlayerId = new Map(seasonStats.filter((s) => !s.isPlayoffs).map((s) => [s.playerId, s]));
    const playoffStatByPlayerId = new Map(seasonStats.filter((s) => s.isPlayoffs).map((s) => [s.playerId, s]));
    return (<div>
      <h1 className="mb-6 font-display text-2xl">Roster Management</h1>

      <Panel title="Add Player">
        <form action={createPlayer} className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Field label="Name">
            <input name="name" required className={inputClass}/>
          </Field>
          <Field label="Team">
            <select name="teamId" className={inputClass} defaultValue="">
              <option value="">Free Agent</option>
              {teams.map((t) => (<option key={t.id} value={t.id}>
                  {t.name}
                </option>))}
            </select>
          </Field>
          <Field label="Roblox ID">
            <input name="robloxId" placeholder="Optional" className={inputClass}/>
          </Field>
          <div className="flex items-end">
            <button type="submit" className={buttonClass}>
              Add Player
            </button>
          </div>
        </form>
      </Panel>

      {pendingImport && (<Panel title="Confirm Roster Import">
          <p className="mb-4 text-sm opacity-60">
            Found {pendingImport.data.teams.length} team(s) in the CSV. Pick which of your
            teams each one should import into, or leave it as &quot;Skip&quot; to not
            import that group. Players already in the roster are matched by name and just
            get moved to the new team; everyone else is created fresh.
          </p>
          <form action={commitRosterImport} className="flex flex-col gap-4">
            <input type="hidden" name="importId" value={pendingImport.id}/>
            {pendingImport.data.teams.map((t, i) => (<div key={i} className="border-b border-ink/10 pb-4 last:border-b-0">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <span className="min-w-0 flex-1 font-bold">{t.csvName}</span>
                  <span className="text-xs opacity-55">{t.players.length} players</span>
                  <select name={`teamId_${i}`} defaultValue={findMatchingTeamId(t.csvName, teams)} className={`${inputClass} !w-56`}>
                    <option value="">Skip this team</option>
                    {teams.map((team) => (<option key={team.id} value={team.id}>
                        {team.name}
                      </option>))}
                  </select>
                </div>
                <div className="text-xs opacity-60">{t.players.join(", ")}</div>
              </div>))}
            <div className="flex gap-3">
              <button type="submit" className={buttonClass}>
                Import Rosters
              </button>
              <button type="submit" formAction={cancelRosterImport} className={buttonSecondaryClass}>
                Cancel
              </button>
            </div>
          </form>
        </Panel>)}

      <Panel title="Import Roster from CSV">
        <p className="mb-3 text-sm opacity-60">
          Upload a roster export (teams laid out side by side, one player per row).
          You&apos;ll get a chance to map each CSV team to one of your real teams before
          anything is imported.
        </p>
        <form action={previewRosterImport} encType="multipart/form-data" className="flex flex-col gap-3">
          <Field label="CSV file">
            <input type="file" name="file" accept=".csv,text/csv" className="text-xs"/>
          </Field>
          <div className="text-xs opacity-55">— or paste CSV text below —</div>
          <Field label="Paste CSV">
            <textarea name="csvText" rows={4} className={`${inputClass} font-mono text-xs`}/>
          </Field>
          <div>
            <button type="submit" className={buttonClass}>
              Preview Import
            </button>
          </div>
        </form>
      </Panel>

      <Panel title="Sign a Free Agent">
        <form action={signPlayer} className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Player">
            <select name="playerId" required className={inputClass}>
              {freeAgents.map((p) => (<option key={p.id} value={p.id}>
                  {p.name}
                </option>))}
            </select>
          </Field>
          <Field label="Team">
            <select name="teamId" required className={inputClass}>
              {teams.map((t) => (<option key={t.id} value={t.id}>
                  {t.name}
                </option>))}
            </select>
          </Field>
          <div className="flex items-end">
            <button type="submit" className={buttonClass}>
              Sign
            </button>
          </div>
        </form>
      </Panel>

      <Panel title="Release a Player">
        <form action={releasePlayer} className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Player">
            <select name="playerId" required className={inputClass}>
              {activePlayers.map((p) => (<option key={p.id} value={p.id}>
                  {p.name} ({p.team?.name})
                </option>))}
            </select>
          </Field>
          <div className="flex items-end">
            <button type="submit" className={buttonClass}>
              Release
            </button>
          </div>
        </form>
      </Panel>

      <Panel title="Trade">
        <form action={tradePlayers} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Field label="Team A">
              <select name="teamAId" required className={inputClass}>
                {teams.map((t) => (<option key={t.id} value={t.id}>
                    {t.name}
                  </option>))}
              </select>
            </Field>
            <div className="mt-3">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide opacity-60">
                Players leaving Team A
              </span>
              <div className="flex max-h-40 flex-col gap-1 overflow-y-auto border border-ink/30 bg-surface p-2">
                {activePlayers.map((p) => (<label key={p.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="teamAPlayers" value={p.id}/>
                    {p.name} <span className="opacity-55">— {p.team?.name}</span>
                  </label>))}
              </div>
            </div>
          </div>
          <div>
            <Field label="Team B">
              <select name="teamBId" required className={inputClass}>
                {teams.map((t) => (<option key={t.id} value={t.id}>
                    {t.name}
                  </option>))}
              </select>
            </Field>
            <div className="mt-3">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide opacity-60">
                Players leaving Team B
              </span>
              <div className="flex max-h-40 flex-col gap-1 overflow-y-auto border border-ink/30 bg-surface p-2">
                {activePlayers.map((p) => (<label key={p.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="teamBPlayers" value={p.id}/>
                    {p.name} <span className="opacity-55">— {p.team?.name}</span>
                  </label>))}
              </div>
            </div>
          </div>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <input name="notes" className={inputClass}/>
            </Field>
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className={buttonClass}>
              Execute Trade
            </button>
          </div>
        </form>
      </Panel>

      <Panel title="Players">
        <div className="mb-2 hidden text-[10px] font-bold uppercase tracking-wide opacity-50 sm:grid sm:grid-cols-12 sm:gap-2">
          <div className="col-span-3">Link</div>
          <div className="col-span-3">Name</div>
          <div className="col-span-2">Team</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Roblox ID</div>
        </div>
        {players.map((p) => (<PlayerRow key={p.id} player={p} teams={teams}/>))}
      </Panel>

      <Panel title="Merge Players">
        <p className="mb-3 text-sm opacity-60">
          If the same Roblox user got two Player rows (e.g. a username change wasn&apos;t
          caught in time), merge the duplicate into the one to keep. Transactions,
          prospect rank history, and season stats move over; the duplicate is deleted.
        </p>
        <form action={mergePlayers} className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Keep this player">
            <select name="keepId" required className={inputClass}>
              {players.map((p) => (<option key={p.id} value={p.id}>
                  {p.name} {p.robloxId ? `(Roblox ${p.robloxId})` : ""}
                </option>))}
            </select>
          </Field>
          <Field label="Delete this duplicate">
            <select name="duplicateId" required className={inputClass}>
              {players.map((p) => (<option key={p.id} value={p.id}>
                  {p.name} {p.robloxId ? `(Roblox ${p.robloxId})` : ""}
                </option>))}
            </select>
          </Field>
          <div className="flex items-end">
            <button type="submit" className={buttonClass}>
              Merge
            </button>
          </div>
        </form>
      </Panel>

      {season && (<Panel title={`Season Stats — ${season.name}`}>
          <p className="mb-3 text-xs opacity-55">Click a player to enter or edit their stats.</p>
          <div className="flex flex-col gap-1">
            {players.map((p) => {
                const reg = regularStatByPlayerId.get(p.id);
                const po = playoffStatByPlayerId.get(p.id);
                const hasAny = reg || po;
                return (<details key={p.id} className="group border-b border-ink/10 py-2 last:border-b-0">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm">
                    <span className="font-bold">
                      {p.name} <span className="font-normal opacity-55">— {p.team?.name ?? "Free Agent"}</span>
                    </span>
                    <span className="text-xs opacity-45">
                      {hasAny ? "Stats entered" : "No stats yet"}{" "}
                      <span className="inline-block transition-transform group-open:rotate-180">▾</span>
                    </span>
                  </summary>
                  <div className="mt-3 pl-1">
                    <SeasonStatsForm player={p} seasonId={season.id} stat={reg} isPlayoffs={false}/>
                    <SeasonStatsForm player={p} seasonId={season.id} stat={po} isPlayoffs={true}/>
                  </div>
                </details>);
            })}
          </div>
        </Panel>)}

      <Panel title="Recent Transactions">
        {transactions.length === 0 ? (<p className="text-sm opacity-60">No transactions yet.</p>) : (<div className="flex flex-col gap-3">
            {transactions.map((t) => (<div key={t.id} className="border-b border-ink/10 pb-3 text-sm last:border-b-0">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-extrabold tracking-wide text-accent">
                    {t.type}
                  </span>
                  <span className="text-xs opacity-50">
                    {t.date.toLocaleDateString()}
                  </span>
                </div>
                {t.assets.map((a) => (<div key={a.id} className="opacity-80">
                    {a.player.name}: {a.fromTeam?.shortCode ?? "FA"} &rarr;{" "}
                    {a.toTeam?.shortCode ?? "FA"}
                  </div>))}
                {t.notes && <div className="mt-1 text-xs opacity-55">{t.notes}</div>}
              </div>))}
          </div>)}
      </Panel>
    </div>);
}
