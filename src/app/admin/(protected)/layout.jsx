import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { getCurrentAdmin } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";

const SECTIONS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/schedule", label: "Schedule & Scores" },
  { href: "/admin/roster", label: "Roster" },
  { href: "/admin/teams", label: "Teams" },
  { href: "/admin/league", label: "League" },
  { href: "/admin/playoffs", label: "Playoffs" },
  { href: "/admin/awards", label: "Awards" },
  { href: "/admin/news", label: "News & Media" },
  { href: "/admin/admins", label: "Admins" },
];

export default async function AdminLayout({ children }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 flex-shrink-0 flex-col bg-brand text-on-brand">
        <Link href="/" className="flex items-center gap-2.5 border-b border-on-brand/15 p-5">
          <Logo className="h-7 w-auto" />
          <span className="font-display text-sm tracking-wide">ADMIN</span>
        </Link>
        <nav className="flex flex-col py-2">
          {SECTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="border-b border-on-brand/10 px-5 py-3 text-[13px] font-bold tracking-wide hover:bg-brand-soft"
            >
              {s.label.toUpperCase()}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex items-center justify-between gap-2 p-5">
          <span className="truncate text-[11px] font-semibold tracking-wide opacity-70">
            {admin.name}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="flex-shrink-0 text-[11px] font-bold tracking-wide opacity-70 hover:opacity-100"
            >
              LOG OUT
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 bg-paper p-10 text-ink">{children}</main>
    </div>
  );
}
