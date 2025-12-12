const express = require('express');
const coiffeurController = require('../controllers/coiffeur.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');

const router = express.Router();

const validate = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const createCoiffeurValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('phone').optional().trim(),
  body('specialty').optional().trim(),
  body('bio').optional().trim(),
  body('photo').optional().isURL().withMessage('Valid photo URL required'),
  body('bufferMinutes').optional().isInt({ min: 0, max: 120 }).withMessage('bufferMinutes must be between 0 and 120'),
  validate
];

const updateCoiffeurValidation = [
  body('fullName').optional().trim().notEmpty(),
  body('email').optional().isEmail(),
  body('phone').optional().trim(),
  body('specialty').optional().trim(),
  body('bio').optional().trim(),
  body('photo').optional().isURL(),
  body('isActive').optional().isBoolean(),
  body('bufferMinutes').optional().isInt({ min: 0, max: 120 }),
  validate
];

// Public route
router.get('/:salonId', coiffeurController.getCoiffeurs);

// Protected routes
router.post('/:salonId', 
  authenticate, 
  authorize('SALON_OWNER', 'ADMIN'), 
  createCoiffeurValidation, 
  coiffeurController.createCoiffeur
);

router.put('/:id', 
  authenticate, 
  authorize('SALON_OWNER', 'ADMIN'), 
  updateCoiffeurValidation, 
  coiffeurController.updateCoiffeur
);

router.delete('/:id', 
  authenticate, 
  authorize('SALON_OWNER', 'ADMIN'), 
  coiffeurController.deleteCoiffeur
);

module.exports = router;