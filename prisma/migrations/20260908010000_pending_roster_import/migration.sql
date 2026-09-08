-- CreateTable
CREATE TABLE "PendingRosterImport" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingRosterImport_pkey" PRIMARY KEY ("id")
);

