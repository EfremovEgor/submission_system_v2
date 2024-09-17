/*
  Warnings:

  - Added the required column `url_name` to the `plans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "plans" ADD COLUMN     "is_public" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL DEFAULT 1000,
ADD COLUMN     "url_name" TEXT NOT NULL;
