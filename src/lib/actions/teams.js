"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/upload";
async function logoUrlFromForm(formData) {
    const file = formData.get("logo");
    if (file instanceof File && file.size > 0) {
        return saveUploadedFile(file, "teams");
    }
    return undefined;
}
export async function createTeam(formData) {
    const name = String(formData.get("name") ?? "").trim();
    const shortCode = String(formData.get("shortCode") ?? "").trim().toUpperCase();
    const primaryColor = String(formData.get("primaryColor") ?? "#101B45");
    const secondaryColor = String(formData.get("secondaryColor") ?? "") || undefined;
    if (!name || !shortCode)
        throw new Error("Name and short code are required.");
    const logoUrl = await logoUrlFromForm(formData);
    await prisma.team.create({
        data: { name, shortCode, primaryColor, secondaryColor, logoUrl },
    });
    revalidatePath("/admin/teams");
    revalidatePath("/");
}
export async function updateTeam(teamId, formData) {
    const name = String(formData.get("name") ?? "").trim();
    const shortCode = String(formData.get("shortCode") ?? "").trim().toUpperCase();
    const primaryColor = String(formData.get("primaryColor") ?? "#101B45");
    const secondaryColor = String(formData.get("secondaryColor") ?? "") || null;
    if (!name || !shortCode)
        throw new Error("Name and short code are required.");
    const logoUrl = await logoUrlFromForm(formData);
    await prisma.team.update({
        where: { id: teamId },
        data: { name, shortCode, primaryColor, secondaryColor, ...(logoUrl ? { logoUrl } : {}) },
    });
    revalidatePath("/admin/teams");
    revalidatePath("/");
}
export async function deleteTeam(formData) {
    const teamId = String(formData.get("teamId") ?? "");
    if (!teamId)
        return;
    const [gameCount, transactionCount] = await Promise.all([
        prisma.game.count({ where: { OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }] } }),
        prisma.transactionAsset.count({
            where: { OR: [{ fromTeamId: teamId }, { toTeamId: teamId }] },
        }),
    ]);
    if (gameCount > 0 || transactionCount > 0) {
        throw new Error("This team has games or transaction history and can't be deleted. Remove those first, or keep the team and rebrand it instead.");
    }
    await prisma.team.delete({ where: { id: teamId } });
    revalidatePath("/admin/teams");
    revalidatePath("/");
}
