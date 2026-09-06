export type ParsedGameLine = {
  away: string;
  home: string;
  location?: string;
};

export type ParsedRound = {
  round: string;
  scheduledTime?: string;
  games: ParsedGameLine[];
};

const LOCATION_PATTERN = /^[A-Za-z]{1,4}\d+$/;

/**
 * Parses the round/schedule text format:
 *
 * R1\t7PM EST
 * \tSt Louis Archers\tNashville Blues  LS1
 * \tBoston Bengals\tChicago Breeze  LS2
 *
 * A non-indented line starts a new round ("R1" + time). Each indented line
 * below it is one matchup: away team, then home team followed by an
 * optional trailing location code (e.g. "LS1").
 */
export function parseScheduleText(text: string): ParsedRound[] {
  const rounds: ParsedRound[] = [];
  let current: ParsedRound | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    if (!rawLine.trim()) continue;
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
    let location: string | undefined;
    let home = homeRaw;
    if (homeTokens.length > 1 && LOCATION_PATTERN.test(homeTokens[homeTokens.length - 1])) {
      location = homeTokens[homeTokens.length - 1];
      home = homeTokens.slice(0, -1).join(" ");
    }
    current.games.push({ away: awayRaw, home, location });
  }

  return rounds;
}
