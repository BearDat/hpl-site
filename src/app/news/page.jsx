import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getAllNews } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const articles = await getAllNews();

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1 px-14 py-10">
        <h1 className="mb-8 font-display text-2xl">NEWS</h1>

        {articles.length === 0 ? (
          <p className="text-sm opacity-60">No stories published yet.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {articles.map((a) => (
              <Link key={a.id} href={`/news/${a.slug}`} className="block border-[3px] border-ink bg-surface p-6 hover:bg-ink/5">
                <div className="mb-1 text-xs font-extrabold tracking-wide text-accent">
                  {a.publishedAt.toLocaleDateString()}
                </div>
                <div className="mb-2 font-display text-xl">{a.title}</div>
                <p className="line-clamp-2 text-sm opacity-70">{a.body}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
