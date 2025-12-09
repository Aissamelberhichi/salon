const prisma = require('../config/database');

class ServiceService {
  async createService(salonId, ownerId, data) {
    // Verify ownership
    const salon = await prisma.salon.findUnique({
      where: { id: salonId }
    });

    if (!salon || salon.ownerId !== ownerId) {
      throw new Error('Unauthorized');
    }

    const service = await prisma.service.create({
      data: {
        salonId,
        name: data.name,
        description: data.description,
        duration: parseInt(data.duration),
        price: parseFloat(data.price),
        isActive: data.isActive !== undefined ? data.isActive : true
      }
    });

    return service;
  }

  async getServicesBySalon(salonId, includeInactive = false) {
    const where = {
      salonId,
      ...(includeInactive ? {} : { isActive: true })
    };

    const services = await prisma.service.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    return services;
  }

  async updateService(serviceId, ownerId, data) {
    // Verify ownership
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { salon: true }
    });

    if (!service) {
      throw new Error('Service not found');
    }

    if (service.salon.ownerId !== ownerId) {
      throw new Error('Unauthorized');
    }

    const updated = await prisma.service.update({
      where: { id: serviceId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.duration && { duration: parseInt(data.duration) }),
        ...(data.price !== undefined && { price: parseFloat(data.price) }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        updatedAt: new Date()
      }
    });

    return updated;
  }

  async deleteService(serviceId, ownerId) {
    // Verify ownership
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { salon: true }
    });

    if (!service) {
      throw new Error('Service not found');
    }

    if (service.salon.ownerId !== ownerId) {
      throw new Error('Unauthorized');
    }

    await prisma.service.delete({
      where: { id: serviceId }
    });

    return { message: 'Service deleted successfully' };
  }
}

module.exports = new ServiceService();