import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BracketSeriesCard } from "@/components/BracketSeriesCard";
import { getCurrentSeason, getPlayoffBracket } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function PlayoffsPage() {
  const season = await getCurrentSeason();
  const rounds = season ? await getPlayoffBracket(season.id) : [];

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1 px-14 py-10">
        <h1 className="mb-1 font-display text-2xl">PLAYOFF BRACKET</h1>
        <p className="mb-8 text-sm opacity-60">
          {season ? season.name : "No current season set."}
        </p>

        {rounds.length === 0 ? (
          <p className="text-sm opacity-60">The bracket hasn&apos;t been set yet.</p>
        ) : (
          <div className="flex gap-8 overflow-x-auto pb-4">
            {rounds.map((round) => (
              <div key={round.round} className="flex w-72 flex-shrink-0 flex-col gap-6">
                <div className="text-xs font-extrabold tracking-wide opacity-55">
                  {round.name.toUpperCase()}
                </div>
                <div className="flex flex-col justify-around gap-6">
                  {round.series.map((s) => (
                    <BracketSeriesCard key={s.id} series={s} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
