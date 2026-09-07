-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "username" TEXT;

-- Backfill existing admins with a placeholder login so the NOT NULL
-- constraints below can be applied; username defaults to the local part
-- of their email, password is the seed default ("changeme123") and
-- should be changed from Admin Management after first login.
UPDATE "AdminUser"
SET "username" = COALESCE("username", split_part(email, '@', 1)),
    "passwordHash" = COALESCE("passwordHash", '852f2e848f4c5719d3aaadb5a5f65e51:4d56748ac722b1d21e3e7ad976a66d0345aa491acef05e18a879d7a364fdaa8cf03dbc42d2f7a1debeeac3b17c639fe00aa62d93b60aa6df1e6116f480c2809a');

ALTER TABLE "AdminUser" ALTER COLUMN "passwordHash" SET NOT NULL,
ALTER COLUMN "username" SET NOT NULL;

-- AlterTable
ALTER TABLE "Player" DROP COLUMN "position";

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
