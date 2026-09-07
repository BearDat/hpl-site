export function NewsCard({ article }) {
    return (<div className="flex flex-col border-[3px] border-ink">
      <div className="flex flex-1 items-end p-4" style={{
            background: "repeating-linear-gradient(135deg, var(--color-accent) 0px 18px, var(--color-ink) 18px 36px)",
        }}>
        <svg viewBox="0 0 24 24" className="h-[26px] w-[26px]" fill="none">
          <rect x="4" y="4" width="16" height="16" transform="rotate(45 12 12)" fill="#f2f4fa"/>
        </svg>
      </div>
      <div className="py-5 px-[22px]">
        <div className="mb-2 text-[11px] font-extrabold tracking-wider text-accent">
          TOP STORY
        </div>
        <div className="font-display text-[21px] leading-tight">
          {article ? article.title.toUpperCase() : "NO STORIES PUBLISHED YET"}
        </div>
      </div>
    </div>);
}
