/*
  Warnings:

  - You are about to drop the column `isPublic` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "isPublic",
ADD COLUMN     "postStatus" TEXT DEFAULT 'public',
ALTER COLUMN "createdAt" SET DEFAULT NOW(),
ALTER COLUMN "updatedAt" SET DEFAULT NOW();
