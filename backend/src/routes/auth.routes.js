const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const {
  registerClientValidation,
  registerSalonValidation,
  loginValidation
} = require('../middlewares/validation');

const router = express.Router();

// Public routes
router.post('/register/client', registerClientValidation, authController.registerClient);
router.post('/register/salon-owner', registerSalonValidation, authController.registerSalonOwner);
router.post('/login', loginValidation, authController.login);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.get('/me', authenticate, authController.getMe);

module.exports = router;