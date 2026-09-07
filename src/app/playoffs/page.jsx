import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PlayoffBracket } from "@/components/PlayoffBracket";
import { getCurrentSeason, getPlayoffBracket } from "@/lib/queries";
export const dynamic = "force-dynamic";
export default async function PlayoffsPage() {
    const season = await getCurrentSeason();
    const rounds = season ? await getPlayoffBracket(season.id) : [];
    return (<div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1 px-14 py-10">
        <h1 className="mb-1 font-display text-2xl">PLAYOFF BRACKET</h1>
        <p className="mb-8 text-sm opacity-60">
          {season ? season.name : "No current season set."}
        </p>
        <PlayoffBracket rounds={rounds}/>
      </main>
      <Footer />
    </div>);
}
