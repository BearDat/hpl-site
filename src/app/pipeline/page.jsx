import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getPipelineTop } from "@/lib/queries";

export const dynamic = "force-dynamic";

function Movement({ movement }) {
  if (movement.direction === "flat") {
    return <span className="w-10 flex-shrink-0 text-right text-xs font-extrabold opacity-40">—</span>;
  }
  if (movement.direction === "up" && movement.isNew) {
    return <span className="w-10 flex-shrink-0 text-right text-[10px] font-extrabold tracking-wide text-[#5fbf8a]">NEW</span>;
  }
  const isUp = movement.direction === "up";
  return (
    <span className="w-10 flex-shrink-0 text-right text-xs font-extrabold" style={{ color: isUp ? "#5fbf8a" : "#c1391f" }}>
      {isUp ? "▲" : "▼"}
      {movement.value}
    </span>
  );
}

export default async function PipelinePage() {
  const entries = await getPipelineTop(100);

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1 px-14 py-10">
        <h1 className="mb-1 font-display text-2xl">PROSPECTS PIPELINE</h1>
        <p className="mb-8 text-sm opacity-60">Full ranked list</p>

        {entries.length === 0 ? (
          <p className="text-sm opacity-60">No ranked prospects yet.</p>
        ) : (
          <div className="border-[3px] border-ink bg-surface">
            {entries.map((entry, i) => (
              <div
                key={entry.slug}
                className={`flex items-center gap-4 px-5 py-3 ${i < entries.length - 1 ? "border-b border-ink/10" : ""}`}
              >
                <div className="w-8 flex-shrink-0 font-display text-lg opacity-55">{entry.rank}</div>
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center text-xs font-extrabold text-on-brand"
                  style={{ background: entry.color }}
                >
                  {entry.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/players/${entry.slug}`} className="block truncate font-bold hover:text-accent">
                    {entry.name}
                  </Link>
                  <div className="truncate text-xs opacity-60">{entry.team}</div>
                </div>
                <Movement movement={entry.movement} />
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
