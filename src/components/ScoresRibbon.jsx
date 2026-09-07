import { TeamCrest } from "./TeamCrest";
function TeamRow({ code, color, logoUrl, runs, dim, }) {
    return (<div className="flex items-center justify-between gap-4 py-0.5">
      <div className="flex items-center gap-1.5">
        <TeamCrest color={color} logoUrl={logoUrl} className="h-3.5 w-3"/>
        <span className={`text-xs ${dim ? "font-semibold text-muted" : "font-extrabold text-paper"}`}>
          {code}
        </span>
      </div>
      {runs !== null && (<span className={`text-sm ${dim ? "font-extrabold text-muted" : "font-extrabold text-paper"}`}>
          {runs}
        </span>)}
    </div>);
}
function ScoreCard({ game, first }) {
    const isLive = game.status === "LIVE";
    const awayWins = game.away.runs !== null && game.home.runs !== null && game.away.runs > game.home.runs;
    const homeWins = game.away.runs !== null && game.home.runs !== null && game.home.runs > game.away.runs;
    return (<div className={`flex flex-shrink-0 flex-col justify-center border-r border-paper/10 py-3 ${first ? "pr-5" : "px-5"} ${isLive ? "border-t-[3px] border-t-accent" : ""}`}>
      {isLive ? (<div className="mb-1.5 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 bg-accent"/>
          <span className="text-[9px] font-extrabold tracking-wider text-accent">
            {game.statusLabel}
          </span>
        </div>) : (<div className="mb-1.5 text-[9px] font-extrabold tracking-wider text-muted">
          {game.statusLabel}
        </div>)}
      <TeamRow code={game.away.code} color={game.away.color} logoUrl={game.away.logoUrl} runs={game.away.runs} dim={homeWins}/>
      <TeamRow code={game.home.code} color={game.home.color} logoUrl={game.home.logoUrl} runs={game.home.runs} dim={awayWins}/>
    </div>);
}
export function ScoresRibbon({ games }) {
    if (games.length === 0)
        return null;
    return (<div className="flex overflow-x-auto border-b-[3px] border-ink bg-ink-soft px-14">
      {games.map((game, i) => (<ScoreCard key={game.id} game={game} first={i === 0}/>))}
    </div>);
}
