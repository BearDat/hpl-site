import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TeamCrest } from "@/components/TeamCrest";
import { getPlayerBySlug } from "@/lib/queries";

export const dynamic = "force-dynamic";

const STAT_FIELDS: { key: "battingAvg" | "homeRuns" | "rbi" | "stolenBases" | "era"; label: string }[] = [
  { key: "battingAvg", label: "AVG" },
  { key: "homeRuns", label: "HR" },
  { key: "rbi", label: "RBI" },
  { key: "stolenBases", label: "SB" },
  { key: "era", label: "ERA" },
];

export default async function PlayerPage(props: PageProps<"/players/[slug]">) {
  const { slug } = await props.params;
  const result = await getPlayerBySlug(slug);
  if (!result) notFound();
  const { player, transactions } = result;

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1 px-14 py-10">
        <div className="mb-8 flex items-center gap-5 border-[3px] border-ink p-6">
          {player.team ? (
            <TeamCrest color={player.team.primaryColor} logoUrl={player.team.logoUrl} className="h-14 w-12 flex-shrink-0" />
          ) : (
            <div className="h-14 w-12 flex-shrink-0 bg-muted/30" />
          )}
          <div>
            <div className="font-display text-3xl">{player.name}</div>
            <div className="mt-1 text-sm font-bold uppercase tracking-wide opacity-60">
              {player.position}
              {player.team ? (
                <>
                  {" "}
                  &middot;{" "}
                  <Link href="/" className="hover:text-accent">
                    {player.team.name}
                  </Link>
                </>
              ) : (
                <> &middot; Free Agent</>
              )}
              {player.status === "RETIRED" && <> &middot; Retired</>}
            </div>
          </div>
        </div>

        {player.prospectRank && (
          <div className="mb-8 border-[3px] border-ink bg-ink p-6 text-paper">
            <div className="text-xs font-extrabold tracking-wide text-accent">
              PROSPECTS PIPELINE
            </div>
            <div className="mt-1 font-display text-2xl">
              #{player.prospectRank.rank} OVERALL
            </div>
          </div>
        )}

        {player.seasonStats.length > 0 && (
          <div className="mb-8 border-[3px] border-ink p-6">
            <div className="mb-4 text-xs font-extrabold tracking-wide opacity-55">
              SEASON STATS
            </div>
            {player.seasonStats.map((stat) => (
              <div key={stat.id} className="mb-4 last:mb-0">
                <div className="mb-2 text-sm font-bold">{stat.season.name}</div>
                <div className="grid grid-cols-5 gap-4">
                  {STAT_FIELDS.map((f) => {
                    const value = stat[f.key];
                    return (
                      <div key={f.key}>
                        <div className="font-display text-xl text-accent">
                          {value == null
                            ? "—"
                            : f.key === "battingAvg"
                              ? value.toFixed(3).replace(/^0/, "")
                              : f.key === "era"
                                ? value.toFixed(2)
                                : value}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wide opacity-55">
                          {f.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-[3px] border-ink p-6">
          <div className="mb-4 text-xs font-extrabold tracking-wide opacity-55">
            TRANSACTION HISTORY
          </div>
          {transactions.length === 0 ? (
            <p className="text-sm opacity-60">No transactions on record.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {transactions.map((t) => (
                <div key={t.id} className="border-b border-ink/10 pb-3 text-sm last:border-b-0">
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
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
