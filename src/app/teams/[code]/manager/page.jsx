import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TeamCrest } from "@/components/TeamCrest";
import { getManagerPage, computeCareerTotals } from "@/lib/queries";

export const dynamic = "force-dynamic";

function recordRow(h) {
  return (
    <div key={h.season.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 py-2.5 text-sm last:border-b-0">
      <div className="min-w-0 flex-1">
        <span className="font-bold">{h.season.name}</span>
        {h.division && <span className="ml-2 text-xs opacity-55">{h.division}</span>}
      </div>
      <div className="w-20 flex-shrink-0 text-right opacity-80">
        {h.wins}-{h.losses}
      </div>
      <div className="flex-shrink-0 text-right text-xs font-bold uppercase tracking-wide">
        {h.champion ? (
          <span className="text-accent">League Champion</span>
        ) : h.playoffResult ? (
          <span className="opacity-60">{h.playoffResult}</span>
        ) : (
          <span className="opacity-40">—</span>
        )}
      </div>
    </div>
  );
}

export default async function TeamManagerPage(props) {
  const { code } = await props.params;
  const data = await getManagerPage(code);
  if (!data) notFound();
  const { team, history, asPlayer } = data;

  const totalWins = history.reduce((sum, h) => sum + h.wins, 0);
  const totalLosses = history.reduce((sum, h) => sum + h.losses, 0);
  const championships = history.filter((h) => h.champion).length;

  const career = asPlayer ? computeCareerTotals(asPlayer.seasonStats.filter((s) => !s.isPlayoffs)) : null;

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1 px-4 sm:px-8 lg:px-14 py-10">
        <div className="mb-8 flex flex-wrap items-center gap-5 border-[3px] border-ink p-6" style={{ borderColor: team.primaryColor }}>
          <TeamCrest color={team.primaryColor} logoUrl={team.logoUrl} className="h-14 w-12 flex-shrink-0" />
          <div>
            <div className="text-xs font-extrabold tracking-wide text-accent">TEAM MANAGER</div>
            <div className="font-display text-3xl">{team.managerName}</div>
            <div className="mt-1 text-sm font-bold uppercase tracking-wide opacity-60">
              <Link href={`/teams/${team.shortCode}`} className="hover:text-accent">
                {team.name}
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-3 gap-4 border-[3px] border-ink p-6">
          <div>
            <div className="font-display text-2xl text-accent">
              {totalWins}-{totalLosses}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wide opacity-55">Career Record</div>
          </div>
          <div>
            <div className="font-display text-2xl text-accent">{championships}</div>
            <div className="text-[10px] font-bold uppercase tracking-wide opacity-55">Championships</div>
          </div>
          <div>
            <div className="font-display text-2xl text-accent">{history.length}</div>
            <div className="text-[10px] font-bold uppercase tracking-wide opacity-55">Seasons</div>
          </div>
        </div>

        <div className="mb-8 border-[3px] border-ink p-6">
          <div className="mb-4 text-xs font-extrabold tracking-wide opacity-55">SEASON BY SEASON</div>
          {history.length === 0 ? (
            <p className="text-sm opacity-60">No season history on record yet.</p>
          ) : (
            history.map(recordRow)
          )}
        </div>

        {asPlayer && (
          <div className="border-[3px] border-ink p-6">
            <div className="mb-4 text-xs font-extrabold tracking-wide opacity-55">ALSO A PLAYER</div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Link href={`/players/${asPlayer.slug}`} className="font-bold hover:text-accent">
                  {asPlayer.name}
                </Link>
                <span className="ml-2 text-xs opacity-55">
                  {asPlayer.team ? asPlayer.team.name : "Free Agent"}
                  {asPlayer.status === "RETIRED" && " · Retired"}
                </span>
              </div>
              {career && (
                <div className="flex gap-5 text-sm">
                  {career.battingAvg != null && (
                    <div>
                      <span className="font-display text-accent">{career.battingAvg.toFixed(3).replace(/^0/, "")}</span>{" "}
                      <span className="text-[10px] opacity-55">AVG</span>
                    </div>
                  )}
                  {career.homeRuns != null && (
                    <div>
                      <span className="font-display text-accent">{career.homeRuns}</span>{" "}
                      <span className="text-[10px] opacity-55">HR</span>
                    </div>
                  )}
                  {career.era != null && (
                    <div>
                      <span className="font-display text-accent">{career.era.toFixed(2)}</span>{" "}
                      <span className="text-[10px] opacity-55">ERA</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
