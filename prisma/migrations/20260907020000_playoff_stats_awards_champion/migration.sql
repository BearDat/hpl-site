-- DropIndex
DROP INDEX "PlayerSeasonStat_playerId_seasonId_key";

-- AlterTable
ALTER TABLE "PlayerSeasonStat" ADD COLUMN     "isPlayoffs" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Season" ADD COLUMN     "championTeamId" TEXT;

-- CreateTable
CREATE TABLE "Award" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "seasonId" TEXT,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Award_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlayerSeasonStat_playerId_seasonId_isPlayoffs_key" ON "PlayerSeasonStat"("playerId", "seasonId", "isPlayoffs");

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_championTeamId_fkey" FOREIGN KEY ("championTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;

