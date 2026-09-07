import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TeamCrest } from "@/components/TeamCrest";
import { getPastSeasons } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const seasons = await getPastSeasons();

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1 px-14 py-10">
        <h1 className="mb-1 font-display text-2xl">LEAGUE HISTORY</h1>
        <p className="mb-8 text-sm opacity-60">Past seasons &amp; champions</p>

        {seasons.length === 0 ? (
          <p className="text-sm opacity-60">No past seasons on record yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {seasons.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-4 border-[3px] border-ink p-6"
              >
                <div className="font-display text-lg">{s.name}</div>
                {s.championTeam ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold uppercase tracking-wide text-accent">
                      Champion
                    </span>
                    <TeamCrest
                      color={s.championTeam.primaryColor}
                      logoUrl={s.championTeam.logoUrl}
                      className="h-8 w-7 flex-shrink-0"
                    />
                    <span className="font-bold">{s.championTeam.name}</span>
                  </div>
                ) : (
                  <span className="text-sm opacity-50">No champion recorded</span>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
