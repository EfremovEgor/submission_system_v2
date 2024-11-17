/*
  Warnings:

  - You are about to drop the column `manuscript_file` on the `submissions` table. All the data in the column will be lost.
  - You are about to drop the column `presentation_file` on the `submissions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "submissions" DROP COLUMN "manuscript_file",
DROP COLUMN "presentation_file",
ADD COLUMN     "manuscript_file_id" INTEGER,
ADD COLUMN     "presentation_file_id" INTEGER;

-- CreateTable
CREATE TABLE "uploaded_files" (
    "id" SERIAL NOT NULL,
    "file_name" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "directory" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uploaded_files_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_presentation_file_id_fkey" FOREIGN KEY ("presentation_file_id") REFERENCES "uploaded_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_manuscript_file_id_fkey" FOREIGN KEY ("manuscript_file_id") REFERENCES "uploaded_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
