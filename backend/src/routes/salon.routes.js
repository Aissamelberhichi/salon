const express = require('express');
const salonController = require('../controllers/salon.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes (no auth required)
router.get('/', salonController.getAllSalons);

// Protected routes - GET MY SALON (must be BEFORE /:id route)
router.get('/my/salon', 
  authenticate, 
  authorize('SALON_OWNER', 'ADMIN', 'SUPER_ADMIN'), 
  salonController.getMySalon
);

// Public route - get specific salon
router.get('/:id', salonController.getSalon);

// Protected routes - Salon management
router.post('/', 
  authenticate, 
  authorize('SALON_OWNER', 'ADMIN', 'SUPER_ADMIN'), 
  salonController.createSalon
);

router.put('/:id', 
  authenticate, 
  authorize('SALON_OWNER', 'ADMIN', 'SUPER_ADMIN'), 
  salonController.updateSalon
);

router.post('/:id/images', 
  authenticate, 
  authorize('SALON_OWNER', 'ADMIN', 'SUPER_ADMIN'), 
  salonController.addImage
);

router.delete('/images/:imageId', 
  authenticate, 
  authorize('SALON_OWNER', 'ADMIN', 'SUPER_ADMIN'), 
  salonController.deleteImage
);

router.put('/:id/hours', 
  authenticate, 
  authorize('SALON_OWNER', 'ADMIN', 'SUPER_ADMIN'), 
  salonController.updateHours
);

module.exports = router;