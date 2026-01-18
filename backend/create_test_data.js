const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestData() {
  try {
    const salon = await prisma.salon.findFirst();
    console.log('Salon found:', salon.id);

    const service = await prisma.service.create({
      data: {
        salonId: salon.id,
        name: 'Coupe homme',
        description: 'Coupe de cheveux pour homme',
        duration: 60,
        price: 50.0
      }
    });
    console.log('Service created:', service.id);

    const coiffeur = await prisma.coiffeur.create({
      data: {
        salonId: salon.id,
        fullName: 'Jean Dupont',
        email: 'jean@test.com',
        phone: '+212600000005',
        specialty: 'Coupe homme'
      }
    });
    console.log('Coiffeur created:', coiffeur.id);

    console.log('Test data created successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();