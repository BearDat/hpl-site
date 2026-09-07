import Link from "next/link";

export function NewsCard({ article }) {
  return (
    <div className="flex flex-col border-[3px] border-ink bg-surface">
      <div
        className="flex h-16 items-end p-4"
        style={{
          background: "repeating-linear-gradient(135deg, var(--color-accent) 0px 18px, var(--color-ink) 18px 36px)",
        }}
      >
        <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none">
          <rect x="4" y="4" width="16" height="16" transform="rotate(45 12 12)" fill="#f2f4fa" />
        </svg>
      </div>
      <div className="flex flex-1 flex-col py-5 px-[22px]">
        <div className="mb-2 text-[11px] font-extrabold tracking-wider text-accent">TOP STORY</div>
        {article ? (
          <>
            <Link href={`/news/${article.slug}`} className="font-display text-[21px] leading-tight hover:text-accent">
              {article.title.toUpperCase()}
            </Link>
            <p className="mt-3 line-clamp-4 text-sm opacity-70">{article.body}</p>
            <Link href={`/news/${article.slug}`} className="mt-auto pt-4 text-xs font-bold text-accent hover:underline">
              READ MORE &rarr;
            </Link>
          </>
        ) : (
          <div className="font-display text-[21px] leading-tight">NO STORIES PUBLISHED YET</div>
        )}
      </div>
    </div>
  );
}
