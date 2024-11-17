/*
  Warnings:

  - The primary key for the `uploaded_files` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "submissions" DROP CONSTRAINT "submissions_manuscript_file_id_fkey";

-- DropForeignKey
ALTER TABLE "submissions" DROP CONSTRAINT "submissions_presentation_file_id_fkey";

-- AlterTable
ALTER TABLE "submissions" ALTER COLUMN "manuscript_file_id" SET DATA TYPE TEXT,
ALTER COLUMN "presentation_file_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "uploaded_files" DROP CONSTRAINT "uploaded_files_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "uploaded_files_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "uploaded_files_id_seq";

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_presentation_file_id_fkey" FOREIGN KEY ("presentation_file_id") REFERENCES "uploaded_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_manuscript_file_id_fkey" FOREIGN KEY ("manuscript_file_id") REFERENCES "uploaded_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
