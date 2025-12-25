-- CreateEnum
CREATE TYPE "ClientLevel" AS ENUM ('RELIABLE', 'NORMAL', 'AT_RISK');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('NO_SHOW', 'LATE', 'LATE_CANCELLATION', 'ON_TIME', 'EARLY_CANCELLATION', 'POSITIVE_REVIEW', 'NEGATIVE_REVIEW', 'FIRST_BOOKING', 'REPEAT_BOOKING');

-- CreateTable
CREATE TABLE "client_scores" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 100,
    "level" "ClientLevel" NOT NULL DEFAULT 'NORMAL',
    "events_count" INTEGER NOT NULL DEFAULT 0,
    "requires_deposit" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_events" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "event_type" "EventType" NOT NULL,
    "score_change" INTEGER NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_scores_client_id_key" ON "client_scores"("client_id");

-- AddForeignKey
ALTER TABLE "client_scores" ADD CONSTRAINT "client_scores_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_events" ADD CONSTRAINT "client_events_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client_scores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
