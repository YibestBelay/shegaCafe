/*
  Warnings:

  - You are about to drop the `Users` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "notes" TEXT;

-- DropTable
DROP TABLE "public"."Users";

-- CreateTable
CREATE TABLE "Usersclear" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Usersclear_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usersclear_email_key" ON "Usersclear"("email");
