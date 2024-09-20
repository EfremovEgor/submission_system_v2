/*
  Warnings:

  - Added the required column `conference_id` to the `submissions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "submissions" ADD COLUMN     "conference_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_conference_id_fkey" FOREIGN KEY ("conference_id") REFERENCES "conferences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
