"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function addAward(formData) {
    const playerId = String(formData.get("playerId") ?? "");
    const seasonId = String(formData.get("seasonId") ?? "") || null;
    const title = String(formData.get("title") ?? "").trim();
    if (!playerId || !title)
        throw new Error("Player and award title are required.");
    await prisma.award.create({ data: { playerId, seasonId, title } });
    revalidatePath("/admin/awards");
    revalidatePath("/players");
}

export async function deleteAward(formData) {
    const awardId = String(formData.get("awardId") ?? "");
    if (!awardId)
        return;
    await prisma.award.delete({ where: { id: awardId } });
    revalidatePath("/admin/awards");
    revalidatePath("/players");
}
