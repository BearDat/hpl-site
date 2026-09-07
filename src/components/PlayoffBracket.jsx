import { BracketSeriesCard } from "./BracketSeriesCard";
export function PlayoffBracket({ rounds }) {
    if (rounds.length === 0) {
        return <p className="text-sm opacity-60">The bracket hasn&apos;t been set yet.</p>;
    }
    return (<div className="flex gap-8 overflow-x-auto pb-4">
      {rounds.map((round) => (<div key={round.round} className="flex w-72 flex-shrink-0 flex-col gap-6">
          <div className="text-xs font-extrabold tracking-wide opacity-55">
            {round.name.toUpperCase()}
          </div>
          <div className="flex flex-col justify-around gap-6">
            {round.series.map((s) => (<BracketSeriesCard key={s.id} series={s}/>))}
          </div>
        </div>))}
    </div>);
}
