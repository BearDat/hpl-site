"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
export async function addAdmin(formData) {
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const role = String(formData.get("role") ?? "EDITOR");
    if (!name || !email || !username || !password)
        throw new Error("Name, email, username, and password are required.");
    if (password.length < 8)
        throw new Error("Password must be at least 8 characters.");
    const existing = await prisma.adminUser.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existing)
        throw new Error("An admin with that email or username already exists.");
    await prisma.adminUser.create({
        data: { name, email, username, passwordHash: hashPassword(password), role },
    });
    revalidatePath("/admin/admins");
}
export async function updateAdminRole(adminId, formData) {
    const role = String(formData.get("role") ?? "EDITOR");
    await prisma.adminUser.update({ where: { id: adminId }, data: { role } });
    revalidatePath("/admin/admins");
}
export async function removeAdmin(formData) {
    const adminId = String(formData.get("adminId") ?? "");
    if (!adminId)
        return;
    const admin = await prisma.adminUser.findUniqueOrThrow({ where: { id: adminId } });
    if (admin.role === "OWNER") {
        const ownerCount = await prisma.adminUser.count({ where: { role: "OWNER" } });
        if (ownerCount <= 1) {
            throw new Error("Can't remove the last owner.");
        }
    }
    await prisma.adminUser.delete({ where: { id: adminId } });
    revalidatePath("/admin/admins");
}
