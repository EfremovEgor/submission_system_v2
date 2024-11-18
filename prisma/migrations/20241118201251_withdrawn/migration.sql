/*
  Warnings:

  - You are about to drop the column `deleted` on the `submissions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "submissions" DROP COLUMN "deleted",
ADD COLUMN     "withdrawn" BOOLEAN NOT NULL DEFAULT false;
