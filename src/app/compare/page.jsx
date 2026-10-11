import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getComparePlayerOptions, getPlayersForCompare } from "@/lib/queries";
import { inputClass, buttonClass } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const ROWS = [
  { key: "battingAvg", label: "AVG", better: "higher", format: (v) => v.toFixed(3).replace(/^0/, "") },
  { key: "onBasePct", label: "OBP", better: "higher", format: (v) => v.toFixed(3).replace(/^0/, "") },
  { key: "slugging", label: "SLG", better: "higher", format: (v) => v.toFixed(3).replace(/^0/, "") },
  { key: "homeRuns", label: "HR", better: "higher", format: (v) => String(v) },
  { key: "rbi", label: "RBI", better: "higher", format: (v) => String(v) },
  { key: "stolenBases", label: "SB", better: "higher", format: (v) => String(v) },
  { key: "era", label: "ERA", better: "lower", format: (v) => v.toFixed(2) },
  { key: "whip", label: "WHIP", better: "lower", format: (v) => v.toFixed(2) },
  { key: "pitcherStrikeouts", label: "K", better: "higher", format: (v) => String(v) },
];

function PlayerSelect({ name, players, selected }) {
  return (
    <select name={name} defaultValue={selected ?? ""} className={inputClass}>
      <option value="">— Select a player —</option>
      {players.map((p) => (
        <option key={p.slug} value={p.slug}>
          {p.name} {p.team ? `(${p.team.shortCode})` : "(FA)"}
        </option>
      ))}
    </select>
  );
}

export default async function ComparePage(props) {
  const searchParams = await props.searchParams;
  const slugs = [String(searchParams?.p1 ?? ""), String(searchParams?.p2 ?? "")].filter(Boolean);
  const [options, players] = await Promise.all([getComparePlayerOptions(), getPlayersForCompare(slugs)]);

  function betterSlug(row) {
    const withValue = players.filter((p) => p.career && p.career[row.key] != null);
    if (withValue.length < 2) return null;
    const best = withValue.reduce((a, b) => {
      const av = a.career[row.key];
      const bv = b.career[row.key];
      return row.better === "higher" ? (bv > av ? b : a) : (bv < av ? b : a);
    });
    const allEqual = withValue.every((p) => p.career[row.key] === best.career[row.key]);
    return allEqual ? null : best.slug;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1 px-4 sm:px-8 lg:px-14 py-10">
        <h1 className="mb-1 font-display text-2xl">COMPARE PLAYERS</h1>
        <p className="mb-8 text-sm opacity-60">Career regular-season totals, side by side.</p>

        <form method="get" className="mb-8 flex flex-wrap items-end gap-4 border-[3px] border-ink p-5">
          <div className="min-w-48 flex-1">
            <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wide opacity-60">Player A</span>
            <PlayerSelect name="p1" players={options} selected={slugs[0]} />
          </div>
          <div className="min-w-48 flex-1">
            <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wide opacity-60">Player B</span>
            <PlayerSelect name="p2" players={options} selected={slugs[1]} />
          </div>
          <button type="submit" className={buttonClass}>
            Compare
          </button>
        </form>

        {players.length < 2 ? (
          <p className="text-sm opacity-60">Pick two players above to compare their career stats.</p>
        ) : (
          <div className="overflow-x-auto border-[3px] border-ink">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="border-b-[3px] border-ink bg-surface">
                  <th className="px-4 py-3 text-left text-xs font-extrabold uppercase tracking-wide opacity-55">Stat</th>
                  {players.map((p) => (
                    <th key={p.slug} className="px-4 py-3 text-left">
                      <Link href={`/players/${p.slug}`} className="font-display text-lg hover:text-accent">
                        {p.name}
                      </Link>
                      {p.noPitchCatch && <span className="ml-1.5 text-[10px] font-extrabold text-accent-warm">NP/C</span>}
                      <div className="text-xs font-normal opacity-55">{p.team ? p.team.name : "Free Agent"}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-ink/10">
                  <td className="px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide opacity-55">WAR</td>
                  {players.map((p) => (
                    <td key={p.slug} className="px-4 py-2.5 font-display text-accent">
                      {p.war != null ? p.war.toFixed(1) : "—"}
                    </td>
                  ))}
                </tr>
                {ROWS.map((row) => {
                  const winner = betterSlug(row);
                  return (
                    <tr key={row.key} className="border-b border-ink/10 last:border-b-0">
                      <td className="px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide opacity-55">{row.label}</td>
                      {players.map((p) => {
                        const value = p.career?.[row.key];
                        const isBest = winner === p.slug;
                        return (
                          <td key={p.slug} className={`px-4 py-2.5 ${isBest ? "font-bold text-accent" : "opacity-80"}`}>
                            {value == null ? "—" : row.format(value)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
