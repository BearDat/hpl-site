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
    const [divisions, seasonTeams, games] = await Promise.all([
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
        case "LIVE":
            return "LIVE";
        case "POSTPONED":
            return "POSTPONED";
        default:
            return game.scheduledTime ?? "SCHEDULED";
    }
}
export async function getScoreboardGames(seasonId, limit = 6) {
    const games = await prisma.game.findMany({
        where: { seasonId, playoffSeriesId: null },
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
export async function getStatLeaders(seasonId) {
    const stats = await prisma.playerSeasonStat.findMany({
        where: { seasonId },
        include: { player: { include: { team: true } } },
    });
    const categories = [
        { key: "battingAvg", label: "AVG", better: "higher", format: (v) => v.toFixed(3).replace(/^0/, "") },
        { key: "homeRuns", label: "HR", better: "higher", format: (v) => String(v) },
        { key: "rbi", label: "RBI", better: "higher", format: (v) => String(v) },
        { key: "era", label: "ERA", better: "lower", format: (v) => v.toFixed(2) },
        { key: "stolenBases", label: "SB", better: "higher", format: (v) => String(v) },
    ];
    return categories
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
export async function getPlayerBySlug(slug) {
    const player = await prisma.player.findUnique({
        where: { slug },
        include: {
            team: true,
            prospectRank: true,
            seasonStats: { include: { season: true }, orderBy: { season: { createdAt: "desc" } } },
            prospectRankHistory: { orderBy: { recordedAt: "desc" } },
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
