"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createPlayer(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const position = String(formData.get("position") ?? "").trim();
  const teamId = String(formData.get("teamId") ?? "") || null;

  if (!name || !position) throw new Error("Name and position are required.");

  await prisma.player.create({
    data: { name, position, teamId, status: teamId ? "ACTIVE" : "FREE_AGENT" },
  });

  revalidatePath("/admin/roster");
  revalidatePath("/");
}

export async function updatePlayer(playerId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const position = String(formData.get("position") ?? "").trim();
  const teamId = String(formData.get("teamId") ?? "") || null;
  const status = String(formData.get("status") ?? "ACTIVE") as
    | "ACTIVE"
    | "FREE_AGENT"
    | "RETIRED";

  await prisma.player.update({
    where: { id: playerId },
    data: { name, position, teamId, status },
  });

  revalidatePath("/admin/roster");
  revalidatePath("/");
}

export async function signPlayer(formData: FormData) {
  const playerId = String(formData.get("playerId") ?? "");
  const teamId = String(formData.get("teamId") ?? "");
  if (!playerId || !teamId) throw new Error("Player and team are required.");

  await prisma.$transaction([
    prisma.player.update({
      where: { id: playerId },
      data: { teamId, status: "ACTIVE" },
    }),
    prisma.transaction.create({
      data: {
        type: "SIGNING",
        assets: { create: [{ playerId, toTeamId: teamId }] },
      },
    }),
  ]);

  revalidatePath("/admin/roster");
  revalidatePath("/");
}

export async function releasePlayer(formData: FormData) {
  const playerId = String(formData.get("playerId") ?? "");
  if (!playerId) throw new Error("Player is required.");

  const player = await prisma.player.findUniqueOrThrow({ where: { id: playerId } });

  await prisma.$transaction([
    prisma.player.update({
      where: { id: playerId },
      data: { teamId: null, status: "FREE_AGENT" },
    }),
    prisma.transaction.create({
      data: {
        type: "RELEASE",
        assets: { create: [{ playerId, fromTeamId: player.teamId }] },
      },
    }),
  ]);

  revalidatePath("/admin/roster");
  revalidatePath("/");
}

export async function tradePlayers(formData: FormData) {
  const teamAId = String(formData.get("teamAId") ?? "");
  const teamBId = String(formData.get("teamBId") ?? "");
  const teamAPlayers = formData.getAll("teamAPlayers").map(String);
  const teamBPlayers = formData.getAll("teamBPlayers").map(String);
  const notes = String(formData.get("notes") ?? "") || undefined;

  if (!teamAId || !teamBId || teamAId === teamBId) {
    throw new Error("Pick two different teams to trade between.");
  }
  if (teamAPlayers.length === 0 && teamBPlayers.length === 0) {
    throw new Error("Select at least one player to trade.");
  }

  const assets = [
    ...teamAPlayers.map((playerId) => ({ playerId, fromTeamId: teamAId, toTeamId: teamBId })),
    ...teamBPlayers.map((playerId) => ({ playerId, fromTeamId: teamBId, toTeamId: teamAId })),
  ];

  await prisma.$transaction([
    ...teamAPlayers.map((playerId) =>
      prisma.player.update({ where: { id: playerId }, data: { teamId: teamBId } })
    ),
    ...teamBPlayers.map((playerId) =>
      prisma.player.update({ where: { id: playerId }, data: { teamId: teamAId } })
    ),
    prisma.transaction.create({
      data: { type: "TRADE", notes, assets: { create: assets } },
    }),
  ]);

  revalidatePath("/admin/roster");
  revalidatePath("/");
}
