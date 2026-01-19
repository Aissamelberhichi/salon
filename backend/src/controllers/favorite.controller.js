const favoriteService = require('../services/favorite.service');

class FavoriteController {
  async addToFavorites(req, res, next) {
    try {
      const { salonId } = req.body;
      const clientId = req.user.id;
      
      const favorite = await favoriteService.addToFavorites(clientId, salonId);
      
      res.status(201).json({
        message: 'Salon ajouté aux favoris avec succès',
        favorite
      });
    } catch (error) {
      next(error);
    }
  }

  async removeFromFavorites(req, res, next) {
    try {
      const { salonId } = req.params;
      const clientId = req.user.id;
      
      const result = await favoriteService.removeFromFavorites(clientId, salonId);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getFavorites(req, res, next) {
    try {
      const clientId = req.user.id;
      
      const favorites = await favoriteService.getFavorites(clientId);
      
      res.json(favorites);
    } catch (error) {
      next(error);
    }
  }

  async isFavorite(req, res, next) {
    try {
      const { salonId } = req.params;
      const clientId = req.user.id;
      
      const result = await favoriteService.isFavorite(clientId, salonId);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FavoriteController();
