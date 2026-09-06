import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [teams, players, games, articles, admins, season] = await Promise.all([
    prisma.team.count(),
    prisma.player.count(),
    prisma.game.count(),
    prisma.newsArticle.count(),
    prisma.adminUser.count(),
    prisma.season.findFirst({ where: { isCurrent: true } }),
  ]);

  const stats = [
    { label: "Teams", value: teams, href: "/admin/teams" },
    { label: "Players", value: players, href: "/admin/roster" },
    { label: "Games", value: games, href: "/admin/schedule" },
    { label: "Articles", value: articles, href: "/admin/news" },
    { label: "Admins", value: admins, href: "/admin/admins" },
  ];

  return (
    <div>
      <h1 className="mb-2 font-display text-2xl">Admin</h1>
      <p className="mb-8 text-sm opacity-60">
        Current season: {season ? season.name : "none set — go to League Management"}
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="border-[3px] border-ink bg-white p-5 hover:bg-ink/5"
          >
            <div className="font-display text-3xl">{s.value}</div>
            <div className="mt-1 text-xs font-bold uppercase tracking-wide opacity-60">
              {s.label}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
