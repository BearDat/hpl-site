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
// A game is treated as "already added" if the same two teams are already
// scheduled to play each other in the same round this season.
function dedupeKey(round, homeTeamId, awayTeamId) {
    return `${round}::${homeTeamId}::${awayTeamId}`;
}
async function existingDedupeKeys(seasonId) {
    const existing = await prisma.game.findMany({
        where: { seasonId, playoffSeriesId: null },
        select: { round: true, homeTeamId: true, awayTeamId: true },
    });
    return new Set(existing.map((g) => dedupeKey(g.round, g.homeTeamId, g.awayTeamId)));
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
        const seenKeys = await existingDedupeKeys(seasonId);
        let duplicateCount = 0;
        const toCreate = [];
        for (const round of preppedRounds) {
            for (const game of round.games) {
                const key = dedupeKey(round.round, game.homeTeamId, game.awayTeamId);
                if (seenKeys.has(key)) {
                    duplicateCount += 1;
                    continue;
                }
                seenKeys.add(key);
                toCreate.push({
                    seasonId,
                    round: round.round,
                    scheduledTime: round.scheduledTime ?? undefined,
                    locationCode: game.location ?? undefined,
                    homeTeamId: game.homeTeamId,
                    awayTeamId: game.awayTeamId,
                });
            }
        }
        if (toCreate.length > 0) {
            await prisma.game.createMany({ data: toCreate });
            revalidatePath("/admin/schedule");
            revalidatePath("/");
        }
        redirect(`/admin/schedule?imported=${toCreate.length}&duplicates=${duplicateCount}`);
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
    const seenKeys = await existingDedupeKeys(pending.seasonId);
    let duplicateCount = 0;
    const toCreate = [];
    for (const round of pending.data.rounds) {
        for (const game of round.games) {
            const homeTeamId = game.homeTeamId ?? nameMap.get(game.homeName) ?? null;
            const awayTeamId = game.awayTeamId ?? nameMap.get(game.awayName) ?? null;
            if (!homeTeamId || !awayTeamId || homeTeamId === awayTeamId)
                continue;
            const key = dedupeKey(round.round, homeTeamId, awayTeamId);
            if (seenKeys.has(key)) {
                duplicateCount += 1;
                continue;
            }
            seenKeys.add(key);
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
    redirect(`/admin/schedule?imported=${toCreate.length}&duplicates=${duplicateCount}`);
}
export async function updateGame(gameId, formData) {
    const submittedStatus = String(formData.get("status") ?? "SCHEDULED");
    const homeScoreRaw = formData.get("homeScore");
    const awayScoreRaw = formData.get("awayScore");
    const inningsRaw = formData.get("innings");
    const forfeitWinnerId = String(formData.get("forfeitWinnerId") ?? "") || null;
    const homeTeamId = String(formData.get("homeTeamId") ?? "");
    const awayTeamId = String(formData.get("awayTeamId") ?? "");
    if (!homeTeamId || !awayTeamId || homeTeamId === awayTeamId) {
        throw new Error("Home and away must be two different teams.");
    }
    const hasBothScores = homeScoreRaw && awayScoreRaw;
    // Entering both scores marks the game final on its own, unless the
    // admin explicitly picked a different status (forfeit, postponed).
    const status = submittedStatus === "SCHEDULED" && hasBothScores ? "FINAL" : submittedStatus;
    await prisma.game.update({
        where: { id: gameId },
        data: {
            status,
            homeTeamId,
            awayTeamId,
            homeScore: homeScoreRaw ? Number(homeScoreRaw) : null,
            awayScore: awayScoreRaw ? Number(awayScoreRaw) : null,
            // A completed game is 9 innings unless the admin says otherwise.
            innings: inningsRaw ? Number(inningsRaw) : status === "FINAL" ? 9 : null,
            forfeitWinnerId: status === "FORFEIT" ? forfeitWinnerId : null,
        },
    });
    revalidatePath("/admin/schedule");
    revalidatePath("/");
}
export async function clearSchedule(formData) {
    const seasonId = String(formData.get("seasonId") ?? "");
    if (!seasonId)
        return;
    // Only the regular-season schedule — playoff games live under their
    // own series and are managed from the Playoffs admin page.
    await prisma.game.deleteMany({ where: { seasonId, playoffSeriesId: null } });
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
