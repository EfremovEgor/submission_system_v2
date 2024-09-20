/*
  Warnings:

  - Added the required column `submission_id` to the `authors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "authors" ADD COLUMN     "submission_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "authors" ADD CONSTRAINT "authors_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
