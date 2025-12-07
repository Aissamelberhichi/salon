const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@salon-saas.com' },
    update: {},
    create: {
      fullName: 'Admin User',
      email: 'admin@salon-saas.com',
      phone: '+212600000001',
      role: 'ADMIN',
      passwordHash: adminPassword
    }
  });
  console.log('✅ Admin created:', admin.email);

  // Create Test Client
  const clientPassword = await bcrypt.hash('client123', 10);
  const client = await prisma.user.upsert({
    where: { email: 'client@test.com' },
    update: {},
    create: {
      fullName: 'Test Client',
      email: 'client@test.com',
      phone: '+212600000002',
      role: 'CLIENT',
      passwordHash: clientPassword
    }
  });
  console.log('✅ Client created:', client.email);

  // Create Test Salon Owner
  const ownerPassword = await bcrypt.hash('owner123', 10);
  const owner = await prisma.user.upsert({
    where: { email: 'owner@test.com' },
    update: {},
    create: {
      fullName: 'Test Salon Owner',
      email: 'owner@test.com',
      phone: '+212600000003',
      role: 'SALON_OWNER',
      passwordHash: ownerPassword,
      salon: {
        create: {
          name: 'Elite Hair Salon',
          address: '123 Boulevard Mohamed V, Casablanca',
          lat: 33.5731,
          lng: -7.5898
        }
      }
    }
  });
  console.log('✅ Salon Owner created:', owner.email);

  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });