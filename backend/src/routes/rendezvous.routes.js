const express = require('express');
const rdvController = require('../controllers/rendezvous.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { body, query } = require('express-validator');

const router = express.Router();

const validate = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const createRdvValidation = [
  body('salonId').notEmpty().withMessage('Salon ID required'),
  body('serviceIds').isArray({ min: 1 }).withMessage('Au moins un service requis'),
  body('serviceIds.*').notEmpty().withMessage('Service ID invalide'),
  body('date').isISO8601().withMessage('Valid date required'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time required'),
  body('coiffeurId').optional().notEmpty(),
  body('notes').optional().trim(),
  validate
];

const updateStatusValidation = [
  body('status').isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']).withMessage('Valid status required'),
  validate
];

// Public routes
router.get('/salons/nearby', rdvController.getNearbySalons);
router.get(
  '/available-slots',
  [
    query('coiffeurId').notEmpty().withMessage('coiffeurId required'),
    query('date').isISO8601().withMessage('Valid date required'),
    query('serviceId').optional().isString()
  ],
  rdvController.getAvailableSlots
);
// Client routes
router.post('/book', authenticate, authorize('CLIENT'), createRdvValidation, rdvController.createRendezVous);
router.get('/my-reservations', authenticate, authorize('CLIENT'), rdvController.getMyRendezVous);

// Salon routes
router.get('/salon/:salonId', authenticate, authorize('SALON_OWNER', 'ADMIN'), rdvController.getSalonRendezVous);
router.get('/coiffeur/:coiffeurId', authenticate, authorize('SALON_OWNER', 'COIFFEUR', 'ADMIN'), rdvController.getCoiffeurRendezVous);

// Update status (client can cancel, salon can confirm/complete)
router.put('/:id/status', authenticate, updateStatusValidation, rdvController.updateStatus);

// Set coiffeur availability
router.post('/coiffeur/:coiffeurId/disponibilite', authenticate, authorize('SALON_OWNER', 'ADMIN'), rdvController.setCoiffeurDisponibilite);

module.exports = router;