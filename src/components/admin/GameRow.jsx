import { updateGame, deleteGame } from "@/lib/actions/schedule";
import { buttonClass, buttonSecondaryClass } from "./ui";
export function GameRow({ game, }) {
    const updateWithId = updateGame.bind(null, game.id);
    return (<div className="flex items-center gap-2 border-b border-ink/10 py-2 text-sm last:border-b-0">
      <form action={updateWithId} className="grid flex-1 grid-cols-12 items-center gap-2">
        <div className="col-span-3">
          <div className="font-bold">
            {game.awayTeam.shortCode} @ {game.homeTeam.shortCode}
          </div>
          <div className="text-xs opacity-55">
            {game.scheduledTime ?? "—"} {game.locationCode ? `· ${game.locationCode}` : ""}
          </div>
        </div>
        <select name="status" defaultValue={game.status} className="col-span-2 border border-ink/30 bg-surface px-2 py-1.5 text-xs">
          <option value="SCHEDULED">Scheduled</option>
          <option value="FINAL">Final</option>
          <option value="FORFEIT">Forfeit</option>
          <option value="POSTPONED">Postponed</option>
        </select>
        <input type="number" name="awayScore" defaultValue={game.awayScore ?? ""} placeholder="Away" className="col-span-1 border border-ink/30 bg-surface px-2 py-1.5 text-xs"/>
        <input type="number" name="homeScore" defaultValue={game.homeScore ?? ""} placeholder="Home" className="col-span-1 border border-ink/30 bg-surface px-2 py-1.5 text-xs"/>
        <input type="number" name="innings" defaultValue={game.innings ?? ""} placeholder="Innings" className="col-span-2 border border-ink/30 bg-surface px-2 py-1.5 text-xs"/>
        <select name="forfeitWinnerId" defaultValue={game.forfeitWinnerId ?? ""} className="col-span-2 border border-ink/30 bg-surface px-2 py-1.5 text-xs">
          <option value="">Forfeit winner…</option>
          <option value={game.homeTeam.id}>{game.homeTeam.shortCode} (home)</option>
          <option value={game.awayTeam.id}>{game.awayTeam.shortCode} (away)</option>
        </select>
        <div className="col-span-1 flex justify-end">
          <button type="submit" className={`${buttonClass} !px-2.5 !py-1.5 !text-[10px]`}>
            Save
          </button>
        </div>
      </form>
      <form action={deleteGame}>
        <input type="hidden" name="gameId" value={game.id}/>
        <button type="submit" className={`${buttonSecondaryClass} !px-2.5 !py-1.5 !text-[10px]`}>
          Delete
        </button>
      </form>
    </div>);
}
