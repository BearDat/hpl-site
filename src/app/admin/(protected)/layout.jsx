import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { getCurrentAdmin } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";

const GROUPS = [
  { label: null, items: [{ href: "/admin", label: "Dashboard" }] },
  {
    label: "Competition",
    items: [
      { href: "/admin/schedule", label: "Schedule & Scores" },
      { href: "/admin/playoffs", label: "Playoffs" },
      { href: "/admin/league", label: "League" },
    ],
  },
  {
    label: "Roster",
    items: [
      { href: "/admin/roster", label: "Roster" },
      { href: "/admin/teams", label: "Teams" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/news", label: "News & Media" },
      { href: "/admin/awards", label: "Awards" },
    ],
  },
  { label: "Settings", items: [{ href: "/admin/admins", label: "Admins" }] },
];
function NavLinks() {
  return (
    <nav className="flex flex-col py-1">
      {GROUPS.map((group, i) => (
        <div key={group.label ?? `top-${i}`} className="border-b border-on-brand/10 py-1">
          {group.label && (
            <div className="px-4 pt-1 text-[9px] font-extrabold tracking-wide opacity-45">
              {group.label.toUpperCase()}
            </div>
          )}
          {group.items.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="block px-4 py-2 text-[12px] font-bold tracking-wide hover:bg-brand-soft"
            >
              {s.label.toUpperCase()}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}

export default async function AdminLayout({ children }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <header className="flex items-center justify-between gap-3 border-b border-on-brand/15 bg-brand p-3 text-on-brand lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-6 w-auto" />
          <span className="font-display text-xs tracking-wide">ADMIN</span>
        </Link>
        <details className="group relative">
          <summary className="flex h-8 w-8 cursor-pointer list-none items-center justify-center" aria-label="Open menu">
            <span className="flex flex-col gap-[4px]">
              <span className="block h-[2px] w-5 bg-on-brand" />
              <span className="block h-[2px] w-5 bg-on-brand" />
              <span className="block h-[2px] w-5 bg-on-brand" />
            </span>
          </summary>
          <div className="absolute right-0 top-full z-30 mt-2 w-56 border-2 border-on-brand/20 bg-brand shadow-lg">
            <NavLinks />
            <form action={logout} className="p-3">
              <button type="submit" className="text-[11px] font-bold tracking-wide opacity-70 hover:opacity-100">
                LOG OUT ({admin.name})
              </button>
            </form>
          </div>
        </details>
      </header>

      <aside className="hidden w-48 flex-shrink-0 flex-col bg-brand text-on-brand lg:flex">
        <Link href="/" className="flex items-center gap-2 border-b border-on-brand/15 p-4">
          <Logo className="h-6 w-auto" />
          <span className="font-display text-xs tracking-wide">ADMIN</span>
        </Link>
        <NavLinks />
        <div className="mt-auto flex items-center justify-between gap-2 p-4">
          <span className="truncate text-[10px] font-semibold tracking-wide opacity-70">
            {admin.name}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="flex-shrink-0 text-[10px] font-bold tracking-wide opacity-70 hover:opacity-100"
            >
              LOG OUT
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 bg-paper p-3 text-ink sm:p-6">{children}</main>
    </div>
  );
}
