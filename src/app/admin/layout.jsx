import Link from "next/link";
import { Logo } from "@/components/Logo";
const SECTIONS = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/schedule", label: "Schedule & Scores" },
    { href: "/admin/roster", label: "Roster" },
    { href: "/admin/teams", label: "Teams" },
    { href: "/admin/league", label: "League" },
    { href: "/admin/playoffs", label: "Playoffs" },
    { href: "/admin/news", label: "News & Media" },
    { href: "/admin/admins", label: "Admins" },
];
export default function AdminLayout({ children }) {
    return (<div className="flex min-h-screen">
      <aside className="flex w-60 flex-shrink-0 flex-col bg-ink text-paper">
        <Link href="/" className="flex items-center gap-2.5 border-b border-paper/15 p-5">
          <Logo className="h-7 w-auto"/>
          <span className="font-display text-sm tracking-wide">ADMIN</span>
        </Link>
        <nav className="flex flex-col py-2">
          {SECTIONS.map((s) => (<Link key={s.href} href={s.href} className="border-b border-paper/10 px-5 py-3 text-[13px] font-bold tracking-wide hover:bg-ink-soft">
              {s.label.toUpperCase()}
            </Link>))}
        </nav>
        <div className="mt-auto p-5 text-[10px] font-semibold tracking-wide opacity-50">
          Not password-protected yet.
        </div>
      </aside>
      <main className="flex-1 bg-paper p-10 text-ink">{children}</main>
    </div>);
}
