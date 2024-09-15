/*
  Warnings:

  - A unique constraint covering the columns `[registration_token]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "users_registration_token_key" ON "users"("registration_token");
