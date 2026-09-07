import Link from "next/link";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
const NAV_LINKS = [
    { href: "/news", label: "News" },
    { href: "/standings", label: "Standings" },
    { href: "/scores", label: "Scores" },
    { href: "/playoffs", label: "Playoffs" },
    { href: "/leaders", label: "Leaders" },
    { href: "/pipeline", label: "Pipeline" },
    { href: "/teams", label: "Teams" },
    { href: "/history", label: "History" },
];
export function Header() {
    return (<header className="flex flex-wrap items-center justify-between gap-4 bg-brand px-14 py-[18px] text-on-brand">
      <Link href="/" className="flex items-center gap-4">
        <Logo className="h-9 w-auto"/>
        <div className="font-display text-[22px] leading-none tracking-wide">
          HCBB PATHWAY
        </div>
      </Link>
      <div className="flex items-center gap-7">
        <nav className="flex flex-wrap gap-6 text-[13px] font-bold tracking-wider">
          {NAV_LINKS.map((link) => (<Link key={link.href} href={link.href} className="hover:opacity-65">
              {link.label.toUpperCase()}
            </Link>))}
        </nav>
        <div className="flex items-center gap-4 border-l border-on-brand/20 pl-5">
          <Link href="/admin" className="text-[11px] font-bold tracking-wider opacity-60 hover:opacity-100">
            ADMIN
          </Link>
          <ThemeToggle/>
        </div>
      </div>
    </header>);
}
