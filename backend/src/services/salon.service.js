const prisma = require('../config/database');

class SalonService {
  async createSalon(ownerId, data) {
    const { name, description, address, city, postalCode, country, lat, lng, phone, email, website, type } = data;

    // Check if salon already exists
    const existingSalon = await prisma.salon.findUnique({
      where: { ownerId }
    });

    if (existingSalon) {
      throw new Error('Salon already exists for this owner');
    }

    const salon = await prisma.salon.create({
      data: {
        ownerId,
        name,
        description,
        address,
        city,
        postalCode,
        country: country || 'Morocco',
        lat,
        lng,
        phone,
        email,
        website,
        type: type || 'MIXED' // Type par défaut si non spécifié
      },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    return salon;
  }

  async updateSalon(salonId, ownerId, data) {
    const salon = await prisma.salon.findUnique({
      where: { id: salonId }
    });

    if (!salon) {
      throw new Error('Salon not found');
    }

    if (salon.ownerId !== ownerId) {
      throw new Error('Unauthorized: You do not own this salon');
    }

    const updated = await prisma.salon.update({
      where: { id: salonId },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        images: true,
        hours: true,
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    return updated;
  }

  async getSalonById(salonId) {
    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      include: {
        images: {
          orderBy: { order: 'asc' }
        },
        hours: {
          orderBy: { dayOfWeek: 'asc' }
        },
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!salon) {
      throw new Error('Salon not found');
    }

    return salon;
  }

async getMySalon(ownerId) {
  const salon = await prisma.salon.findUnique({
    where: { ownerId },
    include: {
      images: {
        orderBy: { order: 'asc' }
      },
      hours: {
        orderBy: { dayOfWeek: 'asc' }
      },
      services: {
        orderBy: { name: 'asc' }
      },
      coiffeurs: {
        orderBy: { fullName: 'asc' }
      }
    }
  });

  return salon;
}

  async addImage(salonId, ownerId, imageData) {
    const salon = await prisma.salon.findUnique({
      where: { id: salonId }
    });

    if (!salon || salon.ownerId !== ownerId) {
      throw new Error('Unauthorized');
    }

    const { url, caption, isPrimary } = imageData;

    if (isPrimary) {
      await prisma.salonImage.updateMany({
        where: { salonId, isPrimary: true },
        data: { isPrimary: false }
      });
    }

    const maxOrder = await prisma.salonImage.aggregate({
      where: { salonId },
      _max: { order: true }
    });

    const image = await prisma.salonImage.create({
      data: {
        salonId,
        url,
        caption,
        isPrimary: isPrimary || false,
        order: (maxOrder._max.order || 0) + 1
      }
    });

    return image;
  }

  async deleteImage(imageId, ownerId) {
    const image = await prisma.salonImage.findUnique({
      where: { id: imageId },
      include: { salon: true }
    });

    if (!image) {
      throw new Error('Image not found');
    }

    if (image.salon.ownerId !== ownerId) {
      throw new Error('Unauthorized');
    }

    await prisma.salonImage.delete({
      where: { id: imageId }
    });

    return { message: 'Image deleted successfully' };
  }

  async updateHours(salonId, ownerId, hoursData) {
    const salon = await prisma.salon.findUnique({
      where: { id: salonId }
    });

    if (!salon || salon.ownerId !== ownerId) {
      throw new Error('Unauthorized');
    }

    await prisma.salonHours.deleteMany({
      where: { salonId }
    });

    const hours = await prisma.salonHours.createMany({
      data: hoursData.map(h => ({
        salonId,
        dayOfWeek: h.dayOfWeek,
        openTime: h.openTime,
        closeTime: h.closeTime,
        isClosed: h.isClosed || false
      }))
    });

    return this.getSalonById(salonId);
  }

  async getAllSalons(filters = {}) {
    const { city, isActive = true, limit = 20, offset = 0 } = filters;

    const where = {
      isActive,
      ...(city && { city: { contains: city, mode: 'insensitive' } })
    };

    const salons = await prisma.salon.findMany({
      where,
      include: {
        images: {
          where: { isPrimary: true },
          take: 1
        },
        hours: true
      },
      take: parseInt(limit),
      skip: parseInt(offset),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.salon.count({ where });

    return { salons, total, limit: parseInt(limit), offset: parseInt(offset) };
  }
}

module.exports = new SalonService();