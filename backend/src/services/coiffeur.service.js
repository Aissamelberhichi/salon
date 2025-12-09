const prisma = require('../config/database');

class CoiffeurService {
  async createCoiffeur(salonId, ownerId, data) {
    // Verify ownership
    const salon = await prisma.salon.findUnique({
      where: { id: salonId }
    });

    if (!salon || salon.ownerId !== ownerId) {
      throw new Error('Unauthorized');
    }

    const coiffeur = await prisma.coiffeur.create({
      data: {
        salonId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        specialty: data.specialty,
        bio: data.bio,
        photo: data.photo,
        isActive: data.isActive !== undefined ? data.isActive : true
      }
    });

    return coiffeur;
  }

  async getCoiffeursBySalon(salonId, includeInactive = false) {
    const where = {
      salonId,
      ...(includeInactive ? {} : { isActive: true })
    };

    const coiffeurs = await prisma.coiffeur.findMany({
      where,
      orderBy: { fullName: 'asc' }
    });

    return coiffeurs;
  }

  async updateCoiffeur(coiffeurId, ownerId, data) {
    // Verify ownership
    const coiffeur = await prisma.coiffeur.findUnique({
      where: { id: coiffeurId },
      include: { salon: true }
    });

    if (!coiffeur) {
      throw new Error('Coiffeur not found');
    }

    if (coiffeur.salon.ownerId !== ownerId) {
      throw new Error('Unauthorized');
    }

    const updated = await prisma.coiffeur.update({
      where: { id: coiffeurId },
      data: {
        ...(data.fullName && { fullName: data.fullName }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.specialty !== undefined && { specialty: data.specialty }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.photo !== undefined && { photo: data.photo }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        updatedAt: new Date()
      }
    });

    return updated;
  }

  async deleteCoiffeur(coiffeurId, ownerId) {
    // Verify ownership
    const coiffeur = await prisma.coiffeur.findUnique({
      where: { id: coiffeurId },
      include: { salon: true }
    });

    if (!coiffeur) {
      throw new Error('Coiffeur not found');
    }

    if (coiffeur.salon.ownerId !== ownerId) {
      throw new Error('Unauthorized');
    }

    await prisma.coiffeur.delete({
      where: { id: coiffeurId }
    });

    return { message: 'Coiffeur deleted successfully' };
  }
}

module.exports = new CoiffeurService();