export type Team = {
  code: string;
  name: string;
  color: string;
  wins: number;
  losses: number;
  gamesBack: string;
};

export type Division = {
  name: string;
  teams: Team[];
};

export const divisions: Division[] = [
  {
    name: "East",
    teams: [
      { code: "RHK", name: "Redhawks", color: "#c1391f", wins: 14, losses: 4, gamesBack: "—" },
      { code: "IC", name: "Ironclads", color: "#1f3a5f", wins: 12, losses: 6, gamesBack: "2" },
      { code: "SUN", name: "Suncats", color: "#2f6f4e", wins: 11, losses: 7, gamesBack: "3" },
      { code: "TW", name: "Timberwolves", color: "#d9a441", wins: 9, losses: 9, gamesBack: "5" },
    ],
  },
  {
    name: "West",
    teams: [
      { code: "HK", name: "Harbor Kings", color: "#1f8a8a", wins: 10, losses: 8, gamesBack: "—" },
      { code: "CV", name: "Copper Vipers", color: "#6b3fa0", wins: 9, losses: 9, gamesBack: "1" },
      { code: "RW", name: "Ridgeline Wardens", color: "#5b6b73", wins: 8, losses: 10, gamesBack: "2" },
      { code: "SF", name: "Stone Foxes", color: "#c97a2b", wins: 5, losses: 13, gamesBack: "5" },
    ],
  },
];

export const teamsByCode: Record<string, Team> = Object.fromEntries(
  divisions.flatMap((division) => division.teams.map((team) => [team.code, team]))
);

export type ScoreStatus =
  | { kind: "final"; label: "FINAL" }
  | { kind: "final-extra"; label: string }
  | { kind: "live"; label: string }
  | { kind: "scheduled"; label: string };

export type Score = {
  away: { code: string; runs?: number };
  home: { code: string; runs?: number };
  status: ScoreStatus;
};

export const scores: Score[] = [
  {
    away: { code: "RHK", runs: 6 },
    home: { code: "SF", runs: 3 },
    status: { kind: "final", label: "FINAL" },
  },
  {
    away: { code: "SUN", runs: 5 },
    home: { code: "HK", runs: 5 },
    status: { kind: "final-extra", label: "FINAL/10" },
  },
  {
    away: { code: "CV", runs: 4 },
    home: { code: "RW", runs: 2 },
    status: { kind: "live", label: "LIVE · TOP 7" },
  },
  {
    away: { code: "TW", runs: 7 },
    home: { code: "IC", runs: 2 },
    status: { kind: "final", label: "FINAL" },
  },
  {
    away: { code: "RHK" },
    home: { code: "IC" },
    status: { kind: "scheduled", label: "7:05 PM" },
  },
  {
    away: { code: "SUN" },
    home: { code: "SF" },
    status: { kind: "scheduled", label: "2:00 PM" },
  },
];

export type PipelineEntry = {
  rank: number;
  initials: string;
  name: string;
  team: string;
  color: string;
  movement: { direction: "up" | "down" | "flat"; value?: number };
};

export const pipelineTop5: PipelineEntry[] = [
  { rank: 1, initials: "JO", name: "J. Ortiz", team: "Redhawks", color: "#c1391f", movement: { direction: "up", value: 2 } },
  { rank: 2, initials: "MS", name: "M. Sato", team: "Suncats", color: "#2f6f4e", movement: { direction: "flat" } },
  { rank: 3, initials: "DB", name: "D. Brooks", team: "Ironclads", color: "#1f3a5f", movement: { direction: "up", value: 1 } },
  { rank: 4, initials: "KA", name: "K. Alvarez", team: "Harbor Kings", color: "#1f8a8a", movement: { direction: "down", value: 1 } },
  { rank: 5, initials: "TW", name: "T. Whitfield", team: "Timberwolves", color: "#d9a441", movement: { direction: "up", value: 4 } },
];

export type StatLeader = {
  value: string;
  label: string;
  player: string;
  team: string;
};

export const statLeaders: StatLeader[] = [
  { value: ".412", label: "AVG", player: "J. Ortiz", team: "RHK" },
  { value: "18", label: "HR", player: "M. Sato", team: "SUN" },
  { value: "42", label: "RBI", player: "K. Alvarez", team: "HK" },
  { value: "1.98", label: "ERA", player: "D. Brooks", team: "IC" },
  { value: "22", label: "SB", player: "A. Delgado", team: "RHK" },
];

export const topStory = {
  kicker: "TOP STORY",
  headline: "ORTIZ NAMED PLAYER OF THE WEEK AFTER .500 SERIES",
};
