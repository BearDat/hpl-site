import Link from "next/link";
import { Header } from "@/components/Header";
import { ScoresRibbon } from "@/components/ScoresRibbon";
import { NewsCard } from "@/components/NewsCard";
import { PipelineCard } from "@/components/PipelineCard";
import { StandingsCard } from "@/components/StandingsCard";
import { StatLeadersCard } from "@/components/StatLeadersCard";
import { PlayoffBracket } from "@/components/PlayoffBracket";
import { Footer } from "@/components/Footer";
import { getCurrentSeason, getStandings, getScoreboardGames, getPipelineTop, getStatLeaders, getFeaturedNews, hasPlayoffsStarted, getPlayoffBracket, } from "@/lib/queries";
export const dynamic = "force-dynamic";
export default async function Home() {
    const season = await getCurrentSeason();
    const [standings, games, pipeline, statLeaders, news, playoffsStarted] = season
        ? await Promise.all([
            getStandings(season.id),
            getScoreboardGames(season.id),
            getPipelineTop(5),
            getStatLeaders(season.id),
            getFeaturedNews(),
            hasPlayoffsStarted(season.id),
        ])
        : [[], [], [], [], { top: null, secondary: [] }, false];
    const bracketRounds = playoffsStarted && season ? await getPlayoffBracket(season.id) : [];
    return (<div className="flex flex-1 flex-col">
      <Header />
      <ScoresRibbon games={games}/>
      <main className="grid grid-cols-[2fr_1.3fr_1fr_1fr] gap-5 px-14 py-10">
        <NewsCard article={news.top ? { title: news.top.title } : null}/>
        <PipelineCard entries={pipeline}/>
        <StandingsCard divisions={standings}/>
        <StatLeadersCard leaders={statLeaders}/>
      </main>

      {playoffsStarted && (<div className="border-t border-ink/15 px-14 py-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl">PLAYOFF BRACKET</h2>
            <Link href="/playoffs" className="text-xs font-bold text-accent hover:underline">
              FULL BRACKET &rarr;
            </Link>
          </div>
          <PlayoffBracket rounds={bracketRounds}/>
        </div>)}

      <Footer />
    </div>);
}
