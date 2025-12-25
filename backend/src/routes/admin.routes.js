const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const adminController = require('../controllers/admin.controller');
const router = express.Router();

router.use(authenticate);

// Stats (Admin only)
router.get('/stats', authorize('ADMIN', 'SUPER_ADMIN'), adminController.getStats);

// Salons (Admin only)
router.get('/salons', authorize('ADMIN', 'SUPER_ADMIN'), adminController.listSalons);
router.put('/salons/:id/approve', authorize('ADMIN', 'SUPER_ADMIN'), adminController.approveSalon);
router.put('/salons/:id/toggle', authorize('ADMIN', 'SUPER_ADMIN'), adminController.toggleSalonActive);

// Clients (SUPER_ADMIN only)
router.get('/clients', authorize('SUPER_ADMIN'), adminController.listClients);
router.put('/clients/:id/toggle', authorize('SUPER_ADMIN'), adminController.toggleClientActive);

// Reservations (Admin and Caissier)
router.get('/reservations', authorize('ADMIN', 'SUPER_ADMIN', 'CAISSIER'), adminController.listReservations);

module.exports = router;