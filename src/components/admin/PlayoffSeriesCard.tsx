import {
  addPlayoffGame,
  updatePlayoffGame,
  deletePlayoffGame,
  setSeriesWinner,
  deleteSeries,
} from "@/lib/actions/playoffs";
import { inputClass, buttonClass, buttonSecondaryClass } from "./ui";

type Team = { id: string; name: string; shortCode: string };
type PlayoffGame = {
  id: string;
  scheduledTime: string | null;
  locationCode: string | null;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  innings: number | null;
  forfeitWinnerId: string | null;
  homeTeam: Team;
  awayTeam: Team;
};

type Series = {
  id: string;
  round: number;
  roundName: string | null;
  order: number;
  bestOf: number;
  teamAWins: number;
  teamBWins: number;
  teamASeed: number | null;
  teamBSeed: number | null;
  teamA: Team | null;
  teamB: Team | null;
  winner: Team | null;
  games: PlayoffGame[];
};

export function PlayoffSeriesCard({ series }: { series: Series }) {
  const addGameWithId = addPlayoffGame.bind(null, series.id);
  const setWinnerWithId = setSeriesWinner.bind(null, series.id);

  return (
    <div className="mb-4 border-[3px] border-ink p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-display text-base">
          {series.teamASeed ? `(${series.teamASeed}) ` : ""}
          {series.teamA?.name ?? "TBD"}
          <span className="mx-2 text-accent">
            {series.teamAWins}&ndash;{series.teamBWins}
          </span>
          {series.teamB?.name ?? "TBD"}
          {series.teamBSeed ? ` (${series.teamBSeed})` : ""}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="opacity-55">Best of {series.bestOf}</span>
          {series.winner && (
            <span className="font-extrabold text-accent">
              {series.winner.shortCode} WINS
            </span>
          )}
          <form action={deleteSeries}>
            <input type="hidden" name="seriesId" value={series.id} />
            <button type="submit" className={`${buttonSecondaryClass} !text-[10px]`}>
              Delete Series
            </button>
          </form>
        </div>
      </div>

      {series.games.map((game) => {
        const updateWithId = updatePlayoffGame.bind(null, game.id);
        return (
          <div
            key={game.id}
            className="mb-1.5 flex items-center gap-2 border-b border-ink/10 pb-1.5 text-sm last:border-b-0"
          >
            <form action={updateWithId} className="grid flex-1 grid-cols-12 items-center gap-2">
              <div className="col-span-3 text-xs">
                {game.awayTeam.shortCode} @ {game.homeTeam.shortCode}
                <div className="opacity-55">
                  {game.scheduledTime ?? "—"} {game.locationCode ? `· ${game.locationCode}` : ""}
                </div>
              </div>
              <select
                name="status"
                defaultValue={game.status}
                className="col-span-2 border border-ink/30 bg-white px-2 py-1.5 text-xs"
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="LIVE">Live</option>
                <option value="FINAL">Final</option>
                <option value="FORFEIT">Forfeit</option>
                <option value="POSTPONED">Postponed</option>
              </select>
              <input
                type="number"
                name="awayScore"
                defaultValue={game.awayScore ?? ""}
                placeholder="Away"
                className="col-span-1 border border-ink/30 bg-white px-2 py-1.5 text-xs"
              />
              <input
                type="number"
                name="homeScore"
                defaultValue={game.homeScore ?? ""}
                placeholder="Home"
                className="col-span-1 border border-ink/30 bg-white px-2 py-1.5 text-xs"
              />
              <input
                type="number"
                name="innings"
                defaultValue={game.innings ?? ""}
                placeholder="Innings"
                className="col-span-2 border border-ink/30 bg-white px-2 py-1.5 text-xs"
              />
              <select
                name="forfeitWinnerId"
                defaultValue={game.forfeitWinnerId ?? ""}
                className="col-span-2 border border-ink/30 bg-white px-2 py-1.5 text-xs"
              >
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
            <form action={deletePlayoffGame}>
              <input type="hidden" name="gameId" value={game.id} />
              <button type="submit" className={`${buttonSecondaryClass} !px-2.5 !py-1.5 !text-[10px]`}>
                Delete
              </button>
            </form>
          </div>
        );
      })}

      {series.teamA && series.teamB && (
        <form action={addGameWithId} className="mt-2 flex flex-wrap items-end gap-2">
          <select name="homeTeamId" required className={`${inputClass} !w-40`}>
            <option value={series.teamA.id}>{series.teamA.name} (home)</option>
            <option value={series.teamB.id}>{series.teamB.name} (home)</option>
          </select>
          <input name="scheduledTime" placeholder="7:05 PM EST" className={`${inputClass} !w-36`} />
          <input name="locationCode" placeholder="LS1" className={`${inputClass} !w-24`} />
          <button type="submit" className={`${buttonSecondaryClass} !text-[10px]`}>
            Add Game
          </button>
        </form>
      )}

      {series.teamA && series.teamB && (
        <form action={setWinnerWithId} className="mt-2 flex items-center gap-2">
          <span className="text-xs opacity-55">Manual winner override:</span>
          <select name="winnerId" defaultValue={series.winner?.id ?? ""} className={`${inputClass} !w-40`}>
            <option value="">Auto (from games)</option>
            <option value={series.teamA.id}>{series.teamA.name}</option>
            <option value={series.teamB.id}>{series.teamB.name}</option>
          </select>
          <button type="submit" className={`${buttonSecondaryClass} !text-[10px]`}>
            Set
          </button>
        </form>
      )}
    </div>
  );
}
