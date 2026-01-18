-- AlterEnum
ALTER TYPE "ServiceCategory" ADD VALUE 'PEDICURE';
ALTER TYPE "ServiceCategory" ADD VALUE 'MANICURE';
ALTER TYPE "ServiceCategory" ADD VALUE 'COIFFURE';
ALTER TYPE "ServiceCategory" ADD VALUE 'BARBE';
ALTER TYPE "ServiceCategory" ADD VALUE 'SOIN_VISAGE';
ALTER TYPE "ServiceCategory" ADD VALUE 'EPILATION';
ALTER TYPE "ServiceCategory" ADD VALUE 'MASSAGE';
ALTER TYPE "ServiceCategory" ADD VALUE 'BRONZAGE';
ALTER TYPE "ServiceCategory" ADD VALUE 'AUTRE';

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "category" "ServiceCategory" NOT NULL DEFAULT 'AUTRE';
