import Link from "next/link";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { href: "/news", label: "News" },
  { href: "/standings", label: "Standings" },
  { href: "/scores", label: "Scores" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/teams", label: "Teams" },
];

export function Header() {
  return (
    <header className="flex items-center justify-between bg-ink px-14 py-[18px] text-paper">
      <Link href="/" className="flex items-center gap-4">
        <Logo className="h-[38px] w-[46px]" />
        <div>
          <div className="font-display text-[22px] leading-none tracking-wide">
            HCBB PATHWAY
          </div>
          <div className="mt-1 text-[10px] font-bold tracking-[0.16em] opacity-60">
            THE PATHWAY PROGRAM &middot; EAST &amp; WEST DIVISIONS
          </div>
        </div>
      </Link>
      <nav className="flex gap-8 text-[13px] font-bold tracking-wider">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="hover:opacity-65">
            {link.label.toUpperCase()}
          </Link>
        ))}
      </nav>
    </header>
  );
}
