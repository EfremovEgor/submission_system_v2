/*
  Warnings:

  - Made the column `name` on table `symposiums` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "symposiums" ADD COLUMN     "name_ru" TEXT,
ALTER COLUMN "name" SET NOT NULL;
