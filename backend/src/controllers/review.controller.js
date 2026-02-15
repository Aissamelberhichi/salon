const reviewService = require('../services/review.service');

class ReviewController {
  async getSalonReviews(req, res, next) {
    try {
      const { salonId } = req.params;
      const reviews = await reviewService.getSalonReviews(salonId);
      res.status(200).json(reviews);
    } catch (e) { next(e); }
  }

  async createReview(req, res, next) {
    try {
      const { salonId } = req.params;
      const { rating, comment } = req.body;
      const review = await reviewService.createReview(req.user.id, salonId, { rating, comment });
      // Update salon average rating
      await reviewService.updateSalonAverageRating(salonId);
      res.status(201).json(review);
    } catch (e) { next(e); }
  }

  async updateReview(req, res, next) {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;

      // Get review to find salonId
      const review = await reviewService.updateReview(id, req.user.id, req.user.role, { rating, comment });

      // Find the salon and update its average rating
      const prisma = require('../config/database');
      const fullReview = await prisma.review.findUnique({ where: { id }, select: { salonId: true } });
      if (fullReview) {
        await reviewService.updateSalonAverageRating(fullReview.salonId);
      }

      res.status(200).json(review);
    } catch (e) { next(e); }
  }

  async deleteReview(req, res, next) {
    try {
      const { id } = req.params;

      // Get review to find salonId before deletion
      const prisma = require('../config/database');
      const review = await prisma.review.findUnique({ where: { id }, select: { salonId: true } });

      await reviewService.deleteReview(id, req.user.id, req.user.role);

      // Update salon average rating
      if (review) {
        await reviewService.updateSalonAverageRating(review.salonId);
      }

      res.status(204).send();
    } catch (e) { next(e); }
  }
}

module.exports = new ReviewController();