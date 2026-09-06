import { Header } from "@/components/Header";
import { ScoresRibbon } from "@/components/ScoresRibbon";
import { NewsCard } from "@/components/NewsCard";
import { PipelineCard } from "@/components/PipelineCard";
import { StandingsCard } from "@/components/StandingsCard";
import { StatLeadersCard } from "@/components/StatLeadersCard";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <ScoresRibbon />
      <main className="grid grid-cols-[2fr_1.3fr_1fr_1fr] gap-5 px-14 py-10">
        <NewsCard />
        <PipelineCard />
        <StandingsCard />
        <StatLeadersCard />
      </main>
      <Footer />
    </div>
  );
}
