"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
const INT_FIELDS = [
    "gamesPlayed",
    "atBats",
    "hits",
    "walks",
    "strikeouts",
    "homeRuns",
    "rbi",
    "stolenBases",
    "gamesPitched",
    "pitcherWalks",
    "pitcherStrikeouts",
];
const FLOAT_FIELDS = [
    "battingAvg",
    "onBasePct",
    "slugging",
    "inningsPitched",
    "era",
    "whip",
];
export async function updatePlayerSeasonStat(formData) {
    const playerId = String(formData.get("playerId") ?? "");
    const seasonId = String(formData.get("seasonId") ?? "");
    if (!playerId || !seasonId)
        throw new Error("Player and season are required.");
    const data = {};
    for (const field of INT_FIELDS) {
        const raw = formData.get(field);
        data[field] = raw != null && raw !== "" ? Math.trunc(Number(raw)) : null;
    }
    for (const field of FLOAT_FIELDS) {
        const raw = formData.get(field);
        data[field] = raw != null && raw !== "" ? Number(raw) : null;
    }
    await prisma.playerSeasonStat.upsert({
        where: { playerId_seasonId: { playerId, seasonId } },
        update: data,
        create: { playerId, seasonId, ...data },
    });
    revalidatePath("/admin/roster");
    revalidatePath("/");
}
