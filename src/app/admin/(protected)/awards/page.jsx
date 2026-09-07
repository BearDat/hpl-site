import { prisma } from "@/lib/prisma";
import { addAward, deleteAward } from "@/lib/actions/awards";
import { Panel, Field, inputClass, buttonClass, buttonSecondaryClass } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AwardsPage() {
  const [awards, players, seasons] = await Promise.all([
    prisma.award.findMany({
      orderBy: { createdAt: "desc" },
      include: { player: true, season: true },
    }),
    prisma.player.findMany({ orderBy: { name: "asc" } }),
    prisma.season.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">Awards</h1>

      <Panel title="Grant Award">
        <form action={addAward} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Player">
            <select name="playerId" required className={inputClass}>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Season (optional)">
            <select name="seasonId" className={inputClass} defaultValue="">
              <option value="">Career award</option>
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Title">
            <input name="title" required placeholder="MVP" className={inputClass} />
          </Field>
          <div className="flex items-end">
            <button type="submit" className={buttonClass}>
              Grant Award
            </button>
          </div>
        </form>
      </Panel>

      <Panel title="All Awards">
        {awards.length === 0 ? (
          <p className="text-sm opacity-60">No awards granted yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {awards.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-3 border-b border-ink/10 py-2 text-sm"
              >
                <span>
                  <span className="font-bold">{a.player.name}</span>{" "}
                  <span className="opacity-70">— {a.title}</span>{" "}
                  <span className="opacity-45">({a.season ? a.season.name : "Career"})</span>
                </span>
                <form action={deleteAward}>
                  <input type="hidden" name="awardId" value={a.id} />
                  <button type="submit" className={`${buttonSecondaryClass} !text-[10px]`}>
                    Remove
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
