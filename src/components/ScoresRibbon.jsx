import { TeamCrest } from "./TeamCrest";

function TeamRow({ name, color, logoUrl, runs, dim }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div className="flex items-center gap-2">
        <TeamCrest color={color} logoUrl={logoUrl} className="h-5 w-4" />
        <span className={`text-sm ${dim ? "font-semibold text-muted" : "font-extrabold text-on-brand"}`}>
          {name}
        </span>
      </div>
      {runs !== null && (
        <span className={`text-lg ${dim ? "font-extrabold text-muted" : "font-extrabold text-on-brand"}`}>
          {runs}
        </span>
      )}
    </div>
  );
}

function ScoreCard({ game, first }) {
  const awayWins = game.away.runs !== null && game.home.runs !== null && game.away.runs > game.home.runs;
  const homeWins = game.away.runs !== null && game.home.runs !== null && game.home.runs > game.away.runs;
  return (
    <div className={`flex w-56 flex-shrink-0 flex-col justify-center border-r border-on-brand/10 py-4 ${first ? "pr-6" : "px-6"}`}>
      <div className="mb-2 text-[10px] font-extrabold tracking-wider text-muted">
        {game.statusLabel}
      </div>
      <TeamRow name={game.away.name} color={game.away.color} logoUrl={game.away.logoUrl} runs={game.away.runs} dim={homeWins} />
      <TeamRow name={game.home.name} color={game.home.color} logoUrl={game.home.logoUrl} runs={game.home.runs} dim={awayWins} />
    </div>
  );
}

export function ScoresRibbon({ games }) {
  if (games.length === 0) return null;
  return (
    <div className="flex overflow-x-auto border-b-[3px] border-ink bg-brand px-14">
      {games.map((game, i) => (
        <ScoreCard key={game.id} game={game} first={i === 0} />
      ))}
    </div>
  );
}
