const LOCATION_PATTERN = /^[A-Za-z]{1,4}\d+$/;
const TRAILING_LOCATION_RE = /\s+([A-Za-z]{1,4}\d+)$/;
const TRAILING_TIME_RE = /\s+(\d{1,2}(?::\d{2})?\s*[AaPp]\.?[Mm]\.?)$/;

// "Jailbirds @ AtlantaRebels 7PM LS1" — away team, "@", then home team with
// an optional trailing time and/or location code.
function parseAtGameLine(line) {
  const atIdx = line.indexOf("@");
  const away = line.slice(0, atIdx).trim();
  let rest = line.slice(atIdx + 1).trim();
  let location;
  let scheduledTime;
  const locMatch = rest.match(TRAILING_LOCATION_RE);
  if (locMatch) {
    location = locMatch[1];
    rest = rest.slice(0, locMatch.index).trim();
  }
  const timeMatch = rest.match(TRAILING_TIME_RE);
  if (timeMatch) {
    scheduledTime = timeMatch[1].replace(/\s+/g, " ").toUpperCase();
    rest = rest.slice(0, timeMatch.index).trim();
  }
  const home = rest.trim();
  if (!away || !home) return null;
  return { away, home, location, scheduledTime };
}

/**
 * Parses two round/schedule text shapes:
 *
 * 1) Tab-indented, round-level time:
 *    R1\t7PM EST
 *    \tSt Louis Archers\tNashville Blues  LS1
 *    \tBoston Bengals\tChicago Breeze  LS2
 *
 * 2) Flat, per-game time ("@" separated):
 *    ROUND 1
 *    Jailbirds @ AtlantaRebels 7PM LS1
 *    Firebirds @ NewYorkBombers 7PM LS2
 *
 * A non-indented line with no "@" starts a new round (its own label, plus
 * an optional trailing time shared by every game under it). A line
 * containing "@" is always a game line (away @ home, with an optional
 * trailing time and/or location code) regardless of indentation. Any other
 * indented line is a tab-separated game line (away, home + location code)
 * under the old format, using the round's shared time.
 */
export function parseScheduleText(text) {
  const rounds = [];
  let current = null;
  for (const rawLine of text.split(/\r?\n/)) {
    if (!rawLine.trim()) continue;

    if (rawLine.includes("@")) {
      const game = parseAtGameLine(rawLine.trim());
      if (game && current) current.games.push(game);
      continue;
    }

    const isIndented = /^[\t ]/.test(rawLine);
    const parts = rawLine
      .split("\t")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    if (parts.length === 0) continue;

    if (!isIndented) {
      const [round, ...rest] = parts;
      current = { round, scheduledTime: rest.join(" ") || undefined, games: [] };
      rounds.push(current);
      continue;
    }

    if (!current || parts.length < 2) continue;
    const [awayRaw, homeRaw] = parts;
    const homeTokens = homeRaw.split(/\s+/).filter(Boolean);
    let location;
    let home = homeRaw;
    if (homeTokens.length > 1 && LOCATION_PATTERN.test(homeTokens[homeTokens.length - 1])) {
      location = homeTokens[homeTokens.length - 1];
      home = homeTokens.slice(0, -1).join(" ");
    }
    current.games.push({ away: awayRaw, home, location });
  }
  return rounds;
}
