"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseScheduleText } from "@/lib/schedule-parser";
export async function createGame(formData) {
    const seasonId = String(formData.get("seasonId") ?? "");
    const round = String(formData.get("round") ?? "").trim();
    const scheduledTime = String(formData.get("scheduledTime") ?? "").trim() || undefined;
    const locationCode = String(formData.get("locationCode") ?? "").trim() || undefined;
    const homeTeamId = String(formData.get("homeTeamId") ?? "");
    const awayTeamId = String(formData.get("awayTeamId") ?? "");
    if (!seasonId || !round || !homeTeamId || !awayTeamId || homeTeamId === awayTeamId) {
        throw new Error("A round, and two different teams, are required.");
    }
    await prisma.game.create({
        data: { seasonId, round, scheduledTime, locationCode, homeTeamId, awayTeamId },
    });
    revalidatePath("/admin/schedule");
    revalidatePath("/");
}
export async function previewBulkImportGames(seasonId, formData) {
    const text = String(formData.get("scheduleText") ?? "");
    if (!text.trim()) {
        throw new Error("Paste schedule text before importing.");
    }
    const rounds = parseScheduleText(text);
    if (rounds.length === 0) {
        throw new Error("Couldn't find any rounds in that text.");
    }
    const teams = await prisma.team.findMany();
    const findTeam = (name) => teams.find((t) => t.name.toLowerCase() === name.toLowerCase());
    const unmatchedNames = new Set();
    const preppedRounds = rounds.map((round) => ({
        round: round.round,
        scheduledTime: round.scheduledTime ?? null,
        games: round.games.map((game) => {
            const home = findTeam(game.home);
            const away = findTeam(game.away);
            if (!home)
                unmatchedNames.add(game.home);
            if (!away)
                unmatchedNames.add(game.away);
            return {
                homeName: game.home,
                awayName: game.away,
                homeTeamId: home?.id ?? null,
                awayTeamId: away?.id ?? null,
                location: game.location ?? null,
            };
        }),
    }));
    // Nothing unrecognized — just create the games directly, no confirmation needed.
    if (unmatchedNames.size === 0) {
        const toCreate = preppedRounds.flatMap((round) => round.games.map((game) => ({
            seasonId,
            round: round.round,
            scheduledTime: round.scheduledTime ?? undefined,
            locationCode: game.location ?? undefined,
            homeTeamId: game.homeTeamId,
            awayTeamId: game.awayTeamId,
        })));
        await prisma.game.createMany({ data: toCreate });
        revalidatePath("/admin/schedule");
        revalidatePath("/");
        redirect("/admin/schedule");
    }
    const pending = await prisma.pendingScheduleImport.create({
        data: { seasonId, data: { rounds: preppedRounds, unmatchedNames: Array.from(unmatchedNames) } },
    });
    redirect(`/admin/schedule?importId=${pending.id}`);
}
export async function cancelBulkScheduleImport(formData) {
    const importId = String(formData.get("importId") ?? "");
    if (!importId)
        return;
    await prisma.pendingScheduleImport.delete({ where: { id: importId } }).catch(() => { });
    redirect("/admin/schedule");
}
export async function commitBulkScheduleImport(formData) {
    const importId = String(formData.get("importId") ?? "");
    const pending = await prisma.pendingScheduleImport.findUniqueOrThrow({ where: { id: importId } });
    const nameMap = new Map();
    for (const name of pending.data.unmatchedNames) {
        const chosen = String(formData.get(`teamFor_${name}`) ?? "");
        if (chosen)
            nameMap.set(name, chosen);
    }
    const toCreate = [];
    for (const round of pending.data.rounds) {
        for (const game of round.games) {
            const homeTeamId = game.homeTeamId ?? nameMap.get(game.homeName) ?? null;
            const awayTeamId = game.awayTeamId ?? nameMap.get(game.awayName) ?? null;
            if (!homeTeamId || !awayTeamId || homeTeamId === awayTeamId)
                continue;
            toCreate.push({
                seasonId: pending.seasonId,
                round: round.round,
                scheduledTime: round.scheduledTime ?? undefined,
                locationCode: game.location ?? undefined,
                homeTeamId,
                awayTeamId,
            });
        }
    }
    if (toCreate.length > 0) {
        await prisma.game.createMany({ data: toCreate });
    }
    await prisma.pendingScheduleImport.delete({ where: { id: importId } });
    revalidatePath("/admin/schedule");
    revalidatePath("/");
    redirect("/admin/schedule");
}
export async function updateGame(gameId, formData) {
    const status = String(formData.get("status") ?? "SCHEDULED");
    const homeScoreRaw = formData.get("homeScore");
    const awayScoreRaw = formData.get("awayScore");
    const inningsRaw = formData.get("innings");
    const forfeitWinnerId = String(formData.get("forfeitWinnerId") ?? "") || null;
    const homeTeamId = String(formData.get("homeTeamId") ?? "");
    const awayTeamId = String(formData.get("awayTeamId") ?? "");
    if (!homeTeamId || !awayTeamId || homeTeamId === awayTeamId) {
        throw new Error("Home and away must be two different teams.");
    }
    await prisma.game.update({
        where: { id: gameId },
        data: {
            status,
            homeTeamId,
            awayTeamId,
            homeScore: homeScoreRaw ? Number(homeScoreRaw) : null,
            awayScore: awayScoreRaw ? Number(awayScoreRaw) : null,
            innings: inningsRaw ? Number(inningsRaw) : null,
            forfeitWinnerId: status === "FORFEIT" ? forfeitWinnerId : null,
        },
    });
    revalidatePath("/admin/schedule");
    revalidatePath("/");
}
export async function deleteGame(formData) {
    const gameId = String(formData.get("gameId") ?? "");
    if (!gameId)
        return;
    await prisma.game.delete({ where: { id: gameId } });
    revalidatePath("/admin/schedule");
    revalidatePath("/");
}
