"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { AdminRole } from "@prisma/client";

export async function addAdmin(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "EDITOR") as AdminRole;

  if (!name || !email) throw new Error("Name and email are required.");

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) throw new Error("An admin with that email already exists.");

  await prisma.adminUser.create({ data: { name, email, role } });

  revalidatePath("/admin/admins");
}

export async function updateAdminRole(adminId: string, formData: FormData) {
  const role = String(formData.get("role") ?? "EDITOR") as AdminRole;
  await prisma.adminUser.update({ where: { id: adminId }, data: { role } });
  revalidatePath("/admin/admins");
}

export async function removeAdmin(formData: FormData) {
  const adminId = String(formData.get("adminId") ?? "");
  if (!adminId) return;

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
