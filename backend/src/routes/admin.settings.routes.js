const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const adminSettingsController = require('../controllers/admin.settings.controller');

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorize('ADMIN', 'SUPER_ADMIN'));

// Get platform settings
router.get('/', adminSettingsController.getSettings);

// Update platform settings
router.put('/', adminSettingsController.updateSettings);

module.exports = router;
