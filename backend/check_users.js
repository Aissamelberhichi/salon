const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      select: { id: true, fullName: true, email: true, emailVerified: true }
    });
    
    console.log('Clients trouvés:');
    users.forEach(user => {
      console.log(`- ${user.fullName} (${user.email}): emailVerified = ${user.emailVerified}`);
    });
    
    // Si aucun client n'a emailVerified = true, on le met à true pour le premier client
    const unverifiedUsers = users.filter(u => !u.emailVerified);
    if (unverifiedUsers.length > 0) {
      console.log(`\nMise à jour du premier client non vérifié...`);
      await prisma.user.update({
        where: { id: unverifiedUsers[0].id },
        data: { emailVerified: true }
      });
      console.log(`Client ${unverifiedUsers[0].fullName} marqué comme vérifié`);
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
