-- DropForeignKey
ALTER TABLE "chairs" DROP CONSTRAINT "chairs_conference_id_fkey";

-- DropForeignKey
ALTER TABLE "chairs" DROP CONSTRAINT "chairs_user_id_fkey";

-- AlterTable
ALTER TABLE "submissions" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "chairs" ADD CONSTRAINT "chairs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chairs" ADD CONSTRAINT "chairs_conference_id_fkey" FOREIGN KEY ("conference_id") REFERENCES "conferences"("id") ON DELETE CASCADE ON UPDATE CASCADE;
