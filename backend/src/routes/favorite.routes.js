const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favorite.controller');
const { authenticateClient } = require('../middlewares/auth.middleware');

// Middleware d'authentification pour toutes les routes
router.use(authenticateClient);

// Ajouter un salon aux favoris
router.post('/', favoriteController.addToFavorites);

// Retirer un salon des favoris
router.delete('/:salonId', favoriteController.removeFromFavorites);

// Obtenir tous les favoris du client
router.get('/', favoriteController.getFavorites);

// Vérifier si un salon est dans les favoris
router.get('/check/:salonId', favoriteController.isFavorite);

module.exports = router;
