const express = require('express');
const emailController = require('../controllers/email.controller');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Middleware de validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Erreur de validation',
      errors: errors.array() 
    });
  }
  next();
};

// Validation pour l'envoi d'email
const emailValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email valide requis'),
  validate
];

// Validation pour la réinitialisation du mot de passe
const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Token requis'),
  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('Le mot de passe doit contenir entre 8 et 128 caractères')
    .matches(/^(?=.*[a-z])/)
    .withMessage('Le mot de passe doit contenir au moins une lettre minuscule')
    .matches(/^(?=.*[A-Z])/)
    .withMessage('Le mot de passe doit contenir au moins une lettre majuscule')
    .matches(/^(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins un chiffre')
    .matches(/^(?=.*[@$!%*?&])/)
    .withMessage('Le mot de passe doit contenir au moins un caractère spécial (@$!%*?&)'),
  validate
];

// Routes publiques
router.get('/verify', emailController.verifyEmail);
router.post('/resend-verification', emailValidation, emailController.resendVerification);
router.post('/request-password-reset', emailValidation, emailController.requestPasswordReset);
router.post('/reset-password', resetPasswordValidation, emailController.resetPassword);

module.exports = router;
