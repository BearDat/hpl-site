-- CreateTable
CREATE TABLE "PendingScheduleImport" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingScheduleImport_pkey" PRIMARY KEY ("id")
);
