/*
  Warnings:

  - You are about to drop the column `presentation_format` on the `conference_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "conference_settings" DROP COLUMN "presentation_format",
ADD COLUMN     "presentation_formats" TEXT[] DEFAULT ARRAY['online', 'offline']::TEXT[];
