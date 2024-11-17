/*
  Warnings:

  - You are about to drop the column `directory` on the `uploaded_files` table. All the data in the column will be lost.
  - Added the required column `path` to the `uploaded_files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "uploaded_files" DROP COLUMN "directory",
ADD COLUMN     "path" TEXT NOT NULL;
