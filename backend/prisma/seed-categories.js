const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedCategories() {
  const categories = [
    { name: 'PEDICURE', icon: '💅', sortOrder: 1 },
    { name: 'MANICURE', icon: '💅', sortOrder: 2 },
    { name: 'COIFFURE', icon: '✂️', sortOrder: 3 },
    { name: 'BARBE', icon: '🪒', sortOrder: 4 },
    { name: 'SOIN_VISAGE', icon: '🧖', sortOrder: 5 },
    { name: 'EPILATION', icon: '💇', sortOrder: 6 },
    { name: 'MASSAGE', icon: '💆', sortOrder: 7 },
    { name: 'BRONZAGE', icon: '☀️', sortOrder: 8 },
    { name: 'AUTRE', icon: '📦', sortOrder: 999 }
  ];

  for (const category of categories) {
    await prisma.serviceCategory.upsert({
      where: { name: category.name },
      update: category,
      create: category
    });
  }

  console.log('Categories seeded successfully');
}

seedCategories()
  .catch(console.error)
  .finally(() => prisma.$disconnect());