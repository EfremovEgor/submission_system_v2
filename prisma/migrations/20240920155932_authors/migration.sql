-- CreateTable
CREATE TABLE "authors" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "affiliation" TEXT NOT NULL,
    "web_page" TEXT,
    "country" TEXT NOT NULL,
    "is_corresponding" BOOLEAN NOT NULL DEFAULT false,
    "is_presenter" BOOLEAN NOT NULL DEFAULT false,
    "first_name_ru" TEXT,
    "last_name_ru" TEXT,

    CONSTRAINT "authors_pkey" PRIMARY KEY ("id")
);
