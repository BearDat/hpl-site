import { prisma } from "./prisma";
import type { Game, Team } from "@prisma/client";

export async function getCurrentSeason() {
  const season = await prisma.season.findFirst({ where: { isCurrent: true } });
  return season;
}

export type StandingsTeam = {
  id: string;
  name: string;
  shortCode: string;
  primaryColor: string;
  logoUrl: string | null;
  wins: number;
  losses: number;
  gamesBack: string;
};

export type StandingsDivision = {
  name: string;
  teams: StandingsTeam[];
};

function decideWinner(game: Game): "home" | "away" | null {
  if (game.status === "FORFEIT") {
    if (!game.forfeitWinnerId) return null;
    return game.forfeitWinnerId === game.homeTeamId ? "home" : "away";
  }
  if (game.status === "FINAL") {
    if (game.homeScore == null || game.awayScore == null) return null;
    if (game.homeScore === game.awayScore) return null;
    return game.homeScore > game.awayScore ? "home" : "away";
  }
  return null;
}

export async function getStandings(seasonId: string): Promise<StandingsDivision[]> {
  const [divisions, seasonTeams, games] = await Promise.all([
    prisma.division.findMany({ where: { seasonId }, orderBy: { order: "asc" } }),
    prisma.seasonTeam.findMany({
      where: { seasonId },
      include: { team: true },
    }),
    prisma.game.findMany({ where: { seasonId } }),
  ]);

  const record = new Map<string, { wins: number; losses: number }>();
  for (const st of seasonTeams) record.set(st.teamId, { wins: 0, losses: 0 });

  for (const game of games) {
    const winner = decideWinner(game);
    if (!winner) continue;
    const winnerId = winner === "home" ? game.homeTeamId : game.awayTeamId;
    const loserId = winner === "home" ? game.awayTeamId : game.homeTeamId;
    if (record.has(winnerId)) record.get(winnerId)!.wins += 1;
    if (record.has(loserId)) record.get(loserId)!.losses += 1;
  }

  return divisions.map((division) => {
    const teams = seasonTeams
      .filter((st) => st.divisionId === division.id)
      .map((st) => {
        const rec = record.get(st.teamId) ?? { wins: 0, losses: 0 };
        return { team: st.team, ...rec };
      })
      .sort((a, b) => b.wins - a.wins || a.losses - b.losses);

    const leader = teams[0];
    return {
      name: division.name,
      teams: teams.map((t) => ({
        id: t.team.id,
        name: t.team.name,
        shortCode: t.team.shortCode,
        primaryColor: t.team.primaryColor,
        logoUrl: t.team.logoUrl,
        wins: t.wins,
        losses: t.losses,
        gamesBack: leader
          ? t.team.id === leader.team.id
            ? "—"
            : (((leader.wins - t.wins) + (t.losses - leader.losses)) / 2).toString()
          : "—",
      })),
    };
  });
}

export type ScoreboardGame = {
  id: string;
  status: string;
  statusLabel: string;
  away: { code: string; color: string; logoUrl: string | null; runs: number | null };
  home: { code: string; color: string; logoUrl: string | null; runs: number | null };
};

function statusLabel(game: Game): string {
  switch (game.status) {
    case "FINAL":
      return game.innings && game.innings !== 9 ? `FINAL/${game.innings}` : "FINAL";
    case "FORFEIT":
      return "FORFEIT";
    case "LIVE":
      return "LIVE";
    case "POSTPONED":
      return "POSTPONED";
    default:
      return game.scheduledTime ?? "SCHEDULED";
  }
}

export async function getScoreboardGames(seasonId: string, limit = 6): Promise<ScoreboardGame[]> {
  const games = await prisma.game.findMany({
    where: { seasonId },
    include: { homeTeam: true, awayTeam: true },
    orderBy: [{ round: "desc" }, { createdAt: "asc" }],
    take: limit,
  });
  return games
    .reverse()
    .map((g) => ({
      id: g.id,
      status: g.status,
      statusLabel: statusLabel(g),
      away: {
        code: g.awayTeam.shortCode,
        color: g.awayTeam.primaryColor,
        logoUrl: g.awayTeam.logoUrl,
        runs: g.awayScore,
      },
      home: {
        code: g.homeTeam.shortCode,
        color: g.homeTeam.primaryColor,
        logoUrl: g.homeTeam.logoUrl,
        runs: g.homeScore,
      },
    }));
}

export async function getPipelineTop(n = 5) {
  const ranks = await prisma.prospectRank.findMany({
    orderBy: { rank: "asc" },
    take: n,
    include: { player: { include: { team: true } } },
  });
  return ranks.map((r) => ({
    rank: r.rank,
    name: r.player.name,
    team: r.player.team?.name ?? "Free Agent",
    color: r.player.team?.primaryColor ?? "#8b93ac",
    initials: r.player.name
      .split(" ")
      .map((p) => p.replace(".", "")[0])
      .join("")
      .toUpperCase()
      .slice(0, 2),
    movement:
      r.previousRank == null
        ? ({ direction: "up", value: undefined, isNew: true } as const)
        : r.previousRank === r.rank
          ? ({ direction: "flat" } as const)
          : r.previousRank > r.rank
            ? ({ direction: "up", value: r.previousRank - r.rank } as const)
            : ({ direction: "down", value: r.rank - r.previousRank } as const),
  }));
}

export async function getStatLeaders(seasonId: string) {
  const stats = await prisma.playerSeasonStat.findMany({
    where: { seasonId },
    include: { player: { include: { team: true } } },
  });

  type StatKey = "battingAvg" | "homeRuns" | "rbi" | "era" | "stolenBases";
  const categories: {
    key: StatKey;
    label: string;
    better: "higher" | "lower";
    format: (v: number) => string;
  }[] = [
    { key: "battingAvg", label: "AVG", better: "higher", format: (v) => v.toFixed(3).replace(/^0/, "") },
    { key: "homeRuns", label: "HR", better: "higher", format: (v) => String(v) },
    { key: "rbi", label: "RBI", better: "higher", format: (v) => String(v) },
    { key: "era", label: "ERA", better: "lower", format: (v) => v.toFixed(2) },
    { key: "stolenBases", label: "SB", better: "higher", format: (v) => String(v) },
  ];

  return categories
    .map((cat) => {
      const withStat = stats.filter((s) => typeof s[cat.key] === "number");
      if (withStat.length === 0) return null;
      const leader = withStat.reduce((best, cur) => {
        const bestValue = best[cat.key] as number;
        const curValue = cur[cat.key] as number;
        return cat.better === "higher"
          ? curValue > bestValue ? cur : best
          : curValue < bestValue ? cur : best;
      });
      return {
        label: cat.label,
        value: cat.format(leader[cat.key] as number),
        player: leader.player.name,
        team: leader.player.team?.shortCode ?? "FA",
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

export async function getFeaturedNews() {
  const articles = await prisma.newsArticle.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });
  const [top, ...secondary] = articles;
  return { top, secondary };
}

export type { Team };
