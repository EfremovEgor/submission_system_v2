/*
  Warnings:

  - You are about to drop the `Submission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Symposium` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Topic` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Symposium" DROP CONSTRAINT "Symposium_conference_id_fkey";

-- DropForeignKey
ALTER TABLE "Topic" DROP CONSTRAINT "Topic_symposium_id_fkey";

-- DropTable
DROP TABLE "Submission";

-- DropTable
DROP TABLE "Symposium";

-- DropTable
DROP TABLE "Topic";

-- CreateTable
CREATE TABLE "submissions" (
    "id" SERIAL NOT NULL,
    "local_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "title_ru" TEXT,
    "abstract" TEXT NOT NULL,
    "abstract_ru" TEXT,
    "keywords" TEXT NOT NULL,
    "keywords_ru" TEXT,
    "presentation_format" TEXT NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "symposiums" (
    "id" SERIAL NOT NULL,
    "conference_id" INTEGER NOT NULL,
    "name" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "symposiums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topics" (
    "id" SERIAL NOT NULL,
    "symposium_id" INTEGER,
    "name" TEXT NOT NULL,
    "name_ru" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "symposiums" ADD CONSTRAINT "symposiums_conference_id_fkey" FOREIGN KEY ("conference_id") REFERENCES "conferences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_symposium_id_fkey" FOREIGN KEY ("symposium_id") REFERENCES "symposiums"("id") ON DELETE SET NULL ON UPDATE CASCADE;
