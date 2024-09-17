/*
  Warnings:

  - The `allow_ru` column on the `conferences` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "conferences" DROP COLUMN "allow_ru",
ADD COLUMN     "allow_ru" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "start_date" SET DATA TYPE DATE,
ALTER COLUMN "submission_deadline" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "plans" ALTER COLUMN "price" DROP NOT NULL;
