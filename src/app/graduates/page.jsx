import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TeamCrest } from "@/components/TeamCrest";
import { getGraduates } from "@/lib/queries";

export const dynamic = "force-dynamic";

function CareerLine({ career }) {
  if (!career) return null;
  const bits = [];
  if (career.battingAvg != null) bits.push(`${career.battingAvg.toFixed(3).replace(/^0/, "")} AVG`);
  if (career.homeRuns != null) bits.push(`${career.homeRuns} HR`);
  if (career.rbi != null) bits.push(`${career.rbi} RBI`);
  if (career.era != null) bits.push(`${career.era.toFixed(2)} ERA`);
  if (bits.length === 0) return null;
  return <div className="text-xs opacity-60">{bits.join(" · ")}</div>;
}

export default async function GraduatesPage() {
  const graduates = await getGraduates();

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1 px-14 py-10">
        <h1 className="mb-1 font-display text-2xl">GRADUATES</h1>
        <p className="mb-8 text-sm opacity-60">Players who have moved on from the league</p>

        {graduates.length === 0 ? (
          <p className="text-sm opacity-60">No graduates on record yet.</p>
        ) : (
          <div className="border-[3px] border-ink bg-surface">
            {graduates.map((g, i) => (
              <div
                key={g.slug}
                className={`flex items-center gap-4 px-5 py-3 ${i < graduates.length - 1 ? "border-b border-ink/10" : ""}`}
              >
                {g.team ? (
                  <TeamCrest color={g.team.primaryColor} logoUrl={g.team.logoUrl} className="h-10 w-9 flex-shrink-0" />
                ) : (
                  <div className="h-10 w-9 flex-shrink-0 bg-muted/30" />
                )}
                <div className="min-w-0 flex-1">
                  <Link href={`/players/${g.slug}`} className="block truncate font-bold hover:text-accent">
                    {g.name}
                  </Link>
                  <div className="truncate text-xs opacity-60">{g.team ? g.team.name : "Free Agent"}</div>
                  <CareerLine career={g.career} />
                </div>
                {g.awards.length > 0 && (
                  <div className="flex-shrink-0 text-right text-xs font-extrabold tracking-wide text-accent">
                    {g.awards.length} AWARD{g.awards.length === 1 ? "" : "S"}
                  </div>
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
