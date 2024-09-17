-- CreateTable
CREATE TABLE "conferences" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "name_ru" TEXT,
    "allow_ru" TEXT,
    "site_url" TEXT,
    "description" TEXT,
    "start_date" TIMESTAMP(3),
    "submission_deadline" TIMESTAMP(3),
    "acronym" TEXT NOT NULL,
    "short_name" TEXT NOT NULL,
    "creator_id" INTEGER NOT NULL,

    CONSTRAINT "conferences_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "conferences" ADD CONSTRAINT "conferences_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
