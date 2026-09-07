import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createPlayer, signPlayer, releasePlayer, tradePlayers } from "@/lib/actions/roster";
import { Panel, Field, inputClass, buttonClass } from "@/components/admin/ui";
<<<<<<< HEAD:src/app/admin/roster/page.jsx
import { PlayerRow } from "@/components/admin/PlayerRow";
import { SeasonStatsForm } from "@/components/admin/SeasonStatsForm";
=======

>>>>>>> parent of 8691e5f (Expand stats, standings, and prospect history; link players to Roblox IDs):src/app/admin/roster/page.tsx
export const dynamic = "force-dynamic";
export default async function RosterPage() {
<<<<<<< HEAD:src/app/admin/roster/page.jsx
    const season = await getCurrentSeason();
    const [teams, players, transactions, seasonStats] = await Promise.all([
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
    ]);
    const freeAgents = players.filter((p) => !p.teamId);
    const activePlayers = players.filter((p) => p.teamId);
    const statByPlayerId = new Map(seasonStats.map((s) => [s.playerId, s]));
    return (<div>
=======
  const [teams, players, transactions] = await Promise.all([
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
  ]);

  const freeAgents = players.filter((p) => !p.teamId);
  const activePlayers = players.filter((p) => p.teamId);

  return (
    <div>
>>>>>>> parent of 8691e5f (Expand stats, standings, and prospect history; link players to Roblox IDs):src/app/admin/roster/page.tsx
      <h1 className="mb-6 font-display text-2xl">Roster Management</h1>

      <Panel title="Add Player">
        <form action={createPlayer} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Name">
            <input name="name" required className={inputClass}/>
          </Field>
          <Field label="Position">
            <input name="position" required placeholder="OF" className={inputClass}/>
          </Field>
          <Field label="Team">
            <select name="teamId" className={inputClass} defaultValue="">
              <option value="">Free Agent</option>
              {teams.map((t) => (<option key={t.id} value={t.id}>
                  {t.name}
                </option>))}
            </select>
          </Field>
<<<<<<< HEAD:src/app/admin/roster/page.jsx
          <Field label="Roblox ID">
            <input name="robloxId" placeholder="Optional" className={inputClass}/>
          </Field>
=======
>>>>>>> parent of 8691e5f (Expand stats, standings, and prospect history; link players to Roblox IDs):src/app/admin/roster/page.tsx
          <div className="flex items-end">
            <button type="submit" className={buttonClass}>
              Add Player
            </button>
          </div>
        </form>
      </Panel>

      <Panel title="Sign a Free Agent">
        <form action={signPlayer} className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Player">
            <select name="playerId" required className={inputClass}>
              {freeAgents.map((p) => (<option key={p.id} value={p.id}>
                  {p.name} ({p.position})
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
              <select name="teamAPlayers" multiple size={6} className={inputClass}>
                {activePlayers.map((p) => (<option key={p.id} value={p.id}>
                    {p.name} — {p.team?.name}
                  </option>))}
              </select>
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
              <select name="teamBPlayers" multiple size={6} className={inputClass}>
                {activePlayers.map((p) => (<option key={p.id} value={p.id}>
                    {p.name} — {p.team?.name}
                  </option>))}
              </select>
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
<<<<<<< HEAD:src/app/admin/roster/page.jsx
        <div className="mb-2 hidden text-[10px] font-bold uppercase tracking-wide opacity-50 sm:grid sm:grid-cols-12 sm:gap-2">
          <div className="col-span-2">Link</div>
          <div className="col-span-2">Name</div>
          <div className="col-span-1">Pos</div>
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
          {players.map((p) => (<SeasonStatsForm key={p.id} player={p} seasonId={season.id} stat={statByPlayerId.get(p.id)}/>))}
        </Panel>)}
=======
        <div className="grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2">
          {players.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between border-b border-ink/10 py-1.5 text-sm"
            >
              <span>
                <Link href={`/players/${p.slug}`} className="hover:text-accent" target="_blank">
                  {p.name}
                </Link>{" "}
                <span className="opacity-55">· {p.position}</span>
              </span>
              <span className="text-xs font-bold opacity-60">
                {p.team?.name ?? "Free Agent"}
              </span>
            </div>
          ))}
        </div>
      </Panel>
>>>>>>> parent of 8691e5f (Expand stats, standings, and prospect history; link players to Roblox IDs):src/app/admin/roster/page.tsx

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
