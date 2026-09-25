import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getAllAwards } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AwardsPage() {
  const groups = await getAllAwards();

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1 px-14 py-10">
        <h1 className="mb-1 font-display text-2xl">AWARDS</h1>
        <p className="mb-8 text-sm opacity-60">League award history, season by season</p>

        {groups.length === 0 ? (
          <p className="text-sm opacity-60">No awards granted yet.</p>
        ) : (
          <div className="flex flex-col gap-8">
            {groups.map((group) => (
              <div key={group.seasonName} className="border-[3px] border-ink p-6">
                <div className="mb-4 text-xs font-extrabold tracking-wide text-accent">
                  {group.seasonName.toUpperCase()}
                </div>
                <div className="flex flex-col gap-2">
                  {group.awards.map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-3 border-b border-ink/10 pb-2 text-sm last:border-b-0 last:pb-0">
                      <span className="font-bold">{a.title}</span>
                      <Link href={`/players/${a.player.slug}`} className="opacity-70 hover:text-accent hover:opacity-100">
                        {a.player.name}
                      </Link>
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
