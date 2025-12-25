const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { body, query } = require('express-validator');
const clientScoreController = require('../controllers/clientScore.controller');
const router = express.Router();

const validate = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

const addEventValidation = [
  body('eventType').isIn(['NO_SHOW', 'LATE', 'LATE_CANCELLATION', 'ON_TIME', 'EARLY_CANCELLATION', 'POSITIVE_REVIEW', 'NEGATIVE_REVIEW', 'FIRST_BOOKING', 'REPEAT_BOOKING']).withMessage('Invalid event type'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object'),
  validate
];

const queryValidation = [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validate
];

// GET /clients/:id/score - Get client score (client or admin)
router.get('/clients/:clientId/score', authenticate, clientScoreController.getClientScore);

// GET /clients/:id/history - Get client event history (client or admin)
router.get('/clients/:clientId/history', authenticate, queryValidation, clientScoreController.getClientHistory);

// GET /clients/:id/deposit-check - Check if deposit is required (internal use)
router.get('/clients/:clientId/deposit-check', authenticate, clientScoreController.checkDepositRequirement);

// POST /clients/:id/events - Add client event (admin and salon)
router.post('/clients/:clientId/events', authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'SALON_OWNER'), addEventValidation, clientScoreController.addClientEvent);

// GET /admin/clients/scores - Get all clients scores (admin only)
router.get('/admin/clients/scores', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), clientScoreController.getAllClientsScores);

// POST /admin/clients/:id/reset-score - Reset client score (admin only)
router.post('/admin/clients/:clientId/reset-score', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), clientScoreController.resetClientScore);

module.exports = router;
