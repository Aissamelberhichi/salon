-- CreateEnum
CREATE TYPE "RendezVousStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "DayOfWeek_DUP" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateTable
CREATE TABLE "rendezvous" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "salon_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "coiffeur_id" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "status" "RendezVousStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rendezvous_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disponibilites_coiffeur" (
    "id" TEXT NOT NULL,
    "coiffeur_id" TEXT NOT NULL,
    "day_of_week" "DayOfWeek_DUP" NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "disponibilites_coiffeur_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rendezvous_client_id_idx" ON "rendezvous"("client_id");

-- CreateIndex
CREATE INDEX "rendezvous_salon_id_idx" ON "rendezvous"("salon_id");

-- CreateIndex
CREATE INDEX "rendezvous_coiffeur_id_idx" ON "rendezvous"("coiffeur_id");

-- CreateIndex
CREATE INDEX "rendezvous_date_idx" ON "rendezvous"("date");

-- CreateIndex
CREATE UNIQUE INDEX "disponibilites_coiffeur_coiffeur_id_day_of_week_key" ON "disponibilites_coiffeur"("coiffeur_id", "day_of_week");

-- AddForeignKey
ALTER TABLE "rendezvous" ADD CONSTRAINT "rendezvous_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendezvous" ADD CONSTRAINT "rendezvous_salon_id_fkey" FOREIGN KEY ("salon_id") REFERENCES "salons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendezvous" ADD CONSTRAINT "rendezvous_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendezvous" ADD CONSTRAINT "rendezvous_coiffeur_id_fkey" FOREIGN KEY ("coiffeur_id") REFERENCES "coiffeurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilites_coiffeur" ADD CONSTRAINT "disponibilites_coiffeur_coiffeur_id_fkey" FOREIGN KEY ("coiffeur_id") REFERENCES "coiffeurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
