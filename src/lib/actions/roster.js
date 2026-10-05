"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugify, uniqueSlug } from "@/lib/slugify";
import { parseRosterCsv } from "@/lib/csv-roster-parser";
import { resolveRobloxIds } from "@/lib/roblox";
async function uniquePlayerSlug(name) {
    return uniqueSlug(name, async (slug) => (await prisma.player.findUnique({ where: { slug } })) !== null, "player");
}
export async function createPlayer(formData) {
    const name = String(formData.get("name") ?? "").trim();
    const teamId = String(formData.get("teamId") ?? "") || null;
    const robloxId = String(formData.get("robloxId") ?? "").trim() || null;
    if (!name)
        throw new Error("Name is required.");
    if (robloxId) {
        const existing = await prisma.player.findUnique({ where: { robloxId } });
        if (existing) {
            throw new Error(`That Roblox ID is already linked to ${existing.name}. Edit that player instead of creating a new one, or use Merge Players if this is a duplicate.`);
        }
    }
    const slug = await uniquePlayerSlug(name);
    await prisma.player.create({
        data: { name, slug, robloxId, teamId, status: teamId ? "ACTIVE" : "FREE_AGENT" },
    });
    revalidatePath("/admin/roster");
    revalidatePath("/");
}
export async function updatePlayer(playerId, formData) {
    const name = String(formData.get("name") ?? "").trim();
    const teamId = String(formData.get("teamId") ?? "") || null;
    const robloxId = String(formData.get("robloxId") ?? "").trim() || null;
    const status = String(formData.get("status") ?? "ACTIVE");
    if (robloxId) {
        const existing = await prisma.player.findUnique({ where: { robloxId } });
        if (existing && existing.id !== playerId) {
            throw new Error(`That Roblox ID is already linked to ${existing.name}. Use Merge Players instead if this is the same person.`);
        }
    }
    await prisma.player.update({
        where: { id: playerId },
        data: { name, teamId, robloxId, status },
    });
    revalidatePath("/admin/roster");
    revalidatePath("/");
}
/**
 * Merges `duplicateId` into `keepId`: moves every transaction, prospect
 * rank history, and season stat row (only for seasons `keepId` doesn't
 * already have a row for) onto the kept player, then deletes the
 * duplicate. Use when the same Roblox user ended up with two Player rows
 * (e.g. a name change wasn't caught before a new one was created).
 */
export async function mergePlayers(formData) {
    const keepId = String(formData.get("keepId") ?? "");
    const duplicateId = String(formData.get("duplicateId") ?? "");
    if (!keepId || !duplicateId || keepId === duplicateId) {
        throw new Error("Pick two different players to merge.");
    }
    const [keep, duplicate] = await Promise.all([
        prisma.player.findUniqueOrThrow({
            where: { id: keepId },
            include: { prospectRank: true },
        }),
        prisma.player.findUniqueOrThrow({
            where: { id: duplicateId },
            include: { seasonStats: true, prospectRankHistory: true, prospectRank: true },
        }),
    ]);
    const keepSeasonIds = new Set((await prisma.playerSeasonStat.findMany({ where: { playerId: keepId } })).map((s) => s.seasonId));
    const statsToMove = duplicate.seasonStats.filter((s) => !keepSeasonIds.has(s.seasonId));
    const statsToDrop = duplicate.seasonStats.filter((s) => keepSeasonIds.has(s.seasonId));
    await prisma.$transaction([
        prisma.transactionAsset.updateMany({ where: { playerId: duplicateId }, data: { playerId: keepId } }),
        prisma.prospectRankHistory.updateMany({
            where: { playerId: duplicateId },
            data: { playerId: keepId },
        }),
        ...statsToMove.map((s) => prisma.playerSeasonStat.update({ where: { id: s.id }, data: { playerId: keepId } })),
        ...statsToDrop.map((s) => prisma.playerSeasonStat.delete({ where: { id: s.id } })),
        // Keep the better-known robloxId if the surviving row doesn't have one yet.
        ...(!keep.robloxId && duplicate.robloxId
            ? [prisma.player.update({ where: { id: keepId }, data: { robloxId: duplicate.robloxId } })]
            : []),
        // Carry over the duplicate's current prospect rank only if the kept
        // player doesn't already have one (ProspectRank.playerId is unique).
        ...(!keep.prospectRank && duplicate.prospectRank
            ? [
                prisma.prospectRank.update({
                    where: { id: duplicate.prospectRank.id },
                    data: { playerId: keepId },
                }),
            ]
            : []),
        prisma.player.delete({ where: { id: duplicateId } }),
    ]);
    revalidatePath("/admin/roster");
    revalidatePath("/");
}
export async function signPlayer(formData) {
    const playerId = String(formData.get("playerId") ?? "");
    const teamId = String(formData.get("teamId") ?? "");
    if (!playerId || !teamId)
        throw new Error("Player and team are required.");
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
export async function releasePlayer(formData) {
    const playerId = String(formData.get("playerId") ?? "");
    if (!playerId)
        throw new Error("Player is required.");
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
export async function tradePlayers(formData) {
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
        ...teamAPlayers.map((playerId) => prisma.player.update({ where: { id: playerId }, data: { teamId: teamBId } })),
        ...teamBPlayers.map((playerId) => prisma.player.update({ where: { id: playerId }, data: { teamId: teamAId } })),
        prisma.transaction.create({
            data: { type: "TRADE", notes, assets: { create: assets } },
        }),
    ]);
    revalidatePath("/admin/roster");
    revalidatePath("/");
}
export async function previewRosterImport(formData) {
    const file = formData.get("file");
    let text = String(formData.get("csvText") ?? "");
    if (file instanceof File && file.size > 0) {
        text = await file.text();
    }
    if (!text.trim()) {
        throw new Error("Provide a CSV file or paste CSV text.");
    }
    const parsedTeams = parseRosterCsv(text);
    if (parsedTeams.length === 0) {
        throw new Error("Couldn't find any teams/players in that CSV.");
    }
    // The sheet lists Roblox usernames. Resolve each to its stable numeric
    // Roblox user ID up front, so a player stays matched to the same
    // Player row (and page) even after they change their username.
    const allNames = parsedTeams.flatMap((t) => t.players);
    const robloxIds = await resolveRobloxIds(allNames);
    const teams = parsedTeams.map((t) => ({
        csvName: t.csvName,
        players: t.players.map((name) => ({
            name,
            robloxId: robloxIds.get(name.toLowerCase())?.id ?? null,
        })),
    }));
    const pending = await prisma.pendingRosterImport.create({ data: { data: { teams } } });
    redirect(`/admin/roster?importId=${pending.id}`);
}
export async function cancelRosterImport(formData) {
    const importId = String(formData.get("importId") ?? "");
    if (!importId) return;
    await prisma.pendingRosterImport.delete({ where: { id: importId } }).catch(() => {});
    redirect("/admin/roster");
}
export async function commitRosterImport(formData) {
    const importId = String(formData.get("importId") ?? "");
    const pending = await prisma.pendingRosterImport.findUniqueOrThrow({ where: { id: importId } });
    const teamsData = pending.data.teams;
    const selections = teamsData
        .map((team, i) => ({ team, teamId: String(formData.get(`teamId_${i}`) ?? "") }))
        .filter((s) => s.teamId);
    // A CSV like the full roster sheet can be 150-200+ players. Looking each
    // one up (and each slug candidate) with its own round trip serialized
    // hundreds of sequential DB calls — slow enough to hit the serverless
    // function's time limit mid-import, which both aborted the request and
    // left only whatever had committed so far. Batch it into a couple of
    // bulk reads instead.
    const robloxIds = [];
    const names = [];
    for (const { team } of selections) {
        for (const p of team.players) {
            if (p.robloxId) robloxIds.push(p.robloxId);
            else names.push(p.name);
        }
    }
    const existingPlayers = selections.length === 0
        ? []
        : await prisma.player.findMany({
            where: {
                OR: [
                    ...(robloxIds.length ? [{ robloxId: { in: robloxIds } }] : []),
                    ...(names.length ? [{ name: { in: names } }] : []),
                ],
            },
        });
    const byRobloxId = new Map(existingPlayers.filter((p) => p.robloxId).map((p) => [p.robloxId, p]));
    const byName = new Map(existingPlayers.map((p) => [p.name, p]));
    const existingSlugs = new Set((await prisma.player.findMany({ select: { slug: true } })).map((p) => p.slug));
    function nextSlug(name) {
        const base = slugify(name) || "player";
        let slug = base;
        let n = 1;
        while (existingSlugs.has(slug)) {
            n += 1;
            slug = `${base}-${n}`;
        }
        existingSlugs.add(slug);
        return slug;
    }
    const updates = [];
    const creates = new Map();
    for (const { team, teamId } of selections) {
        for (const { name, robloxId } of team.players) {
            const existing = (robloxId && byRobloxId.get(robloxId)) || byName.get(name);
            if (existing) {
                updates.push(prisma.player.update({
                    where: { id: existing.id },
                    data: {
                        teamId,
                        status: "ACTIVE",
                        name,
                        // Only backfill robloxId if this player didn't already have
                        // a (possibly different) one on record.
                        ...(robloxId && !existing.robloxId ? { robloxId } : {}),
                    },
                }));
                // Claim it so a later duplicate of this same person in the
                // import updates this row again instead of creating a new one.
                if (robloxId) byRobloxId.set(robloxId, existing);
                byName.set(name, existing);
            } else {
                // Same claim, for a person who appears more than once but
                // isn't in the DB yet — collapse to a single create.
                const key = robloxId ?? `name:${name}`;
                creates.set(key, { name, slug: creates.get(key)?.slug ?? nextSlug(name), robloxId, teamId, status: "ACTIVE" });
            }
        }
    }
    if (creates.size > 0) {
        await prisma.player.createMany({ data: Array.from(creates.values()) });
    }
    if (updates.length > 0) {
        await prisma.$transaction(updates);
    }
    await prisma.pendingRosterImport.delete({ where: { id: importId } });
    revalidatePath("/admin/roster");
    revalidatePath("/");
    redirect(`/admin/roster?imported=${creates.size + updates.length}`);
}
