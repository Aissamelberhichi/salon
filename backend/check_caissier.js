const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCaissierSalon() {
  try {
    const caissier = await prisma.user.findUnique({
      where: { email: 'caissier@test.com' },
      include: { caissierSalon: true }
    });
    console.log('Caissier salon:', JSON.stringify(caissier.caissierSalon, null, 2));

    // Also check all salons
    const salons = await prisma.salon.findMany();
    console.log('All salons:', salons.map(s => ({ id: s.id, name: s.name, caissierId: s.caissierId })));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCaissierSalon();