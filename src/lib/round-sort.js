// Natural sort for round labels like "R1", "R2", … "R10", "R11" so they
// order numerically instead of lexicographically (which would put "R10"
// right after "R1", before "R2"). Falls back to plain string comparison
// for labels with no trailing number (e.g. playoff round names).
function parseRound(round) {
  const match = round.match(/^(\D*)(\d+)(\D*)$/);
  if (!match) return [round, 0, ""];
  return [match[1], parseInt(match[2], 10), match[3]];
}
export function compareRounds(a, b) {
  const [prefixA, numA, suffixA] = parseRound(a);
  const [prefixB, numB, suffixB] = parseRound(b);
  if (prefixA !== prefixB) return prefixA.localeCompare(prefixB);
  if (numA !== numB) return numA - numB;
  return suffixA.localeCompare(suffixB);
}
