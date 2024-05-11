/*
  Warnings:

  - You are about to drop the `Map` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Map" DROP CONSTRAINT "Map_postId_fkey";

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "latitude" DROP NOT NULL,
ALTER COLUMN "longitude" DROP NOT NULL;

-- DropTable
DROP TABLE "Map";
