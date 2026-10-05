import Link from "next/link";
import { Header } from "@/components/Header";
import { ScoresRibbon } from "@/components/ScoresRibbon";
import { NewsCard } from "@/components/NewsCard";
import { PipelineCard } from "@/components/PipelineCard";
import { StandingsCard } from "@/components/StandingsCard";
import { StatLeadersCard } from "@/components/StatLeadersCard";
import { PlayoffBracket } from "@/components/PlayoffBracket";
import { Footer } from "@/components/Footer";
import {
  getCurrentSeason,
  getStandings,
  getScoreboardGames,
  getPipelineTop,
  getFullStatLeaders,
  getFeaturedNews,
  hasPlayoffsStarted,
  getPlayoffBracket,
  getRecentTransactions,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

const TRANSACTION_LABEL = { SIGNING: "Signed", RELEASE: "Released", TRADE: "Traded" };

export default async function Home() {
  const season = await getCurrentSeason();

  const [standings, games, pipeline, statLeaders, news, playoffsStarted, transactions] = season
    ? await Promise.all([
        getStandings(season.id),
        getScoreboardGames(season.id),
        getPipelineTop(5),
        getFullStatLeaders(season.id, 3),
        getFeaturedNews(),
        hasPlayoffsStarted(season.id),
        getRecentTransactions(6),
      ])
    : [[], [], [], [], { top: null, secondary: [] }, false, []];

  const bracketRounds = playoffsStarted && season ? await getPlayoffBracket(season.id) : [];

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <ScoresRibbon games={games} />
      <main className="grid grid-cols-1 gap-5 px-14 py-10 sm:grid-cols-2 lg:grid-cols-[2fr_1.3fr_1fr_1fr]">
        <NewsCard article={news.top} />
        <PipelineCard entries={pipeline} />
        <StandingsCard divisions={standings} />
        <StatLeadersCard leaders={statLeaders} />
      </main>

      {transactions.length > 0 && (
        <div className="border-t border-ink/15 px-14 py-8">
          <div className="mb-4 text-xs font-extrabold tracking-wide opacity-55">RECENT TRANSACTIONS</div>
          <div className="grid grid-cols-1 gap-x-10 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-start gap-2 text-sm">
                <span className="flex-shrink-0 text-xs font-extrabold text-accent">
                  {TRANSACTION_LABEL[t.type] ?? t.type}
                </span>
                <div className="min-w-0">
                  {t.assets.map((a) => (
                    <div key={a.id} className="truncate opacity-80">
                      {a.player.name}
                      <span className="opacity-60">
                        {" "}
                        ({a.fromTeam?.shortCode ?? "FA"} &rarr; {a.toTeam?.shortCode ?? "FA"})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {playoffsStarted && (
        <div className="border-t border-ink/15 px-14 py-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl">PLAYOFF BRACKET</h2>
            <Link href="/playoffs" className="text-xs font-bold text-accent hover:underline">
              FULL BRACKET &rarr;
            </Link>
          </div>
          <PlayoffBracket rounds={bracketRounds} />
        </div>
      )}

      <Footer />
    </div>
  );
}
