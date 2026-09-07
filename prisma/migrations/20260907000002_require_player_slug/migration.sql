-- AlterTable
ALTER TABLE "Player" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Player_slug_key" ON "Player"("slug");

