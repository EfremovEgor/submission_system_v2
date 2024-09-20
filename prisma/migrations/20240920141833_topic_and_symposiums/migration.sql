-- CreateTable
CREATE TABLE "Submission" (
    "id" SERIAL NOT NULL,
    "local_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "title_ru" TEXT,
    "abstract" TEXT NOT NULL,
    "abstract_ru" TEXT,
    "keywords" TEXT NOT NULL,
    "keywords_ru" TEXT,
    "presentation_format" TEXT NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Symposium" (
    "id" SERIAL NOT NULL,
    "conference_id" INTEGER NOT NULL,
    "name" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Symposium_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" SERIAL NOT NULL,
    "symposium_id" INTEGER,
    "name" TEXT NOT NULL,
    "name_ru" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Symposium" ADD CONSTRAINT "Symposium_conference_id_fkey" FOREIGN KEY ("conference_id") REFERENCES "conferences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_symposium_id_fkey" FOREIGN KEY ("symposium_id") REFERENCES "Symposium"("id") ON DELETE SET NULL ON UPDATE CASCADE;
