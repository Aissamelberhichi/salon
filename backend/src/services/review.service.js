const prisma = require('../config/database');

class ReviewService {
  async getSalonReviews(salonId) {
    return prisma.review.findMany({
      where: { salonId },
      include: {
        client: { select: { id: true, fullName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async canClientReviewSalon(clientId, salonId) {
    const completed = await prisma.rendezVous.findFirst({
      where: {
        clientId,
        salonId,
        status: 'COMPLETED'
      }
    });
    return !!completed;
  }

  async createReview(clientId, salonId, { rating, comment }) {
    // Enforce one review per client per salon
    const existing = await prisma.review.findUnique({
      where: { clientId_salonId: { clientId, salonId } }
    });
    if (existing) throw new Error('Vous avez déjà laissé un avis pour ce salon');

    const can = await this.canClientReviewSalon(clientId, salonId);
    if (!can) throw new Error('Vous devez avoir au moins un rendez-vous terminé pour laisser un avis');

    return prisma.review.create({
      data: {
        clientId,
        salonId,
        rating,
        comment
      },
      include: {
        client: { select: { id: true, fullName: true } }
      }
    });
  }

  async updateReview(reviewId, userId, userRole, { rating, comment }) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { clientId: true, salon: { select: { ownerId: true } } }
    });
    if (!review) throw new Error('Review not found');

    const isOwner = review.clientId === userId;
    const isSalonOwner = review.salon.ownerId === userId;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
    if (!isOwner && !isSalonOwner && !isAdmin) throw new Error('Unauthorized');

    return prisma.review.update({
      where: { id: reviewId },
      data: { rating, comment },
      include: {
        client: { select: { id: true, fullName: true } }
      }
    });
  }

  async deleteReview(reviewId, userId, userRole) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { clientId: true, salon: { select: { ownerId: true } } }
    });
    if (!review) throw new Error('Review not found');

    const isOwner = review.clientId === userId;
    const isSalonOwner = review.salon.ownerId === userId;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
    if (!isOwner && !isSalonOwner && !isAdmin) throw new Error('Unauthorized');

    return prisma.review.delete({
      where: { id: reviewId }
    });
  }

  async updateSalonAverageRating(salonId) {
    // Calculate average rating from all reviews for this salon
    const reviews = await prisma.review.findMany({
      where: { salonId },
      select: { rating: true }
    });

    const averageRating = reviews.length > 0
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(2)
      : 0;

    // Update the salon's average rating
    return prisma.salon.update({
      where: { id: salonId },
      data: { averageRating: parseFloat(averageRating) },
      select: { id: true, averageRating: true }
    });
  }
}

module.exports = new ReviewService();