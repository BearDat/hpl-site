"use client";
import { useState } from "react";
import { tradePlayers } from "@/lib/actions/roster";
import { Field, inputClass, buttonClass } from "./ui";
export function TradeForm({ teams, activePlayers }) {
    const [teamAId, setTeamAId] = useState(teams[0]?.id ?? "");
    const [teamBId, setTeamBId] = useState(teams[1]?.id ?? teams[0]?.id ?? "");
    const teamAPlayers = activePlayers.filter((p) => p.teamId === teamAId);
    const teamBPlayers = activePlayers.filter((p) => p.teamId === teamBId);
    return (<form action={tradePlayers} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <Field label="Team A">
          <select name="teamAId" required value={teamAId} onChange={(e) => setTeamAId(e.target.value)} className={inputClass}>
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
            {teamAPlayers.length === 0 && <p className="text-xs opacity-55">No active players on this team.</p>}
            {teamAPlayers.map((p) => (<label key={p.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="teamAPlayers" value={p.id}/>
                {p.name}
              </label>))}
          </div>
        </div>
      </div>
      <div>
        <Field label="Team B">
          <select name="teamBId" required value={teamBId} onChange={(e) => setTeamBId(e.target.value)} className={inputClass}>
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
            {teamBPlayers.length === 0 && <p className="text-xs opacity-55">No active players on this team.</p>}
            {teamBPlayers.map((p) => (<label key={p.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="teamBPlayers" value={p.id}/>
                {p.name}
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
    </form>);
}
