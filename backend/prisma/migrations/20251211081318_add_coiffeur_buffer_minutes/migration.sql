/*
  Warnings:

  - You are about to drop the column `break_duration` on the `coiffeurs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "coiffeurs" DROP COLUMN "break_duration",
ADD COLUMN     "bufferMinutes" INTEGER NOT NULL DEFAULT 5;
