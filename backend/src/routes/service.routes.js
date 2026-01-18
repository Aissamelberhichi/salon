const express = require('express');
const serviceController = require('../controllers/service.controller');
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

const createServiceValidation = [
  body('name').trim().notEmpty().withMessage('Service name is required'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('description').optional().trim(),
  body('categoryId').notEmpty().withMessage('Category ID is required'),
  validate
];

const updateServiceValidation = [
  body('name').optional().trim().notEmpty(),
  body('duration').optional().isInt({ min: 1 }),
  body('price').optional().isFloat({ min: 0 }),
  body('description').optional().trim(),
  body('categoryId').optional().isUUID().withMessage('Invalid category ID'),
  body('isActive').optional().isBoolean(),
  validate
];

// Public routes
router.get('/:salonId', serviceController.getServices);
router.get('/:salonId/by-category', serviceController.getServicesByCategory);
router.get('/categories/all', serviceController.getAllCategories);

// Protected routes
router.post('/:salonId', 
  authenticate, 
  authorize('SALON_OWNER', 'ADMIN'), 
  createServiceValidation, 
  serviceController.createService
);

router.put('/:id', 
  authenticate, 
  authorize('SALON_OWNER', 'ADMIN'), 
  updateServiceValidation, 
  serviceController.updateService
);

router.delete('/:id', 
  authenticate, 
  authorize('SALON_OWNER', 'ADMIN'), 
  serviceController.deleteService
);

module.exports = router;