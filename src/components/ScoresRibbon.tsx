import { scores, teamsByCode, type Score } from "@/lib/data";
import { TeamCrest } from "./TeamCrest";

function TeamRow({
  code,
  runs,
  dim,
}: {
  code: string;
  runs?: number;
  dim: boolean;
}) {
  const team = teamsByCode[code];
  return (
    <div className="flex items-center justify-between gap-4 py-0.5">
      <div className="flex items-center gap-1.5">
        <TeamCrest color={team.color} className="h-3.5 w-3" />
        <span
          className={`text-xs ${dim ? "font-semibold text-muted" : "font-extrabold text-paper"}`}
        >
          {code}
        </span>
      </div>
      {runs !== undefined && (
        <span
          className={`text-sm ${dim ? "font-extrabold text-muted" : "font-extrabold text-paper"}`}
        >
          {runs}
        </span>
      )}
    </div>
  );
}

function ScoreCard({ score, first }: { score: Score; first: boolean }) {
  const isLive = score.status.kind === "live";
  const awayWins =
    score.away.runs !== undefined &&
    score.home.runs !== undefined &&
    score.away.runs > score.home.runs;
  const homeWins =
    score.away.runs !== undefined &&
    score.home.runs !== undefined &&
    score.home.runs > score.away.runs;

  return (
    <div
      className={`flex flex-shrink-0 flex-col justify-center border-r border-paper/10 py-3 ${
        first ? "pr-5" : "px-5"
      } ${isLive ? "border-t-[3px] border-t-accent" : ""}`}
    >
      {isLive ? (
        <div className="mb-1.5 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 bg-accent" />
          <span className="text-[9px] font-extrabold tracking-wider text-accent">
            {score.status.label}
          </span>
        </div>
      ) : (
        <div className="mb-1.5 text-[9px] font-extrabold tracking-wider text-muted">
          {score.status.label}
        </div>
      )}
      <TeamRow code={score.away.code} runs={score.away.runs} dim={homeWins} />
      <TeamRow code={score.home.code} runs={score.home.runs} dim={awayWins} />
    </div>
  );
}

export function ScoresRibbon() {
  return (
    <div className="flex overflow-x-auto border-b-[3px] border-ink bg-ink-soft px-14">
      {scores.map((score, i) => (
        <ScoreCard key={i} score={score} first={i === 0} />
      ))}
    </div>
  );
}
