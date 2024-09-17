/*
  Warnings:

  - A unique constraint covering the columns `[acronym]` on the table `conferences` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "conferences_acronym_key" ON "conferences"("acronym");
