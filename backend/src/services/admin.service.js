const prisma = require('../config/database');

class AdminService {
  async getStats() {
    const [salonsTotal, salonsPending, reservationsLast30] = await Promise.all([
      prisma.salon.count(),
      prisma.salon.count({ where: { isActive: false } }),
      prisma.rendezVous.count({
        where: {
          date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      })
    ]);
    return { salonsTotal, salonsPending, reservationsLast30 };
  }

  async listSalons({ q, isActive, pending }) {
    const where = {
      ...(q && { OR: [{ name: { contains: q, mode: 'insensitive' } }, { city: { contains: q, mode: 'insensitive' } }] }),
      ...(isActive !== undefined ? { isActive: isActive === 'true' } : {}),
      ...(pending ? { isActive: false } : {})
    };
    return prisma.salon.findMany({
      where,
      include: {
        owner: { select: { id: true, fullName: true, email: true } },
        services: true,
        coiffeurs: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async approveSalon(id) {
    // business rule: approving = set isActive true
    return prisma.salon.update({
      where: { id },
      data: { isActive: true, updatedAt: new Date() }
    });
  }

  async toggleSalonActive(id) {
    const salon = await prisma.salon.findUnique({ where: { id } });
    if (!salon) throw new Error('Salon not found');
    return prisma.salon.update({
      where: { id },
      data: { isActive: !salon.isActive, updatedAt: new Date() }
    });
  }

  async listReservations({ status, date, salonId }) {
    const where = {
      ...(status && status !== 'all' && { status }),
      ...(salonId && { salonId }),
      ...(date && { date: new Date(date) })
    };
    const rdvs = await prisma.rendezVous.findMany({
      where,
      include: {
        client: { select: { id: true, fullName: true, email: true, phone: true } },
        salon: { select: { id: true, name: true, city: true } },
        service: true,
        services: { include: { service: true } },
        coiffeur: true
      },
      orderBy: [{ date: 'desc' }, { startTime: 'desc' }]
    });
    return rdvs.map(rdv => ({
      ...rdv,
      totalPrice:
        rdv.services?.reduce((s, rs) => s + (rs.service?.price || 0), 0) ||
        rdv.service?.price || 0,
      totalDuration:
        rdv.services?.reduce((s, rs) => s + (rs.service?.duration || 0), 0) ||
        rdv.service?.duration || 0
    }));
  }
  async listClients({ q, isActive }) {
  const where = {
    role: 'CLIENT',
    ...(q && {
      OR: [
        { fullName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } }
      ]
    }),
    ...(isActive !== undefined ? { isActive: isActive === 'true' } : {})
  };
  return prisma.user.findMany({
    where,
    select: { id: true, fullName: true, email: true, phone: true, isActive: true, createdAt: true },
    orderBy: { createdAt: 'desc' }
  });
}

async toggleClientActive(id) {
  const user = await prisma.user.findUnique({ where: { id }, select: { role: true, isActive: true } });
  if (!user) throw new Error('Client not found');
  if (user.role !== 'CLIENT') throw new Error('Only CLIENT accounts can be toggled');
  return prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive, updatedAt: new Date() },
    select: { id: true, fullName: true, email: true, phone: true, isActive: true }
  });
}

}

module.exports = new AdminService();