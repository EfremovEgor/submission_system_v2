/*
  Warnings:

  - Added the required column `conference_id` to the `locs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topic_id` to the `locs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `locs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "locs" ADD COLUMN     "conference_id" INTEGER NOT NULL,
ADD COLUMN     "topic_id" INTEGER NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "locs" ADD CONSTRAINT "locs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locs" ADD CONSTRAINT "locs_conference_id_fkey" FOREIGN KEY ("conference_id") REFERENCES "conferences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locs" ADD CONSTRAINT "locs_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
