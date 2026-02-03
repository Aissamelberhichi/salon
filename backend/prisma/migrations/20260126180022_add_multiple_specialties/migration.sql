/*
  Warnings:

  - You are about to drop the column `specialty` on the `coiffeurs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "coiffeurs" DROP COLUMN "specialty",
ADD COLUMN     "specialties" TEXT[];
