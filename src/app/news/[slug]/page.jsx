import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ArticlePage(props) {
  const { slug } = await props.params;
  const article = await prisma.newsArticle.findUnique({
    where: { slug },
    include: { media: true },
  });
  if (!article || !article.published) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1 px-14 py-10">
        <div className="mx-auto max-w-2xl">
          <div className="mb-2 text-xs font-extrabold tracking-wide text-accent">
            {article.publishedAt.toLocaleDateString()}
          </div>
          <h1 className="mb-6 font-display text-3xl leading-tight">{article.title}</h1>
          {article.heroImageUrl && (
            // Arbitrary user-uploaded dimensions; skip the built-in image optimizer.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={article.heroImageUrl} alt="" className="mb-6 w-full border-[3px] border-ink object-cover" />
          )}
          <p className="whitespace-pre-line text-base leading-relaxed opacity-85">{article.body}</p>

          {article.media.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {article.media.map((m) => (
                <div key={m.id} className="border-[3px] border-ink">
                  {m.type === "IMAGE" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.url} alt={m.caption ?? ""} className="aspect-square w-full object-cover" />
                  ) : (
                    <video src={m.url} controls className="aspect-square w-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
