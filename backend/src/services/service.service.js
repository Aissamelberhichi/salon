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
      categoryId: data.categoryId,  // Utiliser categoryId directement
      name: data.name,
      description: data.description,
      duration: parseInt(data.duration),
      price: parseFloat(data.price),
      isActive: data.isActive !== undefined ? data.isActive : true
    }
  });

  return service;
}

// Ajouter ces méthodes utilitaires
getCategoryIcon(categoryName) {
  const icons = {
    PEDICURE: '💅',
    MANICURE: '💅',
    COIFFURE: '✂️',
    BARBE: '🪒',
    SOIN_VISAGE: '🧖',
    EPILATION: '💇',
    MASSAGE: '💆',
    BRONZAGE: '☀️',
    AUTRE: '📦'
  };
  return icons[categoryName] || '📦';
}

getCategorySortOrder(categoryName) {
  const orders = {
    PEDICURE: 1,
    MANICURE: 2,
    COIFFURE: 3,
    BARBE: 4,
    SOIN_VISAGE: 5,
    EPILATION: 6,
    MASSAGE: 7,
    BRONZAGE: 8,
    AUTRE: 999
  };
  return orders[categoryName] || 999;
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

  async getServicesByCategory(salonId, includeInactive = false) {
    const where = {
      salonId,
      ...(includeInactive ? {} : { isActive: true })
    };

    const services = await prisma.service.findMany({
      where,
      include: {
        category: true  // Inclure les informations de la catégorie
      },
      orderBy: [
        { category: { sortOrder: 'asc' } },
        { name: 'asc' }
      ]
    });

    // Group services by category
    const groupedServices = services.reduce((acc, service) => {
      const categoryName = service.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = {
          category: service.category,
          services: []
        };
      }
      acc[categoryName].services.push(service);
      return acc;
    }, {});

    return groupedServices;
  }

  async getAllCategories() {
    return await prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
  }

async updateService(serviceId, ownerId, data) {
  // Verify ownership
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { salon: true }
  });

  if (!service || service.salon.ownerId !== ownerId) {
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
      ...(data.categoryId && { categoryId: data.categoryId }),  // Utiliser categoryId directement
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