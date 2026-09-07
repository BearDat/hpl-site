"use server";
import { revalidatePath } from "next/cache";
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
export async function bulkImportGames(seasonId, prevState, formData) {
    const text = String(formData.get("scheduleText") ?? "");
    if (!text.trim()) {
        return { createdCount: 0, errors: ["Paste schedule text before importing."] };
    }
    const rounds = parseScheduleText(text);
    if (rounds.length === 0) {
        return { createdCount: 0, errors: ["Couldn't find any rounds in that text."] };
    }
    const teams = await prisma.team.findMany();
    const findTeam = (name) => teams.find((t) => t.name.toLowerCase() === name.toLowerCase());
    const errors = [];
    const toCreate = [];
    for (const round of rounds) {
        for (const game of round.games) {
            const home = findTeam(game.home);
            const away = findTeam(game.away);
            if (!home)
                errors.push(`${round.round}: unknown team "${game.home}"`);
            if (!away)
                errors.push(`${round.round}: unknown team "${game.away}"`);
            if (!home || !away)
                continue;
            toCreate.push({
                seasonId,
                round: round.round,
                scheduledTime: round.scheduledTime,
                locationCode: game.location,
                homeTeamId: home.id,
                awayTeamId: away.id,
            });
        }
    }
    if (toCreate.length > 0) {
        await prisma.game.createMany({ data: toCreate });
        revalidatePath("/admin/schedule");
        revalidatePath("/");
    }
    return { createdCount: toCreate.length, errors };
}
export async function updateGame(gameId, formData) {
    const status = String(formData.get("status") ?? "SCHEDULED");
    const homeScoreRaw = formData.get("homeScore");
    const awayScoreRaw = formData.get("awayScore");
    const inningsRaw = formData.get("innings");
    const forfeitWinnerId = String(formData.get("forfeitWinnerId") ?? "") || null;
    await prisma.game.update({
        where: { id: gameId },
        data: {
            status,
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
