import Link from "next/link";

const LINKS = [
  { href: "/standings", label: "Standings" },
  { href: "/scores", label: "Scores" },
  { href: "/teams", label: "Teams" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/history", label: "History" },
];

export function Footer() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-4 border-t-[3px] border-ink px-14 py-6 text-xs font-semibold tracking-wider">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 flex-shrink-0" style={{ background: "var(--color-accent)" }} />
        <span className="opacity-70">&copy; HCBB Pathway</span>
      </div>
      <nav className="flex flex-wrap gap-6 opacity-70">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-accent hover:opacity-100">
            {link.label.toUpperCase()}
          </Link>
        ))}
      </nav>
      <div className="opacity-50">Sample data for preview</div>
    </footer>
  );
}
