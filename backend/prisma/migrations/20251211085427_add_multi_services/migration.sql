-- AlterTable
ALTER TABLE "rendezvous" ALTER COLUMN "service_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "rendezvous_services" (
    "id" TEXT NOT NULL,
    "rendez_vous_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,

    CONSTRAINT "rendezvous_services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rendezvous_services_rendez_vous_id_service_id_key" ON "rendezvous_services"("rendez_vous_id", "service_id");

-- AddForeignKey
ALTER TABLE "rendezvous_services" ADD CONSTRAINT "rendezvous_services_rendez_vous_id_fkey" FOREIGN KEY ("rendez_vous_id") REFERENCES "rendezvous"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendezvous_services" ADD CONSTRAINT "rendezvous_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
