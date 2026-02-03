const prisma = require('../config/database');

class ServiceService {
  async getAllCategories() {
    const categories = await prisma.serviceCategory.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });
    return categories;
  }

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
        categoryId: data.categoryId || null,
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
      include: {
        category: true
      },
      orderBy: { name: 'asc' }
    });

    return services;
  }

  async updateService(serviceId, ownerId, data) {
    console.log('updateService - serviceId:', serviceId);
    console.log('updateService - ownerId:', ownerId);
    console.log('updateService - data:', data);
    
    // First get the service with salon
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { 
        salon: true 
      }
    });

    console.log('updateService - service found:', service);

    if (!service) {
      throw new Error('Service not found');
    }

    console.log('updateService - service.salon.ownerId:', service.salon.ownerId);
    console.log('updateService - comparison:', service.salon.ownerId, '===', ownerId);
    console.log('updateService - types:', typeof service.salon.ownerId, typeof ownerId);

    // Vérification plus robuste avec conversion en string pour comparaison
    const salonOwnerId = String(service.salon.ownerId);
    const requestOwnerId = String(ownerId);
    
    if (salonOwnerId !== requestOwnerId) {
      console.log('updateService - Unauthorized: salon owner does not match request user');
      throw new Error(`Unauthorized - You can only update your own services. Salon owner: ${salonOwnerId}, Request user: ${requestOwnerId}`);
    }

    console.log('updateService - Authorization successful, updating service...');

    const updated = await prisma.service.update({
      where: { id: serviceId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.duration && { duration: parseInt(data.duration) }),
        ...(data.price !== undefined && { price: parseFloat(data.price) }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        updatedAt: new Date()
      }
    });

    console.log('updateService - Service updated successfully:', updated);
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