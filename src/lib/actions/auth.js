"use server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, verifyPassword, hashPassword } from "@/lib/auth";

export async function login(formData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) {
    redirect(`/admin/login?error=${encodeURIComponent("Username and password are required.")}`);
  }
  const admin = await prisma.adminUser.findUnique({ where: { username } });
  if (!admin || !verifyPassword(password, admin.passwordHash)) {
    redirect(`/admin/login?error=${encodeURIComponent("Incorrect username or password.")}`);
  }
  await createSession(admin.id);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

export async function setAdminPassword(adminId, formData) {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
  await prisma.adminUser.update({
    where: { id: adminId },
    data: { passwordHash: hashPassword(password) },
  });
}
