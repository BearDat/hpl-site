"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
export async function createSeason(formData) {
    const name = String(formData.get("name") ?? "").trim();
    if (!name)
        throw new Error("Season name is required.");
    const seasonCount = await prisma.season.count();
    await prisma.season.create({
        data: { name, isCurrent: seasonCount === 0 },
    });
    revalidatePath("/admin/league");
    revalidatePath("/");
}
export async function setCurrentSeason(formData) {
    const seasonId = String(formData.get("seasonId") ?? "");
    if (!seasonId)
        return;
    await prisma.$transaction([
        prisma.season.updateMany({ data: { isCurrent: false } }),
        prisma.season.update({ where: { id: seasonId }, data: { isCurrent: true } }),
    ]);
    revalidatePath("/admin/league");
    revalidatePath("/");
}
export async function setSeasonChampion(seasonId, formData) {
    const championTeamId = String(formData.get("championTeamId") ?? "") || null;
    await prisma.season.update({ where: { id: seasonId }, data: { championTeamId } });
    revalidatePath("/admin/league");
    revalidatePath("/history");
}
export async function updatePlayoffFormat(seasonId, formData) {
    const playoffTeamCount = Number(formData.get("playoffTeamCount") ?? 4);
    const seriesLengthsRaw = String(formData.get("playoffSeriesLengths") ?? "3,5,7");
    const playoffSeriesLengths = seriesLengthsRaw
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !Number.isNaN(n));
    const playoffReseed = formData.get("playoffReseed") === "on";
    await prisma.season.update({
        where: { id: seasonId },
        data: { playoffTeamCount, playoffSeriesLengths, playoffReseed },
    });
    revalidatePath("/admin/league");
}
export async function createDivision(formData) {
    const seasonId = String(formData.get("seasonId") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    if (!seasonId || !name)
        throw new Error("Season and division name are required.");
    const order = await prisma.division.count({ where: { seasonId } });
    await prisma.division.create({ data: { seasonId, name, order } });
    revalidatePath("/admin/league");
    revalidatePath("/");
}
export async function deleteDivision(formData) {
    const divisionId = String(formData.get("divisionId") ?? "");
    if (!divisionId)
        return;
    await prisma.division.delete({ where: { id: divisionId } });
    revalidatePath("/admin/league");
    revalidatePath("/");
}
export async function addTeamToSeason(formData) {
    const seasonId = String(formData.get("seasonId") ?? "");
    const teamId = String(formData.get("teamId") ?? "");
    const divisionId = String(formData.get("divisionId") ?? "") || null;
    if (!seasonId || !teamId)
        throw new Error("Season and team are required.");
    await prisma.seasonTeam.upsert({
        where: { seasonId_teamId: { seasonId, teamId } },
        update: { divisionId },
        create: { seasonId, teamId, divisionId },
    });
    revalidatePath("/admin/league");
    revalidatePath("/");
}
export async function removeTeamFromSeason(formData) {
    const seasonTeamId = String(formData.get("seasonTeamId") ?? "");
    if (!seasonTeamId)
        return;
    await prisma.seasonTeam.delete({ where: { id: seasonTeamId } });
    revalidatePath("/admin/league");
    revalidatePath("/");
}
