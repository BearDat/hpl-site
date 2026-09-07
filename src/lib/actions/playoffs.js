"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getStandings } from "@/lib/queries";
function roundNameForSeriesCount(n) {
    if (n === 1)
        return "Finals";
    if (n === 2)
        return "Semifinals";
    if (n === 4)
        return "Quarterfinals";
    return undefined;
}
async function recomputeSeries(seriesId) {
    const series = await prisma.playoffSeries.findUniqueOrThrow({
        where: { id: seriesId },
        include: { games: true },
    });
    let aWins = 0;
    let bWins = 0;
    for (const g of series.games) {
        let winnerTeamId = null;
        if (g.status === "FORFEIT" && g.forfeitWinnerId) {
            winnerTeamId = g.forfeitWinnerId;
        }
        else if (g.status === "FINAL" &&
            g.homeScore != null &&
            g.awayScore != null &&
            g.homeScore !== g.awayScore) {
            winnerTeamId = g.homeScore > g.awayScore ? g.homeTeamId : g.awayTeamId;
        }
        if (winnerTeamId && winnerTeamId === series.teamAId)
            aWins += 1;
        else if (winnerTeamId && winnerTeamId === series.teamBId)
            bWins += 1;
    }
    const majority = Math.ceil(series.bestOf / 2);
    const winnerId = aWins >= majority ? series.teamAId : bWins >= majority ? series.teamBId : null;
    await prisma.playoffSeries.update({
        where: { id: seriesId },
        data: { teamAWins: aWins, teamBWins: bWins, winnerId },
    });
}
export async function generateFirstRound(formData) {
    const seasonId = String(formData.get("seasonId") ?? "");
    if (!seasonId)
        throw new Error("Season is required.");
    const season = await prisma.season.findUniqueOrThrow({ where: { id: seasonId } });
    const existing = await prisma.playoffSeries.count({ where: { seasonId, round: 1 } });
    if (existing > 0)
        throw new Error("Round 1 series already exist for this season.");
    const divisions = await getStandings(seasonId);
    const seeded = divisions
        .flatMap((d) => d.teams)
        .sort((a, b) => {
        const pctA = a.wins + a.losses > 0 ? a.wins / (a.wins + a.losses) : 0;
        const pctB = b.wins + b.losses > 0 ? b.wins / (b.wins + b.losses) : 0;
        return pctB - pctA || b.wins - a.wins || a.name.localeCompare(b.name);
    })
        .slice(0, season.playoffTeamCount);
    if (seeded.length < 2)
        throw new Error("Not enough teams to generate a bracket.");
    const bestOf = season.playoffSeriesLengths[0] ?? 5;
    const seriesCount = Math.floor(seeded.length / 2);
    const roundName = roundNameForSeriesCount(seriesCount);
    await prisma.playoffSeries.createMany({
        data: Array.from({ length: seriesCount }, (_, i) => ({
            seasonId,
            round: 1,
            roundName,
            order: i,
            bestOf,
            teamAId: seeded[i].id,
            teamBId: seeded[seeded.length - 1 - i].id,
            teamASeed: i + 1,
            teamBSeed: seeded.length - i,
        })),
    });
    revalidatePath("/admin/playoffs");
    revalidatePath("/playoffs");
}
export async function generateNextRound(formData) {
    const seasonId = String(formData.get("seasonId") ?? "");
    const fromRound = Number(formData.get("fromRound") ?? 0);
    if (!seasonId || !fromRound)
        throw new Error("Season and round are required.");
    const season = await prisma.season.findUniqueOrThrow({ where: { id: seasonId } });
    const priorSeries = await prisma.playoffSeries.findMany({
        where: { seasonId, round: fromRound },
        orderBy: { order: "asc" },
    });
    const winners = priorSeries
        .filter((s) => s.winnerId)
        .map((s) => ({
        teamId: s.winnerId,
        seed: s.winnerId === s.teamAId ? (s.teamASeed ?? 999) : (s.teamBSeed ?? 999),
    }));
    if (winners.length < 2) {
        throw new Error("Not every series in that round has a winner yet.");
    }
    const nextRoundExists = await prisma.playoffSeries.count({
        where: { seasonId, round: fromRound + 1 },
    });
    if (nextRoundExists > 0)
        throw new Error("The next round already exists.");
    const paired = season.playoffReseed
        ? [...winners].sort((a, b) => a.seed - b.seed)
        : winners;
    const bestOf = season.playoffSeriesLengths[fromRound] ?? season.playoffSeriesLengths.at(-1) ?? 5;
    const seriesCount = Math.floor(paired.length / 2);
    const roundName = roundNameForSeriesCount(seriesCount);
    await prisma.playoffSeries.createMany({
        data: Array.from({ length: seriesCount }, (_, i) => ({
            seasonId,
            round: fromRound + 1,
            roundName,
            order: i,
            bestOf,
            teamAId: paired[i].teamId,
            teamBId: paired[paired.length - 1 - i].teamId,
            teamASeed: paired[i].seed,
            teamBSeed: paired[paired.length - 1 - i].seed,
        })),
    });
    revalidatePath("/admin/playoffs");
    revalidatePath("/playoffs");
}
export async function createSeriesManually(formData) {
    const seasonId = String(formData.get("seasonId") ?? "");
    const round = Number(formData.get("round") ?? 0);
    const roundName = String(formData.get("roundName") ?? "").trim() || undefined;
    const order = Number(formData.get("order") ?? 0);
    const bestOf = Number(formData.get("bestOf") ?? 5);
    const teamAId = String(formData.get("teamAId") ?? "") || undefined;
    const teamBId = String(formData.get("teamBId") ?? "") || undefined;
    if (!seasonId || !round)
        throw new Error("Season and round are required.");
    await prisma.playoffSeries.create({
        data: { seasonId, round, roundName, order, bestOf, teamAId, teamBId },
    });
    revalidatePath("/admin/playoffs");
    revalidatePath("/playoffs");
}
export async function deleteSeries(formData) {
    const seriesId = String(formData.get("seriesId") ?? "");
    if (!seriesId)
        return;
    await prisma.playoffSeries.delete({ where: { id: seriesId } });
    revalidatePath("/admin/playoffs");
    revalidatePath("/playoffs");
}
export async function setSeriesWinner(seriesId, formData) {
    const winnerId = String(formData.get("winnerId") ?? "") || null;
    await prisma.playoffSeries.update({ where: { id: seriesId }, data: { winnerId } });
    revalidatePath("/admin/playoffs");
    revalidatePath("/playoffs");
}
export async function addPlayoffGame(seriesId, formData) {
    const series = await prisma.playoffSeries.findUniqueOrThrow({ where: { id: seriesId } });
    if (!series.teamAId || !series.teamBId) {
        throw new Error("Both teams must be set on the series before adding games.");
    }
    const homeTeamId = String(formData.get("homeTeamId") ?? "");
    const awayTeamId = homeTeamId === series.teamAId ? series.teamBId : series.teamAId;
    const scheduledTime = String(formData.get("scheduledTime") ?? "").trim() || undefined;
    const locationCode = String(formData.get("locationCode") ?? "").trim() || undefined;
    if (homeTeamId !== series.teamAId && homeTeamId !== series.teamBId) {
        throw new Error("Home team must be one of the two series teams.");
    }
    const gameNumber = (await prisma.game.count({ where: { playoffSeriesId: seriesId } })) + 1;
    await prisma.game.create({
        data: {
            seasonId: series.seasonId,
            round: series.roundName ?? `Playoffs R${series.round}`,
            scheduledTime,
            locationCode,
            homeTeamId,
            awayTeamId,
            playoffSeriesId: seriesId,
            notes: `Game ${gameNumber}`,
        },
    });
    revalidatePath("/admin/playoffs");
    revalidatePath("/playoffs");
}
export async function updatePlayoffGame(gameId, formData) {
    const status = String(formData.get("status") ?? "SCHEDULED");
    const homeScoreRaw = formData.get("homeScore");
    const awayScoreRaw = formData.get("awayScore");
    const inningsRaw = formData.get("innings");
    const forfeitWinnerId = String(formData.get("forfeitWinnerId") ?? "") || null;
    const game = await prisma.game.update({
        where: { id: gameId },
        data: {
            status,
            homeScore: homeScoreRaw ? Number(homeScoreRaw) : null,
            awayScore: awayScoreRaw ? Number(awayScoreRaw) : null,
            innings: inningsRaw ? Number(inningsRaw) : null,
            forfeitWinnerId: status === "FORFEIT" ? forfeitWinnerId : null,
        },
    });
    if (game.playoffSeriesId) {
        await recomputeSeries(game.playoffSeriesId);
    }
    revalidatePath("/admin/playoffs");
    revalidatePath("/playoffs");
}
export async function deletePlayoffGame(formData) {
    const gameId = String(formData.get("gameId") ?? "");
    if (!gameId)
        return;
    const game = await prisma.game.delete({ where: { id: gameId } });
    if (game.playoffSeriesId) {
        await recomputeSeries(game.playoffSeriesId);
    }
    revalidatePath("/admin/playoffs");
    revalidatePath("/playoffs");
}
