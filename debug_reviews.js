const { PrismaClient } = require('./backend/node_modules/@prisma/client');

async function debugReviews() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== DEBUG DES AVIS ===');
    
    // Vérifier tous les avis
    const allReviews = await prisma.review.findMany({
      include: {
        client: { select: { id: true, fullName: true } },
        salon: { select: { id: true, name: true } }
      }
    });
    
    console.log(`Nombre total d'avis: ${allReviews.length}`);
    
    if (allReviews.length > 0) {
      allReviews.forEach((review, index) => {
        console.log(`\n--- Avis ${index + 1} ---`);
        console.log(`ID: ${review.id}`);
        console.log(`Salon ID: ${review.salonId}`);
        console.log(`Client ID: ${review.clientId}`);
        console.log(`Note: ${review.rating}`);
        console.log(`Commentaire: ${review.comment}`);
        console.log(`Client: ${review.client?.fullName || 'N/A'}`);
        console.log(`Salon: ${review.salon?.name || 'N/A'}`);
        console.log(`Créé le: ${review.createdAt}`);
      });
    } else {
      console.log('Aucun avis trouvé dans la base de données');
    }
    
    // Vérifier les salons
    const salons = await prisma.salon.findMany({
      select: { id: true, name: true }
    });
    
    console.log(`\nNombre de salons: ${salons.length}`);
    salons.forEach((salon, index) => {
      console.log(`Salon ${index + 1}: ${salon.name} (ID: ${salon.id})`);
    });
    
    // Vérifier les clients
    const clients = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      select: { id: true, fullName: true }
    });
    
    console.log(`\nNombre de clients: ${clients.length}`);
    clients.forEach((client, index) => {
      console.log(`Client ${index + 1}: ${client.fullName} (ID: ${client.id})`);
    });
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugReviews();
