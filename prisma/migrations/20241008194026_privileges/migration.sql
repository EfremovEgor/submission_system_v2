-- CreateTable
CREATE TABLE "chairs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "conference_id" INTEGER NOT NULL,

    CONSTRAINT "chairs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviewers" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "reviewers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locs" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "locs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "co_chairs" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "co_chairs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "chairs" ADD CONSTRAINT "chairs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chairs" ADD CONSTRAINT "chairs_conference_id_fkey" FOREIGN KEY ("conference_id") REFERENCES "conferences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
