const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const {
  registerClientValidation,
  registerSalonValidation,
  loginValidation
} = require('../middlewares/validation');
const {
  loginLimiter,
  registerLimiter,
  refreshTokenLimiter
} = require('../middlewares/rateLimit.middleware');

const router = express.Router();

// Public routes
router.post('/register/client', registerLimiter, registerClientValidation, authController.registerClient);
router.post('/register/salon-owner', registerLimiter, registerSalonValidation, authController.registerSalonOwner);
router.post('/login', loginLimiter, loginValidation, authController.login);
router.post('/refresh', refreshTokenLimiter, authController.refreshToken);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authenticate, authController.logout);

module.exports = router;