/*
  Warnings:

  - You are about to drop the column `tag` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "tag",
ADD COLUMN     "tags1" TEXT,
ADD COLUMN     "tags2" TEXT,
ALTER COLUMN "createdAt" SET DEFAULT NOW(),
ALTER COLUMN "updatedAt" SET DEFAULT NOW();
