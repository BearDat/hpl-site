-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "robloxId" TEXT;

-- AlterTable
ALTER TABLE "PlayerSeasonStat" ADD COLUMN     "atBats" INTEGER,
ADD COLUMN     "gamesPitched" INTEGER,
ADD COLUMN     "gamesPlayed" INTEGER,
ADD COLUMN     "hits" INTEGER,
ADD COLUMN     "inningsPitched" DOUBLE PRECISION,
ADD COLUMN     "onBasePct" DOUBLE PRECISION,
ADD COLUMN     "pitcherStrikeouts" INTEGER,
ADD COLUMN     "pitcherWalks" INTEGER,
ADD COLUMN     "slugging" DOUBLE PRECISION,
ADD COLUMN     "strikeouts" INTEGER,
ADD COLUMN     "walks" INTEGER,
ADD COLUMN     "whip" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "ProspectRankHistory" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProspectRankHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProspectRankHistory_playerId_recordedAt_idx" ON "ProspectRankHistory"("playerId", "recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Player_robloxId_key" ON "Player"("robloxId");

-- AddForeignKey
ALTER TABLE "ProspectRankHistory" ADD CONSTRAINT "ProspectRankHistory_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

