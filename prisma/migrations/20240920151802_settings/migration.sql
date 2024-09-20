/*
  Warnings:

  - You are about to drop the `ConferenceSettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ConferenceSettings" DROP CONSTRAINT "ConferenceSettings_conference_id_fkey";

-- DropTable
DROP TABLE "ConferenceSettings";

-- CreateTable
CREATE TABLE "conference_settings" (
    "id" SERIAL NOT NULL,
    "conference_id" INTEGER NOT NULL,
    "presentation_format" TEXT NOT NULL DEFAULT 'mixed',

    CONSTRAINT "conference_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conference_settings_conference_id_key" ON "conference_settings"("conference_id");

-- AddForeignKey
ALTER TABLE "conference_settings" ADD CONSTRAINT "conference_settings_conference_id_fkey" FOREIGN KEY ("conference_id") REFERENCES "conferences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
