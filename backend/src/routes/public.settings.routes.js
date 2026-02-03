const express = require('express');
const publicSettingsController = require('../controllers/public.settings.controller');
const router = express.Router();

// Public endpoint for settings (no authentication required)
// Only returns non-sensitive settings
router.get('/', publicSettingsController.getSettings);

module.exports = router;
