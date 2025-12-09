const prisma = require('../config/database');

class RendezVousService {
  // Get nearby salons (géolocalisation)
  async getNearbySalons(lat, lng, radius = 10) {
    // Simplified: get all active salons
    // In production, implement proper geospatial queries
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

    // Filter by distance if coordinates provided
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
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Get available time slots for a coiffeur on a specific date
  async getAvailableSlots(coiffeurId, date) {
    const dayOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][new Date(date).getDay()];

    // Get coiffeur availability for this day
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

    // Get existing appointments for this date
    const existingRdv = await prisma.rendezVous.findMany({
      where: {
        coiffeurId,
        date: new Date(date),
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    });

    // Generate time slots (every 30 minutes)
    const slots = [];
    const [startHour, startMin] = availability.startTime.split(':').map(Number);
    const [endHour, endMin] = availability.endTime.split(':').map(Number);

    let currentTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    while (currentTime < endTime) {
      const hours = Math.floor(currentTime / 60);
      const minutes = currentTime % 60;
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      // Check if slot is available
      const isBooked = existingRdv.some(rdv => rdv.startTime === timeStr);

      if (!isBooked) {
        slots.push({
          time: timeStr,
          available: true
        });
      }

      currentTime += 30; // 30-minute slots
    }

    return slots;
  }

  // Create a reservation
  async createRendezVous(clientId, data) {
    const { salonId, serviceId, coiffeurId, date, startTime, notes } = data;

    // Verify service exists and get duration
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      throw new Error('Service not found');
    }

    // Calculate end time
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + service.duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;

    // Check for conflicts
    const conflicts = await prisma.rendezVous.findMany({
      where: {
        coiffeurId,
        date: new Date(date),
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          { startTime: { lte: startTime }, endTime: { gt: startTime } },
          { startTime: { lt: endTime }, endTime: { gte: endTime } },
          { startTime: { gte: startTime }, endTime: { lte: endTime } }
        ]
      }
    });

    if (conflicts.length > 0) {
      throw new Error('Time slot already booked');
    }

    // Create reservation
    const rdv = await prisma.rendezVous.create({
      data: {
        clientId,
        salonId,
        serviceId,
        coiffeurId,
        date: new Date(date),
        startTime,
        endTime,
        notes,
        status: 'PENDING'
      },
      include: {
        service: true,
        salon: true,
        coiffeur: true
      }
    });

    return rdv;
  }

  // Get client reservations
  async getClientRendezVous(clientId, status = null) {
    const where = {
      clientId,
      ...(status && { status })
    };

    const rdvs = await prisma.rendezVous.findMany({
      where,
      include: {
        service: true,
        salon: true,
        coiffeur: true
      },
      orderBy: [
        { date: 'desc' },
        { startTime: 'desc' }
      ]
    });

    return rdvs;
  }

  // Get salon reservations
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
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true
          }
        },
        service: true,
        coiffeur: true
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    });

    return rdvs;
  }

  // Get coiffeur reservations
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
        service: true
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    });

    return rdvs;
  }

  // Update reservation status
  async updateRendezVousStatus(rdvId, userId, newStatus, userRole) {
    const rdv = await prisma.rendezVous.findUnique({
      where: { id: rdvId },
      include: { salon: true }
    });

    if (!rdv) {
      throw new Error('Reservation not found');
    }

    // Authorization check
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
        salon: true,
        coiffeur: true
      }
    });

    return updated;
  }

  // Set coiffeur availability
  async setCoiffeurDisponibilite(coiffeurId, ownerId, disponibilites) {
    // Verify ownership
    const coiffeur = await prisma.coiffeur.findUnique({
      where: { id: coiffeurId },
      include: { salon: true }
    });

    if (!coiffeur || coiffeur.salon.ownerId !== ownerId) {
      throw new Error('Unauthorized');
    }

    // Delete existing disponibilites
    await prisma.disponibiliteCoiffeur.deleteMany({
      where: { coiffeurId }
    });

    // Create new disponibilites
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