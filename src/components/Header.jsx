import Link from "next/link";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const NAV_GROUPS = [
    { label: "News", href: "/news" },
    {
        label: "League",
        links: [
            { href: "/standings", label: "Standings" },
            { href: "/scores", label: "Scores" },
            { href: "/playoffs", label: "Playoffs" },
            { href: "/leaders", label: "Leaders" },
        ],
    },
    {
        label: "Teams",
        links: [
            { href: "/teams", label: "Teams" },
            { href: "/pipeline", label: "Pipeline" },
            { href: "/compare", label: "Compare Players" },
        ],
    },
    {
        label: "More",
        links: [
            { href: "/awards", label: "Awards" },
            { href: "/graduates", label: "Graduates" },
            { href: "/history", label: "History" },
        ],
    },
];
const ALL_LINKS = NAV_GROUPS.flatMap((g) => (g.href ? [g] : g.links));

function DesktopNav() {
    return (<nav className="hidden items-center gap-1 text-[13px] font-bold tracking-wider lg:flex">
      {NAV_GROUPS.map((group) => group.href ? (<Link key={group.href} href={group.href} className="px-3 py-2 hover:opacity-65">
            {group.label.toUpperCase()}
          </Link>) : (<div key={group.label} className="group relative">
            <button type="button" className="flex items-center gap-1 px-3 py-2 hover:opacity-65">
              {group.label.toUpperCase()}
              <span className="text-[10px]">▾</span>
            </button>
            <div className="invisible absolute left-0 top-full z-20 flex min-w-40 flex-col border-2 border-ink bg-paper text-ink opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              {group.links.map((link) => (<Link key={link.href} href={link.href} className="px-4 py-2 text-xs hover:bg-ink/5 hover:text-accent">
                  {link.label.toUpperCase()}
                </Link>))}
            </div>
          </div>))}
    </nav>);
}

function MobileNav() {
    return (<details className="group relative lg:hidden">
      <summary className="flex h-8 w-8 cursor-pointer list-none items-center justify-center" aria-label="Open menu">
        <span className="flex flex-col gap-[4px]">
          <span className="block h-[2px] w-5 bg-on-brand"/>
          <span className="block h-[2px] w-5 bg-on-brand"/>
          <span className="block h-[2px] w-5 bg-on-brand"/>
        </span>
      </summary>
      <div className="absolute right-0 top-full z-30 mt-2 flex w-56 flex-col border-2 border-ink bg-paper text-ink shadow-lg">
        {ALL_LINKS.map((link) => (<Link key={link.href} href={link.href} className="border-b border-ink/10 px-4 py-2.5 text-xs font-bold tracking-wide last:border-b-0 hover:bg-ink/5 hover:text-accent">
            {link.label.toUpperCase()}
          </Link>))}
        <Link href="/admin" className="border-t border-ink/10 px-4 py-2.5 text-xs font-bold tracking-wide opacity-60 hover:opacity-100">
          ADMIN
        </Link>
      </div>
    </details>);
}

export function Header() {
    return (<header className="relative flex items-center justify-between gap-4 bg-brand px-4 py-[14px] text-on-brand sm:px-8 lg:px-14 lg:py-[18px]">
      <Link href="/" className="flex items-center gap-3 lg:gap-4">
        <Logo className="h-7 w-auto lg:h-9"/>
        <div className="font-display text-base leading-none tracking-wide lg:text-[22px]">
          HCBB PATHWAY
        </div>
      </Link>
      <div className="flex items-center gap-3 lg:gap-7">
        <DesktopNav/>
        <div className="hidden items-center gap-4 border-l border-on-brand/20 pl-5 lg:flex">
          <Link href="/admin" className="text-[11px] font-bold tracking-wider opacity-60 hover:opacity-100">
            ADMIN
          </Link>
          <ThemeToggle/>
        </div>
        <ThemeToggle className="lg:hidden"/>
        <MobileNav/>
      </div>
    </header>);
}
