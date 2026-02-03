-- CreateTable
CREATE TABLE "coiffeur_pauses" (
    "id" TEXT NOT NULL,
    "disponibilite_id" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "reason" TEXT,

    CONSTRAINT "coiffeur_pauses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "coiffeur_pauses" ADD CONSTRAINT "coiffeur_pauses_disponibilite_id_fkey" FOREIGN KEY ("disponibilite_id") REFERENCES "disponibilites_coiffeur"("id") ON DELETE CASCADE ON UPDATE CASCADE;
