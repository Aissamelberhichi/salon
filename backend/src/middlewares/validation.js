const { body, validationResult } = require('express-validator');

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

// Validation avancée du mot de passe
const passwordValidation = body('password')
  .isLength({ min: 8, max: 128 })
  .withMessage('Le mot de passe doit contenir entre 8 et 128 caractères')
  .matches(/^(?=.*[a-z])/)
  .withMessage('Le mot de passe doit contenir au moins une lettre minuscule')
  .matches(/^(?=.*[A-Z])/)
  .withMessage('Le mot de passe doit contenir au moins une lettre majuscule')
  .matches(/^(?=.*\d)/)
  .withMessage('Le mot de passe doit contenir au moins un chiffre')
  .matches(/^(?=.*[@$!%*?&])/)
  .withMessage('Le mot de passe doit contenir au moins un caractère spécial (@$!%*?&)');

// Validation de l'email avec format strict
const emailValidation = body('email')
  .isEmail()
  .withMessage('Veuillez fournir une adresse e-mail valide')
  .normalizeEmail()
  .isLength({ max: 255 })
  .withMessage('L\'email ne doit pas dépasser 255 caractères')
  .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  .withMessage('Le format de l\'email est invalide');

// Validation du nom complet
const fullNameValidation = body('fullName')
  .trim()
  .isLength({ min: 2, max: 100 })
  .withMessage('Le nom complet doit contenir entre 2 et 100 caractères')
  .matches(/^[a-zA-Z\s'-]+$/)
  .withMessage('Le nom complet ne peut contenir que des lettres, espaces, tirets et apostrophes');

// Validation du numéro de téléphone
const phoneValidation = body('phone')
  .optional()
  .isMobilePhone('any', { strictMode: false })
  .withMessage('Veuillez fournir un numéro de téléphone valide')
  .isLength({ min: 10, max: 20 })
  .withMessage('Le numéro de téléphone doit contenir entre 10 et 20 caractères');

const registerClientValidation = [
  fullNameValidation,
  emailValidation,
  phoneValidation,
  passwordValidation,
  body('confirmPassword')
    .notEmpty()
    .withMessage('La confirmation du mot de passe est requise')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      return true;
    }),
  validate
];

const registerSalonValidation = [
  fullNameValidation,
  emailValidation,
  phoneValidation,
  passwordValidation,
  body('confirmPassword')
    .notEmpty()
    .withMessage('La confirmation du mot de passe est requise')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      return true;
    }),
  validate
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Un email valide est requis'),
  body('password').notEmpty().withMessage('Le mot de passe est requis'),
  validate
];

// Validation pour la mise à jour du profil
const updateProfileValidation = [
  fullNameValidation,
  phoneValidation,
  validate
];

module.exports = {
  registerClientValidation,
  registerSalonValidation,
  loginValidation,
  updateProfileValidation
};