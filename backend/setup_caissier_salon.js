const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupCaissierSalon() {
  try {
    const salonId = '314d241f-de09-4a2e-8987-96fa026bf62c';

    const services = await prisma.service.findMany({
      where: { salonId: salonId }
    });
    console.log('Services in salon:', services.length);

    const coiffeurs = await prisma.coiffeur.findMany({
      where: { salonId: salonId }
    });
    console.log('Coiffeurs in salon:', coiffeurs.length);

    let serviceId, coiffeurId;

    if (services.length === 0) {
      const service = await prisma.service.create({
        data: {
          salonId: salonId,
          name: 'Coupe homme',
          description: 'Coupe de cheveux pour homme',
          duration: 60,
          price: 50.0
        }
      });
      console.log('Service created:', service.id);
      serviceId = service.id;
    } else {
      serviceId = services[0].id;
    }

    if (coiffeurs.length === 0) {
      const coiffeur = await prisma.coiffeur.create({
        data: {
          salonId: salonId,
          fullName: 'Marie Dubois',
          email: 'marie@test.com',
          phone: '+212600000006',
          specialty: 'Coupe homme'
        }
      });
      console.log('Coiffeur created:', coiffeur.id);
      coiffeurId = coiffeur.id;
    } else {
      coiffeurId = coiffeurs[0].id;
    }

    console.log('Service ID:', serviceId);
    console.log('Coiffeur ID:', coiffeurId);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupCaissierSalon();