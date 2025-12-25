const express = require('express');
const caissierController = require('../controllers/caissier.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');

const router = express.Router();

// Toutes les routes nécessitent une authentification et le rôle SALON_OWNER
router.use(authenticate, authorize('SALON_OWNER'));

const validate = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const createCaissierValidation = [
  body('fullName').notEmpty().withMessage('Nom complet requis'),
  body('email').isEmail().withMessage('Email valide requis'),
  body('phone').notEmpty().withMessage('Téléphone requis'),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe minimum 6 caractères'),
  validate
];

const updateCaissierValidation = [
  body('fullName').notEmpty().withMessage('Nom complet requis'),
  body('email').isEmail().withMessage('Email valide requis'),
  body('phone').notEmpty().withMessage('Téléphone requis'),
  validate
];

// Routes
router.get('/', caissierController.getCaissiers);
router.post('/', createCaissierValidation, caissierController.createCaissier);
router.put('/:id', updateCaissierValidation, caissierController.updateCaissier);
router.put('/:id/toggle', caissierController.toggleCaissierActive);
router.delete('/:id', caissierController.deleteCaissier);

module.exports = router;