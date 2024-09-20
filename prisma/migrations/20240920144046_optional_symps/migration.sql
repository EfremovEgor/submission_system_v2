-- AlterTable
ALTER TABLE "topics" ADD COLUMN     "conference_id" INTEGER;

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_conference_id_fkey" FOREIGN KEY ("conference_id") REFERENCES "conferences"("id") ON DELETE SET NULL ON UPDATE CASCADE;
