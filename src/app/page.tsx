import { Header } from "@/components/Header";
import { ScoresRibbon } from "@/components/ScoresRibbon";
import { NewsCard } from "@/components/NewsCard";
import { PipelineCard } from "@/components/PipelineCard";
import { StandingsCard } from "@/components/StandingsCard";
import { StatLeadersCard } from "@/components/StatLeadersCard";
import { Footer } from "@/components/Footer";
import {
  getCurrentSeason,
  getStandings,
  getScoreboardGames,
  getPipelineTop,
  getStatLeaders,
  getFeaturedNews,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const season = await getCurrentSeason();

  const [standings, games, pipeline, statLeaders, news] = season
    ? await Promise.all([
        getStandings(season.id),
        getScoreboardGames(season.id),
        getPipelineTop(5),
        getStatLeaders(season.id),
        getFeaturedNews(),
      ])
    : [[], [], [], [], { top: null, secondary: [] }];

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <ScoresRibbon games={games} />
      <main className="grid grid-cols-[2fr_1.3fr_1fr_1fr] gap-5 px-14 py-10">
        <NewsCard article={news.top ? { title: news.top.title } : null} />
        <PipelineCard entries={pipeline} />
        <StandingsCard divisions={standings} />
        <StatLeadersCard leaders={statLeaders} />
      </main>
      <Footer />
    </div>
  );
}
