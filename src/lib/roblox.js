const USERNAMES_ENDPOINT = "https://users.roblox.com/v1/usernames/users";
const AVATAR_ENDPOINT = "https://thumbnails.roblox.com/v1/users/avatar-headshot";
const BATCH_SIZE = 50;

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * Resolves Roblox usernames to their stable numeric user IDs, so a player
 * stays attached to the same Player row even after they change their
 * Roblox username. Best-effort: any username Roblox's API can't resolve
 * (or if the API is unreachable) is simply left out of the returned map
 * rather than failing the whole import.
 *
 * Returns a Map keyed by lowercased username -> { id, name }.
 */
export async function resolveRobloxIds(usernames) {
  const unique = Array.from(new Set(usernames.map((u) => u.trim()).filter(Boolean)));
  const result = new Map();
  for (const batch of chunk(unique, BATCH_SIZE)) {
    try {
      const res = await fetch(USERNAMES_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernames: batch, excludeBannedUsers: false }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const body = await res.json();
      for (const entry of body.data ?? []) {
        const key = String(entry.requestedUsername ?? entry.name ?? "").toLowerCase();
        if (key) result.set(key, { id: String(entry.id), name: entry.name });
      }
    } catch {
      // Roblox API unreachable — those usernames just won't get a robloxId.
    }
  }
  return result;
}

/**
 * Fetches a player's Roblox avatar headshot thumbnail URL. Best-effort —
 * returns null if the Roblox API is unreachable, the user has no avatar
 * yet, or no robloxId is on record.
 */
export async function getAvatarUrl(robloxId, size = "150x150") {
  if (!robloxId) return null;
  try {
    const url = `${AVATAR_ENDPOINT}?userIds=${encodeURIComponent(robloxId)}&size=${size}&format=Png&isCircular=false`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const body = await res.json();
    const entry = body.data?.[0];
    return entry?.state === "Completed" ? entry.imageUrl : null;
  } catch {
    return null;
  }
}
