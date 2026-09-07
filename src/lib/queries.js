import { prisma } from "./prisma";
export async function getCurrentSeason() {
    const season = await prisma.season.findFirst({ where: { isCurrent: true } });
    return season;
}
function decideWinner(game) {
    if (game.status === "FORFEIT") {
        if (!game.forfeitWinnerId)
            return null;
        return game.forfeitWinnerId === game.homeTeamId ? "home" : "away";
    }
    if (game.status === "FINAL") {
        if (game.homeScore == null || game.awayScore == null)
            return null;
        if (game.homeScore === game.awayScore)
            return null;
        return game.homeScore > game.awayScore ? "home" : "away";
    }
    return null;
}
function emptyAgg() {
    return {
        wins: 0,
        losses: 0,
        runsFor: 0,
        runsAgainst: 0,
        homeWins: 0,
        homeLosses: 0,
        awayWins: 0,
        awayLosses: 0,
        recentResults: [],
    };
}
export async function getStandings(seasonId) {
    const [season, divisions, seasonTeams, games] = await Promise.all([
        prisma.season.findUniqueOrThrow({ where: { id: seasonId } }),
        prisma.division.findMany({ where: { seasonId }, orderBy: { order: "asc" } }),
        prisma.seasonTeam.findMany({
            where: { seasonId },
            include: { team: true },
        }),
        // Regular-season standings exclude playoff games — those are tracked
        // separately on the PlayoffSeries records.
        prisma.game.findMany({
            where: { seasonId, playoffSeriesId: null },
            orderBy: { createdAt: "asc" },
        }),
    ]);
    const remaining = new Map();
    for (const st of seasonTeams)
        remaining.set(st.teamId, 0);
    for (const game of games) {
        if (game.status !== "SCHEDULED" && game.status !== "LIVE")
            continue;
        if (remaining.has(game.homeTeamId))
            remaining.set(game.homeTeamId, remaining.get(game.homeTeamId) + 1);
        if (remaining.has(game.awayTeamId))
            remaining.set(game.awayTeamId, remaining.get(game.awayTeamId) + 1);
    }
    const agg = new Map();
    for (const st of seasonTeams)
        agg.set(st.teamId, emptyAgg());
    for (const game of games) {
        const winner = decideWinner(game);
        if (!winner)
            continue;
        const homeRuns = game.homeScore ?? 0;
        const awayRuns = game.awayScore ?? 0;
        const homeAgg = agg.get(game.homeTeamId);
        if (homeAgg) {
            homeAgg.runsFor += homeRuns;
            homeAgg.runsAgainst += awayRuns;
            if (winner === "home") {
                homeAgg.wins += 1;
                homeAgg.homeWins += 1;
                homeAgg.recentResults.push("W");
            }
            else {
                homeAgg.losses += 1;
                homeAgg.homeLosses += 1;
                homeAgg.recentResults.push("L");
            }
        }
        const awayAgg = agg.get(game.awayTeamId);
        if (awayAgg) {
            awayAgg.runsFor += awayRuns;
            awayAgg.runsAgainst += homeRuns;
            if (winner === "away") {
                awayAgg.wins += 1;
                awayAgg.awayWins += 1;
                awayAgg.recentResults.push("W");
            }
            else {
                awayAgg.losses += 1;
                awayAgg.awayLosses += 1;
                awayAgg.recentResults.push("L");
            }
        }
    }
    function streakFor(results) {
        if (results.length === 0)
            return "—";
        const last = results[results.length - 1];
        let count = 0;
        for (let i = results.length - 1; i >= 0 && results[i] === last; i--)
            count += 1;
        return `${last}${count}`;
    }
    function last10For(results) {
        const recent = results.slice(-10);
        if (recent.length === 0)
            return "—";
        const wins = recent.filter((r) => r === "W").length;
        return `${wins}-${recent.length - wins}`;
    }
    // Playoff qualification is a single league-wide pool of the top
    // `playoffTeamCount` teams by wins, not per division (see
    // generateFirstRound in actions/playoffs.js) — so clinch/elimination
    // status is computed across every team in the season, not per division.
    const pool = seasonTeams.map((st) => {
        const rec = agg.get(st.teamId) ?? emptyAgg();
        const maxWins = rec.wins + (remaining.get(st.teamId) ?? 0);
        return { teamId: st.teamId, wins: rec.wins, maxWins };
    });
    const clinchStatus = new Map();
    for (const t of pool) {
        const couldPassCount = pool.filter((o) => o.teamId !== t.teamId && o.maxWins > t.wins).length;
        const alreadyAheadCount = pool.filter((o) => o.teamId !== t.teamId && o.wins >= t.maxWins).length;
        const clinched = couldPassCount < season.playoffTeamCount;
        const eliminated = alreadyAheadCount >= season.playoffTeamCount;
        clinchStatus.set(t.teamId, { clinched: clinched && !eliminated, eliminated });
    }
    return divisions.map((division) => {
        const teams = seasonTeams
            .filter((st) => st.divisionId === division.id)
            .map((st) => {
            const rec = agg.get(st.teamId) ?? emptyAgg();
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
                runsFor: t.runsFor,
                runsAgainst: t.runsAgainst,
                homeRecord: `${t.homeWins}-${t.homeLosses}`,
                awayRecord: `${t.awayWins}-${t.awayLosses}`,
                last10: last10For(t.recentResults),
                streak: streakFor(t.recentResults),
                clinched: clinchStatus.get(t.team.id)?.clinched ?? false,
                eliminated: clinchStatus.get(t.team.id)?.eliminated ?? false,
            })),
        };
    });
}
function statusLabel(game) {
    switch (game.status) {
        case "FINAL":
            return game.innings && game.innings !== 9 ? `FINAL/${game.innings}` : "FINAL";
        case "FORFEIT":
            return "FORFEIT";
        case "POSTPONED":
            return "POSTPONED";
        default:
            return game.scheduledTime ?? "SCHEDULED";
    }
}
function toScoreboardGame(g) {
    return {
        id: g.id,
        round: g.round,
        status: g.status,
        statusLabel: statusLabel(g),
        away: {
            code: g.awayTeam.shortCode,
            name: g.awayTeam.name,
            color: g.awayTeam.primaryColor,
            logoUrl: g.awayTeam.logoUrl,
            runs: g.awayScore,
        },
        home: {
            code: g.homeTeam.shortCode,
            name: g.homeTeam.name,
            color: g.homeTeam.primaryColor,
            logoUrl: g.homeTeam.logoUrl,
            runs: g.homeScore,
        },
    };
}
export async function getScoreboardGames(seasonId, limit = 6) {
    const games = await prisma.game.findMany({
        where: { seasonId, playoffSeriesId: null },
        include: { homeTeam: true, awayTeam: true },
        orderBy: [{ round: "desc" }, { createdAt: "asc" }],
        take: limit,
    });
    return games.reverse().map(toScoreboardGame);
}
export async function getAllScores(seasonId) {
    const games = await prisma.game.findMany({
        where: { seasonId, playoffSeriesId: null },
        include: { homeTeam: true, awayTeam: true },
        orderBy: [{ round: "asc" }, { createdAt: "asc" }],
    });
    const rounds = new Map();
    for (const g of games) {
        if (!rounds.has(g.round))
            rounds.set(g.round, []);
        rounds.get(g.round).push(toScoreboardGame(g));
    }
    return Array.from(rounds.entries()).map(([round, roundGames]) => ({ round, games: roundGames }));
}
export async function getPipelineTop(n = 5) {
    const ranks = await prisma.prospectRank.findMany({
        orderBy: { rank: "asc" },
        take: n,
        include: { player: { include: { team: true } } },
    });
    return ranks.map((r) => ({
        rank: r.rank,
        slug: r.player.slug,
        name: r.player.name,
        team: r.player.team?.name ?? "Free Agent",
        color: r.player.team?.primaryColor ?? "#8b93ac",
        initials: r.player.name
            .split(" ")
            .map((p) => p.replace(".", "")[0])
            .join("")
            .toUpperCase()
            .slice(0, 2),
        movement: r.previousRank == null
            ? { direction: "up", value: undefined, isNew: true }
            : r.previousRank === r.rank
                ? { direction: "flat" }
                : r.previousRank > r.rank
                    ? { direction: "up", value: r.previousRank - r.rank }
                    : { direction: "down", value: r.rank - r.previousRank },
    }));
}
const STAT_CATEGORIES = [
    { key: "battingAvg", label: "AVG", better: "higher", format: (v) => v.toFixed(3).replace(/^0/, "") },
    { key: "homeRuns", label: "HR", better: "higher", format: (v) => String(v) },
    { key: "rbi", label: "RBI", better: "higher", format: (v) => String(v) },
    { key: "era", label: "ERA", better: "lower", format: (v) => v.toFixed(2) },
    { key: "stolenBases", label: "SB", better: "higher", format: (v) => String(v) },
];
export async function getStatLeaders(seasonId) {
    const stats = await prisma.playerSeasonStat.findMany({
        where: { seasonId, isPlayoffs: false },
        include: { player: { include: { team: true } } },
    });
    return STAT_CATEGORIES
        .map((cat) => {
        const withStat = stats.filter((s) => typeof s[cat.key] === "number");
        if (withStat.length === 0)
            return null;
        const leader = withStat.reduce((best, cur) => {
            const bestValue = best[cat.key];
            const curValue = cur[cat.key];
            return cat.better === "higher"
                ? curValue > bestValue ? cur : best
                : curValue < bestValue ? cur : best;
        });
        return {
            label: cat.label,
            value: cat.format(leader[cat.key]),
            player: leader.player.name,
            playerSlug: leader.player.slug,
            team: leader.player.team?.shortCode ?? "FA",
        };
    })
        .filter((x) => x !== null);
}
export async function getFullStatLeaders(seasonId, n = 10) {
    const stats = await prisma.playerSeasonStat.findMany({
        where: { seasonId, isPlayoffs: false },
        include: { player: { include: { team: true } } },
    });
    return STAT_CATEGORIES.map((cat) => {
        const withStat = stats
            .filter((s) => typeof s[cat.key] === "number")
            .sort((a, b) => cat.better === "higher" ? b[cat.key] - a[cat.key] : a[cat.key] - b[cat.key])
            .slice(0, n);
        return {
            key: cat.key,
            label: cat.label,
            entries: withStat.map((s) => ({
                value: cat.format(s[cat.key]),
                player: s.player.name,
                playerSlug: s.player.slug,
                team: s.player.team?.shortCode ?? "FA",
            })),
        };
    }).filter((cat) => cat.entries.length > 0);
}
export async function hasPlayoffsStarted(seasonId) {
    const count = await prisma.playoffSeries.count({ where: { seasonId } });
    return count > 0;
}
export async function getPlayoffBracket(seasonId) {
    const series = await prisma.playoffSeries.findMany({
        where: { seasonId },
        orderBy: [{ round: "asc" }, { order: "asc" }],
        include: { teamA: true, teamB: true },
    });
    const rounds = new Map();
    for (const s of series) {
        if (!rounds.has(s.round))
            rounds.set(s.round, []);
        rounds.get(s.round).push(s);
    }
    return Array.from(rounds.entries()).map(([round, roundSeries]) => ({
        round,
        name: roundSeries[0]?.roundName ?? `Round ${round}`,
        series: roundSeries.map((s) => ({
            id: s.id,
            order: s.order,
            bestOf: s.bestOf,
            teamAWins: s.teamAWins,
            teamBWins: s.teamBWins,
            winnerId: s.winnerId,
            teamA: s.teamA
                ? {
                    id: s.teamA.id,
                    name: s.teamA.name,
                    shortCode: s.teamA.shortCode,
                    primaryColor: s.teamA.primaryColor,
                    logoUrl: s.teamA.logoUrl,
                    seed: s.teamASeed,
                }
                : null,
            teamB: s.teamB
                ? {
                    id: s.teamB.id,
                    name: s.teamB.name,
                    shortCode: s.teamB.shortCode,
                    primaryColor: s.teamB.primaryColor,
                    logoUrl: s.teamB.logoUrl,
                    seed: s.teamBSeed,
                }
                : null,
        })),
    }));
}
function sumField(rows, key) {
    const withValue = rows.filter((r) => r[key] != null);
    if (withValue.length === 0)
        return null;
    return withValue.reduce((total, r) => total + r[key], 0);
}
function weightedAvg(rows, valueKey, weightKey) {
    let num = 0;
    let den = 0;
    const unweighted = [];
    for (const r of rows) {
        const value = r[valueKey];
        if (value == null)
            continue;
        unweighted.push(value);
        const weight = r[weightKey] ?? 0;
        if (weight <= 0)
            continue;
        num += value * weight;
        den += weight;
    }
    if (den > 0)
        return num / den;
    // No row had the weighting stat (e.g. AVG entered without AB) — fall
    // back to a plain average of whatever rate values are present rather
    // than silently dropping them from career totals.
    return unweighted.length > 0 ? unweighted.reduce((a, b) => a + b, 0) / unweighted.length : null;
}
export function computeCareerTotals(statRows) {
    if (!statRows || statRows.length === 0)
        return null;
    const countingFields = [
        "gamesPlayed", "atBats", "hits", "walks", "strikeouts", "homeRuns", "rbi", "stolenBases",
        "gamesPitched", "pitcherWalks", "pitcherStrikeouts", "inningsPitched",
    ];
    const totals = { seasons: statRows.length };
    for (const key of countingFields) {
        totals[key] = sumField(statRows, key);
    }
    totals.battingAvg = weightedAvg(statRows, "battingAvg", "atBats");
    totals.onBasePct = weightedAvg(statRows, "onBasePct", "atBats");
    totals.slugging = weightedAvg(statRows, "slugging", "atBats");
    totals.era = weightedAvg(statRows, "era", "inningsPitched");
    totals.whip = weightedAvg(statRows, "whip", "inningsPitched");
    return totals;
}
export async function getPastSeasons() {
    return prisma.season.findMany({
        where: { isCurrent: false },
        orderBy: { createdAt: "desc" },
        include: { championTeam: true },
    });
}
export async function getPlayerBySlug(slug) {
    const player = await prisma.player.findUnique({
        where: { slug },
        include: {
            team: true,
            prospectRank: true,
            seasonStats: { include: { season: true }, orderBy: [{ season: { createdAt: "desc" } }, { isPlayoffs: "asc" }] },
            prospectRankHistory: { orderBy: { recordedAt: "desc" } },
            awards: { include: { season: true }, orderBy: { createdAt: "desc" } },
        },
    });
    if (!player)
        return null;
    const transactions = await prisma.transactionAsset.findMany({
        where: { playerId: player.id },
        include: { transaction: true, fromTeam: true, toTeam: true },
        orderBy: { transaction: { date: "desc" } },
    });
    return { player, transactions };
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
export async function getRecentTransactions(limit = 6) {
    const transactions = await prisma.transaction.findMany({
        orderBy: { date: "desc" },
        take: limit,
        include: { assets: { include: { player: true, fromTeam: true, toTeam: true } } },
    });
    return transactions;
}
export async function getAllNews() {
    return prisma.newsArticle.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        include: { media: true },
    });
}
export async function getTeamsWithRecords(seasonId) {
    if (!seasonId)
        return [];
    const divisions = await getStandings(seasonId);
    return divisions.flatMap((d) => d.teams.map((t) => ({ ...t, division: d.name })));
}
export async function getTeamDetail(shortCode, seasonId) {
    const team = await prisma.team.findUnique({ where: { shortCode } });
    if (!team)
        return null;
    const [players, games, record] = await Promise.all([
        prisma.player.findMany({ where: { teamId: team.id }, orderBy: { name: "asc" } }),
        seasonId
            ? prisma.game.findMany({
                where: {
                    seasonId,
                    playoffSeriesId: null,
                    OR: [{ homeTeamId: team.id }, { awayTeamId: team.id }],
                },
                include: { homeTeam: true, awayTeam: true },
                orderBy: [{ round: "asc" }, { createdAt: "asc" }],
            })
            : Promise.resolve([]),
        seasonId ? getTeamsWithRecords(seasonId) : Promise.resolve([]),
    ]);
    return {
        team,
        players,
        games: games.map(toScoreboardGame),
        record: record.find((t) => t.id === team.id) ?? null,
    };
}
