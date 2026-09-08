function parseCsvLine(line) {
  const cells = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      cells.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  cells.push(cur);
  return cells.map((c) => c.trim());
}

/**
 * Parses roster sheets shaped like a wide export: teams laid out side by
 * side in blocks of two columns each (a slot label, a player name), with a
 * "Team,<name>" header row starting each team and a "Roster Cap: x/y" row
 * closing the block. A "PM" slot (team manager) is skipped, not imported
 * as a player. Handles any number of teams per row and any number of
 * stacked blocks.
 */
export function parseRosterCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  const teams = [];
  let currentBlock = [];

  for (const line of lines) {
    const cells = parseCsvLine(line);

    const isHeaderRow = cells.some(
      (c, i) => i % 2 === 0 && c.toLowerCase() === "team" && cells[i + 1]
    );
    if (isHeaderRow) {
      currentBlock = [];
      for (let i = 0; i + 1 < cells.length; i += 2) {
        const label = cells[i];
        const value = cells[i + 1];
        if (label.toLowerCase() === "team" && value) {
          const entry = { csvName: value, players: [] };
          teams.push(entry);
          currentBlock.push(entry);
        } else {
          currentBlock.push(null);
        }
      }
      continue;
    }

    if (cells.some((c) => /roster cap/i.test(c))) {
      currentBlock = [];
      continue;
    }

    if (currentBlock.length === 0) continue;

    for (let i = 0; i + 1 < cells.length; i += 2) {
      const label = cells[i];
      const value = cells[i + 1];
      const team = currentBlock[i / 2];
      if (!team || !value) continue;
      if (!label || label.toLowerCase() === "pm") continue;
      team.players.push(value);
    }
  }

  return teams.filter((t) => t.players.length > 0);
}
