-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "title" TEXT,
    "affiliation" TEXT,
    "web_page" TEXT,
    "address_line_1" TEXT,
    "address_line_2" TEXT,
    "orcid_id" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "is_registered" BOOLEAN NOT NULL DEFAULT false,
    "registration_token" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
