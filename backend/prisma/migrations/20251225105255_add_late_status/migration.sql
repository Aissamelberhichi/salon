/*
  Warnings:

  - A unique constraint covering the columns `[caissier_id]` on the table `salons` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "RendezVousStatus" ADD VALUE 'LATE';

-- AlterTable
ALTER TABLE "salons" ADD COLUMN     "caissier_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "salons_caissier_id_key" ON "salons"("caissier_id");

-- AddForeignKey
ALTER TABLE "salons" ADD CONSTRAINT "salons_caissier_id_fkey" FOREIGN KEY ("caissier_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
