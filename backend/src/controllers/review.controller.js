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
      res.status(201).json(review);
    } catch (e) { next(e); }
  }

  async updateReview(req, res, next) {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;
      const review = await reviewService.updateReview(id, req.user.id, req.user.role, { rating, comment });
      res.status(200).json(review);
    } catch (e) { next(e); }
  }

  async deleteReview(req, res, next) {
    try {
      const { id } = req.params;
      await reviewService.deleteReview(id, req.user.id, req.user.role);
      res.status(204).send();
    } catch (e) { next(e); }
  }
}

module.exports = new ReviewController();