-- CreateTable
CREATE TABLE "ConferenceSettings" (
    "id" SERIAL NOT NULL,
    "conference_id" INTEGER NOT NULL,

    CONSTRAINT "ConferenceSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConferenceSettings_conference_id_key" ON "ConferenceSettings"("conference_id");

-- AddForeignKey
ALTER TABLE "ConferenceSettings" ADD CONSTRAINT "ConferenceSettings_conference_id_fkey" FOREIGN KEY ("conference_id") REFERENCES "conferences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
