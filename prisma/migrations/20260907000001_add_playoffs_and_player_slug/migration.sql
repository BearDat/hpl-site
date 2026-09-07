-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "playoffSeriesId" TEXT;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "slug" TEXT;

-- CreateTable
CREATE TABLE "PlayoffSeries" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "roundName" TEXT,
    "order" INTEGER NOT NULL,
    "bestOf" INTEGER NOT NULL DEFAULT 5,
    "teamAId" TEXT,
    "teamBId" TEXT,
    "teamASeed" INTEGER,
    "teamBSeed" INTEGER,
    "teamAWins" INTEGER NOT NULL DEFAULT 0,
    "teamBWins" INTEGER NOT NULL DEFAULT 0,
    "winnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayoffSeries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlayoffSeries_seasonId_round_order_key" ON "PlayoffSeries"("seasonId", "round", "order");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_playoffSeriesId_fkey" FOREIGN KEY ("playoffSeriesId") REFERENCES "PlayoffSeries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayoffSeries" ADD CONSTRAINT "PlayoffSeries_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayoffSeries" ADD CONSTRAINT "PlayoffSeries_teamAId_fkey" FOREIGN KEY ("teamAId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayoffSeries" ADD CONSTRAINT "PlayoffSeries_teamBId_fkey" FOREIGN KEY ("teamBId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayoffSeries" ADD CONSTRAINT "PlayoffSeries_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

