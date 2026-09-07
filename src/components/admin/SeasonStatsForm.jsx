import { updatePlayerSeasonStat } from "@/lib/actions/stats";
import { Field, inputClass, buttonClass } from "./ui";
const BATTING_FIELDS = [
    { key: "gamesPlayed", label: "GP" },
    { key: "atBats", label: "AB" },
    { key: "hits", label: "H" },
    { key: "walks", label: "BB" },
    { key: "strikeouts", label: "K" },
    { key: "homeRuns", label: "HR" },
    { key: "rbi", label: "RBI" },
    { key: "stolenBases", label: "SB" },
    { key: "battingAvg", label: "AVG", step: "0.001" },
    { key: "onBasePct", label: "OBP", step: "0.001" },
    { key: "slugging", label: "SLG", step: "0.001" },
];
const PITCHING_FIELDS = [
    { key: "gamesPitched", label: "GP" },
    { key: "inningsPitched", label: "IP", step: "0.1" },
    { key: "era", label: "ERA", step: "0.01" },
    { key: "whip", label: "WHIP", step: "0.01" },
    { key: "pitcherWalks", label: "BB" },
    { key: "pitcherStrikeouts", label: "K" },
];
export function SeasonStatsForm({ player, seasonId, stat, }) {
    return (<form action={updatePlayerSeasonStat} className="mb-6 border-b border-ink/10 pb-6 last:border-b-0 last:pb-0">
      <input type="hidden" name="playerId" value={player.id}/>
      <input type="hidden" name="seasonId" value={seasonId}/>
      <div className="mb-3 text-sm font-bold">{player.name}</div>

      <div className="mb-3">
        <div className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wide opacity-50">
          Batting
        </div>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-11">
          {BATTING_FIELDS.map((f) => (<Field key={f.key} label={f.label}>
              <input type="number" step={f.step ?? "1"} name={f.key} defaultValue={stat?.[f.key] ?? ""} className={`${inputClass} !px-1.5 !py-1 !text-xs`}/>
            </Field>))}
        </div>
      </div>

      <div className="mb-3">
        <div className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wide opacity-50">
          Pitching
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {PITCHING_FIELDS.map((f) => (<Field key={f.key} label={f.label}>
              <input type="number" step={f.step ?? "1"} name={f.key} defaultValue={stat?.[f.key] ?? ""} className={`${inputClass} !px-1.5 !py-1 !text-xs`}/>
            </Field>))}
        </div>
      </div>

      <button type="submit" className={`${buttonClass} !text-[10px]`}>
        Save Stats
      </button>
    </form>);
}
