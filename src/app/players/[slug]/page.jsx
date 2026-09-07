import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TeamCrest } from "@/components/TeamCrest";
import { getPlayerBySlug, computeCareerTotals } from "@/lib/queries";
export const dynamic = "force-dynamic";
const BATTING_FIELDS = [
    { key: "gamesPlayed", label: "GP" },
    { key: "atBats", label: "AB" },
    { key: "hits", label: "H" },
    { key: "walks", label: "BB" },
    { key: "strikeouts", label: "K" },
    { key: "homeRuns", label: "HR" },
    { key: "rbi", label: "RBI" },
    { key: "stolenBases", label: "SB" },
    { key: "battingAvg", label: "AVG", format: (v) => v.toFixed(3).replace(/^0/, "") },
    { key: "onBasePct", label: "OBP", format: (v) => v.toFixed(3).replace(/^0/, "") },
    { key: "slugging", label: "SLG", format: (v) => v.toFixed(3).replace(/^0/, "") },
    { key: "ops", label: "OPS", format: (v) => v.toFixed(3).replace(/^0/, "") },
];
const PITCHING_FIELDS = [
    { key: "gamesPitched", label: "GP" },
    { key: "inningsPitched", label: "IP", format: (v) => v.toFixed(1) },
    { key: "era", label: "ERA", format: (v) => v.toFixed(2) },
    { key: "whip", label: "WHIP", format: (v) => v.toFixed(2) },
    { key: "pitcherWalks", label: "BB" },
    { key: "pitcherStrikeouts", label: "K" },
];
function StatGrid({ stat, fields, }) {
    return (<div className="grid grid-cols-4 gap-4 sm:grid-cols-6">
      {fields.map((f) => {
            const value = stat[f.key];
            return (<div key={f.key}>
            <div className="font-display text-xl text-accent">
              {value == null ? "—" : f.format ? f.format(value) : value}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wide opacity-55">
              {f.label}
            </div>
          </div>);
        })}
    </div>);
}
function hasAny(stat, fields) {
    return fields.some((f) => stat[f.key] != null);
}
function withOps(stat) {
    return {
        ...stat,
        ops: stat.onBasePct != null && stat.slugging != null ? stat.onBasePct + stat.slugging : null,
    };
}
function StatBlock({ label, stat }) {
    const statWithOps = withOps(stat);
    const showBatting = hasAny(statWithOps, BATTING_FIELDS);
    const showPitching = hasAny(stat, PITCHING_FIELDS);
    if (!showBatting && !showPitching)
        return null;
    return (<div className="mb-4 last:mb-0">
      <div className="mb-2 text-[10px] font-extrabold uppercase tracking-wide text-accent">
        {label}
      </div>
      {showBatting && (<div className="mb-3">
          <div className="mb-2 text-[10px] font-extrabold uppercase tracking-wide opacity-45">
            Batting
          </div>
          <StatGrid stat={statWithOps} fields={BATTING_FIELDS}/>
        </div>)}
      {showPitching && (<div>
          <div className="mb-2 text-[10px] font-extrabold uppercase tracking-wide opacity-45">
            Pitching
          </div>
          <StatGrid stat={stat} fields={PITCHING_FIELDS}/>
        </div>)}
    </div>);
}
export default async function PlayerPage(props) {
    const { slug } = await props.params;
    const result = await getPlayerBySlug(slug);
    if (!result)
        notFound();
    const { player, transactions } = result;
    const regularStats = player.seasonStats.filter((s) => !s.isPlayoffs);
    const playoffStats = player.seasonStats.filter((s) => s.isPlayoffs);
    const regularCareer = computeCareerTotals(regularStats);
    const playoffCareer = computeCareerTotals(playoffStats);
    const seasonOrder = [];
    const seasonGroupMap = new Map();
    for (const stat of player.seasonStats) {
        if (!seasonGroupMap.has(stat.seasonId)) {
            seasonGroupMap.set(stat.seasonId, { season: stat.season, regular: null, playoffs: null });
            seasonOrder.push(stat.seasonId);
        }
        const group = seasonGroupMap.get(stat.seasonId);
        if (stat.isPlayoffs)
            group.playoffs = stat;
        else
            group.regular = stat;
    }
    const seasonGroups = seasonOrder.map((id) => seasonGroupMap.get(id));
    return (<div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1 px-14 py-10">
        <div className="mb-8 flex items-center gap-5 border-[3px] border-ink p-6">
          {player.team ? (<TeamCrest color={player.team.primaryColor} logoUrl={player.team.logoUrl} className="h-14 w-12 flex-shrink-0"/>) : (<div className="h-14 w-12 flex-shrink-0 bg-muted/30"/>)}
          <div>
            <div className="font-display text-3xl">{player.name}</div>
            <div className="mt-1 text-sm font-bold uppercase tracking-wide opacity-60">
              {player.position}
              {player.team ? (<>
                  {" "}
                  &middot;{" "}
                  <Link href="/" className="hover:text-accent">
                    {player.team.name}
                  </Link>
                </>) : (<> &middot; Free Agent</>)}
              {player.status === "RETIRED" && <> &middot; Retired</>}
            </div>
            {player.robloxId && (<div className="mt-1 text-xs font-semibold opacity-45">
                ROBLOX ID: {player.robloxId}
              </div>)}
          </div>
        </div>

        {player.prospectRank && (<div className="mb-8 border-[3px] border-ink bg-ink p-6 text-paper">
            <div className="text-xs font-extrabold tracking-wide text-accent">
              PROSPECTS PIPELINE
            </div>
            <div className="mt-1 font-display text-2xl">
              #{player.prospectRank.rank} OVERALL
            </div>
          </div>)}

        {player.awards.length > 0 && (<div className="mb-8 border-[3px] border-ink p-6">
            <div className="mb-4 text-xs font-extrabold tracking-wide opacity-55">
              AWARDS
            </div>
            <div className="flex flex-col gap-2">
              {player.awards.map((a) => (<div key={a.id} className="flex items-center justify-between border-b border-ink/10 pb-2 text-sm last:border-b-0">
                  <span className="font-display text-base">{a.title}</span>
                  <span className="text-xs opacity-55">{a.season ? a.season.name : "Career"}</span>
                </div>))}
            </div>
          </div>)}

        {(regularCareer || playoffCareer) && (<div className="mb-8 border-[3px] border-ink p-6">
            <div className="mb-4 text-xs font-extrabold tracking-wide opacity-55">
              CAREER STATS
            </div>
            {regularCareer && <StatBlock label="Regular Season" stat={regularCareer}/>}
            {playoffCareer && <StatBlock label="Playoffs" stat={playoffCareer}/>}
          </div>)}

        {seasonGroups.length > 0 && (<div className="mb-8 border-[3px] border-ink p-6">
            <div className="mb-4 text-xs font-extrabold tracking-wide opacity-55">
              SEASON BY SEASON
            </div>
            {seasonGroups.map((group) => (<div key={group.season.id} className="mb-6 last:mb-0">
                <div className="mb-3 text-sm font-bold">{group.season.name}</div>
                {group.regular && <StatBlock label="Regular Season" stat={group.regular}/>}
                {group.playoffs && <StatBlock label="Playoffs" stat={group.playoffs}/>}
                {!group.regular && !group.playoffs && (<p className="text-sm opacity-55">No stats recorded yet.</p>)}
              </div>))}
          </div>)}

        {player.prospectRankHistory.length > 0 && (<div className="mb-8 border-[3px] border-ink p-6">
            <div className="mb-4 text-xs font-extrabold tracking-wide opacity-55">
              PAST PROSPECT RANKINGS
            </div>
            <div className="flex flex-col gap-2">
              {player.prospectRankHistory.map((h) => (<div key={h.id} className="flex items-center justify-between border-b border-ink/10 pb-2 text-sm last:border-b-0">
                  <span className="font-display text-base">#{h.rank} Overall</span>
                  <span className="text-xs opacity-55">{h.recordedAt.toLocaleDateString()}</span>
                </div>))}
            </div>
          </div>)}

        <div className="border-[3px] border-ink p-6">
          <div className="mb-4 text-xs font-extrabold tracking-wide opacity-55">
            TRANSACTION HISTORY
          </div>
          {transactions.length === 0 ? (<p className="text-sm opacity-60">No transactions on record.</p>) : (<div className="flex flex-col gap-3">
              {transactions.map((t) => (<div key={t.id} className="border-b border-ink/10 pb-3 text-sm last:border-b-0">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-extrabold tracking-wide text-accent">
                      {t.transaction.type}
                    </span>
                    <span className="text-xs opacity-50">
                      {t.transaction.date.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="opacity-80">
                    {t.fromTeam?.name ?? "Free Agent"} &rarr; {t.toTeam?.name ?? "Free Agent"}
                  </div>
                </div>))}
            </div>)}
        </div>
      </main>
      <Footer />
    </div>);
}
