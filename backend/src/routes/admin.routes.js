const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const adminController = require('../controllers/admin.controller');
const router = express.Router();

router.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN'));

// Stats
router.get('/stats', adminController.getStats);

// Salons
router.get('/salons', adminController.listSalons);
router.put('/salons/:id/approve', adminController.approveSalon);
router.put('/salons/:id/toggle', adminController.toggleSalonActive);

// Reservations
router.get('/reservations', adminController.listReservations);

module.exports = router;