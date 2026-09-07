import { prisma } from "@/lib/prisma";
import { createSeason, setCurrentSeason, updatePlayoffFormat, createDivision, deleteDivision, addTeamToSeason, removeTeamFromSeason, } from "@/lib/actions/league";
import { Panel, Field, inputClass, buttonClass, buttonSecondaryClass } from "@/components/admin/ui";
export const dynamic = "force-dynamic";
export default async function LeaguePage() {
    const [seasons, teams] = await Promise.all([
        prisma.season.findMany({ orderBy: { createdAt: "desc" } }),
        prisma.team.findMany({ orderBy: { name: "asc" } }),
    ]);
    const current = seasons.find((s) => s.isCurrent) ?? null;
    const [divisions, seasonTeams] = current
        ? await Promise.all([
            prisma.division.findMany({ where: { seasonId: current.id }, orderBy: { order: "asc" } }),
            prisma.seasonTeam.findMany({
                where: { seasonId: current.id },
                include: { team: true, division: true },
                orderBy: { team: { name: "asc" } },
            }),
        ])
        : [[], []];
    const updatePlayoffFormatForSeason = current
        ? updatePlayoffFormat.bind(null, current.id)
        : null;
    return (<div>
      <h1 className="mb-6 font-display text-2xl">League Management</h1>

      <Panel title="Seasons">
        <div className="mb-4 flex flex-col gap-2">
          {seasons.map((s) => (<div key={s.id} className="flex items-center justify-between border-b border-ink/10 py-2 text-sm">
              <span className={s.isCurrent ? "font-bold" : ""}>
                {s.name} {s.isCurrent && <span className="text-accent">(current)</span>}
              </span>
              {!s.isCurrent && (<form action={setCurrentSeason}>
                  <input type="hidden" name="seasonId" value={s.id}/>
                  <button type="submit" className={`${buttonSecondaryClass} !text-[10px]`}>
                    Set Current
                  </button>
                </form>)}
            </div>))}
        </div>
        <form action={createSeason} className="flex items-end gap-3">
          <Field label="New season name">
            <input name="name" required placeholder="2027 Season" className={inputClass}/>
          </Field>
          <button type="submit" className={buttonClass}>
            Create Season
          </button>
        </form>
      </Panel>

      {!current ? (<Panel title="Divisions, Teams, Playoffs">
          <p className="text-sm opacity-60">Create and set a current season first.</p>
        </Panel>) : (<>
          <Panel title={`Divisions — ${current.name}`}>
            <div className="mb-4 flex flex-col gap-2">
              {divisions.map((d) => (<div key={d.id} className="flex items-center justify-between border-b border-ink/10 py-2 text-sm">
                  <span>{d.name}</span>
                  <form action={deleteDivision}>
                    <input type="hidden" name="divisionId" value={d.id}/>
                    <button type="submit" className={`${buttonSecondaryClass} !text-[10px]`}>
                      Delete
                    </button>
                  </form>
                </div>))}
              {divisions.length === 0 && <p className="text-sm opacity-60">No divisions yet.</p>}
            </div>
            <form action={createDivision} className="flex items-end gap-3">
              <input type="hidden" name="seasonId" value={current.id}/>
              <Field label="New division name">
                <input name="name" required placeholder="East" className={inputClass}/>
              </Field>
              <button type="submit" className={buttonClass}>
                Add Division
              </button>
            </form>
          </Panel>

          <Panel title={`Teams in ${current.name}`}>
            <div className="mb-4 flex flex-col gap-2">
              {seasonTeams.map((st) => (<div key={st.id} className="flex items-center justify-between gap-3 border-b border-ink/10 py-2 text-sm">
                  <span className="flex-1">{st.team.name}</span>
                  <form action={addTeamToSeason} className="flex items-center gap-2">
                    <input type="hidden" name="seasonId" value={current.id}/>
                    <input type="hidden" name="teamId" value={st.teamId}/>
                    <select name="divisionId" defaultValue={st.divisionId ?? ""} className={`${inputClass} !w-40`}>
                      <option value="">No division</option>
                      {divisions.map((d) => (<option key={d.id} value={d.id}>
                          {d.name}
                        </option>))}
                    </select>
                    <button type="submit" className={`${buttonSecondaryClass} !text-[10px]`}>
                      Update
                    </button>
                  </form>
                  <form action={removeTeamFromSeason}>
                    <input type="hidden" name="seasonTeamId" value={st.id}/>
                    <button type="submit" className={`${buttonSecondaryClass} !text-[10px]`}>
                      Remove
                    </button>
                  </form>
                </div>))}
              {seasonTeams.length === 0 && <p className="text-sm opacity-60">No teams added yet.</p>}
            </div>
            <form action={addTeamToSeason} className="flex items-end gap-3">
              <input type="hidden" name="seasonId" value={current.id}/>
              <Field label="Add team">
                <select name="teamId" required className={inputClass}>
                  {teams.map((t) => (<option key={t.id} value={t.id}>
                      {t.name}
                    </option>))}
                </select>
              </Field>
              <Field label="Division">
                <select name="divisionId" className={inputClass}>
                  <option value="">No division</option>
                  {divisions.map((d) => (<option key={d.id} value={d.id}>
                      {d.name}
                    </option>))}
                </select>
              </Field>
              <button type="submit" className={buttonClass}>
                Add to Season
              </button>
            </form>
          </Panel>

          <Panel title="Playoff Format">
            <form action={updatePlayoffFormatForSeason} className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label="Playoff teams">
                <input type="number" name="playoffTeamCount" defaultValue={current.playoffTeamCount} className={inputClass}/>
              </Field>
              <Field label="Series lengths (comma-separated)">
                <input name="playoffSeriesLengths" defaultValue={current.playoffSeriesLengths.join(",")} className={inputClass}/>
              </Field>
              <label className="flex items-end gap-2 pb-2">
                <input type="checkbox" name="playoffReseed" defaultChecked={current.playoffReseed}/>
                <span className="text-sm">Reseed each round</span>
              </label>
              <div className="col-span-2 sm:col-span-3">
                <button type="submit" className={buttonClass}>
                  Save Playoff Format
                </button>
              </div>
            </form>
          </Panel>
        </>)}
    </div>);
}
