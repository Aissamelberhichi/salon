const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createFavoritesTable() {
  try {
    console.log('Création de la table favorites...');
    
    // Créer la table favorites manuellement
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "favorites" (
        "id" TEXT NOT NULL,
        "clientId" TEXT NOT NULL,
        "salonId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
      );
    `;

    console.log('Table favorites créée');

    // Créer l'index unique
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "favorites_clientId_salonId_key" ON "favorites"("clientId", "salonId");
    `;

    console.log('Index unique créé');

    // Ajouter les contraintes étrangères
    await prisma.$executeRaw`
      ALTER TABLE "favorites" ADD CONSTRAINT IF NOT EXISTS "favorites_clientId_fkey" 
      FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `;

    console.log('Contrainte clientId créée');

    await prisma.$executeRaw`
      ALTER TABLE "favorites" ADD CONSTRAINT IF NOT EXISTS "favorites_salonId_fkey" 
      FOREIGN KEY ("salonId") REFERENCES "salons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `;

    console.log('Contrainte salonId créée');
    console.log('✅ Table favorites créée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la création de la table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createFavoritesTable();
