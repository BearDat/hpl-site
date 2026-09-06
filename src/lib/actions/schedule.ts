"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { parseScheduleText } from "@/lib/schedule-parser";
import { GameStatus } from "@prisma/client";

export async function createGame(formData: FormData) {
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

export type BulkImportState = {
  createdCount: number;
  errors: string[];
} | null;

export async function bulkImportGames(
  seasonId: string,
  prevState: BulkImportState,
  formData: FormData
): Promise<BulkImportState> {
  const text = String(formData.get("scheduleText") ?? "");
  if (!text.trim()) {
    return { createdCount: 0, errors: ["Paste schedule text before importing."] };
  }

  const rounds = parseScheduleText(text);
  if (rounds.length === 0) {
    return { createdCount: 0, errors: ["Couldn't find any rounds in that text."] };
  }

  const teams = await prisma.team.findMany();
  const findTeam = (name: string) =>
    teams.find((t) => t.name.toLowerCase() === name.toLowerCase());

  const errors: string[] = [];
  const toCreate: {
    seasonId: string;
    round: string;
    scheduledTime?: string;
    locationCode?: string;
    homeTeamId: string;
    awayTeamId: string;
  }[] = [];

  for (const round of rounds) {
    for (const game of round.games) {
      const home = findTeam(game.home);
      const away = findTeam(game.away);
      if (!home) errors.push(`${round.round}: unknown team "${game.home}"`);
      if (!away) errors.push(`${round.round}: unknown team "${game.away}"`);
      if (!home || !away) continue;
      toCreate.push({
        seasonId,
        round: round.round,
        scheduledTime: round.scheduledTime,
        locationCode: game.location,
        homeTeamId: home.id,
        awayTeamId: away.id,
      });
    }
  }

  if (toCreate.length > 0) {
    await prisma.game.createMany({ data: toCreate });
    revalidatePath("/admin/schedule");
    revalidatePath("/");
  }

  return { createdCount: toCreate.length, errors };
}

export async function updateGame(gameId: string, formData: FormData) {
  const status = String(formData.get("status") ?? "SCHEDULED") as GameStatus;
  const homeScoreRaw = formData.get("homeScore");
  const awayScoreRaw = formData.get("awayScore");
  const inningsRaw = formData.get("innings");
  const forfeitWinnerId = String(formData.get("forfeitWinnerId") ?? "") || null;

  await prisma.game.update({
    where: { id: gameId },
    data: {
      status,
      homeScore: homeScoreRaw ? Number(homeScoreRaw) : null,
      awayScore: awayScoreRaw ? Number(awayScoreRaw) : null,
      innings: inningsRaw ? Number(inningsRaw) : null,
      forfeitWinnerId: status === "FORFEIT" ? forfeitWinnerId : null,
    },
  });

  revalidatePath("/admin/schedule");
  revalidatePath("/");
}

export async function deleteGame(formData: FormData) {
  const gameId = String(formData.get("gameId") ?? "");
  if (!gameId) return;
  await prisma.game.delete({ where: { id: gameId } });
  revalidatePath("/admin/schedule");
  revalidatePath("/");
}
