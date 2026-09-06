import { pipelineTop5 } from "@/lib/data";

function Movement({
  direction,
  value,
}: {
  direction: "up" | "down" | "flat";
  value?: number;
}) {
  if (direction === "flat") {
    return (
      <div className="w-7 flex-shrink-0 text-right text-xs font-extrabold opacity-40">
        —
      </div>
    );
  }
  const isUp = direction === "up";
  return (
    <div
      className="w-7 flex-shrink-0 text-right text-xs font-extrabold"
      style={{ color: isUp ? "#5fbf8a" : "#c1391f" }}
    >
      {isUp ? "▲" : "▼"}
      {value}
    </div>
  );
}

export function PipelineCard() {
  return (
    <div className="flex flex-col bg-ink py-5 px-[22px] text-paper">
      <div className="mb-3.5 text-xs font-extrabold tracking-wider text-accent">
        PROSPECTS PIPELINE &middot; TOP 5
      </div>
      {pipelineTop5.map((entry, i) => (
        <div
          key={entry.rank}
          className={`flex items-center gap-3.5 py-2.5 ${
            i < pipelineTop5.length - 1 ? "border-b border-paper/15" : ""
          }`}
        >
          <div className="w-[18px] font-display text-base opacity-55">
            {entry.rank}
          </div>
          <div
            className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center text-[11px] font-extrabold"
            style={{ background: entry.color }}
          >
            {entry.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold">{entry.name}</div>
            <div className="truncate text-xs opacity-60">{entry.team}</div>
          </div>
          <Movement
            direction={entry.movement.direction}
            value={entry.movement.value}
          />
        </div>
      ))}
    </div>
  );
}
