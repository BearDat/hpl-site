import { prisma } from "@/lib/prisma";
import { createArticle, addMedia, deleteMedia } from "@/lib/actions/news";
import { addProspect, moveProspectRank, removeProspect } from "@/lib/actions/prospects";
import { Panel, Field, inputClass, buttonClass, buttonSecondaryClass } from "@/components/admin/ui";
import { ArticleRow } from "@/components/admin/ArticleRow";
export const dynamic = "force-dynamic";
export default async function NewsPage() {
    const [articles, media, prospects, players] = await Promise.all([
        prisma.newsArticle.findMany({ orderBy: { publishedAt: "desc" } }),
        prisma.mediaAsset.findMany({
            orderBy: { createdAt: "desc" },
            take: 20,
            include: { article: true },
        }),
        prisma.prospectRank.findMany({
            orderBy: { rank: "asc" },
            include: { player: { include: { team: true } } },
        }),
        prisma.player.findMany({ orderBy: { name: "asc" } }),
    ]);
    const rankedPlayerIds = new Set(prospects.map((p) => p.playerId));
    const unrankedPlayers = players.filter((p) => !rankedPlayerIds.has(p.id));
    return (<div>
      <h1 className="mb-6 font-display text-2xl">News &amp; Media Management</h1>

      <Panel title="Create Article">
        <form action={createArticle} encType="multipart/form-data" className="flex flex-col gap-3">
          <Field label="Title">
            <input name="title" required className={inputClass}/>
          </Field>
          <Field label="Body">
            <textarea name="body" required rows={4} className={inputClass}/>
          </Field>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" name="published" defaultChecked/>
              Published
            </label>
            <label className="flex items-center gap-2 text-xs">
              Hero image:
              <input type="file" name="heroImage" accept="image/*" className="text-xs"/>
            </label>
          </div>
          <div>
            <button type="submit" className={buttonClass}>
              Create Article
            </button>
          </div>
        </form>
      </Panel>

      <Panel title="Articles">
        {articles.length === 0 ? (<p className="text-sm opacity-60">No articles yet.</p>) : (articles.map((a) => <ArticleRow key={a.id} article={a}/>))}
      </Panel>

      <Panel title="Add Image / Video / Highlight">
        <form action={addMedia} encType="multipart/form-data" className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="File">
            <input type="file" name="file" required accept="image/*,video/*" className="text-xs"/>
          </Field>
          <Field label="Caption">
            <input name="caption" className={inputClass}/>
          </Field>
          <Field label="Attach to article">
            <select name="articleId" className={inputClass} defaultValue="">
              <option value="">None (standalone)</option>
              {articles.map((a) => (<option key={a.id} value={a.id}>
                  {a.title}
                </option>))}
            </select>
          </Field>
          <label className="flex items-end gap-2 pb-2 text-xs">
            <input type="checkbox" name="isHighlight"/>
            Mark as highlight
          </label>
          <div className="col-span-2 sm:col-span-4">
            <button type="submit" className={buttonClass}>
              Upload
            </button>
          </div>
        </form>
      </Panel>

      <Panel title="Media Library">
        {media.length === 0 ? (<p className="text-sm opacity-60">No media uploaded yet.</p>) : (<div className="flex flex-col gap-2">
            {media.map((m) => (<div key={m.id} className="flex items-center justify-between border-b border-ink/10 py-2 text-sm">
                <span className="truncate">
                  <span className="font-bold">{m.type}</span>
                  {m.isHighlight && <span className="ml-2 text-accent">HIGHLIGHT</span>}
                  {" — "}
                  {m.caption || m.url}
                  {m.article && <span className="opacity-55"> · {m.article.title}</span>}
                </span>
                <form action={deleteMedia}>
                  <input type="hidden" name="mediaId" value={m.id}/>
                  <button type="submit" className={`${buttonSecondaryClass} !text-[10px]`}>
                    Delete
                  </button>
                </form>
              </div>))}
          </div>)}
      </Panel>

      <Panel title="Top Prospects">
        <p className="mb-3 text-xs opacity-55">Use the arrows to reorder — no need to retype ranks.</p>
        <div className="mb-4 flex flex-col gap-2">
          {prospects.map((p, i) => {
            const moveUp = moveProspectRank.bind(null, p.id, "up");
            const moveDown = moveProspectRank.bind(null, p.id, "down");
            return (<div key={p.id} className="flex items-center gap-3 border-b border-ink/10 py-2 text-sm">
                <span className="w-6 flex-shrink-0 font-display text-base opacity-55">{p.rank}</span>
                <span className="flex-1">
                  {p.player.name}{" "}
                  <span className="opacity-55">
                    · {p.player.team?.name ?? "Free Agent"}
                  </span>
                </span>
                <div className="flex items-center gap-1">
                  <form action={moveUp}>
                    <button type="submit" disabled={i === 0} className={`${buttonSecondaryClass} !px-2 !py-1 !text-xs disabled:opacity-30`}>
                      ▲
                    </button>
                  </form>
                  <form action={moveDown}>
                    <button type="submit" disabled={i === prospects.length - 1} className={`${buttonSecondaryClass} !px-2 !py-1 !text-xs disabled:opacity-30`}>
                      ▼
                    </button>
                  </form>
                </div>
                <form action={removeProspect}>
                  <input type="hidden" name="prospectRankId" value={p.id}/>
                  <button type="submit" className={`${buttonSecondaryClass} !text-[10px]`}>
                    Remove
                  </button>
                </form>
              </div>);
        })}
          {prospects.length === 0 && <p className="text-sm opacity-60">No ranked prospects yet.</p>}
        </div>
        <form action={addProspect} className="flex items-end gap-3">
          <input type="hidden" name="rank" value={prospects.length + 1}/>
          <Field label="Add player to bottom of pipeline">
            <select name="playerId" required className={inputClass}>
              {unrankedPlayers.map((p) => (<option key={p.id} value={p.id}>
                  {p.name}
                </option>))}
            </select>
          </Field>
          <button type="submit" className={buttonClass}>
            Add to Pipeline
          </button>
        </form>
      </Panel>
    </div>);
}
