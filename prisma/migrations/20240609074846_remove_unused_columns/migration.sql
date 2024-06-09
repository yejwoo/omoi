/*
  Warnings:

  - You are about to drop the column `date1` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `date2` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "createdAt" SET DEFAULT NOW(),
ALTER COLUMN "updatedAt" SET DEFAULT NOW();

-- AlterTable
ALTER TABLE "Image" ALTER COLUMN "createdAt" SET DEFAULT NOW(),
ALTER COLUMN "updatedAt" SET DEFAULT NOW();

-- AlterTable
ALTER TABLE "Like" ALTER COLUMN "createdAt" SET DEFAULT NOW();

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "date1",
DROP COLUMN "date2",
DROP COLUMN "latitude",
DROP COLUMN "longitude",
ADD COLUMN     "date" TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DEFAULT NOW(),
ALTER COLUMN "updatedAt" SET DEFAULT NOW();

-- AlterTable
ALTER TABLE "ReplyComment" ALTER COLUMN "createdAt" SET DEFAULT NOW(),
ALTER COLUMN "updatedAt" SET DEFAULT NOW();

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT NOW(),
ALTER COLUMN "updatedAt" SET DEFAULT NOW();
