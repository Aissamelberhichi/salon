const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');
const reviewController = require('../controllers/review.controller');
const router = express.Router();

const validate = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

const createReviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  body('comment').optional().trim().isLength({ min: 1, max: 500 }).withMessage('Comment max 500 chars'),
  validate
];

const updateReviewValidation = [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  body('comment').optional().trim().isLength({ min: 1, max: 500 }).withMessage('Comment max 500 chars'),
  validate
];

// Public: list reviews for a salon
router.get('/salons/:salonId/reviews', reviewController.getSalonReviews);

// Protected: create a review (CLIENT only)
router.post('/salons/:salonId/reviews', authenticate, authorize('CLIENT'), createReviewValidation, reviewController.createReview);

// Protected: update/delete (review owner, salon owner, admin)
router.put('/reviews/:id', authenticate, updateReviewValidation, reviewController.updateReview);
router.delete('/reviews/:id', authenticate, reviewController.deleteReview);

module.exports = router;