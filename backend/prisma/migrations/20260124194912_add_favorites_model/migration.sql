/*
  Warnings:

  - You are about to drop the column `type` on the `salons` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "salons" DROP COLUMN "type";

-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "salon_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "favorites_client_id_salon_id_key" ON "favorites"("client_id", "salon_id");

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_salon_id_fkey" FOREIGN KEY ("salon_id") REFERENCES "salons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
