const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favorite.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// Middleware d'authentification pour toutes les routes
router.use(authenticate);

// Ajouter un salon aux favoris
router.post('/', authorize('CLIENT'), favoriteController.addToFavorites);

// Retirer un salon des favoris
router.delete('/:salonId', authorize('CLIENT'), favoriteController.removeFromFavorites);

// Obtenir tous les favoris du client
router.get('/', authorize('CLIENT'), favoriteController.getFavorites);

// Vérifier si un salon est dans les favoris
router.get('/check/:salonId', authorize('CLIENT'), favoriteController.isFavorite);

module.exports = router;
