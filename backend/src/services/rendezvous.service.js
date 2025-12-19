const prisma = require('../config/database');

function parseHHMM(str) {
  const [h, m] = str.split(':').map(Number);
  return h * 60 + m;
}

function toHHMM(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

class RendezVousService {
  // Get nearby salons (géolocalisation)
  async getNearbySalons(lat, lng, radius = 10) {
    const salons = await prisma.salon.findMany({
      where: { isActive: true },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1
        },
        services: {
          where: { isActive: true },
          take: 3
        },
        coiffeurs: {
          where: { isActive: true }
        }
      }
    });

    if (lat && lng) {
      return salons.filter(salon => {
        if (!salon.lat || !salon.lng) return false;
        const distance = this.calculateDistance(lat, lng, salon.lat, salon.lng);
        return distance <= radius;
      });
    }

    return salons;
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  async getAvailableSlots(coiffeurId, date, serviceId) {
    const dayOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][new Date(date).getDay()];

    const availability = await prisma.disponibiliteCoiffeur.findUnique({
      where: {
        coiffeurId_dayOfWeek: {
          coiffeurId,
          dayOfWeek
        }
      }
    });

    if (!availability || !availability.isAvailable) {
      return [];
    }

    let serviceDuration = 30;
    if (serviceId) {
      const service = await prisma.service.findUnique({ where: { id: serviceId } });
      if (service?.duration) serviceDuration = service.duration;
    }

    const coiffeur = await prisma.coiffeur.findUnique({
      where: { id: coiffeurId },
      select: { bufferMinutes: true, salon: { select: { isActive: true } } }
    });
    if (!coiffeur) throw new Error('Coiffeur not found');
    if (coiffeur.salon && coiffeur.salon.isActive === false) {
        return [];
      }
const buffer = coiffeur.bufferMinutes ?? 5;

    const existingRdv = await prisma.rendezVous.findMany({
      where: {
        coiffeurId,
        date: new Date(date),
        status: { in: ['PENDING', 'CONFIRMED'] }
      },
      select: { startTime: true, endTime: true }
    });

    const existingRanges = existingRdv.map(r => ({
      start: parseHHMM(r.startTime),
      end: parseHHMM(r.endTime) + buffer
    }));

    const availStart = parseHHMM(availability.startTime);
    const availEnd = parseHHMM(availability.endTime);

    const step = 5;
    const slots = [];
    
    for (let t = availStart; t + serviceDuration + buffer <= availEnd; t += step) {
      const proposedStart = t;
      const proposedEnd = t + serviceDuration;
      const proposedEndWithBuffer = proposedEnd + buffer;

      const overlaps = existingRanges.some(r =>
        !(proposedStart >= r.end || proposedEndWithBuffer <= r.start)
      );

      if (!overlaps) {
        slots.push({ time: toHHMM(proposedStart), available: true });
      }
    }

    return slots;
  }

  async createRendezVous(clientId, data) {
    const { salonId, serviceIds, coiffeurId, date, startTime, notes } = data;

    if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
      throw new Error('Au moins un service doit être sélectionné');
    }
// Block booking if salon is deactivated
const salonRecord = await prisma.salon.findUnique({ where: { id: salonId }, select: { isActive: true } });
if (!salonRecord || salonRecord.isActive === false) {
  throw new Error('Ce salon est désactivé. Réservation impossible.');
}
    const services = await prisma.service.findMany({
      where: { 
        id: { in: serviceIds },
        salonId: salonId
      }
    });

    if (services.length !== serviceIds.length) {
      throw new Error('Un ou plusieurs services sont introuvables');
    }

    const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);
    const totalPrice = services.reduce((sum, s) => sum + s.price, 0);

    const coiffeur = await prisma.coiffeur.findUnique({
      where: { id: coiffeurId },
      select: { bufferMinutes: true }
    });
    if (!coiffeur) {
      throw new Error('Coiffeur not found');
    }
    const buffer = coiffeur.bufferMinutes ?? 5;

    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + totalDuration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;

    const existingRdvs = await prisma.rendezVous.findMany({
      where: {
        coiffeurId,
        date: new Date(date),
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    });

    const timeToMinutes = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const newStartMin = timeToMinutes(startTime);
    const newEndMin = timeToMinutes(endTime);
    const newEndWithBuffer = newEndMin + buffer;

    for (const rdv of existingRdvs) {
      const rdvStartMin = timeToMinutes(rdv.startTime);
      const rdvEndMin = timeToMinutes(rdv.endTime);
      const rdvEndWithBuffer = rdvEndMin + buffer;

      const overlaps = !(newStartMin >= rdvEndWithBuffer || newEndWithBuffer <= rdvStartMin);
      if (overlaps) {
        throw new Error(
          `Créneau non disponible. Le coiffeur a un rendez-vous de ${rdv.startTime} à ${rdv.endTime} avec ${buffer} min de pause après.`
        );
      }
    }

    const rdv = await prisma.$transaction(async (tx) => {
      const newRdv = await tx.rendezVous.create({
        data: {
          clientId,
          salonId,
          serviceId: serviceIds[0],
          coiffeurId,
          date: new Date(date),
          startTime,
          endTime,
          notes,
          status: 'PENDING',
          totalDuration,
          totalPrice
        }
      });

      await tx.rendezVousService.createMany({
        data: serviceIds.map(serviceId => ({
          rendezVousId: newRdv.id,
          serviceId: serviceId
        }))
      });

      return tx.rendezVous.findUnique({
        where: { id: newRdv.id },
        include: {
          services: {
            include: {
              service: true
            }
          },
          salon: true,
          coiffeur: true,
          client: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true
            }
          }
        }
      });
    });

    return rdv;
  }

  async getClientRendezVous(clientId, status = null) {
    const where = {
      clientId,
      ...(status && { status })
    };

    const rdvs = await prisma.rendezVous.findMany({
      where,
      include: {
        service: true,
        services: {
          include: {
            service: true
          }
        },
        salon: true,
        coiffeur: true
      },
      orderBy: [
        { date: 'desc' },
        { startTime: 'desc' }
      ]
    });

    return rdvs.map(rdv => ({
      ...rdv,
      totalPrice: rdv.totalPrice ?? (rdv.services.reduce((sum, rs) => sum + rs.service.price, 0) || rdv.service?.price || 0),
      totalDuration: rdv.totalDuration ?? (rdv.services.reduce((sum, rs) => sum + rs.service.duration, 0) || rdv.service?.duration || 0)
    }));
  }

  async getSalonRendezVous(salonId, status = null, date = null) {
    const where = {
      salonId,
      ...(status && { status }),
      ...(date && { date: new Date(date) })
    };

    const rdvs = await prisma.rendezVous.findMany({
      where,
      include: {
        client: {
          select: { id: true, fullName: true, email: true, phone: true }
        },
        service: true,
        services: {
          include: { service: true }
        },
        coiffeur: true
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
    });

    return rdvs.map(rdv => ({
      ...rdv,
      totalPrice: rdv.totalPrice ?? (rdv.services?.reduce((sum, rs) => sum + (rs.service?.price || 0), 0) || rdv.service?.price || 0),
      totalDuration: rdv.totalDuration ?? (rdv.services?.reduce((sum, rs) => sum + (rs.service?.duration || 0), 0) || rdv.service?.duration || 0)
    }));
  }

  async getCoiffeurRendezVous(coiffeurId, date = null) {
    const where = {
      coiffeurId,
      status: { in: ['PENDING', 'CONFIRMED'] },
      ...(date && { date: new Date(date) })
    };

    const rdvs = await prisma.rendezVous.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            phone: true
          }
        },
        service: true,
        services: {
          include: {
            service: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    });

    return rdvs.map(rdv => ({
      ...rdv,
      totalPrice: rdv.totalPrice ?? (rdv.services.reduce((sum, rs) => sum + rs.service.price, 0) || rdv.service?.price || 0),
      totalDuration: rdv.totalDuration ?? (rdv.services.reduce((sum, rs) => sum + rs.service.duration, 0) || rdv.service?.duration || 0)
    }));
  }

  async updateRendezVousStatus(rdvId, userId, newStatus, userRole) {
    const rdv = await prisma.rendezVous.findUnique({
      where: { id: rdvId },
      include: { salon: true }
    });

    if (!rdv) {
      throw new Error('Reservation not found');
    }

    if (userRole === 'CLIENT' && rdv.clientId !== userId) {
      throw new Error('Unauthorized');
    }
    if (userRole === 'SALON_OWNER' && rdv.salon.ownerId !== userId) {
      throw new Error('Unauthorized');
    }

    const updated = await prisma.rendezVous.update({
      where: { id: rdvId },
      data: {
        status: newStatus,
        updatedAt: new Date()
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true
          }
        },
        service: true,
        services: {
          include: {
            service: true
          }
        },
        salon: true,
        coiffeur: true
      }
    });

    return updated;
  }

  async setCoiffeurDisponibilite(coiffeurId, ownerId, disponibilites) {
    const coiffeur = await prisma.coiffeur.findUnique({
      where: { id: coiffeurId },
      include: { salon: true }
    });

    if (!coiffeur || coiffeur.salon.ownerId !== ownerId) {
      throw new Error('Unauthorized');
    }

    await prisma.disponibiliteCoiffeur.deleteMany({
      where: { coiffeurId }
    });

    const created = await prisma.disponibiliteCoiffeur.createMany({
      data: disponibilites.map(d => ({
        coiffeurId,
        dayOfWeek: d.dayOfWeek,
        startTime: d.startTime,
        endTime: d.endTime,
        isAvailable: d.isAvailable !== undefined ? d.isAvailable : true
      }))
    });

    return created;
  }
}

module.exports = new RendezVousService();