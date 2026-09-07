import { PrismaClient, GameStatus, TransactionType } from "@prisma/client";
import { slugify } from "../src/lib/slugify";

const prisma = new PrismaClient();

const TEAMS = [
  { name: "Redhawks", shortCode: "RHK", primaryColor: "#c1391f", division: "East" },
  { name: "Ironclads", shortCode: "IC", primaryColor: "#1f3a5f", division: "East" },
  { name: "Suncats", shortCode: "SUN", primaryColor: "#2f6f4e", division: "East" },
  { name: "Timberwolves", shortCode: "TW", primaryColor: "#d9a441", division: "East" },
  { name: "Harbor Kings", shortCode: "HK", primaryColor: "#1f8a8a", division: "West" },
  { name: "Copper Vipers", shortCode: "CV", primaryColor: "#6b3fa0", division: "West" },
  { name: "Ridgeline Wardens", shortCode: "RW", primaryColor: "#5b6b73", division: "West" },
  { name: "Stone Foxes", shortCode: "SF", primaryColor: "#c97a2b", division: "West" },
] as const;

const PLAYERS = [
  { name: "J. Ortiz", position: "OF", team: "RHK" },
  { name: "M. Sato", position: "3B", team: "SUN" },
  { name: "D. Brooks", position: "RHP", team: "IC" },
  { name: "K. Alvarez", position: "SS", team: "HK" },
  { name: "T. Whitfield", position: "LHP", team: "TW" },
  { name: "R. Nakamura", position: "C", team: "SF" },
  { name: "A. Delgado", position: "OF", team: "RHK" },
  { name: "L. Fischer", position: "2B", team: "IC" },
  { name: "C. Reyes", position: "RHP", team: "SUN" },
  { name: "B. Holt", position: "1B", team: "TW" },
] as const;

// [rank, previousRank | null]
const PROSPECT_RANKS: Record<string, [number, number | null]> = {
  "J. Ortiz": [1, 3],
  "M. Sato": [2, 2],
  "D. Brooks": [3, 4],
  "K. Alvarez": [4, 3],
  "T. Whitfield": [5, 9],
  "R. Nakamura": [6, 6],
  "A. Delgado": [7, 5],
  "L. Fischer": [8, 11],
  "C. Reyes": [9, null],
  "B. Holt": [10, 9],
};

async function main() {
  await prisma.adminUser.upsert({
    where: { email: "cdowns.cd15@gmail.com" },
    update: {},
    create: {
      name: "DatBear",
      email: "cdowns.cd15@gmail.com",
      role: "OWNER",
    },
  });

  const teamByCode = new Map<string, string>();
  for (const t of TEAMS) {
    const team = await prisma.team.upsert({
      where: { shortCode: t.shortCode },
      update: { name: t.name, primaryColor: t.primaryColor },
      create: {
        name: t.name,
        shortCode: t.shortCode,
        primaryColor: t.primaryColor,
      },
    });
    teamByCode.set(t.shortCode, team.id);
  }

  const season = await prisma.season.upsert({
    where: { id: "seed-season-2026" },
    update: {},
    create: {
      id: "seed-season-2026",
      name: "2026 Season",
      isCurrent: true,
      playoffTeamCount: 4,
      playoffSeriesLengths: [3, 5, 7],
      playoffReseed: true,
    },
  });

  const divisionByName = new Map<string, string>();
  for (const [i, name] of ["East", "West"].entries()) {
    const division = await prisma.division.upsert({
      where: { seasonId_name: { seasonId: season.id, name } },
      update: {},
      create: { name, order: i, seasonId: season.id },
    });
    divisionByName.set(name, division.id);
  }

  for (const t of TEAMS) {
    const teamId = teamByCode.get(t.shortCode)!;
    const divisionId = divisionByName.get(t.division)!;
    await prisma.seasonTeam.upsert({
      where: { seasonId_teamId: { seasonId: season.id, teamId } },
      update: { divisionId },
      create: { seasonId: season.id, teamId, divisionId },
    });
  }

  const playerByName = new Map<string, string>();
  for (const p of PLAYERS) {
    const teamId = teamByCode.get(p.team)!;
    const existing = await prisma.player.findFirst({
      where: { name: p.name, teamId },
    });
    const slug = slugify(p.name);
    const player =
      existing ??
      (await prisma.player.create({
        data: { name: p.name, slug, position: p.position, teamId, status: "ACTIVE" },
      }));
    if (existing && !existing.slug) {
      await prisma.player.update({ where: { id: existing.id }, data: { slug } });
    }
    playerByName.set(p.name, player.id);
  }

  for (const [name, [rank, previousRank]] of Object.entries(PROSPECT_RANKS)) {
    const playerId = playerByName.get(name)!;
    await prisma.prospectRank.upsert({
      where: { playerId },
      update: { rank, previousRank },
      create: { playerId, rank, previousRank },
    });
  }

  const stats: [string, Partial<{ battingAvg: number; homeRuns: number; rbi: number; era: number; stolenBases: number }>][] = [
    ["J. Ortiz", { battingAvg: 0.412 }],
    ["M. Sato", { homeRuns: 18 }],
    ["K. Alvarez", { rbi: 42 }],
    ["D. Brooks", { era: 1.98 }],
    ["A. Delgado", { stolenBases: 22 }],
  ];
  for (const [name, data] of stats) {
    const playerId = playerByName.get(name)!;
    await prisma.playerSeasonStat.upsert({
      where: { playerId_seasonId: { playerId, seasonId: season.id } },
      update: data,
      create: { playerId, seasonId: season.id, ...data },
    });
  }

  const code = (c: string) => teamByCode.get(c)!;
  const games: {
    round: string;
    scheduledTime?: string;
    locationCode?: string;
    home: string;
    away: string;
    status: GameStatus;
    homeScore?: number;
    awayScore?: number;
    innings?: number;
  }[] = [
    { round: "R5", locationCode: "LS1", home: "SF", away: "RHK", status: "FINAL", homeScore: 2, awayScore: 8 },
    { round: "R5", locationCode: "LS2", home: "IC", away: "SUN", status: "FINAL", homeScore: 4, awayScore: 3 },
    { round: "R5", locationCode: "LS3", home: "HK", away: "CV", status: "FINAL", homeScore: 6, awayScore: 1 },
    { round: "R5", locationCode: "LS4", home: "RW", away: "TW", status: "FINAL", homeScore: 3, awayScore: 5 },
    { round: "R6", locationCode: "LS1", home: "RHK", away: "IC", status: "FINAL", homeScore: 5, awayScore: 4 },
    { round: "R6", locationCode: "LS2", home: "SUN", away: "TW", status: "FINAL", homeScore: 6, awayScore: 2 },
    { round: "R6", locationCode: "LS3", home: "CV", away: "SF", status: "FINAL", homeScore: 7, awayScore: 0 },
    { round: "R6", locationCode: "LS4", home: "RW", away: "HK", status: "FORFEIT", homeScore: 0, awayScore: 9 },
    { round: "R7", scheduledTime: "3:00 PM", locationCode: "LS1", home: "SF", away: "RHK", status: "FINAL", homeScore: 3, awayScore: 6 },
    { round: "R7", scheduledTime: "3:00 PM", locationCode: "LS2", home: "HK", away: "SUN", status: "FINAL", homeScore: 5, awayScore: 5, innings: 10 },
    { round: "R7", scheduledTime: "3:00 PM", locationCode: "LS3", home: "RW", away: "CV", status: "LIVE", homeScore: 2, awayScore: 4 },
    { round: "R7", scheduledTime: "3:00 PM", locationCode: "LS4", home: "IC", away: "TW", status: "FINAL", homeScore: 2, awayScore: 7 },
    { round: "R8", scheduledTime: "7:05 PM EST", locationCode: "LS1", home: "IC", away: "RHK", status: "SCHEDULED" },
    { round: "R8", scheduledTime: "2:00 PM EST", locationCode: "LS2", home: "SF", away: "SUN", status: "SCHEDULED" },
  ];

  for (const g of games) {
    const homeTeamId = code(g.home);
    const awayTeamId = code(g.away);
    const existing = await prisma.game.findFirst({
      where: { seasonId: season.id, round: g.round, homeTeamId, awayTeamId },
    });
    if (existing) continue;
    await prisma.game.create({
      data: {
        seasonId: season.id,
        round: g.round,
        scheduledTime: g.scheduledTime,
        locationCode: g.locationCode,
        homeTeamId,
        awayTeamId,
        status: g.status,
        homeScore: g.homeScore,
        awayScore: g.awayScore,
        innings: g.innings,
        forfeitWinnerId: g.status === "FORFEIT" ? awayTeamId : undefined,
      },
    });
  }

  const existingArticle = await prisma.newsArticle.findUnique({
    where: { slug: "ortiz-player-of-the-week" },
  });
  if (!existingArticle) {
    const now = Date.now();
    await prisma.newsArticle.create({
      data: {
        title: "All-Star Rosters Set for September Showcase",
        slug: "all-star-rosters-set",
        body: "Rosters for the league's September All-Star Showcase were announced today, featuring top vote-getters from both divisions.",
        published: true,
        publishedAt: new Date(now - 2 * 86_400_000),
      },
    });
    await prisma.newsArticle.create({
      data: {
        title: "Top Prospect Whitfield Recalled to Ironvale Roster",
        slug: "whitfield-recalled",
        body: "Timberwolves left-hander T. Whitfield has been added to the active roster ahead of this week's series.",
        published: true,
        publishedAt: new Date(now - 86_400_000),
      },
    });
    await prisma.newsArticle.create({
      data: {
        title: "Ortiz Named Player of the Week After .500 Series",
        slug: "ortiz-player-of-the-week",
        body: "The Redhawks outfielder collected nine hits over four games, boosting his league-leading average to .412.",
        published: true,
        publishedAt: new Date(now),
      },
    });
  }

  const transactionCount = await prisma.transaction.count();
  if (transactionCount === 0) {
    await prisma.transaction.create({
      data: {
        type: TransactionType.SIGNING,
        notes: "Seed data: initial roster signing.",
        assets: {
          create: PLAYERS.map((p) => ({
            playerId: playerByName.get(p.name)!,
            toTeamId: teamByCode.get(p.team)!,
          })),
        },
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
