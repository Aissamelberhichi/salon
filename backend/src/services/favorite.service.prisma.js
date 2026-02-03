const prisma = require('../config/database');

class FavoriteService {
  async addToFavorites(clientId, salonId) {
    // Vérifier si le salon existe
    const salon = await prisma.salon.findUnique({
      where: { id: salonId }
    });
    
    if (!salon) {
      throw new Error('Salon non trouvé');
    }

    // Vérifier si déjà en favoris
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        clientId_salonId: {
          clientId,
          salonId
        }
      }
    });

    if (existingFavorite) {
      throw new Error('Ce salon est déjà dans vos favoris');
    }

    // Ajouter aux favoris
    const favorite = await prisma.favorite.create({
      data: {
        clientId,
        salonId
      }
    });

    return favorite;
  }

  async removeFromFavorites(clientId, salonId) {
    const favorite = await prisma.favorite.findUnique({
      where: {
        clientId_salonId: {
          clientId,
          salonId
        }
      }
    });

    if (!favorite) {
      throw new Error('Ce salon n\'est pas dans vos favoris');
    }

    await prisma.favorite.delete({
      where: {
        clientId_salonId: {
          clientId,
          salonId
        }
      }
    });

    return { message: 'Salon retiré des favoris avec succès' };
  }

  async getFavorites(clientId) {
    const favorites = await prisma.favorite.findMany({
      where: { clientId },
      include: {
        salon: {
          include: {
            _count: {
              select: {
                reviews: true
              }
            },
            reviews: {
              select: {
                rating: true
              }
            }
          }
        }
      }
    });

    return favorites.map(fav => {
      const salon = fav.salon;
      const reviews = salon.reviews || [];
      
      // Calculer la note moyenne
      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

      return {
        ...salon,
        favoriteId: fav.id,
        addedAt: fav.createdAt,
        reviewCount: salon._count.reviews,
        averageRating: parseFloat(averageRating.toFixed(1))
      };
    });
  }

  async isFavorite(clientId, salonId) {
    const favorite = await prisma.favorite.findUnique({
      where: {
        clientId_salonId: {
          clientId,
          salonId
        }
      }
    });

    return { isFavorite: !!favorite };
  }
}

module.exports = new FavoriteService();
