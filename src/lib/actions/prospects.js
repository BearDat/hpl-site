"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
export async function addProspect(formData) {
    const playerId = String(formData.get("playerId") ?? "");
    const rank = Number(formData.get("rank") ?? 0);
    if (!playerId || !rank)
        throw new Error("Player and rank are required.");
    await prisma.$transaction([
        prisma.prospectRank.upsert({
            where: { playerId },
            update: { previousRank: undefined, rank },
            create: { playerId, rank },
        }),
        prisma.prospectRankHistory.create({ data: { playerId, rank } }),
    ]);
    revalidatePath("/admin/news");
    revalidatePath("/");
}
export async function updateProspectRank(prospectRankId, formData) {
    const newRank = Number(formData.get("rank") ?? 0);
    if (!newRank)
        throw new Error("A rank is required.");
    const existing = await prisma.prospectRank.findUniqueOrThrow({
        where: { id: prospectRankId },
    });
    await prisma.$transaction([
        prisma.prospectRank.update({
            where: { id: prospectRankId },
            data: { previousRank: existing.rank, rank: newRank },
        }),
        prisma.prospectRankHistory.create({
            data: { playerId: existing.playerId, rank: newRank },
        }),
    ]);
    revalidatePath("/admin/news");
    revalidatePath("/");
}
export async function removeProspect(formData) {
    const prospectRankId = String(formData.get("prospectRankId") ?? "");
    if (!prospectRankId)
        return;
    await prisma.prospectRank.delete({ where: { id: prospectRankId } });
    revalidatePath("/admin/news");
    revalidatePath("/");
}
