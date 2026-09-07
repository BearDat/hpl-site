import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getCurrentSeason, getFullStatLeaders } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function LeadersPage() {
  const season = await getCurrentSeason();
  const categories = season ? await getFullStatLeaders(season.id, 10) : [];

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1 px-14 py-10">
        <h1 className="mb-1 font-display text-2xl">STAT LEADERS</h1>
        <p className="mb-8 text-sm opacity-60">{season ? season.name : "No current season set."}</p>

        {categories.length === 0 ? (
          <p className="text-sm opacity-60">No stats recorded yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <div key={cat.key} className="border-[3px] border-ink bg-surface p-5">
                <div className="mb-3 text-xs font-extrabold tracking-wide opacity-55">{cat.label}</div>
                <div className="flex flex-col gap-2">
                  {cat.entries.map((e, i) => (
                    <div key={e.playerSlug} className="flex items-center gap-3 text-sm">
                      <span className="w-4 flex-shrink-0 font-display text-sm opacity-45">{i + 1}</span>
                      <span className="w-14 flex-shrink-0 font-display text-lg text-accent">{e.value}</span>
                      <Link href={`/players/${e.playerSlug}`} className="min-w-0 flex-1 truncate font-bold hover:text-accent">
                        {e.player}
                      </Link>
                      <span className="flex-shrink-0 text-xs opacity-55">{e.team}</span>
                    </div>
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
